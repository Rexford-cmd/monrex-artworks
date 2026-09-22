const DELIVERY_RATES = {
  "Greater Accra": {
    "Ashaiman / Tema Community": 10,
    "Tema (Main Town)": 15,
    "Accra Central / Osu / Cantonments": 25,
    "East Legon / Airport / Adjiringanor": 25,
    "Madina / Adenta / Abokobi": 25,
    "Spintex / Teshie / Nungua": 22,
    "Dansoman / Kaneshie / Odorkor": 28,
    "Kasoa / Weija / Bortianor": 35,
    "Dodowa / Prampram / Ningo": 30
  },
  "Ashanti": {
    "Kumasi (Central / Bantama / Adum / Kejetia)": 40,
    "Obuasi / Konongo": 50,
    "Ejisu / Bekwai": 45,
    "Mampong / Nsuta": 50,
    "Offinso / Agogo": 50
  },
  "Central": {
    "Cape Coast / Elmina": 40,
    "Winneba / Apam": 35,
    "Kasoa / Awutu": 35,
    "Mankessim / Saltpond": 40,
    "Swedru / Agona": 42
  },
  "Western": {
    "Takoradi / Sekondi": 45,
    "Tarkwa / Prestea / Huni Valley": 55,
    "Axim / Half Assini": 60,
    "Sefwi Wiawso / Bibiani": 55
  },
  "Eastern": {
    "Koforidua / New Juaben": 35,
    "Nsawam / Suhum": 30,
    "Nkawkaw / Mpraeso": 40,
    "Akosombo / Akuse": 35,
    "Oda / Akim": 42,
    "Aburi / Mampong": 28
  },
  "Volta": {
    "Ho / Sokode": 45,
    "Aflao / Denu": 50,
    "Keta / Anloga": 50,
    "Hohoe / Kpando": 55,
    "Jasikan / Buem": 55
  },
  "Oti": {
    "Dambai / Nkwanta": 60,
    "Jasikan / Kadjebi": 58
  },
  "Northern": {
    "Tamale (Central / Education Ridge)": 60,
    "Yendi / Savelugu": 65,
    "Walewale / Nalerigu": 70,
    "Damongo / Salaga": 68
  },
  "Savannah": {
    "Damongo / Salaga": 68,
    "Bole / Sawla": 70
  },
  "North East": {
    "Nalerigu / Walewale": 70,
    "Chereponi / Gambaga": 72
  },
  "Upper East": {
    "Bolgatanga / Bongo": 70,
    "Navrongo / Paga": 72,
    "Bawku / Zebilla": 75,
    "Zuarungu": 72
  },
  "Upper West": {
    "Wa / Nandom": 75,
    "Tumu / Lawra": 78,
    "Jirapa / Nadowli": 76
  },
  "Bono": {
    "Sunyani / Fiapre": 50,
    "Berekum / Dormaa": 52,
    "Techiman / Wenchi": 48
  },
  "Bono East": {
    "Techiman / Kintampo": 48,
    "Nkoranza / Yeji": 50,
    "Atebubu / Prang": 52
  },
  "Ahafo": {
    "Goaso / Mim": 52,
    "Bechem / Duayaw Nkwanta": 50
  }
};

let allProducts = [], categories = [], storeSettings = {};
let cart = JSON.parse(localStorage.getItem('monrex_cart')) || [];
let selectedDeliveryFee = 0, selectedPayment = 'MoMo', paystackKey = '';

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  await loadCategories();
  await fetchProducts();
  initRegionDropdown();
  updateCartBadge();
  loadPaystackKey();
});

