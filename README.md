<h1>Welcome to Recipe Cloud</h1>


Recipe Cloud is a web application for adding, sharing, and managing recipes and recipe ingredients. Users may upload their own recipes, 
or add others' recipes to their "Recipe Cloud". The primary data type stored in reach recipe is the recipe's ingredients. These ingredients
can be used to autopopulate a user's grocery list. When populating a grocery list, Recipe Cloud checks to see if the ingredients already exist, and 
if they do, Recipe Cloud totals the ingredients, and makes measurement conversions if necessary.

Recipe Cloud is built in NodeJS and Express, and uses a MongoDB database.

Some key features:
<ul>
  <li>Edit or delete just about anything! Edit or remove ingredients from a recipe before adding them to your grocery list, edit or delete ingredients in your grocery list, and of course edit or delete anything you want in recipes you have submitted.</li>
  <li>Store mode for grocery lists creates new page without all the added weight of editing or adding ingredients. This mode is intended for use in-store with any mobile device.</li>
  <li>Scrapes URL metadata for recipe image when submitting new recipe with URL.</li>
  <li>Autopopulate grocery list with auto-conversions and auto-totaling.</li>
  <li>Global tag array allows for adding tags to recipes, then filtering all recipes by tag.</li>
  <li>Password reset option generates token and token expiration, emails user with link to reset.</li>
</ul>

Plans for future development:
<ul>
  <li>Improve UI by making the application 'lighter'.</li>
  <li>Refactor existing features using ReactJS.</li>
  <li>Add a 'follower' feature to allow users to follow others, and preferentially list recipes in Browse Recipe page based on follows.</li>
  <li>Improve user experience for adding ingredients to recipes.</li>
</ul>