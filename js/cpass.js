// Club FC 1.06 (QA-85, QA-93; replaces the 1.05 Pass layout): the Career Progression Pass lives in the Store (Passes).
// 14 days. Daily Tasks (a fresh set each day, for that day only) give about 60% of the points; Target Tasks (for the
// whole Pass) about 40%. 10 milestones at 100..1,000 points. Free; Advanced $4.99; Premium +$9.99 (needs Advanced).
// Owning Advanced or Premium is a points boost (+20% / +40%). The Main tasks stay the guide (Missions and the task bar).
// Rewards follow the 215 s7.1 table: Kit Bags -> recovery kits and gear, Coach XP Crates -> Coaching manuals (Coach XP is Phase 4).
(function (C) {
  const A = C.ACTS, DAY = 864e5, OPEN_DAYS = 14;
  const n = (P, k) => P.n[k] || 0;
  // Daily pool [id, icon, text, counter, goal, points, go action, go value]: 5 a day, chosen by the day
  const DPOOL = [
    ['lgm', '⚽', 'Play a league match', 'lgm', 1, 10, 'prematch', ''], ['lgw', '🏆', 'Win a league match', 'lgw', 1, 12, 'prematch', ''],
    ['cpc', '🧪', 'Collect Coaching Points twice', 'cpc', 2, 10, 'dgo', 'lab'], ['cash', '💵', 'Collect Booster $ twice', 'cashc', 2, 10, 'dgo', 'booster'],
    ['upg', '🔨', 'Complete a building upgrade', 'upg', 1, 12, 'drawer', ''], ['spd', '⏩', 'Use a speed-up', 'spd', 1, 10, 'rqueue', ''],
    ['trn', '🏋️', 'Start a training plan', 'trn', 1, 12, 'tab', 'squad'], ['rst', '🔋', 'Rest or refresh a tired player', 'rst', 1, 10, 'rejuv', ''],
    ['off', '✉️', 'Make a recruiting offer', 'off', 1, 10, 'tab', 'recruit'], ['res', '📋', 'Finish a research', 'res', 1, 12, 'pbrec', '']];
  // Target Tasks [id, icon, text, check(P, car), points, go action, go value]: for the whole Pass (500 points)
  const TARGETS = [
    ['t_hq', '🏛', "Reach the next Coaches' Office level", (P, car) => car.b.hq > (P.base.hq || 0), 100, 'dgo', 'hq'],
    ['t_w5', '🏆', 'Win 5 league matches', P => n(P, 'lgw') >= 5, 100, 'prematch', ''],
    ['t_res3', '📋', 'Finish 3 research', P => n(P, 'res') >= 3, 80, 'pbrec', ''],
    ['t_sgn3', '✍️', 'Sign 3 recruits', (P, car) => ((car.rec && car.rec.signed) || 0) - (P.base.signed || 0) >= 3, 80, 'tab', 'recruit'],
    ['t_upg10', '🔨', 'Complete 10 building upgrades', P => n(P, 'upg') >= 10, 80, 'drawer', ''],
    ['t_top', '📊', 'Be in the top half after 7 league matches', P => n(P, 'top') >= 1, 60, 'tab', 'season']];
  const MS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const RW = {
    f: [{ sp1: 10 }, { gold: 30 }, { crb1: 1 }, { sp1: 10, sp5: 2 }, { gold: 30 }, { crp1: 1 }, { sp1: 11, sp15: 1 }, { kit: 2, gear: 2 }, { gold: 30, sp5: 2 }, { gold: 30, manual: 5 }],
    a: [{ gold: 50 }, { spb15: 2 }, { crb2: 1 }, { sp60: 1 }, { gold: 60 }, { crp2: 1 }, { spt15: 2 }, { rare: 1 }, { gold: 80 }, { gold: 80 }],
    p: [{ gold: 200 }, { sp180: 1 }, { crb3: 1 }, { kit: 6, gear: 4 }, { gold: 300 }, { crp3: 1 }, { spb180: 1 }, { manual: 20, crb2: 1 }, { gold: 300, spb180: 1 }, { gold: 300, crc4: 1 }]
  };
  C.CPP = { DPOOL, TARGETS, MS, RW, OPEN_DAYS };
  const sod = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const make = car => ({ v6: 1, start: C.now(), n: {}, dn: {}, dd: 0, done: {}, claimed: { f: [], a: [], p: [] }, adv: false, prem: false, base: { signed: (car.rec && car.rec.signed) || 0, hq: car.b.hq || 0 } });
  // a 1.05 Pass carries its points over (the old objectives' points), and now runs 14 days
  const LEGACY = { lgm: 60, lgw: 80, cpc: 60, res: 100, spd: 60, fin: 80, trn: 80, rst: 60, off: 80, sgn: 100, up3: 100, hq: 150, w3: 120, top: 120 };
  const up6 = P => { if (!P || P.v6) return P; let pts = 0; Object.keys(P.done || {}).forEach(k => { pts += LEGACY[k] || 0; }); P.done = pts ? { legacy: pts } : {}; P.dn = {}; P.dd = 0; P.v6 = 1; return P; };
  C.cppStart = car => { car = car || C.car(); if (!car || car.cpp) return car && car.cpp; car.cpp = make(car); if (C.fwMailUnclaimed) C.fwMailUnclaimed(car); C.save(); return car.cpp; };
  C.cpp = () => { const car = C.car(); if (!car) return null; if (!car.cpp && !car.pre) C.cppStart(car); return up6(car.cpp) || null; };
  C.cppDay = P => Math.max(0, Math.floor((sod(C.now()) - sod(P.start)) / DAY));
  C.cppOpen = () => { const P = C.cpp(); return !!(P && !P.closed); };
  C.cppMult = P => P.prem ? 1.4 : P.adv ? 1.2 : 1;
  C.cppPts = P => { P = P || C.cpp(); if (!P) return 0; return Math.round(Object.values(P.done).reduce((s, v) => s + (+v || 0), 0) * C.cppMult(P)); };
  // today's Daily Tasks: 5 from the pool, chosen by the day (the same for everyone on that day of the Pass)
  C.cppToday = P => { P = P || C.cpp(); const d = C.cppDay(P), r = C.rng((P.start & 0xffff) * 31 + d * 977 + 7), pool = DPOOL.slice(); const out = [];
    while (out.length < 5 && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); return out; };
  const dayRoll = P => { const d = C.cppDay(P); if (P.dd !== d) { P.dd = d; P.dn = {}; } return d; };
  C.cppCheck = () => { const car = C.car(), P = car && car.cpp; if (!P || P.closed) return 0; up6(P); const day = dayRoll(P); let k = 0;
    C.cppToday(P).forEach(t => { const key = 'd' + day + ':' + t[0]; if (!P.done[key] && (P.dn[t[3]] || 0) >= t[4]) { P.done[key] = t[5]; k++; } });
    TARGETS.forEach(t => { if (!P.done[t[0]] && t[3](P, car)) { P.done[t[0]] = t[4]; k++; } });
    if (day >= OPEN_DAYS) close(car);
    if (k) C.save(); return k; };
  C.cppCount = (k, v = 1) => { const car = C.car(), P = car && car.cpp; if (!P || P.closed) return; up6(P); dayRoll(P); P.n[k] = (P.n[k] || 0) + v; P.dn[k] = (P.dn[k] || 0) + v; C.cppCheck(); C.save(); };
  const owns = (P, tr) => tr === 'f' || (tr === 'a' ? P.adv : P.prem);
  C.cppCanClaim = (tr, i) => { const P = C.cpp(); if (!P || P.closed || P.claimed[tr].includes(i)) return false; return owns(P, tr) && C.cppPts(P) >= MS[i]; };
  C.cppClaim = (tr, i) => { if (!C.cppCanClaim(tr, i)) return null; const P = C.cpp(), r = RW[tr][i]; P.claimed[tr].push(i); C.giveReward(Object.assign({}, r)); C.save(); return r; };
  C.cppClaimAll = () => { const got = {}; for (let i = 0; i < MS.length; i++) for (const tr of ['f', 'a', 'p']) { const r = C.cppClaim(tr, i); if (r) for (const k in r) got[k] = (got[k] || 0) + r[k]; } return Object.keys(got).length ? got : null; };
  C.cppClaimable = () => { const P = C.cpp(); if (!P || P.closed) return 0; C.cppCheck(); let k = 0; for (let i = 0; i < MS.length; i++) for (const tr of ['f', 'a', 'p']) if (C.cppCanClaim(tr, i)) k++; return k; };
  C.cppNext = () => null;   // 1.06 (QA-85): the Pass no longer drives the task bar
  C.cppBuy = tr => { const P = C.cpp(); if (!P || P.closed) return 'closed'; if (tr === 'a') { if (P.adv) return 'owned'; P.adv = true; } else { if (!P.adv) return 'needa'; if (P.prem) return 'owned'; P.prem = true; }
    C.mail('purchases', '🧾', `Purchase: Career Progression Pass ${tr === 'a' ? 'Advanced ($4.99)' : 'Premium ($9.99)'}`, `Your points boost is now +${Math.round((C.cppMult(P) - 1) * 100)}%, and every milestone you've reached is ready to claim on this track.<br><small>Test store: nothing was charged.</small>`, null); C.save(); return true; };
  // when the Pass closes, every reward earned but not claimed is mailed
  function close(car) { const P = car.cpp; if (P.closed) return; const pts = C.cppPts(P), got = {};
    MS.forEach((m, i) => ['f', 'a', 'p'].forEach(tr => { if (pts >= m && owns(P, tr) && !P.claimed[tr].includes(i)) { P.claimed[tr].push(i); for (const k in RW[tr][i]) got[k] = (got[k] || 0) + RW[tr][i][k]; } }));
    P.closed = C.now(); if (Object.keys(got).length) C.mail('rewards', '🎓', 'Career Progression Pass: your rewards', 'The Pass has ended. Here is everything you earned and hadn\'t claimed.', got); C.save(); }

  // ---------- counters ----------
  const wrap = (name, f) => { const o = C[name]; if (o) C[name] = (...a) => f(o, ...a); };
  wrap('fwEvent', (o, k) => { o(k); if (k === 'speed') C.cppCount('spd'); });
  wrap('collect', (o, k, ...a) => { const r = o(k, ...a); if (r && C.PRODUCERS[k] === 'cp') C.cppCount('cpc'); if (r && C.PRODUCERS[k] === 'cash') C.cppCount('cashc'); return r; });
  wrap('pbComplete', (o, ...a) => { const r = o(...a); if (r) C.cppCount('res'); return r; });
  wrap('completeBuild', (o, k) => { const q = C.inQueue(k), sped = q && q.start && q.end < q.start + C.timeOf(q.key, q.to) * 1000 - 1000, r = o(k);
    if (r) { C.cppCount('upg'); if (sped) C.cppCount('fin'); } return r; });
  wrap('startPlan', (o, ...a) => { const r = o(...a); if (r === true) C.cppCount('trn'); return r; });
  wrap('treat', (o, pid, kind) => { const r = o(pid, kind); if (r === true && kind === 'kit') C.cppCount('rst'); return r; });
  wrap('teamSession', (o, ...a) => { const r = o(...a); if (r === true) C.cppCount('rst'); return r; });
  wrap('sendOffer', (o, ...a) => { const car = C.car(); if (car && !car.pre) C.cppCount('off'); return o(...a); });
  // league matches only (not friendlies, the play-off or the National Championship)
  wrap('applyResult', (o, m, f) => { const rep = o(m, f), S = C.sea(); if (!f.friendly && rep.md >= 1 && rep.md <= S.R) {
      const us = rep.my === 0 ? rep.hs : rep.as, them = rep.my === 0 ? rep.as : rep.hs; C.cppCount('lgm'); if (us > them) C.cppCount('lgw');
      if (rep.md >= 7 && C.myPos() <= Math.floor(C.table().length / 2)) C.cppCount('top'); }
    return rep; });

  // ---------- the Pass page (Store → Passes) ----------
  let ptab = 'rewards';
  const fmtD = t => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  C.openPass = t => { if (t) ptab = t; C.ui.open('Career Progression Pass', passHTML); };
  A.passopen = () => C.openPass();
  A.ptab = v => { ptab = v; C.ui.refresh(); };
  function passHTML() { const P = C.cpp(); if (!P) return '<p class="note">The Career Progression Pass starts when the season starts.</p>';
    C.cppCheck(); const pts = C.cppPts(P), day = C.cppDay(P), mult = C.cppMult(P), boost = Math.round((mult - 1) * 100);
    if (P.closed) return `<div class="card passhd2"><b>🎓 Career Progression Pass</b><small>Ended · ★ ${pts} points</small><p>Anything you earned and hadn't claimed was sent to your Inbox (Rewards).</p></div>`;
    const end = sod(P.start) + OPEN_DAYS * DAY, left = (end - C.now()) / 1000, today = C.cppToday(P), dkey = t => 'd' + day + ':' + t[0];
    const dDot = today.some(t => !P.done[dkey(t)] && (P.dn[t[3]] || 0) >= t[4]) ? 0 : 0, rDot = C.cppClaimable(), tLeft = TARGETS.filter(t => !P.done[t[0]]).length;
    const ptsTxt = b => mult > 1 ? `${b} ★ → <b>${Math.round(b * mult)} ★</b> <small>${P.prem ? 'Premium' : 'Advanced'} boost</small>` : `${b} ★`;
    const head = `<div class="card passhd2"><b>🎓 Career Progression Pass</b><small>${fmtD(P.start)} – ${fmtD(end - 1)} · ends in ${C.dur(Math.max(0, left))}</small>
      <div class="ppts">★ ${pts} points${boost ? ` <span class="pboost">⚡ ${P.prem ? 'Premium' : 'Advanced'} points boost +${boost}%</span>` : ''}</div>
      <div class="evpacks"><button class="btn ${P.adv ? 'sec2' : 'buyg'}" data-act="cppbuy" data-v="a" ${P.adv ? 'disabled' : ''}>${P.adv ? '✔ Advanced' : 'Unlock Advanced · $4.99<br><small>+20% points</small>'}</button><button class="btn ${P.prem ? 'sec2' : P.adv ? 'buyg' : 'sec2'}" data-act="cppbuy" data-v="p" ${P.prem ? 'disabled' : ''}>${P.prem ? '✔ Premium' : 'Unlock Premium · $9.99<br><small>+40% points</small>'}</button></div></div>
      <div class="bigtabs">${[['rewards', 'Rewards', rDot], ['daily', 'Daily Tasks', today.filter(t => !P.done[dkey(t)]).length ? 0 : 0], ['target', 'Target Tasks', 0]].map(([k, nm, d]) => `<button class="${ptab === k ? 'on' : ''}" data-act="ptab" data-v="${k}">${nm}${d ? `<i class="mdot">${d}</i>` : ''}</button>`).join('')}</div>`;
    const go = (a, v) => `<button class="btn sm2 pri" data-act="cppgo" data-v="${a}|${v}">Go</button>`;
    if (ptab === 'daily') return head + `<p class="note" style="margin-top:0">Today's tasks · resets in ${C.dur(Math.max(0, (sod(C.now()) + DAY - C.now()) / 1000))}. Unfinished tasks don't carry over.</p>
      ${today.map(t => { const have = Math.min(t[4], P.dn[t[3]] || 0), ok = !!P.done[dkey(t)]; return `<div class="fwt ptask ${ok ? 'ok' : ''}"><span>${ok ? '✔' : t[1]}</span><span class="ptt">${C.esc(t[2])}<small>${have}/${t[4]} · ${ptsTxt(t[5])}</small></span>${ok ? '' : go(t[6], t[7])}</div>`; }).join('')}`;
    if (ptab === 'target') return head + `<p class="note" style="margin-top:0">Bigger goals for the whole Pass (${tLeft} left).</p>
      ${TARGETS.map(t => { const ok = !!P.done[t[0]]; return `<div class="fwt ptask ${ok ? 'ok' : ''}"><span>${ok ? '✔' : t[1]}</span><span class="ptt">${C.esc(t[2])}<small>${ptsTxt(t[4])}</small></span>${ok ? '' : go(t[5], t[6])}</div>`; }).join('')}`;
    // Rewards: the ladder with a vertical progress bar from 0 (QA-93)
    const max = MS[MS.length - 1], rowH = 64, fillH = Math.max(0, Math.min(MS.length * rowH, (pts / 100) * rowH - rowH / 2));   // each node sits mid-row, so 196 lands just under the 200 node
    const cell = (tr, i) => { const got = P.claimed[tr].includes(i), can = C.cppCanClaim(tr, i), lock = !owns(P, tr);
      return `<button class="pcell ${tr === 'f' ? 'f' : 'p'} ${got ? 'got' : ''} ${can ? 'ready' : ''}" ${can ? `data-act="cppclaim" data-v="${tr}|${i}"` : 'disabled'}>${lock ? '<i class="plock">🔒</i>' : ''}${C.itemTiles(RW[tr][i])}${got ? '<i class="pgot">✔</i>' : ''}</button>`; };
    const rows = MS.map((m, i) => `<div class="prow3 lad ${pts >= m ? 'un' : ''}" style="height:${rowH}px"><b class="pday"><i class="pnode ${pts >= m ? 'on' : ''}"></i>${m}</b>${cell('f', i)}${cell('a', i)}${cell('p', i)}</div>`).join('');
    return head + `<div class="prow3 head"><b class="pday">★</b><span>Free</span><span>Advanced</span><span>Premium</span></div>
      <div class="pladder"><div class="pbar"><i style="height:${fillH}px"></i><em style="top:${Math.max(0, fillH - 10)}px">${pts}</em></div>${rows}</div>
      <button class="btn full buyg" data-act="cppall" style="margin-top:10px">Claim all</button>`; }
  A.cppgo = v => { const [a, val] = String(v).split('|'); C.ui.closeAll(); if (a === 'tab') { C.tab = val; return C.render(); } C.act(a, val); };
  C.cppGo = () => {};
  A.cppclaim = v => { const [tr, i] = v.split('|'), r = C.cppClaim(tr, +i); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  A.cppall = () => { const r = C.cppClaimAll(); C.toast(r ? '✔ ' + C.rwText(r) : 'Nothing to claim yet'); C.ui.refresh(); C.render(); };
  A.cppbuy = (v, el) => { const P = C.cpp(); if (!P) return; if (v === 'p' && !P.adv) return C.toast('Buy Advanced first');
    if (!(el && el.dataset.ok)) return C.confirm('Confirm purchase', `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store: nothing is charged.</div><div class="card buypop"><b>🎓 Career Progression Pass · ${v === 'a' ? 'Advanced' : 'Premium'}</b><small>Unlocks the ${v === 'a' ? 'Advanced' : 'Premium'} reward track (rewards you've already reached are ready at once) and a +${v === 'a' ? 20 : 40}% points boost.</small><div class="srow"><span>Price</span><b>${v === 'a' ? '$4.99' : '$9.99'}</b></div></div>`, 'Buy ' + (v === 'a' ? '$4.99' : '$9.99'), 'cppbuy', v);
    if (C.cppBuy(v) === true) { C.toast('✅ Test purchase complete'); C.ui.refresh(); C.render(); } };
  C.cppHTML = () => '';

  // the First Week stays retired once the Pass exists (its relevant tasks are in the Main tasks)
  const oFw = C.fwActive; C.fwActive = () => { const car = C.car(); if (car && car.cpp) return false; return oFw ? oFw() : false; };
  // red dots: the Store / Events button includes the Pass; Missions doesn't (the Pass isn't there any more)
  const oLo = C.loClaimable; C.loClaimable = () => (oLo ? oLo() : 0) + (C.car() ? C.cppClaimable() : 0);
  // the Pass starts with the season
  const oSs = A.startseasonok; if (oSs) A.startseasonok = (...a) => { const r = oSs(...a); const car = C.car(); if (car && !car.pre) C.cppStart(car); return r; };
})(window.CFC);

// 1.05 (SCOPE_1.05 s4, QA-52 to QA-54, FEEDBACK 229): guidance. The task bar steers to the next promotion gate; reminders after league matches.
(function (C) {
  const A = C.ACTS, B = k => C.BUILDINGS[k].name, ONPITCH = ['stadium', 'training', 'gym', 'med'];
  // the Coaches' Office level needed for promotion from this tier (none at T1)
  C.gateNeed = () => { const car = C.car(); return car.tier > 1 ? C.TIER_GATE[car.tier - 1] : 0; };
  // the next step on the path to the gate: the next building the Coaches' Office needs, or the Office itself
  C.gateStep = () => { const need = C.gateNeed(); if (!need || C.level('hq') >= need) return null;
    const hq = C.level('hq'), hqq = C.inQueue('hq'), to = hqq ? hqq.to + 1 : hq + 1; if (to > need) return { wait: 1 };
    for (const [b, l] of C.hqNeeds(to)) if (C.level(b) < l) { const q = C.inQueue(b); if (q) continue; const nx = C.level(b) + 1;
      return { k: b, text: `Upgrade the ${B(b)} to Lv ${nx} (needed for ${B('hq')} Lv ${to})`, ok: C.readyArrow(b) && C.freeSlot() }; }
    if (hqq || C.hqNeeds(to).some(([b, l]) => C.level(b) < l)) return { wait: 1 };
    return { k: 'hq', text: `${B('hq')} → Lv ${to}: ${to === need ? 'needed for promotion' : 'on the way to Lv ' + need + ' for promotion'}`, ok: C.readyArrow('hq') && C.freeSlot() }; };
  // once the gate is reached: the lowest useful building (on-pitch first), then research
  C.otherStep = () => { if (!C.freeSlot()) return null;
    const lv = k => C.level(k), can = k => C.BUILDINGS[k] && lv(k) > 0 && C.readyArrow(k) && (k === 'hq' || lv(k) < lv('hq'));
    const on = ONPITCH.filter(can).sort((a, b) => lv(a) - lv(b))[0], other = Object.keys(C.BUILDINGS).filter(k => !ONPITCH.includes(k) && can(k)).sort((a, b) => lv(a) - lv(b))[0], k = on || other;
    return k ? { k, text: `Upgrade the ${B(k)} to Lv ${lv(k) + 1}` } : null; };
  // 1.06 (QA-85, QA-78): the task bar follows the guide. In Pre-season: its next unfinished task. Afterwards: the next
  // Main task (claim it when done). With every Main task done: complete finished builds/research, then the promotion path, then
  // other buildings, then research.
  const oStrip = C.stripTask;
  C.stripTask = () => { const car = C.car(); if (!car) return null; const ks = Object.keys(C.BUILDINGS);
    if (car.pre && C.preNext) { const t = C.preNext(); if (t) return { text: t[2], go: () => C.act(t[4], t[5]) }; }
    const mt = C.MAIN.find(t => !C.mainDone(t[0]));
    if (mt) return mt[3](car) ? { claim: 1, text: `Claim: ${mt[2]}`, t: mt } : { text: mt[2], t: mt };
    const done = car.queue.find(q => C.buildReady(q.key)); if (done) return { text: `Complete the ${B(done.key)}`, go: () => C.goToBuilding(done.key) };
    const pd = (car.pbq || []).find(q => q.end <= C.now()); if (pd) return { text: `Complete the research: ${C.pbName(pd.key)}`, go: () => C.act('pbready') };
    const nb = ks.find(C.buildable); if (nb) return { text: `Build the ${B(nb)}`, go: () => C.goToBuilding(nb) };
    const g = C.gateStep(); if (g && g.k) return { text: g.text, go: () => C.goToBuilding(g.k) };
    const o = C.otherStep(); if (o && (!g || C.freeSlot())) return { text: o.text, go: () => C.goToBuilding(o.k) };
    const pr = C.pbRecommend && C.pbRecommend(); if (pr && C.pbAffordable(pr) && C.pbRunning() < C.pbSlots()) return { text: `Research ${C.pbName(pr)}`, go: () => C.act('pbrec') };
    const q = car.queue[0]; return q ? { text: `${B(q.key)} upgrading · ${C.dur(C.remaining(q))}`, go: () => C.goToBuilding(q.key) } : oStrip(); };

  // ---------- reminders after league matches (each at most once every 5 matches) ----------
  const G = () => { const car = C.car(); if (!car.guide || car.guide.season !== car.season) car.guide = { season: car.season, h0: C.level('hq'), pace: -99, poor: -99, loss: 0, pend: [] }; return car.guide; };
  C.guideAfter = (md, us, them) => { const car = C.car(), S = C.sea(), g = G(), R = S.R; g.loss = us < them ? g.loss + 1 : 0;
    const n = C.table().length, poor = g.loss >= 2 || (md >= 6 && C.myPos() > Math.floor(n / 2));
    if (poor && md - g.poor >= 5 && !g.pend.includes('poor')) { g.poor = md; g.pend.push('poor'); }
    const need = C.gateNeed(), hq = C.level('hq'), short = need - hq, span = Math.max(1, need - g.h0), progress = Math.max(0, (hq - g.h0) / span);
    if (need && short >= 2 && md / R - progress >= .25 && car.queue.length < C.openSlots() && md - g.pace >= 5 && !g.pend.includes('pace')) { g.pace = md; g.pend.push('pace'); }
    C.save(); };
  const row = (ic, t, sub, act, v) => `<button class="lrow" data-act="${act}" data-v="${v}"><span class="li">${ic}</span><span class="lt"><b>${t}</b><small>${sub}</small></span><span class="lr"><span class="btn sm2 pri">Go</span></span></button>`;
  // 1.05.03 (QA-96): guideShow tolerates a reminder state without its list
  C.guideShow = () => { const car = C.car(); if (!car || !car.guide || !(car.guide.pend || []).length || C.ui.isOpen()) return false; const k = car.guide.pend.shift(); C.save();
    const S = C.sea(), need = C.gateNeed(), hq = C.level('hq');
    if (k === 'pace') { const st = C.gateStep();
      C.ui.open('From the Director', () => `<div class="raytake" style="margin-top:0"><span>⏱</span><p><b>The season is moving faster than the campus</b>${S.md > S.R ? S.R : Math.min(S.md, S.R)} of ${S.R} league matches are played and your ${B('hq')} is Lv ${hq}. Promotion needs Lv ${need}, and a builder is free.</p></div>
        ${st && st.k ? row(C.BUILDINGS[st.k].icon, C.esc(st.text), 'The next step to the promotion gate', 'guidego', st.k) : row(C.BUILDINGS.hq.icon, `${B('hq')} Lv ${need}`, 'Needed for promotion', 'guidego', 'hq')}`, { popup: true }); return true; }
    C.ui.open('How to improve', () => `<div class="raytake" style="margin-top:0"><span>📈</span><p><b>Results aren't coming yet</b>These make the biggest difference on the pitch, and to your season.</p></div>
      ${need && hq < need ? row(C.BUILDINGS.hq.icon, `${B('hq')}: Lv ${hq} of ${need}`, 'Needed for promotion', 'guidego', 'hq') : ''}
      ${row(C.BUILDINGS.stadium.icon, B('stadium'), 'A bigger home edge', 'guidego', 'stadium')}
      ${row(C.BUILDINGS.training.icon, B('training'), 'Players improve faster', 'guidego', 'training')}
      ${row(C.BUILDINGS.gym.icon, B('gym'), 'Strength and fitness', 'guidego', 'gym')}
      ${row(C.BUILDINGS.med.icon, B('med'), 'Fewer and shorter injuries', 'guidego', 'med')}
      ${row('📋', 'Playbook research', 'Team-wide match bonuses', 'pbrec', '')}`, { popup: true }); return true; };
  A.guidego = k => { C.ui.closeAll(); C.goToBuilding(k); };
  const oAR = C.applyResult; C.applyResult = (m, f) => { const rep = oAR(m, f), S = C.sea(); if (!f.friendly && rep.md >= 1 && rep.md <= S.R) { const us = rep.my === 0 ? rep.hs : rep.as, them = rep.my === 0 ? rep.as : rep.hs; C.guideAfter(rep.md, us, them); } return rep; };
})(window.CFC);
