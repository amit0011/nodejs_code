var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var byProductSchema = new Schema({
    scaleId: ObjectId,
    byProducts: {
        type: [{
            commodityId: ObjectId,
            quantityLbs: Number,
        }]
    },
});

var purchaseConfirmation = new Schema({
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
    cropyear: {
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
    priceCAD: {
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
    priceSplits: {
        type: String,
        default: ''
    },
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
    exchangeRate: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },
    statusBy: {
        type: ObjectId,
        ref: 'admin'
    },
    statusAt: {
        type: Date,
        default: Date.now
    },
    pdfUrl: {
        type: String,
        default: ""
    },
    chemicalDeclarationFileUrl: {
        type: String,
        default: ""
    },
    signedContractPdf: {
        type: String,
        default: ""
    },
    contractIsSigned: {
        type: Boolean,
        default: false
    },
    mailSent: {
        type: Boolean,
        default: false
    },
    mailSentDate: {
        type: Date
    },
    mailSentBy: {
        type: ObjectId,
        default: null,
        ref: 'admin'
    },
    allPDF: [{
        date: {
            type: Date,
            default: Date.now
        },
        pdfUrl: {
            type: String,
            default: ''
        },
        updatedBy: {
            type: ObjectId,
            default: null
        }
    }],
    rolloverCN: {
        type: String,
        default: ''
    },
    originalCN: {
        type: String,
        default: ''
    },
    byProductsByScale: {
        type: [byProductSchema],
        default: [],
    },
}, { timestamps: true });

purchaseConfirmation.virtual('scale', {
    ref: 'scale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'contractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

purchaseConfirmation.plugin(mongoosePaginate);
mongoose.model('purchaseConfirmation', purchaseConfirmation);
