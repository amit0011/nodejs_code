const mongoose = require("mongoose");
const session = require("@ag-libs/session");
const Scale = mongoose.model("scale");
const Grower = mongoose.model("grower");
const ScaleTicketNumber = mongoose.model("scaleTicketNumber");
const scaleHistory = mongoose.model("scaleHistory");
const scaleOutgoingHistory = mongoose.model("scaleOutgoingHistory");

const moment = require("moment");
const async = require("async");
const Contract = mongoose.model("productionContract");
const Confirmation = mongoose.model("purchaseConfirmation");
const TradePurchase = mongoose.model("tradePurchase");
const Sales = mongoose.model("salesContract");
const Buyer = mongoose.model("buyer");
const notifications = require("@ag-libs/function");
const generatePdf = require("@ag-libs/generatePdf");
const { SendResponse } = require("@ag-common");
const Bag = mongoose.model('bags');
const BagInventory = mongoose.model('bagInventory');
const ContainerInventory = mongoose.model('containerInventory');

const methods = {};

module.exports.controller = function(router) {
  router
    .route("/scale")
    .post(session.adminCheckToken, methods.addScale)
    .get(session.adminCheckToken, methods.getScale)
    .put(session.adminCheckToken, methods.updateScale);

  router
    .route("/scale/:ticketId/splitTicket")
    .delete(session.adminCheckToken, methods.splitTicketRemove);

  router
    .route("/scale/splittTicket")
    .post(session.adminCheckToken, methods.splitTicket)
    .get(session.adminCheckToken, methods.getSplittTicket);

  router
    .route("/scale/generateBillOfLading/:id")
    .get(session.adminCheckToken, methods.generateBillOfLading);

  router
    .route("/scale/:growerId/loadsheet")
    .get(session.adminCheckToken, methods.growerLoadSheets)
    .post(session.adminCheckToken, methods.addGrowerLoadSheets)
    .put(session.adminCheckToken, methods.updateGrowerLoadSheets);

  router
    .route("/scale/splittOutgoingTicket")
    .post(session.adminCheckToken, methods.splittOutgoingTicket)
    .get(session.adminCheckToken, methods.getOutgoingSplittTicket);

  router
    .route("/scale/delete")
    .post(session.adminCheckToken, methods.removeScale);

  router
    .route("/scale/ticket")
    .post(session.adminCheckToken, methods.generateScaleTicket)
    .get(session.adminCheckToken, methods.getScaleTicketList);

  router
    .route("/scale/search")
    .post(session.adminCheckToken, methods.searchScaleTicket);

  router
    .route("/scale/freightVariance")
    .get(session.adminCheckToken, methods.freightVariances)
    .put(session.adminCheckToken, methods.updateFreightVarianceData);

  router
    .route("/scale/incomingExcelDownload")
    .post(session.adminCheckToken, methods.incomingExcelDownload);

  router
    .route("/scale/incomingExcelCGCDownload")
    .post(session.adminCheckToken, methods.incomingExcelCGCDownload);

  router
    .route("/scale/outgoingExcelDownload")
    .post(session.adminCheckToken, methods.outgoingExcelDownload);

  router
    .route("/scale/freight/varianceExcelDownload")
    .post(session.adminCheckToken, methods.freightVarianceExcelDownload);

  router
    .route("/scaleTicketNumber")
    .post(session.adminCheckToken, methods.addScaleTicketNumber)
    .get(session.adminCheckToken, methods.getScaleTicketNumber);

  router.route("/scale/upload").post(methods.uploadJsonForOutGoing);

  router
    .route("/scale/unlockTicket")
    .put(session.adminCheckToken, methods.unlockTicket);

  router
    .route("/scale/getOutgoingSeedScale")
    .get(session.adminCheckToken, methods.getOutgoingSeedScale); 

  router
    .route("/scale/getLatestIncomingTicket")
    .get(session.adminCheckToken, methods.getLatestIncomingTicket);

  router
    .route("/scale/getLatestOutgoingTicket")
    .get(session.adminCheckToken, methods.getLatestOutgoingTicket);

  router.route("/scale/exportAll").post(methods.exportAll);

  router.route("/scale/updateId").post(methods.updateId);

  router
    .route("/scale/ticketList")
    .get(session.adminCheckToken, methods.ticketList);

  router
    .route("/scale/sendTicketMail")
    .post(session.adminCheckToken, methods.sendTicketMail);

  router
    .route("/scale/scaleHistory")
    .get(session.adminCheckToken, methods.scaleHistory);

  router
    .route("/scale/scaleOutgoingHistory")
    .get(session.adminCheckToken, methods.scaleOutgoingHistory);

  router
    .route("/scale/packagingReport")
    .post(session.adminCheckToken, methods.packagingReport);

  router
    .route("/scale/shippedWeightAnalysis")
    .post(session.adminCheckToken, methods.shippedWeightAnalysis);
};

const bagInventoryEntryType = 'actual';
async function manageBagInventory(scale, isNew) {
  if (!isNew) {
    await BagInventory.remove({entryType: bagInventoryEntryType, 'meta.ticketId': scale._id});
  }

  if (scale.void || !(scale.bagId && +scale.numberOfBags && scale.ticketType === 'Outgoing')) {
    return;
  }
  const bag = await Bag.findOne({_id: scale.bagId}).lean();
  let bagInventories = [{
    bagId: scale.bagId,
    bagCategoryId: bag ? bag.category : null,
    noOfBags: -scale.numberOfBags,
    reason: `TicketNumber: ${scale.ticketNumber}`,
    date: scale.date,
    meta: {
      contractNumber: scale.contractNumber,
      ticketNumber: scale.ticketNumber,
      ticketId: scale._id,
    },
    entryType: bagInventoryEntryType,
  }];

  if (scale.pallet && +scale.numberOfPallets) {
    const pallet = await Bag.findOne({_id: scale.pallet}).lean();
    bagInventories.push({
      bagId: scale.pallet,
      bagCategoryId: pallet ? pallet.category : null,
      noOfBags: -scale.numberOfPallets,
      reason: `TicketNumber: ${scale.ticketNumber}`,
      date: scale.date,
      meta: {
        contractNumber: scale.contractNumber,
        ticketNumber: scale.ticketNumber,
        ticketId: scale._id,
      },
      entryType: bagInventoryEntryType,
    });
  }
  await BagInventory.insertMany(bagInventories);
}

const growerLoadSheetType = 'GrowerLoadSheet';
methods.growerLoadSheets = async (req, res) => {
  const growerId = req.params.growerId;

  const data = await Scale.find({ticketType: growerLoadSheetType, growerId})
    .populate('commodityId');

  return SendResponse(res, {
    data, userMessage: 'Grower Load Sheets fetched successfully',
  });
};

methods.generateScalePdf = async (scaleId, done) => {
  const scale = await Scale.findOne({_id: scaleId})
    .populate("analysis.analysisId", "analysisName")
    .populate(
      "commodityId",
      "commodityName commodityShowShipmentAnalysis commodityTypeId"
    )
    .populate("salesBuyerId", "businessName addresses");

  generatePdf.generatePDF("growerLoadSheet", scale, async function( err, pdfUrl ) {
    if (err) return done(err);

    let updatedScale = await Scale.findByIdAndUpdate(
      scaleId,
      { $set: { pdfUrl, updatePdf: false } },
      { new: true, lean: true }
    );
    done(null, updatedScale);
  });
};

methods.addGrowerLoadSheets = async (req, res) => {
  const ticketType = growerLoadSheetType;
  let data = await Scale.findOne({
    ticketNumber: req.body.ticketNumber,
    status: 0,
    ticketType
  });

  if (data) {
      return SendResponse(res, { status: 400, userMessage: 'Ticket number already generated.', error: true });
  }

  data = await (new Scale({...req.body, ticketType})).save();

  await ScaleTicketNumber.findOneAndUpdate({}, {$inc: {loadSheetNumber: 1}});

  const quantityLbs = req.body.unloadWeidht * 2.20462;
  const {contractNumber} = req.body;

  await Confirmation.findOneAndUpdate({contractNumber}, {$inc: {delQty: quantityLbs}});
  await Sales.findOneAndUpdate({contractNumber: req.body.salesContractNumber}, {$inc: {delQty: quantityLbs}});

  methods.generateScalePdf(data._id, (err, scale) => {
    if (err) return SendResponse(res, {error: true, errors: err, status: 500});

    return SendResponse(res, { data: scale, userMessage: 'Ticket saved.' });
  });
};

methods.updateGrowerLoadSheets = async (req, res) => {
  const ticketType = growerLoadSheetType;
  let scale = await Scale.findOne({_id: req.body._id, ticketType, ticketNumber: req.body.ticketNumber});

  if (!scale) {
      return SendResponse(res, {
        status: 400,
        userMessage: 'Ticket you looking for is not found.',
        error: true,
      });
  }

  const updatedScale = await Scale.findOneAndUpdate({_id: req.body._id}, req.body, {new: true});

  const oldWeight = scale.unloadWeidht;
  const newWeight = req.body.unloadWeidht;

  const {
    contractNumber: oldContractNumber,
    void: oldVoid,
    salesContractNumber: oldSalesContractNumber,
  } = scale;

  const {
    contractNumber: newContractNumber,
    void: newVoid,
    salesContractNumber: newSalesContractNumber,
  } = req.body;


  const void_changed = newVoid != oldVoid ? 1 : 0;
  const weight_changed = newWeight != oldWeight ? 2 : 0;

  const contract_changed = newContractNumber != oldContractNumber ? 4 : 0;
  const changes = void_changed + weight_changed + contract_changed;
  applyContractChanges(changes, {contractNumber: newContractNumber}, newVoid, oldWeight, newWeight, oldContractNumber);

  const contract_changed2 = newSalesContractNumber != oldSalesContractNumber ? 4 : 0;
  const changes2 = void_changed + weight_changed + contract_changed2;
  applyContractChanges(changes2, {contractNumber: newSalesContractNumber}, newVoid, oldWeight, newWeight, oldSalesContractNumber);

  methods.generateScalePdf(updatedScale._id, (err, scale) => {
    if (err) return SendResponse(res, {error: true, errors: err, status: 500});

    return SendResponse(res, { data: scale, userMessage: 'Ticket updated.' });
  });
};

