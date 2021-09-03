var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Pricing = mongoose.model('pricingTerms');
var Tags = mongoose.model('tags');
var Documents = mongoose.model('documents');
var Trades = mongoose.model('tradeRules');
var PaymentMethod = mongoose.model('paymentMethod');
var PaymentTerms = mongoose.model('paymentTerms');
var Variance = mongoose.model('variance');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/pricingTerms')
        .post(session.adminCheckToken, methods.addPricingTerms)
        .get(session.adminCheckToken, methods.getPricingTerms)
        .put(session.adminCheckToken, methods.updatePricingTerms);

    router
        .route('/pricingTerms/delete')
        .post(session.adminCheckToken, methods.removePricingTerms);

    router
        .route('/tags')
        .post(session.adminCheckToken, methods.addTags)
        .get(session.adminCheckToken, methods.getTags)
        .put(session.adminCheckToken, methods.updateTags);

    router
        .route('/tags/delete')
        .post(session.adminCheckToken, methods.removeTags);

    router
        .route('/documents')
        .post(session.adminCheckToken, methods.addDocuments)
        .get(session.adminCheckToken, methods.getDocuments)
        .put(session.adminCheckToken, methods.updateDocuments);

    router
        .route('/documents/delete')
        .post(session.adminCheckToken, methods.removeDocuments);

    router
        .route('/trades')
        .post(session.adminCheckToken, methods.addTrades)
        .get(session.adminCheckToken, methods.getTrades)
        .put(session.adminCheckToken, methods.updateTrades);

    router
        .route('/trades/delete')
        .post(session.adminCheckToken, methods.removeTrades);

    router
        .route('/paymentMethod')
        .post(session.adminCheckToken, methods.addPaymentMethod)
        .get(session.adminCheckToken, methods.getPaymentMethod)
        .put(session.adminCheckToken, methods.updatePaymentMethod);

    router
        .route('/paymentMethod/delete')
        .post(session.adminCheckToken, methods.removePaymentMethod);

    router
        .route('/paymentTerms')
        .post(session.adminCheckToken, methods.addPaymentTerms)
        .get(session.adminCheckToken, methods.getPaymentTerms)
        .put(session.adminCheckToken, methods.updatePaymentTerms);

    router
        .route('/paymentTerms/delete')
        .post(session.adminCheckToken, methods.removePaymentTerms);

    router
        .route('/variance')
        .post(session.adminCheckToken, methods.addVariance)
        .get(session.adminCheckToken, methods.getVariance)
        .put(session.adminCheckToken, methods.updateVariance);

    router
        .route('/variance/delete')
        .post(session.adminCheckToken, methods.removeVariance);
};

/*==================================
***   Add new Commodity Type  ***
====================================*/
methods.addPricingTerms = async function(req, res) {
    req.checkBody('pricingTerms', 'pricingTerms is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await Pricing.findOne({ "pricingTerms": req.body.pricingTerms, status: 0 });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Pricing terms already exist.'
        });
    }

    data = await (new Pricing(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Pricing terms added successfully.'});
};/*-----  End of addPricingTerms  ------*/

/*=======================================
***   Get All analysis List  ***
=========================================*/
methods.getPricingTerms = async function(req, res) {
    let data = await Pricing.find({ status: 0 });

    return SendResponse(res, {data, userMessage: 'Pricing list.'});
};/*-----  End of getPricingTerms  ------*/

/*============================
***   remove Analysis  ***
==============================*/
methods.removePricingTerms = async function(req, res) {
    let data = await Pricing.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Pricing Terms deleted.'});
};/*-----  End of removePricingTerms  ------*/

/*==========================
***   updatePricingTerms  ***
============================*/
methods.updatePricingTerms = async function(req, res) {
    req.checkBody('pricingTerms', 'Pricing Terms is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let pricingTerms = await Pricing.findOne({
            _id: { $ne: req.body._id },
            "pricingTerms": {
                $regex: req.body.pricingTerms,
                $options: "si"
            },
            status: 0
        });

    if (pricingTerms) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Pricing Terms already exists in our database. '
        });
    }

    pricingTerms = await Pricing.findByIdAndUpdate(
            req.body._id, {
                $set: {
                    pricingTerms: req.body.pricingTerms
                }
            });

    return SendResponse(res, {data: pricingTerms, userMessage: 'Pricing Terms update successfully.'});
};/*-----  End of updatePricingTerms  ------*/

