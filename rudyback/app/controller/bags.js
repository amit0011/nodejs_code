const mongoose = require('mongoose');
const session = require('@ag-libs/session');
const Bag = mongoose.model('bags');
const BagCategory = mongoose.model('bagCategory');
const moment = require('moment');
const cron = require('node-cron');

const util = require('util');
const fs = require('fs');
const conversionFactory = require('html-to-xlsx');
const puppeteer = require('puppeteer');
const chromeEval = require('chrome-page-eval')({ puppeteer });
const writeFileAsync = util.promisify(fs.writeFile);
const path = require('path');
const os = require('os');

const BagInventory = mongoose.model('bagInventory');
const { SendResponse } = require("@ag-common");
const Notifications = require('@ag-libs/function');

const methods = {};

module.exports.controller = function(router) {
	router
		.route('/bags')
		.post(session.adminCheckToken, methods.addBag)
		.get(session.adminCheckToken, methods.getBag)
		.put(session.adminCheckToken, methods.updateBag);

	router
		.route('/bags/delete')
		.post(session.adminCheckToken, methods.removeBag);

	router
		.route('/bags/list')
    .get(session.adminCheckToken, methods.list);

  router
    .route('/bagInventory/excel/bag-balance')
    .post(session.adminCheckToken, methods.generateBagBalanceExcel);

  router
    .route('/bagInventory/excel/bag-inventory')
    .post(session.adminCheckToken, methods.generateBagInventoryExcel);

  router
		.route('/bagInventory')
    .post(session.adminCheckToken, methods.addBagInventory);

  router
		.route('/bag/report/balance/:bagId')
    .get(session.adminCheckToken, methods.reportBagBalance);

  router
		.route('/bag/category/report/balance/:bagCategoryId')
    .get(session.adminCheckToken, methods.reportBagCategoryBalance);

  router
		.route('/bag/report/inventory')
    .get(session.adminCheckToken, methods.reportBagInventory);

  router
		.route('/bag/report/inventory/categorized')
    .get(session.adminCheckToken, methods.reportCategorizedBagInventory);

  router
    .route('/bag/updateOpeningInventory')
    .post(session.adminCheckToken, methods.setOpeningInventoryForBags);

  router
    .route('/bag/updateBagCount')
    .post(session.adminCheckToken, methods.updateBagCountCalcUsingBI);

  router
    .route('/bag/bagInventory/:bagId/monthlyDetail/:year/:month')
    .get(session.adminCheckToken, methods.bagInventoryMonthlyDetail);

  router
    .route('/bag/bagInventory/:bagCategoryId/monthlyDetail/:year/:month/categorized')
    .get(session.adminCheckToken, methods.bagInventoryCategorizedMonthlyDetail);

  router
      .route('/bag/category')
      .post(session.adminCheckToken, methods.addBagCategory)
      .get(session.adminCheckToken, methods.getBagCategory)
      .put(session.adminCheckToken, methods.updateBagCategory);

  router
      .route('/bag/category/delete')
      .post(session.adminCheckToken, methods.removeBagCategory);

};

const tmpPath = os.tmpdir();
const conversion = conversionFactory({
  extract: async ({ html, ...restOptions }) => {
    const tmpHtmlPath = path.join(tmpPath, Math.random() + '-input.html');

    await writeFileAsync(tmpHtmlPath, html);

    const result = await chromeEval({
      ...restOptions,
      html: tmpHtmlPath,
      scriptFn: conversionFactory.getScriptFn()
    });

    const tables = Array.isArray(result) ? result : [result]

    return tables.map((table) => ({
      name: table.name,
      getRows: async (rowCb) => {
        table.rows.forEach((row) => {
          rowCb(row);
        });
      },
      rowsCount: table.rows.length
    }));
  }
});

methods.list = async (req, res) => {
	let data = await Bag.find({status:0}).select('name weightOfBag bagWeight bagWeightUnit bulkBag includePallets');
	return SendResponse(res, { data, userMessage: 'Bag list.' });
};

