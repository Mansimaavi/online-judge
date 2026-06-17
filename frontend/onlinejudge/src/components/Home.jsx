import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/panel');
      } else {
        navigate('/problems');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-600 via-purple-700 to-pink-600 flex flex-col">
      <main className="flex-grow flex flex-col justify-center items-center px-4 text-center text-white">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Welcome to YOURCODE
        </h2>
        <p className="text-lg md:text-xl max-w-xl mb-10 drop-shadow-md">
          Your platform to solve coding challenges, compete in contests, and improve your skills.
          Join our community and code your way to success!
        </p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-white text-indigo-700 font-bold rounded-lg shadow-lg hover:bg-indigo-50 transition"
          >
            Get Started
          </Link>
          <Link
            to="/register"
            className="inline-block px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-700 transition"
          >
            Create Account
          </Link>
        </div>
      </main>
      <footer className="py-4 bg-indigo-900 bg-opacity-80 text-center text-indigo-200">
        © 2025 YOURCODE. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;