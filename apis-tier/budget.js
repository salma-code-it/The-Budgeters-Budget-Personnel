const express = require('express');
const router = express.Router();
const clsBudget = require('../business-tier/services/clsBudget');
const { asyncHandler } = require('./utils');

// Create new budget
router.post('/', asyncHandler(async (req, res) => {
    const { userId, category, amount, month, year } = req.body;
    const budget = await clsBudget.createBudget(userId, category, amount, month, year);
    res.status(201).json({ success: true, budget });
}));

// Get monthly budgets
router.get('/monthly/:userId/:month/:year', asyncHandler(async (req, res) => {
    const { userId, month, year } = req.params;
    const budgets = await clsBudget.getMonthlyBudgets(userId, month, year);
    res.json(budgets);
}));

// Get budget overview
router.get('/overview/:userId/:month/:year', asyncHandler(async (req, res) => {
    const { userId, month, year } = req.params;
    const overview = await clsBudget.getBudgetOverview(userId, month, year);
    res.json({ success: true, overview });
}));

// Get category breakdown
router.get('/category-breakdown/:userId/:month/:year', asyncHandler(async (req, res) => {
    const { userId, month, year } = req.params;
    const breakdown = await clsBudget.getCategoryBreakdown(userId, month, year);
    res.json(breakdown);
}));

// Update budget
router.put('/:budgetId', asyncHandler(async (req, res) => {
    const { budgetId } = req.params;
    const { amount } = req.body;
    const budget = await clsBudget.updateBudget(budgetId, amount);
    res.json(budget);
}));

// Delete budget
router.delete('/:budgetId', asyncHandler(async (req, res) => {
    const { budgetId } = req.params;
    await clsBudget.deleteBudget(budgetId);
    res.json({ success: true });
}));

module.exports = router; 