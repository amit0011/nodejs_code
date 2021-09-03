const mongoose = require('mongoose');
const session = require('@ag-libs/session');
const fxContract = mongoose.model('fxContract');
const Sales = mongoose.model('salesContract');
const async = require('async');

const { SendResponse } = require("@ag-common");

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function (router) {

    router
        .route('/fx_Contract')
        .post(session.adminCheckToken, methods.add)
        .get(session.adminCheckToken, methods.list);

    router
        .route('/fxContract')
        .post(session.adminCheckToken, methods.update);

    router
        .route('/fxHedgeReport')
        .get(methods.fxHedgeReport);

};

methods.add = async function (req, res) {

    req.checkBody('contractNumber', 'contractNumber  is required.').notEmpty();
    //req.checkBody('tradeDate', 'tradeDate  is required.').notEmpty();
    //req.checkBody('expiryDate', 'expiryDate is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {status: 400, errors, userMessage: "Validation errors"});
    }
    let data;

    if (req.body._id) {
        data = await fxContract.findById(req.body._id);
        if (!data) {
            return SendResponse(res, {error: true, status: 404, userMessage: "Contract doesn't exists."});
        }

        data = await fxContract.findByIdAndUpdate(req.body._id, req.body, { new: true });

        return SendResponse(res, {data, userMessage: "Contract updated successfully"});
    }

    data = await fxContract.findOne({ contractNumber: req.body.contractNumber, status: 0 });

    if (data) {
        return SendResponse(res, {status: 204, userMessage: "Contract already exist."});
    }

    var fxc = new fxContract(req.body);
    fxc.save((err) => {
        if (err) {
            return SendResponse(res, {errors: err, userMessage: "Some server error has occurred."});
        }
        return SendResponse(res, {data, userMessage: "Contract added successfully"});
    });

};


methods.update = async function (req, res) {
    req.checkBody('contractNumber', 'contractNumber  is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, { status: 400, errors, userMessage: "Validation errors"});
    }

    if (req.body.contractNumber)
        delete req.body.contractNumber;

    const data = await fxContract.findByIdAndUpdate(req.body._id, req.body, { new: true });
    SendResponse(res, { userMessage: "Updated.", data });
};

methods.list = async (req, res) => {
    var condition = { $and: [{ status: 0 }] };

    const isClose = JSON.parse(req.query.isClose);
    if (isClose) {
        condition.$and.push({isClose});
    } else if (isClose === false) {
        condition.$and.push({isClose: {$ne: true}});
    }

    if (req.query.fromDate && req.query.toDate && req.query.fromDate != 'undefined' && req.query.toDate != 'undefined') {
        condition.$and.push({expiryDate: {$gte: req.query.fromDate, $lte: req.query.toDate}});
    } else if (req.query.fromDate && req.query.fromDate != 'undefined') {
        condition.$and.push({expiryDate: {$gte: req.query.fromDate}});
    } else if (req.query.toDate && req.query.toDate != 'undefined') {
        condition.$and.push({expiryDate: {$lte: req.query.toDate}});
    }

    if (req.query.search && req.query.search != 'undefined') {
        condition.$and.push({ contractNumber: { $regex: req.query.search, $options: "si" } });
    }

    const data = await fxContract.find(condition).sort({ createdAt: -1 });

    return SendResponse(res, { userMessage: "List", data });
};

