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
  // 1.06 (QA-92): research is one of the Program Power parts (screens.js C.powerParts), so it isn't added again here
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
    (document.getElementById('app') || document.body).appendChild(el); requestAnimationFrame(() => el.classList.add('on')); setTimeout(() => el.classList.remove('on'), 1600); setTimeout(() => el.remove(), 2000); };

  // ---------- 1.02 (FEEDBACK 159.2, 174-176): the full-screen Playbook ----------
  // One "Playbook" page header; the overview of branches; a tree per branch; the research slots sit in the standard Back bar.
  // The slot number (a yellow hexagon) is the same on branch tiles, tree nodes and the slots.
  const hn = i => `<span class="pbhn"><svg viewBox="0 0 30 27"><polygon points="8,1.5 22,1.5 28.5,13.5 22,25.5 8,25.5 1.5,13.5" fill="#fcd34d" stroke="#1e3a8a" stroke-width="2.4"/><polygon points="9,4.5 21,4.5 25.5,13.5 21,22.5 9,22.5 4.5,13.5" fill="none" stroke="#fef3c7" stroke-width="1"/></svg><b>${i + 1}</b></span>`;
  const tileSVG = '<svg viewBox="0 0 40 48"><path d="M20 2 L37 9.5 V34 Q37 42 20 46 Q3 42 3 34 V9.5 Z" fill="#a9b4cc" stroke="#e2e8f0" stroke-width="2.2"/><path d="M20 6 L33 12 V33 Q33 39 20 42 Q7 39 7 33 V12 Z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/></svg>';
  const hexSVG = fill => `<svg viewBox="0 0 84 94" preserveAspectRatio="none"><polygon points="42,3 81,25.5 81,68.5 42,91 3,68.5 3,25.5" fill="${fill}" stroke="#0f172a" stroke-width="3"/><polygon points="42,10 75,29.5 75,64.5 42,84 9,64.5 9,29.5" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/></svg>`;
  const ff = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 5l9 7-9 7zM12 5l9 7-9 7z" fill="#fff" stroke="#0f2a55" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  // the open slots, in order; the slot a research is in is its place in the queue
  const openSlots = () => C.PBSLOTS.filter(s => C.pbSlotOpen(s.id));
  const slotOf = key => pbq().findIndex(q => q.key === key);
  const nextLv = key => { const { n } = node(key); return `${Math.min(n[3], C.pbLv(key) + 1)}/${n[3]}`; };
  C.pbSlotsHTML = () => { const q = C.laneSet(pbq()), n = Math.max(2, openSlots().length, q.length, ...q.map(r => r.lane + 1));   // 1.03: research from a withdrawn slot still shows until it ends
    const tile = key => `<span class="pbtile">${tileSVG}${key ? `<span class="art">${node(key).B[1]}</span><span class="cnt">${nextLv(key)}</span>` : ''}</span>`;
    const out = []; for (let i = 0; i < n; i++) { const r = C.laneItem(q, i), tw = k => `<span class="pbtw">${tile(k)}${hn(i)}</span>`;
      if (i >= openSlots().length && !r) { out.push(`<button class="pbslot2" data-act="pbslot" data-v="prog">${tw(null)}<span class="msg lock">Locked until Performance Lab Lv 10</span></button>`); continue; }
      if (!r) { out.push(`<button class="pbslot2" data-act="pbrec">${tw(null)}<span class="msg">Idle</span></button>`); continue; }
      if (r.end <= C.now()) { out.push(`<div class="pbslot2">${tw(r.key)}<button class="cbtn" data-act="pbdone" data-v="${r.key}">Completed</button></div>`); continue; }
      const f = Math.max(0, Math.min(1, 1 - C.remaining(r) / ((r.end - r.start) / 1000)));
      out.push(`<div class="pbslot2" data-act="pbnode" data-v="${r.key}">${tw(r.key)}<span class="bar"><i style="width:calc(${Math.round(f * 100)}% - 4px)"></i><span data-until="${r.end}" data-trim="1">${C.dur(C.remaining(r)).replace(/^0(?=\d:)/, '')}</span></span><button class="ff" data-act="pbspeed2" data-v="${r.key}" aria-label="Speed up">${ff}</button></div>`); }
    return `<div class="pbslots">${out.join('')}</div>`; };

  // ---------- the overview ----------
  C.openPlaybook = () => C.ui.open('Playbook', () => { pbq();
    const rec = C.pbRecommend(), recB = rec ? rec.split('.')[0] : null;
    const pct = B => { const tot = B[3].reduce((s, n) => s + n[3], 0), got = B[3].reduce((s, n, t) => s + C.pbLv(B[0] + '.' + t), 0); return Math.round(got / tot * 100); };
    const cards = C.PB.map(B => { const p = pct(B), qi = pbq().findIndex(q => q.key.split('.')[0] === B[0]), off = !B[3].some((n, t) => C.pbUnlocked(B[0] + '.' + t) && C.pbLv(B[0] + '.' + t) < n[3]) && p < 100;
      return `<button class="pbcat2 ${off ? 'off' : ''}" data-act="pbtree" data-v="${B[0]}">${qi >= 0 ? hn(qi) : ''}${B[0] === recB ? '<s class="rib">RECOMMENDED</s>' : ''}<span class="ring" style="--p:${p}%"><span>${B[1]}</span></span><b>${p}%</b><small>${C.esc(B[2])}</small></button>`; }).join('');
    return `<div class="pbcats2">${cards}</div><p class="note">Research runs in the Performance Lab with Coaching Points. Bonuses are small and capped: tactics, players and fitness still decide matches.</p>`; }, { foot: C.pbSlotsHTML });

  // ---------- 2. the tree for one branch: nodes joined by lines, equally spaced, centred, from the top ----------
  let branch = 'att';
  C.openPBTree = b => { branch = b; C.ui.open('Playbook', treeHTML, { foot: C.pbSlotsHTML }); };
  function treeHTML() { const B = node(branch + '.0').B, H = 94, GAP = 52, y = t => 16 + t * (H + GAP);
    const tot = B[3].reduce((s, n) => s + n[3], 0), got = B[3].reduce((s, n, t) => s + C.pbLv(B[0] + '.' + t), 0);
    const links = B[3].slice(1).map((_, t) => `<i class="pblink ${C.pbUnlocked(branch + '.' + (t + 1)) ? 'on' : ''}" style="top:${y(t) + H - 6}px;height:${GAP + 12}px"></i>`).join('');
    const hex = (n, t) => { const key = branch + '.' + t, lv = C.pbLv(key), un = C.pbUnlocked(key), q = C.pbInQueue(key), si = slotOf(key);
      return `<button class="pbhex ${un ? '' : 'off'}" style="top:${y(t)}px" data-act="${q && q.end <= C.now() ? 'pbdone' : 'pbnode'}" data-v="${key}">${hexSVG(un ? '#2563eb' : '#475569')}${si >= 0 ? hn(si) : ''}<span class="e">${B[1]}</span><span class="lv">${lv}/${n[3]}</span></button>`; };
    return `<div class="pbtree2" style="--mh:${y(B[3].length - 1) + H + 70}px"><div class="bh"><span class="e">${B[1]}</span><b>${C.esc(B[2])}</b><span class="pc">${Math.round(got / tot * 100)}%</span></div><div class="nodes">${links}${B[3].map(hex).join('')}</div></div>`; }

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
      row('<i class="cpi"></i>', `<span class="${car.cp >= k.cp ? '' : 'short'}">${C.full(car.cp)}</span>/${C.full(k.cp)}`, car.cp >= k.cp, 'cp', k.cp) +
      (k.cash ? row('💵', `<span class="${car.cash >= k.cash ? '' : 'short'}">${C.full(car.cash)}</span>/${C.full(k.cash)}`, car.cash >= k.cash, 'cash', k.cash) : '');
    const ok = un && car.cp >= k.cp && car.cash >= k.cash, slot = pbq().length < C.pbSlots(), waitDone = !slot && pbq().some(z => z.end <= C.now());
    return head + `<h3 class="jh" style="text-align:center">Cost</h3><div class="tbl">${rows}</div>
      <div class="orig"><span>${ok && !slot ? (waitDone ? 'Complete a finished research first' : 'All research slots are busy') : ''}</span><span>Original Time: ${C.dur(tm)}</span></div>
      <div class="bt2"><button class="btn fin2" data-act="pbinstant" data-v="${key}" ${ok ? '' : 'disabled'}>Finish Now<br><em>${C.GEM} ${C.coinsFor(tm)}</em></button>
      <button class="btn pri" data-act="${slot ? 'pbgo' : 'pbqfull'}" data-v="${key}" ${ok && (slot || waitDone) ? '' : 'disabled'}>Research<br><em>⏱ ${C.dur(tm)}</em></button></div>`;
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
  // 1.03.01 (QA answer 2): when you're short, crates you hold can be opened here: Booster Crates (and the old $5K crate) for Booster $,
  // the Choice Crate for either. Replenish All opens the fewest crates, smallest first, to cover the gap.
  const CR = () => { const inv = C.meta().inv; return ['crate', 'crb1', 'crb2', 'crb3', 'crb4', 'crc2', 'crc4', 'crp1', 'crp2', 'crp3', 'crp4'].filter(k => inv[k] > 0); };
  const crateGives = (k, kind) => k === 'crate' ? (kind === 'cash' ? 5000 : 0) : /^crc/.test(k) ? C.crateAmount(k, kind) : /^crp/.test(k) ? (kind === 'cp' ? C.crateAmount(k, 'cp') : 0) : kind === 'cash' ? C.crateAmount(k, 'cash') : 0;
  const openOne = (k, kind) => k === 'crate' ? (C.openCrate() ? 5000 : 0) : C.openCrateX(k, kind);
  C.openMissing = (kind, need) => C.ui.open('Missing Resources', () => { const car = C.car(), inv = C.meta().inv, have = kind === 'cp' ? car.cp : car.cash, f = Math.min(1, have / need);
    const ks = CR().filter(k => crateGives(k, kind) > 0);
    const rows = ks.map(k => `<div class="mrw">${C.itemTiles({ [k]: 1 })}<div><b>${C.esc(C.XN[k][1])}</b><small>Owned: ${inv[k]} · gives ${kind === 'cp' ? C.full(crateGives(k, kind)) + ' CP' : C.money(crateGives(k, kind))}</small></div><button class="btn sm2 pri" data-act="mruse" data-v="${k}|${kind}">Use</button></div>`).join('');
    return `<div class="mrhd"><p>Need <b class="short">${C.full(Math.max(0, need - have))}</b> ${kind === 'cp' ? 'Coaching Points' : 'Booster $'} to proceed.</p><div class="bq-bar big"><i style="width:${Math.round(f * 100)}%"></i><span>${C.full(have)} / ${C.full(need)}</span></div></div>
      ${rows || `<p class="note">${kind === 'cp' ? 'Coaching Points come from the Performance Lab (collect them on campus), matches and Missions.' : 'No Booster Crates in your Inventory. Booster $ come from the Clubhouse, home matches and Missions.'}</p>`}
      ${rows ? `<button class="btn full pri" data-act="mrall" data-v="${kind}|${need}" style="background:#16a34a">Replenish All</button>` : `<button class="btn full sec2" data-act="${kind === 'cp' ? 'bgo' : 'storeat'}" data-v="${kind === 'cp' ? 'lab' : 'items'}">${kind === 'cp' ? 'Go to the Performance Lab' : 'Store'}</button>`}`; }, { popup: true });
  A.pbobtain = v => { const [k, n] = v.split('|'); C.openMissing(k, +n); };
  A.mruse = v => { const [k, kind] = String(v || 'crate|cash').split('|'), got = openOne(k, kind); if (got) { congrats(`+${kind === 'cp' ? C.full(got) + ' Coaching Points' : C.money(got)}`); C.ui.refresh(); } };
  const plan = (kind, short) => { const inv = C.meta().inv, ks = CR().filter(k => crateGives(k, kind) > 0).sort((a, b) => crateGives(a, kind) - crateGives(b, kind)), use = {}; let got = 0;
    for (const k of ks) for (let i = 0; i < inv[k] && got < short; i++) { use[k] = (use[k] || 0) + 1; got += crateGives(k, kind); }
    return { use, got }; };
  A.mrall = v => { const [kind, n] = v.split('|'), car = C.car(), short = Math.max(0, +n - (kind === 'cp' ? car.cp : car.cash)), P = plan(kind, short);
    if (!Object.keys(P.use).length) return; C.ui.open('Use Items', () => `<div class="useit">${C.itemTiles(P.use)}</div><p class="note" style="text-align:center"><b style="color:var(--fit5)">+${C.full(P.got)}</b> / ${C.full(short)} needed</p>
      <div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Cancel</button><button class="btn pri" data-act="mrok" data-v="${kind}|${n}">Confirm</button></div>`, { popup: true }); };
  A.mrok = v => { const [kind, n] = v.split('|'), car = C.car(), P = plan(kind, Math.max(0, +n - (kind === 'cp' ? car.cp : car.cash))); let t = 0;
    for (const k in P.use) for (let i = 0; i < P.use[k]; i++) t += openOne(k, kind); C.ui.back(); congrats(`+${C.full(t)} ${kind === 'cp' ? 'Coaching Points' : 'Booster $'}`); C.ui.refresh(); };
  function congrats(t) { const el = document.createElement('div'); el.className = 'congr'; el.innerHTML = `<div class="lu-rib">CONGRATULATIONS!</div><div class="cg-t">${C.esc(t)}</div>`; (document.getElementById('app') || document.body).appendChild(el); setTimeout(() => el.remove(), 1400); }

  // ---------- actions ----------
  A.pbtree = v => C.openPBTree(v);
  A.pbspeed2 = v => C.finishRunning('r', v, () => { C.ui.refresh(); C.render(); });   // from the slot bar: the slot then shows Completed
  { const oB = A.bpop; A.bpop = v => v === 'playbook' ? C.openPlaybook() : oB(v); }   // 1.02 (FEEDBACK 159.2): a page, not a popup
  A.pbrec = () => { const r = C.pbRecommend(); if (!r) return C.toast('Everything open is being researched'); C.openPBTree(r.split('.')[0]); C.openPBNode(r); };
  // 1.01 (FEEDBACK 140): the research badge on the Performance Lab / Next Step: one finished -> complete it; several -> the queue
  A.pbready = () => { const r = (C.car().pbq || []).filter(q => q.end <= C.now()); if (r.length === 1) { if (C.pbComplete(r[0].key)) { C.ui.closeAll(); C.render(); } } else if (r.length) C.openResearchQueue(); };
  // 1.02 (FEEDBACK 159.4): the slots are full and research is waiting: show it to Complete, then return to the tree to choose again
  A.pbqfull = () => C.ui.open('Research queue full', () => { const q = pbq();
    return `<p class="note" style="margin-top:0">Your research slots are full. Complete the finished research to free a slot, then choose what to research next.</p>${q.map((z, i) => { const done = z.end <= C.now(), { B, n } = node(z.key);
      return `<div class="pbqrow"><span class="pbtw sm"><span class="pbtile">${tileSVG}<span class="art">${B[1]}</span></span>${hn(i)}</span><b>${C.esc(n[0])} · Lv ${C.pbLv(z.key) + 1}<small>${done ? 'Finished' : C.dur(C.remaining(z)) + ' left'}</small></b>${done ? `<button class="cta2 blue" data-act="pbqdone" data-v="${z.key}">Completed</button>` : `<button class="cta2 gold" data-act="pbspeed" data-v="${z.key}">Speed Up<em>${finishLabel('r', z.key)}</em></button>`}</div>`; }).join('')}`; }, { popup: true });
  A.pbqdone = v => { if (!C.pbComplete(v)) return; C.ui.back(); if (C.ui.isOpen()) C.ui.back(); C.ui.refresh(); C.render(); };
  A.pbdone = v => { if (C.pbComplete(v)) { if (C.ui.isOpen()) C.ui.refresh(); C.render(); } };
  A.pbinstant = v => { const to = C.pbLv(v) + 1, tm = C.pbTime(v, to), g = C.coinsFor(tm);
    C.confirmCoins(g, () => { const car = C.car(), k = C.pbCost(v, to); if (C.acct().gold < g) return C.toast('Not enough Coins'); if (car.cp < k.cp || car.cash < k.cash) return C.toast('Not enough resources');
      car.cp -= k.cp; car.cash -= k.cash; C.acct().gold -= g; car.pb[v] = to; C.save(); C.ui.back(); C.powerFlash(PBPOW, `Research on ${C.pbName(v)} Lv ${to} completed.`); C.ui.refresh(); C.render(); }); };
  A.pbspeed = v => C.finishRunning('r', v, () => { C.pbComplete(v); C.ui.back(); C.ui.refresh(); C.render(); });
})(window.CFC);
