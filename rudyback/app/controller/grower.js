const mongoose = require("mongoose");
const session = require("@ag-libs/session");
const Grower = mongoose.model("grower");
const arrayReduce = require("async-array-reduce");
const multer = require("multer");
const validation = require("@ag-libs/validation");
const Confirmation = mongoose.model("purchaseConfirmation");
const Contract = mongoose.model("productionContract");
const Sample = mongoose.model("productionRecordsSample");
const Rating = mongoose.model("rating");
const Scale = mongoose.model("scale");
const generatePdf = require("@ag-libs/generatePdf");
const { SendResponse } = require("@ag-common");
const moment = require("moment");

const multerS3 = require("multer-s3");

const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region
});

const amazonS3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
  signatureVersion: "v4"
});

const methods = {};

module.exports.controller = function(router) {
  router
    .route("/grower/bulk")
    .post(
      session.adminCheckToken,
      validation.checkUsersFile,
      methods.addGrowerBulk
    )
    .get(session.adminCheckToken, methods.getGrowerList);

  router
    .route("/grower")
    .post(session.adminCheckToken, methods.addGrower)
    .put(session.adminCheckToken, methods.updateGrower)
    .get(session.adminCheckToken, methods.getAllGrowerList);

  router
    .route("/grower/delete")
    .post(session.adminCheckToken, methods.removeGrower);

  router
    .route("/grower/search")
    .post(session.adminCheckToken, methods.searchGrower);

  router
    .route("/grower/list")
    .get(session.adminCheckToken, methods.getGrowerListByCommodity)
    .post(session.adminCheckToken, methods.getContractListByCommodity);

  router
    .route("/grower/pdf")
    .put(methods.uploadPdf)
    .get(methods.removePdf);

  router
    .route("/grower/rating")
    .post(session.adminCheckToken, methods.updateRating)
    .get(session.adminCheckToken, methods.ratingList);

  router
    .route("/grower/growerDetails")
    .get(session.adminCheckToken, methods.growerDetails);

  router
    .route("/grower/note/:growerId")
    .put(session.adminCheckToken, methods.updateNote);

  router
    .route("/grower/removeGrowerRating")
    .put(session.adminCheckToken, methods.removeGrowerRating);

  router.route("/grower/townList").get(methods.townList);

  router.route("/grower/exportAll").post(methods.exportAll);

  router
    .route("/grower/areaReport")
    .post(session.adminCheckToken, methods.areaReport);

  router.route("/grower/exportAreaReport").post(methods.exportAreaReport);

  router
    .route("/grower/massReport")
    .post(session.adminCheckToken, methods.massReport);

  router
    .route("/grower/generateTicketPdf")
    .post(session.adminCheckToken, methods.generateTicketPdf);
  router
    .route("/grower/growerCallBackList")
    .get(session.adminCheckToken, methods.growerCallBackList);

  //grower call back list show in dashboard
  router
    .route("/grower/getLatestgrowerCallBack")
    .get(session.adminCheckToken, methods.getLatestgrowerCallBack);
};

methods.updateNote = async (req, res) => {
  const growerId = req.params.growerId;
  const note = req.body.note;

  await Grower.findOneAndUpdate({_id: growerId}, {$set: {note}});

  SendResponse(res, {status: 200});
};

methods.generateTicketPdf = async (req, res) => {
  let scales = await Scale.find({
    contractNumber: req.body.contractNumber,
    status: 0,
    void: { $ne: true }
  })
    .select(
      "growerId contractNumber commodityId ticketNumber ticketType personFarmType date netWeight analysis displayOnTicket unloadWeidht ticketMailSent ticketMailDate moisture void"
    )
    .populate("growerId", "firstName lastName farmName email")
    .populate("commodityId", "commodityName")
    .populate("analysis.analysisId", "analysisName");

  scales._id = req.body.id;
  generatePdf.generatePDF("contractTicket", scales, async function(
    err,
    scalePdfUrl
  ) {
    if (err) {
      return SendResponse(res, {
        error: true,
        status: 500,
        errors: err,
        userMessage: "server error"
      });
    }

    let data = await Contract.findOneAndUpdate(
      { contractNumber: req.body.contractNumber },
      { $set: { scalePdfUrl: scalePdfUrl } },
      { new: true, lean: true }
    );

    return SendResponse(res, { data, userMessage: "Contract find" });
  });
};

