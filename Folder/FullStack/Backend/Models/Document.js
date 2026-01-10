
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // original file in GridFS
  // fileName: { type: String },
  extractedText: { type: String, required: true }, 
  topic: { type: String, required: true }, // store your extracted text here
  uploadedAt: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", DocumentSchema);
module.exports = Document;