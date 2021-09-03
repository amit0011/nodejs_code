var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var weather = new Schema({
	weather: {
		type: String,
		default: ''
	},
	weatherMap: {
		type: String,
		default: ''
	},
	plantJpeg: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

weather.plugin(mongoosePaginate);
mongoose.model('weather', weather);
