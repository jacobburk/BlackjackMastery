import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getUserInfo from "../../utilities/decodeJwt";

const PracticeBlackjack = () => {
  const [game, setGame] = useState(null);
  const [betAmount, setBetAmount] = useState(50); // Default bet amount
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = getUserInfo();
      if (userInfo) {
        setUser(userInfo);
      }
    };
    fetchUserInfo();
  }, []);

  // Start a new game when user info is available
  useEffect(() => {
    if (user?.id) {
      startGame(user.id);
    }
  }, [user]);

  const startGame = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8081/api/game', { userId, bet: betAmount });
      setGame(response.data.gameSession);
      setMessage('Game started!');
    } catch (error) {
      console.error('Error starting the game:', error);
      setMessage('Failed to start the game.');
    } finally {
      setLoading(false);
    }
  };

  const handleHit = async () => {
    if (!game) return;
    try {
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/hit`);
      setGame(response.data.gameSession);
    } catch (error) {
      console.error('Error hitting:', error);
      setMessage('Error drawing a card.');
    }
  };

  const handleStand = async () => {
    if (!game) return;
    try {
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/stand`);
      setGame(response.data.gameSession);
      setMessage(`Game ended. Result: ${response.data.result}`);
    } catch (error) {
      console.error('Error standing:', error);
      setMessage('Error finishing the game.');
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
        <div className="section-container mt-8 space-y-8">
          {/* Player's Hand */}
          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="section-title">Your Hand</h2>
            <div className="flex mt-4 space-x-4">
              {game.cardsDealt.map((card, index) => (
                <div key={index} className="bg-red-600 p-4 rounded-lg text-white">
                  {card.value} of {card.suit}
                </div>
              ))}
            </div>
            <p className="mt-4 text-gray-300">Score: {game.score}</p>
          </div>

          {/* Dealer's Hand */}
          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="section-title">Dealer's Hand</h2>
            <div className="flex mt-4 space-x-4">
              {game.dealerCards.length > 0 ? (
                game.dealerCards.map((card, index) => (
                  <div key={index} className="bg-gray-600 p-4 rounded-lg text-white">
                    {card.value} of {card.suit}
                  </div>
                ))
              ) : (
                <div className="bg-gray-600 p-4 rounded-lg text-white">?</div>
              )}
            </div>
            <p className="mt-4 text-gray-300">Score: {game.dealerScore || 'Unknown'}</p>
          </div>

          {/* Actions */}
          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="section-title">Actions</h2>
            <div className="flex mt-6 space-x-6">
              <button className="button-primary" onClick={handleHit}>Hit</button>
              <button className="button-primary" onClick={handleStand}>Stand</button>
            </div>
          </div>

          {/* Game Status */}
          <div className="mt-12 text-center">
            <h2 className="section-title">Game Status</h2>
            <p className="text-gray-300">Your current status: {game.result}</p>
            <p className="mt-4 text-gray-400">Dealer's current score: {game.dealerScore || '?'}</p>
          </div>
        </div>
      )}

      {/* Feedback Message */}
      {message && (
        <div className="mt-6 text-center text-gray-300">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default PracticeBlackjack;
