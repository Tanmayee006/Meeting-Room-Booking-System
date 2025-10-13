import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomName: { 
    type: String, 
    required: true, 
    unique: true
  },
  status: { 
    type: String,
    enum: ["Available", "Booked"],
    default: "Available"
 }
});

export default mongoose.model("Room", roomSchema);