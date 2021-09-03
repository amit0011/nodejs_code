var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var campaign = new Schema({
    createdBy: {
        type: ObjectId,
        ref: 'admin',
        default: null
    },
    to: [],
    bcc: [],
    attachments: [],
    subject: String,
    mailBody: String,
    recordType: String,
    mailSend: Boolean,
    error: {
        code: Number,
        message: String
    }
}, {
    timestamps: true
});

campaign.plugin(mongoosePaginate);
mongoose.model('campaign', campaign);
