const mongoose = require('mongoose');

const DailyLeaderboardSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  topPerformers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
      dailyScore: Number,
      streak: Number,
      overallAccuracy: Number, // <--- ADD THIS FIELD
      rank: Number
    }
  ]
  ,
  Rankings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  
      username: {type: String}  ,
      dailyScore: {type: Number} ,
      streak: {type: Number},
      overallAccuracy: {type: Number}, // <--- ADD THIS FIELD
      rank: {type: Number},
      p_score: {type: Number},
      c_score: {type: Number},
      m_score: {type: Number}
    }
  ]

},{ collection: 'DailyLeaderBoard' });

module.exports = mongoose.model('DailyLeaderBoard', DailyLeaderboardSchema);