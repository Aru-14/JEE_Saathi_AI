import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';



// --- THEME CONSTANTS (UNCHANGED) ---
const cyanColor = "#22d3ee";
const greenColor = "#4ade80";
const redColor = "#f87171";
const darkBg = "#0f172a";

const styles = `
  /* 1. SMOOTH ENTRANCE ANIMATION */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .solve-container { 
    max-width: 850px; 
    margin: 0 auto; 
    padding: 40px 20px; 
    color: #e2e8f0; 
    font-family: 'Inter', sans-serif;
    animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  /* 2. PREMIUM GLASS PANEL BASE STYLES */
  .glass-panel { 
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
    backdrop-filter: blur(20px); 
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05); 
    border-top: 1px solid rgba(255, 255, 255, 0.1); 
    border-radius: 24px; 
    padding: 40px; 
    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); 
  }

  /* Decorative light glow at top right */
  .glass-panel::before {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 200px; height: 200px;
    background: ${cyanColor};
    filter: blur(120px);
    opacity: 0.15;
    pointer-events: none;
    transition: opacity 0.5s ease;
  }
  .glass-panel.submitted::before { opacity: 0; }


  /* MARKDOWN & MATH STYLES */
  .markdown-body { font-size: 1.1rem; line-height: 1.7; color: #cbd5e1; }
  .markdown-body p { margin-bottom: 1em; }
  .markdown-body strong { color: ${cyanColor}; font-weight: 800; text-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
  .markdown-body img { max-width: 100%; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
  
  .katex { font-size: 1.2em; color: #e2e8f0; }
  .katex-display { overflow-x: auto; overflow-y: hidden; padding: 1em 0; margin: 0; }

  /* CODE BLOCKS */
  .markdown-body pre { 
    background: rgba(0, 0, 0, 0.4); 
    padding: 20px; 
    border-radius: 12px; 
    border: 1px solid rgba(255, 255, 255, 0.05); 
  }
  .markdown-body code {
    font-family: 'Fira Code', monospace;
    background: rgba(34, 211, 238, 0.1);
    padding: 2px 8px;
    border-radius: 6px;
    color: ${cyanColor};
    font-size: 0.9em;
  }

  /* 3. INTERACTIVE OPTION CARDS */
  .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
  
  .option-card { 
    padding: 20px 25px; 
    border-radius: 16px; 
    border: 1px solid rgba(255,255,255,0.05); 
    background: rgba(255,255,255,0.02); 
    cursor: pointer; 
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); 
    display: flex; 
    align-items: center; 
    gap: 15px; 
    position: relative;
  }
  
  .option-card:hover { 
    background: rgba(255,255,255,0.05); 
    transform: translateY(-4px); 
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    border-color: rgba(255,255,255,0.1);
  }
  
  .option-selected { 
    border-color: ${cyanColor} !important; 
    background: rgba(34, 211, 238, 0.08) !important; 
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.15), inset 0 0 10px rgba(34, 211, 238, 0.05) !important; 
  }
  .option-correct { 
    border-color: ${greenColor} !important; 
    background: rgba(74, 222, 128, 0.1) !important; 
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.2) !important;
  }
  .option-incorrect { 
    border-color: ${redColor} !important; 
    background: rgba(248, 113, 113, 0.1) !important; 
    box-shadow: 0 0 20px rgba(248, 113, 113, 0.2) !important;
  }

  .option-badge { 
    min-width: 32px; height: 32px; 
    border-radius: 10px; 
    background: rgba(255,255,255,0.08); 
    display: flex; align-items: center; justify-content: center; 
    font-weight: 800; font-size: 14px; 
    color: #94a3b8;
    transition: all 0.3s ease;
  }
  .option-selected .option-badge { background: ${cyanColor}; color: #0f172a; }
  .option-correct .option-badge { background: ${greenColor}; color: #0f172a; }
  .option-incorrect .option-badge { background: ${redColor}; color: #fff; }

  /* 4. SLEEK INPUT FIELD */
  .integer-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255,255,255,0.1);
    color: white;
    padding: 20px;
    font-size: 1.5rem;
    border-radius: 12px;
    outline: none;
    transition: all 0.3s ease;
    margin-top: 15px;
    font-family: 'Fira Code', monospace;
    text-align: center;
    letter-spacing: 2px;
  }
  .integer-input:focus {
    border-color: ${cyanColor};
    box-shadow: 0 0 25px ${cyanColor}20;
    background: rgba(34, 211, 238, 0.02);
  }
  
  /* 5. MODERN BUTTONS */
  .action-btn { 
    padding: 14px 35px; 
    border-radius: 12px; 
    font-weight: 700; 
    cursor: pointer; 
    border: none; 
    font-size: 14px; 
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); 
    text-transform: uppercase;
    display: inline-flex; align-items: center; gap: 8px;
  }
  
  .btn-submit { 
    background: ${cyanColor}; 
    color: #0f172a; 
    box-shadow: 0 4px 15px rgba(34, 211, 238, 0.25);
  }
  .btn-submit:hover { 
    transform: translateY(-3px); 
    box-shadow: 0 10px 25px rgba(34, 211, 238, 0.4); 
  }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  
  .btn-secondary { 
    background: transparent; 
    color: #94a3b8; 
    border: 1px solid rgba(255,255,255,0.1); 
  }
  .btn-secondary:hover { 
    border-color: #fff; 
    color: #fff; 
    background: rgba(255,255,255,0.05); 
  }
  
  .btn-ai { 
    background: linear-gradient(135deg, #6366f1, #a855f7); 
    color: white; 
    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
  }
  .btn-ai:hover { 
    transform: translateY(-3px); 
    box-shadow: 0 10px 25px rgba(168, 85, 247, 0.5); 
  }
`;

