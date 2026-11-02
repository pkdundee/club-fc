// Club FC: players (Phase 3). Generation, attributes (outfield and goalkeeper), numbers, scholarships, development plans.
(function (C) {
  // ---------- positions ----------
  const POS = { GK: [.5, .02], LB: [.12, .22], CB: [.5, .18], RB: [.88, .22], DM: [.5, .36], LM: [.12, .5], CM: [.5, .48], RM: [.88, .5], AM: [.5, .64], LW: [.15, .78], RW: [.85, .78], ST: [.5, .86] };
  C.POSGROUP = p => p === 'GK' ? 'gk' : ['CB', 'LB', 'RB'].includes(p) ? 'def' : ['DM', 'CM', 'LM', 'RM', 'AM'].includes(p) ? 'mid' : 'fwd';
  C.POSNAME = { GK: 'Goalkeeper', CB: 'Centre back', LB: 'Left back', RB: 'Right back', DM: 'Defensive mid', CM: 'Central mid', LM: 'Left mid', RM: 'Right mid', AM: 'Attacking mid', LW: 'Left wing', RW: 'Right wing', ST: 'Striker' };
  const SQUAD = ['GK', 'GK', 'CB', 'CB', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'CM', 'LM', 'RM', 'AM', 'LW', 'RW', 'ST', 'ST', 'CM', 'ST'];

  // ---------- attributes (Q15b, Q29) ----------
  C.ATTR = { pac: ['⚡', 'Pace'], sho: ['🎯', 'Shooting'], pas: ['🔁', 'Passing'], dri: ['🌀', 'Dribbling'], def: ['🛡', 'Defending'], phy: ['💪', 'Physical'] };
  C.GKATTR = { stp: ['🧤', 'Shot-stopping'], crs: ['✈️', 'Crosses'], str: ['💪', 'Strength'], ref: ['⚡', 'Reflexes'], psn: ['🧭', 'Positioning'], dis: ['🦶', 'Distribution'] };
  const PROFILE = {
    CB: { def: 10, phy: 6, pac: -2, sho: -14, pas: -4, dri: -8 }, LB: { def: 5, pac: 6, sho: -10, pas: -2, dri: -2 }, RB: { def: 5, pac: 6, sho: -10, pas: -2, dri: -2 },
    DM: { def: 6, pas: 4, phy: 4, sho: -8, dri: -4, pac: -3 }, CM: { pas: 8, dri: 2 }, LM: { pac: 6, pas: 3, dri: 4, def: -4, sho: -2 }, RM: { pac: 6, pas: 3, dri: 4, def: -4, sho: -2 },
    AM: { pas: 6, dri: 7, sho: 4, def: -10, phy: -4 }, LW: { pac: 9, dri: 8, sho: 3, def: -12 }, RW: { pac: 9, dri: 8, sho: 3, def: -12 }, ST: { sho: 10, phy: 3, dri: 3, pac: 3, def: -15, pas: -4 },
    GK: { stp: 8, crs: 2, str: 0, ref: 6, psn: 4, dis: -4 }
  };
  C.KEY = { GK: ['stp', 'crs', 'str'], CB: ['def', 'phy'], LB: ['def', 'pac'], RB: ['def', 'pac'], DM: ['def', 'pas'], CM: ['pas', 'dri'], LM: ['pac', 'pas'], RM: ['pac', 'pas'], AM: ['pas', 'dri'], LW: ['pac', 'dri'], RW: ['pac', 'dri'], ST: ['sho', 'phy'] };
  C.attrsOf = p => p.pos === 'GK' ? C.GKATTR : C.ATTR;
  C.calcRating = p => { const keys = Object.keys(C.attrsOf(p)), key = C.KEY[p.pos];
    const km = key.reduce((s, k) => s + p.a[k], 0) / key.length, am = keys.reduce((s, k) => s + p.a[k], 0) / keys.length; return Math.round(km * .6 + am * .4); };
  C.RARITY = [['Common', '#94a3b8'], ['Uncommon', '#22c55e'], ['Rare', '#3b82f6'], ['Super Rare', '#a855f7'], ['Ultra Rare', '#f59e0b']];
  C.KEEPER_STYLE = p => [p.a.crs >= p.a.stp ? '🧱 Commands the box' : '🥅 Stays on the line', p.a.dis >= 50 ? '🦶 Long passer' : '🦶 Short passer'];

  // ---------- position fit (5 = natural … 1 = out of position) ----------
  C.fit = (p, pos) => { if (p.pos === pos) return 5; if (pos === 'GK' || p.pos === 'GK') return 1; if (p.sec.includes(pos)) return 4;
    const a = POS[p.pos], b = POS[pos], d = Math.hypot((a[0] - b[0]) * .6, a[1] - b[1]); return Math.min(5, (d < .17 ? 4 : d < .3 ? 3 : d < .45 ? 2 : 1) + (p.fitB[pos] || 0)); };
  C.FITLABEL = ['', 'Out of position', 'Awkward', 'Competent', 'Accomplished', 'Natural'];
  C.nearPositions = p => p.pos === 'GK' ? [] : Object.keys(POS).filter(q => q !== 'GK' && q !== p.pos && C.fit(p, q) >= 2 && C.fit(p, q) < 5);

  // ---------- looks that match the name pool (Q16) ----------
  const SKIN = { light: ['#f6dcc6', '#f4d0b5', '#f1c9a5', '#efc4a4', '#e8b796'], olive: ['#e0b48c', '#d9a27a', '#c68a5e', '#c08a63'], brown: ['#b07a52', '#8d5a3b', '#7a4a2c'], dark: ['#6b3e26', '#5c3a24', '#4a2c1c'], ea: ['#f1d2b6', '#efd2b4', '#e8c4a0'] };
  const SKINMIX = { us: { light: 55, olive: 10, brown: 15, dark: 20 }, us_hisp: { olive: 60, light: 25, brown: 15 }, us_irish: { light: 92, olive: 8 }, us_ital: { light: 60, olive: 40 }, us_mw: { light: 92, olive: 8 },
    mex: { olive: 60, brown: 30, light: 10 }, bra: { olive: 40, brown: 30, dark: 15, light: 15 }, eng: { light: 75, brown: 10, dark: 15 }, ger: { light: 90, olive: 10 }, swe: { light: 95, olive: 5 },
    esp: { light: 60, olive: 40 }, fra: { light: 60, olive: 25, dark: 15 }, yor: { dark: 75, brown: 25 }, igb: { dark: 75, brown: 25 }, gha: { dark: 75, brown: 25 }, jam: { dark: 60, brown: 40 }, jpn: { ea: 100 }, kor: { ea: 100 } };
  const LIGHTHAIR = { swe: ['#e3c27a', '#e3c27a', '#c8964a', '#8a5a2b'], us_irish: ['#b4531a', '#8a5a2b', '#5a3b24', '#c8964a'], ger: ['#e3c27a', '#c8964a', '#8a5a2b', '#5a3b24'], us_mw: ['#e3c27a', '#c8964a', '#8a5a2b', '#5a3b24'] };
  function wpick(r, mix) { let t = 0; for (const k in mix) t += mix[k]; let x = r() * t; for (const k in mix) { x -= mix[k]; if (x <= 0) return k; } return Object.keys(mix)[0]; }
  C.makeLook = (r, pool, female) => {
    const tone = wpick(r, SKINMIX[pool] || SKINMIX.us), skin = SKIN[tone][Math.floor(r() * SKIN[tone].length)];
    const darkHair = ['#120c0a', '#1a1210', '#2b1a10'];
    const hair = tone === 'light' ? (LIGHTHAIR[pool] || ['#8a5a2b', '#5a3b24', '#2b1a10', '#c8964a', '#3b2416'])[Math.floor(r() * 4)] : darkHair[Math.floor(r() * 3)];
    const eyes = tone === 'light' ? ['#3b6e9e', '#4f7a3a', '#5b8cc0', '#4b3621', '#6b5a3a'][Math.floor(r() * 5)] : ['#3b2416', '#2b1d14', '#4b3621'][Math.floor(r() * 3)];
    const afroTex = tone === 'dark' || tone === 'brown';
    const style = female ? (afroTex ? ['braids', 'afro', 'bun', 'pony'] : ['pony', 'bun', 'long', 'bob', 'pony'])[Math.floor(r() * (afroTex ? 4 : 5))]
      : (afroTex ? ['buzz', 'curly', 'fade', 'afro'] : ['fade', 'sidepart', 'buzz', 'curly', 'fade'])[Math.floor(r() * (afroTex ? 4 : 5))];
    const beard = !female && r() < .18 ? 'stubble' : undefined;
    return { skin, hair, eyes, style, female: female ? 1 : 0, beard };
  };

  // top a player up to two alternative positions (the nearest ones), for saves made before 9e
  C.ensureAlts = p => { if (p.pos === 'GK' || (p.sec || []).length >= 2) return; p.sec = p.sec || [];
    const near = Object.keys(POS).filter(q => q !== p.pos && q !== 'GK' && !p.sec.includes(q)).sort((a, b) => Math.hypot((POS[p.pos][0] - POS[a][0]) * .6, POS[p.pos][1] - POS[a][1]) - Math.hypot((POS[p.pos][0] - POS[b][0]) * .6, POS[p.pos][1] - POS[b][1]));
    while (p.sec.length < 2 && near.length) p.sec.push(near.shift()); };

  // ---------- numbers (Q29) ----------
  const LIKES = { GK: [1, 0], CB: [4, 5, 3], LB: [3], RB: [2], DM: [6], CM: [8, 14, 16], LM: [11, 7], RM: [7], AM: [10], LW: [11, 7], RW: [7, 11], ST: [9, 10] };

  // ---------- generation ----------
  C.genPlayer = (r, { gender, pos, rating, rar = 0, year = 1, pool }) => {
    pool = pool || wpick(r, C.POOL_W); const P = C.POOLS[pool];
    const pk = s => { const a = s.split(/[ |]/); return a[Math.floor(r() * a.length)]; };
    const fn = pk(P[gender === 'w' ? 3 : 2]), ln = pk(P[4]).replace(/^OBrien$/, "O'Brien"), town = P[1].split('|')[Math.floor(r() * P[1].split('|').length)];
    const keys = pos === 'GK' ? Object.keys(C.GKATTR) : Object.keys(C.ATTR), prof = PROFILE[pos], a = {};
    for (const k of keys) a[k] = C.clamp(Math.round(rating + (prof[k] || 0) + (r() * 8 - 4)), 8, 95);
    const sec = []; if (pos !== 'GK') { const near = Object.keys(POS).filter(q => q !== pos && q !== 'GK' && Math.hypot((POS[pos][0] - POS[q][0]) * .6, POS[pos][1] - POS[q][1]) < .3); const n = 2; /* outfield players: one main position (green) and two alternatives (lime) */ for (let i = 0; i < n && near.length; i++) sec.push(near.splice(Math.floor(r() * near.length), 1)[0]); }
    const p = { id: 'p' + Math.floor(r() * 1e9).toString(36) + Date.now().toString(36).slice(-3), fn, ln, pool, flag: P[0], town, pos, sec, rar, a, year,
      look: C.makeLook(r, pool, gender === 'w'), energy: 100, morale: 70, num: 0, want: r() < .35 ? LIKES[pos][Math.floor(r() * LIKES[pos].length)] : 0,
      schol: 0, acad: false, stars: 0, dev: 0, fitB: {}, lead: Math.round(35 + r() * 55), gpa: +(2.3 + r() * 1.7).toFixed(2), up: 0 };
    C.ensureAlts(p);
    p.rating = C.calcRating(p); p.pot = C.clamp(p.rating + Math.round((4 + r() * 10) * (1 + rar * .3) * (year <= 2 ? 1.2 : .7)), p.rating + 1, 95);
    return p;
  };

  C.genSquad = (car, seed) => {
    const r = C.rng(seed), j = car.job, size = Math.min(C.rosterCap(car), SQUAD.length);
    const years = []; j.mix.forEach((n, y) => { for (let i = 0; i < n; i++) years.push(y + 1); });
    while (years.length < size) years.push(1 + Math.floor(r() * 2));
    const yrs = years.map(v => [r(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
    const sq = SQUAD.slice(0, size).map((pos, i) => {
      const rar = r() < .08 * j.stars ? (r() < .25 ? 2 : 1) : 0;
      const rating = Math.round(j.rating - 4 + r() * 8 + rar * 3 + (yrs[i] - 2) * 1.5);
      return C.genPlayer(r, { gender: car.gender, pos, rating, rar, year: yrs[i], pool: r() < .82 ? wpick(r, { us: 30, us_hisp: 12, us_irish: 6, us_ital: 6, us_mw: 8 }) : undefined });
    });
    // scholarships: the best players share about 75% of the pool (Q5, Q11); academic colleges give academic aid instead
    const byRating = [...sq].sort((a, b) => b.rating - a.rating);
    if (j.type === 'acad') byRating.slice(0, 5).forEach(p => p.acad = true);
    else { let left = j.pool * .75; for (const p of byRating) { const f = [.6, .5, .5, .4, .4, .35, .3, .25, .25][byRating.indexOf(p)] || 0; const amt = Math.round(f * j.coa / 500) * 500; if (!f || amt > left) continue; p.schol = amt; left -= amt; } }
    C.assignNumbers(sq);
    return sq;
  };

  C.assignNumbers = sq => {
    const used = new Set(sq.filter(p => p.num).map(p => p.num));
    const order = [...sq].sort((a, b) => b.rating - a.rating);
    for (const p of order) if (!p.num && p.want && !used.has(p.want)) { p.num = p.want; used.add(p.want); }
    for (const p of order) if (!p.num) { const pref = (LIKES[p.pos] || []).find(n => !used.has(n)); let n = pref != null ? pref : 2; while (used.has(n) || n === 0 && p.pos !== 'GK') n++; p.num = n; used.add(n); }
    for (const p of sq) if (p.want && p.num !== p.want) p.morale = Math.min(p.morale, 64);
  };

  // ---------- squad helpers ----------
  C.rosterCap = (car = C.car()) => Math.min(28, 24 + Math.ceil(car.b.dorms / 3));
  C.squad = () => C.car().squad;
  C.P = id => C.car().squad.find(p => p.id === id);
  C.ensureSquad = car => { if (!car || car.squad) return; car.squad = C.genSquad(car, (car.created & 0xffffff) ^ 0x5bd1e995); car.captains = []; car.tokens = 2; car.devq = []; C.save(); };
  C.committed = () => C.squad().reduce((s, p) => s + (p.schol || 0), 0);
  C.poolLeft = () => Math.max(0, C.car().job.pool - C.committed());

  // Auto line-up (4-3-3) just to colour XI / bench / reserves until Tactics arrives in Phase 5
  const XI = ['GK', 'LB', 'CB', 'CB', 'RB', 'DM', 'CM', 'CM', 'LW', 'ST', 'RW'];
  C.roles = () => {
    const sq = C.squad(), used = new Set(), xi = [];
    for (const pos of XI) { let best = null, bs = -1; for (const p of sq) { if (used.has(p.id) || p.injured) continue; const s = p.rating * [0, .5, .7, .85, .95, 1][C.fit(p, pos)] * (.6 + .4 * p.energy / 100); if (s > bs) { bs = s; best = p; } } if (best) { used.add(best.id); xi.push(best.id); } }
    const bench = sq.filter(p => !used.has(p.id)).sort((a, b) => b.rating - a.rating).slice(0, 7).map(p => p.id);
    const out = {}; sq.forEach(p => out[p.id] = xi.includes(p.id) ? 'xi' : bench.includes(p.id) ? 'bench' : 'res'); return out;
  };

  // ---------- numbers ----------
  C.giveNumber = (pid, n) => { const car = C.car(), p = C.P(pid); if (car.tokens < 1) return 'none'; if (car.squad.some(q => q.num === n && q.id !== pid)) return 'taken';
    car.tokens--; p.num = n; if (p.want === n) { p.morale = Math.min(100, p.morale + 12); } C.save(); return 'ok'; };
  C.toggleCaptain = pid => { const car = C.car(); const i = car.captains.indexOf(pid); if (i >= 0) car.captains.splice(i, 1); else { if (car.captains.length >= 3) return false; car.captains.push(pid); } C.save(); return true; };

  // ---------- release (Q15d): frees scholarship money, no cash ----------
  C.release = pid => { const car = C.car(); if (car.squad.length <= 16) return false; car.squad = car.squad.filter(p => p.id !== pid); car.captains = car.captains.filter(x => x !== pid); car.devq = car.devq.filter(q => q.pid !== pid); C.save(); return true; };

  // ---------- development plans (Q15c, Q21c): a real-time queue with slots ----------
  C.DEVSLOTS = [{ id: 'free', name: 'Free slot' }, { id: 'vip', name: "Coach's Club slot", why: "Join the Coach's Club" }, { id: 'iap', name: 'Extra training slot', why: 'One-off purchase' }, { id: 'prog', name: 'Earned slot', why: 'Training Ground Lv 10' }];
  C.devSlotOpen = id => id === 'free' || (id === 'vip' && C.isVip()) || (id === 'iap' && C.acct().tslot3) || (id === 'prog' && (C.level('training') >= 10 || C.pbv('slot') >= 1));
  C.devOpenSlots = () => C.DEVSLOTS.filter(s => C.devSlotOpen(s.id)).length;
  C.devFree = () => C.car().devq.length < C.devOpenSlots();
  C.inDev = pid => C.car().devq.find(q => q.pid === pid);
  C.attrCap = (p, k) => C.clamp(p.pot + ((PROFILE[p.pos] || {})[k] || 0) + 4, 20, 99);
  C.planTime = (p, focus) => { const base = focus.startsWith('pos:') ? 7200 : 1200 + 40 * (p.a[focus] || 40);
    const speed = (1 + C.level('training') * .03 + C.pbv('trn') + C.staffF('dev') * .25) * (p.year === 1 ? 1.2 : p.year === 2 ? 1.1 : 1); return Math.round(base / speed); };
  C.planCost = (p, focus) => focus.startsWith('pos:') ? 1500 : Math.round((200 + 12 * (p.a[focus] || 40)) / 50) * 50;
  C.startPlan = (pid, focus) => { const car = C.car(), p = C.P(pid); if (!C.devFree() || C.inDev(pid)) return false;
    const cost = C.planCost(p, focus); if (car.cash < cost) return 'cash'; if (!focus.startsWith('pos:') && p.a[focus] >= C.attrCap(p, focus)) return 'cap';
    car.cash -= cost; const t = C.now(); car.devq.push({ pid, focus, start: t, end: t + C.planTime(p, focus) * 1000 }); C.save(); return true; };
  // Finish completed plans. Returns messages for toasts.
  C.tickDev = () => { const car = C.car(); if (!car || !car.devq) return [];
    const done = car.devq.filter(q => q.end <= C.now()), msgs = [];
    for (const q of done) { const p = C.P(q.pid); if (!p) continue;
      if (q.focus.startsWith('pos:')) { const pos = q.focus.slice(4); p.fitB[pos] = Math.min(3, (p.fitB[pos] || 0) + 1); msgs.push(`${p.ln} is more comfortable at ${pos}`); }
      else { const k = q.focus, g = p.year <= 2 ? 2 : 1; p.a[k] = Math.min(C.attrCap(p, k), p.a[k] + g); const old = p.rating; p.rating = C.calcRating(p); p.up = p.rating - old; msgs.push(`${p.ln}: ${C.attrsOf(p)[k][1]} +${g}${p.rating > old ? ` · rating ${p.rating}` : ''}`); }
      p.dev++; if (p.stars < 5 && p.dev >= p.stars + 2) { p.dev = 0; p.stars++; p.pot = Math.min(95, p.pot + 1); C.KEY[p.pos].forEach(k => p.a[k] = Math.min(99, p.a[k] + 1)); p.rating = C.calcRating(p); msgs.push(`⭐ ${p.ln} earned a Development Star`); }
    }
    if (done.length) { car.devq = car.devq.filter(q => q.end > C.now()); C.save(); }
    return msgs;
  };

  // First Week reward: sign a Rare freshman on academic aid
  C.useRareRecruit = () => { const car = C.car(); if (!car.items || !car.items.rareRecruit) return null; if (car.squad.length >= C.rosterCap()) return 'full';
    const r = C.rng(Date.now() & 0xffffff), pos = ['ST', 'AM', 'CB', 'CM', 'LW', 'GK'][Math.floor(r() * 6)];
    const p = C.genPlayer(r, { gender: car.gender, pos, rating: car.job ? Math.round(C.STORIES[car.job.story].stars * 4 + 44) : 50, rar: 2, year: 1 }); p.acad = true;
    car.squad.push(p); C.assignNumbers(car.squad); car.items.rareRecruit--; C.save(); return p; };
})(window.CFC);
