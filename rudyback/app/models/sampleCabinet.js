var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var cabinet = new Schema({
	occupied: {
		type: [Number],
		default: []
	},
	available: {
		type: [Number],
		default: []
	}
}, { timestamps: true });

cabinet.plugin(mongoosePaginate);
module.exports = mongoose.model('sampleCabinet', cabinet);
