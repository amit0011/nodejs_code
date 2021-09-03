var mongoose = require("mongoose");
var session = require("@ag-libs/session");
var commodityadjustment = mongoose.model("commodityAdjustment");
const { SendResponse } = require("@ag-common");

var methods = {};

module.exports.controller = function(router) {
    router
        .route("/commodityAdjustment")
        .post(session.adminCheckToken, methods.addCommodityAdjustment);
};

/*=============================
***   Add New addCommodityAdjustment  ***
===============================*/
methods.addCommodityAdjustment = async function(req, res) {
    req.checkBody("purchaseSale", "Purchase/Sale is required.").notEmpty();
    req.checkBody("qtyCwt", "Qty CWT  is required.").notEmpty();
    req.checkBody("amount", "Price Name  is required.").notEmpty();
    var errors = req.validationErrors(true);
    if (errors) {
    return SendResponse(res, {
        error: true,
        status: 400,
        errors,
        userMessage: "Validation errors"
    });
    }
    req.body.createdBy = req.admin._id;
    const data = await new commodityadjustment(req.body).save();
    return SendResponse(res, { data, userMessage: "Commodity adjustment added successfully." });
}; /*-----  End of addCommodityAdjustment  ------*/


