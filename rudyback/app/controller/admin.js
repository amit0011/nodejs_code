var jwt = require('jsonwebtoken');
var config = require('@ag-config/config');
var multer = require('multer');
var mongoose = require('mongoose');
var Admin = mongoose.model('admin');
var Contract = mongoose.model('productionContract');
var Confirmation = mongoose.model('purchaseConfirmation');
var Sales = mongoose.model('salesContract');
var Sample = mongoose.model('productionRecordsSample');
var Phone = mongoose.model('phoneNote');

var AdminSession = mongoose.model('admin_session');
var session = require('@ag-libs/session');
var User = mongoose.model('user');
var async = require('async');
var randomstring = require('randomstring');
var Session = mongoose.model('session');
var notifications = require('@ag-libs/function');
var moment = require('moment');
var Mailgen = require('mailgen');
var async = require('async');
const { SendResponse } = require("@ag-common");
const image2base64 = require('image-to-base64');
const image_path = process.env.IMAGE_PATH;
const AdminSignature = mongoose.model('adminSignature');

/* the response object for API
  error : true / false
  code : contains any error code
  data : the object or array for data
  userMessage : the message for user, if any.
*/
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

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/admin/login')
        .post(methods.adminLogin);

    router
        .route('/admin/profile')
        .get(session.checkAdminVendorToken, methods.adminInfo)
        .put(session.checkAdminVendorToken, methods.updateAdminProfile)
        .post(session.checkAdminVendorToken, methods.uploadProfile);

    router
        .route('/admin/subadmin')
        .post(session.adminCheckToken, methods.addSubAdmin)
        .get(session.adminCheckToken, methods.subAdminList)
        .put(session.checkAdminVendorToken, methods.updateSubAdminProfile);

    router
        .route('/admin/subadmin/:userId/delete')
        .delete(session.adminCheckToken, methods.deleteSubAdmin);

    router
        .route('/admin/subadmin/delete')
        .post(session.adminCheckToken, methods.activateDeactivate);

    router
        .route('/admin/users')
        .get(session.checkAdminVendorToken, methods.userList)
        .put(session.checkAdminVendorToken, methods.updateUserProfile);

    router
        .route('/admin/users/:userId/delete')
        .delete(session.checkAdminVendorToken, methods.deleteUser);

    router
        .route('/admin/:userId/user')
        .get(session.checkAdminVendorToken, methods.userDetails);

    router
        .route('/admin/password')
        .post(methods.forgotPassword)
        .put(session.checkAdminVendorToken, methods.changePassword);

    router
        .route('/admin/reset')
        .post(session.checkResetToken, methods.resetAccountPassword);

    router
        .route('/username')
        .get(session.adminCheckToken, methods.checkUsernameExists);

    router
        .route('/admin/receiver')
        .get(session.adminCheckToken, methods.receiverList)
        .post(session.adminCheckToken, methods.removeReceiver);

    router
        .route('/upload')
        .post(session.adminCheckToken, methods.uploadImages);

    router
        .route('/admin/access')
        .get(session.adminCheckToken, methods.getAccess)
        .post(session.adminCheckToken, methods.updateAccess);

    router
        .route('/admin/performanceReport')
        .get(session.adminCheckToken, methods.performanceReport);

    router
        .route('/admin/exportListByUser')
        .post(methods.export);

    router
        .route('/admin/accessList')
        .get(methods.accessList);
};

/* init Functiona forbody entry */
function initDB() {
    async.waterfall([
        function(callback) {
            Admin.find({
                type: 'SUPERADMIN'
            }, function(err, result) {
                if (err) throw err;
                callback(null, result);
            });
        },
        function(adminUser, callback) {
            if (adminUser.length > 0)
                callback(null, {
                    adminUser: adminUser
                });
            else {
                var defaultUser = {
                    email: 'admin@admin.com',
                    password: encrypt('123456'),
                    type: 'SUPERADMIN',
                    fullName: 'Admin Admin'
                };
                adminUser = new Admin(defaultUser);
                adminUser.save(function() {
                    callback(null, {
                        adminUser: defaultUser
                    });
                });
            }
        }
    ], function(err) {
        if (err) throw err;
    });
}
initDB();

/* End init function */

