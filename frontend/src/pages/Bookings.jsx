import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data.bookings);
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
      await axios.patch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      alert('Failed to delete booking');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="bookings-list">
          {bookings.map((booking) => (
            <li key={booking._id} className={`booking-item ${booking.status}`}>
              <div className="booking-details">
                <h3>{booking.room.name}</h3>
                <p>📅 {new Date(booking.date).toLocaleDateString()}</p>
                <p>🕒 {booking.startTime} - {booking.endTime} ({booking.duration} min)</p>
                {booking.purpose && <p>📝 {booking.purpose}</p>}
                <span className={`status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-actions">
                {booking.status === 'confirmed' && (
                  <>
                    <button 
                      onClick={() => handleCancel(booking._id)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleDelete(booking._id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}