var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var TradePurchaseScale = mongoose.model('tradePurchaseScale');
var Scale = mongoose.model('scale');
var TradePurchase = mongoose.model('tradePurchase');
var moment = require('moment');
var Buyer = mongoose.model('buyer');
// const Grower = mongoose.model("grower");
var Sales = mongoose.model('salesContract');
const generatePdf = require("@ag-libs/generatePdf");
const { SendResponse } = require("@ag-common");

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
        .route('/tradePurchaseScale/getContractList')
        .get(session.adminCheckToken, methods.getContractList);

    router
        .route('/tradePurchaseScale/generateTicketNumber')
        .get(session.adminCheckToken, methods.generateTicketNumber);

    router
        .route('/tradePurchaseScale/addTradePurchaseScale')
        .post(session.adminCheckToken, methods.addTradePurchaseScale);

    router
        .route('/tradePurchaseScale/updateTradePurchaseScale')
        .post(session.adminCheckToken, methods.updateTradePurchaseScale);

    router
        .route('/tradePurchaseScale/getAllTradePurchaseList')
        .get(session.adminCheckToken, methods.getAllTradePurchaseList);

    router
        .route('/tradePurchaseScale/searchTradePurchaseScale')
        .put(session.adminCheckToken, methods.searchTradePurchaseScale);

    router
        .route('/tradePurchaseScale/getScaleTicketDetails')
        .get(session.adminCheckToken, methods.getScaleTicketDetails);

    router
        .route('/tradePurchaseScale/getTradeScalePdf')
        .get(session.adminCheckToken, methods.getTradeScalePdf);

    router
        .route('/tradePurchaseScale/unlockTicket')
        .get(session.adminCheckToken, methods.unlockTicket);

    router
        .route('/tradePurchaseScale/exportData')
        .post(methods.exportData);

    router
        .route('/tradePurchaseScale/uploadPdf')
        .put(methods.uploadPdf);

    router
        .route('/tradePurchaseScale/removeSignedContract')
        .put(session.adminCheckToken, methods.removeSignedContract);

    router
        .route('/tradePurchaseScale/ticketList')
        .get(methods.ticketList);
};

methods.getContractList = async (req, res) => {
    const {buyerId, commodityId, excludeSales} = req.query;
    const condition = { status: 0, commodityId };
    if (buyerId) {
      condition.buyerId = buyerId;
    }

    let data = await TradePurchase.find(condition).lean();
    if (!excludeSales) {
      data = data.concat(await Sales.find(condition).lean());
    }

    return SendResponse(res, { data, userMessage: 'Trade purchase list.' });
};

methods.generateTicketNumber = async (req, res) => {
    const data = await TradePurchaseScale.find({ status: 0 })
        .select('ticketNumber')
        .sort('-createdAt')
        .limit(10);

    if (data && data.length) {
        return SendResponse(res, { data, userMessage: 'Ticket number found.' });
    }

    return SendResponse(res, { status: 404, userMessage: 'Ticket not found.' });
};

methods.generateScalePdf = async (scaleId, done) => {
  const scale = await TradePurchaseScale.findOne({_id: scaleId})
    .populate("analysis.analysisId", "analysisName")
    .populate(
      "commodityId",
      "commodityName commodityShowShipmentAnalysis commodityTypeId"
    )
    .populate("buyerId", "businessName addresses");

  generatePdf.generatePDF("tradePurchaseScaleTicket", scale, async function( err, pdfUrl ) {
    if (err) return done(err);

    let updatedScale = await TradePurchaseScale.findByIdAndUpdate(
      scaleId,
      { $set: { pdfUrl, updatePdf: false } },
      { new: true, lean: true }
    );
    done(null, updatedScale);
  });
};

