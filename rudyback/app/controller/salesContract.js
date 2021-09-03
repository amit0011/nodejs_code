var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Sales = mongoose.model('salesContract');
var Scale = mongoose.model('scale');
var Buyer = mongoose.model('buyer');
var Bag = mongoose.model('bags');
var Archive = mongoose.model('archive');
var async = require("async");
var Commodity = mongoose.model('commodity');
var moment = require('moment');
var multer = require('multer');
var multerS3 = require('multer-s3');
const _ = require('lodash');
var CommodityAdjustments = mongoose.model('commodityAdjustment');
const BagInventory = mongoose.model('bagInventory');

var salesContractHistory = mongoose.model('salesContractHistory');
var generatePdf = require('@ag-libs/generatePdf');
var CropYear = require("@ag-libs/cropYear");
const { SendResponse } = require("@ag-common");
var generateExcel = require('@ag-libs/generateExcel');
const {convert} = require('@ag-libs/utils');

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
        .route('/salesContract')
        .post(session.adminCheckToken, methods.addSalesContract)
        .get(session.adminCheckToken, methods.getSalesContract);

    router
        .route('/salesContract/count')
        .get(session.adminCheckToken, methods.getSalesContractCount);

    router
        .route('/salesContract/:contractNo/contract')
        .get(session.adminCheckToken, methods.getSalesContractByContractNo);

    router
        .route('/salesContract/delete')
        .post(session.adminCheckToken, methods.deleteSalesContract);

    router
        .route('/salesContract/report')
        .get(session.adminCheckToken, methods.getSalesContractReport);

    router
        .route('/sales/uploadPdf')
        .put(methods.uploadPdf);

    router
        .route('/salesContract/removeSignedContract')
        .put(session.adminCheckToken, methods.removeSignedContract);

    router
        .route('/salesContract/search')
        .post(session.adminCheckToken, methods.searchSalesContract)
        .get(session.adminCheckToken, methods.searchSalesContractUsingContractNumber);

    router
        .route('/salesContract/verify')
        .post(session.adminCheckToken, methods.changeVerifySalesContract);

    router
        .route('/updateSalesContractStatus')
        .post(session.adminCheckToken, methods.checkContractWithNoActiveScaleTickets, methods.updateSalesContractStatus);

    router
        .route('/sales/salesSummary')
        .get(session.adminCheckToken, methods.salesSummary);

    router
        .route('/sales/forexReport')
        .get(session.adminCheckToken, methods.forexReport);

    router
        .route('/sales/updateForexPayment')
        .post(session.adminCheckToken, methods.updateForexPayment);

    router
        .route('/sales/getLatestSalesContract')
        .get(session.adminCheckToken, methods.getLatestSalesContract);

    router
        .route('/sales/getAmendedSalesContract')
        .get(session.adminCheckToken, methods.getAmendedSalesContract);

    router
        .route('/sales/outstandingSalesReport')
        .get(session.adminCheckToken, methods.outstandingSalesReport)
        .put(session.adminCheckToken, methods.updateOutstandingSalesReport);

    router
        .route('/sales/salesContractListByUser')
        .get(session.adminCheckToken, methods.salesContractListByUser);

    router
        .route('/getsalesContractByBuyer')
        .get(session.adminCheckToken, methods.getsalesContractByBuyer);

    router
        .route('/updateSalesStamp')
        .post(session.adminCheckToken, methods.updateSalesStamp);

    router
        .route('/sales/commission')
        .post(session.adminCheckToken, methods.commissionPayable);

    router
        .route('/sales/salesHistory')
        .get(session.adminCheckToken, methods.salesHistory);

    router
        .route('/sales/rollover')
        .post(session.adminCheckToken, methods.canCreateRollover, methods.salesContractRollover)
        .get(session.adminCheckToken, methods.getRolloverList);

    router
        .route('/salesContract/export')
        .post(session.adminCheckToken, methods.exportReport);
};

function getShippedQuantityLbs (scale) {
    var totalShippedQuantityLbs = 0;
    if (scale && scale.length > 0) {
        scale.forEach((val) => {
            // convert kg to pounds ( Number(val.netWeight) * 2.2046)
            if(!val.void){
                totalShippedQuantityLbs += val.unloadWeidht ? Number(val.unloadWeidht) * 2.2046 : 0;
            }
        });

    }
    return totalShippedQuantityLbs;
}

methods.exportReport = async (req, res) => {
    req.count = '0';
    const {data} = await methods.getSearchSalesContract(req, res);
    let shipmentSchedule = '';
    let shippedQuantity = 0;

    var newData = data.docs.map(sc => {
        shipmentSchedule = '';
        shippedQuantity = getShippedQuantityLbs(sc.scale);
        if (sc.shipmentScheldule.length > 0) {
            shipmentSchedule = sc.shipmentScheldule[0].startDate + '/' + sc.shipmentScheldule[sc.shipmentScheldule.length - 1].endDate;
        }
        return {
            'Date': moment(sc.date).format('MM/DD/YYYY'),
            'Contract Number': sc.contractNumber,
            'Signed': sc.contractIsSigned ? 'Yes' : 'No',
            'Buyer Name': sc.buyerId ? sc.buyerId.businessName : '',
            'Commodity': sc.commodityId.commodityName || '',
            'Grade': sc.gradeId ? sc.gradeId.gradeName : '',
            'Contracted Qty(lbs)': sc.quantityLbs,
            'Shipped Qty(lbs)': shippedQuantity,
            'Outstanding Qty(lbs)': sc.status == 1 ? 0 :(sc.quantityLbs - shippedQuantity),
            'Net FOB': sc.netFOBCAD,
            'Shipping Schedule': shipmentSchedule
        };
    });

    res.xls("salesContract", newData);
};

methods.getsalesContractByBuyer = async (req, res) => {
    var condition = {
        buyerId: req.query.buyerId
    };
    const count = await Sales.count(condition);

    const data = await Sales.paginate(condition, {
            page: 1,
            limit: count,
            populate: [
                { path: 'commodityId', select: 'commodityName' },
                { path: 'gradeId', select: 'gradeName' },
                { path: 'scale tradeScale scale_loadsheet', select: 'unloadWeidht void' },
                { path: 'buyerId', select: 'firstName lastName businessName addresses email' },
                { path: 'mailSentBy', select: 'fullName' }
            ],
            lean: true,
            sort: '-date'
        });

    return SendResponse(res, { data, userMessage: 'List' });
};

