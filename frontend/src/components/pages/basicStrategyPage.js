import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import getUserInfo from '../../utilities/decodeJwt'; // Assuming this function gets user info from JWT
import '../../css/global.css'

const BlackjackStrategyPage = () => {
    const [user, setUser] = useState(null);
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

    if (!user) {
        return null; // Optionally, you could display a loading spinner here
    }

    return (
        <div className="bg-black text-white min-h-screen flex items-center justify-center p-5">
            <div className="section-item text-center w-full max-w-4xl px-6 py-8">
                {/* Main Title */}
                <h1 className="header-title">Blackjack Basic Strategy</h1>
                
                {/* Subtitle */}
                <h2 className="header-subtitle mb-3">Master the Essential Blackjack Strategies</h2>
                
                {/* Description */}
                <p className="section-description mt-2">
                    The key to winning at Blackjack is understanding the basic strategy. Whether you’re a beginner or an experienced player, knowing when to hit, stand, double down, or split will significantly improve your chances of winning.
                </p>

                {/* Basic Strategy Sections */}
            
                    <div className="section-item ">
                        <h3 className="section-title">1. When to Hit</h3>
                        <p className="section-description">
                            If your total is 8 or less, always hit. If your total is between 12 and 16 and the dealer's card is 2-6, you should stand. Otherwise, hit to try and improve your hand.
                        </p>
                    </div>
                    <div className="section-item ">
                        <h3 className="section-title">2. When to Stand</h3>
                        <p className="section-description">
                            Stand when you have a total of 17 or more. Also, stand when you have a hand value between 12-16 if the dealer is showing a 2-6.
                        </p>
                    </div>
                    <div className="section-item ">
                        <h3 className="section-title">3. When to Double Down</h3>
                        <p className="section-description">
                            If you have a total of 11, always double down. For totals of 10, double down when the dealer’s face-up card is 9 or lower.
                        </p>
                    </div>
                    <div className="section-item ">
                        <h3 className="section-title">4. When to Split</h3>
                        <p className="section-description">
                            Always split Aces and 8s. Avoid splitting 10s, 5s, or 4s as these are strong hands.
                        </p>
                    </div>
                    
                </div>
                </div>
    
    );
}

export default BlackjackStrategyPage;
