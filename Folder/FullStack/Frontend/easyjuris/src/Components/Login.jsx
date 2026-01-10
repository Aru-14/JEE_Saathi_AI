import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("https://jee-saathi-ai-repo-2.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        
        setMessage("Login successful. Redirecting...");
        setSuccess(true);
        
        setTimeout(() => navigate("/Home"), 1000);
      } else {
        setMessage(data.msg || "Login failed");
        setSuccess(false);
      }
    } catch (err) {
      setMessage("Something went wrong");
      setSuccess(false);
      console.error(err);
    }
  };

  // --- STYLES (Matched with Register.jsx) ---
  const cyanColor = "#22d3ee"; 

  const containerStyle = {
    display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: "40px 20px", color: "#e2e8f0"
  };

  const formStyle = {
    background: "rgba(255, 255, 255, 0.03)", 
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "40px", borderRadius: "16px", width: "400px", // Slightly narrower than register
    border: `2px solid ${cyanColor}`, 
    boxShadow: `0 0 20px rgba(34, 211, 238, 0.4), 0 0 40px rgba(34, 211, 238, 0.2), inset 0 0 15px rgba(34, 211, 238, 0.15)`
  };

  const inputStyle = {
    width: "100%", padding: "12px", marginBottom: "20px", borderRadius: "8px", 
    border: `1px solid rgba(34, 211, 238, 0.3)`, background: "transparent",
    boxShadow: `inset 0 0 5px rgba(34, 211, 238, 0.1)`,
    color: "#fff", outline: "none", fontSize: "14px", transition: "all 0.3s ease",
  };

  const labelStyle = {
    display: "block", color: cyanColor, fontSize: "12px", fontWeight: "600", 
    marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8
  };

  // --- INTERACTION HANDLERS ---
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

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ marginBottom: "10px", color: "#fff", fontSize: "28px", fontWeight: "700", textAlign: "center", textShadow: `0 0 15px ${cyanColor}` }}>
          Welcome Back
        </h2>
        <p style={{ color: "#a5f3fc", fontSize: "14px", marginBottom: "30px", textAlign: "center", opacity: 0.8 }}>
          Sign in to access your study dashboard.
        </p>

        {/* EMAIL INPUT */}
        <label style={labelStyle}>Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Ex. john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* PASSWORD INPUT */}
        <label style={labelStyle}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        <button
          type="submit"
          style={{
            width: "100%", padding: "14px", borderRadius: "8px", background: "transparent",
            border: `2px solid ${cyanColor}`, color: cyanColor, fontSize: "16px", fontWeight: "700",
            letterSpacing: "1px", cursor: "pointer", transition: "all 0.3s ease",
            boxShadow: `0 0 15px rgba(34, 211, 238, 0.3)`,
            marginTop: "10px"
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
          LOGIN
        </button>

        {message && (
          <p style={{ 
            marginTop: "20px", 
            fontSize: "14px", 
            textAlign: "center", 
            color: success ? "#4ade80" : "#f87171", 
            textShadow: success ? "0 0 10px #4ade80" : "none" 
          }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: "25px", color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: cyanColor, cursor: "pointer", fontWeight: "600", textShadow: `0 0 10px rgba(34, 211, 238, 0.5)` }}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
