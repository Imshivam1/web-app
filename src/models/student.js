const mongoose = require('mongoose');

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
    }
});

module.exports = mongoose.model('Student', studentSchema);
