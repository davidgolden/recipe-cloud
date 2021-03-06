// $('#myModal').on('shown.bs.modal', function () {
//   $('#myInput').trigger('focus')
// })

var checkForm = function(form) {
  if(form.password.value != form.confirm.value) {
    alert('Passwords do not match!');
    return false;
  }
  return true;
};

var signupform = document.getElementById('signupform');

signupform.addEventListener('submit', function(event) {
  event.preventDefault();
  
  if(checkForm(signupform)) {
    signupform.submit();
  }
});

var sortByTag = function(tag) {
  let allRecipes = Array.from(document.getElementsByName('tags'));
  let unmatchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === false);
  let matchedRecipes = allRecipes.filter(recipe => recipe.value.includes(tag) === true);
  
  if(tag === 'all') {
    allRecipes.forEach(recipe => {
    recipe.parentElement.style.display = 'inline-block';
    
    setTimeout(function() {
      recipe.parentElement.style.opacity = '1';
    }, 500);
  });
  
  } else {
    unmatchedRecipes.forEach(recipe => {
      recipe.parentElement.style.opacity = '0';
      setTimeout(function() {
        recipe.parentElement.style.display = 'none';
      }, 500);
    });
    
    matchedRecipes.forEach(recipe => {
      recipe.parentElement.style.display = 'inline-block';
      
      setTimeout(function() {
        recipe.parentElement.style.opacity = '1';
      }, 500);
    });
  }
};

function addRecipe(recipe, event, remove){
  let xml = new XMLHttpRequest();
  xml.open("POST", "/recipes/add", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xml.send(JSON.stringify({recipe: recipe}));
  event.classList.add('disabled');
}

function removeRecipe(recipe, e) {
  var xml = new XMLHttpRequest();
  xml.open("PUT", "/recipes/remove", true);
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
};

var deleteIngredient= function(ing) {
  if(ing.parentElement.parentElement.childElementCount > 3) {
    ing.parentElement.parentElement.removeChild(ing.parentElement);
  }
};

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
function doneTyping() {
  let recipeImage = document.getElementById('recipeImage'); // <img>
  let imageLoader = document.getElementById('imageLoad'); // spinning icon
  let recipeURL = document.getElementsByName('recipe[url]')[0]; // link to recipe (to send in req)
  let imageURLInput = document.getElementsByName('recipe[image]')[0]; // input field to fill value
  imageLoader.style.display = 'block'; // when done typing, start spinner
  // recipeImage.setAttribute('src', '<i class="fa fa-spinner" aria-hidden="true"></i>');
  
  let xml = new XMLHttpRequest();
  xml.open("POST", "/scrape", true);
  xml.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  xml.send(JSON.stringify({imageUrl: recipeURL.value}));
  
  xml.onreadystatechange = function() {
    if (xml.readyState === 4) {
      let metadata = xml.response;

      if(xml.status === 200 && metadata !== '') { // on success

        imageLoader.style.display = 'none'; // turn off spinner
        recipeImage.setAttribute('src', metadata); // set image source
        recipeImage.style.display = 'block'; // turn image on
        imageURLInput.setAttribute('value', metadata); // set value of input
        imageURLInput.style.display = 'none';
        document.getElementById('imageText').style.display = 'none'; // turn off input field
      } else { // no image found
        document.getElementById('imageText').style.display = 'block'; // turn on input field
        imageURLInput.setAttribute('value', ''); // set value of input
        imageURLInput.setAttribute('type', 'text'); // turn on input field
        imageURLInput.style.display = 'block'; // turn on input field
        recipeImage.style.display = 'none'; // turn off image
        imageLoader.style.display = 'none'; // turn off spinner
      }
    }
  };
}

var form = document.getElementById('ingredients-form');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  
  var validateForm = function() {
    let ingArray = [];
    let ing_form = document.getElementsByClassName('add-ingredient-form');
    for(var i=0; i< ing_form.length; i++) {
      let ing_form_input = document.querySelectorAll('.add-ingredient-form:nth-of-type('+(i+1)+') > .ing-option');
      
      ing_form_input.forEach(function(ing_input) {
        let name = ing_input.name.slice(0,19) + i + ing_input.name.slice(19);
        ing_input.setAttribute('name', name);
      });
      
      let newIng = {
          quantity: ing_form_input[0].value,
          measurement: ing_form_input[1].value,
          name: ing_form_input[2].value
      };
      
      ingArray.push(newIng);
    }
    return JSON.stringify(ingArray);
  };
  
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'ingredientArray');
  hiddenInput.setAttribute('value', validateForm());
  form.appendChild(hiddenInput);
  
  form.submit();
});

var addToGroceryList = function(form) {
  form.addEventListener('submit', function(event) {
    event.preventDefault();
  });
};


