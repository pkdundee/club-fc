// Club FC: the daily loop and the first season (phase-9h, playtest rounds 4 and 5).
// Inventory and speed-up items, Missions (main and daily, with a points track), the Pass (its free track replaces the 28-day calendar),
// the Inbox, the Store with tabs, and pre-season (recruit, build and hire before the first match).
(function (C) {
  const D = 864e5, A = C.ACTS;
  const dayKey = () => C.todayKey();
  const weekKey = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
  const meta = () => { const car = C.car(); if (!car.meta) car.meta = { inv: {}, ms: {}, main: [], day: '', daily: [], pts: 0, chests: [], pass: null, inbox: [], seenSys: [], wk: '', wbuy: {} }; return car.meta; };
  C.meta = meta;

  // ================= items and rewards =================
  // new reward keys: speed-ups (minutes) and Booster crates; everything else still goes through liveops
  const XN = { sp5: ['⏩', '5m speed-up', 5], sp15: ['⏩', '15m speed-up', 15], sp60: ['⏩', '1h speed-up', 60], sp180: ['⏩', '3h speed-up', 180], crate: ['📦', 'Booster crate ($5K)'], badge: ['🏅', 'Coaching Badge'] };
  const ICON = { gold: '<i class="coin"></i>', cash: '💵', cp: '<i class="cpi"></i>', manual: '📗', credits: '🎫', kit: '🧴', books: '📕', tokens: '🎟', rare: '🎁', coach: '🧑‍🏫' };
  const NAME = { gold: 'Coins', cash: 'Booster $', cp: 'Coaching Points', manual: 'Coaching manual', credits: 'Clinic Credits', kit: 'Recovery kit', books: 'Trait Book', tokens: 'Number Change', rare: 'Rare recruit', coach: 'Rare coach' };
  const TIER = { badge: 3, gold: 3, coach: 4, rare: 4, books: 3, sp60: 3, sp180: 4, crate: 2, sp15: 2, cash: 1, cp: 1, manual: 1, credits: 1, kit: 1, tokens: 2, sp5: 1 };
  const oText = C.rwText, oGive = C.giveReward;
  C.rwText = r => { const a = {}, b = []; for (const k in r) { if (XN[k]) b.push(`${XN[k][0]} ${r[k] > 1 ? r[k] + '× ' : ''}${XN[k][1]}`); else a[k] = r[k]; } return [Object.keys(a).length ? oText(a) : '', ...b].filter(Boolean).join(' · '); };
  C.giveReward = r => { const a = {}, inv = C.car() ? meta().inv : null; for (const k in r) { if (XN[k]) { if (inv) inv[k] = (inv[k] || 0) + r[k]; } else a[k] = r[k]; } oGive(a); C.save(); };
  // rewards as item tiles (Last War style): icon, amount, colour by value
  C.itemTiles = r => `<span class="itiles">${Object.keys(r).map(k => { const v = r[k], ic = XN[k] ? XN[k][0] : ICON[k] || '🎁', lab = k === 'cash' ? C.short(v) : XN[k] && XN[k][2] ? (XN[k][2] >= 60 ? XN[k][2] / 60 + 'h' : XN[k][2] + 'm') + (v > 1 ? ' ×' + v : '') : k === 'crate' ? '$5K' + (v > 1 ? ' ×' + v : '') : v;
    return `<span class="itile t${TIER[k] || 1}" title="${C.esc(XN[k] ? XN[k][1] : NAME[k] || k)}">${ic}<b>${lab}</b></span>`; }).join('')}</span>`;

  // use a speed-up on a building in the queue
  C.useSpeed = (k, key) => { const inv = meta().inv, q = C.inQueue(k); if (!q || !(inv[key] > 0)) return false; inv[key]--; q.end -= XN[key][2] * 60000; C.tick(); C.save(); return true; };
  C.openCrate = () => { const inv = meta().inv; if (!(inv.crate > 0)) return false; inv.crate--; C.car().cash += 5000; C.save(); return true; };

  // ================= Inventory =================
  let invTab = 'speed';
  C.openInventory = () => C.ui.open('Inventory', () => {
    const car = C.car(), inv = meta().inv, S = C.staffState(), it = car.items || {};
    const tabs = [['speed', 'Speed-ups'], ['res', 'Resources'], ['special', 'Special']];
    const cell = (icon, n, label, act, v, cls = 't1') => `<button class="invc ${cls} ${n ? '' : 'none'}" ${n && act ? `data-act="${act}" data-v="${v}"` : 'disabled'}><span>${icon}</span><b>${n}</b><small>${label}</small></button>`;
    let body = '';
    if (invTab === 'speed') body = ['sp5', 'sp15', 'sp60', 'sp180'].map(k => cell('⏩', inv[k] || 0, XN[k][1].replace(' speed-up', ''), 'invspeed', k, 't' + TIER[k])).join('');
    if (invTab === 'res') body = cell('📦', inv.crate || 0, '$5K crate', 'invcrate', '', 't2') + cell('🏅', inv.badge || 0, 'Coaching Badges', 'tab', 'staff', 't3') + cell('📗', S.items.manual, 'Manuals', 'tab', 'staff') + cell('📕', S.items.books, 'Trait Books', 'tab', 'staff', 't3') + cell('🎫', S.items.credits, 'Clinic Credits', 'tab', 'staff');
    if (invTab === 'special') body = cell('🧴', it.kit || 0, 'Recovery kits', 'medical', '') + cell('🎁', it.rareRecruit || 0, 'Rare recruit', 'rare', '', 't4') + cell('🎟', car.tokens || 0, 'Number Changes', 'tab', 'squad', 't2');
    return `<div class="res hres inv">${C.resBar()}</div><div class="bigtabs">${tabs.map(([k, n]) => `<button class="${invTab === k ? 'on' : ''}" data-act="invtab" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="invg">${body}</div><p class="note">${invTab === 'speed' ? 'Tap a speed-up, then pick a building that is being built. Speed-ups come from Missions, the Pass and the Store.' : 'Tap an item to use it or go to where it is used.'}</p>`;
  });
  A.invtab = v => { invTab = v; C.ui.refresh(); };
  A.invcrate = () => { if (C.openCrate()) { C.toast('📦 +$5K Booster $'); C.ui.refresh(); C.render(); } };
  A.invspeed = v => { const q = C.car().queue; if (!q.length) return C.toast('Nothing is being built right now');
    C.ui.open('Use a speed-up', () => `<p class="note" style="margin-top:0">${XN[v][1]}: pick a building.</p>${C.car().queue.map(x => `<button class="lrow" data-act="usespeed" data-v="${x.key}|${v}"><span class="li">${C.BUILDINGS[x.key].icon}</span><span class="lt"><b>${C.esc(C.BUILDINGS[x.key].name)} → Lv ${x.to}</b><small data-timer="${x.key}">${C.dur(C.remaining(x))} left</small></span><span class="lr">⏩</span></button>`).join('')}`); };
  A.usespeed = v => { const [k, key] = v.split('|'); if (C.useSpeed(k, key)) { C.toast(`⏩ ${XN[key][1]} used`); C.ui.back(); C.ui.refresh(); C.render(); } };

  // ================= Missions: main tasks (a guided path) and daily tasks with a points track =================
  // main tasks double as the tutorial: pre-season first (coach, campus, recruiting), then the season
  const MAIN = [
    ['coach', '🧢', 'Hire your first assistant coach', c => (C.staffState().list || []).length >= 1, { cash: 2000 }, 'tab', 'staff'],
    ['hq2', '🏛', "Upgrade the Coaches' Office to Lv 2", c => c.b.hq >= 2, { gold: 20, sp15: 1 }, 'bldopen', 'hq'],
    ['offer', '✉️', 'Make a scholarship offer to a recruit', c => (meta().ms.offers || 0) >= 1, { cp: 30 }, 'tab', 'recruit'],
    ['sign', '✍️', 'Sign a recruit', c => (c.rec && c.rec.signed || 0) >= 1, { cash: 3000 }, 'tab', 'recruit'],
    ['gym', '🏋️', 'Build the Gym', c => c.b.gym >= 1, { sp15: 2 }, 'bldopen', 'gym'],
    ['collect', '💵', 'Collect income on campus', c => (meta().ms.collect || 0) >= 1, { crate: 1 }, 'tab', 'campus'],
    ['research', '📋', 'Start Playbook research', c => (meta().ms.research || 0) >= 1, { cp: 40 }, 'playbook', ''],
    ['roster', '👕', 'Fill the roster to 22 players', c => c.squad.length >= 22, { gold: 30 }, 'tab', 'recruit'],
    ['start', '🏁', 'Start the season', c => !c.pre, { gold: 50, sp60: 1 }, 'preseason', ''],
    ['play', '⚽', 'Play your first match', c => (meta().ms.match || 0) >= 1, { sp60: 1 }, 'prematch', ''],
    ['train', '🏋️', 'Start a training plan', c => (meta().ms.train || 0) >= 1, { manual: 2 }, 'tab', 'squad'],
    ['win', '🏆', 'Win a match', c => (meta().ms.win || 0) >= 1, { gold: 30, crate: 1 }, 'prematch', ''],
    ['hq3', '🏛', "Upgrade the Coaches' Office to Lv 3", c => c.b.hq >= 3, { sp60: 2, badge: 5 }, 'bldopen', 'hq'],
    ['video', '🎞', 'Build the Video Room', c => c.b.video >= 1, { gold: 40 }, 'bldopen', 'video'],
    ['wins3', '🏆', 'Win 3 matches', c => (meta().ms.win || 0) >= 3, { gold: 60, books: 1 }, 'prematch', ''],
    ['hq5', '🏛', "Reach Coaches' Office Lv 5", c => c.b.hq >= 5, { gold: 80, sp180: 1 }, 'bldopen', 'hq'],
    ['top4', '📊', 'Finish a season in the top 4', c => (meta().ms.top4 || 0) >= 1, { gold: 150, rare: 1 }, 'tab', 'season']
  ];
  C.MAIN = MAIN;
  C.mainDone = id => meta().main.includes(id);
  C.mainNext = () => { const car = C.car(); return MAIN.find(t => !meta().main.includes(t[0])) || null; };
  C.mainReady = () => { const car = C.car(); return MAIN.filter(t => !meta().main.includes(t[0]) && t[3](car)).length; };
  C.mainClaim = id => { const t = MAIN.find(x => x[0] === id), M = meta(); if (!t || M.main.includes(id) || !t[3](C.car())) return null; M.main.push(id); C.giveReward(t[4]); C.passPts(20); C.save(); return t[4]; };

  // daily tasks: 6 a day, 20 points each, chests at 20/40/60/90/120
  const DAILY = [['match', '⚽', 'Play a match', 1, 'prematch', ''], ['win', '🏆', 'Win a match', 1, 'prematch', ''], ['collect', '💵', 'Collect income 3 times', 3, 'tab', 'campus'], ['upgrade', '🔨', 'Start an upgrade', 1, 'blist', ''],
    ['train', '🏋️', 'Start a training plan', 1, 'tab', 'squad'], ['research', '📋', 'Start Playbook research', 1, 'playbook', ''], ['offer', '✉️', 'Make a recruiting offer', 1, 'tab', 'recruit'], ['ad', '▶', 'Watch a rewarded ad', 1, 'adreward', ''],
    ['speed', '⏩', 'Use a speed-up', 1, 'inventory', ''], ['gift', '🎁', 'Claim the daily gift', 1, 'dailygift', ''], ['medical', '🩺', 'Use a physio or recovery item', 1, 'medical', '']];
  const DREW = { match: { cash: 1500 }, win: { gold: 10 }, collect: { cp: 15 }, upgrade: { sp5: 2 }, train: { manual: 1 }, research: { cp: 20 }, offer: { cash: 1000 }, ad: { gold: 5 }, speed: { sp5: 1 }, gift: { cp: 10 }, medical: { kit: 1 } };
  const CHESTS = [[20, { sp5: 2, cash: 1500 }], [40, { cp: 30, crate: 1 }], [60, { gold: 15, sp15: 1, badge: 1 }], [90, { manual: 2, sp15: 2 }], [120, { gold: 40, sp60: 1, badge: 3 }]];
  C.CHESTS = CHESTS;
  function rollDaily() { const M = meta(); if (M.day === dayKey()) return;
    // anything finished but not claimed yesterday goes to the Inbox, so it isn't lost
    const left = {}; (M.daily || []).forEach(t => { if (t.n >= t.goal && !t.claimed) Object.entries(DREW[t.id] || {}).forEach(([k, v]) => left[k] = (left[k] || 0) + v); });
    CHESTS.forEach(([p, r], i) => { if (M.pts >= p && !M.chests.includes(i)) Object.entries(r).forEach(([k, v]) => left[k] = (left[k] || 0) + v); });
    if (Object.keys(left).length && M.day) C.mail('rewards', '🎁', 'Unclaimed daily rewards', "You finished these yesterday but didn't claim them. Here they are.", left);
    M.day = dayKey(); M.pts = 0; M.chests = [];
    const r = C.rng(new Date().getDate() * 131 + new Date().getMonth() * 17), pool = DAILY.slice();
    M.daily = [0, 1, 2, 3, 4, 5].map(() => { const t = pool.splice(Math.floor(r() * pool.length), 1)[0]; return { id: t[0], n: 0, goal: t[3], claimed: false }; }); }
  C.daily = () => { rollDaily(); return meta().daily.map(t => Object.assign({}, t, { def: DAILY.find(x => x[0] === t.id) })); };
  C.dailyEvent = (id, n = 1) => { if (!C.car()) return; rollDaily(); meta().daily.forEach(t => { if (t.id === id) t.n = Math.min(t.goal, t.n + n); }); };
  C.dailyClaim = i => { const M = meta(), t = M.daily[i]; if (!t || t.claimed || t.n < t.goal) return null; t.claimed = true; M.pts += 20; const r = DREW[t.id]; C.giveReward(r); C.passPts(10); return r; };
  C.chestOpen = i => { const M = meta(); if (M.chests.includes(i) || M.pts < CHESTS[i][0]) return null; M.chests.push(i); C.giveReward(CHESTS[i][1]); return CHESTS[i][1]; };

  // ================= the Pass: 30 tiers, one free tier a day you log in (replaces the 28-day calendar) =================
  const PASS_TIERS = 30;
  const PFREE = i => (i + 1) % 10 === 0 ? { gold: 60, sp60: 1 } : (i + 1) % 5 === 0 ? { gold: 30, crate: 1, badge: 2 } : [{ cash: 3000 }, { sp15: 1 }, { cp: 40 }, { manual: 1 }, { sp5: 3 }, { credits: 8 }, { gold: 15 }][i % 7];
  const PPREM = i => (i + 1) === 30 ? { coach: 1, gold: 200 } : (i + 1) % 10 === 0 ? { rare: 1, gold: 100 } : (i + 1) % 5 === 0 ? { books: 2, sp180: 1, badge: 8 } : [{ gold: 40 }, { sp60: 1 }, { manual: 2 }, { crate: 2 }, { credits: 15 }, { sp15: 3 }][i % 6];
  C.passX = () => { const M = meta(); if (!M.pass || C.now() - M.pass.start > 30 * D) M.pass = { start: C.now(), days: 0, last: '', prem: M.pass && M.pass.keepPrem ? true : false, f: [], p: [], pts: 0 }; return M.pass; };
  C.passPts = n => { const P = C.passX(); P.pts = (P.pts || 0) + n; };
  // a tier unlocks for each day you check in (plus extra tiers from Mission points: 200 points = 1 tier)
  C.passTierX = () => { const P = C.passX(); return Math.min(PASS_TIERS, P.days + Math.floor((P.pts || 0) / 200)); };
  C.passCanCheckIn = () => C.passX().last !== dayKey();
  C.passCheckIn = () => { const P = C.passX(); if (!C.passCanCheckIn()) return false; P.last = dayKey(); P.days++; C.save(); return true; };
  C.passClaimX = (track, i) => { const P = C.passX(); if (i >= C.passTierX()) return null; if (track === 'p' && !P.prem) return 'prem'; const L = P[track]; if (L.includes(i)) return null; L.push(i); const r = track === 'f' ? PFREE(i) : PPREM(i); C.giveReward(r); return r; };
  C.passClaimAll = () => { const P = C.passX(), T = C.passTierX(), got = {}; for (let i = 0; i < T; i++) for (const tr of ['f', 'p']) { if (tr === 'p' && !P.prem) continue; if (P[tr].includes(i)) continue; P[tr].push(i); const r = tr === 'f' ? PFREE(i) : PPREM(i); C.giveReward(r); for (const k in r) got[k] = (got[k] || 0) + r[k]; } return Object.keys(got).length ? got : null; };
  C.passUnclaimed = () => { const P = C.passX(), T = C.passTierX(); let n = 0; for (let i = 0; i < T; i++) { if (!P.f.includes(i)) n++; if (P.prem && !P.p.includes(i)) n++; } return n + (C.passCanCheckIn() ? 1 : 0); };

  // ================= Events hub: big tabs (Pass · Missions · Event) =================
  let evTab = 'missions', msTab = 'main';
  C.openEvents = t => { if (t) evTab = t; C.ui.open('Events', eventsHTML); };
  A.evtab = v => { evTab = v; C.ui.refresh(); };
  A.mstab = v => { msTab = v; C.ui.refresh(); };
  function bigTabs() { const ev = C.event(), dots = { pass: C.passUnclaimed(), missions: C.mainReady() + C.daily().filter(t => t.n >= t.goal && !t.claimed).length + CHESTS.filter(([p], i) => meta().pts >= p && !meta().chests.includes(i)).length, event: 0 };
    return `<div class="bigtabs">${[['missions', '🎯 Missions'], ['pass', '🎟 Pass'], ['event', ev.icon + ' Event']].map(([k, n]) => `<button class="${evTab === k ? 'on' : ''}" data-act="evtab" data-v="${k}">${n}${dots[k] ? ` <em>${dots[k]}</em>` : ''}</button>`).join('')}</div>`; }
  function eventsHTML() {
    if (evTab === 'pass') return bigTabs() + passHTML();
    if (evTab === 'event') { const ev = C.event(); return bigTabs() + `${C.streakHTML ? C.streakHTML() + C.piggyHTML() : ''}<div class="card evcard"><span>${ev.icon}</span><div><b>${ev.name}</b><p>${ev.desc}</p><small>Ends in ${C.dur((C.eventEnds() - C.now()) / 1000)}</small></div></div>
      ${C.isVip() ? `<button class="btn full ${C.lo().vipDay !== dayKey() ? 'pri' : 'sec2'}" data-act="vipdaily" style="margin-top:8px" ${C.lo().vipDay !== dayKey() ? '' : 'disabled'}>👑 Coach's Club daily: <i class="coin"></i> 25</button>` : ''}
      <h3 class="jh">Rewarded ads <small class="devp">${C.adsLeft()} left today</small></h3><button class="btn full sec2" data-act="adreward" ${C.adsLeft() > 0 ? '' : 'disabled'}>▶ ${C.isVip() ? "Claim (Coach's Club skips the ad)" : 'Watch an ad (test)'} for a random reward</button>`; }
    const sub = `<div class="subtabs">${[['main', 'Main tasks', C.mainReady()], ['daily', 'Daily tasks', C.daily().filter(t => t.n >= t.goal && !t.claimed).length]].map(([k, n, d]) => `<button class="${msTab === k ? 'on' : ''}" data-act="mstab" data-v="${k}">${n}${d ? ` <em>${d}</em>` : ''}</button>`).join('')}</div>`;
    if (msTab === 'main') {
      const car = C.car(), M = meta(), open = MAIN.filter(t => !M.main.includes(t[0])).slice(0, 5);
      const rows = open.map(t => { const ok = t[3](car); return `<div class="mrow2"><div class="mh"><span>${t[1]}</span><b>${C.esc(t[2])}</b></div><div class="mb">${C.itemTiles(t[4])}${ok ? `<button class="btn sm2 claim" data-act="mainclaim" data-v="${t[0]}">Claim</button>` : `<button class="btn sm2 go" data-act="${t[5]}" data-v="${t[6]}">Go</button>`}</div></div>`; }).join('');
      return bigTabs() + sub + `<p class="note" style="margin-top:0">${M.main.length} of ${MAIN.length} done. Each one teaches a part of running your program.</p>${rows || '<p class="note">All main tasks done. 🎉</p>'}`;
    }
    const M = meta(), list = C.daily(), max = CHESTS[CHESTS.length - 1][0];
    const track = `<div class="ptrack"><div class="pstar"><i>★</i><b>${M.pts}</b></div><div class="pline"><div class="pfill" style="width:${Math.min(100, M.pts / max * 100)}%"></div>${CHESTS.map(([p], i) => `<button class="pchest ${M.chests.includes(i) ? 'got' : M.pts >= p ? 'ready' : ''}" style="left:${p / max * 100}%" data-act="chestopen" data-v="${i}" title="${C.esc(C.rwText(CHESTS[i][1]))}">🧰<small>${p}</small></button>`).join('')}</div></div>`;
    const rows = list.map((t, i) => `<div class="mrow2 ${t.claimed ? 'done' : ''}"><div class="mh"><span>${t.def[1]}</span><b>${C.esc(t.def[2])} <small>(${t.n}/${t.goal})</small></b></div><div class="mb">${C.itemTiles(Object.assign({ pts: 20 }, DREW[t.id]))}
      ${t.claimed ? '<span class="donechk">✔</span>' : t.n >= t.goal ? `<button class="btn sm2 claim" data-act="dailyclaim" data-v="${i}">Claim</button>` : `<button class="btn sm2 go" data-act="${t.def[4]}" data-v="${t.def[5]}">Go</button>`}</div></div>`).join('');
    return bigTabs() + sub + `<div class="nextref">⏱ New tasks in ${C.dur((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)}</div>${track}${rows}`;
  }
  ICON.pts = '<i class="ptsi">★</i>'; TIER.pts = 2; NAME.pts = 'Mission points';
  function passHTML() {
    const P = C.passX(), T = C.passTierX(), left = 30 * D - (C.now() - P.start), can = C.passCanCheckIn();
    const rows = Array.from({ length: PASS_TIERS }, (_, i) => { const un = i < T;
      const cell = (tr, r) => { const got = P[tr].includes(i), lock = tr === 'p' && !P.prem; return `<button class="pcell ${tr} ${got ? 'got' : ''} ${un && !got && !lock ? 'ready' : ''}" data-act="passx" data-v="${tr}|${i}" ${un && !got ? '' : 'disabled'}>${lock ? '<i class="plock">🔒</i>' : ''}${C.itemTiles(r)}${got ? '<i class="pgot">✔</i>' : ''}</button>`; };
      return `<div class="prow2 ${un ? 'un' : ''}"><b class="pday">${i + 1}</b>${cell('f', PFREE(i))}${cell('p', PPREM(i))}</div>`; }).join('');
    return `<div class="card passhd2"><b>Season Pass</b><small>${C.dur(left / 1000)} left · tier ${T} / ${PASS_TIERS}</small>
        <p>One free tier unlocks each day you check in. Mission points unlock extra tiers (200 points = 1 tier).</p>
        <button class="btn full ${can ? 'pri' : 'sec2'}" data-act="passcheck" ${can ? '' : 'disabled'}>${can ? `✔ Check in for day ${P.days + 1}` : '✔ Checked in today'}</button>
        ${P.prem ? '<p class="note" style="margin:6px 0 0">✔ Premium track unlocked</p>' : `<button class="btn full gold" data-act="buypack" data-v="pass" style="margin-top:8px">Unlock the premium track · $9.99 (test)</button>`}</div>
      <div class="prow2 head"><b class="pday">Day</b><span>Free</span><span>Premium</span></div>${rows}
      <button class="btn full pri" data-act="passall" style="margin-top:10px">Claim all</button>`;
  }
  A.mainclaim = v => { const r = C.mainClaim(v); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  A.dailyclaim = v => { const r = C.dailyClaim(+v); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  A.chestopen = v => { const r = C.chestOpen(+v); if (r) { C.toast('🧰 ' + C.rwText(r)); C.ui.refresh(); C.render(); } else C.toast('🧰 ' + C.rwText(CHESTS[+v][1])); };
  A.passcheck = () => { if (C.passCheckIn()) { C.toast('🎟 Checked in: a new tier is open'); C.ui.refresh(); C.render(); } };
  A.passx = v => { const [t, i] = v.split('|'), r = C.passClaimX(t, +i); if (r === 'prem') C.toast('Unlock the premium track first'); else if (r) { C.toast('🎟 ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  A.passall = () => { const r = C.passClaimAll(); C.toast(r ? '🎟 ' + C.rwText(r) : 'Nothing to claim yet'); C.ui.refresh(); C.render(); };
  A.inventory = () => C.openInventory();
  A.preseason = () => C.openPreseason();
  // premium pass bought through the old store action still unlocks this pass
  const oBuyPack = C.buyPack; C.buyPack = id => { const r = oBuyPack(id); if (r !== 'owned' && C.car()) { if (id === 'pass') C.passX().prem = true; receipt(C.PACKS[id] ? C.PACKS[id].name || id : id, C.PACKS[id] && C.PACKS[id].r); } return r; };

  // claimable count for red dots (replaces the calendar-based count)
  C.loClaimable = () => { if (!C.car()) return 0; const M = meta(); return C.passUnclaimed() + C.mainReady() + C.daily().filter(t => t.n >= t.goal && !t.claimed).length + CHESTS.filter(([p], i) => M.pts >= p && !M.chests.includes(i)).length + (C.isVip() && C.lo().vipDay !== dayKey() ? 1 : 0); };

  // ================= Inbox: one place for messages, by topic =================
  C.mail = (f, icon, title, body, r) => { const M = meta(); M.inbox.unshift({ id: 'm' + C.now() + Math.floor(Math.random() * 1e4), f, icon, title, body, r: r || null, claimed: false, read: false, t: C.now() }); M.inbox = M.inbox.filter(x => C.now() - x.t < 30 * D || x.fav).slice(0, 120); C.save(); };
  function receipt(name, r) { C.mail('purchases', '🧾', 'Purchase: ' + name, `Thanks for your purchase. ${r ? 'Received: ' + C.rwText(r) + '.' : ''}<br><small>Test store: nothing was charged.</small>`, null); }
  const FOLDERS = [['match', '📋', 'Match reports'], ['director', '🏛', 'Director'], ['rewards', '🎁', 'Rewards'], ['purchases', '🧾', 'Purchases'], ['system', '⚙️', 'News & updates'], ['fav', '⭐', 'Favourites']];
  C.inboxUnread = () => { const car = C.car(); if (!car) return 0; sysMail(); return meta().inbox.filter(x => !x.read || (x.r && !x.claimed)).length + C.adUnread(); };
  function sysMail() { const M = meta(); if (!M.seenSys.includes('9h')) { M.seenSys.push('9h'); C.mail('system', '📣', 'New: Missions, the Pass, Inbox and Inventory', `Ray here. A few changes around the office:<br>• <b>Missions</b> (in Events): main tasks guide you step by step, daily tasks fill a points track with chests.<br>• The <b>Pass</b> replaces the old calendar: check in each day for a free tier.<br>• <b>Inventory</b> holds speed-ups and items.<br>• This <b>Inbox</b> keeps match reports, rewards and receipts.<br>Here's something to get you started.`, { gold: 50, sp15: 2 }); } }
  let folder = null;
  C.openInbox = () => { folder = null; C.ui.open('Inbox', inboxHTML); };
  function inboxHTML() {
    sysMail(); const M = meta();
    if (!folder) return FOLDERS.map(([k, ic, n]) => { const list = k === 'fav' ? M.inbox.filter(x => x.fav) : M.inbox.filter(x => x.f === k), un = k === 'director' ? C.adUnread() : list.filter(x => !x.read || (x.r && !x.claimed)).length, gift = list.some(x => x.r && !x.claimed);
      return `<button class="mfold" data-act="mfold" data-v="${k}"><span class="mfi">${ic}</span><b>${n}</b>${gift ? '<span class="mgift">🎁</span>' : ''}${un ? `<i class="mdot">${un}</i>` : ''}<em>›</em></button>`; }).join('') + '<p class="note">Messages older than 30 days are removed, unless you favourite them.</p>';
    const list = folder === 'fav' ? M.inbox.filter(x => x.fav) : M.inbox.filter(x => x.f === folder);
    return `<button class="btn sm2 sec2" data-act="mfold" data-v="">‹ All folders</button>${list.length ? list.map(x => `<div class="mail ${x.read ? '' : 'new'}"><div class="mh"><span>${x.icon}</span><div><b>${C.esc(x.title)}</b><small>${new Date(x.t).toLocaleString()}</small></div><button class="mfav" data-act="mfav" data-v="${x.id}">${x.fav ? '⭐' : '☆'}</button></div>
      <div class="mbody">${x.body}</div>${x.md != null ? `<button class="btn sm2 sec2" data-act="report" data-v="${x.md}">Full report</button>` : ''}${x.r ? `<div class="mrw">${C.itemTiles(x.r)}${x.claimed ? '<span class="donechk">✔ Claimed</span>' : `<button class="btn sm2 claim" data-act="mclaim" data-v="${x.id}">Claim</button>`}</div>` : ''}</div>`).join('') : '<p class="note">Nothing here yet.</p>'}`;
  }
  A.mfold = v => { if (v === 'director') return C.openAD(); folder = v || null; if (folder) meta().inbox.forEach(x => { if ((folder === 'fav' ? x.fav : x.f === folder) && !x.r) x.read = true; }); C.save(); C.ui.refresh(); C.render(); };
  A.mfav = v => { const x = meta().inbox.find(m => m.id === v); if (x) { x.fav = !x.fav; C.save(); C.ui.refresh(); } };
  A.mclaim = v => { const x = meta().inbox.find(m => m.id === v); if (x && x.r && !x.claimed) { x.claimed = true; x.read = true; C.giveReward(x.r); C.toast('🎁 ' + C.rwText(x.r)); C.ui.refresh(); C.render(); } };
  A.inbox = () => C.openInbox();
  A.report = v => C.openReport(+v);

  // ================= Store with tabs =================
  let stTab = 'deals';
  const WEEKLY = [
    { id: 'wk_build', icon: '🔨', name: 'Builder week', r: { cash: 20000, sp60: 2, sp15: 4 }, price: '$2.99', lim: 2, tag: 'Epic' },
    { id: 'wk_rec', icon: '✉️', name: 'Recruiting push', r: { gold: 120, rare: 1 }, price: '$4.99', lim: 1, tag: 'Legendary' },
    { id: 'wk_coach', icon: '🏅', name: 'Coach development', r: { badge: 30, manual: 4 }, price: '$3.99', lim: 2, tag: 'Epic' },
    { id: 'wk_med', icon: '🩺', name: 'Medical kit-out', r: { kit: 4, credits: 20, sp15: 2 }, price: '$1.99', lim: 3, tag: 'Elite' }
  ];
  C.WEEKLY = WEEKLY;
  const wkEnd = () => new Date(weekKey()).getTime() + 7 * D;
  C.buyWeekly = id => { const M = meta(), w = WEEKLY.find(x => x.id === id); if (M.wk !== weekKey()) { M.wk = weekKey(); M.wbuy = {}; } const n = M.wbuy[id] || 0; if (!w || n >= w.lim) return 'limit'; M.wbuy[id] = n + 1; C.giveReward(w.r); receipt(w.name, w.r); return true; };
  A.buyweekly = v => { const r = C.buyWeekly(v); C.toast(r === true ? '✅ Test purchase complete' : 'Purchase limit reached this week'); C.ui.refresh(); C.render(); };
  A.sttab = v => { stTab = v; C.ui.refresh(); };
  const oStore = C.openStore;
  C.openStore = () => C.ui.open('Store', () => {
    const a = C.acct(), vip = C.isVip(), L = C.lo(), M = meta(); if (M.wk !== weekKey()) { M.wk = weekKey(); M.wbuy = {}; }
    const row = (act, v, icon, name, sub, price, owned) => `<button class="lrow ${owned ? 'lock' : ''}" data-act="${act}" data-v="${v}"><span class="li">${icon}</span><span class="lt"><b>${name}</b><small>${sub}</small></span><span class="lr">${owned ? '✔' : price}</span></button>`;
    const tabs = `<div class="bigtabs">${[['deals', 'Deals'], ['passes', 'Passes'], ['coins', 'Coins'], ['items', 'Items']].map(([k, n]) => `<button class="${stTab === k ? 'on' : ''}" data-act="sttab" data-v="${k}">${n}</button>`).join('')}</div>`;
    const test = `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px;margin-bottom:8px">🧪 Test store. Purchases are simulated and no money is charged.</div>`;
    let body = '';
    if (stTab === 'deals') { const dl = C.todayDeal(), dd = C.dealBought(), fmt = t => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      body = `<div class="pack"><div class="pkh"><b>${dl.icon} Today's deal: ${C.esc(dl.name)}</b><span class="ptag">Daily</span></div>${C.itemTiles(dl.r)}<div class="pkf"><small>1 purchase a day</small><button class="btn sm2 ${dd ? 'sec2' : 'pri'}" data-act="buydeal" ${dd ? 'disabled' : ''}>${dd ? '✔ Bought' : `<s>${dl.was}</s> ${dl.price}`}</button></div></div>
        ${C.piggyHTML ? C.piggyHTML() : ''}<h3 class="jh">Weekly deals <small class="devp">${fmt(new Date(weekKey()))} – ${fmt(wkEnd() - 1)}</small></h3>
        ${WEEKLY.map(w => { const n = M.wbuy[w.id] || 0, left = w.lim - n; return `<div class="pack"><div class="pkh"><b>${w.icon} ${w.name}</b><span class="ptag t-${w.tag.toLowerCase()}">${w.tag}</span></div>${C.itemTiles(w.r)}<div class="pkf"><small>${left} of ${w.lim} purchase${w.lim > 1 ? 's' : ''} left</small><button class="btn sm2 ${left ? 'pri' : 'sec2'}" data-act="buyweekly" data-v="${w.id}" ${left ? '' : 'disabled'}>${left ? w.price : 'Sold out'}</button></div></div>`; }).join('')}
        ${row('buypack', 'starter', '🎒', 'Starter Pack', C.rwText(C.PACKS.starter.r) + ' · once only', '$1.99', L.cos.includes('starter'))}`; }
    if (stTab === 'passes') body = `<div class="vipcard"><b>👑 Coach's Club</b><p>+1 slot in every queue (build, training, research, staff) · +1 career slot · <i class="coin"></i> 25 every day · rewarded ads without the ad</p>
        <button class="btn full ${vip ? 'sec2' : 'pri'}" data-act="buy" data-v="vip">${vip ? 'Active · ' + Math.ceil((a.vipUntil - C.now()) / 864e5) + ' days left (extend +30)' : 'Join · $4.99 / month'}</button></div>
      ${row('buypack', 'pass', '🎟', 'Season Pass premium', 'Premium rewards on all 30 tiers of this pass', '$9.99', C.passX().prem)}`;
    if (stTab === 'coins') body = ['g100', 'g550', 'g1200'].map(k => row('buypack', k, '<i class="coin"></i>', C.PACKS[k].name, 'Speed-ups, coaching searches, agency scouts', C.PACKS[k].price)).join('');
    if (stTab === 'items') body = `${row('buypack', 'xp', '📗', 'Coach XP bundle', C.rwText(C.PACKS.xp.r), '$2.99')}${row('buypack', 'clinic', '🎫', 'Clinic Credit pack', C.rwText(C.PACKS.clinic.r), '$2.99')}
      <h3 class="jh">Permanent slots</h3>${row('buy', 'slot3', '🔨', 'Extra build slot', 'A permanent 3rd build slot', '$2.99', a.slot3)}${row('buy', 'tslot3', '🏋️', 'Extra training slot', 'A permanent 3rd training-plan slot', '$2.99', a.tslot3)}
      ${row('buy', 'pslot3', '📋', 'Extra research slot', 'A permanent 3rd Playbook slot', '$2.99', a.pslot3)}${row('buy', 'sslot3', '🧑‍🏫', 'Extra staff slot', 'A permanent 3rd coach on duty', '$2.99', a.sslot3)}
      ${row('buy', 'tokens', '🎟', '3 Number Changes', 'Give players the number they want', '$0.99')}
      <h3 class="jh">Kits (cosmetic)</h3>${Object.keys(C.KITS).map(k => row('kit', k, C.KITS[k][0], C.KITS[k][1], C.kit() === k ? 'Wearing now' : L.cos.includes('kit_' + k) || k === 'classic' ? 'Owned: tap to wear' : 'Changes how your team looks, nothing else', C.KITS[k][2] || 'Free', false)).join('')}`;
    return `<div class="res hres inv">${C.resBar()}</div>${tabs}${test}${body}<div class="card fair"><b>⚖️ Fair play promise</b><p>Money buys time and convenience, never results. No paid match wins, no attribute points past a player's potential, no buying players directly.</p></div>`;
  });
  const oDeal = C.buyDeal; C.buyDeal = () => { const r = oDeal(); if (r === true) receipt(C.todayDeal().name, C.todayDeal().r); return r; };

  // ================= pre-season (round 5): recruit, build and hire before the first match =================
  C.PRE_MIN = 22;   // the starting roster is 21: sign at least one recruit before the season
  C.openPreseason = () => C.ui.open('Pre-season', () => {
    const car = C.car(), n = car.squad.length, coach = (C.staffState().list || []).length >= 1, ok = n >= C.PRE_MIN && coach, steps = MAIN.slice(0, 8);
    return `<div class="card prehd3"><b>🗓 Pre-season</b><p>Real college programs finish recruiting before the season starts: by then almost nobody has a roster spot left. Use pre-season to hire your staff, build your campus and fill your roster. Player training starts with the season.</p></div>
      <div class="card">${steps.map(t => { const done = meta().main.includes(t[0]) || t[3](car); return `<div class="pstep ${done ? 'done' : ''}"><span>${done ? '✔' : t[1]}</span><b>${C.esc(t[2])}</b>${done ? '' : `<button class="btn sm2 go" data-act="${t[5]}" data-v="${t[6]}">Go</button>`}</div>`; }).join('')}</div>
      <div class="srow" style="margin:10px 2px"><span>👕 Roster</span><b class="${ok ? '' : 'short'}">${n} / ${C.PRE_MIN} needed</b></div>
      <button class="btn full ${ok ? 'pri' : 'sec2'}" data-act="startseason" ${ok ? '' : 'disabled'}>${ok ? '🏁 Start the season' : !coach ? 'Hire an assistant coach to start' : `Sign ${C.PRE_MIN - n} more player${C.PRE_MIN - n > 1 ? 's' : ''} to start`}</button>
      <p class="note">${ok ? 'Once the season starts, matches open and training plans begin.' : 'Not enough players? Walk-on tryouts fill the gaps if you start short later on.'}</p>`;
  });
  A.startseason = () => { const car = C.car(); if (car.squad.length < C.PRE_MIN || !(C.staffState().list || []).length) return; car.pre = false; C.mail('director', '🏁', 'The season is under way', 'Good luck out there, Coach.', null); C.save(); C.ui.closeAll(); C.toast('🏁 The season has started!'); C.render(); };
  // matches and player training wait for the season
  const oPre = C.openPreMatch; C.openPreMatch = () => { const car = C.car(); if (car && car.pre) return C.openPreseason(); return oPre(); };
  const oPlan = C.startPlan; C.startPlan = (...a) => { const car = C.car(); if (car && car.pre) return 'pre'; const r = oPlan(...a); if (r === true) { meta().ms.train = (meta().ms.train || 0) + 1; C.dailyEvent('train'); } return r; };
  const oGameday = C.gamedayHTML; C.gamedayHTML = () => { const car = C.car(); if (!car || !car.pre) return oGameday();
    const n = car.squad.length; return `<div class="gameday pre"><span class="gdc">🗓</span><div class="vs"><div><small>PRE-SEASON · ROSTER ${n}/${C.PRE_MIN}</small>Build your program</div></div><button class="go" data-act="preseason">${n >= C.PRE_MIN ? '🏁 Start' : 'Plan'}</button></div>`; };
  // a brand-new career starts in pre-season (older saves are already mid-season)
  const oNew = C.newCareer; C.newCareer = o => { const car = oNew(o); car.pre = true; C.save(); return car; };

  // ================= hooks: counters for Missions, the Inbox's match reports =================
  const wrap = (name, f) => { const o = C[name]; if (o) C[name] = (...a) => f(o, ...a); };
  const ms = k => { const M = meta(); M.ms[k] = (M.ms[k] || 0) + 1; };
  wrap('sendOffer', (o, ...a) => { ms('offers'); C.dailyEvent('offer'); return o(...a); });
  wrap('collect', (o, ...a) => { const r = o(...a); if (r) { ms('collect'); C.dailyEvent('collect'); } return r; });
  wrap('pbStart', (o, ...a) => { const r = o(...a); if (r === true) { ms('research'); C.dailyEvent('research'); } return r; });
  wrap('startUpgrade', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('upgrade'); return r; });
  wrap('adSpeedUp', (o, ...a) => { const r = o(...a); if (r) { C.dailyEvent('ad'); C.dailyEvent('speed'); } return r; });
  wrap('finishNow', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('speed'); return r; });
  wrap('useSpeed', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('speed'); return r; });
  wrap('claimGift', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('gift'); return r; });
  wrap('adReward', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('ad'); return r; });
  wrap('treat', (o, ...a) => { const r = o(...a); if (r === true) C.dailyEvent('medical'); return r; });
  wrap('applyResult', (o, m, f) => { const rep = o(m, f), my = rep.my, us = my === 0 ? rep.hs : rep.as, them = my === 0 ? rep.as : rep.hs, S = C.sea(), opp = S.teams[my === 0 ? rep.a : rep.h];
    ms('match'); C.dailyEvent('match'); if (us > them) { ms('win'); C.dailyEvent('win'); }
    const potm = rep.potm ? ` Player of the Match: <b>${C.esc(rep.potm.n)}</b>.` : '';
    C.mail('match', us > them ? '🏆' : us < them ? '📉' : '🤝', `${us > them ? 'Win' : us < them ? 'Defeat' : 'Draw'} ${us}–${them} vs ${opp.name}`, `${my === 0 ? 'Home' : 'Away'} · ${rep.md === 0 ? 'Friendly' : 'Match ' + rep.md}.${potm}`, null);
    meta().inbox[0].md = rep.md; meta().inbox[0].read = true;
    if (S.end && S.end.pos <= 4) ms('top4'); C.save(); return rep; });

  A.cswap = v => { C.swapCoach(v); C.ui.refresh(); C.render(); };
  // the Home tiles and campus buttons link here
  A.events = () => C.openEvents();
})(window.CFC);
