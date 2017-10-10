var express     = require('express'),
    app         = express(),
    // fileUpload = require('express-fileupload'),
    cookieParser= require('cookie-parser'),
    bodyParser  = require('body-parser'),
    rp          = require('request-promise');
    mongoose    = require('mongoose'),
    passport    = require('passport'),
    session     = require('express-session'),
    flash       = require('connect-flash'),
    morgan      = require('morgan'),
    port        = process.env.PORT || 8080;

process.env['CLIENT_ID'] = 182621408978131;
process.env['CLIENT_SECRET'] = "50bee445da1325cf0741e7bb51d64187";

// redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
// redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
// redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
// redirect rangeslider
app.use('/js', express.static(__dirname + '/node_modules/rangeslider.js/dist'))
// redirect CSS rangeslider
app.use('/css', express.static(__dirname + '/node_modules/rangeslider.js/dist'));


// rangeslider
app.use('/js', express.static(__dirname + '/node_modules/rangeslider.js/dist'))

// logging
app.use(morgan('dev'));

// connect mongodb
mongoose.Promise = global.Promise;  
mongoose.connect('mongodb://localhost/freelancer', {useMongoClient: true});

// init body & cookie parsers
app.use(bodyParser.urlencoded({extended : true}));

// app.use(fileUpload());
app.use(bodyParser.json());
app.use(cookieParser());

// set view template engine
app.set('view engine','ejs')

// init session
app.use(session({
    secret: 'ilovekabaab',
    saveUninitialized: true,
    resave: true
}));

//init passport
app.use(passport.initialize());
app.use(passport.session());

//for flash msgs
app.use(flash());

//for handling http req
require('./routes.js')(app, passport);

//for handling login, signup
require('./config/passport_freelancer.js')(passport);
// require('./config/passport_client.js')(passport);  //not implemented

app.listen(port, function(){
  console.log("Freelancer Server started at", port); 
});