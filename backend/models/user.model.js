// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  heardFrom: { type: String } // This field is for your dropdown
}, {
  timestamps: true // Adds 'createdAt' and 'updatedAt' fields
});

const User = mongoose.model('User', userSchema);
module.exports = User;