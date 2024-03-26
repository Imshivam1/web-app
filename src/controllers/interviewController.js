// controllers/interviewController.js
const Interview = require('../src/models/Interview');

// Controller functions
// Example: Get all interviews
exports.getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find();
        res.json(interviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
