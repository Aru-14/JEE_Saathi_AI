const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true }, // roomName
    sender: { type: String, required: true }, // userId
    text: { type: String, required: true },
  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

module.exports = mongoose.model("Message", messageSchema);
