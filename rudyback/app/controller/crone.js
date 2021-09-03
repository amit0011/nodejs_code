const mongoose = require('mongoose');
const Quote = mongoose.model('quote');
const asyncLib = require('async');
const Freight = mongoose.model('freight');
const Equipment = mongoose.model('equipment');
const ShippingTerms = mongoose.model('shippingTerms');
const Grade = mongoose.model('grade');
const CommodityPricing = mongoose.model('commodityPricing');
const Currency = mongoose.model('currency');
const Weather = mongoose.model('weather');
const FreightSetting = mongoose.model('freightSettings');
const Commodity = mongoose.model('commodity');
const LoadingPort = mongoose.model('loadingPort');
const Bags = mongoose.model('bags');
const moment = require('moment');
const Buyer = mongoose.model('buyer');
const Broker = mongoose.model('broker');
const _ = require('lodash');
const pdf = require('html-pdf');
const notifications = require('@ag-libs/function');
const Employee = mongoose.model('employees');
const FailedQuote = mongoose.model('failedquote');
const quoteHtml = require('../Htmls/quoteHtml');

const image2base64 = require('image-to-base64');
const image_path = process.env.IMAGE_PATH;
let startOfDay = null;

const AWS = require('aws-sdk');
AWS.config.update({
    "accessKeyId": 'AKIAINFE6JSVWOKRJT3Q',
    "secretAccessKey": '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',
    "region": 'us-west-2'
});

module.exports.controller = function() {};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function sendMail(buyer, html, emails, newQuoteId, dontSendMail, next_call) {
    try {
        console.log("Mail sending to buyer.....", emails);

        var options = {
            format: 'A4',
            orientation: 'landscape'
        };

        let bucketName = process.env.S3_BUCKET;
        let file_name = new Date().getTime() + '_' + buyer.businessName + ".pdf";

        pdf.create(html, options).toBuffer(function(err, buffer) {
            if (err) {
                console.log("pdf create error =>" + err);
                next_call();
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
                        console.log("Error uploading image: ", perr);
                        next_call();
                    } else {

                        var urlParams = {
                            Bucket: bucketName,
                            Key: file_name
                        };
                        s3.getSignedUrl('getObject', urlParams, function(err, url) {
                            if (err) {
                                console.log("getObject function error==>" + err);
                                next_call();
                            } else {

                                var validEmails = [];
                                emails.forEach((email) => {
                                    if (validateEmail(email)) {
                                        validEmails.push(email.toLowerCase());
                                    }
                                });

                                Quote
                                    .findByIdAndUpdate(newQuoteId, {
                                        $set: {
                                            pdfUrl: url.split("?")[0]
                                        }
                                    }, (err) => {
                                        if (err) {
                                            console.log("Pdf Url not updated on quoteId => " + newQuoteId);
                                        } else {
                                            console.log("Pdf Url updated on quoteId => " + newQuoteId);
                                        }
                                    });

                                var bcc = [];

                                if (process.env.SEND_QUOTE_MAIL == 'true' && process.env.LIVE_SERVER == 'true') {
                                    if (emails.indexOf('achinlalit@gmail.com') == -1) {
                                        bcc.push('achinlalit@gmail.com');
                                    }
                                }

                                if (!dontSendMail && validEmails.length && process.env.SEND_QUOTE_MAIL == 'true' && process.env.LIVE_SERVER == 'true') {
                                    notifications.createMail({
                                        name: buyer.businessName,
                                        email: validEmails,
                                        bcc: bcc,
                                        subject: "Rudy Agro Quote",
                                        link: url.split("?")[0],
                                        attachments: [{
                                            filename: 'quote.pdf',
                                            content: buffer.toString('base64'),
                                            type: 'application/pdf',
                                            disposition: 'attachment',
                                            contentId: new Date()
                                        }],
                                        type: "quote"
                                    }, 'pdf');
                                } else {
                                    console.log("Valid emails is empty");
                                }
                                next_call();
                            }
                        });
                    }
                });
            }
        });
    } catch (e) {
        console.log(e);
        next_call();
    }
}

function generatePdf(quote, currency, weather, buyer, emails, newQuoteId, dontSendMail, next_call) {
    console.log("Pdf creating....");
    try {
        const html = quoteHtml.html({quote, weather, currency, buyer});

        console.log("PDF generated.....");
        sendMail(buyer, html, emails, newQuoteId, dontSendMail, next_call);
    } catch (e) {
        console.log("generate pdf function :  quote Id---------->" + quote._id);
        console.log(e);
        next_call();
    }
}

