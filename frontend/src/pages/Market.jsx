import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBasket, TrendingUp, Truck } from "lucide-react";

const fallbackImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80";

const produceCategories = ["Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Oilseeds", "Cotton", "Sugarcane", "Organic Produce", "Other Farm Produce"];
const demoPrices = [
  { crop: "Tomato", price: 35, change: "+5%" },
  { crop: "Rice", price: 48, change: "+2%" },
  { crop: "Wheat", price: 30, change: "+3%" },
  { crop: "Maize", price: 24, change: "-1%" },
  { crop: "Potato", price: 27, change: "+4%" },
];

const sampleListings = [
  { id: "demo-tomato", name: "Fresh Tomatoes", category: "Vegetables", variety: "Local hybrid", quantity: 500, unit: "kg", price: 32, minOrder: 20, harvestDate: new Date().toISOString().slice(0, 10), grade: "A", description: "Fresh farm-produced tomatoes, sorted and ready for pickup.", location: "Nashik, Maharashtra", availableFrom: "Today", image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80", seller: "Ramesh Farm", contact: "9876543210", status: "Active", views: 42, orders: 3, createdAt: "2026-09-30", demo: true },
  { id: "demo-onion", name: "Red Onions", category: "Vegetables", variety: "Nashik red", quantity: 800, unit: "kg", price: 26, minOrder: 50, harvestDate: "2026-09-27", grade: "A", description: "Graded red onions from a local farm. Bulk orders welcome.", location: "Lasalgaon, Maharashtra", availableFrom: "Today", image: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=80", seller: "Patil Growers", contact: "9876543211", status: "Active", views: 67, orders: 7, createdAt: "2026-09-29", demo: true },
  { id: "demo-rice", name: "Indrayani Rice", category: "Grains", variety: "Indrayani", quantity: 1200, unit: "kg", price: 48, minOrder: 100, harvestDate: "2026-09-20", grade: "A", description: "Clean, farm-sourced rice available in bulk lots.", location: "Kolhapur, Maharashtra", availableFrom: "Oct 04", image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80", seller: "Sahyadri Farmers Group", contact: "9876543212", status: "Active", views: 28, orders: 2, createdAt: "2026-09-28", demo: true },
];

const emptyForm = { name: "", category: "Vegetables", variety: "", quantity: "", unit: "kg", price: "", minOrder: "", harvestDate: "", grade: "A", description: "", location: "", availableFrom: "Today", image: "", seller: "Ramesh Farm", contact: "", status: "Active", views: 0, orders: 0 };

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

const createOrderId = () => `AGR${Date.now().toString().slice(-6)}`;

function normalizeListing(listing) {
  if (listing.name) return { ...emptyForm, ...listing };
  return {
    ...emptyForm,
    ...listing,
    name: listing.crop || "Farm produce",
    category: "Vegetables",
    quantity: Number.parseFloat(listing.quantity) || 0,
    unit: "kg",
    price: Number.parseFloat(String(listing.expectedPrice || listing.expected || "").replace(/[^\d.]/g, "")) || 0,
    location: listing.location || "Local area",
    seller: "Ramesh Farm",
    contact: listing.contact || "",
    image: "",
    status: "Active",
  };
}

function Market() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("Fresh From Farmers");
  const [listings, setListings] = useState(() => readStorage("smartagri-listings", []).map(normalizeListing));
  const [orders, setOrders] = useState(() => readStorage("smartagri-orders", []));
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("smartagri-listings", JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timeout);
  }, [toast]);

  const availableListings = useMemo(() => [...sampleListings, ...listings.filter((listing) => !listing.demo)], [listings]);
  const filteredListings = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = availableListings.filter((listing) => {
      const searchable = `${listing.name} ${listing.category} ${listing.variety} ${listing.location} ${listing.seller} ${listing.grade}`.toLowerCase();
      return (!term || searchable.includes(term)) && (categoryFilter === "All categories" || listing.category === categoryFilter);
    });
    if (sortBy === "low-high") return result.sort((a, b) => a.price - b.price);
    if (sortBy === "high-low") return result.sort((a, b) => b.price - a.price);
    if (sortBy === "popular") return result.sort((a, b) => b.views - a.views);
    return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [availableListings, categoryFilter, query, sortBy]);

  const myListings = listings.filter((listing) => !listing.demo);
  const myOrders = orders.filter((order) => order.type === "Buying" || !order.type);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const listing = {
      ...form,
      id: editingId || `listing-${Date.now()}`,
      quantity: Number(form.quantity),
      price: Number(form.price),
      minOrder: Number(form.minOrder || 1),
      createdAt: editingId ? listings.find((item) => item.id === editingId)?.createdAt : new Date().toISOString(),
      demo: false,
    };
    setListings((current) => editingId
      ? current.map((item) => item.id === editingId ? listing : item)
      : [listing, ...current]);
    setMessage(editingId ? "Your listing has been updated." : "Your product has been listed successfully.");
    setShowForm(false);
    resetForm();
  };

  const editListing = (listing) => {
    setForm({ ...emptyForm, ...listing, quantity: String(listing.quantity), price: String(listing.price), minOrder: String(listing.minOrder) });
    setEditingId(listing.id);
    setShowForm(true);
    document.getElementById("my-listings")?.scrollIntoView({ behavior: "smooth" });
  };

  const updateListing = (id, update) => setListings((current) => current.map((item) => item.id === id ? { ...item, ...update } : item));

  const buyListing = (listing) => {
    if (listing.status !== "Active") {
      setToast("This listing is not currently available.");
      return;
    }
    const quantity = Number(listing.minOrder) || 1;
    const orderId = createOrderId();
    const order = {
      id: orderId,
      type: "Buying",
      product: listing.name,
      quantity: `${quantity} ${listing.unit}`,
      price: `₹${quantity * Number(listing.price)}`,
      amount: quantity * Number(listing.price),
      status: "Pickup Scheduled",
      date: new Date().toLocaleDateString("en-IN"),
      createdAt: new Date().toISOString(),
      buyer: "Demo Buyer",
      seller: listing.seller,
      address: listing.location,
      phone: listing.contact,
      eta: "Farmer pickup to be coordinated",
      driver: "Pickup partner to be assigned",
      items: [{ ...listing, quantity }],
      timeline: ["Pickup Scheduled", "Collected From Farmer", "In Transit", "Delivered"],
    };
    const nextOrders = [order, ...readStorage("smartagri-orders", [])];
    localStorage.setItem("smartagri-orders", JSON.stringify(nextOrders));
    setOrders(nextOrders);
    if (!listing.demo) updateListing(listing.id, { orders: (listing.orders || 0) + 1 });
    setToast(`Demo order #${orderId} placed. Contact ${listing.seller} to coordinate pickup.`);
  };

  const deleteListing = (id) => {
    setListings((current) => current.filter((item) => item.id !== id));
    setToast("Listing deleted.");
  };

  return (
    <div className="page-shell marketplace-page">
      <div className="page-hero">
        <div>
          <div className="page-badge"><TrendingUp size={17} /> Farmer Marketplace</div>
          <h1>Sell and source locally</h1>
          <p>Buy direct from growers, publish your harvest, and manage marketplace orders.</p>
        </div>
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80" alt="Fresh farm produce at a market" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
      </div>

      <section className="panel market-data-panel">
        <div className="section-header">
          <div><p className="eyebrow">Today's farm market</p><h2>Reference prices</h2></div>
          <span className="demo-label">Demo marketplace data · not live prices</span>
        </div>
        <div className="price-grid">
          {demoPrices.map((item) => <article className="market-card" key={item.crop}>
            <div className="market-header"><strong>{item.crop}</strong><span className={item.change.startsWith("+") ? "gain" : "loss"}>{item.change}</span></div>
            <h3>₹{item.price}<small> / kg</small></h3><p>Example reference only</p>
          </article>)}
        </div>
      </section>

      <section className="panel" id="fresh-from-farmers">
        <div className="section-header">
          <div><p className="eyebrow">Buy direct from farmers</p><h2>Fresh From Farmers</h2></div>
          <div className="marketplace-filters">
            <div className="search-panel"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search crop, variety, seller, location..." aria-label="Search farm produce" /></div>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter produce category">
              <option>All categories</option>{produceCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort farm produce">
              <option value="newest">Newest</option><option value="low-high">Price: low to high</option><option value="high-low">Price: high to low</option><option value="popular">Popular</option>
            </select>
          </div>
        </div>

        <div className="listing-grid farmer-listing-grid">
          {filteredListings.map((listing) => <article className="farmer-listing-card" key={listing.id}>
            <img src={listing.image || fallbackImage} alt={listing.name} loading="lazy" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
            <div className="farmer-listing-body">
              <div className="listing-topline"><span className="tag">{listing.category}</span><span className={`status-badge ${listing.status.toLowerCase()}`}>{listing.status}</span></div>
              <h3>{listing.name}</h3>
              <p className="product-variety">{listing.variety || "Farm produce"} · Grade {listing.grade || "Unspecified"}</p>
              <div className="farmer-price-line"><strong>₹{listing.price} <small>/ {listing.unit}</small></strong><span>{listing.quantity} {listing.unit} available</span></div>
              <p>{listing.description}</p>
              <div className="seller-line"><strong>{listing.seller}</strong><span> · {listing.location}</span></div>
              <div className="meta-row"><span>Harvest: {listing.harvestDate || "Not specified"}</span><span>Min. order {listing.minOrder || 1} {listing.unit}</span></div>
              <div className="product-actions">
                <button type="button" className="primary-btn small" disabled={listing.status !== "Active"} onClick={() => buyListing(listing)}>Buy · ₹{(Number(listing.minOrder || 1) * Number(listing.price)).toLocaleString("en-IN")}</button>
                <button type="button" className="secondary-btn small" onClick={() => setToast(`Contact ${listing.seller}: ${listing.contact || "Contact details shared after order"}`)}>Contact Seller</button>
              </div>
            </div>
          </article>)}
        </div>
        {filteredListings.length === 0 && <div className="empty-state">No farm produce matches your search.</div>}
      </section>

      <section className="panel" id="my-listings">
        <div className="section-header">
          <div><p className="eyebrow">Farmer workspace</p><h2>My Farm Listings</h2></div>
          <button type="button" className="primary-btn" onClick={() => { resetForm(); setShowForm((current) => !current); }}>Create Listing</button>
        </div>
        {showForm && <form className="listing-form" onSubmit={handleSubmit}>
          <label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Fresh Tomato" /></label>
          <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{produceCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Crop variety<input value={form.variety} onChange={(event) => setForm({ ...form, variety: event.target.value })} placeholder="Variety" /></label>
          <label>Quantity<input required min="0.1" step="0.1" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label>
          <label>Unit<select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>{["kg", "quintal", "tonne", "piece", "dozen", "bag"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Price per unit (₹)<input required min="1" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
          <label>Minimum order<input required min="1" type="number" value={form.minOrder} onChange={(event) => setForm({ ...form, minOrder: event.target.value })} /></label>
          <label>Quality / Grade<select value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })}>{["A", "B", "C", "Mixed", "Organic"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Harvest date<input type="date" value={form.harvestDate} onChange={(event) => setForm({ ...form, harvestDate: event.target.value })} /></label>
          <label>Available from<input value={form.availableFrom} onChange={(event) => setForm({ ...form, availableFrom: event.target.value })} placeholder="Today" /></label>
          <label>Farm location<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Village, District" /></label>
          <label>Seller / farm name<input required value={form.seller} onChange={(event) => setForm({ ...form, seller: event.target.value })} /></label>
          <label>Contact phone<input required value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} /></label>
          <label>Product image URL<input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Optional image URL" /></label>
          <label className="field-wide">Description<textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe your produce, quality, and pickup details" /></label>
          <div className="listing-form-actions"><button type="submit" className="primary-btn">{editingId ? "Save Listing" : "Publish Listing"}</button><button type="button" className="ghost-btn" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button></div>
        </form>}
        {message && <div className="status-banner is-active"><strong>Saved</strong><span>{message}</span></div>}
        <div className="my-listing-table">
          {myListings.map((listing) => <div className="my-listing-row" key={listing.id}>
            <div><strong>{listing.name}</strong><small>{listing.quantity} {listing.unit} · ₹{listing.price}/{listing.unit} · {listing.location}</small></div>
            <span>{listing.views || 0} views</span><span>{listing.orders || 0} orders</span><span className={`status-badge ${listing.status.toLowerCase()}`}>{listing.status}</span>
            <div className="inline-actions">
              <button type="button" className="text-btn" onClick={() => editListing(listing)}>Edit</button>
              <button type="button" className="text-btn" onClick={() => updateListing(listing.id, { status: listing.status === "Paused" ? "Active" : "Paused" })}>{listing.status === "Paused" ? "Resume" : "Pause"}</button>
              <button type="button" className="text-btn" onClick={() => updateListing(listing.id, { status: "Sold" })}>Mark Sold</button>
              <button type="button" className="text-btn danger" onClick={() => deleteListing(listing.id)}>Delete</button>
            </div>
          </div>)}
          {myListings.length === 0 && <div className="empty-state">Your listings will appear here after you publish a farm product.</div>}
        </div>
      </section>

      <section className="panel" id="my-orders">
        <div className="section-header"><div><p className="eyebrow">Marketplace activity</p><h2>My Orders</h2></div><button type="button" className="ghost-btn" onClick={() => window.location.assign("/delivery")}>Track in Delivery <Truck size={16} /></button></div>
        <div className="tab-row">{["Fresh From Farmers", "My Orders"].map((tab) => <button type="button" key={tab} className={activeTab === tab ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab(tab)}>{tab === "Fresh From Farmers" ? "Browse Produce" : `My Orders (${myOrders.length})`}</button>)}</div>
        {activeTab === "My Orders" && <div className="order-list">
          {myOrders.map((order) => <article className="order-card" key={order.id}><div className="order-heading"><strong>{order.id}</strong><span className="status-badge">{order.status}</span></div><div className="order-main"><ShoppingBasket size={20} /><div><strong>{order.product}</strong><p>{order.quantity} · {order.seller || "Local seller"}</p></div><strong className="order-price">{order.price}</strong></div></article>)}
          {myOrders.length === 0 && <div className="empty-state">Demo purchases and orders will appear here.</div>}
        </div>}
        {activeTab === "Fresh From Farmers" && <p className="marketplace-hint">Publish a listing above, or browse active produce listings in Fresh From Farmers.</p>}
      </section>

      <section className="panel"><div className="section-header"><div><p className="eyebrow">Farm inputs</p><h2>Agricultural Supplies</h2></div><a className="primary-btn" href="/products">Browse supplies</a></div><p>Seeds, soil care, crop protection, irrigation, tools, equipment, harvest and storage supplies are available in the marketplace catalog.</p></section>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default Market;