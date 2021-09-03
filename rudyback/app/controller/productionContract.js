var mongoose = require('mongoose');
const path = require('path');
const moment = require('moment');
var session = require('@ag-libs/session');
var Contract = mongoose.model('productionContract');
var Confirmation = mongoose.model('purchaseConfirmation');
var TradePurchase = mongoose.model('tradePurchase');
var Commodity = mongoose.model('commodity');
var CommodityAdjustments = mongoose.model('commodityAdjustment');

var Sales = mongoose.model('salesContract');
var Grower = mongoose.model('grower');
var Quote = mongoose.model('quote');
var pdf = require('html-pdf');
var notifications = require('@ag-libs/function');
var productionContractHistory = mongoose.model('productionContractHistory');

var generatePdf = require('@ag-libs/generatePdf');
var CropYear = require("@ag-libs/cropYear");

var async = require("async");
var Scale = mongoose.model('scale');
const _ = require('lodash');

var multer = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
const { SendResponse } = require("@ag-common");

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

/* the response object for API
error : true / false
code : contains any error code
data : the object or array for data
userMessage : the message for user, if any.
*/

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/production/contract')
        .post(session.adminCheckToken, methods.checkContractWithNoActiveScaleTickets, methods.addProductionContract)
        .get(session.adminCheckToken, methods.getProductionContract)
        .put(session.adminCheckToken, methods.sendMail);

    router
        .route('/production/contractByGrower')
        .get(session.adminCheckToken, methods.contractByGrower);

    router
        .route('/production/count')
        .get(session.adminCheckToken, methods.getProductionContractCount);

    router
        .route('/production/:contractNo/contract')
        .get(session.adminCheckToken, methods.getProductionContractByContractNo);

    router
        .route('/production/delete')
        .post(session.adminCheckToken, methods.deleteProductionContract);
    router
        .route('/production')
        .post(session.adminCheckToken, methods.productionReport)
        .get(methods.getPositionReport);

    router
        .route('/production/uploadPdf')
        .put(methods.uploadPdf);

    router
        .route('/production/uploadHarvestFile')
        .put(methods.uploadHarvestFile);

    router
        .route('/production/removeSignedContract')
        .put(session.adminCheckToken, methods.removeSignedContract);

    router
        .route('/search/production')
        .post(session.adminCheckToken, methods.searchProduction);

    router
        .route('/production/export')
        .get(session.adminCheckToken, methods.exportProduction);

    router
        .route('/calculate/quantity')
        .post(session.adminCheckToken, methods.addDeliveryQuantity);

    router
        .route('/scale/mail')
        .post(session.adminCheckToken, methods.changeColor)
        .put(session.adminCheckToken, methods.sendMail);

    router
        .route('/production/sendPdfMail')
        .post(session.adminCheckToken, methods.sendPdfMail);

    router
        .route('/production/getProductionContractList')
        .get(session.adminCheckToken, methods.getProductionContractList);

    router
        .route('/production/getLatestProductionContract')
        .get(session.adminCheckToken, methods.getLatestProductionContract);

    router
        .route('/production/productionContractListByUser')
        .get(session.adminCheckToken, methods.productionContractListByUser);

    router
        .route('/production/rollover')
        .post(session.adminCheckToken, methods.canCreateRollover, methods.productionContractRollover)
        .get(session.adminCheckToken, methods.getRolloverList);

    router
        .route('/production/productionHistory')
        .get(session.adminCheckToken, methods.productionHistory);
};

async function generateContractPDF (contract, admin_id, hasChanges = true) {
  let contractData = contract;
  if (typeof contract === "string") {
    contractData = await Contract
      .findOne({_id: contract})
      .populate('growerId', 'firstName lastName fullAddress farmName addresses')
      .populate('commodityId', 'commodityName sieveSizeNote')
      .populate('gradeId', 'gradeName')
      .populate('createdBy', 'signature');
  }

  const pdfUrl = await generatePdf.generatePDF('production', contractData);

  const updatedContract = await Contract.findByIdAndUpdate(contractData._id,
    {
        $set: { pdfUrl: pdfUrl },
        $push: { allPDF: { date: new Date(), pdfUrl: pdfUrl, updatedBy: admin_id } }
    },
    { new: true, lean: true }
  );

  if (hasChanges) {
    updatedContract.productionContractId = updatedContract._id;
    updatedContract.createdBy = admin_id;
    delete updatedContract._id;
    delete updatedContract.createdAt;
    delete updatedContract.updatedAt;

    await (new productionContractHistory(updatedContract)).save();
  }

  return contractData;
}

/*=======================
***   changeColor  ***
=========================*/
methods.changeColor = async function(req, res) {
    const scales = await Scale.findOneAndUpdate(
        { _id: req.body._id },
        { $set: { mailSent: req.body.mailSent, mailColor: req.body.mailColor, } },
        { new: true }
    );
    return SendResponse(res, { data: scales, userMessage: "Mail send and color change." });
};/*-----  End of changeColor  ------*/

/*===============================
***   addDeliveryQuantity  ***
=================================*/
methods.addDeliveryQuantity = async function(req, res) {
    const contract = await Contract.findOneAndUpdate(
        { contractNumber: req.body.contractNumber },
        { $set: { delQty: req.body.delQty } },
        { new: true }
    );

    return SendResponse(res, {
        data: contract,
        userMessage: 'Information updated successfully.'
    });
};/*-----  End of addDeliveryQuantity  ------*/

methods.exportProduction = async function(req, res) {
    const purchaseList = await Contract
        .find({})
        .populate('commodityId gradeId growerId createdBy signee')
        .lean();

    return SendResponse(res, {data: purchaseList, userMessage: 'purchaseList.'});
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
                fileName = new Date().getTime() + '_' + path.extname(file.originalname);
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

                const contract = await Contract.findByIdAndUpdate(req.query.contractId, { $set: data }, {new: true}).populate([{
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
                    userMessage: "Pdf uploaded",
                    data: contract
                });
            });
        }
    });
};

methods.uploadHarvestFile = (req, res) => {
    //console.log(res);
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
                fileName = new Date().getTime() + '_' + path.extname(file.originalname);
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

                var contract = await Contract.findByIdAndUpdate(req.query.contractId, {
                    $set: {
                        harvestFileUrl: url.split("?")[0],
                        harvestQty: req.body.harvestQty,
                        harvestQtyUnit: req.body.harvestQtyUnit,
                    }
                  }, {new: true}).populate([{
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
                    userMessage: "Pdf uploaded",
                    data: contract
                });
            });
        }
    });
};

