var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Broker = mongoose.model('broker');
var arrayReduce = require('async-array-reduce');
var validation = require('@ag-libs/validation');
const { SendResponse } = require("@ag-common");

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/broker/bulk')
        .post(session.adminCheckToken, validation.checkUsersFile, methods.addBrokerBulk)
        .get(session.adminCheckToken, methods.getBrokerList);

    router
        .route('/broker')
        .post(session.adminCheckToken, methods.addBroker)
        .put(session.adminCheckToken, methods.updateBroker);


    router
        .route('/broker/delete')
        .post(session.adminCheckToken, methods.removeBroker);

    router
        .route('/broker/search')
        .post(session.adminCheckToken, methods.searchBroker);

};

/*==============================
***   Add Broker In Bulk  ***
================================*/
methods.addBrokerBulk = function(req, res) {
    var exists = [];
    req.sheets = req.sheets.reduce((sheets, sheet) => {
        return sheets.concat(sheet);
    }, []);
    arrayReduce(req.sheets, [], async function(users, user, callback) {
        let existingUser = await Broker.findOne({ email: 'xxx@g.com' });
        if (existingUser) {
            return callback({
                errors: null,
                message: existingUser.email + ' already exists in our database from Row '
            }, users);
        } else {
            var address = [];
            address.push({
                street: (user.AddressStreet || ''),
                city: (user.AddressCity || ''),
                province: (user.AddressProv || ''),
                postal: (user.AddressPostal || ''),
                country: user.country,
            });
            user.address = address;
            users.push({
                businessName: (user.Company || ''),
                firstName: (user.FirstName || ''),
                lastName: (user.LastName || ''),
                email: (user.Email || ''),
                cellNumber: (user.Cell || ''),
                phone: (user.Phone || ''),
                addresses: (user.address || ''),
                createdBy: req.admin._id,
            });
            exists.push(user.Email);
            callback(null, users);
        }
    }, async function(err, users) {
        if (err) {
            return SendResponse(res, {
                error: true, status: 400,
                errors: err.errors, userMessage: err.message
            });
        }

        let data = await Broker.create(users);
            return SendResponse(res, {
                data,
                userMessage: 'Data has been uploaded successfully. Please check the data.',
            });
    });
};/*-----  End of addBrokerBulk  ------*/

/*=========================
***   getBrokerList  ***
===========================*/
methods.getBrokerList = async function(req, res) {
    //Database functions here
    let data, condition, options;

    if (req.query.brokerId) {
        condition = { status: 0, _id: req.query.brokerId };
        data = await Broker.findOne(condition).populate('assignedUserId');
            // .lean();
    } else if (req.query.search) {
        options = {
            sort: { createdAt: -1 },
            page: req.query.page,
            limit: 10
        };

        condition = {
            status: 0,
            firstName: { $regex: ".*" + req.query.search + ".*", $options: 'i' }
        };
        data = await Broker.paginate(condition);

    } else if (!req.query.page) {
        condition = { status: 0 };
        data = await Broker.find(condition).sort('businessName');
    } else {
        condition = { status: 0 };
        options = {
            sort: { businessName: -1 },
            page: req.query.page,
            limit: 10
        };
        data = await Broker.paginate(condition, options);
    }

    return SendResponse(res, { data, userMessage: (req.query.brokerId ? 'Broker Details.' : 'broker list.') });
};/*-----  End of getBrokerList  ------*/

/*=====================
***   addBroker  ***
=======================*/
methods.addBroker = async function(req, res) {
    let broker;
    if (req.body.email) {
        broker = await Broker.findOne({ email: req.body.email });

        if (broker) {
            return SendResponse(res, {
                error: true, status: 400,
                userMessage: broker.email + ' already exists in our database.'
            });
        }
    }

    broker = await (new Broker(req.body)).save();

    return SendResponse(res, {
        data: broker,
        userMessage: 'Broker has been added successfully. Please check the data.'
    });
};/*-----  End of addBroker  ------*/

/*=======================
***   updateBroker  ***
=========================*/
methods.updateBroker = async function(req, res) {
    let data = await Broker.findOneAndUpdate({ _id: req.body._id }, req.body, { 'new': true });
    return SendResponse(res, { data, userMessage: 'Broker info updated successfully.' });
};/*-----  End of updateBroker  ------*/

/*============================
***   remove Broker  ***
==============================*/
methods.removeBroker = async function(req, res) {
    let data = await Broker.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, { data, userMessage: 'Broker deleted.' });
};/*-----  End of removeBroker  ------*/

/*========================
***   searchBroker  ***
==========================*/
methods.searchBroker = async function(req, res) {
    var options = {
        sort: { createdAt: -1 },
        page: req.query.page,
        limit: 10
    };
    var condition = { $and: [{ status: 0 }] };
    var or_condition = { $or: [] };

    if (req.body.name) {
        or_condition.$or.push({
            firstName: { $regex: ".*" + req.body.name + ".*", $options: 'i' }
        });
    }

    if (req.body.comapanyName) {
        or_condition.$or.push({
            businessName: { $regex: ".*" + req.body.comapanyName + ".*", $options: 'i' }
        });
    }

    if (req.body.phoneNumber) {
        or_condition.$or.push({
            phone: { $regex: ".*" + req.body.phoneNumber + ".*", $options: 'i' }
        });

        or_condition.$or.push({
            phone2: { $regex: ".*" + req.body.phoneNumber + ".*", $options: 'i' }
        });
    }

    if (req.body.postal) {
        or_condition.$or.push({
            'addresses.postal': { $regex: ".*" + req.body.postal + ".*", $options: 'i' }
        });
    }

    if (or_condition.$or.length) {
        condition.$and.push(or_condition);
    }

    let data = await Broker.paginate(condition, options);

    if (data.docs.length == 0) {
        return SendResponse(res, { data, status: 500, userMessage: 'No record found.' });
    }

    return SendResponse(res, { data, userMessage: 'broker List'});
};/*-----  End of searchBroker  ------*/
