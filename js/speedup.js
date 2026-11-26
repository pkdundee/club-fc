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
    return a.rec === 'free' ? 'Free' : a.rec === 'items' ? '⏩ Speed-ups' : `${C.GEM} ${C.full(a.coins)}`; };
  C.speedButtonHTML = (kind, key) => { const a = C.speedAdvice(kind, key); if (!a) return '';
    if (a.rec === 'free') return `Finish<br><em style="color:#15803d">Free</em>`;
    if (a.rec === 'items') return `Speed Up<br><em>⏩ ${C.dur(a.pick.total * 60)}</em>`;
    return `Finish Now<br><em class="${C.acct().gold < a.coins ? 'short' : ''}">${C.GEM} ${C.full(a.coins)}</em>`; };

  // ---------- 6. the Speed Up popup ----------
  let cur = null;   // { kind, key, done }
  const NAMES = { b: k => `${C.BUILDINGS[k].name}`, r: k => C.pbName ? C.pbName(k) : k, t: k => { const p = C.P(k); return p ? 'Training: ' + C.sn(p) : 'Training' } };
  const tile = (k, n) => { const m = C.XN[k][2]; return `<span class="itile t2">${C.XN[k][0]}<b>${m >= 60 ? m / 60 + 'h' : m + 'm'}</b>${n ? `<em>${n}×</em>` : ''}</span>`; };   // 1.04.01 (QA-45): "N×" bottom left
  function finishNow() { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key); if (q) q.end = C.now(); C.save(); C.ui.back(); cur = null; c.done(); }
  function after() { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key); if (!q) return C.ui.back();
    if (C.isFreeFinish(q)) return finishNow(); C.save(); C.ui.refresh(); }
  // 1.03.01 (QA-31, reference image): rows in a fixed order. 1 Instant Speed-up (green, items), 2 Finish Now (gold, Coins),
  // 3 each item biggest to smallest with Use and xN. Only Instant Speed-up and Finish Now confirm; Use and xN act at once.
  const row = (icon, title, sub, btn) => `<div class="sprow">${icon}<div class="sptx"><b>${title}</b><small>${sub}</small></div>${btn}</div>`;
  const ico = (k, txt) => `<span class="spico">${k ? C.XN[k][0] : '⏩'}${txt ? `<em>${txt}</em>` : ''}</span>`;
  const mins = k => C.XN[k][2], lbl = m => m >= 60 ? m / 60 + 'h' : m + 'm';
  // xN: 100 when you own 100 or more, 10 when 10 or more, otherwise all you own; never more than the time needs
  C.batchN = (k, secs) => { const own = C.meta().inv[k] || 0, cap = own >= 100 ? 100 : own >= 10 ? 10 : own; return Math.max(1, Math.min(cap, Math.ceil(secs / 60 / mins(k)))); };
  C.openSpeedUp = (kind, key, done) => {
    cur = { kind, key, done };
    C.ui.open('Speed Up', () => {
      const a = C.speedAdvice(kind, key); if (!a) return '<p class="note">Already finished.</p>';
      const q = a.q, total = (q.end - q.start) / 1000, rem = C.remaining(q), f = Math.max(0, Math.min(1, 1 - rem / total));
      const head = `<div class="sphead"><b>${C.esc(NAMES[kind](key))}${q.to ? ' → Lv ' + q.to : ''}</b>
        <div class="bq-bar big"><i style="width:${Math.round(f * 100)}%"></i><span data-until="${q.end}">${C.dur(rem)}</span></div>
        <small>Free finish: ${C.freeWindow(q) ? 'the last ' + C.dur(C.freeWindow(q)) : 'none yet'}</small></div>`;
      if (rem <= 0) return head.replace('<div class="bq-bar big">', '<div class="bq-bar big done">') + `<button class="btn full pri" data-act="spfree" style="background:#16a34a">✔ Completed</button>`;   // 1.06 (QA-82)
      if (a.rec === 'free') return head + `<button class="btn full pri" data-act="spfree" style="background:#16a34a">Finish · Free</button>`;
      const p = a.pick, gold = C.acct().gold, hasItems = Object.keys(p.plan).length > 0, rec = a.rec;
      const inst = hasItems ? row(ico(null), 'Instant Speed-up', `Use speed-up items <b class="spg">${C.dur(p.total * 60)}</b>${p.covers ? '' : ` · ${C.dur(rem - p.total * 60)} left after`}${rec === 'items' ? ' · <b>best value</b>' : ''}`,
        `<button class="spbtn green" data-act="spitems">Instant<br>Speed-up</button>`) : '';
      const fin = row(ico(null), 'Finish Now', `Finish straight away with Coins (${C.dur(rem)})${rec === 'coins' ? ' · <b>best value</b>' : ''}`,
        `<button class="spbtn gold ${gold < a.coins ? 'short' : ''}" data-act="spcoins">Buy &amp; Use<br>${C.GEM} ${C.full(a.coins)}</button>`);
      const owned = C.speedKeys(kind).filter(k => C.meta().inv[k] > 0).sort((x, y) => mins(y) - mins(x) || (C.XN[x][3] === 'g') - (C.XN[y][3] === 'g'));
      const items = owned.map(k => { const n = C.batchN(k, rem);
        return row(ico(k, lbl(mins(k))), C.esc(C.XN[k][1]), `Owned: ${C.meta().inv[k]}`, `<span class="spbtns">${n > 1 ? `<button class="spbtn blue" data-act="spone" data-v="${k}|${n}">×${n}</button>` : ''}<button class="spbtn blue" data-act="spone" data-v="${k}|1">Use</button></span>`); }).join('');
      return head + `<div class="sprows">${inst}${fin}${items || ''}</div>` + (owned.length ? '' : '<p class="note">No speed-up items for this. They come from Missions, events and the Store.</p>');
    }, { popup: true });
  };
  A.spfree = () => finishNow();
  // 1.06 (QA-82): the popup redraws every second, so counts, prices, the free finish and Completed are always current
  setInterval(() => { if (cur && C.ui.topTitle && C.ui.topTitle() === 'Speed Up') C.ui.refresh(); }, 1000);
  // Instant Speed-up: confirm exactly which items will be used, then use them
  A.spitems = () => { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key); if (!q) return; if (C.isFreeFinish(q)) return finishNow();   // 1.06 (QA-82): nothing is charged inside the free window
    const p = C.pickItems(c.kind, C.remaining(q));
    if (!Object.keys(p.plan).length) return;
    C.ui.open('Use Items', () => `<div class="useit">${Object.keys(p.plan).map(k => tile(k, p.plan[k])).join('')}</div>
      <p class="note" style="text-align:center">Speed-up: <b style="color:var(--fit5)">${C.dur(p.total * 60)}</b> · time left ${C.dur(C.remaining(q))}</p>
      <div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Cancel</button><button class="btn pri" data-act="spitemsok">Confirm</button></div>`, { popup: true });
    pend = () => { const q2 = runningQ(c.kind, c.key), inv = C.meta().inv; if (!q2) return; if (C.isFreeFinish(q2)) { cur = c; return finishNow(); } Object.keys(p.plan).forEach(k => inv[k] -= p.plan[k]); q2.end -= p.total * 60000; C.fwEvent && C.fwEvent('speed');
      cur = c; if (q2.end <= C.now() || p.covers) return finishNow(); after(); }; };
  let pend = null;
  A.spitemsok = () => { const f = pend; pend = null; C.ui.back(); if (f) f(); };
  // Use / xN: straight away, no confirmation
  A.spone = v => { const [k, nn] = String(v).split('|'), c = cur; if (!c) return; const q = runningQ(c.kind, c.key), inv = C.meta().inv; if (!q || !(inv[k] > 0)) return; if (C.isFreeFinish(q)) return finishNow();
   
    const n = Math.min(+nn || 1, inv[k]); inv[k] -= n; q.end -= mins(k) * 60000 * n; C.fwEvent && C.fwEvent('speed'); if (q.end <= C.now()) return finishNow(); after(); };
  // Finish Now: confirms the Coins (the Coin confirmation always shows here, QA-31)
  A.spcoins = () => { const c = cur; if (!c) return; const q = runningQ(c.kind, c.key); if (!q) return; if (C.isFreeFinish(q)) return finishNow(); const g = C.coinsFor(C.remaining(q));
    if (C.acct().gold < g) return C.toast('Not enough Coins');
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
