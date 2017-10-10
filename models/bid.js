var mongoose = require('mongoose');

var BidSchema = new mongoose.Schema({
    username: String,
    projectCode: String,
    date : { type: Date, default: Date.now },
    price: Number,
    status: {type: String, default: 'pending'}
});

module.exports = mongoose.model('bid', BidSchema);
