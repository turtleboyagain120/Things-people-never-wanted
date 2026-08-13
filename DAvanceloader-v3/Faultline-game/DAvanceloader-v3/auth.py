from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from http.cookies import SimpleCookie
from urllib.parse import urlparse, parse_qs
import hashlib
import json
import os
import secrets
import time

PORT = int(os.environ.get("PORT", "8000"))
USERS_FILE = "python-users.json"
SESSIONS = {}

def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.scrypt(
        password.encode(),
        salt=salt.encode(),
        n=16384,
        r=8,
        p=1
    ).hex()
    return f"{salt}:{digest}"

def verify(password, stored):
    salt, expected = stored.split(":")
    return password_hash(password, salt).split(":")[1] == expected

def load_users():
    if not os.path.exists(USERS_FILE):
        users = {
            f"DaSl{i}": password_hash("GoGo12")
            for i in range(1, 1000)
        }
        with open(USERS_FILE, "w") as file:
            json.dump(users, file, indent=2)

    with open(USERS_FILE) as file:
        return json.load(file)

class LoaderHandler(SimpleHTTPRequestHandler):
    def json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length) or "{}")

    def session(self):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        sid = cookie.get("sid")
        session = SESSIONS.get(sid.value) if sid else None

        if session and session["expires"] < time.time():
            del SESSIONS[sid.value]
            return None

        return session

    def reply(self, status, data, cookie=None):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_GET(self):
        route = parse_qs(urlparse(self.path).query)
        path = urlparse(self.path).path

        if path == "/api/auth/me":
            session = self.session()
            return self.reply(200, {
                "user": {
                    "username": session["username"],
                    "guest": session["guest"],
                    "expiresIn": max(0, int((session["expires"] - time.time()) / 60))
                } if session else None
            })

        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        body = self.json_body()

        if path == "/api/auth/login":
            users = load_users()
            username = body.get("username", "")
            password = body.get("password", "")

            if username not in users or not verify(password, users[username]):
                return self.reply(401, {"error": "Invalid username or password."})

            sid = secrets.token_hex(32)
            SESSIONS[sid] = {
                "username": username,
                "guest": False,
                "expires": time.time() + 86400
            }
            return self.reply(200, {"user": {"username": username, "guest": False}},
                              f"sid={sid}; HttpOnly; SameSite=Lax; Path=/")

        if path == "/api/auth/guest":
            sid = secrets.token_hex(32)
            username = "guest-" + secrets.token_hex(4)
            SESSIONS[sid] = {
                "username": username,
                "guest": True,
                "expires": time.time() + 1200
            }
            return self.reply(200, {
                "user": {"username": username, "guest": True, "expiresIn": 20}
            }, f"sid={sid}; HttpOnly; SameSite=Lax; Path=/")

        if path == "/api/auth/logout":
            return self.reply(200, {"ok": True},
                              "sid=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/")

        return self.reply(404, {"error": "Unknown route."})

if __name__ == "__main__":
    print(f"ADVANCELOADER Python server running at http://localhost:{PORT}")
    ThreadingHTTPServer(("0.0.0.0", PORT), LoaderHandler).serve_forever()