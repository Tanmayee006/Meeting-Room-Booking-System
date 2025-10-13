
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BookRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    duration: 60,
    purpose: ''
  });

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/rooms/${roomId}`);
      setRoom(data.room);
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to book a room');
      navigate('/login');
      return;
    }

    try {
      const [hour, minute] = formData.startTime.split(':').map(Number);
      const endHour = hour + Math.floor(formData.duration / 60);
      const endMinute = minute + (formData.duration % 60);
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      await axios.post('http://localhost:3000/api/bookings', {
        roomId,
        date: formData.date,
        startTime: formData.startTime,
        endTime,
        duration: formData.duration,
        purpose: formData.purpose
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Booking successful!');
      navigate('/bookings');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  if (!room) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Book {room.name}</h1>
      <p>Capacity: {room.capacity} people</p>

      <form onSubmit={handleSubmit}>
        <label>
          Date
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </label>

        <label>
          Start Time
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </label>

        <label>
          Duration (minutes)
          <select
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            required
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
        </label>

        <label>
          Purpose (optional)
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="Meeting purpose..."
            rows={3}
          />
        </label>

        <button type="submit" className="btn-primary">Book Room</button>
      </form>
    </div>
  );
}