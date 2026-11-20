import { Navigate, useLocation } from "react-router-dom";
import { useAuth, isProtectedRoute } from "../context/AuthContext";
import { LogIn, UserPlus, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Wraps around the MainLayout <Outlet>.
 * - Authenticated users → always pass through.
 * - Guests on public routes → pass through.
 * - Guests on protected routes → show a friendly login prompt (not a redirect).
 * - Neither guest nor user and auth is ready → redirect to /login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isGuest, isReady } = useAuth();
  const location = useLocation();

  // Wait until auth state is hydrated
  if (!isReady) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#6b7280" }}>
        <p style={{ fontSize: "1rem", fontWeight: "600" }}>Loading SmartAgri AI…</p>
      </div>
    );
  }

  // Not logged in and not a guest → back to login
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Guest trying to access a protected page → show login prompt inline
  if (isGuest && isProtectedRoute(location.pathname)) {
    return <LoginPromptCard returnTo={location.pathname} />;
  }

  // Allowed
  return children;
}

function LoginPromptCard({ returnTo }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      padding: "2rem",
    }}>
      <div style={{
        maxWidth: "460px",
        width: "100%",
        background: "#fff",
        borderRadius: "16px",
        padding: "2.5rem",
        textAlign: "center",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "#fef3c7",
          color: "#d97706",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}>
          <ShieldAlert size={30} />
        </div>

        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#111827", margin: "0 0 0.5rem 0" }}>
          Account Required
        </h2>

        <p style={{ color: "#6b7280", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 1.75rem 0" }}>
          Please log in or create an account to access this feature.
          Your farming data, delivery orders, and profile settings require authentication.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            to="/login"
            state={{ from: returnTo }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#166534",
              color: "#fff",
              padding: "0.85rem",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            <LogIn size={18} /> Sign In
          </Link>

          <Link
            to="/register"
            state={{ from: returnTo }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#f0fdf4",
              color: "#166534",
              padding: "0.85rem",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "1rem",
              textDecoration: "none",
              border: "1px solid #bbf7d0",
            }}
          >
            <UserPlus size={18} /> Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
