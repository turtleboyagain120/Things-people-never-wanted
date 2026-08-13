<?php
declare(strict_types=1);

const GUEST_TIMEOUT = 1200;
const LOGIN_WINDOW = 900;
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_BODY_BYTES = 65536;
const APP_ENV = 'production';

$isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', $isHttps ? '1' : '0');
ini_set('session.cookie_samesite', 'Lax');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: same-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

if ($isHttps) {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}

function respond(array $data, int $status = 200, array $headers = []): never
{
    http_response_code($status);

    foreach ($headers as $name => $value) {
        header("$name: $value");
    }

    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): never
{
    respond(['error' => $message], $status);
}

function methodIs(string ...$methods): bool
{
    return in_array($_SERVER['REQUEST_METHOD'] ?? '', $methods, true);
}

function getAction(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';

    $pathMap = [
        '/api/auth/login' => 'login',
        '/api/auth/logout' => 'logout',
        '/api/auth/guest' => 'guest',
        '/api/auth/me' => 'me',
        '/api/settings' => 'settings'
    ];

    if (isset($pathMap[$path])) {
        return $pathMap[$path];
    }

    return preg_replace(
        '/[^a-z0-9_-]/i',
        '',
        (string)($_GET['action'] ?? '')
    );
}

function readJsonBody(): array
{
    $length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);

    if ($length > MAX_BODY_BYTES) {
        fail('Request body is too large.', 413);
    }

    $raw = file_get_contents('php://input') ?: '';

    if ($raw === '') {
        return [];
    }

    $data = json_decode($raw, true);

    if (!is_array($data)) {
        fail('Invalid JSON request.', 400);
    }

    return $data;
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function requireCsrf(array $input): void
{
    $provided = (string)(
        $input['csrf_token']
        ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')
    );

    if (
        empty($_SESSION['csrf_token'])
        || $provided === ''
        || !hash_equals($_SESSION['csrf_token'], $provided)
    ) {
        fail('CSRF token validation failed.', 403);
    }
}

function requestOriginIsAllowed(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin === '') {
        return true;
    }

    $host = $_SERVER['HTTP_HOST'] ?? '';
    $scheme = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'
        ? 'https'
        : 'http';

    return hash_equals("$scheme://$host", $origin);
}

function requireAllowedOrigin(): void
{
    if (!requestOriginIsAllowed()) {
        fail('Request origin is not allowed.', 403);
    }
}

function validateUsername(string $username): bool
{
    return (bool)preg_match(
        '/^DaSl(?:[1-9]|[1-9][0-9]|[1-9][0-9]{2})$/',
        $username
    );
}

function validatePassword(string $password): bool
{
    return $password !== '' && strlen($password) <= 256;
}

function clientIp(): string
{
    $remote = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    if (
        getenv('TRUST_PROXY') === '1'
        && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])
    ) {
        return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }

    return $remote;
}

function rateKey(string $username): string
{
    return hash(
        'sha256',
        clientIp() . '|' . strtolower($username)
    );
}

function checkRateLimit(PDO $db, string $key): void
{
    $query = $db->prepare(
        'SELECT attempts, window_started
         FROM login_attempts
         WHERE rate_key = ?
         LIMIT 1'
    );
    $query->execute([$key]);
    $row = $query->fetch();

    if (!$row) {
        return;
    }

    if (time() - (int)$row['window_started'] >= LOGIN_WINDOW) {
        $db->prepare(
            'DELETE FROM login_attempts WHERE rate_key = ?'
        )->execute([$key]);

        return;
    }

    if ((int)$row['attempts'] >= MAX_LOGIN_ATTEMPTS) {
        fail('Too many login attempts. Try again later.', 429);
    }
}

function recordFailedLogin(PDO $db, string $key): void
{
    $now = time();

    $query = $db->prepare(
        'SELECT attempts, window_started
         FROM login_attempts
         WHERE rate_key = ?
         LIMIT 1'
    );
    $query->execute([$key]);
    $row = $query->fetch();

    if (!$row || $now - (int)$row['window_started'] >= LOGIN_WINDOW) {
        $statement = $db->prepare(
            'INSERT OR REPLACE INTO login_attempts
             (rate_key, attempts, window_started)
             VALUES (?, 1, ?)'
        );
        $statement->execute([$key, $now]);
        return;
    }

    $statement = $db->prepare(
        'UPDATE login_attempts
         SET attempts = attempts + 1
         WHERE rate_key = ?'
    );
    $statement->execute([$key]);
}

