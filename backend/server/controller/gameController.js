const GameSession = require('../models/gameSessionModel');
const Card = require('../models/cardModel');
const User = require('../models/userModel');  

// Function to calculate score
const calculateScore = (cards) => {
  let score = 0;
  let aces = 0;

  cards.forEach((card) => {
    if (!card || !card.value) {
      console.error('Invalid card:', card);
      return;  
    }

    let value = card.value;

    if (typeof value === 'string') {
      if (['J', 'Q', 'K'].includes(value)) {
        value = 10; // Face cards are worth 10 points
      } else if (value === 'A') {
        aces += 1; // Track aces separately
        return; // Don't add it yet
      } else {
        value = parseInt(value, 10); // Convert string numbers to integers
      }
    }

    score += value;
  });

  // Adjust for aces (either 1 or 11)
  while (aces > 0) {
    if (score + 11 > 21) {
      score += 1; // Ace counts as 1
    } else {
      score += 11; // Ace counts as 11
    }
    aces--;
  }

  return score;
};

// Function to populate deck if empty
const populateDeckIfEmpty = async () => {
  const existingCards = await Card.find();
  if (existingCards.length > 0) {
    return; // Deck already populated
  }

  // Standard deck of cards
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const cards = [];
  suits.forEach(suit => {
    values.forEach(value => {
      cards.push({ suit, value });
    });
  });

  // Save the deck to the database
  await Card.insertMany(cards);
};

// Create a new game session
exports.createGame = async (req, res) => {
  try {
    const { userId, bet } = req.body;

    // Validate userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Validate bet
    if (bet <= 0) {
      return res.status(400).json({ error: 'Bet must be a positive number' });
    }

    // Ensure the deck is populated before dealing cards
    await populateDeckIfEmpty();

    // Deal two initial cards
    const deck = await Card.find();
    if (deck.length < 2) {
      return res.status(400).json({ error: 'Not enough cards in deck' });
    }

    const playerCards = [
      deck[Math.floor(Math.random() * deck.length)],
      deck[Math.floor(Math.random() * deck.length)],
    ];

    // Ensure valid cards were selected
    if (!playerCards[0] || !playerCards[1]) {
      return res.status(400).json({ error: 'Invalid cards dealt' });
    }

    const score = calculateScore(playerCards);

    const gameSession = new GameSession({
      userId,
      result: 'ongoing',
      cardsDealt: playerCards, // Store the player's cards
      dealerCards: [], // Ensure dealerCards is initialized
      score,
      bet,
    });
    

    await gameSession.save();
    res.status(201).json({ message: 'Game created', gameSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hit (request a new card)
exports.hit = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);

    if (!gameSession) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    if (gameSession.result !== 'ongoing') {
      return res.status(400).json({ error: 'Invalid game session' });
    }

    const deck = await Card.find();
    if (deck.length === 0) {
      return res.status(400).json({ error: 'Deck is empty' });
    }

    const newCard = deck[Math.floor(Math.random() * deck.length)];

    if (!newCard) {
      return res.status(400).json({ error: 'Invalid card dealt' });
    }

    // Convert cardsDealt to plain objects before modifying it
    let playerCards = gameSession.cardsDealt.map(card => card.toObject ? card.toObject() : card);

    // Add new card
    playerCards.push(newCard);

    // Calculate new score using ALL cards
    const updatedScore = calculateScore(playerCards);

    // Update game state
    if (updatedScore > 21) {
      gameSession.result = 'lost';
    }

    gameSession.cardsDealt = playerCards;  // Ensure full list is saved
    gameSession.score = updatedScore;
    gameSession.actions.push('hit');

    await gameSession.save();

    res.json({ message: 'Card added', gameSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stand (end the game and calculate outcome)
exports.stand = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);

    if (!gameSession) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    if (gameSession.result !== 'ongoing') {
      return res.status(400).json({ error: 'Game session is not active' });
    }

    // Ensure dealerCards is always an array
    let dealerCards = gameSession.dealerCards || []; 
    let dealerScore = calculateScore(dealerCards);

    while (dealerScore < 17) {
      const deck = await Card.find();
      if (!deck.length) {
        return res.status(500).json({ error: 'Deck is empty' });
      }

      const newCard = deck[Math.floor(Math.random() * deck.length)];
      dealerCards.push(newCard);
      dealerScore = calculateScore(dealerCards);
    }

    // Determine result
    if (dealerScore > 21 || gameSession.score > dealerScore) {
      gameSession.result = 'won';
    } else if (gameSession.score < dealerScore) {
      gameSession.result = 'lost';
    } else {
      gameSession.result = 'draw';
    }

    gameSession.dealerCards = dealerCards; // Save updated dealer cards
    gameSession.actions.push('stand');
    await gameSession.save();

    res.json({ message: 'Game ended', result: gameSession.result, gameSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};
