// load models
ShoppingList = require('../models/shoppinglist');

// POST endpoint /api/shoppinglists
module.exports.postShoppingLists = function(req, res) {
    var userId = req.user._id;
    var newShoppingList = req.body;

    ShoppingList.createShoppingList(userId, newShoppingList, function(err, shoppingList) {
        if (err) {
            return res.send(err);
        }

        res.json(shoppingList);
    });
};

// GET endpoint /api/shoppinglists and /api/shoppinglists?limit
module.exports.getShoppingLists = function(req, res) {
    var userId = req.user._id;
    var limit = Number(req.query.limit);
    limit = Number.isInteger(limit) ? limit : null;

    ShoppingList.getShoppingLists(userId, limit, function(err, shoppingLists) {
        if (err) {
            return res.send(err);
        }
        if (!shoppingLists || shoppingLists.length === 0) {
            return res.send({
                message: 'Error: No shopping lists found',
                data: shoppingLists
            });
        }

        res.json(shoppingLists);
    });
};

// GET endpoint /api/shoppinglists/:list_id
module.exports.getShoppingList = function(req, res) {
    var userId = req.user._id;
    var id = req.params.list_id;
    ShoppingList.getShoppingListById(id, userId, function(err, shoppingList) {
        if (err) {
            return res.send(err);
        }
        if (!shoppingList) {
            return res.send({
                message: 'Error: Shopping list not found',
                data: shoppingList
            });
        }

        res.json(shoppingList);
    });
};

// PUT endpoint /api/shoppinglists/:list_id
module.exports.putShoppingList = function(req, res) {
    var userId = req.user._id;
    var id = req.params.list_id;
    var updatedShoppingList = req.body;

    ShoppingList.updateShoppingList(id, userId, updatedShoppingList, function(err, shoppingList) {
        if (err) {
            return res.send(err);
        }

        res.json(shoppingList);
    });
};

// DELETE endpoint /api/shoppinglists/:list_id
module.exports.deleteShoppingList = function(req, res) {
    var userId = req.user._id;
    var listId = req.params.list_id;

    // TODO: test if only the owner can delete
    ShoppingList.removeShoppingListById(listId, userId, function(err, shoppingList) {
        if (err) {
            return res.send(err);
        }

        res.json(shoppingList);
    });
};

// POST endpoint /api/shoppinglists/:list_id/users
module.exports.postUsersInList = function(req, res) {
    var loggedUserId = req.user._id;
    var listId = req.params.list_id;
    var newUserId = req.body.newUserId;

    ShoppingList.addUserInList(loggedUserId, listId, newUserId, function(err, shoppingList) {
        if (err) {
            return res.send(err);
        }

        if (!shoppingList) {
            return res.send({
                message: 'Error: Shopping list not found',
                data: shoppingList
            });
        }

        res.json(shoppingList);
    });
};

// DELETE endpoint /api/shoppinglists/:list_id/users/:user_id
module.exports.deleteUserInList = function(req, res) {
    var loggedUserId = req.user._id;
    var listId = req.params.list_id;
    var removeUserId = req.params.user_id;
    
    ShoppingList.removeUserInList(loggedUserId, listId, removeUserId, function(err, shoppingList) {
        if (err) {
            return res.send(err);
        }

        if (!shoppingList) {
            return res.send({
                message: 'Error: Shopping list not found',
                data: shoppingList
            });
        }

        res.json(shoppingList);
    });
};