async function SaveNewQuote(quote, currency, weather, dontSendMail, next_call) {
    try {
        var clone_quote = _.cloneDeep(quote);
        quote.columnsCol = quote.columnsCol.filter((val) => val).map((val1) => val1);
        quote.commoditiesRow = quote.commoditiesRow.filter((val) => val).map((val1) => val1);

        quote.columnsCol.forEach((val) => {
            delete val.loadingPort;
            delete val.shippingTerm;
            delete val.equipment;
            delete val.bag;
            delete val.freightsPrice;
        });


        quote.commoditiesRow.forEach((val1) => {
            delete val1.commodityPrices;
            delete val1.commodity;
            delete val1.grade;
        });

        let data = quote;
        if (!dontSendMail) {
          const count = await Quote.count();
          var obj = {
            commoditiesRow: quote.commoditiesRow,
            columnsCol: quote.columnsCol,
            exchangeRate: currency.currencyCADUSD,
            quoteNumber: Number(count) + 1,
            currency: quote.currency,
            ariPolicy: quote.ariPolicy,
            premiumDiscount: quote.premiumDiscount,
            insurance: quote.insurance,
            commission: quote.commission,
            interestDurationDays: quote.interestDurationDays,
            interestRate: quote.interestRate,
            userId: quote.userId,
            buyerId: quote.buyerId,
            brokerId: quote.brokerId,
            emailDate: new Date()
          };
          data = await (new Quote(obj)).save();
        }

        if (data && data.buyerId && data.buyerId != null) {
            const newQuoteId = data._id;
            Buyer
                .findById(data.buyerId)
                .select('email businessName assignedUserId')
                .populate('assignedUserId', 'email')
                .exec((err, buyer) => {
                    if (err || !buyer) {
                        console.log("error to find buyer details");
                        next_call();
                    } else {
                        Employee.find({$and:[
                            {email: {"$ne": null}},
                            {email: {"$ne": ""}},
                            {buyerId: data.buyerId},
                            {status: 0},
                            {subscribeEmail: true},
                        ]}, 'email', (err, employees) => {
                            if (err) {
                                console.log("Error to finding employees");
                                next_call();
                            }
                            try {
                                var emails = employees.map((val) => val.email);

                                if (buyer.assignedUserId && buyer.assignedUserId.email) {
                                    emails = [...emails, buyer.email, buyer.assignedUserId.email];
                                } else {
                                    emails = [...emails, buyer.email];
                                }

                                generatePdf(clone_quote, currency, weather, buyer, emails, newQuoteId, dontSendMail, next_call);
                            } catch (e) {
                                console.log(e);
                                next_call();
                            }
                        });

                    }
                });
        } else if (data && data.brokerId) {
            const newQuoteId = data._id;
            Broker
                .findById(data.brokerId)
                .select('email businessName assignedUserId')
                .populate('assignedUserId', 'email')
                .exec((err, broker) => {
                    if (err || !broker) {
                        console.log("error to find broker details");
                        next_call();
                    } else {

                        Employee.find(
                            {$and:[
                                {email: {"$ne": null}},
                                {email: {"$ne": ""}},
                                {brokerId: data.brokerId},
                                {status: 0}
                            ]}, 'email', (err, employees) => {
                            if (err) {
                                console.log("Error to finding employees");
                                next_call();
                            }
                            try {
                                var emails = employees.map((val) => val.email);

                                if (broker.assignedUserId && broker.assignedUserId.email) {
                                    emails = [...emails, broker.email, broker.assignedUserId.email];
                                } else {
                                    emails = [...emails, broker.email];
                                }

                                generatePdf(clone_quote, currency, weather, broker, emails, newQuoteId, dontSendMail, next_call);
                            } catch (e) {
                                console.log(e);
                                next_call();
                            }
                        });
                    }
                });
        } else {
            console.log("buyerId or brokerId not exist");
            next_call();
        }
    } catch (e) {
        console.log("save new quote function :  quote Id---------->" + quote._id);
        console.log(e);
        next_call();
    }
}

