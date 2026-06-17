// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Register from './pages/Login/Register/Register.jsx';
import Login from './pages/Login/Login.jsx';
import Home from './components/Home.jsx';

// Problem pages
import ProblemsList from './pages/Problems/ProblemsList.jsx';
import ProblemView from './pages/Problems/ProblemView.jsx';

// Submissions page
import Submissions from './pages/Submissions/Submissions.jsx';

import AdminView from './pages/Admin/AdminView.jsx';
import EditProblemPage from './pages/Admin/EditProblemPage.jsx';
import ProblemsEditList from './pages/Admin/ProblemsEditList.jsx';
import { getCurrentUser } from './api';
import Leaderboard from './pages/Leaderboard/Leaderboard.jsx';

import './App.css';



function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser().then(currentUser => {
        if (currentUser) {
          setUser(currentUser);
          setIsAdmin(currentUser.role === 'admin');
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      });
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
    if (userData.role === 'admin') {
      navigate('/admin/panel');
    } else {
      navigate('/problems');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="app min-h-screen bg-gray-900 text-white">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <div className="content p-4">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />

          {/* Problems Routes */}
          <Route path="/problems" element={<ProblemsList user={user} isAdmin={isAdmin} />} />
          <Route path="/problems/:problemNumber" element={<ProblemView user={user} />} />

          {/* Submissions Route */}
          <Route path="/submissions" element={<Submissions user={user} />} />

          {/* Leaderboard Route */}
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Admin Panel Route */}
          <Route path="/admin/panel" element={user && user.role === 'admin' ? <AdminView /> : <div>Access denied</div>} />
          <Route path="/admin/panel/edit/:problemNumber" element={<EditProblemPage />} />
          <Route path="/admin/panel/problems" element={<ProblemsEditList />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