methods.sendPdfMail = async (req, res) => {
    if (['production contract', 'purchase confirmation', 'sales contract', 'Trade purchase'].indexOf(req.body.type) != -1) {
        if (process.env.SEND_QUOTE_MAIL == 'true' && process.env.LIVE_SERVER == 'true' && req.body.email) {
            notifications.sendCustomMail({
                email: req.body.email,
                subject: req.body.subject,
                body: req.body.body
            });
        }

        if (req.body.type == 'production contract' && req.body.email) {
            await Contract.findByIdAndUpdate(req.body._id, {
                $set: {
                    mailSent: true,
                    mailSentDate: new Date(),
                    mailSentBy: req.admin._id
                }
            });
            return SendResponse(res, { userMessage: "Email sent successfully" });

        } else if (req.body.type == 'purchase confirmation' && req.body.email) {
            await Confirmation.findByIdAndUpdate(req.body._id, {
                $set: {
                    mailSent: true,
                    mailSentDate: new Date(),
                    mailSentBy: req.admin._id
                }
            });
            return SendResponse(res, { userMessage: "Email sent successfully" });

        } else if (req.body.type == 'sales contract' && req.body.email) {
            await Sales.findByIdAndUpdate(req.body._id, {
                $set: {
                    mailSent: true,
                    mailSentDate: new Date(),
                    mailSentBy: req.admin._id
                }
            });
            return SendResponse(res, { userMessage: "Email sent successfully" });

        } else if (req.body.type == 'Trade purchase' && req.body.email) {
            await TradePurchase.findByIdAndUpdate(req.body._id, {
                $set: {
                    mailSent: true,
                    mailSentDate: new Date(),
                    mailSentBy: req.admin._id
                }
            });
            return SendResponse(res, { userMessage: "Email sent successfully" });

        } else {
            return SendResponse(res, {
                error: true,
                status: 400,
                userMessage: "Email address not attached with this user"
            });
        }
    } else {
        return SendResponse(res, {
            error: true,
            status: 400,
            userMessage: "Invalid request"
        });
    }
};

methods.removeSignedContract = async (req, res) => {
    await Contract.findByIdAndUpdate(req.query.id, {
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
    } else {
        return SendResponse(res, {
            userMessage: "Pdf uploaded"
        });
    }
};

/*==========================
***   searchPurchase  ***
============================*/
methods.searchProduction = async function(req, res) {
    const {data, scales, query} = await methods.getSearchProduction(req, res);

    if (data && req.body.getSum && req.body.commodityId) {
        data.qtySum = await getTotals(query, req.body.cropYear);
    }

    return SendResponse(res, {
        data, scales,
        userMessage: 'purchaseList.'
    });
};/*-----  End of searchPurchase  ------*/

methods.getSearchProduction = async function(req) {
    var status = '';
    if (req.body.status) {
        status = Number(req.body.status);
    } else {
        delete req.body.status;
    }
    let extra = req.body.address ? 'addresses' : '';
    var query = { $and: [] };
    var options = {
        sort: { createdAt: -1 },
        page: req.query.page,
        limit: req.body.limit || 10,
        populate: [{
            path: 'commodityId gradeId',
            select: 'commodityName gradeName'
        }, {
            path: 'growerId',
            select: 'firstName lastName farmName cellNumber ' + extra
        }],
        lean: true
    };

    if (req.body.firstName || req.body.farmName) {
        var growerCondition = { $and: [] };

        if (req.body.firstName) {
            growerCondition.$and.push({
                "firstName": {
                    $regex: ".*" + req.body.firstName + ".*",
                    $options: 'i'
                }
            });
        }
        if (req.body.farmName) {
            growerCondition.$and.push({
                "farmName": {
                    $regex: ".*" + req.body.farmName + ".*",
                    $options: 'i'
                }
            });
        }

        const growerIds = await Grower.find(growerCondition);

        var ids = growerIds.filter(document => document._id).map((document) => document._id);

        query.$and.push({growerId: { $in: ids }});
    }

    if ([0, 1, 2].indexOf(status) != -1) {
        query.$and.push({ status: { $in: [status] } });
    }

    if (req.body.signed) {
      query.$and.push({contractIsSigned: req.body.signed === "1"});
    }

    if (req.body.commodityId) {
        query.$and.push({ commodityId: req.body.commodityId });
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
                createdAt: { $gte: req.body.fromDate, $lt: req.body.toDate }
            });
        } else if (req.body.fromDate) {
            query.$and.push({
                createdAt: { $gte: req.body.fromDate }
            });
        } else if (req.body.toDate) {
            query.$and.push({
                createdAt: { $lt: req.body.toDate }
            });
        }
    }

    if (req.body.deliveryDateFrom || req.body.deliveryDateTo) {
        if (req.body.shipmentPeriodFrom && req.body.deliveryDateTo) {
            query.$and.push({
                shipmentPeriodFrom: { $gte: req.body.deliveryDateFrom }
            });

            query.$and.push({
                shipmentPeriodTo: { $lt: req.body.deliveryDateTo }
            });
        } else if (req.body.deliveryDateFrom) {
            query.$and.push({
                shipmentPeriodFrom: { $gte: req.body.deliveryDateFrom }
            });
        } else if (req.body.deliveryDateTo) {
            query.$and.push({
                shipmentPeriodTo: { $lt: req.body.deliveryDateTo }
            });
        }
    }

    if (query.$and.length == 0) {
        delete query.$and;
    }

    const data = await Contract.paginate(query, options);

    const contractNumbers = data.docs.map(purchase => {
        return purchase.contractNumber;
    });

    const scales = await Scale.find({'splits.contractNumber': {$in: contractNumbers}});
    return {data, scales, query};
};

