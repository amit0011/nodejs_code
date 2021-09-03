const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const archive = new Schema({
	entityName: String,
	reportName: String,
    reportUrl: String,
    reportDate: Date
}, { timestamps: true });

archive.plugin(mongoosePaginate);
mongoose.model('archive', archive);
