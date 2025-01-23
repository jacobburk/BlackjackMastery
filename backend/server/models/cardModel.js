const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Card Schema
const cardSchema = new Schema({
  value: {
    type: String,
    required: true,
    enum: [
      '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', // Standard card values
    ],
  },
  suit: {
    type: String,
    required: true,
    enum: ['hearts', 'diamonds', 'clubs', 'spades'], // Card suits
  },
});

// Create and export the Card model
const Card = mongoose.model('Card', cardSchema);
module.exports = Card;
