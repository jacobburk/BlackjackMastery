const mongoose = require("mongoose");

const playerStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      label: "User ID",
      unique: true,
    },
    handsPlayed: {
      type: Number,
      required: true,
      default: 0,
      label: "Hands Played",
    },
    handsWon: {
      type: Number,
      required: true,
      default: 0,
      label: "Hands Won",
    },
    bankroll: {
      type: Number,
      required: true,
      default: 1000, 
      label: "Bankroll",
    },
  },
  { collection: "player_stats" }
);

module.exports = mongoose.model("player_stats", playerStatsSchema);
