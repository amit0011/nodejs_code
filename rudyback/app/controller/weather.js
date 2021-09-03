var mongoose = require('mongoose');
var session = require('@ag-libs/session');
var Weather = mongoose.model('weather');
var multer = require('multer');
var weather = require('weather-js');
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route('/weather')
        .post(session.adminCheckToken, methods.addWeather)
        .get(session.adminCheckToken, methods.getWeather)
        .put(session.adminCheckToken, methods.updateWeather);

    router
        .route('/weather/delete')
        .post(session.adminCheckToken, methods.removeWeather);

    router
        .route('/weather/upload')
        .post(session.adminCheckToken, methods.uploadImages);

    router
        .route('/weather/getWeather')
        .get(session.adminCheckToken, methods.getActiveWeather);

    router
        .route('/weather/weatherReport')
        .get(session.adminCheckToken, methods.weatherReport);
};

methods.getActiveWeather = async (req, res) => {
    let data = await Weather.findOne({ status: 0 }, 'weather');

    return SendResponse(res, {data, userMessage: 'Weather find.'});
};

/*=============================
    ***   uploadImages  ***
===============================*/
methods.uploadImages = function(req, res) {
    var fileName = "";
    var storage = multer.diskStorage({
        destination: function(req, file, cb) { cb(null, imagePath); },
        filename: function(req, file, cb) {
            fileName = Date.now() + '.' + file.originalname.split(".").pop();
            cb(null, fileName);
        }
    });

    var uploadfile = multer({ storage: storage }).single('avatar');

    uploadfile(req, res, function(err) {
        if (err) {
            return SendResponse(res, {
                error: true, status: 500, errors: err,
                userMessage: "some error occurred in file uploading"
            });
        }

        return SendResponse(res, {
            data: "/images/" + fileName,
            userMessage: "Profile image uploaded."
        });
    });
};/*-----  End of uploadImages  ------*/

/*=============================
***   Add New Weather  ***
===============================*/
methods.addWeather = async function(req, res) {
    //Check for POST request errors.
    req.checkBody('weather', 'weather is required.').notEmpty();
    req.checkBody('weatherMap', 'weatherMap is required.').notEmpty();
    req.checkBody('plantJpeg', 'plantJpeg is required.').notEmpty();

    let errors = req.validationErrors(true);
    if (errors) {
        return SendResponse(res, {
            error: true, status: 400, errors,
            userMessage: 'Validation errors'
        });
    }

    let data = await (new Weather(req.body)).save();

    return SendResponse(res, {data, userMessage: 'Weather added successfully.'});
};/*-----  End of addWeather  ------*/

/*=======================================
***   Get All Weather List  ***
=========================================*/
methods.getWeather = async function(req, res) {
    let data;
    var options = {
        sort: { createdAt: -1 },
        page: req.query.page,
        limit: 10
    };
    var condition = { status: 0 };

    if (req.query.search) {
        condition = {
            status: 0,
            city: { $regex: ".*" + req.query.search + ".*", $options: 'i' }
        };
        data = await Weather.paginate(condition, options);
    } else if (!req.query.page) {
        data = await Weather.find(condition);
    } else {
        data = await Weather.paginate(condition, options);
    }

    return SendResponse(res, {data, userMessage: 'Weather list.'});
};/*-----  End of get Bag  ------*/

/*========================
***   Update Weather  ***
==========================*/
methods.updateWeather = async function(req, res) {
    let data = await Weather.findOne({ _id: req.body._id });

    if (!data) {
        return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'Bag details not found.'
        });
    }

    data.weather = req.body.weather || data.weather;
    data.weatherMap = req.body.weatherMap || data.weatherMap;
    data.plantJpeg = req.body.plantJpeg || data.plantJpeg;
    data = await data.save();

    return SendResponse(res, {data, userMessage: 'Weather updated.'});
};/*-----  End of updateWeather  ------*/

/*============================
***   remove Weather  ***
==============================*/
methods.removeWeather = async function(req, res) {
    let data = await Weather.update(
        { _id: { $in: req.body.idsArray } },
        { $set: { status: 1 } },
        { multi: true }
    );

    return SendResponse(res, {data, userMessage: 'Weather deleted.'});
};/*-----  End of removeWeather  ------*/

methods.weatherReport = function(req, res) {
    weather.find({ search: 'Outlook, Saskatchewan',
        degreeType: 'C'
    }, function(err, data) {
        if (err) {
            return SendResponse(res, {
                error: true, status: 500, errors: err,
                userMessage: "some server error has occurred."
            });
        }
        return SendResponse(res, {data, userMessage: "weather details"});
    });
};
