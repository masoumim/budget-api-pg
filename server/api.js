// Require in express module
const express = require('express');

// Create apiRouter
const apiRouter = express.Router();

// Mount userRouter
const userRouter = require('./user.js');
apiRouter.use('/users', userRouter);

// Mount budgetRouter
const budgetModule = require('./budget.js');
apiRouter.use('/budgets', budgetModule.budgetRouter);

// Export the apiRouter
module.exports = apiRouter;