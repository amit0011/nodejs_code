var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var commodityPricing = new Schema({
    commodityId: {
        type: ObjectId,
        ref: 'commodity'
    },
    gradeId: {
        type: ObjectId,
        ref: 'grade'
    },
    cropYear: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    priceAsPer: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        default: 0
    },
    quantityUnit: {
        type: String,
        default: ''
    },
    unit: {
        type: String,
        default: ''
    },
    cdnCwt: {
        type: String,
        default: ''
    },
    margin: {
        type: Number,
        default: 0
    },
    targetFOB: {
        type: Number,
        default: ''
    },
    shippingPeriodFrom: {
        type: String,
        default: ''
    },
    shippingPeriodTo: {
        type: String,
        default: ''
    },
    bagged_USD_CWT_FOBPlant: {
        type: String,
        default: ''
    },
    bagged_USD_MT_FOBPlant: {
        type: String,
        default: ''
    },
    bulk_USD_MTFOBPlant: {
        type: String,
        default: ''
    },
    bagged_USD_MT_Montreal: {
        type: String,
        default: ''
    },
    bulk_USD_MT_Montreal: {
        type: String,
        default: ''
    },
    bagged_USD_MT_Vancouver: {
        type: String,
        default: ''
    },
    bulk_USD_MT_Vancouver: {
        type: String,
        default: ''
    },
    lastOpenedBy: {
        type: ObjectId,
        ref: 'admin'
    },
    lastOpenedOn: {
        type: Date,
        default: Date.now
    },
    lastEditedBy: {
        type: ObjectId,
        ref: 'admin'
    },
    lastEditedOn: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: ObjectId,
        ref: 'admin'
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },
    currencyType: {
        type: String,
        default: ''
    },
    shippingPeriodEntry: {
      type: String,
      enum: ['Manual', 'Default'],
      default: 'Default'
    }
}, { timestamps: true });

commodityPricing.plugin(mongoosePaginate);
mongoose.model('commodityPricing', commodityPricing);
