var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var rating = new Schema({
    rating: {
        type: Number,
        default: 0
    },
    note: {
        type: String,
        default: ''
    },
    growerId: {
        type: ObjectId,
        default: null,
        ref: 'grower'
    },
    ratedBy: {
        type: ObjectId,
        default: null,
        ref: 'admin'
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    }
}, { timestamps: true });

mongoose.model('rating', rating);
