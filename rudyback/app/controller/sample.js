var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Sample = mongoose.model('productionRecordsSample');
const SampleCabinet = mongoose.model('sampleCabinet');
const moment = require('moment');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/sample')
        .post(session.adminCheckToken, methods.addProductionRecordsSample)
        .get(session.adminCheckToken, methods.getProductionRecordsSample);

    router
        .route('/sample/delete')
        .post(session.adminCheckToken, methods.removeSample);

    router
        .route('/sample/list')
        .post(session.adminCheckToken, methods.getSampleListAccordingToCommodity);

    router
        .route('/sample/productionRecordListByUser')
        .get(session.adminCheckToken, methods.productionRecordListByUser);

    router
        .route('/sample/targetPriceReport')
        .post(session.adminCheckToken, methods.targetPriceReport);

    router
        .route('/sample/dump')
        .post(session.adminCheckToken, methods.updateDump);

    router
        .route('/sample/dumped')
        .post(session.adminCheckToken, methods.updateDumped);

    router
        .route('/sample/dumpList')
        .get(session.adminCheckToken, methods.dumpList);

    router
        .route('/sample/getNumber')
        .get(session.adminCheckToken, methods.getSampleNumber);
};

/*=============================================
***   getSampleListAccordingToCommodity  ***
===============================================*/
methods.getSampleListAccordingToCommodity = async function(req, res) {
    let data = await Sample.find({
            status: 0,
            growerId: req.body.growerId,
            commodityId: req.body.commodityId
        })
        .populate('commodityId gradeId varietyId growerId')
        .sort('sampleNumber')
        .lean();

    return SendResponse(res, {data, userMessage: 'sample list.'});
};/*-----  End of getSampleListAccordingToCommodity  ------*/

/*============================
***   remove Sample  ***
==============================*/
methods.removeSample = async function(req, res) {
    let analysis = await Sample.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    const samples = await Sample.find({_id: {$in: req.body.idsArray}}).select('sampleNumber').lean();
    const sampleNumbers = samples.map(s => s.sampleNumber);
    const samplecabinet = await SampleCabinet.findOne();
    await SampleCabinet.findOneAndUpdate({
        available: [...samplecabinet.available, ...sampleNumbers.filter(num => num <= process.env.TOTAL_SAMPLE_CABINETS)]
            .filter((value, index, self) => self.indexOf(value) === index).sort((a, b) => a - b),
        occupied: samplecabinet.occupied.filter(number => !sampleNumbers.includes(number))
    });

    return SendResponse(res, {data: analysis, userMessage: 'Sample deleted.'});
};/*-----  End of removeSample  ------*/

/*============================
***   update markForDump  ***
==============================*/
methods.updateDump = async function(req, res) {
    let data = await Sample.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { markForDump: 'Yes' } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Sample damp update successfully.'});
};/*-----  End of update dump  ------*/

/*============================
***   update dumped  ***
==============================*/
methods.updateDumped = async function(req, res) {
    let data = await Sample.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { dumped: 'Yes', dumpedBy: req.admin._id } },
        { multi: true }
    );

    const samples = await Sample.find({_id: {$in: req.body.idsArray}}).select('sampleNumber').lean();
    const sampleNumbers = samples.map(s => s.sampleNumber);
    const samplecabinet = await SampleCabinet.findOne();
    await SampleCabinet.findOneAndUpdate({
        available: [...samplecabinet.available, ...sampleNumbers.filter(num => num <= process.env.TOTAL_SAMPLE_CABINETS)]
            .filter((value, index, self) => self.indexOf(value) === index).sort((a, b) => a - b),
        occupied: samplecabinet.occupied.filter(number => !sampleNumbers.includes(number))
    });

    return SendResponse(res, {data, userMessage: 'Sample dumped update successfully.'});
};/*-----  End of update dump  ------*/

/*============================
***   Dump list ***
==============================*/
methods.dumpList = async function(req, res) {

    var query = { markForDump: {$in: ['1', 'Yes']}, dumped:'' };

    let data = await Sample.find(query)
        .populate('commodityId gradeId varietyId growerId lastEditedBy')
        .sort("-createdAt");

    return SendResponse(res, {data, userMessage: 'dumped list.'});
};/*-----  End of dump list  ------*/

