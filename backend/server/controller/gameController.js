const GameSession = require('../models/gameSessionModel');
const Card = require('../models/cardModel');
const User = require('../models/userModel');

const createShuffledDeck = () => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = [];

  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({ suit, value });
    });
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

const calculateScore = (cards) => {
  let score = 0, aces = 0;

  cards.forEach((card) => {
    if (!card || !card.value) return;
    if (['J', 'Q', 'K'].includes(card.value)) score += 10;
    else if (card.value === 'A') aces++;
    else score += parseInt(card.value, 10);
  });

  while (aces > 0) score += (score + 11 <= 21) ? 11 : 1, aces--;

  return score;
};

const updateRunningCount = (gameSession, drawnCards) => {
  drawnCards.forEach((card) => {
    if (['2', '3', '4', '5', '6'].includes(card.value)) gameSession.runningCount++;
    else if (['10', 'J', 'Q', 'K', 'A'].includes(card.value)) gameSession.runningCount--;
  });
};

// Create new game
const createGame = async (req, res) => {
  try {
    const { userId, bet } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (bet <= 0) return res.status(400).json({ error: 'Bet must be positive' });

    // Create a shuffled deck for the new game session
    const deck = createShuffledDeck();
    const playerCards = [deck.pop(), deck.pop()];
    const dealerCards = [deck.pop(), { ...deck.pop(), hidden: true }];

    // Create a new game session with the shuffled deck
    const gameSession = new GameSession({
      userId,
      result: 'ongoing',
      cardsDealt: playerCards,
      dealerCards,
      score: calculateScore(playerCards),
      dealerScore: calculateScore([dealerCards[0]]),
      bet,
      actions: [],
      runningCount: 0, // Reset running count when starting a new game session
      deck, // Initialize the deck for the new session
    });

    // Update the running count based on the initial cards dealt
    updateRunningCount(gameSession, [...playerCards, dealerCards[0]]);
    await gameSession.save();

    res.status(201).json({
      message: 'Game created',
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - deck.length,
      gameSession: gameSession.toObject(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const hit = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession || gameSession.result !== 'ongoing') return res.status(400).json({ error: 'Invalid game session' });
    if (gameSession.deck.length === 0) return res.status(500).json({ error: 'Deck is empty' });

    const newCard = gameSession.deck.pop();
    gameSession.cardsDealt.push(newCard);
    gameSession.score = calculateScore(gameSession.cardsDealt);
    updateRunningCount(gameSession, [newCard]);

    if (gameSession.score > 21) gameSession.result = 'lost';

    gameSession.actions.push('hit');
    await gameSession.save();

    res.json({
      message: gameSession.result === 'lost' ? 'Player busted!' : 'Card drawn',
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
      gameSession: gameSession.toObject(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const stand = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession || gameSession.result !== 'ongoing') return res.status(400).json({ error: 'Invalid game session' });

    while (calculateScore(gameSession.dealerCards) < 17 && gameSession.deck.length > 0) {
      const newCard = gameSession.deck.pop();
      gameSession.dealerCards.push(newCard);
      updateRunningCount(gameSession, [newCard]);
    }

    gameSession.dealerScore = calculateScore(gameSession.dealerCards);

    if (gameSession.dealerScore > 21 || gameSession.score > gameSession.dealerScore) gameSession.result = 'won';
    else if (gameSession.score < gameSession.dealerScore) gameSession.result = 'lost';
    else gameSession.result = 'draw';

    gameSession.actions.push('stand');
    await gameSession.save();

    res.json({
      message: 'Round ended',
      result: gameSession.result,
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
      gameSession: gameSession.toObject(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const endGameSession = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    gameSession.result = 'ended';
    gameSession.runningCount = 0;
    await gameSession.save();

    res.status(200).json({
      message: 'Game session ended',
      gameSession: gameSession.toObject(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const startNewHand = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    if (gameSession.deck.length < 10) {
      return res.status(400).json({ error: 'Not enough cards in the deck. Please reshuffle.' });
    }

    const deck = gameSession.deck; // <<< Add this line

    const playerCards = [deck.pop(), deck.pop()];
    const dealerCards = [deck.pop(), { ...deck.pop(), hidden: true }];

    gameSession.cardsDealt = playerCards;
    gameSession.dealerCards = dealerCards;
    gameSession.score = calculateScore(playerCards);
    gameSession.dealerScore = calculateScore([dealerCards[0]]);
    gameSession.result = 'ongoing';
    gameSession.actions = [];

    updateRunningCount(gameSession, [...playerCards, dealerCards[0]]);
    await gameSession.save();

    res.status(200).json({
      message: 'New hand started',
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
      gameSession: gameSession.toObject(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const getRunningCount = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    res.json({
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remainingCards = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    res.json({ remainingCards: gameSession.deck.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const split = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession || gameSession.result !== 'ongoing') return res.status(400).json({ error: 'Invalid game session' });

    const [first, second] = gameSession.cardsDealt;
    if (!first || !second || first.value !== second.value) {
      return res.status(400).json({ error: 'Cannot split, cards are not a pair' });
    }
    if (gameSession.deck.length < 2) {
      return res.status(400).json({ error: 'Not enough cards to split' });
    }

    const hand1 = [first, gameSession.deck.pop()];
    const hand2 = [second, gameSession.deck.pop()];

    gameSession.splitHands = [
      { cards: hand1, score: calculateScore(hand1), result: 'ongoing' },
      { cards: hand2, score: calculateScore(hand2), result: 'ongoing' },
    ];

    gameSession.actions.push('split');
    updateRunningCount(gameSession, [hand1[1], hand2[1]]);
    await gameSession.save();

    res.status(200).json({
      message: 'Hand split into two',
      splitHands: gameSession.splitHands,
      runningCount: gameSession.runningCount,
      deckCount: gameSession.deck.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const doubleDown = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession || gameSession.result !== 'ongoing') return res.status(400).json({ error: 'Invalid game session' });
    if (gameSession.cardsDealt.length !== 2) return res.status(400).json({ error: 'Double down only allowed after initial deal' });
    if (gameSession.deck.length === 0) return res.status(400).json({ error: 'Deck is empty' });

    const newCard = gameSession.deck.pop();
    gameSession.cardsDealt.push(newCard);
    updateRunningCount(gameSession, [newCard]);
    gameSession.score = calculateScore(gameSession.cardsDealt);
    gameSession.actions.push('doubleDown');

    if (gameSession.score > 21) {
      gameSession.result = 'lost';
    } else {
      while (calculateScore(gameSession.dealerCards) < 17 && gameSession.deck.length > 0) {
        const dealerCard = gameSession.deck.pop();
        gameSession.dealerCards.push(dealerCard);
        updateRunningCount(gameSession, [dealerCard]);
      }

      gameSession.dealerScore = calculateScore(gameSession.dealerCards);

      if (gameSession.dealerScore > 21 || gameSession.score > gameSession.dealerScore) {
        gameSession.result = 'won';
      } else if (gameSession.score < gameSession.dealerScore) {
        gameSession.result = 'lost';
      } else {
        gameSession.result = 'draw';
      }
    }

    await gameSession.save();

    res.status(200).json({
      message: 'Double down executed',
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
      gameSession: gameSession.toObject(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createGame,
  hit,
  stand,
  getRunningCount,
  endGameSession,
  startNewHand,
  remainingCards,
  createShuffledDeck,
  split,
  doubleDown,
};
