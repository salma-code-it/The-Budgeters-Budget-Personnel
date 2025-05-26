const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'G56816930@',
    database: 'budget_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: false
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to database');
    connection.release();
});

module.exports = promisePool; 