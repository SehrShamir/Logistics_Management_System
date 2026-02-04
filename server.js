import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3000;

// ---------------- SUPABASE SETUP ----------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ---------------- __DIRNAME ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- LOGIN ----------------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  res.json({ success: true });
});

// ---------------- REGISTER ----------------
app.post('/register', async (req, res) => {
  const { username, password, phone } = req.body;

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Username already exists'
    });
  }

  const { error } = await supabase.from('users').insert([
    { username, password, phone }
  ]);

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during registration'
    });
  }

  res.json({ success: true, message: 'Registration successful' });
});

// ---------------- SAVE RECEIPT ----------------
app.post('/receipt', async (req, res) => {
  const { name, phone, email, timestamp } = req.body;
  const delivery_id = `id_${Date.now().toString().slice(-6)}`;

  const { error } = await supabase.from('receipts').insert([
    { delivery_id, name, phone, email, timestamp }
  ]);

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'DB Error'
    });
  }

  res.json({ success: true, message: 'Receipt stored successfully' });
});

// ---------------- RECEIPT SUMMARY ----------------
app.get('/receipt-summary', async (req, res) => {
  const { phone } = req.query;

  const { data, error } = await supabase
    .from('receipts')
    .select('id, delivery_id, name, phone')
    .eq('phone', phone);

  if (error) {
    return res.status(500).json({
      success: false,
      message: 'DB Error'
    });
  }

  res.json(data);
});

// ---------------- SERVE INDEX ----------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------- START SERVER ----------------
app.listen(port, () => {
  console.log(`✅ Server running at: http://localhost:${port}`);
});
