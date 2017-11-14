var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    flash = require('connect-flash');
    
var Recipe = require('./models/recipe'),
    User = require('./models/user');

var userRoutes = require('./routes/users'),
    recipeRoutes = require('./routes/recipes'),
    indexRoutes = require('./routes/index');
    
mongoose.connect('mongodb://admin:admin@ds257495.mlab.com:57495/grocery');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname +'/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.use(bodyParser.json());

// PASSPORT CONFIGURATION
app.use(require('express-session')({
  secret: 'Mac Dre is the king of the bay',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware function to be applied to all routes (authenticates user)
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use('/', indexRoutes);
app.use('/', userRoutes);
app.use('/', recipeRoutes);




app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Server has started!!');
});