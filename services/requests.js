const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect();

// TEST QUERY - TODO: DELETE LATER
// const testQuery = (req, res) => {
//     pool.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//         if (err) throw err;
//         for (let row of res.rows) {
//             console.log(JSON.stringify(row));
//         }
//         pool.end();
//     });
// }

// GET ALL USERS
const getAllUsers = async () =>{
    const getAllQuery = `SELECT * FROM app_user;`
    const result = await pool.query(getAllQuery);
    return result.rows;
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

module.exports = { addUser, getAllUsers, updateUser, deleteUser }