const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the GameSession Schema
const gameSessionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  result: {
    type: String,
    enum: ['won', 'lost', 'ongoing'], // Define acceptable game states
    required: true,
  },
  cardsDealt: {
    type: [String], // Array of strings representing cards (e.g., ['2H', 'AS', 'KD'])
    default: [],
  },
  actions: {
    type: [String], // Array of strings for actions taken (e.g., ['hit', 'stand'])
    default: [],
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  bet: {
    type: Number,
    required: true,
    min: 0,
  },
  feedbackMessages: {
    type: [String], // Array of feedback messages
    default: [],
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Create and export the GameSession model
const GameSession = mongoose.model('GameSession', gameSessionSchema);
module.exports = GameSession;