const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["group", "private"], default: "group" },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  invites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // pending invitations
}, { timestamps: true });

module.exports = mongoose.model("UserRoom", roomSchema);
