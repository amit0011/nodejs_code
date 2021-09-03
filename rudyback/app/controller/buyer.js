var mongoose = require("mongoose");
var session = require("@ag-libs/session");
var Buyer = mongoose.model("buyer");
var arrayReduce = require("async-array-reduce");
var validation = require("@ag-libs/validation");
var Sales = mongoose.model("salesContract");
var TradePurchase = mongoose.model('tradePurchase');
const { SendResponse } = require("@ag-common");

var methods = {};

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {
  router
    .route("/buyer/bulk")
    .post(
      session.adminCheckToken,
      validation.checkUsersFile,
      methods.addBuyerBulk
    )
    .get(session.adminCheckToken, methods.getBuyerList);

  router
    .route("/buyer")
    .post(session.adminCheckToken, methods.addBuyer)
    .put(session.adminCheckToken, methods.updateBuyer);

  router
    .route("/buyer/addBuyerAddress")
    .post(session.adminCheckToken, methods.addBuyerAddress);

  router
    .route("/buyer/removeBuyerAddress")
    .post(session.adminCheckToken, methods.removeBuyerAddress);

  router
    .route("/buyer/setDefaultBuyerAddress")
    .post(session.adminCheckToken, methods.setDefaultBuyerAddress);

  router
    .route("/buyer/editAddresssave/:id")
    .post(session.adminCheckToken, methods.editAddresssave);

  router.route("/buyer/Listt").get(session.adminCheckToken, methods.list);

  router
    .route("/buyer/delete")
    .post(session.adminCheckToken, methods.removeBuyer);

  router
    .route("/buyer/search")
    .post(session.adminCheckToken, methods.searchBuyer);

  router
    .route("/buyer/note/:buyerId")
    .put(session.adminCheckToken, methods.updateNote);

  router
    .route("/buyer/assignUser")
    .post(session.adminCheckToken, methods.assignUser);

  router
    .route("/buyer/list")
    .get(session.adminCheckToken, methods.buyerListUsingCommodity)
    .post(session.adminCheckToken, methods.getContractListByCommodity);
};


methods.updateNote = async (req, res) => {
  const buyerId = req.params.buyerId;
  const note = req.body.note;

  await Buyer.findOneAndUpdate({_id: buyerId}, {$set: {note}});

  SendResponse(res, {status: 200});
};

methods.removeBuyerAddress = async function(req, res) {
  let buyer = await Buyer.findById(req.body._id).lean();

  if (!buyer) {
    return SendResponse(res, {
      error: true,
      status: 404,
      userMessage: "Buyer not found."
    });
  }

  req.body.idsArray.forEach(function(id) {
    let idx = buyer.addresses.findIndex(addr => addr._id == id);
    if (idx >= 0) {
      buyer.addresses[idx].isDeleted = 1;
    }
  });
  buyer.addresses.sort((a, b) => a.isDeleted > b.isDeleted);

  let data = await Buyer.findByIdAndUpdate(
    { _id: req.body._id },
    { $set: { addresses: buyer.addresses } },
    { new: true }
  );

  return SendResponse(res, { data, userMessage: "Buyer address deleted." });
};

methods.addBuyerAddress = async (req, res) => {
  //Check for POST request errors.
  req.checkBody("street", "Street is required.").notEmpty();
  req.checkBody("country", "Country is required.").notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      userMessage: "Validation errors",
      errors,
      status: 400,
      error: true
    });
  }

  let data = await Buyer.findByIdAndUpdate(
    { _id: req.body.buyerId },
    { $push: { addresses: req.body } },
    { new: true }
  );

  return SendResponse(res, {
    data,
    userMessage: "Buyer address added successfully."
  });
};

methods.assignUser = async (req, res) => {
  await Buyer.findByIdAndUpdate(
    { _id: req.body._id },
    { $set: { assignedUserId: req.body.assignedUserId } }
  );

  return SendResponse(res, { userMessage: "Assigned success." });
};

