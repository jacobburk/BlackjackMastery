import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getUserInfo from "../../utilities/decodeJwt";
import Card from "../card";

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
    if (!game || game.result !== 'ongoing') return; // Don't allow hit if the game is not ongoing
    try {
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/hit`);
      setGame(response.data.gameSession);
    } catch (error) {
      console.error('Error hitting:', error);
      setMessage('Error drawing a card.');
    }
  };

  const handleStand = async () => {
    if (!game || game.result !== 'ongoing') return; // Don't allow stand if the game is not ongoing
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
          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="section-title">Your Hand</h2>
            <div className="flex mt-4 space-x-4">
              {game.cardsDealt.map((card, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Card card={`${card.value}-${card.suit}`} />
                  <p className="text-gray-300 text-sm">{card.value} of {card.suit}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-gray-300">Score: {game.score}</p>
          </div>

          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="section-title">Dealer's Hand</h2>
            <div className="flex mt-4 space-x-4">
              {game.dealerCards.map((card, index) => (
                index === 0 || game.result !== 'ongoing' ? (
                  <div key={index} className="flex flex-col items-center">
                    <Card card={`${card.value}-${card.suit}`} />
                    <p className="text-gray-300 text-sm">{card.value} of {card.suit}</p>
                  </div>
                ) : (
                  <Card key={index} card="back" />
                )
              ))}
            </div>
            <p className="mt-4 text-gray-300">Score: {game.dealerScore || 'Unknown'}</p>
          </div>

          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="section-title">Actions</h2>
            <div className="flex mt-6 space-x-6">
              <button 
                className="button-primary" 
                onClick={handleHit} 
                disabled={game.result !== 'ongoing'} // Disable if the game is not ongoing
              >
                Hit
              </button>
              <button 
                className="button-primary" 
                onClick={handleStand} 
                disabled={game.result !== 'ongoing'} // Disable if the game is not ongoing
              >
                Stand
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h2 className="section-title">Game Status</h2>
            <p className="text-gray-300">Your current status: {game.result}</p>
            <p className="mt-4 text-gray-400">Dealer's current score: {game.dealerScore || '?'}</p>
          </div>
        </div>
      )}

      {message && (
        <div className="mt-6 text-center text-gray-300">
          <p>{message}</p>
        </div>
      )}

      {/* Start New Game Button */}
      <button 
        className="mt-8 button-primary" 
        onClick={() => startGame(user?.id)}
      >
        Start New Game
      </button>
    </div>
  );
};

export default PracticeBlackjack;
