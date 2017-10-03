var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/freelancer.js');

module.exports = function(passport){
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	//for signup
	passport.use('local-signup', new LocalStrategy({passReqToCallback: true},
		function(req, username, password, done){
			var name = req.body.name;
			var username = req.body.username;
			var email = req.body.email;
			var mobile = req.body.mobile;
			var org = req.body.organization;
			var githubLink = req.body.githubLink;
			User.findOne({username: username}, function(err, user){
				if(err)
					return done(err);
				if(user)
					return done(null, false, req.flash('signupMsg', 'Username already taken.'));
				User.findOne({email: email}, function(err, user){
					if(err)
						return done(err);
					if(user)
						return done(null, false, req.flash('signupMsg', 'Email already taken.'));
					var newUser = new User();
					newUser.name = name;
					newUser.username = username;
					newUser.email = email;
					newUser.mobile = mobile;
					newUser.organization = org;
					newUser.githubLink = githubLink;
					newUser.password = newUser.generateHash(password);
					newUser.save(function(err){
						if(err)
							throw err;
						req.session.username = newUser.username;
						req.session.userid = newUser.id;
						return done(null, newUser);
					});
				});
			});
		}
	));

	//for login
	passport.use('local-login', new LocalStrategy({passReqToCallback: true}, 
		function(req, username, password, done){
			User.findOne({username : username}, function(err, user){
				if(err)
					return done(err);
				if(!user)
					return done(null, false, req.flash('loginMsg', 'Incorrect Username.'));
				if(!user.validPassword(password))
					return done(null, false, req.flash('loginMsg', 'Incorrect Password.'));
				req.session.username = user.username;
				req.session.userid = user.id;
				return done(null, user);
			});
		}
	));
};