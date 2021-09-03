var AWS = require('aws-sdk');
AWS.config.update({
    "accessKeyId": process.env.accessKeyId,
    "secretAccessKey": process.env.secretAccessKey,
    "region": process.env.region
});
const json2xls = require('json2xls');
const moment = require('moment');

module.exports = {
    generate: function(type, data, callback) {
        let bucketName = `${process.env.S3_BUCKET}/${type}`;

        const initials = Array.from(type).filter(ch => {return ch.toUpperCase() == ch;}).join('');
        let file_name = `${initials}-${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;

        const xlsData = json2xls(data);
        const xlsBinaryData = Buffer.from(xlsData, 'binary');

        var s3 = new AWS.S3();
        var params = {
            Bucket: bucketName,
            Key: file_name,
            Body: xlsBinaryData,
            ContentType: 'application/vnd.openxmlformats',
            ACL: 'public-read'
        };
        s3.putObject(params, function(perr) {
            if (perr) {
                callback(perr, null);
            } else {
                var urlParams = {
                    Bucket: bucketName,
                    Key: file_name
                };
                // get uploaded pdf url
                s3.getSignedUrl('getObject', urlParams, function(err, url) {
                    callback(err, url.split("?")[0]);
                });
            }
        });
    }
};