methods.setDefaultBuyerAddress = async function(req, res) {
  let buyer = await Buyer.findById(req.body._id).lean();

  if (!buyer) {
    return SendResponse(res, {
      status: 404,
      error: true,
      userMessage: "Buyer not found."
    });
  }

  var address;
  req.body.idsArray.forEach(function(id) {
    let idx = buyer.addresses.findIndex(addr => addr._id == id);
    if (idx >= 0) {
      address = buyer.addresses[idx];
      buyer.addresses.splice(idx, 1);
    }
  });

  if (!address) {
    return SendResponse(res, {
      data: buyer,
      userMessage: "Buyer address not found."
    });
  }

  buyer.addresses.unshift(address);

  let data = await Buyer.findByIdAndUpdate(
    { _id: req.body._id },
    { $set: { addresses: buyer.addresses } },
    { new: true }
  );

  return SendResponse(res, { data, userMessage: "Buyer address deleted." });
};

methods.editAddresssave = async function(req, res) {
  let buyer = await Buyer.findById(req.params.id).lean();

  if (!buyer) {
    return SendResponse(res, {
      error: true,
      status: 404,
      userMessage: "Buyer not update."
    });
  }

  let idx = buyer.addresses.findIndex(addr => addr._id == req.body._id);
  if (idx >= 0) {
    buyer.addresses[idx] = req.body;
  }

  buyer = await Buyer.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: { addresses: buyer.addresses } },
    { new: true }
  );

  return SendResponse(res, {
    data: buyer,
    userMessage: "Buyer address updated."
  });
};

methods.list = async function(req, res) {
  let data = await Buyer.find({ _id: req.query.buyerId }).select(
    "businessName firstName lastName email"
  );

  return SendResponse(res, { data, userMessage: "buyer list." });
};

/*============
***    buyerListUsingCommodity ***
==============*/
methods.buyerListUsingCommodity = async function(req, res) {
  if (!req.query.commodityId) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Commodity Id is require"
    });
  }
  let ContractType = req.query.havingTrades ? TradePurchase : Sales;
  let contracts = await ContractType.distinct("buyerId", {
    status: 0,
    commodityId: req.query.commodityId
  })
    .populate("buyerId")
    .lean();

  let data = await Buyer.find({ _id: { $in: contracts } }).sort({
    businessName: 1
  });

  return SendResponse(res, { data, userMessage: "contracts list." });
}; /*-----  End of buyerListUsingCommodity  ------*/

/*======================================
***   getContractListByCommodity  ***
========================================*/
methods.getContractListByCommodity = async function(req, res) {
  if (!(req.body.commodityId && req.body.buyerId)) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Commodity Id is require"
    });
  }

  let data = await Sales.find({
    commodityId: req.body.commodityId,
    buyerId: req.body.buyerId,
    status: 0
  });

  return SendResponse(res, { data, userMessage: "list." });
}; /*-----  End of getContractListByCommodity  ------*/

/*==============================
***   Add Buyer In Bulk  ***
================================*/
methods.addBuyerBulk = async function(req, res) {
  var exists = [];
  req.sheets = req.sheets.reduce((sheets, sheet) => {
    return sheets.concat(sheet);
  }, []);
  arrayReduce(
    req.sheets,
    [],
    function(users, user, callback) {
      Buyer.findOne(
        {
          email: "xxx@g.com"
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
                  existingUser.email +
                  " already exists in our database from Row "
              },
              users
            );
          } else {
            var address = [];
            address.push(
              {
                street: user.addstreet || "",
                city: user.addcity || "",
                province: user.addProv || "",
                postal: user.addPcode || "",
                country: user.addCountry
              },
              {
                street: user.addstreet2 || "",
                city: user.addcity2 || "",
                province: user.addProv2 || "",
                postal: user.addPcode2 || "",
                country: user.addCountry2
              }
            );
            user.address = address;
            users.push({
              businessName: user.businessName || "",
              firstName: user.FirstName || "",
              lastName: user.LastName || "",
              email: user.Email || "",
              cellNumber: user.cellNumber || "",
              phone: user.phone || "",
              fax: user.fax || "",
              taxNumber: user.taxNumber || "",
              reference: user.kpID || "",
              createdBy: req.admin._id,
              addresses: (user.address = address)
            });
            exists.push(user.Email);
            callback(null, users);
          }
        }
      );
    },
    async function(err, users) {
      if (err) {
        return SendResponse(res, {
          error: true,
          status: 400,
          errors: err.errors,
          userMessage: err.message
        });
      }

      let data = await Buyer.create(users);

      return SendResponse(res, {
        data,
        userMessage:
          "Data has been uploaded successfully. Please check the data."
      });
    }
  );
}; /*-----  End of addBuyerBulk  ------*/

