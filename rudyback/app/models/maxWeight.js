const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const maxWeight = new Schema({
	name: {
		type: String,
		default: ''
  },
  weights: {
    type: [Number],
    default: []
  },
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

maxWeight.plugin(mongoosePaginate);
mongoose.model('maxWeight', maxWeight);
