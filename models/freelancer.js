var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var FreelancerSchema = new Schema({
    name: String,
    username: String,
    organisation: String,
    gender: String, 
    mobile: String,
    email: String,
    githubLink: String,
    password: String,
    joiningDate : { type: Date, default: Date.now },
    detailsFreelancer: String,
    detailsClient: String,
    skillsClient: [String],
    skillsFreelancer: [String],
    totalClientRating: {type: Number, default: 0},
    totalFreelancerRating: {type: Number, default: 0},
    totalClientCount: {type: Number, default: 0},
    totalFreelancerCount: {type: Number, default: 0}
});

FreelancerSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

FreelancerSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('freelancer', FreelancerSchema);
