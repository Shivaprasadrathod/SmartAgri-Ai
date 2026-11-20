import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Sprout,
  Bot,
  Camera,
  Droplets,
  Wheat,
  Truck,
  ShoppingCart,
  Store,
  Settings,
  LogOut,
  LogIn,
  FlaskConical,
  TrendingUp,
  MapPin
} from "lucide-react";

function Sidebar() {
  const { isAuthenticated, isGuest, user, logout } = useAuth();
  const navigate = useNavigate();

  // Public pages accessible to all including guests
  const publicItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "ಕರ್ನಾಟಕ ಬೆಳೆ ಮಾರುಕಟ್ಟೆ", path: "/karnataka-market", icon: Sprout },
    { name: "AI Price Prediction", path: "/ai-price-prediction", icon: TrendingUp },
    { name: "Market Prices", path: "/market", icon: Store },
    { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
    { name: "Crop Guide", path: "/crop-guide", icon: Wheat },
    { name: "Farming Guide", path: "/farming-guide", icon: Sprout },
    { name: "Disease Detection", path: "/disease-detection", icon: Camera },
    { name: "Irrigation", path: "/irrigation", icon: Droplets },
    { name: "Fertilizer", path: "/fertilizer", icon: FlaskConical },
    { name: "Products", path: "/products", icon: ShoppingCart },
  ];

  // Protected pages only for authenticated users
  const protectedItems = [
    { name: "Agri Delivery", path: "/delivery", icon: Truck },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <span>🌱</span>
        <h2>SmartAgri AI</h2>
      </div>

      {/* Guest indicator badge */}
      {isGuest && (
        <div style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "10px",
          padding: "8px 12px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.85)",
          fontWeight: "600",
        }}>
          <span style={{ fontSize: "1rem" }}>👤</span>
          <div>
            <div style={{ fontWeight: "700" }}>Guest Mode</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Limited access</div>
          </div>
        </div>
      )}

      {/* Authenticated user badge */}
      {isAuthenticated && user && (
        <div style={{
          background: "rgba(45,146,93,0.25)",
          border: "1px solid rgba(45,146,93,0.4)",
          borderRadius: "10px",
          padding: "8px 12px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.8rem",
          color: "#bbf7d0",
          fontWeight: "600",
        }}>
          <span style={{ fontSize: "1rem" }}>✅</span>
          <div>
            <div style={{ fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
              {user.email}
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-menu">
        {/* Public menu items */}
        {publicItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              <Icon size={21} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* Protected items */}
        {protectedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              style={isGuest ? { opacity: 0.6 } : undefined}
            >
              <Icon size={21} />
              <span>{item.name}</span>
              {isGuest && <span style={{ fontSize: "0.65rem", marginLeft: "auto", background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: "6px" }}>🔒</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom action */}
      <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
        {isGuest ? (
          <button
            onClick={() => navigate("/login")}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              background: "#22c55e", color: "#fff", border: "none",
              borderRadius: "10px", padding: "12px", fontWeight: "700",
              fontSize: "0.9rem", cursor: "pointer",
            }}
          >
            <LogIn size={18} /> Sign In / Register
          </button>
        ) : isAuthenticated ? (
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px", padding: "12px", fontWeight: "600",
              fontSize: "0.9rem", cursor: "pointer",
            }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export default Sidebar;
