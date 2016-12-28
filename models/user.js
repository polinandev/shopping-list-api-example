var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
ShoppingList = require('../models/shoppinglist');

var Schema = mongoose.Schema;

var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

var UserSchema = new Schema({
    email: {
        type: String,
        validate: [validateEmail, 'email is not valid'],
        unique: true,
        require: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

function validateEmail(value) {
    return re.test(value);
}

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
    var user = this;
    // Password hasn't changed
    if (!user.isModified('password')) {
        return callback()
    };

    // Password changed -> hash it
    bcrypt.genSalt(5, function(err, salt) {
        if (err) {
            return callback(err)
        };

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) {
                return callback(err)
            };
            user.password = hash;
            callback();
        });
    });
});

UserSchema.methods.verifyPassword = function (password, callback) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) {
        return callback(err);
    }
    callback(null, isMatch);
  });
};

var User = module.exports = mongoose.model('users', UserSchema);

// Create user
module.exports.createUser = function(user, callback) {
    User.create(user, callback);
};

// Get users
module.exports.getUsers = function(limit, callback) {
    User.find(callback).limit(limit);
};

// Get user
module.exports.getUser = function(username, callback) {
    var query = {
        username: username
    };
    User.findOne(query, callback);
};