async function loadSettings() {
  try {
    const r = await fetch('/api/settings');
    const d = await r.json();
    if (d.success) {
      storeSettings = d.settings;
      document.getElementById('announcementBar').textContent = storeSettings.announcement || '';
      document.getElementById('heroTitle').textContent = storeSettings.hero_title || '';
      document.getElementById('heroSubtitle').textContent = storeSettings.hero_subtitle || '';
      document.getElementById('aboutText').textContent = storeSettings.about_text || '';
      document.getElementById('infoLocation').innerHTML = storeSettings.location || '';
      document.getElementById('infoPhone').innerHTML = `Phone/WhatsApp: <strong>${storeSettings.phone || ''}</strong>`;
      document.getElementById('infoEmail').innerHTML = `Email: <strong>${storeSettings.email || ''}</strong>`;
      document.getElementById('momoNumber').textContent = storeSettings.momo_number || '';
      document.getElementById('momoName').textContent = storeSettings.momo_name || '';
    }
  } catch(e) {}
}

async function loadCategories() {
  try {
    const r = await fetch('/api/categories');
    const d = await r.json();
    if (d.success) {
      categories = d.categories;
      const filters = document.getElementById('categoryFilters');
      filters.innerHTML = `<button class="filter-btn active" onclick="filterCategory('All',this)">All Items</button>` +
        categories.map(c => `<button class="filter-btn" onclick="filterCategory('${c.name}',this)">${c.icon} ${c.name}</button>`).join('');
    }
  } catch(e) {}
}

async function loadPaystackKey() {
  try {
    const r = await fetch('/api/paystack/key');
    const d = await r.json();
    paystackKey = d.key;
  } catch(e) {}
}

