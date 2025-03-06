import React from "react";

const Card = ({ card }) => {
  if (card === "back") {
    return <img src={`/cards/back.png`} alt="Card Back" className="w-16 h-24" />;
  }

  const [value, suit] = card.split("-"); // Splits "K-d" → ["K", "d"]
  const capitalizedSuit = suit.charAt(0).toUpperCase() ;

  // Directly use the short suit code (no need for mapping)
  const imageSrc = `/cards/${value}-${capitalizedSuit}.png`;

  return (
    <div>
    <img 
      src={imageSrc} 
      className="w-16 h-24"
      alt={`${value} of ${capitalizedSuit}`} 
      onError={(e) => e.target.src = "/cards/back.png"} // Fallback if image is missing
    />
    </div>
  );
};

export default Card;
