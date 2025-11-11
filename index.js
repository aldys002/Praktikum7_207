require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // biar index.html bisa diakses

// 🔗 Koneksi ke MySQL Workbench
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) console.error('❌ Gagal konek DB:', err);
  else console.log('✅ Terhubung ke MySQL Workbench');
});

// 🧠 Simpan API key
app.post('/api/save', (req, res) => {
  const { keyword, api_key } = req.body;
  if (!keyword || !api_key) {
    return res.status(400).json({ message: 'Keyword dan API key wajib diisi!' });
  }

  const sql = 'INSERT INTO api_keys (keyword, api_key) VALUES (?, ?)';
  db.query(sql, [keyword, api_key], (err, result) => {
    if (err) {
      console.error('Gagal simpan ke DB:', err);
      return res.status(500).json({ message: 'Error menyimpan ke database' });
    }
    res.json({ message: '✅ API key berhasil disimpan', id: result.insertId });
  });
});

// 📋 Ambil semua data API key
app.get('/api/keys', (req, res) => {
  db.query('SELECT * FROM api_keys ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Gagal ambil data dari DB' });
    res.json(rows);
  });
});

// 🚀 Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
