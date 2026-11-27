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
    // 1.11 Foundation (B-5): campus accounts at different stages, each tight (Booster $ for about one Coaches' Office upgrade, no speed-ups)
    // or plenty (a large bank and speed-up items). Building levels are the Phase 4 model's free player at that day (econ5.py, V3.2).
    ['c05t', 'Campus · HQ 5, tight', 'Early campus (HQ 5, Pre-season). Booster $ for about one upgrade, no speed-ups'],
    ['c17t', 'Campus · HQ 17, tight', "The model's free player at day 30 (HQ 17, other buildings 13 to 17). Booster $ for about one upgrade, no speed-ups"],
    ['c17p', 'Campus · HQ 17, plenty', 'The same campus with a large Booster $ and CP bank and building speed-ups'],
    ['c25t', 'Campus · HQ 25, tight', "The model's free player at day 151 (HQ 25, others 21 to 24). Booster $ for about one upgrade, no speed-ups"],
    ['c29p', 'Campus · HQ 29, plenty', "The model's free player at day 365 (HQ 29, others 25 to 29) with the model's bank at that day (about 88 million Booster $)"],
    ['c30p', 'Campus complete · HQ 30, plenty', 'Every building Lv 30 (the college maximum) and a large bank: the post-campus state where Booster $ piles up'],
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
    const r = C.rng(L * 7919), POS = ['GK', 'GK', 'CB', 'CB', 'CB', 'LB', 'RB', 'CB', 'DM', 'CM', 'CM', 'AM', 'LM', 'RM', 'CM', 'ST', 'ST', 'LW', 'RW', 'ST', 'CB', 'CM', 'LB', 'AM'];
    // 1.11.01 (QA-205): a squad in line with what this level's recruiting brings (recruits are about program rating - 2 + 0.6 x Recruiting Office level),
    // 24 players, and about 90% of the scholarship pool committed (weighted to the better players)
    const sqBase = base - 2 + Math.round(.6 * L);
    car.squad = POS.map((pos, i) => { const p = C.genPlayer(r, { gender: car.gender, pos, rating: sqBase - 5 + Math.floor(r() * 8) + (i < 11 ? 2 : -1), year: 1 + Math.floor(r() * 5) }); p.from = 'Test scenario'; return p; });
    { const w = car.squad.map(p => Math.max(1, p.rating - sqBase + 8)), tw = w.reduce((a, b) => a + b, 0), pool = car.job.pool * .9;
      car.squad.forEach((p, i) => { p.schol = Math.min(Math.round(car.job.coa * .9 / 500) * 500, Math.round(pool * w[i] / tw / 500) * 500); }); }
    C.assignNumbers(car.squad); car.squad.forEach(C.ensureAlts); car.captains = []; car.devq = []; car.tac = null; C.autoPick();
    const nx = Math.min(L + 1, 30), cost = C.costOf('hq', nx); car.cash = Math.max(50000, (cost.cash || 0) * 3); car.cp = Math.max(500, (cost.cp || 0) * 3);
    car.conf = null; car.sea = null; car.cpp = null; car.cyc = null; car.guide = undefined; C.meta().ms.freshTut = 1; C.ensureSeason(car); C.simFriendlies(); A.startseasonok(); C.ui.closeAll();
    car.squad.forEach(p => { p.energy = 100; }); C.meta().main = C.MAIN.map(t => t[0]); C.save(); return car;   // the early Main tasks are behind a career at this level
  }
  // 1.11 Foundation (B-5): a campus account from a level save, with the model's building levels and tight or plenty resources
  const MODEL = { 17: { academic: 13, booster: 13, dorms: 13, gym: 13, hq: 17, kitroom: 13, lab: 17, med: 13, media: 14, nutrition: 13, recruit: 13, skills: 13, stadium: 13, training: 13, transport: 13, video: 15 },
    25: { academic: 21, booster: 21, dorms: 21, gym: 22, hq: 25, kitroom: 21, lab: 24, med: 21, media: 23, nutrition: 21, recruit: 21, skills: 21, stadium: 21, training: 21, transport: 21, video: 24 },
    29: { academic: 26, booster: 26, dorms: 26, gym: 26, hq: 29, kitroom: 26, lab: 29, med: 27, media: 26, nutrition: 26, recruit: 28, skills: 26, stadium: 29, training: 26, transport: 26, video: 26 } };
  function resources(car, kind, bank) { const nx = Math.min(C.level('hq') + 1, 30), up = C.costOf('hq', nx).cash || 0, inv = C.meta().inv;
    ['spb15', 'spb60', 'spb180', 'spb480', 'sp1', 'sp480', 'sp1440'].forEach(k => { if (kind === 'tight') delete inv[k]; });
    if (kind === 'tight') { car.cash = Math.round(up * 1.2 / 100) * 100; car.cp = 300; C.acct().gold = 150; }
    else { car.cash = bank || 50000000; car.cp = 200000; C.acct().gold = 5000; inv.spb60 = (inv.spb60 || 0) + 20; inv.spb480 = (inv.spb480 || 0) + 6; inv.spb180 = (inv.spb180 || 0) + 10; } }
  function campusSave(L, kind, bank) { const car = L <= 5 ? preseasonReady(5) : levelSave(L);
    if (MODEL[L]) Object.keys(MODEL[L]).forEach(k => { if (C.BUILDINGS[k] && !(C.BUILDINGS[k].needHQ > L)) car.b[k] = Math.min(MODEL[L][k], C.topLevel(k)); });
    car.queue = []; resources(car, kind, bank); C.save(); return car; }
  const BUILD = {
    c05t: () => campusSave(5, 'tight'), c17t: () => campusSave(17, 'tight'), c17p: () => campusSave(17, 'plenty', 25000000), c25t: () => campusSave(25, 'tight'),
    c29p: () => campusSave(29, 'plenty', 88000000), c30p: () => campusSave(30, 'plenty', 92000000),
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
      <button class="lrow" data-act="uikit" data-v="0"><span class="li">🎨</span><span class="lt"><b>UI kit</b><small>Every 1.10 component, in three college colour sets</small></span><span class="lr">›</span></button>
      ${variantsHTML()}
      <p class="note">The test list for this build is TEST_1.11.01.md.</p>`;
  });
  // ---------- 1.11 Foundation (B-4): variants ----------
  // Each variant plays on its own save (C.SAVE_BASE + '__' + id). Every variant starts from the same start point: a copy of a save taken once.
  // Switching never copies progress between variants, and the foundation save is never changed by a variant.
  const VKEY = 'clubfc_v111_variant', START = () => C.SAVE_BASE + '__start', STARTAT = () => C.SAVE_BASE + '__start_at', vkey = id => id === 'foundation' ? C.SAVE_BASE : C.SAVE_BASE + '__' + id;
  function variantsHTML() { const V = C.VARIANTS, at = +get(STARTAT()) || 0, cur = C.VARIANT;
    return `<h3 class="jh">Variants</h3><div class="card" style="font-size:13px;font-weight:700">Playing: <b>${C.esc(V[cur].name)}</b>. Each variant has its own save, started from the same start point, so nothing earned in one reaches another. The Foundation save is never changed by a variant.</div>
      <div class="card" style="font-size:13px"><b>Start point:</b> ${at ? new Date(at).toLocaleString() : 'not set (a variant with no save starts a new career)'}<br>
        <button class="btn sm2 go" data-act="vstartset" style="margin-top:6px">Use the current save as the start point</button></div>
      ${Object.keys(V).map(id => `<button class="lrow" data-act="vswitch" data-v="${id}" ${id === cur ? 'disabled' : ''}><span class="li">${id === cur ? '▶' : '⇄'}</span><span class="lt"><b>${C.esc(V[id].name)}${id === cur ? ' (playing)' : ''}</b><small>${C.esc(V[id].desc)}${id !== 'foundation' ? (get(vkey(id)) ? ' · has a save' : ' · no save yet: starts from the start point') : ''}</small></span><span class="lr">›</span></button>`).join('')}
      ${cur !== 'foundation' ? `<button class="btn full danger" data-act="vreset" style="margin-top:8px">Reset ${C.esc(V[cur].name)} to the start point</button>` : ''}`; }
  A.vstartset = () => C.confirm('Set the start point?', '<p class="note">Every variant that has no save yet starts from a copy of the current save. Variants that already have a save keep it (use Reset to start them again).</p>', 'Set', 'vstartsetok', '');
  A.vstartsetok = () => { C.save(); set(START(), get(C.SAVE_KEY) || JSON.stringify(C.db)); set(STARTAT(), String(Date.now())); C.toast('Start point set'); C.ui.refresh(); };
  const seed = id => { const st = get(START()); if (st) { set(vkey(id), st); set(vkey(id) + '_intro', '1'); } else set(vkey(id), null); };
  A.vswitch = id => { if (!C.VARIANTS[id] || id === C.VARIANT) return; C.save();
    if (id !== 'foundation' && !get(vkey(id))) seed(id);
    C.noSave = true; set(VKEY, id === 'foundation' ? null : id); location.reload(); };
  A.vreset = () => C.confirm('Reset this variant?', `<p class="note">${C.esc(C.VARIANTS[C.VARIANT].name)} goes back to the start point. Its progress is lost. Other variants and the Foundation save are not affected.</p>`, 'Reset', 'vresetok', '');
  A.vresetok = () => { const id = C.VARIANT; if (id === 'foundation') return; C.noSave = true; seed(id); location.reload(); };
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
  C.testScenLoaded = () => { if (C.VARIANT !== 'foundation') setTimeout(() => C.toast('🧪 Variant: ' + C.VARIANTS[C.VARIANT].name), 900);   // 1.11 (B-4)
    const v = get(C.SAVE_KEY + '_tscen'); if (!v) return; set(C.SAVE_KEY + '_tscen', null); const it = LIST.find(x => x[0] === v); if (it) setTimeout(() => C.toast('🧪 Loaded: ' + it[1]), 600); };
})(window.CFC);
