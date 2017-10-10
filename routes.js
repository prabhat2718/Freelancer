module.exports = function(app, passport){

	var Notification = require('./models/notification.js');

	function getNotif(username, auth){
		if(username == null || username == '' || !auth)
			return [];
		var notif = [];
		Notification.aggregate(
			[
				{	"$match" : {username: username, seen: false}	},
				{	"$sort" : {"date" : -1}	},
			],
			function(err, results){
				if(!err){
					console.log('results = ');
					console.log(results);
					notif = results;
				}
			}
		);
		console.log('notif = ');
		console.log(notif);
		return notif;
	}

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
					// console.log(results);
					res.render('landing', {title: 'Freelancer2k17 - Home', loggedIn: req.isAuthenticated(), 
						username: req.session.username, projects: results, notif: getNotif(req.session.username, req.isAuthenticated())});
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated(), 
						username: req.session.username, projects: [], notif: []});
			}
		);
	    // res.render('landing.ejs', {title: 'Home - Freelancer2k17', loggedIn: req.isAuthenticated(), username: req.session.username});
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

	//fb auth
	app.get('/login/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile']}));

	app.get('/login/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
		res.redirect('/');
	});

	app.post('/checkusername', function(req, res){
		var User = require('./models/freelancer.js');
		User.findOne({username: req.body.username}, function(err, user){
			if(err)
				res.status(200).json({ result: 'err' });
			else if(user)
				res.status(200).json({ result: 'no' });
			else
				res.status(200).json({ result: 'yes' });
		});
	});

	app.post('/checkprojectcode', function(req, res){
		var Project = require('./models/project.js');
		Project.findOne({code: req.body.projectcode}, function(err, project){
			if(err)
				res.status(200).json({ result: 'err' });
			else if(project)
				res.status(200).json({ result: 'no' });
			else
				res.status(200).json({ result: 'yes' });
		});
	});


	app.get('/profile/:username/freelancer', function(req, res){
		var User = require('./models/freelancer.js');
		User.aggregate(
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
				if(!err && results.length > 0){
					// console.log(results);
					res.render('profile_freelancer', {title: 'Freelancer Profile - ' + req.params.username, 
						loggedIn: req.isAuthenticated(), username: req.session.username,
						user: results[0], notif: getNotif( req.session.username, req.isAuthenticated() )});
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated(), 
						username: req.session.username, notif: getNotif( req.session.username, req.isAuthenticated() )});
			}
		);
	});

	app.get('/profile/:username/client', function(req, res){
		var User = require('./models/freelancer.js');
		User.aggregate(
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
					// console.log(results);
					res.render('profile_client', {title: 'Client Profile - ' + req.params.username, 
						loggedIn: req.isAuthenticated(), username: req.session.username,
						user: results[0], notif: getNotif(req.session.username)});
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated(), 
						username: req.session.username, notif: getNotif( req.session.username, req.isAuthenticated() )});
			}
		);
	});

	app.get('/notifications', function(req, res){
		if( req.isAuthenticated() ){
			Notification.aggregate(
			[
				{	"$match" : {username: req.session.username}	},
				{	"$sort" : {"date" : -1}	},
			],
			function(err, results){
				if(!err){
					res.render('notif', {title: 'All Notifications', loggedIn: req.isAuthenticated(),
					username: req.session.username, notif: results});
				}
			}
		);
		}else{
			res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated(), 
				username: req.session.username, notif: getNotif( req.session.username, req.isAuthenticated() )});
		}
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
					// console.log('results = ')
					// console.log(results);
					res.render('project', {title: 'Project - ' + req.params.projectcode, 
						loggedIn: req.isAuthenticated(), username: req.session.username,
						project: results[0], notif: getNotif( req.session.username, req.isAuthenticated() )});
				}else
					res.render('not_found', {title: 'Not Found', loggedIn: req.isAuthenticated(), 
						username: req.session.username, notif: getNotif( req.session.username, req.isAuthenticated() )});
			}
		);
	});

	app.post('/project/:projectcode', function(req, res){
		// console.log('req.body = ')
		// console.log(req.body);
		var Bid = require('./models/bid.js');
		Bid.findOne({username: req.session.username, projectCode: req.params.projectcode}, function(err, bid){
			if(err){

			} 
			else if(bid){
				bid.date = Date();
				bid.price = req.body.price;
				bid.save();
			} 
			else{
				var newBid = new Bid();
				newBid.username = req.session.username;
				newBid.projectCode = req.params.projectcode;
				newBid.date = Date();
				newBid.price = req.body.price;
				newBid.save(function(err){
					if(err)
						return err;
				});
			}
			res.redirect('/project/'+req.params.projectcode);
		});
	});

	app.post('/acceptbid/:projectcode', function(req, res){
		// console.log('req.body = ');
		// console.log(req.body);
		var Bid = require('./models/bid.js');
		Bid.findOne({username: req.body.acceptedBid, projectCode: req.params.projectcode}, function(err, bid){
			if(err){
			} 
			else if(bid){
				bid.status='accepted';
				bid.save(function(err){
					if(err)
						return err;
				});
				var Project = require('./models/project.js');
				Project.findOne({code: req.params.projectcode}, function(err, project){
					if(err){
					}
					else if(project){
						project.freelancerUsername = req.body.acceptedBid;
						project.status = 'closed';
						project.save(function(err){
							if(err)
								return err;
						});
					}
					else{
					}
				});
				var newNotif = new Notification();
				newNotif.username = bid.username;
				newNotif.content = 'You bid for Project ' + bid.projectCode + ' has been accepted';
				newNotif.link = '/project/' + bid.projectCode;
				newNotif.save(function(err){
					if(err)
						return err;
				});
			}else{
			}
			res.redirect('/project/'+req.params.projectcode);
		});
	});

	app.get('/addproject', function(req, res){
		if(!req.isAuthenticated())
			res.redirect('/');
		res.render('add_project', {title: 'Add Project', loggedIn: req.isAuthenticated(), 
			username: req.session.username, msg: "", notif: getNotif(req.session.username, req.isAuthenticated())});
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
				newProject.clientUsername = req.session.username;
				newProject.lastBiddingDate = req.body.lastBiddingDate;
				newProject.details = req.body.details;
				newProject.bidLowerbound = req.body.bidLowerbound;
				newProject.bidUpperbound = req.body.bidUpperbound;
				newProject.save(function(err){
					if(err)
						return err;
				});
				// var img = req.files.image;
				// console.log(img);
				// if(img.mimetype=='.png'){
				// 	img.mv('./images/project/'+req.body.code+'.png', function(err){
				// 		if(err)
				// 			console.log(err);
				// }else
				// 		msg = "Only PNG format images are accepted."
				// 	});
				msg = "Project successfully added."
			}
			res.render('add_project', {title: 'Add Project', loggedIn: req.isAuthenticated(), 
				username: req.session.username, msg: msg, notif: getNotif( req.session.username, req.isAuthenticated() )});
		});
	});

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

};