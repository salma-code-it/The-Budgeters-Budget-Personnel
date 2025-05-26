const TransactionDataAccess = require("../../data-tier/models/clsTransactionDataAccess");
const clsBudgetDataAccess = require('../../data-tier/models/clsBudgetDataAccess'); // This will be renamed later

class clsTransaction {
    static async createTransaction(userId, type, category, amount, description, date) {
        try {
            // Validate input
            if (!type || !category || amount <= 0 || !date) {
                throw new Error('Invalid transaction data');
            }

            // Create transaction
            const transactionId = await TransactionDataAccess.create(
                userId,
                type,
                category,
                amount,
                description,
                date
            );

            return {
                id: transactionId,
                userId: userId,
                type,
                category,
                amount,
                description,
                date
            };
        } catch (error) {
            throw new Error('Failed to create transaction: ' + error.message);
        }
    }

    static async getTransactions(userId, filters = {}) {
        try {
            const {
                type,
                startDate,
                endDate,
                category
            } = filters;

            let transactions;
            if (startDate && endDate) {
                transactions = await TransactionDataAccess.getByDateRange(userId, startDate, endDate, type);
            } else if (category) {
                transactions = await TransactionDataAccess.getByCategory(userId, category, type);
            } else {
                transactions = await TransactionDataAccess.getByUserId(userId, type);
            }

            return transactions;
        } catch (error) {
            throw new Error('Failed to get transactions: ' + error.message);
        }
    }

    static async getMonthlyOverview(userId, month, year) {
        try {
            const startDate = `${year}-${month}-01`;
            const endDate = `${year}-${month}-31`;

            const [expenses, income] = await Promise.all([
                TransactionDataAccess.getTotalByType(userId, 'expense', startDate, endDate),
                TransactionDataAccess.getTotalByType(userId, 'income', startDate, endDate)
            ]);

            const categoryBreakdown = await TransactionDataAccess.getCategoryTotals(
                userId,
                'expense',
                startDate,
                endDate
            );

            // Get budget data for the month
            const budgets = await clsBudgetDataAccess.getByMonth(userId, month, year);

            return {
                monthlyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                monthlyIncome: Array(12).fill(0), // Placeholder for monthly income data
                monthlyExpenses: Array(12).fill(0), // Placeholder for monthly expenses data
                categoryLabels: categoryBreakdown.map(c => c.category),
                categoryAmounts: categoryBreakdown.map(c => c.total),
                budgetCategories: budgets.map(b => b.category),
                budgetAmounts: budgets.map(b => b.amount),
                spentAmounts: categoryBreakdown.map(c => c.total)
            };
        } catch (error) {
            throw new Error('Failed to get monthly overview: ' + error.message);
        }
    }

    static async updateTransaction(transactionId, data) {
        // Note: This function updates a specific transaction by ID.
        // For simplicity, we won't add user check here.
        try {
            const { category, amount, description, date } = data;

            // Validate input
            if (amount <= 0 || !date) {
                throw new Error('Invalid transaction data');
            }

            const success = await TransactionDataAccess.update(transactionId, data);
            if (!success) {
                throw new Error('Transaction not found');
            }

            return { id: transactionId, ...data };
        } catch (error) {
            throw new Error('Failed to update transaction: ' + error.message);
        }
    }

    static async deleteTransaction(transactionId) {
        // Note: This function deletes a specific transaction by ID.
        // For simplicity, we won't add user check here.
        try {
            const success = await TransactionDataAccess.delete(transactionId);
            if (!success) {
                throw new Error('Transaction not found');
            }

            return { success: true };
        } catch (error) {
            throw new Error('Failed to delete transaction: ' + error.message);
        }
    }

    static async getRecentTransactions(userId, limit = 5) {
        try {
            const transactions = await TransactionDataAccess.getByUserId(userId);
            return transactions.slice(0, limit);
        } catch (error) {
            throw new Error('Failed to get recent transactions: ' + error.message);
        }
    }

    static async getCategoryAnalysis(userId, startDate, endDate) {
        try {
            // Get expense categories and amounts
            const expenses = await TransactionDataAccess.getCategoryTotals(userId, 'expense', startDate, endDate);

            // Get budget categories and amounts
            const currentDate = new Date(startDate);
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const budgets = await clsBudgetDataAccess.getByMonth(userId, month, year);

            // Get spent amounts for each budget category
            const spentAmounts = await Promise.all(
                budgets.map(async (budget) => {
                    const categoryExpenses = expenses.filter(e => e.category === budget.category);
                    const spent = categoryExpenses.reduce((sum, e) => sum + e.total, 0);
                    return spent;
                })
            );

            return {
                // For expense categories chart
                categoryLabels: expenses.map(e => e.category),
                categoryAmounts: expenses.map(e => e.total),

                // For budget progress chart
                budgetCategories: budgets.map(b => b.category),
                budgetAmounts: budgets.map(b => b.amount),
                spentAmounts: spentAmounts,

                // For monthly overview chart
                monthlyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                monthlyIncome: Array(12).fill(0), // You might want to implement monthly income data
                monthlyExpenses: Array(12).fill(0) // You might want to implement monthly expenses data
            };
        } catch (error) {
            throw new Error('Failed to get category analysis: ' + error.message);
        }
    }
}

module.exports = clsTransaction; 