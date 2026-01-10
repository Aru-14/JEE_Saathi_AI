const mongoose = require("mongoose");

const weakTopicSchema = new mongoose.Schema({
    topicName: { type: String, required: true }
})
module.exports = mongoose.model("WeakTopic", weakTopicSchema);