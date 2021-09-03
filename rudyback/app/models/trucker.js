var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var trucker = new Schema({
	truckerName: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

trucker.plugin(mongoosePaginate);
mongoose.model('trucker', trucker);

var bin = new Schema({
	binName: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

bin.plugin(mongoosePaginate);
mongoose.model('bin', bin);
