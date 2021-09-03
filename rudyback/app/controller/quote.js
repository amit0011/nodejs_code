const mongoose = require('mongoose');
const session = require('@ag-libs/session');
const Quote = mongoose.model('quote');
const async = require('async');
const Freight = mongoose.model('freight');
const Equipment = mongoose.model('equipment');
const ShippingTerms = mongoose.model('shippingTerms');
const Grade = mongoose.model('grade');
const CommodityPricing = mongoose.model('commodityPricing');
const Currency = mongoose.model('currency');
const Weather = mongoose.model('weather');
const LoadingPort = mongoose.model('loadingPort');
const Bags = mongoose.model('bags');
const { cron: generateQuotePdf } = require('./crone');

const Commodity = mongoose.model('commodity');
const { SendResponse } = require("@ag-common");

const methods = {};

module.exports.controller = function(router) {
    router
        .route('/quote')
        .post(session.adminCheckToken, methods.addQuote)
        .get(session.adminCheckToken, methods.getQuote)
        .put(session.adminCheckToken, methods.updateQuote);

    router
        .route('/deleteQuote')
        .put(session.adminCheckToken, methods.deleteQuote);

    router
        .route('/quoteDetail')
        .get(methods.quoteDetail);

    router
        .route('/getQuotesDetails')
        .get(methods.getQuotesDetails);

    router
        .route('/testQuote')
        .get(methods.testQuote);
};

methods.testQuote = async function(req, res) {

    let quote = await Quote.findOne({ buyerId: "5bdc6006df399114693d6379" })
        .sort('-createdAt')
        .limit(1);

        if (quote) {
            async.forEachOfLimit(quote.columnsCol, 1, function(value, key, next) {
                //console.log("Start first forEachOfLimit ..." + key);
                //console.log("Start first async.parallel ...");
                async.parallel({
                        "freightsPrice": function(callback) {
                            if (value && value['loadingPortId'] && value['freightById'] && value['destinationPort'] && value['equipmentId']) {
                                Freight.findOne({
                                    loadingPortId: value.loadingPortId,
                                    equipmentId: value.equipmentId,
                                    freightCompanyId: value.freightById,
                                    cityName: value.destinationPort
                                }, 'freightMT freightUSDMTFOB', (err, success) => {
                                    callback(err, success);
                                });
                            } else {
                                callback(null, {});
                            }
                        },
                        "loadingPort": function(callback) {
                            if (value && value['loadingPortId']) {
                                LoadingPort.findById(value.loadingPortId, 'loadingPortName', (err, success) => {
                                    callback(err, success);
                                });
                            } else {
                                callback(null, {});
                            }
                        },
                        "shippingTerm": function(callback) {
                            if (value && value['shippingtermsId']) {
                                ShippingTerms.findById(value.shippingtermsId, 'term', (err, success) => {
                                    callback(err, success);
                                });
                            } else {
                                callback(null, {});
                            }
                        },
                        "equipment": function(callback) {
                            if (value && value['equipmentId']) {
                                Equipment.findById(value.equipmentId, 'equipmentName', (err, success) => {
                                    callback(err, success);
                                });
                            } else {
                                callback(null, {});
                            }
                        },
                        "bag": function(callback) {
                            if (value && value['bagId']) {
                                Bags.findById(value.bagId, 'name bagCost', (err, success) => {
                                    callback(err, success);
                                });
                            } else {
                                callback(null, {});
                            }
                        }

                    },
                    (err, success) => {
                        if (err) {
                            // console.log("Error in first async.parallel")
                        } else {
                            if (success.freightsPrice && success.freightsPrice['_id']) {
                                value['freightsPrice'] = success.freightsPrice;
                            }
                            if (success.loadingPort && success.loadingPort['_id']) {
                                value['loadingPort'] = success.loadingPort;
                            }
                            if (success.shippingTerm && success.shippingTerm['_id']) {
                                value['shippingTerm'] = success.shippingTerm;
                            }
                            if (success.equipment && success.equipment['_id']) {
                                value['equipment'] = success.equipment;
                            }
                            if (success.bag && success.bag['_id']) {
                                value['bag'] = success.bag;
                            }

                            next();
                        }
                    });
                },
                function(err) {
                    if (err) {
                        //console.log("error first forEachOfLimit ...");
                    } else {
                        //console.log("end first forEachOfLimit ....");

                        // console.log("==============================");

                        async.forEachOfLimit(quote.commoditiesRow, 1, function(value, key, next1) {
                            console.log("start second forEachOfLimit..." + key);

                            async.parallel({
                                "commodityPrices": function(callback) {
                                    if (value && value['commodityId'] && value['gradeId'] && value['cropYear']) {
                                        CommodityPricing.findOne({
                                            commodityId: value.commodityId,
                                            gradeId: value.gradeId,
                                            cropYear: value.cropYear
                                        }, 'quantity bulk_USD_MTFOBPlant bagged_USD_MT_FOBPlant shippingPeriodTo shippingPeriodFrom', (err, success) => {
                                            callback(err, success);
                                        });
                                    } else {
                                        callback(err, {});
                                    }
                                },
                                "commodity": function(callback) {
                                    if (value && value['commodityId']) {
                                        Commodity.findById(value.commodityId, 'commodityName', (err, success) => {
                                            callback(err, success);
                                        });
                                    } else {
                                        callback(null, {});
                                    }
                                },
                                "grade": function(callback) {
                                    if (value && value['gradeId']) {
                                        Grade.findById(value.gradeId, 'gradeName', (err, success) => {
                                            callback(err, success);
                                        });
                                    } else {
                                        callback(null, {});
                                    }
                                }
                            }, (err, success) => {

                                if (err) {
                                    //  console.log("Error in second async.parallel");
                                } else {

                                    if (success.commodityPrices && success.commodityPrices._id) {
                                        value['commodityPrices'] = success.commodityPrices;
                                    }
                                    if (success.commodity && success.commodity._id) {
                                        value['commodity'] = success.commodity;
                                    }
                                    if (success.grade && success.grade._id) {
                                        value['grade'] = success.grade;
                                    }
                                    // console.log("end second async.parallel ...");
                                    next1();
                                }

                            });
                        }, function(err) {
                            if (err) {
                                // console.log("error in second forEachOfLimit ...");
                            } else {
                                res.send(quote);
                            }
                        });
                    }
                });
            }
};

