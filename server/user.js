// Require in express module
const express = require('express');

// Require in the utilities module
const utils = require('../utils/utils.js');

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
userRouter.param('userId', (req, res, next, id) => {
    
    let userId = Number(id);

    // Check if a user object with this ID already exists
    const userIndex = users.findIndex((element) => {
        return element.id === userId;
    });

    if (userIndex === -1) {
        res.status(404).send('That user does not exist');
    }
    else {
        // creates a 'userIndex' on the request parameter and sets it's value.
        req.userIndex = userIndex;
        next();
    }
});


// GET routes
userRouter.get('/', (req, res, next) => {
    // Return ALL users
    res.status(200).send(users);
});

userRouter.get('/:userId', (req, res, next) => {
    res.status(200).send(users[req.userIndex]);
});

// POST routes
userRouter.post('/', (req, res, next) => {
    // Check if the request body contains a userName
    if (req.body.userName) {
        // Generate new ID
        const newUserId = utils.generateId(users);

        // Create new User object using req.body
        const newUser = req.body;

        // Set the ID of the new user
        newUser.id = newUserId;

        // Add the user object to the users array
        users.push(newUser);

        // Send back response along with new user object
        res.status(201).send(newUser);
    }
    else {
        res.status(409).send("User must have a name");
    }
});

// PUT routes
userRouter.put('/:userId', (req, res, next) => {
    // Edit user object
    // Check if the body's ID matches the URL param ID
    if (req.body.id === Number(req.params.userId)) {
        users[req.userIndex] = req.body;
        res.status(200).send(users[req.userIndex]);
    }
    else {
        res.status(409).send();
    }
});

// DELTE routes
userRouter.delete('/:userId', (req, res, next) => {
    // Delete budget objects belonging to this user.
    budgetModule.deleteBudgets(req.params.userId);
    
    // Delete user obj
    users.splice(req.userIndex, 1);
    res.status(200).send();
});

// Export userRouter
module.exports = userRouter;