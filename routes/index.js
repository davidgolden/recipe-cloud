var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get('/', function(req, res) {
    res.render('landing');
})

// handle login logic
router.post('/login', passport.authenticate('local',
  {
    successRedirect: '/users',
    failureRedirect: '/login'
  }),function(req, res) {
})

//logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have successfully logged out.');
  res.redirect('/');
})

module.exports = router;