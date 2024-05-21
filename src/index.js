const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./models/db');
const routes = require('./routes');
const Interview = require('./models/Interview'); // Import Interview model
const Student = require('./models/student');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/api', routes);

app.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

app.get('/interviews/add', (req, res) => {
    res.render('addInterview');
});

app.get('/students/add', (req, res) => {
    res.render('addStudent');
});

// Example route handler to render jobList.ejs
app.get('/jobs/add', (req, res) => {
    // Assuming job_list is retrieved from the database or some other data source
    const job_list = [
        { title: 'Software Developer', location: 'Gurgaon' },
        { title: 'Web Developer', location: 'Noida' },
        // Add more job objects as needed
    ];

    // Render jobList.ejs and pass job_list as data
    res.render('jobList', { job_list });
});

app.get('/students', async (req, res) => {
    try {
        // Fetch student data from the database
        const studentList = await Student.find({});

        // Render the viewStudents.ejs template and pass studentList as data
        res.render('studentList', { student_list: studentList });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).send('Error fetching student data: ' + error.message);
    }
});

// Fetch interview data from the database and render interviewList.ejs
app.get('/interviews', async (req, res) => {
    try {
        const interviewList = await Interview.find({});
        res.render('interviewList', { interview_list: interviewList });
    } catch (error) {
        console.error('Error fetching interview data:', error);
        res.status(500).send('Error fetching interview data: ' + error.message);
    }
});

app.post('/interviews/add', async (req, res) => {
    try {
        // Extract data from request body
        const { company, date } = req.body;

        // Create a new interview instance
        const newInterview = new Interview({
            company,
            date
        });

        // Save the new interview to the database
        await newInterview.save();

        // Redirect to the interviews page after adding the interview
        res.redirect('/interviews');
    } catch (error) {
        console.error('Error adding interview:', error);
        res.status(500).send('Error adding interview: ' + error.message);
    }
});

app.post('/students/add', async (req, res) => {
    try {
        // Extract data from request body
        const { name, college, status } = req.body;

        // Create a new student instance
        const newStudent = new Student({
            name,
            college,
            status
        });

        // Save the new student to the database
        await newStudent.save();

        // Redirect to the students page after adding the student
        res.redirect('/students');
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send('Error adding student: ' + error.message);
    }
});

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
