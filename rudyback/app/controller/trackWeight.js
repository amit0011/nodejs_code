var mongoose = require('mongoose');
var Track = mongoose.model('trackWeight');
var async = require('async');
const moment = require('moment');
const _ = require('lodash');
const { SendResponse } = require("@ag-common");

var methods = {};

function initDB() {
    async.waterfall([
        function(callback) {
            Track.find({}, function(err, result) {
                if (err) throw err;
                callback(null, result);
            });
        },
        function(trackWeight, callback) {
            if (trackWeight.length > 0)
                callback(null, {
                    trackWeight: trackWeight
                });
            else {
                var defaultTrack = {
                    weight: 0,
                    unit: '',
                    status: 'M'
                };
                trackWeight = new Track(defaultTrack);
                trackWeight.save(function() {
                    callback(null, { trackWeight: defaultTrack });
                });
            }
        }
    ], function(err) {
        if (err) throw err;
    });
}
initDB();

/*
Routings/controller goes here
*/
module.exports.controller = function(router) {
    router
        .route('/track/weight')
        .post(methods.addTrack)
        .get(methods.getTrack);
};

/*=============================
***   Add Track  ***
===============================*/
methods.addTrack = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('weight', 'weight is required.').notEmpty();
    var errors = req.validationErrors(true);

    if (errors) {
        return SendResponse(res, { error: true, status: 400, errors, userMessage: 'Validation errors' });
    }

    let data = await Track.findOne({});
    let body =  _.clone(req.body);
    if (!body.updatedAt) {
        body.updatedAt = moment();
    }

    data = await Track.findByIdAndUpdate(data._id, body, { new: true });

    return SendResponse(res, { data, userMessage: 'Track weight updated successfully.' });
};/*-----  End of addTrack  ------*/

/*=======================================
***   Get All Track  ***
=========================================*/
methods.getTrack = async function(req, res) {
    const data = await Track.findOne({});

    return SendResponse(res, { data, userMessage: 'track details.' });
};/*-----  End of gettrack  ------*/
