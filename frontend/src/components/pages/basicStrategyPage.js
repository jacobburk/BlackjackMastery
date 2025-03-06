import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import getUserInfo from '../../utilities/decodeJwt'; // Assuming this function gets user info from JWT
import '../../css/global.css'

const BlackjackStrategyPage = () => {
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

    const handleToggleExplanation = (section) => {
        setShowExplanation((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    if (!user) {
        return null; // Optionally, you could display a loading spinner here
    }

    return (
        <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-5">
            <div className="section-item text-center w-full max-w-4xl px-6 py-8 space-y-8">
                {/* Main Title */}
                <h1 className="header-title">Blackjack Basic Strategy</h1>
                
                {/* Subtitle */}
                <h2 className="header-subtitle mb-3">Master the Essential Blackjack Strategies</h2>
                
                {/* Description */}
                <p className="section-description mt-2">
                    The key to winning at Blackjack is understanding the basic strategy. Whether you’re a beginner or an experienced player, knowing when to hit, stand, double down, or split will significantly improve your chances of winning.
                </p>

                {/* Basic Strategy Sections */}
                <div className="space-y-8">
                    {/* When to Hit Section */}
                    <div className="section-item">
                        <h3 className="section-title">1. When to Hit</h3>
                        <p className="section-description">
                            If your total is 8 or less, always hit. If your total is between 12 and 16 and the dealer's card is 2-6, you should stand. Otherwise, hit to try and improve your hand.
                        </p>
                        {/* Explanation Button */}
                        <button 
                            className="button-secondary absolute bottom-4 left-4" 
                            onClick={() => handleToggleExplanation('hit')}
                        >
                            {showExplanation.hit ? 'Hide Explanation' : 'Explanation'}
                        </button>
                        {showExplanation.hit && (
                            <p className="mt-2 text-gray-300 text-sm">
                                When your hand value is low, hitting increases your chances of improving your hand. If the dealer shows a weak card (2-6), you can stand to force them into busting, but hitting is safer if the dealer has stronger cards.
                            </p>
                        )}
                    </div>
                    
                    {/* When to Stand Section */}
                    <div className="section-item">
                        <h3 className="section-title">2. When to Stand</h3>
                        <p className="section-description">
                            Stand when you have a total of 17 or more. Also, stand when you have a hand value between 12-16 if the dealer is showing a 2-6.
                        </p>
                        {/* Explanation Button */}
                        <button 
                            className="button-secondary absolute bottom-4 left-4" 
                            onClick={() => handleToggleExplanation('stand')}
                        >
                            {showExplanation.stand ? 'Hide Explanation' : 'Explanation'}
                        </button>
                        {showExplanation.stand && (
                            <p className="mt-2 text-gray-300 text-sm">
                                Standing on 17 or more ensures that you are unlikely to bust. If the dealer is showing a weak card, standing with 12-16 forces them into a risky position where they may bust.
                            </p>
                        )}
                    </div>
                    
                    {/* When to Double Down Section */}
                    <div className="section-item">
                        <h3 className="section-title">3. When to Double Down</h3>
                        <p className="section-description">
                            If you have a total of 11, always double down. For totals of 10, double down when the dealer’s face-up card is 9 or lower.
                        </p>
                        {/* Explanation Button */}
                        <button 
                            className="button-secondary absolute bottom-4 left-4" 
                            onClick={() => handleToggleExplanation('doubleDown')}
                        >
                            {showExplanation.doubleDown ? 'Hide Explanation' : 'Explanation'}
                        </button>
                        {showExplanation.doubleDown && (
                            <p className="mt-2 text-gray-300 text-sm">
                                Doubling down allows you to double your bet while receiving only one more card. This is optimal when you have a strong chance of getting a favorable card, especially if the dealer has a weaker upcard.
                            </p>
                        )}
                    </div>
                    
                    {/* When to Split Section */}
                    <div className="section-item">
                        <h3 className="section-title">4. When to Split</h3>
                        <p className="section-description">
                            Always split Aces and 8s. Avoid splitting 10s, 5s, or 4s as these are strong hands.
                        </p>
                        {/* Explanation Button */}
                        <button 
                            className="button-secondary absolute bottom-4 left-4" 
                            onClick={() => handleToggleExplanation('split')}
                        >
                            {showExplanation.split ? 'Hide Explanation' : 'Explanation'}
                        </button>
                        {showExplanation.split && (
                            <p className="mt-2 text-gray-300 text-sm">
                                Splitting Aces and 8s gives you the best chance at winning by creating two separate hands. A pair of 10s or 5s already represents a strong hand, so it's best to leave them together for the highest chance of winning.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlackjackStrategyPage;
