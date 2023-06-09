const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect();

// GET ALL USERS
const getAllUsers = async () =>{
    const getAllQuery = `SELECT * FROM app_user;`
    const result = await pool.query(getAllQuery);
    return result.rows;
}

// GET USER BY ID
const getUser = async (id) =>{
    const getUserQuery = `SELECT * FROM app_user WHERE id=${id};`;
    const result = await pool.query(getUserQuery);
    return result;
}


// ADD USER TO DB
const addUser = async (user) =>{
    const name = user.name;
    const addQuery = `INSERT INTO app_user (name) VALUES ('${name}');`;
    await pool.query(addQuery);
}

// UPDATE USER
const updateUser = async (user) =>{
    const id = user.id;
    const name = user.name;
    const updateQuery = `UPDATE app_user SET name='${name}' WHERE id=${id};`;
    await pool.query(updateQuery);
}

// DELETE USER
const deleteUser = async (id) =>{
    const deleteQuery = `DELETE FROM app_user WHERE id=${id};`;
    await pool.query(deleteQuery);
}

// GET ALL BUDGETS BELONGING TO A USER
const getAllBudgets = async (userId) =>{
    const getAllQuery = `SELECT * FROM budget WHERE app_user_id=${userId};`;
    const result = await pool.query(getAllQuery);
    return result;
}

// GET USER BUDGET BY ID
const getBudget = async (budgetId) =>{
    const getBudgetQuery = `SELECT * FROM budget WHERE id=${budgetId};`;
    const result = await pool.query(getBudgetQuery);
    return result;
}

// ADD BUDGET TO DB
const addBudget = async (budget) =>{
    const name = budget.name;
    const balance = budget.balance;
    const userId = budget.userId;
    const addQuery = `INSERT INTO budget (name, balance, app_user_id) VALUES ('${name}', ${balance}, ${userId});`;
    await pool.query(addQuery);
}

// UPDATE BUDGET BALANCE
const updateBudgetBalance = async (amount, id) =>{
    const updateQuery = `UPDATE budget SET balance=${amount} WHERE id=${id};`;
    await pool.query(updateQuery);
}

// UPDATE BUDGET NAME
const updateBudgetName = async (budgetName, id) =>{
    const updateQuery = `UPDATE budget SET name='${budgetName}' WHERE id=${id};`;
    await pool.query(updateQuery);
}

// DELETE USERS BUDGET BY ID
const deleteBudget = async (budgetId) =>{
    const deleteQuery = `DELETE FROM budget WHERE id =${budgetId};`;
    await pool.query(deleteQuery);
}

// DELETE ALL USERS BUDGETS
const deleteAllBudgets = async (userId) =>{
    const deleteQuery = `DELETE FROM budget WHERE app_user_id=${userId};`;
    await pool.query(deleteQuery);
}

// ADD TRANSACTION
const addTransaction = async (date, amount, recipient, budgetId) =>{
    const insertQuery = `INSERT INTO transaction (date, amount, recipient, budget_id) VALUES ('${date}', ${amount}, '${recipient}', ${budgetId});`;    
    await pool.query(insertQuery);
}

// GET ALL TRANSACTIONS FOR USER
const getAllTransactions = async (userId) =>{
    const getQuery = `SELECT transaction.id, transaction.date, transaction.amount, transaction.recipient, transaction.budget_id FROM transaction JOIN budget ON transaction.budget_id = budget.id JOIN app_user ON budget.app_user_id = app_user.id WHERE app_user.id = ${userId};`;
    const result = await pool.query(getQuery);
    return result;
}

// GET SINGLE TRANSACTION FOR USER BY BUDGETID
const getTransactions = async (userId, budgetId) =>{
    const getQuery = `SELECT transaction.id, transaction.date, transaction.amount, transaction.recipient, transaction.budget_id FROM transaction JOIN budget ON transaction.budget_id = budget.id JOIN app_user ON budget.app_user_id = app_user.id WHERE app_user.id = ${userId} AND budget.id = ${budgetId};`;
    const result = await pool.query(getQuery);
    return result;
}

// DELETE TRANSACTIONS FOR A GIVEN BUDGETID
const deleteTransactions = async (budgetId) =>{
    const deleteQuery = `DELETE FROM transaction WHERE budget_id =${budgetId};`;
    await pool.query(deleteQuery);
}

// DELETE ALL TRANSACTIONS FOR A USER
const deleteAllTransactions = async (userId) =>{
    const deleteQuery = `DELETE FROM transaction USING budget WHERE budget.app_user_id = ${userId} AND budget.id = transaction.budget_id;`;
    await pool.query(deleteQuery);
}


module.exports = { 
    addUser, 
    getAllUsers, 
    getUser, 
    updateUser, 
    deleteUser,
    addBudget,
    getBudget,
    getAllBudgets,
    updateBudgetBalance,
    updateBudgetName,
    deleteBudget,
    deleteAllBudgets,
    addTransaction,
    getAllTransactions,
    getTransactions,
    deleteTransactions,
    deleteAllTransactions
}