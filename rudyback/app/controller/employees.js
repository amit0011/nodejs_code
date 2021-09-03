var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Employees = mongoose.model('employees');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/employees')
        .post(session.adminCheckToken, methods.addEmployees)
        .get(session.adminCheckToken, methods.getEmployees)
        .put(session.adminCheckToken, methods.updateEmployees);

    router
        .route('/employee')
        .get(session.adminCheckToken, methods.getEmployee);

    router
        .route('/employees/delete')
        .post(session.adminCheckToken, methods.removeEmployees);
};

/*=============================
***   Add New Grade  ***
===============================*/
methods.addEmployees = async function(req, res) {
    req.checkBody('firstName', 'First Name  is required.').notEmpty();
    // req.checkBody('lastName', 'Last Name  is required.').notEmpty();
    // req.checkBody('email', 'Email  is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await Employees.findOne({ email: req.body.email, status: 0 });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Employees email already exist.'
        });
    }

    data = await (new Employees(req.body)).save();

    return SendResponse(res, { data, userMessage: 'Employees added successfully.' });
};/*-----  End of addEmployees  ------*/

/*=======================================
***   Get All Employees List  ***
=========================================*/
methods.getEmployees = async function(req, res) {
    let data;

    var condition = { status: 0, buyerId: req.query.buyerId };

    if (!req.query.page) {
        data = await Employees.find(condition);
    } else {
        data = await Employees.paginate(condition, {
            sort: { name: 1 },
            page: req.query.page,
            limit: 5
        });
    }

    return SendResponse(res, { data, userMessage: 'Employees list.' });
};

methods.getEmployee = async function(req, res) {
    let data;
    var condition = { status: 0, brokerId: req.query.brokerId };

    if (!req.query.page) {
        data = await Employees.find(condition);
    } else {
        data = await Employees.paginate(condition, {
            sort: { name: 1 },
            page: req.query.page,
            limit: 5
        });
    }

    return SendResponse(res, {data, userMessage: 'Employees list.'});
};/*-----  End of get Employees  ------*/

/*========================
***   Update Employees  ***
==========================*/
methods.updateEmployees = async function(req, res) {
    let data = await Employees.findOne({ _id: req.body._id });

    if (!data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Employees details not found.'
        });
    }

    data.firstName = req.body.firstName || data.firstName;
    data.lastName = req.body.lastName || data.lastName;
    data.email = req.body.email || data.email;
    data.phone = req.body.phone || data.phone;
    data.cellNumber = req.body.cellNumber || data.cellNumber;
    data.titel = req.body.titel || data.titel;
    if (req.body.subscribeEmail != undefined) {
        data.subscribeEmail = req.body.subscribeEmail;
    }
    data.updatedAt = new Date();
    data = await data.save();

    return SendResponse(res, {data, userMessage: 'Employees updated.'});
};/*-----  End of updateEmployees  ------*/

/*============================
***   remove Employees  ***
==============================*/
methods.removeEmployees = async function(req, res) {
    let data = await Employees.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Employees deleted.'});
};/*-----  End of removeEmployees  ------*/
