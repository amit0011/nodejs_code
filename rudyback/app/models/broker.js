var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var broker = new Schema({
    businessName: {
        type: String,
        default: ''
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    tax: {
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
    fax: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    weatherMap: {
        type: Boolean,
        default: false
    },
    plantImage: {
        type: Boolean,
        default: false
    },
    addresses: [{
        street: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        province: {
            type: String,
            default: ''
        },
        postal: {
            type: String,
            default: ''
        },
        country: {
            type: String,
            default: ''
        }
    }],
    salesContract: [],
    days: [],
    purchaseContract: [],
    quoteId: [],
    assignedUserId: {
        type: ObjectId,
        ref: 'admin'
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete 2 is Deactive
    }
}, { timestamps: true });

broker.plugin(mongoosePaginate);
mongoose.model('broker', broker);
