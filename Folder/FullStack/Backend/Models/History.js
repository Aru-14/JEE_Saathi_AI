// models/History.js
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // or ObjectId if using User model
  question: { type: String, required: true },
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", historySchema);