// controllers/jobController.js
const Job = require('../models/Job');

// Controller functions
// Example: Get all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
