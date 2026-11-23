// CLUB FC 1.03: the unified speed-up specification (SCOPE_1.02 s4; FEEDBACK 129-130, 139, 159-163, 196, 209).
//  1 Slot rule: items only work on a running timer, which already holds a slot; Coins may finish a timer before it starts (Finish Now).
//  2 Free finish: EARNED, starting at 0 (P6). Buildings from Coaches' Office levels, research from Performance Lab levels.
//    The universal 2 minutes is gone. Training has no free finish.
//  4 Item selection: least wasted time, then fewest items, then type-specific before general, then smaller items first.
//    If the items can't cover the time, the closest total without going over (partial).
//  5 Recommendation (P8): ONE recommended option on cards, items or Coins, whichever is cheaper at the P7 Coin values.
//  6 One Speed Up popup for every running timer: time left, the recommended option first, the other option, then every
//    owned speed-up with a Use button.
(function (C) {
  const A = C.ACTS;

  // ---------- 2. the earned free-finish window, in seconds ----------
  C.freeWindow = q => {
    if (!q) return 0;
    if (q.pid) return 0;                                                   // training plans
    if (String(q.key).includes('.')) return 15 * Math.max(0, (C.eff('lab') || 0) - 1);   // research: +15 s a Lab level
    const hq = C.level('hq') || 0;                                         // buildings: +20 s a Coaches' Office level to Lv 10, then +60 s
    return hq <= 1 ? 0 : hq <= 10 ? 20 * (hq - 1) : 180 + 60 * (hq - 10);
  };
  C.isFreeFinish = q => { const w = C.freeWindow(q), r = C.remaining(q); return r <= 0 || (w > 0 && r <= w); };

  // ---------- 4. which items (a pure rule on owned items and time left; no Coin values) ----------
  C.pickItems = (kind, secs) => {
    const inv = C.meta().inv, XN = C.XN, T = Math.ceil(secs / 60);
    const keys = C.speedKeys(kind).filter(k => inv[k] > 0);
    if (T <= 0 || !keys.length) return { plan: {}, total: 0, covers: T <= 0 };
    // group by size; within a size, type-specific items are used before general ones (rule 3)
    const sizes = [...new Set(keys.map(k => XN[k][2]))].sort((a, b) => b - a);   // largest first: ties then keep the larger ones (rule 4)
    const avail = m => keys.filter(k => XN[k][2] === m).reduce((s, k) => s + inv[k], 0);
    const maxM = sizes[0], S = T + maxM;
    let best = new Array(S + 1).fill(Infinity); best[0] = 0; const choice = [];
    for (const m of sizes) {
      const nb = new Array(S + 1).fill(Infinity), ch = new Int32Array(S + 1), cap = Math.min(avail(m), Math.ceil(S / m));
      for (let s = 0; s <= S; s++) for (let c = 0; c <= cap && c * m <= s; c++) { const v = best[s - c * m] + c; if (v < nb[s]) { nb[s] = v; ch[s] = c; } }
      best = nb; choice.push(ch);
    }
    let pick = -1;
    for (let s = T; s <= S; s++) if (best[s] < Infinity) { pick = s; break; }                // least waste, then fewest items
    const covers = pick >= 0;
    if (!covers) { for (let s = T - 1; s > 0; s--) if (best[s] < Infinity) { pick = s; break; } }   // partial: closest without going over
    if (pick <= 0) return { plan: {}, total: 0, covers: false };
    const per = {}; let s = pick;
    for (let i = sizes.length - 1; i >= 0; i--) { const c = choice[i][s]; per[sizes[i]] = c; s -= c * sizes[i]; }
    const plan = {};
    for (const m of sizes) { let need = per[m]; if (!need) continue;
      for (const k of keys.filter(k => XN[k][2] === m).sort((a, b) => (XN[a][3] === 'g') - (XN[b][3] === 'g'))) { const u = Math.min(need, inv[k]); if (u) { plan[k] = u; need -= u; } } }
    return { plan, total: pick, covers };
  };
  // the items that cover the time left (rule 4), or null (kept for callers from 1.02)
  C.speedPlan = (kind, secs) => { const p = C.pickItems(kind, secs); return p.covers && Object.keys(p.plan).length ? p.plan : null; };
  C.itemsValue = plan => Object.keys(plan).reduce((s, k) => s + C.coinsFor(C.XN[k][2] * 60) * plan[k], 0);

  // ---------- 5. the recommendation: 'free', 'items' or 'coins' ----------
  const runningQ = (kind, key) => kind === 'r' ? C.pbInQueue(key) : kind === 't' ? C.inDev(key) : C.inQueue(key);
  C.speedAdvice = (kind, key) => {
    const q = runningQ(kind, key); if (!q) return null;
    if (C.isFreeFinish(q)) return { rec: 'free', q };
    const secs = C.remaining(q), p = C.pickItems(kind, secs), coins = C.coinsFor(secs), gold = C.acct().gold, has = Object.keys(p.plan).length > 0;
    let rec = 'coins';
    if (has && p.covers && (C.itemsValue(p.plan) <= coins || gold < coins)) rec = 'items';
    else if (has && !p.covers && gold < coins) rec = 'items';
    return { rec, q, secs, pick: p, coins };
  };
  C.finishLabel = (kind, key) => { const a = C.speedAdvice(kind, key); if (!a) return '';
    return a.rec === 'free' ? 'Free' : a.rec === 'items' ? '⏩ Speed-ups' : `${C.GEM} ${a.coins}`; };
  C.speedButtonHTML = (kind, key) => { const a = C.speedAdvice(kind, key); if (!a) return '';
    if (a.rec === 'free') return `Finish<br><em style="color:#15803d">Free</em>`;
    if (a.rec === 'items') return `Speed Up<br><em>⏩ ${C.dur(a.pick.total * 60)}</em>`;
    return `Finish Now<br><em class="${C.acct().gold < a.coins ? 'short' : ''}">${C.GEM} ${a.coins}</em>`; };

  // ---------- 6. the Speed Up popup ----------
  let cur = null;   // { kind, key, done }
  const NAMES = { b: k => `${C.BUILDINGS[k].name}`, r: k => C.pbName ? C.pbName(k) : k, t: k => { const p = C.P(k); return p ? 'Training: ' + C.sn(p) : 'Training' } };
  const tile = (k, n) => { const m = C.XN[k][2]; return `<span class="itile t2">${C.XN[k][0]}<b>${m >= 60 ? m / 60 + 'h' : m + 'm'}</b>${n ? `<em>×${n}</em>` : ''}</span>`; };
  function finishNow() { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key); if (q) q.end = C.now(); C.save(); C.ui.back(); cur = null; c.done(); }
  function after() { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key); if (!q) return C.ui.back();
    if (C.isFreeFinish(q)) return finishNow(); C.save(); C.ui.refresh(); }
  C.openSpeedUp = (kind, key, done) => {
    cur = { kind, key, done };
    C.ui.open('Speed Up', () => {
      const a = C.speedAdvice(kind, key); if (!a) return '<p class="note">Already finished.</p>';
      const q = a.q, total = (q.end - q.start) / 1000, rem = C.remaining(q), f = Math.max(0, Math.min(1, 1 - rem / total));
      const head = `<div class="card"><b>${C.esc(NAMES[kind](key))}${q.to ? ' → Lv ' + q.to : ''}</b>
        <div class="bq-bar big" style="margin-top:6px"><i style="width:${Math.round(f * 100)}%"></i><span data-until="${q.end}">${C.dur(rem)}</span></div>
        <small style="opacity:.8">Free finish: ${C.freeWindow(q) ? 'the last ' + C.dur(C.freeWindow(q)) : 'none yet'}</small></div>`;
      if (a.rec === 'free') return head + `<button class="btn full pri" data-act="spfree" style="background:#16a34a">Finish · Free</button>`;
      const p = a.pick, gold = C.acct().gold, hasItems = Object.keys(p.plan).length > 0;
      const itemsBlock = hasItems ? `<div class="card"><b>Instant Speed-up${p.covers ? '' : ' (part of the time)'}</b><div class="useit" style="margin:6px 0">${Object.keys(p.plan).map(k => tile(k, p.plan[k])).join('')}</div>
        <small style="display:block">Total ${C.dur(p.total * 60)}${p.covers ? '' : ` · ${C.dur(rem - p.total * 60)} still left`}</small>
        <button class="btn full ${a.rec === 'items' ? 'pri' : 'sec2'}" data-act="spitems" style="margin-top:6px">Use speed-ups</button></div>` : '';
      const coinsBlock = `<div class="card"><b>Finish Now</b><small style="display:block">Finish straight away with Coins. You have ${C.GEM} ${C.short(gold)}</small>
        <button class="btn full ${a.rec === 'coins' ? 'pri' : 'sec2'}" data-act="spcoins" style="margin-top:6px">${C.GEM} ${a.coins}</button></div>`;
      const owned = C.speedKeys(kind).filter(k => C.meta().inv[k] > 0).sort((x, y) => C.XN[x][2] - C.XN[y][2]);
      const list = owned.length ? `<h3 class="jh">Your speed-ups</h3>${owned.map(k => `<div class="mrw">${tile(k)}<div><b>${C.esc(C.XN[k][1])}</b><small>Owned: ${C.meta().inv[k]}</small></div><button class="btn sm2" data-act="spone" data-v="${k}">Use</button></div>`).join('')}`
        : '<p class="note">No speed-up items for this. They come from Missions, events and the Store.</p>';
      return head + (a.rec === 'items' ? itemsBlock + coinsBlock : coinsBlock + itemsBlock) + list;
    }, { popup: true });
  };
  A.spfree = () => finishNow();
  A.spitems = () => { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key); if (!q) return; const p = C.pickItems(c.kind, C.remaining(q)), inv = C.meta().inv;
    if (!Object.keys(p.plan).length) return; Object.keys(p.plan).forEach(k => inv[k] -= p.plan[k]); q.end -= p.total * 60000; C.fwEvent && C.fwEvent('speed');
    if (p.covers) return finishNow(); after(); };
  A.spone = k => { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key), inv = C.meta().inv; if (!q || !(inv[k] > 0)) return;
    inv[k]--; q.end -= C.XN[k][2] * 60000; C.fwEvent && C.fwEvent('speed'); if (q.end <= C.now()) return finishNow(); after(); };
  A.spcoins = () => { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key); if (!q) return; const g = C.coinsFor(C.remaining(q));
    C.confirmCoins(g, () => { const q2 = runningQ(c.kind, c.key); if (!q2) return; const g2 = C.coinsFor(C.remaining(q2)); if (C.acct().gold < g2) return C.toast('Not enough Coins');
      C.acct().gold -= g2; C.fwEvent && C.fwEvent('speed'); cur = c; finishNow(); }); };

  // every speed-up entry point now goes through the popup (FEEDBACK 196): building Finish Now, research cards and slots, training
  C.finishRunning = (kind, key, done) => { const q = runningQ(kind, key); if (!q) return;
    if (C.isFreeFinish(q)) { q.end = C.now(); C.save(); return done(); }
    C.openSpeedUp(kind, key, done); };
  const trainingDone = () => { C.tickDev().forEach(m => C.toast(m)); C.save(); C.ui.refresh(); C.render(); };
  A.devspeedpop = id => C.finishRunning('t', id, trainingDone);
  A.devspeed = id => C.finishRunning('t', id, trainingDone);
  A.devfinish = id => C.finishRunning('t', id, trainingDone);
})(window.CFC);
