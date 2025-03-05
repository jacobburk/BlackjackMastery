const express = require('express');
const router = express.Router();
const { createGame, hit, stand } = require('../controller/gameController');

// Routes
router.post('/game', createGame); // Create a game
// Hit: Perform a hit action on a game

router.post('/game/:gameId/hit', (req, res) => {
    const { gameId } = req.params; // Extract the gameId from the URL parameters
    hit(req, res) // Pass the gameId and request body to the hit controller
      .then(result => res.json(result)) // Send back the result from the controller
      .catch(err => res.status(500).json({ message: err.message })); // Handle errors
  });
  
  // Stand: Perform a stand action on a game
  router.post('/game/:gameId/stand', (req, res) => {
    const { gameId } = req.params; // Extract the gameId from the URL parameters
    stand(req, res) // Pass the gameId to the stand controller
      .then(result => res.json(result)) // Send back the result from the controller
      .catch(err => res.status(500).json({ message: err.message })); // Handle errors
  });
  
  module.exports = router;
