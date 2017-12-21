var User = require('../models/user');
var Recipe = require('../models/recipe');

var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You need to be logged in to do that!'); // place flash before redirect
  res.redirect('/');
}

middlewareObj.checkRecipeOwnership = (req, res, next) => {
  // is user logged in?
  if(req.isAuthenticated()) {
    Recipe.findById(req.params.recipe_id, function(err, recipe) {
      if(err || !recipe) {
        req.flash('error', 'Campground not found.');
        res.redirect('back');
      } else {
        // does user own the campground?
        // use equals because one is mongoose object and one is string
        if(recipe.author.id.equals(req.user._id)) {
          // if so, redirect
          next();
        } else {
          // if not, redirect
          req.flash('error', "You don't have permission to do that!")
          res.redirect('back');
        }
      }
    })
  } else {
    req.flash('error', 'You need to be logged in to do that!'); // place flash before redirect
    res.redirect('back');
  }
}



module.exports = middlewareObj;