var multer = require('multer');
var excel2Json = require('node-excel-to-json');
const { SendResponse } = require("@ag-common");

var validation = {};

//validate file uplaoded to create users
validation.checkUsersFile = function(req, res, next) {
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    filename: function(req, file, cb) {
      req.fileName = file.originalname;
      var ext = req.fileName.split('.').pop();
      if (ext != 'xls' && ext != 'xlsx')
        req.error = "file format not supported";

      cb(null, req.fileName);
    }
  });

  var uploadfile = multer({
    storage: storage
  }).single('file');

  uploadfile(req, res, function(err) {
    if (err) {
      return SendResponse(res, {
        error: true, status: 500, errors: err,
        userMessage: 'server error'
      });
    }

      if (req.error) {
        return SendResponse(res, {
          error: true, status: 400, userMessage: req.error
        });
      } else if (!req.fileName) {
        return SendResponse(res, {
          error: true, status: 400,
          userMessage: 'Excel file containing users information is missing.'
        });
      }

      excel2Json(filePath + '/' + req.fileName, function(err, output) {
        if (err) {
          return SendResponse(res, {
            error: true, status: 400, userMessage: req.error
          });
        } else if (!output) {
          return SendResponse(res, {
            error: true, status: 400,
            userMessage: 'File contains invalid data'
          });
        }

        var valid = false, keys;
        if (req.query.type == 'country') {
          keys = ["Name", "City", "Country"];
        } else if (req.query.type == 'trucker') {
          keys = ["Truckers"];
        } else if (req.query.type == 'broker') {
          keys = ["Company", "FirstName", "LastName"];
        } else if (req.query.type == 'phone') {
          keys = ["reference", "notes", "TS"];
        } else if (req.query.type == 'buyer') {
          keys = ["kpID", "businessName", "addstreet"];
        } else {
          keys = ["FirstName", "LastName"];
        }

        var errorMessage = 'File contains invalid data';
        req.sheets = [];
        Object.keys(output).map(function(sheet) {
          req.sheets.push(output[sheet]);
          if (output[sheet].length != 0) {
            valid = true;
            var user = output[sheet][0];
            if (user) {
              keys.map(function(key) {
                if (Object.keys(user).indexOf(key) < 0) {
                  valid = false;
                  errorMessage = "Each Sheet must contains " + keys.join(', ') + '.';
                }
              });
            } else {
              valid = false;
              errorMessage = "Sheet contains invalid data";
            }
          }
        });

        if (!valid) {
          return SendResponse(res, {
            error: true, status: 400,
            userMessage: errorMessage
          });
        } else {
          next();
        }
      });
  });
};

module.exports = validation;