methods.addTradePurchaseScale = async (req, res) => {

    let data = await TradePurchaseScale.findOne({ ticketNumber: req.body.ticketNumber, status: 0 });

    if (data) {
        return SendResponse(res, { status: 400, userMessage: 'Ticket number already generated.', error: true });
    }

    data = await (new TradePurchaseScale(req.body)).save();

    const quantityLbs = req.body.unloadWeidht * 2.20462;
    const {contractNumber} = req.body;

    switch (contractNumber[0]) {
        case 'S': {
            let sale = await Sales.findOne({contractNumber});
            if (!sale) {
                break;
            }

            let inc = {delQty: quantityLbs};

            await Sales.findOneAndUpdate({contractNumber}, {$inc: inc});
            break;
        }

        case 'P':
        default:
            await TradePurchase.findOneAndUpdate({contractNumber}, {$inc: {shippingQtyLbs: quantityLbs}});
    }

    if (req.body.salesContractNumber) {
        await methods.modifyShippedQuanitySalesContract(req.body.salesContractNumber, quantityLbs);
    }

    methods.generateScalePdf(data._id, (err, updatedScale) => {
      if (err) return SendResponse(res, {error: true, errors: err, status: 500});

      return SendResponse(res, { data: updatedScale, userMessage: 'Ticket saved.' });
    });
};

methods.modifyShippedQuanitySalesContract = async (contractNumber, quantityLbs) => {
    let sales = await Sales.findOne({contractNumber});

    let inc = {delQty: quantityLbs};
    await Sales.findByIdAndUpdate(sales._id, {$inc: inc});
};

methods.updateTradePurchaseScale = async (req, res) => {

    let data = await TradePurchaseScale.findOne({ ticketNumber: req.body.ticketNumber, _id: { $ne: req.body._id } });

    if (data) {
        return SendResponse(res, { error: true, status: 400, userMessage: 'Ticket number already generated.' });
    }

    data = await TradePurchaseScale.findByIdAndUpdate(req.body._id, req.body);

    const old_quantity = data.unloadWeidht * 2.20462, new_quantity = req.body.unloadWeidht * 2.20462;
    const old_void = Boolean(data.void), new_void = Boolean(req.body.void);
    const net_quantity = old_void === new_void ?
                            (new_void ? 0 : (new_quantity - old_quantity)) :
                            (new_void ? -1 * old_quantity : new_quantity);

    const {contractNumber} = req.body;
    switch (contractNumber[0]) {
        case 'S':{
            let sale = await Sales.findOne({contractNumber});
            if (!sale) {
                break;
            }

            let inc = {delQty: net_quantity};
            await Sales.findOneAndUpdate({contractNumber}, {$inc: inc});
            break;
        }

        case 'P':
        default:
            await TradePurchase.findOneAndUpdate({contractNumber}, {$inc: {shippingQtyLbs: net_quantity}});

    }

    // if old ticket has no sales contract entry and new has
    //      in this case whole new quantity should be increased in new sales contract's shipped or delQty value
    if (!data.salesContractNumber && req.body.salesContractNumber && !req.body.void) {
        await methods.modifyShippedQuanitySalesContract(req.body.salesContractNumber, new_quantity);
    }

    // if old ticket has sale contract and new doesn't
    //      in this case old quantity of ticket should be reduced in same sales contract's shipped or delQty value
    else if (data.salesContractNumber && (!req.body.salesContractNumber || req.body.void)) {
        await methods.modifyShippedQuanitySalesContract(data.salesContractNumber, -1 * old_quantity);
    }

    // if old ticket and new both has sale contract
    //      in this case difference of quantities should be summed in sales contract's shipped or delQty value
    else if (data.salesContractNumber && req.body.salesContractNumber) {
        await methods.modifyShippedQuanitySalesContract(data.salesContractNumber, net_quantity);
    }

    methods.generateScalePdf(data._id, (err, updatedScale) => {
      if (err) return SendResponse(res, {error: true, errors: err, status: 500});

      return SendResponse(res, { data: updatedScale, userMessage: 'Ticket updated.' });
    });
};

