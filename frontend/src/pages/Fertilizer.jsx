import { useEffect, useState } from "react";
import { FlaskConical, Plus, Sprout } from "lucide-react";

const soilData = {
  Loamy: { ph: "6.5", nitrogen: "Good", phosphorus: "Medium", potassium: "Good", organicMatter: "1.8%", moisture: "Moderate" },
  Sandy: { ph: "6.2", nitrogen: "Low", phosphorus: "Medium", potassium: "Low", organicMatter: "1.1%", moisture: "Low" },
  Clay: { ph: "7.1", nitrogen: "Good", phosphorus: "Good", potassium: "Medium", organicMatter: "2.2%", moisture: "High" },
  "Black Soil": { ph: "7.2", nitrogen: "Good", phosphorus: "Medium", potassium: "Good", organicMatter: "2.5%", moisture: "Moderate" },
  "Red Soil": { ph: "6.0", nitrogen: "Medium", phosphorus: "Low", potassium: "Medium", organicMatter: "1.4%", moisture: "Low" },
};

const initialHistory = [
  { id: 1, date: "15 Sep", name: "NPK fertilizer", type: "Applied" },
  { id: 2, date: "28 Sep", name: "Organic compost", type: "Applied" },
];

function Fertilizer() {
  const [soil, setSoil] = useState("Loamy");
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smartagri-fertilizer-history") || "null") || initialHistory;
    } catch {
      return initialHistory;
    }
  });
  const [form, setForm] = useState({ ph: "6.5", nitrogen: "Good", phosphorus: "Medium", potassium: "Good", organicCarbon: "1.8" });
  const [analysis, setAnalysis] = useState({ condition: "Good", concern: "Nitrogen", recommendation: "Consider an appropriate nitrogen source based on soil test and crop requirements." });

  useEffect(() => {
    localStorage.setItem("smartagri-fertilizer-history", JSON.stringify(history));
  }, [history]);

  const data = soilData[soil];

  const analyzeSoil = () => {
    const soilCondition = Number(form.ph) >= 6 && Number(form.ph) <= 7 ? "Good" : "Needs attention";
    const concern = Number(form.nitrogen) < 2 ? "Nitrogen" : Number(form.phosphorus) < 2 ? "Phosphorus" : "Potassium";
    const recommendation = `Soil Condition: ${soilCondition}. Potential Nutrient Concern: ${concern}. Consider a targeted nutrient amendment based on crop requirement and lab guidance.`;
    setAnalysis({ condition: soilCondition, concern, recommendation });
    setShowForm(false);
  };

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div>
          <div className="page-badge">
            <FlaskConical size={17} />
            Soil & Fertilizer
          </div>
          <h1>Smart Soil & Fertilizer</h1>
          <p>Track soil health, nutrient balance and fertilizer planning.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1464226184884-fa52ac9fcf5a?auto=format&fit=crop&w=900&q=80" alt="Crop field" />
      </div>

      <div className="two-column-layout">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Soil profile</p>
              <h2>Soil selection</h2>
            </div>
            <select value={soil} onChange={(event) => setSoil(event.target.value)}>
              {Object.keys(soilData).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="soil-summary-grid">
            <div className="soil-stat"><span>Soil pH</span><strong>{data.ph}</strong></div>
            <div className="soil-stat"><span>Nitrogen</span><strong>{data.nitrogen}</strong></div>
            <div className="soil-stat"><span>Phosphorus</span><strong>{data.phosphorus}</strong></div>
            <div className="soil-stat"><span>Potassium</span><strong>{data.potassium}</strong></div>
            <div className="soil-stat"><span>Organic matter</span><strong>{data.organicMatter}</strong></div>
            <div className="soil-stat"><span>Moisture</span><strong>{data.moisture}</strong></div>
          </div>

          <div className="recommendation-box">
            <div className="recommendation-header">
              <div className="stat-icon green"><Sprout size={18} /></div>
              <div>
                <p className="eyebrow">Recommended fertilizer</p>
                <h3>NPK 10-26-26</h3>
              </div>
            </div>
            <p><strong>Purpose:</strong> Supports root development and flowering in many crop stages.</p>
            <p className="muted">Actual application should follow soil-test results, crop requirements, product label instructions, and local agricultural guidance.</p>
          </div>
        </section>

        <aside className="panel side-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Analysis</p>
              <h2>Soil test</h2>
            </div>
            <button type="button" className="primary-btn" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Soil Test
            </button>
          </div>

          {showForm && (
            <form className="soil-form" onSubmit={(event) => { event.preventDefault(); analyzeSoil(); }}>
              <input value={form.ph} onChange={(event) => setForm({ ...form, ph: event.target.value })} placeholder="pH" />
              <input value={form.nitrogen} onChange={(event) => setForm({ ...form, nitrogen: event.target.value })} placeholder="Nitrogen" />
              <input value={form.phosphorus} onChange={(event) => setForm({ ...form, phosphorus: event.target.value })} placeholder="Phosphorus" />
              <input value={form.potassium} onChange={(event) => setForm({ ...form, potassium: event.target.value })} placeholder="Potassium" />
              <input value={form.organicCarbon} onChange={(event) => setForm({ ...form, organicCarbon: event.target.value })} placeholder="Organic Carbon" />
              <button type="submit" className="secondary-btn">Analyze Soil</button>
            </form>
          )}

          <div className="analysis-box">
            <div className="analysis-row">
              <div className="info-item">
                <span className="info-label">Soil Condition</span>
                <strong className="info-value">{analysis.condition}</strong>
              </div>
            </div>
            <div className="analysis-row">
              <div className="info-item">
                <span className="info-label">Potential Nutrient Concern</span>
                <strong className="info-value">{analysis.concern}</strong>
              </div>
            </div>
            <div className="analysis-row long">
              <div className="info-item">
                <span className="info-label">Recommendation</span>
                <p className="info-value">{analysis.recommendation}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Records</p>
            <h2>Fertilizer history</h2>
          </div>
          <button type="button" className="secondary-btn" onClick={() => setHistory((current) => [...current, { id: Date.now(), date: "Today", name: "Organic manure", type: "Applied" }])}>Add Application</button>
        </div>

        <div className="table-card">
          {history.map((entry) => (
            <div className="table-row" key={entry.id}>
              <span>{entry.date}</span>
              <span>{entry.name}</span>
              <span className="status-badge neutral">{entry.type}</span>
              <div className="inline-actions">
                <button type="button" className="text-btn" onClick={() => setHistory((current) => current.map((item) => item.id === entry.id ? { ...item, type: "Edited" } : item))}>Edit</button>
                <button type="button" className="text-btn danger" onClick={() => setHistory((current) => current.filter((item) => item.id !== entry.id))}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Fertilizer;