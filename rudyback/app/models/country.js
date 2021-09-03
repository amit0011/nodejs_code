var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var country = new Schema({
  name: {
    type: String,
    default: ""
  },
  documents: [{
      type: ObjectId,
      ref: 'documents'
  }],
  status: {
    type: Number,
    default: 0 // status 0 is Active and 1 is Delete
  }
}, { timestamps: true });

country.plugin(mongoosePaginate);
mongoose.model("country", country);
