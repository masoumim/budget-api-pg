// Require in express module
const express = require('express');

// Require in the dotenv module
// Will load environment variables contained in config.env
require('dotenv').config();

// Require in the services module which contains all the methods for interacting the the PostgreSQL db
const services = require('./services/requests')

// Create instance of an express module
const app = express();

// The port which the app will run on
const PORT = process.env.PORT || 8080;

// Enables body parsing
app.use(express.json());

// Import the apiRouter and mount apiRouter to '/api'
const apiRouter = require('./server/api');
app.use('/api',apiRouter);

// Start the server listening at PORT
app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`);
});