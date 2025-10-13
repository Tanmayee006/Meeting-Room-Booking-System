import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
  },
  { timestamps: true }
);


bookingSchema.pre("save", async function (next) {
  const Booking = mongoose.model("Booking");

  const overlapping = await Booking.findOne({
    roomId: this.roomId,
    status: "booked",
    $or: [
      { startTime: { $lt: this.endTime, $gte: this.startTime } },
      { endTime: { $gt: this.startTime, $lte: this.endTime } },
      { startTime: { $lte: this.startTime }, endTime: { $gte: this.endTime } },
    ],
  });

  if (overlapping) {
    const err = new Error("This time slot is already booked for the room.");
    return next(err);
  }

  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
