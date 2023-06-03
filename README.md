# budget-api-pg
An API for creating, getting, updating and deleting budgets built using ExpressJS and NodeJS.

# Project technical stack:
Language: Node.js / JavaScript

Framework: Express.js

Database: PostgreSQL / Heroku

# Project info:
This project is a simple back-end API for managing and creating various budgets for different spending categories. You can also add transactions to each budget which represents a withdrawl of money from that budget.

Users, Budgets and Transactions are all saved persistently using a Heroku hosted PostgreSQL database.

To use the API, navigate to the base URL at http://budget-api-pg.herokuapp.com/.

This project does not utilize a client or front-end. 
To interact with the API use Postman (https://www.postman.com/) to make requests.

User data has the following format: {"id:" 1, "name": "Foo"}

Budget data has the following format: {"id": 1, "name": "Car Payments", "balance": 1000, "userId": 1}

Transaction data has the following format: {"id": 1, "date": date, "amount": 100, "recipient": "Foo's Auto Dealership", "budgetId": 1}


# OpenAPI / Swagger
A full API specification is included in this repository (Open_API_spec.yaml)

To view the .yaml file using Swagger, first download the Swagger editor from the Swagger GitHub repo (https://github.com/swagger-api/swagger-editor) OR you can use the browser based Swagger editor at (https://editor.swagger.io/)

If you downloaded the Swagger editor, simply open the index.html file located in folder. From there you can import the .yaml file by going to FILE > IMPORT FILE.

# Endpoints:


Base URL: http://budget-api-pg.herokuapp.com/

Users
------
**Get:**
  

api/users -- GET all Users


api/users/:userId -- GET User by ID


**Post:**
  

api/users -- ADD User -- Body Format: {"name": "Foo"}


**Put:**
  

api/users/:userId -- UPDATE User name -- Body Format: {"userId": 1, "name": "Bar"}


**Delete:**
  

api/users/:userId -- DELETE User by ID


Budgets
-----------
**Get:**
  

/api/users/:userId/budgets -- GET all of a user's budgets


/api/users/:userId/budgets/:budgetId -- GET a single budget by budget ID


/api/users/:userId/budgets/transactions


/api/users/:userId/budgets/:budgetId/transactions


**Post:**
  

/api/user/:userId/budgets -- ADD a budget -- Body Format: {"userId": 1, "name": "Food Budget", "balance": 100}


/api/users/:userId/transfer/:budgetId/:budgetId -- Transfer money from one account to another -- (amount to transfer is specified in the HTTP Header key 'amount')


/api/users/userId:/budgets/:budgetId/transaction


**Put:**
  
  
/api/users/:userId/budgets/:budgetId -- UPDATE a budget's name -- Body Format: {"budgetId": 1, "name": "Entertainment Budget"}


**Delete:**
  

/api/users/:userId/budgets/:budgetId/transactions


/api/user/userId:/budgets/transactions


/api/users/:userId/budgets -- DELETE all of a user's budgets


/api/users/:userId/budgets/:budgetId -- DELETE a single budget belonging to a user


Transactions
-----------
**Get:**


/api/users/:userId/budgets/transactions -- GET all transactions for a user


/api/users/:userId/budgets/:budgetId/transactions -- GET all transactions for a user's budget


**Post:**
  

/api/users/userId:/budgets/:budgetId/transaction -- ADD a transaction for a budget -- Body Format: {"amount": 100, "recipient": "Grocery Store", "budgetId": 1}


**Delete:**
  

/api/users/:userId/budgets/:budgetId/transactions -- DELETE transactions for a specific budget


/api/user/userId:/budgets/transactions -- DELETE all of a User's transactions
