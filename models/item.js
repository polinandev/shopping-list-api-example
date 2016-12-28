var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    quantity: String,
    isDone: {
        type: Boolean,
        default: false
    },
    shoppingList_id: {
        type: Schema.Types.ObjectId,
        ref: 'shoppinglists',
        required: true
    }
});

var Item = module.exports = mongoose.model('items', ItemSchema);

// Create item
module.exports.createItem = function(listId, item, callback) {
    item.shoppingList_id = listId;
    Item.create(item, callback);
}

// Get all items in a shopping list
module.exports.getItemsInList = function(listId, query, limit, sortBy, callback) {
    query.shoppingList_id = listId;
    var sortQuery = {};
    sortQuery[sortBy] = 1;

    Item.find(query).sort(sortQuery).limit(limit).exec(callback);
}

// Remove all items in a shopping list
module.exports.removeAllItemsInList = function(listId, callback) {
    var query = {
        shoppingList_id: listId
    };
    Item.remove(query, callback);
}

// Get item by id
module.exports.getItemById = function(id, callback) {
    var query = {
        _id: id
    };
    Item.findOne(query, callback);
}

// Update item
module.exports.updateItem = function(id, item, callback) {
    var query = {
        _id: id
    };
    var update = {
        name: item.name,
        quantity: item.quantity,
        isDone: item.isDone,
        shoppingList_id: item.shoppingList_id
    };
    var options = {
        new: true,
        runValidators: true
    };
    Item.findOneAndUpdate(query, update, options, callback);
}

// Remove item by id
module.exports.removeItemById = function(id, callback) {
    var query = {
        _id: id
    };
    Item.findOneAndRemove(query, callback);
}