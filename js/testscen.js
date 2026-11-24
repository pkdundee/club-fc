// Club FC 1.05.02: Test scenarios (Settings → Testing tools). Ready-made saves so a build's test list can be checked without
// playing up to it. Loading one backs up your own save first (once); "Restore my save" puts it back. See v1-planning/TEST_1.05.01.md.
(function (C) {
  const A = C.ACTS, BK = () => C.SAVE_KEY + '_testbackup', BKT = () => C.SAVE_KEY + '_testbackup_at';
  const LIST = [
    ['s1', 'S1 Pre-season ready', 'Season 1 Pre-season: every task done except the 5 friendlies. 22 players, a full XI. For the 1.05.01 Tactics checks'],
    ['s2', 'S2 Last match, 1st', 'Season 1, last league matchday, top of the table. Play it for the National Championship'],
    ['s3', 'S3 Last match, 3rd', 'Season 1, last league matchday, 3rd, Coaches\' Office Lv 10 (needed to play the play-off). Play it for the promotion play-off'],
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
    car.squad.forEach(p => { p.energy = 100; p.inj = 0; p.injury = null; p.ban = 0; }); car.guide = {}; C.meta().ms.freshTut = 1; C.autoPick(); C.save(); return car;
  }
  const third = S => { S.teams.forEach((t, k) => { t.rating = k === 0 ? 58 : 40; }); S.teams.map((t, k) => k).filter(k => k && S.fx.some(f => f.md >= 1 && (f.h === k || f.a === k))).slice(0, 2).forEach(k => S.teams[k].rating = 70); };
  const BUILD = {
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
      <p class="note">The test list for this build is TEST_1.05.02.md.</p>`;
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
