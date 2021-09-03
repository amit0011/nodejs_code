var mongoose = require('mongoose');
var moment = require('moment');
var session = require('@ag-libs/session');
var Confirmation = mongoose.model('purchaseConfirmation');
var Contract = mongoose.model('productionContract');
var Grower = mongoose.model('grower');
var Commodity = mongoose.model('commodity');
var purchaseConfirmationHistory = mongoose.model('purchaseConfirmationHistory');
var generatePdf = require('@ag-libs/generatePdf');
var CropYear = require("@ag-libs/cropYear");
var TradePurchase = mongoose.model('tradePurchase');
var Scale = mongoose.model('scale');
const _ = require('lodash');
const { SendResponse } = require("@ag-common");

var async = require("async");

var multer = require('multer');
var multerS3 = require('multer-s3');
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

module.exports.controller = function(router) {

    router
        .route('/purchase/confirmation')
        .post(session.adminCheckToken, methods.checkContractWithNoActiveScaleTickets, methods.addPurchaseConfirmation)
        .get(session.adminCheckToken, methods.getPurchaseConfirmation);

    router
        .route('/purchase/count')
        .get(session.adminCheckToken, methods.getPurchaseConfirmationCount);

    router
        .route('/purchase/:contractNo/confirmation')
        .get(session.adminCheckToken, methods.getPurchaseConfirmationByContractNo);

    router
        .route('/purchase')
        .post(session.adminCheckToken, methods.purchaseReport);

    router
        .route('/search/purchase')
        .post(session.adminCheckToken, methods.searchPurchase);

    router
        .route('/purchase/uploadPdf')
        .put(methods.uploadPdf);

    router
        .route('/purchase/removeSignedContract')
        .put(session.adminCheckToken, methods.removeSignedContract);


    router
        .route('/purchase/getLatestPurchaseConfirmationContract')
        .get(session.adminCheckToken, methods.getLatestPurchaseConfirmationContract);

    router
        .route('/purchase/outstandingPurchaseReport')
        .get(session.adminCheckToken, methods.outstandingPurchaseReport);

    router
        .route('/purchase/purchaseConfirmationListByUser')
        .get(session.adminCheckToken, methods.purchaseConfirmationListByUser);

    router
        .route('/purchase/purchaseConfirmationListByGrower')
        .get(session.adminCheckToken, methods.purchaseConfirmationListByGrower);

    router
        .route('/purchase/rollover')
        .get(session.adminCheckToken, methods.getRolloverList)
        .post(session.adminCheckToken, methods.canCreateRollover, methods.purchaseContractRollover);

    router
        .route('/purchase/purchaseConfirmtaionHistory')
        .get(session.adminCheckToken, methods.purchaseConfirmtaionHistory);

    router
        .route('/purchase/usdPurchases')
        .get(session.adminCheckToken, methods.usdPurchases);

    router
        .route('/purchase/usdPurchasesContracts')
        .get(session.adminCheckToken, methods.usdPurchasesContracts);

};

methods.purchaseConfirmtaionHistory = async (req, res) => {
    let data = await purchaseConfirmationHistory.find({ contractNumber: req.query.contractNumber })
        .sort('createdAt')
        .populate('growerId', 'firstName lastName farmName')
        .populate('commodityId', 'commodityName')
        .populate('gradeId', 'gradeName')
        .populate('inventoryGrade', 'gradeName')
        .populate('createdBy', 'fullName')
        .populate('brokerId', 'firstName lastName');

    return SendResponse(res, { data, userMessage: 'list.' });
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
                error: true,
                status: 500,
                errors: err,
                userMessage: "uploadfile error"
            });
        } else {
            var urlParams = {
                Bucket: process.env.S3_BUCKET,
                Key: fileName
            };
            var s3 = new AWS.S3();
            // get uploaded pdf url
            s3.getSignedUrl('getObject', urlParams, async function(err, url) {
                let data = {[req.body.field]: url.split("?")[0]};
                if (req.body.field === 'signedContractPdf') {
                  data.contractIsSigned = true;
                }

                const contract = await Confirmation.findByIdAndUpdate(req.query.contractId, { $set: data }, {new: true}).populate([{
                    path: 'scale',
                    match: { ticketType: { $ne: 'Outgoing' } },
                    select: 'unloadWeidht ticketType netWeight void'
                  }, {
                      path: 'commodityId',
                      select: 'commodityName'
                  }, {
                      path: 'growerId',
                      select: 'firstName lastName farmName cellNumber addresses'
                  }, {
                    path: 'gradeId',
                    select: 'gradeName'
                  }
                ]);

                return SendResponse(res, {
                    data: contract,
                    userMessage: "Pdf uploaded"
                });
            });
        }
    });
};

