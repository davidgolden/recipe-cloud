var mongoose = require('mongoose');

var recipeSchema = new mongoose.Schema({
    name: String,
    url: String,
    notes: String,
    image: String,
    ingredients: [String],
    author: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        username: String
      }
});

module.exports = mongoose.model('Recipe', recipeSchema);