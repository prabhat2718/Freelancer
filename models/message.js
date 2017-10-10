var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    sender: String,
    receiver: String,
    message: String,
    date : { type: Date, default: Date.now },
});

module.exports = mongoose.model('message', MessageSchema);
