var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var TradePurchase = mongoose.model('tradePurchase');
var Buyer = mongoose.model('buyer');
var Commodity = mongoose.model('commodity');
var multer = require('multer');
var multerS3 = require('multer-s3');
var Sales = mongoose.model('salesContract');
const { SendResponse } = require("@ag-common");

var generatePdf = require('@ag-libs/generatePdf');

var AWS = require('aws-sdk');
AWS.config.update({
    "accessKeyId": process.env.accessKeyId,
    "secretAccessKey": process.env.secretAccessKey,
    "region": process.env.region

});

const amazonS3 = new AWS.S3({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region,
    'signatureVersion': 'v4',
});

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/tradePurchase/getTradePurchaseDetails')
        .get(session.adminCheckToken, methods.getTradePurchaseDetails);

    router
        .route('/updateTradePurchaseStamp')
        .post(session.adminCheckToken, methods.updateTradePurchaseStamp);

    router
        .route('/getTradePurchaseList')
        .get(session.adminCheckToken, methods.getTradePurchaseList);

    router
        .route('/tradePurchase/count')
        .get(session.adminCheckToken, methods.getTradePurchaseCount);

    router
        .route('/tradePurchase/delete')
        .post(session.adminCheckToken, methods.deleteTradePurchase);

    router
        .route('/tradePurchase/report')
        .get(methods.getSalesContractReport);

    router
        .route('/tradePurchase/summary')
        .get(methods.getSalesSummaryReport);

    router
        .route('/tradePurchase/latest')
        .get(methods.getLatestTradePurchaseContract);

    router
        .route('/tradePurchase/uploadPdf')
        .put(methods.uploadPdf);

    router
        .route('/tradePurchase/removeSignedContract')
        .put(session.adminCheckToken, methods.removeSignedContract);

    router
        .route('/tradePurchase/search')
        .get(session.adminCheckToken, methods.searchContractUsingContractNo)
        .post(session.adminCheckToken, methods.searchSalesContract);

    router
        .route('/changeTradePurchaseContractStatus')
        .post(session.adminCheckToken, methods.changeTradePurchaseContractStatus);

    router
      .route('/tradePurchase')
      .post(session.adminCheckToken, methods.addTradePurchase)
      .get(session.adminCheckToken, methods.getTradePurchase)
      .put(session.adminCheckToken, methods.updateTradePurchase);

    router
        .route('/tradePurchase/:tradeId')
        .get(session.adminCheckToken, methods.getTradePurchaseByContractNo);

};

methods.getLatestTradePurchaseContract = async (req, res) => {
  let success = await TradePurchase
      .find({ status: { $nin: [2] } })
      .select('createdAt backDate buyerId quantityLbs contractNumber pdfUrl')
      .populate('buyerId', 'firstName lastName businessName')
      .sort('-createdAt')
      .limit(10);

  return SendResponse(res, {
      userMessage: "success",
      data: success
  });
};
methods.updateTradePurchaseStamp = async (req, res) => {
    const data = await TradePurchase.findByIdAndUpdate(req.body._id, req.body);

    return SendResponse(res, { data, userMessage: 'purchaseList.' });
};

