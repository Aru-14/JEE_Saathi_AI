import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Trophy,
  Flame,
  Target,
  Award,
  ChevronLeft,
  Lightbulb,
  Zap,
  Crown,
  ShieldCheck,
  TrendingUp,
  Star,
  Rocket,
  Medal,
} from "lucide-react";

// --- COMPONENT: HIGH-STAKES CONSISTENCY HEATMAP ---
const ActivityHeatmap = ({ activityData = {} }) => {
  const getPastDays = (days) => {
    const dates = [];
    const today = new Date();
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };
  const dates = getPastDays(83);

  const getColor = (count) => {
    if (!count || count === 0) return "bg-slate-800/20 border-white/5";
    if (count <= 2) return "bg-cyan-500/10 border-cyan-500/20";
    if (count <= 5)
      return "bg-cyan-500/40 border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.1)]";
    return "bg-gradient-to-br from-cyan-400 to-blue-500 border-white/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]";
  };

  return (
    <div className="bg-[#0f172a]/80 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Rocket className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
            Consistency Timeline
          </h3>
        </div>
      </div>
      <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-full">
        {dates.map((date) => (
          <div
            key={date}
            className={`w-full aspect-square rounded-sm border transition-all duration-300 hover:scale-150 hover:z-10 cursor-pointer ${getColor(
              activityData[date]
            )}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT: REFINED PODIUM CARD ---
const PodiumCard = ({ user, rank }) => {
  if (!user) return <div className="flex-1 opacity-10 hidden md:block"></div>;
  const isFirst = rank === 1;
  const isSecond = rank === 2;

  const config = isFirst
    ? {
        height: "h-80",
        bg: "from-yellow-400/20 via-slate-900 to-slate-900",
        border: "border-yellow-400/50",
        glow: "shadow-[0_0_50px_rgba(250,204,21,0.2)]",
        icon: (
          <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
        ),
      }
    : isSecond
    ? {
        height: "h-64",
        bg: "from-slate-300/10 via-slate-900 to-slate-900",
        border: "border-slate-500/40",
        glow: "shadow-[0_0_40px_rgba(148,163,184,0.1)]",
        icon: (
          <Star className="w-9 h-9 text-slate-300 drop-shadow-[0_0_10px_rgba(148,163,184,0.8)]" />
        ),
      }
    : {
        height: "h-56",
        bg: "from-orange-600/10 via-slate-900 to-slate-900",
        border: "border-orange-700/40",
        glow: "shadow-[0_0_40px_rgba(194,65,12,0.1)]",
        icon: <Zap className="w-8 h-8 text-orange-500" />,
      };

  return (
    <div className="flex-1 flex flex-col items-center justify-end relative group px-1 animate-in slide-in-from-bottom duration-1000">
      <div className="relative z-10 -mb-10 flex flex-col items-center w-full px-2">
        <div className="animate-float mb-2">{config.icon}</div>
        <div
          className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-950 border-2 ${config.border} flex items-center justify-center text-xl font-black text-white shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
          {user.username?.substring(0, 2).toUpperCase()}
        </div>
        <div
          className={`mt-2 px-3 py-0.5 rounded-full text-[8px] font-black bg-white text-black shadow-xl tracking-widest uppercase`}
        >
          RANK 0{rank}
        </div>
      </div>

      <div
        className={`w-full ${config.height} bg-gradient-to-b ${config.bg} border border-white/10 rounded-t-[2.5rem] flex flex-col items-center pt-14 pb-6 px-3 ${config.glow}`}
      >
        <div className="text-xs font-black text-white tracking-widest text-center truncate w-full uppercase mb-1 drop-shadow-md">
          {user.username?.split("@")[0]}
        </div>
        <div className="text-3xl font-black text-white tracking-tighter mb-4 italic">
          {Math.round(user.dailyScore || 0)}
        </div>
        <div className="mt-auto grid grid-cols-2 w-full gap-1.5">
          <div className="bg-black/40 rounded-xl p-2 text-center border border-white/5">
            <p className="text-[6px] text-slate-500 font-black uppercase">
              Streak
            </p>
            <p className="text-[10px] text-orange-500 font-black">
              🔥{user.streak}
            </p>
          </div>
          <div className="bg-black/40 rounded-xl p-2 text-center border border-white/5">
            <p className="text-[6px] text-slate-500 font-black uppercase">
              Acc.
            </p>
            <p className="text-[10px] text-emerald-500 font-black">
              {Math.round(user.overallAccuracy)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [users, setUsers] = useState([]);
  const [myData, setMyData] = useState(null);
  const [maxStreak, setMaxStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [toppersRes, streakRes] = await Promise.all([
          axios.get("https://jee-saathi-ai-repo-2.onrender.com/api/toppers", config),
          axios.get("https://jee-saathi-ai-repo-2.onrender.com/api/getUserMaxStreak", config),
        ]);
        setMaxStreak(streakRes.data || 0);
        const allRankings = toppersRes.data || [];
        setMyData(allRankings.find((u) => u.userId === currentUserId) || null);
        setUsers(allRankings.slice(0, 10));
      } catch (error) {
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboardData();
  }, [currentUserId, navigate]);

  return (
    <div className="min-h-screen bg-[#04060b] text-slate-200 p-4 lg:p-10 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Elite Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl hover:bg-white/10"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Medal size={14} className="text-cyan-400" />
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em]">
                  Aspirant Merit Index
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                LEADERBOARD<span className="text-slate-800 italic"></span>
                {/* <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-500 via-cyan-400 to-blue-500">
                  OF POWER
                </span> */}
              </h1>
            </div>
          </div>

          <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex backdrop-blur-md shadow-2xl">
            {["daily", "weekly"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-500 ${
                  activeTab === tab
                    ? "bg-white text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {tab === "daily" ? "Today's Grind" : "Immortal Tier"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-10">
            {/* Podium */}
            <div className="relative pt-6">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center font-black text-slate-800 tracking-[1em] animate-pulse">
                  SYNCING...
                </div>
              ) : (
                <div className="flex justify-center items-end gap-1 md:gap-6">
                  <PodiumCard user={users[1]} rank={2} />
                  <PodiumCard user={users[0]} rank={1} />
                  <PodiumCard user={users[2]} rank={3} />
                </div>
              )}
            </div>

            {/* List */}
            <div className="bg-[#0f172a]/50 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="grid grid-cols-12 px-8 py-6 border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <div className="col-span-1">Rank</div>
                <div className="col-span-7 ml-4">Subject Node</div>
                <div className="col-span-4 text-right pr-4">Power Rank</div>
              </div>
              <div className="divide-y divide-white/5">
                {users.slice(3).map((user, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 px-8 py-5 items-center hover:bg-white/[0.03] border-b border-white/5 transition-all group"
                  >
                    {/* RANK */}
                    <div className="col-span-1 font-mono text-sm font-black text-slate-600 group-hover:text-cyan-400">
                      #{index + 4}
                    </div>

                    {/* USER PROFILE */}
                    <div className="col-span-5 flex items-center ml-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all mr-4">
                        {user.username?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-200 group-hover:translate-x-1 transition-transform tracking-tight truncate max-w-[100px] md:max-w-none text-sm">
                        @{user.username?.split("@")[0]}
                      </span>
                    </div>

                    {/* STATS: SCORE, ACCURACY, STREAK */}
                    <div className="col-span-6 grid grid-cols-3 gap-2 text-right items-center">
                      {/* SCORE (Daily Power) */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white italic">
                          {Math.round(user.dailyScore || 0)}
                        </span>
                        <span className="text-[7px] text-slate-600 uppercase font-black tracking-tighter">
                          Power
                        </span>
                      </div>

                      {/* ACCURACY */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-500">
                          {Math.round(user.overallAccuracy || 0)}%
                        </span>
                        <span className="text-[7px] text-slate-600 uppercase font-black tracking-tighter">
                          Precision
                        </span>
                      </div>

                      {/* STREAK */}
                      <div className="flex flex-col pr-4">
                        <span className="text-[10px] font-black text-orange-500">
                          {user.streak}D
                        </span>
                        <span className="text-[7px] text-slate-600 uppercase font-black tracking-tighter">
                          Streak
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             {myData? (
              <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-[3rem] p-8 relative overflow-hidden shadow-2xl group hover:border-cyan-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                  <ShieldCheck size={180} className="text-white" />
                </div>

                <div className="flex items-center gap-5 mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 p-[1.5px]">
                    <div className="w-full h-full bg-[#0f172a] rounded-[1.4rem] flex items-center justify-center font-black text-white text-2xl">
                      {myData.username?.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h2 className="text-xl font-black text-white tracking-tighter truncate uppercase italic">
                      @{myData.username?.split("@")[0]}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Global Status: Active
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject Sync UI */}
                <div className="bg-black/40 border border-white/10 rounded-[2rem] p-6 mb-8 text-center relative z-10 group-hover:bg-black/60 transition-colors">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">
                    Subject Sync Protocol
                  </p>
                  <div className="flex items-center justify-center gap-3 font-mono text-white/20 font-bold italic py-2">
                    <div className="flex flex-col items-center">
                      <span className="text-cyan-400 font-black text-2xl">
                        {myData.p_score}
                      </span>
                      <span className="text-[6px] uppercase mt-1 text-slate-500 font-black">
                        Phy
                      </span>
                    </div>
                    <span className="text-slate-800 text-xs mt-[-10px]">×</span>
                    <div className="flex flex-col items-center">
                      <span className="text-emerald-400 font-black text-2xl">
                        {myData.c_score}
                      </span>
                      <span className="text-[6px] uppercase mt-1 text-slate-500 font-black">
                        Che
                      </span>
                    </div>
                    <span className="text-slate-800 text-xs mt-[-10px]">×</span>
                    <div className="flex flex-col items-center">
                      <span className="text-purple-400 font-black text-2xl">
                        {myData.m_score}
                      </span>
                      <span className="text-[6px] uppercase mt-1 text-slate-500 font-black">
                        Mat
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 mt-6 pt-5">
                    <div className="text-4xl font-black text-white tracking-tighter italic shadow-white">
                      {Math.round(myData.dailyScore)}
                    </div>
                    <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mt-2">
                      Combined Battle Power
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {[
                    {
                      label: "Hall Rank",
                      val: `#${myData.rank}`,
                      icon: <Trophy size={14} />,
                      color: "text-white",
                    },
                    {
                      label: "Daily Power",
                      val: Math.round(myData.dailyScore),
                      icon: <Zap size={14} />,
                      color: "text-cyan-400",
                    },
                    {
                      label: "Accuracy",
                      val: `${Math.round(myData.overallAccuracy)}%`,
                      icon: <Target size={14} />,
                      color: "text-emerald-400",
                    },
                    {
                      label: "Max Streak",
                      val: `${maxStreak}D`,
                      icon: <Flame size={14} />,
                      color: "text-orange-500",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl group-hover:bg-white/[0.05] transition-all"
                    >
                      <div className="flex items-center gap-2 text-[7px] font-black text-slate-500 uppercase mb-2">
                        {s.icon} {s.label}
                      </div>
                      <div
                        className={`text-lg font-black ${s.color} italic tracking-tighter`}
                      >
                        {s.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ):(
             

  
    <div>
      <button onClick={handleManualUpdate} className="bg-blue-500 text-white p-2">
        🔄 Demo: Force Update Leaderboard
      </button>
      
      
     
    </div>
 
            )}

            {/* <ActivityHeatmap /> */}

            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                <Lightbulb size={80} className="text-white" />
              </div>
              <div className="flex gap-5 items-start relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-950 shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2 italic">
                    Pro Strategy
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                    Balanced scores yield the highest rank.{" "}
                    <span className="text-white underline underline-offset-4 decoration-cyan-500 italic">
                      Boost your lowest subject
                    </span>{" "}
                    to jump 50+ spots instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 4s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
