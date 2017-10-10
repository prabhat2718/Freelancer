module.exports = function(app, passport){
	var multer  = require('multer') ;
	var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    /*
    filename: function (req, file, cb) {
        cb(null, file. )
    }*/
	});
	var upload = multer({ storage: storage });
	//var upload = multer({ dest: 'uploads/' }) ;

	app.get('/', function(req, res){
		var Project = require('./models/project.js');
		Project.aggregate(
			[
				{	"$match" : {}	},
				{	"$sort": {"lastBiddingDate" : -1}	},
				{	"$limit": 20	},
				{
					"$lookup": {
					    "localField": "clientUsername",
					    "from": "freelancers",
					    "foreignField": "username",
					    "as": "client"
					} 
				},
				{	"$unwind": "$client"	}
			],
			function(err, results){
				if(!err){
					console.log(results);
					res.render('landing', {title: 'Freelancer2k17 - Home', loggedIn: req.isAuthenticated(), 
						username: req.session.username, projects: results});
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated, 
						username: req.session.username, projects: []});
			}
		);
	    //res.render('landing.ejs', {title: 'Home - Freelancer2k17', loggedIn: req.isAuthenticated(), username: req.session.username});
	});

	app.get( '/messages' , function( req , res ) {
		if(!req.isAuthenticated())
			res.redirect('/');
	    var Message = require('./models/message.js') ;
		Message.find({receiver:req.session.username} , function( err , messages ) {
			res.render('messages' , { title: 'Messages' ,loggedIn: req.isAuthenticated(), 
			username: req.session.username , messages: messages }) ;
		}) ;
		
	});
	
	app.get('/signup',function(req, res){
		if(req.isAuthenticated())
			res.redirect('/');
	    res.render('signup', {title: 'Sign Up - Freelancer2k17', loggedIn: false, msg: req.flash('signupMsg')});
	});

	app.get('/login',function(req, res){
		if(req.isAuthenticated())
			res.redirect('/');
	    res.render('login', {title: 'Log In - Freelancer2k17', loggedIn: false, msg: req.flash('loginMsg')});
	});

	app.post('/signup', upload.single('profile_picture') , passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login', 
		failureFlash: true
	}));

	app.get('/profile/:username/freelancer', function(req, res){
		var Users = require('./models/freelancer.js');
		Users.aggregate(
			[
				{	"$match" : {"username" : req.params.username}	},
				{
					"$lookup": {
					    "localField": "username",
					    "from": "projects",
					    "foreignField": "freelancerUsername",
					    "as": "projectsFreelancer"
					} 
				},
			],
			function(err, results){
				if(results.length > 0){
					console.log(results);
					res.render('profile_freelancer', {title: 'Freelancer Profile - ' + req.params.username, 
						loggedIn: req.isAuthenticated(), username: req.session.username,
						user: results[0]});
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated(), 
						username: req.session.username});
			}
		);
	});

	app.get('/profile/:username/client', function(req, res){
		var Users = require('./models/freelancer.js');
		Users.aggregate(
			[
				{	"$match" : {"username" : req.params.username}	},
				{
					"$lookup": {
					    "localField": "username",
					    "from": "projects",
					    "foreignField": "clientUsername",
					    "as": "projectsClient"
					} 
				}
			],

			function(err, results){
				if(!err && results.length > 0){
					console.log(results);
					res.render('profile_client', {title: 'Client Profile - ' + req.params.username, 
						loggedIn: req.isAuthenticated(), username: req.session.username,
						user: results[0] });
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated(), 
						username: req.session.username });
			}
		);
	});

	app.get('/project/:projectcode', function(req, res){
		var Project = require('./models/project.js');
		Project.aggregate(
			[
				{	"$match" : {"code" : req.params.projectcode}	},
				{
					"$lookup": {
					    "localField": "clientUsername",
					    "from": "freelancers",
					    "foreignField": "username",
					    "as": "client"
					} 
				},
				{
					"$lookup":{
						"localField": "code",
						"from": "bids",
						"foreignField": "projectCode",
						"as": "bids"
					}
				},
				{	"$unwind": "$client"	}
			],
			function(err, results){
				if(!err && results.length > 0){
					console.log(results);
					res.render('project', {title: 'Project - ' + req.params.projectcode, 
						loggedIn: req.isAuthenticated(), username: req.session.username,
						project: results[0]});
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated, 
						username: req.session.username});
			}
		);
	});

	app.post('/project/:projectcode', function(req, res){
		
	});

	app.get('/addproject', function(req, res){
		if(!req.isAuthenticated())
			res.redirect('/');
		res.render('add_project', {title: 'Add Project', loggedIn: req.isAuthenticated(), 
			username: req.session.username, msg: ""});
	});

	app.get( '/send_message/:receiver' , function( req, res) {
		if(!req.isAuthenticated())
			res.redirect('/');
		res.render('send_message', {title: 'Send Message', loggedIn: req.isAuthenticated(), 
		username: req.session.username, msg: "", receiver:req.params.receiver});
	});

	app.get( '/send_message' , function( req, res) {
		if(!req.isAuthenticated())
			res.redirect('/');
		res.render('send_message', {title: 'Send Message', loggedIn: req.isAuthenticated(), 
			username: req.session.username, msg: "", receiver:"" });
	});

	app.post('/addproject', function(req, res){
		if(!req.isAuthenticated())
			res.redirect('/');
		var Project = require('./models/project.js');
		Project.findOne({code: req.body.code}, function(err, project){
			var msg;
			if(err)	
				msg = "Error!";
			else if(project)
				msg = "This Project Code is already taken."
			else{
				newProject = new Project();
				newProject.name = req.body.name;
				newProject.code = req.body.code;
				newProject.lastBiddingDate = req.body.lastBiddingDate;
				newProject.details = req.body.details;
				newProject.clientUsername = req.session.username;
				newProject.save(function(err){
					
				});
				msg = "Project successfully added."
			}
			res.render('add_project', {title: 'Add Project', loggedIn: req.isAuthenticated(), 
				username: req.session.username, msg: msg});
		});
	});

	app.post( '/send_message' , function( req, res) {
		if(!req.isAuthenticated())
			res.redirect('/');
		var Message = require('./models/message.js');
		var Freelancer = require( './models/freelancer.js') ;
		Freelancer.findOne({username: req.body.receiver}, function(err, freelancer){
			var msg;
			if(err)	
				msg = "Error!";
			else if( req.session.username == req.body.receiver )
				msg = "Why do you want to send message to yourself?" ;
			else if(freelancer)
			{
				newMessage = new Message();
				newMessage.sender = req.session.username ;
				newMessage.receiver = req.body.receiver ;
				newMessage.message = req.body.message ;
				newMessage.save(function(err){
					
				});
				msg = "Message sent successfully." ;
			}
			else{
				msg = "No such user." ;	
			}
			res.render('send_message', {title: 'Send Message', loggedIn: req.isAuthenticated(), 
				username: req.session.username, msg: msg, receiver:"" });
		});
	}) ;

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
	
	
	//Display details of the client
	app.get( "/profile/client/:username" , function( req , res ) {
	  mongoose.model('clients').find( { username : req.params.username } , function( err , client ) {
	    res.render( 'clientProfile' , { client : client } ) ;
	  }) ;
	}) ;

	//Display details of the freelancer
	app.get( "/profile/freelancer/:username" , function( req , res ){
	  mongoose.model('freelancers').find( { username : req.params.username } , function( err , freelancer ) {
	    res.render( 'freelancerProfile' , { freelancer : freelancer } ) ;
	  }) ;
	} ) ;
};
