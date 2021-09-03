var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var bidsheet = new Schema({
	company: {
		type: String,
		default: ''
	},
	commodityId: {
		type: ObjectId,
		ref: 'commodity'
	},
	gradeId: {
		type: ObjectId,
		ref: 'grade'
	},
	unit: {
		type: String,
		default: ''
	},
	bidPeriod1: {
		type: String,
		default: ''
	},
	bidPeriod2: {
		type: String,
		default: ''
	},
	bidPeriod3: {
		type: String,
		default: ''
	},
	code: {
		type: String,
		default: ''
	},
	maxQuantity: {
		type: String,
		default: ''
	},
	bidPeriod: [],
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

bidsheet.plugin(mongoosePaginate);
mongoose.model('bidsheet', bidsheet);
