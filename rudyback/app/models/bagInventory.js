var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var bagInventory = new Schema({
	bagId: {
		type: Schema.Types.ObjectId,
		ref: 'bags'
	},
	bagCategoryId: {
		type: Schema.Types.ObjectId,
		ref: 'bagCategory'
	},
  noOfBags: {
		type: Number,
		default: 0
	},
	reason: {
		type: String,
		default: ''
	},
	invoiceBLNumber: {
		type: String,
		default: ''
	},
  entryType: {
    type: String,
    enum: [
      'OpeningInventory',
      'mannual',
      'projected',
      'actual'
    ],
    default: 'mannual',
  },
  meta: {
    type: Object,
    default: {},
  },
	date: {
    type: Date,
    default: Date.now
	}
}, { timestamps: true });

bagInventory.plugin(mongoosePaginate);
mongoose.model('bagInventory', bagInventory);
