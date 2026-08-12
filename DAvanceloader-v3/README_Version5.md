# Ultra Custom IFRAME Loader — V3 + V2 Reference Guide

A production-grade, browser-first iframe loader (V3) with optional secure proxy and analytics servers. This repo also documents the React + TypeScript alternative (V2) so you can choose the right approach for your use case.

**TL;DR:** V3 is a static, no-build iframe tool that works by opening `index.html` or serving it statically. V2 is a React+TypeScript scaffold if you need type safety and deeper React integration. Most teams choose V3.

---

## Table of Contents

- [Quick Comparison: V2 vs V3](#quick-comparison-v2-vs-v3)
- [Why Choose V3?](#why-choose-v3)
- [When to Pick V2 Instead](#when-to-pick-v2-instead)
- [Project Files](#project-files)
- [Quick Start (V3)](#quick-start-v3)
- [Advanced Features](#advanced-features)
- [Server Setup (Optional)](#server-setup-optional)
- [Security & Production Guidelines](#security--production-guidelines)
- [Bonus: FAULTLINE Game](#bonus-faultline-game)
- [Troubleshooting](#troubleshooting)
- [License & Contributing](#license--contributing)

---

## Quick Comparison: V2 vs V3

| Feature | V2 (React + TypeScript) | V3 (Browser-First) |
|---------|------------------------|-------------------|
| **Setup** | Requires Node, build tooling, webpack/Vite | Open `index.html` or serve static; no build |
| **Type Safety** | Full TypeScript + IDE support | Plain JavaScript; well-structured, but runtime checking |
| **Best For** | Production React apps, server-heavy logic | Quick demos, static widgets, embeds, fast iteration |
| **Dependencies** | npm, React, Spring Boot (optional), TypeScript compiler | None; vanilla JS + optional Node servers |
| **Deployment** | Build step required; deploy to Vercel, Netlify, etc. | Static hosting (GitHub Pages, Netlify, Vercel, S3) |
| **Server Scaffold** | Spring Boot with authentication hooks | Optional lightweight Express servers (proxy + analytics) |
| **Learning Curve** | Steeper; React ecosystem | Gentle; direct browser APIs |
| **Bundle Size** | Larger (React + deps) | ~15 KB client (minified); minimal |

---

## Why Choose V3?

**V3 is recommended for most projects because:**

1. **Zero Setup:** Open `index.html` in a browser or run a 1-line static server. No dependencies to install.
2. **Security-First Defaults:** No embedded API keys. Optional proxy is token-protected and not required for basic use.
3. **Fast Iteration:** Change JavaScript, refresh browser. No build step, no node_modules bloat.
4. **Production-Ready Features:**
   - Analytics with intelligent batching, exponential backoff retries, and sendBeacon fallback
   - SHA-256 query encryption (client-side hashing)
   - Preflight health checks for proxy and analytics endpoints
   - UTM builder and custom URL path routing
   - Preset management (export/import configurations)
   - Smart iframe sandbox attributes

5. **Low Operational Overhead:** Static hosting is cheap, fast, and globally distributed. Optional proxy is a tiny Express app (~50 lines) that can run on Vercel, Heroku, or your private infrastructure.
6. **Portability:** If you later need React, V3's modular engine makes porting to V2 trivial.

---

## When to Pick V2 Instead

**Choose V2 if:**

- You are building a **production-grade React application** and require compile-time type guarantees and strong IDE tooling.
- You need to host **sensitive logic server-side:** complex authentication, per-request header injection, AI models, or proprietary algorithms.
- You expect to extend the **server scaffold extensively:** multi-tenant authentication, role-based access control, heavy analytics pipelines, A/B testing engines.
- Your team is already **React-native** and prefers staying in that ecosystem.

**V2 Scaffold Includes:**
- React component architecture with TypeScript
- Spring Boot backend starter (auth, logging, analytics endpoints)
- Unit test examples
- CI/CD workflow (GitHub Actions)

---

## Project Files

| File | Purpose |
|------|---------|
| **README.md** | This file; V2/V3 comparison and full feature docs |
| **index.html** | V3 main UI; drop-in static file, accessible and mobile-friendly |
| **styles.css** | Responsive styling; works on desktop, tablet, mobile |
| **utils.js** | Safe utility helpers: storage wrapper, SHA-256 crypto, URL normalization, retry logic |
| **app.js** | Core V3 engine: URL builder, analytics queue, proxy fallback, DOM event wiring |
| **presets.json** | Curated presets for YouTube, GitHub, marketing sites, custom templates |
| **proxy-server.js** | Optional Express server; token-protected header-injection proxy |
| **analytics-server.js** | Optional Express server; collects analytics events, dumps to file, health endpoint |
| **package.json** | Dependencies and scripts for optional Node servers |
| **.gitignore** | Excludes node_modules, logs, environment files, build artifacts, and language-specific junk |

---

## Quick Start (V3)

### Option A: Browser (Fastest — No Server Needed)

1. Clone or download this repository.
2. Open `index.html` directly in your browser (e.g., `file:///path/to/index.html`).
3. Enter a site URL, choose a load mode (Direct, /embed, /viewer, UTM, SmartPath, Custom), configure headers/UTM if needed, and click **Load Site**.

**Limitations of file:// protocol:**
- CORS restrictions apply; some sites may not load.
- For production, use a static server (see Option B).

---

### Option B: Static Server (Recommended)

#### Using Python (built-in):
```bash
cd /path/to/uploaded-doc-tools
python3 -m http.server 8000
# Open http://localhost:8000
```

#### Using Node.js (npx, no install):
```bash
cd /path/to/uploaded-doc-tools
npx http-server .
# Open http://localhost:8000
```

#### Using Node http-server (installed):
```bash
npm install -g http-server
cd /path/to/uploaded-doc-tools
http-server
```

---

### Option C: Add Optional Secure Proxy & Analytics (Production)

If you want secure header injection and analytics ingestion:

#### 1. Install dependencies:
```bash
npm install
```

#### 2. Create `.env` file (do not commit):
```bash
PROXY_TOKEN=your_very_long_random_token_here_min_32_chars
ANALYTICS_SECRET=your_analytics_secret_key_optional
PORT_PROXY=3000
PORT_ANALYTICS=4000
```

#### 3. Start both servers:
```bash
# Terminal 1: Proxy server
node proxy-server.js

# Terminal 2: Analytics server
node analytics-server.js
```

#### 4. In the UI:
- Set **Analytics Endpoint** to `http://localhost:4000/collect`
- Set **Proxy URL** in `app.js` (line ~50) to `http://localhost:3000/fetch`
- Enter your proxy token in the **Proxy Settings** panel

---

## Advanced Features

### 1. Analytics Queue (Automatic Batching & Retries)

The V3 client automatically:
- **Batches events:** Collects up to 10 events or waits 5 seconds, whichever comes first
- **Retries with exponential backoff:** Up to 5 attempts with 1s, 2s, 4s, 8s, 16s delays
- **sendBeacon fallback:** If the page unloads, uses `navigator.sendBeacon()` for best-effort delivery
- **Health checks:** Preflight ping to analytics endpoint at startup; displays connection status in UI

**Example event payload:**
```json
{
  "events": [
    {
      "eventType": "iframe_load",
      "url": "https://example.com",
      "mode": "direct",
      "timestamp": 1692345678000,
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "batchId": "uuid-here",
  "clientId": "persistent-local-storage-id"
}
```

---

### 2. Secure Header Injection (Proxy)

If you control the proxy, you can inject custom headers server-side:

**Client flow:**
1. User enters URL and headers in UI.
2. Client POSTs to proxy with `X-Proxy-Token` header.
3. Proxy validates token, fetches the target page server-side, injects headers, returns content.

**Fallback (if proxy unavailable):**
- Client appends headers as `__headers` query parameter (URL-encoded).
- Server-side, you can parse `__headers` and apply them.

**Why this matters:** Some headers (e.g., `Authorization`, `X-Custom-Auth`) are blocked by CORS; the proxy lets you inject them server-side.

---

### 3. SHA-256 Query Encryption

Enable in the UI to hash the query string client-side:

```
Original: ?url=https://example.com&headers={"Authorization":"Bearer xyz"}
Hashed:   ?h=abc123def456... (SHA-256)
```

**Server-side verification:** Compute the same hash and compare. If using the proxy, it can extract the original query from the `h=` parameter.

---

### 4. URL Modes

| Mode | Format | Example |
|------|--------|---------|
| **Direct** | Loads URL as-is | `https://example.com` |
| **/embed** | Appends `/embed` to URL | `https://example.com/embed` |
| **/viewer** | Appends `/viewer` to URL | `https://example.com/viewer` |
| **UTM** | Adds UTM parameters | `https://example.com?utm_source=...` |
| **SmartPath** | Combines custom path + UTM | `https://example.com/my/path?utm_source=...` |
| **Custom Path** | User-defined path routing | User defines structure |

---

### 5. Presets (Import/Export)

Use `presets.json` to define templates:

```json
{
  "presets": [
    {
      "name": "YouTube Embed",
      "url": "https://www.youtube.com/embed/{id}",
      "mode": "direct",
      "sandbox": "allow-scripts allow-same-origin",
      "defaultHeaders": {}
    },
    {
      "name": "GitHub Repo",
      "url": "https://github.com/{owner}/{repo}",
      "mode": "direct",
      "sandbox": "allow-scripts allow-same-origin allow-forms",
      "defaultHeaders": {}
    }
  ]
}
```

**Export:** Click **Export Config** in UI → saves your current settings to a JSON file.
**Import:** Click **Import Preset** → load a previously saved config.

---

### 6. Preflight Health Checks

On startup, V3 pings both the proxy and analytics endpoints to detect:
- **200 OK:** Connected
- **401/403:** Authentication error (wrong token)
- **5xx:** Server error
- **Timeout:** Network unreachable

Status is displayed in a collapsible panel. Useful for debugging in production.

---

### 7. CSP & Sandbox Attributes

V3 sets sensible iframe sandbox defaults but respects your overrides:

```javascript
// Default sandbox attributes (from app.js):
const defaultSandbox = [
  "allow-scripts",
  "allow-same-origin",
  "allow-popups",
  "allow-forms"
];
```

**Adjust based on your trust model:**
- Remove `allow-scripts` if you don't trust the iframe content.
- Remove `allow-popups` to prevent new windows.
- Add `allow-top-navigation` only if you trust full page control.

---

## Server Setup (Optional)

### Proxy Server (`proxy-server.js`)

A lightweight Express server that injects headers server-side.

**Environment variables:**
- `PROXY_TOKEN` (required): Bearer token for authentication
- `PORT_PROXY` (default: 3000): Port to listen on
- `ALLOWED_ORIGINS` (default: `*`): CORS origins

**Endpoint:**
```
POST /fetch
Headers:
  X-Proxy-Token: <PROXY_TOKEN>
  Content-Type: application/json

Body:
{
  "url": "https://example.com",
  "headers": {
    "Authorization": "Bearer secret",
    "X-Custom-Header": "value"
  }
}

Response: 200 OK
{
  "content": "<html>...</html>",
  "contentType": "text/html",
  "statusCode": 200
}
```

**Error responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: URL origin not allowed
- `500 Internal Server Error`: Fetch failed

---

### Analytics Server (`analytics-server.js`)

Collects and stores analytics events.

**Environment variables:**
- `PORT_ANALYTICS` (default: 4000): Port to listen on
- `ANALYTICS_LOG_DIR` (default: `./analytics-logs`): Directory for event files
- `ANALYTICS_BATCH_INTERVAL` (default: 10000ms): How often to flush to disk

**Endpoints:**

#### POST /collect
```
Content-Type: application/json

Body:
{
  "events": [
    {
      "eventType": "iframe_load",
      "url": "https://example.com",
      "timestamp": 1692345678000
    }
  ],
  "clientId": "abc123",
  "batchId": "xyz789"
}

Response: 202 Accepted
{ "status": "queued", "batchId": "xyz789" }
```

#### GET /health
```
Response: 200 OK
{
  "status": "ok",
  "uptime": 3600,
  "eventsCollected": 1234
}
```

**Output:** Events are written to `./analytics-logs/events-YYYY-MM-DD.jsonl` (one event per line).

---

## Security & Production Guidelines

### API Keys & Secrets

**❌ Never:**
- Commit `.env` files
- Embed `PROXY_TOKEN` or secrets in client JavaScript
- Log sensitive data to browser console (in production)

**✅ Always:**
- Store secrets in environment variables or your cloud platform's secret store
- Rotate tokens periodically
- Use TLS (HTTPS) for all production endpoints
- Validate tokens server-side before processing requests

---

### Proxy Security

1. **Deploy under your control:** Use Vercel, Heroku, AWS Lambda, or your private infrastructure.
2. **Enforce HTTPS:** Never expose proxy over HTTP.
3. **Token rotation:** Change `PROXY_TOKEN` monthly or after suspected compromise.
4. **URL allowlisting (optional):** Add logic to proxy-server.js to only fetch from trusted domains.

Example allowlist:
```javascript
const ALLOWED_DOMAINS = new Set([
  'example.com',
  'github.com',
  'youtube.com'
]);

const url = new URL(req.body.url);
if (!ALLOWED_DOMAINS.has(url.hostname)) {
  return res.status(403).json({ error: 'Domain not allowed' });
}
```

---

### Analytics Privacy

1. **Minimize data collection:** Only collect what you need (URL, timestamp, event type).
2. **Anonymize user identifiers:** Use a hash or UUID instead of IP addresses or user emails.
3. **Data retention:** Delete old analytics after 90 days (GDPR/CCPA compliance).
4. **Compliance:** Add a privacy policy; inform users about analytics collection.

---

### CORS & Content Security Policy

**CORS headers (set in proxy or analytics server):**
```javascript
res.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
res.set('Access-Control-Allow-Headers', 'Content-Type, X-Proxy-Token');
```

**Content Security Policy (in index.html):**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  frame-src *;
  connect-src 'self' https:;
">
```

---

## Bonus: FAULTLINE Game

This repo also ships **FAULTLINE**, a fast-paced endless combat game built into the same codebase. Fight enemies, dodge obstacles, and upgrade your arsenal.

### Game Features

- **Responsive combat system:** Fast-paced real-time action with precise hit detection
- **Multiple weapons:** AR, SMG, Shotgun, Pistol — each with unique fire rates, spread, and reload times
- **Advanced player movement:** Wall jumps, double jumps, air strafing, sliding, dashing, and ledge climbing
- **AI enemies:** Dynamic difficulty; bosses learn and counter your tactics (optional AI learning mode)
- **Ragdoll physics:** Defeated enemies ragdoll dynamically; bullets have realistic impulse
- **Advanced settings:** Customize enemy AI, difficulty scaling, weapon balance, and movement parameters
- **Endless mode:** Infinite waves with progressive difficulty; survival as long as you can
- **Boss encounters:** Special boss enemies with unique patterns and higher health pools

### Game Configuration

All game balance is defined in `app.js` via JavaScript constants:

#### Movement Config (MOVE):
- **Acceleration:** Ground and air movement speeds
- **Jump mechanics:** Double jump, wall jump, jump buffer, coyote frames
- **Strafe system:** Momentum-based air movement with super strafe and ease modes
- **Slide mechanics:** Slide boost, friction, directional tapping windows
- **Dash ability:** Speed, duration, cooldown

#### Weapons (WEAPONS):
```javascript
{
  ar: { damage: 1, spread: 0, fireCooldown: 1/9, clipSize: 60, personality: "STEADY" },
  pistol: { damage: 2, spread: 0.025, fireCooldown: 0.26, clipSize: 12, personality: "HEAVY" },
  smg: { damage: 1, spread: 0.075, fireCooldown: 1/13, clipSize: 36, personality: "SPRAY" },
  shotgun: { damage: 2, spread: 0.28, fireCooldown: 0.72, clipSize: 6, personality: "EMERGENCY" }
}
```

#### Enemy AI & Performance (ENEMY_PERF):
- **Pool max:** Maximum enemies in memory (96)
- **Max onscreen:** Draw limit for performance (24)
- **AI distance:** Full AI beyond 1550px; simple AI at 2450px
- **Batch frames:** Update AI every 3 frames to reduce CPU

#### Animation Frames (PLAYER_PUNCH_FRAMES, PLAYER_KICK_FRAMES):
- **8-frame keyframe arrays:** Precise joint angles for punch and kick animations
- **Lean, reach, bend:** Full body animation with angular constraints
- Smooth interpolation between frames

### How to Adjust Difficulty

**Easier:**
- Increase `ENEMY_PERF.maxOnscreen` (draw more enemies)
- Decrease `ENEMY_STREAM.maxLive` (spawn fewer total)
- Increase weapon `damage`
- Decrease `MOVE.gravity` (floatier feel)

**Harder:**
- Increase `ENEMY_PERF.fullAiDistance` (smarter AI at range)
- Increase `ENEMY_STREAM.refillInterval` (spawn faster)
- Decrease weapon `damage` and increase `fireCooldown`
- Increase `PLAYER_PUNCH_FRAMES` reach to require precision

---

## Troubleshooting

### Q: Iframe doesn't load; I see CORS error in console

**A:** This is expected for third-party sites with strict CORS policies. Solutions:
1. Use the **proxy server** to fetch server-side (header injection mode).
2. Load a site that allows framing (many news sites, GitHub, YouTube do).
3. Test with a local file server that sets permissive CORS headers (see `proxy-server.js` for example).

---

### Q: Analytics events aren't arriving at the server

**A:** Check:
1. Is the analytics server running? (`node analytics-server.js`)
2. Is the endpoint URL correct in the UI?
3. Do browser console logs show fetch errors? (Open DevTools → Network tab)
4. Is CORS enabled on the analytics server? (Proxy sets it by default)

**Debug:** Add this to `app.js` to log all analytics events:
```javascript
console.log('[Analytics]', JSON.stringify(event, null, 2));
```

---

### Q: Proxy returns 401 Unauthorized

**A:** Your token is wrong or missing. Check:
1. Is `PROXY_TOKEN` set in `.env`?
2. Is the token in the UI **Proxy Settings** panel exactly the same as in `.env`?
3. Have you restarted `proxy-server.js` after changing `.env`?

---

### Q: I want to adjust game difficulty / animation speed / weapon balance

**A:** Edit the constants at the top of `app.js`:
- `MOVE`: Player movement and jump mechanics
- `WEAPONS`: Damage, fire rate, spread, reload time
- `ENEMY_PERF`: AI intensity and performance tuning
- `PLAYER_PUNCH_FRAMES` / `PLAYER_KICK_FRAMES`: Animation keyframes

All changes take effect on next page reload (no build required).

---

### Q: How do I deploy to production?

**Static client (V3):**
- GitHub Pages: Push to `gh-pages` branch
- Netlify: Connect repo, auto-deploys on push
- Vercel: Similar to Netlify
- S3 + CloudFront: Upload `index.html`, `app.js`, `styles.css`, `presets.json`, `utils.js`

**Optional servers (proxy + analytics):**
- Proxy: Deploy to Vercel Serverless, Heroku, or your VPS
- Analytics: Small Node app; runs on Heroku free tier or any Node host
- For scale, replace analytics server with managed service (BigQuery, Segment, Amplitude)

---

## License & Contributing

This project is provided as-is for educational and commercial use. Modify and distribute freely with attribution.

**Contributions welcome:** Open issues for bugs, feature requests, or optimizations. PRs gladly accepted.

---

## Quick Links

- **GitHub Issues:** Report bugs and request features
- **Security:** Do not open security issues publicly; email maintainers privately
- **Discussions:** Join conversations about features and best practices

---

**Happy iframe loading! 🚀**