methods.townList = async (req, res) => {
  let data = await Grower.find({}).select("addresses");

  var townList = [];
  if (data && data.length) {
    data.forEach(val => {
      if (val.addresses && val.addresses[0] && val.addresses[0].town) {
        if (townList.indexOf(val.addresses[0].town) == -1) {
          townList.push(val.addresses[0].town);
        }
      }
    });
  }
  return SendResponse(res, townList);
};

methods.growerDetails = async (req, res) => {
  let data = await Grower.find({ _id: req.query.growerId }).select(
    "firstName lastName farmName"
  );
  return SendResponse(res, { data, userMessage: "Grower find" });
};

methods.uploadPdf = (req, res) => {
  var fileName = "";
  const uploadfile = multer({
    storage: multerS3({
      s3: amazonS3,
      bucket: process.env.S3_BUCKET,
      acl: "public-read",
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        fileName = new Date().getTime() + "_" + ".pdf";
        cb(null, fileName);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE
    })
  }).single("file");

  uploadfile(req, res, function(err) {
    if (err) {
      return SendResponse(res, {
        error: true,
        status: 500,
        errors: err,
        userMessage: "uploadfile error"
      });
    }

    var urlParams = { Bucket: process.env.S3_BUCKET, Key: fileName };
    var s3 = new AWS.S3();
    s3.getSignedUrl("getObject", urlParams, async function(err, url) {
      let pdfData = {};
      if (req.query.pdfType === 'declaration') {
        pdfData = {
          pdfDecUrl: url.split("?")[0],
          declarationExpiryDate: req.query.expiryDate,
          pdfDecUploaded: true,
        };
      } else {
        pdfData = {
          pdfUrl: url.split("?")[0],
          certificateExpiryDate: req.query.expiryDate,
          pdfUploaded: true,
        };
      }

      await Grower.findByIdAndUpdate(req.query.growerId, { $set: pdfData });

      return SendResponse(res, {
        data: url.split("?")[0],
        userMessage: "Pdf uploaded"
      });
    });
  });
};

methods.removePdf = async (req, res) => {
  let pdfData = {};
  if (req.query.pdfType === 'declaration') {
    pdfData = {
      pdfDecUrl: '',
      declarationExpiryDate: null,
      pdfDecUploaded: false,
    };
  } else {
    pdfData = {
      pdfUrl: '',
      certificateExpiryDate: null,
      pdfUploaded: false,
    };
  }
  let success = await Grower.findByIdAndUpdate(req.query.growerId, { $set: pdfData });

  if (!success) {
    return SendResponse(res, {
      status: 400,
      userMessage: "Something went wrong"
    });
  }
  return SendResponse(res, { userMessage: "Pdf removed successfully" });
};

/*====================================
***   getGrowerListByCommodity  ***
======================================*/
methods.getGrowerListByCommodity = async function(req, res) {
  if (!req.query.commodityId) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "CommodityId is required."
    });
  }
  let contracts = await Contract.distinct("growerId", {
    status: 0,
    commodityId: req.query.commodityId
  })
    .populate("growerId")
    .lean();

  let purchase = await Confirmation.distinct("growerId", {
    status: 0,
    commodityId: req.query.commodityId
  })
    .populate("growerId")
    .lean();

  var array3 = contracts.filter(function(obj) {
    return purchase.indexOf(obj) == -1;
  });
  array3 = [...purchase, ...array3];
  let data = await Grower.find({ _id: { $in: array3 } });

  return SendResponse(res, { data, userMessage: "contracts list." });
}; /*-----  End of getGrowerListByCommodity  ------*/

methods.growerCallBackList = async function(req, res) {
  var options = {
    sort: { callBackDate: 1 },
    page: req.query.page,
    limit: 15
  };

  let query = {
    deleteStatus: 0,
    callBackDate: { $gte: moment().startOf("day") }
  };

  if (req.query.lastEditedBy) {
    query.lastEditedBy = req.query.lastEditedBy;
  }
  let data = await Grower.paginate(query, options);
  return SendResponse(res, { data, userMessage: "Grower call back List" });
}; /*-----  End of growerCallBackList  ------*/

