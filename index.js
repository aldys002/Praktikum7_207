const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const port = 3000;
const KEYS_FILE = path.join(__dirname, 'keys.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Utility: baca file keys.json (kembalikan array)
async function readKeysFile() {
  try {
    const data = await fs.readFile(KEYS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // kalau file belum ada atau corrupt, kembalikan array kosong
    return [];
  }
}

// Utility: tulis array ke keys.json
async function writeKeysFile(keys) {
  await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');
}

// Route utama: kirim index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * POST /api/generate-key
 * Body: { "keyword": "admin" }
 * Response: { id, keyword, apiKey, createdAt }
 */
app.post('/api/generate-key', async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return res.status(400).json({ error: 'Kata kunci wajib diisi!' });
    }

    // Generate API key: 32 bytes => hex (64 chars)
    const apiKey = crypto.randomBytes(32).toString('hex');

    // Buat object baru
    const newEntry = {
      id: crypto.randomBytes(8).toString('hex'), // id unik
      keyword: keyword.trim(),
      apiKey,
      createdAt: new Date().toISOString()
    };

    // Simpan ke file
    const keys = await readKeysFile();
    keys.unshift(newEntry); // letakkan paling depan (baru)
    await writeKeysFile(keys);

    return res.status(201).json(newEntry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error saat membuat API key' });
  }
});

/**
 * GET /api/keys
 * Response: [ {id, keyword, apiKey, createdAt}, ... ]
 */
app.get('/api/keys', async (req, res) => {
  try {
    const keys = await readKeysFile();
    return res.json(keys);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal membaca daftar API key' });
  }
});

/**
 * GET /api/keys/:id
 * Response: {id, keyword, apiKey, createdAt} atau 404
 */
app.get('/api/keys/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const keys = await readKeysFile();
    const found = keys.find(k => k.id === id);
    if (!found) return res.status(404).json({ error: 'API key tidak ditemukan' });
    return res.json(found);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal mengambil API key' });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`Keys file: ${KEYS_FILE}`);
});