// const growerLoadSheetType = 'GrowerLoadSheet';
// if (growerLoadSheetType){

//     methods.growerLoadSheets = async (req, res) => {
//         const growerId = req.params.growerId;   
      
//         const data = await Scale.find({ticketType: growerLoadSheetType, growerId})
//           .populate('commodityId');
      
//         return SendResponse(res, {
//           data, userMessage: 'Grower Load Sheets fetched successfully',
//         });
//       };
//     }else {
//     }
    
            methods.getAllTradePurchaseList = async (req, res) => {
            
                let data = await TradePurchaseScale
                    .find({ buyerId: req.query.buyerId, status: 0}) 
                    .populate('commodityId', 'commodityName')
                    .populate('buyerId', 'businessName')
                    .populate('growerId', 'farmName' )
                    .sort({date: -1});
            
                console.log(data ,'nitin');
                return SendResponse(res, { userMessage: 'List found.', data });
            };
  

methods.searchTradePurchaseScale = async (req, res) => {

    let query = { $and: [{ status: 0 }] };
    
    // if (req.body.ticketType == 'OutgoingSeed'){
    //     console.log('nitin');
    //     query.$and.push({ ticketType: "OutgoingSeed" });
    //     // query.$and.push({ contractType: "Incoming" });
        
    // }

    if (req.body.commodity) {
        query.$and.push({ commodityId: req.body.commodity });
    }

    if (req.body.contractNumber) {
        query.$and.push({ contractNumber: { $regex: ".*" + req.body.contractNumber + ".*", $options: 'i' } });
    }

    if (req.body.ticketNumber) {
        query.$and.push({ ticketNumber: { $regex: ".*" + req.body.ticketNumber + ".*", $options: 'i' } });
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

    var options = {
        sort: { date: -1, ticketNumber: -1 },
        page: Number(req.query.page) || 1,
        limit: Number(req.body.limit) || 10,
        populate: [
            { path: 'commodityId', select: 'commodityName' },
            { path: 'buyerId', select: 'firstName lastName businessName' },
            // { path: "growerId", select: "firstName lastName farmName email" },
            { path: 'truckingCompany', select: 'truckerName' }
        ],
        lean: true
    };

    if (req.body.name ) {
        var buyerCondition = {
            $or: [
                { firstName: { $regex: ".*" + req.body.name + ".*", $options: 'i' } },
                { lastName: { $regex: ".*" + req.body.name + ".*", $options: 'i' } },
                { businessName: { $regex: ".*" + req.body.name + ".*", $options: 'i' } }
            ]
        };

        let buyer = await Buyer.find(buyerCondition);

        if (buyer.length > 0) {
            query.$and.push({ buyerId: { $in: buyer.map((val) => val._id) } });
        }
        // var growerCondition = {
        //     $or: [
        //     { firstName: { $regex: ".*" + req.body.name + ".*", $options: "i" } },
        //     { lastName: { $regex: ".*" + req.body.name + ".*", $options: "i" } },
        //     { farmName: { $regex: ".*" + req.body.name + ".*", $options: "i" } }
        //     ]
        // };
    
        // let grower = await Grower.find(growerCondition);
    
        // if (grower.length > 0) {
        //     query.$and.push({ growerId: { $in: grower.map(val => val._id) } });
        // }
    }
    
    let data = await TradePurchaseScale.paginate(query, options);

    return SendResponse(res, { data, userMessage: 'list.' });
};

methods.getScaleTicketDetails = async (req, res) => {
    let data = await TradePurchaseScale
        .findById(req.query._id)
        .populate('commodityId', 'commodityName')
        .populate('analysis.analysisId', 'analysisName');

    return SendResponse(res, { data, userMessage: 'data found.' });
};

methods.getTradeScalePdf = async (req, res) => {
    let data = await TradePurchaseScale
        .findById(req.query._id)
        .populate('commodityId', 'commodityName')
        .populate('buyerId', 'businessName addresses firstName lastName')
        // .populate('growerId', 'farmName firstName lastName email' )
        .populate('truckingCompany', 'truckerName');

    return SendResponse(res, { data, userMessage: 'data found.' });
};

methods.unlockTicket = async function(req, res) {

    let data = await TradePurchaseScale.findByIdAndUpdate(req.query._id, { $set: { analysisCompleted: false } });

    if (data) {
        return SendResponse(res, { userMessage: 'Success.' });
    }

    return SendResponse(res, { status: 404, error: true, userMessage: 'Invalid scale ticket Id.' });
};

methods.exportData = async function(req, res) {
    req.checkBody('fileName', 'fileName code is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    let query = { $and: [{ status: 0 }] };
    let newData;

    if (req.body.filter) {
        if (req.body.filterBy.commodity) {
            query.$and.push({ commodityId: req.body.filterBy.commodity });
        }

        if (req.body.filterBy.fromDate || req.body.filterBy.toDate) {
            if (req.body.filterBy.fromDate && req.body.filterBy.toDate) {
                query.$and.push({ date: { $gte: req.body.filterBy.fromDate, $lte: req.body.filterBy.toDate } });
            } else if (req.body.filterBy.fromDate) {
                query.$and.push({ date: { $gte: req.body.filterBy.fromDate } });
            } else {
                query.$and.push({ date: { $lte: req.body.filterBy.toDate } });
            }
        }

        const data = await TradePurchaseScale
            .find(query)
            .populate('buyerId', 'businessName')
            // .populate('growerId', 'farmName firstName lastName email' )
            .populate('commodityId', 'commodityName')
            .populate('truckingCompany', 'truckerName');

        if (data.length == 0) {
            res.xls(req.body.fileName, []);
        } else {
            var group_data = {};

            for (var i = 0; i < data.length; i++) {
                if (data[i].commodityId) {
                    if (group_data[data[i].commodityId._id]) {
                        group_data[data[i].commodityId._id].push(data[i]);
                    } else {
                        group_data[data[i].commodityId._id] = [data[i]];
                    }
                }
            }

            newData = [];
            for (var key in group_data) {
                var commdityName = group_data[key][0].commodityId.commodityName;
                var list = group_data[key];

                newData.push({
                    'Date': commdityName,
                    'Ticket Number': '',
                    'Bin': '',
                    'Trucking Company': '',
                    'Gross': '',
                    'Tare': '',
                    'Net': '',
                    'Contrat Number': '',
                    'Buyer Name': '',
                    // 'Grower Name' : '',
                    'Commodity': '',
                    'Grade': '',
                    'Xero Invoice': '',
                    'Code': '',
                    'Created At': ''
                });

                list.map((scale) => {
                    newData.push({
                        'Date': moment(scale.date).format('MM/DD/YYYY'),
                        'Ticket Number': scale.ticketNumber,
                        'Bin': scale.binNumber,
                        'Trucking Company': scale.truckingCompany ? scale.truckingCompany.truckerName : '',
                        'Gross': scale.grossWeightMT || 0,
                        'Tare': scale.tareWeightMT || 0,
                        'Net': scale.unloadWeidhtMT,
                        'Contrat Number': scale.contractNumber || '',
                        'Buyer Name': scale.buyerId && scale.buyerId.businessName ? scale.buyerId.businessName : '',
                        // 'Grower Name': scale.growerId && scale.growerId.farmName ? scale.growerId.farmName : '',
                        'Commodity': scale.commodityId ? scale.commodityId.commodityName : '',
                        'Grade': scale.gradeId ? scale.gradeId.gradeName : '',
                        'Xero Invoice': scale.invoiceNumber,
                        'Code': scale.commodityId ? scale.commodityId.commodityCode : '',
                        'Created At': moment(scale.createdAt).format('MM/DD/YYYY')
                    });
                });

            }
            res.xls(req.body.fileName, newData);
        }
    } else {
        let data = await TradePurchaseScale
            .find(query)
            .populate('buyerId', 'businessName')
            .populate('commodityId', 'commodityName')
            // .populate('growerId', 'farmName firstName lastName email' )
            .populate('truckingCompany', 'truckerName');

        newData = data.map((scale) => {
            return {
                'Date': moment(scale.date).format('MM/DD/YYYY'),
                'Ticket Number': scale.ticketNumber,
                'Bin': scale.binNumber,
                'Trucking Company': scale.truckingCompany ? scale.truckingCompany.truckerName : '',
                'Gross': scale.grossWeightMT || 0,
                'Tare': scale.tareWeightMT || 0,
                'Net': scale.unloadWeidhtMT,
                'Contrat Number': scale.contractNumber || '',
                'Buyer Name': scale.buyerId && scale.buyerId.businessName ? scale.buyerId.businessName : '',
                // 'Grower Name': scale.growerId && scale.growerId.farmName ? scale.growerId.farmName : '',
                'Commodity': scale.commodityId ? scale.commodityId.commodityName : '',
                'Grade': scale.gradeId ? scale.gradeId.gradeName : '',
                "Xero Invoice": scale.invoiceNumber,
                'Code': scale.commodityId ? scale.commodityId.commodityCode : '',
                'Created At': moment(scale.createdAt).format('MM/DD/YYYY')
            };
        });
        res.xls(req.body.fileName, newData);
    }
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
            await TradePurchaseScale
                .findByIdAndUpdate(req.query.scaleId, {
                    $set: { signedContractPdf: url.split("?")[0], contractIsSigned: true }
                });

            return SendResponse(res, { userMessage: "Pdf uploaded" });
        });
    });
};

