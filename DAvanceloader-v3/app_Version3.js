// Main app logic — browser-run V3
// Features:
// - buildUrl with modes (direct, /embed, /viewer, UTM, smart, custom)
// - analytics queue with batching, exponential backoff, sendBeacon fallback
// - proxy fallback: POST /fetch to optional proxy; fallback to encoded headers param
// - presets loading
// - preflight health for proxy & analytics endpoint

(async function () {
  const { Storage, sha256Hex, normalizeUrl } = window.UL_UTILS;

  const DEFAULT_PROXY = null; // change to URL of your deployed proxy, e.g. "https://my-proxy.example"
  const DEFAULT_ANALYTICS = ''; // set in UI

  // Load presets
  let PRESETS = {};
  try {
    const r = await fetch('presets.json');
    PRESETS = await r.json();
  } catch (e) {
    console.warn('Presets load failed, continuing without presets', e);
  }

  // Analytics queue class
  class Analytics {
    constructor(endpoint = '') {
      this.endpoint = endpoint;
      this.queue = [];
      this.failed = 0;
      this.isFlushing = false;
      this._timer = null;
    }

    enqueue(type, data) {
      this.queue.push({ type, data, ts: Date.now(), retries: 0 });
      this._updateUi();
      this._scheduleFlush(1500);
    }

    _scheduleFlush(delay = 1500) {
      if (this._timer) return;
      this._timer = setTimeout(() => {
        this._timer = null;
        this.flush().catch(() => {});
      }, delay);
    }

    async flush() {
      if (this.isFlushing || this.queue.length === 0) return;
      if (!this.endpoint) return;

      this.isFlushing = true;
      const batch = this.queue.splice(0, 25);

      try {
        const resp = await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch, sentAt: new Date().toISOString() })
        });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        this.failed = Math.max(0, this.failed - batch.length);
      } catch (err) {
        console.warn('Analytics flush error', err);
        this.failed += batch.length;
        batch.forEach(ev => {
          ev.retries = (ev.retries || 0) + 1;
          if (ev.retries < 6) {
            const delay = Math.min(60000, 1000 * Math.pow(2, ev.retries));
            setTimeout(() => { this.queue.push(ev); this._scheduleFlush(); }, delay);
          }
        });
      } finally {
        this.isFlushing = false;
        this._updateUi();
      }
    }

    export() {
      return JSON.stringify(this.queue, null, 2);
    }

    clear() {
      this.queue.length = 0;
      this.failed = 0;
      this._updateUi();
    }

    sendBeaconOnUnload() {
      try {
        if (!this.endpoint || this.queue.length === 0) return;
        const payload = JSON.stringify({ events: this.queue, sentAt: new Date().toISOString() });
        navigator.sendBeacon(this.endpoint, new Blob([payload], { type: 'application/json' }));
        this.queue.length = 0;
      } catch (e) { /* best-effort */ }
    }

    _updateUi() {
      const el = document.getElementById('queueStatus');
      if (el) el.textContent = `Queue: ${this.queue.length} events | Failed: ${this.failed}`;
    }
  }

  // Local AI heuristics (no external calls)
  const aiLocal = {
    analyze(url) {
      if (!url) return null;
      const u = url.toLowerCase();
      if (u.includes('youtube.com') || u.includes('vimeo.com')) {
        return { contentType: 'video', recommend: { sandbox: 'allow-scripts', aspect: '16:9', scrolling: 'no' } };
      }
      if (u.includes('github.com')) {
        return { contentType: 'repo', recommend: { sandbox: 'allow-scripts allow-same-origin', aspect: '4:3' } };
      }
      if (u.includes('docs.google.com')) {
        return { contentType: 'document', recommend: { sandbox: 'allow-scripts allow-forms', aspect: '4:3' } };
      }
      return { contentType: 'webpage', recommend: {} };
    },
    suggestEncrypt(url) {
      return /\/admin|secure|token|session|auth|login|checkout/i.test(url);
    }
  };

  // Elements
  const $ = id => document.getElementById(id);
  function show(el){ if(!el) return; el.classList.remove('hidden'); }
  function hide(el){ if(!el) return; el.classList.add('hidden'); }

  // Build final URL with mode and UTM
  async function buildUrl() {
    const raw = $('siteUrl').value.trim();
    const base = normalizeUrl(raw);
    if (!base) return 'about:blank';
    let url = base;
    const mode = $('mode').value;

    if (mode === 'customPath') {
      const p = $('customPath').value.trim();
      if (p) url = url.replace(/\/+$/, '') + '/' + p.replace(/^\//, '');
    } else if (mode === 'pathEmbed') {
      url = url.replace(/\/+$/, '') + '/embed';
    } else if (mode === 'pathViewer') {
      url = url.replace(/\/+$/, '') + '/viewer';
    } else if (mode === 'queryUTM') {
      const sep = url.includes('?') ? '&' : '?';
      const s = encodeURIComponent($('utmSource').value.trim() || 'iframe_loader');
      const m = encodeURIComponent($('utmMedium').value.trim() || 'embed');
      const c = encodeURIComponent($('utmCampaign').value.trim() || 'custom_viewer');
      const t = encodeURIComponent($('utmTerm').value.trim() || '');
      const co = encodeURIComponent($('utmContent').value.trim() || '');
      url = `${url}${sep}utm_source=${s}&utm_medium=${m}&utm_campaign=${c}`;
      if (t) url += `&utm_term=${t}`;
      if (co) url += `&utm_content=${co}`;
    } else if (mode === 'smartPath') {
      url = await smartPathDetection(url);
    }

    if ($('encryptParams').checked && url.includes('?')) {
      const [baseOnly, qs] = url.split('?');
      const h = await sha256Hex(qs);
      url = `${baseOnly}?h=${h}&qs=${encodeURIComponent(qs)}`;
    }

    return url;
  }

  // Smart path detection (local heuristics only)
  async function smartPathDetection(url) {
    const u = url.toLowerCase();
    if (u.includes('youtube.com')) return url.replace(/\/+$/, '') + '/embed';
    if (u.includes('github.com')) return url.replace(/\/+$/, '') + '/dashboard';
    if (u.includes('docs.google.com')) return url.replace(/\/+$/, '') + '/viewer';
    return url;
  }

  // Attempt to fetch via proxy (POST /fetch with { target, headers })
  async function fetchWithProxy(proxyUrl, target, headers) {
    try {
      const res = await fetch(proxyUrl + '/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, headers })
      });
      if (!res.ok) throw new Error('Proxy returned ' + res.status);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn('Proxy fetch failed', e);
      throw e;
    }
  }

  // Fallback: encode headers into URL as __headers param (server-side must decode)
  function encodeHeadersIntoUrl(url, headers) {
    const headerData = btoa(JSON.stringify(headers));
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + '__headers=' + encodeURIComponent(headerData);
  }

  // Wire up UI and behavior
  document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const modeEl = $('mode');
    const customPathContainer = $('customPathContainer');
    const utmPanel = $('utmPanel');
    const loadBtn = $('loadBtn');
    const openNewTab = $('openNewTab');
    const resetBtn = $('resetBtn');
    const flushBtn = $('flushBtn');
    const clearQueueBtn = $('clearQueueBtn');
    const exportBtn = $('exportEvents');
    const importBtn = $('importSettings');
    const analyticsEndpointInput = $('analyticsEndpoint');
    const aiStatus = $('aiStatus');

    // analytics
    const analytics = new Analytics( Storage.get('iframe_analytics_endpoint', DEFAULT_ANALYTICS) );
    if (analytics.endpoint) analytics._updateUi();

    // apply presets UI if any (we have presets.json)
    if (PRESETS && Object.keys(PRESETS).length) {
      // example: apply default preset into fields (non-invasive)
      const defaultPreset = PRESETS.default;
      if (defaultPreset) {
        $('utmSource').value = defaultPreset.utm_source || 'iframe_loader';
        $('utmMedium').value = defaultPreset.utm_medium || 'embed';
        $('utmCampaign').value = defaultPreset.utm_campaign || 'custom_viewer';
      }
    }

    // toggles
    modeEl.addEventListener('change', () => {
      const m = modeEl.value;
      if (m === 'customPath') show(customPathContainer); else hide(customPathContainer);
      if (m === 'queryUTM') show(utmPanel); else hide(utmPanel);
    });

    // load action
    loadBtn.addEventListener('click', async () => {
      loadBtn.disabled = true;
      try {
        const url = await buildUrl();
        const analysis = aiLocal.analyze(url);
        aiStatus.textContent = `AI: ${analysis.contentType}`;

        const headers = {};
        const t = $('headerTracking').value.trim();
        const s = $('headerSource').value.trim();
        const c = $('headerCampaign').value.trim();
        if (t) headers['X-Tracking-ID'] = t;
        if (s) headers['X-Source'] = s;
        if (c) headers['X-Campaign'] = c;

        let finalUrl = url;
        const proxyBase = DEFAULT_PROXY || Storage.get('iframe_proxy_url', null);
        if (proxyBase && Object.keys(headers).length > 0) {
          try {
            finalUrl = await fetchWithProxy(proxyBase, url, headers);
          } catch (e) {
            // fallback to encoding header into URL
            finalUrl = encodeHeadersIntoUrl(url, headers);
          }
        } else if (Object.keys(headers).length > 0) {
          finalUrl = encodeHeadersIntoUrl(url, headers);
        }

        const iframe = $('viewer');
        iframe.src = finalUrl;

        analytics.enqueue('iframe_loaded', {
          url: finalUrl,
          mode: $('mode').value,
          headersInjected: Object.keys(headers).length > 0,
          encrypted: $('encryptParams').checked,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          ua: navigator.userAgent.slice(0,120)
        });

      } catch (err) {
        alert('Load failed: ' + (err.message || err));
      } finally {
        loadBtn.disabled = false;
      }
    });

    openNewTab.addEventListener('click', async () => {
      const url = await buildUrl();
      window.open(url, '_blank');
    });

    resetBtn.addEventListener('click', () => {
      $('siteUrl').value = '';
      $('mode').value = 'direct';
      $('customPath').value = '';
      $('utmSource').value = 'iframe_loader';
      $('utmMedium').value = 'embed';
      $('utmCampaign').value = 'custom_viewer';
      $('headerTracking').value = '';
      $('headerSource').value = '';
      $('headerCampaign').value = '';
      $('encryptParams').checked = false;
      analytics.clear();
      aiStatus.textContent = 'AI: idle (local)';
    });

    flushBtn.addEventListener('click', () => {
      const ep = analyticsEndpointInput.value.trim();
      if (!ep) return alert('Set analytics endpoint first');
      analytics.endpoint = ep;
      Storage.set('iframe_analytics_endpoint', ep);
      void analytics.flush();
    });

    clearQueueBtn.addEventListener('click', () => analytics.clear());

    exportBtn.addEventListener('click', () => {
      const data = analytics.export();
      if (!data || data === '[]') return alert('No events to export');
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iframe-analytics-' + new Date().toISOString().slice(0,10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    importBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = e => {
        const f = e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = ev => {
          try {
            const s = JSON.parse(ev.target.result);
            if (s.analyticsEndpoint) analytics.endpoint = s.analyticsEndpoint;
            if (s.siteUrl) $('siteUrl').value = s.siteUrl;
            if (s.mode) $('mode').value = s.mode;
            alert('Settings imported (basic fields applied).');
          } catch (err) { alert('Failed to import settings'); }
        };
        r.readAsText(f);
      };
      input.click();
    });

    // unload sendBeacon
    window.addEventListener('beforeunload', () => analytics.sendBeaconOnUnload());

    // initial UI defaults
    $('utmSource').value = 'iframe_loader';
    $('utmMedium').value = 'embed';
    $('utmCampaign').value = 'custom_viewer';
    modeEl.dispatchEvent(new Event('change'));

    // Preflight checks (proxy & analytics) with UI indicator
    (async function preflight() {
      const proxyUrl = DEFAULT_PROXY || Storage.get('iframe_proxy_url', null);
      const aiEl = $('aiStatus');
      aiEl.textContent = 'AI: running preflight checks...';
      try {
        const ep = analytics.endpoint || $('analyticsEndpoint').value.trim();
        if (ep) {
          try {
            const r = await fetch(ep, { method: 'OPTIONS' });
            // server might respond 404 or forbid OPTIONS; treat reachable vs unreachable
            console.info('Analytics endpoint preflight', r.status);
          } catch (e) {
            console.warn('Analytics endpoint unreachable', e);
          }
        }
        if (proxyUrl) {
          try {
            const r = await fetch(proxyUrl + '/health');
            if (r.ok) console.info('Proxy healthy');
          } catch (e) { console.warn('Proxy health check failed', e); }
        }
      } finally {
        aiEl.textContent = 'AI: idle (local)';
      }
    })();

  });

})();