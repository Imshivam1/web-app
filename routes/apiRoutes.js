const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Route to fetch student data
router.get('/students', async (req, res) => {
    try {
        const studentList = await Student.find({});
        res.json(studentList);
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ error: 'Error fetching student data' });
    }
});

module.exports = router;
