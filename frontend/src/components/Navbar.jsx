import { useNavigate } from "react-router-dom";
import { Search, Bell, UserCircle2, LogIn, LogOut, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const { isAuthenticated, isGuest, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = isAuthenticated && user
    ? user.name || "Farmer"
    : isGuest
      ? "Guest"
      : "Visitor";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>Overview</h2>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search crops, markets…" />
        </div>

        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        {/* Profile pill with dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <div
            className="profile"
            onClick={() => setShowProfileMenu((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") setShowProfileMenu((v) => !v); }}
          >
            <span className="profile-icon">
              {isGuest ? <Globe size={20} /> : <UserCircle2 size={22} />}
            </span>
            <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </span>
            {isGuest && (
              <span style={{
                fontSize: "0.65rem", fontWeight: "800", background: "#fef3c7",
                color: "#92400e", padding: "2px 6px", borderRadius: "6px", marginLeft: "2px",
              }}>
                GUEST
              </span>
            )}
          </div>

          {/* Dropdown menu */}
          {showProfileMenu && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              minWidth: "220px",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              zIndex: 999,
              overflow: "hidden",
            }}>
              {/* Identity section */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                {isAuthenticated && user ? (
                  <>
                    <div style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>{user.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>{user.email}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>Guest User</div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>Browsing in view-only mode</div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: "6px" }}>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate("/settings"); }}
                      style={{
                        width: "100%", textAlign: "left", background: "none", border: "none",
                        padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                        fontSize: "0.9rem", color: "#374151", fontWeight: "600",
                        display: "flex", alignItems: "center", gap: "8px",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      <UserCircle2 size={16} /> My Profile & Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%", textAlign: "left", background: "none", border: "none",
                        padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                        fontSize: "0.9rem", color: "#dc2626", fontWeight: "600",
                        display: "flex", alignItems: "center", gap: "8px",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate("/login"); }}
                      style={{
                        width: "100%", textAlign: "left", background: "none", border: "none",
                        padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                        fontSize: "0.9rem", color: "#166534", fontWeight: "700",
                        display: "flex", alignItems: "center", gap: "8px",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      <LogIn size={16} /> Sign In
                    </button>

                    <button
                      onClick={() => { setShowProfileMenu(false); navigate("/register"); }}
                      style={{
                        width: "100%", textAlign: "left", background: "none", border: "none",
                        padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                        fontSize: "0.9rem", color: "#374151", fontWeight: "600",
                        display: "flex", alignItems: "center", gap: "8px",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      <UserCircle2 size={16} /> Create Free Account
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
