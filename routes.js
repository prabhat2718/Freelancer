module.exports = function(app, passport){
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

	app.post('/signup', passport.authenticate('local-signup', {
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
						user: results[0]});
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated(), 
						username: req.session.username});
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

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
};