function clearFailedLogins(PDO $db, string $key): void
{
    $db->prepare(
        'DELETE FROM login_attempts WHERE rate_key = ?'
    )->execute([$key]);
}

function destroyCurrentSession(PDO $db): void
{
    if (!empty($_SESSION['guest']) && !empty($_SESSION['username'])) {
        $delete = $db->prepare(
            'DELETE FROM guest_sessions WHERE username = ?'
        );
        $delete->execute([$_SESSION['username']]);
    }

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();

        setcookie(
            session_name(),
            '',
            [
                'expires' => time() - 42000,
                'path' => $params['path'] ?? '/',
                'secure' => (bool)($params['secure'] ?? false),
                'httponly' => (bool)($params['httponly'] ?? true),
                'samesite' => $params['samesite'] ?? 'Lax'
            ]
        );
    }

    session_destroy();
}

function activeSession(PDO $db): ?array
{
    if (empty($_SESSION['username'])) {
        return null;
    }

    $username = (string)$_SESSION['username'];
    $guest = !empty($_SESSION['guest']);

    if (!$guest) {
        return [
            'username' => $username,
            'guest' => false,
            'loginTime' => $_SESSION['login_time'] ?? null
        ];
    }

    $expires = (int)($_SESSION['expires'] ?? 0);

    if ($expires <= time()) {
        $db->prepare(
            'DELETE FROM guest_sessions WHERE username = ?'
        )->execute([$username]);

        destroyCurrentSession($db);
        return null;
    }

    return [
        'username' => $username,
        'guest' => true,
        'expiresIn' => max(0, (int)ceil(($expires - time()) / 60))
    ];
}

