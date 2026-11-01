// Club FC: code-drawn key art (Phase 9, Q1 option 4). Vector scenes that stay sharp at any size, a crest generator,
// and a drop-in slot for commissioned images: list a file in img/manifest.json and it replaces the drawing once loaded.
(function (C) {
  const R = seed => C.rng(seed);
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  let uid = 0;

  // ---------- image pipeline (Q1 "code changes needed for real images") ----------
  C.ART = { title: 'img/title.webp', arrival: 'img/arrival.webp', signing: 'img/signing.webp', handshake: 'img/handshake.webp', trophy: 'img/trophy.webp' };
  let have = new Set();
  C.loadArtManifest = () => fetch('img/manifest.json').then(r => r.ok ? r.json() : []).then(list => { have = new Set(list); }).catch(() => {});
  // the drawing always shows first; a commissioned image fades in over it when one exists
  C.artSlot = (name, svg, cls = '') => `<div class="artslot ${cls}">${svg}${have.has(C.ART[name].replace('img/', '')) ? `<img src="${C.ART[name]}" alt="" onload="this.classList.add('ok')">` : ''}</div>`;

  // ---------- shared bits ----------
  const stars = (r, n, w, h) => Array.from({ length: n }, () => `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(r() * 1.2 + .3).toFixed(2)}" fill="#fff" opacity="${(r() * .6 + .3).toFixed(2)}"/>`).join('');
  const trees = (r, y, w, cols, n = 26) => { let s = ''; for (let i = 0; i < n; i++) { const x = i * w / n + r() * 10 - 5, h = 26 + r() * 30, c = pick(r, cols); s += `<ellipse cx="${x.toFixed(1)}" cy="${(y - h / 2).toFixed(1)}" rx="${(10 + r() * 8).toFixed(1)}" ry="${(h / 2).toFixed(1)}" fill="${c}"/>`; } return s; };
  const crowd = (r, x0, y0, x1, y1, rows, cols, palette) => { let s = ''; for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { if (r() < .18) continue; const t = j / (cols - 1), u = i / (rows - 1);
    const x = x0 + (x1 - x0) * t + (r() - .5) * 3, y = y0 + (y1 - y0) * u + (x1 - x0 === 0 ? 0 : (t - .5) * 0) + (r() - .5) * 2; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.9 - u * .4).toFixed(2)}" fill="${pick(r, palette)}"/>`; } return s; };
  const flood = (id, x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-2 0 L2 0 L3 150 L-3 150Z" fill="#1f2937"/><rect x="-16" y="-14" width="32" height="16" rx="2" fill="#374151"/>
      ${[-11, -4, 3, 10].map(dx => `<circle cx="${dx}" cy="-6" r="3" fill="#fffbe6"/>`).join('')}<circle cx="0" cy="-6" r="34" fill="url(#${id}glow)"/></g>`;

  // ---------- 1. title scene: a college ground at dusk under the lights ----------
  C.sceneTitle = (c1 = '#1e3a8a', c2 = '#f97316', W = 390, H = 520) => {
    const id = 'ts' + (uid++), r = R(20261101), pal = [c1, c2, '#f8fafc', c1, c2, '#cbd5e1', '#fbbf24'];
    const hy = H * .46;  // horizon
    const fall = ['#b45309', '#c2410c', '#a16207', '#7c2d12', '#365314', '#9a3412'];
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1026"/><stop offset=".45" stop-color="#2a1b4d"/><stop offset=".78" stop-color="#9d3d4f"/><stop offset="1" stop-color="#f59e5b"/></linearGradient>
      <radialGradient id="${id}glow"><stop offset="0" stop-color="#fff7d6" stop-opacity=".9"/><stop offset=".4" stop-color="#fde68a" stop-opacity=".25"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7d3a"/><stop offset="1" stop-color="#4caf50"/></linearGradient>
      <linearGradient id="${id}cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7d6" stop-opacity=".22"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8d7b0" stop-opacity="0"/><stop offset="1" stop-color="#f8d7b0" stop-opacity=".35"/></linearGradient>
      <clipPath id="${id}pc"><path d="M${W * .2} ${hy + 40} L${W * .8} ${hy + 40} L${W * 1.25} ${H} L${-W * .25} ${H}Z"/></clipPath></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}sky)"/>${stars(r, 70, W, hy * .7)}
      <circle cx="${W * .8}" cy="${H * .1}" r="16" fill="#fef3c7"/><circle cx="${W * .8 + 7}" cy="${H * .1 - 4}" r="14" fill="#1a1338"/>
      <!-- campus skyline: clock tower and brick halls -->
      <g fill="#1c1533"><rect x="${W * .06}" y="${hy - 34}" width="64" height="34"/><path d="M${W * .06 - 4} ${hy - 34} L${W * .06 + 32} ${hy - 52} L${W * .06 + 68} ${hy - 34}Z"/>
        <rect x="${W * .3}" y="${hy - 78}" width="18" height="78"/><path d="M${W * .3 - 3} ${hy - 78} L${W * .3 + 9} ${hy - 100} L${W * .3 + 21} ${hy - 78}Z"/><rect x="${W * .62}" y="${hy - 28}" width="90" height="28"/></g>
      <circle cx="${W * .3 + 9}" cy="${hy - 66}" r="5" fill="#fde68a" opacity=".85"/>
      ${[...Array(9)].map((_, i) => `<rect x="${W * .06 + 6 + (i % 5) * 12}" y="${hy - 26 + Math.floor(i / 5) * 12}" width="5" height="6" fill="#fbbf24" opacity="${(.4 + r() * .5).toFixed(2)}"/>`).join('')}
      ${trees(r, hy + 6, W, fall, 30)}
      <!-- light cones -->
      ${[[.14, .2], [.86, .8], [.04, .32], [.96, .68]].map(([fx, tx]) => `<path d="M${W * fx} ${hy - 70} L${W * tx - 70} ${H} L${W * tx + 70} ${H}Z" fill="url(#${id}cone)"/>`).join('')}
      <!-- bleachers with a crowd in school colours -->
      <path d="M0 ${hy + 4} L${W * .32} ${hy + 22} L${W * .26} ${hy + 92} L0 ${hy + 120}Z" fill="#334155"/>
      <path d="M${W} ${hy + 4} L${W * .68} ${hy + 22} L${W * .74} ${hy + 92} L${W} ${hy + 120}Z" fill="#334155"/>
      ${[...Array(6)].map((_, i) => `<path d="M0 ${hy + 14 + i * 17} L${W * .31 - i * 1.2} ${hy + 28 + i * 11}" stroke="#475569" stroke-width="1.2"/><path d="M${W} ${hy + 14 + i * 17} L${W * .69 + i * 1.2} ${hy + 28 + i * 11}" stroke="#475569" stroke-width="1.2"/>`).join('')}
      ${crowd(r, 6, hy + 14, W * .28, hy + 96, 6, 26, pal)}${crowd(r, W * .72, hy + 14, W - 6, hy + 96, 6, 26, pal)}
      <!-- pitch in perspective -->
      <path d="M${W * .2} ${hy + 40} L${W * .8} ${hy + 40} L${W * 1.25} ${H} L${-W * .25} ${H}Z" fill="url(#${id}grass)"/>
      <g clip-path="url(#${id}pc)">${[...Array(9)].map((_, i) => { const y0 = hy + 40 + Math.pow(i / 9, 1.6) * (H - hy - 40), y1 = hy + 40 + Math.pow((i + .5) / 9, 1.6) * (H - hy - 40); return `<rect x="0" y="${y0.toFixed(1)}" width="${W}" height="${(y1 - y0).toFixed(1)}" fill="#fff" opacity=".05"/>`; }).join('')}
        <g fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2"><path d="M${W * .2} ${hy + 40} L${W * .8} ${hy + 40} L${W * 1.25} ${H} L${-W * .25} ${H}Z"/><path d="M${W * .06} ${hy + 120} L${W * .94} ${hy + 120}"/>
          <ellipse cx="${W / 2}" cy="${hy + 120}" rx="${W * .16}" ry="22"/><path d="M${W * .36} ${hy + 40} L${W * .34} ${hy + 56} L${W * .66} ${hy + 56} L${W * .64} ${hy + 40}"/></g>
        <path d="M${W * .44} ${hy + 40} L${W * .44} ${hy + 30} L${W * .56} ${hy + 30} L${W * .56} ${hy + 40}" fill="none" stroke="#fff" stroke-width="2.4"/></g>
      ${flood(id, W * .14, hy - 70, .55)}${flood(id, W * .86, hy - 70, .55)}${flood(id, W * .04, hy - 40, .8)}${flood(id, W * .96, hy - 40, .8)}
      <!-- scoreboard -->
      <g transform="translate(${W / 2 - 46} ${hy - 58})"><rect x="40" y="38" width="12" height="22" fill="#111827"/><rect width="92" height="40" rx="4" fill="#0f172a" stroke="${c2}" stroke-width="2"/>
        <text x="23" y="14" text-anchor="middle" font-family="Graduate,serif" font-size="8" fill="#fde68a">HOME</text><text x="69" y="14" text-anchor="middle" font-family="Graduate,serif" font-size="8" fill="#fde68a">GUEST</text>
        <text x="23" y="34" text-anchor="middle" font-family="Teko,sans-serif" font-size="20" fill="#f87171">0</text><text x="69" y="34" text-anchor="middle" font-family="Teko,sans-serif" font-size="20" fill="#f87171">0</text></g>
      <!-- pennant bunting -->
      <path d="M0 ${hy - 6} Q${W / 2} ${hy + 18} ${W} ${hy - 6}" fill="none" stroke="#e5e7eb" stroke-width="1"/>
      ${[...Array(15)].map((_, i) => { const t = (i + .5) / 15, x = t * W, y = hy - 6 + 4 * 24 * t * (1 - t) * .5 + 1; return `<path d="M${(x - 6).toFixed(1)} ${y.toFixed(1)} L${(x + 6).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + 12).toFixed(1)}Z" fill="${i % 2 ? c1 : c2}"/>`; }).join('')}
      <!-- players and ball -->
      ${[[.38, .86, c1, 1], [.6, .78, '#e5e7eb', .85], [.5, .7, c1, .7], [.7, .9, '#e5e7eb', 1.05]].map(([x, y, k, s]) => `<g transform="translate(${W * x} ${H * y}) scale(${s})"><ellipse cx="0" cy="26" rx="10" ry="3" fill="#000" opacity=".25"/><circle cx="0" cy="-12" r="5" fill="#8d5a3b"/><path d="M-6 -6 L6 -6 L7 8 L-7 8Z" fill="${k}"/><path d="M-5 8 L-3 24 M5 8 L4 24" stroke="#111827" stroke-width="3" stroke-linecap="round"/><path d="M-6 -4 L-11 6 M6 -4 L11 4" stroke="${k}" stroke-width="3" stroke-linecap="round"/></g>`).join('')}
      <circle cx="${W * .45}" cy="${H * .93}" r="5" fill="#fff" stroke="#111" stroke-width="1"/>
      <rect y="${hy}" width="${W}" height="${H - hy}" fill="url(#${id}mist)"/></svg>`;
  };

  // ---------- 2. arrival: an empty, tired field on day one ----------
  C.sceneArrival = (c1 = '#1e3a8a', c2 = '#f97316', W = 390, H = 190) => { const id = 'ar' + (uid++), r = R(77);
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#fde7c7"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/><circle cx="${W * .18}" cy="${H * .42}" r="26" fill="#fff7d6" opacity=".9"/>
      ${trees(r, H * .58, W, ['#d97706', '#b45309', '#a3a3a3', '#65a30d', '#c2410c'], 22)}
      <rect y="${H * .58}" width="${W}" height="${H * .42}" fill="#9cad5f"/>${[...Array(40)].map(() => `<ellipse cx="${(r() * W).toFixed(0)}" cy="${(H * .6 + r() * H * .4).toFixed(0)}" rx="${(6 + r() * 14).toFixed(0)}" ry="3" fill="#a3895a" opacity=".55"/>`).join('')}
      <g stroke="#9ca3af" stroke-width="1" opacity=".7">${[...Array(26)].map((_, i) => `<path d="M${i * 15} ${H * .5} L${i * 15} ${H * .6}"/>`).join('')}<path d="M0 ${H * .5} L${W} ${H * .5} M0 ${H * .55} L${W} ${H * .55}"/></g>
      <g transform="translate(${W * .72} ${H * .3})"><path d="M-2 0 L2 0 L3 ${H * .3} L-3 ${H * .3}Z" fill="#4b5563"/><rect x="-14" y="-10" width="28" height="12" rx="2" fill="#6b7280"/><circle cx="-6" cy="-4" r="3" fill="#fef3c7"/><circle cx="6" cy="-4" r="3" fill="#374151"/></g>
      <g transform="translate(${W * .12} ${H * .62})"><path d="M0 0 L90 -6 L96 30 L4 34Z" fill="#6b7280"/><path d="M8 8 L88 4 M10 18 L90 14" stroke="#9ca3af" stroke-width="2"/><path d="M60 5 L75 22" stroke="#374151" stroke-width="3"/></g>
      <path d="M${W * .52} ${H * .66} L${W * .52} ${H * .56} L${W * .66} ${H * .56} L${W * .66} ${H * .66}" fill="none" stroke="#e5e7eb" stroke-width="2.5"/><path d="M${W * .6} ${H * .56} L${W * .64} ${H * .66}" stroke="#e5e7eb" stroke-width="1" opacity=".6"/>
      <circle cx="${W * .45}" cy="${H * .86}" r="7" fill="#f8fafc" stroke="#475569" stroke-width="1.2"/><path d="M${W * .45 - 3} ${H * .86 - 2} l3 -2 l3 2 l-1 3 h-4z" fill="#475569"/>
      <g transform="translate(${W * .85} ${H * .74})"><path d="M0 0 L0 -40" stroke="#57534e" stroke-width="2"/><path d="M0 -40 L24 -34 L0 -28Z" fill="${c2}"/></g></svg>`; };

  // ---------- 3. signing day ----------
  C.sceneSigning = (c1, c2, num = 10, W = 390, H = 190) => { const id = 'sg' + (uid++), r = R(num * 13 + 5);
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="${id}b" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="${C.shade(c1, .25)}"/><stop offset="1" stop-color="${C.shade(c1, -.55)}"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}b)"/>${[...Array(40)].map(() => `<rect x="${(r() * W).toFixed(0)}" y="${(r() * H * .7).toFixed(0)}" width="5" height="9" fill="${pick(r, [c2, '#fff', '#fde68a'])}" transform="rotate(${(r() * 90).toFixed(0)} ${(r() * W).toFixed(0)} ${(r() * H).toFixed(0)})" opacity=".8"/>`).join('')}
      <g transform="translate(${W / 2 - 48} 20) scale(.8)"><path d="M60 0 L60 -10" stroke="#9ca3af" stroke-width="2"/><path d="M36 6 L48 0 Q60 10 72 0 L84 6 L116 22 L104 48 L94 42 V124 H26 V42 L16 48 L4 22Z" fill="${c1}" stroke="${c2}" stroke-width="3"/>
        <path d="M48 0 Q60 14 72 0" fill="none" stroke="${c2}" stroke-width="4"/><text x="60" y="98" text-anchor="middle" font-family="Graduate,serif" font-size="42" fill="${c2}">${num}</text></g>
      <path d="M0 ${H - 46} L${W} ${H - 46} L${W} ${H} L0 ${H}Z" fill="#7c4a2a"/><path d="M0 ${H - 46} L${W} ${H - 46}" stroke="#a0673f" stroke-width="3"/>
      <g transform="translate(${W * .58} ${H - 44}) rotate(-6)"><rect width="110" height="34" fill="#f8fafc"/>${[8, 14, 20].map(y => `<path d="M8 ${y} L100 ${y}" stroke="#cbd5e1" stroke-width="1.5"/>`).join('')}<path d="M10 28 q10 -8 18 0 t18 -2 t16 1" stroke="#1d4ed8" stroke-width="1.6" fill="none"/></g>
      <g transform="translate(${W * .62} ${H - 64}) rotate(28)"><rect width="6" height="46" rx="3" fill="#111827"/><path d="M0 46 L3 54 L6 46Z" fill="#d1d5db"/></g>
      <text x="${W * .2}" y="${H - 16}" text-anchor="middle" font-family="Graduate,serif" font-size="22" fill="#fde68a" transform="rotate(-8 ${W * .2} ${H - 16})">SIGNED!</text></svg>`; };

  // ---------- 4. job offer handshake ----------
  C.sceneHandshake = (c1, c2, W = 390, H = 190) => { const id = 'hs' + (uid++);
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5efe6"/><stop offset="1" stop-color="#e7dccb"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}w)"/><rect x="${W * .06}" y="20" width="${W * .3}" height="80" rx="4" fill="#cbd5e1"/><rect x="${W * .06 + 6}" y="26" width="${W * .3 - 12}" height="68" fill="#93c5fd"/><path d="M${W * .06 + 6} 94 L${W * .14} 60 L${W * .2} 78 L${W * .26} 52 L${W * .36 - 6} 94Z" fill="#65a30d"/>
      <g transform="translate(${W * .74} 22)"><path d="M0 0 L0 70" stroke="#78716c" stroke-width="2"/><path d="M0 2 L70 18 L0 34Z" fill="${c1}"/><path d="M0 8 L44 18 L0 28Z" fill="${c2}" opacity=".9"/></g>
      <rect y="${H - 50}" width="${W}" height="50" fill="#5b3a24"/>
      <path d="M-10 ${H * .7} L${W * .4} ${H * .58}" stroke="#1f2937" stroke-width="30" stroke-linecap="round"/><path d="M${W * .36} ${H * .5} L${W * .4} ${H * .7}" stroke="#f8fafc" stroke-width="8"/>
      <path d="M${W + 10} ${H * .72} L${W * .6} ${H * .6}" stroke="${c1}" stroke-width="30" stroke-linecap="round"/><path d="M${W * .63} ${H * .52} L${W * .6} ${H * .72}" stroke="#f8fafc" stroke-width="8"/>
      <g transform="translate(${W / 2} ${H * .6})">
        <path d="M-58 -14 Q-30 -26 6 -18 L30 -8 Q38 0 30 8 L-4 16 Q-40 22 -58 12Z" fill="#c68a5e"/>
        ${[-14, -2, 10, 22].map((x, i) => `<path d="M${x} -12 Q${x + 8} ${-2 + i} ${x + 2} 12" fill="#c68a5e" stroke="#9a6440" stroke-width="1.6"/>`).join('')}
        <path d="M58 -10 Q30 -22 -2 -14 Q-16 -10 -12 -2 Q-4 4 10 0 L20 -2 Q40 16 58 12Z" fill="#e8b796" stroke="#c68a5e" stroke-width="1.4"/>
        <path d="M-12 -2 Q-26 -8 -30 -18 Q-24 -24 -14 -16 Q-6 -10 6 -10" fill="#e8b796" stroke="#c68a5e" stroke-width="1.4"/></g>
      <rect x="${W * .4}" y="${H - 34}" width="${W * .2}" height="22" fill="#fff" transform="rotate(-3 ${W / 2} ${H - 24})"/></svg>`; };

  // ---------- 5. trophy lift ----------
  C.sceneTrophy = (c1, c2, W = 390, H = 190) => { const id = 'tr' + (uid++), r = R(4242);
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="${id}b" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#fde68a"/><stop offset=".35" stop-color="${C.shade(c1, .1)}"/><stop offset="1" stop-color="${C.shade(c1, -.6)}"/></radialGradient>
      <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#92400e"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}b)"/>${[...Array(16)].map((_, i) => `<path d="M${W / 2} ${H * .3} L${W / 2 + Math.cos(i / 16 * 6.283) * W} ${H * .3 + Math.sin(i / 16 * 6.283) * W}" stroke="#fff" stroke-width="${i % 2 ? 6 : 14}" opacity=".07"/>`).join('')}
      ${[...Array(60)].map(() => { const x = r() * W, y = r() * H; return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="5" height="10" fill="${pick(r, [c2, '#fff', '#fde68a', c1])}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }).join('')}
      <g transform="translate(${W / 2} ${H * .14})"><path d="M-30 0 H30 V12 Q30 50 0 58 Q-30 50 -30 12Z" fill="url(#${id}g)"/><path d="M-30 8 Q-50 10 -46 28 Q-42 40 -24 40" fill="none" stroke="url(#${id}g)" stroke-width="6"/><path d="M30 8 Q50 10 46 28 Q42 40 24 40" fill="none" stroke="url(#${id}g)" stroke-width="6"/>
        <rect x="-6" y="58" width="12" height="14" fill="#b45309"/><rect x="-22" y="72" width="44" height="12" rx="2" fill="#78350f"/><path d="M-18 6 Q-14 30 -4 44" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/></g>
      ${[-1, 1].map(s => `<path d="M${W / 2 + s * 34} ${H * .5} Q${W / 2 + s * 44} ${H * .34} ${W / 2 + s * 30} ${H * .3}" stroke="#8d5a3b" stroke-width="12" stroke-linecap="round" fill="none"/>`).join('')}
      <path d="M${W / 2 - 40} ${H} L${W / 2 - 36} ${H * .52} Q${W / 2} ${H * .44} ${W / 2 + 36} ${H * .52} L${W / 2 + 40} ${H}Z" fill="${c1}" stroke="${c2}" stroke-width="3"/><circle cx="${W / 2}" cy="${H * .44}" r="16" fill="#8d5a3b"/><path d="M${W / 2 - 16} ${H * .42} Q${W / 2} ${H * .3} ${W / 2 + 16} ${H * .42}Z" fill="#2b1a10"/>
      ${[[.16, c1], [.3, '#e5e7eb'], [.7, c1], [.84, '#e5e7eb']].map(([x, k]) => `<g transform="translate(${W * x} ${H * .72})"><circle cx="0" cy="0" r="11" fill="#8d5a3b"/><path d="M-20 ${H} L-16 14 Q0 8 16 14 L20 ${H}Z" fill="${k}"/><path d="M-14 16 L-24 -14 M14 16 L24 -14" stroke="#8d5a3b" stroke-width="7" stroke-linecap="round"/></g>`).join('')}
      <rect x="${W * .12}" y="${H - 34}" width="${W * .76}" height="26" rx="4" fill="#0f172a" opacity=".85"/><text x="${W / 2}" y="${H - 15}" text-anchor="middle" font-family="Graduate,serif" font-size="15" fill="#fde68a">CONFERENCE CHAMPIONS</text></svg>`; };

  // ---------- crest generator: shield shape, pattern and mascot per school (Q1 crest parts) ----------
  const SHAPES = ['M20 2 L37 8 V20 C37 30 29 36 20 39 C11 36 3 30 3 20 V8 Z', 'M20 2 C30 2 37 6 37 6 V22 C37 32 28 37 20 39 C12 37 3 32 3 22 V6 C3 6 10 2 20 2Z', 'M4 3 H36 V24 L20 39 L4 24Z', 'M20 2 A18 18 0 1 1 19.9 2Z', 'M6 2 H34 L37 6 V26 C37 33 29 37 20 39 C11 37 3 33 3 26 V6Z'];
  const MASCOT = { Jackrabbits: '🐇', Crawdads: '🦞', Pheasants: '🐓', Miners: '⛏️', Ridgebacks: '🐗', Gulls: '🕊️', Roadrunners: '🐦', Herons: '🦩', Cranes: '🦢', Bobcats: '🐈', Prospectors: '💰', Mariners: '⚓' };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  C.crestSVG = (c1, c2, letters, size = 40) => {
    const h = hash(letters + c1 + c2), shape = SHAPES[h % SHAPES.length], pat = (h >> 3) % 5, k = 'cr' + (uid++);
    const col = C.COLLEGES && C.COLLEGES.find(c => c.c1 === c1 && c.abbr.startsWith(letters)), mascot = col && size >= 44 ? MASCOT[col.mascot] : '';
    const patt = [ '', `<path d="M3 22 L20 12 L37 22 V28 L20 18 L3 28Z" fill="${c2}" opacity=".9"/>`, `<rect x="15" y="0" width="10" height="40" fill="${c2}" opacity=".85"/>`, `<path d="M0 6 L40 34 V42 L0 14Z" fill="${c2}" opacity=".85"/>`, `<rect x="20" y="0" width="20" height="20" fill="${c2}" opacity=".85"/><rect x="0" y="20" width="20" height="20" fill="${c2}" opacity=".85"/>` ][pat];
    return `<svg class="crest" viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true"><defs><clipPath id="${k}"><path d="${shape}"/></clipPath><linearGradient id="${k}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <path d="${shape}" fill="${c1}"/><g clip-path="url(#${k})">${patt}<rect width="40" height="40" fill="url(#${k}g)"/></g><path d="${shape}" fill="none" stroke="${c2}" stroke-width="2.5"/>
      ${mascot ? `<circle cx="20" cy="15" r="7.5" fill="#fff" opacity=".92"/><text x="20" y="18.3" text-anchor="middle" font-size="9">${mascot}</text><text x="20" y="32" text-anchor="middle" font-family="Graduate,serif" font-size="8" fill="#fff" stroke="${C.shade ? C.shade(c1, -.5) : '#000'}" stroke-width=".6" paint-order="stroke">${letters}</text>`
      : `<text x="20" y="25" text-anchor="middle" font-family="Graduate,serif" font-size="${letters.length > 2 ? 10 : 12}" fill="#fff" stroke="${C.shade ? C.shade(c1, -.5) : '#000'}" stroke-width=".8" paint-order="stroke">${letters}</text>`}</svg>`;
  };
})(window.CFC);
