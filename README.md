# personal-budget-api
An API for creating, getting, updating and deleting budgets built using ExpressJS and NodeJS.

The back-end framework used is ExpressJS.

To use the API, first install NodeJS (https://nodejs.org),
then install ExpressJS using NPM in the NodeJS terminal (example: 'npm install express' or 'npm install' to automatically install all dependencies).
Once installed, type 'node app.js' in the NodeJS terminal to start the server which will run at http://localhost:8080 by default.

This project does not utilize a client or front-end. 
To interact with the API use Postman (https://www.postman.com/) to make requests.

User data has the following format: {id: 1, userName: "Name of User"}

Budget data has the following format: {id: 1, name: "Bank Loan", balance: 100, userId: 2}

Endpoints:
==========

Users
------
**Get:**
  

api/users


api/users/:userId


**Post:**
  

api/users


**Put:**
  

api/users/:userId


**Delete:**
  

api/users/:userId


Budgets
-----------
**Get:**
  

api/budgets


api/budgets/:budgetId


**Post:**
  

api/users/userId/budgets


api/users/userId/transfer/budgetId/budgetId (call expects a header value named "amount" and corresponding integer value. transfers the amount between budgets)


**Put:**
  

api/users/:userId


**Delete:**
  

api/users/:userId
