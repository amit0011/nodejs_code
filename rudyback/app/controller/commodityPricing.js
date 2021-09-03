var mongoose = require('mongoose');
const moment = require('moment');
var session = require('@ag-libs/session');
var CommodityPricing = mongoose.model('commodityPricing');
var Commodity = mongoose.model('commodity');
var Archive = mongoose.model('archive');
var Grade = mongoose.model('grade');
const { SendResponse } = require("@ag-common");
var generateExcel = require('@ag-libs/generateExcel');

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/commodityPricing')
        .post(session.adminCheckToken, methods.addCommodityPricing)
        .get(session.adminCheckToken, methods.getCommodityPricing)
        .put(session.adminCheckToken, methods.updateCommodityPricing);

    router
        .route('/commodityPricing/delete')
        .post(session.adminCheckToken, methods.removeCommodityPricing);

    router
        .route('/commodity/pricing')
        .post(session.adminCheckToken, methods.getCommodityPrice);

    router
        .route('/commodityPricing/applyDefault')
        .put(session.adminCheckToken, methods.applyDefault);

    router
        .route('/commodityList')
        .get(session.adminCheckToken, methods.getCommodity);

    router
        .route('/gradesByCommodity')
        .get(session.adminCheckToken, methods.gradesByCommodity);

    router
        .route('/commodityPricing/netFob')
        .get(session.adminCheckToken, methods.getNetFob);

    router
        .route('/commodityPricing/archive/excel')
        .get(session.adminCheckToken, methods.getArchiveExcel);
};

/****************************************************************
***   get grade list bases of commodityId  ***
****************************************************************/
methods.gradesByCommodity = async (req, res) => {
    let gradesId = await CommodityPricing.distinct("gradeId", { commodityId: req.query.commodityId });

    if (gradesId.length == 0) {
        return SendResponse(res, {data: [], userMessage: 'Grade list empty.'});
    }
    let data = await Grade.find({ _id: { $in: gradesId } })
        .select('gradeName')
        .sort('gradeName');

    return SendResponse(res, {data, userMessage: 'Grades list.'});
};/*-----  End of grade list  ------*/

/****************************************************************
***   get commodity list  ***
****************************************************************/
methods.getCommodity = async (req, res) => {
    let productsId = await CommodityPricing.distinct("commodityId");

    if (productsId.length == 0) {
        return SendResponse(res, {data: [], userMessage: 'Product list empty.'});
    }

    let data = await Commodity.find({ _id: { $in: productsId } })
        .select('commodityName')
        .sort('commodityName');

    return SendResponse(res, {data, userMessage: 'Product list empty.'});
};/*-----  End of getCommodityPrice  ------*/

/****************************************************************
***   getCommodityPrice  ***
****************************************************************/
methods.getCommodityPrice = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('commodityId', 'commodityId is required.').notEmpty();
    req.checkBody('gradeId', 'gradeId is required.').notEmpty();
    req.checkBody('cropYear', 'cropYear is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await CommodityPricing.findOne({
        commodityId: req.body.commodityId,
        gradeId: req.body.gradeId,
        cropYear: req.body.cropYear
    });

    if (!data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Pricing details not found.'
        });
    }
    return SendResponse(res, {data, userMessage: 'Commodity Price added successfully.'});
};/*-----  End of getCommodityPrice  ------*/

methods.applyDefault = async function(req, res) {
  req.checkBody('shippingPeriodFrom', 'Shipping period from is required.').notEmpty();
  req.checkBody('shippingPeriodTo', 'Shipping period to is required').notEmpty();

  let errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      error: true, status: 400, errors,
      userMessage: 'Validation errors'
    });
  }

  await CommodityPricing.updateMany(
    {shippingPeriodEntry: {$ne: 'Manual'}},
    {$set: {
      shippingPeriodFrom: req.body.shippingPeriodFrom,
      shippingPeriodTo: req.body.shippingPeriodTo
    }}
  );

  SendResponse(res, {status: 200});
};

