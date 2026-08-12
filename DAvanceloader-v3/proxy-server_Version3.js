/**
 * Minimal token-protected proxy for header injection (demo/production use).
 * - POST /fetch  { target, headers }
 * - GET  /health
 *
 * SECURITY:
 * - Set environment variable PROXY_TOKEN to a long random token.
 * - Client must send X-Proxy-Token header with that value.
 *
 * Usage:
 *   PROXY_TOKEN=yourtoken node proxy-server.js
 *
 * Deploy on Heroku / Fly / Vercel serverless (adjust for platform).
 */

const express = require('express');
const fetch = require('node-fetch');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const PROXY_TOKEN = process.env.PROXY_TOKEN || '';
const PORT = process.env.PORT || 3000;

function requireToken(req, res, next) {
  const token = req.header('x-proxy-token') || '';
  if (!PROXY_TOKEN || token !== PROXY_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

app.post('/fetch', requireToken, async (req, res) => {
  try {
    const { target, headers } = req.body || {};
    if (!target) return res.status(400).json({ error: 'missing target' });
    const opts = { method: 'GET', headers: headers || {}, redirect: 'follow' };
    const r = await fetch(target, opts);
    const buf = await r.arrayBuffer();
    const contentType = r.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', contentType);
    // allow embedding in demos; in production restrict origin properly
    res.set('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buf));
  } catch (e) {
    console.error('fetch error', e);
    res.status(500).json({ error: 'proxy fetch failed', detail: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on ${PORT}`);
  if (!PROXY_TOKEN) console.warn('WARNING: PROXY_TOKEN not set. Proxy accepts any token (unsafe). Set PROXY_TOKEN env var in production.');
});