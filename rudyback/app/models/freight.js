var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

const structure = {
	countryName: {
		type: String,
		default: ''
	},
	cityName: {
		type: String,
		default: ''
	},
	loadingPortId: {
		type: ObjectId,
		ref: 'loadingPort'
	},
	equipmentId: {
		type: ObjectId,
		ref: 'equipment'
	},
	freightCompanyId: {
		type: ObjectId,
		ref: 'freightCompany'
	},
	unit: {
		type: Number,
		default: 0
	},
	validity: {
		type: Date,
		default: ''
	},
	blFee: {
		type: Number,
		default: 0
	},
	numberOfDays: {
		type: Number,
		default: 0
	},
	shiplineId: {
		type: ObjectId,
		ref: 'shipLine'
	},
	currencyType: {
		type: String,
		default: ''
  },
  parentId: {
    type: ObjectId,
    ref: 'freight'
  },
	oceanFreight: {
		bagToBagOcean: {
			type: Number,
			default: 0
		},
		bagToBagOceanCurrency: String,
		bagToBagStuffing: {
			type: Number,
			default: 0
		},
		bagToBagStuffingCurrency: String,
		bagToBag: {
			type: Number,
			default: 0
		},

		bulkToBulkOcean: {
			type: Number,
			default: 0
		},
		bulkToBulkOceanCurrency: String,
		bulkToBulkStuffing: {
			type: Number,
			default: 0
		},
		bulkToBulkStuffingCurrency: String,
		bulkToBulk: {
			type: Number,
			default: 0
		},

		bulkToBagOcean: {
			type: Number,
			default: 0
		},
		bulkToBagOceanCurrency: String,
		bulkToBagStuffing: {
			type: Number,
			default: 0
		},
		bulkToBagStuffingCurrency: String,
		bulkToBag: {
			type: Number,
			default: 0
		}
	},
	freightWithBlFee: {
		bagToBag: {
			type: Number,
			default: 0
		},
		bulkToBulk: {
			type: Number,
			default: 0
		},
		bulkToBag: {
			type: Number,
			default: 0
		}
	},
	freightCWT: {
		bagToBag: {
			type: Number,
			default: 0
		},
		bulkToBulk: {
			type: Number,
			default: 0
		},
		bulkToBag: {
			type: Number,
			default: 0
		}
	},
	freightMT: {
		bagToBag: {
			type: Number,
			default: 0
		},
		bulkToBulk: {
			type: Number,
			default: 0
		},
		bulkToBag: {
			type: Number,
			default: 0
		}
	},
	freightUSDMTFOB: {
		bagToBag: {
			type: Number,
			default: 0
		},
		bulkToBulk: {
			type: Number,
			default: 0
		},
		bulkToBag: {
			type: Number,
			default: 0
		}
	},
    notes: {
		type:String
	},
	lastOpenedBy: {
		type: ObjectId,
		ref: 'admin'
	},
	lastOpenedOn: {
		type: Date,
		default: Date.now
	},
	lastEditedBy: {
		type: ObjectId,
		ref: 'admin'
	},
	lastEditedOn: {
		type: Date,
		default: Date.now
	},
	createdBy: {
		type: ObjectId,
		ref: 'admin'
	},
	status: {
		type: Number,
		default: 0 // status 0 is Active and 1 is Delete
	}
};
var freight = new Schema(structure, { timestamps: true });

freight.plugin(mongoosePaginate);
mongoose.model('freight', freight);
mongoose.model('freightstmp__', new Schema({...structure}, { timestamps: true }));
