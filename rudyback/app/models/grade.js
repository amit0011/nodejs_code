var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var grade = new Schema({
    gradeName: {
        type: String,
        default: ''
    },
    commodityId: {
        type: ObjectId,
        ref: 'commodity'
    },
    gradeAllowance: {
        type: Number,
        default: 0
    },
    gradeDisplay: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 0 // status 0 is Active and 1 is Delete
    }
}, { timestamps: true });

grade.plugin(mongoosePaginate);
mongoose.model('grade', grade);
