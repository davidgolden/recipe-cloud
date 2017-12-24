var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Recipe = require('../models/recipe');
var middleware = require('../middleware');
var ing = require('../public/js/conversions');
const urlMetadata = require('url-metadata');

// SHOW ALL RECIPES
router.get('/recipes', middleware.isLoggedIn, function(req, res) {
    var myRecipes = req.user.recipes;
    // find all recipes not in user's recipe cloud
    Recipe.find({ '_id': { $nin: myRecipes } }, function(err, recipes) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        else {
            // render page with array of all returned recipe objects
            res.render('recipes', { recipes: recipes });
        }
    });
});

// SUBMIT RECIPE FORM
router.get('/recipes/new', middleware.isLoggedIn, function(req, res) {
    res.render('recipes/new');
});

//IMAGE SCRAPER
router.post('/scrape', function(req, res) {
    urlMetadata(req.body.imageUrl).then(
        function (metadata) { // success handler
            console.log('found metadata?')
            return res.send(metadata["og:image"]);
          },
          function (error) { // failure handler
            console.log('an error!!!')
          })
})


// CREATE RECIPE ROUTE
router.post('/recipes', middleware.isLoggedIn, function(req, res) {

    User.findById(req.user._id, function(err, user) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
        else {
            Recipe.create(req.body.recipe, function(err, newRecipe) {
                if (err) {
                    console.log(err);
                    res.redirect('back');
                }
                else {
                    // add author info to recipe

                    newRecipe.ingredients = JSON.parse(req.body.ingredientArray);
                    newRecipe.author.id = req.user._id;
                    newRecipe.author.username = req.user.username;

                    // save recipe
                    newRecipe.save();
                    // add recipe to user
                    user.recipes.push(newRecipe);
                    user.save();

                    res.redirect(`/users/${req.user._id}`);
                }
            });
        }
    });
});

// ADD RECIPE TO OWN CLOUD
router.post('/add-recipe', middleware.isLoggedIn, function(req, res) {
    let recipe = req.body.recipe;
    User.findById(req.user._id, function(err, user) {
        if (err) {
            req.flash('error', err.message)
            return res.redirect('back');
        }
        let has = false;
        for (let i = 0; i < user.recipes.length; i++) {
            if (recipe.toString() === user.recipes[i].toString()) {
                has = true;
            }
        }
        if (has === false) {
            user.recipes.push(recipe);
            user.save();
            
            req.flash('success', 'Added Recipe to Cloud!');
            res.redirect('back');
        }
    });
});

// Show Recipe
router.get('/recipes/:recipe_id', middleware.isLoggedIn, function(req, res) {
    Recipe.findById(req.params.recipe_id, function(err, recipe) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
        else {
            User.findById(req.user._id, function(err, user) {
                // check if user has recipe in recipe cloud
                let has = false;
                for (let i = 0; i < user.recipes.length; i++) {
                    if (user.recipes[i].toString() === recipe._id.toString()) {
                        has = true;
                    }
                }
                res.render('recipes/show', { recipe: recipe, has: has });
            })

        }
    });
});

// Edit Recipe Form
router.get('/recipes/:recipe_id/edit', middleware.isLoggedIn, function(req, res) {
    Recipe.findById(req.params.recipe_id, function(err, recipe) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
        else {
            res.render('recipes/edit', { recipe: recipe });
        }
    });
});

// Edit Recipe Route
router.put('/recipes/:recipe_id', middleware.checkRecipeOwnership, function(req, res) {

    // here need to find recipe by id, delete all ingredients, and push new ingredients
    let updatedRecipe = req.body.recipe;
    let ingredients = req.body.ingredient;
    let count;
    if (Array.isArray(ingredients.measurement)) { count = ingredients.measurement.length; }
    else { count = 1 }

    // find current user
    Recipe.findOne({ "_id": req.params.recipe_id }, function(err, recipe) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        // delete all list items
        recipe.name = updatedRecipe.name;
        recipe.url = updatedRecipe.url;
        recipe.notes = updatedRecipe.notes;
        recipe.image = updatedRecipe.image;
        recipe.tags = updatedRecipe.tags;
        recipe.ingredients.splice(0, recipe.ingredients.length);
        recipe.save();
        // loop of number of ingredients
        for (let i = 0; i < count; i++) {
            // if checkbox is on, delete grocery list ingredient with id at index i
            recipe.ingredients.push(ing.createIng(ingredients, i));
            recipe.save();
        }

        req.flash('success', 'Updated recipe!');
        res.redirect(`/recipes/${recipe._id}`);
    });


});

// Delete Recipe Route
router.delete('/recipes/:recipe_id', middleware.checkRecipeOwnership, function(req, res) {
    Recipe.findByIdAndRemove(req.params.recipe_id, function(err) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
        else {
            req.flash('success', 'Recipe Deleted');
            res.redirect(`/users/${req.user._id}`);
        }
    });
});

// AJAX Remove (not delete) Recipe Route
router.put('/remove-recipe', function(req, res) {
    var recipe = req.body.recipe;
    User.findById(req.user._id, function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            for (var i = 0; i < user.recipes.length; i++) {
                if (user.recipes[i].toString() === recipe.toString()) {
                    user.recipes.splice(i, 1);
                    user.save();
                }
            }

        }
    });
});

// add recipe ingredients to grocery list
router.post('/recipes/:recipe/add', function(req, res) {
    let ingredients = req.body.ingredient;

    User.findById(req.user._id, function(err, user) {
        // add recipe to menu
        Recipe.findById({ "_id": req.params.recipe }, function(err, recipe) {
            if (err) {
                console.log(err);
            }
            else {
                user.menu.push(recipe);
                user.save();
            }
        })
    })

    // delete extraneous 'on's
    for (let i = 0; i < ingredients.num.length; i++) {
        if (ingredients.num[i] === 'on') {
            ingredients.num.splice(i - 1, 1);
        }
    }

    // use count to set for-loop length
    let count;
    if (Array.isArray(ingredients.num)) {
        count = ingredients.num.length;
    }
    else {
        count = 1;
    }

    for (let i = 0; i < count; i++) {
        // skip iteration if ingredient is unchecked
        if (ingredients.num[i] === 'off') {
            continue;
        }

        // guard against single ingredients
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
        User.count({ "_id": req.user._id, "$or": [{ "groceryList.name": name }, { "groceryList.name": name + 's' }, { "groceryList.name": name.slice(0, -1) }] }, function(err, count) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            if (count === 0) {
                // ingredient isn't in grocery list, so add ingredient
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
                // ingredient is already in grocery list
                User.findById({ "_id": req.user._id }, function(err, user) {
                    // User.findOne({ "_id": req.user._id, "$or": [{"groceryList.name": name}, {"groceryList.name": name+'s'}, {"groceryList.name": name.slice(0,-1)} ] }, function(err, user) {
                    if (err) {
                        req.flash('error', err.message);
                        return res.redirect('back');
                    }

                    // loop through user's grocery list in reverse
                    for (let x = user.groceryList.length - 1; x >= 0; x--) {
                        if (user.groceryList[x].name === name || user.groceryList[x].name === name + 's' || user.groceryList[x].name === name.slice(0, -1)) {
                            // check to see if measurements can be added
                            if (ing.canBeAdded(user.groceryList[x].measurement, measurement) === true) {
                                // add ingredients and update list
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

    req.flash('success', 'Added recipe to your grocery list!');
    res.redirect('back');
});



module.exports = router;
