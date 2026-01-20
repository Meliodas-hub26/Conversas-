import mongoose from "mongoose";

const PrivateMessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fromUsername: String,
  toUsername: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("PrivateMessage", PrivateMessageSchema);
