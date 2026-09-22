const DELIVERY_RATES = {
  "Greater Accra": {
    "Ashaiman (Studio Pickup)": 0.00,
    "Ashaiman (Doorstep)": 15.00,
    "Tema (Comm 1-25, Kpone, Manhean)": 20.00,
    "Accra Central (Osu, Ring Road, Ridge)": 25.00,
    "East Legon / Adjiringanor / Airport": 25.00,
    "Madina / Adenta / Abokobi / Oyarifa": 25.00,
    "Spintex / Teshie / Nungua / Sakumono": 22.00,
    "Dansoman / Kaneshie / Lapaz / Achimota": 28.00,
    "Kasoa / Weija / Gbawe / Bortianor": 35.00,
    "Prampram / Dawhenya / Dodowa": 30.00
  },
  "Ashanti": {
    "Kumasi Central (Adum, Bantama, Kejetia, KNUST)": 40.00,
    "Kumasi Suburbs (Ejisu, Suame, Tafo, Kwadaso)": 42.00,
    "Obuasi / Dunkwa / Bekwai": 48.00,
    "Konongo / Juaso / Agogo": 45.00,
    "Mampong / Effiduase / Ejura": 50.00
  },
  "Western": {
    "Takoradi / Sekondi / Effia": 42.00,
    "Tarkwa / Prestea / Bogoso": 50.00,
    "Axim / Agona Nkwanta / Elubo": 55.00,
    "Shama / Ahanta / Agona": 45.00
  },
  "Central": {
    "Cape Coast / Elmina / UCC": 38.00,
    "Winneba / Senya Beraku / Gomoa": 32.00,
    "Mankessim / Saltpond / Anomabo": 38.00,
    "Agona Swedru / Nyakrom": 36.00,
    "Dunkwa-on-Offin / Twifo Praso": 48.00
  },
  "Eastern": {
    "Koforidua / New Juaben / Oyoko": 32.00,
    "Akosombo / Atimpoku / Somanya / Krobo": 30.00,
    "Nkawkaw / Mpraeso / Kwahu / Abetifi": 40.00,
    "Suhum / Nsawam / Asamankese": 30.00,
    "Akim Oda / Kade / Akwatia": 40.00
  },
  "Volta": {
    "Ho / Sokode / Adaklu": 42.00,
    "Hohoe / Kpando / Golokwati": 48.00,
    "Aflao / Denu / Keta / Anloga": 45.00,
    "Sogakope / Akatsi / Battor": 38.00
  },
  "Oti": {
    "Dambai / Nkwanta / Jasikan": 55.00,
    "Kadjebi / Kete Krachi / Nkonya": 58.00
  },
  "Northern": {
    "Tamale Central (Gumani, Lamashegu, UDS)": 60.00,
    "Savelugu / Nanton / Tolon / Kumbungu": 62.00,
    "Yendi / Gushegu / Karaga / Bimbilla": 68.00
  },
  "Savannah": {
    "Damongo / Bole / Sawla / Larabanga": 65.00,
    "Salaga / Kpembe / Buipe": 68.00
  },
  "North East": {
    "Nalerigu / Gambaga / Walewale": 68.00,
    "Bunkpurugu / Chereponi / Yunyoo": 72.00
  },
  "Upper East": {
    "Bolgatanga / Zuarungu / Bongo": 70.00,
    "Navrongo / Paga / Sirigu": 72.00,
    "Bawku / Zebilla / Garu / Pusiga": 75.00
  },
  "Upper West": {
    "Wa Central / UDS Campus": 70.00,
    "Lawra / Nandom / Jirapa / Tumu": 75.00,
    "Nadowli / Kaleo / Daffiama": 72.00
  },
  "Bono": {
    "Sunyani Central / Fiapre / Abesim": 45.00,
    "Berekum / Dormaa Ahenkro / Drobo": 50.00,
    "Wenchi / Sampa / Nsawkaw": 52.00
  },
  "Bono East": {
    "Techiman Central / Tuobodom": 45.00,
    "Kintampo / Atebubu / Prang / Yeji": 52.00,
    "Nkoranza / Kwame Danso": 50.00
  },
  "Ahafo": {
    "Goaso / Mim / Kenyasi": 50.00,
    "Bechem / Duayaw Nkwanta": 48.00
  },
  "Western North": {
    "Sefwi Wiawso / Sefwi Bekwai / Bibiani": 55.00,
    "Juaboso / Bodi / Essam / Dadieso": 58.00
  }
};

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Handmade Beaded Bag", price: 300, category: "Handmade Beaded Bags", description: "Stylish handmade beaded bag designed with detailed craftsmanship for a unique statement look.", image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", in_stock: true },
  { id: 2, name: "Premium Handmade Beaded Bag", price: 350, category: "Handmade Beaded Bags", description: "Beautiful handcrafted beaded bag combining artistic detail and contemporary style.", image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500", in_stock: true },
  { id: 3, name: "Handmade Beaded Tissue Box", price: 150, category: "Handmade Home Décor", description: "A decorative handmade beaded tissue box designed to add an elegant artistic touch.", image_url: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=500", in_stock: true },
  { id: 4, name: "Classic Beaded Bag", price: 200, category: "Handmade Beaded Bags", description: "Unique handmade beaded bags carefully crafted with attention to detail and style.", image_url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500", in_stock: true },
  { id: 5, name: "Men's Beaded Bag (Compact)", price: 150, category: "Men's Beaded Bags", description: "Sleek and masculine handmade beaded bag tailored for minimal essentials.", image_url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500", in_stock: true },
  { id: 6, name: "Men's Beaded Bag (Urban)", price: 200, category: "Men's Beaded Bags", description: "Unique handmade beaded bag crafted with bold masculine aesthetic.", image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500", in_stock: true },
  { id: 7, name: "Men's Beaded Bag (Executive)", price: 250, category: "Men's Beaded Bags", description: "Premium handcrafted beadwork bag designed for standout occasions.", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", in_stock: true }
];

let allProducts = DEFAULT_PRODUCTS;
let allCategories = ["Handmade Beaded Bags", "Men's Beaded Bags", "Handmade Home Décor"];
let cart = JSON.parse(localStorage.getItem('monrex_cart')) || [];
let selectedDeliveryFee = 0;
let paystackPublicKey = 'pk_live_78d879b3f53903de0c6288e5c1f5f2226e3c1cb4';

document.addEventListener("DOMContentLoaded", function() {
  renderCategoryFilters();
  renderProducts(allProducts);
  initRegionDropdown();
  updateCartBadge();
  loadSettings();
  loadCategories();
  fetchProducts();
});

function selectPayMethod(method) {
  document.getElementById('selectedPaymentMethod').value = method;
  document.getElementById('btnPaystack').classList.remove('active');
  document.getElementById('btnMomo').classList.remove('active');
  if (method === 'paystack') {
    document.getElementById('btnPaystack').classList.add('active');
  } else {
    document.getElementById('btnMomo').classList.add('active');
  }
}

async function loadSettings() {
  try {
    const r = await fetch('/api/settings');
    const d = await r.json();
    if (d.success && d.settings) {
      if (d.settings.announcement) document.getElementById('announcementBar').textContent = d.settings.announcement;
      if (d.settings.hero_title) document.getElementById('heroTitle').textContent = d.settings.hero_title;
      if (d.settings.hero_subtitle) document.getElementById('heroSubtitle').textContent = d.settings.hero_subtitle;
      if (d.settings.about_text) document.getElementById('aboutText').textContent = d.settings.about_text;
      if (d.settings.paystack_public_key) paystackPublicKey = d.settings.paystack_public_key;
    }
  } catch(e) {}
}

async function loadCategories() {
  try {
    const r = await fetch('/api/categories');
    const d = await r.json();
    if (d.success && d.categories.length) {
      allCategories = d.categories.map(c => c.name);
      renderCategoryFilters();
    }
  } catch(e) {}
}

function renderCategoryFilters() {
  const el = document.getElementById('categoryFilters');
  if (!el) return;
  el.innerHTML = '<button class="filter-btn active" onclick="filterCategory(\'All\',this)">All Items</button>' +
    allCategories.map(c => '<button class="filter-btn" onclick="filterCategory(\'' + c + '\',this)">' + c + '</button>').join('');
}

async function fetchProducts() {
  try {
    const r = await fetch('/api/products');
    const d = await r.json();
    if (d.success && d.products && d.products.length > 0) {
      allProducts = d.products;
      renderProducts(allProducts);
    }
  } catch(e) {}
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  if (!products || !products.length) {
    grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:#777;">No products available.</p>';
    return;
  }
  grid.innerHTML = products.map(p =>
    '<div class="product-card">' +
      '<img src="' + (p.image_url || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500') + '" class="product-image" alt="' + p.name + '">' +
      '<div class="product-info">' +
        '<div>' +
          '<span class="product-category">' + p.category + '</span>' +
          '<h4 class="product-title">' + p.name + '</h4>' +
          '<p class="product-desc">' + (p.description || '') + '</p>' +
        '</div>' +
        '<div>' +
          '<div class="product-price">GH₵ ' + Number(p.price).toFixed(2) + '</div>' +
          (p.in_stock !== false
            ? '<button class="btn-primary" style="width:100%" onclick="addToCart(\'' + p.id + '\',\'' + p.name.replace(/'/g, "\\'") + '\',' + p.price + ')">Add to Order</button>'
            : '<button class="btn-secondary" style="width:100%" disabled>Out of Stock</button>') +
        '</div>' +
      '</div>' +
    '</div>'
  ).join('');
}

function filterCategory(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat === 'All' ? allProducts : allProducts.filter(p => p.category === cat));
}

function showSection(id) {
  ['homeSection','aboutSection','trackSection','checkoutSection'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = 'none';
  });
  if (id === 'home' || id === 'products') {
    document.getElementById('homeSection').style.display = 'block';
    if (id === 'products') document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
  }
  if (id === 'about') document.getElementById('aboutSection').style.display = 'block';
  if (id === 'track') document.getElementById('trackSection').style.display = 'block';
  if (id === 'checkout') {
    document.getElementById('checkoutSection').style.display = 'block';
    renderCheckoutCart();
  }
}

function addToCart(id, name, price) {
  const existing = cart.find(i => i.id == id || i.name === name);
  if (existing) { existing.quantity += 1; }
  else { cart.push({ id, name, price: Number(price), quantity: 1 }); }
  localStorage.setItem('monrex_cart', JSON.stringify(cart));
  updateCartBadge();
  alert('Added "' + name + '" to your cart!');
}

function updateCartBadge() {
  const el = document.getElementById('cartCount');
  if (el) el.textContent = cart.reduce((s, i) => s + (i.quantity || 1), 0);
}

function renderCheckoutCart() {
  const el = document.getElementById('cartItemsList');
  if (!el) return;
  if (!cart.length) {
    el.innerHTML = '<p style="color:#888;">Your cart is empty. Click "Add to Order" on items above.</p>';
    updateTotals();
    return;
  }
  el.innerHTML = cart.map((item, idx) =>
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;background:#222;padding:10px;border-radius:6px;">' +
      '<div><strong>' + item.name + '</strong><br><small style="color:#aaa;">GH₵ ' + Number(item.price).toFixed(2) + ' x ' + item.quantity + '</small></div>' +
      '<div>' +
        '<button onclick="changeQty(' + idx + ',1)" style="padding:4px 10px;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;">+</button> ' +
        '<button onclick="changeQty(' + idx + ',-1)" style="padding:4px 10px;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;">-</button>' +
      '</div>' +
    '</div>'
  ).join('');
  updateTotals();
}

function changeQty(idx, d) {
  cart[idx].quantity += d;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  localStorage.setItem('monrex_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCheckoutCart();
}

function initRegionDropdown() {
  const rs = document.getElementById('regionSelect');
  const ts = document.getElementById('townSelect');
  if (!rs) return;
  rs.innerHTML = '<option value="">-- Choose Delivery Region --</option>';
  Object.keys(DELIVERY_RATES).forEach(r => {
    const o = document.createElement('option');
    o.value = r;
    o.textContent = r;
    rs.appendChild(o);
  });
  rs.addEventListener('change', e => {
    const region = e.target.value;
    ts.innerHTML = '<option value="">-- Choose Town / Area --</option>';
    selectedDeliveryFee = 0;
    updateTotals();
    if (!region) { ts.disabled = true; return; }
    Object.keys(DELIVERY_RATES[region]).forEach(t => {
      const o = document.createElement('option');
      o.value = t;
      o.textContent = t + ' (GH₵ ' + DELIVERY_RATES[region][t].toFixed(2) + ')';
      ts.appendChild(o);
    });
    ts.disabled = false;
  });
  ts.addEventListener('change', e => {
    const r = rs.value;
    const t = e.target.value;
    selectedDeliveryFee = (r && t) ? (DELIVERY_RATES[r][t] || 0) : 0;
    updateTotals();
  });
}

function getSubtotal() {
  return cart.reduce((s, i) => s + (Number(i.price) * (i.quantity || 1)), 0);
}

function updateTotals() {
  const sub = getSubtotal();
  const tot = sub + selectedDeliveryFee;
  const s = document.getElementById('subtotalDisplay');
  const d = document.getElementById('deliveryFeeDisplay');
  const t = document.getElementById('totalDisplay');
  if (s) s.textContent = 'GH₵ ' + sub.toFixed(2);
  if (d) d.textContent = 'GH₵ ' + selectedDeliveryFee.toFixed(2);
  if (t) t.textContent = 'GH₵ ' + tot.toFixed(2);
}

function handlePlaceOrder(event) {
  event.preventDefault();
  if (!cart.length) return alert("Your cart is empty.");

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const region = document.getElementById('regionSelect').value;
  const town = document.getElementById('townSelect').value;
  const payMethod = document.getElementById('selectedPaymentMethod').value;

  if (!region || !town) return alert("Please select your delivery location.");

  const subtotal = getSubtotal();
  const total = subtotal + selectedDeliveryFee;

  if (payMethod === 'paystack') {
    try {
      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: email,
        amount: Math.round(total * 100),
        currency: 'GHS',
        ref: 'MRX-' + Date.now(),
        callback: function(response) {
          saveOrder(name, phone, email, region, town, total, 'Paystack', response.reference);
        },
        onClose: function() { alert("Payment window closed."); }
      });
      handler.openIframe();
    } catch(err) { alert("Paystack error: " + err.message); }
    return;
  }

  saveOrder(name, phone, email, region, town, total, 'Direct MoMo', '').then(() => {
    const itemsText = cart.map(i => '• ' + i.name + ' (x' + i.quantity + ') - GH₵' + (i.price * i.quantity).toFixed(2)).join('\n');
    const wa = encodeURIComponent(
      'Hello MonRex Artworks! 🎨\nI want to confirm my order:\n\n' +
      '*Name:* ' + name + '\n' +
      '*Phone:* ' + phone + '\n' +
      '*Location:* ' + town + ', ' + region + '\n\n' +
      '*Items:*\n' + itemsText + '\n\n' +
      '*Subtotal:* GH₵' + subtotal.toFixed(2) + '\n' +
      '*Delivery Fee:* GH₵' + selectedDeliveryFee.toFixed(2) + '\n' +
      '*Total:* GH₵' + total.toFixed(2) + '\n\n' +
      '*Payment:* Direct MoMo (0507482090)'
    );
    cart = [];
    localStorage.removeItem('monrex_cart');
    updateCartBadge();
    window.location.href = 'https://wa.me/233507482090?text=' + wa;
  });
}

function saveOrder(name, phone, email, region, town, total, method, ref) {
  return fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: name, phone, email, region, town,
      deliveryFee: selectedDeliveryFee, items: cart, totalAmount: total,
      paymentMethod: method, paystackRef: ref
    })
  })
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      alert('Order #' + d.order.order_code + ' confirmed successfully!');
      cart = [];
      localStorage.removeItem('monrex_cart');
      updateCartBadge();
      showSection('track');
      document.getElementById('trackInput').value = d.order.order_code;
      trackOrder();
    }
  })
  .catch(e => { alert("Order saved. Contacting via WhatsApp..."); });
}

