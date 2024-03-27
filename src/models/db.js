// models/db.js

const mongoose = require('mongoose');

// Load MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
};

async function connectDB() {
  try {
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    await mongoose.connect(uri, clientOptions);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
