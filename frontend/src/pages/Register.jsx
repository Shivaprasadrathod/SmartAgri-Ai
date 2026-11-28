import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Sprout, User, Mail, Lock, Globe, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, enterAsGuest } = useAuth();
  const redirectTo = location.state?.from || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.register(name, email, password);
      setSuccess("Account created! Signing you in…");
      // Automatically log in after registration
      try {
        const loginData = await api.login(email, password);
        loginUser(loginData.user, loginData.access_token);
        setTimeout(() => navigate(redirectTo, { replace: true }), 600);
      } catch {
        setSuccess("Account created successfully! Please sign in.");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    enterAsGuest();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(170deg, #f0fdf4 0%, #ecfdf5 40%, #dcfce7 100%)", padding: "1.5rem",
    }}>
      <div style={{
        maxWidth: "460px", width: "100%", background: "#fff", borderRadius: "20px",
        padding: "2.5rem 2.25rem",
        boxShadow: "0 20px 40px -8px rgba(22, 101, 52, 0.12), 0 4px 12px rgba(0,0,0,0.04)",
        border: "1px solid #dcfce7",
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: "58px", height: "58px", background: "linear-gradient(135deg, #166534, #22c55e)",
            color: "#fff", borderRadius: "16px",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: "0.75rem", boxShadow: "0 4px 12px rgba(22, 101, 52, 0.25)",
          }}>
            <Sprout size={32} />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#111827", margin: "0 0 0.25rem 0" }}>
            Farmer Registration
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>
            Join SmartAgri AI — free crop & market intelligence
          </p>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", color: "#b91c1c", padding: "0.85rem 1rem", borderRadius: "10px",
            fontSize: "0.85rem", marginBottom: "1.25rem", border: "1px solid #fecaca",
            display: "flex", gap: "10px", alignItems: "center",
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#f0fdf4", color: "#15803d", padding: "0.85rem 1rem", borderRadius: "10px",
            fontSize: "0.85rem", marginBottom: "1.25rem", border: "1px solid #bbf7d0",
            display: "flex", gap: "10px", alignItems: "center",
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> {success}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type="text" required autoFocus placeholder="Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type="email" required placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type={showPassword ? "text" : "password"} required placeholder="Create a secure password" value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 2.75rem 0.75rem 2.5rem", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{
              background: "linear-gradient(135deg, #166534, #15803d)", color: "#fff", border: "none", borderRadius: "10px",
              padding: "0.9rem", fontWeight: "700", fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: "0.25rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(22, 101, 52, 0.25)",
            }}>
            {loading ? <><RefreshCw size={18} className="spin" /> Creating Account…</> : "Create Free Account"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0.25rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: "600" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          </div>

          <button type="button" onClick={handleGuestAccess}
            style={{
              background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "0.85rem", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
            <Globe size={18} /> Continue as Guest — Explore Website <ArrowRight size={16} />
          </button>

          <div style={{ textAlign: "center", fontSize: "0.9rem", color: "#6b7280", marginTop: "0.25rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#166534", fontWeight: "700", textDecoration: "none" }}>Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