/*==================================
***   Add Tags  ***
====================================*/
methods.addTags = async function(req, res) {
    req.checkBody('tags', 'Tags is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let tags = await Tags.findOne({
            "tags": {
                $regex: req.body.tags,
                $options: "si"
            },
            status: 0
        });

    if (tags) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Tags already exist.'
        });
    }

    tags = await (new Tags(req.body)).save();

    return SendResponse(res, {data: tags, userMessage: 'Tags added successfully.'});
};/*-----  End of addTags  ------*/

/*=======================================
***   Get All Tags List  ***
=========================================*/
methods.getTags = async function(req, res) {
    let tags = await Tags.find({ status: 0 });
    return SendResponse(res, {data: tags, userMessage: 'Tags list.'});
};/*-----  End of getTags  ------*/

/*==========================
***   updateTags  ***
============================*/
methods.updateTags = async function(req, res) {
    req.checkBody('tags', 'Tags Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let tags = await Tags.findOne({
        _id: { $ne: req.body._id },
        "tags": {
            $regex: req.body.tags,
            $options: "si"
        },
        status: 0
    });

    if (tags) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Tags Name already exists in our database. '
        });
    }

    tags = await Tags.findByIdAndUpdate( req.body._id, { $set: { tags: req.body.tags } });

    return SendResponse(res, {data: tags, userMessage: 'Tags update successfully.'});
};/*-----  End of updateTags  ------*/

/*============================
***   removeTags  ***
==============================*/
methods.removeTags = async function(req, res) {
    let tags = await Tags.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data: tags, userMessage: 'Tags deleted.'});
};/*-----  End of removeTags  ------*/

/*==================================
***   Add Documents  ***
====================================*/
methods.addDocuments = async function(req, res) {
    req.checkBody('documents', 'Documents is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }
    let documents = Documents.findOne({
        documents: req.body.documents,
        status: 0
    });

    if (documents) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Documents already exist.'
        });
    }

    documents = await (new Documents(req.body)).save();

    return SendResponse(res,{ data: documents, userMessaged: 'Documents added successfully.'});
};/*-----  End of addDocuments  ------*/

/*=======================================
***   Get All Documents List  ***
=========================================*/
methods.getDocuments = async function(req, res) {
    let documents = await Documents.find({ status: 0 });

    return SendResponse(res, {data: documents, userMessage: 'Documents list.'});
};/*-----  End of getDocuments  ------*/


/*==========================
***   updateDocuments  ***
============================*/
methods.updateDocuments = async function(req, res) {
    req.checkBody('documents', 'Documents Name is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let documents = await Documents.findOne({
            _id: { $ne: req.body._id },
            "documents": { $regex: req.body.documents, $options: "si" },
            status: 0
        });

    if (documents) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Documents Name already exists in our database. '
        });
    }

    documents = await Documents.findByIdAndUpdate(
            req.body._id,
            { $set: { documents: req.body.documents } }
        );

    return SendResponse(res, {data: documents, userMessage: 'Documents update successfully.'});
};/*-----  End of updateDocuments  ------*/

/*============================
***   removeDocuments  ***
==============================*/
methods.removeDocuments = async function(req, res) {
    let documents = await Documents.update(
            { _id: { $in: req.body.idsArray } },
            { $set: { status: 1 } },
            { multi: true }
        );

    return SendResponse(res, {data: documents, userMessage: 'Documents deleted.'});
};/*-----  End of removeDocuments  ------*/

