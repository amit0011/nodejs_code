var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Splits = new Schema({
    contractNumber: String,
    unloadWeidht: { //gross - tare
        type: Number,
        default: 0
    },
    unloadWeidhtMT: { //gross - tare
        type: Number,
        default: 0
    },
    netWeight: {
        type: Number,
        default: 0
    },
    netWeightMT: {
        type: Number,
        default: 0
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
});

var scale = new Schema({
    ticketNumber: { //every incoming ticket numberwill hace "RI-" prefix to indicate incoming ticket
        type: String,
        default: ''
    },
    ralInvoice: {
        type: String,
        default: ''
    },
    displayOnTicket: {
        type: String,
        default: ''
    },
    commodityId: {
        type: ObjectId,
        ref: 'commodity',
        default: null
    },
    gradeId: {
        type: ObjectId,
        ref: 'grade',
        default: null
    },
    gradeType: {
        type: String,
        default: 'Delivery',
    },
    growerId: {
        type: ObjectId,
        ref: 'grower',
        default: null
    },
    stuffer: {
        type: ObjectId,
        ref: 'freightCompany',
        default: null
    },
    invoicedWeight: {
        type: Number,
    },
    delGrade: {
        type: String,
        default: ''
    },
    buyerId: {
        type: ObjectId,
        ref: 'buyer',
        default: null
    },
    newAddress: String,
    useNewAddress: Boolean,
    brokerId: {
        type: ObjectId,
        ref: 'broker',
        default: null
    },
    weigher: { //userid
        type: String,
        default: ''
    },
    dockageBy: { //userid
        type: String,
        default: ''
    },
    ticketType: {
        type: String,
        default: ''
    },
    buyerAddressId: {
        type: ObjectId,
        default: null
    },

    receiptType: {
        type: String,
        default: ''
    },
    veicalAspect: {
        type: String,
        default: ''
    },
    interfaceChalk: {
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
    analysis: [{ // this should auto populate according to commodity selected. Analysis appearing from delivery_analysis array in Commodity setup
        analysisId: {
            type: ObjectId,
            ref: 'analysis'
        },
        value: {
            type: Number
        },
        weight: {
            type: Number
        },
        weightMT: {
            type: Number
        }
    }],
    splitTotal: { //CTotal percentage of splits for all Analysis which have split factor set to 1 for a commodity
        type: String,
        default: ''
    },
    splitTotalWeight: { //getting weight out of percentage above
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

    totalDamage: {
        type: Number,
        default: 0
    },
    totalDamageMT: {
        type: Number,
        default: 0
    },
    moisture: { //percentage of moisture
        type: Number,
        default: 0
    },
    moistureAdjustment: { //percentage of moisture
        type: Number,
        default: 0
    },
    moistureAdjustmentWeight: { //percentage of moisture
        type: Number,
        default: 0
    },
    dockageCompleted: { //Yes/No
        type: Boolean,
        default: false
    },
    analysisCompleted: {
        type: Boolean,
        default: false
    },
    printComment: {
        type: Boolean,
        default: false
    },
    isMailReceiptType: {
        type: Boolean,
        default: false
    },
    isMailDockageCompleted: {
        type: Boolean,
        default: false
    },
    mailSent: {
        type: Number,
        default: 0 //1 is ready to send Interim button red, 2
    },
    mailColor: {
        type: Number,
        default: 0 //1 is red, 2 color orange
    },
    netWeight: { //calculated weight after deducting Dockage
        type: Number,
        default: 0
    },
    netTotalWeight: {
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
    partyContract: {
        type: String,
        default: ''
    },
    contractExtra: {
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
    binNumber: { //list of Bins at plant. The Bin where we intend to keep the product
        type: ObjectId,
        default: null,
        ref: 'bin'
    },
    size: { // for all commodities size needs to be entered but if commodity is Kabuli chick peas "Size kabuli needs to be entered and total should be 100"
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
    allow: {
        type: Number,
        default: 0
    },
    contractType: { //Production/Purchase/Other
        type: String,
        default: ''
    },
    contractNumber: {
        type: String,
        default: ''
    },
    truckingCompany: {
        type: ObjectId,
        ref: 'trucker',
        default: null
    },
    truckerBL: {
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
    comments: {
        type: String,
        default: ''
    },
    blComments: {
        type: String,
        default: ''
    },
    morrowLoadNumber: {
      type: String,
      default: ''
    },
    lastOpenedBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },
    lastOpenedOn: {
        type: Date,
        default: Date.now
    },
    lastEditedBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },
    lastEditedOn: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },
    ticketStatus: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete  "Active/Completed/void"
    },
    containerId: {
      type: ObjectId,
      ref: 'containerInventory',
      default: null,
    },
    containeNumber: {
        type: String
    },
    containerIncomingDate: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    ticketMailSent: {
        type: Boolean,
        default: false
    },
    ticketMailDate: {
        type: Date
    },
    ticketMailSentBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },
    isSplitTicket: {
        type: Boolean,
        default: false
    },
    splitBy: {
        type: String,
        default: ''
    },
    void: {
        type: Boolean,
        default: false
    },
    updatePdf: {
        type: Boolean,
        default: false
    },
    refTicketId: {
        type: ObjectId,
        ref: "scale"
    },
    totalUnloadWeight: {
        type: Number
    },
    pdfUrl: String,
    fdaNumber: String,
    printAFBAsFcAccountOf: {
      type: Boolean,
      default: false
    },
    fcAccountOf: String,

    billOfLadingURL: {
        type: String,
        default: ''
    },
    ladingUpdated: {
        type: Boolean,
        default: false
    },
    growerOrBuyer: String,
    bagId: {
        type: ObjectId,
        ref:"bags"
    },
    pallet: {
        type: ObjectId,
        ref:"bags"
    },
    shippingNumber: String,
    bookingNumber: String,
    papsNumber: String,
    bagsWeight: {
        type: Number
    },
    numberOfBags: {
        type: Number
    },
    weightOfBags: {
        type: Number
    },
    palletsWeight: {
        type: Number
    },
    numberOfPallets: {
        type: Number
    },
    weightOfPallets: {
        type: Number
    },
    cardboardSlipWeight: {
        type: Number
    },
    countOfCardboardSlip: {
        type: Number
    },
    weightOfCardboardSlip: {
        type: Number
    },
    plasticeWeight: {
        type: Number
    },
    countOfPlastic: {
        type: Number
    },
    weightOfPlastic: {
        type: Number
    },
    bulkHeadWeight: {
        type: Number
    },
    countOfBulkHead: {
        type: Number
    },
    weightOfBulkHead: {
        type: Number
    },
    cardboardLength: {
        type: Number
    },
    weightOfCardboard: {
        type: Number
    },
    weightOfOtherPackage: {
        type: Number
    },
    totalPackagingWeight: {
        type: Number
    },
    targetWeight: {
        type: Number
    },
    targetWeightUnit: {
        type: String
    },
    netWeightPerBag: {
        type: Number
    },
    overUnderTarget: {
        type: Number
    },
    productWeight: {
        type: Number
    },
    bagCount: {
        type: Number,
    },
    detectorCount: {
        type: Number,
    },
    conveyorCount: {
        type: Number,
    },
    damagedBagCount: {
        type: Number,
    },
    equipmentType: String,
    freightBy: String,
    actualFreightBy: {
      type: ObjectId,
      ref: 'freightCompany'
    },
    actualFreight: Number,
    actualFreightCurrency: String,
    splits: {
        type: [Splits],
        default: [],
    },
    releaseContainer: {
      type: Boolean,
      default: true,
    },
    salesBuyerId: {
      type: ObjectId,
      ref: 'buyer'
    },
    salesContractNumber: {
        type: String,
        default: ''
    },
    actual: {
      type: { inland: Number, oceanUSD: Number, miscFreightCharge: Number, comment: String },
      default: {}
    },
}, { timestamps: true });

scale.virtual('sales_contract', {
  ref: 'salesContract',
  localField: 'contractNumber', // Find people where `localField`
  foreignField: 'contractNumber', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
});

scale.virtual('purchase_confirmation', {
  ref: 'purchaseConfirmation',
  localField: 'contractNumber', // Find people where `localField`
  foreignField: 'contractNumber', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
});

scale.plugin(mongoosePaginate);
mongoose.model('scale', scale);

var scaleTicketNumber = new Schema({
    incomingNumber: {
        type: Number,
        default: 0
    },
    outgoingNumber: {
        type: Number,
        default: 0
    },
    loadSheetNumber: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    }
}, { timestamps: true });

mongoose.model('scaleTicketNumber', scaleTicketNumber);
