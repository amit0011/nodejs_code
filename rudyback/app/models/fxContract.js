var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var fxContract = new Schema({
    contractNumber:String,
    tradeDate:Date,
    expiryDate: Date,
    structure: String,
    usdAmount: Number,
    cadAmount: Number,
    strikeRate: Number,
    check: Number,
    pdfFile: String,
    isClose: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    }
}, {
    timestamps: true
});

fxContract.plugin(mongoosePaginate);
mongoose.model('fxContract', fxContract, 'fxContract');
