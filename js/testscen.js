// Club FC 1.05.02: Test scenarios (Settings → Testing tools). Ready-made saves so a build's test list can be checked without
// playing up to it. Loading one backs up your own save first (once); "Restore my save" puts it back. See v1-planning/TEST_1.05.01.md.
(function (C) {
  const A = C.ACTS, BK = () => C.SAVE_KEY + '_testbackup', BKT = () => C.SAVE_KEY + '_testbackup_at';
  const LIST = [
    ['s1', 'S1 Pre-season ready', 'Season 1 Pre-season: every task done except the 5 friendlies. 22 players, a full XI. For the 1.05.01 Tactics checks'],
    ['s2', 'S2 Last match, 1st', 'Season 1, last league matchday, top of the table. Play it for the National Championship'],
    ['s3', 'S3 Last match, 3rd', 'Season 1, last league matchday, 3rd, Coaches\' Office Lv 10 (needed to play the play-off). Play it for the promotion play-off'],
    ['h10', 'HQ 10 · Division IV', 'Every building Lv 10, research and coaches to match, a Division IV squad. Start of the regular season'],
    ['h15', 'HQ 15 · Division III', 'Every building Lv 15, research and coaches to match, a Division III squad. Start of the regular season'],
    ['h20', 'HQ 20 · Division II', 'Every building Lv 20, research and coaches to match, a Division II squad. Start of the regular season'],
    ['h25', 'HQ 25 · Division I', 'Every building Lv 25, research and coaches to match, a Division I squad. Start of the regular season'],
    ['h30', 'HQ 30 · Division I, maxed', 'Every building Lv 30 (the top), research nearly complete, a strong Division I squad. Start of the regular season'],
    ['s4', 'S4 Mid-season, losing run', 'Matchday 6 of 14, bottom half after a poor start, the Progression Pass open. Play the next league match: the "How to improve" reminder follows']];
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } };
  C.testBackupAt = () => get(BK()) ? +get(BKT()) || 0 : 0;

  // ---------- building the saves ----------
  function preseasonReady(hqTo = 5) {
    C.wipe(); C.load(); set(C.SAVE_KEY + '_intro', '1'); set('clubfc_v102_intro', '1');
    C.openProgram(); A.pgstart(); C.ui.closeAll();
    const car = C.car(); car.m104 = 1;   // a new career: the 1.04 save upgrade never applies (QA-78)
    const S = C.staffState(); if (S.cands && S.cands.length) C.pickFirstCoach(S.cands[0].id);
    C.refreshMarket(true); const gold = C.acct().gold, cash = car.cash; C.acct().gold = 99999; car.cash = 9999999; C.hire(S.market[0].id); C.acct().gold = gold; car.cash = cash;
    const lv = (k, n) => { car.b[k] = Math.max(car.b[k] || 0, n); };
    ['stadium', 'training', 'med', 'lab', 'recruit', 'media', 'dorms'].forEach(k => lv(k, 1));
    for (let to = 2; to <= hqTo; to++) { C.hqNeeds(to).forEach(([k, n]) => lv(k, n)); lv('hq', to); }
    car.queue = [];
    const m = C.meta(); m.ms.research = Math.max(1, m.ms.research || 0); m.ms.squadview = 1; m.ms.offers = Math.max(1, m.ms.offers || 0); m.ms.lineup = 1;
    const r = C.rng(5150), need = { gk: ['GK'], def: ['CB', 'LB', 'RB'], mid: ['CM', 'DM', 'AM'], fwd: ['ST', 'LW', 'RW'] };
    const add = pos => { const p = C.genPlayer(r, { gender: car.gender, pos, rating: car.job.rating - 2 + Math.floor(r() * 5), year: 1 + Math.floor(r() * 4) }); p.from = 'Test scenario'; car.squad.push(p); };
    Object.keys(C.COVER).forEach(k => { let i = 0; while (C.coverage(car)[k] < C.COVER[k]) add(need[k][i++ % need[k].length]); });
    let i = 0; while (car.squad.length < C.PRE_MIN) add(['CM', 'CB', 'ST', 'RW'][i++ % 4]);
    C.assignNumbers(car.squad); (car.squad || []).forEach(C.ensureAlts); C.autoPick();
    car.cash = Math.max(car.cash, 20000); C.acct().gold = Math.max(C.acct().gold, 500); C.save(); return car;
  }
  // rate(S) sets temporary ratings for the simulation; the season is simulated up to (not including) matchday last(S)
  function inSeason(rate, last, hqTo) {
    const car = preseasonReady(hqTo); C.simFriendlies(); A.startseasonok(); C.ui.closeAll();
    const S = C.sea(), keep = S.teams.map(t => t.rating); rate(S); C.simToMatchday(last(S)); S.teams.forEach((t, k) => { t.rating = keep[k]; });
    car.squad.forEach(p => { p.energy = 100; p.inj = 0; p.injury = null; p.ban = 0; }); delete car.guide; C.meta().ms.freshTut = 1;   // 1.05.03 (QA-96): removed, not emptied; the first league match rebuilds it
    C.autoPick(); C.save(); return car;
  }
  const third = S => { S.teams.forEach((t, k) => { t.rating = k === 0 ? 58 : 40; }); S.teams.map((t, k) => k).filter(k => k && S.fx.some(f => f.md >= 1 && (f.h === k || f.a === k))).slice(0, 2).forEach(k => S.teams[k].rating = 70); };
  // 1.08.01: higher-level saves. Every building at the Coaches' Office level (capped by its own maximum; locked ones only if unlocked),
  // research in proportion, coaches levelled, the division the level leads to, a squad rated for it, and enough Booster $ and CP for a few upgrades.
  function levelSave(L) {
    const car = preseasonReady(5), t = L >= 25 ? 1 : L >= 20 ? 2 : L >= 15 ? 3 : 4, f = L / 30;
    car.season = { 10: 3, 15: 5, 20: 7, 25: 9, 30: 11 }[L] || 3;
    Object.keys(C.BUILDINGS).forEach(k => { const d = C.BUILDINGS[k], top = C.topLevel(k); car.b[k] = d.needHQ && d.needHQ > L ? 0 : Math.min(L, top); }); car.b.hq = L; car.queue = [];
    car.pb = {}; C.PB.forEach(B => { const t0 = Math.min(B[3][0][3], Math.round(B[3][0][3] * f)); car.pb[B[0] + '.0'] = t0; if (B[3][1]) { const t1 = t0 >= 5 ? Math.min(B[3][1][3], Math.round(B[3][1][3] * f * .85)) : 0; car.pb[B[0] + '.1'] = t1; if (B[3][2]) car.pb[B[0] + '.2'] = t1 >= 5 ? Math.min(B[3][2][3], Math.round(B[3][2][3] * f * .7)) : 0; } });
    const S = C.staffState(); C.refreshMarket(true); const g0 = C.acct().gold; C.acct().gold = 99999; car.cash = 9999999; (S.market || []).slice(0, 2).forEach(c => C.hire(c.id)); C.acct().gold = g0;
    const LV = [20, 30, 40, 50, 60]; S.list.forEach(c => { c.level = Math.max(c.level, Math.min(LV[c.rar] || 20, Math.round(L * (0.8 + c.rar * .15)))); }); S.on = S.list.slice(0, C.staffSlots()).map(c => c.id);
    car.tier = t; const base = C.ECON.tierRating[t] + 2 + (L === 30 ? 3 : 0); car.job.rating = base; car.job.coa = C.TIER_COA[t]; car.job.eq = car.job.limit = C.TIER_FUNDED[t]; car.job.pool = car.job.coa * car.job.eq;
    const r = C.rng(L * 7919), POS = ['GK', 'GK', 'CB', 'CB', 'CB', 'LB', 'RB', 'CB', 'DM', 'CM', 'CM', 'AM', 'LM', 'RM', 'CM', 'ST', 'ST', 'LW', 'RW', 'ST', 'CB', 'CM'];
    car.squad = POS.map((pos, i) => { const p = C.genPlayer(r, { gender: car.gender, pos, rating: base - 7 + Math.floor(r() * 8) + (i < 11 ? 1 : -1), year: 1 + Math.floor(r() * 5) }); p.from = 'Test scenario'; p.schol = Math.round(car.job.coa * (.2 + r() * .3) / 500) * 500; return p; });
    C.assignNumbers(car.squad); car.squad.forEach(C.ensureAlts); car.captains = []; car.devq = []; car.tac = null; C.autoPick();
    const nx = Math.min(L + 1, 30), cost = C.costOf('hq', nx); car.cash = Math.max(50000, (cost.cash || 0) * 3); car.cp = Math.max(500, (cost.cp || 0) * 3);
    car.conf = null; car.sea = null; car.cpp = null; car.cyc = null; car.guide = undefined; C.meta().ms.freshTut = 1; C.ensureSeason(car); C.simFriendlies(); A.startseasonok(); C.ui.closeAll();
    car.squad.forEach(p => { p.energy = 100; }); C.meta().main = C.MAIN.map(t => t[0]); C.save(); return car;   // the early Main tasks are behind a career at this level
  }
  const BUILD = {
    h10: () => levelSave(10), h15: () => levelSave(15), h20: () => levelSave(20), h25: () => levelSave(25), h30: () => levelSave(30),
    s1: () => preseasonReady(),
    s2: () => inSeason(S => { S.teams[0].rating = 60; }, S => S.R),
    s3: () => inSeason(third, S => S.R, C.TIER_GATE[4]),   // the play-off is only played with the HQ level for the tier above (otherwise a walkover)
    s4: () => inSeason(S => { S.teams[0].rating = 25; }, () => 6)
  };
  const run = id => BUILD[id]();

  // ---------- the screen ----------
  C.openTestScen = () => C.ui.open('Test scenarios', () => {
    const at = C.testBackupAt();
    return `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Loading a scenario replaces the game on this device. Your own save is backed up first, and <b>Restore my save</b> brings it back.</div>
      ${LIST.map(([id, name, sub]) => `<button class="lrow" data-act="tscen" data-v="${id}"><span class="li">🧪</span><span class="lt"><b>${name}</b><small>${sub}</small></span><span class="lr">›</span></button>`).join('')}
      ${at ? `<button class="btn full pri" data-act="tscenrestore" style="margin-top:10px">↩ Restore my save</button><p class="note">Backed up ${new Date(at).toLocaleString()}. Loading more scenarios keeps this backup.</p>` : '<p class="note">No backup yet: it\'s made when you load your first scenario.</p>'}
      <p class="note">The test list for this build is TEST_1.09.md.</p>`;
  });
  A.tscen = v => { const it = LIST.find(x => x[0] === v); if (!it) return;
    C.ui.open('Load scenario', () => `<div class="card"><p style="font-weight:800">${it[1]}</p><p class="note">${it[2]}</p></div>
      <p class="note">${C.testBackupAt() ? 'Your backup from ' + new Date(C.testBackupAt()).toLocaleString() + ' is kept.' : 'Your current save is backed up first.'}</p>
      <div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Cancel</button><button class="btn pri" data-act="tscenok" data-v="${v}">Load</button></div>`, { popup: true }); };
  A.tscenok = v => {
    if (!get(BK())) { set(BK(), get(C.SAVE_KEY) || JSON.stringify(C.db)); set(BKT(), String(Date.now())); }
    try { run(v); } catch (e) { C.toast('Scenario failed: ' + e.message); return; }
    C.save(); set(C.SAVE_KEY + '_tscen', v); location.reload(); };
  A.tscenrestore = () => { const b = get(BK()); if (!b) return C.toast('No backup to restore');
    set(C.SAVE_KEY, b); set(BK(), null); set(BKT(), null); set(C.SAVE_KEY + '_tscen', null); location.reload(); };
  // after the reload: say which scenario is loaded
  C.testScenLoaded = () => { const v = get(C.SAVE_KEY + '_tscen'); if (!v) return; set(C.SAVE_KEY + '_tscen', null); const it = LIST.find(x => x[0] === v); if (it) setTimeout(() => C.toast('🧪 Loaded: ' + it[1]), 600); };
})(window.CFC);
