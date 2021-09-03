var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var equipment = new Schema({
	equipmentName: {
		type: String,
		default: ''
	},
	equipmentType: {
		type: String,
		default: ''
	},
	loadingPortId: {
		type: ObjectId,
		ref: 'loadingPort'
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

equipment.plugin(mongoosePaginate);
mongoose.model('equipment', equipment);
