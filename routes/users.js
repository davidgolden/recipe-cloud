const express = require('express'),
    router = express.Router(),
    User = require('../models/user'),
    Recipe = require('../models/recipe'),
    middleware = require('../middleware'),
    ing = require('../public/js/conversions');

// SHOW USER'S RECIPES
router.get('/users/:user_id', middleware.isLoggedIn, function(req, res) {

    User.findById(req.params.user_id).populate('recipes').exec(function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('users/show', { user: user });
        }
    });
});

// DISPLAY GROCERY LIST
router.get('/grocery-list', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate('menu').exec(function(err, user) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        res.render('grocery-list', { groceryList: user.groceryList, menu: user.menu });
    });
});

// UPDATE GROCERY LIST
router.put('/grocery-list', middleware.isLoggedIn, function(req, res) {
    let items = req.body.item;
    let menu = req.body.menu;

    if (menu !== undefined) {
        if (Array.isArray(menu)) {
            User.findById(req.user._id, function(err, user) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                menu.forEach(function(recipe) {
                    user.menu.pull(recipe);
                    user.save();
                });
            });
        }
        else if (Array.isArray(menu) === false) {
            User.findById(req.user._id, function(err, user) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                user.menu.pull(menu.toString());
                user.save();
            });
        }
    }



    if (items !== undefined) {
        let count;
        if (Array.isArray(items.num)) {
            count = items.num.length;
        }
        else {
            count = 1;
        }
        // remove extraneous 'off' variables in num (if checkbox is on)
        for (let i = 0; i < items.num.length; i++) {
            if (items.num[i] === 'on') {
                items.num.splice(i - 1, 1);
            }
        }
        // find current user
        User.findOne({ "_id": req.user._id }, function(err, user) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            // delete all list items
            user.groceryList.splice(0, user.groceryList.length);
            user.save();
            // loop of number of ingredients
            for (let i = 0; i < count; i++) {
                // if checkbox is on, delete grocery list ingredient with id at index i
                if (Array.isArray(items.id) === true && items.num[i] === 'off') {
                    let newItem = {
                        quantity: items.quantity[i],
                        measurement: items.measurement[i],
                        name: items.name[i]
                    };
                    user.groceryList.push(newItem);
                    user.save();
                }

                else if (Array.isArray(items.id) === false && items.num === 'off') {
                    let newItem = {
                        quantity: items.quantity,
                        measurement: items.measurement,
                        name: items.name
                    };
                    user.groceryList.push(newItem);
                    user.save();
                }
            }
        });
    }
    req.flash('success', 'Updated your grocery list!');
    res.redirect('back');
});


// add new ingredients to grocery list
router.post('/grocery-list', middleware.isLoggedIn, function(req, res) {
    let ingredients = req.body.ingredient;

    let count;
    if (Array.isArray(ingredients.measurement)) { count = ingredients.measurement.length }
    else { count = 1 }

    for (let i = 0; i < count; i++) {
        // guard against single ingredient added
        let name;
        let quantity;
        let measurement;
        if (count > 1) {
            name = ingredients.name[i];
            quantity = ingredients.quantity[i];
            measurement = ingredients.measurement[i];
        }
        else {
            name = ingredients.name;
            quantity = ingredients.quantity;
            measurement = ingredients.measurement;
        }
        // determine if ingredient name exists in grocery list
        // if ingredient name does not exist, continue as normal
        User.count({ "_id": req.user._id, "$or": [{ "groceryList.name": name }, { "groceryList.name": name + 's' }, { "groceryList.name": name.slice(0, -1) }, { "groceryList.name": name.slice(0, -2) }, { "groceryList.name": name + 'es' }] }, function(err, count) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            if (count === 0) {
                // ingredient does not exist, add ingredient
                User.findById({ "_id": req.user._id }, function(err, user) {
                    if (err) {
                        req.flash('error', err.message);
                        return res.redirect('back');
                    }
                    user.groceryList.push(ing.createIng(ingredients, i));
                    user.save();
                });
            }

            else if (count === 1) {
                // ingredient exists, do something
                User.findOne({ "_id": req.user._id, "$or": [{ "groceryList.name": name }, { "groceryList.name": name + 's' }, { "groceryList.name": name.slice(0, -1) }, { "groceryList.name": name.slice(0, -2) }, { "groceryList.name": name + 'es' }] }, function(err, user) {
                    if (err) {
                        req.flash('error', err.message);
                        return res.redirect('back');
                    }
                    for (let x = user.groceryList.length - 1; x >= 0; x--) {
                        if (user.groceryList[x].name === name || user.groceryList[x].name === name + 's' || user.groceryList[x].name === name.slice(0, -1)) {
                            // check to see if measurements can be added
                            if (ing.canBeAdded(user.groceryList[x].measurement, ingredients.measurement[i]) === true) {
                                user.groceryList[x].quantity = (ing.add(user.groceryList[x].quantity, user.groceryList[x].measurement, Number(quantity), measurement)).quantity;
                                user.groceryList[x].measurement = (ing.add(user.groceryList[x].quantity, user.groceryList[x].measurement, Number(quantity), measurement)).measurement;
                                user.save();
                            }
                            else {
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
});

// DISPLAY GROCERY LIST STORE VERSION
router.get('/grocery-list-text', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate('menu').exec(function(err, user) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        res.render('grocery-list-text', { groceryList: user.groceryList, menu: user.menu });
    });
});

//EDIT USER FORM
router.get('/users/:user_id/edit', middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, user) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        res.render('users/edit', { user: user });
    });
});

// EDIT USER ROUTE
router.post('/users/:user_id', middleware.isLoggedIn, function(req, res) {

    User.findOne(req.user._id, function(err, user) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        
        // if username is changed, make sure it doesn't already exist
        if(req.body.username !== user.username) {
            User.findOne({ username: req.body.username }, function(err, user) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                
                if(user) {
                    req.flash('error', 'A user already exists with that username or email!');
                    return res.redirect('back');
                }
            });
        }
        
        // if email is changed, make sure it doesn't already exist
        else if(req.body.email !== user.email) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                
                if(user) {
                    req.flash('error', 'A user already exists with that username or email!');
                    return res.redirect('back');
                }
            });
        }
        
        // update user information
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = req.body.password;
        user.save();

        // now update all recipe's authors with username
        Recipe.find({ "author.id": user._id }, function(err, foundRecipes) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            foundRecipes.forEach(recipe => {
                recipe.author.username = req.body.username;
                recipe.save();
            });
        });
        req.flash('success', 'Successfully updated your portfolio!');
        res.redirect('back');
    });
});

module.exports = router;