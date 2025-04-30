const express = require("express");
const router = express.Router();
const PlayerStats = require("../models/statsModel");

// GET stats by userId
router.get("/:userId/view", async (req, res) => {
  try {
    let stats = await PlayerStats.findOne({ userId: req.params.userId });

    // If not found, create a new one
    if (!stats) {
      stats = new PlayerStats({
        userId: req.params.userId,
        handsPlayed: 0,
        handsWon: 0,
        bankroll: 1000, // Default bankroll value
      });
      await stats.save();
    }

    res.status(200).json({
      userId: stats.userId,
      handsPlayed: stats.handsPlayed,
      handsWon: stats.handsWon,
      bankroll: stats.bankroll, // Include bankroll in the response
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Update handsPlayed
router.post("/:userId/updateHandsPlayed", async (req, res) => {
  try {
    // Find the stats by userId (using the URL param)
    let stats = await PlayerStats.findOne({ userId: req.params.userId });

    // Increment hands played
    stats.handsPlayed += 1;

    // Save the updated stats to the database
    await stats.save();

    // Return the updated stats
    res.status(200).json({
      message: "Hands played updated successfully.",
      stats: {
        userId: stats.userId,
        handsPlayed: stats.handsPlayed,
        handsWon: stats.handsWon,
        bankroll: stats.bankroll, // Include bankroll in the response
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Update handsWon
router.post("/:userId/updateHandsWon", async (req, res) => {
  try {
    // Find the stats by userId (using the URL param)
    let stats = await PlayerStats.findOne({ userId: req.params.userId });

    // Increment hands won
    stats.handsWon += 1;

    // Save the updated stats to the database
    await stats.save();

    // Return the updated stats
    res.status(200).json({
      message: "Hands won updated successfully.",
      stats: {
        userId: stats.userId,
        handsPlayed: stats.handsPlayed,
        handsWon: stats.handsWon,
        bankroll: stats.bankroll, // Include bankroll in the response
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Update bankroll (for example, after a game session outcome)
router.post("/:userId/updateBankroll", async (req, res) => {
  try {
    const { amount } = req.body; // Amount to be added or subtracted from bankroll
    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Find the stats by userId (using the URL param)
    let stats = await PlayerStats.findOne({ userId: req.params.userId });

    if (!stats) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Update bankroll (add/subtract depending on amount)
    stats.bankroll += amount;

    // Save the updated stats to the database
    await stats.save();

    // Return the updated stats
    res.status(200).json({
      message: "Bankroll updated successfully.",
      stats: {
        userId: stats.userId,
        handsPlayed: stats.handsPlayed,
        handsWon: stats.handsWon,
        bankroll: stats.bankroll, // Include updated bankroll in the response
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get bankroll
router.get("/:userId/getBankroll", async (req, res) => {
  try {
    // Find the stats by userId (using the URL param)
    let stats = await PlayerStats.findOne({ userId: req.params.userId });

    if (!stats) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.status(200).json({
      userId: stats.userId,
      bankroll: stats.bankroll, // Return the player's bankroll
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
