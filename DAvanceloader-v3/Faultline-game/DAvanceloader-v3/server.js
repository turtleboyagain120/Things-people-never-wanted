"use strict";

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "state.db.json");
const LOADER_FILE = path.join(ROOT, "loader.pidon");
const MAX_BODY = 1024 * 1024;
const SESSION_TTL = 24 * 60 * 60 * 1000;
const GUEST_TTL = 20 * 60 * 1000;
const GUEST_COOLDOWN = 2 * 60 * 60 * 1000;
const CLOUD_LEASE_TTL = 30 * 1000;

const ALLOWED_ARTIFACTS = new Set([
  ".pidon",
  ".pbc",
  ".json",
  ".db.json",
  ".env",
  ".toml"
]);

fs.mkdirSync(DATA_DIR, { recursive: true });

const emptyState = {
  users: {},
  sessions: {},
  guestCooldowns: {},
  artifacts: {},
  cloud: {
    holder: null,
    leaseUntil: 0,
    updatedAt: 0
  }
};

function loadState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));

    return {
      ...emptyState,
      ...parsed,
      users: parsed.users || {},
      sessions: parsed.sessions || {},
      guestCooldowns: parsed.guestCooldowns || {},
      artifacts: parsed.artifacts || {},
      cloud: { ...emptyState.cloud, ...(parsed.cloud || {}) }
    };
  } catch {
    return JSON.parse(JSON.stringify(emptyState));
  }
}

let state = loadState();
let saveTimer = null;

function saveState() {
  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    const temporary = `${STATE_FILE}.tmp`;

    fs.writeFileSync(temporary, JSON.stringify(state, null, 2));
    fs.renameSync(temporary, STATE_FILE);
  }, 50);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, expected] = String(stored).split(":");
    const actual = crypto.scryptSync(String(password), salt, 64).toString("hex");

    return expected &&
      actual.length === expected.length &&
      crypto.timingSafeEqual(
        Buffer.from(actual),
        Buffer.from(expected)
      );
  } catch {
    return false;
  }
}

function id(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers
  });

  response.end(JSON.stringify(body));
}

function fail(response, status, message) {
  send(response, status, { error: message });
}

function getCookie(request, name) {
  const entry = (request.headers.cookie || "")
    .split(";")
    .map(value => value.trim())
    .find(value => value.startsWith(`${name}=`));

  return entry
    ? decodeURIComponent(entry.slice(name.length + 1))
    : "";
}

function getSession(request) {
  const token = getCookie(request, "sid");
  const session = state.sessions[token];

  if (!session || session.expiresAt <= Date.now()) {
    if (token) {
      delete state.sessions[token];
      saveState();
    }

    return null;
  }

  return { token, ...session };
}

function requireSession(request, response) {
  const session = getSession(request);

  if (!session) {
    fail(response, 401, "Login is required.");
    return null;
  }

  return session;
}

function readBody(request) {
  return new Promise(resolve => {
    let body = "";

    request.on("data", chunk => {
      body += chunk;

      if (body.length > MAX_BODY) {
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve(null);
      }
    });

    request.on("error", () => resolve(null));
  });
}

function issueSession(username, guest, expiresAt) {
  const token = id();

  state.sessions[token] = {
    username,
    guest,
    expiresAt
  };

  saveState();
  return token;
}

function sessionCookie(token, maxAge) {
  return [
    `sid=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${Math.floor(maxAge / 1000)}`
  ].join("; ");
}

function publicUser(session) {
  if (!session) return null;

  return {
    username: session.username,
    guest: Boolean(session.guest),
    expiresIn: Math.max(
      0,
      Math.ceil((session.expiresAt - Date.now()) / 60000)
    )
  };
}

function safeLoaderSource(source) {
  const value = String(source ?? "");

  if (!value.trim()) {
    throw new Error("loader.pidon cannot be empty.");
  }

  if (value.length > MAX_BODY) {
    throw new Error("loader.pidon is too large.");
  }

  return value.replace(/\r\n/g, "\n");
}

function safeArtifactName(name) {
  const value = String(name || "").trim();

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}$/.test(value)) {
    throw new Error("Invalid artifact name.");
  }

  const extension = value.endsWith(".db.json")
    ? ".db.json"
    : path.extname(value);

  if (!ALLOWED_ARTIFACTS.has(extension)) {
    throw new Error("Unsupported artifact type.");
  }

  return value;
}

