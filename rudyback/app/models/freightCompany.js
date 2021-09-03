var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var freightCompany = new Schema({
	freightCompanyName: {
		type: String,
		default: ''
	},
	stuffer: {
		type: Boolean,
		default: false
	},
	addressLine1: {
		type: String,
		default: ''
	},
	addressLine2: {
		type: String,
		default: ''
	},
	province: {
		type: String,
		default: ''
	},
	postalCode: {
		type: String,
		default: ''
	},
	country: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
}, { timestamps: true });

freightCompany.plugin(mongoosePaginate);
mongoose.model('freightCompany', freightCompany);
