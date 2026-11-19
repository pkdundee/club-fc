// Club FC: the research path (9r, FEEDBACK 79), Last War style. Categories with recommendations, a tree per category,
// a node card with costs (and Obtain when short), Missing Resources with Replenish All, Finish Now with speed-up items,
// and a brief Power overlay when research completes. Research also waits for a tap to complete, like buildings (FEEDBACK 92).
(function (C) {
  const A = C.ACTS;
  const node = key => { const [b, t] = key.split('.'); const B = C.PB.find(x => x[0] === b); return { B, n: B[3][+t], t: +t }; };
  const keys = () => C.PB.flatMap(B => B[3].map((n, t) => B[0] + '.' + t));
  const pbq = () => { const car = C.car(); if (!car.pbq) car.pbq = []; if (!car.pb) car.pb = {}; return car.pbq; };
  C.pbName = key => node(key).n[0];
  const PBPOW = 60;   // Program Power per research level
  C.pbPower = () => C.pbTotal() * PBPOW;
  const oPP = C.programPower; C.programPower = () => oPP() + C.pbPower();
  const val = (n, lv) => n[1] === 'slot' ? (lv ? n[4] : '—') : '+' + Math.round(lv * n[2] * 1000) / 10 + '% ' + n[4];
  C.pbAffordable = key => { const to = C.pbLv(key) + 1, k = C.pbCost(key, to), car = C.car(); return car.cp >= k.cp && car.cash >= k.cash; };
  const open = key => { const { n } = node(key); return C.pbUnlocked(key) && C.pbLv(key) < n[3] && !C.pbInQueue(key); };
  // recommended next research: an open node, affordable first, then the cheapest
  C.pbRecommend = () => keys().filter(open).sort((a, b) => (C.pbAffordable(b) - C.pbAffordable(a)) || (C.pbCost(a, C.pbLv(a) + 1).cp - C.pbCost(b, C.pbLv(b) + 1).cp))[0] || null;
  const thumb = key => key ? `<i class="thumb ${C.pbAffordable(key) ? 'go' : 'wait'}" title="${C.pbAffordable(key) ? 'Recommended: you can research it now' : 'Recommended next'}">👍</i>` : '';

  // research waits for a tap when finished
  C.tickPB = () => { const q = pbq(); let ch = 0; q.forEach(x => { if (x.end <= C.now() && !x.ready) { x.ready = 1; ch = 1; } }); if (ch) C.save(); return []; };
  C.pbReady = key => { const q = C.pbInQueue(key); return !!(q && q.end <= C.now()); };
  C.pbComplete = key => { const car = C.car(), q = C.pbInQueue(key); if (!q || q.end > C.now()) return false;
    car.pb[key] = q.to; car.pbq = pbq().filter(x => x !== q); C.save(); C.powerFlash(PBPOW, `Research on ${C.pbName(key)} ${['I', 'II', 'III'][node(key).t] ? '' : ''}Lv ${q.to} completed.`); return true; };
  // a brief overlay: Power gained and what completed; fades by itself (FEEDBACK 79)
  C.powerFlash = (pow, text) => { const el = document.createElement('div'); el.className = 'pflash';
    el.innerHTML = `<div class="pf1"><i class="ppi"></i>POWER +${pow.toLocaleString()}</div><div class="pf2">${C.esc(text)}</div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on')); setTimeout(() => el.classList.remove('on'), 1600); setTimeout(() => el.remove(), 2000); };

  // ---------- 1. categories ----------
  C.openPlaybook = () => C.ui.open('Playbook', () => { pbq();
    const rec = C.pbRecommend(), recB = rec ? rec.split('.')[0] : null;
    const pct = B => { const tot = B[3].reduce((s, n) => s + n[3], 0), got = B[3].reduce((s, n, t) => s + C.pbLv(B[0] + '.' + t), 0); return Math.round(got / tot * 100); };
    const cards = C.PB.map(B => `<button class="pbcat ${B[0] === recB ? 'rec' : ''}" data-act="pbtree" data-v="${B[0]}">${B[0] === recB ? thumb(rec) + '<s class="rib">Recommended</s>' : ''}<span class="pci">${B[1]}</span><b>${pct(B)}%</b><small>${C.esc(B[2])}</small></button>`).join('');
    return `<div class="pbcats">${cards}</div><p class="note">Research runs in the Performance Lab with Coaching Points. Bonuses are small and capped: tactics, players and fitness still decide matches.</p>${qbar()}`; });
  // the research queue along the bottom of every research screen
  function qbar() { const q = pbq(), openS = C.PBSLOTS.filter(s => C.pbSlotOpen(s.id));
    return `<div class="pbqbar">${C.PBSLOTS.map((s, i) => { if (!C.pbSlotOpen(s.id)) return `<button class="pbqs lock" data-act="pbslot" data-v="${s.id}"><i>${i + 1}</i>🔒</button>`;
      const r = q[openS.indexOf(s)]; if (!r) return `<button class="pbqs" data-act="pbrec"><i>${i + 1}</i>Idle</button>`;
      const done = r.end <= C.now(); return `<button class="pbqs ${done ? 'done' : 'run'}" data-act="${done ? 'pbdone' : 'pbnode'}" data-v="${r.key}"><i>${i + 1}</i>${done ? 'Complete' : `<span data-until="${r.end}">${C.dur(C.remaining(r))}</span>`}</button>`; }).join('')}</div>`; }

  // ---------- 2. the tree for one category ----------
  let branch = 'att';
  C.openPBTree = b => { branch = b; C.ui.open(node(b + '.0').B[2], treeHTML); };
  function treeHTML() { const B = node(branch + '.0').B, rec = C.pbRecommend();
    const hex = (key, t) => { const n = B[3][t], lv = C.pbLv(key), un = C.pbUnlocked(key), q = C.pbInQueue(key), max = lv >= n[3];
      return `<button class="hexn ${un ? 'on' : ''} ${t === 2 ? 'key' : ''} ${q ? 'run' : ''}" data-act="${q && q.end <= C.now() ? 'pbdone' : 'pbnode'}" data-v="${key}">${key === rec ? thumb(rec) : ''}
        <span class="hx"><span class="hi">${B[1]}</span><b class="${max ? 'max' : ''}">${max ? 'MAX' : q && q.end <= C.now() ? '✔' : lv + '/' + n[3]}</b></span><small>${C.esc(n[0])}</small></button>`; };
    return `<div class="hextree">${B[3].map((n, t) => (t ? `<div class="hexl ${C.pbUnlocked(branch + '.' + t) ? 'on' : ''}"></div>` : '') + hex(branch + '.' + t, t)).join('')}</div>${qbar()}`; }

  // ---------- 3. the node card ----------
  C.openPBNode = key => C.ui.open('Research', () => {
    const car = C.car(), { B, n, t } = node(key), lv = C.pbLv(key), to = lv + 1, q = C.pbInQueue(key), un = C.pbUnlocked(key);
    const k = to <= n[3] ? C.pbCost(key, to) : null, tm = k ? C.pbTime(key, to) : 0;
    const head = `<div class="pbn9"><span class="hx sm on"><span class="hi">${B[1]}</span><b>${lv}/${n[3]}</b></span><div><b>${C.esc(n[0])}</b><small>${C.esc(B[2])} · Tier ${['I', 'II', 'III'][t]}</small>
      <div class="srow"><span>Current</span><b>${val(n, lv)}</b></div>${k ? `<div class="srow"><span>Next level</span><b style="color:var(--fit5)">${val(n, to)}</b></div>` : ''}</div></div>`;
    if (q) { const done = q.end <= C.now(), f = done ? 1 : 1 - C.remaining(q) / ((q.end - q.start) / 1000);
      return head + `<div class="card"><div class="bq-bar"><i style="width:${Math.round(f * 100)}%"></i></div><p class="note" style="text-align:center">${done ? 'Finished' : `<span data-until="${q.end}">${C.dur(C.remaining(q))}</span> left`}</p></div>
        ${done ? `<button class="btn full pri" data-act="pbdone" data-v="${key}">Complete</button>` : `<div class="bt2"><button class="btn fin2" data-act="pbspeed" data-v="${key}">Finish Now<br><em>${finishLabel('r', key)}</em></button></div>`}`; }
    if (!k) return head + '<p class="note">✨ Fully researched.</p>';
    const row = (icon, txt, ok, kind, need) => `<div class="cr ${ok ? '' : 'bad'}"><span class="ic">${icon}</span><span class="ct">${txt}</span>${ok ? '<b class="ok">✔</b>' : kind ? `<button class="obtain" data-act="pbobtain" data-v="${kind}|${need}">Obtain</button>` : '<b class="no">✖</b>'}</div>`;
    const prev = t ? B[0] + '.' + (t - 1) : null;
    const rows = (prev ? row(B[1], `Lv.5 ${C.esc(B[3][t - 1][0])}`, C.pbLv(prev) >= 5) : '') +
      row('<i class="cpi"></i>', `<span class="${car.cp >= k.cp ? '' : 'short'}">${C.short(car.cp)}</span>/${C.short(k.cp)}`, car.cp >= k.cp, 'cp', k.cp) +
      (k.cash ? row('💵', `<span class="${car.cash >= k.cash ? '' : 'short'}">${C.short(car.cash)}</span>/${C.short(k.cash)}`, car.cash >= k.cash, 'cash', k.cash) : '');
    const ok = un && car.cp >= k.cp && car.cash >= k.cash, slot = pbq().length < C.pbSlots();
    return head + `<h3 class="jh" style="text-align:center">Cost</h3><div class="tbl">${rows}</div>
      <div class="orig"><span>${ok && !slot ? 'All research slots are busy' : ''}</span><span>Original Time: ${C.dur(tm)}</span></div>
      <div class="bt2"><button class="btn fin2" data-act="pbinstant" data-v="${key}" ${ok ? '' : 'disabled'}>Finish Now<br><em>${C.GEM} ${C.coinsFor(tm)}</em></button>
      <button class="btn pri" data-act="pbgo" data-v="${key}" ${ok && slot ? '' : 'disabled'}>Research<br><em>⏱ ${C.dur(tm)}</em></button></div>`;
  }, { popup: true });

  // ---------- speed-up items in Finish Now ----------
  // the speed-up items that cover the time left, biggest first; null if they can't
  C.speedPlan = (kind, secs) => { const inv = C.meta().inv, XN = C.XN, ks = C.speedKeys(kind).filter(k => inv[k] > 0).sort((a, b) => XN[b][2] - XN[a][2]);
    let left = Math.ceil(secs / 60); const plan = {}; for (const k of ks) { while (left > 0 && (plan[k] || 0) < inv[k]) { plan[k] = (plan[k] || 0) + 1; left -= XN[k][2]; if (left <= 0) break; } if (left <= 0) break; }
    return left <= 0 ? plan : null; };
  function finishLabel(kind, key) { const q = kind === 'r' ? C.pbInQueue(key) : C.inQueue(key); if (!q) return ''; if (C.isFreeFinish(q)) return 'Free';
    return C.speedPlan(kind, C.remaining(q)) ? '⏩ Speed-ups' : `${C.GEM} ${C.goldToFinish(q)}`; }
  C.finishLabel = finishLabel;
  // confirm the items Finish Now will use (FEEDBACK 79)
  C.confirmItems = (plan, secs, go) => { const XN = C.XN, total = Object.keys(plan).reduce((s, k) => s + XN[k][2] * plan[k], 0);
    C.ui.open('Speed Up', () => `<div class="useit">${Object.keys(plan).map(k => `<span class="itile t2">${XN[k][0]}<b>${XN[k][2] >= 60 ? XN[k][2] / 60 + 'h' : XN[k][2] + 'm'}</b><em>×${plan[k]}</em></span>`).join('')}</div>
      <p class="note" style="text-align:center">Total speed-up: <b style="color:var(--fit5)">${C.dur(total * 60)}</b> · needed ${C.dur(secs)}</p>
      <div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Cancel</button><button class="btn pri" data-act="itemsok">Confirm</button></div>`, { popup: true });
    pendingItems = () => { const inv = C.meta().inv; Object.keys(plan).forEach(k => inv[k] -= plan[k]); C.save(); go(); }; };
  let pendingItems = null;
  A.itemsok = () => { const f = pendingItems; pendingItems = null; C.ui.back(); if (f) f(); };
  C.finishRunning = (kind, key, done) => { const q = kind === 'r' ? C.pbInQueue(key) : C.inQueue(key); if (!q) return; const secs = C.remaining(q);
    if (C.isFreeFinish(q)) { q.end = C.now(); return done(); }
    const plan = C.speedPlan(kind, secs); if (plan) return C.confirmItems(plan, secs, () => { q.end = C.now(); done(); });
    C.confirmCoins(C.goldToFinish(q), () => { const g = C.goldToFinish(q); if (C.acct().gold < g) return C.toast('Not enough Coins'); C.acct().gold -= g; q.end = C.now(); done(); }); };

  // ---------- Missing resources (Obtain) and Replenish All ----------
  C.openMissing = (kind, need) => C.ui.open('Missing Resources', () => { const car = C.car(), inv = C.meta().inv, have = kind === 'cp' ? car.cp : car.cash, f = Math.min(1, have / need);
    const rows = kind === 'cash' ? (inv.crate ? `<div class="mrw"><span class="itile t2">📦<b>$5K</b></span><div><b>Booster crate</b><small>Owned: ${inv.crate}</small></div><button class="btn sm2 pri" data-act="mruse" data-v="crate">Use</button></div>` : '') : '';
    return `<div class="mrhd"><p>Need <b class="short">${C.short(Math.max(0, need - have))}</b> ${kind === 'cp' ? 'Coaching Points' : 'Booster $'} to proceed.</p><div class="bq-bar big"><i style="width:${Math.round(f * 100)}%"></i><span>${C.short(have)} / ${C.short(need)}</span></div></div>
      ${rows || `<p class="note">${kind === 'cp' ? 'Coaching Points come from the Performance Lab (collect them on campus), matches and Missions.' : 'No Booster crates in your Items. Booster $ come from the Clubhouse, home matches and Missions.'}</p>`}
      ${rows ? `<button class="btn full pri" data-act="mrall" data-v="${kind}|${need}" style="background:#16a34a">Replenish All</button>` : `<button class="btn full sec2" data-act="${kind === 'cp' ? 'bgo' : 'store'}" data-v="${kind === 'cp' ? 'lab' : ''}">${kind === 'cp' ? 'Go to the Performance Lab' : 'Store'}</button>`}`; }, { popup: true });
  A.pbobtain = v => { const [k, n] = v.split('|'); C.openMissing(k, +n); };
  A.mruse = () => { if (C.openCrate()) { congrats('+$5K Booster $'); C.ui.refresh(); } };
  A.mrall = v => { const [k, n] = v.split('|'), car = C.car(), inv = C.meta().inv, need = Math.max(0, +n - car.cash), use = Math.min(inv.crate || 0, Math.ceil(need / 5000));
    if (!use) return; C.ui.open('Use Items', () => `<div class="useit"><span class="itile t2">📦<b>$5K</b><em>×${use}</em></span></div><p class="note" style="text-align:center"><b style="color:var(--fit5)">+${C.short(use * 5000)}</b> / ${C.short(need)} needed</p>
      <div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Cancel</button><button class="btn pri" data-act="mrok" data-v="${use}">Confirm</button></div>`, { popup: true }); };
  A.mrok = v => { for (let i = 0; i < +v; i++) C.openCrate(); C.ui.back(); congrats(`+${C.short(+v * 5000)} Booster $`); C.ui.refresh(); };
  function congrats(t) { const el = document.createElement('div'); el.className = 'congr'; el.innerHTML = `<div class="lu-rib">CONGRATULATIONS!</div><div class="cg-t">${C.esc(t)}</div>`; document.body.appendChild(el); setTimeout(() => el.remove(), 1400); }

  // ---------- actions ----------
  A.pbtree = v => C.openPBTree(v);
  A.pbrec = () => { const r = C.pbRecommend(); if (!r) return C.toast('Everything open is being researched'); C.openPBTree(r.split('.')[0]); C.openPBNode(r); };
  // 1.01 (FEEDBACK 140): the research badge on the Performance Lab / Next Step: one finished -> complete it; several -> the queue
  A.pbready = () => { const r = (C.car().pbq || []).filter(q => q.end <= C.now()); if (r.length === 1) { if (C.pbComplete(r[0].key)) { C.ui.closeAll(); C.render(); } } else if (r.length) C.openResearchQueue(); };
  A.pbdone = v => { if (C.pbComplete(v)) { if (C.ui.isOpen()) C.ui.refresh(); C.render(); } };
  A.pbinstant = v => { const to = C.pbLv(v) + 1, tm = C.pbTime(v, to), g = C.coinsFor(tm);
    C.confirmCoins(g, () => { const car = C.car(), k = C.pbCost(v, to); if (C.acct().gold < g) return C.toast('Not enough Coins'); if (car.cp < k.cp || car.cash < k.cash) return C.toast('Not enough resources');
      car.cp -= k.cp; car.cash -= k.cash; C.acct().gold -= g; car.pb[v] = to; C.save(); C.ui.back(); C.powerFlash(PBPOW, `Research on ${C.pbName(v)} Lv ${to} completed.`); C.ui.refresh(); C.render(); }); };
  A.pbspeed = v => C.finishRunning('r', v, () => { C.pbComplete(v); C.ui.back(); C.ui.refresh(); C.render(); });
})(window.CFC);
