var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var session = require('@ag-libs/session');
var User = mongoose.model('user');
var Session = mongoose.model('session');
var config = require('@ag-config/config');
var multer = require('multer');
var randomstring = require('randomstring');
var notifications = require('@ag-libs/function');
const { SendResponse } = require("@ag-common");

var crypto = require('crypto'),
    algorithm = 'aes-256-cbc',
    password = 'abcabcbacbbcabcbbacbbacbabcbabcbac125';

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/login')
        .post(methods.loginUser);

    router
        .route('/profile')
        .post(session.checkToken, methods.editProfile)
        .get(session.checkToken, methods.getProfile);

    router
        .route('/export')
        .post(methods.exportData);

    router
        .route('/password')
        .put(session.checkToken, methods.changePassword)
        .post(session.checkToken, methods.setPassword);

    router
        .route('/forgot')
        .post(methods.forgotPassword);

    router
        .route('/account/reset')
        .post(session.checkResetToken, methods.resetAccount);
};

/*=================================
***   api to get login user  ***
===================================*/
methods.loginUser = async function(req, res) {
    req.checkBody('password', 'password code is required.').notEmpty();
    req.checkBody('email', 'email code is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let user = await User.findOne({ email: req.body.email, password: encrypt(req.body.password) });
    if (!user) {
        return SendResponse(res, {
            errors: true, status: 500,
            userMessage: 'Email or password is incorrect!.'
        });
    }

    if (user.password != encrypt(req.body.password) && user.password != req.body.password) {
        return SendResponse(res, {
            error: true, status: 500,
            userMessage: 'Email or password is incorrect!.'
        });
    }
    var token = jwt.sign(
        { email: req.body.mobileNumber },
        config.sessionSecret,
        { expiresIn: 60 * 120 }
    );

    if (user.status == 1) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Your account has been deactivated by admin.'
        });
    }

    await Session.findOneAndUpdate(
        { userId: user._id },
        { authToken: token },
        { upsert: true, 'new': true }
    );

    return SendResponse(res, {
        data: { user: user, authToken: token },
        userMessage: 'login successfully.'
    });
};/*-----  End of loginUser  ------*/

/*============================
***   Get Account Setup  ***
==============================*/
methods.getProfile = async function(req, res) {
    let user = req.user;
    let data = await User.findOne({ _id: user._id });

    return SendResponse(res, {data, userMessage: 'Personal info.'});
};/*-----  End of Get Account Setup  ------*/

/*=============================
***   edit Account Setup  ***
===============================*/
methods.editProfile = async function(req, res) {
    var user = req.user;
    var fileName = "";
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, imagePath)
        },
        filename: function(req, file, cb) {
            fileName = Date.now() + '.' + file.originalname.split(".").pop();
            cb(null, fileName);
        }
    });

    var uploadfile = multer({ storage: storage }).single('avatar');

    uploadfile(req, res, async function(err) {
        if (err) {
            return SendResponse(res, {
                error: true, status: 500, errors: err,
                userMessage: "Some error occurred in file uploading"
            });
        }

        let exit = await User.findOne({ _id: user._id });

        if (!exit) {
            return SendResponse(res, {
                error: true, status: 400, errors: err,
                userMessage: 'vendor info does not exist.'
            });
        }
        //Check for POST request errors.
        req.checkBody('firstName', 'firstName is required.').notEmpty();
        req.checkBody('lastName', 'lastName is required.').notEmpty();
        req.checkBody('email', 'email is required.').notEmpty();
        req.checkBody('mobileNumber', 'mobile number is required.').notEmpty();
        let errors = req.validationErrors(true);
        if (errors) {
            return SendResponse(res, {
                error: true, status: 400, errors,
                userMessage: 'Validation errors'
            });
        }

        var arr = [parseFloat(req.body.lat) || 0, parseFloat(req.body.lng) || 0];
        req.body.location = { type: 'Point', coordinates: arr };
        req.body.avatar = fileName == "" ? exit.avatar : "/images/" + fileName;
        let data = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true });

        return SendResponse(res, {
            data: { user: data },
            userMessage: "Profile updated."
        });
    });
};/*-----  End of edit Account Setup  ------*/

/*============================
***   Set New Password  ***
==============================*/
methods.setPassword = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('password', 'password code is required.').notEmpty();
    req.checkBody('confirmPassword', 'confirmPassword code is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let user = req.user;
    let data = await User.findOne({ _id: user._id });

    if (!data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'User info does not exist.'
        });
    }
    if (req.body.password != req.body.confirmPassword) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'New Password is not same as Confirm Password.'
        });
    }

    data.password = encrypt(req.body.password);
    data.save();

    return SendResponse(res, {
        data: { user: data },
        userMessage: 'Password set.'
    });
};/*-----  End of setPassword  ------*/

/*========================
***   Export Users  ***
==========================*/
methods.exportData = function(req, res) {
    //Check for POST request errors.
    req.checkBody('data', 'data code is required.').notEmpty();
    req.checkBody('fileName', 'fileName code is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    } else {
        //Database functions here
        res.xls(req.body.fileName, req.body.data);
    }
};/*-----  End of exportData  ------*/

/*===========================
***   forgot password  ***
=============================*/
methods.forgotPassword = async function(req, res) {
    req.checkBody('email', 'email code is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let user = await User.findOne({ email: req.body.email });

    if (!user) {
        return SendResponse(res, {userMessage: 'You reset password token has sent to your mail successfully.'});
    }

    var resetToken = randomstring.generate({
        length: 12,
        charset: 'alphabetic'
    });
    user.resetToken = resetToken;
    user.resetRequestedAt = new Date();
    await user.save();

    notifications.createMail({
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        subject: 'Forgot Password',
    }, 'forgotPassword');

    return SendResponse(res, {userMessage: 'You reset password token has sent to your mail successfully.'});
};/*-----  End of forgotPassword  ------*/

/*===========================
***   Change Password  ***
=============================*/
methods.changePassword = async function(req, res) {
    let user = req.user;
    req.checkBody('password', 'password is required.').notEmpty();
    req.checkBody('newPassword', 'new password is required.').notEmpty();
    let errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    user = await User.findOne({ _id: user._id });
    if (!user) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'no request found.'
        });

    }

    if (user.password != encrypt(req.body.password)) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: "current password doesn't match."
        });
    }

    user.password = encrypt(req.body.newPassword);
    await user.save();

    return SendResponse(res, {userMessage: "password changed."});
};/*-----  End of changePassword  ------*/

/*============================================
***   reset password using reset token  ***
==============================================*/

methods.resetAccount = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('password', 'password code is required.').notEmpty();
    req.checkBody('password2', 'password2 code is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    if (req.body.password != req.body.password2) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'password mismatch!'
        });
    }

    if (req.body.password.length < 8) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Your password must be at least 8 characters'
        });
    }

    if (req.user) {
        req.user.resetToken = null;
        req.user.resetRequestedAt = null;
        req.user.password = encrypt(req.body.password);
    }

    await req.user.save();
    return SendResponse(res, {userMessage: 'Your password reset successfully.'});
};/*-----  End of resetPassword  ------*/
