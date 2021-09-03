const mongoose = require("mongoose");
const session = require("@ag-libs/session");
const Freight = mongoose.model("freight");
const FreightTmp = mongoose.model("freightstmp__");
const Sales = mongoose.model("salesContract");
const SalesHistory = mongoose.model("salesContractHistory");
const { SendResponse } = require("@ag-common");
const async = require("async");
const _ = require('lodash');

const methods = {};

module.exports.controller = function(router) {
  router
    .route("/freight")
    .post(session.adminCheckToken, methods.addFreight)
    .get(session.adminCheckToken, methods.getFreight)
    .put(session.adminCheckToken, methods.updateFreight);

  router
    .route("/freight/delete")
    .post(session.adminCheckToken, methods.removeFreight);

  router
    .route("/freight/filter")
    .post(session.adminCheckToken, methods.freightFilter)
    .get(session.adminCheckToken, methods.getAllfreight);

  router.route("/getFreightList").post(methods.getFreightList);

  router
    .route("/freightlist")
    .get(session.adminCheckToken, methods.getFreightListByDestination);

  router
    .route("/freight/applyRateFactor")
    .post(session.adminCheckToken, methods.applyRateFactor);

  router
    .route("/freight/revertRateFactor")
    .post(session.adminCheckToken, methods.revertRateFactor);
};

methods.getFreightListByDestination = async (req, res) => {
  var condition = {
    loadingPortId: mongoose.Types.ObjectId(req.query.loadingPortId),
    status: 0
  };

  let data = await Freight.find(condition)
    .select(
      "loadingPortId equipmentId freightCompanyId shiplineId cityName countryName validity"
    )
    .populate("loadingPortId equipmentId freightCompanyId shiplineId");

  return SendResponse(res, {
    data,
    userMessage: "Freight details get successfully."
  });
};

methods.getFreightList = async (req, res) => {
  var condition = {
    equipmentId: req.body.equipmentId,
    loadingPortId: req.body.loadingPortId,
    cityName: req.body.city,
    status: 0
  };

  if (req.body.freightCompanyId) {
    if (req.body.include) {
      condition = {
        $or: [condition, {_id: req.body.freightCompanyId}]
      };
    } else {
      condition._id = req.body.freightCompanyId;
    }
  }

  let data = await Freight.find(condition)
    .select(
      "freightCompanyId oceanFreight freightWithBlFee unit blFee freightCWT currencyType shiplineId numberOfDays validity"
    )
    .populate("freightCompanyId freightCompanyName shiplineId")
    .lean();

  return SendResponse(res, {
    data,
    userMessage: "Freight details get successfully."
  });
};

/*=========================
***   getAllfreight  ***
===========================*/
methods.getAllfreight = async function(req, res) {
  let data = await Freight.find({});

  return SendResponse(res, {
    data,
    userMessage: "Freight details get successfully."
  });
}; /*-----  End of getAllfreight  ------*/

/*=========================
***   freightFilter  ***
===========================*/
methods.freightFilter = async function(req, res) {
  //Check for POST request errors.
  req.checkBody("loadingPortId", "loadingPortId is required.").notEmpty();
  req.checkBody("equipmentId", "equipmentId is required.").notEmpty();
  req.checkBody("freightCompanyId", "freightCompanyId is required.").notEmpty();
  req.checkBody("cityName", "cityName is required.").notEmpty();
  let errors = req.validationErrors(true);

  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }

  let condition = {
    loadingPortId: req.body.loadingPortId,
    equipmentId: req.body.equipmentId,
    freightCompanyId: req.body.freightCompanyId,
    cityName: req.body.cityName,
    status: 0
  };

  if (req.body._id) {
    condition = {
      status: 0, _id: req.body._id
    };
  }

  let data = await Freight.findOne(condition);

  return SendResponse(res, {
    data,
    userMessage: "Freight details get successfully."
  });
}; /*-----  End of freightFilter  ------*/

/*=============================
***   Add New Grade  ***
===============================*/
methods.addFreight = async function(req, res) {
  //Check for POST request errors.
  req.checkBody("countryName", "Country name is required.").notEmpty();
  req.checkBody("cityName", "City name is required.").notEmpty();
  req.checkBody("loadingPortId", "Loading port name is required.").notEmpty();
  req.checkBody("equipmentId", "Equipment name is required.").notEmpty();
  let errors = req.validationErrors(true);

  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }

  let data = await new Freight(req.body).save();

  return SendResponse(res, {
    data,
    userMessage: "Freight added successfully."
  });
}; /*-----  End of addFreight  ------*/

