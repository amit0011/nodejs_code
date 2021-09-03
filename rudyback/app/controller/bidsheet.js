var mongoose = require('mongoose');
const moment = require('moment');
var session = require('@ag-libs/session');
var Bidsheet = mongoose.model('bidsheet');
var BidPeriod = mongoose.model('bidPeriod');
var Archive = mongoose.model('archive');
const { SendResponse } = require("@ag-common");
var generateExcel = require('@ag-libs/generateExcel');

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/bidsheet')
        .post(session.adminCheckToken, methods.addBidsheet)
        .get(session.adminCheckToken, methods.getBidsheet)
        .put(session.adminCheckToken, methods.updateBidsheet);

    router
        .route('/bidsheet/delete')
        .post(session.adminCheckToken, methods.removeBidsheet);

    router
        .route('/bidsheet/period')
        .put(session.adminCheckToken, methods.changeBidPeriod);

    router
        .route('/bidPeriod')
        .post(session.adminCheckToken, methods.addBidPeriod)
        .get(session.adminCheckToken, methods.getBidPeriod)
        .put(session.adminCheckToken, methods.updateBidPeriod);

    router
        .route('/bidPeriod/delete')
        .post(session.adminCheckToken, methods.removeBidPeriod);
};

methods.addBidPeriod = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('bidPeriodName', 'bidPeriod Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let bidPeriod = await BidPeriod.findOne({
        bidPeriodName: req.body.bidPeriodName,
        status: 0
    });

    if (bidPeriod) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'BidPeriod Name already exist.'
        });
    }

    let data = await (new BidPeriod(req.body)).save();

    return SendResponse(res, {
        data, userMessage: 'BidPeriod added successfully.'
    });
};/*-----  End of addBidPeriod  ------*/

/****************************************************************
***   Get All getBidPeriod List  ***
****************************************************************/
methods.getBidPeriod = async function(req, res) {
    let data = await BidPeriod.find({ status: 0 });
    return SendResponse(res, {data, userMessage: 'bidPeriod list.'});
};/*-----  End of getBidPeriod  ------*/

/*****************************************************************
***   updateBidPeriod  ***
*****************************************************************/
methods.updateBidPeriod = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('bidPeriodName', 'BidPeriod Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await BidPeriod.findOne({
        _id: { $ne: req.body._id },
        bidPeriodName: req.body.bidPeriodName,
        status: 0
    });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'BidPeriod Name already exists in our database. '
        });
    }
    data = await BidPeriod.findByIdAndUpdate(
        req.body._id,
        { $set: { bidPeriodName: req.body.bidPeriodName } }
    );

    return SendResponse(res, {data, userMessage: 'BidPeriod update successfully.'});
};/*-----  End of updateBidPeriod  ------*/

/*****************************************************************
***   removeBidPeriod  ***
*****************************************************************/
methods.removeBidPeriod = async function(req, res) {
    let data = await BidPeriod.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Variety deleted.' });
};/*-----  End of removeBidPeriod  ------*/

/*****************************************************************
***   Add New Bidsheet  ***
*****************************************************************/
methods.addBidsheet = async function(req, res) {
    var data = await (new Bidsheet(req.body)).save();
    return SendResponse(res, {data, userMessage: 'Bid added successfully.'});
};/*-----  End of addBidsheet  ------*/

/*****************************************************************
***   Get All Bidsheet List  ***
*****************************************************************/
methods.getBidsheet = async function(req, res) {
    let data, condition;
    if (req.query.page) {
        var options = {
            sort: { 'commodityId.commodityName': 1 },
            page: req.query.page,
            limit: 100,
            populate: 'commodityId gradeId',
            lean: true
        };
        condition = { status: 0 };

        data = await Bidsheet.paginate(condition, options);
    } else if (req.query.commodityId) {
        condition = { status: 0, commodityId: req.query.commodityId };

        data = await Bidsheet.find(condition)
            .populate({
                path: 'commodityId gradeId',
                options: { sort: { 'commodityName': 1 } }
            })
            .lean();
    } else {
        condition = { status: 0 };

        data = await Bidsheet
            .find(condition)
            .populate({
                path: 'commodityId gradeId',
                options: { sort: { 'commodityName': 1 } }
            })
            .sort({ 'commodityId.commodityName': 1 })
            .lean();
    }

    return SendResponse(res, {data, userMessage: 'bidsheet list.'});
};/*-----  End of getBidsheet  ------*/