methods.commissionPayable = async (req, res) => {
    let condition = {brokerId: { $exists: true }, brokerCommision: {$exists: true, $ne: ''},};
    let query, scaleQuery = [{ $ne: ["$void", true] }, { $eq: ["$contractNumber", "$$contractNumber"] }];
    let sQuery = {"void": {$ne: true}};

    if (req.body.brokerId) {
        condition.brokerId.$eq = mongoose.Types.ObjectId(req.body.brokerId);
    }

    if (req.body.commodityId) {
        condition.commodityId = mongoose.Types.ObjectId(req.body.commodityId);
    }


    if (req.body.buyer) {
        query = { businessName: { $regex: ".*" + req.body.buyer + ".*", $options: 'i' } };
        const buyerIds = await Buyer.find(query);

        condition.buyerId = { $in: buyerIds.map((val) => val._id) };
    }

    if (req.body.ticketNumber) {
        sQuery.ticketNumber = req.body.ticketNumber;
        scaleQuery.push({ $eq: ["$ticketNumber", req.body.ticketNumber]});
    }

    if (req.body.fromDate && req.body.toDate) {
        sQuery.date = {$gte: req.body.fromDate, $lte: req.body.toDate};
    } else if (req.body.fromDate) {
        sQuery.date = {$gte: req.body.fromDate};
    } else if (req.body.toDate) {
        sQuery.date = {$lte: req.body.toDate};
    }

    if (_.keys(sQuery).length > 1) {
        const scales = await Scale.find(sQuery)
            .select('contractNumber')
            .lean();

        condition.contractNumber = {$in: scales.map(scale => scale.contractNumber)};
        scaleQuery.push({$in: ['$_id', scales.map(scale => scale._id)]});
    }

    if (req.body.contractNumber) {
        condition.contractNumber = req.body.contractNumber;
    }

    let aggregate = Sales.aggregate()
        .match(condition)
        .lookup({
            from: "scales",
            let: { contractNumber: "$contractNumber" },
            pipeline: [{
                $match: {
                    $expr: { $and: scaleQuery }
                }
            }, {
                $project: { unloadWeidhtMT: 1, ticketNumber: 1, date: 1 }
            }],
            as: "scales"
        })
        .unwind({ path: "$scales", preserveNullAndEmptyArrays: true })
        .lookup({ from: 'buyers', localField: 'buyerId', foreignField: "_id", as: 'buyer' })
        .unwind({ path: "$buyer", preserveNullAndEmptyArrays: true })
        .lookup({ from: 'brokers', localField: 'brokerId', foreignField: "_id", as: 'broker' })
        .unwind({ path: "$broker", preserveNullAndEmptyArrays: true })
        .lookup({ from: 'commodities', localField: 'commodityId', foreignField: "_id", as: 'commodity' })
        .unwind({ path: "$commodity", preserveNullAndEmptyArrays: true })
        .sort({"scales.date": -1})
        .project({
            contractNumber: 1,
            commodityId: 1,
            "commodity.commodityName": 1,
            "commodity.commodityWeight": 1,
            brokerId: 1,
            buyerId: 1,
            "buyer.businessName": 1,
            "broker.businessName": 1,
            commissionType: 1,
            brokerCommision: 1,
            amountUnit: 1,
            amount: 1,
            exchangeRate: 1,
            contractCurrency: 1,
            scales: 1,
        });
    let limit = req.body.limit || 10;

    let data = await Sales.aggregatePaginate(aggregate, { page: req.body.page, limit });

    return SendResponse(res, { data, userMessage: 'List' });
};

methods.checkContractWithNoActiveScaleTickets = async (req, res, next) => {
    if (req.body._id && req.body.status == 2) {
        let sales = await Sales.findById(req.body._id);
        const contractNumber = sales.contractNumber;
        let scaleCount = await Scale.count({
            contractNumber,
            void: { $ne: true },
            ticketType: "Outgoing"
        });
        if (scaleCount) {
            return SendResponse(res, {
                error: true,
                status: 400,
                userMessage: 'Contract have one or more unvoided scale tickets.'
            });
        }
    }
    next();
};

methods.updateForexPayment = async (req, res) => {
    await Sales.findByIdAndUpdate(req.body._id, {
            $set: {
                shipmentScheldule: req.body.shipmentScheldule,
                accountingCompleted: req.body.accountingCompleted,
            }
        });
    return SendResponse(res, { userMessage: "Payment updated successfully" });
};

methods.forexReport = async (req, res) => {
    var condition = { status: { $nin: [2] }, accountingCompleted: {$ne: true}, contractCurrency: 'USD' };

    if (req.query.contractNumber && req.query.contractNumber != 'undefined') {
        condition.contractNumber = { $regex: req.query.contractNumber, $options: "si" };
    }

    if (req.query.accountingCompleted && req.query.accountingCompleted != 'false') {
        delete condition.accountingCompleted;
    }

    if (req.query.cropYear && req.query.cropYear != 'undefined') {
        condition.cropYear = req.query.cropYear;
    }

    const data = await Sales
        .find(condition)
        .populate({
            path: 'buyerId',
            select: 'firstName lastName businessName addresses'
        })
        .sort("-date");

    return SendResponse(res, { data, userMessage: "forex report" });
};

methods.getLatestSalesContract = async (req, res) => {
    const data = await Sales
        .find({ status: { $nin: [2] } })
        .select('date contractNumber buyerId  quantityLbs pdfUrl')
        .populate('buyerId', 'businessName')
        .sort('-date')
        .limit(10);

    return SendResponse(res, { data, userMessage: "success" });
};

methods.getAmendedSalesContract = async (req, res) => {
    const data = await Sales
      .paginate(
        { status: { $nin: [2] }, amended: true },
        {
          sort: {amendedDate: -1},
          page: Number(req.query.page) || 1,
          select: {amendedDate: 1, contractNumber: 1, buyerId: 1, amendedBy: 1},
          limit: 10,
          populate: [
            {path: 'buyerId', select: 'businessName'},
            {path: 'amendedBy', select: 'fullName'},
          ],
        }
      );

    return SendResponse(res, { data, userMessage: "success" });
};

methods.salesSummary = async (req, res) => {
    var condition = { status: { $nin: [2] } };

    if (req.query.commodityId && req.query.commodityId != 'undefined') {
        condition.commodityId = req.query.commodityId;
    }

    if (req.query.cropYear && req.query.cropYear != 'undefined') {
        condition.cropYear = req.query.cropYear;
    }

    if (req.query.brokerId && req.query.brokerId != 'undefined') {
        condition.brokerId = req.query.brokerId;
    }

    if (req.query.buyer && req.query.buyer != 'undefined') {
        var query = { businessName: { $regex: ".*" + req.query.buyer + ".*", $options: 'i' } };
        const buyerIds = await Buyer.find(query);

        condition.buyerId = { $in: buyerIds.map((val) => val._id) };
    }

    if (req.query.contractNumber && req.query.contractNumber != 'undefined') {
        condition.contractNumber = { $regex: req.query.contractNumber, $options: "si" };
    }

    if (req.query.fromDate && req.query.fromDate != 'undefined' && req.query.toDate && req.query.toDate != 'undefined') {
        condition.date = { $gte: req.query.fromDate, $lte: req.query.toDate};
    } else if (req.query.fromDate && req.query.fromDate != 'undefined') {
        condition.date = { $gte: req.query.fromDate };
    } else if (req.query.toDate && req.query.toDate != 'undefined') {
        condition.date = { $lte: req.query.toDate };
    }

    var options = {
        populate: [
            { path: 'createdBy', select: 'fullName' },
            { path: 'buyerId', select: 'firstName lastName businessName addresses' },
            { path: 'commodityId', select: 'commodityName commodityWeight' },
            { path: 'inventoryGrade gradeId callAsGrade', select: 'gradeName' },
            { path: 'packingUnit', select: 'bagWeightUnit name' },
            { path: 'palletUnit', select: 'bagWeightUnit name' },
            { path: 'tagType', select: 'tags' },
            { path: 'loadingPortId', select: 'loadingPortName' },
            { path: 'equipmentType', select: 'equipmentName equipmentType' },
            { path: 'certificateAnalysis', select: 'certificateName' },
            { path: 'brokerId', select: 'firstName lastName businessName' },
            { path: 'pricingTerms', select: 'pricingTerms' }
        ],
        sort: '-date',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10
    };

    const data = await Sales.paginate(condition, options);

    return SendResponse(res, { data, userMessage: "Sales summary report" });
};