function calcuateNewQuote(quote, freightSettingList, currency, weather, dontSendMail, next_call) {
    try {
        quote.columnsCol = quote.columnsCol.filter((val) => val).map((val1) => val1);
        quote.commoditiesRow = quote.commoditiesRow.filter((val) => val).map((val1) => val1);

        console.log("Start update price function .....");

        var keyArr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

        quote.columnsCol.forEach((value, key) => {

            quote.commoditiesRow.forEach((comm) => {

                if (!(value && value.loadingPortId && value.equipmentId && value.freightById &&
                    value.destinationPort && value.weightType &&
                    value.bagId && value.shippingtermsId)
                ) {
                    if (comm && comm[keyArr[key]]) {
                        delete comm[keyArr[key]];
                        delete comm[keyArr[key] + 'totalCost'];
                    }
                    return;
                }

                if (value.destinationPort != 'FCA Rudy Agro Outlook') {
                    if (['Montreal', 'Vancouver'].indexOf(value.loadingPort.loadingPortName) != -1) {
                        if (value.bag.bulkBag == "Bag" && !(value.freightsPrice && value.freightsPrice.freightUSDMTFOB && value.freightsPrice.freightUSDMTFOB.bagToBag)) {
                            delete comm[keyArr[key]];
                            delete comm[keyArr[key] + 'totalCost'];
                        } else if (value.bag.bulkBag == "Bulk" && !(value.freightsPrice && value.freightsPrice.freightUSDMTFOB && value.freightsPrice.freightUSDMTFOB.bulkToBulk)) {
                            delete comm[keyArr[key]];
                            delete comm[keyArr[key] + 'totalCost'];
                        }
                    } else {
                        if (value.bag.bulkBag == "Bag" && !(value.freightsPrice && value.freightsPrice.freightMT && value.freightsPrice.freightMT.bagToBag)) {
                            delete comm[keyArr[key]];
                            delete comm[keyArr[key] + 'totalCost'];
                        } else if (value.bag.bulkBag == "Bulk" && !(value.freightsPrice && value.freightsPrice.freightMT && value.freightsPrice.freightMT.bulkToBulk)) {
                            delete comm[keyArr[key]];
                            delete comm[keyArr[key] + 'totalCost'];
                        }
                    }
                }

                if (!(comm && comm.commodityId && comm.gradeId && comm.cropYear)) {
                    if (comm[keyArr[key]]) {
                        delete comm[keyArr[key]];
                        delete comm[keyArr[key] + 'totalCost'];
                    }
                    return;
                }

                let ship_period_from = '';
                let ship_period_to = '';
                comm.shippingPeriod = ship_period_from + '/' + ship_period_to;
                comm.quantity = '';
                if (comm.commodityPrices) {
                    ship_period_from = comm.commodityPrices.shippingPeriodFrom || '';
                    ship_period_to = comm.commodityPrices.shippingPeriodTo || '';
                    comm.shippingPeriod = ship_period_from + '/' + ship_period_to;

                    if (comm.commodityPrices.priceAsPer == 'Quantity') {
                        comm.quantity = (comm.commodityPrices.quantity || '') + ' ' + (comm.commodityPrices.quantityUnit || '');
                    } else {
                        comm.quantity = comm.commodityPrices.priceAsPer || '';
                    }
                }

                if (!(comm && comm.commodityPrices)) {
                    if (comm[keyArr[key]]) {
                        delete comm[keyArr[key]];
                        delete comm[keyArr[key] + 'totalCost'];
                    }
                    return;
                }

                let inlandFreight = calculateInlandFreight(value, freightSettingList, currency);
                let portPrice = calculatePrice(value, freightSettingList, inlandFreight, currency);
                let finalPortPrice = calculateFinalPortPrice(value, portPrice);

                var totalCost = 0,
                    commodityCost = 0,
                    interestCost = 0,
                    commodityCostBagAdjustment = 0,
                    finalCommodityCost = 0,
                    priceDiscount = 0,
                    commissionPaid = 0,
                    priceWithCommission = 0,
                    insurancePaid = 0,
                    ariInsurancePaid = 0,
                    bagCostUsd = 0;

                if (value.bag) {
                    if (value.bag.bulkBag == "Bag" && comm && comm.commodityPrices && comm.commodityPrices.bagged_USD_MT_FOBPlant) {
                        commodityCost = Number(comm.commodityPrices.bagged_USD_MT_FOBPlant);
                        commodityCostBagAdjustment = Number(comm.commodityPrices.bagged_USD_MT_FOBPlant);
                    } else if (value.bag.bulkBag == "Bulk" && comm && comm.commodityPrices && comm.commodityPrices.bulk_USD_MTFOBPlant) {
                        commodityCost = Number(comm.commodityPrices.bulk_USD_MTFOBPlant);
                        commodityCostBagAdjustment = Number(comm.commodityPrices.bulk_USD_MTFOBPlant);
                    } else {
                        commodityCost = 0;
                        commodityCostBagAdjustment = 0;
                    }
                }

                if (value.weightType == "CWT") {
                    finalCommodityCost = commodityCostBagAdjustment / 22.0462;
                    priceDiscount = (Number(quote.premiumDiscount) || 0) / 22.0462;
                    bagCostUsd = value.bag ? Number(value.bag.bagCost) / currency.currencyCADUSD : 0;
                }

                if (value.weightType == "MT") {
                    finalCommodityCost = commodityCostBagAdjustment;
                    priceDiscount = (Number(quote.premiumDiscount) || 0);
                    bagCostUsd = value.bag ? (Number(value.bag.bagCost) / currency.currencyCADUSD * 22.0462) : 0;
                }

                if (quote.interestRate && quote.interestDurationDays) {
                    interestCost = (finalPortPrice + finalCommodityCost) * (quote.interestRate / 100 * quote.interestDurationDays / 365);
                }

                commissionPaid = (interestCost + finalPortPrice + finalCommodityCost) * quote.commission / 100;
                priceWithCommission = finalPortPrice + finalCommodityCost + interestCost + commissionPaid + priceDiscount;
                insurancePaid = quote.insurance * priceWithCommission;
                ariInsurancePaid = quote.ariPolicy * priceWithCommission;

                if (quote.currency == 'CAD') {
                    finalCommodityCost *= currency.currencyCADUSD;
                    finalPortPrice *= currency.currencyCADUSD;
                    interestCost *= currency.currencyCADUSD;
                    commissionPaid *= currency.currencyCADUSD;
                    insurancePaid *= currency.currencyCADUSD;
                    ariInsurancePaid *= currency.currencyCADUSD;
                    commodityCost *= currency.currencyCADUSD;
                    bagCostUsd *= currency.currencyCADUSD;
                }

                totalCost = finalCommodityCost + finalPortPrice + interestCost + commissionPaid + insurancePaid + ariInsurancePaid + bagCostUsd + priceDiscount + (Number(value.upChange) || 0) + (Number(comm.upCharge) || 0);
                comm[keyArr[key]] = totalCost;

                comm[keyArr[key] + 'totalCost'] = {
                    finalCommodityCost: value.weightType == "CWT" ? (Number(commodityCost) / 22.0462).toFixed(2) : (Number(commodityCost)).toFixed(2), // CC
                    finalPortPrice: Number(finalPortPrice).toFixed(2), // SC
                    interestCost: value.weightType == "CWT" ? (Number(interestCost) / 22.0462).toFixed(2) : (Number(interestCost)).toFixed(2), // Int
                    commissionPaid: value.weightType == "CWT" ? (Number(commissionPaid) / 22.0462).toFixed(2) : (Number(commissionPaid)).toFixed(2), // cmsn
                    insurancePaid: value.weightType == "CWT" ? (Number(insurancePaid) / 22.0462).toFixed(2) : (Number(insurancePaid)).toFixed(2), // Ins
                    ariInsurancePaid: value.weightType == "CWT" ? (Number(ariInsurancePaid) / 22.0462).toFixed(2) : (Number(ariInsurancePaid)).toFixed(2), // Ari
                    bagCostUsd: (Number(bagCostUsd)).toFixed(2), // Bag
                    priceDiscount: (Number(priceDiscount)).toFixed(2) // Prem
                };

                for (var i = quote.columnsCol.length; i < 9; i++) {
                    if (comm && comm[keyArr[i]]) {
                        delete comm[keyArr[i]];
                        delete comm[keyArr[i] + 'totalCost'];
                    }
                }
            });
        });

        let invalidQuote = (quote.columnsCol.length == 0 || quote.commoditiesRow.length == 0);

        if (invalidQuote == false) {
            for (let i = 0; i < quote.columnsCol.length; i++) {
                if (!(quote.columnsCol[i].loadingPortId && quote.columnsCol[i].shippingtermsId &&
                    quote.columnsCol[i].destinationPort && quote.columnsCol[i].equipmentId &&
                    quote.columnsCol[i].bagId && quote.columnsCol[i].freightById && quote.columnsCol[i].weightType)
                ) {
                    invalidQuote = true;
                    break;
                }
            }
        }

        if (invalidQuote == false) {
            for (let i = 0; i < quote.commoditiesRow.length; i++) {
                for (let j = 0; j < quote.columnsCol.length; j++) {
                    if (
                        !(quote.commoditiesRow[i].commodityId && quote.commoditiesRow[i].gradeId && quote.commoditiesRow[i].cropYear &&
                        quote.commoditiesRow[i][keyArr[j]] && quote.commoditiesRow[i][keyArr[j] + 'totalCost'])
                    ) {
                        invalidQuote = true;
                        break;
                    }
                }
                if (invalidQuote) {
                    break;
                }
            }
        }

        if (invalidQuote) {
            console.log("Not a valid quote ===> quoteId:" + quote._id);
            FailedQuote.findOneAndUpdate(
                { date: startOfDay },
                { $addToSet: {quoteIds: quote._id}, },
                { upsert: true }
            ).exec();

            next_call();
        } else {
            SaveNewQuote(quote, currency, weather, dontSendMail, next_call);
        }

    } catch (e) {
        console.log("calculate New quote function : quoteId===>" + quote._id, e);
        next_call();
    }
}

