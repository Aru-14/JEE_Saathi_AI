import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "50px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          textAlign: "center",
          width: "400px",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#333", fontSize: "28px" }}>
        Welcome to Your Dashboard!
        </h1>
        <p
          style={{
            marginBottom: "25px",
            color: "#555",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          You are in 🎉 <br />
          <strong>"Stay focused, stay productive, and keep growing"</strong>
        </p>

        <button
          onClick={handleLogout}
          style={{
            padding: "14px 28px",
            border: "none",
            borderRadius: "10px",
            background: "linear-gradient(90deg, #ff6a00, #ee0979)",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.target.style.background =
              "linear-gradient(90deg, #ee0979, #ff6a00)")
          }
          onMouseOut={(e) =>
            (e.target.style.background =
              "linear-gradient(90deg, #ff6a00, #ee0979)")
          }
        >
          Logout
        </button>
      </div>
      
    </div>
  );
}

export default Dashboard;
