var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var shippingTerms = new Schema({
	term: {
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

shippingTerms.plugin(mongoosePaginate);
mongoose.model('shippingTerms', shippingTerms);

var pricingTerms = new Schema({
	pricingTerms: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('pricingTerms', pricingTerms);

var tags = new Schema({
	tags: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('tags', tags);

var documents = new Schema({
	documents: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('documents', documents);

var tradeRules = new Schema({
	tradeRules: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('tradeRules', tradeRules);

var paymentMethod = new Schema({
	paymentMethod: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('paymentMethod', paymentMethod);

var paymentTerms = new Schema({
	paymentTerms: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('paymentTerms', paymentTerms);

var variance = new Schema({
	varianceName: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('variance', variance);

var bidPeriod = new Schema({
	bidPeriodName: {
		type: String,
		default: ''
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

mongoose.model('bidPeriod', bidPeriod);
