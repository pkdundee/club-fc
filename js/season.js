// Club FC: the season (Phase 5). Conference of 8, 14 matches home and away, a top-4 conference tournament,
// results, the table, energy and recovery, match-based development, promises, and rolling into the next season.
(function (C) {
  const H = 3.6e6, ROUNDS = 14;
  const CONF = ['Prairie', 'Gulf Coast', 'Heartland', 'Frontier', 'Great Lakes', 'Sun Belt', 'Big Sky', 'Tidewater'];
  const GOALS = { 3: ['Top 4 and reach the conference final', s => s.pos <= 4 && s.final], 2: ['Finish in the top half', s => s.pos <= 4], 1: ['Stay out of the bottom 2', s => s.pos <= 6] };
  C.SEASON_GOAL = GOALS;
  const pois = (r, l) => { let k = 0, p = Math.exp(-l), s = p, u = r(); while (u > s && k < 9) { k++; p *= l / k; s += p; } return k; };

  // ---------- setup ----------
  C.ensureSeason = (car = C.car()) => {
    if (!car || car.sea) return;
    const r = C.rng((car.created & 0xffffff) ^ 0x2545f491 ^ (car.season * 7919)), col = C.college(car);
    const others = C.COLLEGES.filter(c => c.id !== car.college).sort(() => r() - .5).slice(0, 7);
    const teams = [{ me: 1, col: car.college, name: col.short, abbr: col.abbr, c1: col.c1, c2: col.c2, rating: car.job.rating }]
      .concat(others.map((c, i) => ({ col: c.id, name: c.short, abbr: c.abbr, c1: c.c1, c2: c.c2, rating: Math.round(car.job.rating + (i - 3) * 1.6 + r() * 3 - 1), form: Object.keys(C.FORMATIONS)[Math.floor(r() * 5)], ment: 1 + Math.floor(r() * 3), seed: Math.floor(r() * 1e9) })));
    // double round robin, circle method
    const ids = teams.map((_, i) => i), fx = [];
    for (let rd = 0; rd < 7; rd++) { for (let i = 0; i < 4; i++) { const a = ids[i], b = ids[7 - i]; fx.push({ md: rd + 1, h: rd % 2 ? b : a, a: rd % 2 ? a : b }); } ids.splice(1, 0, ids.pop()); }
    fx.slice().forEach(f => fx.push({ md: f.md + 7, h: f.a, a: f.h }));
    fx.forEach(f => f.wx = Math.floor(r() * 5));
    car.sea = { n: car.season, conf: CONF[(car.college + car.season) % CONF.length] + ' Conference', teams, fx: fx.sort((a, b) => a.md - b.md), md: 1, phase: 'reg', reports: {}, end: null };
    if (car.homecoming != null && car.hcDone !== car.season) { const o = C.COLLEGES[car.homecoming];  // Homecoming: a friendly at your old college (Q27)
      teams.push({ guest: 1, col: o.id, name: o.short, abbr: o.abbr, c1: o.c1, c2: o.c2, rating: Math.round(car.job.rating - 6), form: '4-4-2', ment: 2, seed: Math.floor(r() * 1e9) });
      car.sea.fx.unshift({ md: 0, h: teams.length - 1, a: 0, friendly: 1, wx: 4 }); car.sea.md = 0; car.hcDone = car.season; }
    if (car.adConf == null) car.adConf = 50;
    car.restAt = car.restAt || C.now();
    C.save();
  };
  C.sea = () => { C.ensureSeason(); return C.car().sea; };
  C.myFixture = () => { const S = C.sea(); return S.fx.find(f => f.md === S.md && (f.h === 0 || f.a === 0) && f.hs == null) || null; };
  C.teamOf = i => C.sea().teams[i];

  // ---------- table ----------
  C.table = () => {
    const S = C.sea(), T = S.teams.map((t, i) => ({ i, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] }));
    for (const f of S.fx) { if (f.hs == null || f.ko || f.friendly) continue; const h = T[f.h], a = T[f.a];
      h.p++; a.p++; h.gf += f.hs; h.ga += f.as; a.gf += f.as; a.ga += f.hs;
      if (f.hs > f.as) { h.w++; a.l++; h.pts += 3; h.form.push('W'); a.form.push('L'); } else if (f.hs < f.as) { a.w++; h.l++; a.pts += 3; h.form.push('L'); a.form.push('W'); } else { h.d++; a.d++; h.pts++; a.pts++; h.form.push('D'); a.form.push('D'); } }
    return T.filter(t => !S.teams[t.i].guest).sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || x.i - y.i);
  };
  C.myPos = () => C.table().findIndex(t => t.i === 0) + 1;

  // ---------- opponent squads: rebuilt from a seed each time (nothing to save) ----------
  C.oppTeam = (ti) => {
    const t = C.teamOf(ti), r = C.rng(t.seed + C.sea().n * 31), car = C.car(), F = C.FORMATIONS[t.form];
    const mk = (pos, d, yr) => { const p = C.genPlayer(r, { gender: car.gender, pos, rating: Math.round(t.rating + d + r() * 6 - 3), year: yr }); p.energy = 88 + Math.round(r() * 12); p.id = 'o' + ti + '_' + pos + Math.floor(r() * 1e6); return p; };
    const xi = F.map(s => mk(s[0], 0, 1 + Math.floor(r() * 4)));
    const bench = ['GK', 'CB', 'CM', 'ST', 'LB', 'LW', 'DM'].map(p => mk(p, -3, 1 + Math.floor(r() * 3)));
    C.assignNumbers(xi.concat(bench));
    return { name: t.name, short: t.name, abbr: t.abbr, c1: t.c1, c2: t.c2, form: t.form, ment: t.ment, xi, bench, auto: true, instr: {}, maxSubs: 6 };
  };

  // ---------- simulate the other fixtures on a matchday ----------
  function quickResult(f, r, ko) {
    const S = C.sea(), rh = S.teams[f.h].rating, ra = S.teams[f.a].rating;
    f.hs = pois(r, 1.5 * Math.exp((rh - ra) * .05)); f.as = pois(r, 1.2 * Math.exp((ra - rh) * .05));
    if (ko && f.hs === f.as) { f.pens = [3 + Math.floor(r() * 3), 0]; f.pens[1] = f.pens[0] + (r() < .5 ? 1 : -1); if (f.pens[1] < 0) f.pens[1] = 2; }
  }
  const winnerOf = f => f.hs > f.as ? f.h : f.hs < f.as ? f.a : (f.pens[0] > f.pens[1] ? f.h : f.a);

  // ---------- applying my match (Q20k, Q20l, Q7a) ----------
  C.applyResult = (m, f) => {
    const car = C.car(), S = car.sea, my = f.h === 0 ? 0 : 1, r = C.rng(m.events.length * 977 + S.md);
    f.hs = m.score[0]; f.as = m.score[1]; if (m.pens) f.pens = m.pens;
    const rated = C.rateMatch(m), potm = rated[0], mine = rated.filter(x => x.e.side === my);
    const res = Math.sign(m.score[my] - m.score[1 - my]) || (m.pens ? Math.sign(m.pens[my] - m.pens[1 - my]) * .5 : 0);
    const played = new Set(), gains = [];
    for (const e of m.ents.filter(e => e.side === my)) {
      const p = C.P(e.p.id); if (!p) continue; const s = e.st; if (s.mins < .5 && !e.on) continue;
      played.add(p.id); p.energy = Math.round(e.energy);
      const ss = p.ss = p.ss || { apps: 0, st: 0, mins: 0, g: 0, a: 0, rs: 0, potm: 0, yc: 0, cs: 0, sv: 0 };
      ss.apps++; if (m.teams[my].xi.includes(e.p)) ss.st++; ss.mins += Math.round(s.mins); ss.g += s.g; ss.a += s.a; ss.sv += s.sv;
      const rt = (rated.find(x => x.e === e) || { r: 6 }).r; ss.rs += rt; if (potm && potm.e === e) { ss.potm++; p.morale = Math.min(100, p.morale + 5); }
      if (e.slot.pos === 'GK' && m.score[1 - my] === 0 && s.mins > 60) ss.cs++;
      if (s.yc) { ss.yc++; if (ss.yc % 5 === 0) p.ban = 1; }
      if (e.red) p.ban = 1;
      if (e.injured) { p.inj = 1 + Math.floor(r() * 3) - (C.level('med') >= 10 ? 1 : 0); if (r() < .12) p.inj += 3; p.inj = Math.max(1, Math.round(p.inj * (1 - C.level('med') * .02))); }
      const boost = 1 + C.pbv('mor') + C.staffF('mot') * .5; p.morale = C.clamp(p.morale + (res > 0 ? 2 * boost : res < 0 ? -2 : 0) + (rt >= 7.5 ? 2 * boost : rt < 5.5 ? -2 : 0), 10, 100);
      // development from what they did (tiny steps, capped by potential)
      const age = ([0, 1.4, 1.2, 1, .8][p.year] || 1) * (1 + C.pbv('xp') + C.staffF('dev') * .2), g = {};
      p.xp = p.xp || {}; const add = (k, v) => { if (p.a[k] == null) return; p.xp[k] = (p.xp[k] || 0) + v * age; };
      if (p.pos === 'GK') { add('stp', s.sv * .06); add('ref', s.sv * .05); add('psn', s.mins * .0015); add('dis', s.pc * .003); add('crs', .02); }
      else { add('pas', s.pc * .004); add('def', (s.tk + s.int + s.blk) * .035); add('sho', s.sh * .035 + s.g * .08); add('dri', s.drb * .04); add('phy', s.mins * .0012); add('pac', s.mins * .0008); }
      for (const k in p.xp) while (p.xp[k] >= 1) { p.xp[k] -= 1; if (p.a[k] < C.attrCap(p, k)) { p.a[k]++; g[k] = (g[k] || 0) + 1; } }
      if (Object.keys(g).length) { const old = p.rating; p.rating = C.calcRating(p); p.up = p.rating - old; gains.push([p.id, g]); }
      // playing out of position slowly builds familiarity
      if (e.fit < 5 && e.fit > 1 && s.mins > 20) { p.fam = p.fam || {}; p.fam[e.slot.pos] = (p.fam[e.slot.pos] || 0) + s.mins / 900; if (p.fam[e.slot.pos] >= 1 && (p.fitB[e.slot.pos] || 0) < 3) { p.fam[e.slot.pos] = 0; p.fitB[e.slot.pos] = (p.fitB[e.slot.pos] || 0) + 1; gains.push([p.id, { pos: e.slot.pos }]); } }
    }
    // everyone else: bans/injuries count down, broken promises sting
    for (const p of car.squad) {
      if (!played.has(p.id)) { if (p.ban) p.ban--; else if (p.inj) p.inj--; if (p.promise === 'starter' || p.promise === 'rotation') p.morale = Math.max(10, p.morale - 3); }
    }
    // money and the AD
    let gate = 0;
    if (f.h === 0) { gate = Math.round(C.attendance(f) * 3 * (1 + C.pbv('gate'))); car.cash += gate; }
    const staffUps = C.staffAfterMatch(res); car.cp += res > 0 ? 15 : res === 0 ? 8 : 5;
    const exp = car.job.stars, conf0 = car.adConf; car.adConf = C.clamp(car.adConf + (res > 0 ? 3 + (exp === 1 ? 1 : 0) : res < 0 ? -3 - (exp === 3 ? 1 : 0) : 0), 0, 100);
    // the rest of the matchday
    const rr = C.rng(S.md * 1013 + S.n);
    S.fx.filter(x => x.md === S.md && x !== f && x.hs == null).forEach(x => quickResult(x, rr, x.ko));
    const rep = { md: S.md, h: f.h, a: f.a, hs: f.hs, as: f.as, pens: f.pens, stats: m.st, ev: m.events.filter(e => ['goal', 'red', 'yellow', 'injury', 'penalty'].includes(e.type)).map(e => ({ min: e.min, side: e.side, type: e.type, who: e.who ? e.who.p.fn[0] + '. ' + e.who.p.ln : '' })),
      rated: rated.slice(0, 22).map(x => ({ side: x.e.side, id: x.e.p.id, n: x.e.p.fn[0] + '. ' + x.e.p.ln, pos: x.e.slot.pos, r: x.r, g: x.e.st.g, a: x.e.st.a, mins: Math.round(x.e.st.mins) })), potm: potm ? { side: potm.e.side, n: potm.e.p.fn + ' ' + potm.e.p.ln } : null,
      gains, gate, conf: car.adConf - conf0, my, staffUps, cp: res > 0 ? 15 : res === 0 ? 8 : 5, bonus: C.bonusLines() };
    S.reports[S.md] = rep; car.restAt = C.now();
    advance(); C.save(); return rep;
  };

  // ---------- after each matchday ----------
  function advance() {
    const car = C.car(), S = car.sea; S.md++;
    if (S.md === ROUNDS + 1 && S.phase === 'reg' && C.isTransition(car)) { S.regPos = C.myPos(); finishSeason(); }
    else if (S.md === ROUNDS + 1 && S.phase === 'reg') {
      const t = C.table(), top = t.slice(0, 4).map(x => x.i);
      S.fx.push({ md: 15, h: top[0], a: top[3], ko: 1, wx: 0 }, { md: 15, h: top[1], a: top[2], ko: 1, wx: 1 }); S.phase = 'tourn'; S.regPos = C.myPos();
      if (!top.includes(0)) { simKO(); finishSeason(); }
    } else if (S.md === ROUNDS + 2 && S.phase === 'tourn') {
      const semis = S.fx.filter(f => f.md === 15), a = winnerOf(semis[0]), b = winnerOf(semis[1]);
      S.fx.push({ md: 16, h: a, a: b, ko: 1, wx: 2 });
      if (a !== 0 && b !== 0) { simKO(); finishSeason(); }
    } else if (S.md === ROUNDS + 3) finishSeason();
  }
  function simKO() { const S = C.sea(), r = C.rng(S.n * 4441); for (let md = S.md; md <= 16; md++) {
    S.fx.filter(f => f.md === md && f.hs == null).forEach(f => quickResult(f, r, true));
    if (md === 15 && !S.fx.some(f => f.md === 16)) { const s = S.fx.filter(f => f.md === 15); S.fx.push({ md: 16, h: winnerOf(s[0]), a: winnerOf(s[1]), ko: 1, wx: 2 }); }
  } S.md = 17; }
  function finishSeason() {
    const car = C.car(), S = car.sea; if (S.end) return;
    const fin = S.fx.find(f => f.md === 16), champ = fin && fin.hs != null ? winnerOf(fin) : null;
    const pos = S.regPos || C.myPos(), st = { pos, final: !!(fin && (fin.h === 0 || fin.a === 0)), champ: champ === 0 };
    const goal = GOALS[car.job.stars], met = C.isTransition(car) ? pos <= 4 : goal[1](st);
    car.adConf = C.clamp(car.adConf + (met ? 15 : -15) + (st.champ ? 10 : 0), 0, 100);
    S.end = { pos, met, champ: st.champ, final: st.final, champName: champ != null ? S.teams[champ].name : '' };
    S.phase = 'done'; S.md = 17;
    if (!C.portalOpen()) C.openPortalWindow();
    C.careerSeasonEnd();
  }
  C.simRestOfSeason = () => { // used by the "skip" test tool
    const S = C.sea(), r = C.rng(S.n * 8191);
    while (S.phase === 'reg') { S.fx.filter(f => f.md === S.md && f.hs == null).forEach(f => quickResult(f, r)); C.car().squad.forEach(p => { if (p.ban) p.ban--; else if (p.inj) p.inj--; }); advance(); }
    if (S.phase === 'tourn') { simKO(); finishSeason(); } C.save();
  };

  // ---------- next season: graduation, class years, raises, walk-on tryouts ----------
  C.startNextSeason = () => {
    const car = C.car(); if (C.portalOpen()) C.closePortalNow();
    const left = car.squad.filter(p => p.year >= 4 && !p.rs);
    car.squad = car.squad.filter(p => !(p.year >= 4 && !p.rs));
    for (const p of car.squad) {
      if (p.rs) p.rs = false; else p.year++;
      if (p.raise) { p.schol = Math.round((p.schol + p.raise * car.job.coa) / 500) * 500; p.raise = 0; }
      if (p.ss) { p.cs = p.cs || { apps: 0, g: 0, a: 0, mins: 0, seasons: 0 }; p.cs.apps += p.ss.apps; p.cs.g += p.ss.g; p.cs.a += p.ss.a; p.cs.mins += p.ss.mins; p.cs.seasons++; p.ss = null; }
      p.ban = 0; p.inj = 0; p.energy = 100;
    }
    car.captains = car.captains.filter(id => C.P(id)); car.devq = car.devq.filter(q => C.P(q.pid));
    const walk = []; const r = C.rng(C.now() & 0xffffff);
    while (car.squad.length < 18) { const pos = ['GK', 'CB', 'CM', 'ST', 'LB', 'RB', 'LW', 'RW', 'DM'][car.squad.length % 9]; const p = C.genPlayer(r, { gender: car.gender, pos, rating: car.job.rating - 7, year: 1 }); p.from = 'Walk-on tryout'; car.squad.push(p); walk.push(p); }
    C.assignNumbers(car.squad);
    const up = C.reclassStep(car);
    car.season++; car.sea = null; if (car.tac) { car.tac.xi = []; car.tac.bench = []; } car.offers = [];
    if (car.rec) car.rec.jobsUsed = 0;
    C.ensureSeason(car); C.save();
    return { left, walk, up };
  };

  // ---------- energy recovers in real time (the natural pace limit, Q13) ----------
  C.recover = () => {
    const car = C.car(); if (!car || !car.squad) return false; const t = C.now(); if (!car.restAt) { car.restAt = t; return false; }
    const hrs = (t - car.restAt) / H; if (hrs < 1 / 60) return false;
    const rate = C.recRate();
    car.squad.forEach(p => { p.energy = Math.min(100, p.energy + hrs * rate); });
    car.restAt = t; return true;
  };
  C.recRate = () => 6 * (1 + C.level('gym') * .015 + C.pbv('rec') + C.staffF('snc') * .3);
  C.fullRecovery = () => { const low = Math.min(...C.car().squad.map(p => p.energy)); return Math.max(0, (100 - low) / C.recRate() * 3600); };

  // ---------- attendance: stadium, form and local players (Q20j) ----------
  C.isLocal = p => { const st = C.college().state; return p.town && p.town.trim().endsWith(' ' + st); };
  C.attendance = (f) => {
    const car = C.car(), l = C.level('stadium'), seats = Math.round(200 + 50 * l + 5 * l * l), t = C.table().find(x => x.i === 0);
    const form = t ? t.form.slice(-3).filter(x => x === 'W').length : 0, locals = (car.tac && car.tac.xi || []).map(C.P).filter(p => p && C.isLocal(p)).length;
    const r = C.rng((f.md + 1) * 97 + car.season);
    return Math.min(seats, Math.round(seats * (.38 + form * .1 + (f.ko ? .2 : 0) + r() * .12) * (1 + C.pbv('crowd'))) + locals * 25);
  };
  C.WEATHER = [['☀️', 'Clear', 'a clear evening'], ['🌤', 'Mild', 'a mild night'], ['🌧', 'Rain', 'steady rain'], ['🌬', 'Windy', 'a swirling wind'], ['🌙', 'Floodlights', 'under the lights']];

  // ================= Season tab =================
  let view = 'fix';
  C.setSeasonView = v => { view = v; C.render(); };
  C.seasonHTML = () => {
    const car = C.car(), S = C.sea(), col = C.college(), T = C.table();
    const nm = i => S.teams[i].name, crest = (i, s = 26) => { const t = S.teams[i]; return C.crestSVG(t.c1, t.c2, t.abbr.slice(0, 2), s); };
    let body = '';
    if (view === 'fix') {
      const mds = [...new Set(S.fx.map(f => f.md))];
      body = mds.map(md => { const f = S.fx.find(x => x.md === md && (x.h === 0 || x.a === 0)); const others = S.fx.filter(x => x.md === md && x !== f);
        const label = md === 0 ? '🏠 Homecoming (friendly)' : md <= ROUNDS ? 'Match ' + md : md === 15 ? 'Conference semi-final' : 'Conference final';
        const row = x => { const me = x.h === 0 || x.a === 0, done = x.hs != null; const res = done && me ? (x.h === 0 ? Math.sign(x.hs - x.as) : Math.sign(x.as - x.hs)) || (x.pens ? (x.h === 0 ? Math.sign(x.pens[0] - x.pens[1]) : Math.sign(x.pens[1] - x.pens[0])) * .5 : 0) : null;
          return `<button class="fxrow ${me ? 'me' : ''}" ${done && me && S.reports[x.md] ? `data-act="report" data-v="${x.md}"` : ''}><span class="ft">${crest(x.h, 22)}<b>${C.esc(nm(x.h))}</b></span><span class="fs ${res == null ? '' : res > 0 ? 'w' : res < 0 ? 'l' : 'd'}">${done ? `${x.hs}–${x.as}${x.pens ? `<small>p ${x.pens[0]}–${x.pens[1]}</small>` : ''}` : md === S.md && me ? 'Next' : 'v'}</span><span class="ft r"><b>${C.esc(nm(x.a))}</b>${crest(x.a, 22)}</span></button>`; };
        return `<div class="fxmd ${md === S.md ? 'cur' : ''}"><h4>${label}</h4>${f ? row(f) : ''}${others.length ? `<details><summary>Other results</summary>${others.map(row).join('')}</details>` : ''}</div>`; }).join('');
    }
    if (view === 'table') body = `<div class="card tbl2"><div class="tr2 th"><span>#</span><span></span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span></div>
      ${T.map((t, i) => `<div class="tr2 ${t.i === 0 ? 'me' : ''} ${i === 3 ? 'cut' : ''}"><span>${i + 1}</span><span class="tn">${crest(t.i, 20)}${C.esc(nm(t.i))}</span><span>${t.p}</span><span>${t.w}</span><span>${t.d}</span><span>${t.l}</span><span>${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</span><b>${t.pts}</b></div>`).join('')}
      <p class="note">Top 4 reach the conference tournament.</p></div>`;
    if (view === 'stats') { const sq = car.squad.filter(p => p.ss && p.ss.apps);
      const top = (k, f, n = 5) => sq.slice().sort((a, b) => f(b) - f(a)).filter(p => f(p) > 0).slice(0, n);
      const list = (title, arr, f, fmt) => `<h3 class="jh">${title}</h3><div class="card">${arr.length ? arr.map(p => `<button class="srow" data-act="player" data-v="${p.id}" style="width:100%"><span>${C.esc(p.fn[0] + '. ' + p.ln)} <small class="mutey">${p.pos}</small></span><b>${fmt(f(p))}</b></button>`).join('') : '<p class="note" style="margin:0">No matches yet.</p>'}</div>`;
      body = list('⚽ Goals', top('g', p => p.ss.g), p => p.ss.g, v => v) + list('🅰️ Assists', top('a', p => p.ss.a), p => p.ss.a, v => v) + list('⭐ Average rating', top('r', p => p.ss.apps >= 2 ? p.ss.rs / p.ss.apps : 0), p => p.ss.rs / p.ss.apps, v => v.toFixed(2)) + list('🏆 Player of the Match', top('p', p => p.ss.potm), p => p.ss.potm, v => v); }
    const endCard = S.end ? `<div class="card seasonend">${S.end.champ ? `<div class="scenebn" style="margin:-14px -14px 10px">${C.artSlot('trophy', C.sceneTrophy(col.c1, col.c2))}</div>` : ''}<b>${S.end.champ ? '🏆 Conference champions!' : `Season ${S.n} over · finished ${C.ord(S.end.pos)}`}</b><p>${S.end.met ? '✔ Director\'s goal met' : '✖ Director\'s goal missed'}: ${GOALS[car.job.stars][0]}.${S.end.champName && !S.end.champ ? ' Champions: ' + C.esc(S.end.champName) + '.' : ''}</p>
      <p class="note" style="margin:6px 0">${C.portalOpen() ? '🚪 The transfer window is open. Seniors graduate when the new season starts.' : 'Seniors graduate when the new season starts.'}</p>
      ${car.offers && car.offers.length ? `<button class="btn full offbn" data-act="offers">📨 ${car.offers.length} job offer${car.offers.length > 1 ? 's' : ''}</button>` : ''}${C.careerCardHTML()}<button class="btn full pri" data-act="nextseason">Start Season ${S.n + 1}${C.portalOpen() ? ' (closes the window)' : ''}</button></div>` : '';
    return `<div class="view scrolly"><div class="phdr sq"><div class="row1">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 38)}<div><b>Season ${S.n}</b><small>${C.esc(S.conf)}${C.isTransition(car) ? ' · 🔁 Transition' : ''} · ${S.end ? 'Finished' : 'Pos ' + C.ord(C.myPos())} · ${car.adConf >= 60 ? '😀' : car.adConf >= 40 ? '🙂' : car.adConf >= 25 ? '😐' : '😟'} Director</small></div></div></div>
      ${endCard}<div class="filters">${[['fix', '📅 Fixtures'], ['table', '📊 Table'], ['stats', '⭐ Stats']].map(([k, n]) => `<button class="f ${view === k ? 'on' : ''}" data-act="seav" data-v="${k}">${n}</button>`).join('')}</div>
      <div style="padding:0 16px 16px">${body}</div></div>`;
  };
})(window.CFC);