/*==================================
***   Add Trades  ***
====================================*/
methods.addTrades = async function(req, res) {
    req.checkBody('tradeRules', 'Trades is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let tradeRules = await Trades.findOne({
            "tradeRules": { $regex: req.body.tradeRules, $options: "si" },
            status: 0
        });

    if (tradeRules) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Trades already exist.'
        });
    }

    tradeRules = await (new Trades(req.body)).save();

    return SendResponse(res, {data: tradeRules, userMessage: 'Trades added successfully.'});
};/*-----  End of addTrades  ------*/

/*=======================================
***   Get All Trades List  ***
=========================================*/
methods.getTrades = async function(req, res) {
    let tradeRules = await Trades.find({ status: 0 });

    return SendResponse(res, {data: tradeRules, userMessage: 'Trades list.'});
};/*-----  End of getTrades  ------*/

/*==========================
***   updateTrades  ***
============================*/
methods.updateTrades = async function(req, res) {
    req.checkBody('tradeRules', 'tradeRules is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let tradeRules = await Trades.findOne({
        _id: { $ne: req.body._id },
        "tradeRules": { $regex: req.body.tradeRules, $options: "si" },
        status: 0
    });

    if (tradeRules) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Trades Name already exists in our database. '
        });
    }

    tradeRules = await Trades.findByIdAndUpdate(
            req.body._id,
            { $set: { tradeRules: req.body.tradeRules } }
        );

    return SendResponse(res, {data: tradeRules, userMessage: 'Trades update successfully.'});
};/*-----  End of updateTrades  ------*/

/*============================
***   removeTrades  ***
==============================*/
methods.removeTrades = async function(req, res) {
    let tradeRules = await Trades.update(
            { _id: { $in: req.body.idsArray } },
            { $set: { status: 1 } },
            { multi: true }
        );

    return SendResponse(res, {data: tradeRules, userMessage: 'Trades deleted.'});
};/*-----  End of removeTrades  ------*/

/*==================================
***   Add PaymentMethod  ***
====================================*/
methods.addPaymentMethod = async function(req, res) {
    req.checkBody('paymentMethod', 'PaymentMethod is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let paymentMethod = await PaymentMethod.findOne({
            paymentMethod: { $regex: req.body.paymentMethod, $options: "si" },
            status: 0
        });

    if (paymentMethod) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'PaymentMethod already exist.'
        });
    }
    paymentMethod = await (new PaymentMethod(req.body)).save();

    return SendResponse(res, {data: paymentMethod, userMessage: 'PaymentMethod added successfully.'});
};/*-----  End of addPaymentMethod  ------*/

/*=======================================
***   Get All PaymentMethod List  ***
=========================================*/
methods.getPaymentMethod = async function(req, res) {
    let paymentMethod = await PaymentMethod.find({ status: 0 });
    return SendResponse(res, {data: paymentMethod, userMessage: 'PaymentMethod list.'});
};/*-----  End of getPaymentMethod  ------*/

/*==========================
***   updatePaymentMethod  ***
============================*/
methods.updatePaymentMethod = async function(req, res) {
    req.checkBody('paymentMethod', 'paymentMethod is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let paymentMethod = await PaymentMethod.findOne({
            _id: { $ne: req.body._id },
            "paymentMethod": { $regex: req.body.paymentMethod, $options: "si" },
            status: 0
        });

    if (paymentMethod) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'PaymentMethod Name already exists in our database. '
        });
    }

    paymentMethod = await PaymentMethod.findByIdAndUpdate(
            req.body._id,
            { $set: { paymentMethod: req.body.paymentMethod } }
        );

    return SendResponse(res, {data: paymentMethod, userMessage: 'PaymentMethod update successfully.'});
};/*-----  End of updatePaymentMethod  ------*/

/*============================
***   removePaymentMethod  ***
==============================*/
methods.removePaymentMethod = async function(req, res) {
    let paymentMethod = await PaymentMethod.update(
            { _id: { $in: req.body.idsArray } },
            { $set: { status: 1 } },
            { multi: true }
        );

    return SendResponse(res, {data: paymentMethod, userMessage: 'PaymentMethod deleted.'});
};/*-----  End of removePaymentMethod  ------*/

