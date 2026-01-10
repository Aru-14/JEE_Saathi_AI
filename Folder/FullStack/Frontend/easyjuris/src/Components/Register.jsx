import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(""); 
  const [currentClass, setCurrentClass] = useState("12th");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1);
  const [schoolName, setSchoolName] = useState("");
  const [targetExams, setTargetExams] = useState(["JEE Mains"]);

  // Hover state for exams
  const [hoveredExam, setHoveredExam] = useState(null);

  // Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!name || !username || !email || !password) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("https://jee-saathi-ai-repo-2.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, username, email, password, avatar,
          currentClass, targetYear, targetExams, schoolName
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration Successful. Redirecting...");
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.msg || "Registration failed.");
        setSuccess(false);
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const toggleExam = (exam) => {
    setTargetExams(prev => 
      prev.includes(exam) ? prev.filter(e => e !== exam) : [...prev, exam]
    );
  };

  // --- STYLES ---
  const cyanColor = "#22d3ee"; 

  const containerStyle = {
    display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: "40px 20px", color: "#e2e8f0"
  };

  const formStyle = {
    background: "rgba(255, 255, 255, 0.03)", 
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "40px", borderRadius: "16px", width: "450px",
    border: `2px solid ${cyanColor}`, 
    boxShadow: `0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.2), inset 0 0 15px rgba(34, 211, 238, 0.15)`
  };

  const inputStyle = {
    width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "8px", 
    border: `1px solid rgba(34, 211, 238, 0.3)`, background: "transparent",
    boxShadow: `inset 0 0 5px rgba(34, 211, 238, 0.1)`,
    color: "#fff", outline: "none", fontSize: "14px", transition: "all 0.3s ease",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = cyanColor;
    e.target.style.boxShadow = `0 0 15px rgba(34, 211, 238, 0.5), inset 0 0 8px rgba(34, 211, 238, 0.3)`;
    e.target.style.background = "rgba(34, 211, 238, 0.05)";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(34, 211, 238, 0.3)";
    e.target.style.boxShadow = `inset 0 0 5px rgba(34, 211, 238, 0.1)`;
    e.target.style.background = "transparent";
  };

  const labelStyle = {
    display: "block", color: cyanColor, fontSize: "12px", fontWeight: "600", 
    marginBottom: "5px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8
  };

  const sectionHeaderStyle = {
    color: "#fff", borderBottom: `1px solid rgba(34, 211, 238, 0.3)`, paddingBottom: "10px", 
    marginBottom: "15px", marginTop: "25px", fontSize: "16px", fontWeight: "700",
    textShadow: `0 0 10px rgba(34, 211, 238, 0.5)`
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ marginBottom: "5px", color: "#fff", fontSize: "26px", fontWeight: "700", textAlign: "center", textShadow: `0 0 15px ${cyanColor}` }}>
          Create Account
        </h2>
        <p style={{ color: "#a5f3fc", fontSize: "14px", marginBottom: "25px", textAlign: "center", opacity: 0.8 }}>
          Enter your details to join the platform.
        </p>

        {/* --- PERSONAL INFO --- */}
        <h4 style={{ ...sectionHeaderStyle, marginTop: "0" }}>Personal Details</h4>
        
        <label style={labelStyle}>Full Name</label>
        <input placeholder="Ex. John Doe" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        
        <label style={labelStyle}>Username</label>
        <input placeholder="Ex. johndoe123" value={username} onChange={e => setUsername(e.target.value)} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        
        <label style={labelStyle}>Email Address</label>
        <input placeholder="Ex. john@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        
        <label style={labelStyle}>Password</label>
        <input placeholder="Minimum 5 characters" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={5} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />

        <label style={labelStyle}>Profile Picture URL (Optional)</label>
        <input 
          placeholder="Ex. https://example.com/me.png" 
          type="url" 
          value={avatar} 
          onChange={e => setAvatar(e.target.value)} 
          style={inputStyle} 
          onFocus={handleFocus} 
          onBlur={handleBlur} 
        />
        
        {/* --- ACADEMIC INFO --- */}
        <h4 style={sectionHeaderStyle}>Academic Profile</h4>

        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          
          {/* --- CUSTOM TRANSPARENT DROPDOWN --- */}
          <div style={{ flex: 1, position: "relative" }} ref={dropdownRef}>
            <label style={labelStyle}>Class</label>
            
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                ...inputStyle,
                marginBottom: 0,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: isDropdownOpen ? cyanColor : "rgba(34, 211, 238, 0.3)",
                boxShadow: isDropdownOpen ? `0 0 15px rgba(34, 211, 238, 0.5)` : `inset 0 0 5px rgba(34, 211, 238, 0.1)`
              }}
            >
              <span>{currentClass === "11th" ? "Class 11" : currentClass === "12th" ? "Class 12" : "Dropper"}</span>
              <span style={{ fontSize: "10px", color: cyanColor }}>▼</span>
            </div>

            {isDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                marginTop: "5px",
                borderRadius: "8px",
                overflow: "hidden",
                border: `1px solid ${cyanColor}`,
                background: "rgba(15, 23, 42, 0.9)", 
                backdropFilter: "blur(10px)", 
                zIndex: 50,
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
              }}>
                {["11th", "12th", "Dropper"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setCurrentClass(opt);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#fff",
                      transition: "background 0.2s",
                      borderBottom: "1px solid rgba(255,255,255,0.05)"
                    }}
                    onMouseOver={(e) => e.target.style.background = "rgba(34, 211, 238, 0.2)"}
                    onMouseOut={(e) => e.target.style.background = "transparent"}
                  >
                    {opt === "11th" ? "Class 11" : opt === "12th" ? "Class 12" : "Dropper"}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Target Year</label>
            <input type="number" value={targetYear} onChange={e => setTargetYear(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} onFocus={handleFocus} onBlur={handleBlur} />
          </div>
        </div>

        <label style={labelStyle}>Institution Name</label>
        <input placeholder="School or College Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />

        <div style={{ marginBottom: "30px" }}>
          <label style={labelStyle}>Target Exams</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px", justifyItems: "center" }}>
            {['JEE Mains', 'JEE Advanced'].map((exam) => {
              const isSelected = targetExams.includes(exam);
              const isHovered = hoveredExam === exam;
              
              return (
                <span
                  key={exam}
                  onClick={() => toggleExam(exam)}
                  onMouseEnter={() => setHoveredExam(exam)}
                  onMouseLeave={() => setHoveredExam(null)}
                  style={{
                    padding: "8px 16px", borderRadius: "20px", fontSize: "13px", cursor: "pointer", fontWeight: "600", transition: "all 0.3s ease",
                    // LOGIC UPDATED FOR HOVER
                    border: isSelected || isHovered ? `2px solid ${cyanColor}` : `1px solid rgba(34, 211, 238, 0.3)`,
                    background: isSelected ? "rgba(34, 211, 238, 0.1)" : (isHovered ? "rgba(34, 211, 238, 0.05)" : "transparent"),
                    color: isSelected || isHovered ? cyanColor : "#94a3b8",
                    boxShadow: isSelected || isHovered ? `0 0 15px rgba(34, 211, 238, 0.6), inset 0 0 5px rgba(34, 211, 238, 0.3)` : "none"
                  }}
                >
                  {exam}
                </span>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          style={{
            width: "100%", padding: "14px", borderRadius: "8px", background: "transparent",
            border: `2px solid ${cyanColor}`, color: cyanColor, fontSize: "16px", fontWeight: "700",
            letterSpacing: "1px", cursor: "pointer", transition: "all 0.3s ease",
            boxShadow: `0 0 15px rgba(34, 211, 238, 0.3)`,
          }}
          onMouseOver={e => {
            e.target.style.background = cyanColor;
            e.target.style.color = "#0f172a";
            e.target.style.boxShadow = `0 0 30px rgba(34, 211, 238, 0.8), inset 0 0 10px rgba(34, 211, 238, 0.5)`;
          }}
          onMouseOut={e => {
            e.target.style.background = "transparent";
            e.target.style.color = cyanColor;
            e.target.style.boxShadow = `0 0 15px rgba(34, 211, 238, 0.3)`;
          }}
        >
          COMPLETE REGISTRATION
        </button>

        {message && <p style={{ marginTop: "20px", fontSize: "14px", textAlign: "center", color: success ? "#4ade80" : "#f87171", textShadow: success ? "0 0 10px #4ade80" : "none" }}>{message}</p>}
        
        <p style={{ marginTop: "25px", color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
          Already have an account?{" "}
          <span 
            onClick={() => navigate("/login")} 
            style={{ 
              color: cyanColor, 
              cursor: "pointer", 
              fontWeight: "600", 
              textShadow: `0 0 10px rgba(34, 211, 238, 0.5)`,
             
              
              textUnderlineOffset: "4px"
            }}
          >
            Sign in
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
