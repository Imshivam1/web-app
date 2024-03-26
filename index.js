const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./db'); // Import the database connection
const routes = require('./routes'); // Import central routes file
const models = require('./models'); // Import models

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB();

// Setting up routes with correct paths
app.use('/api', routes); // Use the central routes file

// Access models
console.log(models.Interview); // Example usage

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
