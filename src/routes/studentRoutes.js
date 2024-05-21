const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/student');

const router = express.Router();

// Route to add a new student
router.post('/add', [
    body('name').notEmpty().withMessage('Name is required'),
    body('college').notEmpty().withMessage('College is required'),
    body('status').isIn(['Placed', 'Not Placed']).withMessage('Invalid status'),
    body('batch').isInt({ min: 1980, max: new Date().getFullYear() }).withMessage('Invalid batch year'),
    body('dsaScore').isInt({ min: 0, max: 100 }).withMessage('Invalid DSA score'),
    body('webDScore').isInt({ min: 0, max: 100 }).withMessage('Invalid WebD score'),
    body('reactScore').isInt({ min: 0, max: 100 }).withMessage('Invalid React score')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, college, status, batch, dsaScore, webDScore, reactScore } = req.body;

        const newStudent = new Student({
            name,
            college,
            status,
            batch,
            courseScores: {
                dsaScore,
                webDScore,
                reactScore
            }
        });

        await newStudent.save();
        res.redirect('/students');
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send('Error adding student: ' + error.message);
    }
});

// Route to add a new interview to a student
router.post('/interview/add', [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('company').notEmpty().withMessage('Company name is required'),
    body('date').isISO8601().withMessage('Invalid date'),
    body('result').isIn(['PASS', 'FAIL', 'On Hold', 'Didn’t Attempt']).withMessage('Invalid result')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { studentId, company, date, result } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).send('Student not found');
        }

        student.interviews.push({ company, date, result });
        await student.save();

        res.redirect('/students');
    } catch (error) {
        console.error('Error adding interview:', error);
        res.status(500).send('Error adding interview: ' + error.message);
    }
});

// Route to delete a student
router.post('/delete', async (req, res) => {
    try {
        const { studentId } = req.body;
        if (!studentId) throw new Error('Student ID is required for deletion.');
        await Student.findByIdAndDelete(studentId);
        res.redirect('/students');
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).send('Error deleting student: ' + error.message);
    }
});

module.exports = router;
