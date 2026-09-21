const DELIVERY_RATES = {
  "Greater Accra": {
    "Ashaiman (Studio Pickup)": 0.00,
    "Ashaiman (Doorstep Delivery)": 15.00,
    "Tema": 20.00,
    "Accra Central": 25.00,
    "East Legon / Adjiringanor": 25.00,
    "Madina / Adenta": 25.00,
    "Spintex / Teshie": 22.00,
    "Dansoman / Kaneshie": 30.00,
    "Kasoa": 35.00
  },
  "Ashanti": {
    "Kumasi Central": 40.00,
    "Obuasi": 50.00,
    "Ejisu": 45.00
  },
  "Western": {
    "Takoradi": 45.00,
    "Sekondi": 45.00,
    "Tarkwa": 55.00
  },
  "Central": {
    "Cape Coast": 40.00,
    "Winneba": 35.00
  },
  "Eastern": {
    "Koforidua": 35.00,
    "Akosombo": 35.00
  },
  "Volta": {
    "Ho": 45.00,
    "Aflao": 50.00
  },
  "Northern / Upcountry": {
    "Tamale": 65.00,
    "Sunyani": 50.00,
    "Bolgatanga": 70.00,
    "Wa": 70.00
  }
};

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('monrex_cart')) || [];
let selectedDeliveryFee = 0;

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  initRegionDropdown();
  updateCartBadge();
});

// Section Switcher
function showSection(sectionId) {
  ['homeSection', 'aboutSection', 'trackSection', 'checkoutSection'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (sectionId === 'home') document.getElementById('homeSection').style.display = 'block';
  if (sectionId === 'products') {
    document.getElementById('homeSection').style.display = 'block';
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
  }
  if (sectionId === 'about') document.getElementById('aboutSection').style.display = 'block';
  if (sectionId === 'track') document.getElementById('trackSection').style.display = 'block';
  if (sectionId === 'checkout') {
    document.getElementById('checkoutSection').style.display = 'block';
    renderCheckoutCart();
  }
}

// Fetch products from Neon DB
async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      allProducts = data.products;
      renderProducts(allProducts);
    }
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:#777;">No products in this category.</p>';
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.image_url || 'https://via.placeholder.com/300x220?text=MonRex+Art'}" class="product-image" alt="${p.name}">
      <div class="product-info">
        <div>
          <span class="product-category">${p.category}</span>
          <h4 class="product-title">${p.name}</h4>
          <p class="product-desc">${p.description || ''}</p>
        </div>
        <div>
          <div class="product-price">GH₵ ${Number(p.price).toFixed(2)}</div>
          ${p.in_stock ? `
            <button class="btn-primary" style="width: 100%;" onclick="addToCart('${p.id}', '${p.name.replace(/'/g, "\\'")}', ${p.price})">
              Add to Order
            </button>
          ` : `
            <button class="btn-secondary" style="width: 100%; cursor: not-allowed;" disabled>Out of Stock</button>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

function filterCategory(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (cat === 'All') {
    renderProducts(allProducts);
  } else {
    renderProducts(allProducts.filter(p => p.category === cat));
  }
}

// Cart System
function addToCart(id, name, price) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  localStorage.setItem('monrex_cart', JSON.stringify(cart));
  updateCartBadge();
  alert(`Added "${name}" to your order!`);
}

function updateCartBadge() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = count;
}

function renderCheckoutCart() {
  const list = document.getElementById('cartItemsList');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = '<p style="color:#888;">Your cart is empty. Click "Add to Order" on products.</p>';
    updateTotals();
    return;
  }

  list.innerHTML = cart.map((item, idx) => `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:#222; padding:10px; border-radius:6px;">
      <div>
        <strong>${item.name}</strong><br>
        <small style="color:#aaa;">GH₵ ${Number(item.price).toFixed(2)} x ${item.quantity}</small>
      </div>
      <div>
        <button onclick="changeQty(${idx}, 1)" style="padding:2px 8px; background:#333; color:#fff; border:none; cursor:pointer;">+</button>
        <button onclick="changeQty(${idx}, -1)" style="padding:2px 8px; background:#333; color:#fff; border:none; cursor:pointer;">-</button>
      </div>
    </div>
  `).join('');

  updateTotals();
}

function changeQty(idx, delta) {
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  localStorage.setItem('monrex_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCheckoutCart();
}

function initRegionDropdown() {
  const regionSelect = document.getElementById("regionSelect");
  const townSelect = document.getElementById("townSelect");
  if (!regionSelect) return;

  regionSelect.innerHTML = '<option value="">-- Choose Delivery Region --</option>';
  Object.keys(DELIVERY_RATES).forEach(reg => {
    const opt = document.createElement("option");
    opt.value = reg;
    opt.textContent = reg;
    regionSelect.appendChild(opt);
  });

  regionSelect.addEventListener("change", (e) => {
    const region = e.target.value;
    townSelect.innerHTML = '<option value="">-- Choose Town / Area --</option>';
    selectedDeliveryFee = 0;
    updateTotals();

    if (!region) {
      townSelect.disabled = true;
      return;
    }

    const towns = DELIVERY_RATES[region];
    Object.keys(towns).forEach(town => {
      const opt = document.createElement("option");
      opt.value = town;
      opt.textContent = `${town} - GH₵${towns[town].toFixed(2)}`;
      townSelect.appendChild(opt);
    });

    townSelect.disabled = false;
  });

  townSelect.addEventListener("change", (e) => {
    const reg = regionSelect.value;
    const town = e.target.value;
    selectedDeliveryFee = (reg && town) ? (DELIVERY_RATES[reg][town] || 0) : 0;
    updateTotals();
  });
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateTotals() {
  const subtotal = getSubtotal();
  const total = subtotal + selectedDeliveryFee;

  const subElem = document.getElementById("subtotalDisplay");
  const delElem = document.getElementById("deliveryFeeDisplay");
  const totElem = document.getElementById("totalDisplay");

  if (subElem) subElem.textContent = `GH₵ ${subtotal.toFixed(2)}`;
  if (delElem) delElem.textContent = `GH₵ ${selectedDeliveryFee.toFixed(2)}`;
  if (totElem) totElem.textContent = `GH₵ ${total.toFixed(2)}`;
}

async function handlePlaceOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const customerName = document.getElementById("customerName").value;
  const phone = document.getElementById("customerPhone").value;
  const region = document.getElementById("regionSelect").value;
  const town = document.getElementById("townSelect").value;

  if (!region || !town) {
    alert("Please select your delivery region and town.");
    return;
  }

  const subtotal = getSubtotal();
  const grandTotal = subtotal + selectedDeliveryFee;

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phone,
        region,
        town,
        deliveryFee: selectedDeliveryFee,
        items: cart,
        totalAmount: grandTotal,
        paymentMethod: "MoMo"
      })
    });

    const data = await res.json();
    const orderCode = data.order ? data.order.order_code : 'MRX-' + Date.now();

    const itemsText = cart.map(i => `• ${i.name} (x${i.quantity})`).join('\n');
    const waText = encodeURIComponent(
      `Hello MonRex Artworks! 🎨\nI placed order *#${orderCode}*:\n\n` +
      `*Name:* ${customerName}\n` +
      `*Phone:* ${phone}\n` +
      `*Delivery:* ${town}, ${region}\n\n` +
      `*Items:*\n${itemsText}\n\n` +
      `*Delivery Fee:* GH₵${selectedDeliveryFee.toFixed(2)}\n` +
      `*Total:* GH₵${grandTotal.toFixed(2)}\n\n` +
      `*Payment:* Direct MoMo (0507482090)`
    );

    cart = [];
    localStorage.removeItem('monrex_cart');
    updateCartBadge();

    window.location.href = `https://wa.me/233507482090?text=${waText}`;
  } catch (err) {
    alert("Error placing order. Redirecting to WhatsApp...");
    window.location.href = `https://wa.me/233507482090`;
  }
}

