const express = require('express');
const router = express.Router();
const { placebet } = require('../controller/gameController');

router.post('/game/:gameId/bet', (req, res) => {
    const { gameId } = req.params; // Extract the gameId from the URL parameters
    hit(req, res) // Pass the gameId and request body to the hit controller
      .then(result => res.json(result)) // Send back the result from the controller
      .catch(err => res.status(500).json({ message: err.message })); // Handle errors
  });