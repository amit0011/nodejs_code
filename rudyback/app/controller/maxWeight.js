const mongoose = require("mongoose");
const session = require("@ag-libs/session");
const MaxWeight = mongoose.model("maxWeight");
const { SendResponse } = require("@ag-common");

const methods = {};

module.exports.controller = function(router) {
  router
    .route("/max-weight")
    .post(session.adminCheckToken, methods.addMaxWeight)
    .get(session.adminCheckToken, methods.getMaxWeight)
    .put(session.adminCheckToken, methods.updateMaxWeight);

  router
    .route("/max-weight/delete")
    .post(session.adminCheckToken, methods.removeMaxWeight);
};

/*=============================
***   Add New Max Weight  ***
===============================*/
methods.addMaxWeight = async function(req, res) {
  req.checkBody("name", "Name  is required.").notEmpty();
  const errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }

  let data = await MaxWeight.findOne({
    name: req.body.name,
    status: 0
  });

  if (data) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Max Weight name already exist."
    });
  }

  data = await new MaxWeight(req.body).save();
  return SendResponse(res, { data, userMessage: "Max Weight added successfully." });
}; /*-----  End of addMaxWeight  ------*/

/*=======================================
***   Get All Max Weight List  ***
=========================================*/
methods.getMaxWeight = async function(req, res) {
  let query,
    condition = {},
    options = {
      sort: { name: 1 },
      page: req.query.page,
      limit: 10
    };

  // query for name search
  if (req.query.search) {
    condition = {
      name: { $regex: ".*" + req.query.search + ".*", $options: "i" }
    };
    query = MaxWeight.paginate(condition, options);
  }

  if (req.query.page) {
    query = MaxWeight.paginate(condition, options);
  }

  if (req.query.name) {
    condition = {
      name: req.query.name
    };
  }

  if (!query) query = MaxWeight.find(condition).sort("name");

  let data = await query;
  return SendResponse(res, { data, userMessage: "Max weight list." });
}; /*-----  End of get Max Weight  ------*/

/*========================
***   Update Max Weight  ***
==========================*/
methods.updateMaxWeight = async function(req, res) {
  let maxWeight = await MaxWeight.findOne({ _id: req.query._id });

  if (!maxWeight) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Max Weight details not found."
    });
  }

  maxWeight.name = req.body.name || maxWeight.name;
  maxWeight.weights = req.body.weights || maxWeight.weights;
  maxWeight.updatedAt = new Date();
  await maxWeight.save();

  return SendResponse(res, { data: maxWeight, userMessage: "Max Weight updated." });
}; /*-----  End of updateMaxWeight  ------*/

/*============================
***   remove Max Weight  ***
==============================*/
methods.removeMaxWeight = async function(req, res) {
  await MaxWeight.update(
    { _id: { $in: req.body.idsArray } },
    { $set: { status: req.body.status } },
    { multi: true }
  );

  return SendResponse(res, { userMessage: "Max Weight deleted." });
}; /*-----  End of removeMaxWeight  ------*/
