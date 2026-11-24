// Club FC: the season (Phase 5). Conference of 8, 14 matches home and away, a top-4 conference tournament,
// results, the table, energy and recovery, match-based development, promises, and rolling into the next season.
(function (C) {
  const H = 3.6e6, ROUNDS = 14;
  const CONF = ['Prairie', 'Gulf Coast', 'Heartland', 'Frontier', 'Great Lakes', 'Sun Belt', 'Big Sky', 'Tidewater'];
  const GOALS = { 3: ['Top 4 and reach the conference final', s => s.pos <= 4 && s.final], 2: ['Finish in the top half', s => s.pos <= 4], 1: ['Stay out of the bottom 2', s => s.pos <= 6] };
  C.SEASON_GOAL = GOALS;
  C.SEASON_BUDGET = C.ECON.seasonBudget;  // the Director's budget each new season (ECONOMY.md)
  const pois = (r, l) => { let k = 0, p = Math.exp(-l), s = p, u = r(); while (u > s && k < 9) { k++; p *= l / k; s += p; } return k; };

  // ---------- setup ----------
  // 1.04 (SCOPE_1.04 s1, s4): your conference. Each tier keeps its conference size in AI colleges, and one of them sits out (the spare)
  // while you're in it, so no AI college ever moves between tiers. The spare changes only through the faux AI promotion (startNextSeason).
  C.ensureConf = car => {
    if (car.conf && car.conf.tier === car.tier) { if (!car.conf.region) { car.conf.name = C.regionOf(C.college(car).state) + ' Conference'; car.conf.region = 1; } return car.conf; }
    const N = C.CONF_SIZE[car.tier] || 8, r = C.rng(((car.created & 0xffffff) ^ (car.tier * 92821)) >>> 0);
    let ids = C.COLLEGES.filter(c => c.tier === car.tier && c.id !== car.college).map(c => c.id).map(v => [r(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]).slice(0, N);
    if (ids.length < N) ids = ids.concat(C.collegesAt(car.tier, [car.college, ...ids]).map(c => c.id).slice(0, N - ids.length));
    car.conf = { tier: car.tier, ids, out: ids[Math.floor(r() * ids.length)], name: C.regionOf(C.college(car).state) + ' Conference', region: 1 };   // 1.05: your state's region
    return car.conf;
  };
  C.hqOkFor = tier => C.level('hq') >= (C.TIER_GATE[tier] || 0);
  C.ensureSeason = (car = C.car()) => {
    if (!car || car.sea) return;
    const r = C.rng((car.created & 0xffffff) ^ 0x2545f491 ^ (car.season * 7919)), col = C.college(car), conf = C.ensureConf(car), N = C.CONF_SIZE[car.tier] || 8;
    const others = conf.ids.filter(id => id !== conf.out).slice(0, N - 1).map(id => C.COLLEGES[id]);
    const teams = [{ me: 1, col: car.college, name: col.short, abbr: col.abbr, c1: col.c1, c2: col.c2, rating: car.job.rating }]
      .concat(others.map(c => ({ col: c.id, name: c.short, abbr: c.abbr, c1: c.c1, c2: c.c2, rating: C.collegeRating(c.id, car.season),   /* 1.05 (QA-55): each college at its own strength */ form: Object.keys(C.FORMATIONS)[Math.floor(r() * 5)], ment: 1 + Math.floor(r() * 3), seed: Math.floor(r() * 1e9) })));
    // double round robin, circle method: 8 teams = 14 matches, 10 = 18, 12 = 22
    const n = teams.length, R = 2 * (n - 1), ids = teams.map((_, i) => i), fx = [];
    for (let rd = 0; rd < n - 1; rd++) { for (let i = 0; i < n / 2; i++) { const a = ids[i], b = ids[n - 1 - i]; fx.push({ md: rd + 1, h: rd % 2 ? b : a, a: rd % 2 ? a : b }); } ids.splice(1, 0, ids.pop()); }
    fx.slice().forEach(f => fx.push({ md: f.md + n - 1, h: f.a, a: f.h }));
    fx.forEach(f => f.wx = Math.floor(r() * 5));
    car.sea = { n: car.season, conf: conf.name, R, teams, fx: fx.sort((a, b) => a.md - b.md), md: 1, phase: 'reg', reports: {}, end: null };
    // 1.04 (SCOPE_1.04 s6): Pre-season = 5 friendlies (matchdays -4 to 0) against colleges from your tier and the tier above
    if (car.pre) { const pick = (t, k) => C.COLLEGES.filter(c => c.tier === t && c.id !== car.college && !conf.ids.includes(c.id)).concat(C.COLLEGES.filter(c => c.tier === t && conf.ids.includes(c.id) && c.id !== car.college))
        .map(v => [r(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]).slice(0, k);
      const up = car.tier > 1 ? car.tier - 1 : car.tier, guests = pick(car.tier, 3).map(c => [c, 0]).concat(pick(up, 2).map(c => [c, up < car.tier ? 4 : 0]));
      guests.forEach(([c, plus], k) => { teams.push({ guest: 1, col: c.id, name: c.short, abbr: c.abbr, c1: c.c1, c2: c.c2, rating: C.collegeRating(c.id, car.season), form: Object.keys(C.FORMATIONS)[Math.floor(r() * 5)], ment: 2, seed: Math.floor(r() * 1e9) });
        car.sea.fx.push({ md: k - 4, h: k % 2 ? teams.length - 1 : 0, a: k % 2 ? 0 : teams.length - 1, friendly: 1, wx: Math.floor(r() * 5) }); });
      car.sea.fx.sort((a, b) => a.md - b.md); car.sea.md = -4; }
    if (car.homecoming != null && car.hcDone !== car.season) car.hcDone = car.season;   // 1.04: no job moves, so no homecoming friendly
    if (car.adConf == null) car.adConf = 50;
    car.restAt = car.restAt || C.now();
    C.save();
  };
  C.friendliesLeft = (car = C.car()) => { if (car && !car.sea) C.ensureSeason(car); const S = car && car.sea;   // 1.04: build the season first, so a new career counts its 5 friendlies
    return S ? S.fx.filter(f => f.friendly && f.md < 1 && f.hs == null).length : 0; };
  // labels for a fixture: 'long' for the match screen, 'short' for the calendar strip
  C.fxLabel = f => { const S = C.sea(), R = S.R || 14;
    if (f.friendly) return f.md <= 0 && f.md >= -4 ? { long: `Pre-season friendly ${f.md + 5} of 5`, short: 'F' + (f.md + 5), up: `FRIENDLY ${f.md + 5} OF 5` } : { long: 'Friendly', short: 'FR', up: 'FRIENDLY' };
    if (f.nat) return f.natf ? { long: 'National Championship final', short: 'NF', up: 'NATIONAL FINAL' } : S.fx.filter(x => x.nat && x.md === f.md).length === 4 ? { long: 'National Championship quarter-final', short: 'NQF', up: 'NATIONAL QUARTER-FINAL' } : { long: 'National Championship semi-final', short: 'NSF', up: 'NATIONAL SEMI-FINAL' };
    if (f.po) return f.pof ? { long: 'Promotion play-off final', short: 'POF', up: 'PLAY-OFF FINAL' } : { long: 'Promotion play-off semi-final', short: 'POS', up: 'PLAY-OFF SEMI-FINAL' };
    if (f.ko) return f.md === R + 1 ? { long: 'Conference semi-final', short: 'SF', up: 'SEMI-FINAL' } : { long: 'Conference final', short: 'F', up: 'FINAL' };
    return { long: `Conference · Match ${f.md}`, short: 'M' + f.md, up: `MATCH ${f.md} OF ${R}` }; };
  C.sea = () => { C.ensureSeason(); const S = C.car().sea; if (S && !S.R) { S.R = 14; S.legacy = 1; } return S; };   // 1.04: a season begun under 1.03 rules finishes under them
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
    const keep = f.friendly ? car.squad.map(p => [p, p.energy, p.inj, p.injury, p.ban, p.reinj]) : null;   // 1.04 (SCOPE_1.04 s6)
    const rated = C.rateMatch(m), potm = rated[0], mine = rated.filter(x => x.e.side === my);
    const res = Math.sign(m.score[my] - m.score[1 - my]) || (m.pens ? Math.sign(m.pens[my] - m.pens[1 - my]) * .5 : 0);
    const played = new Set(), gains = [], nut = 1 + C.physGrowth(C.eff('nutrition')) / 100, nutMor = C.nutMorale(C.eff('nutrition'));
    for (const e of m.ents.filter(e => e.side === my)) {
      const p = C.P(e.p.id); if (!p) continue; const s = e.st; if (s.mins < .5 && !e.on) continue;
      played.add(p.id); p.energy = Math.round(e.energy);
      const ss = p.ss = p.ss || { apps: 0, st: 0, mins: 0, g: 0, a: 0, rs: 0, potm: 0, yc: 0, cs: 0, sv: 0 };
      ss.apps++; if (m.teams[my].xi.includes(e.p)) ss.st++; ss.mins += Math.round(s.mins); ss.g += s.g; ss.a += s.a; ss.sv += s.sv;
      const rt = (rated.find(x => x.e === e) || { r: 6 }).r; ss.rs += rt; if (potm && potm.e === e) { ss.potm++; p.morale = Math.min(100, p.morale + 5); }
      if (e.slot.pos === 'GK' && m.score[1 - my] === 0 && s.mins > 60) ss.cs++;
      if (s.yc) { ss.yc++; if (ss.yc % 5 === 0) p.ban = 1; }
      if (e.red) p.ban = 1;
      if (e.injured) C.assignInjury(p, r);
      const boost = 1 + C.pbv('mor') + C.staffF('mot') * .5; p.morale = C.clamp(p.morale + (res > 0 ? 2 * boost : res < 0 ? -2 : 0) + (rt >= 7.5 ? 2 * boost : rt < 5.5 ? -2 : 0), 10, 100);
      // development from what they did (tiny steps, capped by potential)
      const age = ([0, 1.4, 1.2, 1, .8][p.year] || 1) * (1 + C.pbv('xp') + C.staffF('dev') * .2), g = {};
      p.xp = p.xp || {}; const add = (k, v) => { if (p.a[k] == null) return; p.xp[k] = (p.xp[k] || 0) + v * age; };
      if (p.pos === 'GK') { add('stp', s.sv * .06); add('ref', s.sv * .05); add('psn', s.mins * .0015); add('dis', s.pc * .003); add('crs', .02); }
      else { add('pas', s.pc * .004); add('def', (s.tk + s.int + s.blk) * .035); add('sho', s.sh * .035 + s.g * .08); add('dri', s.drb * .04); add('phy', s.mins * .0012 * nut); add('pac', s.mins * .0008 * nut); }
      for (const k in p.xp) while (p.xp[k] >= 1) { p.xp[k] -= 1; if (p.a[k] < C.attrCap(p, k)) { p.a[k]++; g[k] = (g[k] || 0) + 1; } }
      if (Object.keys(g).length) { const old = p.rating; p.rating = C.calcRating(p); p.up = p.rating - old; gains.push([p.id, g]); }
      // playing out of position slowly builds familiarity
      if (e.fit < 5 && e.fit > 1 && s.mins > 20) { p.fam = p.fam || {}; p.fam[e.slot.pos] = (p.fam[e.slot.pos] || 0) + s.mins / 900; if (p.fam[e.slot.pos] >= 1 && (p.fitB[e.slot.pos] || 0) < 3) { p.fam[e.slot.pos] = 0; p.fitB[e.slot.pos] = (p.fitB[e.slot.pos] || 0) + 1; gains.push([p.id, { pos: e.slot.pos }]); } }
    }
    // everyone else: bans/injuries count down, broken promises sting
    for (const p of car.squad) {
      if (nutMor) p.morale = Math.min(100, p.morale + nutMor);
      if (!played.has(p.id)) { if (p.ban) p.ban--; else if (p.inj) p.inj--; if (p.promise === 'starter' || p.promise === 'rotation') p.morale = Math.max(10, p.morale - 3); }
    }
    const flu = C.afterMatchMedical(m, my, played, r);
    // money and the AD
    let gate = 0;
    const paid = !f.friendly && !f.n;   // 1.04: friendlies and neutral play-offs earn no gate or broadcast money
    if (f.h === 0 && paid) { gate = Math.round(C.attendance(f) * 3 * (1 + C.pbv('gate'))); car.cash += gate; }
    // Media Center (9p): broadcast money after home matches, and extra Reputation for every win
    const bc = f.h === 0 && paid ? C.broadcastPay(C.eff('media'), res > 0, car.tier) : 0; car.cash += bc;
    const repUp = res > 0 && !f.friendly ? C.WIN_REP * (1 + C.mediaRep(C.eff('media')) / 100) : 0; if (repUp) car.rep = C.clamp((car.rep ?? 10) + repUp, 0, 100);
    const staffUps = f.friendly ? [] : C.staffAfterMatch(res); if (!f.friendly) car.cp += res > 0 ? 15 : res === 0 ? 8 : 5;
    const exp = car.job.stars, conf0 = car.adConf; if (!f.friendly) car.adConf = C.clamp(car.adConf + (res > 0 ? 3 + (exp === 1 ? 1 : 0) : res < 0 ? -3 - (exp === 3 ? 1 : 0) : 0), 0, 100);
    if (keep) keep.forEach(([p, en, inj, injury, ban, reinj]) => { p.energy = Math.round(en - Math.max(0, en - p.energy) * .5); p.inj = inj; p.injury = injury; p.ban = ban; p.reinj = reinj; });   // 1.04.01 (QA-44): half the Freshness, no injuries
    // the rest of the matchday
    const rr = C.rng(S.md * 1013 + S.n);
    S.fx.filter(x => x.md === S.md && x !== f && x.hs == null).forEach(x => quickResult(x, rr, x.ko));
    const rep = { md: S.md, h: f.h, a: f.a, hs: f.hs, as: f.as, pens: f.pens, stats: m.st, ev: m.events.filter(e => ['goal', 'red', 'yellow', 'injury', 'penalty'].includes(e.type)).map(e => ({ min: e.min, side: e.side, type: e.type, who: e.who ? e.who.p.fn[0] + '. ' + e.who.p.ln : '' })),
      rated: rated.map(x => ({ side: x.e.side, id: x.e.p.id, n: x.e.p.fn[0] + '. ' + x.e.p.ln, pos: x.e.slot.pos, r: x.r, g: x.e.st.g, a: x.e.st.a, mins: Math.round(x.e.st.mins) })), potm: potm ? { side: potm.e.side, n: potm.e.p.fn + ' ' + potm.e.p.ln } : null,
      gains, gate, bc, repUp, conf: car.adConf - conf0, my, staffUps, flu, injuries: m.ents.filter(e => e.side === my && e.injured).map(e => { const p = C.P(e.p.id); return p && p.injury ? [p.fn[0] + '. ' + p.ln, p.injury.icon, p.injury.name, p.injury.season ? 'season' : p.inj] : null; }).filter(Boolean), cp: f.friendly ? 0 : res > 0 ? 15 : res === 0 ? 8 : 5, friendly: !!f.friendly, bonus: C.bonusLines() };
    S.reports[S.md] = rep; car.restAt = C.now();
    advance(); C.save(); return rep;
  };

  // ---------- after each matchday ----------
  function advance() {
    const car = C.car(), S = car.sea, R = S.R || 14; S.md++;
    if (S.phase === 'reg' && S.md === R + 1) {
      if (C.isTransition && C.isTransition(car)) { S.regPos = C.myPos(); return finishSeason(); }
      const t = C.table(), top = t.slice(0, 4).map(x => x.i); S.regTable = t.map(x => x.i);
      S.fx.push({ md: R + 1, h: top[0], a: top[3], ko: 1, wx: 0 }, { md: R + 1, h: top[1], a: top[2], ko: 1, wx: 1 }); S.phase = 'tourn'; S.regPos = C.myPos();
      if (!top.includes(0)) { simKO(); playoff(); }
    } else if (S.phase === 'tourn' && S.md === R + 2) {
      const semis = S.fx.filter(f => f.md === R + 1 && f.ko), a = winnerOf(semis[0]), b = winnerOf(semis[1]);
      S.fx.push({ md: R + 2, h: a, a: b, ko: 1, wx: 2 });
      if (a !== 0 && b !== 0) { simKO(); playoff(); }
    } else if (S.phase === 'tourn' && S.md === R + 3) playoff();
    else if (S.phase === 'po' && S.md === R + 4) { const mine = S.fx.find(f => f.po && f.md === R + 3 && (f.h === 0 || f.a === 0));
      if (mine && mine.hs != null && winnerOf(mine) === 0) { const other = S.fx.find(f => f.po && f.md === R + 3 && f !== mine); S.fx.push({ md: R + 4, h: winnerOf(other), a: 0, ko: 1, po: 1, pof: 1, n: 1, wx: 2 }); }
      else { S.md = R + 7; finishSeason(); } }
    else if (S.phase === 'po' && S.md >= R + 5) { S.md = R + 7; finishSeason(); }
    else if (S.phase === 'nat' && (S.md === R + 4 || S.md === R + 5)) natNext();
    else if (S.phase === 'nat' && S.md >= R + 6) { S.md = R + 7; finishSeason(); }
  }
  function simKO() { const S = C.sea(), R = S.R || 14, r = C.rng(S.n * 4441); for (let md = S.md; md <= R + 2; md++) {
    S.fx.filter(f => f.md === md && f.hs == null && f.ko && !f.po).forEach(f => quickResult(f, r, true));
    if (md === R + 1 && !S.fx.some(f => f.md === R + 2 && f.ko)) { const s = S.fx.filter(f => f.md === R + 1 && f.ko); S.fx.push({ md: R + 2, h: winnerOf(s[0]), a: winnerOf(s[1]), ko: 1, wx: 2 }); }
  } S.md = R + 3; }
  // 1.04.01 (QA-56; the FEEDBACK 108 format): 3rd and 4th each play a semi-final against one of the two bottom-ranked teams of the league
  // above (upper 17th v lower 4th, upper 18th v lower 3rd), neutral, straight to penalties. An upper-league team always beats a lower-league
  // AI side, so if you win your semi-final the final is against the other upper-league team. Only winning the final promotes you.
  // Without the HQ level for the tier above, your semi-final is a walkover. No play-off at T1 (going pro comes later).
  const upperWins = (f, up, r) => { quickResult(f, r, true); if (winnerOf(f) !== up) { if (f.h === up) { f.hs = Math.max(f.hs, f.as + 1); } else { f.as = Math.max(f.as, f.hs + 1); } delete f.pens; } };
  function playoff() { const car = C.car(), S = car.sea, R = S.R || 14; S.md = R + 3; S.phase = 'po';
    if (S.legacy || !S.regTable) { S.md = R + 7; return finishSeason(); }
    if (car.tier <= 1) return nationalsOrEnd();
    const r = C.rng(S.n * 733 + car.tier), pool = C.COLLEGES.filter(c => c.tier === car.tier - 1 && c.id !== car.college && !c.custom).sort((a, b) => C.collegeOffset(b.id) - C.collegeOffset(a.id)).slice(-2);   // 1.05 (QA-55): the two weakest of the tier above (stronger first)
    const ups = pool.map((c, k) => { S.teams.push({ guest: 1, upper: 1, col: c.id, name: c.short, abbr: c.abbr, c1: c.c1, c2: c.c2, rating: C.collegeRating(c.id, car.season), form: Object.keys(C.FORMATIONS)[Math.floor(r() * 5)], ment: 2, seed: Math.floor(r() * 1e9) }); return S.teams.length - 1; });
    const l3 = S.regTable[2], l4 = S.regTable[3];
    const sA = { md: R + 3, h: ups[0], a: l4, ko: 1, po: 1, n: 1, wx: 3 }, sB = { md: R + 3, h: ups[1], a: l3, ko: 1, po: 1, n: 1, wx: 3 }; S.fx.push(sA, sB); S.poUps = ups;
    const mine = [sA, sB].find(f => f.a === 0), other = [sA, sB].find(f => f !== mine);
    upperWins(other || sA, (other || sA).h, r); if (!mine) { upperWins(sB, sB.h, r); return nationalsOrEnd(); }
    if (!C.hqOkFor(car.tier - 1)) { mine.wo = mine.h; mine.hs = 3; mine.as = 0; S.md = R + 7; return finishSeason(); }
    // you play your semi-final; the final follows in advance() if you win it
  }
  // ---------- 1.05: the National Championship. The 8 regular-season champions of the tier: yours (1st in your conference, you or an
  // AI college) and one from each other region (generated original colleges). Seeded by points; 1v8, 2v7, 3v6, 4v5; the higher seed hosts the
  // quarter-final and semi-final; the final is neutral; draws straight to penalties. It never affects promotion.
  const NREG = () => Object.keys(C.REGIONS);
  function natField() { const car = C.car(), S = car.sea, R = S.R || 14; if (S.nat) return S.nat;
    const r = C.rng(S.n * 9157 + car.tier * 31 + (car.created & 0xffff)), mine = C.regionOf(C.college(car).state), base = C.tierBase(car.tier), tbl = C.table();
    const champ = S.regTable[0], cp = (tbl.find(t => t.i === champ) || { pts: 0 }).pts, field = [{ ti: champ, pts: cp, rating: S.teams[champ].rating }];
    const names = C.genCollegeNames ? C.genCollegeNames(r, 7) : [], pal = ['#991b1b', '#c2410c', '#15803d', '#0f766e', '#0369a1', '#1e3a8a', '#6d28d9', '#86198f', '#1e293b', '#b45309'];
    NREG().filter(g => g !== mine).slice(0, 7).forEach((g, k) => { const nm = names[k] || { full: g + ' College', short: g }, st = C.REGIONS[g][Math.floor(r() * C.REGIONS[g].length)];
      S.teams.push({ guest: 1, natc: 1, region: g, state: st, name: nm.short, full: nm.full, abbr: nm.full.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3), c1: pal[Math.floor(r() * pal.length)], c2: '#f8fafc',
        rating: base + 4 + Math.floor(r() * 5), form: Object.keys(C.FORMATIONS)[Math.floor(r() * 5)], ment: 2, seed: Math.floor(r() * 1e9) });
      field.push({ ti: S.teams.length - 1, pts: Math.round(R * (1.9 + r() * .7)), rating: S.teams[S.teams.length - 1].rating }); });
    field.sort((a, b) => b.pts - a.pts || b.rating - a.rating).forEach((x, i) => x.seed = i + 1);
    S.nat = { field: field.map(x => ({ ti: x.ti, seed: x.seed, pts: x.pts })), mine: field.some(x => x.ti === 0) }; return S.nat; }
  const seedOf = ti => (C.sea().nat.field.find(x => x.ti === ti) || { seed: 9 }).seed;
  const natFix = (md, a, b, final) => { const hs = seedOf(a) <= seedOf(b); return { md, h: hs ? a : b, a: hs ? b : a, ko: 1, nat: 1, natf: final ? 1 : 0, n: final ? 1 : 0, wx: 4 }; };
  function natRound(md, pairs, final) { const S = C.sea(), r = C.rng(S.n * 4111 + md); const fx = pairs.map(([a, b]) => natFix(md, a, b, final)); S.fx.push(...fx);
    fx.filter(f => f.h !== 0 && f.a !== 0).forEach(f => quickResult(f, r, true)); return fx; }
  function nationalsOrEnd() { const car = C.car(), S = car.sea, R = S.R || 14; const N = natField(), by = k => N.field.find(x => x.seed === k).ti;
    natRound(R + 3, [[by(1), by(8)], [by(4), by(5)], [by(2), by(7)], [by(3), by(6)]]);
    if (N.mine) { S.phase = 'nat'; S.md = R + 3; return; }
    simNat(); S.md = R + 7; finishSeason(); }
  function simNat() { const S = C.sea(), R = S.R || 14; let guard = 0; while (guard++ < 3) { const last = Math.max(...S.fx.filter(f => f.nat).map(f => f.md)), round = S.fx.filter(f => f.nat && f.md === last);
      round.filter(f => f.hs == null).forEach(f => quickResult(f, C.rng(S.n + f.md * 7), true)); if (round.length === 1) break;
      const w = round.map(winnerOf); natRound(last + 1, [[w[0], w[1]], [w[2], w[3]]].slice(0, w.length / 2), w.length === 2); } }
  function natNext() { const S = C.sea(), R = S.R || 14, prev = S.fx.filter(f => f.nat && f.md === S.md - 1), mine = prev.find(f => f.h === 0 || f.a === 0);
    if (!mine || mine.hs == null || winnerOf(mine) !== 0 || prev.length === 1) { simNat(); S.md = R + 7; return finishSeason(); }
    const w = prev.map(winnerOf); natRound(S.md, w.length === 4 ? [[w[0], w[1]], [w[2], w[3]]] : [[w[0], w[1]]], w.length === 2); }
  C.genNat = () => natField();
  function finishSeason() {
    const car = C.car(), S = car.sea, R = S.R || 14; if (S.end) return;
    const fin = S.fx.find(f => f.md === R + 2 && f.ko && !f.po), champ = fin && fin.hs != null ? winnerOf(fin) : null, po = S.fx.find(f => f.po);
    const pos = S.regPos || C.myPos(), st = { pos, final: !!(fin && (fin.h === 0 || fin.a === 0)), champ: champ === 0 };
    const goal = GOALS[car.job.stars], met = C.isTransition && C.isTransition(car) ? pos <= 4 : goal[1](st);
    car.adConf = C.clamp(car.adConf + (met ? 15 : -15) + (st.champ ? 10 : 0), 0, 100);
    // prize money from the Director (ECONOMY.md): goal met, conference final, champions
    const k = 6 - car.tier, prize = (met ? 5000 * k : 0) + (st.final ? 3000 * k : 0) + (st.champ ? 8000 * k : 0); car.cash += prize;
    // 1.04: promotion. 1st or 2nd go up with the HQ level for the tier above; 3rd or 4th through the play-off. Not banked; no relegation.
    let promo = false, why = '';
    if (car.tier > 1 && !S.legacy) { const ok = C.hqOkFor(car.tier - 1);
      if (pos <= 2) { promo = ok; if (!ok) why = 'hq'; }
      else { const semi = S.fx.find(f => f.po && !f.pof && (f.h === 0 || f.a === 0)), fin2 = S.fx.find(f => f.pof);
        if (semi) { if (semi.wo != null) why = 'hq'; else if (fin2 && fin2.hs != null) { promo = winnerOf(fin2) === 0; why = promo ? '' : 'playoff'; } else why = 'playoff'; } } }
    // the AI college shown as promoted (faux, SCOPE_1.04 s4): the best-placed AI in the top 2, otherwise an AI play-off winner
    let aiUp = null; if (car.tier > 1 && !S.legacy && S.regTable) { const c = S.regTable.slice(0, 2).find(i => i !== 0); aiUp = c != null ? c : null; }   // lower-league AI sides never win the play-off (QA-56)
    // 1.05: the National Championship: simulated if you weren't in it; rewards by the round you reached (x the tier step)
    let nat = null; if (!S.legacy && S.regTable) { if (!S.nat) { natField(); natRound(R + 3, (() => { const by = k => S.nat.field.find(x => x.seed === k).ti; return [[by(1), by(8)], [by(4), by(5)], [by(2), by(7)], [by(3), by(6)]]; })()); }
      if (S.fx.some(f => f.nat && f.hs == null)) simNat();
      const fin3 = S.fx.filter(f => f.nat).sort((a, b) => b.md - a.md)[0], nchamp = fin3 && fin3.hs != null ? winnerOf(fin3) : null, myN = S.fx.filter(f => f.nat && (f.h === 0 || f.a === 0));
      const reached = !myN.length ? null : nchamp === 0 ? 'champ' : myN.length === 3 ? 'f' : myN.length === 2 ? 'sf' : 'qf', kk = 6 - car.tier;
      const NP = { qf: [3000, 2], sf: [6000, 4], f: [10000, 6], champ: [20000, 10] }, np = reached ? NP[reached] : null;
      if (np) { car.cash += np[0] * kk; car.rep = C.clamp((car.rep ?? 10) + np[1], 0, 100); }
      if (reached === 'champ') (car.trophies = car.trophies || []).push({ season: S.n, tier: car.tier, title: 'National Champions' });
      nat = { reached, prize: np ? np[0] * kk : 0, rep: np ? np[1] : 0, champName: nchamp != null ? S.teams[nchamp].name : '' }; }
    S.end = { pos, met, champ: st.champ, final: st.final, champName: champ != null ? S.teams[champ].name : '', prize, promo, why, nat, aiUp: aiUp != null ? S.teams[aiUp].col : null, aiUpName: aiUp != null ? S.teams[aiUp].name : '', toTier: promo ? car.tier - 1 : null };
    S.phase = 'done'; S.md = R + 8;
    if (!C.portalOpen()) C.openPortalWindow();
    C.careerSeasonEnd();
  }
  // 1.04 (SCOPE_1.04 s6): "Simulate the rest" of the Pre-season friendlies: results only
  C.simFriendlies = () => { const S = C.sea(), r = C.rng(S.n * 977 + 5); S.fx.filter(f => f.friendly && f.md < 1 && f.hs == null).forEach(f => quickResult(f, r)); if (S.md < 1) S.md = 1; C.save(); };
  C.simRestOfSeason = () => { // used by the "skip" test tool
    const S = C.sea(), r = C.rng(S.n * 8191);
    while (S.phase === 'reg') { S.fx.filter(f => f.md === S.md && f.hs == null).forEach(f => quickResult(f, r, f.ko)); if (S.md >= 1) C.car().squad.forEach(p => { if (p.ban) p.ban--; else if (p.inj) p.inj--; }); advance(); }
    if (S.phase === 'tourn') { simKO(); playoff(); }
    for (let g = 0; g < 6 && (S.phase === 'po' || S.phase === 'nat') && !S.end; g++) { const f = S.fx.find(x => (x.po || x.nat) && x.hs == null && (x.h === 0 || x.a === 0)); if (f) quickResult(f, r, true); advance(); } C.save();
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
    while (car.squad.length < 22) { const pos = ['GK', 'CB', 'CM', 'ST', 'LB', 'RB', 'LW', 'RW', 'DM'][car.squad.length % 9]; const p = C.genPlayer(r, { gender: car.gender, pos, rating: car.job.rating - 7, year: 1 }); p.from = 'Walk-on tryout'; car.squad.push(p); walk.push(p); }
    C.assignNumbers(car.squad);
    // 1.04 (SCOPE_1.04 s2-s4): promotion, or the faux AI promotion (that college sits out as the spare and the old spare comes back)
    const e = car.sea && car.sea.end; let up = null;
    if (e && e.promo) { car.tier--; up = car.tier; car.conf = null; car.job.rating = C.ECON.tierRating[car.tier] + 2; if (!car.renamed) car.renameFree = true;
      C.mail && C.mail('director', '🏆', `Promoted to ${C.TIERS[car.tier].name}`, `Congratulations, Coach. Next season we play in ${C.TIERS[car.tier].name}. ${car.renameFree ? 'As a promoted program you can rename it once for free: Your college, then Rename.' : ''}`); }
    else if (e && e.aiUp != null && car.conf && car.conf.ids.includes(e.aiUp)) car.conf.out = e.aiUp;
    // each season uses its tier's cost to attend and funded scholarships (working values, FEEDBACK 205, 207)
    if (C.TIER_COA[car.tier]) { car.job.coa = C.TIER_COA[car.tier]; car.job.eq = car.job.limit = C.TIER_FUNDED[car.tier]; car.job.pool = car.job.coa * car.job.eq; }
    delete car.reclass; delete car.band;
    car.season++; car.sea = null; if (car.tac) { car.tac.xi = []; car.tac.bench = []; } car.offers = [];
    car.pre = true;   // 1.04 (SCOPE_1.04 s6): every season opens with Pre-season and its 5 friendlies
    const budget = C.SEASON_BUDGET[car.tier] || 8000; car.cash += budget;
    if (car.rec) car.rec.jobsUsed = 0;
    C.ensureSeason(car); C.save();
    return { left, walk, up, budget };
  };

  // ---------- energy recovers in real time (the natural pace limit, Q13) ----------
  C.recover = () => false;  // 9c: Freshness changes only with matches (no real-time recovery)
  C.recoverOld = () => {
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

  // ================= Matchday tab (was Season): next match, calendar strip, form, then fixtures / table / stats =================
  function calStrip() {
    const S = C.sea(), mine = S.fx.filter(f => f.h === 0 || f.a === 0);
    const cell = f => { const opp = S.teams[f.h === 0 ? f.a : f.h], done = f.hs != null, gf = f.h === 0 ? f.hs : f.as, ga = f.h === 0 ? f.as : f.hs;
      const res = done ? (Math.sign(gf - ga) || (f.pens ? Math.sign(f.h === 0 ? f.pens[0] - f.pens[1] : f.pens[1] - f.pens[0]) * .5 : 0)) : null;
      const lab = C.fxLabel(f).short;
      return `<button class="calc ${f.md === S.md && !done ? 'next' : ''} ${res == null ? '' : res > 0 ? 'w' : res < 0 ? 'l' : 'd'}" ${done && S.reports[f.md] ? `data-act="report" data-v="${f.md}"` : ''}><small>${lab}</small>${C.crestSVG(opp.c1, opp.c2, opp.abbr.slice(0, 2), 26)}<b>${done ? gf + '–' + ga : f.h === 0 ? 'H' : 'A'}</b></button>`; };
    return `<div class="calstrip" id="calstrip">${mine.map(cell).join('')}</div>`;
  }
  function formCard() {
    const car = C.car(), S = C.sea(), t = C.table().find(x => x.i === 0), form = t ? t.form.slice(-5) : [];
    const conf = ['😟', '🙁', '😐', '🙂', '😀'][Math.min(4, Math.floor((car.adConf ?? 50) / 20))];
    return `<div class="card formc"><div><small>Form</small><b class="form">${form.length ? form.map(r => `<i class="${r.toLowerCase()}">${r}</i>`).join('') : '—'}</b></div>
      <div><small>Position</small><b>${t && t.p ? C.ord(C.myPos()) : '—'}</b></div><div><small>Director</small><b>${conf}</b></div>
      <p class="goal">🎯 ${C.esc(GOALS[car.job.stars][0])}</p></div>`;
  }

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
        const label = (f || S.fx.find(x => x.md === md)) ? (C.fxLabel(f || S.fx.find(x => x.md === md)).long) : 'Match ' + md;
        const row = x => { const me = x.h === 0 || x.a === 0, done = x.hs != null; const res = done && me ? (x.h === 0 ? Math.sign(x.hs - x.as) : Math.sign(x.as - x.hs)) || (x.pens ? (x.h === 0 ? Math.sign(x.pens[0] - x.pens[1]) : Math.sign(x.pens[1] - x.pens[0])) * .5 : 0) : null;
          return `<button class="fxrow ${me ? 'me' : ''}" ${done && me && S.reports[x.md] ? `data-act="report" data-v="${x.md}"` : ''}><span class="ft">${crest(x.h, 22)}<b>${C.esc(nm(x.h))}</b></span><span class="fs ${res == null ? '' : res > 0 ? 'w' : res < 0 ? 'l' : 'd'}">${done ? `${x.hs}–${x.as}${x.pens ? `<small>p ${x.pens[0]}–${x.pens[1]}</small>` : ''}` : md === S.md && me ? 'Next' : 'v'}</span><span class="ft r"><b>${C.esc(nm(x.a))}</b>${crest(x.a, 22)}</span></button>`; };
        return `<div class="fxmd ${md === S.md ? 'fxnow' : ''}"><h4>${label}</h4>${f ? row(f) : ''}${others.length ? `<details><summary>Other results</summary>${others.map(row).join('')}</details>` : ''}</div>`; }).join('');
    }
    if (view === 'table') body = `<div class="card tbl2"><div class="tr2 th"><span>#</span><span></span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>Pts</span></div>
      ${T.map((t, i) => `<div class="tr2 ${t.i === 0 ? 'me' : ''} ${i === 3 ? 'cut' : ''} ${i < 4 ? 'top4' : ''}"><span>${i + 1}</span><span class="tn">${crest(t.i, 18)}<em>${C.esc(nm(t.i))}</em></span><span>${t.p}</span><span>${t.w}</span><span>${t.d}</span><span>${t.l}</span><span>${t.gf - t.ga > 0 ? '+' : ''}${t.gf - t.ga}</span><b>${t.pts}</b></div>`).join('')}
      <p class="note">Top 4 reach the conference tournament.${car.tier > 1 ? ` 1st and 2nd are promoted (${C.BUILDINGS.hq.name} Lv ${C.TIER_GATE[car.tier - 1]} needed); 3rd and 4th go to the play-off.` : ''} 1st plays in the National Championship.</p></div>`;
    if (view === 'stats') { const sq = car.squad.filter(p => p.ss && p.ss.apps);
      const top = (k, f, n = 5) => sq.slice().sort((a, b) => f(b) - f(a)).filter(p => f(p) > 0).slice(0, n);
      const list = (title, arr, f, fmt) => `<h3 class="jh">${title}</h3><div class="card">${arr.length ? arr.map(p => `<button class="srow" data-act="player" data-v="${p.id}" style="width:100%"><span>${C.esc(p.fn[0] + '. ' + p.ln)} <small class="mutey">${p.pos}</small></span><b>${fmt(f(p))}</b></button>`).join('') : '<p class="note" style="margin:0">No matches yet.</p>'}</div>`;
      body = list('⚽ Goals', top('g', p => p.ss.g), p => p.ss.g, v => v) + list('🅰️ Assists', top('a', p => p.ss.a), p => p.ss.a, v => v) + list('⭐ Average rating', top('r', p => p.ss.apps >= 2 ? p.ss.rs / p.ss.apps : 0), p => p.ss.rs / p.ss.apps, v => v.toFixed(2)) + list('🏆 Player of the Match', top('p', p => p.ss.potm), p => p.ss.potm, v => v); }
    const endCard = S.end ? `<div class="card seasonend">${S.end.champ ? `<div class="scenebn" style="margin:-14px -14px 10px">${C.artSlot('trophy', C.sceneTrophy(col.c1, col.c2))}</div>` : ''}<b>${S.end.champ ? '🏆 Conference champions!' : `Season ${S.n} over · finished ${C.ord(S.end.pos)}`}</b><p>${S.end.met ? '✔ Director\'s goal met' : '✖ Director\'s goal missed'}: ${GOALS[car.job.stars][0]}.${S.end.prize ? ` 💵 Prize money: <b>${C.full(S.end.prize)}</b>.` : ''}${S.end.champName && !S.end.champ ? ' Champions: ' + C.esc(S.end.champName) + '.' : ''}</p>
      <p class="note" style="margin:6px 0">${C.portalOpen() ? '🚪 The transfer window is open. Seniors graduate when the new season starts.' : 'Seniors graduate when the new season starts.'}</p>
      ${S.end.promo ? `<div class="card" style="background:#dcfce7;color:#14532d;font-weight:900;margin:6px 0">🏆 Promoted! Next season: ${C.esc(C.TIERS[car.tier - 1].name)}</div>`
        : S.end.why === 'hq' ? `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;margin:6px 0">A promotion place, but ${C.BUILDINGS.hq.name} Lv ${C.TIER_GATE[car.tier - 1]} is needed. No promotion this season.</div>`
        : S.end.why === 'playoff' ? `<p class="note">Lost the promotion play-off.</p>` : ''}
      ${S.end.nat ? (() => { const N = S.end.nat, lab = { qf: 'reached the quarter-finals', sf: 'reached the semi-finals', f: 'were runners-up', champ: 'are National Champions!' }[N.reached];
        return N.reached ? `<div class="card" style="background:${N.reached === 'champ' ? '#fef3c7' : '#e0f2fe'};color:#0c4a6e;font-weight:800;margin:6px 0">🇺🇸 National Championship: you ${lab}<br><small>+${C.full(N.prize)} Booster $ · +${N.rep} Reputation${N.reached === 'champ' ? ' · a trophy for Your college' : ''}</small></div>`
          : N.champName ? `<p class="note">🇺🇸 National champions: <b>${C.esc(N.champName)}</b>.</p>` : ''; })() : ''}
      ${S.end.aiUpName && !S.end.promo ? `<p class="note">📰 ${C.esc(S.end.aiUpName)} were promoted.</p>` : ''}${C.careerCardHTML()}<button class="btn full pri" data-act="nextseason">Start Season ${S.n + 1}${C.portalOpen() ? ' (closes the window)' : ''}</button></div>` : '';
    return `<div class="view scrolly">${C.topBar(false)}<div class="phdr9 tall"><div class="row1"><div><b>Matchday</b><small>Season ${S.n} · ${C.esc(S.conf)} · ${S.end ? 'Finished' : C.table()[0].p ? 'Pos ' + C.ord(C.myPos()) : 'Preseason'} · ${car.adConf >= 60 ? '😀' : car.adConf >= 40 ? '🙂' : car.adConf >= 25 ? '😐' : '😟'} Director</small></div></div></div>
      <div class="homebn">${C.gamedayHTML()}</div><button class="mapbn" data-act="collegemap" data-v=""><span>🗺</span><div><b>College Map</b><small>${C.COLLEGES.length} programs across 5 tiers</small></div><em>›</em></button>${C.streakHTML ? `<div style="margin:10px 16px 0">${C.streakHTML()}</div>` : ''}${calStrip()}${formCard()}
      ${endCard}<div class="filters">${[['fix', '📅 Fixtures'], ['table', '📊 Table'], ['stats', '⭐ Stats']].map(([k, n]) => `<button class="f ${view === k ? 'on' : ''}" data-act="seav" data-v="${k}">${n}</button>`).join('')}</div>
      <div style="padding:0 16px 16px">${body}</div></div>`;
  };
})(window.CFC);
