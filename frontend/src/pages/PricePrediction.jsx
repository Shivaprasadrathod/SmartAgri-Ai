import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Calendar,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info,
  Clock,
  MapPin,
  ArrowRight,
  Activity,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { api } from "../services/api";

const STATES = ["All States", "Maharashtra", "Karnataka", "Gujarat", "NCT of Delhi"];

export default function PricePrediction() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedMarket, setSelectedMarket] = useState("All Markets");
  const [predictionHorizon, setPredictionHorizon] = useState("7days"); // "7days" | "30days"

  // Data states
  const [predictionData, setPredictionData] = useState(null);
  const [availableMarkets, setAvailableMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load initial crop choices & mandi list
  useEffect(() => {
    api.getCrops()
      .then((data) => {
        if (data?.crops) setCrops(data.crops.map((c) => c.name));
      })
      .catch((e) => console.error(e));

    api.getMarketPrices()
      .then((data) => {
        if (data) {
          const uniqueMarkets = Array.from(new Set(data.map((m) => m.market)));
          setAvailableMarkets(["All Markets", ...uniqueMarkets]);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // Fetch AI Prediction
  const loadPrediction = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await api.getCropPricePrediction(
        selectedCrop,
        selectedMarket,
        selectedState
      );
      setPredictionData(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate AI price forecast. Check backend connection.");
      setPredictionData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrediction();
  }, [selectedCrop, selectedState, selectedMarket]);

  // Combine historical and forecasted data points for clean interactive timeline chart
  const chartData = useMemo(() => {
    if (!predictionData) return [];

    const items = [];

    // 1. Add historical points
    if (predictionData.recent_history) {
      predictionData.recent_history.forEach((h) => {
        items.push({
          date: h.date,
          actual: h.actual_price,
          predicted: null,
          min_est: null,
          max_est: null,
          type: "Historical Actual"
        });
      });
    }

    // 2. Anchor today's actual price
    const todayActual = predictionData.today_actual_price;

    // 3. Add forecast horizon (7 days or 30 days)
    const forecastPoints = predictionHorizon === "30days"
      ? predictionData.thirty_day_forecast
      : predictionData.seven_day_forecast;

    if (forecastPoints && forecastPoints.length > 0) {
      // Connect transition from today to forecast
      if (items.length > 0) {
        items[items.length - 1].predicted = todayActual;
        items[items.length - 1].min_est = todayActual;
        items[items.length - 1].max_est = todayActual;
      }

      forecastPoints.forEach((f) => {
        items.push({
          date: f.date,
          actual: null,
          predicted: f.predicted_price,
          min_est: f.min_estimate,
          max_est: f.max_estimate,
          type: "AI Prediction"
        });
      });
    }

    return items;
  }, [predictionData, predictionHorizon]);

  return (
    <div className="page-shell" style={{ padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Hero Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #166534 50%, #15803d 100%)",
          color: "#fff",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.3)",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.75rem" }}>
              <Sparkles size={16} /> Machine Learning Agricultural Market Forecaster
            </div>
            <h1 style={{ fontSize: "2.1rem", fontWeight: "800", margin: "0 0 0.5rem 0" }}>
              AI Crop Price Prediction System
            </h1>
            <p style={{ margin: 0, opacity: 0.9, maxWidth: "760px", lineHeight: "1.5" }}>
              Analyze actual spot market arrivals from verified APMCs, train multi-lag Random Forest models, and evaluate 7-day to 30-day price trajectories with statistical uncertainty intervals.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={loadPrediction}
              disabled={loading}
              title="Re-run ML Model Forecast"
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
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <RefreshCw size={18} className={loading ? "spin" : ""} />
              {loading ? "Computing Forecast..." : "Re-calculate AI Prediction"}
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            background: "rgba(0, 0, 0, 0.2)",
            padding: "1rem",
            borderRadius: "12px",
          }}
        >
          {/* Crop Selector */}
          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700", opacity: 0.85, display: "block", marginBottom: "4px" }}>
              1. Select Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "none", fontWeight: "700", color: "#111827", background: "#fff" }}
            >
              {crops.length > 0 ? crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              )) : (
                ["Tomato", "Onion", "Potato", "Rice (Paddy)", "Wheat", "Maize (Corn)", "Cotton", "Soybean"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              )}
            </select>
          </div>

          {/* State Selector */}
          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700", opacity: 0.85, display: "block", marginBottom: "4px" }}>
              2. State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "none", fontWeight: "700", color: "#111827", background: "#fff" }}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Market Selector */}
          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700", opacity: 0.85, display: "block", marginBottom: "4px" }}>
              3. Nearby Mandi (APMC)
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "none", fontWeight: "700", color: "#111827", background: "#fff" }}
            >
              {availableMarkets.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Prediction Period Horizon */}
          <div>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700", opacity: 0.85, display: "block", marginBottom: "4px" }}>
              4. Forecast Period
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setPredictionHorizon("7days")}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: predictionHorizon === "7days" ? "#fff" : "rgba(255,255,255,0.25)",
                  color: predictionHorizon === "7days" ? "#166534" : "#fff",
                  fontSize: "0.85rem",
                }}
              >
                7-Day Forecast
              </button>
              <button
                type="button"
                onClick={() => setPredictionHorizon("30days")}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: predictionHorizon === "30days" ? "#fff" : "rgba(255,255,255,0.25)",
                  color: predictionHorizon === "30days" ? "#166534" : "#fff",
                  fontSize: "0.85rem",
                }}
              >
                30-Day Trend
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error or Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", marginBottom: "1.5rem" }}>
          <RefreshCw size={36} className="spin" style={{ color: "#166534", margin: "0 auto 12px auto" }} />
          <h3 style={{ margin: "0 0 6px 0", color: "#111827", fontWeight: "800" }}>Training Random Forest Regressor...</h3>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.95rem" }}>
            Extracting 90-day time-series lags, seasonal cycles, and rolling statistical features for {selectedCrop}.
          </p>
        </div>
      )}

      {errorMsg && !loading && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "1.25rem", borderRadius: "12px", border: "1px solid #fecaca", marginBottom: "1.5rem", display: "flex", gap: "12px", alignItems: "center" }}>
          <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: "700" }}>Forecast Notice</div>
            <div style={{ fontSize: "0.9rem" }}>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Main Prediction Dashboard Content */}
      {predictionData && !loading && (
        <>
          {/* Key Metric Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" }}>
            
            {/* Card 1: Today's Actual Price */}
            <div style={{ background: "#fff", padding: "1.35rem", borderRadius: "14px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>
                  Today's Actual Spot Price
                </span>
                <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800" }}>
                  VERIFIED SPOT
                </span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "#111827", marginTop: "6px" }}>
                ₹{predictionData.today_actual_price} <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "500" }}>/ Qtl</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#4b5563", marginTop: "4px" }}>
                Range: ₹{predictionData.today_min_price} – ₹{predictionData.today_max_price}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "6px" }}>
                📍 {predictionData.market} ({predictionData.district})
              </div>
            </div>

            {/* Card 2: Tomorrow's Predicted Price */}
            <div style={{ background: "#fff", padding: "1.35rem", borderRadius: "14px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>
                  Tomorrow's AI Prediction
                </span>
                <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800" }}>
                  ML ESTIMATE
                </span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "#166534", marginTop: "6px" }}>
                ₹{predictionData.tomorrow_predicted_price} <span style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "500" }}>/ Qtl</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "4px" }}>
                Band: ₹{predictionData.uncertainty_interval?.min_predicted} – ₹{predictionData.uncertainty_interval?.max_predicted}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "6px" }}>
                Confidence Interval: {predictionData.uncertainty_interval?.confidence_band}
              </div>
            </div>

            {/* Card 3: Expected Change */}
            <div style={{ background: "#fff", padding: "1.35rem", borderRadius: "14px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>
                Expected Price Delta
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                {predictionData.expected_change >= 0 ? (
                  <TrendingUp size={28} style={{ color: "#16a34a" }} />
                ) : (
                  <TrendingDown size={28} style={{ color: "#dc2626" }} />
                )}
                <div style={{ fontSize: "1.9rem", fontWeight: "900", color: predictionData.expected_change >= 0 ? "#16a34a" : "#dc2626" }}>
                  {predictionData.expected_change >= 0 ? "+" : ""}₹{predictionData.expected_change}
                </div>
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: "700", color: predictionData.expected_change >= 0 ? "#16a34a" : "#dc2626", marginTop: "4px" }}>
                {predictionData.expected_change >= 0 ? "▲" : "▼"} {predictionData.change_percentage}% expected tomorrow
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "6px" }}>
                Trajectory: {predictionData.trend_direction}
              </div>
            </div>

            {/* Card 4: Actionable Advisory */}
            <div style={{ background: "#fff", padding: "1.35rem", borderRadius: "14px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>
                AI Decision Signal
              </span>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: "900",
                  color: predictionData.recommendation === "HOLD" ? "#2563eb" : (predictionData.recommendation === "SELL NOW" ? "#16a34a" : "#d97706"),
                  marginTop: "6px",
                }}
              >
                {predictionData.recommendation}
              </div>
              <p style={{ margin: "6px 0 0 0", fontSize: "0.8rem", color: "#4b5563", lineHeight: "1.4" }}>
                {predictionData.recommendation_reason?.slice(0, 85)}...
              </p>
              <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "700", marginTop: "6px" }}>
                Model: {predictionData.model_evaluation?.model_name}
              </div>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div style={{ background: "#fff", padding: "1.75rem", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                  Historical Actual vs. AI {predictionHorizon === "30days" ? "30-Day Trend" : "7-Day Forecast"} for {selectedCrop}
                </h2>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  Solid Green: Actual Spot Auctions • Dashed Teal: ML Regression Forecast • Shaded Area: Confidence Interval
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600" }}>Horizon:</span>
                <button
                  onClick={() => setPredictionHorizon("7days")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background: predictionHorizon === "7days" ? "#166534" : "#f9fafb",
                    color: predictionHorizon === "7days" ? "#fff" : "#374151",
                    fontWeight: "700",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setPredictionHorizon("30days")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    background: predictionHorizon === "30days" ? "#166534" : "#f9fafb",
                    color: predictionHorizon === "30days" ? "#fff" : "#374151",
                    fontWeight: "700",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* Recharts Forecast Graph */}
            <div style={{ width: "100%", height: "380px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} unit="₹" domain={["auto", "auto"]} />
                  <Tooltip
                    formatter={(val, name) => {
                      if (val === null || val === undefined) return ["-", name];
                      const label = name === "actual" ? "Actual Spot Price" : (name === "predicted" ? "Predicted Price" : name);
                      return [`₹${val}/Quintal`, label];
                    }}
                  />
                  <Legend />
                  
                  {/* Confidence Interval Upper and Lower Bounds */}
                  <Area
                    type="monotone"
                    dataKey="max_est"
                    fill="#bbf7d0"
                    stroke="none"
                    fillOpacity={0.35}
                    name="Upper Confidence Band"
                  />
                  <Area
                    type="monotone"
                    dataKey="min_est"
                    fill="#ffffff"
                    stroke="none"
                    fillOpacity={1}
                    name="Lower Confidence Band"
                  />

                  {/* Actual Prices Line */}
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#15803d"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#15803d" }}
                    name="Actual Spot Price"
                  />

                  {/* Predicted Prices Line */}
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#0284c7"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: "#0284c7" }}
                    name="AI Predicted Price"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Schedule Table & AI Rationale Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem", marginBottom: "1.75rem" }}>
            
            {/* 7-Day Forecast Table */}
            <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                    7-Day Price Schedule
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Day-by-day expected auction prices</span>
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#166534", background: "#f0fdf4", padding: "4px 8px", borderRadius: "6px" }}>
                  ₹ / Quintal
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>
                      <th style={{ padding: "8px 10px" }}>Horizon</th>
                      <th style={{ padding: "8px 10px" }}>Date</th>
                      <th style={{ padding: "8px 10px", fontWeight: "800", color: "#166534" }}>Predicted Price</th>
                      <th style={{ padding: "8px 10px" }}>Estimated Range</th>
                      <th style={{ padding: "8px 10px" }}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionData.seven_day_forecast?.map((row, idx) => {
                      const delta = row.predicted_price - predictionData.today_actual_price;
                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "8px 10px", fontWeight: "700", color: "#111827" }}>{row.day}</td>
                          <td style={{ padding: "8px 10px", color: "#4b5563" }}>{row.date}</td>
                          <td style={{ padding: "8px 10px", fontWeight: "800", color: "#166534", fontSize: "0.95rem" }}>
                            ₹{row.predicted_price}
                          </td>
                          <td style={{ padding: "8px 10px", color: "#6b7280", fontSize: "0.8rem" }}>
                            ₹{row.min_estimate} – ₹{row.max_estimate}
                          </td>
                          <td style={{ padding: "8px 10px", fontWeight: "700", color: delta >= 0 ? "#16a34a" : "#dc2626" }}>
                            {delta >= 0 ? "▲" : "▼"} ₹{Math.abs(delta)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Recommendation Details & Model Performance */}
            <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                  <div style={{ background: "#dcfce7", color: "#166534", padding: "6px", borderRadius: "8px" }}>
                    <Sparkles size={20} />
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                    AI Decision Rationale & Guidance
                  </h3>
                </div>

                <div
                  style={{
                    background: predictionData.recommendation === "HOLD" ? "#eff6ff" : (predictionData.recommendation === "SELL NOW" ? "#f0fdf4" : "#fffbeb"),
                    border: `1px solid ${predictionData.recommendation === "HOLD" ? "#bfdbfe" : (predictionData.recommendation === "SELL NOW" ? "#bbf7d0" : "#fde68a")}`,
                    padding: "1rem",
                    borderRadius: "10px",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>
                    Action Recommendation
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "900", color: predictionData.recommendation === "HOLD" ? "#1d4ed8" : (predictionData.recommendation === "SELL NOW" ? "#15803d" : "#b45309"), margin: "2px 0 6px 0" }}>
                    {predictionData.recommendation}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: "1.6", color: "#1e293b", fontWeight: "500" }}>
                    {predictionData.recommendation_reason}
                  </p>
                </div>

                {/* Model Validation Statistics */}
                <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#111827", margin: "1rem 0 0.5rem 0" }}>
                  Model Evaluation & Performance Metrics
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Mean Absolute Error (MAE)</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                      ₹{predictionData.model_evaluation?.mae} <span style={{ fontSize: "0.75rem", color: "#64748b" }}>/ Qtl</span>
                    </div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Root Mean Sq. Error (RMSE)</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>
                      ₹{predictionData.model_evaluation?.rmse} <span style={{ fontSize: "0.75rem", color: "#64748b" }}>/ Qtl</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#475569" }}>
                  • <strong>Algorithm:</strong> {predictionData.model_evaluation?.model_name} ({predictionData.model_evaluation?.model_version})<br />
                  • <strong>Validation Split:</strong> {predictionData.model_evaluation?.validation_strategy}
                </div>
              </div>

              {/* Data Transparency & Disclaimer */}
              <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic", lineHeight: "1.4" }}>
                *{predictionData.disclaimer}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
