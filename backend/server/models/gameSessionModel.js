const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardsDealt: [{ suit: String, value: String }], 
  dealerCards: [{ suit: String, value: String }],
  deck: [{ suit: String, value: String }],  // 🔹 Stores the remaining deck
  score: { type: Number, default: 0 },
  dealerScore: { type: Number, default: 0 }, 
  result: { type: String, enum: ['ongoing', 'won', 'lost', 'draw', 'ended'], default: 'ongoing' },  // 🔹 Added 'ended'
  actions: [{ type: String }],
  bet: { type: Number, required: true },
  runningCount: { type: Number, default: 0 },  // 🔹 Default value prevents errors
}, { timestamps: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);