/*-----Start Latest grower callback list show in dashboard-----*/
methods.getLatestgrowerCallBack = async (req, res) => {
  const data = await Grower.find({
    lastEditedBy: req.query.lastEditedBy,
    callBackDate: { $gte: moment().startOf("day") },
    deleteStatus: 0
  })
    .sort("callBackDate: 1")
    .limit(10);

  return SendResponse(res, { data, userMessage: "success" });
}; /*-----end Latest grower callback list show in dashboard-----*/

/*======================================
***   getContractListByCommodity  ***
========================================*/
methods.getContractListByCommodity = async function(req, res) {
  var query;
  query = {
    commodityId: req.body.commodityId,
    growerId: req.body.growerId,
    status: 0
  };

  if (req.body.commodityId && req.body.growerId) {
    let productionContract = await Contract.find(query);

    let purchaseConfirmation = await Confirmation.find(query);

    return SendResponse(res, {
      userMessage: "list.",
      data: {
        productionContract: productionContract,
        purchaseConfirmation: purchaseConfirmation
      }
    });
  }
}; /*-----  End of getContractListByCommodity  ------*/

/*============================
***   getAllGrowerList  ***
==============================*/
methods.getAllGrowerList = async function(req, res) {
  let data = await Grower.find({ deleteStatus: 0 });
  return SendResponse(res, { data, userMessage: "Grower List" });
}; /*-----  End of getAllGrowerList  ------*/

/*==============================
***   Add Grower In Bulk  ***
================================*/
methods.addGrowerBulk = async function(req, res) {
  var exists = [];
  req.sheets = req.sheets.reduce((sheets, sheet) => {
    return sheets.concat(sheet);
  }, []);
  arrayReduce(
    req.sheets,
    [],
    function(users, user, callback) {
      Grower.findOne(
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
            address.push({
              street: user["AddressStreet"] || "",
              street2: user["AddressStreet"] || "",
              town: user["AddressTown"] || "",
              province: user["AddressProv"] || "",
              postal: user["AddressPostal"] || "",
              country: user["country"]
            });
            user["address"] = address;
            const farmNames = user["FarmName"] ? [user["FarmName"]] : [];
            users.push({
              firstName: user["FirstName"] || "",
              lastName: user["LastName"] || "",
              farmName: user["FarmName"] || "",
              farmNames,
              email: user["email"] || "",
              email2: user["email2"] || "",
              cellNumber: user["cellNumber"] || "",
              phone2: user["phoneNumber"] || "",
              phone: user["phone"] || "",
              fax: user["faxNumber"] || "",
              GST: user["GSTNumber"] || "",
              farmSize: user["farmSize"] || "",
              addresses: user["address"] || "",
              createdBy: req.admin._id,
              fullAddress: user["FullAddress"] || "",
              coOwnerName: user["coOwnerName"] || "",
              reference: user["reference"] || ""
            });
            exists.push(user["email"]);
            callback(null, users);
          }
        }
      );
    },
    async function(err, users) {
      if (err) {
        return SendResponse(res, {
          error: true,
          errors: err.errors,
          status: 400,
          userMessage: err.message
        });
      }
      users = await Grower.create(users);
      return SendResponse(res, {
        data: users,
        userMessage:
          "Data has been uploaded successfully. Please check the data."
      });
    }
  );
}; /*-----  End of addGrowerBulk  ------*/

/*=========================
***   getGrowerList  ***
===========================*/
methods.getGrowerList = async function(req, res) {
  let data,
    condition = {};
  var options = {
    sort: { createdAt: -1 },
    page: req.query.page,
    limit: 15
  };

  if (req.query.growerId) {
    condition = {
      // deleteStatus: 0,
      _id: req.query.growerId
    };
    data = await Grower.findOne(condition)
      .populate("lastEditedBy")
      .lean();
  } else {
    data = await Grower.paginate(condition, options);
  }

  return SendResponse(res, { data, userMessage: "Grower List" });
}; /*-----  End of getGrowerList  ------*/