/*=================================
***   addProductionRecordsSample  ***
===================================*/
methods.addProductionRecordsSample = async function(req, res) {
    req.checkBody('commodityId', 'Commodity is required.').notEmpty();
    let errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    // check set if sampleNumber is not set on receiving sample
    let samplecabinet = null, data;
    if (req.body.receiveDate && !req.body.sampleNumber) {
        samplecabinet = await SampleCabinet.findOne();
        req.body.sampleNumber = samplecabinet.available.shift();
        samplecabinet.occupied.push(req.body.sampleNumber);
    }

    if (req.body._id) {
        req.body.lastEditedBy = req.admin._id;
        req.body.lastEditedOn = new Date();
        const sample = await Sample.findById(req.body._id);
        if (sample && ['Yes', '1'].includes(sample.dumped)) {
            req.body.dumped = sample.dumped;
        }

        data = await Sample.findByIdAndUpdate(req.body._id, req.body, {new: true});
    } else {
        req.body.createdBy = req.admin._id;
        data = await (new Sample(req.body)).save();
    }

    if (samplecabinet) {
        await SampleCabinet.findOneAndUpdate({
            occupied: samplecabinet.occupied,
            available: samplecabinet.available
        });
    }

    return SendResponse(res, {data, userMessage: 'Sample added successfully.'});
};/*-----  End of addProductionRecordsSample  ------*/

/*======================================
***   getProductionRecordsSample  ***
========================================*/
methods.getProductionRecordsSample = async function(req, res) {
    var query = { dumped: {$nin: ['1', 'Yes']} };

    for (var key in req.query) {
        if (key in req.query && req.query[key] != 'undefined' && req.query[key]) {
            query[key] = key.endsWith('Id') ? mongoose.Types.ObjectId(req.query[key]) : (isNaN(req.query[key]) ? req.query[key] : +req.query[key]);
        }
    }

    if (req.query.includeDumped) {
      delete query.includeDumped;
      delete query.dumped;
    }

    if (query.cropYear) {
      query.cropYear = query.cropYear + '';
    }

    if (req.query.fromDate && req.query.fromDate !== 'undefined' && req.query.toDate && req.query.toDate !== 'undefined') {
        query.receiveDate = { $gte: req.query.fromDate,$lte: moment(req.query.toDate, "YYYY-MM-DD").add(7, 'hours')};
    } else if (req.query.fromDate && req.query.fromDate !== 'undefined') {
        query.receiveDate = { $gte: req.query.fromDate};
    } else if (req.query.toDate && req.query.toDate !== 'undefined') {
        query.receiveDate = { $lte: moment(req.query.toDate, "YYYY-MM-DD").add(7, 'hours')};
    }

    query.status = 0;
    switch (req.query.status) {
        case 'requested':
            query.receiveDate = {$eq: null};
            break;

        case 'received':
            query.receiveDate = {$ne: null};
            break;
    }

    delete query.fromDate;
    delete query.toDate;
    delete query.sort;
    delete query.sortOrder;

    const sort = req.query.sort ? {[req.query.sort]: +(req.query.sortOrder || 1), createdAt: -1} : {status: 1, sampleNotNull: -1, sampleNumber: 1, dumped: 1, createdAt: -1};
    let data = await Sample.aggregate([
      {$match: query},
      {$lookup: {from: 'commodities', foreignField: '_id', localField: 'commodityId', as: 'commodityId'}},
      {$unwind: {path: "$commodityId", preserveNullAndEmptyArrays: true }},
      {$lookup: {from: 'grades', localField: 'gradeId', foreignField: '_id', as: 'gradeId'}},
      {$unwind: {path: "$gradeId", preserveNullAndEmptyArrays: true }},
      {$lookup: {from: 'varieties', localField: 'varietyId', foreignField: '_id', as: 'varietyId'}},
      {$unwind: {path: "$varietyId", preserveNullAndEmptyArrays: true }},
      {$lookup: {from: 'growers', localField: 'growerId', foreignField: '_id', as: 'growerId'}},
      {$unwind: {path: "$growerId", preserveNullAndEmptyArrays: true }},
      {$lookup: {from: 'admins', localField: 'lastEditedBy', foreignField: '_id', as: 'lastEditedBy'}},
      {$unwind: {path: "$lastEditedBy", preserveNullAndEmptyArrays: true }},
      {$addFields: {
        sampleNotNull: {$cond: {
          if: {$gte: ['$sampleNumber', 0]},
          then: 1,
          else: 0,
        }}
      }},
      {$sort: sort}
    ]);

    return SendResponse(res, {data, userMessage: 'sample list.'});
};/*-----  End of getProductionRecordsSample  ------*/

