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
        value = 10;
      } else if (value === 'A') {
        aces += 1;
        return;
      } else {
        value = parseInt(value, 10);
      }
    }

    score += value;
  });

  while (aces > 0) {
    if (score + 11 <= 21) {
      score += 11;
    } else {
      score += 1;
    }
    aces--;
  }

  return score;
};

// Function to populate deck if empty
const populateDeckIfEmpty = async () => {
  const existingCards = await Card.find();
  if (existingCards.length > 0) return;

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const cards = [];
  suits.forEach(suit => {
    values.forEach(value => {
      cards.push({ suit, value });
    });
  });

  await Card.insertMany(cards);
};

// Create a new game session
exports.createGame = async (req, res) => {
  try {
    const { userId, bet } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (bet <= 0) return res.status(400).json({ error: 'Bet must be positive' });

    await populateDeckIfEmpty();

    const deck = await Card.find();
    if (deck.length < 3) return res.status(400).json({ error: 'Not enough cards in deck' });

    const playerCards = [
      deck[Math.floor(Math.random() * deck.length)],
      deck[Math.floor(Math.random() * deck.length)],
    ];

    const dealerCards = [deck[Math.floor(Math.random() * deck.length)]];

    const score = calculateScore(playerCards);
    const dealerScore = calculateScore(dealerCards);

    const gameSession = new GameSession({
      userId,
      result: 'ongoing',
      cardsDealt: playerCards,
      dealerCards,
      score,
      dealerScore,
      bet,
      actions: [],
    });

    await gameSession.save();
    res.status(201).json({ message: 'Game created', gameSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Hit (draw another card)
exports.hit = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);

    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    if (gameSession.result !== 'ongoing') {
      return res.status(400).json({ error: 'Game session is over' });
    }

    const deck = await Card.find();
    if (deck.length === 0) return res.status(500).json({ error: 'Deck is empty' });

    const newCard = deck[Math.floor(Math.random() * deck.length)];
    gameSession.cardsDealt.push(newCard);
    gameSession.score = calculateScore(gameSession.cardsDealt);

    // **Check if player busts (score > 21)**
    if (gameSession.score > 21) {
      gameSession.result = 'lost'; // Player busts and loses immediately
    }

    gameSession.actions.push('hit');
    await gameSession.save();

    res.json({ 
      message: gameSession.result === 'lost' ? 'Player busted! Game over.' : 'Card drawn', 
      gameSession 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stand (end the game and determine outcome)
exports.stand = async (req, res) => {
  try {
    const { gameId } = req.params;
    const gameSession = await GameSession.findById(gameId);

    if (!gameSession) return res.status(404).json({ error: 'Game session not found' });

    if (gameSession.result !== 'ongoing') {
      return res.status(400).json({ error: 'Game session is over' });
    }

    let dealerCards = gameSession.dealerCards;
    const deck = await Card.find();
    if (deck.length === 0) return res.status(500).json({ error: 'Deck is empty' });

    dealerCards.push(deck[Math.floor(Math.random() * deck.length)]);
    let dealerScore = calculateScore(dealerCards);

    while (dealerScore < 17) {
      const newCard = deck[Math.floor(Math.random() * deck.length)];
      dealerCards.push(newCard);
      dealerScore = calculateScore(dealerCards);
    }

    if (dealerScore > 21 || gameSession.score > dealerScore) {
      gameSession.result = 'won';
    } else if (gameSession.score < dealerScore) {
      gameSession.result = 'lost';
    } else {
      gameSession.result = 'draw';
    }

    gameSession.dealerCards = dealerCards;
    gameSession.dealerScore = dealerScore;
    gameSession.actions.push('stand');
    await gameSession.save();

    res.json({ message: 'Game ended', result: gameSession.result, gameSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
