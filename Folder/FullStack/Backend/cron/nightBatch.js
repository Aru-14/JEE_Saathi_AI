const cron = require('node-cron');
const User = require('../Models/User');
const DailyLeaderboard = require('../Models/DailyLeaderBoard');
const UserProgress = require('../Models/UserProgress');


const calculateGM = (p, c, m) => {
  const pScore = Math.max(0, p);
  const cScore = Math.max(0, c);
  const mScore = Math.max(0, m);
  return Math.pow((pScore * cScore * mScore), 1/3);
};

// --- HELPER: Subject Score ---
const getSubScore = (correct, wrong) => (10 * correct) + (2 * wrong);



const runNightlyUpdate = async () => {
  console.log('🌑 STARTING BATCH: EVALUATING BALANCED PERFORMANCE (IST)...');
  const startOfProcess = Date.now();

  // 1. Setup IST Boundaries (The "Yesterday" Window)
  const now = new Date();
  const todayIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  todayIST.setHours(0, 0, 0, 0);

  // UTC conversion happens automatically when using these Date objects in Mongo queries
  // const startOfYesterdayUTC = new Date(todayIST.getTime() - 24 * 60 * 60 * 1000);
  // const endOfYesterdayUTC = new Date(todayIST.getTime() - 1);
  const startOfYesterdayUTC = new Date(todayIST.getTime() - 24 * 60 * 60 * 1000);
  const endOfYesterdayUTC = new Date();

  try {
    // 2. AGGREGATION: Single pass through UserProgress logs
    const dailyStatsLogs = await UserProgress.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYesterdayUTC, $lte: endOfYesterdayUTC }
        }
      },
      {
        $group: {
          _id: { userId: "$userId", subject: "$subject" },
        correctCount: { 
            $sum: { 
              $cond: [ { $eq: ["$status", "incorrect"] }, 0, 1 ] 
            } 
          },
          // If status IS 'incorrect', count as wrong
          wrongCount: { 
            $sum: { 
              $cond: [ { $eq: ["$status", "incorrect"] }, 1, 0 ] 
            } 
          }
        }
      }
    ]);
console.log(dailyStatsLogs);
    // 3. TRANSFORM: Map raw results to User ID keys
    const userMap = {};
    dailyStatsLogs.forEach(log => {
      const uid = log._id.userId.toString();
      if (!userMap[uid]) userMap[uid] = { physics: {c:0, w:0}, chemistry: {c:0, w:0}, mathematics: {c:0, w:0} };
      
      const sub = log._id.subject.toLowerCase();
      // Only map if the subject is part of core PCM
      if (userMap[uid][sub]) {
        userMap[uid][sub].c = log.correctCount;
        userMap[uid][sub].w = log.wrongCount;
      }
    });

    // 4. FETCH USERS & CALCULATE RANKINGS
    allUsers = await User.find({});

    const leaderboardCandidates = [];
    const bulkOps = []; 

    allUsers.forEach(user => {
      const stats = userMap[user._id.toString()];
      
      // 1. Maintain & Increase Streak
      if (stats) {
        // User solved at least one question in the IST window
        user.stats.currentStreak += 1;
        user.stats.maxStreak=Math.max(user.stats.maxStreak, user.stats.currentStreak);

      } else {
        user.stats.maxStreak=Math.max(user.stats.maxStreak, user.stats.currentStreak);
        // User was inactive; discipline threshold failed
        user.stats.currentStreak = 0; 
      }
      console.log(stats," ",user._id)

      // 2. Score Calculation (Strict Balance / Geometric Mean)
      // If any subject is 0, finalDailyScore will be 0 due to Math.max(0, p)
      const p = getSubScore(stats?.physics.c || 0, stats?.physics.w || 0);
      const c = getSubScore(stats?.chemistry.c || 0, stats?.chemistry.w || 0);
      const m = getSubScore(stats?.mathematics.c || 0, stats?.mathematics.w || 0);
      const finalDailyScore = calculateGM(p, c, m);

      // 3. Add to Rankings if they performed
      if (finalDailyScore >= 0) {
        leaderboardCandidates.push({
          userId: user._id,
          username: user.username,
          score: finalDailyScore,
          streak: user.stats.currentStreak, // Using the newly incremented streak
          accuracy: user.stats.accuracy,
          p_score: p,
          c_score: c,
          m_score: m
        });
      }

      // 4. Lean Bulk Update
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: { 
            $set: { 
              "stats.currentStreak": user.stats.currentStreak,
              "stats.maxStreak": user.stats.maxStreak
            } 
          }
        }
      });
    });

    // 6. SORT & ARCHIVE (Rank 1 = High Score, then High Streak, then High Accuracy)
    leaderboardCandidates.sort((a, b) => b.score - a.score || b.streak - a.streak || b.accuracy - a.accuracy);

   const Candidates= leaderboardCandidates.map((u, i) => ({
      userId: u.userId,
      username: u.username,
      dailyScore: u.score,
      streak: u.streak,
      overallAccuracy: u.accuracy,
      rank: i + 1,
      p_score: u.p_score,
      c_score: u.c_score,
      m_score: u.m_score
    }));
    const top10 = Candidates.slice(0, 10);
    console.log(Candidates);

   if (top10.length > 0) {
      // SMART UPSERT: Handles migration and prevents duplicates
      await DailyLeaderboard.findOneAndUpdate(
        { 
          // Search for a leaderboard that matches EITHER the start OR the end of that day
          date: { $in: [startOfYesterdayUTC, endOfYesterdayUTC] } 
        }, 
        { 
          $set: { 
            date: endOfYesterdayUTC, // Always standardizes to the End Time
            topPerformers: top10,
            Rankings:Candidates
          } 
        }, 
        { upsert: true, new: true }
      );
      
      console.log(`🏆 Leaderboard finalized for: ${endOfYesterdayUTC.toLocaleString()}`);
    }

    // 7. EXECUTE UPDATES
    if (bulkOps.length > 0) await User.bulkWrite(bulkOps);
    console.log("toppers",top10);
    console.log(`✅ SUCCESS: Processed in ${Date.now() - startOfProcess}ms`);

  } catch (err) {
    console.error('❌ BATCH FAILED:', err);
  }
};

cron.schedule('0 0 * * *', runNightlyUpdate, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Sets the schedule to IST
});

module.exports = runNightlyUpdate;