/*****************************************************************
***   Update Bidsheet  ***
*****************************************************************/
methods.updateBidsheet = async function(req, res) {
    req.body.bidPeriod.forEach((val) => {
        val.bidDel = val.bidDel - 0;
    });

    let data = await Bidsheet.findByIdAndUpdate(req.body._id, req.body);

    return SendResponse(res, {data, userMessage: 'Bid updated successfully.'});
};/*-----  End of updateBidsheet  ------*/

/*****************************************************************
***   change period  ***
*****************************************************************/
methods.changeBidPeriod = async function(req, res) {
    let data = await Bidsheet.update({},
        {
            $set: {
                bidPeriod1: req.body.bidPeriod1,
                bidPeriod2: req.body.bidPeriod2,
                bidPeriod3: req.body.bidPeriod3
            }
        },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Bid updated successfully.'});
};/*-----  End of changeP  ------*/

/*****************************************************************
***   remove Grade  ***
*****************************************************************/
methods.removeBidsheet = async function(req, res) {
    let data = await Bidsheet.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Bidsheet deleted.'});
};/*-----  End of removeBidsheet  ------*/

const round_off = (quantity, unit) => {
    var value = quantity || 0;
    if (unit == 'Bu' || unit == 'CWT') return (Number(value)).toFixed(2);
    else if (unit == 'Lbs') return (Number(value)).toFixed(4);
    else return 0;
};

const generateBidsheetExcel = async () => {
    let bidsheetData = await Bidsheet
        .find({ status: 0 })
        .populate({
            path: 'commodityId gradeId',
            options: { sort: { 'commodityName': 1 } }
        })
        .sort({ 'commodityId.commodityName': 1 })
        .limit(500)
        .lean();

    let jsonBS = bidsheetData.map(bidsheet => {
        return {
            'Commodity': bidsheet.commodityId.commodityName || '',
            'Grade': bidsheet.gradeId ? bidsheet.gradeId.gradeName || '' : '',
            'Max Qty': bidsheet.maxQuantity || '',
            'Unit': bidsheet.unit || '',
            [`B/Q-${bidsheet.bidPeriod1}`]: bidsheet.bidPeriod[0].bidType,
            [`Del-${bidsheet.bidPeriod1}`]: `${round_off(bidsheet.bidPeriod[0].bidDel,bidsheet.bidPeriod[0].bidDelUnit)} ${bidsheet.bidPeriod[0].bidDelUnit || ''}`,
            [`Fob-${bidsheet.bidPeriod1}`]: `${round_off(bidsheet.bidPeriod[0].bidFob,bidsheet.bidPeriod[0].bidFOBUnit)} ${bidsheet.bidPeriod[0].bidFOBUnit || ''}`,
            [`B/Q-${bidsheet.bidPeriod2}`]: bidsheet.bidPeriod[1].bidType,
            [`Del-${bidsheet.bidPeriod2}`]: `${round_off(bidsheet.bidPeriod[1].bidDel,bidsheet.bidPeriod[1].bidDelUnit)} ${bidsheet.bidPeriod[1].bidDelUnit || ''}`,
            [`Fob-${bidsheet.bidPeriod2}`]: `${round_off(bidsheet.bidPeriod[1].bidFob,bidsheet.bidPeriod[1].bidFOBUnit)} ${bidsheet.bidPeriod[1].bidFOBUnit || ''}`,
            [`B/Q-${bidsheet.bidPeriod3}`]: bidsheet.bidPeriod[2].bidType,
            [`Del-${bidsheet.bidPeriod3}`]: `${round_off(bidsheet.bidPeriod[2].bidDel,bidsheet.bidPeriod[2].bidDelUnit)} ${bidsheet.bidPeriod[2].bidDelUnit || ''}`,
            [`Fob-${bidsheet.bidPeriod3}`]: `${round_off(bidsheet.bidPeriod[2].bidFob,bidsheet.bidPeriod[2].bidFOBUnit)} ${bidsheet.bidPeriod[2].bidFOBUnit || ''}`,
            'createdAt': moment(bidsheet.createdAt).format('MM/DD/YYYY, h:mm:ss a')
        };
    });

    generateExcel.generate('Bidsheet', jsonBS, async function (err, reportUrl) {
        if (!err) {
            console.log(reportUrl);
            await (new Archive({
                reportUrl,
                reportDate: moment().add(-1, 'day'),
                reportName: 'BidsheetExcel',
                entityName: 'Bidsheet',
            })).save();
        }
    });
};

module.exports.generateBidsheetExcel = generateBidsheetExcel;
