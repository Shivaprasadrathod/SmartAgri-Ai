import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Sprout,
  Mail,
  Lock,
  Globe,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, enterAsGuest } = useAuth();

  // Where to redirect after login
  const redirectTo = location.state?.from || "/dashboard";

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register form
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState(""); // "credentials" | "network" | "unknown"
  const [success, setSuccess] = useState("");

  const clearFeedback = () => { setError(""); setErrorType(""); setSuccess(""); };

  // ─── LOGIN ───────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      const data = await api.login(email, password);

      if (!data.user || !data.user.email) {
        setError("Your account information could not be loaded. You can try again, create an account, or explore SmartAgri AI without logging in.");
        setErrorType("unknown");
        setLoading(false);
        return;
      }

      loginUser(data.user);
      setSuccess("Login successful! Redirecting to dashboard…");
      setTimeout(() => navigate(redirectTo, { replace: true }), 600);
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
        setError("Cannot connect to the SmartAgri server. Please check that the backend is running and try again.");
        setErrorType("network");
      } else if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("password") || msg.toLowerCase().includes("email")) {
        setError(msg);
        setErrorType("credentials");
      } else {
        setError(msg || "Login failed. Please try again.");
        setErrorType("unknown");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── REGISTER ────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      await api.register(regName, regEmail, regPassword);
      setSuccess("Account created successfully! You can now sign in.");
      setIsRegisterView(false);
      setEmail(regEmail);
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError("Cannot connect to the server. Please check your connection.");
        setErrorType("network");
      } else {
        setError(msg || "Registration failed.");
        setErrorType("unknown");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── GUEST ───────────────────────────────────────────
  const handleGuestAccess = () => {
    enterAsGuest();
    navigate("/dashboard", { replace: true });
  };

  // ─── INPUT FIELD COMPONENT ──────────────────────────
  const InputField = ({ icon: Icon, label, type, value, onChange, placeholder, autoFocus, showToggle }) => (
    <div>
      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
        <input
          type={showToggle ? (showPassword ? "text" : "password") : type}
          required
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: showToggle ? "0.75rem 2.75rem 0.75rem 2.5rem" : "0.75rem 1rem 0.75rem 2.5rem",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            fontSize: "0.95rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border 0.2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#22c55e"; }}
          onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: "2px" }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );

  // ─── RENDER ──────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(170deg, #f0fdf4 0%, #ecfdf5 40%, #dcfce7 100%)",
      padding: "1.5rem",
    }}>
      <div style={{
        maxWidth: "460px",
        width: "100%",
        background: "#fff",
        borderRadius: "20px",
        padding: "2.5rem 2.25rem",
        boxShadow: "0 20px 40px -8px rgba(22, 101, 52, 0.12), 0 4px 12px rgba(0,0,0,0.04)",
        border: "1px solid #dcfce7",
      }}>

        {/* ── Logo & Title ── */}
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
            SmartAgri AI
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>
            {isRegisterView ? "Create your free farmer account" : "Sign in to your farm intelligence dashboard"}
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{
            background: errorType === "network" ? "#fefce8" : "#fef2f2",
            color: errorType === "network" ? "#a16207" : "#b91c1c",
            padding: "0.85rem 1rem",
            borderRadius: "10px",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
            border: `1px solid ${errorType === "network" ? "#fde68a" : "#fecaca"}`,
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            lineHeight: "1.5",
          }}>
            {errorType === "network" ? <WifiOff size={18} style={{ flexShrink: 0, marginTop: "2px" }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />}
            <div>
              <div>{error}</div>

              {/* Recovery actions for fetch-fail or profile-load-fail */}
              {(errorType === "network" || errorType === "unknown") && (
                <div style={{ display: "flex", gap: "12px", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => { clearFeedback(); }}
                    style={{ background: "none", border: "none", textDecoration: "underline", fontWeight: "700", cursor: "pointer", padding: 0, color: "inherit", fontSize: "0.85rem" }}
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleGuestAccess}
                    style={{ background: "none", border: "none", textDecoration: "underline", fontWeight: "700", cursor: "pointer", padding: 0, color: "inherit", fontSize: "0.85rem" }}
                  >
                    Continue as Guest
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Success Banner ── */}
        {success && (
          <div style={{
            background: "#f0fdf4", color: "#15803d",
            padding: "0.85rem 1rem", borderRadius: "10px",
            fontSize: "0.85rem", marginBottom: "1.25rem",
            border: "1px solid #bbf7d0",
            display: "flex", gap: "10px", alignItems: "center",
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            {success}
          </div>
        )}

        {/* ══════════ LOGIN FORM ══════════ */}
        {!isRegisterView ? (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
            <InputField icon={Mail} label="Email Address" type="email" value={email} onChange={setEmail} placeholder="farmer@example.com" autoFocus />
            <InputField icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" showToggle />

            {/* Primary action */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #166534, #15803d)",
                color: "#fff", border: "none", borderRadius: "10px",
                padding: "0.9rem", fontWeight: "700", fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: "0.25rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 4px 12px rgba(22, 101, 52, 0.25)",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? <><RefreshCw size={18} className="spin" /> Signing In…</> : "Sign In to Farm Dashboard"}
            </button>

            {/* ── Divider ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0.25rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: "600" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            {/* ── Guest Access Button ── */}
            <button
              type="button"
              onClick={handleGuestAccess}
              style={{
                background: "#f8fafc",
                color: "#334155",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.85rem",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <Globe size={18} />
              Continue as Guest — Explore Website
              <ArrowRight size={16} />
            </button>

            {/* ── Footer Links ── */}
            <div style={{ textAlign: "center", fontSize: "0.9rem", color: "#6b7280", marginTop: "0.25rem" }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsRegisterView(true); clearFeedback(); }}
                style={{ background: "none", border: "none", color: "#166534", fontWeight: "700", cursor: "pointer", padding: 0 }}
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          /* ══════════ REGISTER FORM ══════════ */
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
            <InputField icon={Mail} label="Full Name" type="text" value={regName} onChange={setRegName} placeholder="Ramesh Kumar" autoFocus />
            <InputField icon={Mail} label="Email Address" type="email" value={regEmail} onChange={setRegEmail} placeholder="farmer@example.com" />
            <InputField icon={Lock} label="Password" type="password" value={regPassword} onChange={setRegPassword} placeholder="Create a secure password" showToggle />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #166534, #15803d)",
                color: "#fff", border: "none", borderRadius: "10px",
                padding: "0.9rem", fontWeight: "700", fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: "0.25rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 4px 12px rgba(22, 101, 52, 0.25)",
              }}
            >
              {loading ? <><RefreshCw size={18} className="spin" /> Creating Account…</> : "Create Free Account"}
            </button>

            {/* ── Divider ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0.25rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
              <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: "600" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              style={{
                background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0",
                borderRadius: "10px", padding: "0.85rem", fontWeight: "700", fontSize: "0.95rem",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <Globe size={18} />
              Continue as Guest — Explore Website
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: "center", fontSize: "0.9rem", color: "#6b7280", marginTop: "0.25rem" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setIsRegisterView(false); clearFeedback(); }}
                style={{ background: "none", border: "none", color: "#166534", fontWeight: "700", cursor: "pointer", padding: 0 }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
