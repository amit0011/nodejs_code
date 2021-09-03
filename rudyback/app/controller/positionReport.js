const mongoose = require('mongoose');
const session = require('@ag-libs/session');
const Commodity = mongoose.model('commodity');
const PositionReport = mongoose.model('positionreport');
const CropYear = require("@ag-libs/cropYear");
const { SendResponse } = require("@ag-common");
const cron = require('node-cron');
const moment = require('moment');

const methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

    router
        .route('/position-report/summary')
        .get(session.adminCheckToken, methods.getSalesSummaryReport);

    router
        .route('/position-report/refresh')
        .post(session.adminCheckToken, methods.refreshSummaryReport);
};

methods.getSalesSummaryReport = async (req, res) => {
    const { year } = req.query;

    if (!year || year == 'undefined') {
        return SendResponse(res, {
            userMessage: 'Year is required.'
        });
    }

    const data = await PositionReport.findOne({ cropYear: year })
        .populate("report.data report.data.commodityId report.data.inventoryGrade")
        .lean();

    const {cropYear} = CropYear.currentCropYear();
    data.whenWillBeUpdated = cropYear == year ? moment().endOf('hour').add(1, 'seconds').toISOString() : null;

    return SendResponse(res, { userMessage: 'Position report summary data.', data });
};

