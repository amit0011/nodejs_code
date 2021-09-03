var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var buyer = new Schema({
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
    email: {
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
    website: {
        type: String,
        default: ''
    },
    taxNumber: {
        type: String,
        default: ''
    },
    defaultDoc: {
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
    tax: {
        type: String,
        default: ''
    },
    phoneNotes: [{
        type: ObjectId,
        ref: 'phoneNote'
    }],
    reference: {
        type: String,
        default: ''
    },
    addresses: [{
        street: {
            type: String,
            default: ''
        },
        line2: {
            type: String,
            default: ''
        },
        line3: {
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
        },

        isDeleted: {
            type: Number,
            default: 0 // status 0 is NotDeleted and 1 is Delete
        }


    }],
    note: String,
    salesContract: [],
    days: [],
    scaleTickets: [],
    quoteId: [],
    assignedUserId: {
        type: ObjectId,
        ref: 'admin'
    },
    lastOpenedBy: {
        type: ObjectId,
        ref: 'admin'
    },
    lastOpenedOn: {
        type: Date,
        default: ''
    },
    lastEditedBy: {
        type: ObjectId,
        ref: 'admin'
    },
    lastEditedOn: {
        type: Date,
        default: ''
    },
    createdBy: {
        type: ObjectId,
        ref: 'admin'
    },
    edcId: {
        type: ObjectId,
        default: null,
        ref: 'edc'
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete 2 is Deactive
    },
    documents: [{
        type: ObjectId,
        ref: 'documents'
    }]
}, { timestamps: true });

buyer.plugin(mongoosePaginate);
mongoose.model('buyer', buyer);
