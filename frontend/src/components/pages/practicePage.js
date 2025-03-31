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
      await axios.post(`http://localhost:8081/api/game/${game._id}/end`);
      setGame(null);
      setMessage('Game session ended.');
    } catch (error) {
      console.error('Error ending the game session:', error);
      setMessage('Failed to end the game session.');
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
      setGame(response.data.gameSession);
      setMessage(`Game ended. Result: ${response.data.result}`);
      fetchRemainingCards();
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
      const response = await axios.get('http://localhost:8081/api/game/${game._id}/remaining-cards');
      setRemainingCards(response.data.remainingCards);
    } catch (error) {
      console.error('Error fetching remaining cards:', error);
      setMessage('Error retrieving remaining cards.');
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
          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="section-title">Your Hand</h2>
            <div className="flex mt-4 space-x-4">
              {game.cardsDealt.map((card, index) => (
                <Card key={index} card={`${card.value}-${card.suit}`} />
              ))}
            </div>
            <p className="mt-4 text-gray-300">Score: {game.score}</p>
          </div>

          {/* Dealer's Hand */}
          <div className="section-item flex flex-col items-center justify-center">
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
          <button className="button-danger" onClick={endGameSession}>End Game Session</button>
        </div>
      )}

      {/* Start New Game Button */}
      <button className="mt-8 button-primary" onClick={() => startNewGameSession(user?.id)}>
        Start New Game Session
      </button>

      {message && <div className="mt-6 text-center text-gray-300"><p>{message}</p></div>}
    </div>
  );
};

export default PracticeBlackjack;