methods.accessList = async function(req, res) {
    const data = await Admin
        .find({
            status: { $in: [0, 1] },
            email: { $nin: ['admin@admin.com'] },
            type: { $nin: ['SUPERADMIN'] }
        })
        .select("fullName email access")
        .lean();
    if (data) {
        data.forEach((val) => {
            var access = {};
            if (val && val.access) {
                for (var key in val.access) {
                    if (val.access[key].subMenu == true) {

                        for (var key1 in val.access[key]) {
                            if (key1 != 'subMenu' || key1 != 'viewMenu') {
                                var role1 = [];
                                if (val.access[key][key1].view) {
                                    role1.push('view');
                                }
                                if (val.access[key][key1].add) {
                                    role1.push('add');
                                }
                                if (val.access[key][key1].edit) {
                                    role1.push('edit');
                                }
                                if (val.access[key][key1].delete) {
                                    role1.push('delete');
                                }
                                if (role1.length) {
                                    access[key1] = role1;
                                }
                            }
                        }

                    } else {
                        var role = [];
                        if (val.access[key].view) {
                            role.push('view');
                        }
                        if (val.access[key].add) {
                            role.push('add');
                        }
                        if (val.access[key].edit) {
                            role.push('edit');
                        }
                        if (val.access[key].delete) {
                            role.push('delete');
                        }
                        if (role.length) {
                            access[key] = role;
                        }
                    }
                }
                val.access = access;
            }
        });
        return res.send(data);
    }
    res.send({});
};

/*=============================
    ***   uploadImages  ***
===============================*/
methods.uploadImages = function(req, res) {
    var fileName = "";
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, imagePath);
        },
        filename: function(req, file, cb) {
            fileName = Date.now() + '.' + file.originalname.split(".").pop();
            cb(null, fileName);
        }
    });

    var uploadfile = multer({
        storage: storage
    }).single('avatar');

    uploadfile(req, res, function(err) {
        if (err) {
            return SendResponse(res, {
                error: true,
                status: 500,
                errors: err,
                userMessage: "some error occurred in file uploading"
            });
        } else {
            return SendResponse(res, { data: `/images/${fileName}`, userMessage: "Profile image uploaded." });
        }
    });
};/*-----  End of uploadImages  ------*/

/*==========================================
***   check user name already exists  ***
============================================*/
methods.checkUsernameExists = async function(req, res) {
    //Check for POST request errors.
    req.checkQuery('username', 'username code is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        //Database functions here
        const user = await Admin.findOne({ userName: req.query.username });

        return SendResponse(res, { userMessage: 'success', data: (user ? true : false) });
    }
};/*-----  End of checkUsernameExists  ------*/

/*===========================
***   admin login  ***
=============================*/
methods.adminLogin = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('email', 'email is required.').notEmpty().isEmail();
    req.checkBody('password', 'password is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { status: 400, errors, userMessage: 'Validation errors', error: true });
    } else {
        const admin = await Admin.findOne({ email: req.body.email });

        var token;
        if (!admin) {
            const vendor = await User.findOne({ email: req.body.email, userType: 'vendor' });

            if (!vendor) {
                return SendResponse(res, {
                    status: 400,
                    error: true,
                    userMessage: 'User email and password does not exist.'
                });
            } else {
                if (vendor.password != encrypt(req.body.password) && vendor.password != req.body.password) {
                    //send response to client
                    return SendResponse(res, {
                        status: 400,
                        error: true,
                        userMessage: 'Your password is incorrect.'
                    });
                } else {
                    token = jwt.sign({
                        email: req.body.mobileNumber
                    }, config.sessionSecret, {
                        expiresIn: 60 * 120
                    });
                    var data = {
                        'userId': vendor._id,
                        'authToken': token
                    };
                    var session = new Session(data);
                    await session.save();
                    sendRes(false, 200, null, "login successfully.", {
                        userId: success._id,
                        authToken: token,
                    }, res);
                }
            }
        } else {
            if (admin.password != encrypt(req.body.password) && admin.password != req.body.password) {
                return SendResponse(res, {
                    status: 400,
                    error: true,
                    userMessage: 'User email and password does not exist.'
                });
            } else {
                token = jwt.sign({
                    email: req.body.email
                }, config.sessionSecret, {
                    expiresIn: 60 * 120
                });

                await AdminSession.findOneAndUpdate(
                    { user_id: admin._id },
                    { authToken: token },
                    { upsert: true, new: true }
                );

                await Admin.findOneAndUpdate(
                    { email: req.body.email },
                    {
                        $set: {
                            accessUpdated: false
                        }
                    });

                return SendResponse(res, {userMessage: "login successfully.", data: {
                    userId: admin._id,
                    authToken: token,
                    signupComplete: admin.signupComplete,
                    type: admin.type,
                    name: admin.fullName

                }});
            }
        }
    }
};/*-----  End of admin login  ------*/

