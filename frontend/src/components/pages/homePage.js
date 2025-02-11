import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getUserInfo from '../../utilities/decodeJwt';

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
        <div className="text-white text-center mt-20">
            <h4>Log in to view this page.</h4>
        </div>
    );

    const { username } = user;

    return (
        <div className="bg-black text-white min-h-screen relative">
            <header className="text-center py-10">
                <h1 className="text-4xl font-bold text-red-500">Blackjack Master</h1>
                <p className="mt-4 text-lg">Your ultimate resource for mastering Blackjack and Card Counting!</p>
            </header>

            
            <div className="flex justify-between mt-10 px-10">
                {/* Blackjack Basic Strategy Section */}
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-1/3">
                    <h3 className="text-2xl font-semibold text-red-500">Blackjack Basic Strategy</h3>
                    <p className="mt-4">Learn the basic strategy for Blackjack, the optimal moves for every hand based on your cards and the dealer's upcard.</p>
                    <button 
                        onClick={() => navigate('/basic-strategy')} 
                        className="mt-4 w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-700 transition duration-300"
                    >
                        Learn More
                    </button>
                </div>

                {/* Card Counting Section */}
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-1/3">
                    <h3 className="text-2xl font-semibold text-red-500">Card Counting</h3>
                    <p className="mt-4">Understand how card counting can give you an edge over the casino. Master the techniques and start improving your odds.</p>
                    <button 
                        onClick={() => navigate('/card-counting')} 
                        className="mt-4 w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-700 transition duration-300"
                    >
                        Learn More
                    </button>
                </div>

                {/* Practicing Blackjack Section */}
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-1/3">
                    <h3 className="text-2xl font-semibold text-red-500">Practicing Blackjack</h3>
                    <p className="mt-4">Practice your Blackjack skills with interactive tools and challenges that help you improve both basic strategy and card counting.</p>
                    <button 
                        onClick={() => navigate('/practice')} 
                        className="mt-4 w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-700 transition duration-300"
                    >
                        Start Practicing
                    </button>
                </div>
            </div>

            {/* View Profile Button */}
            <button 
                onClick={() => navigate('/privateUserProfile')} 
                className="absolute top-10 right-10 px-4 py-2 bg-black text-white border-2 border-red-500 font-bold text-sm rounded-lg hover:bg-red-500 hover:border-black transition duration-300"
            >
                View Profile
            </button>
        </div>
    );
};

export default HomePage;