/*==========================
***   searchPurchase  ***
============================*/
methods.searchSalesContract = async function(req, res) {

    var query = { $and: [] };
    if (req.body.status && req.body.status != 'undefined') {
        query.$and.push({ status: req.body.status });
    }

    if (req.body.commodityId) {
        query.$and.push({ commodityId: req.body.commodityId });
    }

    if (req.body.gradeId) {
        query.$and.push({ gradeId: req.body.gradeId });
    }

    if (req.body.contractNumber) {
        query.$and.push({ contractNumber: req.body.contractNumber });
    }

    if (req.body.fromDate || req.body.toDate) {
        if (req.body.fromDate && req.body.toDate) {
            query.$and.push({ date: { $gte: req.body.fromDate, $lte: req.body.toDate } });
        } else if (req.body.fromDate) {
            query.$and.push({ date: { $gte: req.body.fromDate } });
        } else {
            query.$and.push({ date: { $lte: req.body.toDate } });
        }
    }

    if (req.body.shippingStartDate || req.body.shippingEndDate) {
        if (req.body.shippingStartDate && req.body.shippingEndDate) {
            query.$and.push({
                'shipmentScheldule': {
                    $elemMatch: {
                        endDate: { $lte: req.body.shippingEndDate },
                        startDate: { $gte: req.body.shippingStartDate }
                    }
                }
            });
        } else if (req.body.shippingStartDate) {
            query.$and.push({
                'shipmentScheldule': { $elemMatch: { startDate: { $gte: req.body.shippingStartDate } } }
            });
        } else {
            query.$and.push({ 'shipmentScheldule': { $elemMatch: { endDate: { $lte: req.body.shippingEndDate } } } });
        }
    }
    if (req.body.type) {
        if (req.body.type == 'Signed') {
            query.$and.push({ contractIsSigned: true });
        } else {
            query.$and.push({ $or: [{ contractIsSigned: false }, { contractIsSigned: { $exists: false } }] });
        }
    }

    if (req.body.name) {
        var condition = { businessName: { $regex: ".*" + req.body.name + ".*", $options: 'i' } };

        const buyerIds = await Buyer.find(condition);
        query.$and.push({ buyerId: { $in: buyerIds.map((val) => val._id) } });
    }

    if (query.$and.length == 0) delete query.$and;

    let data = await TradePurchase.paginate(query, {
            page: Number(req.body.page) || 1,
            limit: Number(req.body.limit) || 10,
            populate: [
                { path: "buyerId", select: "businessName" },
                { path: "commodityId", select: "commodityName" },
                { path: "gradeId", select: "gradeName" }
            ],
            lean: true,
            sort: '-createdAt'
        });

    return SendResponse(res, { data, userMessage: 'purchaseList.' });
};

/*======================================
***   getTradePurchase  ***
========================================*/
methods.getTradePurchase = async function(req, res) {

    const data = await TradePurchase.paginate({}, {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
            populate: [
                { path: "buyerId", select: "businessName" },
                { path: "commodityId", select: "commodityName" },
                { path: "gradeId", select: "gradeName" }
            ],
            lean: true,
            sort: '-createdAt'
        });

    return SendResponse(res, { data, userMessage: 'sales list.' });
};

/*======================================
***   getTradePurchase  ***
========================================*/
methods.getTradePurchaseDetails = async function(req, res) {

    const data = await TradePurchase.findOne({ _id: req.query.tradeId })
        .populate('createdBy', 'signature')
        .populate('packingUnit', 'name');

    return SendResponse(res, { data, userMessage: 'sales list.' });
};/*-----  End of getTradePurchase  ------*/

methods.getTradePurchaseList = async function(req, res) {

    var condition = { buyerId: req.query.buyerId };

    const count = await TradePurchase.count(condition);

    const data = await TradePurchase.paginate(condition, {
            page: 1,
            limit: count,
            populate: [
                { path: 'commodityId', select: 'commodityName' },
                { path: 'gradeId', select: 'gradeName' },
                { path: 'scale', select: 'unloadWeidht void' },
                { path: 'buyerId', select: 'businessName firstName email' },
                { path: 'createdBy', select: 'email' }
            ],
            lean: true,
            sort: '-createdAt'
        });

    return SendResponse(res, { userMessage: 'List', data });
};

methods.uploadPdf = (req, res) => {
    var fileName = '';
    const uploadfile = multer({
        storage: multerS3({
            s3: amazonS3,
            bucket: process.env.S3_BUCKET,
            acl: 'public-read',
            metadata: (req, file, cb) => {
                cb(null, { fieldName: file.fieldname });
            },
            key: (req, file, cb) => {
                fileName = new Date().getTime() + '_' + ".pdf";
                cb(null, fileName);
            },
            contentType: multerS3.AUTO_CONTENT_TYPE
        }),
    }).single('file');

    uploadfile(req, res, function(err) {
        if (err) {
            return SendResponse(res, { error: true, status: 500, errors: err, userMessage: "uploadfile error" });
        }

        var urlParams = { Bucket: process.env.S3_BUCKET, Key: fileName };
        var s3 = new AWS.S3();

        s3.getSignedUrl('getObject', urlParams, async function(err, url) {

            await TradePurchase.findByIdAndUpdate(req.query.contractId, {
                $set: { signedContractPdf: url.split("?")[0], contractIsSigned: true }
            });

            return SendResponse(res, { userMessage: "Pdf uploaded" });
        });
    });
};

