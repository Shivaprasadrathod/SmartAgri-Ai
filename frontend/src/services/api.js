// SmartAgri AI API Client Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = {
  // Authentication
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || "Failed to log in");
    }
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || "Failed to register");
    }
    return data;
  },

  // Agricultural Market Intelligence
  async getMarketPrices(filters = {}) {
    const params = new URLSearchParams();
    if (filters.commodity && filters.commodity !== "All Crops") params.append("commodity", filters.commodity);
    if (filters.state && filters.state !== "All States") params.append("state", filters.state);
    if (filters.district) params.append("district", filters.district);
    if (filters.market) params.append("market", filters.market);

    const res = await fetch(`${API_BASE_URL}/api/market/prices?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch market prices");
    return res.json();
  },

  async getCrops() {
    const res = await fetch(`${API_BASE_URL}/api/market/crops`);
    if (!res.ok) throw new Error("Failed to load crops list");
    return res.json();
  },

  // Dedicated Karnataka Crop Market Dashboard
  async getKarnatakaCrops(district = null, market = null) {
    const params = new URLSearchParams();
    if (district && district !== "All Districts") params.append("district", district);
    if (market && market !== "All Markets") params.append("market", market);

    const res = await fetch(`${API_BASE_URL}/api/market/karnataka-crops?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch Karnataka crop prices");
    return res.json();
  },

  async getKarnatakaLocations() {
    const res = await fetch(`${API_BASE_URL}/api/market/karnataka-locations`);
    if (!res.ok) throw new Error("Failed to fetch Karnataka locations");
    return res.json();
  },

  async getNearestMarkets(latitude, longitude, commodity = "Tomato", maxDistanceKm = 500) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      commodity,
      max_distance_km: maxDistanceKm.toString(),
    });
    const res = await fetch(`${API_BASE_URL}/api/market/nearest?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to locate nearby agricultural markets");
    return res.json();
  },

  async getPriceTrends(crop = "Tomato", days = 14) {
    const res = await fetch(`${API_BASE_URL}/api/market/historical-trends?crop=${encodeURIComponent(crop)}&days=${days}`);
    if (!res.ok) throw new Error("Failed to retrieve price history trends");
    return res.json();
  },

  async getAIRecommendation(crop = "Tomato") {
    const res = await fetch(`${API_BASE_URL}/api/market/ai-recommendation?crop=${encodeURIComponent(crop)}`);
    if (!res.ok) throw new Error("Failed to compute AI buy/sell advisory");
    return res.json();
  },

  async chatAssistant(message, crop = null, market = null, language = "en") {
    const res = await fetch(`${API_BASE_URL}/api/market/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, crop, market, language }),
    });
    if (!res.ok) throw new Error("Failed to communicate with AI Assistant");
    return res.json();
  },

  // AI Crop Price Prediction
  async getCropPricePrediction(crop = "Tomato", market = null, state = null, district = null) {
    const params = new URLSearchParams();
    if (crop) params.append("crop", crop);
    if (market && market !== "All Markets") params.append("market", market);
    if (state && state !== "All States") params.append("state", state);
    if (district) params.append("district", district);

    const res = await fetch(`${API_BASE_URL}/api/prediction/full?${params.toString()}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to generate AI price forecast");
    }
    return res.json();
  },

  async getTomorrowPrediction(crop = "Tomato", market = null) {
    const params = new URLSearchParams({ crop });
    if (market) params.append("market", market);
    const res = await fetch(`${API_BASE_URL}/api/prediction/tomorrow?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch tomorrow's predicted price");
    return res.json();
  },

  async getSevenDayForecast(crop = "Tomato", market = null) {
    const params = new URLSearchParams({ crop });
    if (market) params.append("market", market);
    const res = await fetch(`${API_BASE_URL}/api/prediction/7days?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch 7-day forecast");
    return res.json();
  },

  async getThirtyDayForecast(crop = "Tomato", market = null) {
    const params = new URLSearchParams({ crop });
    if (market) params.append("market", market);
    const res = await fetch(`${API_BASE_URL}/api/prediction/30days?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch 30-day forecast");
    return res.json();
  },

  async getPredictionRecommendation(crop = "Tomato", market = null) {
    const params = new URLSearchParams({ crop });
    if (market) params.append("market", market);
    const res = await fetch(`${API_BASE_URL}/api/prediction/recommendation?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch prediction recommendation");
    return res.json();
  },
};
