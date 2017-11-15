var middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You need to be logged in to do that!'); // place flash before redirect
  res.redirect('/');
}

middlewareObj.alreadyAdded = (recipe, currentUser) => {
  for(let i = 0; i<currentUser.recipes.length; i++) {
    if(currentUser.recipes[i] == recipe._id) {
      console.log('true');
      return true;
    }
  }
  return false;
}



module.exports = middlewareObj;