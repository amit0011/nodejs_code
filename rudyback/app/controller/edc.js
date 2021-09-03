var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var EDC = mongoose.model('edc');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/edc')
        .post(session.adminCheckToken, methods.addEDC)
        .get(session.adminCheckToken, methods.getEDC)
        .put(session.adminCheckToken, methods.updateEDC);
};

/*=============================
***   Add New EDC  ***
===============================*/
methods.addEDC = async function(req, res) {
    //Check for POST request errors.
    req.check('name', 'name  is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
    }

    let data = await EDC.findOne({ name: req.body.name, status: 0 });

    if (data) {
        return SendResponse(res, {error: true, status: 400, userMessage: 'Already added'});
    }

    data = await (new EDC({ name: req.body.name })).save();

    return SendResponse(res, {userMessage: 'EDC added successfully.'});
};/*-----  End of addEDC  ------*/

/*=======================================
***   Get All EDC List  ***
=========================================*/
methods.getEDC = async function(req, res) {
    let data, options;
    let condition = { status: 0 };
    if (!req.query.page) {
        data = await EDC
            .find(condition)
            .select('name')
            .sort({ name: 1 });
    } else {
        options = {
            select: 'name createdAt',
            sort: { name: 1 },
            page: req.query.page,
            limit: 10
        };

        if (req.query.searchBy && req.query.searchBy !== 'undefined')
            condition = {
                status: 0,
                name: { $regex: ".*" + req.query.searchBy + ".*", $options: 'i' }
            };
        data = await EDC.paginate(condition, options);
    }

    return SendResponse(res, {data, userMessage: 'Edc list.'});
};/*-----  End of getEDC  ------*/

/*========================
***   Update EDC  ***
==========================*/
methods.updateEDC = async function(req, res) {

    req.check('_id', '_id  is required.').notEmpty();
    let errors = req.validationErrors(true);

    if (errors) {
		return SendResponse(res, {
			error: true, status: 400, errors,
			userMessage: 'Validation errors'
		});
    }

    let data;
    if (req.body.name) {

        data = await EDC.findOne({ _id: { $ne: req.query._id }, name: req.body.name });
        if (data) {
            return SendResponse(res, {error: true, status: 400, userMessage: 'EDC already added.'});
        }

        await EDC.findByIdAndUpdate(req.query._id, { $set: { name: req.body.name } });

        return SendResponse(res, {userMessage: 'Bag updated.'});
    }

    if (req.body.status == 1) {
        data = await EDC.findByIdAndUpdate(req.query._id, { $set: { status: 1 } });

        if (data) {
            return SendResponse(res, {userMessage: 'Deleted success'});
        }
    }

    return SendResponse(res, {error: true, status: 400, userMessage: 'Something went wrong'});
};
