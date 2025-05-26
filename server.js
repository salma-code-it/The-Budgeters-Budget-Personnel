const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./apis-tier/auth');
const budgetRoutes = require('./apis-tier/budget');
const transactionRoutes = require('./apis-tier/transaction');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'presentation-tier')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/transaction', transactionRoutes);

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'presentation-tier', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
    console.log(`Static files served from ${path.join(__dirname, 'presentation-tier')}`);
}); 