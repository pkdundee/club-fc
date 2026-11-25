// Club FC: save data, careers (save slots), account and the two clocks (Q13, Q27).
(function (C) {
  const KEY = 'clubfc_v109';   // CLUB FC 1.09: its own save; carries over the 1.08 save on first open (never writes 1.05's)
  const KEY_PREV = 'clubfc_v108';
  const KEY_9T = 'clubfc2_p9t'; // phase-9t's save: read only, never written by 1.00
  const FREE_SLOTS = 2;

  // Account-wide: Coins and purchases are shared across careers.
  const freshAccount = () => ({ gold: 150, vipUntil: 0, slot3: false, bq1: false, bq2: false, bq3: false, tslot3: false, sslot3: false, pslot3: false, sound: false, extraCareer: false, adDay: '', adsUsed: 0, theme: 'auto', testCap: 0 });

  C.db = { v: 2, account: freshAccount(), careers: [], active: -1 };

  C.SAVE_KEY = KEY;   // 1.05.02: the test scenarios back up and restore this save
  C.load = () => {
    // first open: copy the 1.04 save (and its intro flag) so playtest progress carries over. 1.04's save is only read.
    try { if (!localStorage.getItem(KEY)) { const old = localStorage.getItem(KEY_PREV); if (old) { localStorage.setItem(KEY, old); if (localStorage.getItem(KEY_PREV + '_intro')) localStorage.setItem(KEY + '_intro', '1'); } } } catch (e) { }
    try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); if (d && d.v === 2) C.db = d; } } catch (e) { /* storage blocked: play without saving */ }
    C.db.account = Object.assign(freshAccount(), C.db.account);
    // 1.03 (FEEDBACK 212): the $2.99 build slot becomes Builder Pack I's queue. The bought research slot is withdrawn (FEEDBACK 170):
    // its test purchase is refunded in Coins once (mailed when a career is open; see meta.js).
    { const a = C.db.account; if (a.slot3 && !a.bq1) a.bq1 = true; if (a.pslot3 && !a.pslot3Refund) { a.pslot3Refund = 'due'; } }
    C.db.careers.forEach(c => { if (c.job && !c.job.mix) { c.job.rating = { 3: 46, 2: 42, 1: 38 }[c.job.stars] + 1; c.job.mix = [6, 6, 5, 4]; } C.ensureSquad(c);
      // 9c: Video Room and Media Center are new; the Coaches' Office no longer earns
      if (c.b.video == null) c.b.video = 0; if (c.b.media == null) c.b.media = 1; c.store = c.store || {}; if (c.store.media == null) c.store.media = C.now(); delete c.store.hq;
      // 9p: the Performance Lab's key is now 'lab' (was 'film'); every building starts at Lv 1; the Media Center no longer stores income
      if (c.b.film != null) { c.b.lab = Math.max(c.b.lab || 0, c.b.film); delete c.b.film; } if (c.store.film != null) { c.store.lab = c.store.film; delete c.store.film; }
      (c.queue || []).forEach(q => { if (q.key === 'film') q.key = 'lab'; }); delete c.store.media;
      for (const k in C.BUILDINGS) if (c.b[k] == null) c.b[k] = 0;
      // 9q: buildings still locked behind the Coaches' Office go back to a blank plot (they showed greyed at Lv 1 in 9p)
      if (!c.m9q) { c.m9q = 1; for (const k in C.BUILDINGS) { const n = C.BUILDINGS[k].needHQ; if (n && c.b.hq < n && c.b[k] <= 1) { c.b[k] = 0; c.queue = (c.queue || []).filter(q => q.key !== k); } } } for (const k in C.PRODUCERS) if (c.store[k] == null) c.store[k] = C.now();
      if (c.job && c.job.style == null) c.job.style = '';
      c.queue = (c.queue || []).filter(q => C.BUILDINGS[q.key]); (c.squad || []).forEach(C.ensureAlts);
      if (!c.num9m && c.squad) { C.tidyNumbers(c.squad); c.num9m = 1; }
      if (c.myCol && C.registerCustomCollege) C.registerCustomCollege(c);
      if (!c.m104) { c.m104 = 1; c.offers = []; delete c.reclass; delete c.band; if (!c.myCol) c.renameFree = true; if (c.pre) c.preLite = 1; }
      // 1.06 (QA-78): repair new careers (1.04+, own program, never renamed) that were wrongly given the short Pre-season on reopening
      if (!c.m108) { c.m108 = 1; (c.squad || []).forEach(p => { if (p.promise === 'redshirt') p.promise = 'squad'; });   // 1.08 (Phase 3)
        if (c.rec) { (c.rec.list || []).forEach(x => { if (x.want === 'redshirt') x.want = 'squad'; if (x.exp) { x.expM = (c.rclock || 0) + 3; delete x.exp; } if (x.rival && x.rival.end) { x.rival.endM = (c.rclock || 0) + 1; delete x.rival.end; } });
          if (c.rec.portal) c.rec.portal.untilStart = true; } }
      if (!c.m106pl) { c.m106pl = 1; if (c.captains && c.captains.length > 1) c.captains = c.captains.slice(0, 1);   /* QA-69: one captain */ if (c.preLite && c.myCol && !c.renamed && c.season === 1 && c.pre) delete c.preLite; } });   // 1.04 (SCOPE_1.04 s8)
  };
  // Delete all data (Settings): leave an empty save in place. Also clears the 9t-import flag, so the import can be tried again after a wipe.
  C.wipe = () => { try { localStorage.setItem(KEY, JSON.stringify({ v: 2, account: freshAccount(), careers: [], active: -1 })); localStorage.removeItem(KEY + '_intro'); localStorage.removeItem(KEY + '_import9t'); } catch (e) { } };
  C.save = () => { try { localStorage.setItem(KEY, JSON.stringify(C.db)); } catch (e) { /* ignore */ } };
  // Optional one-time import of the phase-9t save, for compatibility testing (FEEDBACK 126). It only reads 9t's key; the 9t save is never changed.
  C.has9tSave = () => { try { const d = JSON.parse(localStorage.getItem(KEY_9T) || 'null'); return !!(d && d.v === 2 && d.careers && d.careers.length); } catch (e) { return false; } };
  C.imported9t = () => { try { return !!localStorage.getItem(KEY + '_import9t'); } catch (e) { return false; } };
  C.import9t = () => {
    try { if (C.imported9t()) return 'done'; const raw = localStorage.getItem(KEY_9T); const d = raw && JSON.parse(raw);
      if (!d || d.v !== 2 || !d.careers || !d.careers.length) return 'none';
      localStorage.setItem(KEY, raw); localStorage.setItem(KEY + '_import9t', String(Date.now())); return true; } catch (e) { return 'error'; } };

  C.acct = () => C.db.account;
  C.car = () => C.db.careers[C.db.active] || null;
  C.careerSlots = () => FREE_SLOTS + (C.isVip() ? 1 : 0) + (C.acct().extraCareer ? 1 : 0);
  C.isVip = () => C.acct().vipUntil > C.now();
  C.college = (car = C.car()) => C.COLLEGES[car.college];

  // ---- new career ----
  C.newCareer = ({ coach, pron, job, myCol }) => {
    const t = C.now();
    const car = { id: 'c' + t, coach, pron, gender: job.gender, college: job.college, tier: 5, created: t, myCol: myCol || undefined,   // 1.04: your own college (program.js)
      job: { story: job.story, style: job.style, type: job.type, stars: job.stars, coa: job.coa, eq: job.eq, limit: job.limit, pool: job.pool, rating: job.rating, mix: job.mix, squad16: job.squad16 || undefined },
      cash: job.cash, cp: 60, b: Object.assign({}, job.b), queue: [], store: { booster: t, lab: t },
      gameDay: 1, season: 1, realDay: C.todayKey(), seen: {}, m104: 1 };   // 1.06 (QA-78): a new career is already on the 1.04+ rules, so the 1.04 save upgrade never touches it
    if (car.myCol && C.registerCustomCollege) C.registerCustomCollege(car);
    C.db.careers.push(car); C.db.active = C.db.careers.length - 1; C.ensureSquad(car); C.save(); return car;
  };
  C.deleteCareer = i => { C.db.careers.splice(i, 1); if (C.db.active >= C.db.careers.length) C.db.active = C.db.careers.length - 1; C.save(); };

  // ---- clocks ----
  // Game day moves when a match is played (from Phase 5). Real day moves at local midnight.
  C.tickRealDay = () => { const a = C.acct(), k = C.todayKey();
    const car = C.car(); if (car && car.realDay !== k) { car.realDay = k; }
  };

  // Building level cap from tier (with an optional test override in Settings)
  C.TOP = 30;   // no tier caps (9q, FEEDBACK 73): the Coaches' Office is the only limit
  C.tierCap = () => C.TOP;
})(window.CFC);
