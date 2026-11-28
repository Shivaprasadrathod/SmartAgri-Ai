// SmartAgri AI API Client Service
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const TOKEN_STORAGE_KEY = "smartagri-token";

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return null;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Authentication
  async login(email, password) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async register(name, email, password) {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (data?.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async getMe() {
    return apiFetch("/auth/me");
  },

  // Agricultural Market Intelligence
  async getMarketPrices(filters = {}) {
    const params = new URLSearchParams();
    if (filters.commodity && filters.commodity !== "All Crops") params.append("commodity", filters.commodity);
    if (filters.state && filters.state !== "All States") params.append("state", filters.state);
    if (filters.district) params.append("district", filters.district);
    if (filters.market) params.append("market", filters.market);
    return apiFetch(`/api/market/prices?${params.toString()}`);
  },

  async getCrops() {
    return apiFetch("/api/market/crops");
  },

  async getKarnatakaCrops(district = null, market = null) {
    const params = new URLSearchParams();
    if (district && district !== "All Districts") params.append("district", district);
    if (market && market !== "All Markets") params.append("market", market);
    return apiFetch(`/api/market/karnataka-crops?${params.toString()}`);
  },

  async getKarnatakaLocations() {
    return apiFetch("/api/market/karnataka-locations");
  },

  async getNearestMarkets(latitude, longitude, commodity = "Tomato", maxDistanceKm = 500) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      commodity,
      max_distance_km: maxDistanceKm.toString(),
    });
    return apiFetch(`/api/market/nearest?${params.toString()}`);
  },

  async getPriceTrends(crop = "Tomato", days = 14) {
    return apiFetch(`/api/market/historical-trends?crop=${encodeURIComponent(crop)}&days=${days}`);
  },

  async getAIRecommendation(crop = "Tomato") {
    return apiFetch(`/api/market/ai-recommendation?crop=${encodeURIComponent(crop)}`);
  },

  async chatAssistant(message, crop = null, market = null, language = "en") {
    return apiFetch("/api/market/chat", {
      method: "POST",
      body: JSON.stringify({ message, crop, market, language }),
    });
  },

  // AI Crop Price Prediction
  async getCropPricePrediction(crop = "Tomato", market = null, state = null, district = null) {
    const params = new URLSearchParams();
    if (crop) params.append("crop", crop);
    if (market && market !== "All Markets") params.append("market", market);
    if (state && state !== "All States") params.append("state", state);
    if (district) params.append("district", district);
    return apiFetch(`/api/prediction/full?${params.toString()}`);
  },

  async getTomorrowPrediction(crop = "Tomato", market = null) {
    const params = new URLSearchParams({ crop });
    if (market) params.append("market", market);
    return apiFetch(`/api/prediction/tomorrow?${params.toString()}`);
  },

  async getSevenDayForecast(crop = "Tomato", market = null) {
    const params = new URLSearchParams({ crop });
    if (market) params.append("market", market);
    return apiFetch(`/api/prediction/7days?${params.toString()}`);
  },

  async getThirtyDayForecast(crop = "Tomato", market = null) {
    const params = new URLSearchParams({ crop });
    if (market) params.append("market", market);
    return apiFetch(`/api/prediction/30days?${params.toString()}`);
  },

  async getPredictionRecommendation(crop = "Tomato", market = null) {
    const params = new URLSearchParams({ crop });
    if (market) params.append("market", market);
    return apiFetch(`/api/prediction/recommendation?${params.toString()}`);
  },

  // Farm & Marketplace Persistence
  async getProducts(category = null, q = null) {
    const params = new URLSearchParams();
    if (category && category !== "All supplies") params.append("category", category);
    if (q) params.append("q", q);
    return apiFetch(`/api/products?${params.toString()}`);
  },

  async getOrders() {
    return apiFetch("/api/orders");
  },

  async createOrder(order) {
    return apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },

  async getSettings() {
    return apiFetch("/api/settings");
  },

  async updateSettings(settings) {
    return apiFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        name: settings.name,
        farm_name: settings.farmName,
        location: settings.location,
        farm_size: settings.farmSize,
        email: settings.email,
        phone: settings.phone || "",
        irrigation_mode: settings.irrigationMode,
        notifications: Boolean(settings.notifications),
        ai_insights: Boolean(settings.aiInsights),
        auto_scheduling: Boolean(settings.autoScheduling),
      }),
    });
  },

  async getIrrigationSchedules(cropName = null) {
    const params = new URLSearchParams();
    if (cropName) params.append("crop_name", cropName);
    return apiFetch(`/api/irrigation/schedules?${params.toString()}`);
  },

  async createIrrigationSchedule(schedule) {
    return apiFetch("/api/irrigation/schedules", {
      method: "POST",
      body: JSON.stringify(schedule),
    });
  },

  async deleteIrrigationSchedule(id) {
    return apiFetch(`/api/irrigation/schedules/${id}`, { method: "DELETE" });
  },

  async getFertilizerLogs() {
    return apiFetch("/api/fertilizer/logs");
  },

  async createFertilizerLog(log) {
    return apiFetch("/api/fertilizer/logs", {
      method: "POST",
      body: JSON.stringify(log),
    });
  },

  async getCropPlans() {
    return apiFetch("/api/crop-plans");
  },

  async createCropPlan(plan) {
    return apiFetch("/api/crop-plans", {
      method: "POST",
      body: JSON.stringify(plan),
    });
  },

  async getDiseaseScans() {
    return apiFetch("/api/disease-scans");
  },

  async createDiseaseScan(scan) {
    return apiFetch("/api/disease-scans", {
      method: "POST",
      body: JSON.stringify(scan),
    });
  },
};
