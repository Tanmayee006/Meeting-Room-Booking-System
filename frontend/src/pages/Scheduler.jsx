import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Scheduler() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(60);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [purpose, setPurpose] = useState('');

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 9 + i;
    return `${hour}:00`;
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchBookings();
    }
  }, [selectedDate]);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/rooms');
      setRooms(data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:3000/api/bookings?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const isSlotBooked = (roomId, startTime) => {
    return bookings.some(booking => {
      if (booking.room._id !== roomId || booking.status === 'cancelled') return false;
      
      const [bookStartHour] = booking.startTime.split(':').map(Number);
      const [slotHour] = startTime.split(':').map(Number);
      const [bookEndHour] = booking.endTime.split(':').map(Number);
      
      return slotHour >= bookStartHour && slotHour < bookEndHour;
    });
  };

  const getBookingForSlot = (roomId, startTime) => {
    return bookings.find(booking => {
      if (booking.room._id !== roomId || booking.status === 'cancelled') return false;
      
      const [bookStartHour] = booking.startTime.split(':').map(Number);
      const [slotHour] = startTime.split(':').map(Number);
      
      return bookStartHour === slotHour;
    });
  };

  const handleSlotClick = (room, time) => {
    if (isSlotBooked(room._id, time)) return;
    
    setSelectedSlot({ room, time });
    setShowModal(true);
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      const token = localStorage.getItem('token');
      const [hour] = selectedSlot.time.split(':').map(Number);
      const endHour = hour + Math.floor(duration / 60);
      const endTime = `${endHour}:00`;

      await axios.post('http://localhost:7000/api/bookings', {
        roomId: selectedSlot.room._id,
        date: selectedDate,
        startTime: selectedSlot.time,
        endTime,
        duration,
        purpose
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Booking successful!');
      setShowModal(false);
      setPurpose('');
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="scheduler-container">
      <div className="scheduler-header">
        <h1>📅 Meeting Room Scheduler</h1>
        <p>Book your meeting room in seconds</p>
        <div className="date-selector">
          <label>
            Today
            <span className="date-display">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </label>
        </div>
      </div>

      <div className="scheduler-controls">
        <label className="duration-selector">
          Booking Duration:
          <div className="duration-buttons">
            <button 
              className={duration === 30 ? 'active' : ''} 
              onClick={() => setDuration(30)}
            >
              30 min
            </button>
            <button 
              className={duration === 45 ? 'active' : ''} 
              onClick={() => setDuration(45)}
            >
              45 min
            </button>
            <button 
              className={duration === 60 ? 'active' : ''} 
              onClick={() => setDuration(60)}
            >
              60 min
            </button>
          </div>
        </label>

        <div className="legend">
          <span>Legend:</span>
          <div className="legend-item">
            <div className="legend-box available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-box booked"></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="legend-box selected"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      <div className="scheduler-grid">
        <div className="time-column">
          <div className="header-cell">Meeting Rooms</div>
          {timeSlots.map(time => (
            <div key={time} className="time-cell">{time}</div>
          ))}
        </div>

        {rooms.map(room => (
          <div key={room._id} className="room-column">
            <div className="room-header" style={{ borderTopColor: room.color }}>
              <div className="room-indicator" style={{ backgroundColor: room.color }} />
              {room.name}
            </div>
            {timeSlots.map(time => {
              const booking = getBookingForSlot(room._id, time);
              const isBooked = isSlotBooked(room._id, time);
              
              return (
                <div
                  key={time}
                  className={`time-slot ${isBooked ? 'booked' : 'available'}`}
                  onClick={() => handleSlotClick(room, time)}
                  style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
                >
                  {booking && booking.startTime === time && (
                    <div className="booking-info" style={{ backgroundColor: `${room.color}20` }}>
                      <div className="booking-user">👤 {booking.userName}</div>
                      <div className="booking-duration">{booking.duration} min</div>
                      <button className="free-up-btn">× Free Up</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Book Meeting Room</h2>
            <div className="modal-content">
              <p><strong>Room:</strong> {selectedSlot?.room.name}</p>
              <p><strong>Date:</strong> {selectedDate}</p>
              <p><strong>Time:</strong> {selectedSlot?.time}</p>
              <p><strong>Duration:</strong> {duration} minutes</p>
              
              <label>
                Purpose (optional):
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Meeting purpose..."
                  rows={3}
                />
              </label>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleBooking}>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}