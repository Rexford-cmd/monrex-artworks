const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || "1234";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(path.join(__dirname, '../public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DEFAULT_PRODUCTS = [
  ['Handmade Beaded Bag', 300.00, 'Handmade Beaded Bags', 'Stylish handmade beaded bag designed with detailed craftsmanship for a unique statement look.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'],
  ['Premium Handmade Beaded Bag', 350.00, 'Handmade Beaded Bags', 'Beautiful handcrafted beaded bag combining artistic detail, functionality and contemporary style.', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500'],
  ['Handmade Beaded Tissue Box', 150.00, 'Handmade Home Décor', 'A decorative handmade beaded tissue box designed to add an elegant artistic touch to your space.', 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=500'],
  ['Classic Handmade Beaded Bag', 200.00, 'Handmade Beaded Bags', 'Unique handmade beaded bags carefully crafted with attention to detail and style.', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500'],
  ['Men\'s Beaded Bag (Compact)', 150.00, 'Men\'s Beaded Bags', 'Sleek and masculine handmade beaded bag tailored for minimal essentials.', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500'],
  ['Men\'s Beaded Bag (Urban)', 200.00, 'Men\'s Beaded Bags', 'Unique handmade beaded bag crafted with bold masculine aesthetic.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'],
  ['Men\'s Beaded Bag (Executive)', 250.00, 'Men\'s Beaded Bags', 'Premium handcrafted beadwork bag designed for standout occasions.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500']
];

async function initDB() {
  if (!process.env.DATABASE_URL) return console.log("⚠️ No DATABASE_URL found.");
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, sort_order INT DEFAULT 0
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, price NUMERIC(10,2) NOT NULL,
      category VARCHAR(100) NOT NULL, description TEXT, image_url TEXT,
      in_stock BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY, order_code VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL, phone VARCHAR(50) NOT NULL,
      email VARCHAR(255), region VARCHAR(100) NOT NULL, town VARCHAR(100) NOT NULL,
      delivery_fee NUMERIC(10,2) NOT NULL, items JSONB NOT NULL,
      total_amount NUMERIC(10,2) NOT NULL, payment_method VARCHAR(50) DEFAULT 'MoMo',
      paystack_ref VARCHAR(255), status VARCHAR(50) DEFAULT 'Pending Payment',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS store_settings (
      key VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL
    )`);

    const defaultSettings = [
      ['announcement', '✨ Handmade with passion • Unique designs • Ghana-wide delivery available 🇬🇭'],
      ['hero_title', 'Handcrafted Elegance & Modern Beadwork'],
      ['hero_subtitle', 'MonRex Artworks is a creative handmade brand focused on unique beadwork, handcrafted bags, and artistic pieces in Ashaiman.'],
      ['about_text', 'MonRex Artworks is a creative handmade brand focused on unique beadwork, handcrafted bags, jewelry and artistic pieces. Each piece is carefully made with creativity, patience and attention to detail, bringing together traditional craftsmanship and modern style.'],
      ['paystack_public_key', process.env.PAYSTACK_PUBLIC_KEY || 'pk_live_78d879b3f53903de0c6288e5c1f5f2226e3c1cb4']
    ];
    for (const [k, v] of defaultSettings) {
      await pool.query(`INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, [k, v]);
    }

    const catCount = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCount.rows[0].count) === 0) {
      for (const c of ['Handmade Beaded Bags', "Men's Beaded Bags", 'Handmade Home Décor']) {
        await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING', [c]);
      }
    }

    const prodCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(prodCount.rows[0].count) === 0) {
      for (const p of DEFAULT_PRODUCTS) {
        await pool.query('INSERT INTO products (name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5)', p);
      }
      console.log("✅ Seeded initial 7 products into Neon Database!");
    }
    console.log("✅ Neon DB tables initialized successfully!");
  } catch (err) {
    console.error("❌ DB Init Error:", err.message);
  }
}
initDB();

// ===== SEED PRODUCTS ENDPOINT =====
app.post('/api/products/seed', async (req, res) => {
  const { pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    for (const p of DEFAULT_PRODUCTS) {
      await pool.query('INSERT INTO products (name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5)', p);
    }
    const r = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json({ success: true, message: "Products loaded into Neon DB!", products: r.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== SETTINGS APIS =====
app.get('/api/settings', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM store_settings');
    const s = {};
    r.rows.forEach(row => s[row.key] = row.value);
    res.json({ success: true, settings: s });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/settings', async (req, res) => {
  const { key, value, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    await pool.query(`INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`, [key, value]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ===== CATEGORIES APIS =====
app.get('/api/categories', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ success: true, categories: r.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/categories', async (req, res) => {
  const { name, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    const r = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json({ success: true, category: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/categories/:id', async (req, res) => {
  const { name, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    const r = await pool.query('UPDATE categories SET name=$1 WHERE id=$2 RETURNING *', [name, req.params.id]);
    res.json({ success: true, category: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  if (req.query.pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ===== PRODUCTS APIS =====
app.get('/api/products', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json({ success: true, products: r.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/products', async (req, res) => {
  const { name, price, category, description, image_url, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    const r = await pool.query(
      'INSERT INTO products (name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, category, description, image_url]
    );
    res.status(201).json({ success: true, product: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  const { name, price, category, description, image_url, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    const r = await pool.query(
      'UPDATE products SET name=$1, price=$2, category=$3, description=$4, image_url=$5 WHERE id=$6 RETURNING *',
      [name, price, category, description, image_url, req.params.id]
    );
    res.json({ success: true, product: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  const { in_stock, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    const r = await pool.query('UPDATE products SET in_stock=$1 WHERE id=$2 RETURNING *', [in_stock, req.params.id]);
    res.json({ success: true, product: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  if (req.query.pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ===== ORDERS APIS =====
app.get('/api/orders', async (req, res) => {
  if (req.query.pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    const r = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ success: true, orders: r.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  const { customerName, phone, email, region, town, deliveryFee, items, totalAmount, paymentMethod, paystackRef } = req.body;
  const orderCode = 'MRX-' + Math.floor(1000 + Math.random() * 9000);
  try {
    const r = await pool.query(
      `INSERT INTO orders (order_code, customer_name, phone, email, region, town, delivery_fee, items, total_amount, payment_method, paystack_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [orderCode, customerName, phone, email || '', region, town, deliveryFee, JSON.stringify(items), totalAmount, paymentMethod || 'MoMo', paystackRef || '']
    );
    res.status(201).json({ success: true, order: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/orders/track/:query', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT order_code, customer_name, region, town, status, total_amount, items, created_at
       FROM orders WHERE UPPER(order_code)=UPPER($1) OR phone=$1 ORDER BY created_at DESC`,
      [req.params.query.trim()]
    );
    if (r.rows.length === 0) return res.status(404).json({ success: false, message: "No orders found." });
    res.json({ success: true, orders: r.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { status, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    const r = await pool.query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    res.json({ success: true, order: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.use((req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.listen(PORT, () => console.log(`MonRex Artworks running on port ${PORT}`));