/*=====================
***   addGrower  ***
=======================*/
methods.addGrower = async function(req, res) {
  req.checkBody("firstName", "First Name is required.").notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }
  var condition = { $and: [{ firstName: req.body.firstName }] };
  if (req.body.lastName) {
    condition.$and.push({ lastName: req.body.lastName });
  }

  if (req.body.farmName) {
    condition.$and.push({ farmName: req.body.farmName });
  }

  if (req.body.addresses[0].town) {
    condition.$and.push({ "addresses.town": req.body.addresses[0].town });
  }

  if (req.body.addresses[0].street) {
    condition.$and.push({ "addresses.street": req.body.addresses[0].street });
  }

  let grower = await Grower.findOne(condition);

  if (grower) {
    //send response to client
    var msg = "";
    if (
      grower.firstName == req.body.firstName &&
      grower.lastName == req.body.lastName
    ) {
      msg = req.body.firstName + " " + req.body.lastName;
    } else {
      msg = req.body.firstName;
    }

    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: msg + " already exists in our database. "
    });
  }

  grower = await new Grower(req.body).save();

  return SendResponse(res, {
    data: grower,
    userMessage: "Grower has been added successfully. Please check the data."
  });
}; /*-----  End of addGrower  ------*/

/*=======================
***   updateGrower  ***
=========================*/
methods.updateGrower = async function(req, res) {
  var condition = {
    $and: [{ _id: { $ne: req.body._id } }, { firstName: req.body.firstName }]
  };

  if (req.body.lastName) {
    condition.$and.push({ lastName: req.body.lastName });
  }

  if (req.body.farmName) {
    condition.$and.push({ farmName: req.body.farmName });
  }

  let success = await Grower.findOne(condition);
  if (success) {
    var msg = "";
    if (
      success.firstName == req.body.firstName &&
      success.lastName == req.body.lastName
    ) {
      msg = req.body.firstName + " " + req.body.lastName;
    } else {
      msg = req.body.firstName;
    }

    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: msg + " already exists in our database. "
    });
  }

  req.body.lastEditedBy = req.admin._id;

  if (!(req.body.farmNames && req.body.farmNames.length)) {
    req.body.farmNames = req.body.farmName ? [req.body.farmName] : [];
  }

  const updatedGrower = await Grower.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true });

  return SendResponse(res, {
    data: updatedGrower,
    userMessage: "Grower info updated successfully."
  });
}; /*-----  End of updateGrower  ------*/

/*============================
***   remove Grower  ***
==============================*/
methods.removeGrower = async function(req, res) {
  let data = await Grower.update(
    { _id: { $in: req.body.idsArray } },
    { $set: { deleteStatus: req.body.status } },
    { multi: true }
  );

  return SendResponse(res, { data, userMessage: "Grower deleted." });
}; /*-----  End of removeGrower  ------*/

/*========================
***   searchGrower  ***
==========================*/
methods.searchGrower = async function(req, res) {
  var options = {
    sort: { createdAt: -1 },
    page: req.query.page,
    limit: 10
  };

  const condition = constructGrowerCondition(req.body);

  let data = await Grower.paginate(condition, options);

  return SendResponse(res, { data, userMessage: "Grower List" });
}; /*-----  End of searchGrower  ------*/

function constructGrowerCondition (filters) {
  var condition = { $and: [] };
  Object.getOwnPropertyNames(filters).forEach(function(key) {
    if (filters[key]) {
      var temp = {};
      if (key == "phone") {
        temp = {
          $or: [
            {
              phone: {
                $regex: ".*" + filters[key] + ".*",
                $options: "i"
              }
            },
            {
              phoneNumber2: {
                $regex: ".*" + filters[key] + ".*",
                $options: "i"
              }
            },
            {
              phoneNumber3: {
                $regex: ".*" + filters[key] + ".*",
                $options: "i"
              }
            },
            {
              cellNumber: {
                $regex: ".*" + filters[key] + ".*",
                $options: "i"
              }
            }
          ]
        };
        condition.$and.push(temp);
      } else if (key == "type") {
        if (filters.type == "Organic") {
          temp["organic"] = true;
        }
        condition.$and.push(temp);
      } else if (key == "deleteStatus") {
        temp["deleteStatus"] = Number(filters["deleteStatus"]);
        condition.$and.push(temp);
      } else if (key == "postalCode") {
        temp["addresses.postal"] = {
          $regex: ".*" + filters[key] + ".*",
          $options: "i"
        };
        condition.$and.push(temp);
      } else if (key == "town") {
        temp["addresses.town"] = {
          $regex: ".*" + filters[key] + ".*",
          $options: "i"
        };
        condition.$and.push(temp);
      } else if (key == "country") {
        temp["addresses.country"] = {
          $regex: ".*" + filters[key] + ".*",
          $options: "i"
        };
        condition.$and.push(temp);
      } else if (key == "farmName") {
        temp = {
          $regex: ".*" + filters[key] + ".*",
          $options: "i"
        };
        condition.$and.push({$or: [
          {farmName: temp},
          {farmNames: {$elemMatch: temp}}
        ]});
      } else {
        temp[key] = {
          $regex: ".*" + filters[key] + ".*",
          $options: "i"
        };
        condition.$and.push(temp);
      }
    }
  });

  if (!condition.$and.length) {
    delete condition.$and;
  }

  return condition;
}

