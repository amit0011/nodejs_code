const mongoose = require("mongoose");
const Sales = mongoose.model("salesContract");
const Confirmation = mongoose.model('purchaseConfirmation');
const Contract = mongoose.model('productionContract');
const TradePurchase = mongoose.model('tradePurchase');
const Scale = mongoose.model("scale");
const TradePurchaseScale = mongoose.model('tradePurchaseScale');
const session = require("@ag-libs/session");
const { SendResponse } = require("@ag-common");

const methods = {};

module.exports.controller = function(router) {
  router
    .route("/sync/salesWeight/:contractNumber")
    .get(session.adminCheckToken, methods.syncSalesWeight);

  router
    .route("/sync/purchaseWeight/:contractNumber")
    .get(session.adminCheckToken, methods.syncPurchaseWeight);

  router
    .route("/sync/tradesWeight/:contractNumber")
    .get(session.adminCheckToken, methods.syncTradesWeight);

  router
    .route("/sync/productionWeight/:contractNumber")
    .get(session.adminCheckToken, methods.syncProductionWeight);
};

/**
 * This method sync sales contract's shipped weight
 * from outgoing scale tickets.
 *
 * @param {Request} req Express Http Request Object
 * @param {Response} res Express Http Response Object
 */
methods.syncSalesWeight = async function(req, res) {
  const {contractNumber} = req.params;
  const sales = await Sales.findOne({contractNumber});
  if (!sales) {
    return SendResponse(res, {
      error: true, status: 404,
      userMessage: 'Sales not found.',
    });
  }

  // Step 1: Fetch non voided scale tickets corresponding to the sales contract
  let scaleTotal = await Scale.aggregate([
    { $match: {
      $or: [{contractNumber}, {salesContractNumber: contractNumber}],
      void: { $ne: true },
      ticketType: {$in: ['Outgoing', 'GrowerLoadSheet']},
    } },
    { $lookup: {
      from: 'bags',
      let: {bagId: '$bagId'},
      pipeline: [{
        $match: {
          $expr: {
            $eq: ['$_id', '$$bagId']
          }
        }
      }, {
        $project: {
            weight: {
              $switch: {
                branches: [
                  {case: {$eq: ['$bagWeightUnit', 'MT']}, then: {$multiply: ['$bagWeight', 1000]}},
                  {case: {$eq: ['$bagWeightUnit', 'LBS']}, then: {$divide: ['$bagWeight', 2.20462]}},
                ],
                default: '$bagWeight'
              }
            }
        }
      }],
      as: 'bagUsed'
    } },
    { $unwind: { path: "$bagUsed", preserveNullAndEmptyArrays: true } },
    { $project: {
      date: 1,
      weight: {
        $cond: {
          if: { $gt: ['$invoicedWeight', 0]},
          then: '$invoicedWeight',
          else: {
            $cond: {
              if: {$and: [
                { $ne: ['$bagUsed', null]},
                {$ne: ['$bagUsed.bulkBag', 'Bulk']},
                {$gt: [{$multiply: ['$numberOfBags', '$bagUsed.weight']}, 0]}
              ]},
              then: {$multiply: ['$numberOfBags', '$bagUsed.weight']},
              else: '$unloadWeidht'
            }
          }
        }
      }
    } },
    { $group: { _id: '$contractNumber', total: { $sum: "$weight" } }  }
  ]);

  // Step 2: Set sales contract's delQty from above calculation
  const delQty = (scaleTotal && scaleTotal.length !== 0) ? Math.round(scaleTotal[0].total * 2.20462) : 0;

  // Step 3: Update sales contract with calculated weight
  await Sales.findByIdAndUpdate(sales._id, {
    $set: {delQty, shippingQtyLbs: delQty}
  });

  return SendResponse(res, { userMessage: "Data synced successfully." });
};

/**
 * This method sync purchase confirmation's delivered weight
 * from incoming scale tickets.
 *
 * @param {Request} req Express Http Request Object
 * @param {Response} res Express Http Response Object
 */
