var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
const nodemailer = require('nodemailer');
var URLSafeBase64 = require('urlsafe-base64');

router.get('/', function(req, res) {
    res.render('landing');
})

// handle login logic
router.post('/login', usernameToLowerCase, function(req, res, next) {
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
function usernameToLowerCase(req, res, next){
    req.body.email = req.body.email.toLowerCase();
    next();
}

//logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have successfully logged out.');
  res.redirect('/');
})

// password reset
router.get('/forgot', function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('users/forgot');
})

router.post('/forgot', function(req, res) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }

    (function generateToken() {
        console.log('called');
          var buf = Buffer.alloc(16);
          for (var i = 0; i < buf.length; i++) {
              buf[i] = Math.floor(Math.random() * 256);
          }
          var token = URLSafeBase64.encode(buf).toString();
          
        (function assignToken(err) {
            console.log('assigning');
            if(err) {
                req.flash('error', err.message);
                return res.redirrect('/');
            }
            
            User.findOne({email: req.body.email}, function(err, user) {
                if(err) {
                    req.flash('error', err.message);
                    return res.redirect('/')
                }
                
                user.resetToken = token;
                user.tokenExpires = Date.now() + 3600000; // 1 hour
                
                user.save();
                
                var transporter = nodemailer.createTransport({
                    host: 'sub5.mail.dreamhost.com',
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    requireTLS: true, //Force TLS
                    tls: {  
                        rejectUnauthorized: false
                    },
                    auth: {
                        user: 'david@tabletofarmcompost.com',
                        pass: 'Dasabija92'
                    }
                });
            
                var mailOptions = {
                    from: 'Recipe Cloud <donotreply@recipe-cloud.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Password Reset', // Subject line
                    html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br /><br />
                    Please click on the following link, or paste this into your browser to complete the process (Note: This link will expire after 1 hour):<br /><br />
                    <a href='http://${req.headers.host}/reset/${user.resetToken}'>href='http://${req.headers.host}/reset/${user.resetToken}</a><br /><br />
                    If you did not request this, please ignore this email and your password will remain unchanged.` // html body
                };
            
                transporter.sendMail(mailOptions, (error, info) => {
                    console.log('called');
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
    })
})

router.post('/reset/:token', function(req, res) {
    if(req.body.password != req.body.confirm) {
        req.flash('error', 'Passwords do not match.')
        return res.redirect('back');
    }
    User.findOne({resetToken: req.params.token, tokenExpires: { $gt: Date.now() } }, function(err, user) {
        if(err || !user) {
            req.flash('err', err.message);
            res.redirect('/users/forgot');
        } else {
            user.password = req.body.password;
            user.resetToken = undefined;
            user.tokenExpires = undefined;
            user.save();
            
            req.flash('success', 'You have successfully updated your password!');
            res.redirect('/');
        }
        
        
    });
})

module.exports = router;