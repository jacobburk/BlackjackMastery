const express = require('express');
const router = express.Router();
const { createGame, hit, stand } = require('../controller/gameController');

// Routes
router.post('/game', createGame); // Create a game
router.post('/game/:gameId/hit', hit); // Hit
router.post('/game/:gameId/stand', stand); // Stand

module.exports = router;