const cleanContent = (text) => {
  if (!text) return "";
  let cleaned = text.split("\\\\").join("\\");
  cleaned = cleaned.replace(/\(\s*(.*?[=+\\^_\\-].*?)\s*\)/g, "$ $1 $");
  const latexCommands = ["\\frac", "\\vec", "\\int", "\\sum", "\\hat", "\\Delta", "\\sqrt", "\\cos", "\\sin"];
  if (latexCommands.some(cmd => cleaned.includes(cmd)) && !cleaned.includes("$")) {
     return `$$ ${cleaned} $$`;
  }
  return cleaned;
};

const SolveQuestion = () => {
  const token = localStorage.getItem('token');
  // const [imageSrc, setImageSrc] = useState("");
  const [prompt, setPrompt] = useState("");
const [imageSrc, setImageSrc] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
const [content,setContent]=useState("");
  const [question, setQuestion] = useState(null);
  const [accuracy, setAccuracy] = useState(null); // <--- NEW STATE FOR ACCURACY
  const [loading, setLoading] = useState(true);
  
  const [selectedOption, setSelectedOption] = useState(""); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const fetchQuestionData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/question/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // --- UPDATED RESPONSE HANDLING ---
        // Expecting response structure: { question: {...}, accuracy: 75.5 }
        if (res.data.question) {
          
            setQuestion(res.data.question);
            setAccuracy(res.data.accuracy);
            console.log("Fetched question data:", res.data.question.diagram.description);
            const p="Professional 2D scientific schematic, minimalist black ink line art on a clean white background. Subject: ${description}. Style: Academic textbook illustration, high contrast, orthographic 2D view. Technical details: Sharp thin lines, no 3D shading, no gradients, no artistic blur. Labels: Use clear sans-serif font for mathematical symbols and axis titles. Masterpiece quality, ISO standard technical drawing."+res.data.question.diagram.description;

            setPrompt(p);
        } else {
            // Fallback just in case
            setQuestion(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch question", err);
      } finally {
        setLoading(false);
      }
    };


    fetchQuestionData();

   
    // Cleanup the URL to avoid memory leaks
    

    return () => document.head.removeChild(styleSheet);
  }, [id]);



