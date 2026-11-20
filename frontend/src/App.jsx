import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./components/MainLayout";

import Dashboard from "./pages/Dashboard";
import FarmingGuide from "./pages/FarmingGuide";
import CropGuide from "./pages/CropGuide";
import AIAssistant from "./pages/AIAssistant";
import DiseaseDetection from "./pages/DiseaseDetection";
import Irrigation from "./pages/Irrigation";
import Fertilizer from "./pages/Fertilizer";
import Delivery from "./pages/Delivery";
import Products from "./pages/Products";
import Market from "./pages/Market";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PricePrediction from "./pages/PricePrediction";
import KarnatakaMarket from "./pages/KarnatakaMarket";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main Application with Protected Route Guard & Guest Handling */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/karnataka-market" element={<KarnatakaMarket />} />
            <Route path="/ai-price-prediction" element={<PricePrediction />} />
            <Route path="/market" element={<Market />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/crop-guide" element={<CropGuide />} />
            <Route path="/farming-guide" element={<FarmingGuide />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            <Route path="/irrigation" element={<Irrigation />} />
            <Route path="/fertilizer" element={<Fertilizer />} />
            <Route path="/products" element={<Products />} />

            {/* Protected Routes: require registered farmer account */}
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