methods.removeSignedContract = async (req, res) => {
    const data = await Sales
        .findByIdAndUpdate(req.query.id, {
            $set: { signedContractPdf: "", contractIsSigned: false }
        });

    if (!data) {
        return SendResponse(res, { userMessage: "Something went wrong", status: 400 });
    }

    return SendResponse(res, { userMessage: "Pdf uploaded" });
};

methods.uploadPdf = (req, res) => {
    var fileName = '';
    const uploadfile = multer({
        storage: multerS3({
            s3: amazonS3,
            bucket: process.env.S3_BUCKET,
            acl: 'public-read',
            metadata: (req, file, cb) => {
                cb(null, {
                    fieldName: file.fieldname
                });
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
            return SendResponse(res, {
                error: true, status: 500, errors: err,
                userMessage: "uploadfile error"
            });
        } else {
            var urlParams = { Bucket: process.env.S3_BUCKET, Key: fileName };
            var s3 = new AWS.S3();
            // get uploaded pdf url
            s3.getSignedUrl('getObject', urlParams, async function(err, url) {
                let dataToUpdate = {};
                if (req.body.brokerNote) {
                  dataToUpdate.brokerNote = req.body.brokerNote;
                }
                if (url) {
                  dataToUpdate.contractIsSigned = true;
                  dataToUpdate.signedContractPdf = url.split("?")[0];
                }
                await Sales.findByIdAndUpdate(req.query.contractId, { $set: dataToUpdate });

                return SendResponse(res, {
                    userMessage: "Pdf uploaded",
                });

            });
        }
    });
};

/****************************************************************
***   changeVerifySalesContract  ***
****************************************************************/
methods.changeVerifySalesContract = async function(req, res) {
    const data = await Sales.findByIdAndUpdate(req.body._id, req.body);

    return SendResponse(res, { data, userMessage: 'contract update successfully.' });
}; /*-----  End of changeVerifySalesContract  ------*/

/****************************************************************
***   searchSalesContractUsingContractNumber  ***
****************************************************************/
methods.searchSalesContractUsingContractNumber = async function (req, res) {

    const data = await Sales.findOne({ $or: [
        { contractNumber: req.query.contractNo }
      ]})
      .populate('variance commodityId gradeId brokerId documents equipmentId paymentMethod paymentTerms pricingTerms tagType tradeRules loadingPortId buyerId createdBy')
      .populate({
          path: 'freightCompanyId',
          populate: {
              path: 'freightCompanyId',
          }
      })
      .lean();

    return SendResponse(res, { data, userMessage: 'sales contract details.' });
};/*-----  End of searchSalesContractUsingContractNumber  ------*/

/****************************************************************
***   searchPurchase  ***
****************************************************************/
methods.searchSalesContract = async function(req, res) {
    const {data, query} = await methods.getSearchSalesContract(req, res);

    if (data && req.body.getSum && req.body.commodityId) {
        data.qtySum = await getTotals(query, req.body.cropYear);
    }

    return SendResponse(res, { data, userMessage: 'purchaseList.' });
};/*-----  End of searchPurchase  ------*/

methods.getSearchSalesContract = async (req ) => {
    var query = { $and: [] };
    if (req.body.status && req.body.status != 'undefined') {
        query.$and.push({ status: req.body.status });
    }
    if (req.body.signed) {
      query.$and.push({contractIsSigned: req.body.signed === "1"});
    }
    if (req.body.commodityId) {
        query.$and.push({ commodityId: req.body.commodityId });
    }
    if (req.body.gradeId) {
        query.$and.push({ gradeId: req.body.gradeId });
    }
    if (req.body.brokerId) {
        query.$and.push({ brokerId: req.body.brokerId });
    }
    if (req.body.contractNumber) {
        query.$and.push({$or: [
          { contractNumber: req.body.contractNumber },
          { rolloverCN: req.body.contractNumber },
          { originalCN: req.body.contractNumber },
        ]});
    }
    if (req.body.cropYear) {
        query.$and.push({ cropYear: req.body.cropYear });
    }
    if (req.body.fromDate || req.body.toDate) {
        if (req.body.fromDate && req.body.toDate) {
            query.$and.push({
                date: {
                    $gte: req.body.fromDate,
                    $lte: req.body.toDate
                }
            });
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
            query.$and.push({ 'shipmentScheldule': { $elemMatch: { startDate: { $gte: req.body.shippingStartDate } } } });
        } else {
            query.$and.push({
                'shipmentScheldule': {
                    $elemMatch: { endDate: { $lte: req.body.shippingEndDate } }
                }
            });
        }
    }
    if (req.body.type) {
        if (req.body.type == 'Signed') {
            query.$and.push({ contractIsSigned: true });
        } else {
            query.$and.push({
                $or: [
                    { contractIsSigned: false },
                    { contractIsSigned: { $exists: false } }
                ]
            });
        }
    }

    if (req.body.name) {
        var condition = { businessName: { $regex: ".*" + req.body.name + ".*", $options: 'i' } };
        const buyerIds = await Buyer.find(condition);

        query.$and.push({ buyerId: { $in: buyerIds.map((val) => val._id) } });
    }

    if (query.$and.length == 0) delete query.$and;

    let count = Number(req.body.limit) || 10;
    if (req.count === '0') {
        count = await Sales.count(query);
    }

    return {
        data: await Sales.paginate(query, {
            page: Number(req.body.page) || 1,
            limit: count,
            populate: [
                { path: 'variance commodityId gradeId brokerId documents equipmentId paymentMethod paymentTerms pricingTerms tagType tradeRules loadingPortId buyerId createdBy freightCompanyId' },
                { path: 'scale tradeScale loadsheet scale_loadsheet', select: 'unloadWeidht void' },
            ],
            lean: true,
            sort: '-createdAt'
        }),
        query
    };
};

methods.getSalesContractReport = (req, res) => {
    const { cropYear: year, commodityId, inventoryGrade } = req.query;

    if (!commodityId) {
        return SendResponse(res, { userMessage: 'commodityId is required.' });
    }

    if (!year || year == 'undefined') {
        return SendResponse(res, { userMessage: 'cropYear is required.' });
    }

    var condition = { $and: [
        { commodityId: mongoose.Types.ObjectId(commodityId) },
        { cropYear: year }
    ] };

    if (inventoryGrade && inventoryGrade != 'undefined' && inventoryGrade != 'null') {
        condition.$and.push({'inventoryGrade': mongoose.Types.ObjectId(inventoryGrade)});
    }

    async.parallel({
        first: (cb) => {
            var aggregate = Sales.aggregate();

            if (req.query.commodityId) {
                aggregate.match(condition);
            }

            aggregate
                .lookup({ from: "buyers", localField: "buyerId", foreignField: "_id", as: "buyerId" })
                .unwind({ path: "$buyerId", preserveNullAndEmptyArrays: true })
                .lookup({
                  from: "scales",
                  let: { contractNumber: "$contractNumber" },
                  pipeline: [{
                      $match: {
                          $expr: {
                              $and: [
                                  { $ne: ["$void", true] },
                                  { $or: [
                                    { $eq: ["$contractNumber", "$$contractNumber"] },
                                    { $eq: ["$salesContractNumber", "$$contractNumber"] },
                                  ]},
                              ]
                          }
                      }
                  }, {
                      $project: { unloadWeidht: 1, void: 1 }
                  }],
                  as: "scale"
                })
                .lookup({ from: "tradepurchasescales", localField: "contractNumber", foreignField: "salesContractNumber", as: "tradeScales"})

            .project({
                "salesId": "$_id",
                "contractNumber": 1,
                "showContractNumber": {
                    $cond: {
                        if: {$ne: ["$cropYear", year]},
                        then: {$concat: ["$contractNumber", '-R']},
                        else: "$contractNumber"
                    }
                },
                "signee": 1,
                "commodityId": 1,
                "buyerId": 1,
                "brokerId": 1,
                "gradeId": 1,
                "brokerCommision": 1,
                "showBroker": 1,
                "cropYear": year,
                "countryId": 1,
                "packingUnit": 1,
                "tag": 1,
                "date": 1,
                "deliveryYear": { "$year": "$date" },
                "deliveryMonth": { "$month": "$date" },
                "tagType": 1,
                "contractQuantity": 1,
                "units": 1,
                "quantityLbs": {
                    $cond: {
                        if: { $in: ["$status", [0, 2]] },
                        then: "$quantityLbs",
                        else: {
                            $sum: [
                              {$reduce: {
                                  input: "$scale",
                                  initialValue: 0,
                                  in: { $sum: ["$$value", { "$multiply": ['$$this.unloadWeidht', 2.2046] }] }
                              }},
                              {$reduce: {
                                input: "$tradeScales",
                                initialValue: 0,
                                in: { $sum: ["$$value", { "$multiply": ['$$this.unloadWeidht', 2.2046] }] }
                              }},
                            ]
                        }
                    }
                },
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
                "createdAt": 1,
                "status": 1
            });
            aggregate.group({
                "_id": "$salesId",
                "list": {
                    "$push": {
                        "showContractNumber": "$showContractNumber",
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
                        "totalCWT": { "$divide": ["$quantityLbs", 100] },
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
                        "status": "$status"
                    }
                },
                "total": {
                    "$sum": {
                        $cond: {
                            if: { $in: ["$status", [0, 1]] },
                            then: { "$divide": ["$quantityLbs", 100] },
                            else: 0
                        }
                    }
                }
            }).exec((err, data) => {
                cb(err, data);
            });
        },
        second: (cb) => {
            var aggregate = CommodityAdjustments.aggregate();

            let query = { $and: _.clone(condition.$and) };
            query.$and.push({'purchaseSale': "sale" });
            aggregate.match(query)
            .project({
                "type": "CommodityAdjustments-1",
                "commodityAdjustmentId": "$_id",
                "contractName": "$reason",
                "contractNumber": "Adjustment",
                "commodityId": 1,
                "gradeId": 1,
                "cropYear": 1,
                "date": "$createdAt",
                "deliveryYear": { "$year": "$adjustmentDate" },
                "deliveryMonth": { "$month": "$adjustmentDate" },
                "quantityLbs": { "$multiply": ["$qtyCwt", 100] },
                "cwtQuantity": "$qtyCwt",
                "amount": 1,
                "createdBy": 1,
                "createdAt": 1,
                "qtyCwt": 1,
            });

            aggregate.group({
                "_id": "$commodityAdjustmentId",
                "list": {
                    "$push": {
                        "type": "$type",
                        "contractName": "$contractName",
                        "contractNumber": "$contractNumber",
                        "showContractNumber": "$contractNumber",
                        "commodityId": "$commodityId",
                        "gradeId": "$gradeId",
                        "cropYear": "$cropYear",
                        "date": "$date",
                        "deliveryYear": "$deliveryYear",
                        "deliveryMonth": "$deliveryMonth",
                        "quantityLbs": "$quantityLbs",
                        "totalCWT": "$qtyCwt",
                        "cwtQuantity": "$cwtQuantity",
                        "amount": "$amount",
                        "createdBy": "$createdBy",
                        "createdAt": "$createdAt"
                    }
                },
                "total": { "$sum": { "$divide": ["$quantityLbs", 100] } }
            }).exec((err, data) => {
                cb(err, data);
            });
        }
    }, (err, data) => {
        if (err) {
            return SendResponse(res, { error: true, status: 500, userMessage: 'some server error has occurred.'});
        } else {
            data = [...data.first, ...data.second];

            return SendResponse(res, { data, userMessage: 'contracts list.' });
        }
    });
};

methods.updateSalesStamp = async (req, res) => {
    req.checkBody('cropYear', 'Crop Year is required.').notEmpty();
    req.checkBody('contractNumber', 'contractNumber From is required.').notEmpty();
    req.checkBody('commodityId', 'commodity is required.').notEmpty();
    req.checkBody('_id', '_id is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }
    let sales = await Sales.findOne({ contractNumber: req.body.contractNumber, _id: { $ne: req.body._id } });

    if (sales) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Contract number already exist.' });
    }

    delete req.body.shipmentScheldule;
    delete req.body.date;

    sales = await Sales
        .findByIdAndUpdate(req.body._id, req.body, {new: true})
        .populate('certificateAnalysis','certificateName')
        .populate('packingUnit','name')
        .populate({
            path: 'freightCompanyId',
            populate: [
                { path: 'freightCompanyId', model: 'freightCompany' },
                { path: 'shiplineId', model: 'shipLine' }
            ]
        })
        .populate('loadingPortId')
        .populate('equipmentId')
        .lean();

    generatePdf.generatePDF('salesStamp', sales, async function(err, pdfUrl) {
        if (err) {
            console.log("err in generate pdf"+err);
        }
        await Sales.findByIdAndUpdate(req.body._id, { $set: { stampPdfUrl: pdfUrl }});

        return SendResponse(res, { userMessage: 'Sales stamp updated successfully.' });
    });
};

const bagInventoryEntryType = 'projected';
async function manageBagInventory(sales, isNew) {
  if (!isNew) {
    await BagInventory.remove({entryType: bagInventoryEntryType, 'meta.contractId': sales._id});
  }

  if (sales.status === 2) {
    return;
  }

  let bagInventories = [];
  const palletExists = sales.loadingType === 'Palletized and Shrink Wrapped' && sales.palletUnit && sales.contractQuantity > 0;
  const bag = await Bag.findOne({_id: sales.packingUnit._id}).lean();
  const pallet = await Bag.findOne({_id: sales.palletUnit}).lean();
  sales.shipmentScheldule.forEach((shipment, index) => {
    let ratio = shipment.quantity * shipment.units / sales.contractQuantity;
    bagInventories.push({
      bagId: sales.packingUnit._id,
      bagCategoryId: bag ? bag.category : null,
      noOfBags: -Math.ceil(sales.noOfBags * ratio) || 0,
      reason: `ContractNumber: ${sales.contractNumber}`,
      date: shipment.startDate,
      meta: {
        contractNumber: sales.contractNumber,
        contractId: sales._id,
        toDate: shipment.endDate,
        shipment: index + 1,
      },
      entryType: bagInventoryEntryType,
    });

    if (palletExists) {
      bagInventories.push({
        bagId: sales.palletUnit,
        bagCategoryId: pallet ? pallet.category : null,
        noOfBags: -Math.ceil(sales.noOfPallets * ratio) || 0,
        reason: `ContractNumber: ${sales.contractNumber}, for pallets`,
        date: shipment.startDate,
        meta: {
          contractNumber: sales.contractNumber,
          contractId: sales._id,
          toDate: shipment.endDate,
          shipment: index + 1,
          pallet: true,
        },
        entryType: bagInventoryEntryType,
      });
    }
  });

  if (bagInventories.length) {
    await BagInventory.insertMany(bagInventories);
  }
}

/****************************************************************
***   addSalesContract  ***
****************************************************************/
methods.addSalesContract = async function(req, res) {

    req.checkBody('cropYear', 'Crop Year is required.').notEmpty();
    req.checkBody('contractNumber', 'contractNumber From is required.').notEmpty();
    req.checkBody('commodityId', 'commodity is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    if (req.body._id) {

        let sales = await Sales.findOne({ contractNumber: req.body.contractNumber, _id: { $ne: req.body._id } });
        if (sales) {
            return SendResponse(res, { error: true, errors: null, userMessage: 'Contract number already exist.' });
        }

        if (!req.body.inventoryGrade) {
            delete req.body.inventoryGrade;
        }

        req.body.salesStampGenerated = false;

        if (req.body.someFieldValueChanged) {
            var amended = 'amended' in req.body;
            req.body.amendedBy = req.admin._id;
            req.body.amended = amended == false ? false : true;
            req.body.amendedDate = new Date();
        }

        req.body.contractSignature = req.body.contractSignature ? req.body.contractSignature : 1;
        delete req.body.date;

        sales = await Sales.findByIdAndUpdate(req.body._id, req.body).lean();

        let data = await Sales.findById(sales._id)
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

        await manageBagInventory(data, false);

        const updatedSales = await generateSalesPDF(data, req.admin._id, req.body.someFieldValueChanged);

        return SendResponse(res, {
          userMessage: 'contract update successfully.',
          data: {
              buyerId : updatedSales.buyerId._id,
              contractNumber : updatedSales.contractNumber
          }
      });
    }

    let sales = await Sales.findOne({ contractNumber: req.body.contractNumber });
    if (sales) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Contract number already exist.' });
    }

    req.body.createdBy = req.admin._id;

    req.body.contractSignature = req.body.contractSignature ? req.body.contractSignature : 1;

    req.body.date = moment();

    sales = await (new Sales(req.body)).save();

    let success = await Sales.findById(sales._id)
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

    await manageBagInventory(success, true);

    const updatedSales = await generateSalesPDF(success, req.admin._id);

    return SendResponse(res, {
      userMessage: 'Sales contract added successfully.',
      data: { buyerId : updatedSales.buyerId._id, contractNumber : updatedSales.contractNumber  }
  });
};/*-----  End of addSalesContract  ------*/

async function generateSalesPDF(sales, admin_id, hasChanges = true) {
  let salesData = sales;
  if (typeof sales === 'string') {
    salesData = await Sales.findById(sales)
      .populate({ path: 'buyerId', select: 'businessName addresses cellNumber phone' })
      .populate({ path: 'brokerId', select: 'businessName' })
      .populate({ path: 'commodityId', select: 'commodityAlias commodityName' })
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
  }

  const pdfUrl = await generatePdf.generatePDF('sales', salesData);

  const updatedSales = await Sales.findByIdAndUpdate(salesData._id,
      {
          $set: { pdfUrl: pdfUrl },
          $push: { allPDF: { date: new Date(), pdfUrl: pdfUrl, updatedBy: admin_id } }
      },
      { new: true, lean: true }
  );

  if (hasChanges) {
    updatedSales.salesContractId = updatedSales._id;
    updatedSales.createdBy = admin_id;
    delete updatedSales._id;
    delete updatedSales.createdAt;
    delete updatedSales.updatedAt;

    await (new salesContractHistory(updatedSales)).save();
  }

  return salesData;
}

/****************************************************************
***   getSalesContract  ***
****************************************************************/
methods.getSalesContract = async function(req, res) {
    //Database functions here
    var sales;
    if (req.query.brokerId) {
        sales = await Sales.find({ brokerId: req.query.brokerId })
            .populate('variance commodityId gradeId brokerId documents equipmentId paymentMethod paymentTerms pricingTerms tagType tradeRules loadingPortId buyerId createdBy freightCompanyId')
            .populate('mailSentBy', 'fullName')
            .lean()
            .sort('-createdAt');
    } else if (req.query.buyerId) {
        sales = await Sales.find({ buyerId: req.query.buyerId })
            .populate('variance commodityId gradeId brokerId documents equipmentId paymentMethod paymentTerms pricingTerms tagType tradeRules loadingPortId buyerId createdBy freightCompanyId')
            .populate('mailSentBy', 'fullName')
            .lean()
            .sort('-date');
    } else {
        let condition = { status: Number(req.query.status) || 0 };
        sales = await Sales.paginate(condition, {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                populate: [
                    { path: 'variance commodityId gradeId brokerId documents equipmentId paymentMethod paymentTerms pricingTerms tagType tradeRules loadingPortId buyerId createdBy freightCompanyId' },
                    { path: 'scale scale_loadsheet', select: 'unloadWeidht void' }
                ],
                lean: true,
                sort: '-createdAt'
            });
        if (sales && req.query.getSum) {
            sales.qtySum = await getTotals(condition);
        }
    }

    return SendResponse(res, { data: sales, userMessage: 'sales list.' });
};/*-----  End of getSalesContract  ------*/

async function getTotals(condition) {
    let scaleTotal = {
        $reduce: {
            input: "$scales",
            initialValue: 0,
            in: { $sum: ["$$value", { "$multiply": ['$$this.unloadWeidht', 2.2046] }] }
        }
    };

    let data = await Sales.aggregate([
        {$match: condition},
        {$lookup: {
                from: "scales",
                let: { contractNumber: "$contractNumber" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{ $ne: ["$void", true] }, { $eq: ["$contractNumber", "$$contractNumber"] }]
                        }
                    }
                }, {
                    $project: { unloadWeidht: 1, void:1 }
                }],
                as: "scales"
            }
        },
        {$project: {
                _id: 1,
                quantityLbs: 1,
                netFOBCAD: 1,
                scaleTotal: scaleTotal
            }
        },
        {$project: {
                _id: 1,
                quantityLbs: 1,
                netFOBnQuantity: {$multiply: ['$quantityLbs', '$netFOBCAD']},
                scaleTotal: 1,
                outstandingTotal: {
                    $cond: {
                        if: {$gt: ['$quantityLbs', '$scaleTotal']},
                        then: {$subtract: ['$quantityLbs', '$scaleTotal']},
                        else: 0
                    }
                }
            }
        },
        {$group: {
            _id: null,
            netFOBnQuantity: {$push: '$netFOBnQuantity'},
            contractedQty: {$sum: '$quantityLbs'},
            deliveredQty: {$sum: '$scaleTotal'},
            outstandingQty: {$sum: '$outstandingTotal'},
        }},
        {$project: {
            contractedQty: 1,
            deliveredQty: 1,
            outstandingQty: 1,
            weightedAvg: {
                $divide: [{
                    $reduce: {
                        input: '$netFOBnQuantity',
                        initialValue: 0,
                        in: {$sum: ['$$value', '$$this']}
                    }
                }, '$contractedQty']
            }
        }}
    ]);
    return data;
}

