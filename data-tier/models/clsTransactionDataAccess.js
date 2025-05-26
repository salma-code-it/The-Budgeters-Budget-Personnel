const db = require('./db');

class clsTransactionDataAccess {
    static async create(userId, type, category, amount, description, date) {
        try {
            const [result] = await db.query(
                'INSERT INTO transactions (user_id, type, category, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, type, category, amount, description, date]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error creating transaction: ' + error.message);
        }
    }

    static async getByUserId(userId, type = null) {
        try {
            let query = 'SELECT * FROM transactions WHERE user_id = ?';
            const params = [userId];
            
            if (type) {
                query += ' AND type = ?';
                params.push(type);
            }
            
            query += ' ORDER BY date DESC';
            const [rows] = await db.query(query, params);
            return rows.map(row => ({
                ...row,
                amount: Number(row.amount)
            }));
        } catch (error) {
            throw new Error('Error getting transactions: ' + error.message);
        }
    }

    static async getByDateRange(userId, startDate, endDate, type = null) {
        try {
            let query = 'SELECT * FROM transactions WHERE user_id = ? AND date BETWEEN ? AND ?';
            const params = [userId, startDate, endDate];
            
            if (type) {
                query += ' AND type = ?';
                params.push(type);
            }
            
            query += ' ORDER BY date DESC';
            const [rows] = await db.query(query, params);
            return rows.map(row => ({
                ...row,
                amount: Number(row.amount)
            }));
        } catch (error) {
            throw new Error('Error getting transactions by date range: ' + error.message);
        }
    }

    static async getByCategory(userId, category, type = null) {
        try {
            let query = 'SELECT * FROM transactions WHERE user_id = ? AND category = ?';
            const params = [userId, category];
            
            if (type) {
                query += ' AND type = ?';
                params.push(type);
            }
            
            query += ' ORDER BY date DESC';
            const [rows] = await db.query(query, params);
            return rows.map(row => ({
                ...row,
                amount: Number(row.amount)
            }));
        } catch (error) {
            throw new Error('Error getting transactions by category: ' + error.message);
        }
    }

    static async update(transactionId, data) {
        try {
            const { category, amount, description, date } = data;
            const [result] = await db.query(
                'UPDATE transactions SET category = ?, amount = ?, description = ?, date = ? WHERE transaction_id = ?',
                [category, amount, description, date, transactionId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error updating transaction: ' + error.message);
        }
    }

    static async delete(transactionId) {
        try {
            const [result] = await db.query('DELETE FROM transactions WHERE transaction_id = ?', [transactionId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error deleting transaction: ' + error.message);
        }
    }

    static async getTotalByType(userId, type, startDate, endDate) {
        try {
            const [rows] = await db.query(
                'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = ? AND date BETWEEN ? AND ?',
                [userId, type, startDate, endDate]
            );
            return Number(rows[0].total);
        } catch (error) {
            throw new Error('Error getting total by type: ' + error.message);
        }
    }

    static async getCategoryTotals(userId, type, startDate, endDate) {
        try {
            const [rows] = await db.query(
                'SELECT category, COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = ? AND date BETWEEN ? AND ? GROUP BY category',
                [userId, type, startDate, endDate]
            );
            return rows.map(row => ({
                ...row,
                total: Number(row.total)
            }));
        } catch (error) {
            throw new Error('Error getting category totals: ' + error.message);
        }
    }
}

module.exports = clsTransactionDataAccess; 