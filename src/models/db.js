// db.js

const mongoose = require('mongoose');
require('dotenv').config();

console.log('Loaded .env file'); // Added for verification

async function connectDB() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

// Log all environment variables for debugging
console.log('Environment variables:', process.env);

module.exports = connectDB;
