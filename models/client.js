var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var ClientSchema = new Schema({
    name: String,
    username: String,
    email: String,
    mobile:Number
});

// var client = mongoose.model("client",ClientSchema);	why is this needed?

ClientSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

ClientSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("client",ClientSchema );
