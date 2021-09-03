var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var origin = new Schema({
	name: String,
	status: {
		type: String,
		default: 0
	}
}, { timestamps: true });

origin.plugin(mongoosePaginate);
mongoose.model('origin', origin);
