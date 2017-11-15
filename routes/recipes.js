var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Recipe = require('../models/recipe');
var middleware = require('../middleware');
var mongoose = require('mongoose');

// SHOW ALL RECIPES
router.get('/recipes', middleware.isLoggedIn, function(req, res) {
    var myRecipes = req.user.recipes;
    Recipe.find({'_id': {$nin: myRecipes}}, function(err, recipes) {
        if(err) {
            console.log(err);
        } else {
            res.render('recipes', {recipes: recipes});
        }
    });
});

// SUBMIT RECIPE FORM
router.get('/users/:user_id/recipes/new', middleware.isLoggedIn, function(req, res) {
    res.render('recipes/new');
});

// CREATE RECIPE ROUTE
router.post('/users/:user_id/recipes', middleware.isLoggedIn, function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
        if(err) {
            console.log('cannot find by ID');
            res.redirect('back');
        } else {
            Recipe.create(req.body.recipe, function(err, newRecipe) {
                if(err) {
                    console.log('cannot create recipe');
                    res.redirect('back');
                } else {
                    // add author info to recipe
                    newRecipe.author.id = req.user._id;
                    newRecipe.author.username = req.user.username;
                    // save recipe
                    newRecipe.save();
                    // add recipe to user
                    user.recipes.push(newRecipe);
                    user.save();
                    
                    res.redirect(`/users/${req.params.user_id}`);
                }
            })
        }
    })
})

// add recipe AJAX request
router.post('/add-recipe', middleware.isLoggedIn, function(req, res) {
    var recipe = req.body.recipe;
    var currentUser = req.body.currentUser;
    User.findById(currentUser._id, function(err, user) {
        if(err) {
            console.log('cannot find currentUser');
            res.redirect('back');
        } else {
            if(middleware.alreadyAdded(recipe, currentUser)) {
                req.flash('error', 'You already have that recipe!');
                res.redirect('back');
                
            } else {
                user.recipes.push(recipe);
                user.save();
            }
            
        }
    })
})

// Show Recipe
router.get('/users/:user_id/recipes/:recipe_id', middleware.isLoggedIn, function(req, res) {
    Recipe.findById(req.params.recipe_id, function(err, recipe) {
        if(err) {
            console.log('could not find recipe');
            res.redirect('back');
        } else {
            res.render('recipes/show', {recipe: recipe});
        }
    })
})

// Edit Recipe Form
router.get('/users/:user_id/recipes/:recipe_id/edit', middleware.isLoggedIn, function(req, res) {
    Recipe.findById(req.params.recipe_id, function(err, recipe) {
        if(err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render('recipes/edit', {recipe: recipe, user_id: req.params.user_id});
        }
    })
})

// Edit Recipe Route
router.put('/users/:user_id/recipes/:recipe_id', middleware.isLoggedIn, function(req, res) {
    Recipe.findByIdAndUpdate(req.params.recipe_id, req.body.recipe, function(err) {
        if(err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect(`/users/${req.params.user_id}/recipes`);
        }
    })
})

// Delete Recipe Route
router.delete('/users/:user_id/recipes/:recipe_id', function(req, res) {
    Recipe.findByIdAndRemove(req.params.recipe_id, function(err) {
        if(err) {
            req.flash('error', err.message);
            console.log(err);
        } else {
            req.flash('success', 'Recipe Deleted');
            res.redirect(`/users/${req.params.user_id}`);
        }
    })
})

// AJAX Delete Recipe ROUTE
router.delete('/delete-recipe', function(req, res) {
    var recipe = req.body.recipe;
    Recipe.findByIdAndRemove(recipe._id, function(err) {
        if(err) {
            req.flash('error', err.message);
            console.log(err);
        } else {
            console.log('recipe deleted');
        }
    })
})

// AJAX Remove (not delete) Recipe Route
router.put('/remove-recipe', function(req, res) {
    var recipe = req.body.recipe;
    var user = req.body.currentUser;
        User.findById(user._id, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                for(var i=0; i<user.recipes.length; i++) {
                    if(user.recipes[i] == recipe._id) {
                        user.recipes.splice(i, 1);
                        user.save();
                    }
                }
            
        }
    })
    
})



// /users/:user_id/recipes/:recipe_id (delete)
// Delete Recipe Route

module.exports = router;