/*========================
***   updateRaging  ***
==========================*/
methods.updateRating = async function(req, res) {
  let grower = await Grower.findById(req.body.growerId);

  if (!grower) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Invalid request."
    });
  }

  grower = await Grower.findByIdAndUpdate(req.body.growerId, {
    $set: { rating: req.body.rating }
  });

  var ratingObj = {
    note: req.body.note,
    ratedBy: req.admin._id,
    rating: req.body.rating,
    growerId: req.body.growerId
  };

  await new Rating(ratingObj).save();

  return SendResponse(res, { userMessage: "Rating updated." });
}; /*-----  End of updateRaging  ------*/

methods.ratingList = async function(req, res) {
  let data = await Rating.find({ status: 0, growerId: req.query.growerId })
    .populate("ratedBy", "fullName")
    .sort("-createdAt");

  return SendResponse(res, { data, userMessage: "Rating find." });
};

methods.removeGrowerRating = async function(req, res) {
  let grower = await Grower.findByIdAndUpdate(req.query.growerId, {
    $set: { rating: 0 }
  });

  if (!grower) {
    return SendResponse(res, { status: 404, userMessage: "Grower not found" });
  }

  return SendResponse(res, { userMessage: "Rating removed." });
};

methods.exportAll = async function(req, res) {
  const condition = constructGrowerCondition(req.body.filter);
  let data = await Grower.find(condition).lean();

  var newData = data.map(g => {
    return {
      Name: `${g.firstName} ${g.lastName}`,
      "Farm Name": g.farmName,
      Email: g.email,
      "Phone 1": g.phone,
      "Phone 2": g.phoneNumber2,
      "Phone 3": g.phoneNumber3,
      "Cell number": g.cellNumber,
      Address: g.addresses[0] ? g.addresses[0].street : "",
      Town: g.addresses[0] ? g.addresses[0].town : "",
      "Address prov": g.addresses[0] ? g.addresses[0].province : "",
      RM: g.addresses[0] ? g.addresses[0].rm : "",
      "Postal code": g.addresses[0] ? g.addresses[0].postal : "",
      Country: g.addresses[0] ? g.addresses[0].country : "",
      "Freight Rate": g.freightRate,
      "Organic Acres": g.organicAcres
    };
  });
  res.xls("grower", newData);
};

methods.areaReport = async (req, res) => {
  if (req.body.start && req.body.end) {
    var aggregate = Grower.aggregate();
    aggregate
      .match({ deleteStatus: 0 })
      .unwind({ path: "$addresses", preserveNullAndEmptyArrays: false })
      .project({
        firstName: 1,
        lastName: 1,
        addresses: 1,
        email: 1,
        farmName: 1,
        cellNumber: 1,
        phone: 1,
        phone2: 1,
        createdAt: 1,
        startPostalCode: {
          $substr: ["$addresses.postal", 0, 3]
        }
      });

    if (req.body.start && req.body.end) {
      aggregate.match({
        startPostalCode: {
          $gte: req.body.start,
          $lte: req.body.end
        }
      });
    }

    let options = { page: req.body.page, limit: 15 };

    Grower.aggregatePaginate(aggregate, options, function(
      err,
      results,
      pageCount
    ) {
      if (err) {
        return SendResponse(res, { status: 500, userMessage: "Server error." });
      }

      if (err) {
        return SendResponse(res, {
          error: true,
          status: 500,
          errors: err,
          userMessage: "some server error has occurred."
        });
      }

      let data = { docs: results, total: pageCount, page: options.page };

      return SendResponse(res, { data, userMessage: "Grower list." });
    });
  } else {
    let data = await Grower.paginate(
      { deleteStatus: 0 },
      {
        select:
          "firstName lastName addresses email  farmName cellNumber phone phone2 createdAt",
        sort: {
          createdAt: -1
        },
        page: req.body.page,
        limit: 15
      }
    );

    return SendResponse(res, { data, userMessage: "Grower list." });
  }
};

