const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/user'),
    nodemailer = require('nodemailer'),
    URLSafeBase64 = require('urlsafe-base64');

router.get('/', function(req, res) {
    res.render('landing');
});

// CREATE USER
router.post('/users', function(req, res, next) {
    
    User.findOne({ "$or":[{ username: req.body.username }, { email: req.body.email }] }, function(err, user) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        
        if(user) {
            req.flash('error', 'A user already exists with that username or email!');
            return res.redirect('back');
        }
        
        let newUser = new User({username: req.body.username, email: req.body.email.toLowerCase(), password: req.body.password});
        newUser.save();

        req.logIn(newUser, function(err) {
          if (err) return next(err);
          req.flash('success', `Wecome to Recipe Cloud, ${newUser.username}`);
          return res.redirect('/');
        });
    });
});

// handle login logic
router.post('/login', emailToLowerCase, function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
        req.flash('error', 'Incorrect email or password!');
      return res.redirect('/');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

function emailToLowerCase(req, res, next){
    req.body.email = req.body.email.toLowerCase();
    next();
}

//logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have successfully logged out.');
  res.redirect('/');
});

// password reset
router.get('/forgot', function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('users/forgot');
});

router.post('/forgot', function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }

    (function generateToken() {
          let buf = Buffer.alloc(16);
          for (let i = 0; i < buf.length; i++) {
              buf[i] = Math.floor(Math.random() * 256);
          }
          let token = URLSafeBase64.encode(buf).toString();
          
        (function assignToken(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirrect('/');
            }
            
            User.findOne({email: req.body.email}, function(err, user) {
                if(err) {
                    req.flash('error', err.message);
                    return res.redirect('/');
                }
                
                user.resetToken = token;
                user.tokenExpires = Date.now() + 3600000; // 1 hour
                
                user.save();
                
                let transporter = nodemailer.createTransport({
                    host: 'sub5.mail.dreamhost.com',
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    requireTLS: true, //Force TLS
                    tls: {  
                        rejectUnauthorized: false
                    },
                    auth: {
                        user: process.env.DREAMUSER,
                        pass: process.env.DREAMPASS
                    }
                });
            
                let mailOptions = {
                    from: 'Recipe Cloud <donotreply@recipe-cloud.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Password Reset', // Subject line
                    html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br /><br />
                    Please click on the following link, or paste this into your browser to complete the process (Note: This link will expire after 1 hour):<br /><br />
                    <a href='http://${req.headers.host}/reset/${user.resetToken}'>href='http://${req.headers.host}/reset/${user.resetToken}</a><br /><br />
                    If you did not request this, please ignore this email and your password will remain unchanged.` // html body
                };
            
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        req.flash('error', err.message);
                        return res.redirect('/');
                    } else {
                        req.flash('success',`An email has been sent to ${req.body.email} with instructions.`);
                        res.redirect('/');
                    }
                });
            });
        })();
  })();
});

router.get('/reset/:token', function(req, res) {
    User.findOne({resetToken: req.params.token, tokenExpires: { $gt: Date.now() } }, function(err, user) {
        if(err) {
            req.flash('error', err.message);
            return res.redirect('/forgot');
        } else if(!user) {
            req.flash('error', 'Token does\'t exist!');
            return res.redirect('/forgot');
        }
        res.render('users/reset');
    });
});

router.post('/reset/:token', function(req, res) {
    if(req.body.password != req.body.confirm) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('back');
    }
    User.findOne({resetToken: req.params.token, tokenExpires: { $gt: Date.now() } }, function(err, user) {
        if(err || !user) {
            req.flash('err', err.message);
            return res.redirect('/users/forgot');
        }
            user.password = req.body.password;
            user.resetToken = undefined;
            user.tokenExpires = undefined;
            user.save();
            
            req.flash('success', 'You have successfully updated your password!');
            res.redirect('/');
    });
});

module.exports = router;