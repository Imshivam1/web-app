const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./models/db');
const routes = require('./routes');
const Interview = require('./models/Interview');
const Student = require('./models/student');
const Job = require('./models/Job');
const jobRoutes = require('./routes/jobRoutes');
const studentRoutes = require('./routes/studentRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to database
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api', routes);
app.use('/jobs', jobRoutes);
app.use('/students', studentRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

// Interview routes
app.get('/interviews/add', (req, res) => {
    res.render('addInterview');
});

// Student routes
app.get('/students/add', (req, res) => {
    res.render('addStudent');
});

// Fetch and render job list
app.get('/jobs/add', async (req, res) => {
    try {
        const jobList = await Job.find({});
        res.render('jobList', { job_list: jobList });
    } catch (error) {
        console.error('Error fetching job data:', error);
        res.status(500).send('Error fetching job data: ' + error.message);
    }
});

// Fetch and render student list
app.get('/students', async (req, res) => {
    try {
        const studentList = await Student.find({});
        res.render('studentList', { student_list: studentList });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).send('Error fetching student data: ' + error.message);
    }
});

// Fetch and render interview list
app.get('/interviews', async (req, res) => {
    try {
        const interviewList = await Interview.find({});
        res.render('interviewList', { interview_list: interviewList });
    } catch (error) {
        console.error('Error fetching interview data:', error);
        res.status(500).send('Error fetching interview data: ' + error.message);
    }
});

// Add new interview
app.post('/interviews/add', async (req, res) => {
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

// Add new student
app.post('/students/add', async (req, res) => {
    try {
        const { name, college, status, batch } = req.body;
        const newStudent = new Student({ name, college, status, batch });
        await newStudent.save();
        res.redirect('/students');
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send('Error adding student: ' + error.message);
    }
});

// Handle form submission to add a new job
app.post('/jobs/add', async (req, res) => {
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
app.post('/jobs/delete', async (req, res) => {
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

// Handle form submission to delete an interview
app.post('/interviews/delete', async (req, res) => {
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

// Handle form submission to delete a student
app.post('/students/delete', async (req, res) => {
    try {
        if (!req.body.studentId) {
            throw new Error('Student ID is required for deletion.');
        }
        await Student.findByIdAndDelete(req.body.studentId);
        res.redirect('/students');
    } catch (err) {
        console.error('Error in deleting student: ', err);
        res.status(500).send('Error in deleting student: ' + err.message);
    }
});

// Error handling middleware
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

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
