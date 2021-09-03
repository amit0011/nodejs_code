var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var reportRowSchema = new Schema({
    commodityId: {
        type: ObjectId,
        ref: "commodity"
    },
    inventoryGrade: {
        type: ObjectId,
        ref: "grade"
    },
    totalSale: {
        type: Number,
        default: 0
    },
    total_production_purchase: {
        type: Number,
        default: 0
    },
    total_salesAvg: {
        type: Number,
        default: 0
    },
    total_weightedAvg: {
        type: Number,
        default: 0
    }
});

var reportSchema = new Schema({
    data: [reportRowSchema],
    totalPurchase: {
        type: Number,
        default: 0
    },
    totalSale: {
        type: Number,
        default: 0
    },
    totalSalesAvg: {
        type: Number,
        default: 0
    },
    totalWeightedAvg: {
        type: Number,
        default: 0
    },
});

var positionReport = new Schema({
    cropYear: String,
    report: reportSchema,
    updatedAt: Date
}, { timestamps: true });

positionReport.plugin(mongoosePaginate);
mongoose.model('positionreport', positionReport);
