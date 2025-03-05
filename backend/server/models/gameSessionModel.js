const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardsDealt: [{ suit: String, value: String }], 
  dealerCards: [{ suit: String, value: String }],
  score: { type: Number, default: 0 },
  dealerScore: { type: Number, default: 0 }, 
  result: { type: String, enum: ['ongoing', 'won', 'lost', 'draw'], default: 'ongoing' },
  actions: [{ type: String }],
  bet: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);
