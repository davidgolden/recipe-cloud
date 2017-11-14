var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Recipe = require('../models/recipe');
var middleware = require('../middleware');

// SHOW ALL USERS
router.get('/users', function(req, res) {
    User.find({}, function(err, allUsers) {
        if(err) {
            console.log(err);
        } else {
            res.render('users', {users: allUsers});
        }
    })
})

// SIGN UP FORM
router.get('/users/new', function(req, res) {
    res.render('users/new')
})

// CREATE USER
router.post('/users', function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        passport.authenticate('local')(req, res, function() {
            req.flash('success', 'Wecome to Grocery, ' + user.username);
            res.redirect('/');
        })
    })
})

// SHOW USER'S RECIPES
router.get('/users/:user_id', middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.user_id).populate('recipes').exec(function(err, user) {
        if(err) {
            console.log(err);
        } else {
            res.render('users/show', {user: user});
        }
    })
})



module.exports = router;