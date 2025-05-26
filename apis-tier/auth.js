const express = require('express');
const router = express.Router();
const clsAuth = require('../business-tier/services/clsAuth');
const { asyncHandler } = require('./utils');

// Register endpoint
router.post('/register', asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const user = await clsAuth.register(username, email, password);
    res.status(201).json({ 
        success: true, 
        user: { 
            user_id: user.userId, 
            username: user.username, 
            email: user.email 
        } 
    });
}));

// Login endpoint
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await clsAuth.login(email, password);
    res.json({ 
        success: true, 
        user: { 
            user_id: user.user_id, 
            username: user.username, 
            email: user.email 
        } 
    });
}));

// Simple login endpoint (for testing)
router.post('/simple-login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await clsAuth.simpleLogin(email, password);
    res.json({ 
        success: true, 
        user: { 
            user_id: user.user_id, 
            username: user.username, 
            email: user.email 
        } 
    });
}));

// Get user profile endpoint
router.get('/profile/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await clsAuth.getUserProfile(userId);
    res.json({ 
        success: true, 
        user: { 
            user_id: user.user_id, 
            username: user.username, 
            email: user.email 
        } 
    });
}));

module.exports = router; 