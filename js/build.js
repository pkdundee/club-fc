// Club FC: base building (Phase 1). Upgrade rules, the build queue, speed-ups and production.
(function (C) {
  const FREE_FINISH = 180; // builds with 3 minutes or less left can be finished free

  C.level = k => C.car().b[k];
  C.inQueue = k => C.car().queue.find(q => q.key === k);

  // Slots: free, VIP (Coach's Club), one-off purchase, earned at Coaches' Office Lv 10
  C.slotOpen = id => id === 'free' || (id === 'vip' && C.isVip()) || (id === 'iap' && C.acct().slot3) || (id === 'prog' && C.level('hq') >= 10);
  C.openSlots = () => C.SLOTS.filter(s => C.slotOpen(s.id)).length;
  C.freeSlot = () => C.car().queue.length < C.openSlots();

  // Highest level a building can reach right now
  C.maxLevel = k => k === 'hq' ? C.tierCap() : Math.min(C.level('hq'), C.tierCap());

  // Requirement rows for the upgrade card: [icon, text, ok]
  C.requirements = k => {
    const car = C.car(), lv = C.level(k), to = lv + 1, def = C.BUILDINGS[k], cost = C.costOf(k, to), rows = [];
    if (k !== 'hq') rows.push(['🏛', `Lv.${to} ${C.BUILDINGS.hq.name}`, C.level('hq') >= to]);
    else if (to > C.tierCap()) rows.push(['🎓', `${C.TIERS[car.tier].n} cap is Lv ${C.tierCap()}: move up a tier`, false]);
    if (def.needHQ && lv === 0) rows.push(['🔒', `Unlocks at ${C.BUILDINGS.hq.name} Lv ${def.needHQ}`, C.level('hq') >= def.needHQ]);
    if (k !== 'hq' && to > C.tierCap()) rows.push(['🎓', `${C.TIERS[car.tier].n} cap is Lv ${C.tierCap()}`, false]);
    rows.push(['💵', `${C.short(car.cash)} / ${C.short(cost.cash)} Booster $`, car.cash >= cost.cash]);
    if (cost.cp) rows.push(['📘', `${C.short(car.cp)} / ${cost.cp} Coaching Points`, car.cp >= cost.cp]);
    return rows;
  };
  C.canUpgrade = k => !C.inQueue(k) && C.level(k) < 30 && C.requirements(k).every(r => r[2]) && C.freeSlot();
  // "Ready" arrow on the map: affordable and allowed, ignoring whether a slot is free
  C.readyArrow = k => !C.inQueue(k) && C.level(k) > 0 && C.level(k) < 30 && C.requirements(k).every(r => r[2]);

  C.startUpgrade = k => {
    const car = C.car(), to = C.level(k) + 1;
    if (!C.canUpgrade(k)) return false;
    const cost = C.costOf(k, to), t = C.now();
    car.cash -= cost.cash; car.cp -= cost.cp;
    car.queue.push({ key: k, to, start: t, end: t + C.timeOf(k, to) * 1000 });
    C.save(); return true;
  };

  C.remaining = q => Math.max(0, (q.end - C.now()) / 1000);
  C.goldToFinish = q => Math.max(1, Math.ceil(C.remaining(q) / 90));
  C.isFreeFinish = q => C.remaining(q) <= FREE_FINISH;
  C.finishNow = (q, pay) => {
    if (pay) { const g = C.goldToFinish(q); if (C.acct().gold < g) return false; C.acct().gold -= g; }
    q.end = C.now(); C.tick(); return true;
  };
  C.adSpeedUp = q => { if (C.adsLeft() <= 0) return false; C.acct().adsUsed++; q.end -= 15 * 60 * 1000; C.tick(); return true; };

  // Complete finished builds. Returns the list of buildings that levelled up.
  C.tick = () => {
    const car = C.car(); if (!car) return [];
    C.tickRealDay();
    const done = car.queue.filter(q => q.end <= C.now());
    if (done.length) {
      for (const q of done) { car.b[q.key] = q.to; if (q.key in car.store) car.store[q.key] = Math.min(car.store[q.key], C.now()); }
      car.queue = car.queue.filter(q => q.end > C.now()); C.save();
    }
    return done;
  };

  // ---- production (Coaches' Office and Booster Club make Booster $, Film Room makes Coaching Points) ----
  C.PRODUCERS = { hq: 'cash', booster: 'cash', film: 'cp' };
  C.stored = k => {
    const car = C.car(), lv = C.level(k); if (!lv) return 0;
    const hrs = Math.min((C.now() - car.store[k]) / 3.6e6, C.STORE_HOURS(lv));
    return Math.floor(C.prod[k](lv) * hrs);
  };
  C.collect = k => {
    const car = C.car(), amt = C.stored(k); if (amt <= 0) return 0;
    car[C.PRODUCERS[k]] += amt; car.store[k] = C.now(); C.save(); return amt;
  };
  // Show a collect bubble once there's something worth tapping
  C.bubble = k => { const a = C.stored(k); return a >= (C.PRODUCERS[k] === 'cp' ? 5 : 250) ? a : 0; };
})(window.CFC);
