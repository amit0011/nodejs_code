var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var freightSettings = new Schema({
	intermodalVCR: {
		type: Number,
		default: 0
	},
	intermodalMTL: {
		type: Number,
		default: 0
	},
	intermodalVCRUSD: {
		type: Number,
		default: 0
	},
	intermodalMTLUSD: {
		type: Number,
		default: 0
	},
	blFee: {
		type: Number,
		default: 0
	},
	CyUsd: {
		type: Number,
		default: 0
	},
	cwtsFcl: {
		type: Number,
		default: 0
	},
	fobSktnBoxcar: {
		type: Number,
		default: 0
	},
	fobSktnHoppercar: {
		type: Number,
		default: 0
	},
	fobWpgBoxcar: {
		type: Number,
		default: 0
	},
	fobWpgHoppercar: {
		type: Number,
		default: 0
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
}, { timestamps: true });

freightSettings.plugin(mongoosePaginate);
mongoose.model('freightSettings', freightSettings);
