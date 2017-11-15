

$(function () {
  $('[data-toggle="popover"]').popover({trigger: 'hover'})
})

$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})

function addRecipe(recipe, currentUser, e, remove){
  let xml = new XMLHttpRequest();
  xml.open("POST", "/add-recipe", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xml.send(JSON.stringify({recipe: recipe, currentUser: currentUser}));
  e.classList.add('disabled');
  e.innerHTML = '<i class="fa fa-book" aria-hidden="true" ></i>';
}

function deleteRecipe(recipe, e) {
  let xml = new XMLHttpRequest();
  xml.open("DELETE", "/delete-recipe", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  
  e.parentNode.style.opacity = 0;
  setTimeout(function() {
    e.parentNode.parentNode.parentNode.removeChild(e.parentNode);
  }, 500);
  e.parentNode.style.display = 'none';
  xml.send(JSON.stringify({recipe: recipe}));
}

function removeRecipe(recipe, currentUser, e) {
  var xml = new XMLHttpRequest();
  xml.open("PUT", "/remove-recipe", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  
  e.parentNode.parentNode.style.opacity = 0;
  setTimeout(function() {
    e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
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