useEffect(() => {

    const fetchDiagram = async () => {
    if (!prompt) return;
    try {
        const userToken = localStorage.getItem('token'); 
        const response = await fetch(`http://localhost:5000/api/diagram?prompt=${encodeURIComponent(prompt)}`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        console.log("Fetch response:", response);

        if (!response.ok) {
            console.error("Backend returned error status:", response.status);
            return;
        }

        const blob = await response.blob();
        
        // CHECK: Is this actually an image?
        if (blob.type !== "image/jpeg" && blob.type !== "image/png") {
            console.error("Received wrong file type:", blob.type);
            return;
        }

        const url = URL.createObjectURL(blob);
        console.log("✅ Created healthy Blob URL:", url);
        setImageSrc(url);

    } catch (error) {
        console.error('Fetch failed:', error);
    }
};
    fetchDiagram();

    // Cleanup to prevent memory leaks
    return () => {
        if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
}, [prompt]);




  const handleSubmit = async () => {
    

    if (selectedOption === "" || selectedOption === null) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/submit', {
        questionId: question._id,
        selectedOption: selectedOption 
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsSubmitted(true);
      setSubmissionResult(res.data.isCorrect ? 'correct' : 'incorrect');
    } catch (err) {
       if (err.response && err.response.status === 401) {
         localStorage.removeItem('token');
         navigate('/login');
       }
       alert("Error submitting answer");
    }
  };

  const handleAskAI = () => {

   let contentNew=question.content;
   if(question.options&&question.options.length>0){
    contentNew+=" Options: "; 
  contentNew+=question.options.map((opt,idx)=>`(${String.fromCharCode(65+idx)}) ${opt}`).join(", ");
   }  
   if(question.diagram.exists){
    contentNew+=" Diagram Description: "+question.diagram.description;
   }
   console.log("AI Prompt Content:",contentNew);
     
   
    setLoadingAi(true);
     fetch("http://localhost:8000/ask",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ prompt: `Provide a detailed explanation for the following question ${contentNew} ` })
    }).then(res => res.json())
    .then(data => {
      setAiExplanation(data.answer);
    })
    .catch(err => {
      console.error("Error fetching AI explanation:", err);
      alert("Failed to get AI explanation");
    })
    .finally(() => {
      setLoadingAi(false);
    });
  };

  const getOptionStyleClass = (optionId) => {
    if (showSolution) {
      const correctOption = question.correct_options[0]; 
      if (optionId === correctOption) return "option-correct";
      if (optionId === selectedOption && optionId !== correctOption) return "option-incorrect";
    }
    if (selectedOption === optionId) return "option-selected";
    return "";
  };

  const getMainPanelStyle = () => {
    if (!isSubmitted) return {};

    if (submissionResult === 'correct') {
      return {
        borderColor: greenColor,
        boxShadow: `0 0 40px ${greenColor}30, inset 0 0 30px ${greenColor}10`,
      };
    }
    if (submissionResult === 'incorrect') {
      return {
        borderColor: redColor,
        boxShadow: `0 0 40px ${redColor}30, inset 0 0 30px ${redColor}10`,
      };
    }
    return {};
  };


  if (loading) return <div style={{ color: cyanColor, padding: "100px", textAlign: "center", letterSpacing: "2px", fontWeight: "bold" }}>LOADING DATA...</div>;
  if (!question) return <div style={{ color: redColor, padding: "100px", textAlign: "center", letterSpacing: "2px", fontWeight: "bold" }}>QUESTION NOT FOUND</div>;

  return (
    <div style={{ minHeight: "100vh", background: darkBg }}>
      {console.log("Prompt",prompt)}
      <div className="solve-container">
        
        {/* HEADER NAV, ACCURACY & RESULT LABEL */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            {/* Left: Back Button */}
            <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", transition: "color 0.2s" }}>
              <span>←</span> BACK TO LIST
            </button>

            {/* Right Group: Accuracy + Result */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                
                {/* 1. ACCURACY BADGE */}
                {accuracy !== null && accuracy !== undefined && (
                    <div style={{ 
                        background: "rgba(34, 211, 238, 0.08)", 
                        border: `1px solid ${cyanColor}40`,
                        color: cyanColor, 
                        padding: "8px 16px", 
                        borderRadius: "20px", 
                        fontSize: "13px", 
                        fontWeight: "700",
                        display: "flex", alignItems: "center", gap: "6px",
                        letterSpacing: "0.5px"
                    }}>
                        <span>🎯</span>
                       {accuracy}% Acc
                    </div>
                )}

                {/* 2. DYNAMIC RESULT LABEL */}
                {isSubmitted && (
                  <div style={{ 
                    color: submissionResult === 'correct' ? greenColor : redColor, 
                    fontSize: "14px", 
                    fontWeight: "800", 
                    letterSpacing: "1px", 
                    textTransform: "uppercase", 
                    background: submissionResult === 'correct' ? `rgba(74, 222, 128, 0.15)` : `rgba(248, 113, 113, 0.15)`, 
                    padding: "8px 16px", 
                    borderRadius: "20px",
                    border: `1px solid ${submissionResult === 'correct' ? greenColor : redColor}30`,
                    display: "flex", alignItems: "center", gap: "8px"
                  }}>
                    {submissionResult === 'correct' ? "Correct Answer" : "Incorrect"}
                  </div>
                )}
            </div>
        </div>

        {/* MAIN PANEL */}
        <div className={`glass-panel ${isSubmitted ? 'submitted' : ''}`} style={getMainPanelStyle()}>
          
          {/* QUESTION CONTENT */}
          <div className="markdown-body" style={{ marginBottom: "30px" }}>
            <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]} 
                rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
            >
              {cleanContent(question.content)}
            </ReactMarkdown>
          </div>

          {/* DIAGRAM SECTION */}
          {question.diagram?.exists && (
             <div style={{ textAlign: "center", marginBottom: "35px", padding: "30px", background: "rgba(0,0,0,0.2)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                
                <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>DIAGRAM DESCRIPTION</div>
                <div className="markdown-body" style={{ color: "#94a3b8", fontSize: "14px" }}>
                   <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
                   >
                      {cleanContent(question.diagram.description)}
                   </ReactMarkdown>
                </div>
                       {console.log(imageSrc)}
                {imageSrc ? (
                   <img 
                     src={imageSrc}     
                      alt="Question Diagram"
                      style={{ marginTop: "20px", maxWidth: "100%", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                    />
                ) : (

                    <div style={{ marginTop: "20px", color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>Loading diagram...</div>
                )}
             </div>
          )}

          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", margin: "0" }}></div>

          {/* --- OPTIONS / INPUT --- */}
          {question.options && question.options.length > 0 ? (
            <div className="options-grid">
              {question.options.map((opt, index) => {
                const optionId = index + 1;
                return (
                  <div 
                    key={index} 
                    className={`option-card ${getOptionStyleClass(optionId)}`}
                    onClick={() => !isSubmitted && setSelectedOption(optionId)}
                  >
                    <div className="option-badge">{String.fromCharCode(65 + index)}</div>
                    <div className="markdown-body" style={{ fontSize: "16px", lineHeight: "1.5" }}>
                      <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]} 
                          rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]} 
                          components={{ p: React.Fragment }}
                      >
                          {cleanContent(opt)}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ marginTop: "30px", textAlign: "center" }}>
               <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "700", letterSpacing: "1px", marginBottom: "10px" }}>ENTER YOUR ANSWER</div>
               <input 
                 type="text" 
                 className="integer-input" 
                 placeholder="?"
                 value={selectedOption || ""}
                 onChange={(e) => !isSubmitted && setSelectedOption(e.target.value)}
                 disabled={isSubmitted}
               />
               
               {showSolution && (
                  <div style={{ marginTop: "25px", padding: "20px", borderRadius: "12px", background: "rgba(74, 222, 128, 0.1)", border: `1px solid ${greenColor}` }}>
                      <div style={{ color: greenColor, fontSize: "12px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>CORRECT ANSWER</div>
                      <div style={{ marginTop: "5px", color: "#fff", fontSize: "24px", fontFamily: "monospace", fontWeight: "bold" }}>
                         {question.correct_options && question.correct_options[0]}
                      </div>
                  </div>
               )}
            </div>
          )}

          {/* --- FOOTER ACTIONS --- */}
          <div style={{ marginTop: "40px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "15px" }}>
              {!isSubmitted ? (
                <button className="action-btn btn-submit" onClick={handleSubmit} disabled={selectedOption === "" || selectedOption === null}>
                  Submit Answer <span>➜</span>
                </button>
              ) : (
                <>
                  <button className="action-btn btn-ai" onClick={handleAskAI} disabled={loadingAi}>
                    {loadingAi ? "Analyzing..." : "✨ AI Explanation"}
                  </button>
                  <button className="action-btn btn-secondary" onClick={() => setShowSolution(true)}>
                    View Solution
                  </button>
                </>
              )}
            </div>
          </div>

          {/* AI EXPLANATION BOX */}
          {aiExplanation && (
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
             
                             {aiExplanation}
             
                           </ReactMarkdown>
          )}

        </div>
      </div>
    </div>
  );
};

export default SolveQuestion;