methods.removeSignedContract = async (req, res) => {
    const success = await TradePurchase.findByIdAndUpdate(req.query.id, {
            $set: { signedContractPdf: "", contractIsSigned: false }
        });

    if (success) {
        return SendResponse(res, { userMessage: "Pdf uploaded" });
    }

    return SendResponse(res, { status: 400, userMessage: "Something went wrong" });
};

methods.changeTradePurchaseContractStatus = async (req, res) => {
    const data = await TradePurchase.findByIdAndUpdate(
        { _id: req.body._id },
        { $set: {
            status: req.body.status,
            statusBy: req.admin._id,
            statusAt: Date.now(),
        }},
        { new: true }
    );

    if (data) {
        return SendResponse(res, { data, userMessage: 'Status updated successfully.' });
    }
    return SendResponse(res, { status: 400, userMessage: 'Something went wrong.' });
};


methods.getSalesSummaryReport = (req, res) => {
    var condition = { status: { $nin: [2] } };
    var aggregate = Commodity.aggregate();
    aggregate
        .match(condition)
        .lookup({
            from: "productioncontracts",
            let: { commodityId: "$_id" },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [ { $ne: ["$status", 2] }, { $eq: ["$commodityId", "$$commodityId"] } ]
                    }
                }
            }, {
                $project: {
                    quantityLbs: 1,
                    cropYear: 1,
                    CWTDel: 1,
                    inventoryGrade: 1,
                    type: "production"
                }
            }],
            as: "production"
        })
        .lookup({
            from: "salescontracts",
            let: { commodityId: "$_id" },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [ { $ne: ["$status", 2] }, { $eq: ["$commodityId", "$$commodityId"] } ]
                    }
                }
            }, {
                $project: {
                    quantityLbs: 1,
                    cropYear: 1,
                    CWTDel: 1,
                    inventoryGrade: 1,
                    type: "salesContract",
                    netFOBCAD: 1

                }
            }],
            as: "salesContract"
        })
        .lookup({
            from: "purchaseconfirmations",
            let: { commodityId: "$_id" },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [ { $ne: ["$status", 2] }, { $eq: ["$commodityId", "$$commodityId"] }]
                    }
                }
            }, {
                $project: {
                    quantityLbs: 1,
                    cropYear: 1,
                    CWTDel: 1,
                    inventoryGrade: 1,
                    type: "purchase"
                }
            }],
            as: "purchase"
        })
        .project({
            "production": 1,
            "purchase": 1,
            "salesContract": 1,
            "commodityId": "$_id"
        })
        .project({
            "commodityId": 1,
            "purchase": { $filter: { input: "$purchase", as: "a", cond: { $eq: ["$$a.cropYear", "2018"] } } },
            "production": { $filter: { input: "$production", as: "b", cond: { $eq: ["$$b.cropYear", "2018"] } } },
            "salesContract": { $filter: { input: "$salesContract", as: "c", cond: { $eq: ["$$c.cropYear", "2018"] } } },
        })
        .project({ "commodityId": 1, "all": { "$concatArrays": ["$production", "$purchase", "$salesContract"] } })
        .unwind({ path: "$all", preserveNullAndEmptyArrays: true })
        .group({
            "_id": { "commodityId": "$commodityId", "inventoryGrade": "$all.inventoryGrade" },
            "filteredList": {
                $push: {
                    "CWTDel": "$all.CWTDel",
                    "quantityLbs": "$all.quantityLbs",
                    "type": "$all.type",
                    "cropYear": "$all.cropYear",
                    "netFOBCAD": "$all.netFOBCAD"
                }
            }
        })
        .project({
            _id: 1,
            "production_purchase": {
                $filter: {
                    input: "$filteredList",
                    as: "item",
                    cond: { $in: ["$$item.type", ['production', 'purchase']] }
                }
            },
            "salesContract": {
                $filter: {
                    input: "$filteredList",
                    as: "item",
                    cond: { $in: ["$$item.type", ['salesContract']] }
                }
            }
        })
        .project({
            "_id": 1,
            "totalSale": {
                $reduce: {
                    input: "$salesContract",
                    initialValue: 0,
                    in: { $sum: ["$$value", { "$divide": ['$$this.quantityLbs', 100] }] }
                }
            },
            "salesContract": 1,
            "production_purchase": 1,
            "total_production_purchase": {
                $reduce: {
                    input: "$production_purchase",
                    initialValue: 0,
                    in: { $sum: ["$$value", { "$divide": ['$$this.quantityLbs', 100] }] }
                }
            }
        })
        .project({
            "_id": 1,
            "totalSale": 1,
            "total_production_purchase": 1,
            "total_weightedAvg": {
                $reduce: {
                    input: "$production_purchase",
                    initialValue: 0,
                    in: {
                        $sum: ["$$value", {
                            "$multiply": ["$$this.CWTDel", {
                                "$divide": [
                                    { "$divide": ["$$this.quantityLbs", 100] },
                                    {
                                        $cond: {
                                            if: { $gt: ["$total_production_purchase", 0] },
                                            then: "$total_production_purchase",
                                            else: 1
                                        }
                                    }
                                ]
                            }]
                        }]
                    }
                }
            },
            "total_salesAvg": {
                $reduce: {
                    input: "$salesContract",
                    initialValue: 0,
                    in: {
                        $sum: ["$$value", {
                            "$multiply": ["$$this.netFOBCAD", {
                                "$divide": [{ "$divide": ["$$this.quantityLbs", 100] },
                                    {
                                        $cond: {
                                            if: { $gt: ["$totalSale", 0] },
                                            then: "$totalSale",
                                            else: 1
                                        }
                                    }
                                ]
                            }]
                        }]
                    }
                }
            },
        })
        .lookup({
            from: "commodities",
            localField: "_id.commodityId",
            foreignField: "_id",
            as: "commodityId"
        })
        .lookup({
            from: "grades",
            localField: "_id.inventoryGrade",
            foreignField: "_id",
            as: "inventoryGrade"
        })
        .unwind({
            path: "$commodityId",
            preserveNullAndEmptyArrays: true
        })
        .unwind({
            path: "$inventoryGrade",
            preserveNullAndEmptyArrays: true
        })
        .project({
            _id: 1,
            "totalSale": 1,
            "commodityId.commodityName": 1,
            "commodityId._id": 1,
            "total_weightedAvg": 1,
            "total_salesAvg": 1,
            "total_production_purchase": 1,
            "inventoryGrade.gradeName": 1
        })
        .sort({ "commodityId.commodityName": 1 })
        .group({
            "_id": null,
            "data": {
                "$push": {
                    "totalSale": "$totalSale",
                    "total_salesAvg": "$total_salesAvg",
                    "commodityId": "$commodityId",
                    "total_weightedAvg": "$total_weightedAvg",
                    "total_production_purchase": "$total_production_purchase",
                    "inventoryGrade": "$inventoryGrade"
                }
            },
            "totalSale": { "$sum": "$totalSale" },
            "totalSalesAvg": { "$sum": "$total_salesAvg" },
            "totalPurchase": { "$sum": "$total_production_purchase" },
            "totalWeightedAvg": { "$sum": "$total_weightedAvg" },
        })

    .exec(function(err, data) {
        if (err) {
            return SendResponse(res, {
                error: true, status: 500, errors: err,
                userMessage: 'some server error has occurred.'
            });
        }

        return SendResponse(res, { userMessage: 'data found.', data });
    });
};

