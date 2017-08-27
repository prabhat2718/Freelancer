module.exports = function(app, passport){
	app.get('/', function(req, res){
	   res.render('landing.ejs');
	});

	app.get('/signup',function(req, res){
		if(req.isAuthenticated()){
			res.redirect('/');
		}
	    res.render('signup.ejs', {signupMsg: req.flash('signupMsg')});
	});

	app.get('/login',function(req, res){
		if(req.isAuthenticated()){
			res.redirect('/');
		}
	    res.render('login.ejs', {loginMsg: req.flash('loginMsg')});
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login', 
		failureFlash: true
	}));

	app.use('/profile', function(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		res.redirect('/');
	})

	app.get('/profile', function(req, res){
		res.render('profile.ejs');
	})

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
};