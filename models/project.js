var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
    name: String,
    code: String,
    clientUsername: String,
    freelancerUsername: String,
    details: String,
    lastBiddingDate : Date,
    status: {type: String, default: "open"}
});

module.exports = mongoose.model('project', ProjectSchema);
