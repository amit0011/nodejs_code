var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongoosePaginate = require('mongoose-paginate');

var tradePurchase = new Schema({
    date: {
        type: Date,
        default: ''
    },
    signee: {
        type: ObjectId,
        ref: 'admin'
    },
    contractNumber: {
        type: String,
        default: ''
    },
    buyerId: {
        type: ObjectId,
        ref: 'buyer'
    },
    // growerId: {
    //     type: ObjectId,
    //     ref: 'grower'
    // },
    brokerId: {
        type: ObjectId,
        ref: 'broker'
    },

    freightCompanyId: {
        type: String,
        default: ''
    },

    freight: {
        type: String,
        default: ''
    },

    brokerCommision: {
        type: String,
        default: ''
    },
    showBroker: {
        type: Boolean,
        default: false
    },
    isVerify: {
        type: Boolean,
        default: false
    },
    showDocuments: {
        type: Boolean,
        default: false
    },
    brokerNumber: {
        type: String,
        default: ''
    },
    brokerTaxNumber: {
        type: String,
        default: ''
    },
    buyerReferenceNumber: {
        type: String,
        default: ''
    },
    commissionType: {
        type: String,
        default: ''
    },
    qualityClause: {
        type: String,
        default: ''
    },
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
    unitFcl: {
        type: String,
        default: ''
    },
    contractYear: {
        type: String,
        default: ''
    },
    countryId: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    packingUnit: {
        type: ObjectId,
        ref: 'bags'
    },
    loadingType: {
        type: String,
        default: ''
    },
    noOfPallets: {
        type: Number,
        default: 0
    },
    tag: {
        type: String,
        default: ''
    },
    tagType: {
        type: ObjectId,
        ref: 'tags'
    },
    contractQuantity: {
        type: String,
        default: ''
    },
    shippingQty: {
        type: Number,
        default: 0
    },
    freightCWT: {
        type: String,
        default: ''
    },
    shippingQtyLbs: {
        type: Number,
        default: 0
    },
    units: {
        type: String,
        default: ''
    },
    variance: {
        type: ObjectId,
        ref: 'variance'
    },
    quantityLbs: {
        type: Number,
        default: 0
    },
    cwtQuantity: {
        type: Number,
        default: 0
    },
    packedIn: {
        type: String,
        default: ''
    },
    equipmentId: {
        type: ObjectId,
        ref: 'equipment'
    },
    noOfBags: {
        type: Number,
        default: 0
    },
    exchangeRate: {
        type: Number,
        default: 0
    },
    bagWeight: {
        type: String,
        default: ''
    },
    certificateAnalysis: {
        type: ObjectId,
        ref: 'certificateCost'
    },
    equipmentType: {
        type: ObjectId,
        ref: 'equipment'
    },
    methodOfShipment: {
        type: ObjectId,
        ref: 'equipment'
    },
    loadingPortId: {
        type: ObjectId,
        ref: 'loadingPort'
    },
    destination: {
        type: String,
        default: ''
    },
    shippingComment: {
        type: String,
        default: ''
    },
    shippingOption: {
        type: String,
        default: ''
    },
    shipmentScheldule: [],
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
    otherConditions: {
        type: String,
        default: ''
    },
    paymentTerms: {
        type: ObjectId,
        ref: 'paymentTerms'
    },
    paymentMethod: {
        type: ObjectId,
        ref: 'paymentMethod'
    },
    pricingTerms: {
        type: ObjectId,
        ref: 'pricingTerms'
    },
    tradeRules: {
        type: ObjectId,
        ref: 'tradeRules'
    },
    documents: [{
        type: ObjectId,
        ref: 'documents'
    }],
    inventoryGrade: {
        type: ObjectId,
        ref: 'grade'
    },
    pricePerCWT: {
        type: Number,
        default: 0
    },
    qtyCWT: {
        type: Number,
        default: 0
    },
    delQty: {
        type: Number,
        default: 0
    },
    noOfShipment: {
        type: Number,
        default: 0
    },
    FCLshipment: {
        type: Number,
        default: 0
    },
    brokerageCWT: {
        type: Number,
        default: 0
    },
    commisionCWT: {
        type: Number,
        default: 0
    },
    oceanFreightBL: {
        type: Number,
        default: 0
    },
    oceanFreightCWT: {
        type: Number,
        default: 0
    },
    oceanFreightCWTUSD: {
        type: Number,
        default: 0
    },
    blFeeCWT: {
        type: Number,
        default: 0
    },
    blFee: {
        type: Number,
        default: 0
    },
    totalBlFeeCWT: {
        type: Number,
        default: 0
    },
    documentCostingCWT: {
        type: Number,
        default: 0
    },
    documentCosting: {
        type: Number,
        default: 0
    },
    lcCost: {
        type: Number,
        default: 0
    },
    lcCostCWT: {
        type: Number,
        default: 0
    },
    insuranceRate: {
        type: Number,
        default: 0
    },
    insuranceRateCWT: {
        type: Number,
        default: 0
    },
    ariPolicy: {
        type: Number,
        default: 0
    },
    ariPolicyCWT: {
        type: Number,
        default: 0
    },
    priceCAD: {
        type: Number,
        default: 0
    },
    priceCwtUSD: {
        type: Number,
        default: 0
    },
    priceUSD: {
        type: Number,
        default: 0
    },
    inlandFrtStuffingBuffer: {
        type: Number,
        default: 0
    },
    priceMT: {
        type: Number,
        default: 0
    },
    cadCWT: {
        type: Number,
        default: 0
    },
    interestRate: {
        type: Number,
        default: 0
    },
    interestDays: {
        type: Number,
        default: 0
    },
    interestRateCWT: {
        type: Number,
        default: 0
    },
    stuffingType: {
        type: String,
        default: ''
    },
    stuffingCWT: {
        type: Number,
        default: 0
    },
    stuffingBuffer: {
        type: Number,
        default: 0
    },
    inlineFreight: {
        type: String,
        default: 0
    },
    inlineFreightCWT: {
        type: Number,
        default: 0
    },
    bagCostCWT: {
        type: Number,
        default: 0
    },
    missCost1: {
        type: String,
        default: 0
    },
    missCostCWT1: {
        type: Number,
        default: 0
    },
    missCost2: {
        type: String,
        default: 0
    },
    missCostCWT2: {
        type: Number,
        default: 0
    },
    missCost3: {
        type: String,
        default: 0
    },
    missCostCWT3: {
        type: Number,
        default: 0
    },
    netFOBCAD: {
        type: Number,
        default: 0
    },
    targetFOBCAD: {
        type: Number,
        default: 0
    },
    underTarget: {
        type: Number,
        default: 0
    },
    currencyPosition: [],
    voidedBy: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
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
    createdBy: {
        type: ObjectId,
        ref: 'admin'
    },
    printAmended: {
        type: Boolean,
        default: false
    },
    amended: {
        type: Boolean,
        default: false
    },
    amendedDate: {
        type: Date
    },
    amendedBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },
    sampleApproval: {
        type: Boolean,
        default: false
    },
    pdfUrl: {
        type: String,
        default: ""
    },
    contractIsSigned: {
        type: Boolean,
        default: false
    },
    salesStampGenerated: {
        type: Boolean,
        default: false
    },
    signedContractPdf: {
        type: String,
        default: ""
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
    }]

}, {
    toObject: {
        virtuals: true
    },
    timestamps: true
});

tradePurchase.virtual('scale', {
    ref: 'tradePurchaseScale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'contractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

tradePurchase.plugin(mongoosePaginate);
mongoose.model('tradePurchase', tradePurchase);