/****************************************************************
***   Add New Bag  ***
****************************************************************/
methods.addBag = async function(req, res) {
	//Check for POST request errors.
	req.checkBody('name', 'Name  is required.').notEmpty();
	req.checkBody('bagCost', 'Bag cost  is required.').notEmpty();
	req.checkBody('bulkBag', 'Bulk Bag is required.').notEmpty();
	var errors = req.validationErrors(true);

	if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
	}

	const { name, bagCost, bulkBag } = req.body;
	//Database functions here
	let data = await Bag.findOne({ name, bagCost, bulkBag, status: 0 });

	if (data) {
		return SendResponse(res, {
			error: true, status: 400,
			userMessage: 'Bag name already exist.'
		});
	}

  data = await (new Bag(req.body)).save();

  let bagCount = data.bagCount;
  if (!bagCount) {
    bagCount = 0;
  }

  await (new BagInventory({
    bagId: data._id,
    noOfBags: bagCount,
    entryType: 'OpeningInventory',
    reason: 'New bag entry, initial stock entry.',
  })).save();

	return SendResponse(res, { data, userMessage: 'Bag added successfully.' });
};/*-----  End of addBag  ------*/

/***************************************************************
***   Get All Bag List  ***
***************************************************************/
methods.getBag = async function(req, res) {
	let data, options = {
		sort: { name: 1 },
		page: req.query.page,
    limit: 10,
    populate: [{path: 'category', select: 'name'}]
	};
	let condition = { status: 0 };
	if (req.query.search) {
		condition = {
			status: 0,
			city: { $regex: ".*" + req.query.search + ".*", $options: 'i' }
		};
	}

	if (!req.query.page) {
		data = await Bag.find(condition).sort({name: 1});
	} else {
		data = await Bag.paginate(condition, options);
	}

	return SendResponse(res, { data, userMessage: 'Bag list.' });
};/*-----  End of get Bag  ------*/

/***************************************************************
***   Update Bag  ***
***************************************************************/
methods.updateBag = async function(req, res) {
	let bag = await Bag.findOne({ _id: req.body._id });
	if (!bag) {
		return SendResponse(res, {
			error: true, status: 400,
			userMessage: 'Bag details not found.'
		});
	}

	bag.name = req.body.name || bag.name;
	bag.category = req.body.category || bag.category;
  console.log(bag.bagCategory);
	bag.bagWeight = req.body.bagWeight || bag.bagWeight;
	bag.bagWeightUnit = req.body.bagWeightUnit || bag.bagWeightUnit;
	bag.bagCost = req.body.bagCost || bag.bagCost;
	bag.bulkBag = req.body.bulkBag || bag.bulkBag;
	bag.weightOfBag = req.body.weightOfBag || bag.weightOfBag;
	bag.includePallets = req.body.includePallets;
	bag.alertCount = req.body.alertCount;

	await bag.save();

	return SendResponse(res, {data: bag, userMessage: 'Bag updated.'});
};/*-----  End of updatebag  ------*/

/***************************************************************
***   remove Bag  ***
***************************************************************/
methods.removeBag = async function(req, res) {
	let data = await Bag.update(
		{ _id: { $in: req.body.idsArray } },
		{ $set: { status: 1 } },
		{ multi: true }
	);

	return SendResponse(res, {data, userMessage: 'bag deleted.'});
};/*-----  End of removeBag  ------*/

/****************************************************************
***   Add New Bag Inventory ***
****************************************************************/
methods.addBagInventory = async function(req, res) {
	//Check for POST request errors.
	req.checkBody('bagCategoryId', 'BagCategoryId is required.').notEmpty();
	req.checkBody('noOfBags', 'Number of bags is required.').notEmpty();
	var errors = req.validationErrors(true);

	if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
	}

  let data = await (new BagInventory({...req.body, entryType: 'mannual'})).save();

  await BagCategory.findByIdAndUpdate(data.bagCategoryId, {$inc: {bagCount: data.noOfBags}});

	return SendResponse(res, { data, userMessage: 'Bag inventory added successfully.' });
};/*-----  End of addBag  ------*/

methods.bagInventoryMonthlyDetail = async function(req, res) {
  const {bagId, year, month} = req.params;
  const entryType = req.query.type || 'projected';
  const date = moment((new Date(year, month - 1, 1)).toISOString());
  const startDate = date.startOf('month').toDate();
  const endDate = date.endOf('month').toDate();

  const data = await BagInventory.find({
    entryType, bagId, date: {$gte: startDate, $lte: endDate}
  }).lean();

  return SendResponse(res, {data});
};

methods.bagInventoryCategorizedMonthlyDetail = async function(req, res) {
  const {bagCategoryId, year, month} = req.params;
  const entryType = req.query.type || 'projected';
  const date = moment((new Date(year, month - 1, 1)).toISOString());
  const startDate = date.startOf('month').toDate();
  const endDate = date.endOf('month').toDate();

  const bags = await Bag.find({category: bagCategoryId}).select({_id: 1}).lean();

  const data = await BagInventory.find({
    entryType, bagId: {$in: bags.map(bag => bag._id)}, date: {$gte: startDate, $lte: endDate}
  }).lean();

  return SendResponse(res, {data});
};

