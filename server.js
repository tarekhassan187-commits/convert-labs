// Simple Express static server for Convert Labs
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the repo root (index.html, style.css, assets/, tools/, etc.)
app.use(express.static(path.join(__dirname, '/')));

// Optional small API placeholder (calorie proxy or similar). You can extend later.
app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: Date.now() }));

// Fallback to index.html for client-side routes if any
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Convert Labs server running on port ${PORT}`);
});