try {
    $db = new PDO(
        'sqlite:' . __DIR__ . '/loader.sqlite',
        null,
        null,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ]
    );

    $db->exec('PRAGMA busy_timeout = 5000');
    $db->exec('PRAGMA journal_mode = WAL');

    $db->exec(
        'CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password_hash TEXT NOT NULL,
            settings TEXT NOT NULL DEFAULT "{}",
            failed_attempts INTEGER NOT NULL DEFAULT 0,
            locked_until INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS guest_sessions (
            session_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            expires_at INTEGER NOT NULL,
            settings TEXT NOT NULL DEFAULT "{}",
            created_at INTEGER NOT NULL
        )'
    );

    $db->exec(
        'CREATE TABLE IF NOT EXISTS login_attempts (
            rate_key TEXT PRIMARY KEY,
            attempts INTEGER NOT NULL DEFAULT 0,
            window_started INTEGER NOT NULL
        )'
    );

    $db->exec(
        'CREATE INDEX IF NOT EXISTS idx_guest_expiry
         ON guest_sessions(expires_at)'
    );

    $db->exec(
        'DELETE FROM guest_sessions WHERE expires_at <= ' . time()
    );

    if (getenv('APP_ENV') === 'development') {
        $insert = $db->prepare(
            'INSERT OR IGNORE INTO users
             (username, password_hash, settings, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)'
        );

        $now = time();

        for ($i = 1; $i <= 999; $i++) {
            $insert->execute([
                "DaSl$i",
                password_hash('GoGo12', PASSWORD_DEFAULT),
                '{}',
                $now,
                $now
            ]);
        }
    }

    $action = getAction();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $input = readJsonBody();

    if ($action === 'me' && $method === 'GET') {
        $user = activeSession($db);

        respond([
            'user' => $user,
            'csrf_token' => $user ? csrfToken() : null
        ]);
    }

    if ($action === 'login' && $method === 'POST') {
        requireAllowedOrigin();

        $username = trim((string)($input['username'] ?? ''));
        $password = (string)($input['password'] ?? '');

        if (!validateUsername($username)) {
            fail('Username must be DaSl1 through DaSl999.', 400);
        }

        if (!validatePassword($password)) {
            fail('Invalid password.', 400);
        }

        $key = rateKey($username);
        checkRateLimit($db, $key);

        $query = $db->prepare(
            'SELECT * FROM users WHERE username = ? LIMIT 1'
        );
        $query->execute([$username]);
        $user = $query->fetch();

        $lockedUntil = (int)($user['locked_until'] ?? 0);

        if ($lockedUntil > time()) {
            fail('Account temporarily locked. Try again later.', 429);
        }

        $valid = $user
            && password_verify($password, (string)$user['password_hash']);

        if (!$valid) {
            recordFailedLogin($db, $key);

            if ($user) {
                $attempts = (int)$user['failed_attempts'] + 1;
                $lock = $attempts >= MAX_LOGIN_ATTEMPTS
                    ? time() + LOGIN_WINDOW
                    : 0;

                $update = $db->prepare(
                    'UPDATE users
                     SET failed_attempts = ?, locked_until = ?, updated_at = ?
                     WHERE username = ?'
                );
                $update->execute([
                    $attempts,
                    $lock,
                    time(),
                    $username
                ]);
            }

            fail('Invalid username or password.', 401);
        }

        clearFailedLogins($db, $key);

        $db->prepare(
            'UPDATE users
             SET failed_attempts = 0, locked_until = 0, updated_at = ?
             WHERE username = ?'
        )->execute([time(), $username]);

        session_regenerate_id(true);
        $_SESSION = [
            'username' => $username,
            'guest' => false,
            'login_time' => time(),
            'csrf_token' => bin2hex(random_bytes(32))
        ];

        respond([
            'user' => [
                'username' => $username,
                'guest' => false
            ],
            'csrf_token' => csrfToken()
        ]);
    }

    if ($action === 'guest' && $method === 'POST') {
        requireAllowedOrigin();

        $oldSessionId = session_id();

        if (!empty($_SESSION['guest'])) {
            $db->prepare(
                'DELETE FROM guest_sessions WHERE session_id = ?'
            )->execute([$oldSessionId]);
        }

        session_regenerate_id(true);

        $sessionId = session_id();
        $username = 'guest-' . bin2hex(random_bytes(8));
        $expires = time() + GUEST_TIMEOUT;

        $insert = $db->prepare(
            'INSERT INTO guest_sessions
             (session_id, username, expires_at, settings, created_at)
             VALUES (?, ?, ?, ?, ?)'
        );
        $insert->execute([
            $sessionId,
            $username,
            $expires,
            '{}',
            time()
        ]);

        $_SESSION = [
            'username' => $username,
            'guest' => true,
            'expires' => $expires,
            'csrf_token' => bin2hex(random_bytes(32))
        ];

        respond([
            'user' => [
                'username' => $username,
                'guest' => true,
                'expiresIn' => GUEST_TIMEOUT / 60
            ],
            'csrf_token' => csrfToken()
        ]);
    }

    if ($action === 'logout' && $method === 'POST') {
        requireAllowedOrigin();
        requireCsrf($input);
        destroyCurrentSession($db);

        respond(['ok' => true]);
    }

    if ($action === 'settings' && $method === 'GET') {
        $user = activeSession($db);

        if (!$user) {
            fail('Login or guest mode is required.', 401);
        }

        if ($user['guest']) {
            $query = $db->prepare(
                'SELECT settings
                 FROM guest_sessions
                 WHERE username = ?
                 LIMIT 1'
            );
        } else {
            $query = $db->prepare(
                'SELECT settings
                 FROM users
                 WHERE username = ?
                 LIMIT 1'
            );
        }

        $query->execute([$user['username']]);
        $row = $query->fetch();

        $settings = $row
            ? json_decode((string)$row['settings'], true)
            : [];

        respond([
            'settings' => is_array($settings) ? $settings : []
        ]);
    }

    if ($action === 'settings' && in_array($method, ['PUT', 'POST'], true)) {
        requireAllowedOrigin();

        $user = activeSession($db);

        if (!$user) {
            fail('Login or guest mode is required.', 401);
        }

        requireCsrf($input);

        $settings = $input['settings'] ?? [];

        if (!is_array($settings)) {
            fail('Settings must be a JSON object.', 400);
        }

        $settingsJson = json_encode(
            $settings,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES
        );

        if (strlen($settingsJson) > MAX_BODY_BYTES) {
            fail('Settings are too large.', 413);
        }

        if ($user['guest']) {
            $statement = $db->prepare(
                'UPDATE guest_sessions
                 SET settings = ?
                 WHERE username = ?'
            );
        } else {
            $statement = $db->prepare(
                'UPDATE users
                 SET settings = ?, updated_at = ?
                 WHERE username = ?'
            );
        }

        if ($user['guest']) {
            $statement->execute([
                $settingsJson,
                $user['username']
            ]);
        } else {
            $statement->execute([
                $settingsJson,
                time(),
                $user['username']
            ]);
        }

        respond(['ok' => true]);
    }

    fail('Unknown action.', 404);

} catch (JsonException $exception) {
    error_log('Auth JSON error: ' . $exception->getMessage());
    fail('Invalid JSON data.', 400);
} catch (PDOException $exception) {
    error_log('Auth database error: ' . $exception->getMessage());
    fail('Database error.', 500);
} catch (Throwable $exception) {
    error_log('Auth unexpected error: ' . $exception->getMessage());
    fail('Server error.', 500);
}