methods.generateBagBalanceExcel = async function(req, res) {
  req.checkBody('bagId', 'BagId is required.').notEmpty();
	var errors = req.validationErrors(true);

	if (errors) {
		return SendResponse(res, {
			error: true, status: 422, errors,
			userMessage: 'Validation errors'
		});
  }
  const {bagId} = req.body;

  const bag = await Bag.findById(bagId);

  if (!bag) {
    return SendResponse(res, {
      error: true, status: 404,
      userMessage: 'Bag not found',
    });
  }

  let html_table = '<table id="bi-table" style="font-family: \'Calibri\', \'Helvetica Neue\', sans-serif">';
  // generate table header
  html_table += '<thead>';

  // First row of header
  html_table += '<tr>';
  html_table += '<th>Bag Type</th>';
  html_table += `<th colspan="2">${bag.name}</th>`;
  html_table += '</tr>';

  html_table += '</thead>';

  const bagInventories = await BagInventory.find({bagId, entryType: {$ne: 'projected'}}).sort({date: 1}).lean();

  let date = null;
  let udate = null;
  let total = 0;
  let hasOpningOrClosing = false;

  html_table += '<tbody>';
  bagInventories.forEach(inventory => {
    udate = moment(inventory.date).format('MMMM, YYYY');
    if (!date || date !== udate) {
      // If record has opening inventory document
      hasOpningOrClosing = 'OpeningInventory' === inventory.entryType;
      if (hasOpningOrClosing) {
        total = inventory.noOfBags;
      }
      if (date) {
        html_table += `<tr><td></td><td style="text-align: right">Closing Balance - ${total}</td><td></td></tr>`;
      }
      date = udate;
      html_table += `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
      html_table += `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;

      html_table += `<tr><td>${udate}</td><td style="text-align: right">Opening Balance - ${total}</td><td></td></tr>`;
    }

    if (!hasOpningOrClosing) {
      // format count of bags with sign in bracket
      let countWithSign = inventory.noOfBags < 0 ? `(-)${-inventory.noOfBags}` : inventory.noOfBags > 0 ? `(+)${inventory.noOfBags}` : `${inventory.noOfBags}`;
      html_table += `<tr><td style="text-align: right">${moment(inventory.date).format('D-MMM')}</td><td style="text-align: right">${countWithSign}</td><td>${inventory.reason}</td></tr>`;
      total += inventory.noOfBags;
    }
  });
  html_table += '</tbody>';
  html_table += '</table>';

  const stream = await conversion(`<html><body>${html_table}</body></html>`);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader("Content-Disposition", "attachment; filename=bag-balance-excel.xlsx");

  stream.once('readable', function() {
    res.write(stream.read());
    res.end();
  });
};

methods.reportBagBalance = async function(req, res) {
  const {bagId} = req.params;

  const bag = await Bag.findById(bagId);

  if (!bag) {
    return SendResponse(res, {
      error: true, status: 404,
      userMessage: 'Bag not found',
    });
  }

  const bagInventories = await BagInventory.find({bagId, entryType: {$ne: 'projected'}}).sort({date: 1}).lean();
  return SendResponse(res, {bag, bagInventories, userMessage: 'Bag details fetched successfully'});
};

methods.reportBagCategoryBalance = async function(req, res) {
  const {bagCategoryId} = req.params;
  const bagCategory = await BagCategory.findById(bagCategoryId);

  if (!bagCategory) {
    return SendResponse(res, {
      error: true, status: 404,
      userMessage: 'Bag category not found',
    });
  }

  const bagInventories = await BagInventory.find({bagCategoryId, entryType: {$ne: 'projected'}})
    .populate('bagId', 'name')
    .sort({date: 1})
    .lean();
  return SendResponse(res, {bagCategory, bagInventories, userMessage: 'Bag category details fetched successfully'});
};

