const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes'); // Updated path
const studentRoutes = require('./studentRoutes'); // Updated path
const interviewRoutes = require('./interviewRoutes'); // Updated path
const jobRoutes = require('./jobRoutes'); // Updated path

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/interviews', interviewRoutes);
router.use('/jobs', jobRoutes);

module.exports = router;
