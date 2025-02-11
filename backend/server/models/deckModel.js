
const mongoose = require('mongoose');
const Card = require('./cardModel');  // Import the Card model

const deckSchema = new mongoose.Schema({
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',  // Reference to the Card model
  }],
  shuffled: {
    type: Boolean,
    default: false,  // Flag to indicate if the deck has been shuffled
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;
