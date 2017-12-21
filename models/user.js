var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var passportLocalMongoose = require('passport-local-mongoose');

var groceryListSchema = mongoose.Schema({
    quantity: { type: Number, required: true },
    measurement: { type: String, required: true },
    name: { type: String, required: true }
});

var userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true },
  email: {type: String, required: true, unique: true, lowercase: true},
  password: String,
  resetToken: String,
  tokenExpires: Date,
  recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      }
    ],
  menu: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
      }
    ],
  groceryList: {
    type: [ groceryListSchema ]
  }
});

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);