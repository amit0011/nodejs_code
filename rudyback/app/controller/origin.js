var mongoose = require('mongoose');
var Origin = mongoose.model('origin');
var arrayReduce = require('async-array-reduce');
var session = require('@ag-libs/session');
var validation = require('@ag-libs/validation');
const { SendResponse } = require("@ag-common");

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/origin')
        .put(session.adminCheckToken, methods.updateOrigin)
        .post(session.adminCheckToken, methods.addOrigin)
        .get(session.adminCheckToken, methods.getOrigin);

    router
        .route('/origin/delete')
        .post(session.adminCheckToken, methods.removeOrigin);

    router
        .route('/origin/bulk')
        .post(session.adminCheckToken, validation.checkUsersFile, methods.addOriginBulk);

};

/*=============================
***   Add Origin  ***
===============================*/
methods.addOrigin = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('name', 'name is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (req.body.name) {
        var regex = new RegExp(["^", req.body.name, "$"].join(""), "i");
        const origin = await Origin.findOne({ name: regex });

        if (origin) {
            errors = { name: 'Origin is already exists.' };
        }
    }

    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    const data = await (new Origin(req.body)).save();

    return SendResponse(res, { data, userMessage: 'Origin added successfully.' });
};/*-----  End of addOrigin  ------*/

/*=============================
***   Update Origin  ***
===============================*/
methods.updateOrigin = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('name', 'name is required.').notEmpty();
    var errors = req.validationErrors(true);


    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    var regex = new RegExp(["^", req.body.name, "$"].join(""), "i");
    var origin = await Origin.findOne({ _id: { $ne: req.body._id }, name: regex });
    if (origin) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Origin name already exists.' });
    }

    origin = await Origin.findById(req.body._id);
    if (!origin) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Given Origin not exists.' });
    }

    const data = await Origin.findByIdAndUpdate({ _id: origin._id }, { $set: { name: req.body.name } }, { new: true });

    return SendResponse(res, { data, userMessage: 'Origin added successfully.' });
};/*-----  End of addOrigin  ------*/

/*=======================================
***   Get All Origin  ***
=========================================*/
methods.getOrigin = async function(req, res) {
    let condition = {}, options = { sort: { name: 1 } };

    if ((req.body.search && req.body.search != 'undefined') || (req.query.search && req.query.search != 'undefined')) {
        req.body.page = req.body.page ? req.body.page : 1;
        condition = { name: { $regex: ".*" + (req.query.search || req.body.search) + ".*", $options: 'i' } };
    }

    if (req.body.page || req.query.page) {
        options.page = req.body.page || req.query.page;
        options.limit = 10;
    } else {
        options.page = 1;
        options.limit = 2000;
    }

    const data = await Origin.paginate(condition, options);

    return SendResponse(res, { data, userMessage: 'Origin list.' });
};/*-----  End of getOrigin  ------*/

/*============================
***   remove Origin  ***
==============================*/
methods.removeOrigin = async function(req, res) {
    const data = await Origin.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: req.body.status } },
        { multi: true });

    return SendResponse(res, { userMessage: 'Origin deleted.', data });
};

/*-----  End of removeOrigin  ------*/

/*==============================
***   Add Origin In Bulk  ***
================================*/
methods.addOriginBulk = function(req, res) {
    var exists = [];
    req.sheets = req.sheets.reduce((sheets, sheet) => {
        return sheets.concat(sheet);
    }, []);
    arrayReduce(req.sheets, [], function(origins, origin, callback) {
        Origin.findOne({
            name: origin.Name
        }, function(err, existingUser) {
            if (err) {
                return callback({
                    errors: err,
                    message: 'Some server error has occurred.'
                }, origins);
            } else if (existingUser) {
                return callback({
                    errors: null,
                    message: existingUser.name + ' already exists in our database from Row '
                }, origins);
            } else {
                origins.push({
                    name: (origin.Name || ''),
                });
                exists.push(origin.Name);
                callback(null, origins);
            }
        })
    }, async function(err, origins) {
        if (err) {
            return SendResponse(res, { error: true, errors: err.errors, userMessage: err.message });
        }

        let data = await Origin.create(origins);

        return SendResponse(res, { data, userMessage: 'Data has been uploaded successfully. Please check the data.' });
    });
};
