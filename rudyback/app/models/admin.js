var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var admin = new Schema({
    type: {
        type: String,
        default: ''
    },
    fullName: {
        type: String,
        default: ''
    },
    userName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: '',
        index: 'unique'
    },
    mobileNumber: {
        type: String,
        default: ''
    },
    roles: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: '/images/default-avatar.png'
    },
    signature: {
        type: String,
        default: '/images/signature.jpg'
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetRequestedAt: {
        type: Date,
        default: null
    },
    add: {
        type: Boolean,
        default: false
    },
    view: {
        type: Boolean,
        default: false
    },
    edit: {
        type: Boolean,
        default: false
    },
    delete: {
        type: Boolean,
        default: false
    },
    access: {
        type: Object
    },
    accessUpdated: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete 2 is Deactive
    }
}, { timestamps: true });

var session = new Schema({
    authToken: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        default: null,
        ref: 'admin'
    }
}, { timestamps: true });

admin.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetToken;
    delete obj.resetRequestedAt;
    return obj;
};

var admin_session = mongoose.model('admin_session', session);
admin = mongoose.model('admin', admin);
module.exports = admin;
module.exports = admin_session;
