import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Sprout,
  Droplets,
  Store,
  RefreshCw,
  SunMedium
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { api } from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [prices, setPrices] = useState([]);
  const [trends, setTrends] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [nearestMarkets, setNearestMarkets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadDashboardData = async (crop) => {
    setLoading(true);
    try {
      const [cropsRes, pricesRes, trendsRes, advisoryRes, nearestRes] = await Promise.all([
        api.getCrops(),
        api.getMarketPrices({ commodity: crop }),
        api.getPriceTrends(crop, 7),
        api.getAIRecommendation(crop),
        api.getNearestMarkets(19.9975, 73.7898, crop, 400),
      ]);
      if (cropsRes?.crops) setCrops(cropsRes.crops);
      setPrices(pricesRes || []);
      setTrends(trendsRes.history || []);
      setAdvisory(advisoryRes);
      setNearestMarkets(nearestRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(selectedCrop);
  }, [selectedCrop]);

  const bestMarket = prices.length ? prices.reduce((max, p) => p.modal_price > max.modal_price ? p : max, prices[0]) : null;
  const avgModal = prices.length ? Math.round(prices.reduce((sum, p) => sum + p.modal_price, 0) / prices.length) : 0;

  return (
    <div className="dashboard-page" style={{ padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)",
          borderRadius: "16px",
          color: "#fff",
          padding: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          boxShadow: "0 10px 25px -5px rgba(20, 83, 45, 0.3)",
          marginBottom: "1.75rem",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            🌱 SmartAgri-Ai Intelligent Command Center
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 0.5rem 0" }}>
            Good Morning, {user?.name || "Farmer"} 👋
          </h1>
          <p style={{ margin: 0, opacity: 0.9, maxWidth: "600px" }}>
            Live agricultural price intelligence, regional APMC spreads, and automated harvest advisory.
          </p>
        </div>

        {/* Quick Weather & Status Widget */}
        <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", padding: "1rem 1.5rem", borderRadius: "12px", textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
            <SunMedium size={24} style={{ color: "#facc15" }} />
            <span style={{ fontSize: "1.4rem", fontWeight: "800" }}>28°C</span>
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>Nashik Region • Clear Sky</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.75, marginTop: "4px" }}>Optimal Harvesting Weather</div>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" }}>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>Tracked Commodities</span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#111827", marginTop: "4px" }}>
            12 Major Crops
          </div>
          <span style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: "600" }}>✓ AGMARKNET Calibrated</span>
        </div>

        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>Average Modal Price ({selectedCrop})</span>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#166534", marginTop: "4px" }}>
            ₹{avgModal} <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "500" }}>/Qtl</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Across Regional APMCs</span>
        </div>

        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>Best Paying Market</span>
          <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#166534", marginTop: "4px" }}>
            {bestMarket ? bestMarket.market : "Loading..."}
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#15803d" }}>
            ₹{bestMarket?.modal_price} / Qtl ({bestMarket?.district})
          </span>
        </div>

        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>AI Sell / Hold Advisory</span>
          <div style={{ fontSize: "1.4rem", fontWeight: "800", color: advisory?.recommendation === "SELL NOW" ? "#16a34a" : "#2563eb", marginTop: "6px" }}>
            {advisory?.recommendation || "Analyzing..."}
          </div>
          <span style={{ fontSize: "0.8rem", color: "#4b5563" }}>Confidence: {advisory?.confidence}</span>
        </div>
      </div>

      {/* Crop Selector & Trend Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem", marginBottom: "1.75rem" }}>
        {/* Trend Graph */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                7-Day Price Trajectory: {selectedCrop}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Modal price variations across auctions</span>
            </div>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{ padding: "0.4rem 0.75rem", borderRadius: "8px", border: "1px solid #d1d5db", fontWeight: "700", color: "#166534" }}
            >
              {crops.length > 0
                ? crops.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)
                : ["Tomato", "Onion", "Potato", "Wheat", "Rice (Paddy)"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
            </select>
          </div>

          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} unit="₹" />
                <Tooltip formatter={(val) => [`₹${val}/Qtl`, "Modal Price"]} />
                <Line type="monotone" dataKey="modal_price" stroke="#166534" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendation Spotlight */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
              <div style={{ background: "#dcfce7", color: "#166534", padding: "6px", borderRadius: "8px" }}>
                <Sparkles size={20} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                AI Buy/Sell Signal Rationale
              </h3>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                Signal Action
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#166534", margin: "2px 0" }}>
                {advisory?.recommendation}
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#334155", lineHeight: "1.5" }}>
                {advisory?.analysis}
              </p>
            </div>

            <div style={{ fontSize: "0.85rem", color: "#475569" }}>
              <strong>Best Destination:</strong> {advisory?.best_market?.name} ({advisory?.best_market?.district}) @ ₹{advisory?.best_market?.price}/Qtl
            </div>
          </div>

          <Link
            to="/market"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#166534",
              color: "#fff",
              padding: "0.75rem",
              borderRadius: "10px",
              fontWeight: "700",
              textDecoration: "none",
              marginTop: "1rem",
            }}
          >
            Explore All Mandi Prices & Map <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
        <Link to="/market" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", transition: "transform 0.2s", cursor: "pointer" }}>
            <div style={{ background: "#dcfce7", color: "#166534", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <Store size={22} />
            </div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: "700" }}>Live Market Prices</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Search mandi prices across APMCs and locate nearest markets.
            </p>
          </div>
        </Link>

        <Link to="/ai-assistant" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", transition: "transform 0.2s", cursor: "pointer" }}>
            <div style={{ background: "#e0f2fe", color: "#0284c7", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <Sparkles size={22} />
            </div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: "700" }}>AI Agriculture Assistant</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Ask questions on crops, pest control, and market advice in English or Kannada.
            </p>
          </div>
        </Link>

        <Link to="/disease-detection" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", transition: "transform 0.2s", cursor: "pointer" }}>
            <div style={{ background: "#fef3c7", color: "#d97706", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <Sprout size={22} />
            </div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: "700" }}>Crop Disease Scanner</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Scan leaf images to identify blights, rusts, and nutrient deficiencies.
            </p>
          </div>
        </Link>

        <Link to="/irrigation" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", transition: "transform 0.2s", cursor: "pointer" }}>
            <div style={{ background: "#f3e8ff", color: "#7e22ce", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <Droplets size={22} />
            </div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: "700" }}>Smart Irrigation</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
              Automate watering schedules based on soil moisture and crop type.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
