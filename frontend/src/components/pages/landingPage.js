import React from 'react';
import Card from 'react-bootstrap/Card';

const Landingpage = () => {
    return (
        <div className="bg-black text-black min-h-screen flex items-center justify-center p-5">
            <div className="section-item">
                {/* Main Title */}
                <h1 className="header-title">Blackjack Master</h1>
                
                {/* Subtitle */}
                <h2 className="header-subtitle mb-3">Master the Art of Blackjack & Card Counting</h2>
                
                {/* Description */}
                <p className="section-description mt-2">
                    Learn the strategies that casinos don’t want you to know. Improve your skills, practice counting cards, and increase your chances of winning.
                </p>
                
                {/* Action Buttons */}
                <div className="action-buttons flex flex-col gap-3 mt-4">
                    <a href="/signup" className="button-primary">Get Started</a>
                    <a href="/login" className="button-secondary">Login</a>
                </div>
            </div>
        </div>
    );
}

export default Landingpage;
