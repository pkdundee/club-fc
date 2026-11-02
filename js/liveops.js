// Club FC: live-ops and the test store (Phase 8, Q13, Q21e). A 28-day login calendar, 3 daily tasks and a weekly chest,
// a 30-day Season Pass, rotating weekly events, rewarded ads, Coach's Club perks, packs and cosmetics.
// Guardrail: money buys time and convenience, never results or growth past potential.
(function (C) {
  const D = 864e5;
  const dayKey = () => C.todayKey();
  const weekKey = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
  const weekNo = () => Math.floor((new Date(weekKey()).getTime() / D + 3) / 7);
  const lo = () => { const a = C.acct(); if (!a.lo) a.lo = { cal: { claimed: 0, last: '' }, day: '', tasks: [], week: '', weekDone: 0, chest: false, pass: { start: C.now(), xp: 0, prem: false, f: [], p: [] }, vipDay: '', cos: [], kit: '' }; return a.lo; };
  C.lo = lo;

  // ---------- rewards: Coins are account-wide; everything else goes to the career you're playing ----------
  const NAMES = { gold: ['<i class="coin"></i>', 'Coins'], cash: ['💵', 'Booster $'], cp: ['<i class="cpi"></i>', 'Coaching Points'], manual: ['📗', 'Coaching manuals'], credits: ['🎫', 'Clinic Credits'], kit: ['🧴', 'Recovery kits'], books: ['📕', 'Trait Books'], tokens: ['🎟', 'Number Changes'], rare: ['🎁', 'Rare recruit'], coach: ['🧑‍🏫', 'Rare coach'] };
  C.rwText = r => Object.keys(r).map(k => `${NAMES[k][0]} ${k === 'cash' ? C.short(r[k]) : r[k] > 1 || !['rare', 'coach'].includes(k) ? r[k] : ''}`.trim()).join(' · ');
  C.giveReward = r => { const car = C.car(), S = car && C.staffState();
    for (const k in r) { const v = r[k];
      if (k === 'gold') C.acct().gold += v; else if (!car) continue;
      else if (k === 'cash') car.cash += v; else if (k === 'cp') car.cp += v; else if (k === 'tokens') car.tokens = (car.tokens || 0) + v;
      else if (['manual', 'credits', 'books'].includes(k)) S.items[k] += v;
      else if (k === 'rare') { car.items = car.items || {}; car.items.rareRecruit = (car.items.rareRecruit || 0) + v; }
      else if (k === 'kit') { car.items = car.items || {}; car.items.kit = (car.items.kit || 0) + v; }
      else if (k === 'coach') C.freeCoach(2); }
    C.save(); };

  // ---------- 28-day login calendar ----------
  const CAL = Array.from({ length: 28 }, (_, i) => { const d = i + 1;
    if (d === 28) return { coach: 1, gold: 200 }; if (d === 14) return { rare: 1, gold: 100 }; if (d % 7 === 0) return { gold: 120, books: 1 };
    return [{ gold: 30 }, { cash: 3000 }, { manual: 2 }, { cp: 40 }, { credits: 10 }, { tokens: 1 }][i % 6]; });
  C.CAL = CAL;
  C.calCanClaim = () => lo().cal.last !== dayKey();
  C.calClaim = () => { const L = lo(); if (!C.calCanClaim()) return null; const r = CAL[L.cal.claimed % 28]; L.cal.claimed++; L.cal.last = dayKey(); C.giveReward(r); passXP(50); return r; };

  // ---------- daily tasks + weekly chest ----------
  const TASKS = [['match', '⚽', 'Play a match', 1], ['win', '🏆', 'Win a match', 1], ['collect', '💵', 'Collect income 3 times', 3], ['upgrade', '🔨', 'Start an upgrade', 1], ['train', '🏋️', 'Start a training plan', 1],
    ['research', '📋', 'Start Playbook research', 1], ['offer', '✉️', 'Make a recruiting offer', 1], ['ad', '▶', 'Watch a rewarded ad', 1], ['speed', '⏩', 'Use a speed-up', 1]];
  function rollDay() { const L = lo(); if (L.day === dayKey()) return; L.day = dayKey(); const r = C.rng(new Date().getDate() * 131 + new Date().getMonth()); const pool = TASKS.slice();
    L.tasks = [0, 1, 2].map(() => { const t = pool.splice(Math.floor(r() * pool.length), 1)[0]; return { id: t[0], n: 0, goal: t[3], claimed: false }; });
    if (L.week !== weekKey()) { L.week = weekKey(); L.weekDone = 0; L.chest = false; } }
  C.tasks = () => { rollDay(); return lo().tasks.map(t => Object.assign({}, t, { def: TASKS.find(x => x[0] === t.id) })); };
  C.loEvent = (id, n = 1) => { if (!C.acct()) return; rollDay(); lo().tasks.forEach(t => { if (t.id === id) t.n = Math.min(t.goal, t.n + n); }); C.save(); };
  C.taskClaim = i => { const L = lo(), t = L.tasks[i]; if (!t || t.claimed || t.n < t.goal) return null; t.claimed = true; L.weekDone++; const r = { gold: 20, cp: 20 }; C.giveReward(r); passXP(100); return r; };
  C.CHEST_GOAL = 15; C.CHEST = { gold: 250, manual: 5, credits: 25, books: 2 };
  C.chestClaim = () => { const L = lo(); if (L.chest || L.weekDone < C.CHEST_GOAL) return null; L.chest = true; C.giveReward(C.CHEST); return C.CHEST; };

  // ---------- Season Pass (real 30-day clock) ----------
  const PASS_TIERS = 30, PASS_XP = 300;
  const FREE = i => [{ gold: 20 }, { cash: 4000 }, { manual: 1 }, { cp: 40 }, { credits: 8 }][i % 5], PREM = i => (i + 1) % 10 === 0 ? { coach: 1, gold: 150 } : (i + 1) % 5 === 0 ? { books: 2, gold: 60 } : [{ gold: 40 }, { manual: 2 }, { credits: 15 }, { cash: 8000 }][i % 4];
  C.PASS = { tiers: PASS_TIERS, free: FREE, prem: PREM };
  function passCheck() { const P = lo().pass; if (C.now() - P.start > 30 * D) { Object.assign(P, { start: C.now(), xp: 0, prem: false, f: [], p: [] }); } return P; }
  C.pass = passCheck;
  function passXP(n) { const P = passCheck(); P.xp = Math.min(PASS_TIERS * PASS_XP, P.xp + n); }
  C.passXP = passXP;
  C.passTier = () => Math.floor(passCheck().xp / PASS_XP);
  C.passClaim = (track, i) => { const P = passCheck(); if (i >= C.passTier()) return null; if (track === 'p' && !P.prem) return 'prem'; const L = P[track]; if (L.includes(i)) return null; L.push(i); const r = track === 'f' ? FREE(i) : PREM(i); C.giveReward(r); return r; };

  // ---------- weekly events (rotate every Monday) ----------
  C.EVENTS = [
    { id: 'rivalry', icon: '⚔️', name: 'Rivalry Week', desc: 'Wins earn double Coaching Points and extra Pass XP.' },
    { id: 'drive', icon: '✉️', name: 'Recruiting Drive', desc: 'ID Camps cost half. Recruiting offers earn Pass XP.' },
    { id: 'camp', icon: '🏋️', name: 'Training Camp', desc: 'Training plans take 25% less time.' },
    { id: 'boost', icon: '💵', name: 'Booster Weekend', desc: 'Income from the Coaches\' Office and Booster Club +50%.' }
  ];
  C.event = () => C.EVENTS[weekNo() % C.EVENTS.length];
  C.eventEnds = () => new Date(weekKey()).getTime() + 7 * D;

  // ---------- Coach's Club perks, rewarded ads, free coach ----------
  C.vipDaily = () => { const L = lo(); if (!C.isVip() || L.vipDay === dayKey()) return null; L.vipDay = dayKey(); const r = { gold: 25 }; C.giveReward(r); return r; };
  C.adReward = () => { if (C.adsLeft() <= 0) return null; C.acct().adsUsed++; const r = [{ gold: 10 }, { cash: 2000 }, { cp: 15 }, { manual: 1 }][Math.floor(Math.random() * 4)]; C.giveReward(r); C.loEvent('ad'); passXP(20); return r; };
  C.freeCoach = rar => { const S = C.staffState(), r = C.rng(C.now() & 0xffffff); C.refreshMarket(true); const c = S.market.shift(); c.rar = rar; c.level = 1 + rar * 2; S.list.push(c); if (S.on.length < C.staffSlots()) S.on.push(c.id); C.save(); return c; };

  // ---------- packs and cosmetics (test store) ----------
  C.PACKS = {
    starter: { name: 'Starter Pack', icon: '🎒', price: '$1.99', once: true, r: { gold: 500, manual: 3, credits: 20, cash: 20000, coach: 1 } },
    g100: { name: '100 Coins', icon: '<i class="coin"></i>', price: '$0.99', r: { gold: 100 } }, g550: { name: '550 Coins', icon: '<i class="coin"></i>', price: '$4.99', r: { gold: 550 } }, g1200: { name: '1,200 Coins', icon: '<i class="coin"></i>', price: '$9.99', r: { gold: 1200 } },
    xp: { name: 'Coach XP bundle', icon: '📗', price: '$2.99', r: { manual: 10, books: 2 } }, clinic: { name: 'Clinic Credit pack', icon: '🎫', price: '$2.99', r: { credits: 60 } },
    pass: { name: 'Season Pass: premium track', icon: '🎟', price: '$9.99', pass: true }
  };
  C.KITS = { classic: ['👕', 'Classic home kit', ''], alt: ['🔄', 'Alternate kit (colours swapped)', '$1.99'], retro: ['📼', 'Retro kit (white with school trim)', '$1.99'] };
  C.kit = () => lo().kit || 'classic';
  C.kitColours = (c1, c2) => C.kit() === 'alt' ? [c2, c1] : C.kit() === 'retro' ? ['#f8fafc', c1] : [c1, c2];
  C.buyPack = id => { const P = C.PACKS[id], L = lo(); if (!P) return false; if (P.once && L.cos.includes(id)) return 'owned';
    if (P.pass) { passCheck().prem = true; } else C.giveReward(P.r); if (P.once) L.cos.push(id); C.save(); return true; };
  C.buyKit = id => { const L = lo(); if (id !== 'classic' && !L.cos.includes('kit_' + id)) L.cos.push('kit_' + id); L.kit = id; C.save(); };

  // ---------- hooks into the game (wrapping, so earlier code stays untouched) ----------
  const wrap = (name, f) => { const o = C[name]; C[name] = (...a) => f(o, ...a); };
  wrap('startPlan', (o, ...a) => { const r = o(...a); if (r === true) C.loEvent('train'); return r; });
  wrap('pbStart', (o, ...a) => { const r = o(...a); if (r === true) C.loEvent('research'); return r; });
  wrap('startUpgrade', (o, ...a) => { const r = o(...a); if (r) C.loEvent('upgrade'); return r; });
  wrap('sendOffer', (o, ...a) => { C.loEvent('offer'); if (C.event().id === 'drive') passXP(30); return o(...a); });
  wrap('adSpeedUp', (o, ...a) => { const r = o(...a); if (r) { C.loEvent('ad'); C.loEvent('speed'); passXP(20); } return r; });
  wrap('finishNow', (o, ...a) => { const r = o(...a); if (r) C.loEvent('speed'); return r; });
  wrap('collect', (o, k) => { let amt = o(k); if (amt) { C.loEvent('collect'); if (C.event().id === 'boost' && C.PRODUCERS[k] === 'cash') { const b = Math.round(amt * .5); C.car().cash += b; amt += b; C.save(); } } return amt; });
  wrap('campCost', (o) => C.event().id === 'drive' ? Math.round(o() / 2 / 100) * 100 : o());
  wrap('planTime', (o, ...a) => Math.round(o(...a) * (C.event().id === 'camp' ? .75 : 1)));
  wrap('applyResult', (o, m, f) => { const rep = o(m, f), win = (rep.my === 0 ? rep.hs - rep.as : rep.as - rep.hs) > 0;
    C.loEvent('match'); if (win) C.loEvent('win'); passXP(win ? 100 : 50);
    if (win && C.event().id === 'rivalry') { C.car().cp += rep.cp; rep.cp *= 2; passXP(50); } C.save(); return rep; });

  C.loClaimable = () => { if (!C.car()) return 0; rollDay(); const L = lo(); let n = (C.calCanClaim() ? 1 : 0) + L.tasks.filter(t => !t.claimed && t.n >= t.goal).length + (!L.chest && L.weekDone >= C.CHEST_GOAL ? 1 : 0) + (C.isVip() && L.vipDay !== dayKey() ? 1 : 0);
    const P = passCheck(), T = C.passTier(); for (let i = 0; i < T; i++) { if (!P.f.includes(i)) n++; if (P.prem && !P.p.includes(i)) n++; } return n; };

  // ================= Events hub =================
  let tab = 'daily';
  C.openEvents = (t) => { if (t) tab = t; C.ui.open('Events', eventsHTML); };
  C.setEventsTab = t => { tab = t; C.ui.refresh(); };
  function eventsHTML() {
    const L = lo(), ev = C.event();
    const tabs = `<div class="filters" style="padding:0 0 6px">${[['daily', '📅 Daily'], ['pass', '🎟 Pass'], ['event', ev.icon + ' Event']].map(([k, n]) => `<button class="f ${tab === k ? 'on' : ''}" data-act="evtab" data-v="${k}">${n}</button>`).join('')}</div>`;
    if (tab === 'daily') {
      const day = L.cal.claimed % 28, can = C.calCanClaim();
      const cal = CAL.map((r, i) => `<div class="cal ${i < day ? 'got' : i === day && can ? 'now' : ''} ${[6, 13, 20, 27].includes(i) ? 'big' : ''}"><small>${i + 1}</small><span>${NAMES[Object.keys(r)[0]][0]}</span></div>`).join('');
      const tasks = C.tasks().map((t, i) => `<div class="task ${t.claimed ? 'done' : ''}"><span>${t.def[1]}</span><div><b>${t.def[2]}</b><div class="hbar"><i style="width:${t.n / t.goal * 100}%;background:var(--fit5)"></i></div></div>${t.claimed ? '✔' : `<button class="btn sm2" data-act="taskclaim" data-v="${i}" ${t.n >= t.goal ? '' : 'disabled'}>${t.n}/${t.goal}</button>`}</div>`).join('');
      return `${tabs}<h3 class="jh" style="margin-top:4px">28-day calendar <small class="devp">day ${day + 1}</small></h3><div class="calg">${cal}</div>
        <button class="btn full ${can ? 'pri' : 'sec2'}" data-act="calclaim" ${can ? '' : 'disabled'} style="margin-top:8px">${can ? 'Claim day ' + (day + 1) + ': ' + C.rwText(CAL[day]) : '✔ Come back tomorrow'}</button>
        ${C.isVip() ? `<button class="btn full ${L.vipDay !== dayKey() ? 'pri' : 'sec2'}" data-act="vipdaily" style="margin-top:8px" ${L.vipDay !== dayKey() ? '' : 'disabled'}>👑 Coach's Club daily: <i class="coin"></i> 25</button>` : ''}
        <h3 class="jh">Today's tasks <small class="devp"><i class="coin"></i> 20 · <i class="cpi"></i> 20 each</small></h3>${tasks}
        <div class="card chest"><span>🧰</span><div><b>Weekly chest</b><small>${Math.min(L.weekDone, C.CHEST_GOAL)} / ${C.CHEST_GOAL} tasks · ${C.rwText(C.CHEST)}</small><div class="hbar"><i style="width:${Math.min(100, L.weekDone / C.CHEST_GOAL * 100)}%;background:var(--gold)"></i></div></div>
          <button class="btn sm2" data-act="chest" ${!L.chest && L.weekDone >= C.CHEST_GOAL ? '' : 'disabled'}>${L.chest ? '✔' : 'Open'}</button></div>
        <h3 class="jh">Rewarded ads <small class="devp">${C.adsLeft()} left today</small></h3><button class="btn full sec2" data-act="adreward" ${C.adsLeft() > 0 ? '' : 'disabled'}>▶ ${C.isVip() ? 'Claim (Coach\'s Club skips the ad)' : 'Watch an ad (test)'} for a random reward</button>`;
    }
    if (tab === 'pass') {
      const P = passCheck(), T = C.passTier(), left = 30 * D - (C.now() - P.start);
      const rows = Array.from({ length: PASS_TIERS }, (_, i) => { const fr = FREE(i), pr = PREM(i), un = i < T;
        return `<div class="ptier ${un ? 'un' : ''}"><b>${i + 1}</b><button class="prw ${P.f.includes(i) ? 'got' : ''}" data-act="passclaim" data-v="f|${i}" ${un && !P.f.includes(i) ? '' : 'disabled'}>${C.rwText(fr)}</button><button class="prw prem ${P.p.includes(i) ? 'got' : ''} ${P.prem ? '' : 'lockd'}" data-act="passclaim" data-v="p|${i}" ${un && !P.p.includes(i) ? '' : 'disabled'}>${P.prem ? '' : '🔒 '}${C.rwText(pr)}</button></div>`; }).join('');
      return `${tabs}<div class="card passhd"><b>Season Pass · tier ${T} / ${PASS_TIERS}</b><small>${P.xp % PASS_XP} / ${PASS_XP} XP to the next tier · ends in ${C.dur(left / 1000)}</small><div class="hbar"><i style="width:${(P.xp % PASS_XP) / PASS_XP * 100}%;background:var(--school2)"></i></div>
        <p class="note" style="margin:6px 0 0">XP from matches, tasks, the calendar and ads.</p>${P.prem ? '<p class="note" style="margin:4px 0 0">✔ Premium track unlocked</p>' : `<button class="btn full pri" data-act="buypack" data-v="pass" style="margin-top:8px">Unlock premium · $9.99 (test)</button>`}</div>
        <div class="ptier head"><b>#</b><span>Free</span><span>Premium</span></div>${rows}`;
    }
    return `${tabs}<div class="card evcard"><span>${ev.icon}</span><div><b>${ev.name}</b><p>${ev.desc}</p><small>Ends in ${C.dur((C.eventEnds() - C.now()) / 1000)}</small></div></div>
      <h3 class="jh">Coming up</h3>${[1, 2, 3].map(k => { const e = C.EVENTS[(weekNo() + k) % C.EVENTS.length]; return `<div class="card evnext"><span>${e.icon}</span><div><b>${e.name}</b><small>In ${k} week${k > 1 ? 's' : ''}</small></div></div>`; }).join('')}`;
  }
})(window.CFC);
