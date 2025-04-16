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

    res.status(200).json({
      userId: stats.userId,
      handsPlayed: stats.handsPlayed,
      handsWon: stats.handsWon,
      
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


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
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });

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
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });
    

module.exports = router;
