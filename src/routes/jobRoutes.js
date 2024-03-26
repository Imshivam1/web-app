// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Define routes
router.get('/', jobController.getAllJobs);

module.exports = router;