async function getBagInventories() {
  const monthStart = new Date(moment().startOf('month'));
  const bagInventory = await Bag.aggregate([
    {$match: {status: 0, bulkBag: {$in: ['Bag', 'Pallet']}}},
    {$project: {name: 1, bagCount: 1}},
    {$lookup: {
      from: 'baginventories',
      let: {bagId: '$_id'},
      pipeline: [{
        $match: {
          $expr: {
            $and: [
                {$eq: ['$bagId', '$$bagId']},
                {$gte: ['$date', monthStart]}
            ]
          }
        }
      }, {
        $group: {_id: {type: '$entryType', month: { "$month": "$date" }, year: { "$year": "$date" } }, total: {$sum: '$noOfBags'}, }
      }, {
        $project: { total: 1, date: 1, }
      }],
      as: 'inventory'
    }},
    {$match: {'inventory.0': {$exists: true}}},
  ]).exec();

  return bagInventory;
}

async function getCategorizedBagInventories() {
  const monthStart = new Date(moment().startOf('month'));
  const bagInventory = await Bag.aggregate([
    {$match: {status: 0, bulkBag: {$in: ['Bag', 'Pallet']}}},
    {$project: {name: 1, bagCount: 1, category: 1}},
    {$lookup: {
      from: 'baginventories',
      let: {bagId: '$_id'},
      pipeline: [{
        $match: {
          $expr: {
            $and: [
                {$eq: ['$bagId', '$$bagId']},
                {$gte: ['$date', monthStart]}
            ]
          }
        }
      }, {
        $group: {_id: {type: '$entryType', month: { "$month": "$date" }, year: { "$year": "$date" } }, total: {$sum: '$noOfBags'}, }
      }, {
        $project: { total: 1, date: 1, }
      }],
      as: 'inventory'
    }},
    {$match: {'inventory.0': {$exists: true}, category: {$type: 'objectId'}}},
    {$group: {_id: '$category', bagCountTotal: {$sum: '$bagCount'}, inventoryTotal: {$push: '$inventory'}}},
    {$unwind: "$inventoryTotal"},
    {$unwind: "$inventoryTotal"},
    {$group: {_id: {category: "$_id", inventoryId: "$inventoryTotal._id"}, bagCountTotal: {$first: '$bagCountTotal'}, inventoryTotal: {$sum: '$inventoryTotal.total'}}},
    {$project: {
      _id: '$_id.category',
      bagCountTotal: 1,
      inventoryTotal: {
        _id: '$_id.inventoryId',
        total: '$inventoryTotal'
      }
    }},
    {$group: {_id: '$_id', bagCountTotal: {$first: '$bagCountTotal'}, inventoryTotal: {$addToSet: '$inventoryTotal'}}},
    {$lookup: {
      from: 'bagcategories',
      let: {categoryId: '$_id'},
      pipeline: [
        {$match: {$expr: {$eq: ['$$categoryId', '$_id']}}},
        {$project: {name: 1}}
      ],
      as: 'category'
    }},
    {$unwind: "$category"},
    {$project: {
      name: '$category.name',
      bagCount: '$bagCountTotal',
      inventory: '$inventoryTotal'
    }}
  ]).exec();

  return bagInventory;
}

methods.generateBagInventoryExcel = async function(req, res) {
  const fn = req.query.type === 'categorized' ? getCategorizedBagInventories : getBagInventories;
  const bagInventory = await fn();

  // Calculating 12 months from now onwards
  let months = [];
  let startDate = moment();
  let endDate = moment().add(360, 'days');

  while(startDate.isBefore(endDate)) {
    months.push(startDate.format('MMMM'));
    startDate = startDate.add(1, 'month');
  }

  let date = moment();
  let html_table = '<table id="bi-table" style="font-family: \'Calibri\', \'Helvetica Neue\', sans-serif">';
  // generate table header
  html_table += '<thead>';

  // First row of header
  html_table += '<tr>';
  html_table += '<th>Bag Type</th>';
  html_table += '<th>QTY On Hand</th>';

  html_table += `<th colspan="3">${months.join('</th><th colspan="3">')}</th>`;
  html_table += '</tr>';

  // Second row of header
  html_table += '<tr>';
  html_table += '<th></th>';
  html_table += `<th>${moment().format('DD-MMMM-YYYY')}</th>`;
  months.forEach(() => {
    html_table += `<th>Orders</th>`;
    html_table += `<th>Shipped</th>`;
    html_table += `<th>Bal on hand</th>`;
  });
  html_table += '</tr>';
  html_table += '</thead>';
  html_table += '<tbody>';

  // generate table data
  bagInventory.forEach(bi => {
    html_table += '<tr>';
    html_table += `<td>${bi.name}</td>`;
    html_table += `<td style="text-align: right">${bi.bagCount}</td>`;

    let dataRow = '';
    let bagCount = bi.bagCount;
    months.forEach(month => {
      let monthNumber = date.month(month).format('M');
      let monthInventory = bi.inventory.filter(inventory => inventory._id.month == monthNumber);

      // data projected
      let projectedData = monthInventory.find(mi => mi._id.type === 'projected');
      let projectedTotal = projectedData ? projectedData.total : 0;
      dataRow += `<td style="text-align: right">${projectedTotal}</td>`;

      // data actual
      let actualData = monthInventory.find(mi => mi._id.type === 'actual');
      let actualTotal = actualData ? actualData.total : 0;
      dataRow += `<td style="text-align: right">${actualTotal}</td>`;

      // data for balance on hand
      bagCount += projectedTotal;
      dataRow += `<td style="text-align: right">${bagCount}</td>`;
    });
    html_table += dataRow;
    html_table += '</tr>';
  });

  html_table += '</tbody>';
  html_table += '</table>';

  const stream = await conversion(`<html><body>${html_table}</body></html>`);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader("Content-Disposition", "attachment; filename=bag-inventory-excel.xlsx");

  stream.once('readable', function() {
    res.write(stream.read());
    res.end();
  });
};

