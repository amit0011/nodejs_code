var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Port = mongoose.model('loadingPort');
var ShippingTerm = mongoose.model('shippingTerms');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/loadingPort')
        .post(session.adminCheckToken, methods.addLoadingPort)
        .get(session.adminCheckToken, methods.getLoadingPort)
        .put(session.adminCheckToken, methods.updateLoadingPort);

    router
        .route('/loadingPort/delete')
        .post(session.adminCheckToken, methods.removeLoading);

    router
        .route('/shippingTerms')
        .post(session.adminCheckToken, methods.addShippingTerm)
        .get(session.adminCheckToken, methods.getShippingTerm)
        .put(session.adminCheckToken, methods.updateShippingTerm);

    router
        .route('/shippingTerms/delete')
        .post(session.adminCheckToken, methods.removeShippingTerms);
};


/*=============================
***   Add New Grade  ***
===============================*/
methods.addLoadingPort = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('loadingPortName', 'Loading port name  is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await Port.findOne({
            loadingPortName: req.body.loadingPortName,
            status: 0
        });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Loading port Name already exist.'
        });
    }

    data = await (new Port(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Loading port added successfully.'});
};/*-----  End of addLoadingPort  ------*/

/*=======================================
***   Get All Grade List  ***
=========================================*/
methods.getLoadingPort = async function(req, res) {
    let data;
    var condition = { status: 0 };
    if (req.query.page) {
        data = await Port.paginate(condition, {
            sort: { createdAt: -1 },
            page: req.query.page,
            limit: 10
        });
    } else {
        data = await Port.find(condition);
    }

    return SendResponse(res, { data, userMessage: 'Port list.' });
};/*-----  End of getLoadingPortType  ------*/

/*========================
***   Update Port  ***
==========================*/
methods.updateLoadingPort = async function(req, res) {
    let data = await Port.findOne({ _id: req.body._id });

    if (!data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Port details not found.'
        });
    }

    data.loadingPortName = req.body.loadingPortName || data.loadingPortName;
    data.updatedAt = new Date();
    await data.save();

    return SendResponse(res, {data, userMessage: 'loading port name updated.'});
};/*-----  End of updateLoadingPort  ------*/

/*============================
***   remove Port  ***
==============================*/
methods.removeLoading = async function(req, res) {
    let data = await Port.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Port deleted.'});
};/*-----  End of removeEquipment  ------*/

/*=============================
***   Add New Grade  ***
===============================*/
methods.addShippingTerm = async function(req, res) {
    req.checkBody('term', 'Term name  is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await ShippingTerm.findOne({
            term: req.body.term,
            status: 0,
            loadingPortId: req.body.loadingPortId
        });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Term Name already exist.'
        });
    }

    data = await (new ShippingTerm(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Term added successfully.'});
};/*-----  End of addShippingTerm  ------*/

/*=======================================
***   Get All Grade List  ***
=========================================*/
methods.getShippingTerm = async function(req, res) {
    let data = [], condition;
    let options = {
        sort: { createdAt: -1 },
        page: req.query.page,
        limit: 10,
        populate: ('loadingPortId'),
        lean: true
    };

    if (req.query.page) {
        condition = { status: 0 };
        data = await ShippingTerm.paginate(condition, options);
    }

    if (!req.query.page && req.query.portId) {
        condition = { status: 0, loadingPortId: req.query.portId };
        data = await ShippingTerm
            .find(condition)
            .sort({ term: 1 });
    }

    return SendResponse(res, {data, userMessage: 'term list.'});
};/*-----  End of getShippingTermType  ------*/

/*========================
***   Update Port  ***
==========================*/
methods.updateShippingTerm = async function(req, res) {
    let term = await ShippingTerm.findOne({ _id: req.body._id });

    if (!term) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'term details not found.'
        });
    }

    term.term = req.body.term || term.term;
    term.loadingPortId = req.body.loadingPortId || term.loadingPortId;
    term.updatedAt = new Date();
    await term.save();

    return SendResponse(res, {data: term, userMessage: 'Term name updated.'});
};/*-----  End of updateShippingTerm  ------*/

/*============================
***   remove Shipping Terms  ***
==============================*/
methods.removeShippingTerms = async function(req, res) {
    let data = await ShippingTerm.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'terms deleted.'});
};/*-----  End of removeShipping terms  ------*/
