import { useState } from "react";
import { Sprout } from "lucide-react";
import { cropCatalog } from "../data/crops";

const tabs = ["Overview", "Soil", "Planting", "Irrigation", "Fertilizer", "Diseases", "Pests", "Harvesting"];

function CropGuide() {
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [activeTab, setActiveTab] = useState("Overview");
  const [planStarted, setPlanStarted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Plan not started yet");

  const crop = cropCatalog.find((item) => item.name === selectedCrop) || cropCatalog[0];

  const tabContent = {
    Overview: [
      { label: "Scientific name", value: crop.scientificName },
      { label: "Growing duration", value: crop.duration },
      { label: "Best season", value: crop.season },
      { label: "Temperature", value: crop.temperature },
      { label: "Sunlight", value: crop.sunlight },
    ],
    Soil: [
      { label: "Soil type", value: crop.soil },
      { label: "pH range", value: crop.ph },
      { label: "Spacing", value: crop.spacing },
      { label: "Moisture", value: crop.water },
    ],
    Planting: [
      "Prepare beds and loosen the soil properly before inserting seedlings.",
      "Use disease-free planting material and maintain recommended row spacing.",
      "Avoid waterlogging during the early establishment phase.",
    ],
    Irrigation: [
      "Irrigate according to crop stage and local weather conditions.",
      "Check soil moisture before watering to prevent over-irrigation.",
      "Early morning watering is often more efficient than watering midday.",
    ],
    Fertilizer: [
      "Apply fertilizer based on soil test results and crop requirements.",
      "Balance nitrogen, phosphorus and potassium to support crop vigor.",
      "Do not exceed product instructions or local agricultural guidance.",
    ],
    Diseases: [
      "Monitor leaves, stems and flowers for early symptoms.",
      "Ensure proper spacing and sanitation to reduce disease spread.",
      "Control humidity stress and avoid unnecessary water accumulation.",
    ],
    Pests: [
      "Inspect the crop regularly for insects and larval damage.",
      "Use integrated control options suited to your crop and region.",
      "Keep field boundaries and crop residues clean.",
    ],
    Harvesting: [
      "Harvest at the right maturity to preserve market quality.",
      "Reduce post-harvest losses by grading and handling carefully.",
      "Store produce in a cool, clean and ventilated space.",
    ],
  };

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div>
          <div className="page-badge">
            <Sprout size={17} />
            Crop Guide
          </div>
          <h1>
            {selectedCrop} <span>Crop Profile</span>
          </h1>
          <p>{crop.overview}</p>
        </div>
        <img src={crop.image} alt={crop.name} />
      </div>

      <div className="crop-detail-layout">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Crop data</p>
              <h2>{crop.name}</h2>
            </div>
            <div className="buttons-group">
              <button type="button" className="primary-btn" onClick={() => {
                setPlanStarted(true);
                setStatusMessage(`${crop.name} crop plan started successfully.`);
              }}>
                Start Crop Plan
              </button>
              <button type="button" className="secondary-btn" onClick={() => {
                setStatusMessage(`${crop.name} step marked complete.`);
              }}>
                Mark Step Complete
              </button>
            </div>
          </div>

          <div className="crop-select-row">
            {cropCatalog.map((item) => (
              <button
                type="button"
                key={item.name}
                className={selectedCrop === item.name ? "crop-pill active" : "crop-pill"}
                onClick={() => setSelectedCrop(item.name)}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="metric-grid">
            <div className="metric-box"><span>Growing period</span><strong>{crop.duration}</strong></div>
            <div className="metric-box"><span>Best season</span><strong>{crop.season}</strong></div>
            <div className="metric-box"><span>Water need</span><strong>{crop.water}</strong></div>
            <div className="metric-box"><span>Sunlight</span><strong>{crop.sunlight}</strong></div>
          </div>

          <div className="tab-row">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                className={activeTab === tab ? "tab-btn active" : "tab-btn"}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="tab-panel">
            {Array.isArray(tabContent[activeTab]) && typeof tabContent[activeTab][0] === "object" ? (
              <div className="detail-list">
                {tabContent[activeTab].map((item) => (
                  <div className="detail-row" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="bullet-list">
                {tabContent[activeTab].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="panel side-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Crop timeline</p>
              <h2>Growth Timeline</h2>
            </div>
          </div>

          <div className="timeline">
            {crop.timeline.map((item) => (
              <div className="timeline-item" key={item.day}>
                <div className="timeline-dot" />
                <div>
                  <small>{item.day}</small>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="problem-box">
            <p className="eyebrow">Common problems</p>
            <div className="problem-list">
              {crop.problems.map((problem) => (
                <span key={problem}>{problem}</span>
              ))}
            </div>
          </div>

          <div className={planStarted ? "status-banner is-active" : "status-banner"}>
            <strong>{planStarted ? "Plan Active" : "Plan Inactive"}</strong>
            <span>{statusMessage}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CropGuide;