async function getTotals(condition) {
    let scaleTotal = {
        $reduce: {
            input: "$scales",
            initialValue: 0,
            in: { $sum: ["$$value", { "$multiply": ['$$this.netWeight', 2.2046] }] }
        }
    };

    let data = await Contract.aggregate([
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
                acres: 1,
                harvestQty: 1,
                quantityLbs: 1,
                CWTDel: 1,
                scaleTotal: scaleTotal
            }
        },
        {$project: {
                _id: 1,
                acres: 1,
                harvestQty: 1,
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
            totalAcres: {$sum: '$acres'},
            totalHarvestQty: {$sum: '$harvestQty'},
            netFOBnQuantity: {$push: '$netFOBnQuantity'},
            contractedQty: {$sum: '$quantityLbs'},
            deliveredQty: {$sum: '$scaleTotal'},
            outstandingQty: {$sum: '$outstandingTotal'},
        }},
        {$project: {
            totalAcres: 1,
            totalHarvestQty: 1,
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

/*====================
***   SendMail  ***
======================*/
methods.sendMail = function(req, res) {

    var options = { format: 'A4', orientation: req.body.orientation || "portrait" };
    let bucketName = process.env.S3_BUCKET;
    let file_name = new Date().getTime() + '_' + req.body.name + ".pdf";

    pdf.create(req.body.html, options).toBuffer(function(err, buffer) {
        if (err) {
            return SendResponse(res, {
                error: true,
                status: 500,
                errors: err,
                userMessage: 'some server error has occurred.'
            });
        } else {
            var s3 = new AWS.S3();
            var params = {
                Bucket: bucketName,
                Key: file_name,
                Body: buffer,
                ContentType: 'application/pdf',
                ACL: 'public-read'
            };
            s3.putObject(params, function(perr) {
                if (perr) {
                    return SendResponse(res, {
                        error: true,
                        status: 500,
                        errors: err,
                        userMessage: 'Error uploading image.'
                    });
                } else {
                    var urlParams = {
                        Bucket: bucketName,
                        Key: file_name
                    };
                    s3.getSignedUrl('getObject', urlParams, async function(err, url) {

                        if (process.env.SEND_QUOTE_MAIL == 'true' && process.env.LIVE_SERVER == 'true' && req.body.email) {
                            notifications.createMail({
                                name: req.body.name,
                                email: req.body.email,
                                subject: req.body.subject,
                                link: req.body.pdfUrl ? req.body.pdfUrl : url.split("?")[0],
                                type: req.body.pdfType || "Ticket",
                                attachments: [{
                                    filename: 'quote.pdf',
                                    content: buffer.toString('base64'),
                                    type: 'application/pdf',
                                    disposition: 'attachment',
                                    contentId: new Date()
                                }],
                            }, 'pdf');
                        }

                        if (req.body.quoteId) {
                            await Quote.findByIdAndUpdate(req.body.quoteId, {
                                $set: { emailDate: new Date() }
                            });
                        }

                        return SendResponse(res, {
                            userMessage: 'Mail sent successfully.',
                            data: url.split("?")[0]
                        });
                    });
                }
            });
        }
    });
};/*-----  End of sendMail  ------*/

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
***   addProductionContract  ***
===================================*/
methods.addProductionContract = async function(req, res) {
    req.checkBody('cropYear', 'Crop Year is required.').notEmpty();
    req.checkBody('deliveryDateFrom', 'Delivery Date From is required.').notEmpty();
    req.checkBody('deliveryDateTo', 'Delivery Date To is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    if (req.body._id) {

        let contract = await Contract.findOne({contractNumber: req.body.contractNumber});

        if (contract && contract._id.toString() != req.body._id) {
            return SendResponse(res, {
                error: true,
                status: 400,
                userMessage: 'Contract number already exist.'
            });
        } else {
            if (contract.status != req.body.status) {
                req.body.statusBy = req.admin._id;
                req.body.statusAt = Date.now();
            }
            contract = await Contract
                .findByIdAndUpdate(req.body._id, req.body, { new: true })
                .populate('growerId', 'firstName lastName addresses fullAddress farmName')
                .populate('commodityId', 'commodityName sieveSizeNote')
                .populate('gradeId', 'gradeName')
                .populate('createdBy', 'signature');

            contract = await generateContractPDF(contract, req.admin._id, req.body.someFieldValueChanged);

            return SendResponse(res, {
              data: contract,
              userMessage: 'Information updated successfully.'
            });
        }
    } else {

        let contract = await Contract.findOne({ contractNumber: req.body.contractNumber });
        if (contract) {
            return SendResponse(res, {
                error: true,
                status: 400,
                userMessage: 'Contract number already exist.'
            });
        }

        req.body.createdBy = req.admin._id;
        req.body.statusBy = req.admin._id;
        req.body.statusAt = Date.now();

        contract = new Contract(req.body);
        await contract.save();

        let success = await Contract
            .findById(contract._id)
            .populate('growerId', 'firstName lastName fullAddress farmName addresses')
            .populate('commodityId', 'commodityName sieveSizeNote')
            .populate('gradeId', 'gradeName')
            .populate('createdBy', 'signature');

        success = await generateContractPDF(success, req.admin._id, req.body.someFieldValueChanged);

        return SendResponse(res, {
          data: success,
          userMessage: 'Information updated successfully.'
        });
    }
};

methods.productionHistory = async (req, res) => {
    let data = await productionContractHistory.find({ contractNumber: req.query.contractNumber })
        .sort('createdAt')
        .populate('growerId', 'firstName lastName farmName')
        .populate('commodityId', 'commodityName')
        .populate('gradeId', 'gradeName')
        .populate('inventoryGrade', 'gradeName')
        .populate('createdBy', 'fullName');

    return SendResponse(res, { data, userMessage: 'list.' });
};

methods.getLatestProductionContract = async function(req, res) {
    let success = await Contract
        .find({ status: { $nin: [2] } })
        .select('createdAt contractNumber growerId quantityLbs pdfUrl')
        .populate('growerId', 'firstName lastName')
        .sort('-createdAt')
        .limit(10);

    return SendResponse(res, {
        userMessage: "success",
        data: success
    });
};/*-----  End of addProductionContract  ------*/

methods.contractByGrower = async (req, res) => {
    let condition = { growerId: req.query.growerId };

    let count = await Contract.count(condition);

    let data = await Contract.paginate(condition, {
            //select: 'pdfUrl contractNumber personFarmType createdAt gradeId commodityId shipmentPeriodFrom shipmentPeriodTo CWTDel freightRatePerMT price priceUnit priceCurrency contractQuantity quantityUnit',
            page: 1,
            limit: count,
            populate: [
                {
                    path: 'commodityId',
                    select: 'commodityName'
                }, {
                    path: 'gradeId',
                    select: 'gradeName'
                }, {
                    path: 'scale',
                    match: {
                        ticketType: {
                            $ne: 'Outgoing'
                        }
                    },
                    select: 'unloadWeidht ticketType netWeight void'
                }, {
                    path: 'growerId',
                    select: 'firstName lastName farmName email'
                }
            ],
            lean: true,
            sort: '-createdAt'
        });

    return SendResponse(res, { userMessage: 'List', data });
};

/*======================================
***   getProductionContract  ***
========================================*/
methods.getProductionContract = async function(req, res) {
    var contracts, condition, options;
    if (req.query.growerId) {
        contracts = await Contract.find({ growerId: req.query.growerId })
            .populate('commodityId gradeId growerId createdBy signee')
            .populate('mailSentBy', 'fullName')
            .sort({ createdAt: -1 })
            .lean();
    } else if (req.query.commodityId) {
        contracts = await Contract.distinct( 'growerId', { commodityId: req.query.commodityId } )
            .populate('growerId')
            .sort({ createdAt: -1 })
            .lean();
    } else if (req.query.page && !req.query.search) {
        condition = {};
        options = {
            sort: { createdAt: -1 },
            page: req.query.page,
            limit: 10,
            populate: ('commodityId gradeId growerId createdBy'),
            lean: true
        };
        contracts = await Contract.paginate(condition, options);
    } else if (req.query.search && req.query.page) {
        condition = {
            contractNumber: {
                $regex: ".*" + req.query.search + ".*",
                $options: 'i'
            }
        };
        options = {
            sort: {
                createdAt: -1
            },
            page: req.query.page,
            limit: 10,
            populate: ('commodityId gradeId growerId createdBy'),
            lean: true
        };
        contracts = await Contract.paginate(condition, options);
    }

    if (req.query.commodityId) {
        let result = await Grower.find({ '_id': { $in: contracts } });

        return SendResponse(res, {
            userMessage: 'contracts list.',
            data: result
        });
    } else {
        return SendResponse(res, {
            userMessage: 'contracts list.',
            data: contracts
        });
    }
};/*-----  End of getProductionContract  ------*/

/*======================================
***   getProductionContractCount  ***
========================================*/
methods.getProductionContractCount = async function(req, res) {
    //Database functions here
    var query;
    if (req.query.commodityId) {
        query = {
            // status: 0,
            cropYear: req.query.cropYear,
            commodityId: req.query.commodityId
        };
    } else {
        query = { status: 0 };
    }
    let count  = await Contract
        .findOne(query)
        .sort('-contractNumber')
        .limit(1);

    return SendResponse(res, {
        userMessage: 'count.',
        data: count
    });
};/*-----  End of getProductionContractCount  ------*/

/*======================================
***   getProductionContractByContractNo  ***
========================================*/
methods.getProductionContractByContractNo = async function(req, res) {
    //Database functions here
    let contracts = await Contract.findOne({ contractNumber: req.params.contractNo })
        .populate('commodityId gradeId growerId grainBuyer createdBy')
        .lean();

    if (!contracts) {
        let purchaseContracts = await Confirmation.findOne({
                contractNumber: req.params.contractNo
            })
            .populate('commodityId gradeId growerId createdBy signee')
            .lean();

        return SendResponse(res, {
            userMessage: 'contracts Details.',
            data: purchaseContracts
        });
    } else {
        return SendResponse(res, {
            userMessage: 'contracts Details.',
            data: contracts
        });
    }
};/*-----  End of getProductionContractByContractNo  ------*/

/*============================
***   deleteProductionContract  ***
==============================*/
methods.deleteProductionContract = async function(req, res) {
    let grade = await Contract.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {
        userMessage: 'Contract deleted successfully.',
        data: grade
    });
};/*-----  End of deleteProductionContract  ------*/

methods.getPositionReport = async (req, res) => {
    const { year, commodityId, inventoryGrade } = req.query;

    if (!commodityId) {
        return SendResponse(res, {
            userMessage: 'commodityId is required.'
        });
    }

    if (!year && year == 'undefined') {
        return SendResponse(res, { userMessage: 'cropYear is required.' });
    }

    var condition = { $and: [ { commodityId: mongoose.Types.ObjectId(commodityId) } ] };

    condition.$and.push({ cropYear: year });

    if (inventoryGrade && inventoryGrade != 'undefined' && inventoryGrade != 'null') {
        condition.$and.push({'inventoryGrade': mongoose.Types.ObjectId(inventoryGrade)});
    }

    var bpCondition = {};
    bpCondition.$and = _.clone(condition.$and).filter(cond => !(_.keys(cond).includes('commodityId')));
    bpCondition.$and.push({ "byProductsByScale.byProducts.commodityId": mongoose.Types.ObjectId(commodityId) });

    async.parallel({
        firstOne: (cb) => {

            var aggregate = Contract.aggregate();

            aggregate
                .match(condition)
                .lookup({ from: "growers", localField: "growerId", foreignField: "_id", as: "growerId" })
                .unwind({ path: "$growerId", preserveNullAndEmptyArrays: true })
                .lookup({
                    from: "scales",
                    let: { contractNumber: "$contractNumber", scaleDate: "$date"  },
                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $ne: ["$void", true] },
                                        { $eq: ["$contractNumber", "$$contractNumber"] },
                                        // { $gte: ["$$scaleDate", cp.start] },
                                        // { $lte: ["$$scaleDate", cp.end] },
                                    ]
                                }
                            }
                        }, {
                            $project: { netWeight: 1, void:1 }
                        }
                    ],
                    as: "scale"
                })
                .project({
                    "type": "tradePurchase",
                    "productionId": "$_id",
                    "contractNumber": 1,
                    "showContractNumber": {
                        $cond: {
                            if: {$ne: ["$cropYear", year]},
                            then: {$concat: ["$contractNumber", '-R']},
                            else: "$contractNumber"
                        }
                    },
                    "nameOfContract": 1,
                    "commodityId": 1,
                    "gradeId": 1,
                    "growerId.firstName": 1,
                    "growerId.lastName": 1,
                    "growerId.farmName": 1,
                    "growerId._id": 1,
                    "personFarmType": 1,
                    "farmName": 1,
                    "cropYear": year,
                    "acres": 1,
                    "landLocation": 1,
                    "deliveryDateFrom": 1,
                    "deliveryDateTo": 1,
                    "deliveryYear": { "$year": "$deliveryDateTo" },
                    "deliveryMonth": { "$month": "$deliveryDateTo" },
                    "priceOption": 1,
                    "deliveryOption": 1,
                    "fixedPrice": 1,
                    "fixedPriceUnit": 1,
                    "fixedOnFirst": 1,
                    "quantityLbs": {
                        $cond: {
                            if: { $in: ["$status", [0, 2]] },
                            then: "$quantityLbs",
                            else: {
                              $reduce: {
                                  input: "$scale",
                                  initialValue: 0,
                                  in: {
                                      $sum: ["$$value", {
                                          "$multiply": ['$$this.netWeight', 2.2046]
                                      }]
                                  }
                              }
                          }
                        }
                    },
                    "fixedAdditionalProduction": 1,
                    "contractReturnDate": 1,
                    "growerRetain": 1,
                    "growerRetainUnits": 1,
                    "CWTDel": 1,
                    "otherComments": 1,
                    "grainBuyer": 1,
                    "createdBy": 1,
                    "createdAt": 1,
                    "status": 1,
                    "scale": 1
                }).group({
                    "_id": "$productionId",
                    "list": {
                        "$push": {
                            "type": "$type",
                            "contractNumber": "$contractNumber",
                            "showContractNumber": "$showContractNumber",
                            "nameOfContract": "$nameOfContract",
                            "commodityId": "$commodityId",
                            "gradeId": "$gradeId",
                            "growerId": "$growerId",
                            "personFarmType": "$personFarmType",
                            "farmName": "$farmName",
                            "cropYear": "$cropYear",
                            "acres": "$acres",
                            "landLocation": "$landLocation",
                            "deliveryDateFrom": "$deliveryDateFrom",
                            "deliveryDateTo": "$deliveryDateTo",
                            "deliveryYear": "$deliveryYear",
                            "deliveryMonth": "$deliveryMonth",
                            "priceOption": "$priceOption",
                            "deliveryOption": "$deliveryOption",
                            "fixedPrice": "$fixedPrice",
                            "fixedPriceUnit": "$fixedPriceUnit",
                            "fixedOnFirst": "$fixedOnFirst",
                            "quantityLbs": "$quantityLbs",
                            "totalCWT": { "$divide": ["$quantityLbs", 100] },
                            "fixedAdditionalProduction": "$fixedAdditionalProduction",
                            "contractReturnDate": "$contractReturnDate",
                            "growerRetain": "$growerRetain",
                            "growerRetainUnits": "$growerRetainUnits",
                            "CWTDel": "$CWTDel",
                            "otherComments": "$otherComments",
                            "grainBuyer": "$grainBuyer",
                            "createdBy": "$createdBy",
                            "createdAt": "$createdAt",
                            "status": "$status",
                            "scale": "$scale"
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
                })
                .exec((err, firstSucees) => {
                    cb(err, firstSucees);
                });
        },

        firstTwo: (cb) => {

            var aggregate = Contract.aggregate();

            aggregate
                .match({ "byProductsByScale": {$exists: true} })
                .unwind({ path: "$byProductsByScale", preserveNullAndEmptyArrays: false })
                .unwind({ path: "$byProductsByScale.byProducts", preserveNullAndEmptyArrays: false })
                .match(bpCondition)
                .lookup({ from: "growers", localField: "growerId", foreignField: "_id", as: "growerId" })
                .unwind({ path: "$growerId", preserveNullAndEmptyArrays: true })
                .project({
                    "type": "tradePurchase-bp",
                    "productionId": "$_id",
                    "contractNumber": 1,
                    "showContractNumber": {$concat: ["$contractNumber", '-BP']},
                    "nameOfContract": 1,
                    "commodityId": "$byProductsByScale.byProducts.commodityId",
                    "gradeId": 1,
                    "growerId.firstName": 1,
                    "growerId.lastName": 1,
                    "growerId.farmName": 1,
                    "growerId._id": 1,
                    "personFarmType": 1,
                    "farmName": 1,
                    "cropYear": year,
                    "acres": 1,
                    "landLocation": 1,
                    "deliveryDateFrom": 1,
                    "deliveryDateTo": 1,
                    "deliveryYear": { "$year": "$deliveryDateTo" },
                    "deliveryMonth": { "$month": "$deliveryDateTo" },
                    "priceOption": 1,
                    "deliveryOption": 1,
                    "fixedPrice": 1,
                    "fixedPriceUnit": 1,
                    "fixedOnFirst": 1,
                    "quantityLbs": "$byProductsByScale.byProducts.quantityLbs",
                    "fixedAdditionalProduction": 1,
                    "contractReturnDate": 1,
                    "growerRetain": 1,
                    "growerRetainUnits": 1,
                    "CWTDel": 1,
                    "otherComments": 1,
                    "grainBuyer": 1,
                    "createdBy": 1,
                    "createdAt": 1,
                    "status": { $cond: {
                        if: { $in: ["$status", [0, 1]] },
                        then: 1,
                        else: 2
                    }}
                })

                .group({
                    "_id": "$productionId",
                    "type": {"$first": "$type"},
                    "contractNumber": {"$first": "$contractNumber"},
                    "showContractNumber": {"$first": "$showContractNumber"},
                    "nameOfContract": {"$first": "$nameOfContract"},
                    "commodityId": {"$first": "$commodityId"},
                    "gradeId": {"$first": "$gradeId"},
                    "growerId": {"$first": "$growerId"},
                    "personFarmType": {"$first": "$personFarmType"},
                    "farmName": {"$first": "$farmName"},
                    "cropYear": {"$first": "$cropYear"},
                    "acres": {"$first": "$acres"},
                    "landLocation": {"$first": "$landLocation"},
                    "deliveryDateFrom": {"$first": "$deliveryDateFrom"},
                    "deliveryDateTo": {"$first": "$deliveryDateTo"},
                    "deliveryYear": {"$first": "$deliveryYear"},
                    "deliveryMonth": {"$first": "$deliveryMonth"},
                    "priceOption": {"$first": "$priceOption"},
                    "deliveryOption": {"$first": "$deliveryOption"},
                    "fixedPrice": {"$first": "$fixedPrice"},
                    "fixedPriceUnit": {"$first": "$fixedPriceUnit"},
                    "fixedOnFirst": {"$first": "$fixedOnFirst"},
                    "fixedAdditionalProduction": {"$first": "$fixedAdditionalProduction"},
                    "contractReturnDate": {"$first": "$contractReturnDate"},
                    "growerRetain": {"$first": "$growerRetain"},
                    "growerRetainUnits": {"$first": "$growerRetainUnits"},
                    "CWTDel": {"$first": "$CWTDel"},
                    "otherComments": {"$first": "$otherComments"},
                    "grainBuyer": {"$first": "$grainBuyer"},
                    "createdBy": {"$first": "$createdBy"},
                    "createdAt": {"$first": "$createdAt"},
                    "status": {"$first": "$status"},
                    "quantityLbs": { "$sum": "$quantityLbs" },
                })

                .group({
                    "_id": "$_id",
                    "list": {
                        "$push": {
                            "type": "$type",
                            "contractNumber": "$contractNumber",
                            "showContractNumber": "$showContractNumber",
                            "nameOfContract": "$nameOfContract",
                            "commodityId": "$commodityId",
                            "gradeId": "$gradeId",
                            "growerId": "$growerId",
                            "personFarmType": "$personFarmType",
                            "farmName": "$farmName",
                            "cropYear": "$cropYear",
                            "acres": "$acres",
                            "landLocation": "$landLocation",
                            "deliveryDateFrom": "$deliveryDateFrom",
                            "deliveryDateTo": "$deliveryDateTo",
                            "deliveryYear": "$deliveryYear",
                            "deliveryMonth": "$deliveryMonth",
                            "priceOption": "$priceOption",
                            "deliveryOption": "$deliveryOption",
                            "fixedPrice": "$fixedPrice",
                            "fixedPriceUnit": "$fixedPriceUnit",
                            "fixedOnFirst": "$fixedOnFirst",
                            "quantityLbs": "$quantityLbs",
                            "totalCWT": { "$divide": ["$quantityLbs", 100] },
                            "fixedAdditionalProduction": "$fixedAdditionalProduction",
                            "contractReturnDate": "$contractReturnDate",
                            "growerRetain": "$growerRetain",
                            "growerRetainUnits": "$growerRetainUnits",
                            "CWTDel": "$CWTDel",
                            "otherComments": "$otherComments",
                            "grainBuyer": "$grainBuyer",
                            "createdBy": "$createdBy",
                            "createdAt": "$createdAt",
                            "status": "$status",
                            "scale": {
                                netWeight: "$quantityLbs",
                                "void": { $cond: {
                                    if: {$eq: ["$status", 2]},
                                    then: true,
                                    else: false
                                }}
                            }
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
                })
                .exec((err, firstSucees) => {
                    cb(err, firstSucees);
                });
        },

        second: (cb) => {

            var aggregate = Confirmation.aggregate();

            aggregate
                .match(condition)
                .lookup({ from: "growers", localField: "growerId", foreignField: "_id", as: "growerId" })
                .unwind({ path: "$growerId", preserveNullAndEmptyArrays: true })
                .lookup({
                    from: "scales",
                    let: { contractNumber: "$contractNumber" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $ne: ["$void", true] },
                                    { $eq: ["$contractNumber", "$$contractNumber"] },
                                ]
                            }
                        }
                    }, {
                        $project: {
                          netWeight: {$cond: {
                            if: {$eq: ["$ticketType", "GrowerLoadSheet"]},
                            then: "$unloadWeidht",
                            else: "$netWeight"
                          }},
                          void: 1,
                        }
                    }],
                    as: "scale"
                })
                .project({
                    "type": "purchaseConfirmation",
                    "purchaseId": "$_id",
                    "contractNumber": 1,
                    "showContractNumber": {
                        $cond: {
                            if: {$ne: ["$cropYear", year]},
                            then: {$concat: ["$contractNumber", '-R']},
                            else: "$contractNumber"
                        }
                    },
                    "nameOfContract": 1,
                    "commodityId": 1,
                    "gradeId": 1,
                    "growerId": 1,
                    "brokerId": 1,
                    "personFarmType": 1,
                    "farmName": 1,
                    "cropYear": year,
                    "shipmentPeriodFrom": 1,
                    "shipmentPeriodTo": 1,
                    "deliveryPoint": 1,
                    "contractQuantity": 1,
                    "quantityUnit": 1,
                    "splitsPrice": 1,
                    "price": 1,
                    "priceUnit": 1,
                    "priceCurrency": 1,
                    "priceSplits": 1,
                    "otherConditions": 1,
                    "paymentTerms": 1,
                    "specifications": 1,
                    "sampleNumber": 1,
                    "settlementInstructions": 1,
                    "settlementComments": 1,
                    "freightRatePerMT": 1,
                    "CWTDel": 1,
                    "quantityLbs": 1,
                    "freightEstimate": 1,
                    "freightActual": 1,
                    "inventoryGrade": 1,
                    "history": 1,
                    "createdBy": 1,
                    "status": 1,
                    "createdAt": 1,
                    "scale": 1
                })
                .addFields({
                    "deliveryYear": { "$year": "$shipmentPeriodTo" },
                    "deliveryMonth": { "$month": "$shipmentPeriodTo" },
                    "quantityLbs": {
                        $cond: {
                            if: { $in: ["$status", [0, 2]] },
                            then: "$quantityLbs",
                            else: {
                              $reduce: {
                                  input: "$scale",
                                  initialValue: 0,
                                  in: {
                                      $sum: ["$$value", {
                                          "$multiply": ['$$this.netWeight', 2.2046]
                                      }]
                                  }
                              }
                            }
                        }
                    },
                }).group({
                    "_id": "$purchaseId",
                    "list": {
                        "$push": {
                            "type": "$type",
                            "contractNumber": "$contractNumber",
                            "showContractNumber": "$showContractNumber",
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
                            "deliveryYear": "$deliveryYear",
                            "deliveryMonth": "$deliveryMonth",
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
                            "quantityLbs": "$quantityLbs",
                            "totalCWT": { "$divide": ["$quantityLbs", 100] },
                            "freightEstimate": "$freightEstimate",
                            "freightActual": "$freightActual",
                            "inventoryGrade": "$inventoryGrade",
                            "history": "$history",
                            "createdBy": "$createdBy",
                            "status": "$status",
                            "createdAt": "$createdAt",
                            "scale": "$scale"
                        }
                    },
                    "total": { "$sum": { "$divide": ["$quantityLbs", 100] } }
                })
                .exec((err, secondSucees) => {
                    cb(err, secondSucees);
                });
        },

        secondTwo: (cb) => {

            var aggregate = Confirmation.aggregate();

            aggregate
                .match({ "byProductsByScale": {$exists: true} })
                .unwind({ path: "$byProductsByScale", preserveNullAndEmptyArrays: false })
                .unwind({ path: "$byProductsByScale.byProducts", preserveNullAndEmptyArrays: false })
                .match(bpCondition)
                .lookup({ from: "growers", localField: "growerId", foreignField: "_id", as: "growerId" })
                .unwind({ path: "$growerId", preserveNullAndEmptyArrays: true })
                .project({
                    "type": "purchaseConfirmation-bp",
                    "purchaseId": "$_id",
                    "contractNumber": 1,
                    "showContractNumber": {$concat: ["$contractNumber", '-BP']},
                    "nameOfContract": 1,
                    "commodityId": "$byProductsByScale.byProducts.commodityId",
                    "gradeId": 1,
                    "growerId": 1,
                    "brokerId": 1,
                    "personFarmType": 1,
                    "farmName": 1,
                    "cropYear": year,
                    "shipmentPeriodFrom": 1,
                    "shipmentPeriodTo": 1,
                    "deliveryPoint": 1,
                    "contractQuantity": 1,
                    "quantityUnit": 1,
                    "splitsPrice": 1,
                    "price": 1,
                    "priceUnit": 1,
                    "priceCurrency": 1,
                    "priceSplits": 1,
                    "otherConditions": 1,
                    "paymentTerms": 1,
                    "specifications": 1,
                    "sampleNumber": 1,
                    "settlementInstructions": 1,
                    "settlementComments": 1,
                    "freightRatePerMT": 1,
                    "CWTDel": 1,
                    "quantityLbs": "$byProductsByScale.byProducts.quantityLbs",
                    "freightEstimate": 1,
                    "freightActual": 1,
                    "inventoryGrade": 1,
                    "history": 1,
                    "createdBy": 1,
                    "status": { $cond: {
                        if: { $in: ["$status", [0, 1]] },
                        then: 1,
                        else: 2
                    }},
                    "createdAt": 1
                })
                .project({
                    "purchaseId": 1,
                    "contractNumber": 1,
                    "showContractNumber": 1,
                    "nameOfContract": 1,
                    "commodityId": 1,
                    "gradeId": 1,
                    "growerId": 1,
                    "brokerId": 1,
                    "personFarmType": 1,
                    "farmName": 1,
                    "cropYear": 1,
                    "shipmentPeriodFrom": 1,
                    "shipmentPeriodTo": 1,
                    "deliveryYear": { "$year": "$shipmentPeriodTo" },
                    "deliveryMonth": { "$month": "$shipmentPeriodTo" },
                    "deliveryPoint": 1,
                    "contractQuantity": 1,
                    "quantityUnit": 1,
                    "splitsPrice": 1,
                    "price": 1,
                    "priceUnit": 1,
                    "priceCurrency": 1,
                    "priceSplits": 1,
                    "otherConditions": 1,
                    "paymentTerms": 1,
                    "specifications": 1,
                    "sampleNumber": 1,
                    "settlementInstructions": 1,
                    "settlementComments": 1,
                    "freightRatePerMT": 1,
                    "CWTDel": 1,
                    "quantityLbs": 1,
                    "freightEstimate": 1,
                    "freightActual": 1,
                    "inventoryGrade": 1,
                    "history": 1,
                    "createdBy": 1,
                    "status": 1,
                    "createdAt": 1
                })
                .group({
                    "_id": "$purchaseId",
                    "contractQuantity": {"$first": "$contractQuantity"},
                    "quantityUnit": {"$first": "$quantityUnit"},
                    "type": {"$first": "$type"},
                    "contractNumber": {"$first": "$contractNumber"},
                    "showContractNumber": {"$first": "$showContractNumber"},
                    "nameOfContract": {"$first": "$nameOfContract"},
                    "commodityId": {"$first": "$commodityId"},
                    "gradeId": {"$first": "$gradeId"},
                    "growerId": {"$first": "$growerId"},
                    "brokerId": {"$first": "$brokerId"},
                    "personFarmType": {"$first": "$personFarmType"},
                    "farmName": {"$first": "$farmName"},
                    "cropYear": {"$first": "$cropYear"},
                    "shipmentPeriodFrom": {"$first": "$shipmentPeriodFrom"},
                    "shipmentPeriodTo": {"$first": "$shipmentPeriodTo"},
                    "deliveryYear": {"$first": "$deliveryYear"},
                    "deliveryMonth": {"$first": "$deliveryMonth"},
                    "deliveryPoint": {"$first": "$deliveryPoint"},
                    "splitsPrice": {"$first": "$splitsPrice"},
                    "price": {"$first": "$price"},
                    "priceUnit": {"$first": "$priceUnit"},
                    "priceCurrency": {"$first": "$priceCurrency"},
                    "priceSplits": {"$first": "$priceSplits"},
                    "otherConditions": {"$first": "$otherConditions"},
                    "paymentTerms": {"$first": "$paymentTerms"},
                    "specifications": {"$first": "$specifications"},
                    "sampleNumber": {"$first": "$sampleNumber"},
                    "settlementInstructions": {"$first": "$settlementInstructions"},
                    "settlementComments": {"$first": "$settlementComments"},
                    "freightRatePerMT": {"$first": "$freightRatePerMT"},
                    "CWTDel": {"$first": "$CWTDel"},
                    "freightEstimate": {"$first": "$freightEstimate"},
                    "freightActual": {"$first": "$freightActual"},
                    "inventoryGrade": {"$first": "$inventoryGrade"},
                    "createdBy": {"$first": "$createdBy"},
                    "status": {"$first": "$status"},
                    "createdAt": {"$first": "$createdAt"},
                    "quantityLbs": { "$sum": "$quantityLbs" },
                })
                .group({
                    "_id": "$_id",
                    "list": {
                        "$push": {
                            "type": "$type",
                            "contractNumber": "$contractNumber",
                            "showContractNumber": "$showContractNumber",
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
                            "deliveryYear": "$deliveryYear",
                            "deliveryMonth": "$deliveryMonth",
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
                            "quantityLbs": "$quantityLbs",
                            "totalCWT": { "$divide": ["$quantityLbs", 100] },
                            "freightEstimate": "$freightEstimate",
                            "freightActual": "$freightActual",
                            "inventoryGrade": "$inventoryGrade",
                            "history": "$history",
                            "createdBy": "$createdBy",
                            "status": "$status",
                            "createdAt": "$createdAt",
                            "scale": {
                                netWeight: "$quantityLbs",
                                "void": { $cond: {
                                    if: {$eq: ["$status", 2]},
                                    then: true,
                                    else: false
                                }}
                            }
                        }
                    },
                    "total": { "$sum": { "$divide": ["$quantityLbs", 100] } }
                })
                .exec((err, secondSucees) => {
                    cb(err, secondSucees);
                });
        },

        third: (cb) => {
            var aggregate = TradePurchase.aggregate();

            aggregate.match(condition);

            aggregate
                .lookup({ from: "buyers", localField: "buyerId", foreignField: "_id", as: "buyerId" })
                .unwind({ path: "$buyerId", preserveNullAndEmptyArrays: true })
                .lookup({
                    from: "tradepurchasescales",
                    localField: "contractNumber",
                    foreignField: "contractNumber",
                    as: "scale"
                })
                .project({
                    "type": "tradePurchase-1",
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
                    "quantityLbs": {
                        $cond: {
                            if: { $in: ["$status", [0, 2]] },
                            then: "$quantityLbs",
                            else: {
                                $reduce: {
                                    input: "$scale",
                                    initialValue: 0,
                                    in: { $sum: ["$$value", { "$multiply": ['$$this.unloadWeidht', 2.2046] }] }
                                }
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
            // if (year) {
            //     aggregate.match({ "deliveryYear": year });
            // }
            aggregate.group({
                "_id": "$salesId",
                "list": {
                    "$push": {
                        "type": "$type",
                        "contractNumber": "$contractNumber",
                        "showContractNumber": "$showContractNumber",
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
                "total": { "$sum": { "$divide": ["$quantityLbs", 100] } }
            }).exec((err, data) => {
                cb(err, data);
            });
        },

        fourth: (cb) => {
            var aggregate = CommodityAdjustments.aggregate();
            let query = { $and: _.clone(condition.$and) };
            query.$and.push({'purchaseSale': "purchase" });
            //console.log(query);
            aggregate.match(query);

            aggregate
                .project({
                    "type": "CommodityAdjustments-1",
                    "commodityAdjustmentId": "$_id",
                    "contractNumber": "Adjustment",
                    "contractName": "$reason",
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
                        "contractNumber": "$contractNumber",
                        "contractName": "$contractName",
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
                        "createdAt": "$createdAt",
                        "status": 1,
                    }
                },
                "total": { "$sum": { "$divide": ["$quantityLbs", 100] } }
            }).exec((err, data) => {
                console.log(data);
                cb(err, data);
            });
        }
    }, (err, success) => {
        if (err) {
            return SendResponse(res, {
                error: true,
                status: 500,
                errors: err,
                userMessage: 'some server error has occurred.'
            });
        }
        var data = [...success.firstOne, ...success.firstTwo, ...success.second, ...success.secondTwo, ...success.third, ...success.fourth];

        return SendResponse(res, { userMessage: 'contracts list.', data });
    });
};

methods.productionReport = (req, res) => {

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

    var aggregate = Contract.aggregate();
    aggregate
        .match(condition)
        .lookup({
            from: "growers",
            localField: "growerId",
            foreignField: "_id",
            as: "growerId"
        })
        .unwind({ path: "$growerId", preserveNullAndEmptyArrays: true })
        .lookup({
            from: "commodities",
            localField: "commodityId",
            foreignField: "_id",
            as: "commodityId"
        })
        .unwind({ path: "$commodityId", preserveNullAndEmptyArrays: true })
        .lookup({
            from: "grades",
            localField: "gradeId",
            foreignField: "_id",
            as: "gradeId"
        })
        .unwind({ path: "$gradeId", preserveNullAndEmptyArrays: true });

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
                    "personFarmType": "$personFarmType",
                    "farmName": "$farmName",
                    "cropYear": "$cropYear",
                    "acres": "$acres",
                    "landLocation": "$landLocation",
                    "deliveryDateFrom": "$deliveryDateFrom",
                    "deliveryDateTo": "$deliveryDateTo",
                    "priceOption": "$priceOption",
                    "deliveryOption": "$deliveryOption",
                    "fixedPrice": "$fixedPrice",
                    "fixedPriceUnit": "$fixedPriceUnit",
                    "fixedOnFirst": "$fixedOnFirst",
                    "fixedAdditionalProduction": "$fixedAdditionalProduction",
                    "contractReturnDate": "$contractReturnDate",
                    "growerRetain": "$growerRetain",
                    "growerRetainUnits": "$growerRetainUnits",
                    "CWTDel": "$CWTDel",
                    "otherComments": "$otherComments",
                    "grainBuyer": "$grainBuyer",
                    "createdBy": "$createdBy",
                    "createdAt": "$createdAt",
                    "quantityLbs": "$quantityLbs",
                    "status": "$status",
                    "freightRate": "$freightRate",
                    "pdfUrl": "$pdfUrl"

                }
            },
            "totalFixedOnFirst": {
                "$sum": "$fixedOnFirst"
            },
            "totalFixedPrice": {
                "$sum": "$fixedPrice"
            },
            "totalQuantityLbs": {
                "$sum": "$quantityLbs"
            },
            "totalCWTDel": {
                "$sum": "$CWTDel"
            },
            "totalAcres": {
                "$sum": "$acres"
            }
        });
    }

    aggregate.exec((err, data) => {
        if (err) {
            return SendResponse(res, {
                error: true,
                status: 500,
                errors: err,
                userMessage: 'some server error has occurred.'
            });
        } else {
            return SendResponse(res, {
                userMessage: 'contracts list.',
                data
            });
        }
    });
};

