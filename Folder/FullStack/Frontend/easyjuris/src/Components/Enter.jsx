import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- DATA: Feature List ---
const features = [
  {
    title: "Gamified Learning",
    description: "Compete on the leaderboard, earn XP, and maintain streaks to stay motivated.",
    icon: "🏆",
    color: "cyan",
    highlight: "group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20 group-hover:bg-cyan-500/5",
    iconBg: "group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50"
  },
  {
    title: "AI Doubt Solving",
    description: "Instant, step-by-step solutions for Physics, Chemistry, and Maths problems.",
    icon: "🤖",
    color: "purple",
    highlight: "group-hover:border-purple-500/50 group-hover:shadow-purple-500/20 group-hover:bg-purple-500/5",
    iconBg: "group-hover:bg-purple-500/20 group-hover:border-purple-400/50"
  },
  {
    title: "Community Engagement",
    description: "Turn the lonely grind into a high-energy competition. Maintain daily streaks, climb the global Top 10 leaderboard, and stay motivated through collective momentum.",
    icon: "📊",
    color: "green",
    highlight: "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20 group-hover:bg-emerald-500/5",
    iconBg: "group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50"
  },
  {
    title: "Mock Tests",
    description: "Simulate the real JEE environment with timed tests and negative marking.",
    icon: "📝",
    color: "orange",
    highlight: "group-hover:border-orange-500/50 group-hover:shadow-orange-500/20 group-hover:bg-orange-500/5",
    iconBg: "group-hover:bg-orange-500/20 group-hover:border-orange-400/50"
  },
];

const Enter = () => {
  const navigate = useNavigate();
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    if (showFeatures) {
      const element = document.getElementById('features');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [showFeatures]);

  const handleStart = () => {
    navigate("/login");
  };

  const handleExplore = () => {
    setShowFeatures(true);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none"></div>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-cyan-400 mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          AI-Powered JEE Preparation
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Welcome to{" "}
          <span className="inline-block text-transparent bg-clip-text bg-linear-to-r from-yellow-200 via-fuchsia-400 to-purple-600">
            JEE Saathi AI
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Democratizing Elite JEE Prep: Balanced Learning, AI, and Daily Momentum
        </p>

        {/* --- MAIN CALL TO ACTION --- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button 
            onClick={handleStart}
            className="group relative px-8 py-4 bg-cyan-500 text-slate-900 font-bold rounded-2xl transition-all duration-300 hover:bg-cyan-400 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center gap-2"
          >
            Start Your JEE Journey Now
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <button 
            onClick={handleExplore}
            className={`px-8 py-4 font-semibold rounded-2xl border transition-all duration-500 ${
              showFeatures 
              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
              : "bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600"
            }`}
          >
            {showFeatures ? "Exploring Features..." : "Explore Features"}
          </button>
        </div>

        {/* --- SMOOTH TRANSITION FEATURES SECTION --- */}
        <div 
          id="features" 
          className={`relative z-10 container mx-auto px-6 transition-all duration-1000 ease-out ${
            showFeatures 
            ? "opacity-100 translate-y-0 py-20 visible" 
            : "opacity-0 translate-y-20 invisible h-0 overflow-hidden"
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose JEE Saathi AI?</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{ transitionDelay: `${index * 100}ms` }}
                className={`group relative p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl transition-all duration-500 
                  ${showFeatures ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} 
                  hover:-translate-y-3 hover:shadow-2xl ${feature.highlight}`}
              >
                {/* Subtle Inner Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Animated Icon Container */}
                <div className={`text-4xl mb-6 relative z-10 bg-slate-800/80 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-700 transition-all duration-500 ${feature.iconBg}`}>
                  {feature.icon}
                </div>

                {/* Text Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div> 
  );
};

export default Enter;