import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import getUserInfo from '../../utilities/decodeJwt'; // Assuming this function gets user info from JWT
import '../../css/global.css'

const CardCountingPage = () => {
    const [user, setUser] = useState(null);
    const [showExplanation, setShowExplanation] = useState({}); // State to track which section has explanation visible
    const navigate = useNavigate(); // Use navigate to redirect if not logged in

    useEffect(() => {
        const userInfo = getUserInfo();
        if (!userInfo) {
            // If no user is logged in, redirect to login page
            navigate('/login');
        } else {
            setUser(userInfo);
        }
    }, [navigate]);

    const updateBankroll = async (userId, amount) => {
        try {
            const res = await fetch(`http://localhost:8081/stats/${user.id}/updateBankroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),
            });
    
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update bankroll');
            console.log('Bankroll updated:', data.stats.bankroll);
        } catch (err) {
            console.error('Error updating bankroll:', err.message);
        }
    };
    
    const handleToggleExplanation = (section) => {
        setShowExplanation((prevState) => {
            const newState = {
                ...prevState,
                [section]: !prevState[section],
            };
    
            // Reward only when explanation is being shown
            if (!prevState[section] && user) {
                updateBankroll(user.id, 250);
            }
    
            return newState;
        });
    };
    if (!user) {
        return null; // Optionally, you could display a loading spinner here
    }

    return (
        <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-5">
            <div className="section-item text-center w-full max-w-4xl px-6 py-8 space-y-8">
                {/* Main Title */}
                <h1 className="header-title">Card Counting in Blackjack</h1>
                
                {/* Subtitle */}
                <h2 className="header-subtitle mb-3">Master the Art of Card Counting</h2>
                
                {/* Description */}
                <p className="section-description mt-2">
                    Card counting is a strategy used to determine whether the next hand is likely to be in the player’s favor or the dealer’s. By keeping track of the cards that have been played, you can adjust your bets and playing strategy accordingly.
                </p>

                {/* Card Counting Strategy Sections */}
                <div className="space-y-8">
                    {/* The Hi-Lo System */}
                    <div className="section-item relative">
                        <h3 className="section-title">1. The Hi-Lo System</h3>
                        <p className="section-description">
                            The Hi-Lo system assigns values to cards: +1 for low cards (2-6), 0 for neutral cards (7-9), and -1 for high cards (10-Ace). By keeping a running count, you can determine when the deck favors the player.
                        </p>
                        {/* Explanation Button */}
                        <button 
                            className="button-secondary mt-2" 
                            onClick={() => handleToggleExplanation('hiLo')}
                        >
                            {showExplanation.hiLo ? 'Hide Explanation' : 'Explanation'}
                        </button>
                        {showExplanation.hiLo && (
                            <p className="mt-2 text-gray-300 text-sm">
                                When the count is positive, it means there are more high cards remaining in the deck, which benefits the player. If the count is negative, the dealer has the advantage.
                            </p>
                        )}
                    </div>
                    
                    {/* True Count Calculation */}
                    <div className="section-item relative">
                        <h3 className="section-title">2. True Count Calculation</h3>
                        <p className="section-description">
                            To get an accurate measure of deck favorability, divide the running count by the number of decks remaining in the shoe.
                        </p>
                        {/* Explanation Button */}
                        <button 
                            className="button-secondary mt-2" 
                            onClick={() => handleToggleExplanation('trueCount')}
                        >
                            {showExplanation.trueCount ? 'Hide Explanation' : 'Explanation'}
                        </button>
                        {showExplanation.trueCount && (
                            <p className="mt-2 text-gray-300 text-sm">
                                The true count refines the running count by considering the number of decks left to be played. A high true count means it’s a good time to increase bets.
                            </p>
                        )}
                    </div>
                    
                    {/* Betting Strategy */}
                    <div className="section-item relative">
                        <h3 className="section-title">3. Adjusting Your Bets</h3>
                        <p className="section-description">
                            Increase your bet when the true count is high, as the chances of getting a blackjack or winning hand improve.
                        </p>
                        {/* Explanation Button */}
                        <button 
                            className="button-secondary mt-2" 
                            onClick={() => handleToggleExplanation('bettingStrategy')}
                        >
                            {showExplanation.bettingStrategy ? 'Hide Explanation' : 'Explanation'}
                        </button>
                        {showExplanation.bettingStrategy && (
                            <p className="mt-2 text-gray-300 text-sm">
                                When the true count is +2 or higher, it indicates a strong player advantage, making it a great time to raise bets. If the count drops, reduce your bet to minimize losses.
                            </p>
                        )}
                    </div>
                    
                    {/* Avoiding Detection */}
                    <div className="section-item relative">
                        <h3 className="section-title">4. Avoiding Detection</h3>
                        <p className="section-description">
                            Casinos frown upon card counting. Use betting variation and avoid obvious patterns to stay under the radar.
                        </p>
                        {/* Explanation Button */}
                        <button 
                            className="button-secondary mt-2" 
                            onClick={() => handleToggleExplanation('avoidDetection')}
                        >
                            {showExplanation.avoidDetection ? 'Hide Explanation' : 'Explanation'}
                        </button>
                        {showExplanation.avoidDetection && (
                            <p className="mt-2 text-gray-300 text-sm">
                                Using a mix of small and large bets randomly can help disguise your counting. Acting naturally and engaging with the dealer and players also makes you less suspicious.
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Embedded YouTube Video */}
                <div className="mt-8 w-full max-w-4xl">
                    <h3 className="section-title">Learn More About Card Counting</h3>
                    <div className="video-container mt-4">
                        <iframe 
                            width="100%" 
                            height="400" 
                            src="https://www.youtube.com/embed/QLYsck5fsLU" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen>
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardCountingPage;