methods.shippedWeightAnalysis = async (req, res) => {
  let query = { ticketType: "Outgoing" };

  if (req.body.fromDate && req.body.toDate) {
    query.date = { $gte: req.body.fromDate, $lte: req.body.toDate };
  } else if (req.body.fromDate) {
    query.date = { $gte: req.body.fromDate };
  } else if (req.body.toDate) {
    query.date = { $lte: req.body.toDate };
  }

  if (req.body.commodityId) {
    query.commodityId = req.body.commodityId;
  }

  if (req.body.contractNumber) {
    query.contractNumber = req.body.contractNumber;
  }

  if (req.body.name) {
    var condition = {
      $or: [
        {
          businessName: { $regex: ".*" + req.body.name + ".*", $options: "i" }
        },
        { firstName: { $regex: ".*" + req.body.name + ".*", $options: "i" } }
      ]
    };

    const buyerIds = await Buyer.find(condition);
    query.buyerId = { $in: buyerIds.map(val => val._id) };
  }

  const data = await Scale.paginate(query, {
    populate: [
      { path: "buyerId", select: "firstName lastName businessName addresses email" },
      { path: "commodityId", select: "commodityName" }
    ],
    project:
      "buyerId unloadWeidht contractNumber ticketType ticketNumber unloadWeidhtMT netWeightPerBag overUnderTarget",
    sort: "-date",
    page: req.body.page ? Number(req.body.page) : 1,
    limit: req.body.limit ? Number(req.body.limit) : 10
  });

  return SendResponse(res, { data, userMessage: "Shipped weight analysis" });
};

methods.updateId = async () => {
  var ObjectId = require("mongoose").Types.ObjectId;
  let data = await Scale.find({}).select("binNumber");

  if (!(data && data.length)) return;

  data.forEach(async val => {
    if (!ObjectId.isValid(val.binNumber)) {
      await Scale.findByIdAndUpdate(val._id, { $set: { binNumber: null } });
    }
  });
};

/****************************************************************
***   UploadJSON For Outgoing  ***
****************************************************************/
methods.uploadJsonForOutGoing = function(req, res) {
  async.forEachOfLimit(
    req.body,
    1,
    async (value, key, next) => {
      value.netWeight = Number(value.netTotalWeight) * 1000;
      value.unloadWeidht = value.grossWeight - value.tareWeight;
      value.unloadWeidhtMT = (value.grossWeight - value.tareWeight) / 1000;
      await new Scale(value).save();
      next();
    },
    () => {
      return SendResponse(res, {
        userMessage:
          "Data has been uploaded successfully. Please check the data."
      });
    }
  );
}; /*-----  End of uploadJsonForOutGoing  ------*/

/****************************************************************
***   addScaleTicketNumber  ***
****************************************************************/
methods.addScaleTicketNumber = async function(req, res) {
  if (req.body._id) {
    let success = await ScaleTicketNumber.findOne({
      ticketNumber: req.body.ticketNumber,
      _id: req.body._id
    });

    if (!success) {
      return SendResponse(res, {
        error: true,
        status: 400,
        userMessage: "Ticket number already exist"
      });
    }

    let data = await ScaleTicketNumber.findByIdAndUpdate(req.body._id, {
      $set: {
        incomingNumber: req.body.incomingNumber,
        outgoingNumber: req.body.outgoingNumber
      }
    });

    return SendResponse(res, {
      data,
      userMessage: "ticket number update successfully."
    });
  } else {
    let success = await ScaleTicketNumber.findOne({
      ticketNumber: req.body.ticketNumber
    });

    if (!success) {
      return SendResponse(res, {
        error: true,
        status: 400,
        userMessage: "Ticket number already exist"
      });
    }

    await new ScaleTicketNumber(req.body).save();

    return SendResponse(res, {
      userMessage: "Scale Ticket number added successfully."
    });
  }
}; /*-----  End of addScaleTicketNumber  ------*/

/****************************************************************
***   getScaleTicketNumber  ***
****************************************************************/
methods.getScaleTicketNumber = async function(req, res) {
  let data = await ScaleTicketNumber.find();

  return SendResponse(res, { data, userMessage: "number list." });
}; /*-----  End of getScaleTicketNumber  ------*/

/**
 * Straight bill of lading pdf for outgoing scale tickets
 * can be generated using this method
 */
methods.generateBillOfLading = async (req, res) => {
  const { id = null } = req.params;
  if (!id) {
    return SendResponse(res, {
      error: true,
      status: 404,
      userMessage: "Invalid scale ticket Id."
    });
  }
  let scale = await Scale.findById(id)
    .populate("analysis.analysisId", "analysisName")
    .populate(
      "commodityId",
      "commodityName commodityAlias commodityShowShipmentAnalysis organic"
    )
    .populate("gradeId", "gradeName")
    .populate("actualFreightBy", "freightCompanyName")
    .populate("buyerId", "businessName addresses")
    .populate("bagId", "bagWeight bagWeightUnit")
    .populate("stuffer", "freightCompanyName addressLine1 addressLine2 postalCode province country")
    .populate("truckingCompany", "truckerName");

  if (!scale) {
    return SendResponse(res, {
      error: true,
      status: 404,
      userMessage: "Invalid scale ticket Id."
    });
  }

  let scales = [scale];
  if (scale.containerId) {
    let otherScales = await Scale.find({_id: {$ne: id}, containerId: scale.containerId})
      .populate("analysis.analysisId", "analysisName")
      .populate(
        "commodityId",
        "commodityName commodityAlias commodityShowShipmentAnalysis organic"
      )
      .populate("gradeId", "gradeName")
      .populate("buyerId", "businessName addresses")
      .populate("bagId", "bagWeight bagWeightUnit")
      .populate("stuffer", "freightCompanyName addressLine1 addressLine2 postalCode province country")
      .populate("truckingCompany", "truckerName")
      .lean();

    scales = [scale, ...otherScales];
  }

  generatePdf.generatePDF("billOfLading", scales, async function(err, pdfUrl) {
    if (err) {
      return SendResponse(res, {
        error: true,
        status: 500,
        errors: err,
        userMessage: "some server error has occurred."
      });
    }

    scale.ladingUpdated = true;
    scale.billOfLadingURL = pdfUrl;
    await scale.save();

    return SendResponse(res, {
      data: scale,
      userMessage: "Bill of lading generated successfully."
    });
  });
};

methods.unlockTicket = async function(req, res) {
  var update = {};
  if (req.body.type == "dockageCompleted") {
    update = { dockageCompleted: false };
  } else if (req.body.type == "analysisCompleted") {
    update = { analysisCompleted: false };
  } else {
    return;
  }

  let success = await Scale.findByIdAndUpdate(
    req.query._id,
    { $set: update },
    { lean: true, new: true }
  );

  if (!success) {
    return SendResponse(res, {
      error: true,
      status: 404,
      userMessage: "Invalid scale ticket Id."
    });
  }

  if (req.body.type == "dockageCompleted") {
    success.scaleId = success._id;
    success.createdBy = req.admin._id;
    delete success._id;
    delete success.createdAt;
    delete success.updatedAt;

    await new scaleHistory(success).save();

    return SendResponse(res, { userMessage: "Success." });
  }

  success.outgoingScaleId = success._id;
  success.createdBy = req.admin._id;
  delete success._id;
  delete success.createdAt;
  delete success.updatedAt;

  await new scaleOutgoingHistory(success).save();

  return SendResponse(res, { userMessage: "Success." });
};

function applyContractChanges(changes, scale, newVoid, oldWeight, newWeight, oldContractNumber) {
  switch (changes) {
    // Only void changed
    case 1:
    case 3:
      methods.updateScaleWeightInContract(
        scale,
        newVoid ? "-" : "+",
        newVoid ? oldWeight : newWeight
      );
      break;

    // Only weight changed
    case 2:
      if (!newVoid) {
        methods.updateScaleWeightInContract(
          scale,
          newWeight > oldWeight ? "+" : "-",
          Math.abs(oldWeight - newWeight)
        );
      }
      break;

    // Only contract changed
    case 4:
      methods.updateScaleWeightInContract(scale, "+", newWeight);
      methods.updateScaleWeightInContract({ date: scale.date, contractNumber: oldContractNumber }, "-", oldWeight);
      break;

    // void and contract changed
    case 5:
      methods.updateScaleWeightInContract(
        newVoid ? { date: scale.date, contractNumber: oldContractNumber } : scale,
        newVoid ? '-' : '+',
        newWeight
      );
      break;

    // void and weight changed
    case 6:
      methods.updateScaleWeightInContract(
        scale,
        newVoid ? '-' : '+',
        newVoid ? oldWeight : newWeight
      );
      break;

    // void, weight and contract contract
    case 7:
      methods.updateScaleWeightInContract(
        newVoid ? { date: scale.date, contractNumber: oldContractNumber } : scale,
        newVoid ? '-' : '+',
        newVoid ? oldWeight : newWeight
      );
      break;
  }
}

