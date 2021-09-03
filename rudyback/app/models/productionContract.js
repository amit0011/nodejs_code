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

var productionContract = new Schema({
    contractNumber: {
        type: String,
        default: ''
    },
    nameOfContract: {
        type: String,
        default: ''
    },
    commodityId: {
        type: ObjectId,
        ref: 'commodity'
    },
    signee: {
        type: ObjectId,
        ref: 'admin'
    },
    gradeId: {
        type: ObjectId,
        ref: 'grade'
    },
    growerId: {
        type: ObjectId,
        ref: 'grower'
    },
    personFarmType: {
        type: String,
        default: ''
    },
    farmName: {
        type: String,
        default: ''
    },
    acres: {
        type: Number,
        default: 0
    },
    cropYear: {
        type: String,
        default: ''
    },
    landLocation: [],
    deliveryDateFrom: {
        type: Date,
        default: ''
    },
    deliveryDateTo: {
        type: Date,
        default: ''
    },
    priceOption: {
        type: String,
        default: ''
    },
    deliveryOption: {
        type: String,
        default: ''
    },
    freightRate: {
        type: Number,
        default: 0
    },
    fixedPrice: {
        type: Number,
        default: 0
    },
    fixedPriceUnit: {
        type: String,
        default: ''
    },
    fixedOnFirst: {
        type: Number,
        default: 0
    },
    fixedAdditionalProduction: {
        type: String,
        default: ''
    },
    quantityLbs: {
        type: Number,
        default: 0
    },
    contractReturnDate: {
        type: Date,
        default: ''
    },
    inventoryGrade: {
        type: ObjectId,
        ref: 'grade'
    },
    growerRetain: {
        type: String,
        default: ''
    },
    growerRetainUnits: {
        type: String,
        default: ''
    },
    CWTDel: {
        type: Number,
        default: 0
    },
    delQty: {
        type: Number,
        default: 0
    },
    harvestQty: {
        type: Number,
        default: 0
    },
    harvestQtyUnit: {
        type: String,
        default: '',
    },
    harvestFileUrl: {
        type: String,
        default: ""
    },
    chemicalDeclarationFileUrl: {
        type: String,
        default: ""
    },
    otherComments: {
        type: String,
        default: ''
    },
    grainBuyer: {
        type: ObjectId,
        ref: 'admin'
    },
    otherGradePrices: [],
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
        default: 0 // status 0 is Active, 1 is Complete and 2 is Void
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
    signedContractPdf: {
        type: String,
        default: ""
    },
    cropInspectionPdf: {
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
    scalePdfUrl: {
        type: String,
        default: ""
    },
    byProductsByScale: {
        type: [byProductSchema],
        default: [],
    },
}, { timestamps: true });

productionContract.virtual('scale', {
    ref: 'scale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'contractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

productionContract.plugin(mongoosePaginate);
mongoose.model('productionContract', productionContract);
