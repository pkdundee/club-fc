// Club FC 1.05 (SCOPE_1.05 s3, FEEDBACK 229): the Career Progression Pass. It replaces the Coach's First Week and, after
// Pre-season, the Main tasks. 7 days of objectives (a learning sequence), 10 milestones at 100..1,000 points, 1,250 points to earn.
// Three tracks: Free; Advanced $4.99; Premium +$9.99 (needs Advanced). Owning Advanced or Premium earns points faster (x1.2 / x1.4).
// Rewards follow the 215 s7.1 table: Kit Bags -> recovery kits and gear, Coach XP Crates -> Coaching manuals (Coach XP is Phase 4).
(function (C) {
  const A = C.ACTS, DAY = 864e5, OPEN_DAYS = 10;
  // [id, icon, text, points, check(cpp, car), go action, go value]
  const n = (P, k) => P.n[k] || 0;
  const DAYS = [
    ['Matchday', [['lgm', '⚽', 'Play a league match', 60, P => n(P, 'lgm') >= 1, 'prematch', ''], ['lgw', '🏆', 'Win a league match', 80, P => n(P, 'lgw') >= 1, 'prematch', '']]],
    ['Coaching Points', [['cpc', '🧪', 'Collect Coaching Points twice', 60, P => n(P, 'cpc') >= 2, 'dgo', 'lab'], ['res', '📋', 'Finish a research', 100, P => n(P, 'res') >= 1, 'pbrec', '']]],
    ['Speed-ups', [['spd', '⏩', 'Use a speed-up', 60, P => n(P, 'spd') >= 1, 'rqueue', ''], ['fin', '✨', 'Finish a building with Finish Now or items', 80, P => n(P, 'fin') >= 1, 'rqueue', '']]],
    ['Players', [['trn', '🏋️', 'Start a training plan', 80, P => n(P, 'trn') >= 1, 'tab', 'squad'], ['rst', '🔋', 'Rest or refresh a tired player', 60, P => n(P, 'rst') >= 1, 'rejuv', '']]],
    ['Recruiting', [['off', '✉️', 'Make an offer in season', 80, P => n(P, 'off') >= 1, 'tab', 'recruit'], ['sgn', '✍️', 'Sign a recruit', 100, (P, car) => ((car.rec && car.rec.signed) || 0) > (P.base.signed || 0), 'tab', 'recruit']]],
    ['Campus', [['up3', '🔨', 'Upgrade 3 buildings', 100, P => n(P, 'upg') >= 3, 'drawer', ''], ['hq', '🏛', 'Reach the next Coaches\' Office level', 150, (P, car) => car.b.hq > (P.base.hq || 0), 'dgo', 'hq']]],
    ['Season', [['w3', '🏆', 'Win 3 league matches', 120, P => n(P, 'lgw') >= 3, 'prematch', ''], ['top', '📊', 'Finish in the top half after 7 matches', 120, P => n(P, 'top') >= 1, 'tab', 'season']]]
  ];
  const OBJ = [].concat(...DAYS.map(([, l], d) => l.map(o => o.concat([d]))));   // o[7] = day index
  const MS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const RW = {
    f: [{ sp1: 10 }, { gold: 30 }, { crb1: 1 }, { sp1: 10, sp5: 2 }, { gold: 30 }, { crp1: 1 }, { sp1: 11, sp15: 1 }, { kit: 2, gear: 2 }, { gold: 30, sp5: 2 }, { gold: 30, manual: 5 }],
    a: [{ gold: 50 }, { spb15: 2 }, { crb2: 1 }, { sp60: 1 }, { gold: 60 }, { crp2: 1 }, { spt15: 2 }, { rare: 1 }, { gold: 80 }, { gold: 80 }],
    p: [{ gold: 200 }, { sp180: 1 }, { crb3: 1 }, { kit: 6, gear: 4 }, { gold: 300 }, { crp3: 1 }, { spb180: 1 }, { manual: 20, crb2: 1 }, { gold: 300, spb180: 1 }, { gold: 300, crc4: 1 }]
  };
  C.CPP = { DAYS, OBJ, MS, RW };
  const sod = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  // the Pass, created at Start Season (new careers) or at once for a career already in its season
  const make = car => ({ start: C.now(), n: {}, done: {}, claimed: { f: [], a: [], p: [] }, adv: false, prem: false, base: { signed: (car.rec && car.rec.signed) || 0, hq: car.b.hq || 0 } });
  C.cppStart = car => { car = car || C.car(); if (!car || car.cpp) return car && car.cpp; car.cpp = make(car); migrate(car); C.save(); return car.cpp; };
  C.cpp = () => { const car = C.car(); if (!car) return null; if (!car.cpp && !car.pre) C.cppStart(car); return car.cpp || null; };
  C.cppDay = P => Math.max(0, Math.floor((sod(C.now()) - sod(P.start)) / DAY));
  C.cppOpen = () => { const P = C.cpp(); return !!(P && !P.closed); };
  C.cppMult = P => P.prem ? 1.4 : P.adv ? 1.2 : 1;
  C.cppPts = P => { P = P || C.cpp(); if (!P) return 0; return Math.round(OBJ.filter(o => P.done[o[0]]).reduce((s, o) => s + o[3], 0) * C.cppMult(P)); };
  // objectives open day by day; an opened objective that has been met is latched (counters run from the Pass's start)
  C.cppCheck = () => { const car = C.car(), P = car && car.cpp; if (!P || P.closed) return 0; const day = C.cppDay(P); let k = 0;
    OBJ.forEach(o => { if (!P.done[o[0]] && o[7] <= day && o[4](P, car)) { P.done[o[0]] = 1; k++; } });
    if (day >= OPEN_DAYS) close(car);
    if (k) C.save(); return k; };
  C.cppCount = (k, v = 1) => { const car = C.car(), P = car && car.cpp; if (!P || P.closed) return; P.n[k] = (P.n[k] || 0) + v; C.cppCheck(); C.save(); };
  const owns = (P, tr) => tr === 'f' || (tr === 'a' ? P.adv : P.prem);
  C.cppCanClaim = (tr, i) => { const P = C.cpp(); if (!P || P.closed || P.claimed[tr].includes(i)) return false; return owns(P, tr) && C.cppPts(P) >= MS[i]; };
  C.cppClaim = (tr, i) => { if (!C.cppCanClaim(tr, i)) return null; const P = C.cpp(), r = RW[tr][i]; P.claimed[tr].push(i); C.giveReward(Object.assign({}, r)); C.save(); return r; };
  C.cppClaimAll = () => { const got = {}; for (let i = 0; i < MS.length; i++) for (const tr of ['f', 'a', 'p']) { const r = C.cppClaim(tr, i); if (r) for (const k in r) got[k] = (got[k] || 0) + r[k]; } return Object.keys(got).length ? got : null; };
  C.cppClaimable = () => { const P = C.cpp(); if (!P || P.closed) return 0; C.cppCheck(); let k = 0; for (let i = 0; i < MS.length; i++) for (const tr of ['f', 'a', 'p']) if (C.cppCanClaim(tr, i)) k++; return k; };
  C.cppNext = () => { const P = C.cpp(); if (!P || P.closed) return null; const day = C.cppDay(P); return OBJ.find(o => !P.done[o[0]] && o[7] <= day) || null; };
  C.cppBuy = tr => { const P = C.cpp(); if (!P || P.closed) return 'closed'; if (tr === 'a') { if (P.adv) return 'owned'; P.adv = true; } else { if (!P.adv) return 'needa'; if (P.prem) return 'owned'; P.prem = true; }
    C.mail('purchases', '🧾', `Purchase: Career Progression Pass ${tr === 'a' ? 'Advanced ($4.99)' : 'Premium ($9.99)'}`, `Points now earn ×${C.cppMult(P)}, and every milestone you've reached is ready to claim on this track.<br><small>Test store: nothing was charged.</small>`, null); C.save(); return true; };
  // when the Pass closes, every reward earned but not claimed is mailed
  function close(car) { const P = car.cpp; if (P.closed) return; const pts = C.cppPts(P), got = {};
    MS.forEach((m, i) => ['f', 'a', 'p'].forEach(tr => { if (pts >= m && owns(P, tr) && !P.claimed[tr].includes(i)) { P.claimed[tr].push(i); for (const k in RW[tr][i]) got[k] = (got[k] || 0) + RW[tr][i][k]; } }));
    P.closed = C.now(); if (Object.keys(got).length) C.mail('director', '🎓', 'Career Progression Pass: your rewards', 'The Pass has ended. Here is everything you earned and hadn\'t claimed.', got); C.save(); }
  // existing careers: First Week days completed but not claimed, and Main tasks done but not claimed, are mailed
  function migrate(car) {
    if (C.fwMailUnclaimed) C.fwMailUnclaimed(car);
    if (C.MAIN && car.meta) { const M = car.meta, got = {}; C.MAIN.forEach(t => { if (!M.main.includes(t[0]) && t[3](car)) { M.main.push(t[0]); for (const k in t[4]) got[k] = (got[k] || 0) + t[4][k]; } });
      if (Object.keys(got).length) C.mail('director', '📋', 'Main tasks: your rewards', 'The Career Progression Pass replaces the Main tasks. Here are the rewards for the ones you had finished.', got); } }

  // ---------- counters ----------
  const wrap = (name, f) => { const o = C[name]; if (o) C[name] = (...a) => f(o, ...a); };
  wrap('fwEvent', (o, k) => { o(k); if (k === 'speed') C.cppCount('spd'); });
  wrap('collect', (o, k, ...a) => { const r = o(k, ...a); if (r && C.PRODUCERS[k] === 'cp') C.cppCount('cpc'); return r; });
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

  // ---------- the Progression tab (Missions) ----------
  C.cppHTML = () => { const P = C.cpp(); if (!P) return '<p class="note">The Career Progression Pass starts when the season starts.</p>';
    C.cppCheck(); const pts = C.cppPts(P), day = C.cppDay(P), mult = C.cppMult(P);
    if (P.closed) return `<div class="card passhd2"><b>🎓 Career Progression Pass</b><small>Ended · ${pts} points</small><p>Anything you earned and hadn't claimed was sent to your Inbox.</p></div>`;
    const left = (sod(P.start) + OPEN_DAYS * DAY - C.now()) / 1000;
    const cell = (tr, i) => { const got = P.claimed[tr].includes(i), can = C.cppCanClaim(tr, i), lock = !owns(P, tr);
      return `<button class="pcell ${tr === 'f' ? 'f' : 'p'} ${got ? 'got' : ''} ${can ? 'ready' : ''}" ${can ? `data-act="cppclaim" data-v="${tr}|${i}"` : 'disabled'}>${lock ? '<i class="plock">🔒</i>' : ''}${C.itemTiles(RW[tr][i])}${got ? '<i class="pgot">✔</i>' : ''}</button>`; };
    const rows = MS.map((m, i) => `<div class="prow3 ${pts >= m ? 'un' : ''}"><b class="pday">${m}</b>${cell('f', i)}${cell('a', i)}${cell('p', i)}</div>`).join('');
    const objs = DAYS.map(([title, list], d) => { const lock = d > day;
      return `<div class="fwday ${lock ? 'locked' : ''}"><div class="fwh"><b>Day ${d + 1} · ${title}</b><small>${lock ? '🔒 Opens on day ' + (d + 1) : list.map(o => P.done[o[0]] ? '✔' : '○').join(' ')}</small></div>
        ${lock ? '' : list.map(o => `<div class="fwt ${P.done[o[0]] ? 'ok' : ''}"><span>${P.done[o[0]] ? '✔' : '○'}</span>${o[1]} ${C.esc(o[2])} <small class="mutey">&nbsp;+${Math.round(o[3] * mult)}</small>${P.done[o[0]] ? '' : `<button class="btn sm2 pri" style="margin-left:auto" data-act="cppgo" data-v="${o[0]}">Go</button>`}</div>`).join('')}</div>`; }).join('');
    const max = MS[MS.length - 1];
    return `<div class="card passhd2"><b>🎓 Career Progression Pass</b><small>Day ${Math.min(day + 1, 7)} of 7 · ends in ${C.dur(Math.max(0, left))} · ★ ${pts} points${mult > 1 ? ' · ×' + mult : ''}</small>
        <p>Learn the game one day at a time. Each objective earns points; each 100 points opens a reward. Advanced and Premium earn points faster (×1.2, ×1.4).</p>
        <div class="evpacks"><button class="btn ${P.adv ? 'sec2' : 'gold'}" data-act="cppbuy" data-v="a" ${P.adv ? 'disabled' : ''}>${P.adv ? '✔ Advanced' : 'Advanced · $4.99'}</button><button class="btn ${P.prem ? 'sec2' : P.adv ? 'gold' : 'sec2'}" data-act="cppbuy" data-v="p" ${P.prem ? 'disabled' : ''}>${P.prem ? '✔ Premium' : 'Premium · $9.99'}</button></div></div>
      <div class="pline" style="margin:4px 0 10px"><div class="pfill" style="width:${Math.min(100, pts / max * 100)}%"></div></div>
      <h3 class="jh" style="margin-top:4px">Objectives</h3>${objs}
      <h3 class="jh">Rewards</h3><div class="prow3 head"><b class="pday">★</b><span>Free</span><span>Advanced</span><span>Premium</span></div>${rows}
      <button class="btn full pri" data-act="cppall" style="margin-top:10px">Claim all</button>`; };
  const goObj = id => { const o = OBJ.find(x => x[0] === id); if (!o) return; C.ui.closeAll(); if (o[5] === 'tab') { C.tab = o[6]; return C.render(); } C.act(o[5], o[6]); };
  C.cppGo = goObj;
  A.cppgo = goObj;
  A.cppclaim = v => { const [tr, i] = v.split('|'), r = C.cppClaim(tr, +i); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  A.cppall = () => { const r = C.cppClaimAll(); C.toast(r ? '✔ ' + C.rwText(r) : 'Nothing to claim yet'); C.ui.refresh(); C.render(); };
  A.cppbuy = (v, el) => { const P = C.cpp(); if (!P) return; if (v === 'p' && !P.adv) return C.toast('Buy Advanced first');
    if (!(el && el.dataset.ok)) return C.confirm('Confirm purchase', `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store: nothing is charged.</div><p class="note">Career Progression Pass · ${v === 'a' ? 'Advanced · $4.99' : 'Premium · $9.99'}: opens this track and earns points ×${v === 'a' ? '1.2' : '1.4'}.</p>`, 'Buy ' + (v === 'a' ? '$4.99' : '$9.99'), 'cppbuy', v);
    if (C.cppBuy(v) === true) { C.toast('✅ Test purchase complete'); C.ui.refresh(); C.render(); } };

  // the Pass replaces the First Week
  const oFw = C.fwActive; C.fwActive = () => { const car = C.car(); if (car && car.cpp) return false; return oFw ? oFw() : false; };
  // red dots on Missions include the Pass
  const oMs = C.msClaimable; C.msClaimable = () => (oMs ? oMs() : 0) + (C.car() ? C.cppClaimable() : 0);
  const oLo = C.loClaimable; C.loClaimable = () => (oLo ? oLo() : 0) + (C.car() ? C.cppClaimable() : 0);
  // after Pre-season the Main tasks are gone (their claimables no longer count)
  const oMr = C.mainReady; C.mainReady = () => { const car = C.car(); if (car && car.cpp) return 0; return oMr(); };
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
  const oStrip = C.stripTask;
  C.stripTask = () => { const car = C.car(); if (!car || !C.cpp || !C.cpp()) return oStrip();   // the first Pre-season (no Pass yet) keeps the Main tasks
    const ks = Object.keys(C.BUILDINGS);
    // 1. a reward to claim (the Pass, Daily tasks), or a finished build or research to complete
    const pc = C.cppClaimable(); if (pc) return { claim: 1, text: `Claim: Progression reward${pc > 1 ? 's (' + pc + ')' : ''}`, go: () => { const strip = C.$('.taskstrip'), from = strip ? strip.getBoundingClientRect() : null, r = C.cppClaimAll(); if (r) { C.render(); C.flyRewards(r, from); } } };
    const L = C.daily(), di = L.findIndex(t => !t.claimed && t.n >= t.goal);
    if (di >= 0) { const d = L[di]; return { claim: 1, text: `Claim: ${d.id === 'login' ? 'Login reward' : d.def[2]}`, daily: di }; }
    const done = car.queue.find(q => C.buildReady(q.key)); if (done) return { text: `Complete the ${B(done.key)}`, go: () => C.goToBuilding(done.key) };
    const pd = (car.pbq || []).find(q => q.end <= C.now()); if (pd) return { text: `Complete the research: ${C.pbName(pd.key)}`, go: () => C.act('pbready') };
    const nb = ks.find(C.buildable); if (nb) return { text: `Build the ${B(nb)}`, go: () => C.goToBuilding(nb) };
    // 2. below the gate: the next building on the path to it (shown even when it can't be afforded yet)
    const g = C.gateStep(); if (g && g.k) return { text: g.text, go: () => C.goToBuilding(g.k) };
    // 3. gate reached (or the path is all under way): other buildings, then research
    const o = C.otherStep(); if (o && (!g || C.freeSlot())) return { text: o.text, go: () => C.goToBuilding(o.k) };
    const pr = C.pbRecommend && C.pbRecommend(); if (pr && C.pbAffordable(pr) && C.pbRunning() < C.pbSlots()) return { text: `Research ${C.pbName(pr)}`, go: () => C.act('pbrec') };
    // 4. the Pass objective
    const ob = C.cppNext(); if (ob) return { text: `Pass: ${ob[2]}`, go: () => C.cppGo(ob[0]) };
    const q = car.queue[0]; return q ? { text: `${B(q.key)} upgrading · ${C.dur(C.remaining(q))}`, go: () => C.goToBuilding(q.key) } : null; };

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
