var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongoosePaginate = require('mongoose-paginate');

var salesContractHistory = new Schema({

    brokerNumber: {
        type: String,
        default: ''
    },
    commissionType: {
        type: String,
        default: ''
    },
    brokerCommision: {
        type: String,
        default: ''
    },
    brokerTaxNumber: {
        type: String,
        default: ''
    },
    showBroker: {
        type: Boolean,
        default: false
    },
    buyerReferenceNumber: {
        type: String,
        default: ''
    },
    gradeId: {
        type: ObjectId,
        ref: 'grade',
        default: null
    },
    inventoryGrade: {
        type: ObjectId,
        ref: 'grade',
        default: null
    },
    noOfPallets: {
        type: Number,
        default: 0
    },
    cropyear: {
        type: String,
        default: ''
    },
    tag: {
        type: String,
        default: ''
    },
    tagType: {
        type: ObjectId,
        ref: 'tags',
        default: null
    },
    countryId: {
        type: String,
        default: ''
    },
    contractQuantity: {
        type: String,
        default: ''
    },
    quantityLbs: {
        type: String,
        default: ''
    },
    units: {
        type: String,
        default: ''
    },
    packingUnit: {
        type: ObjectId,
        ref: 'bags',
        default: null
    },
    freightCompanyId: {
        type: ObjectId,
        ref: 'freight',
        default: null
    },
    netFOBCAD: {
        type: Number,
        default: 0
    },
    packedIn: {
        type: String,
        default: ''
    },
    loadingType: {
        type: String,
        default: ''
    },
    loadingPortId: {
        type: ObjectId,
        ref: 'loadingPort',
        default: null
    },
    equipmentType: {
        type: ObjectId,
        ref: 'equipment',
        default: null
    },
    noOfBags: {
        type: Number,
        default: 0
    },
    variance: {
        type: ObjectId,
        ref: 'variance',
        default: null
    },
    certificateAnalysis: {
        type: ObjectId,
        ref: 'certificateCost',
        default: null
    },
    equipmentId: {
        type: ObjectId,
        ref: 'equipment',
        default: null
    },
    destination: {
        type: String,
        default: ''
    },
    qualityClause: {
        type: String,
        default: ''
    },
    shippingOption: {
        type: String,
        default: ''
    },
    contractCurrency: {
        type: String,
        default: ''
    },
    amount: {
        type: String,
        default: ''
    },
    amountUnit: {
        type: String,
        default: ''
    },
    pricingTerms: {
        type: ObjectId,
        ref: 'pricingTerms',
        default: null
    },
    paymentTerms: {
        type: ObjectId,
        ref: 'paymentTerms',
        default: null
    },
    paymentMethod: {
        type: ObjectId,
        ref: 'paymentMethod',
        default: null
    },
    showDocuments: {
        type: Boolean,
        default: false
    },
    tradeRules: {
        type: ObjectId,
        ref: 'tradeRules',
        default: null
    },
    otherConditions: {
        type: String,
        default: ''
    },
    shippingComment: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: ''
    },
    contractNumber: {
        type: String,
        default: ''
    },
    brokerId: {
        type: ObjectId,
        ref: 'broker',
        default: null
    },
    commodityId: {
        type: ObjectId,
        ref: 'commodity',
        default: null
    },
    cropYear: {
        type: String,
        default: ''
    },
    amended: {
        type: Boolean,
        default: false
    },
    amendedDate: {
        type: Date
    },
    printAmended: {
        type: Boolean,
        default: true
    },
    amendedBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },
    exchangeRate: {
        type: Number,
        default: 0
    },
    exchangeDeduction: {
        type: Number,
        default: 0
    },
    unitFcl: {
        type: String,
        default: ''
    },
    shipmentScheldule: [],
    documents: [{
        type: ObjectId,
        ref: 'documents',
        default: null
    }],
    buyerId: {
        type: ObjectId,
        ref: 'buyer',
        default: null
    },
    country: {
        type: String,
        default: ''
    },
    pdfUrl: {
        type: String,
        default: ""
    },
    sampleApproval: {
        type: String,
        default: ""
    },
    salesContractId: {
        type: ObjectId,
        default: null,
        ref: 'salesContract',

    },
    createdBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
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
}, {
    timestamps: true
});

salesContractHistory.virtual('scale', {
    ref: 'scale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'contractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

salesContractHistory.plugin(mongoosePaginate);
mongoose.model('salesContractHistory', salesContractHistory);