function trackOrder() {
  const q = document.getElementById('trackInput').value.trim();
  const el = document.getElementById('trackResult');
  if (!q) return alert("Enter your order code or phone number.");
  el.innerHTML = '<p style="color:#aaa;">Searching order records...</p>';
  
  fetch('/api/orders/track/' + encodeURIComponent(q))
    .then(r => r.json())
    .then(d => {
      if (!d.success) { el.innerHTML = '<p style="color:var(--accent-red);">' + d.message + '</p>'; return; }
      el.innerHTML = d.orders.map(o => {
        const sc = o.status.toLowerCase();
        const cls = sc.includes('delivered') ? 'status-delivered' : sc.includes('delivery') ? 'status-delivery' : sc.includes('production') ? 'status-production' : 'status-pending';
        return '<div style="background:#222;padding:15px;border-radius:8px;margin-bottom:12px;border-left:4px solid var(--accent-red);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<h4>Order #' + o.order_code + '</h4>' +
            '<span class="status-badge ' + cls + '">' + o.status + '</span>' +
          '</div>' +
          '<p style="font-size:0.88rem;color:#aaa;margin-top:5px;">Customer: <strong>' + o.customer_name + '</strong> | Location: <strong>' + o.town + ', ' + o.region + '</strong></p>' +
          '<p style="margin-top:8px;">Total: <strong>GH₵ ' + Number(o.total_amount).toFixed(2) + '</strong></p>' +
        '</div>';
      }).join('');
    })
    .catch(e => { el.innerHTML = '<p style="color:var(--accent-red);">Error tracking order. Please try again.</p>'; });
}
