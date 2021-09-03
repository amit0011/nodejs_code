var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Trucker = mongoose.model('trucker');
var Bin = mongoose.model('bin');
var validation = require('@ag-libs/validation');
var arrayReduce = require('async-array-reduce');
const { SendResponse } = require("@ag-common");

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/trucker')
        .post(session.adminCheckToken, methods.addTrucker)
        .get(session.adminCheckToken, methods.getTrucker)
        .put(session.adminCheckToken, methods.updateTrucker);

    router
        .route('/trucker/delete')
        .post(session.adminCheckToken, methods.removeTrucker);

    router
        .route('/trucker/bulk')
        .post(session.adminCheckToken, validation.checkUsersFile, methods.addTruckerBulk);

    router
        .route('/bin')
        .post(session.adminCheckToken, methods.addBin)
        .get(session.adminCheckToken, methods.getBin)
        .put(session.adminCheckToken, methods.updateBin);

    router
        .route('/bin/delete')
        .post(session.adminCheckToken, methods.removeBin);

};

/*==============================
***   Add Trucker In Bulk  ***
================================*/
methods.addTruckerBulk = function(req, res) {
    var exists = [];
    req.sheets = req.sheets.reduce((sheets, sheet) => {
        return sheets.concat(sheet);
    }, []);
    arrayReduce(req.sheets, [], function(users, user, callback) {
        Trucker.findOne({
            truckerName: user.Truckers
        }, function(err, existingUser) {
            if (err) {
                return callback({
                    errors: err,
                    message: 'Some server error has occurred.'
                }, users);
            } else if (existingUser) {
                return callback({
                    errors: null,
                    message: existingUser.truckerName + ' already exists in our database from Row '
                }, users);
            } else {
                users.push({
                    truckerName: (user.Truckers || '')
                });
                exists.push(user.Truckers);
                callback(null, users);
            }
        });
    }, async function(err, users) {
        if (err) {
            return SendResponse(res, { error: true, status: 400, errors: err.errors });
        }
        let data = await Trucker.create(users);

        return SendResponse(res, {
            data, userMessage: 'Data has been uploaded successfully. Please check the data.'
        });
    });
};/*-----  End of addTruckerBulk  ------*/

/*=============================
***   Add New Grade  ***
===============================*/
methods.addTrucker = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('truckerName', 'Trucker name  is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    //Database functions here
    let trucker = await Trucker.findOne({ truckerName: req.body.truckerName, status: 0 });
    if (trucker) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Trucker name already exist.' });
    }

    let data = await (new Trucker(req.body)).save();

    return SendResponse(res, { data, userMessage: 'Trucker added successfully.' });
};/*-----  End of addTrucker  ------*/

/*=======================================
***   Get All Trucker List  ***
=========================================*/
methods.getTrucker = async function(req, res) {
    let data;
    let options = { sort: { truckerName: 1 }, page: req.query.page, limit: 10 };
    let condition = { status: 0 };

    if (req.query.search) {
        condition = { truckerName: { $regex: ".*" + req.query.search + ".*", $options: 'i' } };
        data = await Trucker.paginate(condition, options);
    } else if (!req.query.page) {
        data = await Trucker.find(condition).sort('truckerName');
    } else {
        data = await Trucker.paginate(condition, options);
    }

    return SendResponse(res, { data, userMessage: 'Trucker list.' });
};/*-----  End of get Trucker  ------*/

/*========================
***   Update Trucker  ***
==========================*/
methods.updateTrucker = async function(req, res) {
    let trucker = await Trucker.findOne({ _id: req.body._id });

    if (!trucker) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Trucker details not found.' });
    }

    trucker.truckerName = req.body.truckerName || trucker.truckerName;
    let data = await trucker.save();

    return SendResponse(res, { data, userMessage: 'Trucker updated.' });
};/*-----  End of updateTrucker  ------*/

/*============================
***   remove Trucker  ***
==============================*/
methods.removeTrucker = async function(req, res) {
    let data = await Trucker.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, { data, userMessage: 'Trucker deleted.' });
};/*-----  End of removeTrucker  ------*/

/*=============================
***   Add New Bin  ***
===============================*/
methods.addBin = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('binName', 'Bin name  is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }
    //Database functions here
    let bin = await Bin.findOne({ binName: req.body.binName, status: 0 });
    if (bin) {
        return SendResponse(res, { status: 400, error: true, userMessage: 'Bin name already exist.' });
    }

    let data = await (new Bin(req.body)).save();

    return SendResponse(res, { data, userMessage: 'Bin added successfully.' });
};/*-----  End of addBin  ------*/

/*=======================================
***   Get All Bin List  ***
=========================================*/
methods.getBin = async function(req, res) {
    let query;
    var options = { sort: { name: 1 }, page: req.query.page || 1, limit: 10 };
    var condition = { status: 0 };

    if (req.query.search) {
        condition = { status: 0, city: { $regex: ".*" + req.query.search + ".*", $options: 'i' } };
        query = Bin.paginate(condition, options);
    } else if (!req.query.page) {
        query = Bin.find(condition);
    } else {
        query = Bin.paginate(condition, options);
    }

    let data = await query;

    return SendResponse(res, { data, userMessage: 'Bin list.' });
};/*-----  End of get Bin  ------*/

/*========================
***   Update Bin  ***
==========================*/
methods.updateBin = async function(req, res) {
    let bin = await Bin.findOne({ _id: req.body._id });

    if (!bin) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Bin details not found.' });
    }

    bin.binName = req.body.binName || bin.binName;

    let data = await bin.save();

    return SendResponse(res, { data, userMessage: 'Bin updated.' });
};/*-----  End of updateBagCategory  ------*/

/*============================
***   remove Bin  ***
==============================*/
methods.removeBin = async function(req, res) {
    let data = await Bin.update({ _id: { $in: req.body.idsArray } }, { $set: { status: 1 } }, { multi: true });

    return SendResponse(res, { data, userMessage: 'Bin deleted.' });
};/*-----  End of removeBin  ------*/