methods.exportAreaReport = async (req, res) => {
  req.checkBody("start", "Postal code start is required.").notEmpty();
  req.checkBody("end", "Postal code end is required.").notEmpty();
  var errors = req.validationErrors(true);

  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }

  var aggregate = Grower.aggregate();
  aggregate
    .match({ deleteStatus: 0 })
    .unwind({ path: "$addresses", preserveNullAndEmptyArrays: false })
    .project({
      firstName: 1,
      lastName: 1,
      addresses: 1,
      email: 1,
      farmName: 1,
      cellNumber: 1,
      phone: 1,
      phone2: 1,
      createdAt: 1,
      startPostalCode: {
        $substr: ["$addresses.postal", 0, 3]
      }
    })
    .match({
      startPostalCode: {
        $gte: req.body.start,
        $lte: req.body.end
      }
    })
    .exec((err, data) => {
      if (err) {
        res.xls("grower", []);
      } else {
        var newData = data.map(g => {
          return {
            "Grower Name": `${g.firstName} ${g.lastName}`,
            "Farm Name": g.farmName,
            Town: g.addresses ? g.addresses.town : "",
            "Postal Code": g.addresses ? g.addresses.postal : "",
            Email: g.email,
            Cellphone: g.cellNumber,
            "Phone 1": g.phone,
            "Phone 2": g.phone2
          };
        });
        res.xls("grower", newData);
      }
    });
};

methods.massReport = async (req, res) => {
  var condition = { status: { $in: [0, 1] } };

  if (req.body.commodityId) {
    condition["commodityId"] = req.body.commodityId;
  }
  if (req.body.cropYear) {
    condition["cropYear"] = req.body.cropYear;
  }
  if (["0", "1"].indexOf(req.body.status) != -1) {
    condition["status"] = Number(req.body.status);
  }

  if (req.body.recordType == "Production Record") {
    let data = await Sample.find(condition)
      .select("growerId cropYear contractNumber commodityId")
      .populate("growerId", "firstName lastName farmName email phone addresses")
      .populate("commodityId", "commodityName");

    return SendResponse(res, { data, userMessage: "Grower list." });
  } else if (req.body.recordType == "Purchase Confirmation") {
    let data = await Confirmation.find(condition)
      .select("growerId cropYear contractNumber commodityId")
      .populate("growerId", "firstName lastName farmName email phone addresses")
      .populate("commodityId", "commodityName");

    return SendResponse(res, { data, userMessage: "Grower list." });
  } else if (req.body.recordType == "Production Contract") {
    let data = await Contract.find(condition)
      .select("growerId cropYear contractNumber commodityId")
      .populate("growerId", "firstName lastName farmName email phone addresses")
      .populate("commodityId", "commodityName");

    return SendResponse(res, { data, userMessage: "Grower list." });
  } else {
    let data = await Grower.find({
      deleteStatus: 0,
      email: { $nin: [null, "null", "", ""] }
    })
      .select("firstName lastName email phone addresses")
      // .limit(10)
      .lean();

    for (let obj of data) {
      obj["growerId"] = {
        firstName: obj.firstName,
        lastName: obj.lastName,
        email: obj.email,
        phone: obj.phone,
        addresses: obj.addresses
      };
      delete obj.firstName;
      delete obj.lastName;
      delete obj.email;
      delete obj.phone;
    }

    return SendResponse(res, { data, userMessage: "Grower list." });
  }
};
