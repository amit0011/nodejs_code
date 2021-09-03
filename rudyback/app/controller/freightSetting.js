var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var FreightSetting = mongoose.model('freightSettings');
const { SendResponse } = require("@ag-common");
const FreightSettingNote = mongoose.model('freightSettingNote');

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {
    router
        .route('/freightSetting')
        .post(session.adminCheckToken, methods.addFreightSetting)
        .get(session.adminCheckToken, methods.getFreightSetting)
        .put(session.adminCheckToken, methods.updateFreightSetting);

    router
        .route('/freightSetting/delete')
        .post(session.adminCheckToken, methods.removeFreightSetting);

    router
        .route('/freightSetting/note')
        .post(session.adminCheckToken, methods.addFreightSettingNote)
        .get(session.adminCheckToken, methods.getFreightSettingNote);
};

/*=============================
***   Add New Grade  ***
===============================*/
methods.addFreightSetting = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('intermodalVCR', 'intermodalVCR is required.').notEmpty();
    req.checkBody('intermodalMTL', 'intermodalMTL is required.').notEmpty();
    req.checkBody('blFee', 'blFee is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }
    var data = await new FreightSetting(req.body).save();

    return SendResponse(res, {data, userMessage: 'Freight Setting added successfully.'});

};/*-----  End of addFreightSetting  ------*/

/*=======================================
***   Get All FreightSetting List  ***
=========================================*/
methods.getFreightSetting = async function(req, res) {
    let data;
    var options = {
        sort: { createdAt: -1 },
        page: req.query.page,
        limit: 10
    };
    var condition = { status: 0 };

    if (req.query.search) {
        condition = {
            status: 0,
            city: {
                $regex: ".*" + req.query.search + ".*",
                $options: 'i'
            }
        };
        data = await FreightSetting.paginate(condition, options);

    } else if (!req.query.page) {
        data = await FreightSetting.find({});
    } else if (req.query.page) {
        data = await FreightSetting.paginate(condition, options);
    }

    return SendResponse(res, {data, userMessage: 'Freight Setting list.' });
};/*-----  End of get Bag  ------*/

/*========================
***   Update FreightSetting  ***
==========================*/
methods.updateFreightSetting = async function(req, res) {
    let data = await FreightSetting.findOne({ _id: req.body._id });
    if (!data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Validation errors'
        });
    }
    data.intermodalVCRUSD = req.body.intermodalVCRUSD || data.intermodalVCRUSD;
    data.intermodalMTLUSD = req.body.intermodalMTLUSD || data.intermodalMTLUSD;
    data.intermodalVCR = req.body.intermodalVCR || data.intermodalVCR;
    data.intermodalMTL = req.body.intermodalMTL || data.intermodalMTL;
    data.blFee = req.body.blFee || data.blFee;
    data.CyUsd = req.body.CyUsd || data.CyUsd;
    data.cwtsFcl = req.body.cwtsFcl || data.cwtsFcl;
    data.fobSktnBoxcar = req.body.fobSktnBoxcar || data.fobSktnBoxcar;
    data.fobSktnHoppercar = req.body.fobSktnHoppercar || data.fobSktnHoppercar;
    data.fobWpgBoxcar = req.body.fobWpgBoxcar || data.fobWpgBoxcar;
    data.fobWpgHoppercar = req.body.fobWpgHoppercar || data.fobWpgHoppercar;
    data = await data.save();

    return SendResponse(res, {data, userMessage: 'Freight Setting updated.'});
};/*-----  End of updateFreightSetting  ------*/

/*============================
***   remove FreightSetting  ***
==============================*/
methods.removeFreightSetting = async function(req, res) {
    let data = await FreightSetting.update({ _id: { $in: req.body.idsArray }},
        { $set: { status: 1 } },
        { multi: true}
    );

    return SendResponse(res, {data, userMessage: 'Freight Setting deleted.'});
};/*-----  End of removeFreightSetting  ------*/

methods.addFreightSettingNote = async function(req, res) {
    req.checkBody('message', 'Message is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    req.body.createdBy = req.admin._id;
    let data = await (new FreightSettingNote(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Freight setting note added successfully.'});
};

methods.getFreightSettingNote = async function(req, res) {
    let data = [], condition = {};

    data = await FreightSettingNote
        .find(condition)
        .populate('createdBy')
        .sort({ createdAt: 1 })
        .lean();

    return SendResponse(res, { data, userMessage: 'Freight setting note list.' });
};
