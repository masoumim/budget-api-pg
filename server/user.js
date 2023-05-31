// Require in express module
const express = require('express');

// Require in the utilities module
const utils = require('../utils/utils.js');

// Require in the services/request module that handles interactions with the DB
const services = require('../services/requests.js');

// Require in the budget module (used for deleting budgets that belong to a given user)
const budgetModule = require('./budget.js');

// Users array
const users = [
    {id: 1, userName: "Default user"},
    {id: 2, userName: "Default user 2"}
];

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
    
    let userId = Number(id);

    const allUsers = await services.getAllUsers();

    // Check if a user object with this ID already exists
    const userIndex = allUsers.findIndex((element) => {
        return Number(element.id) === userId;
    });

    if (userIndex === -1) {
        res.status(404).send('That user does not exist');
    }
    else {
        // creates a 'userIndex' on the request parameter and sets it's value.
        req.userIndex = userIndex;
        // creates a 'user' on the request parameter and sets it's value.
        req.user = allUsers[userIndex];
        next();
    }
});


// GET all users
userRouter.get('/', async (req, res, next) => {
    // Return ALL users
    const allUsers = await services.getAllUsers();
    res.status(200).send(allUsers);
});

// GET user by their ID
userRouter.get('/:userId', (req, res, next) => {
    res.status(200).send(req.user);
});

// POST routes
userRouter.post('/', (req, res, next) => {
    // Check if the request body contains a name
    if (req.body.name) {
        // Create new User object using req.body
        const newUser = req.body;

        // Add the user to the db
        services.addUser(newUser);

        // Send back response along with new user object
        res.status(201).send(newUser);
    }
    else {
        res.status(409).send("User must have a name");
    }
});

// PUT - update a user's name
userRouter.put('/:userId', (req, res, next) => {
    // Check if the body's ID matches the URL param ID
    if (req.body.id === Number(req.params.userId)) {
        const updatedUser = req.body;
        services.updateUser(updatedUser);
        res.status(200).send(updatedUser);
    }
    else {
        res.status(409).send("User id in body doesn't match id in URI");
    }
});

// DELTE user
userRouter.delete('/:userId', (req, res, next) => {
    // TODO: Delete budget objects belonging to this user.
    // budgetModule.deleteBudgets(req.params.userId);
    
    // Delete user
    services.deleteUser(req.params.userId);
    res.status(200).send("User deleted successfully");
});

// Export userRouter
module.exports = userRouter;