var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var scaleHistory = new Schema({
    displayOnTicket: {
        type: String,
        default: ''
    },
    scaleId: {
        type: ObjectId,
        default: null,
        ref: 'scale'
    },
    delGrade: {
        type: String,
        default: ''
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
    allow: {
        type: Number,
        default: 0
    },
    splitTotal: {
        type: String,
        default: ''
    },
    splitTotalWeight: {
        type: Number,
        default: 0
    },
    totalDamage: {
        type: Number,
        default: 0
    },
    totalDamageMT: {
        type: Number,
        default: 0
    },
    moistureAdjustment: {
        type: Number,
        default: 0
    },
    moistureAdjustmentWeight: {
        type: Number,
        default: 0
    },
    dockageTotal: {
        type: Number,
        default: 0
    },
    dockageTotalWeight: {
        type: Number,
        default: 0
    },
    dockageCompleted: { //Yes/No
        type: Boolean,
        default: false
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
    netWeight: { //calculated weight after deducting Dockage
        type: Number,
        default: 0
    },
    netTotalWeight: {
        type: Number,
        default: 0
    },
    comments: {
        type: String,
        default: ''
    },
    analysis: [{
        analysisId: {
            type: ObjectId,
            ref: 'analysis'
        },
        value: {
            type: Number,
            default: 0
        },
        weight: {
            type: Number,
            default: 0
        },
        weightMT: {
            type: Number,
            default: 0
        }
    }],

    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },

    createdBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },
    contractNumber: {
        type: String,
        default: ''
    },
    pdfUrl: String,
    void: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

scaleHistory.plugin(mongoosePaginate);
mongoose.model('scaleHistory', scaleHistory);