// Steps to generate quote and sent mail to buyer or broker

// Step 1: fetch latest currency, weather and freight setting from db and generate weather and plant image base64.
// Step 2: find out quotes for which pdf needs to be generated and send to buyer or broker.
// Step 3a: foreach quote fetch Freight, Loading Port, Shipping Term, Equipment, Bag, foreach quote column.
// Step 3b: foreach quote fetch Commodity Pricing, Commodity, Grade, foreach quote row.
// Step 4: filter out quote's rows and columns empty value.
// Step 5:

var cron = require('node-cron');
//cron.schedule('*/20 * * * * *', () => {
cron.schedule('0 12 * * *', () => {
    console.log('running a task 12 pm And date is :', new Date());
    startOfDay = moment().utc().startOf('day').toISOString();

    FailedQuote.findOneAndUpdate(
        {date: startOfDay},
        {$set: {quoteIds: [], date: startOfDay}},
        {upsert: true}
    ).exec();
    // get details
    collectAllDetailAndSendQuote();

}, {
    scheduled: true,
    timezone: "America/Regina"
});

async function collectAllDetailAndSendQuote(fnQuoteConditions, dontSendMail = false, done) {
  try {
    const quoteConditions = fnQuoteConditions ? fnQuoteConditions : await fetchQuoteQuery();

    const {currency, freightSetting, weather} = await fetchWeatherCurrencyAndFreightSetting();
    findQuoteAndDependencies(quoteConditions, freightSetting, currency, weather, dontSendMail, done);

  } catch (err) {
    console.log("error in crone async parallel",err);
    return;
  }
}
async function fetchQuoteQuery() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const condition = { status: 0, 'days.dayName': days[new Date().getDay()] };

  const broker_buyer = await Promise.all([
    Buyer.find(condition).lean(),
    Broker.find(condition).lean(),
  ]);

  var all_data = [];
  broker_buyer[0].forEach((val) => {
    all_data.push({ buyerId: val._id });
  });
  broker_buyer[1].forEach((val) => {
    all_data.push({ brokerId: val._id });
  });
  return all_data;
}

