var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
    name: String,
    code: String,
    clientUsername: String,
    freelancerUsername: String,
    details: String,
    bidLowerbound: Number,
    bidUpperbound: Number,
    lastBiddingDate : Date,
    status: {type: String, default: 'open'}
});

module.exports = mongoose.model('project', ProjectSchema);
