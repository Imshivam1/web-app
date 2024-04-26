// routes/index.js

const express = require('express');
const router = express.Router();

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
