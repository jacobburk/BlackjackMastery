import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getUserInfo from "../../utilities/decodeJwt";
import Card from "../card";
import '../../css/global.css';

const PracticeBlackjack = () => {
  const [game, setGame] = useState(null);
  const [betAmount, setBetAmount] = useState(50); // Default bet amount
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [runningCount, setRunningCount] = useState(0);
  const [remainingCards, setRemainingCards] = useState(0);
  const [showRunningCount, setShowRunningCount] = useState(true);

  const [userPrompt, setUserPrompt] = useState(''); // State for user input
  const [responseMessage, setResponseMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([
    { role: "system", content: 'You are a professional blackjack teacher, helping people learn basic strategy and card counting.' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const updateUserStats = async (updatedStats) => {
    try {
      await axios.put(`http://localhost:8081/stats/${user.id}/update`, updatedStats);
    } catch (error) {
      console.error("Failed to update user stats:", error);
    }
  };
  

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = getUserInfo();
      if (userInfo) {
        setUser(userInfo);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (user?.id) {
      startNewGameSession(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (game) {
      fetchRunningCount();
      fetchRemainingCards();
    }
  }, [game]);

  const startNewGameSession = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8081/api/game', { userId, bet: betAmount });
      setGame(response.data.gameSession);
      setMessage('New game session started!');
      setRunningCount(0);
      fetchRemainingCards();
    } catch (error) {
      console.error('Error starting the game:', error);
      setMessage('Failed to start a new game session.');
    } finally {
      setLoading(false);
    }
  };

  const startNewHand = async () => {
    if (!game) return;
    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/new-hand`);
      setGame(response.data.gameSession);
      setMessage('New hand started!');
      fetchRemainingCards();
    } catch (error) {
      console.error('Error starting a new hand:', error);
      setMessage('Failed to start a new hand.');
    } finally {
      setLoading(false);
    }
  };

  const endGameSession = async () => {
    if (!game) return;
    try {
      await axios.post(`http://localhost:8081/api/game/${game._id}/end-session`);
      setGame(null);
      setMessage('Reshuffling deck');
    } catch (error) {
      console.error('Error ending the game session:', error);
      setMessage('Failed to reshuffle .');
    }
  };

  const handleHit = async () => {
    if (!game || game.result !== 'ongoing') return;
    try {
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/hit`);
      setGame(response.data.gameSession);
      fetchRemainingCards();
    } catch (error) {
      console.error('Error hitting:', error);
      setMessage('Error drawing a card.');
    }
  };

  const handleStand = async () => {
    if (!game || game.result !== 'ongoing') return;
    try {
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/stand`);
      const updatedGame = response.data.gameSession;
      setGame(updatedGame);
      setMessage(`Game ended. Result: ${updatedGame.result}`);
      fetchRemainingCards();
  
      // Update stats
      if (user) {
        const isWin = updatedGame.result === 'won';
        const isLoss = updatedGame.result === 'lost';
  
        await updateUserStats({
          wins: isWin ? 1 : 0,
          losses: isLoss ? 1 : 0,
          handsPlayed: 1,
          totalRunningCount: runningCount,
        });
      }
    } catch (error) {
      console.error('Error standing:', error);
      setMessage('Error finishing the game.');
    }
  };
  

  const fetchRunningCount = async () => {
    if (!game) return;
    try {
      const response = await axios.get(`http://localhost:8081/api/game/${game._id}/running-count`);
      setRunningCount(response.data.runningCount);
    } catch (error) {
      console.error('Error fetching running count:', error);
      setMessage('Error retrieving running count.');
    }
  };

  const fetchRemainingCards = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/game/${game._id}/remaining-cards`);
      setRemainingCards(response.data.remainingCards);
    } catch (error) {
      console.error('Error fetching remaining cards:', error);
      setMessage('Error retrieving remaining cards.');
    }
  };
  const handleDoubleDown = async () => {
    if (!game || game.result !== 'ongoing') return;
    try {
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/double-down`);
      setGame(response.data.gameSession);
      fetchRemainingCards();
    } catch (error) {
      console.error('Error doubling down:', error);
      setMessage('Error attempting double down.');
    }
  };
  
  const handleSplit = async () => {
    if (!game || game.result !== 'ongoing') return;
    try {
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/split`);
      setGame(response.data.gameSession);
      fetchRemainingCards();
    } catch (error) {
      console.error('Error splitting:', error);
      setMessage('Error attempting split.');
    }
  };
  
  const handleAsk = async () => {
    setChatLoading(true);
    document.body.style.cursor = 'wait';
    const playerScore = game.score;
    const dealerScore = game.dealerScore;

    const newMessageHistory = [
      ...messageHistory,
      {
        role: "user",
        content: `Based on the current hand values (Player: ${playerScore}, Dealer: ${dealerScore}), should I hit or stand?`
      },
    ];

    try {
      const response = await axios.post('http://localhost:8081/chat/canned', {
        messageHistory: newMessageHistory
      });

      const responseContent = response.data.message.content;
      setResponseMessage(responseContent);

      setMessageHistory([
        ...newMessageHistory,
        { role: "assistant", content: responseContent }
      ]);
    } catch (error) {
      console.error('There was an error!', error);
      setResponseMessage('There was an error processing your request.');
    } finally {
      setChatLoading(false);
      document.body.style.cursor = 'default';
    }
  };

  if (loading) {
    return <div className="text-center text-white">Loading game...</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center">
      <div className="text-center mt-12">
        <h1 className="header-title">Practice Blackjack</h1>
        <p className="header-subtitle">Learn and improve your blackjack skills by practicing anytime!</p>
      </div>

      {game && (
  <div className="section-container mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* Player's Hand */}
    <div
      className={`section-item flex flex-col items-center justify-center ${
        game.result === 'won'
          ? 'border-4 border-green-500'
          : game.result === 'lost'
          ? 'border-4 border-red-500'
          : ''
      }`}
    >
      <h2 className="section-title">Your Hand</h2>
      <div className="flex mt-4 space-x-4">
        {game.cardsDealt.map((card, index) => (
          <Card key={index} card={`${card.value}-${card.suit}`} />
        ))}
      </div>
      <p className="mt-4 text-gray-300">Score: {game.score}</p>
    </div>

    {/* Render split hands */}
    {game.splitHands && game.splitHands.length > 0 && (
      <div className="section-item flex flex-col items-center justify-center">
        <h2 className="section-title">Split Hands</h2>
        {game.splitHands.map((splitHand, index) => (
          <div key={index} className="flex mt-4 space-x-4">
            {splitHand.cards.map((card, cardIndex) => (
              <Card key={cardIndex} card={`${card.value}-${card.suit}`} />
            ))}
            <p className="mt-4 text-gray-300">Score: {splitHand.score}</p>
          </div>
        ))}
      </div>
    )}

    {/* Dealer's Hand */}
    <div
      className={`section-item flex flex-col items-center justify-center ${
        game.result === 'lost'
          ? 'border-4 border-green-500'
          : game.result === 'won'
          ? 'border-4 border-red-500'
          : ''
      }`}
    >
      <h2 className="section-title">Dealer's Hand</h2>
      <div className="flex mt-4 space-x-4">
        {game.dealerCards.map((card, index) => (
          index === 0 || game.result !== 'ongoing' ? (
            <Card key={index} card={`${card.value}-${card.suit}`} />
          ) : (
            <Card key={index} card="back" />
          )
        ))}
      </div>
      <p className="mt-4 text-gray-300">Score: {game.dealerScore || 'Unknown'}</p>
    </div>

    {/* Actions + Running Count */}
    <div className="section-item flex flex-col items-center justify-center">
      <h2 className="section-title">Actions</h2>
      <div className="flex mt-6 space-x-6">
        <button className="button-primary" onClick={handleHit} disabled={game.result !== 'ongoing'}>
          Hit
        </button>
        <button className="button-primary" onClick={handleStand} disabled={game.result !== 'ongoing'}>
          Stand
        </button>
      </div>
      <div className="flex mt-4 space-x-6">
        <button className="button-primary" onClick={handleDoubleDown} disabled={game.result !== 'ongoing'}>
          Double Down
        </button>
        <button className="button-primary" onClick={handleSplit} disabled={game.result !== 'ongoing'}>
          Split
        </button>
      </div>

      {/* Running Count */}
      <button className="mt-4 button-secondary" onClick={() => setShowRunningCount(!showRunningCount)}>
        {showRunningCount ? 'Hide Running Count' : 'Show Running Count'}
      </button>

      {showRunningCount && (
        <div className="mt-4 text-yellow-400 text-center">
          <p>Running Count: {runningCount}</p>
          <p>Remaining Cards: {remainingCards}</p>
        </div>
      )}
    </div>
  </div>
)}


      {/* Game Session Buttons (Outside the Box) */}
      {game && (
        <div className="mt-6 flex space-x-6">
          <button className="button-primary" onClick={startNewHand}>Start New Hand</button>
          <button className="button-danger" onClick={endGameSession}>Reshuffle</button>
        </div>
      )}

      {/* Start New Game Button */}
      <button className="mt-8 button-primary" onClick={() => startNewGameSession(user?.id)}>
        Start New Shoe
      </button>

      {message && <div className="mt-6 text-center text-gray-300"><p>{message}</p></div>}

      {/* Chatbox Section */}
      <div className="mt-8">
        <h2 className="text-center text-xl">Ask a Question</h2>
        <div className="flex flex-col items-center mt-4">
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows="1"
            className="w-80 p-2 border border-gray-300 rounded"
            placeholder="Ask about blackjack basic strategy..."
          />
          <button
            className="mt-4 button-primary"
            onClick={handleAsk}
            disabled={chatLoading}
          >
            {chatLoading ? 'Asking...' : 'Ask'}
          </button>
          {responseMessage && (
            <div className="mt-4 text-yellow-400">
              <h3>Response:</h3>
              <p>{responseMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeBlackjack;
