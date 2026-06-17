// src/components/Navbar/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      onLogout();
      navigate('/login');
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <div className="text-2xl font-bold text-indigo-400">
        <NavLink to="/" className="hover:text-indigo-300 transition">
          YourCode
        </NavLink>
      </div>

      <div className="flex space-x-6 text-sm md:text-base">
        <NavLink to="/problems" className="hover:text-indigo-300">Problems</NavLink>
        {user && <NavLink to="/submissions" className="hover:text-indigo-300">Submissions</NavLink>}
        <NavLink to="/contests" className="hover:text-indigo-300">Contests</NavLink>
        <NavLink to="/leaderboard" className="hover:text-indigo-300">Leaderboard</NavLink>
        {user && user.role === 'admin' && (
          <NavLink to="/admin/panel" className="hover:text-indigo-300 font-bold">Admin Panel</NavLink>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Welcome,</span>
              <span className="text-indigo-400 font-semibold">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500 transition font-semibold"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/register" className="hover:text-indigo-300">Register</NavLink>
            <NavLink
              to="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition font-semibold"
            >
              Login
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
