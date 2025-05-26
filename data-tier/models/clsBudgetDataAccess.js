const db = require('./db');

class clsBudgetDataAccess {
    static async create(userId, category, amount, month, year) {
        try {
            const [result] = await db.query(
                'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)',
                [userId, category, amount, month, year]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Error creating budget: ' + error.message);
        }
    }

    static async getByUserId(userId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM budgets WHERE user_id = ? ORDER BY year DESC, month DESC',
                [userId]
            );
            return rows;
        } catch (error) {
            throw new Error('Error getting budgets: ' + error.message);
        }
    }

    static async getByMonth(userId, month, year) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?',
                [userId, month, year]
            );
            return rows;
        } catch (error) {
            throw new Error('Error getting monthly budget: ' + error.message);
        }
    }

    static async update(budgetId, amount) {
        try {
            const [result] = await db.query(
                'UPDATE budgets SET amount = ? WHERE budget_id = ?',
                [amount, budgetId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error updating budget: ' + error.message);
        }
    }

    static async delete(budgetId) {
        try {
            const [result] = await db.query('DELETE FROM budgets WHERE budget_id = ?', [budgetId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error deleting budget: ' + error.message);
        }
    }

    static async getTotalBudget(userId, month, year) {
        try {
            const [rows] = await db.query(
                'SELECT COALESCE(SUM(amount), 0) as total FROM budgets WHERE user_id = ? AND month = ? AND year = ?',
                [userId, month, year]
            );
            return Number(rows[0].total);
        } catch (error) {
            throw new Error('Error getting total budget: ' + error.message);
        }
    }
}

module.exports = clsBudgetDataAccess; 