var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Phone = mongoose.model('phoneNote');
var validation = require('@ag-libs/validation');
var async = require("async");
var Currency = mongoose.model('currency');
var Grower = mongoose.model('grower');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/phone/note')
        .post(session.adminCheckToken, methods.addPhone)
        .get(session.adminCheckToken, methods.getPhone);

    router
        .route('/phone/json')
        .post(methods.addPhoneJson);

    router
        .route('/phone/bulk')
        .post(validation.checkUsersFile, methods.addCountryBulk);

    router
        .route('/phone/phoneListByUser')
        .get(session.adminCheckToken, methods.phoneListByUser);
};

/*========================
***   addPhoneJson  ***
==========================*/
methods.addPhoneJson = function(req, res) {
    async.forEachOfLimit(req.body, 1, async (value, key, next) => {
        let grower = await Grower.findOne({ reference: value['kf Foreign ID'] });

        req.body.userName = value.user;
        req.body.referenceNumber = value['kf Foreign ID'];
        req.body.message = value.notes;
        req.body.createdAt = new Date(value['TS 2'] + ' ' + value['TS 3']);

        req.body.growerId = grower ? grower._id : null;

        await (new Phone(req.body)).save();
        next();
    }, () => {
        return SendResponse(res, { userMessage: 'Data has been uploaded successfully. Please check the data.' });
    });
};/*-----  End of addPhoneJson  ------*/

/*==============================
***   Add Country In Bulk  ***
================================*/
methods.addCountryBulk = function(req, res) {
    req.sheets = req.sheets.reduce((sheets, sheet) => {
        return sheets.concat(sheet);
    }, []);

    async.forEachOfLimit(req.sheets, 1, async (value, key, next) => {
        let grower = await Grower.findOne({ reference: value.reference });
        req.body.userName = value.user;
        req.body.referenceNumber = value.reference;
        req.body.message = value.notes;
        req.body.createdAt = new Date(value.TS);
        req.body.growerId = grower ? grower._id : null;

        await (new Phone(req.body)).save();
        next();
    }, () => {
        return SendResponse(res, { userMessage: 'Data has been uploaded successfully. Please check the data.' });
    });
};/*-----  End of addCountryBulk  ------*/

/*=============================
***   Add New Phone  ***
===============================*/
methods.addPhone = async function(req, res) {
    req.checkBody('message', 'Message is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    delete req.body.reference;
    req.body.createdBy = req.admin._id;
    let data = await (new Phone(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Phone note added successfully.'});
};/*-----  End of addBag  ------*/

/*=======================================
***   Get All Phone List  ***
=========================================*/
methods.getPhone = async function(req, res) {
    let data = [], condition = {};
    var options = {
        sort: { name: 1 },
        page: req.query.page,
        limit: 10
    };

    if (req.query.search) {
        condition = {
            status: 0,
            city: {
                $regex: ".*" + req.query.search + ".*",
                $options: 'i'
            }
        };
        data = await Phone.paginate(condition, options);
    } else if (!req.query.page) {
        if (req.query.growerId) {
            condition = { status: 0, growerId: req.query.growerId };
        } else if (req.query.buyerId) {
            condition = { status: 0, buyerId: req.query.buyerId };
        } else if (req.query.brokerId) {
            condition = { status: 0, brokerId: req.query.brokerId };
        }

        data = await Phone
            .find(condition)
            .populate('growerId createdBy')
            .sort({ createdAt: 1 })
            .lean();
    }

    return SendResponse(res, { data, userMessage: 'phone list.' });
};/*-----  End of get Phone  ------*/

/*============================
***   removeCurrency ***
==============================*/
methods.removeCurrency = async function(req, res) {
    let data = await Currency.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'bag deleted.'});
};/*-----  End of removeCurrency  ------*/

methods.phoneListByUser = async (req, res) => {
    var condition = { $and: [{ createdBy: req.query.adminId }] };

    if ((req.query.fromDate && req.query.fromDate != 'undefined') || (req.query.toDate && req.query.toDate != 'undefined')) {
        if (req.query.fromDate && req.query.toDate && req.query.fromDate != 'undefined' && req.query.toDate != 'undefined') {
            condition.$and.push({
                createdAt: { $gte: req.query.fromDate, $lte: req.query.toDate }
            });
        } else if (req.query.fromDate && req.query.fromDate != 'undefined') {
            condition.$and.push({
                createdAt: { $gte: req.query.fromDate }
            });
        } else if (req.query.toDate && req.query.toDate != 'undefined') {
            condition.$and.push({
                createdAt: { $lte: req.query.toDate }
            });
        }
    }

    let data = await Phone.paginate(condition, {
        select: 'growerId message createdAt',
        page: req.query.page || 1,
        limit: 5,
        populate: { path: 'growerId', select: 'firstName lastName farmName' }
    });

    return SendResponse(res, {data, userMessage: 'data list.'});
};
