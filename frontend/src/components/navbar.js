import React, { useEffect, useState } from "react";
import getUserInfo from "../utilities/decodeJwt";

export default function Navbar() {
  const [user, setUser] = useState({});

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  return (
    <nav className="bg-black text-white py-4">
      <div className="container mx-auto flex justify-center">
        <div className="flex space-x-6 text-lg">
          <a href="/home" className="text-red-600 hover:text-red-400 transition-all">Home</a>
          <a href="/privateUserProfile" className="text-red-600 hover:text-red-400 transition-all">Profile</a>
          <a href="/practice" className="text-red-600 hover:text-red-400 transition-all">Practice</a>
          <a href="/basic-strategy" className="text-red-600 hover:text-red-400 transition-all">Basic Strategy Guide</a>
          <a href="/card-counting" className="text-red-600 hover:text-red-400 transition-all">Card Counting Guide</a>
        </div>
      </div>
    </nav>
  );
}