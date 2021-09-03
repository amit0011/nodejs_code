var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var trackWeight = new Schema({
	weight: {
		type: Number,
		default: 0
	},
	unit: {
		type: String,
		default: ''
	},
	status: {
		type: String,
		default: 0
	}
}, { timestamps: true });

mongoose.model('trackWeight', trackWeight);
