// Club FC: save data, careers (save slots), account and the two clocks (Q13, Q27).
(function (C) {
  const KEY = 'clubfc2_p9s';
  const FREE_SLOTS = 2;

  // Account-wide: Coins and purchases are shared across careers.
  const freshAccount = () => ({ gold: 150, vipUntil: 0, slot3: false, tslot3: false, sslot3: false, pslot3: false, sound: false, extraCareer: false, adDay: '', adsUsed: 0, theme: 'auto', testCap: 0 });

  C.db = { v: 2, account: freshAccount(), careers: [], active: -1 };

  C.load = () => {
    // first open: carry over the latest earlier save (9b, then 9) (and intro flag) so playtest progress isn't lost
    try { for (const old of ['clubfc2_p9r', 'clubfc2_p9q', 'clubfc2_p9p', 'clubfc2_p9o', 'clubfc2_p9n', 'clubfc2_p9m', 'clubfc2_p9l', 'clubfc2_p9k', 'clubfc2_p9j', 'clubfc2_p9i', 'clubfc2_p9h', 'clubfc2_p9g', 'clubfc2_p9f', 'clubfc2_p9e', 'clubfc2_p9d', 'clubfc2_p9c', 'clubfc2_p9b', 'clubfc2_p9']) { if (!localStorage.getItem(KEY) && localStorage.getItem(old)) { localStorage.setItem(KEY, localStorage.getItem(old)); if (localStorage.getItem(old + '_intro')) localStorage.setItem(KEY + '_intro', '1'); } } } catch (e) { }
    try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); if (d && d.v === 2) C.db = d; } } catch (e) { /* storage blocked: play without saving */ }
    C.db.account = Object.assign(freshAccount(), C.db.account);
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
      if (!c.num9m && c.squad) { C.tidyNumbers(c.squad); c.num9m = 1; } });
  };
  // Delete all data (Settings): leave an empty save in place, so the next open doesn't copy an older build's save back in
  C.wipe = () => { try { localStorage.setItem(KEY, JSON.stringify({ v: 2, account: freshAccount(), careers: [], active: -1 })); localStorage.removeItem(KEY + '_intro'); } catch (e) { } };
  C.save = () => { try { localStorage.setItem(KEY, JSON.stringify(C.db)); } catch (e) { /* ignore */ } };

  C.acct = () => C.db.account;
  C.car = () => C.db.careers[C.db.active] || null;
  C.careerSlots = () => FREE_SLOTS + (C.isVip() ? 1 : 0) + (C.acct().extraCareer ? 1 : 0);
  C.isVip = () => C.acct().vipUntil > C.now();
  C.college = (car = C.car()) => C.COLLEGES[car.college];

  // ---- new career ----
  C.newCareer = ({ coach, pron, job }) => {
    const t = C.now();
    const car = { id: 'c' + t, coach, pron, gender: job.gender, college: job.college, tier: 5, created: t,
      job: { story: job.story, style: job.style, type: job.type, stars: job.stars, coa: job.coa, eq: job.eq, limit: job.limit, pool: job.pool, rating: job.rating, mix: job.mix },
      cash: job.cash, cp: 60, b: Object.assign({}, job.b), queue: [], store: { booster: t, lab: t },
      gameDay: 1, season: 1, realDay: C.todayKey(), seen: {} };
    C.db.careers.push(car); C.db.active = C.db.careers.length - 1; C.ensureSquad(car); C.save(); return car;
  };
  C.deleteCareer = i => { C.db.careers.splice(i, 1); if (C.db.active >= C.db.careers.length) C.db.active = C.db.careers.length - 1; C.save(); };

  // ---- clocks ----
  // Game day moves when a match is played (from Phase 5). Real day moves at local midnight.
  C.tickRealDay = () => { const a = C.acct(), k = C.todayKey();
    if (a.adDay !== k) { a.adDay = k; a.adsUsed = 0; }
    const car = C.car(); if (car && car.realDay !== k) { car.realDay = k; }
  };
  C.ADS_PER_DAY = 5;
  C.adsLeft = () => { C.tickRealDay(); return C.ADS_PER_DAY - C.acct().adsUsed; };

  // Building level cap from tier (with an optional test override in Settings)
  C.TOP = 30;   // no tier caps (9q, FEEDBACK 73): the Coaches' Office is the only limit
  C.tierCap = () => C.TOP;
})(window.CFC);
