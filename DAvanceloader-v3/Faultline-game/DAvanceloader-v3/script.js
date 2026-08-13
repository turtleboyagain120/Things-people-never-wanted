"use strict";

(() => {
  const CLIENT_KEY = "pidon-cloud-client";
  const SITE_CONFIG_KEY = "pidon-site-config";

  const clientId = localStorage.getItem(CLIENT_KEY) ||
    crypto.randomUUID?.() ||
    `${Date.now()}-${Math.random()}`;

  localStorage.setItem(CLIENT_KEY, clientId);

  function $(id) {
    return document.getElementById(id);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  function normalizeUrl(value) {
    let url = String(value || "").trim();

    if (!url) {
      throw new Error("A destination URL is required.");
    }

    if (!/^[a-z][a-z\d+\-.]*:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs are supported.");
    }

    return parsed.toString();
  }

  function parsePidon(source) {
    const variables = {};

    for (const original of String(source).split(/\r?\n/)) {
      const line = original.trim();

      if (!line || line.startsWith("#") || line.startsWith("//")) {
        continue;
      }

      const assignment = line.match(/^\{([^}]+)\}\s*=\s*(.+)$/);

      if (!assignment) continue;

      const name = assignment[1].trim();
      const raw = assignment[2].trim();

      if (
        (raw.startsWith('"') && raw.endsWith('"')) ||
        (raw.startsWith("'") && raw.endsWith("'"))
      ) {
        variables[name] = raw.slice(1, -1);
      } else if (/^(true|false)$/i.test(raw)) {
        variables[name] = raw.toLowerCase() === "true";
      } else if (/^-?\d+(?:\.\d+)?$/.test(raw)) {
        variables[name] = Number(raw);
      } else {
        variables[name] = raw;
      }
    }

    return variables;
  }

  function applyConfig(config) {
    if (!config) return;

    const fieldMap = {
      target: "siteUrl",
      height: "frameHeight",
      zoom: "zoom",
      mode,
      scripts: "allowScripts",
      forms: "allowForms",
      popups: "allowPopups"
    };

    Object.entries(fieldMap).forEach(([key, fieldId]) => {
      const element = $(fieldId);

      if (!element || config[key] === undefined) return;

      if (element.type === "checkbox") {
        element.checked = Boolean(config[key]);
      } else if (key === "target") {
        try {
          element.value = normalizeUrl(config[key]);
        } catch {
          element.value = config[key];
        }
      } else {
        element.value = config[key];
      }

      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });

    if (config.site_name) {
      document.title = `${config.site_name} // CONTROL DECK`;
    }

    const environment = $("environmentStatus");

    if (environment && config.environment) {
      environment.textContent =
        `RUNTIME // ${String(config.environment).toUpperCase()}`;
    }

    localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(config));
  }

  function updateEditor(source) {
    const editor = $("pidonCode");

    if (!editor) return;

    editor.value = source;
    editor.dataset.serverSource = source;

    const values = parsePidon(source);

    applyConfig(values);

    const state = $("pidonState");

    if (state) {
      state.textContent = "SERVER SYNCED";
    }
  }

  async function loadRealLoader() {
    const response = await fetch("/loader.pidon", {
      cache: "no-store",
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error(`Could not load loader.pidon: HTTP ${response.status}`);
    }

    const source = await response.text();
    updateEditor(source);

    return source;
  }

  async function saveRealLoader() {
    const editor = $("pidonCode");

    if (!editor) {
      throw new Error("The loader.pidon editor was not found.");
    }

    const source = editor.value.trim();

    if (!source) {
      throw new Error("loader.pidon cannot be empty.");
    }

    const result = await api("/api/site-loader", {
      method: "PUT",
      body: JSON.stringify({ content: source })
    });

    editor.dataset.serverSource = source;

    const output = $("pidonOutput");

    if (output) {
      output.textContent =
        "loader.pidon updated on the server.\n" +
        "All new visitors will receive this configuration.";
    }

    const state = $("pidonState");

    if (state) {
      state.textContent = "SERVER UPDATED";
    }

    return result;
  }

  function installEditorSync() {
    const editor = $("pidonCode");
    const download = $("downloadPidon");

    if (!editor) return;

    const saveButton = document.createElement("button");

    saveButton.type = "button";
    saveButton.className = "tool";
    saveButton.id = "saveGlobalLoader";
    saveButton.textContent = "SAVE GLOBAL LOADER";

    const toolbar = document.querySelector(
      "#runPidon"
    )?.parentElement;

    if (toolbar && !$(saveButton.id)) {
      toolbar.appendChild(saveButton);
    }

    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      saveButton.textContent = "SAVING...";

      try {
        await saveRealLoader();
        saveButton.textContent = "GLOBAL SAVED";
      } catch (error) {
        saveButton.textContent = "SAVE FAILED";

        const output = $("pidonOutput");

        if (output) {
          output.classList.add("error");
          output.textContent = error.message;
        }
      } finally {
        setTimeout(() => {
          saveButton.disabled = false;
          saveButton.textContent = "SAVE GLOBAL LOADER";
        }, 1600);
      }
    });

    if (download) {
      download.addEventListener("click", () => {
        editor.dataset.serverSource = editor.value;
      });
    }

    let changeTimer;

    editor.addEventListener("input", () => {
      clearTimeout(changeTimer);

      changeTimer = setTimeout(() => {
        const state = $("pidonState");

        if (state) {
          state.textContent = "UNSAVED EDIT";
        }
      }, 100);
    });
  }

  async function refreshServerLoader() {
    try {
      const source = await loadRealLoader();
      window.PidonLoaderSource = source;
    } catch (error) {
      console.warn("[PIDON] loader.pidon sync failed:", error);

      try {
        const cached = JSON.parse(
          localStorage.getItem(SITE_CONFIG_KEY) || "null"
        );

        if (cached) applyConfig(cached);
      } catch {
        // Ignore invalid cached configuration.
      }
    }
  }

  async function register(username, password) {
    return api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  }

  async function login(username, password) {
    return api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  }

  async function guest() {
    return api("/api/auth/guest", {
      method: "POST",
      body: "{}"
    });
  }

  async function logout() {
    return api("/api/auth/logout", {
      method: "POST",
      body: "{}"
    });
  }

  async function claimCloud() {
    return api("/api/cloud/claim", {
      method: "POST",
      headers: { "X-Cloud-Client": clientId },
      body: JSON.stringify({ client: clientId })
    });
  }

  async function cloudHeartbeat() {
    return api("/api/cloud/heartbeat", {
      method: "POST",
      headers: { "X-Cloud-Client": clientId },
      body: JSON.stringify({ client: clientId })
    });
  }

  window.PidonRuntime = Object.freeze({
    version: "2.3-browser",
    normalizeUrl,
    parsePidon,
    loadRealLoader,
    saveRealLoader,
    register,
    login,
    guest,
    logout,
    claimCloud,
    cloudHeartbeat
  });

  function start() {
    installEditorSync();
    refreshServerLoader();

    claimCloud().catch(() => {});

    setInterval(() => {
      cloudHeartbeat().catch(() => {});
    }, 15000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();