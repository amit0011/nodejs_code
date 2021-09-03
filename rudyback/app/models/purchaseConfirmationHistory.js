var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongoosePaginate = require('mongoose-paginate');

var purchaseConfirmationHistory = new Schema({

    contractNumber: {
        type: String,
        default: ''
    },
    nameOfContract: {
        type: String,
        default: ''
    },
    signee: {
        type: ObjectId,
        ref: 'admin'
    },
    commodityId: {
        type: ObjectId,
        ref: 'commodity'
    },
    gradeId: {
        type: ObjectId,
        ref: 'grade'
    },
    growerId: {
        type: ObjectId,
        ref: 'grower'
    },
    brokerId: {
        type: ObjectId,
        ref: 'broker'
    },
    purchaseConfirmationId: {
        type: ObjectId,
        default: null,
        ref: 'purchaseConfirmation',

    },

    personFarmType: {
        type: String,
        default: ''
    },
    quantityLbs: {
        type: Number,
        default: 0
    },
    farmName: {
        type: String,
        default: ''
    },
    cropYear: {
        type: String,
        default: ''
    },

    shipmentPeriodFrom: {
        type: Date,
        default: ''
    },
    shipmentPeriodTo: {
        type: Date,
        default: ''
    },
    deliveryPoint: {
        type: String,
        default: ''
    },
    contractQuantity: {
        type: Number,
        default: 0
    },
    quantityUnit: {
        type: String,
        default: ''
    },
    splitsPrice: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    priceUnit: {
        type: String,
        default: ''
    },
    priceCurrency: {
        type: String,
        default: ''
    },
    // priceSplits: {
    //     type: String,
    //     default: ''
    // },
    otherConditions: {
        type: String,
        default: ''
    },
    paymentTerms: {
        type: String,
        default: ''
    },
    specifications: {
        type: String,
        default: ''
    },
    sampleNumber: {
        type: ObjectId,
        default: null,
        ref: 'productionRecordsSample'
    },
    settlementInstructions: {
        type: String,
        default: ''
    },
    settlementComments: {
        type: String,
        default: ''
    },
    freightRatePerMT: {
        type: Number,
        default: 0
    },
    CWTDel: {
        type: Number,
        default: 0
    },
    delQty: {
        type: Number,
        default: 0
    },
    freightEstimate: {
        type: Number,
        default: 0
    },
    freightActual: {
        type: Number,
        default: 0
    },
    inventoryGrade: {
        type: ObjectId,
        ref: 'grade'
    },
    history: {
        type: String,
        default: ''
    },
    backDate: {
        type: Date,
        default: Date.now
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
        default: 0
    },
    statusBy: {
        type: ObjectId,
        ref: 'admin'
    },
    statusAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

purchaseConfirmationHistory.virtual('scale', {
    ref: 'scale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'contractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

purchaseConfirmationHistory.plugin(mongoosePaginate);
mongoose.model('purchaseConfirmationHistory', purchaseConfirmationHistory);
