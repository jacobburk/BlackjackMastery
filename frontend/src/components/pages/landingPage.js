import React from 'react'
import Card from 'react-bootstrap/Card';

const Landingpage = () => {
    
    return (
        <div className="bg-black text-white min-h-screen flex items-center justify-center p-5">
        <div className="bg-gray-900 border-2 border-red-500 shadow-lg text-center p-6 rounded-lg w-96">
            <h1 className="text-red-500 text-3xl font-bold">Blackjack Master</h1>
            <h2 className="mb-3 text-white text-lg">Master the Art of Blackjack & Card Counting</h2>
            <p className="text-white mt-2">
                Learn the strategies that casinos don’t want you to know. Improve your skills, practice counting cards, and increase your chances of winning.
            </p>
            <div className="flex flex-col gap-3 mt-4">
                <a href="/signup" className="bg-red-600 text-white py-2 rounded-lg text-lg font-semibold hover:bg-red-700">Get Started</a>
                <a href="/login" className="border border-white text-white py-2 rounded-lg text-lg font-semibold hover:bg-white hover:text-black">Login</a>
            </div>
        </div>
    </div>
);
}

export default Landingpage;