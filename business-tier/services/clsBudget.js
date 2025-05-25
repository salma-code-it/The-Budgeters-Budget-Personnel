const clsBudgetDataAccess = require('../../data-tier/models/clsBudgetDataAccess');
const clsTransactionDataAccess = require('../../data-tier/models/clsTransactionDataAccess');

class clsBudget {
    static async createBudget(userId, category, amount, month, year) {
        try {
            // Validate input
            if (!category || amount <= 0 || !month || !year) {
                throw new Error('Invalid budget data');
            }

            // Check if budget already exists for this category and month
            const existingBudgets = await clsBudgetDataAccess.getByMonth(userId, month, year);
            const existingBudget = existingBudgets.find(b => b.category === category);
            
            if (existingBudget) {
                // Update existing budget
                await clsBudgetDataAccess.update(existingBudget.budget_id, amount);
                return { ...existingBudget, amount };
            }

            // Create new budget
            const budgetId = await clsBudgetDataAccess.create(userId, category, amount, month, year);
            return { budget_id: budgetId, userId: userId, category, amount, month, year };
        } catch (error) {
            throw new Error('Failed to create budget: ' + error.message);
        }
    }

    static async getMonthlyBudgets(userId, month, year) {
        try {
            const budgets = await clsBudgetDataAccess.getByMonth(userId, month, year);
            const expenses = await clsTransactionDataAccess.getByDateRange(
                userId,
                `${year}-${month}-01`,
                `${year}-${month}-31`,
                'expense'
            );

            // Calculate spent amount for each budget category
            const budgetsWithSpent = budgets.map(budget => {
                const categoryExpenses = expenses.filter(e => e.category === budget.category);
                const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                return {
                    ...budget,
                    spent,
                    remaining: budget.amount - spent
                };
            });

            return budgetsWithSpent;
        } catch (error) {
            throw new Error('Failed to get monthly budgets: ' + error.message);
        }
    }

    static async getBudgetOverview(userId, month, year) {
        try {
            const totalBudget = await clsBudgetDataAccess.getTotalBudget(userId, month, year);
            const totalExpenses = await clsTransactionDataAccess.getTotalByType(
                userId,
                'expense',
                `${year}-${month}-01`,
                `${year}-${month}-31`
            );
            const totalIncome = await clsTransactionDataAccess.getTotalByType(
                userId,
                'income',
                `${year}-${month}-01`,
                `${year}-${month}-31`
            );

            return {
                totalBudget,
                totalExpenses,
                totalIncome,
                balance: totalIncome - totalExpenses
            };
        } catch (error) {
            throw new Error('Failed to get budget overview: ' + error.message);
        }
    }

    static async getCategoryBreakdown(userId, month, year) {
        try {
            const expenses = await clsTransactionDataAccess.getCategoryTotals(
                userId,
                'expense',
                `${year}-${month}-01`,
                `${year}-${month}-31`
            );

            return expenses;
        } catch (error) {
            throw new Error('Failed to get category breakdown: ' + error.message);
        }
    }

    static async updateBudget(budgetId, amount) {
        // Note: This function updates a specific budget by ID.
        // For simplicity, we won't add user check here.
        try {
            if (amount <= 0) {
                throw new Error('Invalid amount');
            }

            const success = await clsBudgetDataAccess.update(budgetId, amount);
            if (!success) {
                throw new Error('Budget not found');
            }

            return { budget_id: budgetId, amount };
        } catch (error) {
            throw new Error('Failed to update budget: ' + error.message);
        }
    }

    static async deleteBudget(budgetId) {
        // Note: This function deletes a specific budget by ID.
        // For simplicity, we won't add user check here.
        try {
            const success = await clsBudgetDataAccess.delete(budgetId);
            if (!success) {
                throw new Error('Budget not found');
            }

            return { success: true };
        } catch (error) {
            throw new Error('Failed to delete budget: ' + error.message);
        }
    }
}

module.exports = clsBudget; 