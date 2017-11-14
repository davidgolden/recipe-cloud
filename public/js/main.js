

$(function () {
  $('[data-toggle="popover"]').popover({trigger: 'hover'})
})

function addRecipe(recipe, currentUser){
  var xml = new XMLHttpRequest();
  xml.open("POST", "/add-recipe", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xml.send(JSON.stringify({recipe: recipe, currentUser: currentUser}));
}

function deleteRecipe(recipe, e) {
  var xml = new XMLHttpRequest();
  xml.open("DELETE", "/delete-recipe", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  
  e.parentNode.style.opacity = 0;
  setTimeout(function() {
    e.parentNode.parentNode.removeChild(e.parentNode);
  }, 500);
  xml.send(JSON.stringify({recipe: recipe}));
}

function removeRecipe(recipe, currentUser, e) {
  var xml = new XMLHttpRequest();
  xml.open("PUT", "/remove-recipe", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  
  e.parentNode.style.opacity = 0;
  setTimeout(function() {
    e.parentNode.parentNode.removeChild(e.parentNode);
  }, 500);
  xml.send(JSON.stringify({recipe: recipe, currentUser: currentUser}));
}



// function addRecipe(recipe) {
//     var myHeaders = new Headers();
//     myHeaders.append('Content-Type', 'application/json; charset=utf-8');
    
//     var myInit = {
//         method: 'PUT',
//         headers: myHeaders,
//         recipe: JSON.stringify({recipe: recipe})
//     };
    
//     fetch('/add-recipe', myInit).then(function(response) {
//         console.log(recipe);
//     });
// }