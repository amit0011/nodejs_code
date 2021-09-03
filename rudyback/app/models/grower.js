var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var grower = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    farmName: {
        type: String,
        default: ''
    },
    farmNames: {
      type: [String],
      default: []
    },
    email: {
        type: String,
        default: ''
    },
    email2: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0
    },
    phone2: {
        type: String,
        default: ''
    },
    name1: {
        type: String,
        default: ''
    },

    name2: {
        type: String,
        default: ''
    },
    name3: {
        type: String,
        default: ''
    },
    phoneNumber2: {
        type: String,
        default: ''
    },
    phoneNumber3: {
        type: String,
        default: ''
    },
    cellNumber: {
        type: String,
        default: ''
    },
    coOwnerName: {
        type: String,
        default: ''
    },
    addresses: [{
        street: {
            type: String,
            default: ''
        },
        street2: {
            type: String,
            default: ''
        },
        town: {
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
        rm: {
            type: String,
            default: ''
        }
    }],
    cropDistrict: {
        type: String,
        default: ''
    },
    fullAddress: {
        type: String,
        default: ''
    },
    fax: {
        type: String,
        default: ''
    },
    GST: {
        type: String,
        default: ''
    },
    reference: {
        type: String,
        default: ''
    },
    farmSize: {
        type: Number,
        default: ''
    },
    isOrganic: {
        type: String,
        default: ''
    },
    organicAcres: {
        type: String,
        default: ''
    },
    assignedStaff: {
        type: String,
        default: ''
    },
    callBackDate: {
        type: Date,
        default: null
    },
    comments: [{
        comment: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: ObjectId,
            ref: 'user'
        }
    }],
    freightRate: {
        type: Number,
        default: ''
    },
    landLocations: [{
        locations: {
            type: String,
            default: ''
        }
    }],
    binLocations: {
        type: String,
        default: ''
    },
    callBack: {
        type: Boolean,
        default: false
    },
    organic: {
        type: Boolean,
        default: false
    },
    pdfUrl: {
        type: String,
        default: ''
    },
    certificateExpiryDate: {
        type: Date
    },
    pdfUploaded: {
        type: Boolean,
        default: false
    },
    pdfDecUrl: {
        type: String,
        default: ''
    },
    declarationExpiryDate: {
        type: Date
    },
    pdfDecUploaded: {
        type: Boolean,
        default: false
    },
    productionRecords: [{
        type: ObjectId,
        ref: 'productionRecordsSample'
    }],
    productionContract: [{
        type: ObjectId,
        ref: 'productionContract'
    }],
    productionConfirmations: [{
        type: ObjectId,
        ref: 'productionConfirmations'
    }],
    scaleTickets: [{
        type: ObjectId,
        ref: 'scaleTickets'
    }],
    harvestSummary: [{
        type: ObjectId,
        ref: 'harvestSummary'
    }],
    phoneNotes: [{
        message: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    note: String,
    deleteStatus: {
        type: Number,
        default: 0 // status 0 is active and 1 is deactivate 2
    },
    lastOpenedBy: {
        type: ObjectId,
        ref: 'admin'
    },
    lastOpenedOn: {
        type: Date,
        default: Date.now
    },
    lastEditedBy: {
        type: ObjectId,
        ref: 'admin'
    },
    lastEditedOn: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: ObjectId,
        ref: 'admin'
    }
}, { timestamps: true });

grower.plugin(mongoosePaginate);
grower.plugin(mongooseAggregatePaginate);
mongoose.model('grower', grower);
