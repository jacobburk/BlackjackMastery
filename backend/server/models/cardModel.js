const mongoose = require('mongoose');

// Define the card schema
const cardSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    enum: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
  },
  suit: {
    type: String,
    required: true,
    enum: ['C', 'D', 'C', 'S'],
  },
});

// Create the Card model
const Card = mongoose.model('Card', cardSchema);

// Export the model
module.exports = Card;
