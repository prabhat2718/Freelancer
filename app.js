var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
   	freelancer = require("./models/freelancer"),
   	client     = require("./models/client"),
    mongoose   = require("mongoose"),
    port       = process.env.PORT || 8080;;

app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine","ejs")

//connect mongodb
mongoose.connect("mongodb://localhost/freelancer");
mongoose.Promise = global.Promise;  

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:')); 


app.get("/",function(req,res){
   res.render("landing");
});

app.get("/signup",function(req,res){
   res.render("signup");
});

app.get("/login",function(req,res){
	res.render("login");
});

app.listen(port,function(){
   console.log("Freelancer Server start"); 
});