function quoteValidation(quoteData) {
  const columnsCol = quoteData.columnsCol;
  const colCount = columnsCol.length;

  const condition = idx => (
    columnsCol[idx].loadingPortId && columnsCol[idx].shippingtermsId &&
    columnsCol[idx].destinationPort && columnsCol[idx].equipmentId &&
    columnsCol[idx].bagId && columnsCol[idx].freightId &&
    columnsCol[idx].freightById && columnsCol[idx].weightType
  );

  let idx = 0;
  while (idx < colCount && condition(idx)) idx++;

  return colCount === idx;
}

methods.addQuote = async function(req, res) {
    let quote;

    if (!quoteValidation(req.body)) {
      return SendResponse(res, {
        error: true,
        userMessage: 'Something is missing, please fill all field.',
        status: 400,
      });
    }

    if (req.body.buyerId && req.body._id) {
        quote = await Quote.findByIdAndUpdate(req.body._id, req.body, { new: true });

        if (quote) {
            await generateQuotePdf([{_id: quote._id}], true, () => {
              SendResponse(res, {data: quote, userMessage: 'Quote updated successfully.'});
            });
        } else
          return SendResponse(res, { status: 404, userMessage: 'Quote id does not exit.' });
    }
    let count = await Quote.count();

    req.body.quoteNumber = count + 1;
    let data = await (new Quote(req.body)).save();

    await generateQuotePdf([{_id: data._id}], true, () => {
      SendResponse(res, {data, userMessage: 'Quote created successfully.'});
    });
};

methods.getQuote = async (req, res) => {
    req.check('userId', 'userId is required.').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    var data, condition;
    if (req.query.userId) {
        condition = {};
        if (req.query.type == 'buyer') {
            condition.buyerId = req.query.userId;
        } else if (req.query.type == 'broker') {
            condition.brokerId = req.query.userId;
        } else {
            return SendResponse(res, {
                error: true, status: 500,
                userMessage: 'Invalid user type.'
            });
        }

        data = await Quote.find(condition)
            .populate('buyerId brokerId userId')
            .sort('-quoteNumber')
            .lean();
    } else {
        condition = {};
        var options = {
            sort: { createdAt: -1 },
            page: req.query.page || 1,
            limit: 10,
            populate: ('brokerId buyerId userId'),
            lean: true
        };
        data = await Quote.paginate(condition, options);
    }

    return SendResponse(res, {data, userMessage: 'contracts list.'});
};

