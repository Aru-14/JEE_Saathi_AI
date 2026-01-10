import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Zap, Database, CheckCircle, Search } from "lucide-react";
import axios from "axios";

const cyanColor = "#22d3ee";
const darkBg = "#0b1121";

// --- ANIMATIONS ---
const localStyles = `
  @keyframes scanline {
    0% { top: 0%; }
    100% { top: 100%; }
  }
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 5px ${cyanColor}40; }
    50% { box-shadow: 0 0 20px ${cyanColor}80; }
    100% { box-shadow: 0 0 5px ${cyanColor}40; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const UploadQueImage = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [successData, setSuccessData] = useState(null); // Stores AI Response
  
  const [source, setSource] = useState("");
  const [answer, setAnswer] = useState(""); 
  const token = localStorage.getItem('token');

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = localStyles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image || !source || !answer) {
      alert("Please provide Image, Source, and Answer Key.");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("source", source);
    formData.append("correctAnswer", answer);

    try {
      const response = await axios.post("https://jee-saathi-ai-repo-2.onrender.com/api/uploadQueImage", formData, {
        headers: { 
          "Content-Type": "multipart/form-data", 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.data.success) {
        // Success: response.data.question contains the DB record created by AI
        setSuccessData(response.data.question);
      }
    } catch (err) {
      console.error("Transmission failed", err);
      alert("Neural Sync failed. Ensure server is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: darkBg, color: "#e2e8f0",
      fontFamily: "'Inter', sans-serif", padding: "40px",
      display: "flex", flexDirection: "column", alignItems: "center", position: "relative"
    }}>
      {/* Background Grid */}
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        backgroundImage: `linear-gradient(${cyanColor}05 1px, transparent 1px), linear-gradient(90deg, ${cyanColor}05 1px, transparent 1px)`,
        backgroundSize: "50px 50px", pointerEvents: "none", zIndex: 0
      }} />

      {/* HEADER */}
      <div style={{ width: "100%", maxWidth: "800px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px", zIndex: 1 }}>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "12px", letterSpacing: "1px" }}>
          <ChevronLeft size={18} /> BACK TO PRACTICE PROBLEMS
        </button>
        <div style={{ textAlign: "right" }}>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", fontStyle: "italic", color: "#fff", letterSpacing: "-1px" }}>SYNC_TERMINAL</h1>
          <p style={{ margin: 0, fontSize: "10px", color: cyanColor, letterSpacing: "2px", fontWeight: "bold" }}>ADD POWER TO JEE SAATHI AI</p>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div style={{
        width: "100%", maxWidth: "800px", background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(20px)", borderRadius: "28px", border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "40px", display: "flex", flexDirection: "column", gap: "32px", zIndex: 1,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", position: "relative"
      }}>
        
        {/* SCANNER UI */}
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>[01] VISUAL_INPUT_DETECTION</p>
          <label style={{
            width: "100%", height: "280px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            border: `2px dashed ${preview ? cyanColor : "rgba(255,255,255,0.1)"}`,
            borderRadius: "20px", cursor: "pointer", overflow: "hidden", position: "relative",
            background: preview ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.02)", transition: "0.3s"
          }}>
            {!preview ? (
              <>
                <Upload size={32} color={cyanColor} style={{ marginBottom: "12px", opacity: 0.6 }} />
                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>UPLOAD QUESTION IMAGE</span>
              </>
            ) : (
              <>
                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                {isAnalyzing && (
                  <div style={{
                    position: "absolute", left: 0, width: "100%", height: "2px",
                    background: cyanColor, boxShadow: `0 0 15px ${cyanColor}`,
                    animation: "scanline 2s linear infinite"
                  }} />
                )}
              </>
            )}
            <input type="file" onChange={handleImageChange} style={{ display: "none" }} accept="image/*" />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>[02] SOURCE_IDENTIFIER</p>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: cyanColor }} />
              <input 
                placeholder="e.g. Allen Module, PYQ"
                value={source} onChange={(e) => setSource(e.target.value)}
                style={{ width: "100%", padding: "16px 16px 16px 48px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", color: "#fff", outline: "none", fontSize: "14px" }}
              />
            </div>
          </div>

          <div>
            <p style={{ fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>[03] VERIFIED_ANSWER</p>
            <div style={{ position: "relative" }}>
              <CheckCircle size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: cyanColor }} />
              <input 
                placeholder="Option (1/2/3/4) or Value"
                value={answer} onChange={(e) => setAnswer(e.target.value)}
                style={{ width: "100%", padding: "16px 16px 16px 48px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", color: "#fff", outline: "none", fontSize: "14px" }}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpload}
          disabled={isAnalyzing}
          style={{
            marginTop: "10px", width: "100%", padding: "18px",
            background: isAnalyzing ? "#1e293b" : "#fff",
            color: "#000", border: "none", borderRadius: "16px",
            fontSize: "13px", fontWeight: "900", textTransform: "uppercase",
            letterSpacing: "2px", cursor: isAnalyzing ? "wait" : "pointer",
            transition: "0.3s", boxShadow: isAnalyzing ? "none" : `0 10px 30px ${cyanColor}30`
          }}
        >
          {isAnalyzing ? "QUESTION EXTRACTION IN PROGRESS..." : "SYNC WITH JEE SAATHI AI"}
        </button>
      </div>

      {/* SUCCESS MODAL */}
      {successData && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, background: "rgba(11, 17, 33, 0.95)",
          backdropFilter: "blur(15px)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "90%", maxWidth: "480px", background: "#0f172a", border: `1px solid ${cyanColor}`,
            borderRadius: "32px", padding: "40px", textAlign: "center", animation: "slideUp 0.4s ease-out",
            boxShadow: `0 0 50px ${cyanColor}20`
          }}>
            <div style={{ 
              width: "70px", height: "70px", background: `${cyanColor}15`, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
              border: `1px solid ${cyanColor}`
            }}>
              <CheckCircle size={32} color={cyanColor} />
            </div>
            
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#fff", marginBottom: "8px" }}>SYNC SUCCESSFUL</h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
              Data integrated. You solved <span style={{ color: cyanColor, fontWeight: "800" }}>1 Question</span> in:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "9px", color: cyanColor, fontWeight: "bold", display: "block", marginBottom: "4px" }}>SUBJECT_ANALYSIS</span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>{successData.subject}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "9px", color: cyanColor, fontWeight: "bold", display: "block", marginBottom: "4px" }}>UNIT & MODULE</span>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>{successData.unit} : {successData.topic}</span>
              </div>
            </div>

            <button onClick={() => navigate("/Practice")} style={{
              width: "100%", padding: "16px", borderRadius: "14px", background: cyanColor, color: "#000",
              border: "none", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer"
            }}>
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      {/* <div style={{ marginTop: "40px", display: "flex", gap: "24px", opacity: 0.4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "800" }}><Database size={12}/> ATLAS_LOCKED</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "800" }}><Zap size={12}/> LLAMA_3.2_ACTIVE</div>
      </div> */}
    </div>
  );
};

export default UploadQueImage;
