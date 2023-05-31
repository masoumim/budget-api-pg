const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect();

// TEST QUERY - TODO: DELETE LATER
const testQuery = (req, res) => {
    pool.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            console.log(JSON.stringify(row));
        }
        pool.end();
    });
}

// GET ALL USERS


// ADD USER TO DB
const addUser = async (req, res) =>{
    const userName = req.userName;
    const addQuery = `INSERT INTO app_user (name) VALUES ('${userName}');`;
    await pool.query(addQuery);   
}




module.exports = { testQuery, addUser }