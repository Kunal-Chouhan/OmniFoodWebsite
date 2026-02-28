// backend/models/recipe.model.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  calories: { type: Number, required: false }, // <-- Make this 'false'
  tags: [String], // This was already optional, which is good
  ingredients: [String], // This will come from 'Cleaned_Ingredients'
  instructions: { type: String, required: true }
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;