import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const app = express();
const port = 3000;

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Middleware
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public'))); // Serves static files from /public

//  Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//  User registration route
app.post('/register', async (req, res) => {
  const { username, password, phone } = req.body;

  try {
    const [existing] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    await db.execute(
      'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
      [username, password, phone]
    );

    res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error during registration' });
  }
});
// Save receipt
app.post('/receipt', (req, res) => {
  const { name, phone, email, timestamp } = req.body;
  const delivery_id = `id_${Date.now().toString().slice(-6)}`; // Unique ID

  db.query(
    'INSERT INTO receipts (delivery_id, name, phone, email, timestamp) VALUES (?, ?, ?, ?, ?)',
    [delivery_id, name, phone, email, timestamp],
    (err) => {
      if (err) return res.status(500).json({ message: 'DB Error' });
      res.json({ message: 'Receipt stored successfully' });
    }
  );
});

// Get summary by phone
app.get('/receipt-summary', (req, res) => {
  const { phone } = req.query;
  db.query(
    'SELECT id, delivery_id, name, phone FROM receipts WHERE phone = ?',
    [phone],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB Error' });
      res.json(results);
    }
  );
});


// Receipt saving route
app.post('/receipt', async (req, res) => {
  const { timestamp } = req.body;

  try {
    await db.execute('INSERT INTO receipts (timestamp) VALUES (?)', [timestamp]);
    res.json({ success: true, message: 'Receipt saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving receipt' });
  }
});


//  Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(` Server running at: http://localhost:${port}`);
});
