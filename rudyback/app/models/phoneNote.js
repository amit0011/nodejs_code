var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var phoneNote = new Schema({
    growerId: {
        type: ObjectId,
        ref: 'grower',
        default: null
    },
    buyerId: {
        type: ObjectId,
        ref: 'buyer',
        default: null
    },
    brokerId: {
        type: ObjectId,
        ref: 'broker',
        default: null
    },
    message: {
        type: String,
        default: ''
    },
    referenceNumber: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },
    createdBy: {
        type: ObjectId,
        ref: 'admin'
    },
    userName: {
        type: String,
        default: ''
    }
}, { timestamps: true });

phoneNote.plugin(mongoosePaginate);
mongoose.model('phoneNote', phoneNote);
