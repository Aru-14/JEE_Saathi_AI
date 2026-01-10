import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- MATH IMPORTS ---
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// --- THEME CONSTANTS ---
const cyanColor = "#22d3ee";
const greenColor = "#4ade80";
const yellowColor = "#facc15";
const redColor = "#f87171";
const darkBg = "#0f172a";

// --- STYLES ---
const styles = `
  /* --- LAYOUT GRID --- */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 340px; /* Content | Sidebar */
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    position: relative;
  }

  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
      padding: 0 20px;
    }
    .sticky-sidebar {
      position: relative !important;
      top: 0 !important;
      margin-bottom: 30px;
    }
  }

  /* --- ANIMATIONS --- */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* --- SCROLLBAR --- */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${cyanColor}30; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: ${cyanColor}80; }

  /* --- GLASS CARD BASE --- */
  .glass-panel {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-left-width: 0; /* Handled by inline style for color */
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .glass-panel:hover {
    transform: translateY(-4px) scale(1.005);
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
  }

  /* --- DYNAMIC GLOW EFFECTS --- */
  
  /* DEFAULT (Cyan - Unattempted) */
  .glow-cyan:hover {
    border-color: ${cyanColor}60;
    border-top-color: ${cyanColor}80;
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.4), 0 0 15px ${cyanColor}15, inset 0 0 20px rgba(34, 211, 238, 0.05);
  }

  /* MASTERED (Green - Correct) */
  .glow-green:hover {
    border-color: ${greenColor}60;
    border-top-color: ${greenColor}80;
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.4), 0 0 15px ${greenColor}15, inset 0 0 20px rgba(74, 222, 128, 0.05);
  }

  /* LEARNED (Yellow - Incorrect/Revealed) */
  .glow-yellow:hover {
    border-color: ${yellowColor}60;
    border-top-color: ${yellowColor}80;
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.4), 0 0 15px ${yellowColor}15, inset 0 0 20px rgba(250, 204, 21, 0.05);
  }

  /* --- SIDEBAR & FILTERS --- */
  .sticky-sidebar {
    position: sticky;
    top: 90px;
    height: fit-content;
    animation: fadeInUp 0.4s ease-out;
  }

  .filter-panel {
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 25px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .filter-section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #64748b;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .search-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255,255,255,0.1);
    color: white;
    padding: 10px 14px;
    border-radius: 8px;
    outline: none;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s ease;
    font-size: 14px;
  }
  .search-input:focus {
    border-color: ${cyanColor};
    box-shadow: 0 0 15px ${cyanColor}20;
    background: rgba(34, 211, 238, 0.05);
  }

  .custom-select {
    width: 100%;
    background: rgba(30, 41, 59, 0.5);
    color: #e2e8f0;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 10px;
    border-radius: 8px;
    outline: none;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
  }
  .custom-select:hover { border-color: ${cyanColor}50; background: rgba(30, 41, 59, 0.8); }

  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .filter-btn {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    color: #94a3b8;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    transition: all 0.2s ease;
  }
  .filter-btn:hover { background: rgba(255,255,255,0.08); color: white; }
  
  .filter-btn.active {
    background: ${cyanColor}15;
    border-color: ${cyanColor};
    color: ${cyanColor};
    box-shadow: 0 0 10px ${cyanColor}10;
  }

  /* --- TYPOGRAPHY & BUTTONS --- */
  .markdown-body p { margin-bottom: 0.8em; }
  .markdown-body strong { color: ${cyanColor}; font-weight: 700; text-shadow: 0 0 10px ${cyanColor}40; }
  .katex { font-size: 1.1em; color: #e2e8f0; }
  .markdown-body pre { background: rgba(0, 0, 0, 0.4); padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); overflow-x: auto; }
  .markdown-body code { font-family: 'Fira Code', monospace; background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 4px; color: #e2e8f0; }
  
  button { transition: all 0.2s ease; }
  .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px ${cyanColor}30; }
`;

// --- HELPER COMPONENT ---
const TechTag = ({ label, color, icon }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "5px 10px", borderRadius: "6px",
    fontSize: "11px", fontFamily: "monospace", fontWeight: "bold", textTransform: "uppercase",
    background: `${color}15`, border: `1px solid ${color}40`, color: color,
    letterSpacing: "0.5px"
  }}>
    {icon} {label}
  </span>
);

