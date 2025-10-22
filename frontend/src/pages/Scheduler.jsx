import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Scheduler.css';

export default function Scheduler() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(60);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [description, setDescription] = useState('');
  const rooms = [
    { _id: '1', name: 'Lagos Meeting Blue', color: '#3B82F6' },
    { _id: '2', name: 'Nairobi Conference', color: '#8B5CF6' },
    { _id: '3', name: 'Cairo Board Room', color: '#10B981' },
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
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
      const { data } = await axios.get('http://localhost:3000/api/booking', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched bookings:', data);
      setBookings(Array.isArray(data.result) ? data.result : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const convertTo24Hour = (time) => {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getBookingForSlot = (roomName, startTime) => {
    const time24 = convertTo24Hour(startTime);
    
    return bookings.find((booking) => {
      if (booking.roomName !== roomName) return false;
      
      const bookingDate = new Date(booking.startTime).toISOString().split('T')[0];
      if (bookingDate !== selectedDate) return false;
  
      const bookStart = new Date(booking.startTime);
      const bookHour = bookStart.getHours();
      const bookMinute = bookStart.getMinutes();
      
      const [slotHour, slotMinute] = time24.split(':').map(Number);
  
      return bookHour === slotHour && bookMinute === slotMinute;
    });
  };

  const handleSlotClick = (room, time) => {
    const booking = getBookingForSlot(room.name, time);
    if (booking) return;
    
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

      console.log('Booking request:', {
        roomName: selectedSlot.room.name,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration,
        description,
      });

      const { data } = await axios.post(
        'http://localhost:3000/api/booking',
        {
          roomName: selectedSlot.room.name,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          duration,
          description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Booking response:', data);

      if (data.success) {
        alert('Booking successful!');
        await fetchBookings();
        setShowModal(false);
        setDescription('');
        setSelectedSlot(null);
      } else {
        alert(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  const handleFreeUp = async (bookingId) => {
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
        await fetchBookings();
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel booking');
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `http://localhost:3000/api/booking/${bookingId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        alert('Booking marked as completed');
        await fetchBookings();
      }
    } catch (error) {
      console.error('Complete error:', error);
      alert('Failed to complete booking');
    }
  };

  return (
    <div className="scheduler-container">
      <div className="scheduler-header">
        <h1>📅 Meeting Room Scheduler</h1>
        <div className="date-selector">
          <label>
            Select Date:
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </label>
        </div>
      </div>

      <div className="scheduler-controls">
        <div className="duration-selector">
          <span>Duration:</span>
          <div className="duration-buttons">
            <button 
              className={duration === 30 ? 'active' : ''} 
              onClick={() => setDuration(30)}
            >
              30 min
            </button>
            <button 
              className={duration === 60 ? 'active' : ''} 
              onClick={() => setDuration(60)}
            >
              60 min
            </button>
            <button 
              className={duration === 90 ? 'active' : ''} 
              onClick={() => setDuration(90)}
            >
              90 min
            </button>
          </div>
        </div>
      </div>

      <div className="scheduler-grid">
        <div className="time-column">
          <div className="header-cell">Time</div>
          {timeSlots.map((time) => (
            <div key={time} className="time-cell">
              {time}
            </div>
          ))}
        </div>

        {rooms.map((room) => (
          <div key={room._id} className="room-column">
            <div className="room-header" style={{ borderTopColor: room.color }}>
              <div className="room-indicator" style={{ backgroundColor: room.color }} />
              {room.name}
            </div>
            {timeSlots.map((time) => {
              const booking = getBookingForSlot(room.name, time);
              const slotClass = booking ? 'booked' : 'available';
              
              return (
                <div
                  key={time}
                  className={`time-slot ${slotClass}`}
                  onClick={() => !booking && handleSlotClick(room, time)}
                >
                  {booking && (
                    <div className="booking-info" style={{ borderLeftColor: room.color }}>
                      <div className="booking-user">👤 {booking.userName}</div>
                      <div className="booking-duration">⏱️ {booking.duration} min</div>
                      {booking.description && (
                        <div className="booking-description">📝 {booking.description}</div>
                      )}
                      <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                        {booking.status === 'Booked' && (
                          <>
                            <button
                              className="cancel-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFreeUp(booking._id);
                              }}
                            >
                              ❌ Cancel
                            </button>
                            <button
                              className="done-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComplete(booking._id);
                              }}
                            >
                              ✅ Done
                            </button>
                          </>
                        )}
                        {booking.status === 'Completed' && (
                          <div style={{ color: '#10B981', fontWeight: 'bold' }}>✅ Completed</div>
                        )}
                      </div>
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
            <p><strong>Room:</strong> {selectedSlot?.room.name}</p>
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
              <button className="confirm-btn" onClick={handleBooking}>
                Confirm Booking
              </button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
