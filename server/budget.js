// Require in express module
const express = require('express');

// Require in the services/request module that handles interactions with the DB
const services = require('../services/requests.js');

// Require in the utilities module
const utils = require('../utils/utils.js');

// Create budgetRouter
// mergeParams enables accessing route params belonging to to the 'parent route',
// which in this example is the userRouter.
// This requires nesting the budgetRouter (child) into the userRouter (parent),
// which is done in the user.js file.
const budgetRouter = express.Router({ mergeParams: true });

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
// example: /api/users/:userId/budgets
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

// GET BUDGET TRANSACTIONS FOR A USER
// example: api/users/:userId/budgets/transactions
budgetRouter.get('/transactions', async (req, res, next) => {
    try {
        // Check for userId in URI
        if (req.params.userId) {
            // Get all users transaction
            const userTransactions = await services.getAllTransactions(Number(req.params.userId));

            if (userTransactions.rows.length > 0) {
                res.status(200).send(userTransactions.rows);
            } else {
                res.status(500).send("No matching transactions");
            }
        }
        else {
            res.status(500).send("User not specified");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

// GET BUDGET TRANSACTION FOR USER BY BUDGET ID
// example: api/users/:userId/budgets/:budgetId/transactions
budgetRouter.get(`/:budgetId/transactions`, async (req, res, next) => {
    try {
        // Check for userId in URI
        if (req.params.userId) {
            //Get transaction for budgetId
            const userTransactions = await services.getTransactions(Number(req.params.userId), Number(req.params.budgetId));

            if (userTransactions.rows.length > 0) {
                res.status(200).send(userTransactions.rows);
            }
            else {
                res.status(500).send("No matching transaction(s) for that budget")
            }
        }
        else {
            res.status(500).send("User not specified");
        }

    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

// GET USER BUDGET BY ID
// example: /api/users/:userId/budgets/:budgetId
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

// POST A NEW BUDGET
// Example: /api/user/:userId/budgets
budgetRouter.post('/', async (req, res, next) => {
    // Check if the request body's userId matches the URI's userId param
    // AND has a key in the request body called 'balance'
    if (req.body.userId === Number(req.params.userId) && req.body.balance) {
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
    else{
        res.status(500).send("Must provide valid user and budget");
    }
});

// POST - TRANSFER MONEY BETWEEN BUDGETS
// The amount is to transfer to sent via http Header key 'amount'
// example: /api/users/:userId/budgets/transfer/:from/:to
budgetRouter.post('/transfer/:from/:to', async (req, res, next) => {
    try {
        // Check for userId in the URI
        if (req.params.userId) {
            // Get the user's budgets
            const usersBudgets = await services.getAllBudgets(Number(req.params.userId));
            // Check to see if this user has budgets that match the budget id's
            const fromBudget = usersBudgets.find(budget => budget.app_user_id === Number(req.params.userId) && budget.id === Number(req.params.from));
            const toBudget = usersBudgets.find(budget => budget.app_user_id === Number(req.params.userId) && budget.id === Number(req.params.to));

            if (fromBudget && toBudget) {
                // Do transfer                
                // Convert fromBudget's balance from MONEY string to FLOAT
                // Remove the '$' from the start of the string
                const fromBudgetString = fromBudget.balance.substring(1);                
                // Convert to float
                const fromBudgetFloat = parseFloat(fromBudgetString);

                // Check if there is enough balance in fromBudget to do transfer
                if (fromBudgetFloat >= Number(req.headers.amount)) {
                    // deduct amount from fromBudget's balance                    
                    const fromBudgetDeducted = fromBudgetFloat - parseFloat(req.headers.amount);                    
                    await services.updateBudgetBalance(fromBudgetDeducted, fromBudget.id);

                    // Add amount to toBudget's balance
                    const toBudgetString = toBudget.balance.substring(1);
                    const toBudgetFloat = parseFloat(toBudgetString);
                    const toBudgetAdded = toBudgetFloat + parseFloat(req.headers.amount);
                    const response = await services.updateBudgetBalance(toBudgetAdded, toBudget.id);

                    // return the updated budgets
                    const updatedFromBudget = await services.getBudget(fromBudget.id);
                    const updatedToBudget = await services.getBudget(toBudget.id);                    
                    res.status(200).send(`Transfer complete: from budget ${fromBudget.id} = ${updatedFromBudget.rows[0].balance}, to budget ${toBudget.id} = ${updatedToBudget.rows[0].balance}`);
                } else {
                    res.send("Not enough money in account");
                }
            }
            else {
                res.status(500).send("Budget not found");
            }
        }
        else {
            res.status(500).send("Only users can transfer money between budgets");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

// ADD BUDGET TRANSACTION
// example: /api/users/userId:/budgets/:budgetId/transaction
budgetRouter.post('/:budgetId/transaction', async (req, res, next) => {
    try {
        // Check for userId paramter in the URI    
        // AND body contains a budgetId which matches the URI
        if (req.params.userId && req.body.budgetId === Number(req.params.budgetId)) {

            // Check if user has budget matching budgetId paramter            
            const budget = await services.getBudget(req.params.budgetId);
            if (budget.rows[0].app_user_id === Number(req.params.userId)) {

                // Check if there is enough balance to execute the transfer
                // Remove the '$' from the start of the string
                const budgetBalanceString = req.budget.rows[0].balance.substring(1);
                // Convert to float
                const budgetBalanceFloat = parseFloat(budgetBalanceString);

                if (budgetBalanceFloat >= req.body.amount) {
                    // Budget has enough balance, performing transaction
                    // Deduct transaction amount from budget balance and update budget in DB
                    const newBudgetBalance = budgetBalanceFloat - req.body.amount;
                    await services.updateBudgetBalance(newBudgetBalance, req.body.budgetId);

                    // Add transaction to the DB

                    // Date - Format date to Postgres format: YYYY-MM-DD
                    const date = new Date();
                    const formattedDate = date.toISOString().split('T')[0];
                    const formattedDateString = formattedDate.toString();

                    // Add transaction to the DB
                    await services.addTransaction(formattedDateString, req.body.amount, req.body.recipient, req.body.budgetId);

                    res.status(200).send("Transaction completed successfully");
                }
                else {
                    res.status(500).send("Sorry, you don't have enough balance in this budget to perform transaction");
                }
            }
            else {
                res.status(500).send("User doesn't have that budget");
            }
        }
        else {
            res.status(500).send("No budget specified and/or budgetId mismatch");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

// PUT - UPDATE BUDGET NAME
// example: /api/users/:userId/budgets/:budgetId
budgetRouter.put('/:budgetId', async (req, res, next) => {    
    try {
        // Check if the body's ID matches the URI param ID
        // and Check that the body's userId matches the URI's userId param
        if (req.body.id === Number(req.params.budgetId) && req.body.userId === Number(req.params.userId)) {
            await services.updateBudgetName(req.body.name, req.body.id);
            res.status(200).send("budget name updated");
        }
        else {
            res.status(409).send("Budget must belong to user and budget must be valid");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});

// DELETE TRANSACTION(S) FOR A BUDGET
// example: /api/users/:userId/budgets/:budgetId/transactions
budgetRouter.delete('/:budgetId/transactions', async (req, res, next) => {
    try {
        // Check for userId parameter in URI                
        if (req.params.userId) {
            // Check if user has transactions for this budgetId to delete
            const transactions = await services.getTransactions(Number(req.params.userId), Number(req.params.budgetId));
            if (transactions.rows.length > 0) {
                await services.deleteTransactions(Number(req.params.budgetId));
                res.status(200).send("All transactions for that budget successfully deleted");
            }
            else {
                res.status(500).send("No matching transactions to delete")
            }
        }
        else {
            res.status(500).send("No user specified");
        }

    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

// DELETE ALL TRANSACTIONS FOR A USER


// DELETE ALL BUDGETS BELONGING TO USER
// example: /api/users/:userId/budgets
budgetRouter.delete('/', async (req, res, next) => {
    try {
        // Check for a userId parameter in the URI
        if (req.params.userId) {
            await services.deleteAllBudgets(req.params.userId);
            res.status(200).send("All budgets for user deleted successfully");
        }
        else {
            res.status(500).send("No user specified");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
})

// DELETE BUDGET BY ID
// example: /api/users/:userId/budgets/:budgetId
budgetRouter.delete('/:budgetId', async (req, res, next) => {
    try {
        // Check for a userId parameter in the URI
        if (req.params.userId) {
            // Check if user has a budget with this budgetId
            if (Number(req.params.userId) === req.budget.rows[0].app_user_id) {
                await services.deleteBudget(req.params.budgetId);
                res.status(200).send("Budget deleted successfully");
            }
            else {
                res.status(500).send("User doesn't have that budget");
            }
        }
        else {
            res.status(500).send("No user specifed");
        }
    } catch (error) {
        res.status(500).send(`${error}`);
    }
});



// Export budgetRouter
module.exports = budgetRouter;

