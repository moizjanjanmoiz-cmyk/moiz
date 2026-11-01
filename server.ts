import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// In AI Studio Cloud Run, nginx proxy binds to 8080 and proxies to 3000.
// On external hosts (Heroku, Render, etc.), process.env.PORT is respected.
const PORT = process.env.PORT && process.env.PORT !== '8080' ? parseInt(process.env.PORT, 10) : 3000;
const DIST_DIR = path.resolve(__dirname, 'dist');

// Serve static assets from Vite build output directory
app.use(express.static(DIST_DIR, {
  maxAge: '1d',
  etag: true,
}));

// Health check endpoint for Cloud Run / deployment orchestrators
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA Fallback: Serve index.html for all client routes (products, checkout, admin, etc.)
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mega Bazar production server running on http://0.0.0.0:${PORT}`);
});

export default app;
