var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var town = new Schema({
	name: String,
	status: {
		type: String,
		default: 0
	}
}, { timestamps: true });

town.plugin(mongoosePaginate);
mongoose.model('town', town);
