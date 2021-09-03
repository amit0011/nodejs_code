var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var FailedQuote = mongoose.model('failedquote');
const { SendResponse } = require("@ag-common");
const moment = require('moment');

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/failedquotes')
        .get(session.adminCheckToken, methods.getFailedQuote);
};

/*=======================================
***   Get All EDC List  ***
=========================================*/
methods.getFailedQuote = async function(req, res) {
    if (!req.query.date || (req.query.date && req.query.date == 'undefined' && req.query.date == 'null')) {
        return SendResponse(res, {
            status: 400, error: true,
            userMessage: 'date is required.',
        });
    }

    let data = await FailedQuote.aggregate([
        { $match: { date: new Date(req.query.date) } },
        { $project: { quotes: "$quoteIds", _id: 0 } },
        {
            $lookup: {
                from: 'quotes',
                foreignField: '_id',
                localField: 'quotes',
                as: 'quotes'
            }
        },
        { $unwind: { path: '$quotes', preserveNullAndEmptyArrays: false }},
        { $project: { buyerId: '$quotes.buyerId' }},
        { $lookup: {
            from: 'buyers',
            foreignField: '_id',
            localField: 'buyerId',
            as: 'buyer'
        }},
        { $unwind: { path: '$buyer', preserveNullAndEmptyArrays: false }},
        { $project: {
            _id: '$buyer._id',
            firstName: '$buyer.firstName',
            lastName: '$buyer.lastName',
            businessName: '$buyer.businessName',
        }}
    ]).exec();

    return SendResponse(res, {data, userMessage: 'failed quote list.'});
};/*-----  End of getEDC  ------*/
