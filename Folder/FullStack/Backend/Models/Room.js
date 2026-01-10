// models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },   
  type: { type: String, required: true },   // "personal" | "global" | "group"
  members: [{ type: String }],
  creator: {
    type: String ,
    ref: "User",
    default: null  // keep empty if not provided
  },
});


module.exports = mongoose.model("Room", roomSchema);