methods.getProductionContractList = async (req, res) => {
    let success = await Contract
        .find({
            commodityId: req.query.commodityId,
            growerId: req.query.growerId
        })
        .select('contractNumber gradeId');

    if (!success || success.length == 0) {
        return SendResponse(res, {
            status: 404,
            userMessage: 'Data not found.',
        });
    } else {
        return SendResponse(res, {
            userMessage: 'success.',
            data: success
        });
    }
};

methods.productionContractListByUser = async (req, res) => {
    var condition = {
        $and: [{ createdBy: req.query.adminId }]
    };

    if ((req.query.fromDate && req.query.fromDate != 'undefined') || (req.query.toDate && req.query.toDate != 'undefined')) {
        if (req.query.fromDate && req.query.toDate && req.query.fromDate != 'undefined' && req.query.toDate != 'undefined') {
            condition.$and.push({
                createdAt: { $gte: req.query.fromDate, $lte: req.query.toDate }
            });
        } else if (req.query.fromDate && req.query.fromDate != 'undefined') {
            condition.$and.push({
                createdAt: { $gte: req.query.fromDate }
            });
        } else if (req.query.toDate && req.query.toDate != 'undefined') {
            condition.$and.push({
                createdAt: { $lte: req.query.toDate }
            });
        }
    }

    let data = await Contract.paginate(condition, {
            select: 'contractNumber createdAt growerId personFarmType pdfUrl',
            page: req.query.page || 1,
            limit: 5,
            populate: { path: 'growerId', select: 'firstName lastName farmName' },
            lean: true,
            sort: '-createdAt'
        });

    return SendResponse(res, {
        userMessage: 'list.', data
    });
};

