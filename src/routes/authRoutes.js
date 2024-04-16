// authRoutes.js

const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Load environment variables

// MongoDB connection URI
const uri = process.env.MONGODB_URI; // Use environment variable
const dbName = process.env.DB_NAME; // Use environment variable

// Create a MongoClient instance
const client = new MongoClient(uri);

// Authentication endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Connect the client to the MongoDB server
    await client.connect();

    // Assuming you have a 'users' collection in your MongoDB database
    const usersCollection = client.db(dbName).collection("users");

    // Check if the user exists in the database
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare hashed passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Authentication successful
    res.status(200).json({ message: 'Authentication successful', user });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});

module.exports = router;