async function fetchProducts() {
  try {
    const r = await fetch('/api/products');
    const d = await r.json();
    if (d.success) { allProducts = d.products; renderProducts(allProducts); }
  } catch(e) {}
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!products.length) { grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:#777">No products found.</p>'; return; }
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.image_url || 'https://via.placeholder.com/300x210?text=MonRex'}" class="product-image" alt="${p.name}">
      <div class="product-info">
        <div>
          <span class="product-category">${p.category}</span>
          <h4 class="product-title">${p.name}</h4>
          <p class="product-desc">${p.description || ''}</p>
        </div>
        <div>
          <div class="product-price">GH₵ ${Number(p.price).toFixed(2)}</div>
          ${p.in_stock ? `<button class="btn-primary" style="width:100%" onclick="addToCart('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price})">Add to Order</button>` : `<button class="btn-secondary" style="width:100%" disabled>Out of Stock</button>`}
        </div>
      </div>
    </div>`).join('');
}

function filterCategory(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat === 'All' ? allProducts : allProducts.filter(p => p.category === cat));
}

function showSection(id) {
  ['homeSection','aboutSection','trackSection','checkoutSection'].forEach(s => {
    const el = document.getElementById(s); if (el) el.style.display = 'none';
  });
  if (id === 'home' || id === 'products') {
    document.getElementById('homeSection').style.display = 'block';
    if (id === 'products') document.getElementById('productsSection').scrollIntoView({behavior:'smooth'});
  }
  if (id === 'about') document.getElementById('aboutSection').style.display = 'block';
  if (id === 'track') document.getElementById('trackSection').style.display = 'block';
  if (id === 'checkout') { document.getElementById('checkoutSection').style.display = 'block'; renderCheckoutCart(); }
}

function addToCart(id, name, price) {
  const ex = cart.find(i => i.id === id);
  if (ex) ex.quantity++; else cart.push({id, name, price, quantity:1});
  localStorage.setItem('monrex_cart', JSON.stringify(cart));
  updateCartBadge();
  alert(`Added "${name}"!`);
}

function updateCartBadge() {
  const c = document.getElementById('cartCount');
  if (c) c.textContent = cart.reduce((s,i) => s + i.quantity, 0);
}

function renderCheckoutCart() {
  const list = document.getElementById('cartItemsList');
  if (!cart.length) { list.innerHTML = '<p style="color:#888">Cart is empty.</p>'; updateTotals(); return; }
  list.innerHTML = cart.map((item, idx) => `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;background:#222;padding:8px;border-radius:6px">
      <div><strong>${item.name}</strong><br><small style="color:#aaa">GH₵ ${Number(item.price).toFixed(2)} x ${item.quantity}</small></div>
      <div>
        <button onclick="changeQty(${idx},1)" style="padding:2px 7px;background:#333;color:#fff;border:none;cursor:pointer">+</button>
        <button onclick="changeQty(${idx},-1)" style="padding:2px 7px;background:#333;color:#fff;border:none;cursor:pointer">-</button>
      </div>
    </div>`).join('');
  updateTotals();
}

function changeQty(idx, d) {
  cart[idx].quantity += d;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  localStorage.setItem('monrex_cart', JSON.stringify(cart));
  updateCartBadge(); renderCheckoutCart();
}

function initRegionDropdown() {
  const rs = document.getElementById('regionSelect'), ts = document.getElementById('townSelect');
  if (!rs) return;
  rs.innerHTML = '<option value="">-- Choose Region --</option>';
  Object.keys(DELIVERY_RATES).forEach(r => { const o = document.createElement('option'); o.value = r; o.textContent = r; rs.appendChild(o); });
  rs.addEventListener('change', e => {
    const region = e.target.value;
    ts.innerHTML = '<option value="">-- Choose Town --</option>';
    selectedDeliveryFee = 0; updateTotals();
    if (!region) { ts.disabled = true; return; }
    Object.entries(DELIVERY_RATES[region]).forEach(([town, fee]) => {
      const o = document.createElement('option'); o.value = town; o.textContent = `${town} - GH₵${fee.toFixed(2)}`; ts.appendChild(o);
    });
    ts.disabled = false;
  });
  ts.addEventListener('change', e => {
    const r = rs.value, t = e.target.value;
    selectedDeliveryFee = (r && t) ? (DELIVERY_RATES[r][t] || 0) : 0; updateTotals();
  });
}

function getSubtotal() { return cart.reduce((s,i) => s + i.price * i.quantity, 0); }

function updateTotals() {
  const sub = getSubtotal(), total = sub + selectedDeliveryFee;
  const s = document.getElementById('subtotalDisplay'), d = document.getElementById('deliveryFeeDisplay'), t = document.getElementById('totalDisplay');
  if (s) s.textContent = `GH₵ ${sub.toFixed(2)}`;
  if (d) d.textContent = `GH₵ ${selectedDeliveryFee.toFixed(2)}`;
  if (t) t.textContent = `GH₵ ${total.toFixed(2)}`;
}

function selectPayment(method, el) {
  selectedPayment = method;
  document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('momoDetails').style.display = method === 'MoMo' ? 'block' : 'none';
  document.getElementById('paystackDetails').style.display = method === 'Paystack' ? 'block' : 'none';
  document.getElementById('checkoutBtn').textContent = method === 'Paystack' ? 'Pay with Paystack' : 'Confirm & Send via WhatsApp';
}

async function handlePlaceOrder(event) {
  event.preventDefault();
  
  if (!cart.length) {
    alert("Your cart is empty. Please add an item first.");
    return;
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const region = document.getElementById('regionSelect').value;
  const town = document.getElementById('townSelect').value;
  const payMethod = document.querySelector('input[name="payMethod"]:checked').value;

  if (!name || !phone || !email) {
    alert("Please fill in your Name, Phone number, and Email.");
    return;
  }

  if (!region || !town) {
    alert("Please select your Delivery Region and Town.");
    return;
  }

  const subtotal = Number(getSubtotal());
  const deliveryFee = Number(selectedDeliveryFee);
  const total = Number((subtotal + deliveryFee).toFixed(2));

  if (isNaN(total) || total <= 0) {
    alert("Invalid order amount. Please check your cart items.");
    return;
  }

  // ===== OPTION A: PAYSTACK PAYMENT =====
  if (payMethod === 'paystack') {
    if (!paystackPublicKey || paystackPublicKey.trim() === '') {
      alert("⚠️ Paystack Public Key is not configured yet!\n\nPlease set your Paystack Public Key in Admin -> Store Settings, or choose 'Direct MoMo' to complete your order.");
      return;
    }

    if (typeof PaystackPop === 'undefined') {
      alert("⚠️ Paystack script could not be loaded. Please check your internet connection or disable ad-blockers, then refresh.");
      return;
    }

    try {
      const handler = PaystackPop.setup({
        key: paystackPublicKey.trim(),
        email: email,
        amount: Math.round(total * 100), // Amount in Ghana pesewas
        currency: 'GHS',
        ref: 'MRX-' + Date.now(),
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: name },
            { display_name: "Phone Number", variable_name: "phone_number", value: phone },
            { display_name: "Delivery Location", variable_name: "delivery_location", value: `${town}, ${region}` }
          ]
        },
        callback: async function (response) {
          // Payment successful on Paystack's end
          alert("Payment received! Finalizing your order...");
          await saveOrder(name, phone, email, region, town, total, 'Paystack', response.reference);
        },
        onClose: function () {
          alert("Payment window closed. Order was not charged.");
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error("Paystack Error:", err);
      alert("Error opening Paystack popup: " + err.message);
    }
    return;
  }

  // ===== OPTION B: DIRECT MOMO (WHATSAPP) =====
  await saveOrder(name, phone, email, region, town, total, 'Direct MoMo', '');
  const itemsText = cart.map(i => `• ${i.name} (x${i.quantity}) - GH₵${(i.price * i.quantity).toFixed(2)}`).join('\n');
  const wa = encodeURIComponent(
    `Hello MonRex Artworks! 🎨\nI want to confirm my order:\n\n` +
    `*Name:* ${name}\n` +
    `*Phone:* ${phone}\n` +
    `*Delivery Location:* ${town}, ${region}\n\n` +
    `*Items:*\n${itemsText}\n\n` +
    `*Subtotal:* GH₵${subtotal.toFixed(2)}\n` +
    `*Delivery Fee:* GH₵${deliveryFee.toFixed(2)}\n` +
    `*Total:* GH₵${total.toFixed(2)}\n\n` +
    `*Payment Method:* Direct MoMo (0507482090)`
  );
  cart = [];
  localStorage.removeItem('monrex_cart');
  updateCartBadge();
  window.location.href = `https://wa.me/233507482090?text=${wa}`;
}}

