const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const containerInventory = new Schema({
  incomingDate: {
    type: Date,
    default: Date.now,
  },
  outgoingDate: {
    type: Date,
    default: null,
  },
  containerNumber: {
    type: String,
    required: true,
  },
  contractNumber: {
    type: String,
    default: ''
  },
	loadingPortId: {
		type: Schema.ObjectId,
		ref: 'loadingPort',
  },
  released: {
    type: Boolean,
    default: false,
  },
  comment: {
    type: String,
    default: '',
  },
  status: {
    type: Number,
    default: 0 // status 0 is Active and 1 is Delete
  }
}, { timestamps: true });

containerInventory.plugin(mongoosePaginate);
mongoose.model("containerInventory", containerInventory);
