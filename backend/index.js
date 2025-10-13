import dotenv from 'dotenv'
import connectDB from './db/db.js'
import app from './app.js'
import userRouter from './routes/user.route.js'
import bookingRouter from './routes/booking.route.js';
import cors from 'cors';


dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use('/api', userRouter);
app.use('/api', bookingRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Meeting Room Scheduler API is running' });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    })
}).catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
});