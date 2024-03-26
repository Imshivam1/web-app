// routes/interviewRoutes.js
const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// Define routes
router.get('/', interviewController.getAllInterviews);

module.exports = router;
