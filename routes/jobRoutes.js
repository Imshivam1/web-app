// routes/jobs.js

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
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

// Fetch and render job list
router.get('/add', isAuthenticated, async (req, res) => {
    try {
        const jobList = await Job.find({});
        res.render('jobList', { job_list: jobList });
    } catch (error) {
        console.error('Error fetching job data:', error);
        res.status(500).send('Error fetching job data: ' + error.message);
    }
});

// Handle form submission to add a new job
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { title, location } = req.body;
        const newJob = new Job({ title, location });
        await newJob.save();
        res.redirect('/jobs/add');
    } catch (error) {
        console.error('Error adding job:', error);
        res.status(500).send('Error adding job: ' + error.message);
    }
});

// Handle form submission to delete a job
router.post('/delete', isAuthenticated, async (req, res) => {
    try {
        if (!req.body.jobId) {
            throw new Error('Job ID is required for deletion.');
        }
        await Job.findByIdAndDelete(req.body.jobId);
        res.redirect('/jobs/add');
    } catch (err) {
        console.error('Error in deleting job: ', err);
        res.status(500).send('Error in deleting job: ' + err.message);
    }
});

module.exports = router;