/***************************************************************
***   getSalesContractCount  ***
***************************************************************/
methods.getSalesContractCount = async function (req, res) {

    req.check('commodityId', 'commodityId is required.').notEmpty();
    req.check('cropYear', 'cropYear is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    let query = { commodityId: req.query.commodityId, cropYear: req.query.cropYear };

    let data = await Sales.findOne(query).sort('-contractNumber').limit(1);

    return SendResponse(res, { data, userMessage: 'count.' });
};/*-----  End of getSalesContractCount  ------*/

/****************************************************************
***   getSalesContractByContractNo  ***
****************************************************************/
methods.getSalesContractByContractNo = async function (req, res) {

    var query;
    if (req.params.contractNo && req.query.buyerId) {
        query = { contractNumber: req.params.contractNo, buyerId: req.query.buyerId };
    } else {
        query = { status: 0, contractNumber: req.params.contractNo };
    }

    if (req.params.contractNo) {
        query = { contractNumber: req.params.contractNo };
    }

    let sales = await Sales.findOne(query)
        .populate({
            path: 'freightCompanyId',
            populate: [
                { path: 'freightCompanyId', model: 'freightCompany' },
                { path: 'shiplineId', model: 'shipLine' }
            ]
        })
        .populate('variance brokerId signee methodOfShipment commodityId certificateAnalysis gradeId buyerId equipmentType brokerId documents equipmentId paymentMethod paymentTerms pricingTerms tagType tradeRules loadingPortId packingUnit createdBy')
        .lean();

    if (!sales) {
        return SendResponse(res, {
            status: 400,
            userMessage: 'The server has not found anything matching the ' + req.params.contractNo + ' given.'
        });
    }

    if (sales.status == 2) {
        return SendResponse(res, {
            status: 404,
            userMessage: 'This contract has been voided, Please activate to make any change.'
        });
    }
    return SendResponse(res, { data: sales, userMessage: 'Sales list.' });

};/*-----  End of getSalesContractByContractNo  ------*/

/****************************************************************
***   deleteSalesContract  ***
****************************************************************/
methods.deleteSalesContract = async function(req, res) {
    const data = await Sales.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 2 } },
        { multi: true }
    );

    return SendResponse(res, { data, userMessage: 'Contract deleted successfully.' });

};/*-----  End of deleteSalesContract  ------*/

