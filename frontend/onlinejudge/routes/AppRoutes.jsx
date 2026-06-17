
// src/routes/AppRoutes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from '../components/Navbar/Navbar';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ProblemsList from '../pages/Problems/ProblemsList';
import ProblemView from '../pages/Problems/ProblemView';
import Contests from '../pages/Contests/Contests';
import Submissions from '../pages/Submissions/Submissions';
import Leaderboard from '../pages/Leaderboard/Leaderboard';
import AdminPanel from '../pages/AdminPanel';

import Profile from '../pages/Profile/Profile';
import Home from '../components/Home';

const AppRoutes = ({ user, isAdmin, handleLogout, handleLogin }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <Router>
      <div className="app min-h-screen bg-gray-900 text-white">
        {!isHome && <Navbar user={user} isAdmin={isAdmin} handleLogout={handleLogout} />}
        <div className="content p-4">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleLogin} />} />
            <Route path="/leaderboard" element={<Leaderboard user={user} />} />
            <Route path="/contests" element={<Contests />} />
            {user && <>
              <Route path="/problems" element={<ProblemsList user={user} />} />
              <Route path="/problems/:problemNumber" element={<ProblemView user={user} />} />
              <Route path="/submissions" element={<Submissions user={user} />} />
              <Route path="/admin/panel" element={user.role === 'admin' ? <AdminPanel /> : <div>Access denied</div>} />
              <Route path="/profile" element={<Profile user={user} />} />
            </>}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default AppRoutes;
