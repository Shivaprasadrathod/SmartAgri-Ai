import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

// Routes that guests can freely access
const PUBLIC_ROUTES = [
  "/dashboard",
  "/market",
  "/ai-assistant",
  "/crop-guide",
  "/farming-guide",
  "/disease-detection",
  "/irrigation",
  "/fertilizer",
  "/products",
];

// Routes that require a logged-in account
const PROTECTED_ROUTES = [
  "/settings",
  "/delivery",
];

export function isProtectedRoute(path) {
  return PROTECTED_ROUTES.some((r) => path.startsWith(r));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // null = not loaded yet
  const [isGuest, setIsGuest] = useState(false);
  const [isReady, setIsReady] = useState(false); // has initial load completed?

  // Boot: hydrate state from localStorage
  useEffect(() => {
    try {
      const mode = localStorage.getItem("smartagri-auth-mode"); // "user" | "guest" | null
      if (mode === "guest") {
        setIsGuest(true);
        setUser(null);
      } else if (mode === "user") {
        const raw = localStorage.getItem("smartagri-user");
        if (raw && raw !== "undefined") {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.email) {
            setUser(parsed);
            setIsGuest(false);
          }
        }
      }
    } catch (err) {
      console.error("Auth hydration error:", err);
    } finally {
      setIsReady(true);
    }
  }, []);

  const loginUser = useCallback((userData) => {
    setUser(userData);
    setIsGuest(false);
    localStorage.setItem("smartagri-auth-mode", "user");
    localStorage.setItem("smartagri-user", JSON.stringify(userData));
    // Also keep legacy "user" key for backward compatibility with Dashboard
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const enterAsGuest = useCallback(() => {
    setUser(null);
    setIsGuest(true);
    localStorage.setItem("smartagri-auth-mode", "guest");
    localStorage.removeItem("smartagri-user");
    localStorage.removeItem("user");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("smartagri-auth-mode");
    localStorage.removeItem("smartagri-user");
    localStorage.removeItem("user");
  }, []);

  const isAuthenticated = Boolean(user && user.email);

  const value = {
    user,
    isGuest,
    isAuthenticated,
    isReady,
    loginUser,
    enterAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