methods.reportBagInventory = async function(req, res) {
  const bagInventory = await getBagInventories();

  return SendResponse(res, {data: bagInventory, userMessage: 'Bag inventory data fetched successfully'});
};

methods.reportCategorizedBagInventory = async function(req, res) {
  const bagInventoryCategorized = await getCategorizedBagInventories();

  return SendResponse(res, {data: bagInventoryCategorized, userMessage: 'Bag inventory categorized data fetched successfully'});
};

cron.schedule('0 6 * * *', async () => {
  console.log('running a task to check back inventory every midnight of central time: ', new Date());

  await calculateAndUpdateBagCount();
  await checkBackInventory();
});

async function checkBackInventory() {
  const bags = await Bag.aggregate([
    {
      $match: { alertCount: {$exists: true, $ne: 0}}
    }, {
      $lookup: {
        from: 'baginventories',
        let: {bagId: '$_id'},
        pipeline: [{
          $match: {
            $expr: {
              $and: [
                  {$eq: ['$bagId', '$$bagId']},
                  {$eq: ['$entryType', 'actual']}
              ]
            }
          }
        }, {
          $group: {_id: '$bagId', total: {$sum: '$noOfBags'}, }
        }, {
          $project: { total: 1 }
        }],
        as: 'inventory'
      }
    }, {
      $unwind: {path: '$inventory', preserveNullAndEmptyArrays: true}
    }, {
      $project: {
        name: 1,
        bulkBag: 1,
        bagCount: {$sum: ['$bagCount', '$inventory.total']},
        alertCount: 1
      }
    }, {
      $match: {
        $expr: {
          $and: [
            {$gte: ['$alertCount', '$bagCount']}
          ]
        }
      }
    }
  ]).exec();

  if (!bags.length) {
    return;
  }

  Notifications.sendBagInventoryMail(bags);
}

// #region Update bag count calculated from bag inventory
methods.updateBagCountCalcUsingBI = async (req, res) => {
  await calculateAndUpdateBagCount();
  return SendResponse(res, {userMessage: 'Bag Count updated successfully.'});
};

async function calculateAndUpdateBagCount() {
  const startDate = moment().startOf('month').toDate();
  const endDate = moment().endOf('month').toDate();

  // Step 1: First Calculate Sum of entries having entryType other than projected and actual
  const bagInventorySums = await BagInventory.aggregate([
    {$match: {
      date: {$gte: startDate, $lte: endDate},
      entryType: {$in: ['OpeningInventory', 'mannual', 'actual']}
    }},
    {$group: {
      _id: '$bagId',
      bagCount: {$sum: '$noOfBags'}
    }}
  ]);

  // Step 2: Update BagCount in bags table for each bag
  bagInventorySums.forEach(async ({_id, bagCount}) => {
    await Bag.findByIdAndUpdate(_id, {$set: {bagCount}});
  });
}
// #endregion

// #region Bag's OpeningInventory calculation and CRON
methods.setOpeningInventoryForBags = async (req, res) => {
  await updateOpeningInventory();
  return SendResponse(res, {userMessage: 'Opening inventory for bag updated successfully.'});
};

