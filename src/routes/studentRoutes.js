// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/studentController');

// Define routes
router.get('/', studentController.getAllStudents);

module.exports = router;