async function generateConfirmationPDF(confirmation, admin_id, hasChanges = true) {
  let confirmationData = confirmation;
  if (typeof confirmation === "string") {
    confirmationData = await Confirmation
      .findOne({_id: confirmation})
      .populate('growerId', 'firstName lastName addresses phone2 email email2 farmName cellNumber phone phoneNumber2 phoneNumber3')
      .populate('commodityId', 'commodityName sieveSizeNote')
      .populate('gradeId', 'gradeName')
      .populate('createdBy', 'signature')
      .populate('signee', 'signature')
      .populate('sampleNumber', 'sampleNumber');
  }

  const pdfUrl = await generatePdf.generatePDF('purchase', confirmationData);

  const updatedConfirmation = await Confirmation.findByIdAndUpdate(confirmationData._id,
    {
        $set: { pdfUrl: pdfUrl },
        $push: { allPDF: { date: new Date(), pdfUrl: pdfUrl, updatedBy: admin_id } }
    },
    { new: true, lean: true }
  );

  if (hasChanges) {
    updatedConfirmation.purchaseConfirmationId = updatedConfirmation._id;
    updatedConfirmation.createdBy = admin_id;
    delete updatedConfirmation._id;
    delete updatedConfirmation.createdAt;
    delete updatedConfirmation.updatedAt;

    await (new purchaseConfirmationHistory(updatedConfirmation)).save();
  }

  return confirmationData;
}

methods.removeSignedContract = async (req, res) => {
    let success = await Confirmation
        .findByIdAndUpdate(req.query.id, {
            $set: {
                signedContractPdf: "",
                contractIsSigned: false
            }
        });

    if (!success) {
        return SendResponse(res, {
            status: 400,
            userMessage: "Something went wrong"
        });
    }

    return SendResponse(res, {
        userMessage: "Pdf uploaded"
    });
};

/*==========================
***   searchPurchase  ***
============================*/
methods.searchPurchase = async function(req, res) {
    const {data, scales, query} = await methods.getSearchPurchase(req, res);

    if (data && req.body.getSum && req.body.commodityId) {
        data.qtySum = await getTotals(query, req.body.cropYear);
    }

    return SendResponse(res, { data, scales, userMessage: 'purchaseList.' });
};/*-----  End of searchPurchase  ------*/

