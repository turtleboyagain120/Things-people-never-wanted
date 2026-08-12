// Utilities used by the UI (browser-only)

// Debounce helper
function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// LocalStorage safe wrapper
const Storage = {
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.warn('Storage.set failed', e); return false; }
  },
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  remove(key) { localStorage.removeItem(key); }
};

// SHA-256 helper (returns hex)
async function sha256Hex(message) {
  const enc = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map(b => b.toString(16).padStart(2,'0')).join('');
}

// Validate and normalize URL-ish strings
function normalizeUrl(input) {
  if (!input) return '';
  let s = input.trim();
  if (!s) return '';
  if (!s.startsWith('http://') && !s.startsWith('https://')) s = 'https://' + s;
  try { const u = new URL(s); return u.toString().replace(/\/+$/, ''); }
  catch (e) { return ''; }
}

// Expose helpers globally for the app
window.UL_UTILS = { debounce, Storage, sha256Hex, normalizeUrl };