const QuestionsList = ({ topicName, onBack }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [difficultyFilter, setDifficultyFilter] = useState("all"); 
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const fetchQuestions = async () => {
      if (!topicName) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const res = await axios.get(`https://jee-saathi-ai-repo-2.onrender.com/api/topic/${encodeURIComponent(topicName)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setQuestions(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
    return () => document.head.removeChild(styleSheet);
  }, [topicName, navigate]);

  // --- FILTER LOGIC ---
  const filteredQuestions = useMemo(() => {
    const clean = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSearchTerm = clean(searchTerm);

    return questions.filter(q => {
      const matchesSearch = 
        clean(q.content).includes(cleanSearchTerm) ||
        clean(q.topic).includes(cleanSearchTerm) ||
        clean(q.source).includes(cleanSearchTerm);
      
      let matchesStatus = true;
      if (statusFilter === 'unattempted') matchesStatus = q.userStatus === 'unattempted';
      else if (statusFilter === 'mastered') matchesStatus = q.userStatus === 'correct';
      else if (statusFilter === 'learned') matchesStatus = (q.userStatus === 'incorrect' || q.userStatus === 'revealed');

      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;

      const matchesSource = sourceFilter === 'all' || (() => {
         if (!q.source) return false;
         return clean(q.source).includes(clean(sourceFilter));
      })();

      return matchesSearch && matchesStatus && matchesDifficulty && matchesSource;
    });
  }, [questions, searchTerm, statusFilter, difficultyFilter, sourceFilter]);

  const handleQuestionClick = (question) => {
    navigate(`/solveQuestion/${question._id}`);
  }

  const getStatusConfig = (status) => {
    switch (status) {
      // Added 'glowClass' property to each config
      case 'correct': return { color: greenColor, label: "MASTERED", icon: "🏆", border: greenColor, glowClass: "glow-green" };
      case 'revealed': 
      case 'incorrect': return { color: yellowColor, label: "LEARNED", icon: "🧠", border: yellowColor, glowClass: "glow-yellow" }; 
      default: return { color: "#94a3b8", label: "UNATTEMPTED", icon: "🔒", border: "rgba(255,255,255,0.1)", glowClass: "glow-cyan" };
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return greenColor;
    if (diff === 'Medium') return yellowColor;
    return redColor;
  };

  if (loading) return (
    <div style={{ padding: "40px", color: cyanColor, fontFamily: "monospace", textAlign: "center" }}>
      LOADING_DATA...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: darkBg, color: "#e2e8f0", fontFamily: "'Inter', sans-serif", paddingBottom: "50px" }}>
      
      {/* --- HEADER --- */}
      <div style={{ 
        padding: "15px 40px", 
        background: "rgba(15,23,42,0.95)", 
        position: "sticky", top: 0, zIndex: 100, 
        borderBottom: "1px solid rgba(34,211,238,0.15)", 
        marginBottom: "30px", 
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           <button onClick={onBack || (() => navigate('/dashboard'))} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
             <span>←</span> BACK
           </button>
           <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }}></div>
           <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#fff", textShadow: `0 0 30px ${cyanColor}30`, margin: 0, letterSpacing: "-0.5px" }}>
             {topicName}
           </h1>
        </div>
        
        <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "24px", fontWeight: "800", color: cyanColor }}>{filteredQuestions.length}</span>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", marginLeft: "8px" }}>QUESTIONS</span>
        </div>
      </div>

      {/* --- MAIN LAYOUT GRID --- */}
      <div className="dashboard-grid">
        
        {/* --- LEFT COLUMN: QUESTIONS --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {filteredQuestions.length === 0 && (
             <div style={{ textAlign: "center", padding: "60px", color: "#64748b", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "16px" }}>
                <div style={{ fontSize: "40px", marginBottom: "15px" }}>🔍</div>

                <h3>No matching questions found.</h3>
                <p>Try adjusting your filters on the right.</p>
             </div>
          )}

          {filteredQuestions.map((q, index) => {
            const status = getStatusConfig(q.userStatus);
            
            return (
              <div 
                key={q._id} 
                className={`glass-panel ${status.glowClass}`} /* Applying dynamic glow class */
                style={{ padding: "25px", borderLeft: `4px solid ${status.border}` }}
              >
                
                {/* Meta Header */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "800", background: "rgba(15, 23, 42, 0.6)", padding: "5px 12px", borderRadius: "6px", color: "#94a3b8" }}>#{index + 1}</span>
                    <TechTag label={status.label} color={status.color} icon={status.icon} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {q.source && <TechTag label={q.source.slice(0, -3)} color="#94a3b8" icon="📚" />}
                      <TechTag label={q.difficulty} color={getDifficultyColor(q.difficulty)} icon="📊" />
                  </div>
                </div>

                {/* Content */}
                <div className="markdown-body" style={{ fontSize: "16px", lineHeight: "1.7", color: "#cbd5e1", marginBottom: "25px" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {q.content}
                  </ReactMarkdown>
                </div>

                {/* Diagram */}
                {q.diagram?.exists && (
                  <div style={{ margin: "0 0 25px 0", padding: "20px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px dashed rgba(71, 85, 105, 0.5)", textAlign: "center" }}>
                        <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", marginBottom: "10px", letterSpacing: "1px" }}>DIAGRAM DESCRIPTION</div>
                        <div className="markdown-body" style={{ color: "#94a3b8", fontSize: "14px" }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.diagram.description}</ReactMarkdown>
                        </div>
                  </div>
                  
                )}

                {/* Options Preview */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", opacity: 0.8 }}>
                  {q.options.slice(0, 2).map((opt, i) => (
                    <div key={i} className="markdown-body" style={{ padding: "10px 15px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: React.Fragment }}>{opt}</ReactMarkdown>
                    </div>
                  ))}
                  {q.options.length > 2 && <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center" }}>+ {q.options.length - 2} more options</div>}
                </div>

                {/* Footer Action */}
                <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "right" }}>
                  <button className="action-btn" onClick={() => handleQuestionClick(q)} style={{ padding: "10px 30px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px", background: q.userStatus === 'unattempted' ? cyanColor : "rgba(255,255,255,0.05)", color: q.userStatus === 'unattempted' ? "#0f172a" : "#94a3b8", border: "none" }}>
                    {q.userStatus === 'unattempted' ? "SOLVE CHALLENGE" : "REVIEW SOLUTION"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* --- RIGHT COLUMN: STICKY FILTERS --- */}
        <aside className="sticky-sidebar">
          <div className="filter-panel">
            <h3 style={{ margin: 0, fontSize: "16px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>🎛️</span> Controls
            </h3>

            <div>
              <div className="filter-section-title">Smart Search</div>
              <input 
                type="text" 
                placeholder="Keywords..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <div className="filter-section-title">Source</div>
              <select className="custom-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="all">All Sources</option>
                <option value="JEE Main">JEE Main</option>
                <option value="JEE Advanced">JEE Advanced</option>
                <option value="NCERT">NCERT</option>
              </select>
            </div>

            <div>
              <div className="filter-section-title">Difficulty Level</div>
              <select className="custom-select" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                <option value="all">Any Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <div className="filter-section-title">Your Progress</div>
              <div className="status-grid">
                <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
                <button className={`filter-btn ${statusFilter === 'unattempted' ? 'active' : ''}`} onClick={() => setStatusFilter('unattempted')}>New</button>
                <button className={`filter-btn ${statusFilter === 'mastered' ? 'active' : ''}`} onClick={() => setStatusFilter('mastered')}>Mastered</button>
                <button className={`filter-btn ${statusFilter === 'learned' ? 'active' : ''}`} onClick={() => setStatusFilter('learned')}>Learned</button>
              </div>
            </div>

            <div style={{ marginTop: "10px", textAlign: "center" }}>
               <span style={{ fontSize: "11px", color: "#475569", cursor: "pointer", fontWeight: "600", letterSpacing: "0.5px" }} onClick={() => {setSearchTerm(""); setStatusFilter("all"); setDifficultyFilter("all"); setSourceFilter("all");}}>
                 RESET FILTERS
               </span>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

export default QuestionsList;
