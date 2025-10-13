import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Scheduler() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(60);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [description, setDescription] = useState('');

  // Fixed room names matching the UI
  const rooms = [
    { _id: '1', name: 'Lagos Meeting Blue', color: '#3B82F6' },
    { _id: '2', name: 'Nairobi Conference', color: '#8B5CF6' },
    { _id: '3', name: 'Cairo Board Room', color: '#10B981' }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      fetchBookings();
    }
  }, [navigate, selectedDate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:3000/api/booking`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        setBookings(data.result);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const convertTo24Hour = (time) => {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isSlotBooked = (roomName, startTime) => {
    const time24 = convertTo24Hour(startTime);
    
    return bookings.some(booking => {
      if (booking.roomName !== roomName || booking.status === 'Cancelled') return false;
      
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      if (bookingDate !== selectedDate) return false;
      
      const bookStart = new Date(booking.startTime);
      const bookEnd = new Date(booking.endTime);
      const slotTime = new Date(`${selectedDate}T${time24}:00`);
      
      return slotTime >= bookStart && slotTime < bookEnd;
    });
  };

  const getBookingForSlot = (roomName, startTime) => {
    const time24 = convertTo24Hour(startTime);
    
    return bookings.find(booking => {
      if (booking.roomName !== roomName || booking.status === 'Cancelled') return false;
      
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      if (bookingDate !== selectedDate) return false;
      
      const bookStart = new Date(booking.startTime);
      const slotTime = new Date(`${selectedDate}T${time24}:00`);
      
      return bookStart.getTime() === slotTime.getTime();
    });
  };

  const handleSlotClick = (room, time) => {
    if (isSlotBooked(room.name, time)) return;
    
    setSelectedSlot({ room, time });
    setShowModal(true);
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      const token = localStorage.getItem('token');
      const startTime24 = convertTo24Hour(selectedSlot.time);
      const [hours, minutes] = startTime24.split(':').map(Number);
      const endHours = hours + Math.floor(duration / 60);
      const endMinutes = minutes + (duration % 60);
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      const startDateTime = new Date(`${selectedDate}T${startTime24}:00`);
      const endDateTime = new Date(`${selectedDate}T${endTime}:00`);

      const response = await axios.post('http://localhost:3000/api/booking', {
        roomName: selectedSlot.room.name,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration,
        description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Booking successful!');
        setShowModal(false);
        setDescription('');
        fetchBookings();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  const handleFreeUp = async (bookingId) => {
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
              const booking = getBookingForSlot(room.name, time);
              const isBooked = isSlotBooked(room.name, time);
              
              return (
                <div
                  key={time}
                  className={`time-slot ${isBooked ? 'booked' : 'available'}`}
                  onClick={() => handleSlotClick(room, time)}
                >
                  {booking && (
                    <div className="booking-info" style={{ borderLeftColor: room.color }}>
                      <div className="booking-user">👤 {booking.userName}</div>
                      <div className="booking-duration">{booking.duration} min</div>
                      <button 
                        className="free-up-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFreeUp(booking._id);
                        }}
                      >
                        × Free Up
                      </button>
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
              <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedSlot?.time}</p>
              <p><strong>Duration:</strong> {duration} minutes</p>
              
              <label>
                Description (optional):
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Meeting description..."
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