/*=======================================
***   Get All Freight List  ***
=========================================*/
methods.getFreight = async function(req, res) {
  const limit = (+req.query.limit) || 10;
  let data,
    condition = { status: 0 },
    options = {
      sort: { countryName: 1 },
      page: req.query.page,
      select: '-bkp',
      limit,
      populate: "loadingPortId equipmentId freightCompanyId shiplineId",
      lean: true
    };

  if (
    req.query.page &&
    !(req.query.portId ||
    req.query.city ||
    req.query.country ||
    req.query.freightCompany ||
    req.query.validity ||
    req.query.onlyInvalid)
  ) {
    data = await Freight.paginate(condition, options);
  } else if (!req.query.page && req.query.portId) {
    condition = { status: 0, loadingPortId: req.query.portId };
    data = await Freight.find(condition).sort("cityName");
  } else if (
    req.query.portId ||
    req.query.city ||
    req.query.country ||
    req.query.freightCompany ||
    req.query.validity ||
    req.query.onlyInvalid
  ) {
    if (req.query.freightCompany && req.query.freightCompany != "undefined") {
      condition.freightCompanyId = req.query.freightCompany;
    }
    if (req.query.portId && req.query.portId != "undefined") {
      condition.loadingPortId = req.query.portId;
    }
    if (req.query.city && req.query.city != "undefined") {
      condition.cityName = req.query.city;
    }
    if (req.query.country && req.query.country != "undefined") {
      condition.countryName = req.query.country;
    }
    if (req.query.validity && req.query.validity != "undefined") {
      condition.validity = {$gte: req.query.validity};
      if (req.query.onlyInvalid && req.query.onlyInvalid != "0") {
        condition.validity = {$lte: req.query.validity};
      }
    }

    data = await Freight.paginate(condition, options);
  }

  return SendResponse(res, { data, userMessage: "Freight list." });
}; /*-----  End of getfreightType  ------*/

/*========================
***   Update Freight  ***
==========================*/
methods.updateFreight = async function(req, res) {
  const sales = await Sales.findOne({freightCompanyId: req.body._id});
  const salesHistory = await SalesHistory.findOne({freightCompanyId: req.body._id});
  let data = null;

  if(sales || salesHistory) {
    await Freight.findOneAndUpdate({_id: req.body._id}, {$set: {status: 1}});
    data = await (new Freight(_.omit(req.body, ['_id']))).save();
  } else {
    data = await Freight.findByIdAndUpdate(req.body._id, req.body);
  }

  return SendResponse(res, {
    data,
    userMessage: "Freight updated successfully."
  });
}; /*-----  End of updatefreight  ------*/

/*============================
***   remove Freight  ***
==============================*/
methods.removeFreight = async function(req, res) {
  let data = await Freight.update(
    { _id: { $in: req.body.idsArray } },
    { $set: { status: 1 } },
    { multi: true }
  );

  return SendResponse(res, { data, userMessage: "Freight deleted." });
}; /*-----  End of removFreight  ------*/

methods.applyRateFactor = async function(req, res) {
  const factor = +req.body.rateFactor;

  const condition = (rf => field => ({
    $cond: {
      if: {$gt: [field, 0]},
      then: {$round: [{$multiply: [field, rf]}, 2]},
      else: field
    }
  }))(factor);

  const validity = new Date();
  const freights = await Freight.aggregate([
    {$match: {status: 0, validity: {$gte: validity}}},
    {$addFields: {
      'oceanFreight.bagToBag': condition('$oceanFreight.bagToBag'),
      'oceanFreight.bulkToBulk': condition('$oceanFreight.bulkToBulk'),
      'oceanFreight.bulkToBag': condition('$oceanFreight.bulkToBag'),
      'oceanFreight.bagToBagOcean': condition('$oceanFreight.bagToBagOcean'),
      'oceanFreight.bulkToBulkOcean': condition('$oceanFreight.bulkToBulkOcean'),
      'oceanFreight.bulkToBagOcean': condition('$oceanFreight.bulkToBagOcean'),
      'oceanFreight.bagToBagStuffing': condition('$oceanFreight.bagToBagStuffing'),
      'oceanFreight.bulkToBulkStuffing': condition('$oceanFreight.bulkToBulkStuffing'),
      'oceanFreight.bulkToBagStuffing': condition('$oceanFreight.bulkToBagStuffing'),

      'freightMT.bagToBag': condition('$freightMT.bagToBag'),
      'freightMT.bulkToBulk': condition('$freightMT.bulkToBulk'),
      'freightMT.bulkToBag': condition('$freightMT.bulkToBag'),

      'freightCWT.bagToBag': condition('$freightCWT.bagToBag'),
      'freightCWT.bulkToBulk': condition('$freightCWT.bulkToBulk'),
      'freightCWT.bulkToBag': condition('$freightCWT.bulkToBag'),

      'freightUSDMTFOB.bagToBag': condition('$freightUSDMTFOB.bagToBag'),
      'freightUSDMTFOB.bulkToBulk': condition('$freightUSDMTFOB.bulkToBulk'),
      'freightUSDMTFOB.bulkToBag': condition('$freightUSDMTFOB.bulkToBag'),

      'freightWithBlFee.bagToBag': condition('$freightWithBlFee.bagToBag'),
      'freightWithBlFee.bulkToBulk': condition('$freightWithBlFee.bulkToBulk'),
      'freightWithBlFee.bulkToBag': condition('$freightWithBlFee.bulkToBag')
    }},
  ]).exec();

  const processor = async (freight, cb) => {
    try {
      const id = freight._id;
      await Freight.findOneAndUpdate({_id: id}, {$set: {status: 1}});
      await (new Freight(_.assign(_.omit(freight, ['_id']), {parentId: id}))).save();
      cb();
    } catch(err) {
      cb(err);
    }
  };
  await async.eachOfLimit(freights, 1, function(freight, _, cb) {
    processor(freight, cb);
  });

  SendResponse(res, {userMessage: 'factor applied successfully'});
};

methods.revertRateFactor = async function(req, res) {
  SendResponse(res, {userMessage: 'factor applied successfully'});
};