/*==================================================
***   searchContractUsingContractNo  ***
====================================================*/
methods.searchContractUsingContractNo = async function(req, res) {
    var query = { contractNumber: req.query.contractNumber };
    const data = await TradePurchase
        .findOne(query)
        .populate('commodityId gradeId buyerId');

    return SendResponse(res, { data, userMessage: 'salec contract details.' });
};/*-----  End of searchContractUsingContractNo  ------*/

methods.getSalesContractReport = async (req, res) => {
    if (!req.query.commodityId) {
        return SendResponse(res, { userMessage: 'sales contracts list.' });
    }

    var condition = { commodityId: mongoose.Types.ObjectId(req.query.commodityId), status: { $ne: 2 } };

    var aggregate = Sales.aggregate().match(condition);

    aggregate
        .lookup({
            from: "buyers",
            localField: "buyerId",
            foreignField: "_id",
            as: "buyerId"
        })
        .unwind({ path: "$buyerId", preserveNullAndEmptyArrays: true })
        .project({
            "salesId": "$_id",
            "contractNumber": 1,
            "signee": 1,
            "commodityId": 1,
            "buyerId": 1,
            "brokerId": 1,
            "gradeId": 1,
            "brokerCommision": 1,
            "showBroker": 1,
            "cropYear": 1,
            "countryId": 1,
            "packingUnit": 1,
            "tag": 1,
            "date": 1,
            "deliveryYear": { "$year": "$date" },
            "deliveryMonth": { "$month": "$date" },
            "tagType": 1,
            "contractQuantity": 1,
            "units": 1,
            "quantityLbs": 1,
            "totalCWT": { "$divide": ['$quantityLbs', 100] },
            "variance": 1,
            "cwtQuantity": 1,
            "packedIn": 1,
            "equipmentId": 1,
            "noOfBags": 1,
            "exchangeRate": 1,
            "bagWeight": 1,
            "shipmentScheldule": 1,
            "netFOBCAD": 1,
            "amount": 1,
            "otherConditions": 1,
            "paymentTerms": 1,
            "paymentMethod": 1,
            "pricingTerms": 1,
            "tradeRules": 1,
            "documents": 1,
            "inventoryGrade": 1,
            "createdBy": 1,
            "createdAt": 1
        });

    if (req.query.year) {
        aggregate.match({ "deliveryYear": req.query.year });
    }

    aggregate.group({
        "_id": "$salesId",
        "list": {
            "$push": {
                "contractNumber": "$contractNumber",
                "signee": "$signee",
                "commodityId": "$commodityId",
                "gradeId": "$gradeId",
                "buyerId": "$buyerId",
                "brokerId": "$brokerId",
                "brokerCommision": "$brokerCommision",
                "showBroker": "$showBroker",
                "cropYear": "$cropYear",
                "countryId": "$countryId",
                "packingUnit": "$packingUnit",
                "tag": "$tag",
                "date": "$date",
                "deliveryYear": "$deliveryYear",
                "deliveryMonth": "$deliveryMonth",
                "tagType": "$tagType",
                "contractQuantity": "$contractQuantity",
                "units": "$units",
                "quantityLbs": "$quantityLbs",
                "totalCWT": "$totalCWT",
                "variance": "$variance",
                "cwtQuantity": "$cwtQuantity",
                "packedIn": "$packedIn",
                "equipmentId": "$equipmentId",
                "noOfBags": "$noOfBags",
                "exchangeRate": "$exchangeRate",
                "bagWeight": "$bagWeight",
                "shipmentScheldule": "$shipmentScheldule",
                "amount": "$amount",
                "amountUnit": "$amountUnit",
                "netFOBCAD": "$netFOBCAD",
                "otherConditions": "$otherConditions",
                "paymentTerms": "$paymentTerms",
                "paymentMethod": "$paymentMethod",
                "pricingTerms": "$pricingTerms",
                "tradeRules": "$tradeRules",
                "documents": "$documents",
                "inventoryGrade": "$inventoryGrade",
                "createdBy": "$createdBy",
                "createdAt": "$createdAt",
            }
        },
        "total": { "$sum": "$totalCWT" }
    });

    const data = await aggregate.exec();

    return SendResponse(res, { data, userMessage: 'contracts list.' });
};

