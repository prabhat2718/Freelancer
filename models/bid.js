var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BidSchema = new Schema({
    freelanceUsername: String,
    projectCode: String,
    biddingDate : { type : Date, default: Date.now },
    price: Number
});

module.exports = mongoose.model('bid', BidSchema);
