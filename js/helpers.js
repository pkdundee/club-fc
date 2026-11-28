// CLUB FC 1.12 (FEEDBACK 256/258/260): Helpers. Students from the Dorms walk to the building being upgraded (or the Performance Lab
// for research) and the job's time drops as each one arrives. The reduction is computed once when the job starts (C.staffHelp:
// 1 Helper a Dorms level, 1% of the time left each, at least 15 s) and paid out in equal shares on a fixed schedule, so it applies
// whether or not the campus is on screen. A job is never taken below 1 second and its Helpers never repeat (job.helped).
// Art: the approved Helper sprite v1.1 (v1-planning/icons/HELPER_SPRITE_v1.1.html): program colours, gender follows the team.
(function (C) {
  const S = () => C.ECON.staffHelp;
  // set a new job up for Helpers: full time now, shares later
  C.helpersOn = (job, help, target) => {
    if (!(help > 0)) { job.help = 0; job.helped = 1; return; }
    const n = C.staffHelpCount ? C.staffHelpCount() : 1, w = Math.max(1, Math.min(10, Math.ceil(n / (S().perWalker || 3))));
    job.help = Math.round(help); job.hw = w; job.hd = 0; job.helped = 0;
    C.spawnHelpers && C.spawnHelpers(target, w, job.start);
  };
  const arrive = (job, i) => job.start + S().delayMs + i * S().gapMs + S().walkMs;
  // pay out the shares that are due; returns true if anything changed
  C.helperTick = () => {
    const car = C.car && C.car(); if (!car) return false; let ch = false; const now = C.now();
    for (const job of [...(car.queue || []), ...(car.pbq || [])]) {
      if (job.helped !== 0) continue;                       // 1.11 jobs (help already taken off) and finished payouts are skipped
      while (job.hd < job.hw && arrive(job, job.hd) <= now) {
        const share = job.hd === job.hw - 1 ? job.help - Math.floor(job.help / job.hw) * (job.hw - 1) : Math.floor(job.help / job.hw);
        if (!job.ready && job.end > now) job.end = Math.max(job.start + 1000, job.end - share * 1000);
        job.hd++; ch = true;
      }
      if (job.hd >= job.hw) job.helped = 1;
    }
    if (ch) { C.save && C.save(); }
    return ch;
  };
  setInterval(() => { try { if (C.helperTick()) { document.querySelectorAll('[data-help-refresh]').forEach(e => e.remove()); } } catch (e) { } }, 250);

  // ---------------- the walking students (the approved sprite) ----------------
  const SKIN = ['#e0a87c', '#b07a4f', '#7a4b2a', '#f1c6a0'], HAIR = ['#3b2414', '#1c1410', '#0f0b08', '#7c4a1e'];
  // back = walking away from the viewer (up the screen); mirror = facing left
  function stu(p, s, f, back, mirror, g, k) {
    const sw = [[-3, 3], [0, 0], [3, -3], [0, 0]][f], arm = [[3, -3], [0, 0], [-3, 3], [0, 0]][f], bob = f % 2 ? 0 : -0.6, face = !back;
    const skin = SKIN[k % 4], hair = HAIR[k % 4], dark = '#0f172a';
    return `<g transform="translate(16 ${2 + bob}) scale(${mirror ? -1 : 1} 1) translate(-16 0)">
      <ellipse cx="16" cy="37.5" rx="7" ry="1.8" fill="#000" opacity=".22"/>
      <path d="M13 26 l${sw[0] * .6} 9" stroke="${s}" stroke-width="4.4" stroke-linecap="round"/><path d="M19 26 l${sw[1] * .6} 9" stroke="${s}" stroke-width="4.4" stroke-linecap="round"/>
      <ellipse cx="${13 + sw[0] * .6}" cy="36" rx="2.7" ry="1.5" fill="#fff" stroke="${dark}" stroke-width=".7"/><ellipse cx="${19 + sw[1] * .6}" cy="36" rx="2.7" ry="1.5" fill="#fff" stroke="${dark}" stroke-width=".7"/>
      <path d="${g === 'f' ? 'M11 15.5h10l1.2 11.5h-12.4z' : 'M10.5 15.5h11l1 11.5h-13z'}" fill="${p}" stroke="${dark}" stroke-width=".8" stroke-linejoin="round"/>
      <path d="M10.6 16.5l-.8 10" stroke="${s}" stroke-width="1.6"/><path d="M21.4 16.5l.8 10" stroke="${s}" stroke-width="1.6"/>
      ${face ? `<path d="M16 15.6v11" stroke="${s}" stroke-width="1" opacity=".9"/>` : ''}
      <path d="M11 17 l${-2 + arm[0] * .5} 7.5" stroke="${p}" stroke-width="3.4" stroke-linecap="round"/><path d="M21 17 l${2 + arm[1] * .5} 7.5" stroke="${p}" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="${9 + arm[0] * .5}" cy="25" r="1.4" fill="${skin}"/><circle cx="${23 + arm[1] * .5}" cy="25" r="1.4" fill="${skin}"/>
      <circle cx="16" cy="10" r="5.4" fill="${skin}" stroke="${dark}" stroke-width=".7"/>
      ${g === 'f' ? (face
        ? `<path d="M10.4 11c-.5-4.6 2-7.4 5.6-7.4s6.1 2.8 5.6 7.4c-.6-2.4-2.4-4-5.6-4s-5 1.6-5.6 4z" fill="${hair}"/><path d="M10.5 9.5c-.8 2.2-.6 4.2.2 5.6l1-3.8zM21.5 9.5c.8 2.2.6 4.2-.2 5.6l-1-3.8z" fill="${hair}"/><circle cx="17.8" cy="10.6" r=".7" fill="${dark}"/><circle cx="14.6" cy="10.6" r=".7" fill="${dark}"/>`
        : `<path d="M10.6 10.8c-.3-4.6 2.3-7.1 5.4-7.1s5.7 2.5 5.4 7.1c-1.8 1.3-3.5 1.7-5.4 1.7s-3.6-.4-5.4-1.7z" fill="${hair}"/><path d="M16 12c1.6 1.8 1.4 4.4.2 6.4-.9-1.6-1.4-3.6-1.2-5.6z" fill="${hair}" stroke="${dark}" stroke-width=".4"/><circle cx="16" cy="11.8" r="1" fill="${s}"/>`)
      : (face ? `<path d="M10.8 9.2c0-3.6 2.4-5.6 5.2-5.6s5.4 2 5.4 5.4c-1.6-1.6-3.6-2.2-5.4-2.2s-3.6.8-5.2 2.4z" fill="${hair}"/><circle cx="17.8" cy="10.4" r=".7" fill="${dark}"/><circle cx="14.6" cy="10.4" r=".7" fill="${dark}"/>`
        : `<path d="M10.7 10.6c-.2-4.4 2.4-6.8 5.3-6.8s5.6 2.4 5.3 6.8c-1.8 1.4-3.4 1.8-5.3 1.8s-3.6-.4-5.3-1.8z" fill="${hair}"/>`)}</g>`;
  }
  C.helperSprite = stu;
  const walkers = []; let raf = 0;
  C.spawnHelpers = (target, n, t0) => {
    const car = C.car(); if (!car || !C.plotPoint) return;
    const a = C.plotPoint('dorms'), b = C.plotPoint(target); if (!a || !b) return;
    const col = (C.COLLEGES && C.COLLEGES[car.college]) || { c1: '#6d28d9', c2: '#f5b301' }, g = car.gender === 'w' ? 'f' : 'm';
    const T0 = performance.now() + Math.max(0, S().delayMs - (C.now() - t0));
    for (let i = 0; i < n; i++) walkers.push({ a, b, t0: T0 + i * S().gapMs, p: col.c1, s: col.c2, g, k: Math.floor(Math.random() * 4), off: (Math.random() - .5) * 10 });
    if (!raf) raf = requestAnimationFrame(frame);
  };
  function frame(now) {
    raf = 0; const sv = document.querySelector('#mapin svg');
    for (let i = walkers.length - 1; i >= 0; i--) if (now - walkers[i].t0 > S().walkMs) walkers.splice(i, 1);
    if (sv) {
      let g = sv.querySelector('#camHelpers'); if (!g) { g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.id = 'camHelpers'; g.setAttribute('pointer-events', 'none'); sv.appendChild(g); }
      g.innerHTML = walkers.filter(w => now >= w.t0).map(w => {
        const k = Math.min(1, (now - w.t0) / S().walkMs), x = w.a[0] + (w.b[0] - w.a[0]) * k + w.off, y = w.a[1] + (w.b[1] - w.a[1]) * k - Math.sin(k * Math.PI) * 14,
          back = w.b[1] < w.a[1], mirror = back ? w.b[0] < w.a[0] : w.b[0] > w.a[0], f = Math.floor((now - w.t0) / 125) % 4, sc = .42;
        return `<g transform="translate(${(x - 16 * sc).toFixed(1)} ${(y - 36 * sc).toFixed(1)}) scale(${sc})" opacity="${k > .9 ? (1 - k) * 10 : 1}">${stu(w.p, w.s, f, back, mirror, w.g, w.k)}</g>`;
      }).join('');
    }
    if (walkers.length) raf = requestAnimationFrame(frame); else if (sv) { const g = sv.querySelector('#camHelpers'); if (g) g.innerHTML = ''; }
  }
})(window.CFC);
