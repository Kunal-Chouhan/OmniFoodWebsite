// server.js
// Import your User model
const User = require('./models/user.model');
const Recipe = require('./models/recipe.model'); // <-- ADD THIS LINE


console.log("--- SERVER IS STARTING - NEWEST VERSION ---"); // <-- ADD THIS LINE
// ... rest of your file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load variables from .env file

// Import your User model

// --- SETUP ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors()); // Allow requests from other origins (your frontend)
app.use(express.json()); // Allow the server to read incoming JSON data

// --- DATABASE CONNECTION ---
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
// This is the NEW line
  .then(() => console.log('VERSION 5: Connected to MongoDB!'))
  .catch(err => console.error('Database connection error:', err));


// --- API ENDPOINTS ---

/**
 * API Endpoint #1: Handle the "Sign-up-now" form submission
 */
app.post('/signup', async (req, res) => {
  try {
    const { fullName, email, heardFrom } = req.body;

    // Basic validation
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already signed up.' });
    }

    // Create a new user document
    const newUser = new User({
      fullName: fullName,
      email: email,
      heardFrom: heardFrom
    });

    // Save the new user to the database
    await newUser.save();

    // Send a success response
    res.status(201).json({ message: 'User signed up successfully!' });

  } catch (error) {
  console.error('Signup error:', error);
  res.status(500).json({ message: error.message }); // <-- CHANGE TO THIS
}
});


/**
 * API Endpoint #2: The AGGREGATION Command
 * This endpoint counts how many users signed up from each source.
 */
app.get('/stats', async (req, res) => {
  try {
    const signupStats = await User.aggregate([
      {
        $group: {
          _id: '$heardFrom', // Group documents by the 'heardFrom' field
          count: { $sum: 1 } // Count how many documents are in each group
        }
      },
      {
        $sort: { count: -1 } // Optional: Sort from most common to least
      }
    ]);

    res.status(200).json(signupStats);

  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({ message: error.message }); 
   }
});


// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//new agregation




/**
 * API Endpoint #3: GET ALL RECIPES (with DYNAMIC filtering)
 * This is the new "user ask" feature.
 * Examples:
 * - /api/recipes?tag=vegan
 * - /api/recipes?maxCalories=500
 * - /api/recipes?tag=vegan&maxCalories=450
 * - /api/recipes?ingredient=avocado
 * - /api/recipes?title=curry
 */
app.get('/api/recipes', async (req, res) => {
  try {
    const query = {};

    // 1. Filter by Tag
    if (req.query.tag) {
      // Find recipes where the 'tags' array contains the provided tag
      query.tags = req.query.tag;
    }

    // 2. Filter by Max Calories (Less than or equal)
    if (req.query.maxCalories) {
      // Mongoose query for "less than or equal" ($lte)
      query.calories = { $lte: Number(req.query.maxCalories) };
    }

    // 3. Filter by Ingredient
    if (req.query.ingredient) {
      // Find recipes where the 'ingredients' array contains the provided ingredient
      query.ingredients = req.query.ingredient;
    }

    // 4. Filter by Title (partial, case-insensitive search)
    if (req.query.title) {
      // 'i' makes it case-insensitive
      query.title = { $regex: req.query.title, $options: 'i' };
    }

    // Log the query to the terminal to see what you're searching for
    console.log('Executing recipe search with query:', query);

    const recipes = await Recipe.find(query);

    res.status(200).json(recipes);

  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({ message: error.message });
  }
});
