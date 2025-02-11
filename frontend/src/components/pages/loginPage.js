import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import getUserInfo from "../../utilities/decodeJwt";

const Login = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ target: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  useEffect(() => {
    const obj = getUserInfo(user);
    setUser(obj);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: res } = await axios.post(
        `${process.env.REACT_APP_BACKEND_SERVER_URI}/user/login`,
        data
      );
      const { accessToken } = res;
      localStorage.setItem("accessToken", accessToken);
      navigate("/home");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  if (user) {
    navigate("/home");
    return null;
  }

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center p-5">
      <div className="bg-gray-900 border-2 border-red-500 shadow-lg text-center p-6 rounded-lg w-96">
        <h1 className="text-red-500 text-3xl font-bold">Log In</h1>
        <p className="text-white mt-2">Welcome back to Blackjack Master!</p>
        <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="p-2 rounded bg-gray-800 text-white border border-red-500 focus:outline-none"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="p-2 rounded bg-gray-800 text-white border border-red-500 focus:outline-none"
            onChange={handleChange}
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-red-600 text-white py-2 rounded-lg text-lg font-semibold hover:bg-red-700"
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-400">
          Don't have an account? <Link to="/signup" className="text-red-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