methods.canCreateRollover = async (req, res, next) => {
    let contract = await Contract.findById(req.body.contract_id).lean();

    if (!contract) {
        return SendResponse(res, {
            error: true,
            status: 404,
            userMessage: "Contract is not found."
        });
    }
    // contract is not active
    if (contract.status != 0) {
        return SendResponse(res, {
            error: true,
            status: 400,
            userMessage: "Contract is not in active state so can't be rolled over."
        });
    }

    const contractCropYear = CropYear.makeCropYear(contract.cropYear);

    // contract rollover is already defined or not eligible for new rollover
    if (contract.rolloverCN || moment().isBetween(contractCropYear.start, contractCropYear.end)) {
        return SendResponse(res, {
            error: true,
            status: 400,
            userMessage: "Contract is not eligible for rollover."
        });
    }

    const scaleCounts = await Scale.aggregate([
            { $match: { contractNumber: contract.contractNumber,  void: { $ne: true } }, },
            { $group: { _id: "$contractNumber", total: { $sum: "$netWeight" } } },
        ]);

    let totalScaleWeight = (scaleCounts && scaleCounts.length > 0) ? scaleCounts[0].total : 0;

    // over delivered contract
    if (totalScaleWeight * 2.20462 >= contract.quantityLbs) {
        return SendResponse(res, {
            status: 400,
            error: true,
            userMessage: "Contract has been over delivered."
        });
    }

    req.contract = contract;
    req.scaleTotal = totalScaleWeight;

    next();
};

