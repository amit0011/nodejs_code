var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var FreightCompany = mongoose.model('freightCompany');
var Shipline = mongoose.model('shipLine');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/freightCompany')
        .post(session.adminCheckToken, methods.addFreightCompany)
        .get(session.adminCheckToken, methods.getFreightCompany)
        .put(session.adminCheckToken, methods.updateFreightCompany);

    router
        .route('/freightCompany/delete')
        .post(session.adminCheckToken, methods.removeFreightCompany);

    router
        .route('/getFreightCompany')
        .post(session.adminCheckToken, methods.getFreightCompany);

    router
        .route('/shipline')
        .post(session.adminCheckToken, methods.addShipline)
        .get(session.adminCheckToken, methods.getShipline)
        .put(session.adminCheckToken, methods.updateShipline);

    router
        .route('/shipline/delete')
        .post(session.adminCheckToken, methods.removeShipline);
};

/*=============================
***   Add New Grade  ***
===============================*/
methods.addFreightCompany = async function(req, res) {
    req.checkBody('freightCompanyName', 'Freight company name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await FreightCompany.findOne({freightCompanyName: req.body.freightCompanyName, status: 0});
    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'FreightCompany Name already exist.'
        });
    }

    data = await (new FreightCompany(req.body)).save();
    return SendResponse(res, {data, userMessage: 'FreightCompany added successfully.'});
};/*-----  End of addFreightCompany  ------*/

/*=======================================
***   Get All FreightCompany List  ***
=========================================*/
methods.getFreightCompany = async function(req, res) {
    let data;
    let condition = { status: 0 };
    const {stuffers} = req.query;
    if (stuffers && stuffers !== 'undefined') {
        condition.stuffer = true;
    }

    if (!req.query.page) {
        data = await FreightCompany.find(condition);
    } else {
        var options = {
            sort: { createdAt: -1 },
            page: req.query.page,
            limit: req.query.limit || 10
        };

        data = await FreightCompany.paginate(condition, options);
    }
    return SendResponse(res, {data, userMessage: 'FreightCompany list.'});
};/*-----  End of getfreightCompanyType  ------*/

/*========================
***   Update FreightCompany  ***
==========================*/
methods.updateFreightCompany = async function(req, res) {
    let freightCompany = await FreightCompany.findOne({ _id: req.body._id });
    if (!freightCompany) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'FreightCompany details not found.'
        });
    }

    freightCompany.freightCompanyName = req.body.freightCompanyName || freightCompany.freightCompanyName;
    freightCompany.stuffer = req.body.stuffer;
    freightCompany.addressLine1 = req.body.addressLine1;
    freightCompany.addressLine2 = req.body.addressLine2;
    freightCompany.postalCode = req.body.postalCode;
    freightCompany.province = req.body.province;
    freightCompany.country = req.body.country;
    freightCompany.updatedAt = new Date();
    freightCompany = await freightCompany.save();

    return SendResponse(res, {data: freightCompany, userMessage: 'FreightCompany updated.' });
};/*-----  End of updatefreightCompany  ------*/

/*============================
***   remove FreightCompany  ***
==============================*/
methods.removeFreightCompany = async function(req, res) {
    let data = await FreightCompany.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'FreightCompany deleted.'});
};/*-----  End of removFreightCompany  ------*/

/*=============================
***   Add New Shipline  ***
===============================*/
methods.addShipline = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('shipLineName', 'Ship line name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
        error: true, status: 400, errors,
        userMessage: 'Validation errors'
        });
    } //Database functions here
        let data = await Shipline.findOne({
            shipLineName: req.body.shipLineName,
            freightCompanyId: req.body.freightCompanyId,
            status: 0
        });

        if (data) {
            return SendResponse(res, {
                error: true, status: 400,
                userMessage: 'Shipline name already exist with freight company name.'
            });
        }
        data = await (new Shipline(req.body)).save();

        return SendResponse(res, {data:data, userMessage: 'Shipline added successfully.'});
};
/*-----  End of addShipline  ------*/

/*=======================================
    ***   Get All Shipline  ***
=========================================*/
methods.getShipline = async function(req, res) {
    let query;
    var condition = { status: 0 };
    if (!req.query.page) {
        query = Shipline.find(condition);
    } else {
        var options = { sort: { createdAt: -1 },
            page: req.query.page,
            limit: 10,
            populate: 'freightCompanyId',
            lean: true
        };
        query = Shipline.paginate(condition, options);
    }
    if (!req.query.page && !req.query.freightCompanyId) {
        condition.freightCompanyId = req.query.freightCompanyId;

        query = Shipline.find(condition);
    }
    let data = await query;

    return SendResponse(res, {data, userMessage: 'shipline list.'});
};/*-----  End of getfreightCompanyType  ------*/

/*========================
***   Update Shipline  ***
==========================*/
methods.updateShipline = async function(req, res) {
    let data = await Shipline.findOne({ _id: req.body._id });
    if (!data) {
        //send response to client
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'shipline details not found.'
        });
    }
    data.shiplineName = req.body.shiplineName || data.shiplineName;
    data.updatedAt = new Date();
    data = await data.save();

    return SendResponse(res, {data, userMessage: 'shipline updated.'});
};/*-----  End of updateShipline  ------*/

/*============================
***   remove Shipline  ***
==============================*/
methods.removeShipline = async function(req, res) {
    let data = await Shipline.update({ _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res,{data, userMessage: 'Shipline deleted.'});
};/*-----  End of removShipline  ------*/
