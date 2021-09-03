var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var employees = new Schema({
    buyerId: {
        type: ObjectId,
        default: null
    },
    brokerId: {
        type: ObjectId,
        default: null
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    cellNumber: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'employees'
    },
    subscribeEmail: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    }
}, { timestamps: true });
employees.plugin(mongoosePaginate);
mongoose.model('employees', employees);
