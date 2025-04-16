import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getUserInfo from '../../utilities/decodeJwt';
import '../../css/global.css';  // Import the global CSS

const HomePage = () => {
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        localStorage.removeItem('accessToken');
        return navigate('/');
    };

    useEffect(() => {
        setUser(getUserInfo());
    }, []);

    if (!user) return (
        <div className="login-message">
            <h4>Log in to view this page.</h4>
        </div>
    );

    const { username } = user;

    return (
        <div className="bg-black text-white min-h-screen relative">
            <header className="text-center py-10">
                <h1 className="header-title">Blackjack Master</h1>
                <p className="header-subtitle">Your ultimate resource for mastering Blackjack and Card Counting!</p>
            </header>

            <div className="section-container">
                {/* Blackjack Basic Strategy Section */}
                <div className="section-item">
                    <h3 className="section-title">Blackjack Basic Strategy</h3>
                    <p className="section-description">Learn the basic strategy for Blackjack, the optimal moves for every hand based on your cards and the dealer's upcard.</p>
                    <button 
                        onClick={() => navigate('/basic-strategy')} 
                        className="button-primary"
                    >
                        Learn More
                    </button>
                </div>

                {/* Card Counting Section */}
                <div className="section-item">
                    <h3 className="section-title">Card Counting</h3>
                    <p className="section-description">Understand how card counting can give you an edge over the casino. Master the techniques and start improving your odds.</p>
                    <button 
                        onClick={() => navigate('/card-counting')} 
                        className="button-primary"
                    >
                        Learn More
                    </button>
                </div>

                {/* Practicing Blackjack Section */}
                <div className="section-item">
                    <h3 className="section-title">Practicing Blackjack</h3>
                    <p className="section-description">Practice your Blackjack skills with interactive tools and challenges that help you improve both basic strategy and card counting.</p>
                    <button 
                        onClick={() => navigate('/practice')} 
                        className="button-primary"
                    >
                        Start Practicing
                    </button>
                </div>
            </div>

        </div>
    );
};

export default HomePage;
