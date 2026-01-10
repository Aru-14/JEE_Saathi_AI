const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  // --- 1. CORE CONTENT ---
  content: { 
    type: String, 
    required: true,
    trim: true 
  },
  

subject: { 
        type: String, 
        required: true, 
        index: true // Optional: Makes searching by subject faster
    },
    unit: {  // You mentioned 'unit', ensure this matches your DB field name exactly
        type: String, 
        required: true,
        index: true
    },
  // --- 2. QUESTION TYPE & OPTIONS ---
  type: {
    type: String,
    enum: ['SCQ', 'MCQ', 'INTEGER'], 
    required: true
  },
  
  // Stores options like ["(1) ...", "(2) ..."]
  options: [{
    type: String,
    trim: true
  }],

  // --- 3. DIAGRAM HANDLING ---
  // We group the flat JSON fields into a neat object here
  diagram: {
    exists: { type: Boolean, default: false }, // Maps from 'has_diagram'
    description: { type: String },             // Maps from 'diagram_description'
    // url: { type: String }                      // URL to the cropped image (optional)
  },

  

  correct_options: [{ type: Number }], 

  // --- 5. METADATA ---
  source: { type: String, default: "Unknown" }, 
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  is_verified: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);