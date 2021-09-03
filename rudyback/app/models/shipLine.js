var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var shipLine = new Schema({
	shipLineName: {
		type: String,
		default: ''
	},
	freightCompanyId: {
		type: ObjectId,
		ref: 'freightCompany'
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

shipLine.plugin(mongoosePaginate);
mongoose.model('shipLine', shipLine);
