// Require in express module
const express = require('express');

// Require in the utilities module
const utils = require('../utils/utils.js');

// Budgets array
let budgets = [
    {id: 1, name: "Groceries", balance: 100, userId: 1},
    {id: 2, name: "Car Payment", balance: 100, userId: 1},
    {id: 3, name: "Cellphone", balance: 80, userId: 1},
    {id: 4, name: "Entertainment", balance: 100, userId: 1},
    {id: 5, name: "Fast Food", balance: 100, userId: 2},
    {id: 6, name: "Bank Loan", balance: 100, userId: 2}
];

// Create budgetRouter
// mergeParams enables accessing route params belonging to to the 'parent route',
// which in this example is the userRouter.
// This requires nesting the budgetRouter (child) into the userRouter (parent),
// which is done in the user.js file.
const budgetRouter = express.Router({mergeParams: true});

// Intercept any request to a route handler with the :budgetId parameter,
// and check if the budgetId is valid or not.
budgetRouter.param('budgetId', (req, res, next, id) => {
    
    let budgetId = Number(id);
    
    // Check if a budget object with this ID already exists
    const budgetIndex = budgets.findIndex((element) => {
        return element.id === budgetId;
    });

    if (budgetIndex === -1) {
        res.status(404).send('That budget does not exit');
    }
    else {
        // creates a 'budgetIndex' on the request parameter and sets it's value.
        req.budgetIndex = budgetIndex;        
        next();
    }
});

// GET routes
budgetRouter.get('/', (req, res, next) => {
    if (req.params.userId) {
        // If the request contains a userId param, we only return the budgets belonging to that user.
        const userBudgets = budgets.filter((element) => element.userId === Number(req.params.userId));
        res.status(200).send(userBudgets);
    }
    else {
        // Return ALL budgets
        res.status(200).send(budgets);
    }
});

budgetRouter.get('/:budgetId', (req, res, next) => {
    // If there is a userId param, return a budget only if it belongs to that user.
    if (req.params.userId) {
        if (budgets[req.budgetIndex].userId === Number(req.params.userId)) {
            res.status(200).send(budgets[req.budgetIndex]);
        }
        else {
            res.status(404).send('That User does not have that budget');
        }
    }
    else {
        res.status(200).send(budgets[req.budgetIndex]);
    }
});

// POST routes
budgetRouter.post('/', (req, res, next) => {
    // Check if the request body's userId matches the URI's userId param
    if (req.body.userId === Number(req.params.userId)) {
        // Generate new ID
        const newBudgetId = utils.generateId(budgets);

        // Create new Budget object using req.body
        const newBudget = req.body;

        // Set the ID of the new budget
        newBudget.id = newBudgetId;

        // Add the budget object to the budgets array
        budgets.push(newBudget);

        // Send back response along with new budget object
        res.status(201).send(newBudget);
    }
    else {
        res.status(409).send("Budget must belong to user");
    }
});

// POST - transfer money between budgets
// example: /api//users/1/budgets/transfer/1/2
budgetRouter.post('/transfer/:from/:to', (req, res, next) => {
    // Check for userId in the URI
    if (req.params.userId) {
        // Check if there are budgets that match the budget id parameters AND those bugdets belong to user.
        if (budgets[Number(req.params.from - 1)] && budgets[Number(req.params.to - 1)] && budgets[Number(req.params.from - 1)].userId === Number(req.params.userId) && budgets[Number(req.params.to - 1)].userId === Number(req.params.userId)) {
            // Deduct the amount from a budget if there is enough to deduct
            if (budgets[Number(req.params.from) - 1].balance >= Number(req.params.from)) {

                // Deduct from budget
                budgets[Number(req.params.from) - 1].balance -= Number(req.headers.amount);

                // Add the amount to other budget
                budgets[Number(req.params.to) - 1].balance += Number(req.headers.amount);

                res.status(200).send();
            }
            else {
                res.status(409).send(`Not enough money in ${budgets[Number(req.params.from) - 1].name} budget`);
            }
        }else{
            res.status(409).send("User doesn't have that budget");
        }
    }
    else {
        res.status(409).send("Only users can transfer money between budgets");
    }
});

// PUT routes
budgetRouter.put('/:budgetId', (req, res, next) => {
    // Check if the body's ID matches the URI param ID
    // and Check that the body's userId matches the URI's userId param
    if (req.body.id === Number(req.params.budgetId) && req.body.userId === Number(req.params.userId)) {
        budgets[req.budgetIndex] = req.body;
        res.status(200).send(budgets[req.budgetIndex]);
    }
    else {
        res.status(409).send("Budget must belong to user and budget must be valid");
    }
});

// DELTE routes
budgetRouter.delete('/:budgetId', (req, res, next) => {
    // Delete budget obj
    budgets.splice(req.budgetIndex, 1);
    res.status(200).send();
});

// Deletes budgets belonging to user
function deleteBudgets(userId){    
    budgets = budgets.filter((element) => element.userId !== Number(userId));
}

// Export budgetRouter
module.exports = {budgetRouter, deleteBudgets};

