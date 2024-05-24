// routes/index.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');


// Home route (accessible to everyone)
router.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

// Protected route example
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// Another protected route
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { title: 'Profile', user: req.user });
});

// Require route handlers for each resource
const authRoutes = require('./authRoutes');
const interviewRoutes = require('./interviewRoutes');
const jobRoutes = require('./jobRoutes');
const studentRoutes = require('./studentRoutes');

// Register routes for each resource
router.use('/auth', authRoutes);
router.use('/interviews', interviewRoutes);
router.use('/jobs', jobRoutes);
router.use('/students', studentRoutes);

module.exports = router;
