import dotenv from 'dotenv'
import connectDB from './db/db.js'
import app from './app.js'
import userRouter from './routes/user.route.js'
import bookingRouter from './routes/booking.route.js';

dotenv.config();

const PORT = process.env.PORT || 7000

app.use('/api/', userRouter);

app.use('/api/', bookingRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})