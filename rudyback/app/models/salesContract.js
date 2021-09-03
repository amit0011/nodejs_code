var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongoosePaginate = require('mongoose-paginate');
var mongoosePaginateAggregate = require('../libs/mongoosePaginateAggregate');

var checkListSchema = new Schema({
  code: String,
  price: Number,
  checked: Boolean,
});

var salesContract = new Schema({
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
    rolloverCN: {
        type: String,
        default: ''
    },
    originalCN: {
        type: String,
        default: ''
    },
    buyerId: {
        type: ObjectId,
        ref: 'buyer'
    },
    brokerId: {
        type: ObjectId,
        ref: 'broker'
    },
    unitFcl: {
        type: String,
        default: ''
    },

    //freightCompanyId   is equal to freightId
    freightCompanyId: {
        type: ObjectId,
        ref: 'freight'
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
    callAsGrade: {
        type: ObjectId,
        ref: 'grade'
    },
    cropYear: {
        type: String,
        default: ''
    },
    cropyear: {
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
    palletUnit: {
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
        type: Number,
        default: 0
    },
    shippingQty: {
        type: Number,
        default: 0
    },
    freightCWT: Number,
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
    exchangeDeduction: {
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
    shipmentScheldule: [{
      paymentReceivedOn: String,
      paymentReceived: Number,
      exchangeRate: Number,
      end_date: String,
      ship: Number,
      units: Number,
      quantity: Number,
      endDate: String,
      startDate: String,
      shipmentType: String,
      payments: {
          type: [{amount: Number, date: Date, comment: String}],
          default: []
      }
    }],
    contractCurrency: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        default: 0
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
    pricePerMT: {
        type: Number,
        default: 0
    },
    qtyMT: {
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
    coaCost: {
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
    accountingCompleted: {
      type: Boolean,
      default: false,
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
    checkLists: {
      type: [checkListSchema],
      default: [],
    },
    totalCheckListPrice: {
      type: Number,
      default: 0
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
    remainingUSDAmount: Number,
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
    stampPdfUrl: {
        type: String,
        default: ''
    },
    adjustment: {
        default: 0,
        type: Number
    },
    adjustmentNote: String,
    contractSignature: {
        type: Number,
        default: 1,
    },
    brokerNote: String,
    shipmentHold: Number,
    whyOnHold: String,
    shippingLine: String,
    quoteReference: String,
    stuffingInstruction: String,
    meta: {
      type: Object,
      default: {},
    }
}, { timestamps: true });

salesContract.virtual('scale', {
    ref: 'scale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'contractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

salesContract.virtual('scale_loadsheet', {
    ref: 'scale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'salesContractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

salesContract.virtual('loadsheet', {
    ref: 'tradePurchaseScale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'contractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

salesContract.virtual('tradeScale', {
    ref: 'tradePurchaseScale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'salesContractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

salesContract.plugin(mongoosePaginate);
salesContract.plugin(mongoosePaginateAggregate);
mongoose.model('salesContract', salesContract);
