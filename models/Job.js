// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
    // Add more fields as needed
});

module.exports = mongoose.model('Job', jobSchema);
