const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    result: {
        type: String,
        enum: ['PASS', 'FAIL', 'On Hold', 'Didn’t Attempt'],
        default: 'Didn’t Attempt'
    }
});

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Placed', 'Not Placed'],
        default: 'Not Placed'
    },
    batch: {
        type: Number,
        required: true
    },
    courseScores: {
        type: {
            dsaScore: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            webDScore: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            reactScore: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            }
        },
        required: true
    },
    interviews: [interviewSchema]
});

module.exports = mongoose.model('Student', studentSchema);