methods.updateSalesContractStatus = async (req, res) => {
    let sales = await Sales.findByIdAndUpdate(
        { _id: req.body._id },
        { $set: {
            status: req.body.status,
            statusBy: req.admin._id,
            statusAt: Date.now()
        }},
        { new: true, lean: true }
    );

    if (sales) {
        await manageBagInventory(sales, false);

        const updatedSales = await generateSalesPDF(sales._id.toString(), req.admin._id);

        return SendResponse(res, {
          userMessage: 'Status updated successfully.',
          data: updatedSales
        });
    }
    return SendResponse(res, { userMessage: 'Something went wrong.', status: 400 });
};

const getContractSalesPriceCWT = function(report) {
    report.contractSalesPriceCWT = report.amount/(report.amountUnit == 'MT' ? 22.0462 : 1);
    return report.contractSalesPriceCWT;
};

const getContractSalesPriceCWTCAD = function(report) {
    report.contractSalesPriceCWTCAD = (report.contractCurrency == 'USD' ? report.exchangeRate : 1) * report.contractSalesPriceCWT;
    return report.contractSalesPriceCWTCAD;
};

const commissionType = function(cType) {
    switch (cType) {
        case "$":
            return "$/CWT";
        case "%":
            return "%";
        case "$pmt":
            return "$/MT";
        default:
            return "";
    }
};

