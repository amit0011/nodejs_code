var mongoose = require('mongoose');
var User = mongoose.model('user');
var Admin = mongoose.model('admin');
var AdminSession = mongoose.model('admin_session');
var Session = mongoose.model('session');
var moment = require('moment');
var session = {};
const { SendResponse } = require("@ag-common");

/*********************
	Checking for token of admin user
*********************/
session.checkToken = async function(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof(bearerHeader) !== 'undefined') {

        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    }
    var token = bearerToken || req.body.token || req.query.token;

    try {
        let session = await Session.findOne({ authToken: token });
        if (!session) {
            throw new Error("");
        }

        let user = await User.findOne({ _id: session.userId });
        if (!user) {
            throw new Error("");
        }

        req.user = user;
        next();

    } catch (err) {
        return SendResponse(res, {
            status: 401,
            userMessage: "Your session has been expired. Please relogin."
        });
    }
};
/*********************
	checkToken Ends
*********************/

/*********************
	Checking for token of admin user
*********************/
session.adminCheckToken = async function(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];

    if (typeof(bearerHeader) !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    }
    var token = bearerToken || req.body.token || req.query.token;

    let userSession = await AdminSession.findOne({ authToken: token });
    if (!userSession) {
        return SendResponse(res, {
            status: 401,
            error: true,
            userMessage: 'Your session has been expired. Please relogin.'
        });
    }
    let admin = await Admin.findOne({ _id: userSession.user_id }).populate("user_id");
    if (!admin) {
        return SendResponse(res, {
            status: 401,
            error: true,
            userMessage: 'not authorized.'
        });

    } else if (admin.accessUpdated) {
        return SendResponse(res, {
            error: true,
            status: 401,
            userMessage: 'Your session has been expired. Please relogin.'
        });
    }
    req.admin = admin;
    next();
};

session.checkAdminVendorToken = async function(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof(bearerHeader) !== 'undefined') {

        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    }
    var token = bearerToken || req.body.token || req.query.token;
    let session = await AdminSession.findOne({ authToken: token }).lean();

    if (!session) {
        return SendResponse(res, {
            status: 401,
            error: true,
            userMessage: 'Your session has been expired. Please relogin.'
        });
    } else if (session) {
        let user = await Admin.findOne({ _id: session.user_id }).lean();
        if (!user || user.accessUpdated) {
            return SendResponse(res,{
                status: 401,
                error: true,
                userMessage: 'Your session has been expired. Please relogin.'
            });

        }
        req.user = user;
        req.admin = user;
        next();
    } else {
        session = await Session.findOne({ authToken: token }).lean();

        if (!session) {
            let user = await User.findOne({ _id: session.user_id }).lean();

            if (!user) {
                return SendResponse(res, {
                    status: 401,
                    userMessage: "Your session has been expired. Please relogin."
                });
            }

            req.user = user;
            req.vendor = user;
            next();
        } else {
            return SendResponse(res, {
                status: 401,
                error: true,
                userMessage: "Your session has been expired. Please relogin."
            });
        }
    }
}

/*===================================
***   check parent token  ***
=====================================*/
session.checkResetToken = async function(req, res, next) {
    req.checkBody('resetToken', 'resetToken code is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            status: 401,
            error: true,
            errors,
            userMessage: 'Validation errors'
        });
    }

    var token = req.body.resetToken;
    let user = await Admin.findOne({ resetToken: token });

    if (!user) {
        return SendResponse(res, { status: 401, userMessage: "Your are not authorized." });
    } else if (moment(user.resetRequestedAt).add(7, 'd').isBefore(moment())) {
        return SendResponse(res, {
            status: 401,
            userMessage: "You token has been expired.Please contact to Administration."
        });
    }
    req.user = user;
    next();
};

/*-----  End of checkSuperAdmin  ------*/
session.checkVendorToken = function(req, res, next) {
    if (req.user && (req.user.userType == 'vendor' || req.vendor)) {
        next();
    } else {
        return SendResponse(res,{
            status: 401,
            error: true,
            userMessage: 'You are not authorized to perform this task.'
        });
    }
};

module.exports = session;
