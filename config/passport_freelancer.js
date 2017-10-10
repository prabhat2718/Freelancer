var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/freelancer.js');
var validator = require('validator') ;
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
			var profile_picture = "default.JPG" ;
			var dob = req.body.dob ;
			var today_date = Date.now ;
			var rpassword = password ;
			var val = true ;
			if( req.file != null )
				profile_picture = "" + req.file.filename ;
			if( name == "" || email == "" || org == "" || mobile.length == 0 || githubLink == "" || dob == "" )
			{
				req.flash('signupMsg', 'Please fill all fields.') ;
				val = false ;
			}
			if( !validator.isEmail( email ) )
				req.flash('signupMsg', 'Enter a valid email.') ;
			if( mobile.length != 10 )
				req.flash('signupMsg', 'Enter a valid mobile number.') ;
			if( !validator.isURL( githubLink ) )
				req.flash('signupMsg', 'Enter a valid Github Link.') ;
			if( password != rpassword )
				req.flash('signupMsg', 'Passwords do not match.') ;
			else	
			{
				capital = false 
				small = false 
				number = false 
				if( password.length < 8 )
					req.flash('signupMsg', 'Passwords should be 8 letters long.') ;
				for (var j = 0; j<password.length; j++)
				{
				    if( password.charAt( j ) >= 'a' && password.charAt( j ) <= 'z')
				        small = true ;
				    if( password.charAt( j ) >= 'A' && password.charAt( j ) <= 'Z')
				        capital = true ;
				    if ( password.charAt( j ) >= '0' && password.charAt( j ) <= '9' )
				        number = true ;
				}
				if( small == false || capital == false || number == false )
					req.flash('signupMsg', 'Password should contain one Capital, one small and one digit atleast') ;
			}
			if( val != true )
				return done(null, false, req.flash('signupMsg', 'Please correct the errors.'));

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
					newUser.profile_picture = profile_picture ;
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