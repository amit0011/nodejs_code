const mongoose = require("mongoose");
const ContainerInventory = mongoose.model("containerInventory");
const session = require("@ag-libs/session");
const { SendResponse } = require("@ag-common");

const methods = {};

module.exports.controller = function(router) {
  router
    .route("/containerInventory")
    .post(session.adminCheckToken, methods.addContainerInventory)
    .get(session.adminCheckToken, methods.getContainerInventory)
    .put(session.adminCheckToken, methods.updateContainerInventory);

  router
    .route("/containerInventory/delete")
    .post(session.adminCheckToken, methods.removeContainerInventory);
};

/*=============================
***   Add New ContainerInventory  ***
===============================*/
methods.addContainerInventory = async function(req, res) {
  req.checkBody("containerNumber", "Container Number  is required.").notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }

  let data = await ContainerInventory.findOne({
    containerNumber: req.body.containerNumber,
    status: 0,
    released: false,
  });

  if (data) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Container Number already exist."
    });
  }

  data = await (new ContainerInventory(req.body)).save();
  return SendResponse(res, { data, userMessage: "Container Inventory added successfully." });
}; /*-----  End of addContainerInventory  ------*/

/*=======================================
***   Get All ContainerInventory List  ***
=========================================*/
methods.getContainerInventory = async function(req, res) {
  let condition = {status: 0};
  let data = [];

  if (req.query.search) {
    condition.containerNumber = {
      $regex: ".*" + req.query.search + ".*", $options: "i"
    };
  }

  if ('released' in req.query) {
    condition.released = !!req.query.released;
  }

  if ('onlyContainerNumbers' in req.query) {
    condition.released = false;
    condition.$or = [
      {outgoingDate: {$exists: false}},
      {outgoingDate: {$type: 'null'}}
    ];

    data = await ContainerInventory
      .find(condition, 'containerNumber')
      .sort({incomingDate: 1})
      .limit(1000);
  } else {
    let options = {
      sort: { outgoingDate: 1, incomingDate: 1 },
      populate: 'loadingPortId',
      page: req.query.page,
      limit: 10
    };

    data = await ContainerInventory.paginate(condition, options);
  }

  return SendResponse(res, { data, userMessage: "Container Inventory list." });
}; /*-----  End of get ContainerInventory  ------*/

/*========================
***   Update ContainerInventory  ***
==========================*/
methods.updateContainerInventory = async function(req, res) {
  let containerInventory = await ContainerInventory.findOne({ _id: req.body._id });

  if (!containerInventory) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Container Inventory details not found."
    });
  }

  containerInventory.loadingPortId = req.body.loadingPortId;
  containerInventory.released = req.body.released;
  if (containerInventory.released) {
    containerInventory.outgoingDate = null;
    containerInventory.contractNumber = null;
  }

  containerInventory.containerNumber = req.body.containerNumber;
  containerInventory.incomingDate = req.body.incomingDate;
  containerInventory.comment = req.body.comment;

  await containerInventory.save();

  return SendResponse(res, { data: containerInventory, userMessage: "Container Inventory updated." });
}; /*-----  End of updateContainerInventory  ------*/

/*============================
***   remove ContainerInventory  ***
==============================*/
methods.removeContainerInventory = async function(req, res) {
  await ContainerInventory.update(
    { _id: { $in: req.body.idsArray } },
    { $set: { status: 1 } },
    { multi: true }
  );

  return SendResponse(res, { userMessage: "Container Inventory deleted." });
}; /*-----  End of removeContainerInventory  ------*/
