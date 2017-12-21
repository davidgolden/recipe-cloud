var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Recipe = require('../models/recipe');
var middleware = require('../middleware');
var ing = require('../public/js/conversions');

// SIGN UP FORM
router.get('/users/new', function(req, res) {
    res.render('users/new')
})

// CREATE USER
router.post('/users', function(req, res) {
    var newUser = new User({username: req.body.username, email: req.body.email});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        passport.authenticate('local')(req, res, function() {
            req.flash('success', `Wecome to Grocery, ${user.username}`);
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

// DISPLAY GROCERY LIST
router.get('/grocery-list', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate('menu').exec(function(err, user) {
        if(err) {
            console.log(err);
        } else {
            res.render('grocery-list', {groceryList: user.groceryList, menu: user.menu });
        }
    })
})

// UPDATE GROCERY LIST
router.put('/grocery-list', middleware.isLoggedIn, function(req, res) {
    let items = req.body.item;
    let menu = req.body.menu;
    
    if(menu !== undefined) {
        if(Array.isArray(menu)) {
            User.findById(req.user._id, function(err, user) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        menu.forEach(function(recipe) {
                            user.menu.pull(recipe);
                            user.save();
                        })
                    }
                });
        }
        else if(Array.isArray(menu) === false && menu !== undefined) {
            User.findById(req.user._id, function(err, user) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                            user.menu.pull(menu.toString())
                            user.save();
                    }
                });
        }
    }
    
    
    
    if(items !== undefined) {
    let count;
    if(Array.isArray(items.num)) { 
        count = items.num.length;
    }
    else {
        count = 1;
    };
    // remove extraneous 'off' variables in num (if checkbox is on)
    for(let i=0; i< items.num.length; i++) {
        if(items.num[i] === 'on') {
            items.num.splice(i-1, 1);
        }
    }
    // find current user
        User.findOne({"_id": req.user._id}, function(err, user) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
                // delete all list items
                user.groceryList.splice(0, user.groceryList.length);
                user.save();
            // loop of number of ingredients
                for(let i=0; i<count; i++) {
                // if checkbox is on, delete grocery list ingredient with id at index i
                    if(Array.isArray(items.id) === true && items.num[i] === 'off') {
                        let newItem = {
                            quantity: items.quantity[i],
                            measurement: items.measurement[i],
                            name: items.name[i]
                        };
                        user.groceryList.push(newItem)
                        user.save();
                    }
                    
                    else if(Array.isArray(items.id) === false && items.num === 'off') {
                        let newItem = {
                            quantity: items.quantity,
                            measurement: items.measurement,
                            name: items.name
                        };
                        user.groceryList.push(newItem)
                        user.save();
                    }
            }
        });
    }
    req.flash('success', 'Updated to your grocery list!');
    res.redirect('back');
});


// add new ingredients to grocery list
router.post('/grocery-list', middleware.isLoggedIn, function(req, res) {
    let ingredients = req.body.ingredient;
    
    console.log(ingredients);

    let count;
    if(Array.isArray(ingredients.measurement)) { count = ingredients.measurement.length }
    else { count = 1 }
    
    for (let i = 0; i < count; i++) {
        
        // guard against single ingredient added
        let name;
        let quantity;
        let measurement;
        if(count > 1) { 
            name = ingredients.name[i];
            quantity = ingredients.quantity[i];
            measurement = ingredients.measurement[i];
            
        } else {
            name = ingredients.name;
            quantity = ingredients.quantity;
            measurement = ingredients.measurement;
        }

        // determine if ingredient name exists in grocery list
        // if ingredient name does not exist, continue as normal
        User.count({ "_id": req.user._id, "$or": [{"groceryList.name": name}, {"groceryList.name": name+'s'}, {"groceryList.name": name.slice(0,-1)} ] }, function(err, count) {
            if (err) {
                req.flash('error', err.message);
                res.redirect('back');
            }
            if (count === 0) {
                // ingredient does not exist, add ingredient
                User.findById({ "_id": req.user._id }, function(err, user) {
                    if (err) {
                        req.flash('error', err.message);
                        res.redirect('back');
                    }
                    user.groceryList.push(ing.createIng(ingredients, i));
                    user.save();
                });
            }

            else if (count === 1) {
                // ingredient exists, do something
                
                User.findOne({ "_id": req.user._id, "$or": [{"groceryList.name": name}, {"groceryList.name": name+'s'}, {"groceryList.name": name.slice(0,-1)} ] }, function(err, user) {
                    if (err) {
                        req.flash('error', err.message);
                        res.redirect('back');
                    }
                    
                    for(let x=user.groceryList.length-1; x>=0; x--) {
                        if(user.groceryList[x].name === name || user.groceryList[x].name === name+'s' || user.groceryList[x].name === name.slice(0,-1)) {
                            // check to see if measurements can be added
                            if(ing.canBeAdded(user.groceryList[x].measurement, ingredients.measurement[i]) === true) {
                                user.groceryList[x].quantity = (ing.add(user.groceryList[x].quantity, user.groceryList[x].measurement, Number(quantity), measurement)).quantity;
                                user.groceryList[x].measurement = (ing.add(user.groceryList[x].quantity, user.groceryList[x].measurement, Number(quantity), measurement)).measurement;
                                user.save();
                            } else {
                                // if measurements cannot be added
                                user.groceryList.push(ing.createIng(ingredients, i));
                                user.save();
                            }
                            
                        }
                    }

                });
            }
        });
    }

    req.flash('success', 'Added ingredients to your grocery list!');
    res.redirect('back');
})



module.exports = router;