/****************************************************************
***   Add New CommodityPricing  ***
****************************************************************/
methods.addCommodityPricing = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('commodityId', 'Commdity Name  is required.').notEmpty();
    req.checkBody('gradeId', 'Grade Name is required.').notEmpty();
    req.checkBody('price', 'Price is required.').notEmpty();
    req.checkBody('priceAsPer', 'Price As Per is required.').notEmpty();
    req.checkBody('unit', 'unit is required.').notEmpty();
    req.checkBody('cdnCwt', 'cdnCwt is required.').notEmpty();
    req.checkBody('margin', 'margin is required.').notEmpty();
    req.checkBody('currencyType', 'currencyType is required.').notEmpty();
    req.checkBody('cropYear', 'cropYear is required.').notEmpty();
    if (req.body.priceAsPer == 'Quantity') {
        req.checkBody('quantity', 'quantity is required.').notEmpty();
        req.checkBody('quantityUnit', 'quantityUnit is required.').notEmpty();
    }
    let errors = req.validationErrors(true);
    if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
    }

    let targetFOB = Number(req.body.cdnCwt) + Number(req.body.margin);

    req.body.targetFOB = targetFOB; //=SUM(F2:G2)
    let bagged_USD_CWT_FOBPlant = 0;
    if (req.body.currencyType == 'CAD') {
        bagged_USD_CWT_FOBPlant = targetFOB / (req.body.exchangeRate || 1.3075);
    } else {
        bagged_USD_CWT_FOBPlant = targetFOB;
    }

    //  var bagged_USD_CWT_FOBPlant = req.body.currencyType == 'CAD' ? targetFOB / (req.body.exchangeRate || 1.3075) : targetFOB; //=SUM(H2/T2)
    let bagged_USD_MT_FOBPlant = bagged_USD_CWT_FOBPlant * 22.046; //SUM(I2 *22.0462)
    let bulk_USD_MTFOBPlant = bagged_USD_MT_FOBPlant - 11.023; //=SUM(J2 - 11.023)
    let bagged_USD_MT_Montreal = Number(bagged_USD_MT_FOBPlant) + (3.55 * 22.046); //=SUM(J2+(3.55 *22.046))
    let bulk_USD_MT_Montreal = Number(bulk_USD_MTFOBPlant) + (3.79 * 22.046); //=SUM(K2 + (3.79 *22.046))
    let bagged_USD_MT_Vancouver = bagged_USD_MT_FOBPlant + (2.62 * 22.046); //=SUM(J2 + (2.62 * 22.046))
    let bulk_USD_MT_Vancouver = bulk_USD_MTFOBPlant + (2.80 * 22.046); //=SUM(K2 + (2.8 * 22.046))

    req.body.bagged_USD_CWT_FOBPlant = bagged_USD_CWT_FOBPlant;
    req.body.bagged_USD_MT_FOBPlant = bagged_USD_MT_FOBPlant;
    req.body.bulk_USD_MTFOBPlant = bulk_USD_MTFOBPlant;
    req.body.bagged_USD_MT_Montreal = bagged_USD_MT_Montreal;
    req.body.bulk_USD_MT_Montreal = bulk_USD_MT_Montreal;
    req.body.bagged_USD_MT_Vancouver = bagged_USD_MT_Vancouver;
    req.body.bulk_USD_MT_Vancouver = bulk_USD_MT_Vancouver;

    let data = await (new CommodityPricing(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Commodity Price added successfully.' });
};/*-----  End of addCommodityPricing  ------*/

/****************************************************************
***   Get All CommodityPricing List  ***
****************************************************************/
methods.getCommodityPricing = async function(req, res) {
    let query, options, condition = { status: 0 };

    if (req.query.page) {
        options = {
            sort: { createdAt: -1 },
            page: req.query.page,
            limit: 10,
            populate: 'commodityId gradeId growerId createdBy',
            lean: true
        };
        query = CommodityPricing.paginate(condition, options);
    } else {
        query = CommodityPricing
            .find(condition)
            .populate('createdBy', 'fullName avatar signature type roles')
            .populate('commodityId ', 'commodityName ')
            .populate('gradeId', ' gradeName')
            .lean();
    }

    if (req.query.commodityId) {
        condition = {
            status: 0,
            commodityId: req.query.commodityId,
        };
        query = CommodityPricing
            .find(condition)
            .populate('commodityId gradeId growerId createdBy')
            .lean();
    }

    if (req.query.commodityId && req.query.gradeId && req.query.cropYear) {
        condition = {
            status: 0,
            commodityId: req.query.commodityId,
            gradeId: req.query.gradeId,
            cropYear: req.query.cropYear
        };
        query = CommodityPricing
            .findOne(condition)
            .populate('commodityId gradeId growerId createdBy')
            .lean();
    }

    let data = await query.exec();

    return SendResponse(res, {data,  userMessage: 'Price list.'});
};/*-----  End of getCommodityPricing  ------*/

/****************************************************************
***   updateCommodityPricing  ***
****************************************************************/
methods.updateCommodityPricing = async function(req, res) {
    let price = await CommodityPricing.findOne({ _id: req.body._id });

    if (!price) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Pricing details not found.'
        });
    }

    var targetFOB = Number(req.body.cdnCwt) + Number(req.body.margin);

    var bagged_USD_CWT_FOBPlant = 0;
    if (req.body.currencyType == 'CAD') {
        bagged_USD_CWT_FOBPlant = targetFOB / (req.body.exchangeRate || 1.3075);
    } else {
        bagged_USD_CWT_FOBPlant = targetFOB;
    }

    // var bagged_USD_CWT_FOBPlant = targetFOB / (req.body.exchangeRate || 1.3075); //=SUM(H2/T2)
    var bagged_USD_MT_FOBPlant = bagged_USD_CWT_FOBPlant * 22.046; //SUM(I2 *22.0462)
    var bulk_USD_MTFOBPlant = bagged_USD_MT_FOBPlant - 11.023; //=SUM(J2 - 11.023)
    var bagged_USD_MT_Montreal = Number(bagged_USD_MT_FOBPlant) + (3.55 * 22.046); //=SUM(J2+(3.55 *22.046))
    var bulk_USD_MT_Montreal = Number(bulk_USD_MTFOBPlant) + (3.79 * 22.046); //=SUM(K2 + (3.79 *22.046))
    var bagged_USD_MT_Vancouver = bagged_USD_MT_FOBPlant + (2.62 * 22.046); //=SUM(J2 + (2.62 * 22.046))
    var bulk_USD_MT_Vancouver = bulk_USD_MTFOBPlant + (2.80 * 22.046); //=SUM(K2 + (2.8 * 22.046))

    price.targetFOB = targetFOB;
    price.cropYear = req.body.cropYear;
    price.cdnCwt = req.body.cdnCwt;
    price.margin = req.body.margin;
    price.unit = req.body.unit;
    price.shippingPeriodFrom = req.body.shippingPeriodFrom;
    price.shippingPeriodTo = req.body.shippingPeriodTo;
    price.price = req.body.price;
    price.priceAsPer = req.body.priceAsPer;
    price.bagged_USD_CWT_FOBPlant = bagged_USD_CWT_FOBPlant;
    price.bagged_USD_MT_FOBPlant = bagged_USD_MT_FOBPlant;
    price.bulk_USD_MTFOBPlant = bulk_USD_MTFOBPlant;
    price.bagged_USD_MT_Montreal = bagged_USD_MT_Montreal;
    price.bulk_USD_MT_Montreal = bulk_USD_MT_Montreal;
    price.bagged_USD_MT_Vancouver = bagged_USD_MT_Vancouver;
    price.bulk_USD_MT_Vancouver = bulk_USD_MT_Vancouver;
    price.quantityUnit = req.body.quantityUnit;
    price.quantity = req.body.quantity;
    price.commodityId = req.body.commodityId;
    price.gradeId = req.body.gradeId;
    price.updatedAt = new Date();
    price.currencyType = req.body.currencyType;
    price.shippingPeriodEntry = req.body.shippingPeriodEntry;
    price = await price.save();

    return SendResponse(res, {data: price, userMessage: 'price updated.'});
};/*-----  End of updateCommodityPricing  ------*/

