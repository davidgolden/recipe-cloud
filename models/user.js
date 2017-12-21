var mongoose = require('mongoose');

var passportLocalMongoose = require('passport-local-mongoose');

var groceryListSchema = mongoose.Schema({
    quantity: { type: Number, required: true },
    measurement: { type: String, required: true },
    name: { type: String, required: true }
});

var userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      }
    ],
  groceryList: {
    type: [ groceryListSchema ]
  }
});

// userSchema.pre('save', function (req, res, next) {
//     var user = this;
//     User.find({username : user.username}, function (err, docs) {
//         if (!docs.length){
//             next();
//         }else{                
//             req.flash('error', 'User already exists!')
//             res.redirect('/');
//         }
//     });
// }) ;

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);