methods.removeSignedContract = async (req, res) => {
    let data = await TradePurchaseScale.findByIdAndUpdate(req.query.scaleId, {
            $set: { signedContractPdf: "", contractIsSigned: false }
        });

    if (!data) {
        return SendResponse(res, { status: 400, userMessage: "Something went wrong." });
    }

    return SendResponse(res, { userMessage: "Pdf uploaded" });
};

methods.ticketList = async (req, res) => {
    let data = [];
    let query = { $and: [
      {status: 0},
      {
        $or: [
          {void: {$exists: false}},
          {void: false}
        ]
      }
    ]};

    const contractNumber = req.query.salesContractNumber;
    if (contractNumber) {
        query['$and'].push({'$or': [{salesContractNumber: contractNumber}, {contractNumber}]});
    } else if (req.query.contractNumber) {
        query['$and'].push({contractNumber: req.query.contractNumber});
    }

    if (Object.keys(query.$and).length > 1) {
        data = await TradePurchaseScale
            .find(query)
            .select(
                "contractNumber ticketNumber date netWeight analysis displayOnTicket unloadWeidht ticketMailSent ticketMailDate moisture void"
            )
            .populate("buyerId", "businessName email")
            // .populate('growerId', 'farmName firstName lastName email' )
            .populate("analysis.analysisId", "analysisName")
            .lean();

        query['$and'].push({growerOrBuyer: 'Buyer' , growerOrBuyer: 'Grower'});
        query['$and'].push({ticketType: 'Incoming'});

        const incomingScale = await Scale.find(query)
            .select(
                "ticketType contractNumber ticketNumber date netWeight analysis displayOnTicket unloadWeidht ticketMailSent ticketMailDate moisture void"
            )
            .populate("buyerId", "businessName email")
            .populate("analysis.analysisId", "analysisName")
            .lean();

        if (incomingScale.length > 0) data = data.concat(incomingScale);
    }

    return SendResponse(res, { data, userMessage: 'Trade purchase ticket list.' });
};
