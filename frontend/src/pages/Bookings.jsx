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
      
      if (data.success) {
        // Filter only user's bookings
        const user = JSON.parse(localStorage.getItem('user'));
        const userBookings = data.result.filter(b => b.userEmail === user.email);
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
      await axios.put(`http://localhost:3000/api/booking/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  if (loading) return <div className="container loading">Loading...</div>;

  return (
    <div className="container">
      <h1>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings found</h3>
          <p>You haven't made any bookings yet.</p>
        </div>
      ) : (
        <ul className="bookings-list">
          {bookings.map((booking) => (
            <li key={booking._id} className={`booking-item ${booking.status === 'Cancelled' ? 'cancelled' : ''}`}>
              <div className="booking-details">
                <h3>{booking.roomName}</h3>
                <p>📅 {new Date(booking.startTime).toLocaleDateString()}</p>
                <p>🕒 {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.duration} min)</p>
                {booking.description && <p>📝 {booking.description}</p>}
                <span className={`status-badge ${booking.status === 'Booked' ? 'confirmed' : 'cancelled'}`}>
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