function fetchWeatherCurrencyAndFreightSetting() {
  return new Promise((resolve, reject) => {
    (async function () {
      try {
        const f_c_w_Data = await Promise.all([
          Currency.findOne({ status: 0 }).select("currencyUpdate currencyCADUSD").lean(),
          FreightSetting.findOne({}).lean(),
          Weather.findOne({ status: 0 }).select("weather weatherMap plantJpeg").lean(),
        ]);
        const currency = f_c_w_Data[0];
        const freightSetting = f_c_w_Data[1];
        const weather = f_c_w_Data[2];

        // convert weather and plant image to base64
        const weather_plant_base64 = await Promise.all([
          image2base64(image_path + weather.weatherMap),
          image2base64(image_path + weather.plantJpeg),
        ]);

        weather.weatherMap = weather_plant_base64[0];
        weather.plantJpeg = weather_plant_base64[1];

        resolve({currency, weather, freightSetting});
      } catch (err) {
        reject(err);
      }
    })();
  });
}
function findQuoteAndDependencies(quoteConditions, freightSetting, currency, weather, dontSendMail, cb) {
  asyncLib.forEachOfLimit(quoteConditions, 1, function (v, k, cb_broker_buyer) {
    (async function () {
      try {
        const quote = await Quote.findOne(v).sort('-createdAt').limit(1).lean();
        if (!quote)
          return cb_broker_buyer();

        const fetchedStatus = {col: false, row: false, colError: false, rowError: false};
        const callNextStepError = (quote) => {
          if ((fetchedStatus.colError || fetchedStatus.rowError) && fetchedStatus.colError !== fetchedStatus.rowError) {
            FailedQuote.findOneAndUpdate(
              { date: startOfDay },
              { $addToSet: {quoteIds: quote._id}, },
              { upsert: true }
            ).exec();

            cb_broker_buyer();
          }
        };
        const callNextStep = () => {
          if (fetchedStatus.col && fetchedStatus.row)
            calcuateNewQuote(quote, freightSetting, currency, weather, dontSendMail, cb_broker_buyer);
        };
        asyncLib.forEachOfLimit(quote.columnsCol, 1, function (value, key, cb_quote_col) {
          (async function () {
            try {
              const flseb_data = await Promise.all([
                // freightsPrice
                new Promise((resolve, reject) => {
                  (async function () {
                    if (!(value && value['loadingPortId'] && value['freightById'] && value['freightId'] && value['destinationPort'] && value['equipmentId']))
                      return reject(new Error('Something is missing from loading port, freight by, destination port, equipment.'));

                    let freightQuery = {
                      loadingPortId: value.loadingPortId,
                      equipmentId: value.equipmentId,
                      freightCompanyId: value.freightById,
                      cityName: value.destinationPort,
                      status: 0
                    };

                    if (value.freightId)
                      freightQuery = { status: 0, _id: value.freightId };

                    try {
                      let freight = await Freight.findOne(freightQuery, 'freightMT freightUSDMTFOB').lean();
                      if (!freight) return reject(new Error('Freight not found'));

                      resolve(freight);
                    } catch (e) {
                      reject(e);
                    }
                  })();
                }),

                // loadingPort
                new Promise((resolve, reject) => {
                  (async function () {
                    if (!(value && value['loadingPortId']))
                      return reject(new Error('loading port is missing'));

                    try {
                      let loadingPort = await LoadingPort.findById(value.loadingPortId, 'loadingPortName').lean();
                      if(!loadingPort) return reject(new Error('Loading port not found'));
                      resolve(loadingPort);
                    } catch (e) {
                      reject(e);
                    }
                  })();
                }),

                // shippingTerm
                new Promise((resolve, reject) => {
                  (async function () {
                    if (!(value && value['shippingtermsId']))
                      return reject(new Error('shipping term is missing'));

                    try {
                      let shippingTerm = await ShippingTerms.findById(value.shippingtermsId, 'term').lean();
                      if (!shippingTerm) return reject(new Error('Shipping terms not found'));

                      resolve(shippingTerm);
                    } catch (err) {
                      reject(err);
                    }
                  })();
                }),

                // equipment
                new Promise((resolve, reject) => {
                  (async function () {
                    if (!(value && value['equipmentId']))
                      return reject(new Error('equipment is missing'));

                    try {
                      let equipment = await Equipment.findById(value.equipmentId, 'equipmentName').lean();
                      if (!equipment) return reject(new Error('equipment not found'));

                      resolve(equipment);
                    } catch (e) {
                      reject(e);
                    }
                  })();
                }),

                // Bag
                new Promise((resolve, reject) => {
                  (async function () {
                    if (!(value && value['bagId']))
                      return reject(new Error('bag is missing'));

                    try {
                      let bag = await Bags.findById(value.bagId, 'name bagCost bulkBag').lean();
                      if (!bag) return reject(new Error('Bag not found'));

                      resolve(bag);
                    } catch (e) {
                      reject(e);
                    }
                  })();
                }),
              ]);

              if (flseb_data[0] && flseb_data[0]['_id']) {
                value['freightsPrice'] = flseb_data[0];
              }
              if (flseb_data[1] && flseb_data[1]['_id']) {
                value['loadingPort'] = flseb_data[1];
              }
              if (flseb_data[2] && flseb_data[2]['_id']) {
                value['shippingTerm'] = flseb_data[2];
              }
              if (flseb_data[3] && flseb_data[3]['_id']) {
                value['equipment'] = flseb_data[3];
              }
              if (flseb_data[4] && flseb_data[4]['_id']) {
                value['bag'] = flseb_data[4];
              }
            } catch (err) {
              console.log('Error while fetching columnCol');
              return cb_quote_col(quote);
            }
            return cb_quote_col();
          })();
        }, function (err) {
          if (err) {
            fetchedStatus.colError = true;
            return callNextStepError(quote);
          }
          fetchedStatus.col = true;
          callNextStep();
        });

        asyncLib.forEachOfLimit(quote.commoditiesRow, 1, function (value, key, cb_commodity_row) {
          (async function () {
            try {

              const ccg_data = await Promise.all([
                // commodityPrices
                new Promise((resolve, reject) => {
                  (async function () {
                    if (!(value && value['commodityId'] && value['gradeId'] && value['cropYear']))
                      return reject(new Error('Something is missing from commodity, grade, cropYear'));

                    try {
                      let commodityPricing = await CommodityPricing.findOne({
                        commodityId: value.commodityId,
                        gradeId: value.gradeId,
                        cropYear: value.cropYear,
                        status: 0
                      }, 'quantity bulk_USD_MTFOBPlant  bagged_USD_MT_FOBPlant shippingPeriodTo shippingPeriodFrom priceAsPer quantityUnit').lean();
                      if (!commodityPricing) return reject(new Error('commodity pricing not found.'));

                      resolve(commodityPricing);
                    } catch (e) {
                      reject(e);
                    }
                  })();
                }),

                // commodity
                new Promise((resolve, reject) => {
                  (async function () {
                    if (!(value && value['commodityId']))
                      return reject(new Error('commodity is missing'));

                    try {
                      let commodity = await Commodity.findById(value.commodityId, 'commodityName').lean();
                      if (!commodity) return reject(new Error('commodity not found'));

                      resolve(commodity);
                    } catch (e) {
                      reject(e);
                    }
                  })();
                }),

                // grade
                new Promise((resolve, reject) => {
                  (async function () {
                    if (!(value && value['gradeId']))
                      return reject(new Error('grade is missing'));

                    try {
                      let grade = await Grade.findById(value.gradeId, 'gradeName').lean();
                      if (!grade) return reject(new Error('grade not found'));

                      resolve(grade);
                    } catch (e) {
                      reject(e);
                    }
                  })();
                }),
              ]);

              if (ccg_data[0] && ccg_data[0]._id) {
                value['commodityPrices'] = ccg_data[0];
              }
              if (ccg_data[1] && ccg_data[1]._id) {
                value['commodity'] = ccg_data[1];
              }
              if (ccg_data[2] && ccg_data[2]._id) {
                value['grade'] = ccg_data[2];
              }
            } catch (err) {
              console.log("Error fetching rowCol");
              return cb_commodity_row(quote);
            }
            return cb_commodity_row();
          })();
        }, function (err) {
          if (err) {
            fetchedStatus.rowError = true;
            return callNextStepError(quote);
          }
          fetchedStatus.row = true;
          callNextStep();
        });
      } catch (err) {
        return cb_broker_buyer();
      }
    })();
  }, function (err) {
    cb && cb(err);
    if (err)
        console.log("Error in async for of limit");
    else
        console.log("Completed.........");
});
}