/*=================================
***   addTradePurchase  ***
===================================*/
methods.addTradePurchase = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('cropYear', 'Crop Year is required.').notEmpty();
    req.checkBody('contractNumber', 'Contract Number From is required.').notEmpty();
    req.checkBody('commodityId', 'Commodity is required.').notEmpty();
    req.checkBody('netFOBCAD', 'Net FOB is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    if (req.body._id) {
        let sales = await TradePurchase
            .findOne({ contractNumber: req.body.contractNumber, _id: { $ne: req.body._id } });

        if (sales) {
            return SendResponse(res, { error: true, status: 400, userMessage: 'Contract number already exist.' });
        }

        if (!req.body.inventoryGrade) {
            delete req.body.inventoryGrade;
        }

        var amended = 'amended' in req.body;
        req.body.amendedBy = req.admin._id;
        req.body.amended = amended == false ? false : true;
        req.body.amendedDate = new Date();
        req.body.salesStampGenerated = false;

        sales = await TradePurchase.findByIdAndUpdate(req.body._id, req.body).lean();

        const data = await TradePurchase
            .findById(sales._id)
            .populate({ path: 'buyerId', select: 'businessName addresses cellNumber phone' })
            .populate({ path: 'brokerId', select: 'businessName' })
            .populate({ path: 'commodityId', select: 'commodityAlias' })
            .populate({ path: 'gradeId', select: 'gradeName' })
            .populate({ path: 'packingUnit', select: 'name bulkBag bagWeightUnit' })
            .populate({ path: 'tagType', select: 'tags' })
            .populate({ path: 'variance', select: 'varianceName' })
            .populate({ path: 'equipmentType', select: 'equipmentName' })
            .populate({ path: 'pricingTerms', select: 'pricingTerms' })
            .populate({ path: 'paymentMethod', select: 'paymentMethod' })
            .populate({ path: 'paymentTerms', select: 'paymentTerms' })
            .populate({ path: 'tradeRules', select: 'tradeRules' })
            .populate({ path: 'createdBy', select: 'signature' })
            .populate({ path: 'documents', select: 'documents' });

        generatePdf.generatePDF('tradePurchase', data, async function(err, pdfUrl) {
            if (err) {
                return SendResponse(res, {
                    error: true, status: 500, errors: err,
                    userMessage: 'some server error has occurred.'
                });
            }

            const data = await TradePurchase
                .findByIdAndUpdate(sales._id, {
                    $set: { pdfUrl: pdfUrl },
                    $push: {
                        allPDF: {
                            date: new Date(),
                            pdfUrl: pdfUrl,
                            updatedBy: req.admin._id
                        }
                    }
                }, { new: true });

            return SendResponse(res, { data, userMessage: 'contract update successfully.' });
        });
    } else {
        let sales = await TradePurchase
            .findOne({ contractNumber: req.body.contractNumber });

        if (sales) {
            return SendResponse(res, { error: true,  status: 400, userMessage: 'Contract number already exist.' });
        }

        req.body.createdBy = req.admin._id;
        sales = await (new TradePurchase(req.body)).save();

        let data = await TradePurchase
            .findById(sales._id)
            .populate({ path: 'buyerId', select: 'businessName addresses cellNumber phone' })
            .populate({ path: 'brokerId', select: 'businessName' })
            .populate({ path: 'commodityId', select: 'commodityAlias' })
            .populate({ path: 'gradeId', select: 'gradeName' })
            .populate({ path: 'packingUnit', select: 'name bulkBag bagWeightUnit' })
            .populate({ path: 'tagType', select: 'tags' })
            .populate({ path: 'variance', select: 'varianceName' })
            .populate({ path: 'equipmentType', select: 'equipmentName' })
            .populate({ path: 'pricingTerms', select: 'pricingTerms' })
            .populate({ path: 'paymentMethod', select: 'paymentMethod' })
            .populate({ path: 'paymentTerms', select: 'paymentTerms' })
            .populate({ path: 'tradeRules', select: 'tradeRules' })
            .populate({ path: 'createdBy', select: 'signature' })
            .populate({ path: 'documents', select: 'documents' });

        generatePdf.generatePDF('tradePurchase', data, async function(err, pdfUrl) {

            if (err) {
                return SendResponse(res, {
                    error: true, status: 500, errors: err,
                    userMessage: 'some server error has occurred.'
                });
            }

            data = await TradePurchase
                .findByIdAndUpdate(data._id, {
                    $set: { pdfUrl },
                    $push: {
                        allPDF: {
                            date: new Date(),
                            pdfUrl: pdfUrl,
                            updatedBy: req.admin._id
                        }
                    }
                });
            return SendResponse(res, { data, userMessage: 'Sales contract successfully.' });
        });
    }
};/*-----  End of addTradePurchase  ------*/