/*============================
***   Get Account Setup  ***
==============================*/
methods.adminInfo = function(req, res) {
    return SendResponse(res, { userMessage: 'personal info.', data: req.user });
};/*-----  End of Get Account Setup  ------*/

/*=============================
***   Update Profile Admin  ***
===============================*/
methods.updateAdminProfile = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('fullName', 'fullName is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { status: 400, errors, userMessage: 'Validation errors', error: true });
    } else {
        req.body.updatedAt = Date.now();
        var admin = req.admin;
        admin = await Admin.findOneAndUpdate({ _id: admin._id }, req.body, { new: true });
        return SendResponse(res, { data: admin, userMessage: "personal info changed." });
    }
};/*-----  End of Update Profile Admin  ------*/

/*=====================
***   User List  ***
=======================*/
methods.userList = async function(req, res) {
    const users = await User.find({ userType: req.query.type })
        .sort({ createdAt: -1 });

    return SendResponse(res, { data: users, userMessage: 'user list.' });

};/*-----  End of userList  ------*/

/*=============================
***   Update User Profile  ***
===============================*/
methods.updateUserProfile = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('firstName', 'First Name is required.').notEmpty();
    req.checkBody('lastName', 'Last Name is required.').notEmpty();
    req.checkBody('email', 'Email is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { status: 400, errors, userMessage: 'Validation errors', error: true });
    } else {
        const user = User.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true });

        return SendResponse(res, { data: admin, userMessage: "User info changed."});
    }
};/*-----  End of Update User Profile  ------*/

/*=============================
***   Add Account Setup  ***
===============================*/
methods.uploadProfile = async function(req, res) {
    var admin = req.admin;
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, imagePath);
        },
        filename: function(req, file, cb) {
            var fileName = admin._id + '.' + file.originalname.split(".").pop();
            admin.avatar = "/images/" + fileName;
            cb(null, fileName);
        }
    });

    var uploadfile = multer({
        storage: storage
    }).single('avatar');

    uploadfile(req, res, function(err) {
        if (err) {
            return SendResponse(res, {
                error: true,
                status: 500,
                errors: err,
                userMessage: "some error occurred in file uploading"
            });
        } else {
            const result = admin.save();

            return SendResponse(res, { data: result.avatar, userMessage: "image uploaded."});
        }
    });
};/*-----  End of Add Account Setup  ------*/

/*=====================================
*********   User Profile *********
======================================*/
methods.userDetails = async function(req, res) {
    req.checkParams('userId', 'userId is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { status: 400, errors, userMessage: 'Validation errors', error: true });
    } else {
        const userDetails = await User.findOne({ _id: req.params.userId });
        return SendResponse(res, { data: userDetails, userMessage: 'user info.' });
    }
};/*-----  End of User Profile  ------*/

/*===========================
***   create vendor  ***
=============================*/

