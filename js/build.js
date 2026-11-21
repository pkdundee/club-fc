// Club FC: base building (Phase 1). Upgrade rules, the build queue, speed-ups and production.
(function (C) {
  const E = C.ECON, FREE_FINISH = E.finish.freeSecs; // builds with 2 minutes or less left can be finished free

  C.level = k => C.car().b[k];
  // Locked buildings (9p, FEEDBACK 65): every building starts at Lv 1, but some stay locked until the Coaches' Office reaches their level.
  // A locked building shows Lv 1 and gives nothing until then; C.eff is the level its effects use.
  C.locked = (k, car = C.car()) => !!(C.BUILDINGS[k].needHQ && car.b.hq < C.BUILDINGS[k].needHQ);
  C.eff = k => C.locked(k) ? 0 : (C.level(k) || 0);
  C.inQueue = k => C.car().queue.find(q => q.key === k);

  // Slots: free, VIP (Coach's Club), one-off purchase, earned at Coaches' Office Lv 10
  C.slotOpen = id => id === 'free' || (id === 'vip' && C.isVip()) || (id === 'iap' && C.acct().slot3) || (id === 'prog' && C.level('hq') >= 10);
  C.openSlots = () => C.SLOTS.filter(s => C.slotOpen(s.id)).length;
  C.freeSlot = () => C.car().queue.length < C.openSlots();

  // Highest level a building can reach right now
  C.topLevel = k => C.BUILDINGS[k].max || 30;   // the building's absolute maximum; special buildings can set a lower one (1, 5, 10)
  C.maxLevel = k => k === 'hq' ? C.tierCap() : Math.min(C.level('hq'), C.tierCap());

  // Coaches' Office prerequisites (round 4, item 15): from Lv 3, the Performance Lab plus one rotating building at the level below
  const HQ_SECOND = ['training', 'med', 'recruit', 'stadium', 'dorms', 'gym', 'media'];
  C.hqNeeds = to => to < 3 ? [] : [['lab', to - 1], [HQ_SECOND[to % HQ_SECOND.length], to - 1]];
  // Requirement rows for the upgrade card: [icon, text, ok, kind]   kind: 'b' = a building (Go), 'cash' (Obtain)
  C.requirements = k => {
    const car = C.car(), lv = C.level(k), to = lv + 1, def = C.BUILDINGS[k], cost = C.costOf(k, to), rows = [];
    if (k !== 'hq') rows.push(['🏛', `Lv.${to} ${C.BUILDINGS.hq.name}`, C.level('hq') >= to, 'hq']);
    else C.hqNeeds(to).forEach(([b, l]) => rows.push([C.BUILDINGS[b].icon, `Lv.${l} ${C.BUILDINGS[b].name}`, C.level(b) >= l, b]));
    if (C.locked(k)) rows.push(['🔒', `Unlocks at ${C.BUILDINGS.hq.name} Lv ${def.needHQ}`, C.level('hq') >= def.needHQ]);
    if (cost.cash) rows.push(['💵', `${C.full(car.cash)} / ${C.full(cost.cash)}`, car.cash >= cost.cash, 'cash']);
    if (cost.cp) rows.push(['<i class="cpi"></i>', `${C.short(car.cp)} / ${cost.cp} Coaching Points`, car.cp >= cost.cp]);
    return rows;
  };
  C.canUpgrade = k => !C.inQueue(k) && C.level(k) < C.topLevel(k) && C.requirements(k).every(r => r[2]) && (C.level(k) === 0 || C.freeSlot());   // a first build doesn't need a builder
  // "Ready" arrow on the map: affordable and allowed, ignoring whether a slot is free
  C.readyArrow = k => !C.inQueue(k) && !C.locked(k) && C.level(k) > 0 && C.canAfford(k) && C.level(k) < C.topLevel(k) && C.requirements(k).every(r => r[2]);

  C.canAfford = k => C.car().cash >= C.costOf(k, C.level(k) + 1).cash;
  // ready for its free first build: unlocked, still a blank plot, and the Coaches' Office already stands (it goes first)
  C.buildable = k => C.level(k) === 0 && !C.locked(k) && !C.inQueue(k) && (k === 'hq' || C.level('hq') >= 1);
  C.startUpgrade = k => {
    const car = C.car(), to = C.level(k) + 1;
    if (!C.canUpgrade(k)) return false;
    const cost = C.costOf(k, to), t = C.now();
    car.cash -= cost.cash; car.cp -= cost.cp;
    car.queue.push({ key: k, to, start: t, end: t + C.timeOf(k, to) * 1000 });
    C.save(); return true;
  };

  C.upgradeReward = (k, to) => Math.round((k === 'hq' ? 20 : 5) * to);
  C.remaining = q => Math.max(0, (q.end - C.now()) / 1000);
  // Coins: 1 per minute left for the first hour, then 1 per 2 minutes (see ECONOMY.md)
  C.coinsFor = secs => { const F = E.finish, m = Math.ceil(secs / 60); return m <= F.firstHourMins ? Math.max(1, m * F.perMinute) : F.firstHourMins * F.perMinute + Math.ceil((m - F.firstHourMins) / F.afterHourMinsPerCoin); };
  C.goldToFinish = q => C.coinsFor(C.remaining(q));
  C.isFreeFinish = q => C.remaining(q) <= FREE_FINISH;
  C.finishNow = (q, pay) => {
    if (pay) { const g = C.goldToFinish(q); if (C.acct().gold < g) return false; C.acct().gold -= g; }
    q.end = C.now(); return C.completeBuild(q.key);   // Finish Now completes straight away, once paid for
  };

  // Complete finished builds. Returns the list of buildings that levelled up.
  C.tick = () => {
    const car = C.car(); if (!car) return [];
    C.tickRealDay();
    // 9r (FEEDBACK 92): a finished build waits, marked ready, until the player taps it. Nothing completes on its own,
    // so no message ever pops up in the middle of something else (a match, say).
    const done = car.queue.filter(q => q.end <= C.now() && !q.ready);
    if (done.length) { done.forEach(q => q.ready = 1); C.save(); }
    return [];
  };
  C.buildReady = k => { const q = C.inQueue(k); return !!(q && (q.ready || q.end <= C.now())); };
  // the player completes a finished build: the level goes up, the reward arrives and the level-up screen shows
  C.completeBuild = k => {
    const car = C.car(), q = C.inQueue(k); if (!q || q.end > C.now()) return false;
    car.b[q.key] = q.to; if (q.key in car.store) car.store[q.key] = Math.min(car.store[q.key], C.now());
    // every finished upgrade gives Coaching Points, more for the Coaches' Office (FEEDBACK 76); first builds give nothing
    q.cp = q.to <= 1 ? 0 : C.upgradeReward(q.key, q.to); car.cp += q.cp; (C.lvlQueue = C.lvlQueue || []).push(q);
    car.queue = car.queue.filter(x => x !== q); C.save(); C.nextLevelUp && C.nextLevelUp(); return true;
  };

  // ---- production (the Clubhouse makes Booster $, the Performance Lab makes Coaching Points) ----
  C.PRODUCERS = { booster: 'cash', lab: 'cp' };
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
