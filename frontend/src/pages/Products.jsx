import { useEffect, useMemo, useState } from "react";
import { Heart, Search, ShoppingCart, Star, Trash2, X } from "lucide-react";
import { productCategories, products as productCatalog } from "../data/products";

const fallbackImage = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80";

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

function Products() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All supplies");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [cart, setCart] = useState(() => readStorage("smartagri-cart", []));
  const [wishlist, setWishlist] = useState(() => readStorage("smartagri-wishlist", []));
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState("");
  const [role, setRole] = useState(() => readStorage("smartagri-role", "Farmer"));
  const [toast, setToast] = useState("");
  const [checkout, setCheckout] = useState({ name: "", phone: "", address: "", village: "", district: "", state: "Maharashtra", pincode: "", payment: "Cash on Delivery" });

  useEffect(() => {
    localStorage.setItem("smartagri-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("smartagri-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("smartagri-role", JSON.stringify(role));
  }, [role]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const visibleProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return productCatalog
      .filter((product) => {
        const searchable = `${product.name} ${product.category} ${product.crop} ${product.variety} ${product.seller} ${product.location} ${product.description}`.toLowerCase();
        const matchesQuery = !search || searchable.includes(search);
        const matchesCategory = category === "All supplies" || product.category === category;
        const matchesPrice = priceRange === "all"
          || (priceRange === "under-500" && product.price < 500)
          || (priceRange === "500-2000" && product.price >= 500 && product.price <= 2000)
          || (priceRange === "over-2000" && product.price > 2000);
        return matchesQuery && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "low-high") return a.price - b.price;
        if (sortBy === "high-low") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return b.stock - a.stock;
      });
  }, [category, priceRange, query, sortBy]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    setToast(`${product.name} added to cart`);
  };

  const buyNow = (product) => {
    addToCart(product);
    setShowCheckout(true);
    setSelectedProduct(null);
    setOrderConfirmation("");
  };

  const updateQuantity = (id, delta) => {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
      .filter((item) => item.quantity > 0));
  };

  const toggleWishlist = (product) => {
    setWishlist((current) => current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id]);
    setToast(wishlist.includes(product.id) ? "Removed from wishlist" : "Saved to wishlist");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 49 : 0;
  const total = subtotal + delivery;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = (event) => {
    event.preventDefault();
    const orderId = `AGR${Date.now().toString().slice(-6)}`;
    const order = {
      id: orderId,
      type: "Buying",
      product: cart.map((item) => item.name).join(", "),
      items: cart.map((item) => ({ ...item })),
      quantity: `${cartCount} item${cartCount === 1 ? "" : "s"}`,
      price: `₹${total}`,
      amount: total,
      status: "Order Confirmed",
      date: new Date().toLocaleDateString("en-IN"),
      createdAt: new Date().toISOString(),
      buyer: checkout.name,
      seller: cart.map((item) => item.seller).join(", "),
      address: `${checkout.address}, ${checkout.village}, ${checkout.district}, ${checkout.state} ${checkout.pincode}`,
      phone: checkout.phone,
      payment: checkout.payment,
      eta: "2-5 business days",
      driver: "To be assigned",
      timeline: ["Order Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"],
    };
    const previousOrders = readStorage("smartagri-orders", []);
    localStorage.setItem("smartagri-orders", JSON.stringify([order, ...previousOrders]));
    setCart([]);
    setShowCheckout(false);
    setOrderConfirmation(`Order placed successfully. Order #${orderId}`);
  };

  return (
    <div className="page-shell marketplace-page">
      <div className="page-hero">
        <div>
          <div className="page-badge"><ShoppingCart size={17} /> Agri Marketplace</div>
          <h1>Agri Marketplace</h1>
          <p>Everything you need for farming in one place.</p>
          <div className="role-switcher" role="group" aria-label="Marketplace role">
            <span>I am a</span>
            {["Farmer", "Buyer"].map((option) => (
              <button type="button" key={option} className={role === option ? "role-option active" : "role-option"} onClick={() => setRole(option)}>{option}</button>
            ))}
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80" alt="Agricultural supplies and produce" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
      </div>

      {orderConfirmation && <div className="status-banner is-active"><strong>Order placed</strong><span>{orderConfirmation}</span></div>}

      <div className="marketplace-shortcuts">
        <a href="/market#fresh-from-farmers">Fresh From Farmers</a>
        <a href="/market#my-listings">Sell Farm Produce</a>
        <a href="/delivery">My Orders</a>
        <button type="button" onClick={() => document.getElementById("marketplace-cart")?.scrollIntoView({ behavior: "smooth" })}>Cart ({cartCount})</button>
      </div>

      <div className="store-layout">
        <section className="panel product-panel">
          <div className="section-header marketplace-toolbar">
            <div>
              <p className="eyebrow">Buy for farming</p>
              <h2>Supplies for your next season</h2>
            </div>
            <div className="marketplace-filters">
              <div className="search-panel">
                <Search size={16} />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search seeds, fertilizer, tools..." aria-label="Search marketplace supplies" />
              </div>
              <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} aria-label="Filter by price">
                <option value="all">Any price</option>
                <option value="under-500">Under ₹500</option>
                <option value="500-2000">₹500 to ₹2,000</option>
                <option value="over-2000">Over ₹2,000</option>
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort products">
                <option value="popular">Popular</option>
                <option value="low-high">Price: low to high</option>
                <option value="high-low">Price: high to low</option>
                <option value="rating">Highest rated</option>
              </select>
            </div>
          </div>

          <div className="market-category-grid">
            {productCategories.map((item) => (
              <button type="button" key={item} className={category === item ? "market-category active" : "market-category"} onClick={() => setCategory(item)}>
                <span>{item === "All supplies" ? "All" : item}</span>
                <small>{item === "All supplies" ? productCatalog.length : productCatalog.filter((product) => product.category === item).length} items</small>
              </button>
            ))}
          </div>

          <div className="product-grid marketplace-product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="market-product-image">
                  <img src={product.image} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
                  <button type="button" className={wishlist.includes(product.id) ? "wishlist-button saved" : "wishlist-button"} aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWishlist(product)}>
                    <Heart size={17} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="product-body">
                  <span className="tag">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="product-variety">{product.crop} · {product.variety} · {product.unit}</p>
                  <div className="rating-line"><Star size={14} fill="#f4b942" color="#f4b942" /><span>{product.rating}</span><span>·</span><span>{product.stock} available</span></div>
                  <p className="seller-line">{product.seller} <span>· {product.location}</span></p>
                  <div className="price-row"><strong>₹{product.price}</strong><small>per {product.unit}</small></div>
                  <div className="product-actions">
                    <button type="button" className="primary-btn small" onClick={() => addToCart(product)}>Add to Cart</button>
                    <button type="button" className="secondary-btn small" onClick={() => buyNow(product)}>Buy Now</button>
                  </div>
                  <button type="button" className="text-btn product-detail-link" onClick={() => setSelectedProduct(product)}>View Details</button>
                </div>
              </article>
            ))}
          </div>
          {visibleProducts.length === 0 && <div className="empty-state">No supplies match these filters. Try another search or category.</div>}
          <p className="safety-note">For fertilizers and crop-protection products, follow product-label instructions and local agricultural guidance.</p>
        </section>

        <aside className="panel cart-panel" id="marketplace-cart">
          <div className="section-header">
            <div><p className="eyebrow">Cart</p><h2>Your basket</h2></div>
            <span className="pill">{cartCount} items</span>
          </div>
          {cart.length ? <>
            <div className="cart-list">
              {cart.map((item) => <div className="cart-item" key={item.id}>
                <div className="cart-item-copy"><strong>{item.name}</strong><small>{item.seller} · ₹{item.price} / {item.unit}</small></div>
                <div className="quantity-controls">
                  <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <button type="button" className="icon-button-small danger" onClick={() => updateQuantity(item.id, -item.quantity)} aria-label={`Remove ${item.name}`}><Trash2 size={14} /></button>
              </div>)}
            </div>
            <div className="totals-box">
              <div><span>Subtotal</span><strong>₹{subtotal}</strong></div>
              <div><span>Demo delivery</span><strong>₹{delivery}</strong></div>
              <div className="total-row"><span>Total</span><strong>₹{total}</strong></div>
            </div>
            <button type="button" className="primary-btn full" onClick={() => { setShowCheckout(true); setOrderConfirmation(""); }}>Proceed to Checkout</button>
          </> : <div className="empty-state">Your cart is empty. Add farm supplies to begin.</div>}
        </aside>
      </div>

      {selectedProduct && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
        <section className="market-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
          <button type="button" className="modal-close" aria-label="Close product details" onClick={() => setSelectedProduct(null)}><X size={20} /></button>
          <div className="product-detail">
            <img src={selectedProduct.image} alt={selectedProduct.name} onError={(event) => { event.currentTarget.src = fallbackImage; }} />
            <div>
              <p className="eyebrow">{selectedProduct.category}</p>
              <h2 id="product-detail-title">{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <div className="detail-row"><span>Variety / specification</span><strong>{selectedProduct.variety}</strong></div>
              <div className="detail-row"><span>Pack</span><strong>{selectedProduct.unit}</strong></div>
              <div className="detail-row"><span>Seller and location</span><strong>{selectedProduct.seller}, {selectedProduct.location}</strong></div>
              <div className="detail-row"><span>Availability</span><strong>{selectedProduct.stock} in stock</strong></div>
              <div className="detail-row"><span>Rating</span><strong>{selectedProduct.rating} / 5</strong></div>
              <div className="modal-actions"><button type="button" className="primary-btn" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>Add to Cart · ₹{selectedProduct.price}</button><button type="button" className="secondary-btn" onClick={() => buyNow(selectedProduct)}>Buy Now</button></div>
            </div>
          </div>
        </section>
      </div>}

      {showCheckout && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCheckout(false); }}>
        <section className="market-modal checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <button type="button" className="modal-close" aria-label="Close checkout" onClick={() => setShowCheckout(false)}><X size={20} /></button>
          <p className="eyebrow">Demo checkout</p>
          <h2 id="checkout-title">Delivery details</h2>
          <p className="demo-disclaimer">Prototype order only. No payment will be processed.</p>
          <form className="checkout-form" onSubmit={placeOrder}>
            <div className="field-grid">
              <label>Name<input required value={checkout.name} onChange={(event) => setCheckout({ ...checkout, name: event.target.value })} /></label>
              <label>Phone<input required pattern="[0-9+()\x2d ]{7,18}" value={checkout.phone} onChange={(event) => setCheckout({ ...checkout, phone: event.target.value })} /></label>
              <label className="field-wide">Address<input required value={checkout.address} onChange={(event) => setCheckout({ ...checkout, address: event.target.value })} /></label>
              <label>Village / Town<input required value={checkout.village} onChange={(event) => setCheckout({ ...checkout, village: event.target.value })} /></label>
              <label>District<input required value={checkout.district} onChange={(event) => setCheckout({ ...checkout, district: event.target.value })} /></label>
              <label>State<input required value={checkout.state} onChange={(event) => setCheckout({ ...checkout, state: event.target.value })} /></label>
              <label>Pincode<input required inputMode="numeric" pattern="[0-9]{6}" value={checkout.pincode} onChange={(event) => setCheckout({ ...checkout, pincode: event.target.value })} /></label>
            </div>
            <label>Payment option<select value={checkout.payment} onChange={(event) => setCheckout({ ...checkout, payment: event.target.value })}><option>Cash on Delivery</option><option>Demo Online Payment</option></select></label>
            <div className="checkout-summary"><span>{cartCount} items · Subtotal ₹{subtotal} · Delivery ₹{delivery}</span><strong>₹{total}</strong></div>
            <button type="submit" className="primary-btn full" disabled={!cart.length}>Place Demo Order</button>
          </form>
        </section>
      </div>}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default Products;