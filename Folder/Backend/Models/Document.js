
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // original file in GridFS
  fileName: { type: String },
  extractedText: { type: String, required: true }, // store your extracted text here
  summary: { type: String }, // optional, store later
   document_type: { type: String }, 
  parties_involved: { type: [String] }, 
  user_friendly_explanation: { type: String }, 
  authenticity: { 
    type: String, 
    enum: ["Real", "Fake", "Unclear"], 
    default: "Unclear" 
  },

  uploadedAt: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", DocumentSchema);
module.exports = Document;