methods.addSubAdmin = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('fullName', 'full Name is required.').notEmpty();
    req.checkBody('mobileNumber', 'mobileNumber is required.').notEmpty();
    // req.checkBody('aboutUs', 'aboutUs is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { status: 400, errors, userMessage: 'Validation errors', error: true });
    }

    var condition;
    if (req.body.type == 'RECEIVER') {
        condition = {
            status: 0,
            fullName: req.body.fullName
        };
    } else {
        condition = { $or: [ { email: req.body.email },  { userName: req.body.userName } ], status: 0 };
    }

    const admin = await Admin.findOne(condition);
    if (admin) {
        //send response to client
        return SendResponse(res, {
            error: true,
            errors: err,
            status: 500,
            userMessage: req.body.type == 'RECEIVER' ? 'Name already exist.' : 'user email already exist.'
        });
    }

    // var newPassword = randomstring.generate(8)
    var newPassword = 'rudyagro@123';
    req.body.password = encrypt(newPassword);
    await Admin.create(req.body);

    var mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            name: 'Agriculture',
            link: 'https://www.rudyagro.ca/',
            logo: 'https://erp.rudyagro.ca/assets/images/logo.png'
        }
    });
    var email = {
        body: {
            name: req.body.fullName,
            intro: "Greetings! You have received this mail as per your" +
                `password and this is your password "${newPassword}"`,
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };
    // Generate an HTML email with the provided contents
    var emailBody = mailGenerator.generate(email);
    notifications.sendMail(req.body.email, 'New Password', emailBody);

    //send response to client
    return SendResponse(res, { data: admin, userMessage: 'user admin added.' });
};/*-----  End of add user  ------*/

/*=====================
***   Sub Admin List  ***
=======================*/
methods.subAdminList = async function(req, res) {
    var query;
    if (req.query.type && req.query.role) {
        query = {
            status: 0,
            roles: 'Grain Buyer',
            type: req.query.type
        };
    } else if (req.query.list == 'All') {
        query = {
            status: 0,
            email: {
                $nin: ['admin@admin.com']
            }
        };
    } else {
        query = {
            status: {
                $in: [0, 1]
            },
            _id: {
                $nin: [req.admin._id]
            },
            email: {
                $nin: ['admin@admin.com']
                // emails not to be included in the list
            },
            type: {
                $nin: ['SUPERADMIN']
            }
        };
    }

    const users = await Admin.find(query).sort('fullName');

    return SendResponse(res, { data: users, userMessage: 'user list.' });
};/*-----  End of subAdminList  ------*/

/*=====================
***   RECEIVER List  ***
=======================*/
methods.receiverList = async function(req, res) {
    var query;
    query = {
        _id: {
            $nin: [req.admin._id]
        },
        email: {
            $nin: ['admin@admin.com']
        },
        type: {
            $nin: ['SUPERADMIN', 'ADMIN', 'MANAGER', 'USER']
        }
    };

    const data = await Admin.find(query);

    return SendResponse(res, { data, userMessage: 'user list.' });
};/*-----  End of RECEIVER  ------*/

/*============================
***   remove RECEIVER  ***
==============================*/
methods.removeReceiver = async function(req, res) {
    const analysis = await Admin.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, { data: analysis, userMessage: 'RECEIVER deleted.' });

};/*-----  End of removeSample  ------*/

/*=============================
***   Delete User  ***
===============================*/
methods.deleteUser = async function(req, res) {
    req.checkParams('userId', 'userID is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        const user = await User.findOne({ _id: req.params.userId });

        if (!user) {
            const roles = await Roles.findOne({ _id: req.params.userId });

            roles.status = roles.status == 1 ? 0 : 1;
            await roles.save();

            if (roles.status == 1) {
                await UserRoleSession.findOneAndUpdate(
                    { user_id: roles._id },
                    { authToken: '' },
                    { upsert: true, new: true }
                );
            }

            return SendResponse(res, { data: roles, userMessage: 'user info updated.'});
        } else {
            user.status = user.status == 1 ? 0 : 1;

            await user.save();
            if (user.status == 1) {
                await Session.findOneAndUpdate(
                    { userId: user._id },
                    { authToken: '' },
                    { upsert: true, new: true }
                );
            }

            return SendResponse(res, { data: user, userMessage: "user info updated." });
        }
    }
};/*-----  End of Delete User  ------*/

/*=============================
***   Update Sub Admin Profile  ***
===============================*/
methods.updateSubAdminProfile = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('fullName', 'Full Name is required.').notEmpty();

    let errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        let admin = await Admin.findById(req.body._id).lean();

        if (admin.signature.toString() != req.body.signature) {
            await AdminSignature.remove({_id: admin.signature});
        }

        admin = await Admin.findByIdAndUpdate(req.body._id, req.body, { new: true });

        return SendResponse(res, { data: admin, userMessage: "personal info changed." });
    }
};/*-----  End of Update Sub Admin Profile  ------*/

