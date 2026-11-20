import { useEffect, useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Navigation,
  MapPin,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { api } from "../services/api";

// Fix standard Leaflet pin icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [19.9975, 73.7898]; // Nashik coordinates

const STATES = ["All States", "Maharashtra", "Karnataka", "Gujarat", "NCT of Delhi"];

export default function Market() {
  const [activeTab, setActiveTab] = useState("overview"); // overview, compare, nearest, advisory, listings
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedState, setSelectedState] = useState("All States");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data States
  const [prices, setPrices] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [nearestMarkets, setNearestMarkets] = useState([]);
  
  // Loading & Error States
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [loadingNearest, setLoadingNearest] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // User location
  const [userLocation, setUserLocation] = useState({
    latitude: 19.9975,
    longitude: 73.7898,
    name: "Nashik, Maharashtra (Default / Detected)",
  });
  const [locationStatus, setLocationStatus] = useState("idle");

  // Load Crops
  useEffect(() => {
    api.getCrops()
      .then((data) => {
        if (data?.crops) setCrops(data.crops.map((c) => c.name));
      })
      .catch((e) => console.error(e));
  }, []);

  // Fetch Market Prices
  const loadPrices = async () => {
    setLoadingPrices(true);
    setErrorMsg("");
    try {
      const data = await api.getMarketPrices({
        commodity: selectedCrop,
        state: selectedState,
      });
      setPrices(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load real-time market data. Verify backend is running.");
    } finally {
      setLoadingPrices(false);
    }
  };

  // Fetch Trends & AI Advisory
  const loadInsights = async () => {
    setLoadingAdvisory(true);
    try {
      const [trendRes, advisoryRes] = await Promise.all([
        api.getPriceTrends(selectedCrop, 14),
        api.getAIRecommendation(selectedCrop),
      ]);
      setTrendData(trendRes.history || []);
      setAdvisory(advisoryRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdvisory(false);
    }
  };

  // Fetch Nearest Mandis
  const loadNearest = async (lat, lon) => {
    setLoadingNearest(true);
    try {
      const data = await api.getNearestMarkets(lat, lon, selectedCrop, 600);
      setNearestMarkets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNearest(false);
    }
  };

  useEffect(() => {
    loadPrices();
    loadInsights();
  }, [selectedCrop, selectedState]);

  useEffect(() => {
    loadNearest(userLocation.latitude, userLocation.longitude);
  }, [userLocation, selectedCrop]);

  // Request browser geolocation
  const detectFarmerLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          latitude,
          longitude,
          name: `GPS Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
        });
        setLocationStatus("success");
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setLocationStatus("denied");
      },
      { timeout: 8000 }
    );
  };

  // Filtered prices
  const filteredPrices = useMemo(() => {
    return prices.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchQ =
        !searchQuery ||
        p.market?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.commodity?.toLowerCase().includes(q);
      const matchState =
        selectedState === "All States" || p.state === selectedState;
      return matchQ && matchState;
    });
  }, [prices, searchQuery, selectedState]);

  // Summary Metrics
  const metrics = useMemo(() => {
    if (!prices.length) return null;
    const modalPrices = prices.map((p) => p.modal_price);
    const maxP = Math.max(...modalPrices);
    const minP = Math.min(...modalPrices);
    const avgP = Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length);
    const topMarket = prices.find((p) => p.modal_price === maxP);
    const spread = maxP - minP;

    return { maxP, minP, avgP, topMarket, spread, totalMandis: prices.length };
  }, [prices]);

  return (
    <div className="page-shell" style={{ padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)",
          color: "#fff",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 10px 25px -5px rgba(22, 101, 52, 0.3)",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.75rem" }}>
              <ShieldCheck size={16} /> Official Mandi & APMC Network Live Intelligence
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: "0 0 0.5rem 0" }}>
              Agricultural Market Price & AI Decision Hub
            </h1>
            <p style={{ margin: 0, opacity: 0.9, maxWidth: "700px", lineHeight: "1.5" }}>
              Real-time APMC price analysis, nearest mandi locator with distance mapping, and algorithmic Buy/Sell/Hold signals to help farmers maximize crop returns.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={detectFarmerLocation}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#ffffff",
                color: "#166534",
                border: "none",
                fontWeight: "700",
                padding: "0.75rem 1.25rem",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Navigation size={18} />
              {locationStatus === "detecting" ? "Locating..." : "Use My GPS Location"}
            </button>
            <button
              onClick={() => { loadPrices(); loadInsights(); }}
              title="Refresh Live Data"
              style={{
                background: "rgba(255,255,255,0.25)",
                color: "#fff",
                border: "none",
                padding: "0.75rem",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={20} className={loadingPrices ? "spin" : ""} />
            </button>
          </div>
        </div>

        {/* Global Selectors */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            background: "rgba(0, 0, 0, 0.15)",
            padding: "1rem",
            borderRadius: "12px",
          }}
        >
          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700", opacity: 0.8, display: "block", marginBottom: "4px" }}>
              Select Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "none", fontWeight: "600", color: "#111827", background: "#fff" }}
            >
              {crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700", opacity: 0.8, display: "block", marginBottom: "4px" }}>
              State Filter
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "none", fontWeight: "600", color: "#111827", background: "#fff" }}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700", opacity: 0.8, display: "block", marginBottom: "4px" }}>
              Farmer Location Reference
            </label>
            <div style={{ background: "rgba(255,255,255,0.9)", color: "#166534", padding: "0.6rem", borderRadius: "8px", fontSize: "0.9rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={16} />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userLocation.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #e5e7eb", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "4px" }}>
        {[
          { id: "overview", label: "Live Prices & Mandis", icon: Layers },
          { id: "advisory", label: "AI Buy / Sell Recommendation", icon: Sparkles },
          { id: "nearest", label: "Nearest Markets & Map", icon: MapPin },
          { id: "trends", label: "Price History Trends", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.75rem 1.25rem",
                borderRadius: "8px 8px 0 0",
                border: "none",
                background: isActive ? "#166534" : "transparent",
                color: isActive ? "#fff" : "#4b5563",
                fontWeight: "700",
                cursor: "pointer",
                borderBottom: isActive ? "3px solid #15803d" : "3px solid transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Key Metric Snapshot */}
      {metrics && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>Highest Mandi Price</span>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#166534", marginTop: "4px" }}>
              ₹{metrics.maxP} <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "500" }}>/ Qtl</span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#15803d", fontWeight: "600" }}>
              🏆 {metrics.topMarket?.market} ({metrics.topMarket?.district})
            </p>
          </div>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>Regional Average Modal Rate</span>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#1f2937", marginTop: "4px" }}>
              ₹{metrics.avgP} <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "500" }}>/ Qtl</span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
              Across {metrics.totalMandis} surveyed APMCs
            </p>
          </div>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>Market Arbitrage Spread</span>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>
              ₹{metrics.spread} <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "500" }}>/ Qtl</span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#b45309", fontWeight: "600" }}>
              Potential margin gain between lowest & highest
            </p>
          </div>

          <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>AI Actionable Signal</span>
            <div style={{ fontSize: "1.4rem", fontWeight: "800", color: advisory?.recommendation === "SELL NOW" ? "#16a34a" : (advisory?.recommendation === "HOLD" ? "#2563eb" : "#d97706"), marginTop: "6px" }}>
              {advisory?.recommendation || "ANALYZING..."}
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#4b5563" }}>
              Confidence: {advisory?.confidence || "High"}
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW & COMPARISON TABLE */}
      {activeTab === "overview" && (
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "1.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                Live Mandi Prices for {selectedCrop}
              </h2>
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                Source: Agmarknet / Mandi APMC Network • Updated: Today • Unit: ₹/Quintal
              </span>
            </div>

            <div style={{ position: "relative", minWidth: "260px" }}>
              <Search size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input
                type="text"
                placeholder="Search market or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  outline: "none",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          {loadingPrices ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#166534", fontWeight: "700" }}>
              <RefreshCw size={32} className="spin" style={{ margin: "0 auto 10px auto" }} />
              <p>Fetching verified agricultural mandi prices...</p>
            </div>
          ) : filteredPrices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
              <AlertCircle size={32} style={{ margin: "0 auto 10px auto", color: "#d97706" }} />
              <p>No mandi records found matching your filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>
                    <th style={{ padding: "0.75rem 1rem" }}>Market (APMC)</th>
                    <th style={{ padding: "0.75rem 1rem" }}>District & State</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Variety</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Min Price</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Max Price</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "800", color: "#166534" }}>Modal Price</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Action / Route</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((row) => {
                    const isTop = metrics && row.modal_price === metrics.maxP;
                    return (
                      <tr
                        key={row.id || `${row.market}-${row.commodity}`}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          background: isTop ? "#f0fdf4" : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.85rem 1rem", fontWeight: "700", color: "#111827" }}>
                          {row.market}
                          {isTop && (
                            <span style={{ marginLeft: "8px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800" }}>
                              BEST PRICE
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "0.85rem 1rem", color: "#4b5563" }}>
                          {row.district}, {row.state}
                        </td>
                        <td style={{ padding: "0.85rem 1rem", color: "#4b5563" }}>{row.variety}</td>
                        <td style={{ padding: "0.85rem 1rem", color: "#ef4444", fontWeight: "600" }}>₹{row.min_price}</td>
                        <td style={{ padding: "0.85rem 1rem", color: "#15803d", fontWeight: "600" }}>₹{row.max_price}</td>
                        <td style={{ padding: "0.85rem 1rem", fontSize: "1.05rem", fontWeight: "800", color: "#166534" }}>
                          ₹{row.modal_price}
                        </td>
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.market + " " + row.district)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              color: "#2563eb",
                              textDecoration: "none",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                            }}
                          >
                            Map Directions <ExternalLink size={13} />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI BUY / SELL RECOMMENDATION */}
      {activeTab === "advisory" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "1.75rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
              <div style={{ background: "#dcfce7", color: "#166534", padding: "8px", borderRadius: "10px" }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                  AI Market Decision: {selectedCrop}
                </h2>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  Algorithmic advisory based on mandi spreads & momentum
                </span>
              </div>
            </div>

            {loadingAdvisory || !advisory ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <RefreshCw size={28} className="spin" style={{ color: "#166534" }} />
                <p>Computing algorithmic recommendation...</p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: advisory.recommendation === "SELL NOW" ? "#f0fdf4" : (advisory.recommendation === "HOLD" ? "#eff6ff" : "#fffbeb"),
                    border: `2px solid ${advisory.recommendation === "SELL NOW" ? "#86efac" : (advisory.recommendation === "HOLD" ? "#93c5fd" : "#fde68a")}`,
                    padding: "1.25rem",
                    borderRadius: "12px",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", color: "#4b5563" }}>
                    Recommendation Signal
                  </span>
                  <div style={{ fontSize: "2rem", fontWeight: "900", color: advisory.recommendation === "SELL NOW" ? "#166534" : (advisory.recommendation === "HOLD" ? "#1d4ed8" : "#b45309"), margin: "4px 0" }}>
                    {advisory.recommendation}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.6", color: "#1f2937", fontWeight: "500" }}>
                    {advisory.analysis}
                  </p>
                </div>

                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#111827", marginBottom: "0.75rem" }}>
                  Key Price Drivers & Data Indicators
                </h3>
                <ul style={{ paddingLeft: "1.25rem", margin: "0 0 1.5rem 0", color: "#374151", fontSize: "0.9rem", lineHeight: "1.7" }}>
                  {advisory.key_drivers?.map((driver, idx) => (
                    <li key={idx}><strong>{driver}</strong></li>
                  ))}
                </ul>

                {advisory.best_market && (
                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700" }}>Recommended Market Destination:</span>
                    <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                      {advisory.best_market.name} ({advisory.best_market.district}, {advisory.best_market.state})
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#166534", fontWeight: "700", marginTop: "4px" }}>
                      Current Trading Rate: ₹{advisory.best_market.price}/Quintal ({advisory.best_market.premium_over_lowest} premium)
                    </div>
                  </div>
                )}

                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "1rem", lineHeight: "1.4", fontStyle: "italic" }}>
                  *{advisory.data_disclaimer}
                </p>
              </div>
            )}
          </div>

          {/* Regional Market Rate Comparison */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "1.75rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#111827", marginBottom: "1rem" }}>
              Mandi Spread Arbitrage Comparison
            </h2>

            {advisory?.market_comparisons?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.85rem",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <div style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>
                    {item.market}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {item.district}, {item.state}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#166534" }}>
                    ₹{item.modal_price}
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: item.difference_from_average.startsWith("+") ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {item.difference_from_average} vs avg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NEAREST MARKETS & INTERACTIVE MAP */}
      {activeTab === "nearest" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
          {/* Market List */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "1.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", maxHeight: "650px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                  Nearby APMC Mandis
                </h2>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  Ranked by distance from your current location
                </span>
              </div>
              <button
                onClick={detectFarmerLocation}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "#dcfce7",
                  color: "#166534",
                  border: "none",
                  fontWeight: "700",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                <Navigation size={14} /> Refresh GPS
              </button>
            </div>

            {loadingNearest ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <RefreshCw size={28} className="spin" style={{ color: "#166534" }} />
                <p>Calculating nearest APMC distances...</p>
              </div>
            ) : nearestMarkets.length === 0 ? (
              <p style={{ color: "#6b7280" }}>No markets detected within radius.</p>
            ) : (
              nearestMarkets.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid #f3f4f6",
                    background: "#fbfcfd",
                    marginBottom: "0.75rem",
                    transition: "border 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: "700", color: "#111827" }}>
                        {m.name}
                      </h4>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                        📍 {m.address}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#4b5563" }}>
                        🕒 Hours: {m.operating_hours}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: "800", padding: "3px 8px", borderRadius: "12px", fontSize: "0.8rem" }}>
                        {m.distance_km} km away
                      </span>
                      {m.modal_price && (
                        <div style={{ marginTop: "6px", fontSize: "1.1rem", fontWeight: "800", color: "#166534" }}>
                          ₹{m.modal_price} <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>/Qtl</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "0.75rem", display: "flex", gap: "10px", alignItems: "center" }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#166534",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        textDecoration: "none",
                      }}
                    >
                      <Navigation size={13} /> Navigate on Maps
                    </a>
                    {m.contact && (
                      <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                        📞 {m.contact}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Leaflet Interactive Map */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "650px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#111827", margin: "0 0 0.75rem 0" }}>
              Interactive Agricultural Market Map
            </h3>
            <div style={{ flex: 1, borderRadius: "12px", overflow: "hidden" }}>
              <MapContainer
                center={[userLocation.latitude, userLocation.longitude]}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Farmer Position */}
                <Marker position={[userLocation.latitude, userLocation.longitude]}>
                  <Popup>
                    <strong>Your Location</strong>
                    <br />
                    {userLocation.name}
                  </Popup>
                </Marker>

                {/* Mandi Pins */}
                {nearestMarkets.map((m) => (
                  <Marker key={m.id} position={[m.latitude, m.longitude]}>
                    <Popup>
                      <strong>{m.name}</strong>
                      <br />
                      Distance: {m.distance_km} km
                      <br />
                      {selectedCrop} Rate: ₹{m.modal_price || "N/A"}/Quintal
                      <br />
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get Directions
                      </a>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORICAL TRENDS */}
      {activeTab === "trends" && (
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "1.75rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" }}>
              14-Day Price & Arrival Trends for {selectedCrop}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Daily modal auction prices (₹/Quintal) and mandi arrivals (tonnes)
            </span>
          </div>

          <div style={{ width: "100%", height: "380px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" unit="₹" />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${value}/Quintal`,
                    name === "modal_price" ? "Modal Price" : (name === "max_price" ? "Max Price" : "Min Price")
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="max_price" stroke="#10b981" name="Max Price" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="modal_price" stroke="#166534" name="Modal Price" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="min_price" stroke="#f87171" name="Min Price" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
