var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Currency = mongoose.model('currency');
var CurrencyHistory = mongoose.model('currencyHistory');
var CommodityPricing = mongoose.model('commodityPricing');
var Freight = mongoose.model('freight');
var async = require('async');
var FreightSetting = mongoose.model('freightSettings');
const { SendResponse } = require("@ag-common");

function getBagToBagPrice(data, key, freight_Setting_price) {
    if (data[key]) {
        return Number(data[key]) + Number(freight_Setting_price);
    } else {
        return 0;
    }
}

function getfreightMTPrice(data, key, value) {
    if (data[key]) {
        return Number(data[key]) * value;
    } else return 0;
}

function getfreightCWTPrice(data, key, value) {
    if (data[key] && value) {
        return Number(data[key]) / value;
    } else return 0;
}

function getfreightWithBlFeePrice(data, key, value) {
    if (data[key]) {
        return Number(data[key]) + value;
    } else return value;
}


function getPriceInCAD(data, key, value, currency_price) {
    if (data[key]) {
        return (Number(data[key]) + Number(value)) / currency_price;
    }
    return 0;
}

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/currency')
        .post(session.adminCheckToken, methods.addCurrency)
        .get(session.adminCheckToken, methods.getCurrency)
        .put(session.adminCheckToken, methods.updateCurrency);

    router
        .route('/currency/delete')
        .post(session.adminCheckToken, methods.removeCurrency);

    router
        .route('/currency/history')
        .get(session.adminCheckToken, methods.getCurrencyHistory);
};

/*=======================
***   getCurrency  ***
=========================*/
methods.getCurrency = async function(req, res) {
    let data = await Currency.find({});

    return SendResponse(res, {data, userMessage: 'currency list.'});
};/*-----  End of getCurrency  ------*/

