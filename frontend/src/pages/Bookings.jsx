
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      fetchBookings();
    }
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/booking', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Bookings response:', data);
      
      if (data.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        const userBookings = data.result.filter(b => b.userEmail === user.email);
        userBookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setBookings(userBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `http://localhost:3000/api/booking/${bookingId}/cancel`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        alert('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel booking');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) return <div className="container loading">Loading your bookings...</div>;

  return (
    <div className="container">
      <h1>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings found</h3>
          <p>You haven't made any bookings yet.</p>
          <button onClick={() => navigate('/scheduler')} className="btn-primary">
            Book a Room
          </button>
        </div>
      ) : (
        <ul className="bookings-list">
          {bookings.map((booking) => (
            <li key={booking._id} className={`booking-item ${booking.status === 'Cancelled' ? 'cancelled' : ''}`}>
              <div className="booking-details">
                <h3>{booking.roomName}</h3>
                <p>📅 {formatDate(booking.startTime)}</p>
                <p>🕒 {formatTime(booking.startTime)} - {formatTime(booking.endTime)} ({booking.duration} min)</p>
                {booking.description && <p>📝 {booking.description}</p>}
                <span className={`status-badge ${
                  booking.status === 'Booked' ? 'confirmed' : 
                  booking.status === 'Completed' ? 'completed' : 
                  'cancelled'
                }`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-actions">
                {booking.status === 'Booked' && (
                  <button 
                    onClick={() => handleCancel(booking._id)}
                    className="btn-danger"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}