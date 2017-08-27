var LocalStrategy = require('passport-local').Strategy;
var Users = require('../models/freelancer.js');

module.exports = function(passport){
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		Users.findById(id, function(err, user) {
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
			var githublink = req.body.github_link;
			Users.findOne({username: username}, function(err, user){
				if(err){
					return done(err);
				}
				if(user){
					return done(null, false, req.flash('signupMsg', 'Username already taken.'));
				}
				// console.log('step 1');
				Users.findOne({email: email}, function(err, user){
					if(err){
						return done(err);
					}
					if(user){
						return done(null, false, req.flash('signupMsg', 'Email already taken.'));
					}
					// console.log('step 2');
					var newUser = new Users();
					newUser.name = name;
					newUser.username = username;
					newUser.email = email;
					newUser.mobile = mobile;
					newUser.githublink = githublink;
					newUser.password = newUser.generateHash(password);
					newUser.save(function(err){
						if(err){
							throw err;
						}
						return done(null, newUser);
					});
				});
			});
		}
	));

	//for login
	passport.use('local-login', new LocalStrategy({passReqToCallback: true}, 
		function(req, username, password, done){
			console.log('check 1');
			Users.findOne({username : username}, function(err, user){
				if(err){
					return done(err);
				}
				console.log('check 2');
				if(!user){
					return done(null, false, req.flash('loginMsg', 'Incorrect Username.'));
				}
				console.log('check 3');
				if(!user.validPassword(password)){
					return done(null, false, req.flash('loginMsg', 'Incorrect Password.'));
				}
				console.log('check 4');
				return done(null, user);
			});
		}
	));
};