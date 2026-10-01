import { useEffect, useState } from "react";
import { ChevronDown, Search, Sprout } from "lucide-react";
import farmingGuideImage from "../assets/farming-guide.svg";
import { cropCatalog } from "../data/crops";
import { cropGuides, farmingChecklist } from "../data/farmingSteps";

const cropList = [
  "Tomato",
  "Rice",
  "Wheat",
  "Maize",
  "Potato",
  "Cotton",
  "Sugarcane",
  "Onion",
  "Chilli",
  "Groundnut",
];

function FarmingGuide() {
  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [openStep, setOpenStep] = useState(0);
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("smartagri-checklist") || "[]");
      return saved.length ? saved : farmingChecklist.map((title, index) => ({ id: index + 1, title, done: false }));
    } catch {
      return farmingChecklist.map((title, index) => ({ id: index + 1, title, done: false }));
    }
  });

  useEffect(() => {
    localStorage.setItem("smartagri-checklist", JSON.stringify(tasks));
  }, [tasks]);

  const filteredCrops = cropCatalog.filter((crop) =>
    crop.name.toLowerCase().includes(search.toLowerCase()) || crop.season.toLowerCase().includes(search.toLowerCase())
  );

  const activeGuide = cropGuides[selectedCrop] || cropGuides.Tomato;
  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);
  const currentStepIndex = Math.min(Math.max(Math.floor((progress / 100) * activeGuide.length), 0), activeGuide.length - 1);

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  return (
    <div className="guide-page page-shell">
      <div className="page-hero">
        <div>
          <div className="page-badge">
            <Sprout size={17} />
            Farming Guide
          </div>
          <h1>
            Farming Guide <span>for smarter decisions</span>
          </h1>
          <p>Step-by-step farming guidance from soil preparation to harvesting.</p>
        </div>
        <img
          src={farmingGuideImage}
          alt="Agricultural field and farming guidance illustration"
        />
      </div>

      <div className="search-panel">
        <Search size={18} />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search crop..."
        />
      </div>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Crop library</p>
            <h2>Select a crop</h2>
          </div>
        </div>

        <div className="crop-pills">
          {cropList.map((crop) => (
            <button
              type="button"
              key={crop}
              className={selectedCrop === crop ? "crop-pill active" : "crop-pill"}
              onClick={() => {
                setSelectedCrop(crop);
                setOpenStep(0);
              }}
            >
              {crop}
            </button>
          ))}
        </div>

        <div className="crop-grid">
          {filteredCrops.length ? (
            filteredCrops.map((crop) => (
              <div className="crop-card" key={crop.id}>
                <img src={crop.image} alt={crop.name} />
                <div className="crop-card-body">
                  <h3>{crop.name}</h3>
                  <div className="meta-row">
                    <span>Season: {crop.season}</span>
                    <span>Duration: {crop.duration}</span>
                  </div>
                  <div className="meta-row compact">
                    <span>Water: {crop.water}</span>
                    <span>Difficulty: {crop.difficulty}</span>
                  </div>
                  <button type="button" className="primary-btn" onClick={() => setSelectedCrop(crop.name)}>
                    View Guide
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No crops matched your search.</div>
          )}
        </div>
      </section>

      <section className="guide-layout">
        <div className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Farming process</p>
              <h2>{selectedCrop} Process</h2>
            </div>
            <span className="pill">{activeGuide.length} steps</span>
          </div>

          <div className="progress-box">
            <div className="progress-header">
              <strong>Farming Progress</strong>
              <span>{progress}%</span>
            </div>
            <div className="progress-line">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="guide-steps">
            {activeGuide.map((step, index) => {
              const status = index < currentStepIndex ? "complete" : index === currentStepIndex ? "current" : "pending";
              const isOpen = openStep === index;

              return (
                <div className={`guide-step ${status}`} key={step.title}>
                  <button type="button" className="step-toggle" onClick={() => setOpenStep(isOpen ? -1 : index)}>
                    <div className="step-index">{index + 1}</div>
                    <div className="step-text">
                      <strong>{step.title}</strong>
                      <small>{status.charAt(0).toUpperCase() + status.slice(1)}</small>
                    </div>
                    <ChevronDown size={18} className={isOpen ? "rotated" : ""} />
                  </button>

                  {isOpen && (
                    <div className="step-body">
                      <p>{step.description}</p>
                      <button type="button" className="small-btn" onClick={() => setOpenStep(index + 1)}>
                        Complete Step
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="panel side-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Daily plan</p>
              <h2>Today&apos;s Farming Tasks</h2>
            </div>
          </div>

          <div className="checklist">
            {tasks.map((task) => (
              <label className="check-item" key={task.id}>
                <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                <span>{task.title}</span>
              </label>
            ))}
          </div>

          <div className="tip-card">
            <p className="eyebrow">Tip of the Day</p>
            <strong>Inspect crop leaves regularly to detect pests and diseases early.</strong>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default FarmingGuide;