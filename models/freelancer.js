var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var FreelancerSchema = new Schema({
    name: String,
    username: String,
    email: String,
    mobile:Number,
    github_link:String
});

var freelancer = mongoose.model("freelancer",FreelancerSchema);

module.exports = mongoose.model("freelancer",FreelancerSchema);