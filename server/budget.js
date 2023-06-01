// Require in express module
const express = require('express');

// Require in the services/request module that handles interactions with the DB
const services = require('../services/requests.js');

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
budgetRouter.param('budgetId', async (req, res, next, id) => {
    try {
        let budgetId = Number(id);
        const budget = await services.getBudget(budgetId);
        if (budget.rowCount === 1) {
            // creates a 'budget' on the request parameter and sets it's value.
            req.budget = budget;
            next();
        }
        else {
            res.status(404).send("That budget does not exist");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

// GET ALL BUDGETS BELONGING TO A USER
budgetRouter.get('/', async (req, res, next) => {
    try {
        if (req.params.userId) {
            const userBudgets = await services.getAllBudgets(Number(req.params.userId));
            res.status(200).send(userBudgets);
        }
        else {
            res.status(500).send("No user specified");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

// GET USER BUDGET BY ID
budgetRouter.get('/:budgetId', async (req, res, next) => {
    try {
        if (req.params.userId) {
            // Check if this budget belongs to the user
            if (Number(req.params.userId) === req.budget.rows[0].app_user_id) {
                res.status(200).send(req.budget.rows[0]);
            }
            else {
                res.status(500).send("Budget does not belong to user");
            }
        }
        else {
            res.status(500).send("No user specified");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

// POST routes
// Example: /api/user/1/budgets
budgetRouter.post('/', async (req, res, next) => {
    // Check if the request body's userId matches the URI's userId param
    if (req.body.userId === Number(req.params.userId)) {
        try {
            // Create new Budget object using req.body
            const newBudget = req.body;

            // Add the budget object to the DB
            await services.addBudget(newBudget);

            // Send back response along with new budget object
            res.status(201).send(newBudget);
        } catch (error) {
            res.status(500).send(`${error}`);
        }
    }
    else {
        res.status(409).send("Budget must belong a to user");
    }
});

// POST - transfer money between budgets
// example: /api/users/1/budgets/transfer/1/2
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

