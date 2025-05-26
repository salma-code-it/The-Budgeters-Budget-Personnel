const db = require('./db');

class clsUserDataAccess {
    static async create(username, email, password) {
        try {
            const [result] = await db.query(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, password]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error finding user by email: ' + error.message);
        }
    }

    static async findById(userId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE user_id = ?',
                [userId]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error finding user by ID: ' + error.message);
        }
    }

    static async findByEmailAndPassword(email, password) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE email = ? AND password = ?',
                [email, password]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error finding user by email and password: ' + error.message);
        }
    }
}

module.exports = clsUserDataAccess; 