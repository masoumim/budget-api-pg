// Require in express module
const express = require('express');

// Require in the utilities module
const utils = require('../utils/utils.js');

// Require in the services/request module that handles interactions with the DB
const services = require('../services/requests.js');

// Require in the budget module (used for deleting budgets that belong to a given user)
const budgetModule = require('./budget.js');

// Create userRouter
const userRouter = express.Router();

// Router nesting: 
// Nest the budgetRouter in to the userRouter.
// This tells Express that the path to budgetRouter is the same as userRouter,
// but with the the additional path '/:userId/budgets'.
// This now allows for a new route like: '/users/1/budgets'
// The result is that accessing the route: 'api/users/:userId/budgets',
// will trigger the budgetRouter's HTTP route handlers.
userRouter.use('/:userId/budgets', budgetModule.budgetRouter);

// Intercept any request to a route handler with the :userId parameter,
// and check if the userId is valid or not.
userRouter.param('userId', async (req, res, next, id) => {
    try {
        let userId = Number(id);
        const user = await services.getUser(userId);
        if (user.rowCount === 1) {
            // creates a 'user' on the request parameter and sets it's value.
            req.user = user;
            next();
        }
        else {
            res.status(404).send("That user does not exist");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

// GET all users
userRouter.get('/', async (req, res, next) => {
    // Return ALL users
    try {
        const allUsers = await services.getAllUsers();
        res.status(200).send(allUsers);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

// GET user by their ID
userRouter.get('/:userId', (req, res, next) => {
    res.status(200).send(req.user.rows[0]);
});

// POST routes
userRouter.post('/', async (req, res, next) => {
    // Check if the request body contains a name
    if (req.body.name) {
        try {
            // Create new User object using req.body
            const newUser = req.body;

            // Add the user to the db
            await services.addUser(newUser);

            // Send back response along with new user object
            res.status(201).send(newUser);
        } catch (error) {
            res.status(500).send(`${error}`);
        }
    }
    else {
        res.status(409).send("User must have a name");
    }
});

// PUT - update a user's name
userRouter.put('/:userId', async (req, res, next) => {
    // Check if the body's ID matches the URL param ID
    if (req.body.id === Number(req.params.userId)) {
        try {
            const updatedUser = req.body;
            await services.updateUser(updatedUser);
            res.status(200).send(updatedUser);
        } catch (error) {
            res.status(500).send(`${error}`);
        }
    }
    else {
        res.status(409).send("User id in body doesn't match id in URI");
    }
});

// DELETE user
userRouter.delete('/:userId', async (req, res, next) => {
    // TODO: Delete budget objects belonging to this user.
    // budgetModule.deleteBudgets(req.params.userId);

    // Delete user
    try {
        await services.deleteUser(req.params.userId);
        res.status(200).send("User deleted successfully");
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

// Export userRouter
module.exports = userRouter;