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

let cart = [];
let selectedDeliveryFee = 0;

document.addEventListener("DOMContentLoaded", () => {
  initRegionDropdown();
  updateTotals();
});

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
    if (reg && town) {
      selectedDeliveryFee = DELIVERY_RATES[reg][town] || 0;
    } else {
      selectedDeliveryFee = 0;
    }
    updateTotals();
  });
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  renderCartList();
  updateTotals();
  alert(`Added "${name}" to your order!`);
}

function renderCartList() {
  const cartList = document.getElementById("cartList");
  if (!cartList) return;

  if (cart.length === 0) {
    cartList.innerHTML = '<p style="color: #777;">No items selected yet. Click "Add to Order" above.</p>';
    return;
  }

  cartList.innerHTML = cart.map((item, index) => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;">
      <span>${item.name} (x${item.quantity})</span>
      <span>GH₵ ${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join("");
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateTotals() {
  const subtotal = getSubtotal();
  const total = subtotal + selectedDeliveryFee;

  const subtotalElem = document.getElementById("subtotalDisplay");
  const deliveryElem = document.getElementById("deliveryFeeDisplay");
  const totalElem = document.getElementById("totalDisplay");

  if (subtotalElem) subtotalElem.textContent = `GH₵ ${subtotal.toFixed(2)}`;
  if (deliveryElem) deliveryElem.textContent = `GH₵ ${selectedDeliveryFee.toFixed(2)}`;
  if (totalElem) totalElem.textContent = `GH₵ ${total.toFixed(2)}`;
}

async function handleCheckout(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Please add at least one item to your order.");
    return;
  }

  const customerName = document.getElementById("customerName").value;
  const customerPhone = document.getElementById("customerPhone").value;
  const region = document.getElementById("regionSelect").value;
  const town = document.getElementById("townSelect").value;

  if (!region || !town) {
    alert("Please select your delivery region and town.");
    return;
  }

  const subtotal = getSubtotal();
  const grandTotal = subtotal + selectedDeliveryFee;

  const orderPayload = {
    customerName,
    phone: customerPhone,
    region,
    town,
    deliveryFee: selectedDeliveryFee,
    items: cart,
    totalAmount: grandTotal,
    paymentMethod: "MoMo"
  };

  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });

    const orderItemsSummary = cart.map(i => `• ${i.name} (x${i.quantity}) - GH₵${i.price * i.quantity}`).join("\n");
    const waText = encodeURIComponent(
      `Hello MonRex Artworks! 🎨\nI want to confirm my order:\n\n` +
      `*Name:* ${customerName}\n` +
      `*Phone:* ${customerPhone}\n` +
      `*Location:* ${town}, ${region}\n\n` +
      `*Items:*\n${orderItemsSummary}\n\n` +
      `*Delivery Fee:* GH₵${selectedDeliveryFee.toFixed(2)}\n` +
      `*Total:* GH₵${grandTotal.toFixed(2)}\n\n` +
      `*Payment:* Direct MoMo (0507482090)`
    );

    cart = [];
    renderCartList();
    updateTotals();
    window.location.href = `https://wa.me/233507482090?text=${waText}`;

  } catch (err) {
    alert("Order recorded. Redirecting to WhatsApp...");
    window.location.href = `https://wa.me/233507482090`;
  }
}
