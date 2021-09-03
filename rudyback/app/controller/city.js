var mongoose = require("mongoose");
var session = require("@ag-libs/session");
var City = mongoose.model("city");
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
  router
    .route("/city")
    .post(session.adminCheckToken, methods.addCity)
    .get(session.adminCheckToken, methods.getCity)
    .put(session.adminCheckToken, methods.updateCity);

  router
    .route("/city/delete")
    .post(session.adminCheckToken, methods.removeCity);
};

/*=============================
***   Add New City  ***
===============================*/
methods.addCity = async function(req, res) {
  req.checkBody("country", "country Name is required.").notEmpty();
  req.checkBody("city", "City Name  is required.").notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }
  let data = await City.findOne({
    city: req.body.city,
    country: req.body.country,
    status: 0
  });

  if (data) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "City name already exist."
    });
  }

  data = await new City(req.body).save();
  return SendResponse(res, { data, userMessage: "City added successfully." });
}; /*-----  End of addCity  ------*/

/*=======================================
***   Get All City List  ***
=========================================*/
methods.getCity = async function(req, res) {
  let query,
    condition = {},
    options = {
      sort: { city: 1 },
      page: req.query.page,
      limit: 10
    };

  // query for city search
  if (req.query.search) {
    condition = {
      city: { $regex: ".*" + req.query.search + ".*", $options: "i" }
    };
    query = City.paginate(condition, options);
  }

  if (req.query.country) {
    condition = {
      // status: 0,
      country: req.query.country
    };
    query = City.find(condition).sort({ country: 1 });
  }

  // if (!req.query.country && !req.query.page) {
  //   condition = { status: 0, country: { $ne: "United States" } };
  //   query = City.find(condition).sort({ country: 1 });
  // }

  if (req.query.page) {
    query = City.paginate(condition, options);
  }

  if (req.query.city) {
    condition = {
      city: req.query.city
    };
    query = City.find(condition).sort("city");
  }

  let data = await query;
  return SendResponse(res, { data, userMessage: "City list." });
}; /*-----  End of get City  ------*/

/*========================
***   Update City  ***
==========================*/
methods.updateCity = async function(req, res) {
  let city = await City.findOne({ _id: req.body._id });

  if (!city) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "City details not found."
    });
  }

  city.country = req.body.country || city.country;
  city.city = req.body.city || city.city;
  city.updatedAt = new Date();
  await city.save();

  return SendResponse(res, { data: city, userMessage: "City updated." });
}; /*-----  End of updateCity  ------*/

/*============================
***   remove City  ***
==============================*/
methods.removeCity = async function(req, res) {
  await City.update(
    { _id: { $in: req.body.idsArray } },
    { $set: { status: req.body.status } },
    { multi: true }
  );

  return SendResponse(res, { userMessage: "City deleted." });
}; /*-----  End of removeCity  ------*/
