var mongoose = require("mongoose");
var session = require("@ag-libs/session");
var Country = mongoose.model("country");
var validation = require("@ag-libs/validation");
var arrayReduce = require("async-array-reduce");
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
  router
    .route("/country")
    .post(session.adminCheckToken, methods.addCountry)
    .get(session.adminCheckToken, methods.getCountry)
    .put(session.adminCheckToken, methods.updateCountry);

  router
    .route("/country/delete")
    .post(session.adminCheckToken, methods.removeCountry);

  router
    .route("/country/bulk")
    .post(
      session.adminCheckToken,
      validation.checkUsersFile,
      methods.addCountryBulk
    );
};

/*==============================
***   Add Country In Bulk  ***
================================*/
methods.addCountryBulk = function(req, res) {
  var exists = [];
  req.sheets = req.sheets.reduce((sheets, sheet) => {
    return sheets.concat(sheet);
  }, []);
  arrayReduce(
    req.sheets,
    [],
    function(users, user, callback) {
      Country.findOne(
        {
          name: user.Name
        },
        function(err, existingUser) {
          if (err) {
            return callback(
              {
                errors: err,
                message: "Some server error has occurred."
              },
              users
            );
          } else if (existingUser) {
            return callback(
              {
                errors: null,
                message:
                  existingUser.name +
                  " already exists in our database from Row "
              },
              users
            );
          } else {
            users.push({
              name: user.Name || "",
              city: user.City || "",
              country: user.Country || "",
              createdBy: req.admin._id
            });
            exists.push(user.Name);
            callback(null, users);
          }
        }
      );
    },
    async function(err, data) {
      if (err) {
        return SendResponse(res, {
          error: true,
          status: 400,
          errors: err.errors,
          userMessage: err.message
        });
      }

      data = await Country.create(data);
      return SendResponse(res, {
        data,
        userMessage:
          "Data has been uploaded successfully. Please check the data."
      });
    }
  );
}; /*-----  End of addCountryBulk  ------*/

/*=============================
***   Add New Grade  ***
===============================*/
methods.addCountry = async function(req, res) {
  req.checkBody("name", "Name  is required.").notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }

  let data = await Country.findOne({
    name: req.body.name,
    documents: req.body.documents,
    status: 0
  });

  if (data) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Country name already exist."
    });
  }

  data = await new Country(req.body).save();
  return SendResponse(res, {
    data,
    userMessage: "Country added successfully."
  });
}; /*-----  End of addCountry  ------*/

/*=======================================
***   Get All Country List  ***
=========================================*/
methods.getCountry = async function(req, res) {
  let query,
    condition = {},
    options = {
      sort: { name: 1 },
      page: req.query.page,
      limit: 10
    };

  if (req.query.search) {
    condition = {
      name: { $regex: ".*" + req.query.search + ".*", $options: "i" }
    };

    query = Country.paginate(condition, options);
  }

  if (!req.query.country && !req.query.page) {
    condition = { status: 0, country: { $ne: "United States" } };
    query = Country.find(condition).sort({ name: 1 });
  }

  if (req.query.page) {
    query = Country.paginate(condition, options);
  }

  if (req.query.country) {
    condition = {
      // status: 0,
      country: req.query.country
    };
    query = Country.find(condition).sort("city");
  }

  let data = await query;
  return SendResponse(res, { data, userMessage: "Country list." });
}; /*-----  End of get Country  ------*/
/*========================
***   Update Country  ***
==========================*/
methods.updateCountry = async function(req, res) {
  let country = await Country.findOne({ _id: req.body._id });

  if (!country) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Country details not found."
    });
  }

  country.name = req.body.name || country.name;
  country.documents = req.body.documents || country.documents;
  country.updatedAt = new Date();
  await country.save();

  return SendResponse(res, { data: country, userMessage: "Country updated." });
}; /*-----  End of updateCountry  ------*/

/*============================
***   remove Country  ***
==============================*/
methods.removeCountry = async function(req, res) {
  await Country.update(
    { _id: { $in: req.body.idsArray } },
    { $set: { status: req.body.status } },
    { multi: true }
  );

  return SendResponse(res, { userMessage: "Country deleted." });
}; /*-----  End of removeCountry  ------*/
