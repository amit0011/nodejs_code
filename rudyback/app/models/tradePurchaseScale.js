var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var tradePurchaseScale = new Schema({
    ticketNumber: { //every incoming ticket numberwill hace "RI-" prefix to indicate incoming ticket
        type: String,
        default: ''
    },
    ralInvoice: {
        type: String,
        default: ''
    },
    referenceNo: {
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

    delGrade: {
        type: String,
        default: ''
    },
    buyerId: {
        type: ObjectId,
        ref: 'buyer',
        default: null
    },
    // growerId: {
    //     type: ObjectId,
    //     ref: 'grower',
    //     default: null
    // },
    salesBuyerId: {
        type: ObjectId,
        ref: 'buyer'
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
    splitTotal: { //CTotal percentage of splits for all Analysis which have split factor set to 1 for a commodity
        type: String,
        default: ''
    },
    splitTotalWeight: { //getting weight out of percentage above
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
        ref: "bin"
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
    salesContractNumber: {
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
    void: {
        type: Boolean,
        default: false,
    },
    containeNumber: {
        type: String
    },
    contractIsSigned: {
        type: Boolean,
        default: false
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    updatePdf: {
      type: Boolean,
      default: true,
    },
    signedContractPdf: {
        type: String,
        default: ""
    }
}, { timestamps: true });

tradePurchaseScale.plugin(mongoosePaginate);
mongoose.model('tradePurchaseScale', tradePurchaseScale);