methods.productionContractRollover = async (req, res) => {
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

    let { contract, scaleTotal, admin, rolloverContract } = req;
    let currentCropYear = CropYear.currentCropYear();

    if (!contract.rolloverCN) {
      let contractQuantity = 0;
      let commodity = null;

      switch(contract.units) {
        case 'MT':
          contractQuantity = +(req.body.quantityLbs / 2204.62).toFixed(4);
          break;

        case 'CWT':
          contractQuantity = req.body.quantityLbs / 100;
          break;

        case 'BU':
          commodity = await Commodity.findById(contract.commodityId);
          contractQuantity = +(req.body.quantityLbs / (commodity ? (commodity.commodityWeight || 1) : 60)).toFixed(4);
          break;

        default:
          contractQuantity = req.body.quantityLbs;
      }

      const rolloverCN = `${contract.contractNumber}-R`;
      const rolloverContractData = _.assign({}, contract, {
        contractNumber: rolloverCN,
        originalCN: contract.contractNumber,
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
      delete rolloverContractData._id;

      rolloverContract = await (new Contract(rolloverContractData)).save();

      contract = await Contract.findByIdAndUpdate(
        { _id: contract._id },
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

    await generateContractPDF(rolloverContract._id.toString(), req.admin._id);

    return SendResponse(res, {
        data: contract,
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

    let data = await Contract
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