/*==================================
***   Add PaymentTerms  ***
====================================*/
methods.addPaymentTerms = async function(req, res) {
    req.checkBody('paymentTerms', 'PaymentTerms is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let paymentTerms = await PaymentTerms.findOne({
            paymentTerms: { $regex: req.body.paymentTerms, $options: "si" },
            status: 0
        });

    if (paymentTerms) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'paymentTerms already exist.'
        });
    }

    paymentTerms = await (new PaymentTerms(req.body)).save();

    return SendResponse(res, {data: paymentTerms, userMessage: 'PaymentTerms added successfully.'});
};/*-----  End of addPaymentTerms  ------*/

/*=======================================
***   Get All PaymentTerms List  ***
=========================================*/
methods.getPaymentTerms = async function(req, res) {
    let paymentTerms = await PaymentTerms.find({ status: 0 });

    return SendResponse(res, {data: paymentTerms, userMessage: 'PaymentTerms list.'});
};/*-----  End of getPaymentTerms  ------*/

/*==========================
***   updatePaymentTerms  ***
============================*/
methods.updatePaymentTerms = async function(req, res) {
    req.checkBody('paymentTerms', 'PaymentTerms is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let paymentTerms = await PaymentTerms.findOne({
            _id: { $ne: req.body._id },
            "paymentTerms": { $regex: req.body.paymentTerms, $options: "si" },
            status: 0
        });

    if (paymentTerms) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'PaymentTerms Name already exists in our database. '
        });
    }

    paymentTerms = await PaymentTerms.findByIdAndUpdate(
            req.body._id,
            { $set: { paymentTerms: req.body.paymentTerms } }
        );

    return SendResponse(res, {data: paymentTerms, userMessage: 'PaymentTerms update successfully.'});
};/*-----  End of updatePaymentTerms  ------*/

/*============================
***   removePaymentTerms  ***
==============================*/
methods.removePaymentTerms = async function(req, res) {
    let paymentTerms = await PaymentTerms.update(
            { _id: { $in: req.body.idsArray } },
            { $set: { status: 1 } },
            { multi: true }
        );

    return SendResponse(res, {data: paymentTerms, userMessage: 'PaymentTerms deleted.'});
};/*-----  End of removePaymentTerms  ------*/

/*==================================
***   Add Variance  ***
====================================*/
methods.addVariance = async function(req, res) {
    req.checkBody('varianceName', 'Variance is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let variance = await Variance.findOne({
            varianceName: req.body.varianceName,
            status: 0
        });

    if (variance) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Variance already exist.'
        });
    }

    variance = await (new Variance(req.body)).save();

    return SendResponse(res, {data: variance, userMessage: 'Variance added successfully.'});
};/*-----  End of addVariance  ------*/

/*=======================================
***   Get All Variance List  ***
=========================================*/
methods.getVariance = async function(req, res) {
    let data = await Variance.find({ status: 0 });

    return SendResponse(res, {data, userMessage: 'Variance list.'});
};/*-----  End of getVariance  ------*/

/*==========================
***   updateVariance  ***
============================*/
methods.updateVariance = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('varianceName', 'Variance is required.').notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }
    let data = await Variance.findOne({
            _id: { $ne: req.body._id },
            varianceName: req.body.varianceName,
            status: 0
        });

    if (data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Variance Name already exists in our database. '
        });
    }

    data = await Variance.findByIdAndUpdate(
            req.body._id,
            { $set: { varianceName: req.body.varianceName } }
        );

    return SendResponse(res, {data, userMessage: 'Variance update successfully.'});
};/*-----  End of updateVariance  ------*/

/*============================
***   removeVariance  ***
==============================*/
methods.removeVariance = async function(req, res) {
    let data = await Variance.update(
            { _id: { $in: req.body.idsArray } },
            { $set: { status: 1 } },
            { multi: true }
        );

    return SendResponse(res, {data, userMessage: 'Variance deleted.'});
};/*-----  End of removeVariance  ------*/