methods.getSearchPurchase = async function(req) {
    var status = '';
    if (req.body.status) {
        status = Number(req.body.status);
    } else {
        delete req.body.status;
    }

    const extra = req.body.address ? 'addresses' : '';
    var options = {
        sort: { createdAt: -1 },
        page: req.body.page || 1,
        limit: req.body.limit || 10,
        populate: [{
                path: 'commodityId gradeId',
                select: 'commodityName gradeName'
            }, {
                path: 'growerId',
                select: `firstName lastName farmName ${extra}`
        }],
        lean: true
    };

    var query = { $and: [ { 'status': { $in: [0, 1, 2] } } ] };

    if (req.body.firstName || req.body.farmName) {

        var grower_condition = { $and: [] };

        if (req.body.firstName) {
            grower_condition.$and.push({
                "firstName": {
                    $regex: ".*" + req.body.firstName + ".*",
                    $options: 'i'
                }
            });
        }

        if (req.body.farmName) {
            grower_condition.$and.push({
                "farmName": {
                    $regex: ".*" + req.body.farmName + ".*",
                    $options: 'i'
                }
            });
        }

        let growerIds = await Grower.find(grower_condition);

        var ids = growerIds.filter(document => document._id).map((document) => document._id);
        query.$and.push({ 'growerId': { $in: ids } });
    }

    if (req.body.signed) {
      query.$and.push({contractIsSigned: req.body.signed === "1"});
    }

    if (req.body.commodityId) {
        query.$and.push({ commodityId: req.body.commodityId });
    }

    if ([0, 1, 2].indexOf(status) != -1) {
        query.$and.push({  status: { $in: [status] } });
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

    if (req.body.brokerId) {
        query.$and.push({ brokerId: req.body.brokerId });
    }

    if (req.body.fromDate || req.body.toDate) {
        if (req.body.fromDate && req.body.toDate) {
            query.$and.push({
                createdAt: { $gte: req.body.fromDate, $lt: req.body.toDate }
            });
        } else if (req.body.fromDate) {
            query.$and.push({ createdAt: { $gte: req.body.fromDate } });
        } else if (req.body.toDate) {
            query.$and.push({ createdAt: { $lt: req.body.toDate } });
        }
    }

    if (req.body.shipmentPeriodFrom || req.body.shipmentPeriodTo) {
        if (req.body.shipmentPeriodFrom && req.body.shipmentPeriodTo) {
            query.$and.push({
                shipmentPeriodFrom: { $gte: req.body.shipmentPeriodFrom }
            });

            query.$and.push({
                shipmentPeriodTo: { $lt: req.body.shipmentPeriodTo }
            });
        } else if (req.body.shipmentPeriodFrom) {
            query.$and.push({
                shipmentPeriodFrom: { $gte: req.body.shipmentPeriodFrom }
            });
        } else if (req.body.shipmentPeriodTo) {
            query.$and.push({
                shipmentPeriodTo: { $lt: req.body.shipmentPeriodTo }
            });
        }
    }

    if (query.$and.length == 0) {
        delete query.$and;
    }

    let data = await Confirmation.paginate(query, options);

    const contractNumbers = data.docs.map(purchase => {
        return purchase.contractNumber;
    });

    const scales = await Scale.find({'splits.contractNumber': {$in: contractNumbers}});

    return { data, scales, query };
};

async function getTotals(condition) {
    let scaleTotal = {
        $reduce: {
            input: "$scales",
            initialValue: 0,
            in: { $sum: ["$$value", { "$multiply": ['$$this.netWeight', 2.2046] }] }
        }
    };

    let data = await Confirmation.aggregate([
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
                    $project: { netWeight: 1, void:1 }
                }],
                as: "scales"
            }
        },
        {$project: {
                _id: 1,
                quantityLbs: 1,
                CWTDel: 1,
                scaleTotal: scaleTotal
            }
        },
        {$project: {
                _id: 1,
                quantityLbs: 1,
                netFOBnQuantity: {$multiply: ['$quantityLbs', '$CWTDel']},
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

methods.checkContractWithNoActiveScaleTickets = async (req, res, next) => {
    if (req.body._id && req.body.status == 2) {
        const { contractNumber } = req.body;
        let scaleCount = await Scale.count({
            contractNumber,
            void: { $ne: true },
            ticketType: "Incoming"
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

/*=================================
***   addPurchaseConfirmation  ***
===================================*/
methods.addPurchaseConfirmation = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('cropYear', 'Crop Year is required.').notEmpty();
    req.checkBody('shipmentPeriodFrom', 'Delivery Date From is required.').notEmpty();
    req.checkBody('shipmentPeriodTo', 'Delivery Date To is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }
    let confirmation;
    if (req.body._id) {
        req.body.sampleNumber = req.body.sampleNumber || null;

        let success = await Confirmation
            .findOne({contractNumber: req.body.contractNumber});

        if (success && success._id.toString() !== req.body._id) {
            return SendResponse(res, {
                error: true, status: 400, userMessage: 'Contract number already exist.'
            });
        }

        if (success.status != req.body.status) {
            req.body.statusBy = req.admin._id;
            req.body.statusAt = Date.now();
        }
        confirmation = await Confirmation
            .findByIdAndUpdate(req.body._id, req.body, {
                new: true,
                lean: true
            })
            .populate('growerId', 'firstName lastName addresses phone2 email email2 farmName cellNumber phone phoneNumber2 phoneNumber3')
            .populate('commodityId', 'commodityName sieveSizeNote')
            .populate('gradeId', 'gradeName')
            .populate('createdBy', 'signature')
            .populate('signee', 'signature')
            .populate('sampleNumber', 'sampleNumber');

        await generateConfirmationPDF(confirmation, req.admin._id, req.body.someFieldValueChangedPurchaseConfirmation);

        return SendResponse(res, {
          userMessage: 'Information updated successfully.'
        });
    }

    let success = await Confirmation.findOne({ contractNumber: req.body.contractNumber });
    if (success) {
        return SendResponse(res, {
            userMessage: 'Contract number already exist.',
            error: true, status: 400
        });
    }

    //Database functions here
    req.body.createdBy = req.admin._id;
    req.body.signee = req.admin._id;
    req.body.statusBy = req.admin._id;
    req.body.statusAt = Date.now();

    confirmation = new Confirmation(req.body);
    await confirmation.save();

    confirmation = await Confirmation
        .findById(confirmation._id)
        .populate('growerId', 'firstName lastName addresses phone2 email email2 farmName cellNumber phone phoneNumber2 phoneNumber3')
        .populate('commodityId', 'commodityName sieveSizeNote')
        .populate('gradeId', 'gradeName')
        .populate('createdBy', 'signature')
        .populate('sampleNumber', 'sampleNumber')
        .populate('signee', 'signature');

    await generateConfirmationPDF(confirmation, req.admin._id);

    return SendResponse(res, {
      userMessage: 'Information added successfully.'
    });
};/*-----  End of addPurchaseConfirmation  ------*/

methods.getLatestPurchaseConfirmationContract = async (req, res) => {
    let success = await Confirmation
        .find({ status: { $nin: [2] } })
        .select('createdAt backDate growerId contractQuantity quantityUnit contractNumber pdfUrl')
        .populate('growerId', 'firstName lastName')
        .sort('-createdAt')
        .limit(10);

    return SendResponse(res, {
        userMessage: "success",
        data: success
    });
};

/*======================================
***   getPurchaseConfirmation  ***
========================================*/
methods.getPurchaseConfirmation = async function(req, res) {
    //Database functions here
    var confirmation;
    if (req.query.growerId) {
        confirmation = await Confirmation.find({
                $or: [{
                    growerId: req.query.growerId
                }, {
                    brokerId: req.query.growerId
                }]
            })
            .populate('commodityId gradeId growerId createdBy signee')
            .populate('mailSentBy', 'fullName')
            .lean()
            .sort({ createdAt: -1 });
    } else if (req.query.commodityId) {
        confirmation = await Confirmation.distinct(
                // status: 0,
                'growerId', { commodityId: req.query.commodityId }
            )
            .populate('growerId')
            .lean()
            .sort({ createdAt: -1 });
    } else {
        confirmation = await Confirmation.find({ status: { $in: [0, 1] } })
            .populate('commodityId gradeId growerId createdBy signee')
            .sort({ createdAt: -1 })
            .lean();
    }

    return SendResponse(res, {
        userMessage: 'confirmation list.',
        data: confirmation
    });
};/*-----  End of getPurchaseConfirmation  ------*/

methods.purchaseConfirmationListByGrower = async (req, res) => {
    var condition = { growerId: req.query.growerId };
    let count = await Confirmation.count(condition);

    let data = await Confirmation
        .paginate(condition, {
            page: 1,
            limit: count,
            populate: [{
                path: 'commodityId',
                select: 'commodityName'
            }, {
                path: 'gradeId',
                select: 'gradeName'
            }, {
                path: 'scale',
                select: 'unloadWeidht netWeight void'
            }, {
                path: 'growerId',
                select: 'firstName lastName farmName email'
            }],
            lean: true,
            sort: '-createdAt'
        });

    return SendResponse(res, {
        data, userMessage: 'List'
    });
};

/*======================================
***   getPurchaseConfirmationCount  ***
========================================*/
methods.getPurchaseConfirmationCount = async function(req, res) {

    req.check('commodityId', 'commodityId is required.').notEmpty();
    req.check('cropYear', 'cropYear is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            userMessage: 'Validation errors',
            errors, error: true, status: 400
        });
    }

    //Database functions here
    var query = { cropYear: req.query.cropYear, commodityId: req.query.commodityId };

    let data = await Confirmation.findOne(query).sort('-contractNumber').limit(1);

    return SendResponse(res, {
        data, userMessage: 'count.'
    });
};/*-----  End of getPurchaseConfirmationCount  ------*/

/*======================================
***   getPurchaseConfirmationByContractNo  ***
========================================*/
methods.getPurchaseConfirmationByContractNo = async function(req, res) {
    //Database functions here
    let data = await Confirmation.findOne({
            // status: 0,
            contractNumber: req.params.contractNo
        })
        .populate('commodityId gradeId growerId createdBy signee')
        .lean();

    return SendResponse(res, {
        data, userMessage: 'contracts list.'
    });
};/*-----  End of getPurchaseConfirmationByContractNo  ------*/


methods.purchaseReport = (req, res) => {
    var condition = {};
    var groupBy = req.body.groupBy || false;

    if ('status' in req.body) {
        condition.status = Number(req.body.status);
    } else {
        condition.status = { $in: [0, 1] };
    }
    delete req.body.groupBy;

    for (var propertyName in req.body) {
        if (req.body[propertyName]) {
            if (propertyName == 'commodityId' || propertyName == 'gradeId') {
                condition[propertyName] = mongoose.Types.ObjectId(req.body[propertyName]);
            } else {
                if (propertyName != 'status')
                    condition[propertyName] = req.body[propertyName];
            }
        }
    }

    var aggregate = Confirmation.aggregate();
    aggregate
        .match(condition)
        .lookup({
            from: "growers",
            localField: "growerId",
            foreignField: "_id",
            as: "growerId"
        })
        .unwind({
            path: "$growerId",
            preserveNullAndEmptyArrays: false
        })
        .lookup({
            from: "commodities",
            localField: "commodityId",
            foreignField: "_id",
            as: "commodityId"
        })
        .unwind({
            path: "$commodityId",
            preserveNullAndEmptyArrays: false
        })
        .lookup({
            from: "grades",
            localField: "gradeId",
            foreignField: "_id",
            as: "gradeId"
        })
        .unwind({
            path: "$gradeId",
            preserveNullAndEmptyArrays: false
        });

    if (groupBy) {
        aggregate.group({
            "_id": "$commodityId",
            "list": {
                "$push": {
                    "contractNumber": "$contractNumber",
                    "nameOfContract": "$nameOfContract",
                    "commodityId": "$commodityId",
                    "gradeId": "$gradeId",
                    "growerId": "$growerId",
                    "brokerId": "$brokerId",
                    "personFarmType": "$personFarmType",
                    "farmName": "$farmName",
                    "cropYear": "$cropYear",
                    "shipmentPeriodFrom": "$shipmentPeriodFrom",
                    "shipmentPeriodTo": "$shipmentPeriodTo",
                    "deliveryPoint": "$deliveryPoint",
                    "contractQuantity": "$contractQuantity",
                    "quantityUnit": "$quantityUnit",
                    "splitsPrice": "$splitsPrice",
                    "price": "$price",
                    "priceUnit": "$priceUnit",
                    "priceCurrency": "$priceCurrency",
                    "priceSplits": "$priceSplits",
                    "otherConditions": "$otherConditions",
                    "paymentTerms": "$paymentTerms",
                    "specifications": "$specifications",
                    "sampleNumber": "$sampleNumber",
                    "settlementInstructions": "$settlementInstructions",
                    "settlementComments": "$settlementComments",
                    "freightRatePerMT": "$freightRatePerMT",
                    "CWTDel": "$CWTDel",
                    "freightEstimate": "$freightEstimate",
                    "freightActual": "$freightActual",
                    "inventoryGrade": "$inventoryGrade",
                    "history": "$history",
                    "createdBy": "$createdBy",
                    "status": "$status",
                    "createdAt": "$createdAt",
                    "pdfUrl": "$pdfUrl",
                }
            },
            "totalQtyLb": {
                "$sum": "$contractQuantity"
            },
            "priceLb": {
                "$sum": "$price"
            },
            "cwtDelPrice": {
                "$sum": "$CWTDel"
            }

        });
    }

    aggregate.exec((err, data) => {
        if (err) {
            return SendResponse(res, {
                error: true, status: 500, errors: err,
                userMessage: 'some server error has occurred.'
            });
        } else {
            return SendResponse(res, { userMessage: 'contracts list.', data });
        }
    });
};

methods.usdPurchasesContracts = (req, res) => {
  const cropYear = req.query.cropYear;
  if (!cropYear) {
    return SendResponse(res, { userMessage: 'CropYear is required.', error: true, status: 400});
  }

  async.parallel({
    purchase: cb => {
      Confirmation.aggregate([
        {$match: {cropYear, priceCurrency: 'USD', status: 0}},
        {$project: {
          contractNumber: 1,
          contractPrice: {$multiply: ['$contractQuantity', '$price']},
          exchangeRate: 1,
          contractType: 'confirmation',
        }},
      ]).exec((err, data) => { cb(err, data); });
    },
    trade: cb => {
      TradePurchase.aggregate([
        {$match: {cropYear, contractCurrency: 'USD', status: 0}},
        {$addFields: {
          amountInNumber: {$convert: {input: '$amount', to: 'double'}},
          contractQuantityInNumber: {$convert: {input: '$contractQuantity', to: 'double'}}
        }},
        {$addFields: {
          pricePerQuantity: {
            $cond: {
              if: {$ne: ['$amountUnit', '$units']},
              then: {
                $switch: {
                  branches: [
                    {case: {$eq: ['$amountUnit', 'MT']}, then: {$divide: [{$toInt: '$amountInNumber'}, 2204.62]}},
                    {case: {$eq: ['$amountUnit', 'CWT']}, then: {$divide: [{$toInt: '$amountInNumber'}, 100]}},
                  ],
                  default: '$amountInNumber'
                }
              },
              else: '$amountInNumber'
            }
          }
        }},
        {$project: {
          contractPrice: {
            $cond: {
              if: {$eq: ['$amountUnit', '$units']},
              then: {$multiply: ['$pricePerQuantity', '$contractQuantityInNumber']},
              else: {$multiply: ['$pricePerQuantity', '$quantityLbs']}
            }
          },
          contractNumber: 1,
          exchangeRate: 1,
          contractType: 'trade',
        }}
      ]).exec((err, data) => { cb(err, data); });
    },
  }, (err, data) => {
    if (err) {
      //send response to client
      return SendResponse(res, {
          status: 500, errors: err, error: true,
          userMessage: 'some server error has occurred.'
      });
    }

    let purchases = data.purchase;
    let trades = data.trade;
    let allContracts = [].concat(purchases, trades);

    //send response to client
    return SendResponse(res, { data: allContracts, userMessage: 'USD purchases contracts' });
  });
};

methods.usdPurchases = (req, res) => {
  const cropYear = req.query.cropYear;
  if (!cropYear) {
    return SendResponse(res, { userMessage: 'CropYear is required.', error: true, status: 400});
  }
  const groupCode = {
    _id: null,
    contracts: {
      $push: {
        contractPrice: '$contractPrice',
        CWTDel: '$CWTDel',
        exchangeRate: '$exchangeRate',
        price: '$price',
        quantityLbs: '$quantityLbs',
        quantityUnit: '$quantityUnit',
      }
    },
    total: {$sum: '$quantityLbs'},
    totalPrice: {$sum: '$contractPrice'},
  };

  async.parallel({
    purchase: cb => {
      Confirmation.aggregate([
        {$match: {cropYear, priceCurrency: 'USD', status: 0}},
        {$project: {
          contractPrice: {$multiply: ['$contractQuantity', '$price']},
          CWTDel: 1,
          exchangeRate: 1,
          price: 1,
          quantityLbs: 1,
          quantityUnit: 1,
        }},
        {$group: groupCode}
      ]).exec((err, data) => { cb(err, data); });
    },
    trade: cb => {
      TradePurchase.aggregate([
        {$match: {cropYear, contractCurrency: 'USD', status: 0}},
        {$addFields: {
          amountInNumber: {$convert: {input: '$amount', to: 'double'}},
          contractQuantityInNumber: {$convert: {input: '$contractQuantity', to: 'double'}}
        }},
        {$addFields: {
          pricePerQuantity: {
            $cond: {
              if: {$ne: ['$amountUnit', '$units']},
              then: {
                $switch: {
                  branches: [
                    {case: {$eq: ['$amountUnit', 'MT']}, then: {$divide: [{$toInt: '$amountInNumber'}, 2204.62]}},
                    {case: {$eq: ['$amountUnit', 'CWT']}, then: {$divide: [{$toInt: '$amountInNumber'}, 100]}},
                  ],
                  default: '$amountInNumber'
                }
              },
              else: '$amountInNumber'
            }
          }
        }},
        {$project: {
          contractPrice: {
            $cond: {
              if: {$eq: ['$amountUnit', '$units']},
              then: {$multiply: ['$pricePerQuantity', '$contractQuantityInNumber']},
              else: {$multiply: ['$pricePerQuantity', '$quantityLbs']}
            }
          },
          CWTDel: "$netFOBCAD",
          exchangeRate: 1,
          price: '$pricePerQuantity',
          quantityLbs: 1,
          quantityUnit: '$units'
        }},
        {$group: groupCode}
      ]).exec((err, data) => { cb(err, data); });
    },
  }, (err, data) => {
    if (err) {
      //send response to client
      return SendResponse(res, {
          status: 500, errors: err, error: true,
          userMessage: 'some server error has occurred.'
      });
    }

    let purchases = (data.purchase && data.purchase.length) ? data.purchase[0] : null;
    let trades = (data.trade && data.trade.length) ? data.trade[0] : null;

    let usdPurchases = 0;
    let totalCWT = 0, totalPurchaseCWT = 0, totalTradeCWT = 0;
    let weightedAvg = 0;
    let allContracts = [];

    if (purchases) {
      usdPurchases += purchases.totalPrice;
      totalPurchaseCWT = purchases.total / 100;
      totalCWT += totalPurchaseCWT;
      allContracts.push({
        totalPrice: purchases.totalPrice,
        contracts: purchases.contracts,
      });
    }

    if (trades) {
      usdPurchases += trades.totalPrice;
      totalTradeCWT = trades.total / 100;
      totalCWT += totalTradeCWT;
      allContracts.push({
        totalPrice: trades.totalPrice,
        contracts: trades.contracts,
      });
    }

    allContracts.forEach(({contracts}) => {
      contracts.forEach(contract => {
        weightedAvg += ((contract.contractPrice / usdPurchases) * contract.exchangeRate);
      });
    });

    //send response to client
    return SendResponse(res, { data: {usdPurchases, weightedAvg, totalCWT}, userMessage: 'USD purchases' });
  });
};

methods.outstandingPurchaseReport = (req, res) => {
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

    async.parallel({
        "purchase": async () => {
            let count = await Confirmation.count(condition);

            return await Confirmation.paginate(condition, {
                    select: 'pdfUrl contractNumber personFarmType createdAt gradeId commodityId shipmentPeriodFrom shipmentPeriodTo CWTDel freightRatePerMT price priceUnit priceCurrency contractQuantity quantityUnit',
                    page: 1,
                    limit: count,
                    populate: [{
                        path: 'commodityId',
                        select: 'commodityName'
                    }, {
                        path: 'gradeId',
                        select: 'gradeName'
                    }, {
                        path: 'scale',
                        select: 'unloadWeidht netWeight void'
                    }, {
                        path: 'growerId',
                        select: 'firstName lastName farmName'
                    }],
                    lean: true,
                    sort: '-createdAt'
                });
        },
        "tradePurchase": async () => {
            let count = await TradePurchase.count(condition);

            return await TradePurchase.paginate(condition, {
                    select: 'pdfUrl contractNumber createdAt gradeId commodityId shipmentScheldule netFOBCAD freightRatePerMT amount amountUnit contractCurrency contractQuantity units',
                    page: 1,
                    limit: count,
                    populate: [{
                        path: 'commodityId',
                        select: 'commodityName'
                    }, {
                        path: 'gradeId',
                        select: 'gradeName'
                    }, {
                        path: 'scale',
                        select: 'unloadWeidht netWeight void'
                    }, {
                        path: 'buyerId',
                        select: 'firstName lastName farmName'
                    }],
                    lean: true,
                    sort: '-createdAt'
                });
        },
        "production": async () => {
            let count = await Contract.count(condition);

            let data = await Contract.paginate(condition, {
                    select: 'pdfUrl contractNumber personFarmType createdAt gradeId commodityId deliveryDateFrom deliveryDateTo CWTDel freightRatePerMT fixedPrice fixedPriceUnit  quantityLbs',
                    page: 1,
                    limit: count,
                    populate: [{
                        path: 'commodityId',
                        select: 'commodityName'
                    }, {
                        path: 'gradeId',
                        select: 'gradeName'
                    }, {
                        path: 'scale',
                        select: 'unloadWeidht netWeight void'
                    }, {
                        path: 'growerId',
                        select: 'firstName lastName farmName'
                    }],
                    lean: true,
                    sort: '-createdAt'
                });
            data.docs.forEach((val) => {
                val.shipmentPeriodFrom = val.deliveryDateFrom;
                val.shipmentPeriodTo = val.deliveryDateTo;
                val.price = val.fixedPrice;
                val.priceUnit = val.fixedPriceUnit;
                val.contractQuantity = val.quantityLbs;
            });

            return data;
        }
    }, (err, data) => {
        // console.log(err);
        if (err) {
            return SendResponse(res, {
                userMessage: 'some server error has occurred.',
                error: true, status: 500, errors: err
            });
        } else {
            return SendResponse(res, {
                data: [...data.purchase.docs, ...data.production.docs],
                trade: data.tradePurchase.docs,
                userMessage: 'list.'
            });
        }
    });
};

methods.purchaseConfirmationListByUser = async (req, res) => {
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
    let data = await Confirmation
        .paginate(condition, {
            select: 'contractNumber createdAt growerId personFarmType pdfUrl',
            page: req.query.page || 1,
            limit: 5,
            populate: {
                path: 'growerId',
                select: 'firstName lastName farmName'
            },
            lean: true,
            sort: '-createdAt'
        });

    return SendResponse(res, { userMessage: 'list.', data });
};

methods.canCreateRollover = async (req, res, next) => {
    let confirmation = await Confirmation.findById(req.body.contract_id).lean();

    if (!confirmation) {
        return SendResponse(res, {
            error: true,
            status: 404,
            userMessage: "Purchase confirmation is not found."
        });
    }
    // purchase confirmation is not active
    if (confirmation.status != 0) {
        return SendResponse(res, {
            error: true,
            status: 400,
            userMessage: "Purchase confirmation is not in active state so can't be rolled over."
        });
    }

    const confirmationCropYear = CropYear.makeCropYear(confirmation.cropYear);

    // contract rollover is already defined or not eligible for new rollover
    if (confirmation.rolloverCN || moment().isBetween(confirmationCropYear.start, confirmationCropYear.end)) {
        return SendResponse(res, {
            error: true,
            status: 400,
            userMessage: "Purchase confirmation is not eligible for rollover."
        });
    }

    const scaleCounts = await Scale.aggregate([
            { $match: { contractNumber: confirmation.contractNumber,  void: { $ne: true } }, },
            { $group: { _id: "$contractNumber", total: { $sum: "$netWeight" } } }
        ]);

    let totalScaleWeight = (scaleCounts && scaleCounts.length > 0) ? scaleCounts[0].total : 0;

    // over delivered purchase confirmation
    if (totalScaleWeight * 2.20462 >= confirmation.quantityLbs) {
        return SendResponse(res, {
            status: 400,
            error: true,
            userMessage: "Purchase confirmation has been over delivered."
        });
    }

    req.confirmation = confirmation;
    req.scaleTotal = totalScaleWeight;

    next();
};

methods.purchaseContractRollover = async (req, res) => {
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

    let { confirmation, scaleTotal, admin, rolloverContract } = req;
    let currentCropYear = CropYear.currentCropYear();

    if (!confirmation.rolloverCN) {
      let contractQuantity = 0;
      let commodity = null;

      switch(confirmation.units) {
        case 'MT':
          contractQuantity = +(req.body.quantityLbs / 2204.62).toFixed(4);
          break;

        case 'CWT':
          contractQuantity = req.body.quantityLbs / 100;
          break;

        case 'BU':
          commodity = await Commodity.findById(confirmation.commodityId);
          contractQuantity = +(req.body.quantityLbs / (commodity ? (commodity.commodityWeight || 1) : 60)).toFixed(4);
          break;

        default:
          contractQuantity = req.body.quantityLbs;
      }

      const rolloverCN = `${confirmation.contractNumber}-R`;
      const rolloverConfirmationData = _.assign({}, confirmation, {
        contractNumber: rolloverCN,
        originalCN: confirmation.contractNumber,
        quantityLbs: req.body.quantityLbs,
        inventoryGrade: req.body.inventoryGrade,
        deliveryDateFrom: req.body.deliveryDateFrom,
        deliveryDateTo: req.body.deliveryDateTo,
        cropYear: currentCropYear.cropYear,
        createdBy: admin._id,
        createdAt: Date.now(),
        delQty: 0,
        note: req.body.note,
        pdfUrl: null,
        allPDF: [],
        contractQuantity,
      });
      delete rolloverConfirmationData._id;

      rolloverContract = await (new Confirmation(rolloverConfirmationData)).save();

      confirmation = await Confirmation.findByIdAndUpdate(
        { _id: confirmation._id },
        { $set: {
          rolloverCN,
          status: 1,
          statusBy:
          admin._id,
          statusAt:
          Date.now(),
          delQty: scaleTotal
        } },
        { new: true }
      );
    }

    await generateConfirmationPDF(rolloverContract._id.toString(), req.admin._id);

    return SendResponse(res, {
        data: confirmation,
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

    let data = await Confirmation
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
                        "$project": { "netWeight": 1, "void": 1 }
                    }],
                    "as": "scale"
                }
            },
            {
                "$project": {
                    "delQty": { "$multiply": [{ "$sum": "$scale.netWeight" }, 2.20462]},
                    "CWTDel": 1,
                    "commodityId": 1,
                    "contractNumber": 1,
                    "cropYear": 1,
                    "gradeId": 1,
                    "growerId": 1,
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
                    "from": "growers",
                    "localField": "growerId",
                    "foreignField": "_id",
                    "as": "growerId"
                }
            },
            { "$unwind": { "path": "$growerId", "preserveNullAndEmptyArrays": true } },
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