methods.productionRecordListByUser = async (req, res) => {
    var condition = { $and: [{ createdBy: req.query.adminId }] };

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

    let data = await Sample.paginate(condition, {
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

    return SendResponse(res, {data, userMessage: 'list.'});
};

methods.targetPriceReport = (req, res) => {
    let condition = {
        status: 0,
        target: { $ne: null },
        targetCWT: { $ne: null },
        commodityId: { $ne: null },
        gradeId: { $ne: null },
        unit: { $ne: "" }
    };

    if (req.body.commodityId) {
        condition['commodityId'] = mongoose.Types.ObjectId(req.body.commodityId);
    }

    if (req.body.gradeId) {
        condition['gradeId'] = mongoose.Types.ObjectId(req.body.gradeId);
    }

    if (req.body.cropYear) {
        condition['cropYear'] = req.body.cropYear;
    }

    var aggregate = Sample.aggregate();

    aggregate.match(condition)
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
        })
        .project({
            "cropYear": 1,
            "unit": 1,
            "targetCWT": 1,
            "growerId.firstName": 1,
            "growerId.lastName": 1,
            "growerId.farmName": 1,
            "growerId.phone": 1,
            "growerId._id": 1,
            "commodityId.commodityName": 1,
            "commodityId.commodityWeight": 1,
            "commodityId._id": 1,
            "gradeId.gradeName": 1,
            "gradeId._id": 1
        })
        .lookup({
            from: "bidsheets",
            let: {
                commodityId: "$commodityId._id",
                gradeId: "$gradeId._id"
            },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$status", 0] },
                            { $eq: ["$commodityId", "$$commodityId"] },
                            { $eq: ["$gradeId", "$$gradeId"] }
                        ]
                    }
                }
            }, { $project: { "bidPeriod": 1 } }],
            as: "bidsheet"
        })
        .unwind({
            path: "$bidsheet",
            preserveNullAndEmptyArrays: false
        })
        .project({
            "cropYear": 1,
            "unit": 1,
            "targetCWT": 1,
            "growerId": 1,
            "commodityId": 1,
            "gradeId": 1,
            "bidsheet": "$bidsheet.bidPeriod"
        })
        .project({
            "cropYear": 1,
            "unit": 1,
            "targetCWT": 1,
            "growerId": 1,
            "commodityId": 1,
            "gradeId": 1,
            "bidsheet": {
                "$reduce": {
                    "input": "$bidsheet",
                    "initialValue": {
                        "bidDel": 0,
                        "bidDelUnit": ''
                    },
                    "in": {
                        "$cond": {
                            'if': {
                                '$gt': [{
                                    "$cond": {
                                        'if': {
                                            '$eq': ['$$this.bidDelUnit', 'CWT']
                                        },
                                        'then': "$$this.bidDel",
                                        'else': {
                                            "$cond": {
                                                "if": {
                                                    "$eq": ["$$this.bidDelUnit", "MT"]
                                                },
                                                "then": {
                                                    "$divide": ["$$this.bidDel", 22.0462]
                                                },
                                                "else": {
                                                    "$cond": {
                                                        "if": {
                                                            "$in": ["$$this.bidDelUnit", ['Lbs', 'LBS', 'lbs']]
                                                        },
                                                        "then": {
                                                            "$multiply": ["$$this.bidDel", 100]
                                                        },
                                                        "else": {
                                                            "$divide": ["$$this.bidDel", "$commodityId.commodityWeight"]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }, '$$value.bidDel']
                            },
                            'then': {
                                "bidDel": {
                                    "$cond": {
                                        'if': {
                                            '$eq': ['$$this.bidDelUnit', 'CWT']
                                        },
                                        'then': "$$this.bidDel",
                                        'else': {
                                            "$cond": {
                                                "if": {
                                                    "$eq": ["$$this.bidDelUnit", "MT"]
                                                },
                                                "then": {
                                                    "$divide": ["$$this.bidDel", 22.0462]
                                                },
                                                "else": {
                                                    "$cond": {
                                                        "if": {
                                                            "$in": ["$$this.bidDelUnit", ['Lbs', 'LBS', 'lbs']]
                                                        },
                                                        "then": {
                                                            "$multiply": ["$$this.bidDel", 100]
                                                        },
                                                        "else": {
                                                            "$divide": ["$$this.bidDel", "$commodityId.commodityWeight"]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "bidDelUnit": 'CWT'
                            },
                            'else': {
                                "bidDel": '$$value.bidDel',
                                "bidDelUnit": 'CWT'
                            }
                        }
                    }
                }
            }
        })
        .project({
            "cropYear": 1,
            "unit": 1,
            "targetCWT": 1,
            "growerId": 1,
            "commodityId": 1,
            "gradeId": 1,
            "bidsheet": 1,
        })
        .project({
            "cropYear": 1,
            "unit": 1,
            "targetCWT": 1,
            "growerId": 1,
            "commodityId": 1,
            "gradeId": 1,
            "bidPriceCWT": "$bidsheet.bidDel",
            "isGreaterOrEqual": {
                $gte: ["$targetCWT", "$bidsheet.bidDel"]
            }
        })
        .match({
            "isGreaterOrEqual": true
        });

    let options = { page: req.body.page || 1, limit: 10 };

    Sample.aggregatePaginate(aggregate, options, function(err, results, pageCount) {
        if (err) {
            return SendResponse(res, {
                error: true, status: 500, errors: err,
                userMessage: 'Server error.'
            });
        }

        let data = {
            docs: results,
            total: pageCount * 10,
            page: options.page
        };
        return SendResponse(res, {data, userMessage: 'list.'});
    });
};

methods.getSampleNumber = async (req, res) => {
    let data = await SampleCabinet.findOne();

    return SendResponse(res, {
        data: data.available.shift(),
        userMessage: 'sample number fetched.'
    });
};