const getTotalCost = function(report) {
    report.totalCost = (
        ((report.brokerCommision ? parseFloat(report.brokerCommision) : 0) + report.oceanFreightCWT +
        report.blFeeCWT + report.documentCostingCWT + report.lcCostCWT + report.ariPolicyCWT +
        report.insuranceRate) * report.exchangeRate + report.interestRateCWT +
        report.stuffingCWT + report.bagCostCWT + report.inlandFrtStuffingBuffer +
        (report.certificateAnalysis ? report.certificateAnalysis.cost : 0) + report.missCostCWT1 + report.missCostCWT2 +
        report.missCostCWT3
    );
    return report.totalCost;
};

const generateExcelOSSR = async () => {
    let condition = { status: { $in: [0] } };

    let count = await Sales.count(condition);

    let salesData = await Sales.find(condition, null, {
        select: 'pdfUrl blFeeCWT ariPolicyCWT remainingUSDAmount interestRateCWT pricingTerms netFOBCAD contractNumber createdAt buyerId commodityId quantityLbs destination amount amountUnit contractCurrency cadCWT brokerCommision commissionType oceanFreightCWT documentCostingCWT lcCostCWT insuranceRate exchangeRate stuffingCWT inlandFrtStuffingBuffer bagCostCWT certificateAnalysis missCostCWT1 missCostCWT2 missCostCWT3 coaCost',
        limit: count,
        populate: [
            { path: 'commodityId', select: 'commodityName' },
            { path: 'buyerId', select: 'businessName' },
            { path: 'scale', select: 'unloadWeidht netWeight void' },
            { path: 'certificateAnalysis', select: 'certificateName cost' },
            { path: 'pricingTerms', select: 'pricingTerms' },
        ],
        lean: true,
        sort: '-createdAt'
    });
    let jsonSD = salesData.map(report => {
        let shippedQty = getShippedQuantityLbs(report.scale);
        return {
            'Contract': report.contractNumber,
            'Date': moment(report.createdAt).format('YYYY-MM-DD'),
            'Customer': report.buyerId ? report.buyerId.businessName : '',
            'Remaining USD Amount': report.remainingUSDAmount,
            'Total Contract Qt': report.quantityLbs ? Number(report.quantityLbs).toFixed(2) : 0,
            'Shipped QTY': shippedQty.toFixed(0),
            'Balance to ship': (report.quantityLbs - shippedQty).toFixed(0),
            'Contract Terms': report.pricingTerms && report.pricingTerms.pricingTerms,
            'Destination': report.destination,
            'Contract Sales Price': report.amount ? Number(report.amount).toFixed(2) : 0,
            'Price Per': report.amountUnit,
            'Currency': report.contractCurrency,
            'Contract Sales(CWT)': Number(getContractSalesPriceCWT(report)).toFixed(4),
            'CAD Contract Sales(CWT)': Number(getContractSalesPriceCWTCAD(report)).toFixed(4),
            'NetFOB': report.netFOBCAD ? Number(report.netFOBCAD).toFixed(4) : 0,
            'Broker Comm': report.brokerCommision ? (Number(report.brokerCommision).toFixed(4) + commissionType(report.commissionType)) : 0,
            'Ocean Freight (CWT)': report.oceanFreightCWT ? Number(report.oceanFreightCWT).toFixed(4) : 0,
            'BL Fee (CWT)': Number(report.blFeeCWT).toFixed(4),
            'Docs Fee (CWT)': report.documentCostingCWT ? Number(report.documentCostingCWT).toFixed(4) : 0,
            'LC Costing (CWT)': report.lcCostCWT ? Number(report.lcCostCWT).toFixed(4) : 0,
            'Insurance Rate (CWT)': report.insuranceRate ? Number(report.insuranceRate).toFixed(4) : 0,
            'ARI/CWT': Number(report.ariPolicyCWT).toFixed(4),
            'Exchange Rate': report.exchangeRate ? Number(report.exchangeRate).toFixed(4) : 0,
            'Interest Rate (CWT)': report.interestRateCWT ? Number(report.interestRateCWT).toFixed(4) : 0,
            'Stuffing': report.stuffingCWT ? Number(report.stuffingCWT).toFixed(4) : 0,
            'Inland Freight': report.inlandFrtStuffingBuffer ? Number(report.inlandFrtStuffingBuffer).toFixed(4) : 0,
            'Bag Cost': report.bagCostCWT ? Number(report.bagCostCWT).toFixed(4) : 0,
            'Cert/Analysis cost': report.certificateAnalysis ? report.certificateAnalysis.cost : '',
            'Misc 1': report.missCostCWT1 ? report.missCostCWT1.toFixed(4) : 0,
            'Misc 2': report.missCostCWT2 ? report.missCostCWT2.toFixed(4) : 0,
            'Misc 3': report.missCostCWT3 ? report.missCostCWT3.toFixed(4) : 0,
            'Total Cost': getTotalCost(report).toFixed(4),
            'CAD/CWT': (report.contractSalesPriceCWTCAD - report.totalCost).toFixed(4),
            'CAD NET/CWT': ''
        };
    });

    generateExcel.generate('OpenContractSalesReport', jsonSD, async function (err, reportUrl) {
        if (!err) {
            await (new Archive({
                reportUrl,
                reportDate: moment().add(-1, 'day'),
                reportName: 'OpenContractSalesExcel',
                entityName: 'OpenContractSales',
            })).save();
        }
    });
};

