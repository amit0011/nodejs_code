var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Equipment = mongoose.model('equipment');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/equipment')
        .post(session.adminCheckToken, methods.addEquipment)
        .get(session.adminCheckToken, methods.getEquipment)
        .put(session.adminCheckToken, methods.updateEquipment);

    router
        .route('/equipment/delete')
        .post(session.adminCheckToken, methods.removeEquipment);

    router
        .route('/equipmentType/inland')
        .get(session.adminCheckToken, methods.getInlandEquipmentTypeList);
};

/*=============================
***   Add New Grade  ***
===============================*/
methods.addEquipment = async function(req, res) {
    req.checkBody('equipmentName', 'Equipment name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await Equipment.findOne({
            equipmentName: req.body.equipmentName,
            status: 0,
            loadingPortId: req.body.loadingPortId
        });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Equipment Name already exist.'
        });
    }

    data = await (new Equipment(req.body)).save();
    return SendResponse(res, {data, userMessage: 'Equipment added successfully.'});
};/*-----  End of addEquipment  ------*/

/*=======================================
***   Get All Grade List  ***
=========================================*/
methods.getEquipment = async function(req, res) {
    let query, condition = {},    options = {
            sort: { createdAt: -1 },
            page: req.query.page,
            limit: 10,
            populate: ('loadingPortId'),
            lean: true
        };

    if (!req.query.page) {
        query = Equipment.find(condition);
    } else if (req.query.page) {
        condition = { status: 0 };
        query = Equipment.paginate(condition, options);
    }
    if (req.query.search) {
        condition = {
            status: 0,
            equipmentName: { $regex: ".*" + req.query.search + ".*", $options: 'i' }
        };
        query = Equipment.paginate(condition, options);
    }
    if (req.query.loadingPortId && !req.query.page) {
        condition = { status: 0, loadingPortId: req.query.loadingPortId };
        query = Equipment.find(condition);
    }

    let data = await query;
    return SendResponse(res, {data, userMessage: 'Equipment list.'});
};/*-----  End of getEquipmentType  ------*/

/*=======================================
***   Get All Grade List  ***
=========================================*/
methods.getInlandEquipmentTypeList = async function(req, res) {
    let data = await Equipment.find({
        status: 0,
        loadingPortId: req.query.loadingPortId,
        equipmentType: 'Inland'
    });

    return SendResponse(res, {data, userMessage: 'Equipment list.'});
};

/*========================
***   Update Equipment  ***
==========================*/
methods.updateEquipment = async function(req, res) {
    let data = await Equipment.findOne({ _id: req.body._id });

    if (!data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Equipment details not found.'
        });
    }

    data.equipmentName = req.body.equipmentName || data.equipmentName;
    data.loadingPortId = req.body.loadingPortId || data.loadingPortId;
    data.equipmentType = req.body.equipmentType || data.equipmentType;
    data.updatedAt = new Date();

    data = await data.save();
    return SendResponse(res, {data, userMessage: 'Equipment updated.'});
};/*-----  End of updateEquipment  ------*/

/*============================
***   remove Equipment  ***
==============================*/
methods.removeEquipment = async function(req, res) {
    let data = await Equipment.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Equipment deleted.'});
};/*-----  End of removeEquipment  ------*/
