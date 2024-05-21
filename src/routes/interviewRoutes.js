// routes/interviewRoutes.js
const express = require('express');
const router = express.Router();

// Route to render the Add Interview page
router.get('/addInterview', (req, res) => {
    res.render('addInterview');
});

// Other interview-related routes

module.exports = router;
