// $('#myModal').on('shown.bs.modal', function () {
//   $('#myInput').trigger('focus')
// })

var checkForm = function(form) {
  if(form.password.value != form.confirm.value) {
    alert('Passwords do not match!');
    return false;
  }
  return true;
}

var signupform = document.getElementById('signupform');

signupform.addEventListener('submit', function(event) {
  event.preventDefault();
  
  if(checkForm(signupform)) {
    signupform.submit();
  }
})

var sortByTag = function(tag) {
  let allRecipes = Array.from(document.getElementsByName('tags'));
  let unmatchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === false);
  let matchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === true);
  console.log(unmatchedRecipes)
  if(tag === 'all') {
    allRecipes.forEach(recipe => {
    recipe.parentElement.style.display = 'inline-block';
    
    setTimeout(function() {
      recipe.parentElement.style.opacity = '1';
    }, 500);
  })
  } else {
    unmatchedRecipes.forEach(recipe => {
      recipe.parentElement.style.opacity = '0';
      setTimeout(function() {
        recipe.parentElement.style.display = 'none';
      }, 500);
    })
    matchedRecipes.forEach(recipe => {
      recipe.parentElement.style.display = 'inline-block';
      
      setTimeout(function() {
        recipe.parentElement.style.opacity = '1';
      }, 500);
    })
  }
  //display none for unmatched recipes
  //dispaly block for matched recipes
}

function addRecipe(recipe, event, remove){
  let xml = new XMLHttpRequest();
  xml.open("POST", "/add-recipe", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xml.send(JSON.stringify({recipe: recipe}));
  event.classList.add('disabled');
}

function removeRecipe(recipe, e) {
  var xml = new XMLHttpRequest();
  xml.open("PUT", "/remove-recipe", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  
  e.parentNode.parentNode.style.opacity = 0;
  setTimeout(function() {
    e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
  }, 500);
  
  xml.send(JSON.stringify({recipe: recipe}));
}

var addIngredient = function(button) {
  let newForm = button.nextElementSibling.cloneNode(true);
  // newForm.setAttribute('name', 'Text Input');
  button.parentElement.appendChild(newForm);
}

var deleteIngredient= function(ing) {
  if(ing.parentElement.parentElement.childElementCount > 3) {
    ing.parentElement.parentElement.removeChild(ing.parentElement);
  }
}

//setup before functions
var typingTimer;                //timer identifier
var doneTypingInterval = 2000;  //time in ms, 5 second for example
var recipeURL = document.getElementById('recipeURL');

//on keyup, start the countdown
recipeURL.addEventListener('keyup', function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(doneTyping, doneTypingInterval);
});

//on keydown, clear the countdown 
recipeURL.addEventListener('keydown', function () {
  clearTimeout(typingTimer);
});

//user is "finished typing," do something
function doneTyping () {
  
  let recipeImage = document.getElementById('recipeImage');
  let imageLoader = document.getElementById('imageLoad');
  let imageURL = document.getElementsByName('recipe[image]')[0];
  imageLoader.style.display = 'block';
  recipeImage.setAttribute('src', '<i class="fa fa-spinner" aria-hidden="true"></i>');
  let xml = new XMLHttpRequest();
  xml.open("POST", "/scrape", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xml.send(JSON.stringify({imageUrl: imageURL.value}));
  xml.onreadystatechange = function() {
    if (xml.readyState === 4) {
      let metadata = xml.response;
      
      recipeImage.setAttribute('src', metadata);
      imageURL.setAttribute('value', metadata);
      console.log(metadata)
      if(metadata === '') {
        document.getElementById('imageText').style.display = 'block';
        imageURL.setAttribute('type', 'text');
        imageURL.style.display = 'block';
        imageLoader.style.display = 'none';
      }
    }
  }
}

// document.getElementById('recipeURL').addEventListener('input', function(event) {
//   let recipeImage = document.getElementById('recipeImage');
//   let imageLoader = document.getElementById('imageLoad');
//   let imageURL = document.getElementsByName('recipe[image]')[0];
//   imageLoader.style.display = 'block';
//   recipeImage.setAttribute('src', '<i class="fa fa-spinner" aria-hidden="true"></i>');
//   let xml = new XMLHttpRequest();
//   xml.open("POST", "/scrape", true);
//   xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
//   xml.send(JSON.stringify({imageUrl: event.target.value}));
//   xml.onreadystatechange = function() {
//     if (xml.readyState === 4) {
//       let metadata = xml.response;
//       imageLoader.style.display = 'none';
//       recipeImage.setAttribute('src', metadata);
//       imageURL.setAttribute('value', metadata);
//       console.log(metadata)
//       if(metadata === '') {
//         imageURL.setAttribute('type', 'text');
//       }
//     }
//   }
// })

var form = document.getElementById('ingredients-form');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  
  var validateForm = function() {
    var ingArray = [];
    let ing_form = document.getElementsByClassName('add-ingredient-form');
    for(var i=0; i< ing_form.length; i++) {
      let ing_form_input = document.querySelectorAll('.add-ingredient-form:nth-of-type('+(i+1)+') > .ing-option');
      
      ing_form_input.forEach(function(ing_input) {
        let name = ing_input.name.slice(0,19) + i + ing_input.name.slice(19);
        ing_input.setAttribute('name', name)
      })
      
      let newIng = {
          quantity: ing_form_input[0].value,
          measurement: ing_form_input[1].value,
          name: ing_form_input[2].value
      }
      
      ingArray.push(newIng);
    }
    return JSON.stringify(ingArray);
  }
  
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'ingredientArray');
  hiddenInput.setAttribute('value', validateForm());
  form.appendChild(hiddenInput);
  
  form.submit();
})

var addToGroceryList = function(form) {
  console.log('here');
  form.addEventListener('submit', function(event) {
    event.preventDefault();
  });
};


