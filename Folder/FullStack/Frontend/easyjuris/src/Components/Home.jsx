import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Flame, 
  Target, 
  Trophy, 
  BookOpen, 
  ChevronRight, 
  AlertCircle,
  BarChart3,
  Users, ArrowRight,
  Award
} from "lucide-react";

const CommunityCard = () => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate("/ChatRoom")}
      className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl cursor-pointer group hover:border-indigo-500/40 transition-all shadow-xl"
    >
      <div className="flex justify-between items-start mb-4">
        {/* Icon Container */}
        <div className="bg-indigo-500/10 p-3 rounded-2xl">
          <Users className="w-6 h-6 text-indigo-400" />
        </div>
        
        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-tight">Discussing Now</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
        JEE Aspirants Community
      </h3>
      
      <p className="text-sm text-slate-400 mb-6">
        Connect with like-minded peers, solve doubts, and discuss 2025 PYQ strategies in real-time.
      </p>

      {/* Footer / CTA */}
      <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
        Enter Study Room 
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
// --- HELPERS: Safe Tailwind Mapping ---
const getSubjectColors = (name) => {
  const sub = name.toLowerCase();
  if (sub.includes("phy")) return { text: "text-cyan-400", bg: "bg-cyan-400", border: "border-cyan-400/20" };
  if (sub.includes("chem")) return { text: "text-emerald-400", bg: "bg-emerald-400", border: "border-emerald-400/20" };
  return { text: "text-purple-400", bg: "bg-purple-400", border: "border-purple-400/20" };
};

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userStats: { 
      rank: "-", 
      currentStreak: 0, 
      maxStreak: 0, 
      overallAccuracy: 0 
    },
    subjectList: [],
    weakTopics: []
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        

        const response = await axios.get(`http://localhost:5000/api/getHomeData`, {
          headers: { Authorization: `Bearer ${token}` }
        });
       console.log("Home Data Response:", response.data);
        // Extracting new fields: maxStreak and overallAccuracy from the response
        const { 
          subjectStats, 
          topicStats, 
          rank, 
          currentStreak, 
          maxStreak, 
          overallAccuracy 
        } = response.data;
        // console.log(rank)
        // 1. Transform Subject Stats
        const transformedSubjects = Object.keys(subjectStats).map(name => ({
          name,
          accuracy: Math.round(subjectStats[name].accuracy || 0),
          attempted: subjectStats[name].attempted
        })).sort((a, b) => b.accuracy - a.accuracy); // Highest accuracy first for overview

        // 2. Transform Topic Stats (Bottom 3)
        const transformedTopics = Object.keys(topicStats)
          .map(name => ({
            name,
            accuracy: Math.round(topicStats[name].accuracy || 0),
            attempted: topicStats[name].attempted
          }))
          .filter(t => t.attempted > 0) // Only topics they've actually tried
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 3);

        setStats({
          userStats: { 
            rank: rank || "-", 
            currentStreak: currentStreak || 0,
            maxStreak: maxStreak || 0,
            overallAccuracy: Math.round(overallAccuracy || 0)
          },
          subjectList: transformedSubjects,
          weakTopics: transformedTopics
        });

      } catch (error) {
          if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const criticalGap = stats.weakTopics[0];

  if (loading) return <div className="min-h-screen bg-[#0b1121] flex items-center justify-center text-cyan-400 font-mono">INITIALIZING_DASHBOARD...</div>;

  return (
    <div className="min-h-screen bg-[#0b1121] text-slate-200 p-4 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, Aspirant. Your path is clear.</p>
          </div>
          <div className="flex gap-3">
             {/* Current Streak Badge */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-slate-200">{stats.userStats.currentStreak} Day Streak</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: PRIMARY ACTION & SUBJECTS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. START LEARNING CTA */}
            <div className="relative group overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl transition-all hover:border-cyan-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 via-transparent to-blue-600/10 opacity-50"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-4">
                    Recommended Action
                  </div>
                  <h2 className="text-3xl font-black text-white mb-3">
                    {criticalGap ? `Focus on ${criticalGap.name}` : "Ready to Train?"}
                  </h2>
                  <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
                    {criticalGap 
                      ? `Your accuracy in this topic is ${criticalGap.accuracy}%. Targeted practice here will boost your overall PCM score.`
                      : "Start your daily session to keep your rank rising."}
                  </p>
                  <button 
                    onClick={() => navigate("/Practice")}
                    className="group bg-cyan-500 text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    START TRAINING NOW
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <BookOpen className="hidden md:block w-44 h-44 text-slate-800 animate-pulse" />
              </div>
            </div>

            {/* 2. SUBJECT OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.subjectList.map((sub) => {
                const colors = getSubjectColors(sub.name);
                return (
                  <div key={sub.name} className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 p-6 rounded-3xl hover:bg-slate-900/60 transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`font-black text-xs uppercase tracking-widest ${colors.text}`}>{sub.name}</h3>
                      <Target className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="text-3xl font-black text-white mb-2">{sub.accuracy}%</div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colors.bg}`} style={{ width: `${sub.accuracy}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. MOMENTUM HEATMAP PLACEHOLDER */}
            <CommunityCard />
          </div>

          {/* RIGHT COLUMN: ANALYTICS & WEAK TOPICS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. RANK & PERFORMANCE CARD */}
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                <Trophy className="absolute top-4 right-4 w-8 h-8 text-yellow-500/10 group-hover:text-yellow-500/20 transition-all" />
                
                <div className="mb-6">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Global Ranking</div>
                    <div className="text-5xl font-black text-white tracking-tighter">#{stats.userStats.rank}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-3 h-3 text-orange-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">Max Streak</span>
                        </div>
                        <div className="text-xl font-black text-white">{stats.userStats.maxStreak}</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">PCM Accuracy</span>
                        </div>
                        <div className="text-xl font-black text-white">{stats.userStats.overallAccuracy}%</div>
                    </div>
                </div>

                <button onClick={() => navigate("/leaderboard")} className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all">
                  VIEW LEADERBOARD
                </button>
            </div>

            {/* 2. CRITICAL GAPS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                   <AlertCircle className="w-5 h-5 text-pink-500" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Critical Gaps</h3>
                </div>
                
                <div className="space-y-8">
                  {stats.weakTopics.map((topic, i) => (
                    <div key={i} className="group">
                      <div className="flex justify-between items-end mb-3">
                        <div className="text-sm font-bold text-slate-200">{topic.name}</div>
                        <span className="text-xs font-black text-pink-500">{topic.accuracy}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-600" style={{ width: `${topic.accuracy}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() =>navigate("/Practice")} className="w-full mt-10 py-4 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-cyan-500/20 transition-all">
                  DIAGNOSE ALL MODULES
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;