async function searchIncomingScales (searchTerms) {
  let query = { $and: [{ status: 0 }] };

  if (searchTerms.ticketType == "Incoming") {
    query.$and.push({ ticketType: "Incoming" });
  }

  if (searchTerms.ticketType == "Outgoing") {
    query.$and.push({ ticketType: "Outgoing" });
    query.$and.push({ contractType: "Sales Contract" });
  }

  if (searchTerms.ticketType == "OutgoingSeed") {
    query.$and.push({ ticketType: "Outgoing" });
    query.$and.push({ contractType: "Production Contract" });
  }

  if (searchTerms.commodity) {
    query.$and.push({ commodityId: searchTerms.commodity });
  }

  if (searchTerms.contractNumber) {
    query.$and.push({
      contractNumber: {
        $regex: ".*" + searchTerms.contractNumber + ".*",
        $options: "i"
      }
    });
  }

  if (searchTerms.ticketNumber) {
    query.$and.push({
      ticketNumber: {
        $regex: ".*" + searchTerms.ticketNumber + ".*",
        $options: "i"
      }
    });
  }

  if (searchTerms.fromDate || searchTerms.toDate) {
    if (searchTerms.fromDate && searchTerms.toDate) {
      query.$and.push({
        date: { $gte: searchTerms.fromDate, $lte: searchTerms.toDate }
      });
    } else if (searchTerms.fromDate) {
      query.$and.push({ date: { $gte: searchTerms.fromDate } });
    } else {
      query.$and.push({ date: { $lte: searchTerms.toDate } });
    }
  }

  if (searchTerms.name && searchTerms.ticketType == "Incoming") {
    var growerCondition = {
      $or: [
        { firstName: { $regex: ".*" + searchTerms.name + ".*", $options: "i" } },
        { lastName: { $regex: ".*" + searchTerms.name + ".*", $options: "i" } },
        { farmName: { $regex: ".*" + searchTerms.name + ".*", $options: "i" } }
      ]
    };

    let grower = await Grower.find(growerCondition);

    if (grower.length > 0) {
      query.$and.push({ growerId: { $in: grower.map(val => val._id) } });
    }
  }

  if (
    searchTerms.name &&
    (searchTerms.ticketType == "Outgoing" || searchTerms.ticketType == "OutgoingSeed")
  ) {
    var buyerCondition = {
      $or: [
        { firstName: { $regex: ".*" + searchTerms.name + ".*", $options: "i" } },
        { lastName: { $regex: ".*" + searchTerms.name + ".*", $options: "i" } },
        { businessName: { $regex: ".*" + searchTerms.name + ".*", $options: "i" } }
      ]
    };

    let buyer = await Buyer.find(buyerCondition);

    if (buyer.length > 0) {
      query.$and.push({ buyerId: { $in: buyer.map(val => val._id) } });
    }
  }

  return await Scale.find(query).populate([
    {
      path:
        "commodityId gradeId growerId analysis.analysisId truckingCompany buyerId analysis.analysisId"
    },
    { path: "truckingCompany" },
    { path: "gradeId" },
    { path: "analysis.analysisId", select: "analysisName" },
    { path: "growerId", select: "firstName lastName farmName email" },
    { path: "binNumber", select: "binName" }
  ]);
}

methods.incomingExcelCGCDownload = async function(req, res) {
  const data = await searchIncomingScales(req.body);

  var newData = data.map(scale => {
    if (scale.displayOnTicket == "Grower Name" && scale.growerId) {
      scale.growerFullName =
        scale.growerId.firstName + " " + scale.growerId.lastName ||
        scale.growerId.farmName;
    } else if (scale.growerId) {
      scale.growerFullName =
        scale.growerId.farmName ||
        scale.growerId.firstName + " " + scale.growerId.lastName;
    } else {
      scale.growerFullName = "";
    }

    const splitMT = (scale.commodityId && ['MFP', 'OMFP', 'KCP', 'OKCP'].includes(scale.commodityId.commodityCode)) ? scale.splitTotalWeight.toFixed(3) : getMTValueOfAnalysis(scale, 'Splits');
    return {
        'Date': moment(scale.date).format('MM/DD/YYYY'),
        'Status': scale.ticketStatus,
        'Name': scale.growerFullName,
        'Ticket Number': 'RI-' + scale.ticketNumber,
        'Gross': scale.grossWeightMT ? +scale.grossWeightMT.toFixed(3) : 0,
        'Tare': scale.tareWeightMT ? +scale.tareWeightMT.toFixed(3) : 0,
        'Net': scale.netTotalWeight ? +scale.netTotalWeight.toFixed(3) : 0,
        'Contrat Number': scale.contractNumber || '',
        'Code': scale.commodityId ? scale.commodityId.commodityCode : '',
        'Dockage MT ': +getMTValueOfAnalysis(scale, 'Dockage'),
        'Splits MT': +splitMT
    };
  });

  res.xls("incoming_cgc_tickets.xlsx", newData);
};

methods.incomingExcelDownload = async function(req, res) {
  const data = await searchIncomingScales(req.body);

  var newData = data.map(scale => {
    if (scale.displayOnTicket == "Grower Name" && scale.growerId) {
      scale.growerFullName =
        scale.growerId.firstName + " " + scale.growerId.lastName ||
        scale.growerId.farmName;
    } else if (scale.growerId) {
      scale.growerFullName =
        scale.growerId.farmName ||
        scale.growerId.firstName + " " + scale.growerId.lastName;
    } else {
      scale.growerFullName = "";
    }

    return {
      Date: moment(scale.date).format("MM/DD/YYYY"),
      Name: scale.growerFullName,
      "Ticket Number": "RI-" + scale.ticketNumber,
      Bin: scale.binNumber ? scale.binNumber.binName : "",
      "Trucking Company": scale.truckingCompany
        ? scale.truckingCompany.truckerName
        : "",
      Gross: scale.grossWeightMT || 0,
      Tare: scale.tareWeightMT || 0,
      Net: scale.netWeight,
      "Contrat Number": scale.contractNumber || "",
      "Buyer Name":
        scale.growerId && scale.growerId.farmName
          ? scale.growerId.farmName
          : "",
      Commodity: scale.commodityId ? scale.commodityId.commodityName : "",
      Grade: scale.gradeId ? scale.gradeId.gradeName : "",
      Code: scale.commodityId ? scale.commodityId.commodityCode : "",
      "Splits MT": getMTValueOfAnalysis(scale, "Splits"),
      "Dockage MT ": getMTValueOfAnalysis(scale, "Dockage"),
      "Created At": moment(scale.createdAt).format("MM/DD/YYYY")
    };
  });

  res.xls("incoming _ticket.xlsx", newData);
};