async function saveOrder(customerName, phone, region, town, grandTotal, paymentMethod, paystackRef) {
  const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ customerName, phone, region, town, deliveryFee: selectedDeliveryFee, items: cart, totalAmount: grandTotal, paymentMethod, paystackRef })
  });
  return await res.json();
}

async function trackOrder() {
  const q = document.getElementById('trackInput').value.trim();
  const div = document.getElementById('trackResult');
  if (!q) return alert('Enter order code or phone.');
  div.innerHTML = '<p style="color:#aaa">Searching...</p>';
  try {
    const r = await fetch(`/api/orders/track/${encodeURIComponent(q)}`);
    const d = await r.json();
    if (!d.success) { div.innerHTML = `<p style="color:var(--red)">${d.message}</p>`; return; }
    div.innerHTML = d.orders.map(o => {
      const sc = o.status.toLowerCase();
      const cls = sc.includes('delivered') ? 'status-delivered' : sc.includes('delivery') ? 'status-delivery' : sc.includes('production') ? 'status-production' : 'status-pending';
      return `<div style="background:#222;padding:14px;border-radius:8px;margin-bottom:10px;border-left:4px solid var(--red)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h4>Order #${o.order_code}</h4><span class="status-badge ${cls}">${o.status}</span>
        </div>
        <p style="font-size:.85rem;color:#aaa;margin-top:4px">${o.town}, ${o.region} | Payment: ${o.payment_status}</p>
        <p style="margin-top:6px">Total: <strong>GH₵ ${Number(o.total_amount).toFixed(2)}</strong></p>
      </div>`;
    }).join('');
  } catch(e) { div.innerHTML = '<p style="color:var(--red)">Error. Try again.</p>'; }
}