// Order Tracking
async function trackOrder() {
  const query = document.getElementById('trackInput').value.trim();
  const resultDiv = document.getElementById('trackResult');
  if (!query) return alert("Please enter your Order Code or Phone Number.");

  resultDiv.innerHTML = '<p style="color:#aaa;">Searching Neon database...</p>';

  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.success) {
      resultDiv.innerHTML = `<p style="color:var(--accent-red);">${data.message}</p>`;
      return;
    }

    resultDiv.innerHTML = data.orders.map(o => `
      <div style="background:#222; padding:15px; border-radius:8px; margin-bottom:12px; border-left:4px solid var(--accent-red);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4>Order #${o.order_code}</h4>
          <span class="status-badge status-${o.status.toLowerCase().includes('pending') ? 'pending' : (o.status.toLowerCase().includes('deliv') ? 'delivered' : 'production')}">
            ${o.status}
          </span>
        </div>
        <p style="font-size:0.88rem; color:#aaa; margin-top:5px;">Customer: <strong>${o.customer_name}</strong> | Location: <strong>${o.town}, ${o.region}</strong></p>
        <p style="font-size:0.95rem; margin-top:8px;">Total: <strong>GH₵ ${Number(o.total_amount).toFixed(2)}</strong></p>
      </div>
    `).join('');

  } catch (err) {
    resultDiv.innerHTML = '<p style="color:var(--accent-red);">Error tracking order. Please try again.</p>';
  }
}