var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

const byProductSchema = new Schema({
    byProduct: {
        type: ObjectId,
        required: true,
        ref: 'commodityType',
    },
    specs: [{
        type: ObjectId,
        ref: 'analysis',
    }],
    willHaveTotalDamage: {
        type: Boolean,
        default: false
    },
});

var commodity = new Schema({
    commodityCode: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    commodityName: {
        type: String,
        default: ''
    },
    commodityAlias: {
        type: String,
        default: ''
    },
    commodityTypeId: {
        type: ObjectId,
        ref: 'commodityType'
    },
    organic: {
      type: Boolean,
      default: false
    },
    commodityGrade: [{
        type: ObjectId,
        ref: 'grade'
    }],
    commoditySampleAnalysis: [{
        type: ObjectId,
        ref: 'analysis'
    }],
    commodityDeliveryAnalysis: [{
        type: ObjectId,
        ref: 'analysis'
    }],
    commodityShowDeliveryAnalysis: [{
        type: ObjectId,
        ref: 'analysis'
    }],
    commodityShipmentAnalysis: [{
        type: ObjectId,
        ref: 'analysis'
    }],
    commodityShowShipmentAnalysis: [{
        type: ObjectId,
        ref: 'analysis'
    }],
    commodityWeight: {
        type: Number,
        default: 0
    },
    commodityWeightType: {
        type: String,
        default: ''
    },
    hsnCode: {
        type: String,
        default: '',
    },
    sieveSizeNote: String,
    createdBy: {
        type: ObjectId,
        ref: 'admin'
    },
    deleteStatus: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },

    // This array will have list of commodities of type byProduct
    byProducts: [{
        type: byProductSchema,
    }],

    // This field will be true if commodity itself will be byProduct
    isByProduct: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

var commodityType = new Schema({
    commodityTypeName: {
        type: String,
        default: ''
    },
    parentTypeId: {
        type: ObjectId,
        ref: 'commodityType'
    },
    byProducts: [{
        type: ObjectId,
        ref: 'commodityType'
    }],
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },
    willHaveTotalDamage: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

mongoose.model('commodity', commodity);
mongoose.model('commodityType', commodityType);