/*============
***  updateTradePurchase   ***
==============*/
methods.updateTradePurchase = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('validation_code', 'Validation code is required.').notEmpty();
    req.checkBody('netFOBCAD', 'Net FOB is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, errors, status: 400, userMessage: 'Validation errors' });
    } else {

        let sales = await TradePurchase
            .findOne({ contractNumber: req.body.contractNumber, _id: { $ne: req.body._id } });

        if (sales) {
            return SendResponse(res, { error: true, status: 400, userMessage: 'Contract number already exist.' });
        }

        if (!req.body.inventoryGrade) {
            delete req.body.inventoryGrade;
        }

        var amended = 'amended' in req.body;
        //req.body.createdBy = req.admin._id;
        req.body.amendedBy = req.admin._id;
        req.body.amended = amended == false ? false : true;
        req.body.amendedDate = new Date();

        await TradePurchase.findByIdAndUpdate(req.body._id, req.body).lean();

        sales = await TradePurchase
            .findById(sales._id)
            .populate({ path: 'buyerId', select: 'businessName addresses cellNumber phone' })
            .populate({ path: 'brokerId', select: 'businessName' })
            .populate({ path: 'commodityId', select: 'commodityAlias' })
            .populate({ path: 'gradeId', select: 'gradeName' })
            .populate({ path: 'packingUnit', select: 'name bulkBag bagWeightUnit' })
            .populate({ path: 'tagType', select: 'tags' })
            .populate({ path: 'variance', select: 'varianceName' })
            .populate({ path: 'equipmentType', select: 'equipmentName' })
            .populate({ path: 'pricingTerms', select: 'pricingTerms' })
            .populate({ path: 'paymentMethod', select: 'paymentMethod' })
            .populate({ path: 'paymentTerms', select: 'paymentTerms' })
            .populate({ path: 'tradeRules', select: 'tradeRules' })
            .populate({ path: 'createdBy', select: 'signature' })
            .populate({ path: 'documents', select: 'documents' });

        generatePdf.generatePDF('sales', sales, async function(err, pdfUrl) {
            if (err) {
                return SendResponse(res, {
                    error: true, status: 500, errors: err,
                    userMessage: 'some server error has occurred.'
                });
            }

            const data = await Sales
                .findByIdAndUpdate(sales._id, {
                    $set: { pdfUrl },
                    $push: {
                        allPDF: {
                            date: new Date(),
                            pdfUrl: pdfUrl,
                            updatedBy: req.admin._id
                        }
                    }
                }, { new: true });

            return SendResponse(res, { data, userMessage: 'contract update successfully.' });
        });
    }
};/*-----  End of updateTradePurchase  ------*/

