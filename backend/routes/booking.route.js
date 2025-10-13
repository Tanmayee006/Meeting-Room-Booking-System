import { Router  } from "express";
import {bookRoom, getAllBookings, cancelBooking, getBookingById, completeBooking} from '../controllers/booking.controller.js';
import {validateToken} from '../middleware/jwt.middleware.js'
const router = Router();


router.post("/booking", validateToken, bookRoom);
router.get("/booking", validateToken, getAllBookings);
router.put("/booking/:id/cancel", validateToken, cancelBooking);
router.put("/booking/:id/complete", validateToken, completeBooking);



export default router;