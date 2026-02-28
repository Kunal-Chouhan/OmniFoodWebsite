// backend/seeder.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const csv = require('csv-parser');
require('dotenv').config();

const Recipe = require('./models/recipe.model');

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB!');

    console.log('Deleting old recipes...');
    await Recipe.deleteMany({});
    console.log('Old recipes deleted.');

    const recipesToInsert = [];
    const filePath = path.join(__dirname, 'recipes.csv');
    let skippedRows = 0;

    console.log('Starting to read recipes.csv...');

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        
        // --- THIS IS THE FIX ---
        // We check if the row has the required data before adding it
        if (row.Title && row.Instructions && row.Instructions.length > 0 && row.Cleaned_Ingredients) {
          
          const newRecipe = {
            title: row.Title,
            instructions: row.Instructions,
            // Use eval() to parse the string-array
            ingredients: eval(row.Cleaned_Ingredients) 
          };
          
          recipesToInsert.push(newRecipe);
        } else {
          // Count how many recipes we skip due to missing data
          skippedRows++;
        }
        // ---------------------

      })
      .on('end', async () => {
        console.log(`Finished reading CSV file. Found ${recipesToInsert.length} valid recipes.`);
        console.log(`Skipped ${skippedRows} rows due to missing data.`);

        try {
          console.log('Inserting all valid recipes into the database...');
          await Recipe.insertMany(recipesToInsert);
          console.log('Database seeded successfully! 🌱');
        } catch (insertError) {
          console.error('Error inserting recipes:', insertError);
        } finally {
          mongoose.connection.close();
          console.log('Database connection closed.');
        }
      });

  } catch (error) {
    console.error('Error connecting to database:', error);
  }
};

seedDatabase(); 