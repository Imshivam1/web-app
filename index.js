// Importing required modules
const express = require('express'); // Importing Express.js
const mongoose = require('mongoose'); // Importing Mongoose for MongoDB interaction
const path = require('path'); // Importing Path module

// Importing route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const jobRoutes = require('./routes/jobRoutes');

// Initializing Express app
const app = express();

// Setting up middleware
app.use(express.json()); // Parsing JSON requests
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded requests
app.use(express.static(path.join(__dirname, 'public'))); // Serving static files from the 'public' directory

// Connecting to MongoDB database
mongoose.connect('mongodb://localhost:27017/career_camp_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/jobs', jobRoutes);

// Handling 404 errors
app.use(function(req, res, next) {
    res.status(404).send("Sorry, can't find that!");
});

// Handling other errors
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
