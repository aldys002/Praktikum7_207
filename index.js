const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware untuk melayani file statis di folder public
app.use(express.static(path.join(__dirname, 'public')));

// Route utama: kirim file index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// (Opsional) Endpoint untuk generate API key lewat backend
app.get('/api/generate-key', (req, res) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  res.json({ apiKey: key });
});

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
