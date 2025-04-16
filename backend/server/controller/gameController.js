const GameSession = require('../models/gameSessionModel');
const Card = require('../models/cardModel');
const User = require('../models/userModel');

// Function to create and shuffle a new deck using Card modelconst Card = require('../models/Card'); // Adjust the path based on your project structure

const createShuffledDeck = () => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = [];

  // Create the deck using the existing Card model
  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push(new Card({ suit, value }));
    });
  });

  // Shuffle the deck using Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap cards
  }

  return deck;
}
// Function to calculate the score
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
const remainingCards = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    res.json({
      remainingCards: gameSession.deck.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update running count based on Hi-Lo strategy
const updateRunningCount = (gameSession, drawnCards) => {
  drawnCards.forEach((card) => {
    if (['2', '3', '4', '5', '6'].includes(card.value)) gameSession.runningCount++;
    else if (['10', 'J', 'Q', 'K', 'A'].includes(card.value)) gameSession.runningCount--;
  });
};

// Create a new game session
const createGame = async (req, res) => {
  try {
    const { userId, bet } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (bet <= 0) return res.status(400).json({ error: 'Bet must be positive' });

    const deck = createShuffledDeck();
    const playerCards = [deck.pop(), deck.pop()];
    const dealerCards = [
      deck.pop(), // Face-up card
      { ...deck.pop(), hidden: true } // Face-down card
    ];

    const gameSession = new GameSession({
      userId,
      result: 'ongoing',
      cardsDealt: playerCards,
      dealerCards,
      score: calculateScore(playerCards),
      dealerScore: calculateScore([dealerCards[0]]), // Only calculate score for visible card initially
      bet,
      actions: [],
      runningCount: 0,
      deck,
    });

    updateRunningCount(gameSession, [...playerCards, [dealerCards[0]]]); // Count only face-up dealer card
    await gameSession.save();

    res.status(201).json({
      message: 'Game created',
      gameSession,
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - deck.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Player hits (draws a card)
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
      gameSession,
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Player stands (dealer plays)
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
      gameSession,
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get running count
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

// End game session
const endGameSession = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    gameSession.result = 'ended';
    gameSession.runningCount = 0;
    await gameSession.save();

    res.status(200).json({ message: 'Game session ended', gameSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start a new hand
const startNewHand = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    if (gameSession.deck.length < 5) {
      gameSession.deck = createShuffledDeck();
    }

    const playerCards = [gameSession.deck.pop(), gameSession.deck.pop()];
    const dealerCards = [gameSession.deck.pop()];

    gameSession.cardsDealt = playerCards;
    gameSession.dealerCards = dealerCards;
    gameSession.score = calculateScore(playerCards);
    gameSession.dealerScore = calculateScore(dealerCards);
    gameSession.result = 'ongoing';
    gameSession.actions = [];

    updateRunningCount(gameSession, [...playerCards, ...dealerCards]);
    await gameSession.save();

    res.status(200).json({
      message: 'New hand started',
      gameSession,
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const split = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);
    if (!gameSession || gameSession.result !== 'ongoing') {
      return res.status(400).json({ error: 'Invalid game session' });
    }

    const [first, second] = gameSession.cardsDealt;
    if (!first || !second || first.value !== second.value) {
      return res.status(400).json({ error: 'Cannot split, cards are not a pair' });
    }

    if (gameSession.deck.length < 2) {
      return res.status(400).json({ error: 'Not enough cards to split' });
    }

    // Initialize split hands
    const hand1 = [first, gameSession.deck.pop()];
    const hand2 = [second, gameSession.deck.pop()];

    gameSession.splitHands = [
      {
        cards: hand1,
        score: calculateScore(hand1),
        result: 'ongoing',
      },
      {
        cards: hand2,
        score: calculateScore(hand2),
        result: 'ongoing',
      },
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
    if (!gameSession || gameSession.result !== 'ongoing') {
      return res.status(400).json({ error: 'Invalid game session' });
    }

    if (gameSession.cardsDealt.length !== 2) {
      return res.status(400).json({ error: 'Double down only allowed after initial deal' });
    }

    if (gameSession.deck.length === 0) {
      return res.status(400).json({ error: 'Deck is empty' });
    }


    // Draw one final card
    const newCard = gameSession.deck.pop();
    gameSession.cardsDealt.push(newCard);
    updateRunningCount(gameSession, [newCard]);
    gameSession.score = calculateScore(gameSession.cardsDealt);
    gameSession.actions.push('doubleDown');

    // Determine result
    if (gameSession.score > 21) {
      gameSession.result = 'lost';
    } else {
      // Dealer plays
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
      gameSession,
      runningCount: gameSession.runningCount,
      dealtCardsCount: 52 - gameSession.deck.length,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { createGame, hit, stand, getRunningCount, endGameSession, startNewHand, remainingCards, createShuffledDeck, split,
  doubleDown};
