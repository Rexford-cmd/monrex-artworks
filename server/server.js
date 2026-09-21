const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory order storage
let orders = [];

// API: Get all orders (for Admin)
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders });
});

// API: Create an order
app.post('/api/orders', (req, res) => {
  const { customerName, phone, region, town, deliveryFee, items, totalAmount, paymentMethod } = req.body;

  const newOrder = {
    id: Date.now(),
    customerName,
    phone,
    region,
    town,
    deliveryFee,
    items,
    totalAmount,
    paymentMethod: paymentMethod || 'MoMo',
    status: 'Pending Verification',
    createdAt: new Date().toLocaleString()
  };

  orders.unshift(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

// Fallback: Serve frontend for any other route (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`MonRex Artworks Server running on port ${PORT}`);
});