function serveStatic(request, response, pathname) {
  const requested = pathname === "/"
    ? "index.html"
    : pathname.replace(/^\/+/, "");

  const filePath = path.normalize(path.join(ROOT, requested));

  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath)) {
    response.writeHead(404);
    return response.end("Not found");
  }

  if (fs.statSync(filePath).isDirectory()) {
    response.writeHead(403);
    return response.end("Forbidden");
  }

  let content = fs.readFileSync(filePath);
  const extension = path.extname(filePath);

  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".pidon": "text/plain; charset=utf-8",
    ".pbc": "application/octet-stream",
    ".toml": "text/plain; charset=utf-8",
    ".env": "text/plain; charset=utf-8"
  };

  if (extension === ".html") {
    content = content.toString("utf8").replace(
      "</body>",
      '<script src="/script.js"></script></body>'
    );
  }

  response.writeHead(200, {
    "Content-Type": types[extension] || "application/octet-stream",
    "Cache-Control": extension === ".pidon" ? "no-store" : "public, max-age=60",
    "X-Content-Type-Options": "nosniff"
  });

  response.end(content);
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(
    request.url,
    `http://${request.headers.host || "localhost"}`
  );

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": request.headers.origin || "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, X-Cloud-Client",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });

    return response.end();
  }

  const session = getSession(request);
  const body = request.method === "GET"
    ? {}
    : await readBody(request);

  if (body === null) {
    return fail(response, 400, "Invalid JSON request.");
  }

  if (requestUrl.pathname === "/api/site-loader" &&
      request.method === "GET") {
    return send(response, 200, {
      filename: "loader.pidon",
      content: fs.existsSync(LOADER_FILE)
        ? fs.readFileSync(LOADER_FILE, "utf8")
        : ""
    });
  }

  if (requestUrl.pathname === "/api/site-loader" &&
      request.method === "PUT") {
    const active = requireSession(request, response);

    if (!active) return;

    if (active.guest) {
      return fail(
        response,
        403,
        "Guest users cannot update the global loader.pidon file."
      );
    }

    try {
      const content = safeLoaderSource(body.content);

      const temporary = `${LOADER_FILE}.tmp`;
      fs.writeFileSync(temporary, content, "utf8");
      fs.renameSync(temporary, LOADER_FILE);

      return send(response, 200, {
        ok: true,
        filename: "loader.pidon",
        updatedAt: Date.now()
      });
    } catch (error) {
      return fail(response, 400, error.message);
    }
  }

  if (!requestUrl.pathname.startsWith("/api/")) {
    if (request.method === "GET") {
      return serveStatic(request, response, requestUrl.pathname);
    }

    response.writeHead(405);
    return response.end("Method not allowed");
  }

  if (requestUrl.pathname === "/api/auth/register" &&
      request.method === "POST") {
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!/^[a-zA-Z0-9_-]{3,40}$/.test(username)) {
      return fail(response, 400, "Invalid username.");
    }

    if (password.length < 8 || password.length > 256) {
      return fail(response, 400, "Password must contain 8-256 characters.");
    }

    if (state.users[username]) {
      return fail(response, 409, "That username already exists.");
    }

    state.users[username] = {
      passwordHash: hashPassword(password),
      settings: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const token = issueSession(
      username,
      false,
      Date.now() + SESSION_TTL
    );

    return send(response, 201, {
      user: publicUser(state.sessions[token])
    }, {
      "Set-Cookie": sessionCookie(token, SESSION_TTL)
    });
  }

  if (requestUrl.pathname === "/api/auth/login" &&
      request.method === "POST") {
    const username = String(body.username || "").trim();
    const user = state.users[username];

    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return fail(response, 401, "Invalid username or password.");
    }

    const token = issueSession(
      username,
      false,
      Date.now() + SESSION_TTL
    );

    return send(response, 200, {
      user: publicUser(state.sessions[token])
    }, {
      "Set-Cookie": sessionCookie(token, SESSION_TTL)
    });
  }

  if (requestUrl.pathname === "/api/auth/guest" &&
      request.method === "POST") {
    const key = request.socket.remoteAddress || "unknown";
    const cooldownUntil = state.guestCooldowns[key] || 0;

    if (cooldownUntil > Date.now()) {
      const minutes = Math.ceil(
        (cooldownUntil - Date.now()) / 60000
      );

      return fail(
        response,
        429,
        `Guest access is cooling down. Try again in ${minutes} minutes.`
      );
    }

    const expiresAt = Date.now() + GUEST_TTL;
    const username = `guest-${id(6)}`;
    const token = issueSession(username, true, expiresAt);

    state.guestCooldowns[key] = expiresAt + GUEST_COOLDOWN;
    saveState();

    return send(response, 200, {
      user: publicUser(state.sessions[token]),
      guestLimitMinutes: 20,
      cooldownMinutes: 120
    }, {
      "Set-Cookie": sessionCookie(token, GUEST_TTL)
    });
  }

  if (requestUrl.pathname === "/api/auth/me" &&
      request.method === "GET") {
    return send(response, {
      user: publicUser(session)
    });
  }

  if (requestUrl.pathname === "/api/auth/logout" &&
      request.method === "POST") {
    const token = getCookie(request, "sid");

    if (token) {
      delete state.sessions[token];
      saveState();
    }

    return send(response, 200, { ok: true }, {
      "Set-Cookie": "sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
    });
  }

  if (requestUrl.pathname === "/api/settings" &&
      ["GET", "PUT"].includes(request.method)) {
    const active = requireSession(request, response);

    if (!active) return;

    if (request.method === "GET") {
      return send(response, 200, {
        settings: active.guest
          ? {}
          : state.users[active.username]?.settings || {}
      });
    }

    if (active.guest) {
      return fail(
        response,
        403,
        "Guest settings are session-only."
      );
    }

    state.users[active.username].settings = body.settings || {};
    state.users[active.username].updatedAt = Date.now();
    saveState();

    return send(response, 200, { ok: true });
  }

  return fail(response, 404, "Unknown API route.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ADVANCELOADER server running at http://localhost:${PORT}`);
});