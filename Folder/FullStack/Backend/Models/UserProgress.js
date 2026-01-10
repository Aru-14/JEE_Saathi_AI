
const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },

  status: { 
    type: String, 
    enum: ['correct', 'incorrect', 'revealed','unattempted'], 
    default: 'incorrect' 
  },
  
  correctAttempts: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  
  lastAttemptedAt: { type: Date, default: Date.now } 
},{ 
  // AUTOMATIC TIMESTAMPS
  // This adds two fields automatically:
  // 1. createdAt: When the user FIRST opened/tried this question.
  // 2. updatedAt: When the user LAST attempted this question.
  timestamps: true 
});

// Composite index for fast lookups
UserProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, subject: 1 });

// 2. FAST: "Show me my weak topics in Rotational Dynamics"
// This handles: find({ userId: "...", topic: "Rotational Dynamics" })
UserProgressSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('UserProgress', UserProgressSchema);

