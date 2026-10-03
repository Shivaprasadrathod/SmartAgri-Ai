import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

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

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <div className="app">

        <Sidebar />

        <div className="main-area">

          <Navbar />

          <main className="page-content">

            <Routes>

              {/* Dashboard */}
              <Route
                path="/"
                element={<Login />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              {/* Farming */}
              <Route
                path="/farming-guide"
                element={<FarmingGuide />}
              />

              <Route
                path="/crop-guide"
                element={<CropGuide />}
              />

              {/* AI */}
              <Route
                path="/ai-assistant"
                element={<AIAssistant />}
              />

              <Route
                path="/disease-detection"
                element={<DiseaseDetection />}
              />

              {/* Farm Management */}
              <Route
                path="/irrigation"
                element={<Irrigation />}
              />

              <Route
                path="/fertilizer"
                element={<Fertilizer />}
              />

              {/* Delivery */}
              <Route
                path="/delivery"
                element={<Delivery />}
              />

              {/* Shopping */}
              <Route
                path="/products"
                element={<Products />}
              />

              {/* Market */}
              <Route
                path="/market"
                element={<Market />}
              />

              {/* Settings */}
              <Route
                path="/settings"
                element={<Settings />}
              />
              {/* Authentication */}
              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;