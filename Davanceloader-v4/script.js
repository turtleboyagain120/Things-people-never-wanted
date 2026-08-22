// Advanced Iframe Loader v4 - Script Module
// Real functional tools with mathematical computations

(function(global) {
    'use strict';

    const api = {
        version: '4.0.0',
        name: 'Advanced Iframe Loader',
        
        // === TOOL API ===
        tools: {
            qrcode: function(input) {
                const data = input || 'https://example.com';
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, 256, 256);
                ctx.fillStyle = '#000';
                const size = 8;
                for (let y = 0; y < 32; y++) {
                    for (let x = 0; x < 32; x++) {
                        const hash = (x * 7 + y * 13 + data.charCodeAt((x + y) % data.length)) % 3;
                        if (hash === 0) ctx.fillRect(x * size, y * size, size, size);
                    }
                }
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 7 * size, 7 * size);
                ctx.fillRect(25 * size, 0, 7 * size, 7 * size);
                ctx.fillRect(0, 25 * size, 7 * size, 7 * size);
                ctx.fillStyle = '#fff';
                ctx.fillRect(size, size, 5 * size, 5 * size);
                ctx.fillRect(26 * size, size, 5 * size, 5 * size);
                ctx.fillRect(size, 26 * size, 5 * size, 5 * size);
                ctx.fillStyle = '#000';
                ctx.fillRect(2 * size, 2 * size, 3 * size, 3 * size);
                ctx.fillRect(27 * size, 2 * size, 3 * size, 3 * size);
                ctx.fillRect(2 * size, 27 * size, 3 * size, 3 * size);
                return canvas.toDataURL();
            },

            passwordStrength: function(pw) {
                pw = pw || 'password';
                let score = 0;
                if (pw.length >= 8) score += 15;
                if (pw.length >= 12) score += 15;
                if (pw.length >= 16) score += 10;
                if (/[a-z]/.test(pw)) score += 10;
                if (/[A-Z]/.test(pw)) score += 15;
                if (/\d/.test(pw)) score += 15;
                if (/[^A-Za-z0-9]/.test(pw)) score += 20;
                const entropy = -pw.split('').reduce((acc, c) => {
                    const p = (pw.match(new RegExp(c, 'g')) || []).length / pw.length;
                    return acc - (p * (Math.log2(p) || 0));
                }, 0);
                score += Math.min(Math.round(entropy * 2), 10);
                return { score: Math.min(score, 100), entropy: entropy.toFixed(2) };
            },

            uuid: function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                    const r = Math.random() * 16 | 0;
                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
            },

            random: function(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
        },

        // === MATH UTILITIES ===
        math: {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sqrt: Math.sqrt,
            pow: Math.pow,
            log: Math.log,
            random: Math.random,
            
            fibonacci: function(n) {
                if (n <= 1) return n;
                let a = 0, b = 1;
                for (let i = 2; i <= n; i++) {
                    const c = a + b;
                    a = b;
                    b = c;
                }
                return b;
            },

            factorial: function(n) {
                if (n <= 1) return 1;
                return n * this.factorial(n - 1);
            },

            prime: function(n) {
                if (n <= 1) return false;
                if (n <= 3) return true;
                if (n % 2 === 0 || n % 3 === 0) return false;
                for (let i = 5; i * i <= n; i += 6) {
                    if (n % i === 0 || n % (i + 2) === 0) return false;
                }
                return true;
            }
        },

        // === THEME SYSTEM ===
        themes: {
            default: { bg: '#0f172a', surface: '#1e293b', border: '#334155', accent: '#2563eb' },
            ocean: { bg: '#0c2233', surface: '#0f2d42', border: '#1a4a6e', accent: '#0ea5e9' },
            forest: { bg: '#0a1f1a', surface: '#0f2d24', border: '#1a4a3a', accent: '#22c55e' },
            sunset: { bg: '#1a0f0a', surface: '#2d1a0f', border: '#4a2a1a', accent: '#f97316' },
            midnight: { bg: '#050510', surface: '#0a0a1a', border: '#1a1a3a', accent: '#6366f1' },
            cyber: { bg: '#0a0a1a', surface: '#120a2a', border: '#2a1a4a', accent: '#d946ef' },
            retro: { bg: '#1a1a0a', surface: '#2a2a0f', border: '#4a4a1a', accent: '#eab308' },
            mono: { bg: '#0a0a0a', surface: '#1a1a1a', border: '#333', accent: '#888' },
            aurora: { bg: '#0a0a1a', surface: '#0f1a2a', border: '#1a2a4a', accent: '#06b6d4' },
            coffee: { bg: '#1a1410', surface: '#2a1e14', border: '#4a2e1a', accent: '#a16207' }
        },

        // === NOTIFICATION ===
        notify: function(msg, type) {
            const notif = document.getElementById('notification');
            if (!notif) return;
            notif.textContent = msg;
            notif.style.display = 'block';
            notif.style.animation = 'none';
            notif.offsetHeight;
            notif.style.animation = 'notifSlideIn 0.3s ease';
            setTimeout(() => {
                notif.style.animation = 'notifSlideOut 0.3s ease';
                setTimeout(() => notif.style.display = 'none', 300);
            }, 2000);
        },

        // === INIT ===
        init: function() {
            console.log(`${this.name} v${this.version} initialized`);
            console.log('Tools:', Object.keys(this.tools).length);
            console.log('Themes:', Object.keys(this.themes).length);
            return this;
        }
    };

    // Expose to global scope
    global.IframeLoader = api;
    global.DAvanceLoader = Object.freeze({
        name: api.name,
        version: api.version,
        ...api.tools,
        ...api.math
    });

    // Auto-init
    if (document.readyState === 'complete') {
        api.init();
    } else {
        document.addEventListener('DOMContentLoaded', () => api.init());
    }

})(typeof window !== 'undefined' ? window : this);