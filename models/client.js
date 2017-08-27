var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ClientSchema = new Schema({
    name: String,
    username: String,
    email: String,
    mobile:Number
});

var client = mongoose.model("client",ClientSchema);

module.exports = mongoose.model("client",ClientSchema );