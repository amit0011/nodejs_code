var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Cost = mongoose.model('certificateCost');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
	router
		.route('/certificateCost')
		.post(session.adminCheckToken, methods.addCost)
		.get(session.adminCheckToken, methods.getCost)
		.put(session.adminCheckToken, methods.updateCost);

	router
		.route('/certificateCost/delete')
		.post(session.adminCheckToken, methods.removeCost);
};

/*=============================
***   Add New Weather  ***
===============================*/
methods.addCost = async function(req, res) {
	req.checkBody('certificateName', 'certificateName is required.').notEmpty();
	let errors = req.validationErrors(true);

	if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
	}

	let data = await (new Cost(req.body)).save();

	return SendResponse(res, { data, userMessage: 'cost added successfully.' });
};/*-----  End of addCost  ------*/

/*=======================================
***   Get All Cost List  ***
=========================================*/
methods.getCost = async function(req, res) {
	let data, condition = {}, options = {
		sort: {
			createdAt: -1
		},
		page: req.query.page,
		limit: 10
	};

	if (req.query.search) {
		condition = {
			status: 0,
			certificateName: { $regex: ".*" + req.query.search + ".*", $options: 'i' }
		};
		data = await Cost.paginate(condition, options);
	} else if (!req.query.page) {
		data = await Cost.find(condition);
	} else {
		condition = { status: 0 };
		data = await Cost.paginate(condition, options);
	}

	return SendResponse(res, {data, userMessage: 'cost list.'});
};/*-----  End of get Bag  ------*/

/*========================
***   Update Weather  ***
==========================*/
methods.updateCost = async function(req, res) {
	let data = await Cost.findOne({ _id: req.body._id });

	if (!cost) {
		return SendResponse(res, {error: true, status: 400, userMessage: 'Bag details not found.'});
	}

	cost.certificateName = req.body.certificateName || cost.certificateName;
	cost.cost = req.body.cost || cost.cost;
	await cost.save();

	return SendResponse(res, {data, userMessage: 'cost updated.'});
};/*-----  End of updateCost  ------*/

/*============================
***   remove Weather  ***
==============================*/
methods.removeCost = async function(req, res) {
	let data = await Cost.update(
		{ _id: { $in: req.body.idsArray } },
		{ $set: { status: 1 } },
		{ multi: true }
	);

	return SendResponse(res, {data, userMessage: 'Cost deleted.'});
};/*-----  End of removeCost  ------*/
