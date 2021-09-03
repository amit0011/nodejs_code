var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var failedQuote = new Schema({
    quoteIds: {
        type: [{
            type: ObjectId,
            ref: 'quote',
        }],
        default: []
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

failedQuote.plugin(mongoosePaginate);
mongoose.model('failedquote', failedQuote);
