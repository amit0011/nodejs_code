//load local config
if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}
require('module-alias/register');

var express = require('express');
require('express-async-errors');
var app = express();
var config = require('@ag-config/config');

var fs = require('fs');
var mongoose = require('mongoose');
const { SendResponse } = require("@ag-common");

mongoose.Promise = global.Promise;
var port = process.env.PORT || 9095; // set our port
global.imagePath = __dirname + '/images';
global.mediaPath = __dirname + '/media';
global.fcmKey = config.fcmKey;
global.filePath = __dirname + '/files';

// Connect to mongodb
var connect = function() {
    console.log(config.db);
    mongoose.connect(config.db, {useMongoClient: true})
      .then(() => { console.log("Mongo is connected successfully..."); });
};

connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(__dirname + '/app/models').forEach(function(file) {
    if (~file.indexOf('.js')) require(__dirname + '/app/models/' + file);
});

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

// Bootstrap application settings
require('./config/express')(app);
// Bootstrap routes
var router = express.Router();
require('./config/routes')(router);
app.use('/api', router);
app.use('/images', express.static('images'));
app.use('/media', express.static('media'));

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    return SendResponse(res, {
      error: true, status: 500, errors: err,
      userMessage: 'Some server error has occurred.'
    });
});

app.listen(port, () => {
    console.log('API started, Assigned port : ' + port);
});

module.exports = app;
