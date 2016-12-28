var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;

Item = require('../models/item');

var UserInListSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true
    }, 
    isOwner: {
        type: Boolean,
        default: false
    }
});

var ShoppingListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    users: [UserInListSchema]
});

ShoppingListSchema.methods.isOwnerUser = function(userId, callback) {
    var isOwner = _.some(this.users, function(user) { 
        return user.user_id.equals(userId) && user.isOwner;
    });

    return callback(null, isOwner);
};

ShoppingListSchema.methods.isUserInList = function(userId, callback) {
    var isInList = _.some(this.users, function(user) { 
        return user.user_id.equals(userId); 
    });

    return callback(null, isInList);
};

ShoppingListSchema.methods.getUserInList = function(userId, callback) {
    var userInList = _.find(this.users, function(user) {
        if (user.user_id.equals(userId)) {
            return user;
        }
    });

    return callback(null, userInList);
};

var UserInList = mongoose.model('UserInList', UserInListSchema);

var ShoppingList = module.exports = mongoose.model("shoppinglists", ShoppingListSchema);

// Create shopping list
module.exports.createShoppingList = function(userId, shoppingList, callback) {
    shoppingList.users = [{ user_id: userId, isOwner: true, isApproved: true }];
    ShoppingList.create(shoppingList, callback);
}

// Get all shopping lists
module.exports.getShoppingLists = function(userId, limit, callback) {
    var query = {
        'users.user_id': userId
    };
    ShoppingList.find(query, callback).limit(limit);
}

// Get shopping list by id
module.exports.getShoppingListById = function(id, userId, callback) {
    var query = {
        _id: id,
        'users.user_id': userId
    };
    ShoppingList.findOne(query, callback);
}

// Update shopping list
module.exports.updateShoppingList = function(listId, userId, shoppingList, callback) {
    var query = {
        _id: id,
        'users.user_id': userId
    };
    var update = {
        name: shoppingList.name
    };
    var options = {
        new: true,
        runValidators: true
    };
    ShoppingList.findOneAndUpdate(query, update, options, callback);
}

// Remove shopping list by id
module.exports.removeShoppingListById = function(id, userId, callback) {
    var query = {
        _id: id
    };
    var options = { 
        users: { $elemMatch: { user_id: userId, isOwner: true } } 
    };

    ShoppingList.findOneAndRemove(query, options, function(err, shoppingList) {
        if (err) { 
            return callback(err); 
        }

        // Remove all items in this shopping list
        Item.find({ shoppingList_id: id }).remove(callback);
    });
}

// Remove all empty shopping list
module.exports.removeAllEmptyShoppingLists = function(callback) {
    var query = [{
        name: null
    }, {
        name: ""
    }];
    ShoppingList.find().or(query).remove(callback);
}

// Add user to a shopping list
module.exports.addUserInList = function(loggedUserId, listId, newUserId, callback) {
    ShoppingList.findOne({ _id: listId }, function(err, shoppingList) {
        if (err) {
            return callback(err);
        }

        if (!shoppingList) {
            return callback(null, null);
        }

        shoppingList.isOwnerUser(loggedUserId, function(err, isOwner) {
            if (err) {
                return callback(err);
            }

            if (!isOwner) {
                return callback({
                    message: 'Error: This user doesn\'t have the needed rights for this shopping list',
                    data: shoppingList
                });
            }

            shoppingList.isUserInList(newUserId, function(err, isInList) {
                if (isInList) {
                    return callback({
                        message: 'Error: This user is already in the list',
                        data: shoppingList
                    });
                }

                shoppingList.users.push({
                    user_id: newUserId
                });
                shoppingList.save(callback);
            });
        });
    });
}

// Remove user from a shopping list
module.exports.removeUserInList = function(loggedUserId, listId, removeUserId, callback) {
    ShoppingList.findOne({ _id: listId }, function(err, shoppingList) {
        if (err) {
            return callback(err);
        }

        if (!shoppingList) {
            return callback(null, null);
        }

        shoppingList.isOwnerUser(loggedUserId, function(err, isOwner) {
            if (err) {
                return callback(err);
            }

            if (!isOwner && !loggedUserId.equals(removeUserId)) {
                return callback({
                    message: 'Error: The logged user doesn\'t have the needed rights for this shopping list',
                    data: shoppingList
                });
            }

            if (isOwner && loggedUserId.equals(removeUserId)) {
                return callback({
                    message: 'Error: The owner user can\'t be deleted from the shopping list',
                    data: shoppingList
                });
            }

            shoppingList.getUserInList(removeUserId, function(err, user) {
                if (err) {
                    return callback(err);
                }

                if (!user) {
                    return callback({
                        message: 'Error: The user doesn\'t exist in this shopping list',
                        data: shoppingList
                    });
                }

                shoppingList.users.pull({_id: user._id});
                shoppingList.save(callback);
            });
        });
    });
}