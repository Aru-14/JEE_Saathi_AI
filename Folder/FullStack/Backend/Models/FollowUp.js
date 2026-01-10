// models/FollowUp.js
const mongoose = require("mongoose");

const FollowUpSchema = new mongoose.Schema({
  fileId: { type: String, required: true },    // ID of uploaded question/image
  followUpText: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FollowUp", FollowUpSchema);