/****************************************************************
***   updateCommodityPricing  ***
****************************************************************/
methods.removeCommodityPricing = async function(req, res) {
    let data = await CommodityPricing.remove({ _id: { $in: req.body.idsArray } });

    return SendResponse(res, {data, userMessage: 'Price removed.'});
};/*-----  End of updateCommodityPricing  ------*/

methods.getNetFob = async function(req, res) {
    const commodityId = req.query.commodityId;
    const gradeId = req.query.gradeId;
    const cropYear = req.query.cropYear;

    if (
        !commodityId || commodityId == 'undefined' ||
        !gradeId || gradeId == 'undefined' ||
        !cropYear || cropYear == 'undefined'
    ) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'commodity id, grade id and crop years are required'
        });
    }

    const commodityPricing = await CommodityPricing.findOne({ commodityId, gradeId, cropYear }).lean();
    const data = commodityPricing ? commodityPricing.targetFOB.toFixed(2) - 0 : '';

    return SendResponse(res, {data});
};

const generateCommodityPricingExcel = async function() {
    const commodityPricing = await CommodityPricing
        .find({ status: 0 })
        .populate('createdBy', 'fullName avatar signature type roles')
        .populate('commodityId ', 'commodityName ')
        .populate('gradeId', ' gradeName')
        .limit(500)
        .lean();

    commodityPricing.sort(function(a, b) {
        if (a.commodityId.commodityName < b.commodityId.commodityName) {
            return -1;
        }
        if (a.commodityId.commodityName > b.commodityId.commodityName) {
            return 1;
        }
        return 0;
    });

    const jsonCP = commodityPricing.map(function(price) {
        return {
            'Commodity': price.commodityId.commodityName || '',
            'Commodity Code': price.commodityId.commodityCode || '',
            'Grade': price.gradeId.gradeName || '',
            'Year': price.cropYear || '',
            'shippingPeriodFrom': price.shippingPeriodFrom || '',
            'shippingPeriodTo': price.shippingPeriodTo || '',
            'quantity': price.quantity + 'Fcls' || '',
            'price': price.price || '',
            'unit': price.unit || '',
            'cdnCwt': price.cdnCwt || '',
            'margin': price.margin || '',
            'targetFOB': price.targetFOB || '',
            'bagged_USD_CWT_FOBPlant': price.bagged_USD_CWT_FOBPlant || '',
            'bagged_USD_MT_FOBPlant': price.bagged_USD_MT_FOBPlant || '',
            'bulk_USD_MTFOBPlant': price.bulk_USD_MTFOBPlant || '',
            'bagged_USD_MT_Montreal': price.bagged_USD_MT_Montreal || '',
            'bagged_USD_MT_Vancouver': price.bagged_USD_MT_Vancouver || '',
            'bulk_USD_MT_Montreal': price.bulk_USD_MT_Montreal || '',
            'bulk_USD_MT_Vancouver': price.bulk_USD_MT_Vancouver || '',
            'createdAt': moment(price.createdAt).format('MM/DD/YYYY, h:mm:ss a')
        };
    });

    generateExcel.generate('CommodityPricing', jsonCP, async function (err, reportUrl) {
        if (!err) {
            await (new Archive({
                reportUrl,
                reportDate: moment().add(-1, 'day'),
                reportName: 'CommodityPricingExcel',
                entityName: 'CommodityPricing',
            })).save();
        }
    });
};

methods.getArchiveExcel = async function(req, res) {
    const {date, reportName, entityName} = req.query;
    if (!date) {
        return SendResponse(res, {error: true, status: 400, userMessage: 'date is required'});
    }
    if (!entityName || !reportName) {
        return SendResponse(res, {error: true, status: 400, userMessage: 'reportName and entityName is required'});
    }
    const fromDate = moment(date).utc().startOf('day').toISOString();
    const toDate = moment(date).utc().endOf('day').toISOString();

    const data = await Archive.findOne({
        $query: {
            reportDate: {$gte: new Date(fromDate), $lte: new Date(toDate)},
            reportName, entityName,
        },
        $orderby: {_id: -1},
    });
    return SendResponse(res, {data});
};

module.exports.generateCommodityPricingExcel = generateCommodityPricingExcel;
