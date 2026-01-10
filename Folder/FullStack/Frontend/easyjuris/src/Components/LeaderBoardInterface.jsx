import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { stat } from "fs";

// --- CONSTANTS & THEME ---
const cyanColor = "#22d3ee";
const greenColor = "#4ade80"; 
const warningColor = "#facc15"; // Yellow for medium accuracy
const dangerColor = "#f87171"; // Red for low accuracy
const darkBg = "#0f172a"; 

// --- ANIMATIONS ---
const styles = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 5px ${cyanColor}40; }
    50% { box-shadow: 0 0 20px ${cyanColor}80; }
    100% { box-shadow: 0 0 5px ${cyanColor}40; }
  }
  
  .cyber-grid {
    background-size: 40px 40px;
    background-image: 
      linear-gradient(to right, rgba(34, 211, 238, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
    mask-image: radial-gradient(circleAt center, black 60%, transparent 100%);
  }
  
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const SYLLABUS_MAP = {
  Physics: {
    icon: "⚛️",
    topics: ["Units and Measurements", "Kinematics", "Laws of Motion", "Work, Energy and Power",
    "Rotational Motion", "Gravitation", "Properties of Solids and Liquids",
    "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves",
    "Electrostatics", "Current Electricity", "Magnetic Effects of Current",
    "EMI and AC", "Electromagnetic Waves", "Optics", "Dual Nature of Matter",
    "Atoms and Nuclei", "Electronic Devices"]
  },
  Chemistry: {
    icon: "🧪",
    topics: ["Some Basic Concepts", "Atomic Structure", "Chemical Bonding", "Thermodynamics",
    "Solutions", "Equilibrium", "Redox & Electrochemistry", "Chemical Kinetics",
    "Periodic Properties", "p-Block Elements", "d and f-Block Elements",
    "Coordination Compounds", "Hydrocarbons", "Organic Compounds Containing Halogens",
    "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen",
    "Biomolecules", "Practical Chemistry"]
  },
  Mathematics: {
    icon: "📐",
    topics: ["Sets, Relations and Functions", "Complex Numbers and Quadratic Equations",
    "Matrices and Determinants", "Permutations and Combinations", "Binomial Theorem",
    "Sequence and Series", "Limit, Continuity and Differentiability", "Integral Calculus",
    "Differential Equations", "Co-ordinate Geometry", "Three Dimensional Geometry",
    "Vector Algebra", "Statistics and Probability", "Trigonometry"]
  }
};

// --- COMPONENTS ---

const SidebarBtn = ({ label, icon, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", gap: "12px",
        padding: "16px 24px",
        background: isActive 
          ? `linear-gradient(90deg, ${cyanColor}20, transparent)` 
          : isHovered ? "rgba(255,255,255,0.03)" : "transparent",
        border: "none",
        borderLeft: isActive ? `4px solid ${cyanColor}` : "4px solid transparent",
        color: isActive ? cyanColor : isHovered ? "#fff" : "#94a3b8",
        fontSize: "15px", fontWeight: "600", letterSpacing: "0.5px",
        cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        textShadow: isActive ? `0 0 15px ${cyanColor}` : "none",
        position: "relative", overflow: "hidden"
      }}
    >
      <span style={{ fontSize: "18px", filter: isActive ? "drop-shadow(0 0 5px rgba(34,211,238,0.8))" : "none" }}>{icon}</span>
      {label}
      {isActive && (
        <div style={{
          position: "absolute", inset: 0, 
          background: `linear-gradient(90deg, ${cyanColor}10, transparent)`,
          animation: "pulseGlow 2s infinite"
        }} />
      )}
    </button>
  );
};