/*=============================
***   Delete Sub Admin  ***
===============================*/
methods.deleteSubAdmin = async function(req, res) {
    req.checkParams('userId', 'userID is required.').notEmpty();

    let errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        const subAdmin = await Admin.findOne({ _id: req.params.userId });
        if (!subAdmin) {
            return SendResponse(res, { status: 200, userMessage: 'No record found.' });
        } else {
            subAdmin.status = subAdmin.status == 1 ? 0 : 1;
            await subAdmin.save();

            return SendResponse(res, { data: subAdmin, userMessage: "user info updated." });
        }
    }
};

methods.activateDeactivate = async function(req, res) {

    const subAdmin = await Admin.findByIdAndUpdate(
        { _id: req.body.id },
        { $set: { status: req.body.status } }
    );
    if (!subAdmin) {
        return SendResponse(res, { status: 404, userMessage: "No record found." });
    } else {
        return SendResponse(res, { userMessage: "Success." });
    }
};/*-----  End of Delete Sub Admin  ------*/

/*=============================
    ***   uploadDocument  ***
===============================*/
methods.uploadDocument = function(req, res) {
    var fileName = "";
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, imagePath);
        },
        filename: function(req, file, cb) {
            fileName = Date.now() + '.' + file.originalname.split(".").pop();
            cb(null, fileName);
        }
    });

    var uploadfile = multer({
        storage: storage
    }).single('itemImage');

    uploadfile(req, res, function(err) {
        if (err) {
            return SendResponse(res, {
                error: true,
                status: 500,
                errors: err,
                userMessage: "some error occurred in file uploading"
            });
        } else {
            return SendResponse(res, { data: `/images/${fileName}`, userMessage: "image uploaded." });
        }
    });
};/*-----  End of uploadDocument  ------*/

/*===========================
***   forgot password  ***
=============================*/
methods.forgotPassword = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('email', 'email code is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        const admin = await Admin.findOne({ email: req.body.email });

        if (!admin) {
            return SendResponse(res, { userMessage: 'You reset password token has sent to your mail successfully.' });
        } else {
            const resetToken = randomstring.generate({
                length: 12,
                charset: 'alphabetic'
            });

            admin.resetToken = resetToken;
            admin.resetRequestedAt = new Date();

            await admin.save();

            notifications.createMail({
                name: admin.fullName,
                email: admin.email,
                subject: 'Forgot Password',
                link: 'http://erp.rudyagro.ca/reset?resetToken=' + resetToken
                    // link: 'http://localhost:3000/reset?resetToken=' + resetToken
            }, 'forgotPassword');

            return SendResponse(res, { userMessage: 'Your reset password token has sent to your mail successfully.' });
        }
    }
};/*-----  End of forgotPassword  ------*/

/*============================================
***   reset password using reset token  ***
==============================================*/
methods.resetAccountPassword = function(req, res) {
    //Check for POST request errors.
    req.checkBody('password', 'password code is required.').notEmpty();
    req.checkBody('password2', 'password2 code is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        if (req.body.password != req.body.password2) {
            return SendResponse(res, { error: true, status: 400, userMessage: 'password mismatch!' });
        } else if (req.body.password.length < 6) {
            return SendResponse(res, {
                error: true,
                status: 400,
                userMessage: 'Your password must be at least 6 characters'
            });
        } else {
            if (req.user) {
                req.user.resetToken = null;
                req.user.resetRequestedAt = null;
                req.user.password = encrypt(req.body.password);
            }
            req.user.save(function(err) {
                if (err) {
                    return SendResponse(res, {
                        error: true,
                        status: 500,
                        errors: err,
                        userMessage: 'some server error has occurred.'
                    });
                } else {
                    return SendResponse(res, { userMessage: 'Your password reset successfully.' });
                }
            });
        }
    }
};/*-----  End of resetPassword  ------*/

