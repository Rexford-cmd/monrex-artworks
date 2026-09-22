const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const https = require('https');

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

async function initDB() {
  if (!process.env.DATABASE_URL) return console.log("No DATABASE_URL");
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL,
      icon VARCHAR(50) DEFAULT '🛍️', sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL,
      price NUMERIC(10,2) NOT NULL, category VARCHAR(100) NOT NULL,
      description TEXT, image_url TEXT,
      in_stock BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY, order_code VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL, phone VARCHAR(50) NOT NULL,
      region VARCHAR(100) NOT NULL, town VARCHAR(100) NOT NULL,
      delivery_fee NUMERIC(10,2) NOT NULL, items JSONB NOT NULL,
      total_amount NUMERIC(10,2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'MoMo',
      payment_status VARCHAR(50) DEFAULT 'Unpaid',
      paystack_ref VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Pending Payment',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS store_settings (
      key VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL
    )`);

    const defaults = {
      announcement: '✨ Handmade with passion • Unique designs • Ghana-wide delivery available 🇬🇭',
      hero_title: 'Handcrafted Elegance & Modern Beadwork',
      hero_subtitle: 'MonRex Artworks is a creative handmade brand focused on unique beadwork, handcrafted bags, and artistic décor in Ashaiman.',
      about_text: 'MonRex Artworks is a creative handmade brand focused on unique beadwork, handcrafted bags, jewelry and artistic pieces. Each piece is carefully made with creativity, patience and attention to detail, bringing together traditional craftsmanship and modern style.',
      momo_number: '0507482090',
      momo_name: 'Kwakye Rexford Ayeh',
      phone: '0507482090',
      email: 'kwakyerexford1@gmail.com',
      location: 'Ashaiman, Greater Accra'
    };

    for (const [key, value] of Object.entries(defaults)) {
      await pool.query(`INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, [key, value]);
    }

    const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      const cats = [
        ['Handmade Beaded Bags', '👜', 1],
        ["Men's Beaded Bags", '💼', 2],
        ['Handmade Home Décor', '🏠', 3]
      ];
      for (const c of cats) {
        await pool.query('INSERT INTO categories (name, icon, sort_order) VALUES ($1,$2,$3)', c);
      }
    }

    const prodCheck = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(prodCheck.rows[0].count) === 0) {
      const prods = [
        ['Handmade Beaded Bag', 300, 'Handmade Beaded Bags', 'Stylish handmade beaded bag with detailed craftsmanship.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'],
        ['Premium Handmade Beaded Bag', 350, 'Handmade Beaded Bags', 'Beautiful handcrafted beaded bag combining artistic detail and contemporary style.', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500'],
        ['Handmade Beaded Tissue Box', 150, 'Handmade Home Décor', 'Decorative handmade beaded tissue box for an elegant artistic touch.', 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=500'],
        ['Classic Beaded Bag', 200, 'Handmade Beaded Bags', 'Unique handmade beaded bag crafted with attention to detail.', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500'],
        ["Men's Beaded Bag (Compact)", 150, "Men's Beaded Bags", 'Minimalist handcrafted men\'s bag with bold structure.', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500'],
        ["Men's Beaded Bag (Urban)", 200, "Men's Beaded Bags", 'Contemporary beadwork bag for everyday carry.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'],
        ["Men's Beaded Bag (Executive)", 250, "Men's Beaded Bags", 'Signature luxury beadwork bag for standout occasions.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500']
      ];
      for (const p of prods) {
        await pool.query('INSERT INTO products (name,price,category,description,image_url) VALUES ($1,$2,$3,$4,$5)', p);
      }
    }
    console.log("✅ Neon DB fully initialized!");
  } catch (err) { console.error("DB Error:", err.message); }
}
initDB();

// ===== STORE SETTINGS API =====
app.get('/api/settings', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM store_settings');
    const settings = {};
    r.rows.forEach(row => settings[row.key] = row.value);
    res.json({ success: true, settings });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.put('/api/settings', async (req, res) => {
  const { settings, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false, message: "Invalid PIN" });
  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(`INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`, [key, value]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

// ===== CATEGORIES API =====
app.get('/api/categories', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC');
    res.json({ success: true, categories: r.rows });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/categories', async (req, res) => {
  const { name, icon, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    const r = await pool.query('INSERT INTO categories (name, icon) VALUES ($1, $2) RETURNING *', [name, icon || '🛍️']);
    res.status(201).json({ success: true, category: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/categories/:id', async (req, res) => {
  const { name, icon, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    const r = await pool.query('UPDATE categories SET name=$1, icon=$2 WHERE id=$3 RETURNING *', [name, icon, req.params.id]);
    res.json({ success: true, category: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  if (req.query.pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

// ===== PRODUCTS API =====
app.get('/api/products', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json({ success: true, products: r.rows });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/products', async (req, res) => {
  const { name, price, category, description, image_url, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    const r = await pool.query('INSERT INTO products (name,price,category,description,image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *', [name, price, category, description, image_url]);
    res.status(201).json({ success: true, product: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.put('/api/products/:id', async (req, res) => {
  const { name, price, category, description, image_url, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    const r = await pool.query('UPDATE products SET name=$1,price=$2,category=$3,description=$4,image_url=$5 WHERE id=$6 RETURNING *', [name, price, category, description, image_url, req.params.id]);
    res.json({ success: true, product: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  const { in_stock, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    const r = await pool.query('UPDATE products SET in_stock=$1 WHERE id=$2 RETURNING *', [in_stock, req.params.id]);
    res.json({ success: true, product: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.delete('/api/products/:id', async (req, res) => {
  if (req.query.pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

// ===== ORDERS API =====
app.get('/api/orders', async (req, res) => {
  if (req.query.pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    const r = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ success: true, orders: r.rows });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/orders', async (req, res) => {
  const { customerName, phone, region, town, deliveryFee, items, totalAmount, paymentMethod, paystackRef } = req.body;
  const orderCode = 'MRX-' + Math.floor(1000 + Math.random() * 9000);
  try {
    const r = await pool.query(
      `INSERT INTO orders (order_code,customer_name,phone,region,town,delivery_fee,items,total_amount,payment_method,payment_status,paystack_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [orderCode, customerName, phone, region, town, deliveryFee, JSON.stringify(items), totalAmount, paymentMethod || 'MoMo', paymentMethod === 'Paystack' ? 'Paid' : 'Unpaid', paystackRef || null]
    );
    res.status(201).json({ success: true, order: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.get('/api/orders/track/:query', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT order_code,customer_name,region,town,status,payment_status,total_amount,items,created_at FROM orders WHERE UPPER(order_code)=UPPER($1) OR phone=$1 ORDER BY created_at DESC`,
      [req.params.query.trim()]
    );
    if (r.rows.length === 0) return res.status(404).json({ success: false, message: "No orders found." });
    res.json({ success: true, orders: r.rows });
  } catch (e) { res.status(500).json({ success: false }); }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const { status, pin } = req.body;
  if (pin !== ADMIN_PIN) return res.status(403).json({ success: false });
  try {
    const r = await pool.query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
    res.json({ success: true, order: r.rows[0] });
  } catch (e) { res.status(500).json({ success: false }); }
});

// ===== PAYSTACK VERIFY =====
app.post('/api/paystack/verify', async (req, res) => {
  const { reference } = req.body;
  if (!PAYSTACK_SECRET) return res.status(500).json({ success: false, message: "Paystack not configured" });
  try {
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.paystack.co',
        path: `/transaction/verify/${reference}`,
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      };
      https.get(options, resp => {
        let body = '';
        resp.on('data', chunk => body += chunk);
        resp.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });
    if (data.status && data.data.status === 'success') {
      res.json({ success: true, verified: true, amount: data.data.amount / 100 });
    } else {
      res.json({ success: true, verified: false });
    }
  } catch (e) { res.status(500).json({ success: false }); }
});

app.get('/api/paystack/key', (req, res) => {
  res.json({ key: process.env.PAYSTACK_PUBLIC_KEY || '' });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => console.log(`MonRex Artworks running on port ${PORT}`));
