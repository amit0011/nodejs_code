var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var freightSettingNote = new Schema({
    message: {
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

freightSettingNote.plugin(mongoosePaginate);
mongoose.model('freightSettingNote', freightSettingNote);
