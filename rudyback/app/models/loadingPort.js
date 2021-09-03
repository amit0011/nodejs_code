var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var loadingPort = new Schema({
	loadingPortName: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

loadingPort.plugin(mongoosePaginate);
mongoose.model('loadingPort', loadingPort);