/*=========================
** * getBuyerList ** *
===========================*/
methods.getBuyerList = async function(req, res) {
  //Database functions here
  let data;
  let condition = {},
    options = {};
  if (req.query.buyerId) {
    condition = { status: 0, _id: req.query.buyerId };
    data = await Buyer.findOne(condition)
      .populate("assignedUserId")
      .populate("edcId", "name")
      .populate("documents");
    return SendResponse(res, { data, userMessage: "Buyer Details." });
  } else if (req.query.search) {
    options = { sort: { createdAt: -1 }, page: req.query.page, limit: 10 };

    condition = {
      status: 0,
      firstName: { $regex: ".*" + req.query.search + ".*", $options: "i" }
    };
    data = await Buyer.paginate(condition, options);
  } else if (!req.query.page) {
    condition = { status: 0 };
    data = await Buyer.find(condition, options);
  } else {
    options = { sort: { createdAt: -1 }, page: req.query.page, limit: 10 };
    condition = { status: 0 };
    data = await Buyer.paginate(condition, options);
  }

  await Buyer.count(condition);

  return SendResponse(res, { data, userMessage: "Buyer List" });
}; /*-----  End of getBuyerList  ------*/

/*=====================
***   addBuyer  ***
=======================*/
methods.addBuyer = async function(req, res) {
  let buyer;
  if (req.body.email) {
    buyer = await Buyer.findOne({ email: req.body.email });
    if (buyer) {
      return SendResponse(res, {
        error: true,
        status: 400,
        userMessage: buyer.email + " already exists in our database. "
      });
    }
  }

  if (!req.body.edcId) req.body.edcId = null;
  let data = await new Buyer(req.body).save();

  return SendResponse(res, {
    data,
    userMessage: "Buyer has been added successfully. Please check the data."
  });
}; /*-----  End of addBuyer  ------*/

/*=======================
***   updateBuyer  ***
=========================*/
methods.updateBuyer = async function(req, res) {
  //Database functions here
  if (!req.body.edcId) req.body.edcId = null;

  let data = await Buyer.findByIdAndUpdate({ _id: req.body._id }, req.body, {
    new: true
  });

  return SendResponse(res, {
    data,
    userMessage: "Buyer info updated successfully."
  });
}; /*-----  End of updateBuyer  ------*/

/*============================
***   removeBuyer  ***
==============================*/
methods.removeBuyer = async function(req, res) {
  let data = await Buyer.update(
    { _id: { $in: req.body.idsArray } },
    { $set: { status: 1 } },
    { multi: true }
  );

  return SendResponse(res, { data, userMessage: "Buyer deleted." });
}; /*-----  End of removeBuyer  ------*/

/*========================
***   searchBuyer  ***
==========================*/
methods.searchBuyer = async function(req, res) {
  var condition = { $and: [{ status: 0 }] };

  var or_condition = { $or: [] };

  if (req.body.name) {
    or_condition.$or.push({
      firstName: { $regex: ".*" + req.body.name + ".*", $options: "i" }
    });
  }

  if (req.body.assignedUserId) {
    or_condition.$or.push({
      assignedUserId: req.body.assignedUserId
    });
  }

  if (req.body.companyName) {
    or_condition.$or.push({
      businessName: {
        $regex: ".*" + req.body.companyName + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.phoneNumber) {
    or_condition.$or.push({
      phone: { $regex: ".*" + req.body.phoneNumber + ".*", $options: "i" }
    });

    or_condition.$or.push({
      phone2: { $regex: ".*" + req.body.phoneNumber + ".*", $options: "i" }
    });
  }

  if (req.body.postalCode) {
    or_condition.$or.push({
      "addresses.postal": {
        $regex: ".*" + req.body.postalCode + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.country) {
    or_condition.$or.push({
      "addresses.country": {
        $regex: ".*" + req.body.country + ".*",
        $options: "i"
      }
    });
  }

  if (or_condition.$or.length) {
    condition.$and.push(or_condition);
  }

  var options = {
    sort: { createdAt: -1 },
    page: req.query.page,
    limit: Number(req.body.limit) || 10
  };
  let buyer = await Buyer.paginate(condition, options);

  if (buyer.docs.length == 0) {
    return SendResponse(res, { status: 500, userMessage: "No record found." });
  }

  return SendResponse(res, { data: buyer, userMessage: "buyer List" });
}; /*-----  End of searchBuyer  ------*/
