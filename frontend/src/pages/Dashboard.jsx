import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Camera,
  CloudSun,
  Droplets,
  FlaskConical,
  PackageCheck,
  Plus,
  ShoppingBag,
  Tractor,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [marketplaceStats] = useState(() => {
    try {
      const listings = JSON.parse(localStorage.getItem("smartagri-listings") || "[]");
      const orders = JSON.parse(localStorage.getItem("smartagri-orders") || "[]");
      const cart = JSON.parse(localStorage.getItem("smartagri-cart") || "[]");
      return {
        listings: listings.filter((listing) => !listing.demo && listing.status !== "Sold").length,
        orders: orders.length,
        sold: orders.filter((order) => order.type === "Selling").length,
        purchased: orders.filter((order) => order.type !== "Selling").length,
        cart: cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
      };
    } catch {
      return { listings: 0, orders: 0, sold: 0, purchased: 0, cart: 0 };
    }
  });

  const stats = [
    { label: "Active Crops", value: "06", detail: "Tomato • Rice • Maize", icon: <Tractor size={20} /> },
    { label: "Soil Moisture", value: "72%", detail: "Good condition", icon: <Droplets size={20} /> },
    { label: "Weather", value: "28°C", detail: "Partly cloudy", icon: <CloudSun size={20} /> },
    { label: "Deliveries", value: "12", detail: "4 in progress", icon: <PackageCheck size={20} /> },
  ];

  const tasks = [
    { id: 1, title: "Check soil moisture", detail: "Ensure irrigation is aligned with crop stage", priority: "Medium", icon: "💧" },
    { id: 2, title: "Inspect crop leaves", detail: "Look for signs of disease or pest stress", priority: "High", icon: "🌿" },
    { id: 3, title: "Review irrigation plot", detail: "All valves should be functioning correctly", priority: "Medium", icon: "🚿" },
    { id: 4, title: "Apply fertilizer", detail: "Use soil test results before feeding the field", priority: "Low", icon: "🧪" },
  ];

  const recentOrders = [
    { id: "AG1024", item: "Tomato Seeds", status: "Out for delivery" },
    { id: "AG1027", item: "Drip kit", status: "Packed" },
    { id: "AG1032", item: "Organic compost", status: "Delivered" },
  ];

  const quickActions = [
    { label: "Add Crop", icon: <Plus size={18} />, path: "/farming-guide" },
    { label: "Irrigation", icon: <Droplets size={18} />, path: "/irrigation" },
    { label: "Soil Test", icon: <FlaskConical size={18} />, path: "/fertilizer" },
    { label: "Products", icon: <ShoppingBag size={18} />, path: "/products" },
    { label: "Ask AI", icon: <Bot size={18} />, path: "/ai-assistant" },
    { label: "Disease Scan", icon: <Camera size={18} />, path: "/disease-detection" },
  ];

  return (
    <div className="dashboard-page">
      <section className="welcome-section">
        <p className="eyebrow">SmartAgri dashboard</p>
        <h1>
          Good Morning, Farmer <span>👋</span>
        </h1>
        <p>Your farm performance is looking healthy and productive today.</p>
      </section>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon">{stat.icon}</div>
            <div>
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
              <small>{stat.detail}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Farm workload</p>
              <h2>Today&apos;s Tasks</h2>
            </div>
            <span className="pill">4 tasks</span>
          </div>

          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-item" key={task.id}>
                <input type="checkbox" defaultChecked={task.priority === "Low"} />
                <div className="task-icon">{task.icon}</div>
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>{task.detail}</p>
                </div>
                <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Operations</p>
              <h2>Irrigation Status</h2>
            </div>
            <span className="status-badge success">Running</span>
          </div>

          <div className="mini-metrics">
            <div>
              <strong>72%</strong>
              <span>Soil moisture</span>
            </div>
            <div>
              <strong>06:00 PM</strong>
              <span>Next irrigation</span>
            </div>
            <div>
              <strong>320L</strong>
              <span>Water used today</span>
            </div>
          </div>

          <div className="summary-box">
            <h4>Crop Health</h4>
            <div className="progress-line">
              <span style={{ width: "82%" }} />
            </div>
            <small>Healthy performance across active crop plots</small>
          </div>

          <div className="summary-box">
            <h4>Market Summary</h4>
            <ul className="metric-list">
              <li>Tomato <span>₹35/kg</span></li>
              <li>Rice <span>₹48/kg</span></li>
              <li>Maize <span>₹24/kg</span></li>
            </ul>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Activity</p>
            <h2>Recent Orders</h2>
          </div>
          <button className="ghost-btn" type="button" onClick={() => navigate("/delivery")}>View all <ArrowRight size={16} /></button>
        </div>

        <div className="table-card">
          {recentOrders.map((order) => (
            <div className="table-row" key={order.id}>
              <span>{order.id}</span>
              <span>{order.item}</span>
              <span className="status-badge neutral">{order.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel quick-actions-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Quick access</p>
            <h2>Quick Actions</h2>
          </div>
        </div>

        <div className="quick-actions">
          {quickActions.map((action) => (
            <button key={action.label} type="button" className="action-button" onClick={() => navigate(action.path)}>
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel marketplace-dashboard-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Buy and sell</p>
            <h2>Marketplace Overview</h2>
          </div>
          <button type="button" className="ghost-btn" onClick={() => navigate("/market")}>Open marketplace <ArrowRight size={16} /></button>
        </div>
        <div className="marketplace-summary-grid">
          <div><span>My active listings</span><strong>{marketplaceStats.listings}</strong></div>
          <div><span>Marketplace orders</span><strong>{marketplaceStats.orders}</strong></div>
          <div><span>Products sold</span><strong>{marketplaceStats.sold}</strong></div>
          <div><span>Products purchased</span><strong>{marketplaceStats.purchased}</strong></div>
          <div><span>Cart items</span><strong>{marketplaceStats.cart}</strong></div>
        </div>
        <div className="marketplace-dashboard-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate("/market#my-listings")}>Sell Produce</button>
          <button type="button" className="secondary-btn" onClick={() => navigate("/products")}>Buy Farm Supplies</button>
          <button type="button" className="secondary-btn" onClick={() => navigate("/delivery")}>My Orders</button>
          <button type="button" className="secondary-btn" onClick={() => navigate("/market#my-listings")}>My Listings</button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;