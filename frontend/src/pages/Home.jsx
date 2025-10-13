import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/rooms');
      setRooms(data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Meeting Room Scheduler</h1>
      <p>Book your meeting room in seconds</p>

      <div className="room-grid">
        {rooms.map((room) => (
          <div key={room._id} className="room-card">
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: room.color,
              borderRadius: '50%',
              marginBottom: '0.5rem'
            }} />
            <h3>{room.name}</h3>
            <p>Capacity: {room.capacity} people</p>
            <Link to={`/book/${room._id}`} className="btn-primary">
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}