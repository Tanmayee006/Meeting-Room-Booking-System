import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Scheduler.css';

export default function Scheduler() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
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
    if (!token) navigate('/');
    else fetchBookings();
  }, [navigate, selectedDate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/booking', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const slotTime = new Date(`${selectedDate}T${time24}:00`);
  
      return (
        bookStart.getHours() === slotTime.getHours() &&
        bookStart.getMinutes() === slotTime.getMinutes()
      );
    });
  };
  

  const handleSlotClick = (room, time) => {
    if (getBookingForSlot(room.name, time)) return;
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

      if (data.success) {
        setBookings((prev) => [...prev, data.result]);
        setShowModal(false);
        setDescription('');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  const handleFreeUp = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/booking/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch {
      alert('Failed to cancel booking');
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/booking/${bookingId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // update status in state instead of removing
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'Completed' } : b))
      );
    } catch {
      alert('Failed to complete booking');
    }
  };

  return (
    <div className="scheduler-container">
      <h1>📅 Meeting Room Scheduler</h1>
      <div className="scheduler-grid">
        {/* Time column */}
        <div className="time-column">
          <div className="header-cell">Meeting Rooms</div>
          {timeSlots.map((time) => (
            <div key={time} className="time-cell">
              {time}
            </div>
          ))}
        </div>

        {/* Room columns */}
        {rooms.map((room) => (
          <div key={room._id} className="room-column">
            <div className="room-header">{room.name}</div>
            {timeSlots.map((time) => {
              const booking = getBookingForSlot(room.name, time);
              const slotClass =
                booking?.status === 'Completed'
                  ? 'completed'
                  : booking
                  ? 'booked'
                  : 'available';
              return (
                <div
                  key={time}
                  className={`time-slot ${slotClass}`}
                  onClick={() => handleSlotClick(room, time)}
                >
                  {booking && (
                    <div className="booking-info">
                      <div>👤 {booking.userName}</div>
                      <div>{booking.duration} min</div>
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
                      {booking.status === 'Completed' && <div>✅ Completed</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Book Meeting Room</h2>
            <p>
              <strong>Room:</strong> {selectedSlot?.room.name}
            </p>
            <p>
              <strong>Time:</strong> {selectedSlot?.time}
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting description"
            />
            <button className="confirm-btn" onClick={handleBooking}>
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