async function updateOpeningInventory() {
  // Current month start date
  const startOfMonth = moment().startOf('month').toDate();

  // Calculate current month date range
  const cmStartDate = moment().startOf('month').toDate();
  const cmEndDate = moment().endOf('month').toDate();

  // BagIds having OpeningInventory
  const bagIdsHavingOI = await BagInventory.find({
    date: {$gte: cmStartDate, $lte: cmEndDate},
    entryType: 'OpeningInventory',
  }, 'bagId').lean();

  // BagIds not having OpeningInventory
  const bagIdsNotHavingOI = await Bag.find({
    _id: {$nin: bagIdsHavingOI.map(({bagId}) => mongoose.Types.ObjectId(bagId))},
    bulkBag: {$in: ['Bag', 'Pallet']}
  }, '_id').lean();

  // Calculate previous month date range
  const pmStartDate = moment().add(-1, 'month').startOf('month').toDate();
  const pmEndDate = moment().add(-1, 'month').endOf('month').toDate();

  // Calculate current month OpeningInventory for bag not having it
  const bagInventories = await BagInventory.aggregate([
    {$match: {
      bagId: {$in: bagIdsNotHavingOI.map(bagId => mongoose.Types.ObjectId(bagId._id))},
      date: {$gte: pmStartDate, $lte: pmEndDate},
      entryType: {$in: ['OpeningInventory', 'mannual', 'actual']}
    }},
    {$group: {
      _id: '$bagId',
      bagCount: {$sum: '$noOfBags'}
    }}
  ]).exec();

  const bagInventoryOI = bagInventories.map(inventory => ({
    date: startOfMonth,
    bagId: inventory._id,
    entryType: 'OpeningInventory',
    reason: 'Opening inventory calculation from last month enries',
    noOfBags: inventory.bagCount,
  }));

  await BagInventory.insertMany(bagInventoryOI);
}

cron.schedule('0 5 1 * *', async () => {
  console.log('running a task to update opening inventory of each bag on first day of month', new Date());

  await updateOpeningInventory();
});
// #endregion

// #region Bag Category

/*=============================
***   Add New Bag Category  ***
===============================*/
methods.addBagCategory = async function(req, res) {
  //Check for POST request errors.
  req.checkBody('name', 'Category name  is required.').notEmpty();
  var errors = req.validationErrors(true);

  if (errors) {
      return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
  }
  //Database functions here
  let bagCategory = await BagCategory.findOne({
    name: req.body.name,
    status: 0,
    bagCount: req.body.bagCount,
    alertCount: req.body.alertCount,
  });
  if (bagCategory) {
      return SendResponse(res, { status: 400, error: true, userMessage: 'Bag category already exist.' });
  }

  let data = await (new BagCategory(req.body)).save();

  return SendResponse(res, { data, userMessage: 'Bag Category added successfully.' });
};/*-----  End of addBagCategory  ------*/

/*=======================================
***   Get All Bag category List  ***
=========================================*/
methods.getBagCategory = async function(req, res) {
  let query;
  var options = { sort: { name: 1 }, page: req.query.page || 1, limit: 10 };
  var condition = { status: 0 };

  if (req.query.search) {
      condition = { status: 0, name: { $regex: ".*" + req.query.search + ".*", $options: 'i' } };
      query = BagCategory.paginate(condition, options);
  } else if (!req.query.page) {
      query = BagCategory.find(condition).sort(options.sort);
  } else {
      query = BagCategory.paginate(condition, options);
  }

  let data = await query;

  return SendResponse(res, { data, userMessage: 'Bag Category list.' });
};/*-----  End of get BagCategory  ------*/

/*========================
***   Update BagCategory  ***
==========================*/
methods.updateBagCategory = async function(req, res) {
  let bagCategory = await BagCategory.findOne({ _id: req.body._id });

  if (!bagCategory) {
      return SendResponse(res, { error: true, status: 400, userMessage: 'Bag Category details not found.' });
  }

  bagCategory.name = req.body.name || bagCategory.name;
  bagCategory.alertCount = req.body.alertCount;

  let data = await bagCategory.save();

  return SendResponse(res, { data, userMessage: 'Bag Category updated.' });
};/*-----  End of updateBagCategory  ------*/

/*============================
***   remove Bag Category  ***
==============================*/
methods.removeBagCategory = async function(req, res) {
  let data = await BagCategory.update({ _id: { $in: req.body.idsArray } }, { $set: { status: 1 } }, { multi: true });

  return SendResponse(res, { data, userMessage: 'Bag category deleted.' });
};/*-----  End of removeBagCategory  ------*/

// #endregion
