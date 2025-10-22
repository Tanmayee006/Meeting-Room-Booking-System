import Booking from "../models/booking.model.js";

class BookingService {
  async addBooking(data) {
    const { roomName, startTime, endTime } = data;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid startTime or endTime. Provide a valid date.");
    }

    if (start >= end) {
      throw new Error("endTime must be after startTime");
    }

    // Check for conflict
    const conflict = await Booking.findOne({
      roomName,
      status: { $ne: 'Cancelled' }, // Don't check cancelled bookings
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ],
    });

    if (conflict) {
      throw new Error("Room already booked for this slot");
    }

    const booking = await Booking.create({
      ...data,
      startTime: start,
      endTime: end,
      status: "Booked",
    });

    return booking;
  }

  async getAllBookings() {
    return await Booking.find().sort({ startTime: 1 });
  }

  async cancelBooking(id) {
    const booking = await Booking.findById(id);
    if (!booking) throw new Error("Booking not found");

    // Delete the booking instead of just marking as cancelled
    await Booking.findByIdAndDelete(id);
    return { message: "Booking cancelled and deleted successfully", _id: id };
  }

  async getBookingById(id) {
    return await Booking.findById(id);
  }

  async updateStatus(id, status) {
    const booking = await Booking.findById(id);
    if (!booking) throw new Error("Booking not found");

    if (status === "Completed") {
      // Update status instead of deleting
      booking.status = status;
      await booking.save();
      return booking;
    }

    if (status === "Cancelled") {
      await Booking.findByIdAndDelete(id);
      return { message: `Booking cancelled and deleted successfully`, _id: id };
    }

    booking.status = status;
    await booking.save();
    return booking;
  }
}

export default new BookingService();