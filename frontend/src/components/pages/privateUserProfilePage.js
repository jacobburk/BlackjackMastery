import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";

const PrivateUserProfile = () => {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // handle logout button
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const currentUser = getUserInfo();
    setUser(currentUser);

    if (currentUser?.id) {
      fetch(`http://localhost:8081/stats/${currentUser.id}/view`)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error("Error fetching stats:", err));
    }
  }, []);

  if (!user) {
    return (
      <div className="text-white text-center mt-20">
        <h4>Log in to view this page.</h4>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col justify-center items-center">
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-red-500">{user.username}</h1>

        {/* Display stats if available */}
        {stats ? (
          <div className="mt-6 space-y-2 text-lg text-gray-300">
            <p><span className="text-white font-semibold">Hands Played:</span> {stats.handsPlayed}</p>
            <p><span className="text-white font-semibold">Hands Won:</span> {stats.handsWon}</p>
            <p><span className="text-white font-semibold">Win Rate:</span> {stats.winRate}</p>
          </div>
        ) : (
          <p className="mt-6 text-gray-500">Loading stats...</p>
        )}
      </div>

      {/* Log Out Button */}
      <div className="mt-10">
        <button
          onClick={handleShow}
          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
        >
          Log Out
        </button>
      </div>

      {/* Log Out Modal */}
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 rounded-lg w-1/3 p-6">
            <h3 className="text-xl text-center text-red-500 mb-4">
              Are you sure you want to Log Out?
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Close
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateUserProfile;
