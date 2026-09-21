const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || "1234";

// Allow larger payloads for image file uploads (up to 15MB)
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Connect to Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize Database Tables
async function initDB() {
  if (!process.env.DATABASE_URL) {
    console.log("⚠️ No DATABASE_URL found.");
    return;
  }
  try {
    // 1. Products Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        image_url TEXT,
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_code VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        region VARCHAR(100) NOT NULL,
        town VARCHAR(100) NOT NULL,
        delivery_fee NUMERIC(10, 2) NOT NULL,
        items JSONB NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'MoMo',
        status VARCHAR(50) DEFAULT 'Pending Payment',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Preload initial products if table is empty
    const checkProducts = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(checkProducts.rows[0].count) === 0) {
      const initialProducts = [
        ['Handmade Beaded Bag', 300.00, 'Handmade Beaded Bags', 'Stylish handmade beaded bag designed with detailed craftsmanship for a unique statement look.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'],
        ['Premium Handmade Beaded Bag', 350.00, 'Handmade Beaded Bags', 'Beautiful handcrafted beaded bag combining artistic detail, functionality and contemporary style.', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500'],
        ['Handmade Beaded Tissue Box', 150.00, 'Handmade Home Décor', 'A decorative handmade beaded tissue box designed to add an elegant artistic touch to your space.', 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=500'],
        ['Classic Handmade Beaded Bag', 200.00, 'Handmade Beaded Bags', 'Unique handmade beaded bags carefully crafted with attention to detail and style.', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500'],
        ['Men\'s Beaded Bag (Compact)', 150.00, 'Men\'s Beaded Bags', 'Minimalist handcrafted men\'s bag with clean bold structure.', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500'],
        ['Men\'s Beaded Bag (Urban Classic)', 200.00, 'Men\'s Beaded Bags', 'Contemporary beadwork bag designed for everyday essentials.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'],
        ['Men\'s Beaded Bag (Executive)', 250.00, 'Men\'s Beaded Bags', 'Signature luxury beadwork bag for standout occasions.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500']
      ];

      for (const prod of initialProducts) {
        await pool.query(
          'INSERT INTO products (name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5)',
          prod
        );
      }
      console.log("✅ Initial MonRex catalog loaded into Neon DB!");
    }

    console.log("✅ Neon Database is fully initialized and operational!");
  } catch (err) {
    console.error("❌ DB Init Error:", err.message);
  }
}
initDB();

// ================= PRODUCT APIS =================

// GET all products (Public)
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json({ success: true, products: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create product (Admin)
app.post('/api/products', async (req, res) => {
  const { name, price, category, description, image_url, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid Admin PIN" });

  try {
    const result = await pool.query(
      'INSERT INTO products (name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, category, description, image_url]
    );
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { pin } = req.query;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid Admin PIN" });

  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle product stock (Admin)
app.patch('/api/products/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { in_stock, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid Admin PIN" });

  try {
    const result = await pool.query(
      'UPDATE products SET in_stock = $1 WHERE id = $2 RETURNING *',
      [in_stock, id]
    );
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ================= ORDER APIS =================

// GET all orders (Admin)
app.get('/api/orders', async (req, res) => {
  const { pin } = req.query;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid Admin PIN" });

  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Create Order (Public)
app.post('/api/orders', async (req, res) => {
  const { customerName, phone, region, town, deliveryFee, items, totalAmount, paymentMethod } = req.body;
  const orderCode = 'MRX-' + Math.floor(1000 + Math.random() * 9000);

  try {
    const result = await pool.query(
      `INSERT INTO orders (order_code, customer_name, phone, region, town, delivery_fee, items, total_amount, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [orderCode, customerName, phone, region, town, deliveryFee, JSON.stringify(items), totalAmount, paymentMethod || 'MoMo']
    );
    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Track Order (Public)
app.get('/api/orders/track/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const result = await pool.query(
      `SELECT order_code, customer_name, region, town, status, total_amount, items, created_at 
       FROM orders WHERE UPPER(order_code) = UPPER($1) OR phone = $1 ORDER BY created_at DESC`,
      [query.trim()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found for this code or phone number." });
    }
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Update Order Status (Admin)
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid Admin PIN" });

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`MonRex Artworks running on port ${PORT}`);
});