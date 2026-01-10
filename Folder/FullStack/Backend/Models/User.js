const mongoose = require('mongoose');
const StatSchema = new mongoose.Schema({
  attempted: { type: Number, default: 0 },
  correct:   { type: Number, default: 0 },
  accuracy:  { type: Number, default: 0 } // Optional: Store % for faster sorting
}, { _id: false });

const UserSchema = new mongoose.Schema({

  // --- Identity ---
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,  // Crucial: No two users can have the same leaderboard name
    trim: true,
    minlength: 3   // Prevent short names like "a"
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  avatar: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // Default student icon
  },

  // --- Academic Info (Critical for JEE) ---
  currentClass: {
    type: String,
    enum: ['11th', '12th', 'Dropper'],
    required: true
  },
  targetYear: {
    type: Number, // e.g., 2026
    required: true
  },
targetExams: [{
    type: String,
    // The enum ensures consistency. 
    // If a student selects "Mains + Advanced", your frontend sends ["JEE Mains", "JEE Advanced"]
    enum: [
      'JEE Mains', 
      'JEE Advanced'
    ],
    default: ['JEE Mains']
  }],
  schoolName: {
    type: String,
    default: ""
  },

  // --- AI & Planner Settings ---
  preferences: {
    weakSubjects: [{ type: String }], // Topics they struggle with
    strongSubjects: [{ type: String }],
    dailyStudyHours: { type: Number, default: 4 }, // Target hours
    theme: { type: String, default: "dark" } // UI Preference
  },

  
  subjectStats: {
    type: Map,
    of: StatSchema,
    default: {} 
  },

  // 2. TOPIC STATS (The Details)
  // Key: "Rotational Dynamics", "Organic Chemistry", etc.
  topicStats: {
    type: Map,
    of: StatSchema,
    default: {}
  },
  // --- Gamification & Stats ---
  stats: {
    // xp: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    questionsSolved: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // Percentage
    lastActiveDate: { type: Date, default: Date.now }
  },
  
  // --- Social ---
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);