var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var scaleOutgoingHistory = new Schema({
    contractNumber: {
        type: String,
        default: ''
    },
    gradeId: {
        type: ObjectId,
        default: null,
        ref: 'grade'
    },
    outgoingScaleId: {
        type: ObjectId,
        default: null,
        ref: 'scale'
    },
    weigher: {
        type: String,
        default: ''
    },
    dockageBy: {
        type: String,
        default: ''
    },
    receiptType: {
        type: String,
        default: ''
    },
    vehicleInstected: {
        type: Boolean,
        default: false
    },
    infestationCheck: {
        type: Boolean,
        default: false
    },
    specificationMet: {
        type: String,
        default: ''
    },
    analysisCompleted: {
        type: Boolean,
        default: false
    },
    void: {
        type: Boolean,
        default: false
    },
    analysis: [{
        analysisId: {
            type: ObjectId,
            ref: 'analysis'
        },
        value: {
            type: Number,
            default: 0
        }
    }],
    allow: {
        type: Number,
        default: 0
    },
    contractExtra: {
        type: String,
        default: ''
    },
    partyContract: {
        type: String,
        default: ''
    },
    trackUnit: {
        type: String,
        default: ''
    },
    seal: {
        type: String,
        default: ''
    },
    cleanBinNumber: {
        type: String,
        default: ''
    },
    lotNumber: {
        type: String,
        default: ''
    },
    invoiceNumber: {
        type: String,
        default: ''
    },
    moistureAdjustment: {
        type: Number,
        default: 0
    },
    moistureAdjustmentWeight: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: ''
    },
    inTime: {
        type: String,
        default: ''
    },
    exitTime: {
        type: String,
        default: ''
    },
    binNumber: {
        type: ObjectId,
        default: null,
        ref: 'bin'
    },
    moisture: { //percentage of moisture
        type: Number,
        default: 0
    },
    size: {
        type: String,
        default: ''
    },
    sizeKabuli: [{ //mm
        size7: {
            type: Number,
            default: 0
        },
        size8: {
            type: Number,
            default: 0
        },
        size9: {
            type: Number,
            default: 0
        },
        size10: {
            type: Number,
            default: 0
        }
    }],
    truckingCompany: {
        type: ObjectId,
        ref: 'trucker',
        default: null
    },
    truckerBL: {
        type: String,
        default: ''
    },
    containeNumber: {
        type: String
    },
    grossWeight: {
        type: Number,
        default: 0
    },
    grossWeightMT: {
        type: Number,
        default: 0
    },
    tareWeight: {
        type: Number,
        default: 0
    },
    tareWeightMT: {
        type: Number,
        default: 0
    },
    unloadWeidht: { //gross - tare
        type: Number,
        default: 0
    },
    unloadWeidhtMT: { //gross - tare
        type: Number,
        default: 0
    },
    comments: {
        type: String,
        default: ''
    },
    printComment: {
        type: Boolean,
        default: false
    },
    bagId: {
        type: ObjectId,
        default: null,
        ref: 'bags'
    },
    numberOfBags: {
        type: Number,
        default: 0
    },
    bagsWeight: {
        type: Number,
        default: 0
    },
    weightOfBags: {
        type: Number,
        default: 0
    },
    totalPackagingWeight: {
        type: Number,
        default: 0
    },
    palletsWeight: {
        type: Number,
        default: 0
    },
    numberOfPallets: {
        type: Number,
        default: 0
    },
    weightOfPallets: {
        type: Number,
        default: 0
    },
    targetWeight: {
        type: Number,
        default: 0
    },
    cardboardSlipWeight: {
        type: Number,
        default: 0
    },
    countOfCardboardSlip: {
        type: Number,
        default: 0
    },
    weightOfCardboardSlip: {
        type: Number,
        default: 0
    },
    netWeightPerBag: {
        type: Number,
        default: 0
    },
    plasticeWeight: {
        type: Number,
        default: 0
    },
    countOfPlastic: {
        type: Number,
        default: 0
    },
    weightOfPlastic: {
        type: Number,
        default: 0
    },
    overUnderTarget: {
        type: Number,
        default: 0
    },
    bulkHeadWeight: {
        type: Number,
        default: 0
    },
    countOfBulkHead: {
        type: Number,
        default: 0
    },
    weightOfBulkHead: {
        type: Number,
        default: 0
    },
    cardboardLength: {
        type: Number,
        default: 0
    },
    weightOfCardboard: {
        type: Number,
        default: 0
    },
    weightOfOtherPackage: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },
    productWeight: {
        type: Number
    },

    createdBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },

    pdfUrl: String,

}, {
    timestamps: true
});

scaleOutgoingHistory.plugin(mongoosePaginate);
mongoose.model('scaleOutgoingHistory', scaleOutgoingHistory);
