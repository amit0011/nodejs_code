var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Commodity = mongoose.model('commodity');
var CommodityType = mongoose.model('commodityType');
var Grade = mongoose.model('grade');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/commodity/type')
        .post(session.adminCheckToken, methods.addCommodityType)
        .get(session.adminCheckToken, methods.getCommodityType)
        .put(session.adminCheckToken, methods.updateCommodityType);

    router
        .route('/commodity/type/delete')
        .post(session.adminCheckToken, methods.removeCommodityType);

    router
        .route('/commodity')
        .post(session.adminCheckToken, methods.addCommodity)
        .get(session.adminCheckToken, methods.getCommodity)
        .put(session.adminCheckToken, methods.updateCommodity);

    router
        .route('/commodity/delete')
        .post(session.adminCheckToken, methods.removeCommodity);
};

/*==================================
***   Add new Commodity Type  ***
====================================*/
methods.addCommodityType = async function(req, res) {
    req.checkBody('commodityTypeName', 'Commodity Type Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
    }

    let data = await CommodityType.findOne({
        commodityTypeName: req.body.commodityTypeName,
        status: 0
    });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Commodity Type Name already exist.'
        });
    }

    data = await (new CommodityType(req.body)).save();

    return SendResponse(res, { data, userMessage: 'Commodity Type added successfully.' });
};/*-----  End of addCommodityType  ------*/

/*==========================
***   updateCommodityType  ***
============================*/
methods.updateCommodityType = async function(req, res) {
    req.checkBody('commodityTypeName', 'Commodity Type Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
    }

    let data = await CommodityType.findOne({
        _id: { $ne: req.body._id },
        commodityTypeName: req.body.commodityTypeName,
        status: 0
    });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Commodity Type Name already exists in our database. '
        });
    }

    const {commodityTypeName, parentTypeId, byProducts, willHaveTotalDamage, sieveSizeNote} = req.body;

    data = await CommodityType.findByIdAndUpdate(
        req.body._id,
        { $set: { commodityTypeName, parentTypeId, byProducts, willHaveTotalDamage, sieveSizeNote } },
        { new: true }
    );

    return SendResponse(res, { data, userMessage: 'Commodity Type update successfully.' });
};/*-----  End of updateCommodityType  ------*/

/*=======================================
***   Get All Commodity Type List  ***
=========================================*/
methods.getCommodityType = async function(req, res) {
    let query = CommodityType.find({status: 0});

    if (req.query.populateByProducts == 1) {
        query.populate({
            path: 'byProducts',
        });
    }

    let data = await query
        .populate('parentTypeId', 'commodityTypeName')
        .sort({ commodityTypeName: 1 });

    return SendResponse(res, {data, userMessage: 'Commodity Type list.'});
};/*-----  End of getCommodityType  ------*/

/*=============================
***   Add New Commodity  ***
===============================*/
methods.addCommodity = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('commodityCode', 'Commodity Code is required.').notEmpty();
    req.checkBody('commodityName', 'Commodity Name is required.').notEmpty();
    req.checkBody('commodityAlias', 'Commodity Alias is required.').notEmpty();
    req.checkBody('commodityWeight', 'Commodity Weight is required.').notEmpty();
    req.checkBody('commodityWeightType', 'Commodity Weight Type is required.').notEmpty();
    let errors = req.validationErrors(true);

    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    } 

    let data = await Commodity.findOne({
        commodityName: req.body.commodityName,
        deleteStatus: 0
    });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Commodity Name already exist.'
        });
    }
    req.body.isByProduct = await methods.setByProductFlag(req);

    data = await (new Commodity(req.body)).save();

    req.body.commodityId = data._id;
    await (new Grade(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Commodity added successfully.'});
};/*-----  End of addCommodity  ------*/

methods.setByProductFlag = async function(req) {
    const ct = await CommodityType.findById(req.body.commodityTypeId)
        .populate('parentTypeId').lean();

    return ct.parentTypeId && ct.parentTypeId.commodityTypeName.toLowerCase() == 'by product';
};

/*=======================================
***   Get All Commodity List  ***
=========================================*/
methods.getCommodity = async function(req, res) {
    let data = await Commodity.find({ deleteStatus: 0 })
        .populate('commodityTypeId commodityGrade commoditySampleAnalysis commodityDeliveryAnalysis commodityShipmentAnalysis')
        .sort({
            commodityName: 1
        })
        .lean();

    return SendResponse(res, {data, userMessage: 'Commodity list.'});
};/*-----  End of getCommodityType  ------*/

/*=======================================
***   Update Commodity Using Id  ***
=========================================*/
methods.updateCommodity = async function(req, res) {
    let data = await Commodity.findOne({
        _id: { $ne: req.body._id },
        commodityName: req.body.commodityName,
        deleteStatus: 0
    });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Commodity Name already exist.'
        });
    }
    req.body.isByProduct = await methods.setByProductFlag(req);
    data = await Commodity.findByIdAndUpdate(req.body._id, req.body);

    return SendResponse(res, {
        data, userMessage: 'commodity update successfully.'
    });
};/*-----  End of Update Commodity using Id  ------*/

/*============================
***   remove Commodity  ***
==============================*/
methods.removeCommodity = async function(req, res) {
    let data = await Commodity.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { deleteStatus: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Commodity deleted.'});
};/*-----  End of removeCommodity  ------*/

/*============================
***   remove Commodity Type  ***
==============================*/
methods.removeCommodityType = async function(req, res) {
    let data = await CommodityType.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Commodity Type deleted.'});
};/*-----  End of removeCommodityType  ------*/