const TopicCard = ({ topic, solveCount, accuracy, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isStarted = solveCount > 0;
  
  // Dynamic Accuracy Color
  let accuracyColor = "#64748b"; // default grey
  if (isStarted) {
    if (accuracy >= 80) accuracyColor = greenColor;
    else if (accuracy >= 50) accuracyColor = warningColor;
    else accuracyColor = dangerColor;
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        opacity: 0,
        animation: `slideIn 0.5s ease-out forwards ${index * 0.05}s`,
        position: "relative",
        background: "rgba(30, 41, 59, 0.4)", 
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "20px",
        cursor: "pointer",
        border: `1px solid ${isHovered ? cyanColor : "rgba(255,255,255,0.08)"}`,
        boxShadow: isHovered 
          ? `0 10px 30px -10px ${cyanColor}40, inset 0 0 20px ${cyanColor}10` 
          : "0 4px 6px -1px rgba(0,0,0,0.1)",
        transform: isHovered ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden"
      }}
    >
      {/* Glow Effect */}
      <div style={{
        position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%",
        background: `radial-gradient(circle, ${cyanColor}10 0%, transparent 70%)`,
        opacity: isHovered ? 1 : 0, transition: "opacity 0.5s ease"
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
          <h3 style={{ 
            color: isHovered ? "#fff" : "#e2e8f0", 
            fontWeight: "700", fontSize: "15px", lineHeight: "1.4",
            textShadow: isHovered ? `0 0 10px rgba(255,255,255,0.3)` : "none",
            maxWidth: "60%"
          }}>
            {topic}
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
             {/* SOLVED COUNT */}
             <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600" }}>SOLVED</div>
                <div style={{ 
                  fontSize: "18px", fontWeight: "800", 
                  color: isStarted ? cyanColor : "#475569",
                  textShadow: isStarted ? `0 0 10px ${cyanColor}60` : "none"
                }}>
                  {solveCount}
                </div>
             </div>
             
             {/* ACCURACY BADGE */}
             {isStarted && (
               <div style={{ 
                 marginTop: "4px",
                 padding: "2px 8px", 
                 borderRadius: "12px", 
                 background: `${accuracyColor}20`, 
                 border: `1px solid ${accuracyColor}40`,
                 color: accuracyColor,
                 fontSize: "11px", fontWeight: "700",
                 display: "flex", alignItems: "center", gap: "4px"
               }}>
                 <span>🎯</span> {accuracy}%
               </div>
             )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ 
          width: "100%", height: "3px", 
          background: "rgba(255,255,255,0.1)", 
          borderRadius: "4px", overflow: "hidden", marginTop: "10px"
        }}>
          <div style={{
            height: "100%",
            width: isStarted ? "100%" : "0%", 
            background: isStarted ? `linear-gradient(90deg, ${cyanColor}, ${accuracyColor})` : "transparent",
            boxShadow: `0 0 10px ${cyanColor}`,
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
          }} />
        </div>
      </div>
    </div>
  );
};
const GlobalNexusCard = ({ onClick }) => {
  return (
    <div style={{
      marginBottom: "50px",
      padding: "32px",
      background: "linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(15, 23, 42, 0.6))",
      backdropFilter: "blur(20px)",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderLeft: `4px solid ${cyanColor}`,
      // position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column", // Stacked vertically
      alignItems: "flex-start", // Align items to the left
      gap: "24px",
      width: "100%", 
      boxSizing: "border-box", // Prevents padding from adding to width
      zIndex: 10
    }}>
      {/* Background Tech Orb */}
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%", 
        width: "200px", height: "200px", 
        background: `radial-gradient(circle, ${cyanColor}15 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Top Section: Icon and Heading */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 1 }}>
        {/* <div style={{ 
          width: "50px", height: "50px", borderRadius: "14px", 
          background: "rgba(15, 23, 42, 0.8)", border: `1px solid ${cyanColor}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `inset 0 0 15px ${cyanColor}20`,
          flexShrink: 0 
        }}>
          <span style={{ fontSize: "22px", filter: `drop-shadow(0 0 8px ${cyanColor})` }}>🚀</span>
        </div> */}
        <h3 style={{ 
          margin: 0, color: "#fff", fontSize: "19px", fontWeight: "900", 
          fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.5px" 
        }}>
          Practicing with your own material?
        </h3>
      </div>

      {/* Middle Section: Description */}
      <div style={{ zIndex: 1 }}>
        <p style={{ 
          margin: 0, color: "#94a3b8", fontSize: "13px", 
          fontWeight: "500", letterSpacing: "0.3px", lineHeight: "1.6",
          maxWidth: "100%"
        }}>
          Sync your custom problems with <span style={{ color: cyanColor, fontWeight: "800" }}>JEE SAATHI AI</span>. 
          Identify knowledge leaks, stabilize your power rank, and master your coaching modules through neural analysis.
        </p>
      </div>

      {/* Bottom Section: Action Button */}
      <button 
        onClick={onClick}
        style={{
          background: "#fff",
          color: "#000",
          border: "none",
          padding: "16px 32px",
          borderRadius: "14px",
          fontSize: "12px",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "2px",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 0 20px rgba(255, 255, 255, 0.2)`,
          zIndex: 2,
          alignSelf: "flex-start", // Keeps button on the left
          marginTop: "8px"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = cyanColor;
          e.target.style.boxShadow = `0 0 30px ${cyanColor}60`;
          e.target.style.transform = "translateX(5px)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "#fff";
          e.target.style.boxShadow = `0 0 20px rgba(255, 255, 255, 0.2)`;
          e.target.style.transform = "translateX(0)";
        }}
      >
        Add Your Questions
      </button>
      
    </div>
  );
};

// --- MAIN DASHBOARD ---

const LeaderBoardInterface = () => {
  const [stats, setStats] = useState({userTopicStats:{}, statsMap:{}});
  const [activeSubject, setActiveSubject] = useState("Physics");
  const navigate = useNavigate();

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        
        const res = await axios.get("https://jee-saathi-ai-repo-2.onrender.com/api/user-progress-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Mongoose Map serializes to a plain Object in JSON
        setStats(res.data || {userTopicStats:{}, statsMap:{}});
        console.log("Fetched User Progress Stats:", res.data);
      } catch (err) {
         if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
         console.error(err); 
      }
    };
    fetchProgress();

    return () => document.head.removeChild(styleSheet);
  }, [navigate]);

  return (
    <div style={{
      display: "flex", background: darkBg,
      fontFamily: "'Inter', sans-serif", color: "#e2e8f0", overflow: "hidden"
    }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: "280px", flexShrink: 0,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(34, 211, 238, 0.1)",
        display: "flex", flexDirection: "column", zIndex: 20
      }}>
        <div style={{ padding: "40px 30px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h1 style={{ 
            fontSize: "26px", fontWeight: "900", color: "#fff", 
            letterSpacing: "-1px", fontStyle: "italic",
            textShadow: `0 0 20px ${cyanColor}` 
          }}>
            JEE<span style={{ color: cyanColor }}>SAATHI</span>
          </h1>
          <div style={{ 
            marginTop: "10px", display: "inline-block",
            padding: "4px 10px", borderRadius: "20px",
            background: `linear-gradient(90deg, ${cyanColor}20, transparent)`,
            border: `1px solid ${cyanColor}40`,
            fontSize: "10px", color: cyanColor, fontWeight: "bold", letterSpacing: "1px"
          }}>
            SYSTEM ONLINE 🟢
          </div>
        </div>

        <nav style={{ flex: 1, padding: "20px 0" }}>
          {Object.entries(SYLLABUS_MAP).map(([subject, data]) => (
            <SidebarBtn
              key={subject}
              label={subject}
              icon={data.icon}
              isActive={activeSubject === subject}
              onClick={() => setActiveSubject(subject)}
            />
          ))}
          <GlobalNexusCard onClick={() => navigate('/uploadQueImage')} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="no-scrollbar" style={{
        flex: 1, position: "relative",
        overflowY: "auto", padding: "40px",
        background: `radial-gradient(circle at top right, #1e293b 0%, ${darkBg} 100%)`
      }}>
        <div className="cyber-grid" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.4, pointerEvents: "none" }} />

        <header style={{ marginBottom: "40px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
            <div>
              <h2 style={{ 
                fontSize: "42px", fontWeight: "800", color: "#fff", margin: 0,
                textShadow: "0 0 30px rgba(255,255,255,0.1)"
              }}>
                {activeSubject}
              </h2>
              <p style={{ color: cyanColor, opacity: 0.8, marginTop: "5px", fontSize: "14px", fontFamily: "monospace" }}>
                // SELECT_TOPIC_TO_INITIATE_TRAINING
              </p>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold", letterSpacing: "1px" }}>TOPICS LOADED</div>
              <div style={{ fontSize: "24px", color: "#fff", fontWeight: "bold" }}>
                {SYLLABUS_MAP[activeSubject].topics.length} <span style={{ color: "#64748b", fontSize: "16px" }}>MODULES</span>
              </div>
            </div>
          </div>
          
          <div style={{ width: "100%", height: "1px", background: `linear-gradient(90deg, ${cyanColor}, transparent)`, marginTop: "20px", opacity: 0.5 }} />
        </header>

        {/* TOPIC GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "24px",
          position: "relative", zIndex: 1,
          paddingBottom: "50px"
        }}>
          {SYLLABUS_MAP[activeSubject].topics.map((topic, index) => {
            
            // --- ⚠️ IMPORTANT: SCHEMA MAPPING START ⚠️ ---
            
            // 1. Get the stats object for this specific topic
            console.log("stats topic",topic, " ", stats.userTopicStats?.[topic]);
            const topicStats = stats.userTopicStats?.[topic] || {};
            // console.log({ topic, topicStats });            
            // 2. Extract Values (Update keys 'totalSolved' or 'correct' if your schema differs)
            const solvedCount = stats.statsMap?.[topic] || 0; 
        console.log("solved count",solvedCount);

            // --- ⚠️ SCHEMA MAPPING END ⚠️ ---
            const acc=topicStats.accuracy;
            const accuracy = acc?.toFixed(3) || 0;
            
            return (
              <TopicCard 
                key={topic}
                topic={topic}
                index={index}
                solveCount={solvedCount}
                accuracy={accuracy}
                onClick={() => navigate(`/questions/${encodeURIComponent(topic)}`)}
              />
            );
          })}
        </div>

      </main>
    </div>
  );
};

export default LeaderBoardInterface;
