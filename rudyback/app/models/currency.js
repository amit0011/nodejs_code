var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var currency = new Schema({
    currencyCADUSD: {
        type: String,
        default: ''
    },
    currencyUpdate: {
        type: String,
        default: ''
    },
    exchangeDeduction: {
        type: String,
        default: ''
    },
    updatedOn: {
        type: Date,
        default: ''
    },
    updatedBy: {
        type: ObjectId,
        ref: 'admin'
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    }
}, { timestamps: true });

currency.plugin(mongoosePaginate);
mongoose.model('currency', currency);
