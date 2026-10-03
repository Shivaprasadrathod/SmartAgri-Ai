import { BrowserRouter, Routes, Route } from "react-router-dom";

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


import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Login & Register
            No Sidebar / Navbar
        ========================= */}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />


        {/* =========================
            Main Website
            Sidebar + Navbar
        ========================= */}

        <Route element={<MainLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/farming-guide"
            element={<FarmingGuide />}
          />

          <Route
            path="/crop-guide"
            element={<CropGuide />}
          />

          <Route
            path="/ai-assistant"
            element={<AIAssistant />}
          />

          <Route
            path="/disease-detection"
            element={<DiseaseDetection />}
          />

          <Route
            path="/irrigation"
            element={<Irrigation />}
          />

          <Route
            path="/fertilizer"
            element={<Fertilizer />}
          />

          <Route
            path="/delivery"
            element={<Delivery />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/market"
            element={<Market />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;