import { useEffect, useState } from "react";
import { Clock3, Droplets, PauseCircle, PencilLine, Play, Plus, Trash2 } from "lucide-react";

const cropConfig = {
  Tomato: { moisture: 72, requirement: "Medium", next: "Today 6:00 PM", waterUse: "320 L", status: "Good" },
  Rice: { moisture: 78, requirement: "High", next: "Tomorrow 6:30 AM", waterUse: "440 L", status: "High" },
  Wheat: { moisture: 58, requirement: "Medium", next: "Today 7:00 AM", waterUse: "260 L", status: "Good" },
  Maize: { moisture: 46, requirement: "Medium", next: "Today 5:30 PM", waterUse: "300 L", status: "Low" },
  Potato: { moisture: 64, requirement: "Medium", next: "Today 6:15 PM", waterUse: "280 L", status: "Good" },
};

const defaultSchedules = [
  { id: 1, name: "Morning", time: "06:00 AM", duration: "20 minutes", enabled: true },
  { id: 2, name: "Evening", time: "06:00 PM", duration: "15 minutes", enabled: true },
];

const defaultHistory = [
  { day: "Monday", value: "320 L" },
  { day: "Tuesday", value: "280 L" },
  { day: "Wednesday", value: "350 L" },
  { day: "Thursday", value: "310 L" },
];

function Irrigation() {
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Irrigation ready to start");
  const [moisture, setMoisture] = useState(cropConfig.Tomato.moisture);
  const [schedules, setSchedules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smartagri-schedules") || "null") || defaultSchedules;
    } catch {
      return defaultSchedules;
    }
  });
  const [scheduleForm, setScheduleForm] = useState({ name: "Morning", time: "06:00 AM", duration: "20 minutes" });

  useEffect(() => {
    localStorage.setItem("smartagri-schedules", JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    if (!running) return undefined;

    const timer = setInterval(() => {
      setMoisture((current) => Math.min(current + 2, 100));
    }, 5000);

    return () => clearInterval(timer);
  }, [running]);

  const status = moisture < 35 ? "LOW" : moisture < 60 ? "MEDIUM" : moisture < 75 ? "GOOD" : "HIGH";

  const addSchedule = (event) => {
    event.preventDefault();
    const newSchedule = {
      id: Date.now(),
      name: scheduleForm.name || "Custom",
      time: scheduleForm.time || "06:00 AM",
      duration: scheduleForm.duration || "15 minutes",
      enabled: true,
    };
    setSchedules((current) => [...current, newSchedule]);
    setScheduleForm({ name: "Morning", time: "06:00 AM", duration: "20 minutes" });
  };

  const toggleSchedule = (id) => {
    setSchedules((current) =>
      current.map((schedule) =>
        schedule.id === id ? { ...schedule, enabled: !schedule.enabled } : schedule
      )
    );
  };

  const deleteSchedule = (id) => {
    setSchedules((current) => current.filter((schedule) => schedule.id !== id));
  };

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div>
          <div className="page-badge">
            <Droplets size={17} />
            Smart Irrigation
          </div>
          <h1>Smart Irrigation</h1>
          <p>Monitor soil moisture and manage your farm water requirements.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1464226184884-fa52ac9fcf5a?auto=format&fit=crop&w=900&q=80" alt="Irrigation field" />
      </div>

      <div className="two-column-layout">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Crop status</p>
              <h2>Soil moisture</h2>
            </div>
            <select value={selectedCrop} onChange={(event) => {
              const crop = event.target.value;
              setSelectedCrop(crop);
              setMoisture(cropConfig[crop]?.moisture ?? 72);
            }}>
              {Object.keys(cropConfig).map((crop) => (
                <option value={crop} key={crop}>{crop}</option>
              ))}
            </select>
          </div>

          <div className="moisture-panel">
            <div className="ring-wrap">
              <div className="ring" style={{ background: `conic-gradient(#2d925d ${moisture}%, #e9f5ee 0)` }}>
                <div className="ring-inner">
                  <strong>{moisture}%</strong>
                  <span>{status}</span>
                </div>
              </div>
            </div>

            <div className="moisture-metrics">
              <div>
                <label>Water requirement</label>
                <strong>{cropConfig[selectedCrop].requirement}</strong>
              </div>
              <div>
                <label>Next irrigation</label>
                <strong>{cropConfig[selectedCrop].next}</strong>
              </div>
              <div>
                <label>Water used today</label>
                <strong>{cropConfig[selectedCrop].waterUse}</strong>
              </div>
            </div>
          </div>

          <div className="status-banner is-active">
            <strong>{running ? "Running" : "Ready"}</strong>
            <span>{message}</span>
          </div>

          <div className="buttons-group">
            <button type="button" className="primary-btn" onClick={() => {
              setRunning(true);
              setMessage("Irrigation started successfully.");
            }}>
              <Play size={16} /> Start Irrigation
            </button>
            <button type="button" className="secondary-btn" onClick={() => {
              setRunning(false);
              setMessage("Last irrigation completed.");
            }}>
              <PauseCircle size={16} /> Stop
            </button>
          </div>
        </section>

        <aside className="panel side-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Schedule</p>
              <h2>Irrigation schedule</h2>
            </div>
          </div>

          <div className="schedule-list">
            {schedules.map((schedule) => (
              <div className={`schedule-item ${schedule.enabled ? "enabled" : "disabled"}`} key={schedule.id}>
                <Clock3 size={18} />
                <div>
                  <strong>{schedule.name}</strong>
                  <p>{schedule.time} • {schedule.duration}</p>
                </div>
                <div className="schedule-actions">
                  <button type="button" className="icon-button-small" onClick={() => toggleSchedule(schedule.id)} aria-label="Toggle schedule">
                    <PencilLine size={14} />
                  </button>
                  <button type="button" className="icon-button-small danger" onClick={() => deleteSchedule(schedule.id)} aria-label="Delete schedule">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form className="schedule-form" onSubmit={addSchedule}>
            <input value={scheduleForm.name} onChange={(event) => setScheduleForm({ ...scheduleForm, name: event.target.value })} placeholder="Name" />
            <input value={scheduleForm.time} onChange={(event) => setScheduleForm({ ...scheduleForm, time: event.target.value })} placeholder="Time" />
            <input value={scheduleForm.duration} onChange={(event) => setScheduleForm({ ...scheduleForm, duration: event.target.value })} placeholder="Duration" />
            <button type="submit" className="secondary-btn">
              <Plus size={16} /> Add schedule
            </button>
          </form>
        </aside>
      </div>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Usage</p>
            <h2>Water usage history</h2>
          </div>
        </div>

        <div className="history-chart">
          {defaultHistory.map((entry, index) => (
            <div className="bar-group" key={entry.day}>
              <div className="bar" style={{ height: `${((index + 1) * 22) + 30}%` }} />
              <span>{entry.day}</span>
              <small>{entry.value}</small>
            </div>
          ))}
        </div>

        <div className="tips-box">
          <h3>Irrigation tips</h3>
          <ul>
            <li>Avoid overwatering and check soil moisture before irrigation.</li>
            <li>Irrigate early in the morning for better efficiency.</li>
            <li>Consider rainfall before scheduling an additional cycle.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Irrigation;