methods.outgoingExcelDownload = async function(req, res) {
  let query = { $and: [{ status: 0 }] };

  if (req.body.ticketType == "Outgoing") {
    query.$and.push({ ticketType: "Outgoing" });
    query.$and.push({ contractType: "Sales Contract" });
  }

  if (req.body.ticketType == "OutgoingSeed") {
    query.$and.push({ ticketType: "Outgoing" });
    query.$and.push({ contractType: "Production Contract" });
  }

  if (req.body.commodity) {
    query.$and.push({ commodityId: req.body.commodity });
  }

  if (req.body.contractNumber) {
    query.$and.push({
      contractNumber: {
        $regex: ".*" + req.body.contractNumber + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.equipmentType) {
    query.$and.push({ equipmentType: req.body.equipmentType });
  }

  if (req.body.truckingCompany) {
    query.$and.push({ truckingCompany: req.body.truckingCompany });
  }

  if (req.body.freightBy) {
    query.$and.push({
      freightBy: {
        $regex: ".*" + req.body.freightBy + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.ticketNumber) {
    query.$and.push({
      ticketNumber: {
        $regex: ".*" + req.body.ticketNumber + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.fromDate || req.body.toDate) {
    if (req.body.fromDate && req.body.toDate) {
      query.$and.push({
        date: { $gte: req.body.fromDate, $lte: req.body.toDate }
      });
    } else if (req.body.fromDate) {
      query.$and.push({ date: { $gte: req.body.fromDate } });
    } else {
      query.$and.push({ date: { $lte: req.body.toDate } });
    }
  }

  let data;

  if (
    req.body.name &&
    (req.body.ticketType == "Outgoing" || req.body.ticketType == "OutgoingSeed")
  ) {
    var buyerCondition = {
      $or: [
        { firstName: { $regex: ".*" + req.body.name + ".*", $options: "i" } },
        { lastName: { $regex: ".*" + req.body.name + ".*", $options: "i" } },
        { businessName: { $regex: ".*" + req.body.name + ".*", $options: "i" } }
      ]
    };

    let buyer = await Buyer.find(buyerCondition);

    if (buyer.length > 0) {
      query.$and.push({ buyerId: { $in: buyer.map(val => val._id) } });
    }
  }

  data = await Scale.find(query).populate([
    {
      path:
        "commodityId gradeId growerId analysis.analysisId truckingCompany buyerId analysis.analysisId"
    },
    { path: "analysis.analysisId", select: "analysisName" },
    { path: "truckingCompany" },
    { path: "buyerId" , select: "email"},
    { path: "gradeId" },
    { path: "bagId", select: "name category", populate: {path: "category"} },
    { path: "growerId", select: "firstName lastName farmName email" },
    { path: "binNumber", select: "binName" },
    { path: "actualFreightBy", select: "freightCompanyName" },
  ]);

  var newData = data.map(scale => {
    return {
      Date: moment(scale.date).format("MM/DD/YYYY"),
      "Ticket Number": "RO-" + scale.ticketNumber,
      Bin: scale.binNumber ? scale.binNumber.binName : "",
      "Trucking Company": scale.truckingCompany
        ? scale.truckingCompany.truckerName
        : "",
      Gross: scale.grossWeightMT || 0,
      Tare: scale.tareWeightMT || 0,
      Net: scale.unloadWeidhtMT,
      "Contrat Number": scale.contractNumber || "",
      "Buyer Name":
        scale.buyerId && scale.buyerId.businessName
          ? scale.buyerId.businessName
          : "",
      Commodity: scale.commodityId ? scale.commodityId.commodityName : "",
      Grade: scale.gradeId ? scale.gradeId.gradeName : "",
      Code: scale.commodityId ? scale.commodityId.commodityCode : "",
      "Equipment Type": scale.equipmentType,
      "Freight By": scale.freightBy,
      "Xero Invoice": scale.invoiceNumber,
      "Actual Freight By": scale.actualFreightBy ? scale.actualFreightBy.freightCompanyName : '',
      "Bag": scale.bagId ? scale.bagId.name : "",
      "Bag Category": scale.bagId && scale.bagId.category ? scale.bagId.category.name : "",
      "Created At": moment(scale.createdAt).format("MM/DD/YYYY")
    };
  });
  //console.log(newData);
  res.xls("outgoing_ticket.xlsx", newData);
};

const getMTValueOfAnalysis = (scaleTicket, analysisKey) => {
  var weight = 0;
  scaleTicket.analysis.filter(anal => {
    if (anal.analysisId.analysisName == analysisKey) {
      weight = anal.weightMT ? anal.weightMT : 0;
    }
  });
  return weight.toFixed(3);
};

methods.freightVarianceExcelDownload = async function(req, res) {
  let query = { $and: [{ status: 0, ticketType: 'Outgoing' }] };

  if (req.body.contractNumber) {
    query.$and.push({
      contractNumber: {
        $regex: ".*" + req.body.contractNumber + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.fromDate || req.body.toDate) {
    if (req.body.fromDate && req.body.toDate) {
      query.$and.push({
        date: { $gte: req.body.fromDate, $lte: req.body.toDate }
      });
    } else if (req.body.fromDate) {
      query.$and.push({ date: { $gte: req.body.fromDate } });
    } else {
      query.$and.push({ date: { $lte: req.body.toDate } });
    }
  }

  const data = await Scale.find(query).populate([
    { path: "gradeId", select: "gradeName" },
    { path: "binNumber", select: "binName" },
    { path: "truckingCompany", select: "truckerName" },
    { path: "buyerId", select: "businessName firstName lastName" },
    { path: "commodityId", select: "commodityName commodityCode" },
    { path: "sales_contract", select: "inlineFreightCWT oceanFreightBL exchangeRate"}
  ]);

  var newData = data.map(scale => {
    scale.sales_contract = scale.sales_contract || {};

    scale.budgeted_inland = scale.sales_contract.inlineFreightCWT * 22.0462 * scale.unloadWeidhtMT || null;
    scale.budgeted_inland_adj_cad = scale.sales_contract.oceanFreightBL * scale.sales_contract.exchangeRate || null;
    scale.budgeted_inland_total_cad = (+scale.budgeted_inland + +scale.budgeted_inland_adj_cad) || null;

    scale.actual = scale.actual || {};
    scale.actual.usd_cad_stamp_fx = (scale.actual.oceanUSD * scale.sales_contract.exchangeRate) || null;
    scale.actual.total_cad_actual = (+scale.actual.inland + +scale.actual.usd_cad_stamp_fx + +scale.actual.miscFreightCharge) || null;
    scale.freightVariance = (scale.actual.inland && scale.actual.oceanUSD && scale.actual.miscFreightCharge) ? (scale.actual.total_cad_actual - scale.budgeted_inland_total_cad) : 0;

    let buyerName = scale.buyerId
      ? (scale.buyerId.businessName || (`${scale.buyerId.firstName} ${scale.buyerId.lastName}`))
      : "";
    return {
      Date: moment(scale.date).format("MM/DD/YYYY"),
      "Ticket Number": "RO-" + scale.ticketNumber,
      Bin: scale.binNumber ? scale.binNumber.binName : "",
      "Trucking Company": scale.truckingCompany
        ? scale.truckingCompany.truckerName
        : "",
      Gross: scale.grossWeightMT || 0,
      Tare: scale.tareWeightMT || 0,
      Net: scale.unloadWeidhtMT,
      "Contrat Number": scale.contractNumber || "",
      "Buyer Name": buyerName,
      Commodity: scale.commodityId ? scale.commodityId.commodityName : "",
      Grade: scale.gradeId ? scale.gradeId.gradeName : "",
      Code: scale.commodityId ? scale.commodityId.commodityCode : "",
      "Equipment Type": scale.equipmentType,
      "Freight By": scale.freightBy,
      "Budgeted Inland (CAD Stamp)": scale.budgeted_inland,
      "Budgeted Ocean USD": scale.sales_contract.oceanFreightBL,
      "Budgeted Adj CAD at Stamp fx": scale.budgeted_inland_adj_cad,
      "Budgeted Total CAD": scale.budgeted_inland_total_cad,
      "Actual Freight Inland": scale.actual.inland,
      "Actual Ocean USD": scale.actual.oceanUSD,
      "Actual Ocean USD to CAD Stamp fx": scale.actual.usd_cad_stamp_fx,
      "Actual total misc freight": scale.actual.miscFreightCharge,
      "Actual total CAD": scale.actual.total_cad_actual,
      "Freight Variance": scale.freightVariance,
    };
  });
  //console.log(newData);
  res.xls("freight-variance.xlsx", newData);
};

async function freightVarianceData (params) {
  let query = { $and: [{ status: 0, ticketType: 'Outgoing'}] };
  let limit = 0;

  if (params.contractNumber) {
    query.$and.push({
      contractNumber: {
        $regex: ".*" + params.contractNumber + ".*",
        $options: "i"
      }
    });
  }

  if (params.fromDate || params.toDate) {
    if (params.fromDate && params.toDate) {
      query.$and.push({
        date: { $gte: params.fromDate, $lte: params.toDate }
      });
      limit = 2000;
    } else if (params.fromDate) {
      query.$and.push({ date: { $gte: params.fromDate } });
    } else {
      query.$and.push({ date: { $lte: params.toDate } });
    }
  }

  const options = {
    sort: { ticketNumber: -1 },
    page: Number(params.page) || 1,
    limit: limit || Number(params.limit) || 10,
    populate: [
      {
        path:
          "commodityId gradeId truckingCompany"
      },
      { path: "analysis.analysisId", select: "analysisName" },
      { path: "buyerId", select: "businessName firstName lastName email" },
      { path: "binNumber", select: "binName" },
      { path: "actualFreightBy", select: "freightCompanyName" },
      { path: "sales_contract", select: "inlineFreightCWT oceanFreightBL exchangeRate"}
    ],
    lean: true
  };

  return await Scale.paginate(query, options);
}

methods.updateFreightVarianceData = async function(req, res) {
  if (!req.body.ticketId) {
    return SendResponse(res, { error: true, status: 422, userMessage: 'Invalid ticketId'});
  }

  await Scale.findByIdAndUpdate(req.body.ticketId, {$set: {actual: req.body.actual}}, {new: true});
  return SendResponse(res, {userMessage: 'Ticket freight variance data updated successfully.'});
};

methods.freightVariances = async function(req, res) {
  const data = await freightVarianceData(req.query);

  return SendResponse(res, { data, userMessage: "scale list." });
};

/****************************************************************
***   serach scale ticket  ***
****************************************************************/
methods.searchScaleTicket = async function(req, res) {

  let query = { $and: [{ status: 0 }] };

  if (req.body.ticketType == "Incoming") {
    query.$and.push({ ticketType: "Incoming" });
  }

  if ("unvoided" in req.body) {
    query.$and.push({ void: { $ne: true } });
  }

  if (req.body.ticketType == "Outgoing") {
    query.$and.push({ ticketType: "Outgoing" });
    query.$and.push({ contractType: "Sales Contract" });

    if (req.body.bagType && req.body.bagType === '!Bulk') {
      const bags = await Bag.find({bulkBag: 'Bulk'}, {_id: 1}).lean();
      query.$and.push({bagId: {$nin: bags.map(bag => bag._id)}});
    }

    if (req.body.actualFreightBy) {
      query.$and.push({actualFreightBy: req.body.actualFreightBy});
    }
  }
  //Outgoing Seed 
  if (req.body.ticketType == "OutgoingSeed") {
    query.$and.push({ ticketType: "Outgoing" });
    query.$and.push({ contractType: "Production Contract" });
  }

  if (req.body.commodity) {
    query.$and.push({ commodityId: req.body.commodity });
  }

  if (req.body.contractNumber) {
    query.$and.push({
      contractNumber: {
        $regex: ".*" + req.body.contractNumber + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.equipmentType) {
    query.$and.push({ equipmentType: req.body.equipmentType });
  }

  if (req.body.truckingCompany) {
    query.$and.push({ truckingCompany: req.body.truckingCompany });
  }

  if (req.body.freightBy) {
    query.$and.push({
      freightBy: {
        $regex: ".*" + req.body.freightBy + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.ticketNumber) {
    query.$and.push({
      ticketNumber: {
        $regex: ".*" + req.body.ticketNumber + ".*",
        $options: "i"
      }
    });
  }

  if (req.body.fromDate || req.body.toDate) {
    if (req.body.fromDate && req.body.toDate) {
      query.$and.push({
        date: { $gte: req.body.fromDate, $lte: req.body.toDate }
      });
    } else if (req.body.fromDate) {
      query.$and.push({ date: { $gte: req.body.fromDate } });
    } else {
      query.$and.push({ date: { $lte: req.body.toDate } });
    }
  }

  var options = {
    sort: { ticketNumber: -1 },
    page: Number(req.query.page) || 1,
    limit: Number(req.body.limit) || 10,
    populate: [
      {
        path:
          "commodityId gradeId growerId analysis.analysisId truckingCompany buyerId"
      },
      { path: "analysis.analysisId", select: "analysisName" },
      { path: "growerId", select: "firstName lastName farmName email" },
      { path: "buyerId", select: "firstName lastName email businessName" },
      { path: "binNumber", select: "binName" },
      { path: "actualFreightBy", select: "freightCompanyName" },
    ],
    lean: true
  };

  if (req.body.name && req.body.ticketType == "Incoming") {
    var gbCondition = {
      $or: [
        { firstName: { $regex: ".*" + req.body.name + ".*", $options: "i" } },
        { lastName: { $regex: ".*" + req.body.name + ".*", $options: "i" } },
        { email: { $regex: ".*" + req.body.name + ".*", $options: "i" } }
      ]
    };

    let Entity = null;
    let fieldName = '';
    if (req.body.tGB) {
      Entity = Grower;
      fieldName = 'growerId';
      gbCondition.$or.push({ farmName: { $regex: ".*" + req.body.name + ".*", $options: "i" } });
    } else {
      Entity = Buyer;
      fieldName = 'buyerId';
      gbCondition.$or.push({ businessName: { $regex: ".*" + req.body.name + ".*", $options: "i" }});
    }

    let entities = await Entity.find(gbCondition);

    if (entities.length > 0) {
      query.$and.push({ [fieldName]: { $in: entities.map(val => val._id) } });
    }

    let data = await Scale.paginate(query, options);

    return SendResponse(res, { data, userMessage: "scale list." });
  }

  const {fetchExtra} = req.body;
  if (fetchExtra) {
    for(let key in fetchExtra) {
      options.populate.push({ path: key, select: fetchExtra[key]});
    }
  }

  if (
    req.body.name &&
    (req.body.ticketType == "Outgoing" || req.body.ticketType == "OutgoingSeed")
  ) {
    var buyerCondition = {
      $or: [
        { firstName: { $regex: ".*" + req.body.name + ".*", $options: "i" } },
        { lastName: { $regex: ".*" + req.body.name + ".*", $options: "i" } },
        { businessName: { $regex: ".*" + req.body.name + ".*", $options: "i" } }
        // { email: { $regex: ".*" + req.body.name + ".*", $options: "i" }}
      ]
    };

    let buyer = await Buyer.find(buyerCondition);

    if (buyer.length > 0) {
      query.$and.push({ buyerId: { $in: buyer.map(val => val._id) } });
    }

    let data = await Scale.paginate(query, options);

    return SendResponse(res, { data, userMessage: "scale list." });
  }

  let data = await Scale.paginate(query, options);

  return SendResponse(res, { data, userMessage: "scale list." });
}; /*-----  End of searchScaleTicket  ------*/

/***************************************************************
***   generateScaleTicket  ***
***************************************************************/
methods.generateScaleTicket = async function(req, res) {
  let doAction = false;

  if (["Incoming", "Outgoing"].includes(req.query.type)) {
    req.body.ticketType = req.query.type;
    doAction = true;
  }

  if (doAction) {
    const fieldName = req.query.type == "Incoming" ? 'incomingNumber' : 'outgoingNumber';

    const ticket = await ScaleTicketNumber.findOneAndUpdate(
      { },
      { $inc: {[fieldName]: 1} },
      { new: true }
    );

    req.body.ticketNumber = ticket[fieldName];
    let scale = await new Scale(req.body).save();

    return SendResponse(res, {
      data: scale,
      userMessage: "Scale ticket created successfully."
    });
  }
  return SendResponse(res, {
    status: 400, error: true,
    userMessage: "Scale ticket not created."
  });
}; /*-----  End of generateScaleTicket  ------*/

/****************************************************************
***   getScaleTicketList  ***
****************************************************************/
methods.getScaleTicketList = async function(req, res) {
  let data = await ScaleTicketNumber.findOne();

  return SendResponse(res, { data, userMessage: "Ticket Number." });
}; /*-----  End of getScaleTicketList  ------*/

methods.splitTicketRemove = async function(req, res) {
  const data = await Scale.findByIdAndUpdate(
    req.params.ticketId,
    { $unset: { splits: "", isSplitTicket: "", splitBy: "" } },
    { new: true }
  );
  return SendResponse(res, {
    data,
    userMessage: "Ticket splits deleted successfully."
  });
};

methods.splitTicket = async function(req, res) {
  const data = await Scale.findByIdAndUpdate(
    req.body.ticketId,
    {
      $set: {
        splits: req.body.data,
        isSplitTicket: true,
        splitBy: req.admin._id,
        dockageCompleted: true
      }
    },
    { new: true }
  );
  return SendResponse(res, {
    data,
    userMessage: "Ticket splited successfully."
  });
};

methods.splittOutgoingTicket = async function(req, res) {
  const data = await Scale.findByIdAndUpdate(
    req.body.ticketId,
    {
      $set: {
        splits: req.body.data,
        isSplitTicket: true,
        splitBy: req.admin._id
      }
    },
    { new: true }
  );
  return SendResponse(res, {
    data,
    userMessage: "Ticket splited successfully."
  });
};

methods.getSplittTicket = async function(req, res) {
  let data = await Scale.find({ refTicketId: req.query.ticketId })
    .select(
      "analysis delGrade moisture grossWeight grossWeightMT tareWeight tareWeightMT unloadWeidht unloadWeidhtMT commodityId growerId contractNumber splitBy splitValue"
    )
    .populate("analysis.analysisId", "analysisName");

  return SendResponse(res, { data, userMessage: "List" });
};

methods.getOutgoingSplittTicket = async function(req, res) {
  let data = await Scale.find({ refTicketId: req.query.ticketId })
    .select(
      "grossWeight grossWeightMT tareWeight tareWeightMT unloadWeidht unloadWeidhtMT commodityId buyerId contractNumber splitBy splitValue"
    )
    .populate("analysis.analysisId", "analysisName");

  return SendResponse(res, { data, userMessage: "List" });
};

/***************************************************************
***   Add New Scale  ***
***************************************************************/
methods.addScale = async function(req, res) {
  //Check for POST request errors.
  if (req.body.ticketType == "Outgoing") {
    req.checkBody("tareWeight", "Tare Weight is required.").notEmpty();
  } else {
    req.checkBody("binNumber", "Bin number is required.").notEmpty();
    req.checkBody("grossWeight", "Gross Weight is required.").notEmpty();
  }

  var errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }

  if (req.body.ticketId) {
    let scale = await Scale
      .findOne({ _id: req.body.ticketId, status: 0 })
      .populate("bagId", "bagWeight bulkBag bagWeightUnit");

    const { void: oldVoid } = scale;
    const oldNetWeight = getScaleWeight(scale);

    if (!scale) {
      return SendResponse(res, {
        error: true,
        status: 400,
        userMessage: "No recard found."
      });
    }

    const containers = {
      idOld: scale.containerId,
      old: scale.containeNumber,
      voidOld: scale.void,
      releaseOld: scale.releaseContainer
    };

    const data =
      req.body.ticketType == "Outgoing"
        ? Object.assign(req.body, { ladingUpdated: false })
        : req.body;
    scale = Scale
      .findByIdAndUpdate(req.body.ticketId, data, { new: true })
      .populate("bagId", "bagWeight bulkBag bagWeightUnit");

    await manageBagInventory(scale, false);
    //del qty check this function
    const { void: newVoid } = scale;
    const newNetWeight = getScaleWeight(scale);

    const weight_changed = newNetWeight != oldNetWeight;
    const void_changed = newVoid != oldVoid;
    // skip subtract del qty ig outgoing and production contract
    // const skipeDelQtyCalC = scale.ticketType == 'Outgoing' && scale.contractType == 'Production Contract';


    // if (void_changed && !skipeDelQtyCalC) {
      if (void_changed ) {

      methods.updateScaleWeightInContract(
        scale,
        newVoid ? "-" : "+",
        newVoid ? oldNetWeight : newNetWeight
      );
    // } else if (weight_changed && !newVoid && !skipeDelQtyCalC) {
    } else if (weight_changed && !newVoid ) {

      methods.updateScaleWeightInContract(  
        scale,
        newNetWeight > oldNetWeight ? "+" : "-",
        Math.abs(oldNetWeight - newNetWeight)
      );
    }
    if (req.body.ticketType === 'Outgoing') {
      containers.idNew = scale.containerId;
      containers.new = scale.containeNumber;
      containers.voidNew = scale.void;
      containers.releaseNew = scale.releaseContainer;
      containers.contractNumber = scale.contractNumber;
      let cIDates = await updateContainerInventory(scale.exitTime, containers);
      if (cIDates && cIDates.old != cIDates.new) {
        scale.containerIncomingDate = cIDates.new;
        await scale.save();
      }
    }

    if (req.body.receiptType == "Void") {
      return SendResponse(res, {
        data: scale,
        userMessage: "Scale add successfully."
      });
    }

    return SendResponse(res, {
      data: scale,
      userMessage: "Scale add successfully."
    });
  }

  const existingScale = await Scale.findOne({ticketNumber: req.body.ticketNumber});
  if (existingScale) {
    return SendResponse(res, {
      status: 400, error: true,
      userMessage: 'Ticket with given number is already exists in database'
    });
  }

  var scale = await new Scale(req.body).save();
  const scaleWeight = getScaleWeight(scale);
  
  const skipeDelQtyCalC = scale.ticketType == 'Outgoing' && scale.contractType == 'Production Contract';

  // update netweight in contract
  if (scaleWeight > 0 && !scale.void && scale.status == 0 && !skipeDelQtyCalC) {
    methods.updateScaleWeightInContract(scale, "+", scaleWeight);
  }

  if (req.body.ticketType == "Incoming") {
    let obj = { $set: { incomingNumber: req.body.ticketNumber } };
    await ScaleTicketNumber.findOneAndUpdate({}, obj);

    scale = await Scale.findById(scale._id)
      .populate("binNumber", "binName")
      .populate("gradeId", "gradeName")
      .populate("analysis.analysisId", "analysisName")
      .populate(
        "commodityId",
        "commodityName commodityShowDeliveryAnalysis commodityTypeId "
      )
      .populate("growerId", "firstName lastName farmName addresses")
      .populate("buyerId", "firstName lastName businessName addresses email")
      .lean();

    generatePdf.generatePDF("incomingScaleTicket", scale, async function(
      err,
      pdfUrl
    ) {
      if (err) {
        return SendResponse(res, {
          error: true,
          status: 500,
          errors: err,
          userMessage: "some server error has occurred."
        });
      }

      let scales = await Scale.findByIdAndUpdate(
        scale._id,
        { $set: { pdfUrl, updatePdf: false } },
        { new: true, lean: true }
      );

      scales.scaleId = scales._id;
      scales.createdBy = req.admin._id;
      const data = Object.assign({}, scales);
      delete scales._id;
      delete scales.createdAt;
      delete scales.updatedAt;

      await new scaleHistory(scales).save();

      return SendResponse(res, {
        data,
        userMessage: "Scale updated successfully."
      });
    });
  } else if (req.body.ticketType == "Outgoing") {
    var obj = { $set: { outgoingNumber: req.body.ticketNumber } };
    await ScaleTicketNumber.findOneAndUpdate({}, obj);

    scale = await Scale.findById(scale._id)
      .populate("analysis.analysisId", "analysisName")
      .populate(
        "commodityId",
        "commodityName commodityShowShipmentAnalysis commodityTypeId buyerId.addresses"
      )
      .populate("buyerId", "businessName addresses email street");

    const containers = {
      idOld: scale.containerId,
      old: scale.containeNumber,
      voidOld: true,
      releaseOld: scale.releaseContainer,
      contractNumber: scale.contractNumber,
    };

    containers.idNew = scale.containerId;
    containers.new = scale.containeNumber;
    containers.voidNew = scale.void;
    containers.releaseNew = scale.releaseContainer;

    await manageBagInventory(scale, true);
    let cIDates = await updateContainerInventory(scale.exitTime, containers);
    if (cIDates && cIDates.old != cIDates.new) {
      scale.containerIncomingDate = cIDates.new;
      await scale.save();
    }

    generatePdf.generatePDF("outgoingScaleTicket", scale, async function(
      err,
      pdfUrl
    ) {
      if (err) {
        return SendResponse(res, {
          userMessage: "some server error has occurred.",
          error: true,
          status: 500,
          errors: err
        });
      }
      let scales = await Scale.findByIdAndUpdate(
        scale._id,
        { $set: { pdfUrl, updatePdf: false } },
        { new: true, lean: true }
      );

      scales.outgoingScaleId = scales._id;
      scales.createdBy = req.admin._id;
      const data = Object.assign({}, scales);
      delete scales._id;
      delete scales.createdAt;
      delete scales.updatedAt;

      await new scaleOutgoingHistory(scales).save();

      return SendResponse(res, {
        data,
        userMessage: "Scale updated successfully."
      });
    });
  } else {
    return SendResponse(res, { userMessage: "Scale updated successfully." });
  }
}; /*-----  End of addScale  ------*/

async function updateContainerInventory (date, containers) {
  const isReleaseSame = containers.releaseOld == containers.releaseNew;
  const isVoidSame = containers.voidOld == containers.voidNew;
  const isContainerSame = (containers.idOld && containers.idOld.toString()) == (containers.idNew && containers.idNew.toString());

  if (!date) {
    return;
  }

  if (isVoidSame && containers.voidNew) return;

  const dates = {
    old: null,
    new: null,
  };

  if (!containers.voidNew && containers.idNew && containers.releaseNew) {
    let newCI = await ContainerInventory.findOneAndUpdate(
      {_id: containers.idNew},
      {$set: {outgoingDate: date, released: true, contractNumber: containers.contractNumber}},
      {new: true}
    );
    dates.new = newCI ? newCI.incomingDate : null;
  }

  // if there is no container number before or after
  if (isContainerSame && !containers.new) return dates;

  // if container and release is same and old was void || container was not released before or after
  if ((isReleaseSame && ((isContainerSame && containers.voidOld) || !containers.releaseNew))) return dates;

  if (!containers.voidOld && containers.releaseOld) {
    let condition = null;

    if (containers.idOld) {
      condition = {_id: containers.idOld};
    } else if (containers.contractNumber && containers.old) {
      condition = { contractNumber: containers.contractNumber, containerNumber: containers.old };
    }

    let oldCI = await ContainerInventory.findOneAndUpdate(
      condition,
      {$set: {outgoingDate: null, released: false, contractNumber: null}},
      {new: true}
    );
    dates.old = oldCI ? oldCI.incomingDate : null;
  }

  return dates;
}

/****************************************************************
***   Get All Scale List  ***
****************************************************************/
methods.getScale = async function(req, res) {
  let scale, condition, options;
  var limit = 5;
  if (req.query.limit && req.query.limit != undefined) {
    limit = Number(req.query.limit);
  }

  if (req.query.growerId) {
    condition = {
      growerId: req.query.growerId,
      status: 0,
      ticketType: "Incoming"
    };
    scale = await Scale.find(condition)
      .populate(
        "commodityId gradeId growerId analysis.analysisId truckingCompany buyerId buyerId.email buyerId.firstName buyerId.lastName buyerId.businessName buyerId.addresses.street"
      )
      .sort({ ticketNumber: -1 })
      .lean();
  } else if (req.query.ticketNumber) {
    condition = { _id: req.query.ticketNumber, status: 0 };
    scale = await Scale.findOne(condition)
      .populate(
        "commodityId gradeId growerId analysis.analysisId truckingCompany buyerId buyerId.email buyerId.firstName buyerId.lastName buyerId.businessName buyerId.addresses.street"
      )
      .populate("binNumber", "binName")
      .populate("refTicketId", "ticketNumber")
      .populate("buyerId", "firstName lastName email businessName addresses.street")
      .lean();
  } else if (!req.query.type) {
    options = {
      sort: { ticketNumber: -1 },
      page: req.query.page,
      limit: limit,
      populate:
        "commodityId gradeId growerId analysis.analysisId truckingCompany buyerId buyerId.email buyerId.firstName buyerId.lastName buyerId.businessName buyerId.addresses.street",
      lean: true
    };
    condition = { status: 0, tareWeight: 0 };
    scale = await Scale.paginate(condition, options);
  } else if (
    req.query.page &&
    req.query.type &&
    req.query.limit &&
    req.query.buyerId
  ) {
    options = {
      sort: { ticketNumber: -1 },
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      populate:
        "commodityId gradeId growerId analysis.analysisId truckingCompany buyerId buyerId.email buyerId.firstName buyerId.lastName buyerId.businessName buyerId.addresses.street",
      lean: true
    };
    condition = {
      status: 0,
      ticketType: req.query.type,
      buyerId: req.query.buyerId
    };
    scale = await Scale.paginate(condition, options);
  } else {
    options = {
      sort: { ticketNumber: -1 },
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      populate:
        "commodityId gradeId growerId analysis.analysisId truckingCompany buyerId buyerId.email buyerId.firstName buyerId.lastName buyerId.businessName buyerId.addresses.street",
      lean: true
    };
    condition = { status: 0, ticketType: req.query.type };
    scale = await Scale.paginate(condition, options);
  }

  return SendResponse(res, { data: scale, userMessage: "scale list." });
}; /*-----  End of getScale  ------*/

function getScaleWeight(scale) {
  if (scale.ticketType !== "Outgoing") {
    return scale.netWeight;
  }

  if (scale.invoicedWeight) {
    return scale.invoicedWeight;
  }

  if (scale.bagId && scale.bagId.bulkBag !== 'Bulk' && scale.numberOfBags) {
    let factor = 1;
    switch(scale.bagId.bagWeightUnit) {
      case 'MT':
        factor = 1000;
        break;
      case 'LBS':
        factor = 1 / 2.2046;
        break;
    }
    return scale.numberOfBags * scale.bagId.bagWeight * factor;
  }
  return scale.unloadWeidht;
}

/****************************************************************
***   Update scale  ***
****************************************************************/
methods.updateScale = async function(req, res) {
  //Check for POST request errors.
  if (req.body.ticketType !== "Outgoing") {
    req.checkBody("binNumber", "Bin number is required.").notEmpty();
  }

  var errors = req.validationErrors(true);
  if (errors) {
    return SendResponse(res, {
      error: true,
      status: 400,
      errors,
      userMessage: "Validation errors"
    });
  }

  if (req.body.ticketType == "Outgoing") {
    req.body.ladingUpdated = false;
  }
  let scale = await Scale.findOne({ _id: req.body.ticketId || req.body._id })
    .populate('bagId', "bagWeight bulkBag bagWeightUnit");

  const containers = {
    idOld: scale.containerId,
    old: scale.containeNumber,
    voidOld: scale.void,
    releaseOld: scale.releaseContainer
  };

  const { void: oldVoid, contractNumber: oldContractNumber } = scale;
  const oldNetWeight = getScaleWeight(scale);

  scale = await Scale.findByIdAndUpdate(
    { _id: req.body.ticketId || req.body._id },
    req.body,
    { new: true }
  )
    .populate("binNumber", "binName")
    .populate("gradeId", "gradeName")
    .populate("analysis.analysisId", "analysisName")
    .populate(
      "commodityId",
      "commodityName commodityShowDeliveryAnalysis commodityShowShipmentAnalysis commodityTypeId"
    )
    .populate("growerId", "firstName lastName farmName addresses")
    .populate("buyerId", "businessName addresses email")
    .populate("bagId", "bagWeight bulkBag bagWeightUnit");

  if (!scale) {
    return SendResponse(res, {
      userMessage: "scale details not found.",
      error: true,
      status: 400
    });
  }

  await manageBagInventory(scale, false);

  const { void: newVoid, contractNumber: newContractNumber } = scale;
  const newNetWeight = getScaleWeight(scale);

  const void_changed = newVoid != oldVoid ? 1 : 0;
  const weight_changed = newNetWeight != oldNetWeight ? 2 : 0;
  const contract_changed = newContractNumber != oldContractNumber ? 4 : 0;
  const changes = void_changed + weight_changed + contract_changed;
  const skipDelQtyCalC = scale.ticketType == 'Outgoing' && scale.contractType == 'Production Contract';

  if (!skipDelQtyCalC) {
    switch (changes) {
      // Only void changed
      case 1:
      case 3:
        methods.updateScaleWeightInContract(
          scale,
          newVoid ? "-" : "+",
          newVoid ? oldNetWeight : newNetWeight
        );
        break;
  
      // Only weight changed
      case 2:
        if (!newVoid) {
          methods.updateScaleWeightInContract(
            scale,
            newNetWeight > oldNetWeight ? "+" : "-",
            Math.abs(oldNetWeight - newNetWeight)
          );
        }
        break;
  
      // Only contract changed
      case 4:
        methods.updateScaleWeightInContract(scale, "+", newNetWeight);
        methods.updateScaleWeightInContract({date: scale.date, contractNumber: oldContractNumber}, "-", oldNetWeight);
        break;
  
      // void and contract changed
      case 5:
        methods.updateScaleWeightInContract(
          newVoid ? {date: scale.date, contractNumber: oldContractNumber} : scale,
          newVoid ? '-' : '+',
          newNetWeight
        );
        break;
  
      // void and weight changed
      case 6:
        methods.updateScaleWeightInContract(
          scale,
          newVoid ? '-' : '+',
          newVoid ? oldNetWeight : newNetWeight
        );
        break;
  
      // void, weight and contract contract
      case 7:
        methods.updateScaleWeightInContract(
          newVoid ? {date: scale.date, contractNumber: oldContractNumber} : scale,
          newVoid ? '-' : '+',
          newVoid ? oldNetWeight : newNetWeight
        );
        break;
    }
  }

  if (
    (req.body.someFieldValueChanged || "someFieldValueChanged" in req.body) &&
    req.body.ticketType == "Incoming"
  ) {
    generatePdf.generatePDF("incomingScaleTicket", scale, async function(
      err,
      pdfUrl
    ) {
      if (err) {
        return SendResponse(res, {
          error: true,
          status: 500,
          errors: err,
          userMessage: "some server error has occurred."
        });
      }

      let scales = await Scale.findByIdAndUpdate(
        scale._id,
        { $set: { pdfUrl, updatePdf: false } },
        { new: true, lean: true }
      );

      scales.scaleId = scales._id;
      scales.createdBy = req.admin._id;
      delete scales._id;
      delete scales.createdAt;
      delete scales.updatedAt;

      if (req.body.someFieldValueChanged) {
        await new scaleHistory(scales).save();
        return SendResponse(res, {
          userMessage: "Scale updated successfully."
        });
      }

      return SendResponse(res, { userMessage: "Scale updated successfully." });
    });
  } else if (
    ("someFieldValueChangedInOutgoingSeed" in req.body ||
      "someFieldValueChangedInOutgoing" in req.body) &&
    req.body.ticketType == "Outgoing"
  ) {
    containers.idNew = scale.containerId;
    containers.new = scale.containeNumber;
    containers.voidNew = scale.void;
    containers.releaseNew = scale.releaseContainer;
    containers.contractNumber = scale.contractNumber;

    let cIDates = await updateContainerInventory(scale.exitTime, containers);
    if (cIDates && cIDates.old != cIDates.new) {
      scale.containerIncomingDate = cIDates.new;
      await scale.save();
    }
    let template = "someFieldValueChangedInOutgoing" in req.body ? "outgoingScaleTicket" : "outgoingSeedScaleTicket";
    generatePdf.generatePDF(template, scale, async function(
      err,
      pdfUrl
    ) {
      if (err) {
        return SendResponse(res, {
          error: true,
          status: 500,
          errors: err,
          userMessage: "some server error has occurred."
        });
      }

      let scales = await Scale.findByIdAndUpdate(
        scale._id,
        { $set: { pdfUrl, updatePdf: false } },
        { new: true, lean: true }
      );

      scales.outgoingScaleId = scales._id;
      scales.createdBy = req.admin._id;
      delete scales._id;
      delete scales.createdAt;
      delete scales.updatedAt;

      if (req.body.someFieldValueChangedInOutgoing) {
        await new scaleOutgoingHistory(scales).save();

        return SendResponse(res, {
          userMessage: "Scale updated successfully."
        });
      }

      return SendResponse(res, { userMessage: "Scale updated successfully." });
    });
  } else {
    return SendResponse(res, { userMessage: "Scale updated successfully." });
  }
}; /*-----  End of updateScale  ------*/

/****************************************************************
***   remove scale  ***
****************************************************************/
methods.removeScale = async function(req, res) {
  let data = await Scale.update(
    { _id: { $in: req.body.idsArray } },
    { $set: { status: 1 } },
    { multi: true }
  );

  if (data.nModified > 0) {
    let scale = await Scale.findOne({
      _id: { $in: req.body.idsArray }
    })
    .populate("bagId", "bagWeight bulkBag bagWeightUnit")
    .project("contractNumber date netWeight bagId");

    const newNetWeight = getScaleWeight(scale);

    if (newNetWeight > 0) {
      await methods.updateScaleWeightInContract(scale, "-", newNetWeight);
    }
  }

  return SendResponse(res, { data, userMessage: "Scale deleted." });
}; /*-----  End of removeEquipment  ------*/

/**-------------------getOutgoingSeed Scale add production contract */
methods.getOutgoingSeedScale = async function(req, res) {
  let data = await Scale.find({
    growerId: req.query.growerId,
    status: 0,
    contractType: "Production Contract"
  })
    .populate("commodityId", "commodityName")
    .sort("-createdAt");

  return SendResponse(res, { data, userMessage: "data found." });
};

methods.getLatestIncomingTicket = async (req, res) => {
  let data = await Scale.find({ status: 0, ticketType: "Incoming" })
    .select("date ticketNumber commodityId contractNumber netWeight")
    .populate("commodityId", "commodityName")
    .sort("-date")
    .limit(10);

  return SendResponse(res, { data, userMessage: "success" });
};
/**outgoing sales contract data */
methods.getLatestOutgoingTicket = async (req, res) => {
  let data = await Scale.find({
    status: 0,
    ticketType: "Outgoing",
    contractType: "Sales Contract"
  })
    .select("date ticketNumber commodityId contractNumber unloadWeidht")
    .populate("commodityId", "commodityName")
    .sort("-date")
    .limit(10);

  return SendResponse(res, { data, userMessage: "success" });
};
/**export xsls sacle data */
methods.exportAll = async function(req, res) {
  req.checkBody("ticketType", "ticketType is required.").notEmpty();
  req.checkBody("fileName", "fileName code is required.").notEmpty();
  var errors = req.validationErrors(true);

  if (errors) {
    return SendResponse(res, {
      userMessage: "Validation errors",
      errors,
      status: 400,
      error: true
    });
  }

  let query = { $and: [{ status: 0 }, { ticketType: req.body.ticketType }] };

  var newData;

  if (req.body.ticketType && req.body.filter) {
    if (req.body.filterBy.commodity) {
      query.$and.push({ commodityId: req.body.filterBy.commodity });
    }

    if (req.body.filterBy.fromDate || req.body.filterBy.toDate) {
      if (req.body.filterBy.fromDate && req.body.filterBy.toDate) {
        query.$and.push({
          date: {
            $gte: req.body.filterBy.fromDate,
            $lte: req.body.filterBy.toDate
          }
        });
      } else if (req.body.filterBy.fromDate) {
        query.$and.push({ date: { $gte: req.body.filterBy.fromDate } });
      } else {
        query.$and.push({ date: { $lte: req.body.filterBy.toDate } });
      }
    }

  if (req.body.filterBy.equipmentType) {
    query.$and.push({ equipmentType: req.body.filterBy.equipmentType });
  }

  if (req.body.filterBy.truckingCompany) {
    query.$and.push({ truckingCompany: req.body.filterBy.truckingCompany });
  }

  if (req.body.filterBy.freightBy) {
    query.$and.push({
      freightBy: {
        $regex: ".*" + req.body.filterBy.freightBy + ".*",
        $options: "i"
      }
    });
  }
/**analysis ticket */
    let data = await Scale.find(query)
      .populate("growerId", "firstName lastName farmName")
      .populate("commodityId", "commodityName")
      .populate("truckingCompany", "truckerName")
      .populate("actualFreightBy", "freightCompanyName")
      .populate("analysis.analysisId", "analysisName");

    if (data.length == 0) {
      res.xls(req.body.fileName, []);
    } else {
      var group_data = {};
      for (var i = 0; i < data.length; i++) {
        if (data[i].commodityId) {
          if (group_data[data[i].commodityId._id]) {
            group_data[data[i].commodityId._id].push(data[i]);
          } else {
            group_data[data[i].commodityId._id] = [data[i]];
          }
        }
      }
      newData = [];
      for (var key in group_data) {
        var commdityName = group_data[key][0].commodityId.commodityName;
        var list = group_data[key];
        if (req.body.ticketType == "Outgoing") {
          newData.push({
            Date: commdityName,
            Name: "",
            "Ticket Number": "",
            Bin: "",
            "Equipment Type": "",
            "Trucking Company": "",
            "Freight By": "",
            Gross: "",
            Tare: "",
            Net: "",
            "Contrat Number": "",
            "Buyer Name": "",
            Commodity: "",
            Grade: "",
            Code: "",
            "Xero Invoice": "",
            "Actual Freight By": "",
            "Created At": ""
          });

          list.map(scale => {
            var growerFullName = "";
            if (scale.displayOnTicket && scale.growerId) {
              growerFullName =
                scale.displayOnTicket == "Grower Name"
                  ? scale.growerId.firstName + " " + scale.growerId.lastName
                  : scale.growerId.farmName;
            }
            newData.push({
              Date: moment(scale.date).format("MM/DD/YYYY"),
              Name: growerFullName,
              "Ticket Number": "RO-" + scale.ticketNumber,
              Bin: scale.binNumber,
              "Equipment Type": scale.equipmentType,
              "Trucking Company": scale.truckingCompany
                ? scale.truckingCompany.truckerName
                : "",
              "Freight By": scale.freightBy,
              Gross: scale.grossWeightMT || 0,
              Tare: scale.tareWeightMT || 0,
              Net: scale.unloadWeidhtMT || 0,
              "Contrat Number": scale.contractNumber || "",
              "Buyer Name":
                scale.buyerId && scale.buyerId.businessName
                  ? scale.buyerId.businessName
                  : "",
              Commodity: scale.commodityId
                ? scale.commodityId.commodityName
                : "",
              Grade: scale.gradeId ? scale.gradeId.gradeName : "",
              Code: scale.commodityId ? scale.commodityId.commodityCode : "",
              "Xero Invoice": scale.invoiceNumber,
              "Actual Freight By": scale.actualFreightBy ? scale.actualFreightBy.freightCompanyName : "",
              "Created At": moment(scale.createdAt).format("MM/DD/YYYY")
            });
          });
        } else if (req.body.ticketType == "Incoming") {
          newData.push({
            Date: commdityName,
            Name: "",
            "Ticket Number": "",
            Bin: "",
            "Trucking Company": "",
            Gross: "",
            Tare: "",
            Net: "",
            "Contrat Number": "",
            "Buyer Name": "",
            Commodity: "",
            Grade: "",
            Code: "",
            "Splits MT": "",
            "Dockage MT ": "",
            "Created At": ""
          });
          list.map(scale => {
            var growerFullName = "";
            if (scale.displayOnTicket && scale.growerId) {
              growerFullName =
                scale.displayOnTicket == "Grower Name"
                  ? scale.growerId.firstName + " " + scale.growerId.lastName
                  : scale.growerId.farmName;
            }

            var totalSplits = 0,
              totalDockage = 0;
            scale.analysis.filter(anal => {
              if (anal.analysisId.analysisName == "Splits") {
                totalSplits = anal.weightMT;
              } else if (anal.analysisId.analysisName == "Dockage") {
                totalDockage = anal.weightMT;
              }
            });

            newData.push({
              Date: moment(scale.date).format("MM/DD/YYYY"),
              Name: growerFullName,
              "Ticket Number": "RI-" + scale.ticketNumber,
              Bin: scale.binNumber,
              "Trucking Company": scale.truckingCompany
                ? scale.truckingCompany.truckerName
                : "",
              Gross: scale.grossWeightMT || 0,
              Tare: scale.tareWeightMT || 0,
              Net: scale.netWeight || 0,
              "Contrat Number": scale.contractNumber || "",
              "Buyer Name":
                scale.buyerId && scale.buyerId.businessName
                  ? scale.buyerId.businessName
                  : "",
              Commodity: scale.commodityId
                ? scale.commodityId.commodityName
                : "",
              Grade: scale.gradeId ? scale.gradeId.gradeName : "",
              Code: scale.commodityId ? scale.commodityId.commodityCode : "",
              "Splits MT": totalSplits,
              "Dockage MT ": totalDockage,
              "Created At": moment(scale.createdAt).format("MM/DD/YYYY")
            });
          });
        }
      }
      res.xls(req.body.fileName, newData);
    }
  } else {
    let data = await Scale.find(query)
      .populate("growerId", "firstName lastName farmName")
      .populate("commodityId", "commodityName")
      .populate("truckingCompany", "truckerName")
      .populate("actualFreightBy", "freightCompanyName")
      .populate("analysis.analysisId", "analysisName");

    if (req.body.ticketType == "Outgoing") {
      newData = data.map(scale => {
        var growerFullName = "";
        if (scale.displayOnTicket && scale.growerId) {
          growerFullName =
            scale.displayOnTicket == "Grower Name"
              ? scale.growerId.firstName + " " + scale.growerId.lastName
              : scale.growerId.farmName;
        }
        return {
          Date: moment(scale.date).format("MM/DD/YYYY"),
          Name: growerFullName,
          "Ticket Number": "RO-" + scale.ticketNumber,
          Bin: scale.binNumber,
          "Equipment Type": scale.equipmentType,
          "Trucking Company": scale.truckingCompany
            ? scale.truckingCompany.truckerName
            : "",
          "Freight By": scale.freightBy,
          Gross: scale.grossWeightMT || 0,
          Tare: scale.tareWeightMT || 0,
          Net: scale.unloadWeidhtMT || 0,
          "Contrat Number": scale.contractNumber || "",
          "Buyer Name":
            scale.buyerId && scale.buyerId.businessName
              ? scale.buyerId.businessName
              : "",
          Commodity: scale.commodityId ? scale.commodityId.commodityName : "",
          Grade: scale.gradeId ? scale.gradeId.gradeName : "",
          Code: scale.commodityId ? scale.commodityId.commodityCode : "",
          "Xero Invoice": scale.invoiceNumber,
          "Actual Freight By": scale.actualFreightBy ? scale.actualFreightBy.freightCompanyName : "",
          "Created At": moment(scale.createdAt).format("MM/DD/YYYY")
        };
      });
      res.xls(req.body.fileName, newData);
    } else if (req.body.ticketType == "Incoming") {
      newData = data.map(scale => {
        var growerFullName = "";
        if (scale.displayOnTicket && scale.growerId) {
          growerFullName =
            scale.displayOnTicket == "Grower Name"
              ? scale.growerId.firstName + " " + scale.growerId.lastName
              : scale.growerId.farmName;
        }

        var totalSplits = 0,
          totalDockage = 0;
        scale.analysis.filter(anal => {
          if (anal.analysisId.analysisName == "Splits") {
            totalSplits = anal.weightMT;
          } else if (anal.analysisId.analysisName == "Dockage") {
            totalDockage = anal.weightMT;
          }
        });

        return {
          Date: moment(scale.date).format("MM/DD/YYYY"),
          Name: growerFullName,
          "Ticket Number": "RI-" + scale.ticketNumber,
          Bin: scale.binNumber,
          "Trucking Company": scale.truckingCompany
            ? scale.truckingCompany.truckerName
            : "",
          Gross: scale.grossWeightMT || 0,
          Tare: scale.tareWeightMT || 0,
          Net: scale.netWeight || 0,
          "Contrat Number": scale.contractNumber || "",
          "Buyer Name":
            scale.buyerId && scale.buyerId.businessName
              ? scale.buyerId.businessName
              : "",
          Commodity: scale.commodityId ? scale.commodityId.commodityName : "",
          Grade: scale.gradeId ? scale.gradeId.gradeName : "",
          Code: scale.commodityId ? scale.commodityId.commodityCode : "",
          "Splits MT": totalSplits,
          "Dockage MT ": totalDockage,
          "Created At": moment(scale.createdAt).format("MM/DD/YYYY")
        };
      });
      res.xls(req.body.fileName, newData);
    } else {
      res.xls(req.body.fileName, []);
    }
  }
};

methods.ticketList = async (req, res) => {
  const contractNumber = req.query.contract;
  var condition = {
    $and: [
      { status: 0 },
      {
        $or: [
          { contractNumber: contractNumber },
          { salesContractNumber: contractNumber },
          { "splits.contractNumber": contractNumber }
        ]
      },
      { void: {$ne: true} }
    ]
  };

  if (req.query.seqNo == "0") {
    condition.$and.push({ ticketType: { $ne: "Outgoing" } });
  } else if (!(req.query.seqNo == "1" || req.query.seqNo == "2")) {
    return SendResponse(res, { errors: [], userMessage: "Invalid sequence" });
  }
/**condition Purchase confirmation */
  let data = await Scale.paginate(condition, {
    populate: [
      { path: "growerId", select: "firstName lastName farmName email" },
      { path: "salesBuyerId buyerId", select: "businessName email" },
      { path: "analysis.analysisId", select: "analysisName" },
      { path: "purchase_confirmation", select: "personFarmType farmName contractNumber" },
    ],
    select: "growerId purchase_confirmation contractNumber ticketType ticketNumber date netWeight analysis displayOnTicket unloadWeidht ticketMailSent ticketMailDate moisture void isSplitTicket splits",
    limit: 100,
    lean: true
  });

  return SendResponse(res, { data, userMessage: "List" });
};

methods.sendTicketMail = async (req, res) => {
  const { email, body, _id, subject } = req.body;
  
  if (email && email.length && _id && _id.length) {
    if (
      process.env.SEND_QUOTE_MAIL == "true" &&
      process.env.LIVE_SERVER == "true"
    ) {
      notifications.sendCustomMail({ email, subject, body });
    } else {
      notifications.sendCustomMail({
        email: ["achinlalit@gmail.com"],
        subject,
        body
      });
    }
  }

  if (!(email && email.length && _id && _id.length)) {
    return SendResponse(res, {
      error: true,
      status: 400,
      userMessage: "Email address can't empty"
    });
  }

  await Scale.update(
    { _id: { $in: _id } },
    {
      $set: {
        ticketMailSent: true,
        ticketMailDate: new Date(),
        ticketMailSentBy: req.admin._id
      }
    },
    { multi: true }
  );

  return SendResponse(res, { userMessage: "Email sent successfully" });
};

methods.scaleHistory = async (req, res) => {
  let data = await scaleHistory
    .find({ scaleId: req.query.scaleId })
    .sort("createdAt")
    .populate("createdBy", "fullName")
    .populate("binNumber", "binName")
    .populate("truckingCompany", "truckerName")
    .populate("analysis.analysisId", "analysisName");

  return SendResponse(res, { userMessage: "list.", data });
};

methods.scaleOutgoingHistory = async (req, res) => {
  let data = await scaleOutgoingHistory
    .find({ outgoingScaleId: req.query.scaleId })
    .sort("createdAt")
    .populate("createdBy", "fullName")
    .populate("bagId", "bagId")
    .populate("binNumber", "binName")
    .populate("gradeId", "gradeName")
    .populate("truckingCompany", "truckerName")
    .populate("analysis.analysisId", "analysisName");

  return SendResponse(res, { data, userMessage: "list." });
};

methods.packagingReport = async (req, res) => {
  let query = {
    $and: [
      { status: 0 },
      { ticketType: "Outgoing" },
      { contractType: "Sales Contract" }
    ]
  };

  if (req.body.commodityId) {
    query.$and.push({ commodityId: req.body.commodityId });
  }

  if (req.body.ticketNumber && req.body.ticketNumber != "undefined") {
    query.$and.push({
      ticketNumber: {
        $regex: ".*" + req.body.ticketNumber + ".*",
        $options: "i"
      }
    });
  }

  var options = {
    select:
      "date ticketNumber commodityId netWeightPerBag targetWeight overUnderTarget",
    sort: { ticketNumber: -1 },
    page: Number(req.body.page) || 1,
    limit: Number(req.body.limit) || 10,
    populate: { path: "commodityId", select: "commodityName" }
  };

  let data = await Scale.paginate(query, options);

  return SendResponse(res, { data, userMessage: "list." });
};

methods.updateScaleWeightInContract = async (scale, operation, weight) => {
  if (!['Outgoing', 'Incoming'].includes(scale.ticketType)) return;

  const contractNumber = scale.contractNumber;
  const matches = contractNumber.match(/[A-Za-z]+/gm);

  if (matches.length == 0) {
    return;
  }

  let condition = {
      contractNumber
    },
    AnyContract;

  switch (matches[0]) {
    case "PC":
      AnyContract = Confirmation;
      break;

    case "P":
      AnyContract = Contract;
      if (scale.growerOrBuyer === 'Buyer')
        AnyContract = TradePurchase;
      break;

    case "S":
      AnyContract = Sales;
      break;

    default:
      return;
  }
/**del Quty subtraction weight */
  let contract = await AnyContract.findOne(condition);

  let delQty = contract.delQty;

  switch (operation) {
    case "-":
      delQty = delQty - weight * 2.20462;
      break;

    default:
      delQty = delQty + weight * 2.20462;
      break;
  }

  await AnyContract.findByIdAndUpdate(
    { _id: contract._id },
    { $set: { delQty } }
  );
};
