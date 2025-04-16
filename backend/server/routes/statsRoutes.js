const express = require("express");
const router = express.Router();
const PlayerStats = require("../models/statsModel");

// GET stats by userId
router.get("/:userId/view", async (req, res) => {
  try {
    const stats = await PlayerStats.findOne({ userId: req.params.userId });

    if (!stats) {
      return res.status(404).json({ message: "Stats not found for this user." });
    }

    const winRate = stats.handsPlayed === 0 ? 0 : stats.handsWon / stats.handsPlayed;

    res.status(200).json({
      userId: stats.userId,
      handsPlayed: stats.handsPlayed,
      handsWon: stats.handsWon,
      winRate: parseFloat(winRate.toFixed(4)),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST update stats (record a hand)
router.post("/:userId/update", async (req, res) => {
  const { userId, won } = req.body;

  if (typeof userId !== "string" || typeof won !== "boolean") {
    return res.status(400).json({ message: "Invalid input data." });
  }

  try {
    let stats = await PlayerStats.findOne({ userId });

    if (!stats) {
      stats = new PlayerStats({ userId, handsPlayed: 0, handsWon: 0 });
    }

    stats.handsPlayed += 1;
    if (won) stats.handsWon += 1;

    await stats.save();

    const winRate = stats.handsPlayed === 0 ? 0 : stats.handsWon / stats.handsPlayed;

    res.status(200).json({
      message: "Stats updated successfully.",
      stats: {
        userId: stats.userId,
        handsPlayed: stats.handsPlayed,
        handsWon: stats.handsWon,
        winRate: parseFloat(winRate.toFixed(4)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
