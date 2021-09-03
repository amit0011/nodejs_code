var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var fxContractNote = new Schema({
    message: String,
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    },
    createdBy: {
        type: ObjectId,
        ref: 'admin'
    },
    contractId: {
        type: ObjectId,
        ref: 'fxContract'
    }
}, {
    timestamps: true
});

fxContractNote.plugin(mongoosePaginate);
mongoose.model('fxContractNote', fxContractNote, 'fxContractNote');
