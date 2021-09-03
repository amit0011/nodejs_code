var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var commodityAdjustment = new Schema({
    commodityId: {
        type: ObjectId,
        ref: "commodity"
    },
    cropYear: {
        type: String,
        default: ""
    },
    inventoryGrade: {
        type: ObjectId,
        ref: "grade"
    },
    adjustmentDate: {
        type: Date
    },
    qtyCwt: {
        type: Number
    },
    purchaseSale: {
        type: String,
        default: ""
    },
    amount: {
        type: Number
    },
    reason: {
        type: String,
        default: ""
    },
    createdBy: {
        type: String,
        default: ""
    }
}, { timestamps: true });

commodityAdjustment.plugin(mongoosePaginate);
mongoose.model("commodityAdjustment", commodityAdjustment);
