const express = require('express');
const router = express.Router();
const { createGame, hit, stand, getRunningCount, startNewHand, endGameSession, remainingCards, split, doubleDown } = require('../controller/gameController');

// Route to create a game
router.post('/game', createGame);  

// Route to hit
router.post('/game/:gameId/hit', hit); 

// Route to stand
router.post('/game/:gameId/stand', stand); 

// Route to get running count
router.get('/game/:gameId/running-count', getRunningCount);

router.post('/game/:gameId/new-hand', startNewHand);

router.post('/game/:gameId/end-session', endGameSession)

router.get('/game/:gameId/remaining-cards', remainingCards)

router.post('/game/:gameId/split', split);

router.post('/game/:gameId/double-down', doubleDown);
module.exports = router;
