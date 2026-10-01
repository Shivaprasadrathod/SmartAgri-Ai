import { useMemo, useState } from "react";
import { Package, Search, Truck } from "lucide-react";

const initialOrders = [
  { id: "AG1024", product: "Tomato Seeds", quantity: "5 packets", price: "₹450", status: "Out for Delivery", date: "Today", address: "Nashik Market Yard", driver: "Rafiq Khan", eta: "Today, 6:30 PM", items: ["Tomato Seeds", "Planting Kit"], timeline: ["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"] },
  { id: "AG1025", product: "Organic Fertilizer", quantity: "25 kg", price: "₹1,200", status: "Processing", date: "Tomorrow", address: "Pune Warehouse", driver: "Amit Verma", eta: "Tomorrow, 11:00 AM", items: ["Organic Fertilizer", "Soil Mix"], timeline: ["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"] },
  { id: "AG1026", product: "Drip Irrigation Kit", quantity: "1 kit", price: "₹1,499", status: "Delivered", date: "Yesterday", address: "Aurangabad Rural Center", driver: "Suresh Yadav", eta: "Delivered", items: ["Drip Irrigation Kit"], timeline: ["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"] },
  { id: "AG1028", product: "Neem Pesticide", quantity: "2 bottles", price: "₹780", status: "Shipped", date: "Today", address: "Nagpur Distribution Center", driver: "Priya Nair", eta: "Tomorrow, 9:00 AM", items: ["Neem Pesticide"], timeline: ["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"] },
];

const filterOptions = ["All", "Order Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Pickup Scheduled", "Collected From Farmer", "In Transit", "Delivered"];
const orderTypeOptions = ["All orders", "Buying", "Selling"];

const readMarketplaceOrders = () => {
  try {
    return JSON.parse(localStorage.getItem("smartagri-orders") || "[]");
  } catch {
    return [];
  }
};

function Delivery() {
  const [orders] = useState(() => [...readMarketplaceOrders(), ...initialOrders]);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedType, setSelectedType] = useState("All orders");
  const [selectedOrder, setSelectedOrder] = useState(() => readMarketplaceOrders()[0] || initialOrders[0]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.id.toLowerCase().includes(query.toLowerCase()) || order.product.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = selectedFilter === "All" ? true : order.status === selectedFilter;
      const matchesType = selectedType === "All orders" || (order.type || "Buying") === selectedType;
      return matchesSearch && matchesFilter && matchesType;
    });
  }, [orders, query, selectedFilter, selectedType]);

  const stats = [
    { label: "Total Orders", value: orders.length },
    { label: "Active Orders", value: orders.filter((order) => order.status !== "Delivered").length },
    { label: "Delivered", value: orders.filter((order) => order.status === "Delivered").length },
    { label: "Pending", value: orders.filter((order) => ["Order Confirmed", "Processing", "Pickup Scheduled"].includes(order.status)).length },
  ];

  return (
    <div className="page-shell">
      <div className="page-hero">
        <div>
          <div className="page-badge">
            <Truck size={17} />
            Agri Delivery
          </div>
          <h1>Agri Delivery</h1>
          <p>Track every agricultural order and delivery movement.</p>
        </div>
        <img src="C:\Users\SHIVAPRASAD RATHOD\Downloads\ChatGPT Image Oct 1, 2026, 07_09_42 PM.png" alt="Delivery logistics" />
      </div>

      <div className="stat-grid compact-grid">
        {stats.map((item) => (
          <div className="stat-card" key={item.label}>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Order search</p>
            <h2>Orders</h2>
          </div>
          <div className="search-panel narrow">
            <Search size={16} />
            <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order ID..." />
          </div>
        </div>

        <div className="filter-row">
          {orderTypeOptions.map((option) => (
            <button type="button" key={option} className={selectedType === option ? "filter-pill active" : "filter-pill"} onClick={() => setSelectedType(option)}>{option}</button>
          ))}
          {filterOptions.map((option) => (
            <button type="button" key={option} className={selectedFilter === option ? "filter-pill active" : "filter-pill"} onClick={() => setSelectedFilter(option)}>{option}</button>
          ))}
        </div>

        <div className="order-list">
            {filteredOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-heading">
                <div className="order-badge">{order.id}</div>
                <span className={`status-badge ${order.status.toLowerCase().replace(/\s/g, "-")}`}>{order.status}</span>
              </div>
              <div className="order-main">
                <div className="order-icon"><Package size={18} /></div>
                <div>
                  <h3>{order.product}</h3>
                  <p>Quantity: {order.quantity}</p>
                </div>
                <div className="order-price">{order.price}</div>
              </div>
              <div className="order-footer">
                <span>{order.date}</span>
                <button type="button" className="primary-btn small" onClick={() => setSelectedOrder(order)}>Track Order</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Tracking</p>
            <h2>Delivery detail</h2>
          </div>
        </div>

        <div className="tracking-panel">
          <div className="tracking-header">
            <h3>{selectedOrder.product}</h3>
            <span>{selectedOrder.status}</span>
          </div>

          <div className="tracking-steps">
            {(selectedOrder.timeline || ["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"]).map((step, index) => (
              <div className={`tracking-step ${index <= Math.max(0, (selectedOrder.timeline || []).indexOf(selectedOrder.status)) ? "active" : ""}`} key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <div className="detail-grid">
            <div className="info-item">
              <span className="info-label">Delivery address</span>
              <strong className="info-value">{selectedOrder.address}</strong>
            </div>
            <div className="info-item">
              <span className="info-label">Expected delivery</span>
              <strong className="info-value">{selectedOrder.eta}</strong>
            </div>
            <div className="info-item">
              <span className="info-label">Driver</span>
              <strong className="info-value">{selectedOrder.driver}</strong>
            </div>
            <div className="info-item">
              <span className="info-label">Items</span>
              <strong className="info-value">{selectedOrder.items.map((item) => typeof item === "string" ? item : `${item.name} × ${item.quantity}`).join(", ")}</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Delivery;