/*=============================
***   Add New Currency  ***
===============================*/
methods.addCurrency = async function(req, res) {
    req.checkBody('currencyCADUSD', 'Currency CAD USD  is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
    }

    let data = await Currency.findOne({ currencyCADUSD: req.body.currencyCADUSD, status: 0 });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Currency value already exist.'
        });
    }

    data = await (new Currency(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Currency added successfully.'});
};/*-----  End of addBag  ------*/

/*=======================================
***   Get All Currency History List  ***
=========================================*/
methods.getCurrencyHistory = async function(req, res) {
    let data, condition = {}, options = {
        sort: { createdAt: -1 },
        page: req.query.page,
        limit: 10
    };

    if (req.query.search) {
        condition = {
            // status: 0,
            city: { $regex: ".*" + req.query.search + ".*", $options: 'i' }
        };
        data = await CurrencyHistory.paginate(condition, options);
    } else if (!req.query.page) {
        data = await CurrencyHistory.find(condition);
    } else {
        data = await CurrencyHistory.paginate(condition, options);
    }

    return SendResponse(res, {data, userMessage: 'currency list.'});
};/*-----  End of get Currency History  ------*/

/*========================
***   Update Currency  ***
==========================*/
methods.updateCurrency = async function(req, res) {

    let currency = await Currency.findOne({ _id: req.body._id });

    if (!currency) {
        return SendResponse(res, {error: true, status: 400, userMessage: 'currency details not found.'});
    }

    currency.currencyCADUSD = req.body.currencyCADUSD || currency.currencyCADUSD;
    currency.currencyUpdate = req.body.currencyUpdate || currency.currencyUpdate;
    currency.exchangeDeduction = req.body.exchangeDeduction || currency.exchangeDeduction;
    currency.updatedBy = req.admin._id;
    currency.updatedOn = new Date();
    await currency.save();

    let data = {
        currencyCADUSD: req.body.currencyCADUSD,
        currencyUpdate: req.body.currencyUpdate,
        exchangeDeduction: req.body.exchangeDeduction,
        updatedBy: req.admin._id,
        updatedOn: new Date()
    };

    let currencyHistory = await (new CurrencyHistory(data)).save();

    let commPrice = await CommodityPricing.find({});

    let freightList = await Freight.find({ status: 0 }).populate('loadingPortId');

    let freightSettingList = await FreightSetting.findOne({});

    freightSettingList.intermodalVCRUSD = (freightSettingList.intermodalVCR * 22.0462) / currency.currencyCADUSD;
    freightSettingList.intermodalMTLUSD = (freightSettingList.intermodalMTL * 22.0462) / currency.currencyCADUSD;

    await freightSettingList.save();

    async.parallel({
        'updatePrice': function(callback) {
            async.forEachOfLimit(commPrice, 1, function(val, key, next) {
                if (val.unit == "CWT") {
                    val.cdnCwt = Number(val.price);
                } else {
                    val.cdnCwt = ((Number(val.price) / 60) * 100);
                }
                var targetFOB = Number(val.cdnCwt) + Number(val.margin);

                var bagged_USD_CWT_FOBPlant = 0;

                if (val.currencyType == 'CAD') {
                    bagged_USD_CWT_FOBPlant = targetFOB / (currency.currencyCADUSD || 1.3075);
                } else {
                    bagged_USD_CWT_FOBPlant = targetFOB;
                }

                //var bagged_USD_CWT_FOBPlant = targetFOB / (currency.currencyCADUSD || 1.3075); //=SUM(H2/T2)
                var bagged_USD_MT_FOBPlant = bagged_USD_CWT_FOBPlant * 22.046; //SUM(I2 *22.0462)
                var bulk_USD_MTFOBPlant = bagged_USD_MT_FOBPlant - 11.023; //=SUM(J2 - 11.023)
                var bagged_USD_MT_Montreal = Number(bagged_USD_MT_FOBPlant) + (3.55 * 22.046); //=SUM(J2+(3.55 *22.046))
                var bulk_USD_MT_Montreal = Number(bulk_USD_MTFOBPlant) + (3.79 * 22.046); //=SUM(K2 + (3.79 *22.046))
                var bagged_USD_MT_Vancouver = bagged_USD_MT_FOBPlant + (2.62 * 22.046); //=SUM(J2 + (2.62 * 22.046))
                var bulk_USD_MT_Vancouver = bulk_USD_MTFOBPlant + (2.80 * 22.046); //=SUM(K2 + (2.8 * 22.046))

                val.bagged_USD_CWT_FOBPlant = bagged_USD_CWT_FOBPlant;
                val.bagged_USD_MT_FOBPlant = bagged_USD_MT_FOBPlant;
                val.bulk_USD_MTFOBPlant = bulk_USD_MTFOBPlant;
                val.bagged_USD_MT_Montreal = bagged_USD_MT_Montreal;
                val.bulk_USD_MT_Montreal = bulk_USD_MT_Montreal;
                val.bagged_USD_MT_Vancouver = bagged_USD_MT_Vancouver;
                val.bulk_USD_MT_Vancouver = bulk_USD_MT_Vancouver;

                val.save((err) => {
                    if (err) {
                        // console.log('call err 1===', err);
                    } else {
                        next();
                    }
                });

            }, function(err) {
                callback(err, 'success_commodtity');
            });

        },
        'updateFrieght': function(callback) {

            async.forEachOfLimit(freightList, 1, function(value, key, next1) {

                if (value.currencyType == 'CAD') {

                    value.freightWithBlFee = {
                        bagToBag: getPriceInCAD(value.oceanFreight, 'bagToBag', value.blFee, currency.currencyCADUSD),
                        bulkToBulk: getPriceInCAD(value.oceanFreight, 'bulkToBulk', value.blFee, currency.currencyCADUSD),
                        bulkToBag: getPriceInCAD(value.oceanFreight, 'bulkToBag', value.blFee, currency.currencyCADUSD)
                    };

                    value.freightCWT = {
                        bagToBag: getfreightCWTPrice(value.freightWithBlFee, 'bagToBag', value.unit),
                        bulkToBulk: getfreightCWTPrice(value.freightWithBlFee, 'bulkToBulk', value.unit),
                        bulkToBag: getfreightCWTPrice(value.freightWithBlFee, 'bulkToBag', value.unit)
                    };

                    value.freightMT = {
                        bagToBag: getfreightMTPrice(value.freightCWT, 'bagToBag', 22.046),
                        bulkToBulk: getfreightMTPrice(value.freightCWT, 'bulkToBulk', 22.046),
                        bulkToBag: getfreightMTPrice(value.freightCWT, 'bulkToBag', 22.046)
                    };

                } else {
                    value.freightWithBlFee = {
                        bagToBag: getfreightWithBlFeePrice(value.oceanFreight, 'bagToBag', value.blFee),
                        bulkToBulk: getfreightWithBlFeePrice(value.oceanFreight, 'bulkToBulk', value.blFee),
                        bulkToBag: getfreightWithBlFeePrice(value.oceanFreight, 'bulkToBag', value.blFee)
                    };

                    value.freightCWT = {
                        bagToBag: getfreightCWTPrice(value.freightWithBlFee, 'bagToBag', value.unit),
                        bulkToBulk: getfreightCWTPrice(value.freightWithBlFee, 'bulkToBulk', value.unit),
                        bulkToBag: getfreightCWTPrice(value.freightWithBlFee, 'bulkToBag', value.unit)
                    };

                    value.freightMT = {
                        bagToBag: getfreightMTPrice(value.freightCWT, 'bagToBag', 22.046),
                        bulkToBulk: getfreightMTPrice(value.freightCWT, 'bulkToBulk', 22.046),
                        bulkToBag: getfreightMTPrice(value.freightCWT, 'bulkToBag', 22.046)
                    };
                }

                if (value.loadingPortId.loadingPortName == 'Montreal' || value.loadingPortId.loadingPortName == 'Vancouver') {
                    var freight_price = value.loadingPortId.loadingPortName == 'Montreal' ? freightSettingList.intermodalMTLUSD : freightSettingList.intermodalVCRUSD;
                    value.freightUSDMTFOB = {
                        bagToBag: getBagToBagPrice(value.freightMT, 'bagToBag', freight_price),
                        bulkToBulk: getBagToBagPrice(value.freightMT, 'bulkToBulk', freight_price),
                        bulkToBag: getBagToBagPrice(value.freightMT, 'bulkToBag', freight_price),
                    };
                }
                value.loadingPortId = value.loadingPortId._id;
                value.save((err) => {
                    if (err) {
                        // console.log('call err', err);
                    } else {
                        next1();
                    }
                });

            }, function(err) {
                callback(err, 'success_freight');
            });

        }

    }, (err) => {
        return SendResponse(res, {
            data: currencyHistory,
            userMessage: 'Currency added successfully.'
        });
    });
};/*-----  End of updatecurrency  ------*/

/*============================
***   removeCurrency ***
==============================*/
methods.removeCurrency = async function(req, res) {
    let data = await Currency.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'bag deleted.'});
};/*-----  End of removeCurrency  ------*/
