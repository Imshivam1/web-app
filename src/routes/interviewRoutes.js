const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Student = require('../models/student');

// Middleware for authentication
const { isAuthenticated } = require('../middleware/auth');

// GET route to render the form for adding a new interview
router.get('/add', isAuthenticated, (req, res) => {
    res.render('addInterview');
});

// GET route to fetch and render the list of interviews
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const interviewList = await Interview.find({});
        res.render('interviewList', { interview_list: interviewList });
    } catch (error) {
        console.error('Error fetching interview data:', error);
        res.status(500).send('Error fetching interview data: ' + error.message);
    }
});

// GET route to fetch and render interview details including allocated students
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('allocatedStudents.student')
            .exec();
        const students = await Student.find({}); // Fetch all students

        if (!interview) {
            return res.status(404).send('Interview not found');
        }

        res.render('viewInterview', { interview, students });
    } catch (error) {
        console.error('Error fetching interview details:', error);
        res.status(500).send('Error fetching interview details: ' + error.message);
    }
});

// POST route to add a new interview
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { company, date } = req.body;
        const newInterview = new Interview({ company, date });
        await newInterview.save();
        res.redirect('/interviews');
    } catch (error) {
        console.error('Error adding interview:', error);
        res.status(500).send('Error adding interview: ' + error.message);
    }
});

// Other interview-related routes can be added similarly
// Handle form submission to delete an interview
router.post('/delete', isAuthenticated, async (req, res) => {
    try {
        if (!req.body.interviewId) {
            throw new Error('Interview ID is required for deletion.');
        }
        await Interview.findByIdAndDelete(req.body.interviewId);
        res.redirect('/interviews');
    } catch (err) {
        console.error('Error in deleting interview: ', err);
        res.status(500).send('Error in deleting interview: ' + err.message);
    }
});

// Handle form submission to allocate a student to an interview
router.post('/allocate', isAuthenticated, async (req, res) => {
    try {
        const { interviewId, studentId } = req.body;

        // Find the interview
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            throw new Error('Interview not found');
        }

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        // Add the student to the interview's allocated students
        interview.allocatedStudents.push({ student: student._id });
        await interview.save();

        // Redirect back to the interview details page
        res.redirect(`/interviews/${interviewId}`);
    } catch (error) {
        console.error('Error in allocating student:', error);
        res.status(500).send('Error in allocating student: ' + error.message);
    }
});

// Handle form submission to mark student result for an interview
router.post('/mark-result', isAuthenticated, async (req, res) => {
    try {
        const { interviewId, studentId, result } = req.body;
        const interview = await Interview.findById(interviewId);
        const student = await Student.findById(studentId);

        if (!interview || !student) {
            return res.status(404).json({ message: 'Interview or Student not found' });
        }

        interview.allocatedStudents.forEach(allocation => {
            if (allocation.student.equals(studentId)) {
                allocation.result = result;
            }
        });

        await interview.save();

        res.redirect(`/interviews/${interviewId}`);
    } catch (err) {
        console.error('Error in marking result: ', err);
        res.status(500).send('Error in marking result: ' + err.message);
    }
});

module.exports = router;