/*======================================
***   getTradePurchaseCount  ***
========================================*/
methods.getTradePurchaseCount = async function(req, res) {
    //Database functions here
    var query = { status: 0 };

    if (req.query.brokerId) {
        query = { commodityId: req.query.commodityId, cropYear: req.query.cropYear };
    }

    const data = await TradePurchase.findOne(query).sort('-contractNumber').limit(1);

    return SendResponse(res, { data, userMessage: 'count.' });
};/*-----  End of getTradePurchaseCount  ------*/

/*======================================
***   getTradePurchaseByContractNo  ***
========================================*/
methods.getTradePurchaseByContractNo = async function(req, res) {
    //Database functions here
    var query;
    query = { status: 0, _id: req.params.tradeId };

    let data = await TradePurchase.findOne(query)
        .populate('variance brokerId signee methodOfShipment commodityId certificateAnalysis gradeId buyerId equipmentType brokerId documents equipmentId paymentMethod paymentTerms pricingTerms tagType tradeRules loadingPortId packingUnit createdBy')
        .lean();

    if (!data) {
        return SendResponse(res, {
            status: 404,
            userMessage: 'The server has not found anything matching the ' + req.params.contractNo + ' given.'
        });
    }

    if (data.status == 2) {
        return SendResponse(res, {
            status: 404, userMessage: 'This contract has been voided, Please activate to make any change.'
        });
    }

    return SendResponse(res, { data, userMessage: 'Sales list.' });
};/*-----  End of getTradePurchaseByContractNo  ------*/

/*============================
***   deleteTradePurchase  ***
==============================*/
methods.deleteTradePurchase = async function(req, res) {
    const data = await TradePurchase.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 2 } },
        { multi: true }
    );

    return SendResponse(res, { data, userMessage: 'Contract deleted successfully.' });
};/*-----  End of deleteTradePurchase  ------*/
