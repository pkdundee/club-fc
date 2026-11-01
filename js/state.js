// Club FC: save data, careers (save slots), account and the two clocks (Q13, Q27).
(function (C) {
  const KEY = 'clubfc2_p3';
  const FREE_SLOTS = 2;

  // Account-wide: Gold and purchases are shared across careers.
  const freshAccount = () => ({ gold: 300, vipUntil: 0, slot3: false, tslot3: false, extraCareer: false, adDay: '', adsUsed: 0, theme: 'auto', testCap: 0 });

  C.db = { v: 2, account: freshAccount(), careers: [], active: -1 };

  C.load = () => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); if (d && d.v === 2) C.db = d; } } catch (e) { /* storage blocked: play without saving */ }
    C.db.account = Object.assign(freshAccount(), C.db.account);
    C.db.careers.forEach(c => { if (c.job && !c.job.mix) { c.job.rating = { 3: 46, 2: 42, 1: 38 }[c.job.stars] + 1; c.job.mix = [6, 6, 5, 4]; } C.ensureSquad(c); });
  };
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
      job: { story: job.story, type: job.type, stars: job.stars, coa: job.coa, eq: job.eq, limit: job.limit, pool: job.pool, rating: job.rating, mix: job.mix },
      cash: job.cash, cp: 60, b: Object.assign({}, job.b), queue: [], store: { hq: t, booster: t, film: t },
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
  C.tierCap = (car = C.car()) => C.acct().testCap || C.TIERS[car.tier].cap;
})(window.CFC);
