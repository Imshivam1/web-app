// authRoutes.js

const express = require('express');
const router = express.Router();
const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb+srv://imshivam1:<imshivam1>@imshivam1.7ojg8if.mongodb.net/?retryWrites=true&w=majority&appName=imshivam1";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Authentication endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Connect the client to the MongoDB server
    await client.connect();

    // Assuming you have a 'users' collection in your MongoDB database
    const usersCollection = client.db("imshivam1").collection("users");

    // Check if the user exists in the database
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
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