methods.syncPurchaseWeight = async function(req, res) {
  const {contractNumber} = req.params;
  const purchase = await Confirmation.findOne({contractNumber});
  if (!purchase) {
    return SendResponse(res, {
      error: true, status: 404,
      userMessage: 'Purchase not found.',
    });
  }

  // Step 1: Fetch non voided scale tickets corresponding to the purchase confirmation
  let scaleTotal = await Scale.aggregate([
    { $match: {
      contractNumber,
      void: { $ne: true },
      growerOrBuyer: {$ne: 'Buyer'},
      ticketType: {$in: ['Incoming', 'GrowerLoadSheet']},
    }, },
    { $project: { contractNumber: 1, weight: { $cond: {if: {$eq: ['$dockageCompleted', true]}, then: '$netWeight', else: '$unloadWeidht'}} } },
    { $group: { _id: '$contractNumber', total: { $sum: "$weight" } }  }
  ]);

  // Step 2: Set purchase confirmation's delQty from above calculation
  const delQty = (scaleTotal && scaleTotal.length !== 0) ? Math.round(scaleTotal[0].total * 2.20462) : 0;

  // Step 3: Update purchase confirmation with calculated weight
  await Confirmation.findByIdAndUpdate(purchase._id, { $set: {delQty} });

  return SendResponse(res, { userMessage: "Purchase confirmation weight synced successfully." });
};

/**
 * This method sync production contract's delivered weight
 * from outgoing scale tickets.
 *
 * @param {Request} req Express Http Request Object
 * @param {Response} res Express Http Response Object
 */
methods.syncProductionWeight = async function(req, res) {
  const {contractNumber} = req.params;
  const production = await Contract.findOne({contractNumber});
  if (!production) {
    return SendResponse(res, {
      error: true, status: 404,
      userMessage: 'Production not found.',
    });
  }

  // Step 1: Fetch non voided scale tickets corresponding to the production contract
  let scaleTotal = await Scale.aggregate([
    { $match: { contractNumber, void: { $ne: true }, growerOrBuyer: {$ne: 'Buyer'}, ticketType: 'Incoming'}, },
    { $project: { contractNumber: 1, weight: '$netWeight' } },
    { $group: { _id: '$contractNumber', total: { $sum: "$weight" } }  }
  ]);

  // Step 2: Set production contract's delQty from above calculation
  const delQty = (scaleTotal && scaleTotal.length !== 0) ? Math.round(scaleTotal[0].total * 2.20462) : 0;

  // Step 3: Update production contract with calculated weight
  await Contract.findByIdAndUpdate(production._id, { $set: {delQty} });

  return SendResponse(res, { userMessage: "Production contract weight synced successfully." });
};

/**
 * This method sync Trade Purchase contract's delivered weight
 * from outgoing scale tickets.
 *
 * @param {Request} req Express Http Request Object
 * @param {Response} res Express Http Response Object
 */
methods.syncTradesWeight = async function(req, res) {
  const {contractNumber} = req.params;
  const trade = await TradePurchase.findOne({contractNumber});
  if (!trade) {
    return SendResponse(res, {
      error: true, status: 404,
      userMessage: 'Trade not found.',
    });
  }

  // Step 1: Fetch non voided trade scale tickets corresponding to the trade purchase
  let tradeScaleTotal = await TradePurchaseScale.aggregate([
    { $match: { contractNumber, void: { $ne: true } }, },
    { $project: { contractNumber: 1, weight: '$unloadWeidht' } },
    { $group: { _id: '$contractNumber', total: { $sum: "$weight" } } }
  ]);
 
  // Step 2: Set trade purchase's delQty from above calculation
  let delQty = (tradeScaleTotal && tradeScaleTotal.length !== 0) ? tradeScaleTotal[0].total * 2.20462 : 0;

  // Step 3: Fetch non voided scale tickets corresponding to the trade purchase
  let scaleTotal = await Scale.aggregate([
    { $match: { contractNumber, void: { $ne: true }, ticketType: 'Incoming', growerOrBuyer: 'Buyer' }, },
    { $project: { contractNumber: 1, weight: '$netWeight' } },
    { $group: { _id: '$contractNumber', total: { $sum: "$weight" } } }
  ]);

  delQty += (scaleTotal && scaleTotal.length !== 0) ? scaleTotal[0].total * 2.20462 : 0;

  // Step 4: Update trade purchase with calculated weight
  await TradePurchase.findByIdAndUpdate(trade._id, { $set: {delQty: Math.round(delQty)} });

  return SendResponse(res, { userMessage: "Trade Purchase weight synced successfully." });
};
