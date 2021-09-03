var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var mongoosePaginate = require('mongoose-paginate');

var productionContractHistory = new Schema({
    nameOfContract: {
        type: String,
        default: ''
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
    contractReturnDate: {
        type: Date,
        default: ''
    },growerRetain: {
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
    harvestFileUrl: {
        type: String,
        default: 0
    },
    otherComments: {
        type: String,
        default: ''
    },
    grainBuyer: {
        type: ObjectId,
        ref: 'admin'
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
    quantityLbs: {
        type: String,
        default: ''
    },
    units: {
        type: String,
        default: ''
    },
    contractNumber: {
        type: String,
        default: ''
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
    growerId: {
        type: ObjectId,
        ref: 'grower',
        default: null
    },
    productionContractId: {
        type: ObjectId,
        default: null,
        ref: 'productionContract',

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

productionContractHistory.virtual('scale', {
    ref: 'scale', // The model to use
    localField: 'contractNumber', // Find people where `localField`
    foreignField: 'contractNumber', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: false
});

productionContractHistory.plugin(mongoosePaginate);
mongoose.model('productionContractHistory', productionContractHistory);