/*===========================
***   Change Password  ***
=============================*/
methods.changePassword = async function(req, res) {
    var user = req.user;
    //Check for POST request errors.
    req.checkBody('password', 'password is required.').notEmpty();
    req.checkBody('newPassword', 'new password is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        //Database functions here
        const result = await User.findOne({ _id: user._id, userType: 'vendor' });

        if (!result) {
            const admin = await Admin.findOne({ _id: user._id });
            if (!admin) {
                return SendResponse(res, { error: true, status: 400, userMessage: 'your email does not exist.' });
            } else {
                if (admin.password != encrypt(req.body.password)) {
                    return SendResponse(res, {
                        error: true,
                        status: 400,
                        userMessage: "current password doesn't match."
                    });
                } else {
                    const adminInfo = await Admin.findOneAndUpdate(
                        { _id: user._id },
                        { $set: { password: encrypt(req.body.newPassword) } },
                        { new: true }
                    );
                    return SendResponse(res, { data: adminInfo, userMessage: "password changed." });
                }
            }

        } else if (result.password != encrypt(req.body.password)) {
            return SendResponse(res, { error: true, status: 400, userMessage: "current password doesn't match." });
        } else {
            await User.findOneAndUpdate(
                { _id: result._id },
                { $set: { password: encrypt(req.body.newPassword) } },
                { new: true }
            );

            return SendResponse(res, { userMessage: "password changed." });
        }
    }
};/*-----  End of changePassword  ------*/

methods.getAccess = async (req, res) => {
    var id = req.query.id || req.admin._id;
    const success = await Admin.findById(id).select('access fullName type');

    if (!success) {
        return SendResponse(res, { status: 404, userMessage: "Data not found" });
    } else {
        return SendResponse(res, { data: success, userMessage: "Data found." });
    }
};

methods.updateAccess = async (req, res) => {
    req.checkBody('_id', '_id is required.').notEmpty();
    req.checkBody('access', 'access is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 200, errors, userMessage: 'Validation errors' });
    } else {
        const adminInfo = await Admin .findOneAndUpdate(
            { _id: req.body._id },
            { $set: { access: req.body.access, accessUpdated: true } },
            { new: true}
        );

        if (!adminInfo) {
            return SendResponse(res, { status: 404, userMessage: "Data not found" });
        } else {
            return SendResponse(res, { userMessage: "Access role updated successfully." });
        }
    }
};

methods.performanceReport = async (req, res) => {
    var condition = {
        status: {
            $in: [0, 1]
        },
        email: {
            $nin: ['admin@admin.com']
        },
        type: {
            $nin: ['SUPERADMIN', 'RECEIVER']
        }
    };

    const admins = await Admin.find(condition).select('fullName mobileNumber email').lean();
    if (admins.length == 0) {
        return SendResponse(res, { status: 404, userMessage: "List empty." });
    } else {
        async.forEachOfLimit(admins, 1, function(value, key, next_call) {
            var cond = { $and: [{ createdBy: value._id }] };

            if ((req.query.fromDate && req.query.fromDate != 'undefined') || (req.query.toDate && req.query.toDate != 'undefined')) {
                if (req.query.fromDate && req.query.toDate && req.query.fromDate != 'undefined' && req.query.toDate != 'undefined') {
                    cond.$and.push({
                        createdAt: {
                            $gte: req.query.fromDate,
                            $lte: req.query.toDate
                        }
                    });
                } else if (req.query.fromDate && req.query.fromDate != 'undefined') {
                    cond.$and.push({
                        createdAt: {
                            $gte: req.query.fromDate
                        }
                    });
                } else if (req.query.toDate && req.query.toDate != 'undefined') {
                    cond.$and.push({
                        createdAt: {
                            $lte: req.query.toDate
                        }
                    });
                }
            }


            async.parallel({
                "contract": (cb) => {
                    Contract.count(cond, (err, count) => {
                        cb(err, count);
                    });
                },
                "purchase": (cb) => {
                    Confirmation.count(cond, (err, count) => {
                        cb(err, count);
                    });
                },
                "salesContract": (cb) => {
                    Sales.count(cond, (err, count) => {
                        cb(err, count);
                    });
                },
                "sample": (cb) => {
                    Sample.count(cond, (err, count) => {
                        cb(err, count);
                    });
                },
                "phoneNote": (cb) => {
                    Phone.count(cond, (err, count) => {
                        cb(err, count);
                    });
                }

            }, (err, success) => {
                if (err) {
                    value.productionContract = 0;
                    value.puchaseConfirmationContract = 0;
                    value.salesContract = 0;
                    value.sample = 0;
                    value.phoneNote = 0;
                } else {
                    value.productionContract = success.contract;
                    value.puchaseConfirmationContract = success.purchase;
                    value.salesContract = success.salesContract;
                    value.sample = success.sample;
                    value.phoneNote = success.phoneNote;
                }
                next_call();
            });
        }, (err) => {
            if (err) {
                return SendResponse(res, {
                    error: true,
                    status: 500,
                    errors: err,
                    userMessage: "some server error has occurred."
                });
            } else {
                return SendResponse(res, { data: admins, userMessage: "Admin list." });
            }
        });
    }
};

