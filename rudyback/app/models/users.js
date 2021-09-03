var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var user = new Schema({
    fullName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    mobileNumber: {
        type: String,
        default: ''
    },
    farmName: {
        type: String,
        default: ''
    },
    farmSize: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    town: {
        type: String,
        default: ''
    },
    userType: {
        type: String,
        default: 'user'
    },
    avatar: {
        type: String,
        default: '/images/default-avatar.png'
    },
    deviceId: {
        type: String,
        default: ''
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetRequestedAt: {
        type: Date,
        default: null
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    }
}, { timestamps: true });


var session = new Schema({
    userId: {
        type: ObjectId,
        default: null,
        ref: 'user'
    },
    authToken: {
        type: String
    }
}, { timestamps: true });


mongoose.model('user', user);
mongoose.model('session', session);
