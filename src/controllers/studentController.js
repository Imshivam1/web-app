// controllers/studentController.js
const Student = require('../src/models/Student');

// Controller functions
// Example: Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
