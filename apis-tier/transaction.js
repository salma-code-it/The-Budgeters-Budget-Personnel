const express = require('express');
const router = express.Router();
const clsTransaction = require('../business-tier/services/clsTransaction');
const { asyncHandler } = require('./utils');

// Create new transaction
router.post('/', asyncHandler(async (req, res) => {
    const { userId, type, category, amount, description, date } = req.body;
    const transaction = await clsTransaction.createTransaction(
        userId,
        type,
        category,
        amount,
        description,
        date
    );
    res.status(201).json({ success: true, transaction });
}));

// Get transactions with filters
router.get('/', asyncHandler(async (req, res) => {
    const { userId, type, startDate, endDate, category } = req.query;
    const transactions = await clsTransaction.getTransactions(userId, {
        type,
        startDate,
        endDate,
        category
    });
    res.json({ success: true, transactions });
}));

// Get monthly overview
router.get('/monthly/:userId/:month/:year', asyncHandler(async (req, res) => {
    const { userId, month, year } = req.params;
    const overview = await clsTransaction.getMonthlyOverview(userId, month, year);
    res.json({ success: true, overview });
}));

// Get recent transactions
router.get('/recent/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit } = req.query;
    const transactions = await clsTransaction.getRecentTransactions(userId, limit);
    res.json({ success: true, transactions });
}));

// Update transaction
router.put('/:transactionId', asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const data = req.body;
    const transaction = await clsTransaction.updateTransaction(transactionId, data);
    res.json({ success: true, transaction });
}));

// Delete transaction
router.delete('/:transactionId', asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    await clsTransaction.deleteTransaction(transactionId);
    res.json({ success: true });
}));

// Get category analysis
router.get('/category-analysis/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const analysis = await clsTransaction.getCategoryAnalysis(userId, startDate, endDate);
    res.json(analysis);
}));

module.exports = router; 