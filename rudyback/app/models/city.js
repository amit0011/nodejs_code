const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const city = new Schema({
  city: {
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: ""
  },
  status: {
    type: Number,
    default: 0 // status 0 is Active and 1 is Delete
  }
}, { timestamps: true });

city.plugin(mongoosePaginate);
mongoose.model("city", city);
