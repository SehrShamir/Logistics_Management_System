import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const app = express();
const port = 3000;

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- LOGIN ----------------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------------- REGISTER ----------------
app.post('/register', async (req, res) => {
  const { username, password, phone } = req.body;

  try {
    const existing = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    await db.query(
      'INSERT INTO users (username, password, phone) VALUES ($1, $2, $3)',
      [username, password, phone]
    );

    res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error during registration' });
  }
});

// ---------------- SAVE RECEIPT ----------------
app.post('/receipt', async (req, res) => {
  const { name, phone, email, timestamp } = req.body;
  const delivery_id = `id_${Date.now().toString().slice(-6)}`;

  try {
    await db.query(
      'INSERT INTO receipts (delivery_id, name, phone, email, timestamp) VALUES ($1,$2,$3,$4,$5)',
      [delivery_id, name, phone, email, timestamp]
    );

    res.json({ success: true, message: 'Receipt stored successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'DB Error' });
  }
});

// ---------------- RECEIPT SUMMARY ----------------
app.get('/receipt-summary', async (req, res) => {
  const { phone } = req.query;

  try {
    const result = await db.query(
      'SELECT id, delivery_id, name, phone FROM receipts WHERE phone = $1',
      [phone]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'DB Error' });
  }
});

// ---------------- SERVE INDEX ----------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------- START SERVER ----------------
app.listen(port, () => {
  console.log(`✅ Server running at: http://localhost:${port}`);
});
