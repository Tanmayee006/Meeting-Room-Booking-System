import BookingService from "../services/booking.service.js";
import ApiResponse from "../utils/apiResponse.util.js";

const bookRoom = async (req, res) => {
    try {
      let data = req.body;
      data.userName = req.userName;
      data.userEmail = req.userEmail;
      console.log(data);
      const booking = await BookingService.addBooking(data);
      console.log(data);
      return res.status(201).json(new ApiResponse(201, booking, "Room booked successfully", true));
    } catch (error) {
      return res.status(400).json(new ApiResponse(400, {}, error.message, false));
    }
  };
  

const getAllBookings = async (req, res) => {
  try {
    const bookings = await BookingService.getAllBookings();
    return res.status(200).json(new ApiResponse(200, bookings, "Bookings fetched successfully", true));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, {}, "Failed to fetch bookings", false));
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingService.cancelBooking(id);
    return res.status(200).json(new ApiResponse(200, booking, "Booking cancelled successfully", true));
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, {}, error.message, false));
  }
};


const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingService.getBookingById(id);

    if (!booking) {
      return res.status(404).json(new ApiResponse(404, {}, "Booking not found", false));
    }

    return res.status(200).json(new ApiResponse(200, booking, "Booking fetched successfully", true));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, {}, "Failed to fetch booking", false));
  }
};

const completeBooking = async (req, res) => {
    try {
      const { id } = req.params;
      const booking = await BookingService.updateStatus(id, 'Completed');
      return res.status(200).json(new ApiResponse(200, booking, "Booking marked as completed", true));
    } catch (error) {
      return res.status(400).json(new ApiResponse(400, {}, error.message, false));
    }
  };
  


export {bookRoom, getAllBookings, cancelBooking, getBookingById, completeBooking};