var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');

var authController = require('./controllers/auth');
var userController = require('./controllers/user');
var shoppingListController = require('./controllers/shoppinglist');
var itemController = require('./controllers/item');

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

// Connect to MongoDB
var connectionString = '[your-mongo-db-connection-string]';
mongoose.Promise = global.Promise;
mongoose.connect(connectionString)
    .then(() => console.log('Success: connected to MongoDB'))
    .catch((err) => console.error(err));

// Create our Express app
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(passport.initialize());

// Create routes
var router = express.Router();

// Create endpoint handlers for /users
router.route('/users')
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers);

// Create endpoint handlers for /shoppinglists
router.route('/shoppinglists')
    .post(authController.isAuthenticated, shoppingListController.postShoppingLists)
    .get(authController.isAuthenticated, shoppingListController.getShoppingLists);

//Create endpoint handlers for /shoppinglists/:list_id
router.route('/shoppinglists/:list_id')
    .get(authController.isAuthenticated, shoppingListController.getShoppingList)
    .put(authController.isAuthenticated, shoppingListController.putShoppingList)
    .delete(authController.isAuthenticated, shoppingListController.deleteShoppingList);

//Create endpoint handlers for /shoppinglists/:list_id/items
router.route('/shoppinglists/:list_id/users')
    .post(authController.isAuthenticated, shoppingListController.postUsersInList);

//Create endpoint handlers for /shoppinglists/:list_id/items
router.route('/shoppinglists/:list_id/users/:user_id')
    .delete(authController.isAuthenticated, shoppingListController.deleteUserInList);

//Create endpoint handlers for /shoppinglists/:list_id/items
router.route('/shoppinglists/:list_id/items')
    .get(authController.isAuthenticated, itemController.getItems)
    .post(authController.isAuthenticated, itemController.postItems)
    .delete(authController.isAuthenticated, itemController.deleteItems);  

//Create endpoint handlers for /shoppinglists/:list_id/items/:item_id
router.route('/shoppinglists/:list_id/items/:item_id')
    .get(authController.isAuthenticated, itemController.getItem)
    .put(authController.isAuthenticated, itemController.putItem)
    .delete(authController.isAuthenticated, itemController.deleteItem);

// Register all our routes with /api
app.use('/api', router);

// http://localhost:3000/api
router.get('/', function(req, res) {
    res.send('Hello World!');
});

// Start server
app.listen(port);
console.log('Running on port ' + port);