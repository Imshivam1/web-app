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
const authRoutes = require('./routes/authRoutes'); 
const interviewRoutes = require('./routes/interviewRoutes');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const passportConfig = require('./config/passportConfig');
const { isAuthenticated } = require('./middleware/auth');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Configure Passport
passportConfig(passport);

// Connect to database
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api', routes);
app.use('/jobs', isAuthenticated, jobRoutes);
app.use('/students', isAuthenticated, studentRoutes);
app.use('/', authRoutes);
app.use('/interviews', isAuthenticated, interviewRoutes);

// Magic login routes
app.post("/auth/magiclogin", passport.authenticate('magiclogin', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get("/auth/magiclogin/callback", passport.authenticate('magiclogin', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

// Render the magic login page
app.get('/magiclogin', (req, res) => {
    res.render('magicLogin', { title: 'Magic Login' });
});

// Route for initiating Google OAuth authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route for handling Google OAuth callback
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});


// Home route
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});


// Interview routes
app.get('/interviews/add', isAuthenticated, (req, res) => {
    res.render('addInterview');
});

// Student routes
app.get('/students/add', isAuthenticated, (req, res) => {
    res.render('addStudent');
});


// Fetch and render job list
app.get('/jobs/add', isAuthenticated, async (req, res) => {
    try {
        const jobList = await Job.find({});
        res.render('jobList', { job_list: jobList });
    } catch (error) {
        console.error('Error fetching job data:', error);
        res.status(500).send('Error fetching job data: ' + error.message);
    }
});

// Fetch and render student list
app.get('/students', isAuthenticated, async (req, res) => {
    try {
        const studentList = await Student.find({});
        res.render('studentList', { student_list: studentList });
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).send('Error fetching student data: ' + error.message);
    }
});

// Fetch and render interview list
app.get('/interviews', isAuthenticated, async (req, res) => {
    try {
        const interviewList = await Interview.find({});
        res.render('interviewList', { interview_list: interviewList });
    } catch (error) {
        console.error('Error fetching interview data:', error);
        res.status(500).send('Error fetching interview data: ' + error.message);
    }
});

// Fetch and render interview details including allocated students
app.get('/interviews/:id', isAuthenticated, async (req, res) => {
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

// Add new interview
app.post('/interviews/add', isAuthenticated, async (req, res) => {
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
app.post('/students/add', isAuthenticated, async (req, res) => {
    try {
        const { name, college, status, batch, courseScores } = req.body;
        const newStudent = new Student({ name, college, status, batch, courseScores });
        await newStudent.save();
        res.redirect('/students');
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send('Error adding student: ' + error.message);
    }
});

// Handle form submission to add a new job
app.post('/jobs/add', isAuthenticated, async (req, res) => {
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
app.post('/jobs/delete', isAuthenticated, async (req, res) => {
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
app.post('/interviews/delete', isAuthenticated, async (req, res) => {
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
app.post('/students/delete', isAuthenticated, async (req, res) => {
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

// Handle form submission to allocate a student to an interview
app.post('/interviews/allocate', isAuthenticated, async (req, res) => {
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
app.post('/interviews/mark-result', isAuthenticated, async (req, res) => {
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

// Logout route
app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
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