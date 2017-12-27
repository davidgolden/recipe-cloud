const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    methodOverride = require('method-override'),
    flash = require('connect-flash'),
    expressSanitizer = require('express-sanitizer');
    
const Recipe = require('./models/recipe'),
    User = require('./models/user');

const userRoutes = require('./routes/users'),
    recipeRoutes = require('./routes/recipes'),
    indexRoutes = require('./routes/index');
    
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO, { useMongoClient: true })
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));
      
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(expressSanitizer()); // this line follows bodyParser() instantiations 
app.use(express.static(__dirname +'/public'));
app.use(methodOverride('_method'));
app.use(flash());


// PASSPORT CONFIGURATION
app.use(require('express-session')({
  secret: 'Mac Dre is the king of the bay',
  resave: false,
  saveUninitialized: false
}));


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect email.' });
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  });
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// middleware function to be applied to all routes (authenticates user)
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.locals.tags = ['Dinner', 'Breakfast', 'Dessert', 'Quick/Easy', 'Vegetarian', 'Vegan', 'Dairy-Free', 'Gluten-Free'];

app.use('/', indexRoutes);
app.use('/', userRoutes);
app.use('/', recipeRoutes);

app.get('*', function(req, res) {
    res.redirect('/');
})

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});