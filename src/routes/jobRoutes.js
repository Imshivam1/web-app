// routes/jobs.js

const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Route to render edit job form
router.get('/edit/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        res.render('editJob', { job });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).send('Error fetching job: ' + error.message);
    }
});

// Route to handle job update
router.post('/edit/:id', async (req, res) => {
    try {
        const { title, location } = req.body;
        await Job.findByIdAndUpdate(req.params.id, { title, location });
        res.redirect('/jobs'); // Redirect to job list after editing
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).send('Error updating job: ' + error.message);
    }
});

// Route to handle job deletion
router.post('/delete/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.redirect('/jobs'); // Redirect to job list after deletion
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).send('Error deleting job: ' + error.message);
    }
});

module.exports = router;
