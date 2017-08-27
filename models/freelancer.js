var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var FreelancerSchema = new Schema({
    name: String,
    username: String,
    email: String,
    mobile:Number,
    github_link:String,
    password:String
});

// var freelancer = mongoose.model("freelancer",FreelancerSchema);	why is this needed?


FreelancerSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

FreelancerSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('freelancer', FreelancerSchema);