methods.export = async function(req, res) {

    function getGrowerNameOrFarmName(p) {
        if (p.personFarmType == 'Farm') {
            if (p.growerId && p.growerId.farmName) return p.growerId.farmName;
            else if (p.growerId && (p.growerId.firstName || p.growerId.lastName))
                return `${p.growerId.firstName} ${p.growerId.lastName}`;
            else return '';
        } else {
            if (p.growerId && (p.growerId.firstName || p.growerId.lastName))
                return `${p.growerId.firstName} ${p.growerId.lastName}`;
            else if (p.growerId && p.growerId.farmName) return p.growerId.farmName;
            else return '';
        }
    }
    req.checkBody('type', 'type is required.').notEmpty();
    req.checkBody('createdBy', 'createdBy is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    } else {
        let condition = {
            createdBy: req.body.createdBy
        };
        var newData = [];

        if (req.body.type == "productionRecord") {
            try {
                const data = await Sample.find(condition).populate('growerId');
                data.forEach((val) => {
                    newData.push({
                        'Grower Name/Farm Name  ': getGrowerNameOrFarmName(val),
                        'Date': moment(val.createdAt).format('MM/DD/YYYY')
                    });
                });
                res.xls(req.body.fileName, newData);
            } catch(err) {
                res.xls(req.body.fileName, []);
            }
        } else if (req.body.type == "productionContract") {
            try {
                const data = await Contract.find(condition).populate('growerId');

                data.forEach((val) => {
                    newData.push({
                        'Grower Name/Farm Name  ': getGrowerNameOrFarmName(val),
                        'Contract Number': val.contractNumber,
                        'Date': moment(val.createdAt).format('MM/DD/YYYY')
                    });
                });
                res.xls(req.body.fileName, newData);
            } catch (err) {
                res.xls(req.body.fileName, []);
            }
        } else if (req.body.type == "purchaseConfirmation") {
            try {
                const data = await Confirmation.find(condition).populate('growerId');

                data.forEach((val) => {
                    newData.push({
                        'Grower Name/Farm Name  ': getGrowerNameOrFarmName(val),
                        'Contract Number': val.contractNumber,
                        'Date': moment(val.createdAt).format('MM/DD/YYYY')
                    });
                });
                res.xls(req.body.fileName, newData);
            } catch (err) {
                res.xls(req.body.fileName, []);
            }
        } else if (req.body.type == "salesContract") {
            try {
                const data = await Sales.find(condition).populate('buyerId');

                data.forEach((val) => {
                    newData.push({
                        'Buyer Name': val.buyerId.businessName,
                        'Contract Number': val.contractNumber,
                        'Date': moment(val.createdAt).format('MM/DD/YYYY')
                    });
                });
                res.xls(req.body.fileName, newData);
            } catch (err) {
                res.xls(req.body.fileName, []);
            }
        } else if (req.body.type == "phoneNote") {
            try {
                const data = await Phone.find(condition).populate('growerId');

                data.forEach((val) => {
                    newData.push({
                        'Grower Name/Farm Name  ': getGrowerNameOrFarmName(val),
                        'Date': moment(val.createdAt).format('MM/DD/YYYY')
                    });
                });
                res.xls(req.body.fileName, newData);
            } catch (err) {
                res.xls(req.body.type, []);
            }
        } else {
            res.xls(req.body.fileName, []);
        }
    }
};

methods.convertSignatureToBase64 = async function(req, res) {
    const { imageObj } = req;

    let signature = await image2base64(image_path + imageObj.path);

    const data = await AdminSignature.findByIdAndUpdate(
        {_id: imageObj.id },
        { signature, updatedAt: new Date(), path: imageObj.path },
        { upsert: true, new: true, lean: true }
    );

    delete data.signature;

    return SendResponse(res, { data, userMessage: "Image Uploaded." });
};