methods.fxHedgeReport = (req, res) => {
    const months = {jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12};
    function getTotalAvg(key) {
        return {
            $reduce: { input: "$contract", initialValue: 0, in: { $add: ["$$value", `$$this.${key}`] } }
        };
    }

    function getAvg(key) {
        return {
            $cond: {
                if: {$and: [{ $ne: ['$contract.usdAmount', 0] }, {$eq: ["$contract.month", months[key]]}, { $ne: [`$${key}`, 0] }]},
                then: {
                    $multiply: ["$contract.strikeRate", { $divide: ["$contract.usdAmount", `$${key}`] }]
                },
                else: 0
            }
        };
    }

    function getTotalUSD(month) {
        return {
            $sum: {
                $cond: {
                    if: { $eq: ["$month", month] },
                    then: "$usdAmount",
                    else: 0
                }
            }
        };
    }

    function getFirst(key) {
        return { "$first": `$${key}` };
    }

    function getFxWeightedAvg(key) {
        return {
            $cond: {
                if: { $gt: [`$totalUSD`, 0] },
                then: {
                    $multiply: [`$totalAvgRate.${key}`, { $divide: [`$usd.${key}`, `$totalUSD`] }]
                },
                else: 0
            }
        };
    }
    var year = Number(req.query.year);
    var start_date = `${year}-09-01 00:00:00`;
    var end_date = `${year + 1}-08-31 23:59:59`;

    async.parallel({
        "fxConctract": (cb) => {

            var aggregate = fxContract.aggregate();
            aggregate
                .match({
                    status: 0,
                    expiryDate: { $gte: new Date(start_date), $lte: new Date(end_date) }
                })
                .project({
                    "expiryDate": 1,
                    "strikeRate": 1,
                    "contractNumber": 1,
                    "usdAmount": {
                        $cond: {
                            if: {$in: ["$structure", ["Collar", "Forward Confirmation", "Ratio Forward"]]},
                            then: "$usdAmount",
                            else: {$multiply: ["$usdAmount", -1]}
                        }
                    },
                    "month": { "$month": "$expiryDate" },
                    "year": { "$year": "$expiryDate" },
                    "structure": 1
                })
                .group({
                    "_id": null,
                    "contract": {
                        $push: {
                            "expiryDate": "$expiryDate",
                            "strikeRate": "$strikeRate",
                            "contractNumber": "$contractNumber",
                            "usdAmount": "$usdAmount",
                            "month": "$month",
                            "year": "$year",
                            "totalValue": "$usdAmount",
                            "structure": "$structure"
                        }
                    },
                    "totalUSD": { $sum: "$usdAmount" },
                    "sep": getTotalUSD(9),
                    "oct": getTotalUSD(10),
                    "nov": getTotalUSD(11),
                    "dec": getTotalUSD(12),
                    "jan": getTotalUSD(1),
                    "feb": getTotalUSD(2),
                    "mar": getTotalUSD(3),
                    "apr": getTotalUSD(4),
                    "may": getTotalUSD(5),
                    "jun": getTotalUSD(6),
                    "jul": getTotalUSD(7),
                    "aug": getTotalUSD(8),
                })
                .unwind({ path: "$contract", preserveNullAndEmptyArrays: false })
                .group({
                    "_id": null,
                    "contract": {
                        $push: {
                            "expiryDate": "$contract.expiryDate",
                            "strikeRate": "$contract.strikeRate",
                            "contractNumber": "$contract.contractNumber",
                            "usdAmount": "$contract.usdAmount",
                            "month": "$contract.month",
                            "year": "$contract.year",
                            "structure": "$contract.structure",
                            "totalValue": "$contract.totalValue",
                            "sep": getAvg('sep'),
                            "oct": getAvg('oct'),
                            "nov": getAvg('nov'),
                            "dec": getAvg('dec'),
                            "jan": getAvg('jan'),
                            "feb": getAvg('feb'),
                            "mar": getAvg('mar'),
                            "apr": getAvg('apr'),
                            "may": getAvg('may'),
                            "jun": getAvg('jun'),
                            "jul": getAvg('jul'),
                            "aug": getAvg('aug'),
                        }
                    },
                    "totalUSD": { "$first": "$totalUSD" },
                    "sep": getFirst('sep'),
                    "oct": getFirst('oct'),
                    "nov": getFirst('nov'),
                    "dec": getFirst('dec'),
                    "jan": getFirst('jan'),
                    "feb": getFirst('feb'),
                    "mar": getFirst('mar'),
                    "apr": getFirst('apr'),
                    "may": getFirst('may'),
                    "jun": getFirst('jun'),
                    "jul": getFirst('jul'),
                    "aug": getFirst('aug'),
                })
                .project({
                    "_id": 1,
                    "contract": 1,
                    "totalUSD": 1,
                    "usd": {
                        "sep": "$sep",
                        "oct": "$oct",
                        "nov": "$nov",
                        "dec": "$dec",
                        "jan": "$jan",
                        "feb": "$feb",
                        "mar": "$mar",
                        "apr": "$apr",
                        "may": "$may",
                        "jun": "$jun",
                        "jul": "$jul",
                        "aug": "$aug",
                    },
                    "totalAvgRate": {
                        "sep": getTotalAvg('sep'),
                        "oct": getTotalAvg('oct'),
                        "nov": getTotalAvg('nov'),
                        "dec": getTotalAvg('dec'),
                        "jan": getTotalAvg('jan'),
                        "feb": getTotalAvg('feb'),
                        "mar": getTotalAvg('mar'),
                        "apr": getTotalAvg('apr'),
                        "may": getTotalAvg('may'),
                        "jun": getTotalAvg('jun'),
                        "jul": getTotalAvg('jul'),
                        "aug": getTotalAvg('aug')
                    }

                })
                .project({
                    "_id": 1,
                    "contract": 1,
                    "totalUSD": 1,
                    "usd": 1,
                    "totalAvgRate": 1,
                    "fxWeightedAverageRate": {
                        "sep": getFxWeightedAvg('sep'),
                        "oct": getFxWeightedAvg('oct'),
                        "nov": getFxWeightedAvg('nov'),
                        "dec": getFxWeightedAvg('dec'),
                        "jan": getFxWeightedAvg('jan'),
                        "feb": getFxWeightedAvg('feb'),
                        "mar": getFxWeightedAvg('mar'),
                        "apr": getFxWeightedAvg('apr'),
                        "may": getFxWeightedAvg('may'),
                        "jun": getFxWeightedAvg('jun'),
                        "jul": getFxWeightedAvg('jul'),
                        "aug": getFxWeightedAvg('aug')
                    }
                });

            aggregate.exec((err, data) => { cb(err, data); });
        },
        "sales": (cb) => {
            Sales.find({ status: { $nin: [2] }, cropYear: year }).lean()
                .exec((err, sales) => {
                    if (err) {
                        cb(err, null);
                    } else {
                        var list = [];
                        var result = {
                            sep: 0,
                            oct: 0,
                            nov: 0,
                            dec: 0,
                            jan: 0,
                            feb: 0,
                            mar: 0,
                            apr: 0,
                            may: 0,
                            jun: 0,
                            jul: 0,
                            aug: 0
                        };
                        var month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

                        for (var obj of sales) {
                            if (obj.shipmentScheldule.length) {
                                for (var i = 0; i < obj.shipmentScheldule.length; i++) {

                                    var new_obj = Object.assign({}, obj);

                                    if (obj.shipmentScheldule[i] && obj.shipmentScheldule[i].endDate) {
                                        if (new_obj.priceUSD && new_obj.shipmentScheldule[i].ship) {
                                            var mon = new Date(obj.shipmentScheldule[i].endDate).getMonth() + 1;
                                            new_obj[month[mon]] = ((new_obj.priceUSD * new_obj.shipmentScheldule[i].ship) / 100) * new_obj.shipmentScheldule[i].exchangeRate;
                                        }
                                    }
                                    list.push(new_obj);
                                }
                            }
                        }

                        for (var data of list) {
                            result.sep += data.sep ? data.sep : 0;
                            result.oct += data.oct ? data.oct : 0;
                            result.nov += data.nov ? data.nov : 0;
                            result.dec += data.dec ? data.dec : 0;
                            result.jan += data.jan ? data.jan : 0;
                            result.feb += data.feb ? data.feb : 0;
                            result.mar += data.mar ? data.mar : 0;
                            result.apr += data.apr ? data.apr : 0;
                            result.may += data.may ? data.may : 0;
                            result.jun += data.jun ? data.jun : 0;
                            result.jul += data.jul ? data.jul : 0;
                            result.aug += data.aug ? data.aug : 0;
                        }
                        cb(null, result);
                    }
                });
        }
    }, (err, data) => {
        if (err) {
            //send response to client
            return SendResponse(res, {
                status: 500, errors: err, error: true,
                userMessage: 'some server error has occurred.'
            });
        }

        //send response to client
        return SendResponse(res, { data, userMessage: 'contracts list.' });
    });
};
