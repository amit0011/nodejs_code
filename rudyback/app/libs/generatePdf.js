var pdf = require("html-pdf");
var AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
});
var sales = require("../Htmls/salesContractHtml");
var production = require("../Htmls/productionContractHtml");
var purchase = require("../Htmls/purchaseConfirmationHtml");
var tradePurchase = require("../Htmls/tradePurchaseHtml");
var quote = require("../Htmls/quoteHtml");
var scaleIncoming = require("../Htmls/incomingScaleTicketHtml");
var scaleOutgoing = require("../Htmls/outgoingScaleTicketHtml");
var tradePurchaseScale = require("../Htmls/tradePurchaseScaleTicketHtml");
var growerLoadSheet = require("../Htmls/growerLoadSheet");
var scaleOutgoingSeed = require("../Htmls/outgoingSeedScaleTicketHtml");
var salesStamp = require("../Htmls/salesStampHtml");
var contractTicket = require("../Htmls/contractTicketHtml");
const billOfLading = require("../Htmls/straightBillOfLadingHtml");
const moment = require("moment");

module.exports = {
  generatePDF(type, data, callback) {
    const func = this.generatePDF;

    if (!callback) {
      return new Promise((resolve, reject) => {
        func(type, data, function (err, data) {
          err ? reject(err) : resolve(data);
        });
      });
    }

    var html = "",
      options = {};
    if (type == "sales") {
      html = sales.salesContractHtml(data);
      options = {
        format: "Letter",
        orientation: "portrait",
        border: {
          top: "0.2in", // default is 0, units: mm, cm, in, px
          right: "0.2in",
          bottom: "in",
          left: "0.2in",
        },
      };
    } else if (type == "production") {
      html = production.productionContractHTML(data);
      options = {
        format: "A4",
        orientation: "portrait",
        border: {
          top: "0.4in", // default is 0, units: mm, cm, in, px
          right: "0.2in",
          bottom: "0.4in",
          left: "0.1in",
        },
      };
    } else if (type == "billOfLading") {
      html = billOfLading.straightBillOfLadingHtml(data);
      options = {
        format: "A4",
        orientation: "portrait",
        border: {
          top: "0.4in", // default is 0, units: mm, cm, in, px
          right: "0.2in",
          bottom: "0.4in",
          left: "0.1in",
        },
      };
    } else if (type == "purchase") {
      html = purchase.purchaseConfirmationHTML(data);
      options = {
        format: "A4",
        orientation: "portrait",
        border: {
          top: "0.4in",
          right: "0.2in",
          bottom: "0.4in",
          left: "0.1in",
        },
      };
    } else if (type == "tradePurchase") {
      html = tradePurchase.tradePurchaseHtml(data);
      options = {
        format: "A4",
        orientation: "portrait",
        border: {
          top: "0.4in",
          right: "0.2in",
          bottom: "0.4in",
          left: "0.1in",
        },
      };
    } else if (type == "quote") {
      html = quote.quoteHtml(data.quote, data.currency, data.weather);
      options = {
        format: "A4",
        orientation: "landscape",
      };
    } else if (type == "incomingScaleTicket") {
      html = scaleIncoming.incomingScaleTicket(data);
      options = {
        format: "Letter",
        orientation: "portrait",
        border: {
          top: "0.2in", // default is 0, units: mm, cm, in, px
          right: "0.2in",
          bottom: "0.2in",
          left: "0.2in",
        },
      };
    } else if (type == "outgoingScaleTicket") {
      html = scaleOutgoing.outgoingScaleTicket(data);
      options = {
        format: "Letter",
        orientation: "portrait",
        border: {
          top: "20px",
          right: "10px",
          bottom: "20px",
          left: "10px",
        },
      };
    } else if (type == "tradePurchaseScaleTicket") {
      html = tradePurchaseScale.tradePurchaseScaleTicket(data);
      options = {
        format: "Letter",
        orientation: "portrait",
        border: {
          top: "20px",
          right: "10px",
          bottom: "20px",
          left: "10px",
        },
      };
    } else if (type == "growerLoadSheet") {
      html = growerLoadSheet.html(data);
      options = {
        format: "Letter",
        orientation: "portrait",
        border: {
          top: "20px",
          right: "10px",
          bottom: "20px",
          left: "10px",
        },
      };
    } else if (type == "outgoingSeedScaleTicket") {
      html = scaleOutgoingSeed.outgoingSeedScaleTicket(data);
      options = {
        format: "Letter",
        orientation: "portrait",
        border: {
          top: "20px",
          right: "10px",
          bottom: "20px",
          left: "10px",
        },
      };
    } else if (type == "salesStamp") {
      html = salesStamp.salesStampHtml(data);
      options = {
        format: "Letter",
        orientation: "portrait",
        border: {
          top: "25px",
          right: "10px",
          bottom: "25px",
          left: "10px",
        },
      };
    } else if (type == "contractTicket") {
      html = contractTicket.contractTicketHtml(data);
      options = {
        format: "Letter",
        orientation: "portrait",
        border: {
          top: "25px",
          right: "10px",
          bottom: "25px",
          left: "10px",
        },
      };
    } else {
      callback("Invalid type", null);
    }

    let bucketName = `${process.env.S3_BUCKET}/${data._id}`;

    let file_name = type + "-" + data._id + ".pdf";

    //convert html to buffer
    pdf.create(html, options).toBuffer(function (err, buffer) {
      var s3 = new AWS.S3();
      var params = {
        Bucket: bucketName,
        Key: file_name,
        Body: buffer,
        ContentType: "application/pdf",
        ACL: "public-read",
      };
      s3.putObject(params, function (perr, pres) {
        if (perr) {
          callback(perr, null);
        } else {
          var urlParams = {
            Bucket: bucketName,
            Key: file_name,
          };
          // get uploaded pdf url
          s3.getSignedUrl("getObject", urlParams, function (err, url) {
            callback(err, url.split("?")[0] + "?token=" + moment().unix());
          });
        }
      });
    });
  },
};
