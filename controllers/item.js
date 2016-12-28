// load models
Item = require('../models/item');


// POST endpoint /api/shoppinglists/:list_id/items
module.exports.postItems = function(req, res) {
    var listId = req.params.list_id;
    req.user.isApprovedInList(listId, function(err, haveRights){
        if (err) {
            return res.send(err);
        }
        if (!haveRights) {
            return res.send({
                message: 'Error: This user doesn\'t have the needed rights for this shopping list'
            });
        }

        var newItem = req.body;
        Item.createItem(listId, newItem, function(err, item) {
            if (err) {
                return res.send(err);
            }

            res.json(item);
        });
    });
};

// GET endpoint /api/shoppinglists/:list_id/items
module.exports.getItems = function(req, res) {
    var listId = req.params.list_id;
    var limit = Number(req.query.limit);
    limit = Number.isInteger(limit) ? limit : null;
    var sortBy = req.query.sort;

    var filterQuery = {};
    var isDone = req.query.done;
    if (isDone) filterQuery.isDone = isDone;

    Item.getItemsInList(listId, filterQuery, limit, sortBy, function(err, items) {
        if (err) {
            return res.send(err);
        }
        if (!items || items.length === 0) {
            return res.send({
                message: 'Error: No items found for this list',
                data: items
            });
        }

        res.json(items);
    });
};

// DELETE endpoint /api/shoppinglists/:list_id/items
module.exports.deleteItems = function(req, res) {
    var listId = req.params.list_id;
    Item.removeAllItemsInList(listId, function(err, items) {
        if (err) {
            return res.send(err);
        }

        res.json(items);
    });
};

// GET endpoint /api/shoppinglists/:list_id/items/:item_id
module.exports.getItem = function(req, res) {
    var id = req.params.item_id;
    Item.getItemById(id, function(err, item) {
        if (err) {
            return res.send(err);
        }

        if (!item) {
            return res.send({
                message: 'Error: Item not found',
                data: item
            });
        }

        res.json(item);
    });
};

// PUT endpoint /api/shoppinglists/:list_id/items/:item_id
module.exports.putItem = function(req, res) {
    var id = req.params.item_id;
    var updatedItem = req.body;

    Item.updateItem(id, updatedItem, function(err, item) {
        if (err) {
            return res.send(err);
        }

        res.json(item);
    });
};

// DELETE endpoint /api/shoppinglists/:list_id/items/:item_id
module.exports.deleteItem = function(req, res) {
    var id = req.params.item_id;
    Item.removeItemById(id, function(err, item) {
        if (err) {
            return res.send(err);
        }

        res.json(item);
    });
};