methods.updateQuote = async (req, res) => {
    req.check('quoteId', 'Quote id is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await Quote.findByIdAndUpdate(req.query.quoteId, req.body);
    if (data) {
        return SendResponse(res, {data, userMessage: 'Quote updated successfully.'});
    }

    return SendResponse(res, {status: 404, userMessage: 'Quote id does not exit.'});
};

methods.deleteQuote = async (req, res) => {
    req.check('quoteId', 'Quote id is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await Quote.findByIdAndUpdate(req.query.quoteId, {$set: { status: 1 } });

    if (data) {
        return SendResponse(res, {data, userMessage: 'Quote updated successfully.'});
    }

    return SendResponse(res, {status: 404, userMessage: 'Quote id does not exit.'});
};

methods.quoteDetail = async (req, res) => {
    req.check('quoteId', 'quoteId is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    async.parallel({
        "quote": (cb) => {
            Quote
                .findById(req.query.quoteId)
                .populate({
                    path: 'commoditiesRow.commodityId',
                    select: 'commodityName',
                    model: 'commodity'
                })
                .populate({
                    path: 'commoditiesRow.gradeId',
                    select: 'gradeName',
                    model: 'grade'
                })
                .populate({
                    path: 'columnsCol.freightById',
                    select: 'freightCompanyName',
                    model: 'freightCompany'
                })
                .populate({
                    path: 'columnsCol.bagId',
                    select: 'bulkBag name',
                    model: 'bags'
                })
                .populate({
                    path: 'columnsCol.equipmentId',
                    select: 'equipmentName',
                    model: 'equipment'
                })
                .populate({
                    path: 'columnsCol.shippingtermsId',
                    select: 'term',
                    model: 'shippingTerms'
                })
                .populate({
                    path: 'columnsCol.loadingPortId',
                    select: 'loadingPortName',
                    model: 'loadingPort'
                })
                .populate({
                    path: 'buyerId',
                    select: 'businessName',
                    model: 'buyer'
                })
                .populate({
                    path: 'brokerId',
                    select: 'businessName',
                    model: 'broker'
                })
                .exec((err, quote) => {
                    cb(err, quote);
                });
        },
        "currency": (cb) => {
            Currency
                .findOne({
                    status: 0
                })
                .select("currencyUpdate currencyCADUSD")
                .exec((err, currency) => {
                    cb(err, currency);
                });
        },
        "weather": (cb) => {
            Weather
                .findOne({
                    status: 0
                })
                .select("weather")
                .exec((err, weather) => {
                    cb(err, weather);
                });
        }
    }, (err, success) => {
        if (err) {
            return SendResponse(res, {
                error: true, status: 500,
                userMessage: 'some server error has occurred.'
            });
        }

        return SendResponse(res, {data: success, userMessage: 'success.'});
    });
};

methods.getQuotesDetails = async function(req, res) {
    //console.log("getting previousQuote details.  .....");
    var condition = {};
    if (req.query.type == 'buyer') {
        condition.buyerId = req.query.userId;
    } else if (req.query.type == 'broker') {
        condition.brokerId = req.query.userId;
    } else {
        return SendResponse(res, { status: 500, userMessage: 'Invalid request.' });
    }

    let quote = await Quote.findOne(condition)
        .sort('-createdAt')
        .limit(1);

    if (!quote) {
        return SendResponse(res, {status: 404, userMessage: 'success.'});
    }

    async.forEachOfLimit(quote.columnsCol, 1, function(value, key, next) {
        async.parallel({
                "freightList": function(callback) {
                    if (value && value['loadingPortId']) {
                        Freight.find({ loadingPortId: value.loadingPortId, status: 0 })
                            .select('cityName')
                            .sort('cityName')
                            .exec((err, success) => {
                                callback(err, success);
                            });
                    } else {
                        callback(null, []);
                    }
                },
                "freightCompanyList": function(callback) {
                    if (value && value['loadingPortId']) {
                        Freight.find({
                                equipmentId: value.equipmentId,
                                loadingPortId: value.loadingPortId,
                                cityName: value.destinationPort,
                                status: 0
                            })
                            .select('freightCompanyId oceanFreight')
                            .populate('freightCompanyId', 'freightCompanyName')
                            .exec((err, success) => {
                                callback(err, success);
                            });
                    } else {
                        callback(null, []);
                    }
                },
                "shippingTermsList": function(callback) {
                    if (value && value['loadingPortId']) {
                        ShippingTerms.find(
                            { loadingPortId: value.loadingPortId, status: 0 },
                            'term',
                            (err, success) => {
                                callback(err, success);
                            });
                    } else {
                        callback(null, []);
                    }
                },
                "equipmentList": function(callback) {
                    if (value && value['loadingPortId']) {
                        Equipment.find(
                            { loadingPortId: value.loadingPortId, status: 0 },
                            'equipmentName',
                            (err, success) => {
                                callback(err, success);
                            });
                    } else {
                        callback(null, []);
                    }
                },
                "freightsPrice": function(callback) {
                    if (value && value['loadingPortId'] && value['freightById'] && value['destinationPort'] && value['equipmentId']) {
                        let query = {
                          loadingPortId: value.loadingPortId,
                          equipmentId: value.equipmentId,
                          freightCompanyId: value.freightById,
                          cityName: value.destinationPort,
                          status: 0
                        };
                        if (value.freightId) query = {status: 0, _id: value.freightId};
                        Freight.findOne(query, 'freightWithBlFee freightCWT freightMT freightUSDMTFOB', (err, success) => {
                            callback(err, success);
                        });
                    } else {
                        callback(null, {});
                    }
                }
            },
            (err, success) => {
                if (err) {
                    return SendResponse(res, {status: 500, error: err, userMessage: 'server error.'});
                } else {
                    if (success.freightsPrice && success.freightsPrice['_id']) {
                        value['freightsPrice'] = success.freightsPrice;
                    }
                    if (success.equipmentList.length != 0) {
                        value['equipmentList'] = success.equipmentList;
                    }
                    if (success.shippingTermsList.length != 0) {
                        value['shippingTermsList'] = success.shippingTermsList;
                    }
                    if (success.freightList.length != 0) {
                        value['freightList'] = success.freightList;
                    }
                    if (success.freightCompanyList.length != 0) {
                        value['freightCompanyList'] = success.freightCompanyList;
                    }
                    next();
                }
            });
        },
        function(err) {
            if (err) {
                return SendResponse(res, {data: quote, status: 500, userMessage: 'server error.'});
            } else {
                async.forEachOfLimit(quote.commoditiesRow, 1, function(value, key, next1) {
                    async.parallel({
                        "grades": function(callback) {
                            if (value && value['commodityId']) {
                                CommodityPricing
                                    .distinct("gradeId", {
                                        commodityId: value.commodityId
                                    })
                                    .exec((err, gradesId) => {
                                        if (err) {
                                            callback(err, []);
                                        } else if (gradesId.length == 0) {
                                            callback(null, []);
                                        } else {
                                            Grade
                                                .find({
                                                    _id: {
                                                        $in: gradesId
                                                    }
                                                })
                                                .select('gradeName')
                                                .sort('gradeName')
                                                .exec((err, data) => {
                                                    callback(err, data);
                                                });
                                        }
                                    });
                            } else {
                                callback(err, []);
                            }
                        },
                        "commodityPrices": function(callback) {
                            if (value && value['commodityId'] && value['gradeId'] && value['cropYear']) {
                                CommodityPricing.findOne({
                                    commodityId: value.commodityId,
                                    gradeId: value.gradeId,
                                    cropYear: value.cropYear
                                }, 'quantity quantityUnit priceAsPer bulk_USD_MT_Vancouver bagged_USD_MT_Vancouver bulk_USD_MT_Montreal bagged_USD_MT_Montreal bulk_USD_MTFOBPlant bagged_USD_MT_FOBPlant bagged_USD_CWT_FOBPlant shippingPeriodTo shippingPeriodFrom', (err, success) => {
                                    callback(err, success);
                                });
                            } else {
                                callback(err, {});
                            }
                        },
                    }, (err, success) => {

                        if (err) {
                            return SendResponse(res, {
                                data: quote, errors: err, status: 500,
                                userMessage: 'server error.'
                            });
                        } else {
                            if (success.grades.length > 0) {
                                value['grades'] = success.grades;
                            }
                            if (success.commodityPrices && success.commodityPrices._id) {
                                value['commodityPrices'] = success.commodityPrices;
                            }
                            next1();
                        }
                    });
                }, function(err) {
                    if (err) {
                        return SendResponse(res, {
                            data: quote, errors: err, status: 500,
                            userMessage: 'server error.'
                        });
                    }

                    return SendResponse(res, {data: quote, userMessage: 'success.'});
                });
            }
        });
};
