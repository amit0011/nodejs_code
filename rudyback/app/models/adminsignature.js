var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var adminSignature = new Schema({
    signature: {
        type: String,
        default: ''
    },
    path: {
        type: String,
        default: ''
    }
}, { timestamps: true });

adminSignature = mongoose.model('adminSignature', adminSignature);
module.exports = adminSignature;
