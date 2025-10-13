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

    const conflict = await Booking.findOne({
      roomName,
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ],
    });

    if (conflict) {
      throw new Error("Room already booked for this slot");
    }

    const booking = await Booking.create({ ...data, startTime: start, endTime: end });

    await Room.findOneAndUpdate({ roomName }, { status: "Booked" });

    return booking;
  }

  async getAllBookings() {
    return await Booking.find().sort({ startTime: 1 });
  }

  async cancelBooking(id) {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "Available" },
      { new: true }
    );

    if (!booking) {
      throw new Error("Booking not found");
    }



    return booking;
  }

  async getBookingById(id) {
    return await Booking.findById(id);
  }
}

export default new BookingService();