methods.outstandingSalesReport = async (req, res) => {
    var condition = { status: { $in: [0] } };

    if (req.query.contractNumber && req.query.contractNumber != 'undefined' && req.query.contractNumber != 'null') {
        condition.contractNumber = req.query.contractNumber;
    } else {
        if (req.query.commodityId && req.query.commodityId != 'undefined' && req.query.commodityId != 'null') {
            condition.commodityId = req.query.commodityId;
        }
        if (req.query.cropYear && req.query.cropYear != 'undefined' && req.query.cropYear != 'null') {
            condition.cropYear = req.query.cropYear;
        }
    }

    if (req.query.fromDate && req.query.toDate && req.query.fromDate != 'undefined' && req.query.toDate != 'undefined') {
        condition.date = {$gte: req.query.fromDate, $lte: req.query.toDate};
    } else if (req.query.fromDate && req.query.fromDate != 'undefined') {
        condition.date = {$gte: req.query.fromDate};
    } else if (req.query.toDate && req.query.toDate != 'undefined') {
        condition.date = {$lte: req.query.toDate};
    }

    let count = await Sales.count(condition);

    let data = await Sales.paginate(condition, {
        select: 'pdfUrl blFeeCWT ariPolicyCWT remainingUSDAmount interestRateCWT pricingTerms netFOBCAD '
          +'contractNumber createdAt buyerId commodityId quantityLbs destination amount amountUnit contractCurrency '
          +'cadCWT brokerCommision commissionType oceanFreightCWT documentCostingCWT lcCostCWT insuranceRate '
          +'exchangeRate stuffingCWT inlandFrtStuffingBuffer bagCostCWT certificateAnalysis missCostCWT1 missCostCWT2 missCostCWT3 coaCost',
        page: 1,
        limit: count,
        populate: [
            { path: 'commodityId', select: 'commodityName' },
            { path: 'buyerId', select: 'businessName' },
            { path: 'scale', select: 'unloadWeidht netWeight void' },
            { path: 'certificateAnalysis', select: 'certificateName cost' },
            { path: 'pricingTerms', select: 'pricingTerms' },
        ],
        lean: true,
        sort: '-createdAt'
    });

    return SendResponse(res, { data, userMessage: 'list.' });
};