methods.refreshSummaryReport = async (req, res) =>  {
    var condition = { deleteStatus: 0 };

    const { year } = req.body;

    if (!year || year == 'undefined') {
        return SendResponse(res, {
            userMessage: 'Year is required.'
        });
    }

    var aggregate = Commodity.aggregate();

    aggregate.match(condition).project({ "_id": 1, 'commodityWeight':1, isByProduct: 1 });
    let cp = CropYear.currentCropYear();
    if (cp.cropYear < year) {
        cp = CropYear.makeCropYear(year-0);
    }

    // PRODUCTION CONTRACT
    aggregate.lookup({
            from: "productioncontracts",
            let: { commodityId: "$_id", isByProduct: "$isByProduct" },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            { $ne: ["$status", 2] },
                            { $eq: ["$commodityId", "$$commodityId"] },
                            { $eq: ["$cropYear", year] }
                        ]
                    }
                }
            }, {
                $project: {
                    quantityLbs: 1,
                    cropYear: 1,
                    CWTDel: 1,
                    inventoryGrade: {
                        $cond: {
                            if: { $ne: ['$$isByProduct', true]},
                            then: "$inventoryGrade",
                            else: null,
                        }
                    },
                    type: "production",
                    contractNumber: 1,
                    status: 1
                }
            }],
            as: "production"
        })
        .unwind({ path: "$production", preserveNullAndEmptyArrays: true })
        .lookup({
                from: "scales",
                let: { contractNumber: "$production.contractNumber" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{ $ne: ["$void", true] }, { $eq: ["$contractNumber", "$$contractNumber"] }]
                        }
                    }
                }, {
                    $project: { netWeight: 1, void:1 }
                }],
                as: "production.scale"
        })
        .project({
            _id : 1,
            "commodityWeight":1,
            "isByProduct": 1,
            "production._id": 1,
            "production.status": 1,
            "production.CWTDel": 1,
            "production.cropYear": 1,
            "production.contractNumber": 1,
            "production.quantityLbs": 1,
            "production.inventoryGrade": 1,
            "production.type": 1,
            "production.scaleTotal": {
              $reduce: {
                  input: "$production.scale",
                  initialValue: 0,
                  in: { $sum: ["$$value", { "$multiply": ['$$this.netWeight', 2.2046] }] }
              }
            }
        })
        .group({
            "_id":"$_id",
            "isByProduct":{"$first":"$isByProduct"},
            "commodityWeight": { "$first" : "$commodityWeight"},
            "production": { "$push": "$production" }
        })

        // By-Products against production contract's tickets
        .lookup({
            from: "productioncontracts",
            let: {commodityId: "$_id", isByProduct: "$isByProduct" },
            pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$status", 2] },
                                { $isArray: "$byProductsByScale" },
                            ]
                        }
                    },
                },
                { $unwind: { path: "$byProductsByScale", preserveNullAndEmptyArrays: false } },
                { $unwind: { path: "$byProductsByScale.byProducts", preserveNullAndEmptyArrays: false } },
                { $match: { $expr: {$eq: ["$$commodityId", "$byProductsByScale.byProducts.commodityId"]} }},
                {
                    $project: {
                        quantityLbs: "$byProductsByScale.byProducts.quantityLbs",
                        cropYear: 1,
                        CWTDel: 1,
                        type: "productionByProduct",
                        contractNumber:1,
                        status: {$toInt: "1"},
                        scaleTotal: "$byProductsByScale.byProducts.quantityLbs"
                    }
                }
            ],
            as: "productionByProduct"
        })
        .project({
            _id : 1,
            "commodityWeight":1,
            "isByProduct": 1,
            "production":1,
            "productionByProduct._id": 1,
            "productionByProduct.status": 1,
            "productionByProduct.CWTDel": 1,
            "productionByProduct.cropYear": 1,
            "productionByProduct.contractNumber": 1,
            "productionByProduct.quantityLbs": 1,
            "productionByProduct.inventoryGrade": null,
            "productionByProduct.type": 1,
            "productionByProduct.scaleTotal": 1
        })
        .group({
            "_id":"$_id",
            "isByProduct":{"$first":"$isByProduct"},
            "commodityWeight": { "$first" : "$commodityWeight"},
            "production" : { "$first": "$production"},
            "productionByProduct": { "$first": "$productionByProduct" }
        })

        // SALES CONTRACT
        .lookup({
            from: "salescontracts",
            let: { commodityId: "$_id", isByProduct: "$isByProduct"  },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            { $ne: ["$status", 2] },
                            { $eq: ["$commodityId", "$$commodityId"] },
                            { $eq: ["$cropYear", year] }
                        ]
                    }
                }
            }, {
                $project: {
                    quantityLbs: 1,
                    cropYear: 1,
                    CWTDel: 1,
                    inventoryGrade: {
                        $cond: {
                            if: { $ne: ['$$isByProduct', true]},
                            then: "$inventoryGrade",
                            else: null,
                        }
                    },
                    type: "salesContract",
                    netFOBCAD: 1,
                    contractNumber:1,
                    status: 1
                }
            }],
            as: "salesContract"
        })
        .unwind({ path: "$salesContract", preserveNullAndEmptyArrays: true })
        .lookup({
                from: "scales",
                let: { contractNumber: "$salesContract.contractNumber" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$void", true] },
                                { $eq: ["$contractNumber", "$$contractNumber"] }
                            ]
                        }
                    }
                }, {
                    $project: { unloadWeidht: 1, void:1 }
                }],
                as: "salesContract.scale"
        })
        .project({
            "_id" : 1,
            "commodityWeight": 1,
            "isByProduct": 1,
            "production":1,
            "productionByProduct":1,
            "salesContract._id": 1,
            "salesContract.status": 1,
            "salesContract.CWTDel": 1,
            "salesContract.cropYear": 1,
            "salesContract.contractNumber": 1,
            "salesContract.quantityLbs": 1,
            "salesContract.inventoryGrade": 1,
            "salesContract.type": 1,
            "salesContract.netFOBCAD": 1,
            "salesContract.scaleTotal": {
                $reduce: {
                    input: "$salesContract.scale",
                    initialValue: 0,
                    in: { $sum: ["$$value", { "$multiply": ['$$this.unloadWeidht', 2.2046] }] }
                }
            }
        })
        .group({
            "_id":"$_id",
            "isByProduct":{"$first":"$isByProduct"},
            "commodityWeight": { "$first" : "$commodityWeight"},
            "production" : { "$first": "$production"},
            "productionByProduct" : { "$first": "$productionByProduct"},
            "salesContract":{ "$push": "$salesContract" }
        })

        // TRADE PURCHASE
        .lookup({
            from: "tradepurchases",
            let: { commodityId: "$_id", isByProduct: "$isByProduct"  },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            { $ne: ["$status", 2] },
                            { $eq: ["$commodityId", "$$commodityId"] },
                            { $or: [
                                    { $eq: ["$cropYear", year] },
                                ]
                            }
                        ]
                    }
                }
            }, {
                $project: {
                    quantityLbs: 1,
                    cropYear: 1,
                    CWTDel: 1,
                    inventoryGrade: {
                      $cond: {
                          if: { $ne: ['$$isByProduct', true]},
                          then: "$inventoryGrade",
                          else: null,
                      }
                    },
                    type: "tradepurchase",
                    netFOBCAD: 1,
                    contractNumber:1,
                    status: 1
                }
            }],
            as: "tradepurchase"
        })
        .unwind({ path: "$tradepurchase", preserveNullAndEmptyArrays: true })
        .lookup({
            from: "tradepurchasescales",
            let: { contractNumber: "$tradepurchase.contractNumber" },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            { $ne: ["$void", true] },
                            { $eq: ["$tradepurchase", "$$contractNumber"] }
                        ]
                    }
                }
            }, {
                $project: { unloadWeidht: 1, void:1 }
            }],
            as: "tradepurchase.scale"
        })
        .project({
            _id : 1,
            "commodityWeight": 1,
            "isByProduct": 1,
            "production":1,
            "productionByProduct":1,
            "salesContract":1,

            "tradepurchase._id": 1,
            "tradepurchase.status": 1,
            "tradepurchase.CWTDel": 1,
            "tradepurchase.cropYear": 1,
            "tradepurchase.contractNumber": 1,
            "tradepurchase.quantityLbs": 1,
            "tradepurchase.inventoryGrade": 1,
            "tradepurchase.type": 1,
            "tradepurchase.netFOBCAD": 1,
            "tradepurchase.scaleTotal": {
                $reduce: {
                    input: "$tradepurchase.scale",
                    initialValue: 0,
                    in: { $sum: ["$$value", { "$multiply": ['$$this.unloadWeidht', 2.2046]}] }
                }
            }
        })
        .group({
            "_id":"$_id",
            "isByProduct":{"$first":"$isByProduct"},
            "commodityWeight": { "$first" : "$commodityWeight"},
            "production" : { "$first": "$production"},
            "productionByProduct" : { "$first": "$productionByProduct"},
            "salesContract" : { "$first": "$salesContract"},

            "tradepurchase": { "$push": "$tradepurchase" }
        })

        // PURCHASE CONFIRMATION
        .lookup({
            from: "purchaseconfirmations",
            let: { commodityId: "$_id", isByProduct: "$isByProduct"  },
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            { $ne: ["$status", 2] },
                            { $eq: ["$commodityId", "$$commodityId"] },
                            { $eq: ["$cropYear", year] }
                        ]
                    }
                }
            }, {
                $project: {
                    quantityLbs: 1,
                    cropYear: 1,
                    CWTDel: 1,
                    inventoryGrade: {
                        $cond: {
                            if: { $ne: ['$$isByProduct', true]},
                            then: "$inventoryGrade",
                            else: null,
                        }
                    },
                    type: "purchase",
                    contractNumber:1,
                    status: 1,
                    quantityUnit:1
                }
            }],
            as: "purchase"
        })
        .unwind({ path: "$purchase", preserveNullAndEmptyArrays: true })
        .lookup({
            from: "scales",
            let: { contractNumber: "$purchase.contractNumber" },
            pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$void", true] },
                                { $eq: ["$contractNumber", "$$contractNumber"] }
                            ]
                        }
                    }
                },
                { $project: { netWeight: 1, void:1 } }
            ],
            as: "purchase.scale"
        })
        .project({
            _id : 1,
            "commodityWeight":1,
            "isByProduct": 1,
            "production":1,
            "productionByProduct":1,
            "salesContract":1,
            "tradepurchase":1,
            "purchase._id": 1,
            "purchase.status": 1,
            "purchase.CWTDel": 1,
            "purchase.cropYear": 1,
            "purchase.contractNumber": 1,
            "purchase.quantityLbs": 1,
            "purchase.inventoryGrade": 1,
            "purchase.type": 1,
            "purchase.netFOBCAD": 1,
            "purchase.scaleTotal": {
                $reduce: {
                    input: "$purchase.scale",
                    initialValue: 0,
                    in: { $sum: ["$$value", { "$multiply": ['$$this.netWeight', 2.2046] }] }
                }
            }
        })
        .group({
            "_id":"$_id",
            "isByProduct":{"$first":"$isByProduct"},
            "commodityWeight": { "$first" : "$commodityWeight"},
            "production" : { "$first": "$production"},
            "productionByProduct" : { "$first": "$productionByProduct"},
            "salesContract" : { "$first": "$salesContract"},
            "tradepurchase" : { "$first": "$tradepurchase"},
            "purchase": { "$push": "$purchase" }
        })

        // By Products against purchase confirmation's ticket
        .lookup({
            from: "purchaseconfirmations",
            let: {commodityId: "$_id", isByProduct: "$isByProduct" },
            pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $ne: ["$status", 2] },
                                { $isArray: "$byProductsByScale" },
                            ]
                        }
                    },
                },
                { $unwind: { path: "$byProductsByScale", preserveNullAndEmptyArrays: false } },
                { $unwind: { path: "$byProductsByScale.byProducts", preserveNullAndEmptyArrays: false } },
                { $match: { $expr: {$eq: ["$$commodityId", "$byProductsByScale.byProducts.commodityId"]} }},
                {
                    $project: {
                        quantityLbs: "$byProductsByScale.byProducts.quantityLbs",
                        cropYear: 1,
                        CWTDel: 1,
                        type: "purchaseByProduct",
                        contractNumber:1,
                        status: {$toInt: "1"},
                        scaleTotal: "$byProductsByScale.byProducts.quantityLbs"
                    }
                }
            ],
            as: "purchaseByProduct"
        })
        .unwind({ path: "$purchaseByProduct", preserveNullAndEmptyArrays: true })
        .project({
            _id : 1,
            "commodityWeight":1,
            "production":1,
            "productionByProduct": 1,
            "salesContract":1,
            "tradepurchase":1,
            "purchase":1,
            "purchaseByProduct._id": 1,
            "purchaseByProduct.status": 1,
            "purchaseByProduct.CWTDel": 1,
            "purchaseByProduct.cropYear": 1,
            "purchaseByProduct.contractNumber": 1,
            "purchaseByProduct.quantityLbs": 1,
            "purchaseByProduct.inventoryGrade": null,
            "purchaseByProduct.type": 1,
            "purchaseByProduct.netFOBCAD": 1,
            "purchaseByProduct.scaleTotal": 1
        })
        .group({
            "_id":"$_id",
            "isByProduct":{"$first":"$isByProduct"},
            "commodityWeight": { "$first" : "$commodityWeight"},
            "production" : { "$first": "$production"},
            "productionByProduct" : { "$first": "$productionByProduct"},
            "salesContract" : { "$first": "$salesContract"},
            "tradepurchase" : { "$first": "$tradepurchase"},
            "purchase": { "$first": "$purchase" },
            "purchaseByProduct": { "$push": "$purchaseByProduct" }
        })

        // COMMODITY ADJUSTMENT
        .lookup({
            from: "commodityadjustments",
            let: { commodityId: "$_id" },
            pipeline: [{
                $match: {
                    $expr: { $and: [
                        { $eq: ["$cropYear", year] },
                        { $eq: ["$commodityId", "$$commodityId"] }
                    ]}
                }
            },{
                $project: {
                    cropYear: 1,
                    inventoryGrade: 1,
                    adjustmentDate: 1,
                    qtyCwt: 1,
                    amount: 1,
                    purchaseSale: 1,
                }
            }],
            as: "adjustments"
        })
        .unwind({ path: "$adjustments", preserveNullAndEmptyArrays: true })
        .project({
            _id : 1,
            "commodityWeight": 1,
            "isByProduct": 1,
            "production": 1,
            "productionByProduct": 1,
            "salesContract": 1,
            "tradepurchase": 1,
            "purchase": 1,
            "purchaseByProduct": 1,
            "adjustments._id": 1,
            "adjustments.status": {$toInt: "0"},
            "adjustments.CWTDel": "$adjustments.amount",
            "adjustments.cropYear": 1,
            "adjustments.contractNumber": "adjustment",
            "adjustments.quantityLbs": {$multiply: ["$adjustments.qtyCwt", 100]},
            "adjustments.inventoryGrade": 1,
            "adjustments.type": { $cond: {
                if: { $eq: ["$adjustments.purchaseSale", "sale"] },
                then: "saleAdjustment",
                else: "purchaseAdjustment"
            }}
        })
        .group({
            "_id":"$_id",
            "isByProduct":{"$first":"$isByProduct"},
            "commodityWeight": { "$first" : "$commodityWeight"},
            "production" : { "$first": "$production"},
            "productionByProduct" : { "$first": "$productionByProduct"},
            "salesContract" : { "$first": "$salesContract"},
            "tradepurchase" : { "$first": "$tradepurchase"},
            "purchase": { "$first": "$purchase" },
            "purchaseByProduct": { "$first": "$purchaseByProduct" },
            "adjustments": { "$push": "$adjustments" },
        });

    aggregate.project({
            "production": 1,
            "productionByProduct": {$ifNull: ['$productionByProduct', [{scaleTotal: 0}]]},
            "purchase": 1,
            "purchaseByProduct": {$ifNull: ['$purchaseByProduct', [{scaleTotal: 0}]]},
            "salesContract": 1,
            "tradepurchase" : 1,
            "adjustments" : 1,
            "commodityId": "$_id"
        })
        .project({
            "commodityId": 1,
            "all": {
                "$concatArrays": ["$production", "$productionByProduct", "$purchase", "$purchaseByProduct", "$salesContract", "$tradepurchase", "$adjustments"]
            }
        })
        .unwind({ path: "$all", preserveNullAndEmptyArrays: true })
        .group({
            "_id": { "commodityId": "$commodityId", "inventoryGrade": "$all.inventoryGrade" },
            "filteredList": {
                $push: {
                    "CWTDel": "$all.CWTDel",
                    "quantityLbs": "$all.quantityLbs",
                    "type": "$all.type",
                    "cropYear": "$all.cropYear",
                    "netFOBCAD": "$all.netFOBCAD",
                    "scaleTotal":"$all.scaleTotal",
                    "status":"$all.status"
                }
            }
        })

        .project({
            _id: 1,
            "production_purchase": {
                $filter: {
                    input: "$filteredList",
                    as: "item",
                    cond: { $in: ["$$item.type", ['production', 'purchase', 'tradepurchase', 'productionByProduct', 'purchaseByProduct', 'purchaseAdjustment']] }
                }
            },
            "salesContract": {
                $filter: {
                    input: "$filteredList",
                    as: "item",
                    cond: { $in: ["$$item.type", ['salesContract', 'saleAdjustment']] }
                }
            }
        })
        .project({
            "_id": 1,
            "totalSale": {
                $reduce: {
                    input: "$salesContract",
                    initialValue: 0,
                    in: {
                        $sum: ["$$value", {
                            "$divide": [{
                                $cond: {
                                    if: { $in: ["$$this.status", [0, 2]] },
                                    then: "$$this.quantityLbs",
                                    else: "$$this.scaleTotal"
                                }
                            }, 100]
                        }]
                    }
                }
            },
            "salesContract": 1,
            "production_purchase": 1,
            "total_production_purchase": {
                $reduce: {
                    input: "$production_purchase",
                    initialValue: 0,
                    in: {
                        $sum: ["$$value", {
                            "$divide": [{
                            $cond: {
                                    if: { $in: ["$$this.status", [0, 2]] },
                                    then: "$$this.quantityLbs",
                                    else: "$$this.scaleTotal"
                                }
                            }, 100]
                        }]
                    }
                }
            },
        })
        .project({
            "_id": 1,
            "totalSale": 1,
            "total_production_purchase": 1,
            "total_weightedAvg": {
                $reduce: {
                    input: "$production_purchase",
                    initialValue: 0,
                    in: {
                        $sum: ["$$value",{
                            $cond:{
                                if: { $in: ["$$this.status", [0,1]] },
                                then: {
                                    "$multiply": [{ $cond: { if: { $eq: ["$$this.type", "tradepurchase"]}, then: "$$this.netFOBCAD", else: "$$this.CWTDel" } }, {
                                        "$divide": [{
                                            "$divide": [{
                                                $cond:{
                                                    if:{ $eq :["$$this.status",0] },
                                                    then:"$$this.quantityLbs",
                                                    else:"$$this.scaleTotal"
                                                }
                                            }, 100]
                                        }, {
                                            $cond: {
                                                if: { $gt: ["$total_production_purchase", 0] },
                                                then: "$total_production_purchase",
                                                else: 1
                                            }
                                        }]
                                    }]
                                } ,
                                else: 0
                            }
                        }]
                    }
                }
            },
            "total_salesAvg": {
                $reduce: {
                    input: "$salesContract",
                    initialValue: 0,
                    in: {
                        $sum: ["$$value", {
                            $cond:{
                                if: { $in: ["$$this.status", [0,1]] },
                                then: {
                                    "$multiply": [ "$$this.netFOBCAD", {
                                        "$divide": [{
                                                "$divide": [{
                                                $cond: {
                                                        if:{ $eq :["$$this.status",0] },
                                                        then:"$$this.quantityLbs",
                                                        else:"$$this.scaleTotal"
                                                    }
                                                }, 100]
                                            }, {
                                                $cond: {
                                                    if: { $gt: ["$totalSale", 0] },
                                                    then: "$totalSale",
                                                    else: 1
                                                }
                                            }]
                                        }]
                                } ,
                                else: 0
                            }
                        }]
                    }
                }
            },
        })
        .match({ $or: [
          {totalSale: {$ne: 0}},
          {total_production_purchase: {$ne: 0}},
          {total_weightedAvg: {$ne: 0}},
          {total_salesAvg: {$ne: 0}}]
        })
        .unwind({ path: "$commodityId", preserveNullAndEmptyArrays: true })
        .unwind({ path: "$inventoryGrade", preserveNullAndEmptyArrays: true })
        .project({
            _id: 1,
            "totalSale": 1,
            "commodityId": "$_id.commodityId",
            "total_weightedAvg": 1,
            "total_salesAvg": 1,
            "total_production_purchase": 1,
            "inventoryGrade": "$_id.inventoryGrade"
        })

        .group({
            "_id": null,
            "data": {
                "$push": {
                    "totalSale": "$totalSale",
                    "total_salesAvg": "$total_salesAvg",
                    "commodityId": "$commodityId",
                    "total_weightedAvg": "$total_weightedAvg",
                    "total_production_purchase": "$total_production_purchase",
                    "inventoryGrade": "$inventoryGrade"
                }
            },
            "totalSale": { "$sum": "$totalSale" },
            "totalSalesAvg": { "$sum": "$total_salesAvg" },
            "totalPurchase": { "$sum": "$total_production_purchase" },
            "totalWeightedAvg": { "$sum": "$total_weightedAvg" },
        });

    let contract = await aggregate.exec();

    const data = await PositionReport.findOneAndUpdate({ cropYear: year }, { $set: {
        cropYear: year, report: contract[0], updatedAt: new Date()
    } }, { upsert: true, new: true})
    .populate("report.data report.data.commodityId report.data.inventoryGrade");

    if (req.dontSendResponse) {
        return { data, contract };
    }

    return SendResponse(res, { userMessage: 'Position report summary data refreshed', data, contract });
};

cron.schedule('0 */1 * * *', async () => {
    console.log('running a task every hour: ', new Date());
    let {cropYear: year} = CropYear.getCropYear();
    await methods.refreshSummaryReport({body: {year}, dontSendResponse: true});
});
