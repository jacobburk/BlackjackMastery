import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getUserInfo from "../../utilities/decodeJwt";
import Card from "../card";
import '../../css/global.css';

const PracticeBlackjack = () => {
  const [game, setGame] = useState(null);
  const [betAmount, setBetAmount] = useState(50);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [runningCount, setRunningCount] = useState(0);
  const [remainingCards, setRemainingCards] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([
    { role: "system", content: 'You are a professional blackjack teacher, helping people learn basic strategy and card counting.' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [bankroll, setBankroll] = useState();  
  const [playerHasHit, setPlayerHasHit] = useState(false);

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
      fetchBankroll();
    }
  }, [user]);

  useEffect(() => {
    if (game) {
      fetchRunningCount();
      fetchRemainingCards();
    }
  }, [game]);

  const fetchBankroll = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/stats/${user.id}/bankroll`);
      setBankroll(response.data.bankroll);
    } catch (error) {
      console.error('Error fetching bankroll:', error);
    }
  };

  const updateBankroll = async (amountChange) => {
    try {
      const response = await axios.post(`http://localhost:8081/stats/${user.id}/updateBankroll`, {
        amount: amountChange,
      });
      setBankroll(response.data.stats.bankroll);
    } catch (error) {
      console.error('Error updating bankroll:', error);
    }
  };
  
  const startNewGameSession = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8081/api/game', { userId, bet: betAmount });
      setGame(response.data.gameSession);
      setMessage('New game session started!');
      setRunningCount(0);
      fetchRemainingCards();
      if (user && user.id) {
        await axios.post(`http://localhost:8081/stats/${user.id}/updateHandsPlayed`);
      }
    } catch (error) {
      console.error('Error starting the game:', error);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const maybePromptForCount = () => {
    if (practiceMode && Math.random() < 0.3) { // 30% chance
      const userAnswer = prompt('Practice Mode: What is the current running count?');
      if (userAnswer !== null) {
        if (parseInt(userAnswer) === runningCount) {
          alert('✅ Correct! Great job keeping count.');
        } else {
          alert(`❌ Incorrect. The correct running count is ${runningCount}.`);
        }
      }
    }
  };

  const startNewHand = async () => {
    if (!game) return;

    try {
      setLoading(true);

      // If the last hand is completed, update stats before starting a new one
      if (user && user.id && game.result && game.result !== 'ongoing') {
        await axios.post(`http://localhost:8081/stats/${user.id}/updateHandsPlayed`);

        if (game.result === 'won') {
          await axios.post(`http://localhost:8081/stats/${user.id}/updateHandsWon`, {
            handsWon: 1,
          });
        }
      }

      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/new-hand`);
      setGame(response.data.gameSession);
      setMessage('New hand started!');
      fetchRemainingCards();

    } catch (error) {
      console.error('Error starting a new hand:', error);
      setMessage('');
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
      setMessage('Failed to reshuffle.');
    }
  };

  const handleHit = async () => {
    if (!game || game.result !== 'ongoing') return;
  
    try {
      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/hit`);
      const updatedGame = response.data.gameSession;
  
      setGame(updatedGame);
      fetchRemainingCards();
      maybePromptForCount();
  
      // 🔥 Check if player busted
      if (updatedGame.result === 'lost' && user) {
        const lossAmount = -betAmount;
        
        // Update bankroll on server
        const bankrollRes = await axios.post(`http://localhost:8081/stats/${user.id}/updateBankroll`, {
          amount: lossAmount
        });
  
        // Update bankroll locally
        setBankroll(bankrollRes.data.stats.bankroll);
      }
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
      maybePromptForCount();
      if (user) {
        const isWin = updatedGame.result === 'won';
        const change = isWin ? betAmount : -betAmount;
await updateBankroll(change);

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
      setMessage('');
    }
  };

  const handleDoubleDown = async () => {
    if (!game || game.result !== 'ongoing') return;
    try {
      // Double the bet
      const newBetAmount = betAmount * 2;
      setBetAmount(newBetAmount);

      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/double-down`);
      setGame(response.data.gameSession);
      fetchRemainingCards();
      maybePromptForCount();
    } catch (error) {
      console.error('Error doubling down:', error);
      setMessage('Error attempting double down.');
    }
  };

  const handleSplit = async () => {
    if (!game || game.result !== 'ongoing') return;
    try {
      // Double the bet
      const newBetAmount = betAmount * 2;
      setBetAmount(newBetAmount);

      const response = await axios.post(`http://localhost:8081/api/game/${game._id}/split`);
      setGame(response.data.gameSession);
      fetchRemainingCards();
      maybePromptForCount();
    } catch (error) {
      console.error('Error splitting:', error);
      setMessage('Error attempting split.');
    }
  };

  const handleBetChange = (e) => {
    setBetAmount(Number(e.target.value));
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
        <div className="section-container mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Chatbox Section to the Left */}
          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold mb-2">Ask For Advice</h2>

            <button
              className="mt-2 button-primary"
              onClick={handleAsk}
              disabled={chatLoading}
            >
              {chatLoading ? 'Asking...' : 'Ask'}
            </button>
            {responseMessage && (
              <div className="mt-2 text-yellow-400 text-center">
                <p>{responseMessage}</p>
              </div>
            )}
          </div>

          {/* Player's Hand */}
          <div className={`section-item flex flex-col items-center justify-center ${
            game.result === 'won' ? 'border-4 border-green-500' :
            game.result === 'lost' ? 'border-4 border-red-500' : ''
          }`}>
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
          <div className={`section-item flex flex-col items-center justify-center ${
            game.result === 'lost' ? 'border-4 border-green-500' :
            game.result === 'won' ? 'border-4 border-red-500' : ''
          }`}>
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

          {/* Actions + Card Counting */}
          <div className="section-item flex flex-col items-center justify-center">
            <h2 className="section-title">Actions</h2>

            <div className="mt-4">
          <label className="bg-gray-800" htmlFor="betAmount">Set Bet Amount:</label>
            <input
             type="number"
             id="betAmount"
             value={betAmount}
             onChange={handleBetChange}
             className="mt-2 p-2 rounded border border-gray-500 text-black" // Changed text color to black
             min="1"
             max={bankroll}  // Bet can't exceed bankroll
             />
            </div>
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

            {/* Card Counting Practice Mode */}
            <button
              className={`mt-4 ${practiceMode ? 'button-danger' : 'button-secondary'}`}
              onClick={() => {
                setPracticeMode(!practiceMode);
                if (!practiceMode) {
                  alert('Practice Mode ON: You will be randomly quizzed on the running count.');
                } else {
                  alert('Practice Mode OFF');
                }
              }}
            >
              {practiceMode ? 'Exit Card Counting Practice' : 'Start Card Counting Practice'}
            </button>

            <div className="mt-4 text-yellow-400 text-center">
              {!practiceMode && <p>Running Count: {runningCount}</p>}
              <p>Remaining Cards: {remainingCards}</p>
              <p>Bankroll: {bankroll}</p>
            </div>
          </div>
        </div>
      )}

      {game && (
        <div className="mt-6 flex space-x-6">
          <button className="button-primary" onClick={startNewHand}>Start New Hand</button>
          <button className="button-primary" onClick={() => startNewGameSession(user?.id)}>Reshuffle</button>
        </div>
      )}
      {message && <div className="mt-6 text-center text-gray-300"><p>{message}</p></div>}
    </div>
  );
};

export default PracticeBlackjack;
