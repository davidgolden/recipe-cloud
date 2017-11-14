var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You need to be logged in to do that!'); // place flash before redirect
  res.redirect('/login');
}

middlewareObj.alreadyAdded = function(recipe, currentUser) {
  for(var i=0; i<currentUser.recipes.length; i++) {
    console.log(currentUser.recipes[i]);
    console.log(recipe._id);
    if(currentUser.recipes[i] == recipe._id) {
      console.log('true');
      return true;
    } else {
      console.log('false');
      return false;
    }
  }
}



module.exports = middlewareObj;