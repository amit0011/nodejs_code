var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Grade = mongoose.model('grade');
const { SendResponse } = require("@ag-common");

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/grade')
        .post(session.adminCheckToken, methods.addGrade)
        .get(session.adminCheckToken, methods.getGrade)
        .put(session.adminCheckToken, methods.updateGrade);

    router
        .route('/grade/delete')
        .post(session.adminCheckToken, methods.removeGrade);

    router
        .route('/grade/activate')
        .post(session.adminCheckToken, methods.activateGrade);

};

/*=============================
***   Add New Grade  ***
===============================*/
methods.addGrade = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('gradeName', 'Grade Name  is required.').notEmpty();
    // req.checkBody('gradeAllowance', 'Grade Allowance is required.').notEmpty();
    req.checkBody('gradeDisplay', 'Grade Dispaly is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }
    //Database functions here
    let grade = await Grade.findOne({
            commodityId: req.body.commodityId,
            gradeName: req.body.gradeName,
            status: 0
        });

    if (grade) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Grade Name already exist.' });
    }

    let data = await (new Grade(req.body)).save();

    return SendResponse(res, { data, userMessage: 'Grade added successfully.' });
};/*-----  End of addGrade  ------*/

/*=======================================
***   Get All Grade List  ***
=========================================*/
methods.getGrade = async function(req, res) {
    let data;
    var condition;
    if (req.query.page) {
        var options = {
            sort: { gradeName: 1 },
            page: req.query.page,
            limit: 10,
            populate: 'commodityId',
            lean: true
        };
        condition = { status: 0 };

        if (req.query.grade && req.query.grade != 'undefined') {
            condition = { gradeName: { $regex: req.query.grade, "$options": "si" } };
        }

        if (req.query.commodityId && req.query.commodityId != 'undefined') {
            condition.commodityId = req.query.commodityId;
        }

        data = await Grade.paginate(condition, options);
    } else if (req.query.commodityId && req.query.inventoryGrade) {
        condition = { status: 0, commodityId: req.query.commodityId, gradeDisplay: { $in: ['Inventory Grade', 'Both'] } };
        data = await Grade.find(condition).sort('gradeName');
    } else if (req.query.commodityId) {
        condition = { status: 0, commodityId: req.query.commodityId };
        if (req.query.callAs) {
            condition.gradeDisplay = {$in: ['Call as', 'All']};
        }
        data = await Grade.find(condition).sort('gradeName');
    } else {
        data = await Grade.find(condition).sort('gradeName');
    }
    return SendResponse(res, { data, userMessage: 'Grade list.' });
};/*-----  End of getGradeType  ------*/

/*========================
***   Update grade  ***
==========================*/
methods.updateGrade = async function(req, res) {
    let grade = await Grade.findOne({ _id: req.body._id });
    if (!grade) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Grade details not found.' });
    }

    grade.gradeName = req.body.gradeName || grade.gradeName;
    grade.gradeAllowance = req.body.gradeAllowance || grade.gradeAllowance;
    grade.gradeDisplay = req.body.gradeDisplay || grade.gradeDisplay;
    grade.commodityId = req.body.commodityId || grade.commodityId;
    grade.updatedAt = new Date();

    let data = await grade.save();
    return SendResponse(res, { data, userMessage: 'Grade updated.' });
};/*-----  End of updateGrade  ------*/

/*============================
***   remove Grade  ***
==============================*/
methods.removeGrade = async function(req, res) {
    let data = await Grade.update(
            { _id: { $in: req.body.idsArray } },
            { $set: { status: 1 } },
            { multi: true }
        );

    return SendResponse(res, { data, userMessage: 'Grade deleted.' });
};/*-----  End of removeGrade  ------*/

methods.activateGrade = function(req, res) {
    let data = Grade.update(
            { _id: { $in: req.body.idsArray } },
            { $set: { status: 0 } },
            { multi: true }
        );

    return SendResponse(res, {data, userMessage: 'Grade updated.'});
};
