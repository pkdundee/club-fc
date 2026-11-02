// Club FC: shared helpers. Everything lives on window.CFC.
window.CFC = window.CFC || {};
(function (C) {
  C.$ = (s, r = document) => r.querySelector(s);
  C.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  C.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  C.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  C.now = () => Date.now();
  C.todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

  // 48200 -> "48.2K"
  C.short = n => { n = Math.round(n); const a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return String(n); };
  C.ord = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  C.money = n => '$' + Math.round(n).toLocaleString('en-US');

  // seconds -> "1h 51m" / "4d 2h" / "45s"
  C.dur = s => { s = Math.max(0, Math.ceil(s));
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    if (d) return d + 'd ' + (h ? h + 'h' : '').trim();
    if (h) return h + 'h ' + (m ? m + 'm' : '').trim();
    if (m) return m + 'm' + (x && m < 10 ? ' ' + x + 's' : '');
    return x + 's'; };

  // colour helpers (hex in, hex/rgb out)
  C.shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
    const m = v => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f); return `rgb(${m(r)},${m(g)},${m(b)})`; };

  // deterministic RNG (mulberry32)
  C.rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  C.GEM = '<i class="coin"></i>';  // the premium currency (Coins), drawn the same way everywhere
  C.crestSVG = (c1, c2, letters, size = 40) => `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true"><path d="M20 2 L37 8 V20 C37 30 29 36 20 39 C11 36 3 30 3 20 V8 Z" fill="${c1}" stroke="${c2}" stroke-width="2.5"/><path d="M20 7 L32 11 V20 C32 27 26 32 20 34 C14 32 8 27 8 20 V11Z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/><text x="20" y="25" text-anchor="middle" font-family="Graduate,serif" font-size="${letters.length > 2 ? 10 : 12}" fill="#fff">${letters}</text><path d="M12 30 Q20 26 28 30" stroke="${c2}" stroke-width="2" fill="none"/></svg>`;

  C.ringSVG = (pct, col, size = 54, w = 4) => { const r = (size - w) / 2, c = 2 * Math.PI * r;
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="${w}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${c * C.clamp(pct, 0, 1)} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`; };

  C.seatIcon = (c = '#1e3a8a') => `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v8H5V4a1 1 0 0 1 1-1z" fill="${c}"/><path d="M4 12h16l-1.5 4h-13z" fill="${c}" opacity=".85"/><path d="M6.5 16v5M17.5 16v5M5 21h3M16 21h3" stroke="#475569" stroke-width="1.6" stroke-linecap="round"/></svg>`;
})(window.CFC);
