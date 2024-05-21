// routes/studentRoutes.js
const express = require('express');
const router = express.Router();

// Route to render the Add Student page
router.get('/addStudent', (req, res) => {
    res.render('addStudent');
});

// Other student-related routes

module.exports = router;
