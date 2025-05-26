const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    let connection;
    try {
        // Create connection without database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '#salmasalma!@',
            ssl: false
        });

        
        await connection.query('CREATE DATABASE IF NOT EXISTS budget_management');
        await connection.query('USE budget_management');
        console.log('Connected to MySQL server');

        
        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'data-tier', 'models', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase(); 