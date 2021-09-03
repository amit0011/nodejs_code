var mongoose = require('mongoose');
var Town = mongoose.model('town');
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
        .route('/town')
        .put(session.adminCheckToken, methods.updateTown)
        .post(session.adminCheckToken, methods.addTown)
        .get(session.adminCheckToken, methods.getTown);

    router
        .route('/town/delete')
        .post(session.adminCheckToken, methods.removeTown);

    router
        .route('/town/bulk')
        .post(session.adminCheckToken, validation.checkUsersFile, methods.addTownBulk);

};

/*=============================
***   Add Town  ***
===============================*/
methods.addTown = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('name', 'name is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (req.body.name) {
        var regex = new RegExp(["^", req.body.name, "$"].join(""), "i");
        const town = await Town.findOne({ name: regex });

        if (town) {
            errors = { name: 'Town is already exists.' };
        }
    }

    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    const data = await (new Town(req.body)).save();

    return SendResponse(res, { data, userMessage: 'Town added successfully.' });
};/*-----  End of addTown  ------*/

/*=============================
***   Update Town  ***
===============================*/
methods.updateTown = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('name', 'name is required.').notEmpty();
    var errors = req.validationErrors(true);


    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    var regex = new RegExp(["^", req.body.name, "$"].join(""), "i");
    var town = await Town.findOne({ _id: { $ne: req.body._id }, name: regex });
    if (town) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Town name already exists.' });
    }

    town = await Town.findById(req.body._id);
    if (!town) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Given Town not exists.' });
    }

    const data = await Town.findByIdAndUpdate({ _id: town._id }, { $set: { name: req.body.name } }, { new: true });

    return SendResponse(res, { data, userMessage: 'Town added successfully.' });
};/*-----  End of addTown  ------*/

/*=======================================
***   Get All Town  ***
=========================================*/
methods.getTown = async function(req, res) {
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

    const data = await Town.paginate(condition, options);

    return SendResponse(res, { data, userMessage: 'Town list.' });
};/*-----  End of getTown  ------*/

/*============================
***   remove Town  ***
==============================*/
methods.removeTown = async function(req, res) {
    const data = await Town.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: req.body.status } },
        { multi: true });

    return SendResponse(res, { userMessage: 'Town deleted.', data });
};

/*-----  End of removeTown  ------*/

/*==============================
***   Add Town In Bulk  ***
================================*/
methods.addTownBulk = function(req, res) {
    var exists = [];
    req.sheets = req.sheets.reduce((sheets, sheet) => {
        return sheets.concat(sheet);
    }, []);

    arrayReduce(req.sheets, [], function(towns, town, callback) {
        Town.findOne({
            name: town.Name
        }, function(err, existingUser) {
            if (err) {
                return callback({
                    errors: err,
                    message: 'Some server error has occurred.'
                }, towns);
            } else if (existingUser) {
                return callback({
                    errors: null,
                    message: existingUser.name + ' already exists in our database from Row '
                }, towns);
            } else {
                towns.push({
                    name: (town.Name || ''),
                });
                exists.push(town.Name);
                callback(null, towns);
            }
        });
    }, async function(err, towns) {
        if (err) {
            return SendResponse(res, { error: true, errors: err.errors, userMessage: err.message });
        }

        let data = await Town.create(towns);

        return SendResponse(res, { data, userMessage: 'Data has been uploaded successfully. Please check the data.' });
    });
};
