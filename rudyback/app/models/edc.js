var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var edc = new Schema({
    name: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },
}, { timestamps: true });

edc.plugin(mongoosePaginate);
mongoose.model('edc', edc);
