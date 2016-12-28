// load models
User = require('../models/user');

// POST endpoint /api/users
module.exports.postUsers = function(req, res) {
    var newUser = req.body;

    User.createUser(newUser, function(err) {
        if (err) {
            return res.send(err);
        }

        res.json({
            message: 'Success: New user created'
        });
    });
};

// GET endpoint /api/users
module.exports.getUsers = function(req, res) {
    var limit = Number(req.query.limit);
    limit = Number.isInteger(limit) ? limit : null;

    User.getUsers(limit, function(err, users) {
        if (err) {
            return res.send(err);
        }
        if (!users || users.length === 0) {
            return res.send({
                message: 'Error: No users found',
                data: users
            });
        }

        res.json(users);
    });
};