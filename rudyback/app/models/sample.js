var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var productionRecordsSample = new Schema({
    growerId: {
        type: ObjectId,
        ref: 'grower'
    },
    commodityId: {
        type: ObjectId,
        ref: 'commodity'
    },
    gradeId: {
        type: ObjectId,
        ref: 'grade'
    },
    varietyId: {
        type: ObjectId,
        ref: 'variety'
    },
    quantityPound: {
        type: Number,
        default: 0
    },
    acres: {
        type: String,
        default: ''
    },
    sampleStatus: {
        type: String,
        default: ''
    },
    cropYear: {
        type: String,
        default: ''
    },
    bid: {
        type: Number,
        default: ''
    },
    target: {
        type: Number,
        default: ''
    },
    targetCWT: {
        type: Number,
        default: ''
    },
    farmersLot: {
        type: String,
        default: ''
    },
    unit: {
        type: String,
        default: ''
    },
    sampleAnalysis: [{
        analysisId: {
            type: ObjectId,
            ref: 'analysis'
        },
        analysisDetails: {
            type: String,
            default: ''
        }
    }],
    requestDate: {
        type: Date,
        default: ''
    },
    receiveDate: {
        type: Date,
        default: ''
    },
    oldSampleNumber: {
        type: Number,
        default: ''
    },
    sampleNumber: {
        type: Number,
        default: ''
    },
    commodityAnalysis: [{
        type: ObjectId,
        ref: 'analysis'
    }],
    comments: {
        type: String,
        default: ''
    },
    analyzed: {
        type: String,
        default: ''
    },
    dumped: {
        type: String,
        default: ''
    },
    dumpedBy: {
        type: ObjectId,
        ref: 'admin'
    },
    markForDump: {
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
        default: ''
    },
    createdBy: {
        type: ObjectId,
        ref: 'admin'
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    }
}, { timestamps: true });


productionRecordsSample.plugin(mongoosePaginate);
productionRecordsSample.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('productionRecordsSample', productionRecordsSample);
