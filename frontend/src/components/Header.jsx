import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="header">
      <nav>
        <Link to="/scheduler">🏠 Scheduler</Link>
        <Link to="/bookings">📋 My Bookings</Link>
        <span>Welcome, {user.name || 'User'}</span>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </nav>
    </header>
  );
}