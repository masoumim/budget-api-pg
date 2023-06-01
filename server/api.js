// Require in express module
const express = require('express');

// Create apiRouter
const apiRouter = express.Router();

// Mount userRouter
const userRouter = require('./user.js');
apiRouter.use('/users', userRouter);

// Mount budgetRouter
const budgetRouter = require('./budget.js');
apiRouter.use('/budgets', budgetRouter);

// Export the apiRouter
module.exports = apiRouter;