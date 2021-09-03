var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var bags = new Schema({
	name: { 
		type: String,
		default: ''
  },
  category: {
    type: Schema.ObjectId,
    ref: 'bagCategory',
  },
	bagCost: {
		type: String,
		default: ''
	},
	bulkBag: {
		type: String,
		default: ''
	},
  bagCount: {
		type: Number,
		default: 0
	},
	bagWeight: {
		type: Number,
		default: 0
	},
	bagWeightUnit: {
		type: String,
		default: ''
	},
	includePallets: {
		type: Boolean,
		default: false,
	},
	weightOfBag: {
		type: Number,
		default: 0
	},
	alertCount: {
		type: Number,
		default: 0
  },
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

bags.plugin(mongoosePaginate);
mongoose.model('bags', bags);

const bagCategory = new Schema({
	name: {
		type: String,
		default: ''
	},
  bagCount: {
		type: Number,
		default: 0
	},
	alertCount: {
		type: Number,
		default: 0
  },
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

bagCategory.plugin(mongoosePaginate);
mongoose.model('bagCategory', bagCategory);
