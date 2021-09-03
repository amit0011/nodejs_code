var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var analysis = new Schema({
	analysisName: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('analysis', analysis);
