var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Analysis = mongoose.model('analysis');
var Variety = mongoose.model('variety');
const { SendResponse } = require("@ag-common");

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {
    router
        .route('/analysis')
        .post(session.adminCheckToken, methods.addAnalysis)
        .get(session.adminCheckToken, methods.getAnalysis)
        .put(session.adminCheckToken, methods.updateAnalysis);

    router
        .route('/analysis/delete')
        .post(session.adminCheckToken, methods.removeAnalysis);

    router
        .route('/variety')
        .post(session.adminCheckToken, methods.addVariety)
        .get(session.adminCheckToken, methods.getVariety)
        .put(session.adminCheckToken, methods.updateVariety);

    router
        .route('/variety/delete')
        .post(session.adminCheckToken, methods.removeVariety);
};

/*==================================
***   Add new Commodity Type  ***
====================================*/
methods.addAnalysis = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('analysisName', 'Analysis Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await Analysis.findOne({ "analysisName": req.body.analysisName, status: 0 });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Analysis Name already exist.'
        });
    }
    data = await (new Analysis(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Analysis added successfully.'});
};/*-----  End of addAnalysis  ------*/

/*=======================================
***   Get All analysis List  ***
=========================================*/
methods.getAnalysis = async function(req, res) {
    let data = await Analysis.find({ status: 0 });
    return SendResponse(res, {data, userMessage: 'Analysis list.'});
};/*-----  End of getAnalysis  ------*/

/*============================
***   remove Analysis  ***
==============================*/
methods.removeAnalysis = async function(req, res) {
    let data = await Analysis.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Analysis deleted.'});
};/*-----  End of removeAnalysis  ------*/

/*==========================
***   updateAnalysis  ***
============================*/
methods.updateAnalysis = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('analysisName', 'Analysis Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {error: true, status: 400, errors, userMessage: 'Validation errors'});
    }

    let analysis = await Analysis.findOne(
        {
            _id: { $ne: req.body._id },
            analysisName: {
                $regex: req.body.analysisName,
                $options: "si"
            },
            status: 0
        }
    );

    if (analysis) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Analysis Name already exists in our database. '
        });
    }
    let data = await Analysis.findByIdAndUpdate(
        req.body._id,
        { $set: { analysisName: req.body.analysisName } }
    );
    return SendResponse(res, {data, userMessage: 'Analysis update successfully.'});
};/*-----  End of updateAnalysis  ------*/

/*==================================
***   Add new Commodity Type  ***
====================================*/
methods.addVariety = async function(req, res) {
    req.checkBody('varietyName', 'Variety Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let variety = await Variety.findOne({
        varietyName: { $regex: req.body.varietyName, $options: "si" },
        status: 0
    });

    if (variety) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Variety Name already exist.'
        });
    }
    var data = await (new Variety(req.body)).save();

    return SendResponse(res,{data, userMessage: 'Variety added successfully.'});
};/*-----  End of addVariety  ------*/

/*=======================================
***   Get All Variety List  ***
=========================================*/
methods.getVariety = async function(req, res) {
    let data = await Variety.find({ status: 0 });
    return SendResponse(res, {data, userMessage: 'Variety list.'});
};/*-----  End of getVariety  ------*/

/*==========================
***   updateVariety  ***
============================*/
methods.updateVariety = async function(req, res) {
    req.checkBody('varietyName', 'Variety Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let variety = await Variety.findOne({
        _id: { $ne: req.body._id },
        varietyName: { $regex: req.body.varietyName, $options: "si" },
        status: 0
    });

    if (variety) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Variety Name already exists in our database.'
        });
    }

    let data = await Variety.findByIdAndUpdate(
        req.body._id,
        { $set: { varietyName: req.body.varietyName }
    });

    return SendResponse(res,{data, userMessage: 'Variety update successfully.'});
};/*-----  End of updateVariety  ------*/

/*============================
***   removeVariety  ***
==============================*/
methods.removeVariety = async function(req, res) {
    let data = await Variety.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Variety deleted.'});
};/*-----  End of removeVariety  ------*/