methods.updateOutstandingSalesReport = async (req, res) => {
    req.check('_id', 'Id is required.').notEmpty();
    req.check('remainingUSDAmount', 'Remaining USD amount is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    let data = await Sales.findByIdAndUpdate(req.body._id, {$set: {remainingUSDAmount: req.body.remainingUSDAmount}}, {new: true});

    if (data) {
        return SendResponse(res, {data, userMessage: 'report updated successfully.'});
    }
    return SendResponse(res, { status: 400, error: true, userMessage: 'Id for which request was made, not found.' });
};

methods.salesContractListByUser = async (req, res) => {

    var condition = { $and: [{ createdBy: req.query.adminId }] };

    if ((req.query.fromDate && req.query.fromDate != 'undefined') || (req.query.toDate && req.query.toDate != 'undefined')) {
        if (req.query.fromDate && req.query.toDate && req.query.fromDate != 'undefined' && req.query.toDate != 'undefined') {
            condition.$and.push({ createdAt: { $gte: req.query.fromDate, $lte: req.query.toDate } });
        } else if (req.query.fromDate && req.query.fromDate != 'undefined') {
            condition.$and.push({ createdAt: { $gte: req.query.fromDate } });
        } else if (req.query.toDate && req.query.toDate != 'undefined') {
            condition.$and.push({ createdAt: { $lte: req.query.toDate } });
        }
    }

    let data = await Sales.paginate(condition, {
        select: 'contractNumber createdAt buyerId pdfUrl',
        page: req.query.page || 1,
        limit: 5,
        populate: { path: 'buyerId', select: 'businessName' },
        lean: true,
        sort: '-createdAt'
    });

    return SendResponse(res, { data, userMessage: 'list.' });
};

methods.salesHistory = async (req, res) => {
    let data = await salesContractHistory.find({ contractNumber: req.query.contractNumber })
        .sort('createdAt')
        .populate('buyerId', 'businessName')
        .populate('commodityId', 'commodityName')
        .populate('gradeId', 'gradeName')
        .populate('brokerId', 'businessName')
        .populate('inventoryGrade', 'gradeName')
        .populate('tagType', 'tags')
        .populate('packingUnit', 'name')
        .populate('loadingPortId', 'loadingPortName')
        .populate('equipmentType', 'equipmentName')
        .populate('variance', 'varianceName')
        .populate('certificateAnalysis', 'certificateName')
        .populate('equipmentId', 'equipmentName')
        .populate({
          path: 'freightCompanyId',
          select: 'freightCompanyId',
          populate: { path: 'freightCompanyId', select: 'freightCompanyName'}
        })
        .populate('pricingTerms', 'pricingTerms')
        .populate('paymentMethod', 'paymentMethod')
        .populate('tradeRules', 'tradeRules')
        .populate('paymentTerms', 'paymentTerms')
        .populate('createdBy', 'fullName')
        .populate('documents', 'documents');

    return SendResponse(res, { data, userMessage: 'list.' });
};

methods.canCreateRollover = async (req, res, next) => {
    let sales = await Sales.findById(req.body.contract_id).lean();

    if (!sales) {
        return SendResponse(res, {
            error: true,
            status: 404,
            userMessage: "Sales contract is not found."
        });
    }
    // Sales contract is not active
    if (sales.status != 0) {
        return SendResponse(res, {
            error: true,
            status: 400,
            userMessage: "Sales contract is not in active state so can't be rolled over."
        });
    }

    const salesCropYear = CropYear.makeCropYear(sales.cropYear);

    // contract rollover is already defined or not eligible for new rollover
    if (sales.rolloverCN || moment().isBetween(salesCropYear.start, salesCropYear.end)) {
        return SendResponse(res, {
            error: true,
            status: 400,
            userMessage: "Sales contract is not eligible for rollover."
        });
    }

    const scaleCounts = await Scale.aggregate([
        { $match: { contractNumber: sales.contractNumber,  void: { $ne: true } }, },
        { $group: { _id: "$contractNumber", total: { $sum: "$unloadWeidht" } }  }
    ]);

    let totalScaleWeight = (scaleCounts && scaleCounts.length > 0) ? scaleCounts[0].total : 0;

    // over delivered purchase confirmation
    if (totalScaleWeight * 2.20462 >= sales.quantityLbs) {
        return SendResponse(res, {
            status: 400,
            error: true,
            userMessage: "Quantity more than contracted has already been shipped."
        });
    }

    req.sales = sales;
    req.scaleTotal = totalScaleWeight;

    next();
};

methods.salesContractRollover = async (req, res) => {
    req.checkBody('inventoryGrade', 'Inventory grade is required.').notEmpty();
    req.checkBody('quantityLbs', 'Inventory grade is required.').notEmpty();
    req.checkBody('deliveryDateFrom', 'Delivery Date From is required.').notEmpty();
    req.checkBody('deliveryDateTo', 'Delivery Date To is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    if (req.body.quantityLbs <= 0) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Contract quantity can not be negative or zero.'});
    }

    let { sales, scaleTotal, admin, rolloverContract } = req;
    let currentCropYear = CropYear.currentCropYear();

    if (!sales.rolloverCN) {
      let commodity = await Commodity.findById(sales.commodityId);
      let convertOption = {commodityWeight: (commodity && commodity.commodityWeight)};
      let contractQuantity = convert('lbs')(sales.units, req.body.quantityLbs, convertOption);

      const bag = await Bag.findOne({_id: sales.packingUnit}).lean();
      let packedIn = sales.packedIn;
      if (bag) {
        let weightPerBag = convert(bag.bagWeightUnit)('lbs', bag.bagWeight, convertOption);
        let weightPerContainer = weightPerBag * sales.noOfBags;
        packedIn = Math.ceil( req.body.quantityLbs / weightPerContainer);
      }

      const rolloverCN = `${sales.contractNumber}-R`;
      const rolloverSalesData = _.assign({}, sales, {
        contractNumber: rolloverCN,
        originalCN: sales.contractNumber,
        quantityLbs: req.body.quantityLbs,
        inventoryGrade: req.body.inventoryGrade,
        deliveryDateFrom: req.body.deliveryDateFrom,
        deliveryDateTo: req.body.deliveryDateTo,
        cropYear: currentCropYear.cropYear,
        packedIn: packedIn,
        createdBy: admin._id,
        createdAt: Date.now(),
        delQty: 0,
        note: req.body.note,
        pdfUrl: null,
        allPDF: [],
        contractQuantity,
      });
      delete rolloverSalesData._id;

      let scheduleObj = {
        startDate: currentCropYear.start.split('T')[0],
        endDate: currentCropYear.end.split('T')[0],
        quantity: contractQuantity,
        units: packedIn,
      };
      rolloverSalesData.shipmentScheldule = [{...rolloverSalesData.shipmentScheldule[0], ...scheduleObj}];

      rolloverContract = await (new Sales(rolloverSalesData)).save();

      sales = await Sales.findByIdAndUpdate(
        { _id: sales._id },
        { $set: {
          rolloverCN,
          status: 1,
          statusBy:
          admin._id,
          statusAt:
          Date.now(),
          shippingQtyLbs: scaleTotal,
          delQty: scaleTotal
        } },
        { new: true }
      );
    }

    await generateSalesPDF(rolloverContract._id.toString(), req.admin._id);

    return SendResponse(res, {
        data: sales,
        rolloverContract,
        userMessage: "Rollover created."
    });
};

methods.getRolloverList = async (req, res) => {
    const currentCropYear = CropYear.currentCropYear();
    const cropYearsToConsider = [];
    for(let i = 1; i < 5; i++) {
      cropYearsToConsider.push((currentCropYear.cropYear - i).toString());
    }

    var condition = {
        $and: [
            { status: 0 },
            { cropYear: {$in: cropYearsToConsider}},
            { $or: [
              {rolloverCN: {$exists: false}},
              {rolloverCN: {$type: 'null'}},
              {rolloverCN: ''},
            ]}
        ]
    };

    const requestedFilters = Object.keys(req.query);
    const acceptedFilters = ["contractNumber", "commodityId"];

    const filters = acceptedFilters.filter(filter => requestedFilters.includes(filter) && req.query[filter] );
    let filterValue = '';
    filters.forEach(filter => {
        filterValue = filter.endsWith('Id') ? new mongoose.Types.ObjectId(req.query[filter]) : req.query[filter];
        condition.$and.push({
            [filter]: filterValue
        });
    });

    let data = await Sales
        .aggregate([
            { "$match": condition },
            {
                "$lookup": {
                    "from": "scales",
                    "let": { "contractNumber": "$contractNumber" },
                    "pipeline": [{
                        "$match": {
                            "$expr": {
                                "$and": [
                                    { "$ne": ["$void", true] },
                                    { "$eq": ["$contractNumber", "$$contractNumber"] }
                                ]
                            }
                        }
                    }, {
                        "$project": { "unloadWeidht": 1, "void": 1 }
                    }],
                    "as": "scale"
                }
            },
            {
                "$project": {
                    "delQty": { "$multiply": [{ "$sum": "$scale.unloadWeidht" }, 2.20462]},
                    "CWTDel": 1,
                    "commodityId": 1,
                    "contractNumber": 1,
                    "cropYear": 1,
                    "gradeId": 1,
                    "buyerId": 1,
                    "quantityLbs": 1
                }
            },
            {
                "$match": {
                    "$expr": {
                        "$and": [
                            { "$lt": ["$delQty", "$quantityLbs"]}
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    "from": "buyers",
                    "localField": "buyerId",
                    "foreignField": "_id",
                    "as": "buyerId"
                }
            },
            { "$unwind": { "path": "$buyerId", "preserveNullAndEmptyArrays": true } },
            {
                "$lookup": {
                    "from": "commodities",
                    "localField": "commodityId",
                    "foreignField": "_id",
                    "as": "commodityId"
                }
            },
            { "$unwind": { "path": "$commodityId", "preserveNullAndEmptyArrays": true } },
            {
                "$lookup": {
                    "from": "grades",
                    "localField": "gradeId",
                    "foreignField": "_id",
                    "as": "gradeId"
                }
            },
            { "$unwind": { "path": "$gradeId", "preserveNullAndEmptyArrays": true } }
        ]);

    return SendResponse(res, {
        userMessage: 'Rollover list.', data
    });
};

module.exports.generateOpenContractSalesExcel = generateExcelOSSR;
