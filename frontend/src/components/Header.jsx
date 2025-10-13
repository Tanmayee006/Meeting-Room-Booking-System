import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <nav>
        {/* <Link to="/">Home</Link> */}
        {token ? (
          <>
            <Link to="/scheduler">Scheduler</Link>
            <Link to="/bookings">My Bookings</Link>
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </>
        ) : (
          <>
            {/* <Link to="/login">Login</Link>
            <Link to="/register">Register</Link> */}
          </>
        )}
      </nav>
    </header>
  );
}