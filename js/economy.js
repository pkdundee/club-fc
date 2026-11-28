// CLUB FC 1.12 (FEEDBACK 257/258): the Economy branch of the Playbook. 7 paths x nodes I, II, III x 10 levels.
// Benefits per level: 0.5% (I), 1% (II), 2% (III) = 35%; the two cost paths 0.5 / 0.5 / 1% = 20% (provisional).
// Each node needs the previous node complete (10/10); each level needs a Performance Lab level (I: Lv k + path offset, II: 10 + k, III: 19 + k).
// Costs and times: V5.4 (tools/regression/model_v1/econ10.py TIER_COST): I 10 min x 1.5 a level, II 10 h x 1.2, III 3 days x 1.15; x the path factor.
// The paths sit in C.PB (eco flag) so slots, queues, Helpers, speed-ups and Finish Now all work as for football research.
(function (C) {
  const P = [   // id, icon, name, effect key, benefit set, cost/time factor, tier-I Lab offset, what it does
    ['ebt', '🏗', 'Build Time', 'bt', 'std', 1.0, 0, 'shorter construction'],
    ['ebc', '🧾', 'Build Cost', 'bc', 'cost', 0.8, 2, 'cheaper construction (Booster $)'],
    ['ert', '⏱', 'Research Time', 'rt', 'std', 1.3, 3, 'shorter research'],
    ['erc', '💡', 'Research Cost', 'rc', 'cost', 1.0, 4, 'cheaper research (CP and Booster $)'],
    ['efu', '💵', 'Fundraising', 'fu', 'std', 1.0, 1, 'more Booster $ from the Clubhouse'],
    ['ean', '📊', 'Analytics', 'an', 'std', 1.0, 2, 'more Coaching Points from the Performance Lab'],
    ['ehe', '🩹', 'Rehab', 'he', 'std', 0.8, 5, 'shorter injuries']];
  const BEN = { std: [.005, .01, .02], cost: [.005, .005, .01] };
  const TIER = [{ t1: 600, tg: 1.5, cp1: 30, cpg: 1.45, d1: 1000, dg: 1.45 }, { t1: 36000, tg: 1.2, cp1: 1500, cpg: 1.2, d1: 50000, dg: 1.2 }, { t1: 259200, tg: 1.15, cp1: 10000, cpg: 1.15, d1: 400000, dg: 1.15 }];
  const ID = {}; P.forEach(p => ID[p[0]] = p);
  P.forEach(([id, icon, name, eff, set, f, off, what]) => C.PB.push([id, icon, name, [0, 1, 2].map(t => [`${name} ${['I', 'II', 'III'][t]}`, eff, BEN[set][t], 10, what]), 'eco']));
  C.ECO_PATHS = P.map(p => ({ id: p[0], name: p[2], icon: p[1], eff: p[3] }));
  C.ecoKey = key => !!ID[String(key).split('.')[0]];
  C.ecoV = eff => C.car && C.car() && C.pbv ? C.pbv(eff) : 0;
  C.ecoLv = id => [0, 1, 2].reduce((s, t) => s + (C.pbLv ? C.pbLv(id + '.' + t) : 0), 0);
  const parts = key => { const [b, t] = key.split('.'); return { p: ID[b], t: +t }; };
  C.ecoLab = (key, to) => { const { p, t } = parts(key); return t === 0 ? to + p[6] : t === 1 ? 10 + to : 19 + to; };
  C.ecoCost = (key, to) => { const { p, t } = parts(key), T = TIER[t], rc = 1 - C.ecoV('rc');
    return { cp: Math.round(T.cp1 * Math.pow(T.cpg, to - 1) * p[5] * rc / 5) * 5, cash: Math.round(T.d1 * Math.pow(T.dg, to - 1) * p[5] * rc / 100) * 100 }; };
  C.ecoTime = (key, to) => { const { p, t } = parts(key), T = TIER[t]; return Math.round(T.t1 * Math.pow(T.tg, to - 1) * p[5] * (1 - C.ecoV('rt'))); };
  // unlock: tier I always; II and III need the previous node complete (10/10)
  const oU = C.pbUnlocked; C.pbUnlocked = key => { if (!C.ecoKey(key)) return oU(key); const { t } = parts(key); return t === 0 || C.pbLv(key.split('.')[0] + '.' + (t - 1)) >= 10; };
  const oC = C.pbCost; C.pbCost = (key, to) => { if (C.ecoKey(key)) return C.ecoCost(key, to); const k = oC(key, to), rc = 1 - C.ecoV('rc');
    return rc < 1 ? { cp: Math.round(k.cp * rc / 5) * 5, cash: Math.round(k.cash * rc / 100) * 100 } : k; };   // Research Cost applies to all research
  C.ecoLabOK = key => !C.ecoKey(key) || C.level('lab') >= C.ecoLab(key, C.pbLv(key) + 1);
  const oS = C.pbStart; C.pbStart = key => C.ecoLabOK(key) ? oS(key) : 'lab';
  // the node card's requirement rows for an Economy node: the previous node complete, and the Performance Lab level
  C.ecoReqRows = (key, row) => { const { p, t } = parts(key), to = C.pbLv(key) + 1, lab = C.ecoLab(key, Math.min(10, to));
    return (t ? row(p[1], `Lv.10 ${C.esc(p[2])} ${['I', 'II'][t - 1]}`, C.pbLv(p[0] + '.' + (t - 1)) >= 10) : '') + row('🔬', `Lv.${lab} Performance Lab`, C.level('lab') >= lab); };

  // ---------- effects ----------
  const oT = C.timeOf; C.timeOf = (k, to) => { const t = oT(k, to); return to <= 1 ? t : Math.round(t * (1 - C.ecoV('bt'))); };   // Build Time: direct reduction
  const oK = C.costOf; C.costOf = (k, to) => { const c = oK(k, to), r = C.ecoV('bc'); return r && c.cash ? Object.assign({}, c, { cash: Math.round(c.cash * (1 - r) / 50) * 50 }) : c; };
  const oB = C.prod.booster, oL = C.prod.lab;
  C.prod.booster = l => Math.round(oB(l) * (1 + C.ecoV('fu')));   // Fundraising (also sizes Booster Crates)
  C.prod.lab = l => Math.round(oL(l) * (1 + C.ecoV('an')) * 10) / 10;   // Analytics (also sizes CP Crates)
  // Rehab: every injury is shorter by the Rehab share (the fraction becomes a chance of one match less); Sports Medicine's chance comes after (medical.js)
  C.rehab = (n, rnd) => { const r = C.ecoV('he'); if (!r) return n; const x = n * (1 - r), w = Math.floor(x); return Math.max(1, w + ((rnd || Math.random)() < x - w ? 1 : 0)); };   // uses the match's own random numbers
})(window.CFC);
