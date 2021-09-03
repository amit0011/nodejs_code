var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var quote = new Schema({
    buyerId: {
        type: Schema.ObjectId,
        default: null
    },
    brokerId: {
        type: Schema.ObjectId,
        default: null
    },
    userId: {
        type: Schema.ObjectId,
        default: null
    },
    interestRate: {
        type: Number,
        default: 0
    },
    interestDurationDays: {
        type: Number,
        default: 0
    },
    commission: {
        type: Number,
        default: 0
    },
    insurance: {
        type: Number,
        default: 0
    },
    premiumDiscount: {
        type: Number,
        default: 0
    },
    ariPolicy: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: '' // USD/CAD
    },
    quoteNumber: {
        type: Number,
        default: 0
    },
    exchangeRate: {
        type: Number,
        default: 0
    },
    emailDate: {
        type: Date
    },
    columnsCol: [],
    commoditiesRow: [],
    status: {
        type: Number,
        default: 0
    },
    pdfUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

quote.plugin(mongoosePaginate);
mongoose.model('quote', quote);
