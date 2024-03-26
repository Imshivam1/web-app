// models/db.js

const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI; // Load MongoDB URI from environment variables

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
};

async function connectDB() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