function calculateFinalPortPrice(value, portPrice) {
    let finalPortPrice = 0;
    if (value.weightType == "CWT") {
        finalPortPrice = portPrice / 22.0462;
    }
    if (value.weightType == "MT") {
        finalPortPrice = portPrice;
    }
    return finalPortPrice;
}

function calculateInlandFreight(value, freightSettingList, currency) {
    let inlandFreight = 0;
    if (value.loadingPort &&
        (value.loadingPort.loadingPortName == "Montreal" ||
            (value.shippingTerm && value.loadingPort.loadingPortName == "Outlook" && value.shippingTerm.term == "Track MTL"))) {
        inlandFreight = (freightSettingList.intermodalMTL * 22.046) / currency.currencyCADUSD;
    }
    else if (value.loadingPort &&
        (value.loadingPort.loadingPortName == "Vancouver" ||
            (value.shippingTerm && value.loadingPort.loadingPortName == "Outlook" && value.shippingTerm.term == "Track VCR"))) {
        inlandFreight = (freightSettingList.intermodalVCR * 22.046) / currency.currencyCADUSD;
    }
    else {
        inlandFreight = 0;
    }
    return inlandFreight;
}

function calculatePrice(value, freightSettingList, inlandFreight, currency) {
    let portPrice = 0;
    if (value.shippingTerm && (value.shippingTerm.term == "CY-MTL" || value.shippingTerm.term == "CY-VCR")) {
        portPrice = ((freightSettingList.CyUsd / freightSettingList.cwtsFcl) * 22.0462) + inlandFreight;
    }
    else if (value.shippingTerm && (value.shippingTerm.term == "Track MTL" || value.shippingTerm.term == "Track VCR")) {
        portPrice = inlandFreight;
    }
    else if (value.shippingTerm && value.shippingTerm.term == "FOB Rudy") {
        portPrice = 0;
    }
    else if (value.shippingTerm && value.equipment && value.shippingTerm.term == "FOB Saskatoon" && value.equipment.equipmentName == "Hoppercar" && value.destinationPort == "") {
        portPrice = (freightSettingList.fobSktnHoppercar * 22.0462) / currency.currencyCADUSD;
    }
    else if (value.shippingTerm && value.equipment && value.shippingTerm.term == "FOB Saskatoon" && value.equipment.equipmentName == "Boxcar" && value.destinationPort == "") {
        portPrice = (freightSettingList.fobSktnBoxcar * 22.0462) / currency.currencyCADUSD;
    }
    else if (value.loadingPort && value.equipment && value.loadingPort.loadingPortName == "Saskatoon" && value.equipment.equipmentName == "Boxcar") {
        portPrice = (freightSettingList.fobSktnBoxcar * 22.0462) / currency.currencyCADUSD + (value.freightsPrice.freightMT.bagToBag || 0);
    }
    else if (value.loadingPort && value.equipment && value.loadingPort.loadingPortName == "Saskatoon" && value.equipment.equipmentName == "Hoppercar") {
        portPrice = (freightSettingList.fobSktnHoppercar * 22.0462) / currency.currencyCADUSD + (value.freightsPrice.freightMT.bulkToBag || 0);
    }
    else if (value.shippingTerm && value.equipment && value.shippingTerm.term == "FOB Winnipeg" && value.equipment.equipmentName == "Hoppercar" && value.destinationPort == "") {
        portPrice = (freightSettingList.fobWpgHoppercar * 22.0462) / currency.currencyCADUSD;
    }
    else if (value.shippingTerm && value.equipment && value.shippingTerm.term == "FOB Winnipeg" && value.equipment.equipmentName == "Boxcar" && value.destinationPort == "") {
        portPrice = (freightSettingList.fobWpgBoxcar * 22.0462) / currency.currencyCADUSD;
    }
    else {
        if (value.loadingPort && (value.loadingPort.loadingPortName == "Montreal" || value.loadingPort.loadingPortName == "Vancouver")) {
            if (value.bag && value.bag.bulkBag == "Bag") {
                portPrice = value.freightsPrice.freightUSDMTFOB.bagToBag || 0;
            }
            else if (value.bag && value.bag.bulkBag == "Bulk") {
                portPrice = (value.freightsPrice.freightUSDMTFOB.bulkToBulk || 0);
            }
            else {
                portPrice = 0;
            }
        }
        else {
            if (value.bag && value.bag.bulkBag == "Bag") {
                if (value.freightsPrice && value.freightsPrice.freightMT && value.freightsPrice.freightMT.bagToBag) {
                    portPrice = value.freightsPrice.freightMT.bagToBag || 0;
                }
                else {
                    portPrice = 0;
                }
            }
            else if (value.bag && value.bag.bulkBag == "Bulk") {
                if (value.freightsPrice && value.freightsPrice.freightMT && value.freightsPrice.freightMT.bulkToBulk) {
                    portPrice = (value.freightsPrice.freightMT.bulkToBulk || 0);
                }
                else {
                    portPrice = 0;
                }
            }
            else {
                portPrice = 0;
            }
        }
    }
    return portPrice;
}

var {generateCommodityPricingExcel} = require('./commodityPricing');
var {generateOpenContractSalesExcel} = require('./salesContract');
var {generateBidsheetExcel} = require('./bidsheet');
// This cron will run every night 11:59PM in SK canada time
cron.schedule('59 5 * * 2-6', async function() {
    await generateCommodityPricingExcel();
    await generateOpenContractSalesExcel();
    await generateBidsheetExcel();
});

module.exports.cron = collectAllDetailAndSendQuote;
