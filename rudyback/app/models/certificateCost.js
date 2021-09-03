var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var certificateCost = new Schema({
	certificateName: {
		type: String,
		default: ''
	},
	cost: {
		type: Number,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

certificateCost.plugin(mongoosePaginate);
mongoose.model('certificateCost', certificateCost);
