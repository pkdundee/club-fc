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
  // speed-ups have types: general work on anything, the others only on their own queue (round 6). [icon, name, minutes, type]
  const XN = { sp5: ['⏩', '5m speed-up', 5, 'g'], sp15: ['⏩', '15m speed-up', 15, 'g'], sp60: ['⏩', '1h speed-up', 60, 'g'], sp180: ['⏩', '3h speed-up', 180, 'g'],
    spb15: ['🔨', '15m building speed-up', 15, 'b'], spb60: ['🔨', '1h building speed-up', 60, 'b'], spt15: ['🏋️', '15m training speed-up', 15, 't'], spt60: ['🏋️', '1h training speed-up', 60, 't'], spr15: ['📋', '15m research speed-up', 15, 'r'], spr60: ['📋', '1h research speed-up', 60, 'r'],
    crate: ['📦', 'Booster crate ($5K)'], badge: ['🏅', 'Coaching Badge'] };
  C.XN = XN;
  C.speedKeys = type => Object.keys(XN).filter(k => XN[k][3] && (XN[k][3] === 'g' || XN[k][3] === type));
  const ICON = { gold: '<i class="coin"></i>', cash: '💵', cp: '<i class="cpi"></i>', manual: '📗', credits: '🎫', kit: '🧴', books: '📕', tokens: '🎟', rare: '🎁', coach: '🧑‍🏫' };
  const NAME = { gold: 'Coins', cash: 'Booster $', cp: 'Coaching Points', manual: 'Coaching manual', credits: 'Clinic Credits', kit: 'Recovery kit', books: 'Trait Book', tokens: 'Number Change', rare: 'Rare recruit', coach: 'Rare coach' };
  const TIER = { spb15: 2, spb60: 3, spt15: 2, spt60: 3, spr15: 2, spr60: 3, badge: 3, gold: 3, coach: 4, rare: 4, books: 3, sp60: 3, sp180: 4, crate: 2, sp15: 2, cash: 1, cp: 1, manual: 1, credits: 1, kit: 1, tokens: 2, sp5: 1 };
  const oText = C.rwText, oGive = C.giveReward;
  C.rwText = r => { const a = {}, b = []; for (const k in r) { if (XN[k]) b.push(`${XN[k][0]} ${r[k] > 1 ? r[k] + '× ' : ''}${XN[k][1]}`); else a[k] = r[k]; } return [Object.keys(a).length ? oText(a) : '', ...b].filter(Boolean).join(' · '); };
  C.giveReward = r => { const a = {}, inv = C.car() ? meta().inv : null; for (const k in r) { if (XN[k]) { if (inv) inv[k] = (inv[k] || 0) + r[k]; } else a[k] = r[k]; } oGive(a); C.save(); };
  // rewards as item tiles (Last War style): icon, amount, colour by value
  C.itemTiles = r => `<span class="itiles">${Object.keys(r).map(k => { const v = r[k], ic = XN[k] ? XN[k][0] : ICON[k] || '🎁', lab = k === 'cash' ? C.short(v) : XN[k] && XN[k][2] ? (XN[k][2] >= 60 ? XN[k][2] / 60 + 'h' : XN[k][2] + 'm') + (v > 1 ? ' ×' + v : '') : k === 'crate' ? '$5K' + (v > 1 ? ' ×' + v : '') : v;
    return `<span class="itile t${TIER[k] || 1}" title="${C.esc(XN[k] ? XN[k][1] : NAME[k] || k)}">${ic}<b>${lab}</b></span>`; }).join('')}</span>`;

  // use a speed-up on something running: b = building, t = training, r = research
  const target = (kind, id) => kind === 'b' ? C.inQueue(id) : kind === 't' ? C.inDev(id) : C.car().pbq.find(q => q.key === id);
  C.useSpeed = (kind, id, key) => { const inv = meta().inv, q = target(kind, id), x = XN[key]; if (!q || !(inv[key] > 0) || !(x[3] === 'g' || x[3] === kind)) return false; inv[key]--; q.end -= x[2] * 60000; C.save(); if (kind === 'b') C.tick(); return true; };
  C.speedRow = (kind, id) => { const inv = meta().inv, ks = C.speedKeys(kind).filter(k => inv[k] > 0); return ks.length ? `<div class="spitems">${ks.map(k => `<button data-act="usespeed" data-v="${kind}|${id}|${k}">${XN[k][0]} ${XN[k][2] >= 60 ? XN[k][2] / 60 + 'h' : XN[k][2] + 'm'}<em>×${inv[k]}</em></button>`).join('')}</div>` : ''; };
  C.openCrate = () => { const inv = meta().inv; if (!(inv.crate > 0)) return false; inv.crate--; C.car().cash += 5000; C.save(); return true; };

  // ================= Inventory =================
  let invTab = 'speed';
  C.openInventory = () => C.ui.open('Inventory', () => {
    const car = C.car(), inv = meta().inv, S = C.staffState(), it = car.items || {};
    const tabs = [['speed', 'Speed-ups'], ['gear', 'Gear'], ['res', 'Resources'], ['special', 'Special']];
    const cell = (icon, n, label, act, v, cls = 't1') => `<button class="invc ${cls} ${n ? '' : 'none'}" ${n && act ? `data-act="${act}" data-v="${v}"` : 'disabled'}><span>${icon}</span><b>${n}</b><small>${label}</small></button>`;
    let body = '';
    if (invTab === 'speed') body = Object.keys(XN).filter(k => XN[k][3]).map(k => cell(XN[k][0], inv[k] || 0, XN[k][1].replace(' speed-up', ''), 'invspeed', k, 't' + TIER[k])).join('');
    if (invTab === 'gear') return `<div class="res hres inv">${C.resBar()}</div><div class="bigtabs">${tabs.map(([k, n]) => `<button class="${invTab === k ? 'on' : ''}" data-act="invtab" data-v="${k}">${n}</button>`).join('')}</div>${C.kitRoomHTML ? C.kitRoomHTML() : ''}<p class="note">Equip gear from a player's card. It returns here when a player leaves. Gear comes from Missions, chests and the free Pass track.</p>`;
    if (invTab === 'res') body = cell('📦', inv.crate || 0, '$5K crate', 'invcrate', '', 't2') + cell('🏅', inv.badge || 0, 'Coaching Badges', 'tab', 'staff', 't3') + cell('📗', S.items.manual, 'Manuals', 'tab', 'staff') + cell('📕', S.items.books, 'Trait Books', 'tab', 'staff', 't3') + cell('🎫', S.items.credits, 'Clinic Credits', 'tab', 'staff');
    if (invTab === 'special') body = cell('🧴', it.kit || 0, 'Recovery kits', 'medical', '') + cell('🎁', it.rareRecruit || 0, 'Rare recruit', 'rare', '', 't4') + cell('🎟', car.tokens || 0, 'Number Changes', 'tab', 'squad', 't2');
    return `<div class="res hres inv">${C.resBar()}</div><div class="bigtabs">${tabs.map(([k, n]) => `<button class="${invTab === k ? 'on' : ''}" data-act="invtab" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="invg">${body}</div><p class="note">${invTab === 'speed' ? 'Tap a speed-up, then pick a building that is being built. Speed-ups come from Missions, the Pass and the Store.' : 'Tap an item to use it or go to where it is used.'}</p>`;
  });
  A.invtab = v => { invTab = v; C.ui.refresh(); };
  A.invcrate = () => { if (C.openCrate()) { C.toast('📦 +$5K Booster $'); C.ui.refresh(); C.render(); } };
  A.invspeed = v => { const car = C.car(), ty = XN[v][3], rows = [];
    if (ty === 'g' || ty === 'b') car.queue.forEach(x => rows.push(['b', x.key, C.BUILDINGS[x.key].icon, `${C.BUILDINGS[x.key].name} → Lv ${x.to}`, C.remaining(x)]));
    if (ty === 'g' || ty === 't') car.devq.forEach(x => { const p = C.P(x.pid); if (p) rows.push(['t', x.pid, '🏋️', `Training: ${C.sn(p)}`, C.remaining(x)]); });
    if (ty === 'g' || ty === 'r') car.pbq.forEach(x => rows.push(['r', x.key, '📋', 'Playbook research', C.remaining(x)]));
    if (!rows.length) return C.toast('Nothing is running that this speed-up can use');
    C.ui.open('Use a speed-up', () => `<p class="note" style="margin-top:0">${XN[v][1]}: pick what to speed up.</p>${rows.map(x => `<button class="lrow" data-act="usespeed" data-v="${x[0]}|${x[1]}|${v}"><span class="li">${x[2]}</span><span class="lt"><b>${C.esc(x[3])}</b><small>${C.dur(x[4])} left</small></span><span class="lr">⏩</span></button>`).join('')}`); };
  A.usespeed = v => { const [kind, id, key] = v.split('|'); if (C.useSpeed(kind, id, key)) { C.toast(`${XN[key][0]} ${XN[key][1]} used`); C.dailyEvent('speed'); C.ui.back(); C.ui.refresh(); C.render(); } };

  // ================= Missions: main tasks (a guided path) and daily tasks with a points track =================
  // main tasks double as the tutorial: pre-season first (coach, campus, recruiting), then the season
  const MAIN = [
    ['bhq', '🏛', "Build the Coaches' Office", c => c.b.hq >= 1, { gold: 10 }, 'tab', 'campus'],
    ['bcamp', '🏗', 'Build your 7 starting buildings', c => ['stadium','training','med','lab','recruit','media','dorms'].every(k => c.b[k] >= 1), { cash: 2000 }, 'tab', 'campus'],
    ['coach', '🧢', 'Hire your first assistant coach', c => (C.staffState().list || []).length >= 1, { cash: 2000 }, 'tab', 'staff'],
    ['hq2', '🏛', "Upgrade the Coaches' Office to Lv 2", c => c.b.hq >= 2, { gold: 20, sp15: 1 }, 'bldopen', 'hq'],
    ['offer', '✉️', 'Make a scholarship offer to a recruit', c => (meta().ms.offers || 0) >= 1, { cp: 30 }, 'tab', 'recruit'],
    ['sign', '✍️', 'Sign a recruit', c => (c.rec && c.rec.signed || 0) >= 1, { cash: 3000 }, 'tab', 'recruit'],
    ['collect', '💵', 'Collect income on campus', c => (meta().ms.collect || 0) >= 1, { crate: 1 }, 'tab', 'campus'],
    ['research', '📋', 'Start Playbook research', c => (meta().ms.research || 0) >= 1, { cp: 40 }, 'playbook', ''],
    ['roster', '👕', 'Fill the roster to 22 players', c => c.squad.length >= 22, { gold: 30 }, 'tab', 'recruit'],
    ['start', '🏁', 'Start the season', c => !c.pre, { gold: 50, sp60: 1 }, 'preseason', ''],
    ['play', '⚽', 'Play your first match', c => (meta().ms.match || 0) >= 1, { sp60: 1 }, 'prematch', ''],
    ['train', '🏋️', 'Start a training plan', c => (meta().ms.train || 0) >= 1, { manual: 2, gear: 1 }, 'tab', 'squad'],
    ['win', '🏆', 'Win a match', c => (meta().ms.win || 0) >= 1, { gold: 30, crate: 1 }, 'prematch', ''],
    ['hq3', '🏛', "Upgrade the Coaches' Office to Lv 3", c => c.b.hq >= 3, { sp60: 2, badge: 5 }, 'bldopen', 'hq'],
    ['video', '🎞', 'Upgrade the Analysis Suite to Lv 2', c => c.b.video >= 2, { gold: 40 }, 'bldopen', 'video'],
    ['wins3', '🏆', 'Win 3 matches', c => (meta().ms.win || 0) >= 3, { gold: 60, books: 1, gear: 2 }, 'prematch', ''],
    ['hq5', '🏛', "Reach Coaches' Office Lv 5", c => c.b.hq >= 5, { gold: 80, sp180: 1 }, 'bldopen', 'hq'],
    ['gym', '🏋️', 'Upgrade the Gym to Lv 2', c => c.b.gym >= 2, { sp15: 2 }, 'bldopen', 'gym'],
    ['top4', '📊', 'Finish a season in the top 4', c => (meta().ms.top4 || 0) >= 1, { gold: 150, rare: 1 }, 'tab', 'season']
  ];
  C.MAIN = MAIN;
  C.mainDone = id => meta().main.includes(id);
  // recruiting is a main task only while there are roster spots to fill (FEEDBACK 95), after the opening build tasks
  C.mainNext = () => { const car = C.car(), t = MAIN.find(t => !meta().main.includes(t[0])) || null;
    if (t && (t[0] === 'bhq' || t[0] === 'bcamp')) return t;
    const open = C.rosterCap(car) - car.squad.length;
    if (open > 0 && !(t && t[3](car))) return ['recfill', '✉️', `Fill ${open} open roster spot${open > 1 ? 's' : ''}`, () => false, {}, 'tab', 'recruit'];
    return t; };
  C.mainReady = () => { const car = C.car(); return MAIN.filter(t => !meta().main.includes(t[0]) && t[3](car)).length; };
  C.mainClaim = id => { const t = MAIN.find(x => x[0] === id), M = meta(); if (!t || M.main.includes(id) || !t[3](C.car())) return null; M.main.push(id); C.giveReward(t[4]); C.save(); return t[4]; };

  // daily tasks: 6 a day, 20 points each, chests at 20/40/60/90/120
  const DAILY = [['match', '⚽', 'Play a match', 1, 'prematch', ''], ['win', '🏆', 'Win a match', 1, 'prematch', ''], ['collect', '💵', 'Collect income 3 times', 3, 'tab', 'campus'], ['upgrade', '🔨', 'Start an upgrade', 1, 'blist', ''],
    ['train', '🏋️', 'Start a training plan', 1, 'tab', 'squad'], ['research', '📋', 'Start Playbook research', 1, 'playbook', ''],
    ['speed', '⏩', 'Use a speed-up', 1, 'inventory', ''], ['medical', '🩺', 'Use a physio or recovery item', 1, 'medical', '']];
  const LOGIN = ['login', '🎁', 'Claim login reward', 1, 'dailytasks', ''];
  const DREW = { login: C.GIFT, match: { cash: 1500 }, win: { gold: 10 }, collect: { cp: 15 }, upgrade: { spb15: 1 }, train: { spt15: 1 }, research: { spr15: 1 }, offer: { cash: 1000 }, speed: { sp5: 1 }, medical: { kit: 1 } };
  const CHESTS = [[20, { sp5: 2, cash: 1500 }], [40, { cp: 30, crate: 1 }], [60, { gold: 15, kit: 1, badge: 1 }], [90, { spt15: 1, spb15: 1, gear: 1 }], [120, { gold: 40, sp60: 1, badge: 3 }]];
  C.CHESTS = CHESTS;
  function rollDaily() { const M = meta(); if (M.day === dayKey()) {
      // a list made by an earlier build: drop tasks that no longer exist, put the login reward first
      if (!M.daily.some(t => t.id === 'login')) { M.daily = [{ id: 'login', n: 1, goal: 1, claimed: false }].concat(M.daily.filter(t => DAILY.some(x => x[0] === t.id))); } return; }
    // anything finished but not claimed yesterday goes to the Inbox, so it isn't lost
    const left = {}; (M.daily || []).forEach(t => { if (t.n >= t.goal && !t.claimed) Object.entries(DREW[t.id] || {}).forEach(([k, v]) => left[k] = (left[k] || 0) + v); });
    CHESTS.forEach(([p, r], i) => { if (M.pts >= p && !M.chests.includes(i)) Object.entries(r).forEach(([k, v]) => left[k] = (left[k] || 0) + v); });
    if (Object.keys(left).length && M.day) C.mail('rewards', '🎁', 'Unclaimed daily rewards', "You finished these yesterday but didn't claim them. Here they are.", left);
    // (a day you don't sign in never gets a task list, so nothing is mailed for it: sign in, or miss out)
    M.day = dayKey(); M.pts = 0; M.chests = [];
    const r = C.rng(new Date().getDate() * 131 + new Date().getMonth() * 17), pool = DAILY.slice();
    M.daily = [{ id: 'login', n: 1, goal: 1, claimed: false }].concat([0, 1, 2, 3, 4].map(() => { const t = pool.splice(Math.floor(r() * pool.length), 1)[0]; return { id: t[0], n: 0, goal: t[3], claimed: false }; })); }
  C.daily = () => { rollDaily(); const M = meta(); M.daily = M.daily.filter(t => t.id === 'login' || DAILY.some(x => x[0] === t.id)); return M.daily.map(t => Object.assign({}, t, { def: t.id === 'login' ? LOGIN : DAILY.find(x => x[0] === t.id) })); };
  C.loginClaimed = () => { rollDaily(); const t = meta().daily.find(x => x.id === 'login'); return !t || t.claimed; };
  C.giftClaimed = () => !C.car() || C.loginClaimed();
  C.dailyEvent = (id, n = 1) => { if (!C.car()) return; rollDaily(); meta().daily.forEach(t => { if (t.id === id) t.n = Math.min(t.goal, t.n + n); }); };
  C.dailyClaim = i => { const M = meta(), t = M.daily[i]; if (!t || t.claimed || t.n < t.goal) return null; t.claimed = true; M.pts += 20; const r = DREW[t.id]; C.giveReward(r); return r; };
  C.chestOpen = i => { const M = meta(); if (M.chests.includes(i) || M.pts < CHESTS[i][0]) return null; M.chests.push(i); C.giveReward(CHESTS[i][1]); return CHESTS[i][1]; };

  // ================= themed events: 14 days each, back to back, on a fixed diary (round 6) =================
  // Free track: one drop a day; claim it on the day or it's gone. Premium packs ($4.99, then $9.99) open their tracks:
  // everything up to today can be redeemed at once, and anything uncollected when the event ends is mailed.
  const dayNo = () => Math.floor((new Date().setHours(12, 0, 0, 0)) / 864e5);
  const big = i => (i + 1) % 7 === 0;
  const THEMES = [
    { id: 'coaching', icon: '🧢', name: 'Coaching Event', desc: 'Build your staff and your Playbook faster.', free: i => big(i) ? { cp: 70, badge: 2 } : { cp: 25 },
      p1: i => [{ manual: 2 }, { credits: 10 }, { badge: 2 }, { manual: 3 }, { spr15: 2 }, { credits: 15 }, { badge: 4 }][i % 7], p2: i => i === 13 ? { coach: 1, gold: 100 } : [{ badge: 4 }, { books: 1 }, { manual: 5 }, { gold: 40 }, { spr60: 1 }, { credits: 25 }, { badge: 8 }][i % 7] },
    { id: 'building', icon: '🔨', name: 'Building Event', desc: 'Raise your campus faster.', free: i => big(i) ? { cash: 5000, spb15: 2 } : { cash: 1200 },
      p1: i => [{ spb15: 2 }, { cash: 4000 }, { crate: 1 }, { spb15: 3 }, { cash: 6000 }, { crate: 2 }, { spb60: 1 }][i % 7], p2: i => i === 13 ? { gold: 150, cash: 30000 } : [{ spb60: 1 }, { cash: 10000 }, { gold: 40 }, { spb60: 2 }, { cash: 15000 }, { crate: 3 }, { spb60: 3 }][i % 7] },
    { id: 'training', icon: '🏋️', name: 'Training Event', desc: 'Develop your players faster.', free: i => big(i) ? { spt15: 2, gear: 1 } : { cash: 800 },
      p1: i => [{ spt15: 2 }, { cash: 3000 }, { spt15: 2 }, { tokens: 1 }, { spt15: 3 }, { cash: 5000 }, { spt60: 1 }][i % 7], p2: i => i === 13 ? { gold: 150, spt60: 3 } : [{ spt60: 1 }, { gold: 30 }, { spt60: 1 }, { cash: 10000 }, { spt60: 2 }, { gold: 40 }, { spt60: 2 }][i % 7] },
    { id: 'recovery', icon: '🧴', name: 'Recovery Event', desc: 'Keep your squad fresh and fit.', free: i => big(i) ? { kit: 3 } : i % 2 ? { credits: 4 } : { kit: 1 },
      p1: i => [{ kit: 2 }, { credits: 10 }, { kit: 3 }, { gold: 15 }, { kit: 3 }, { credits: 15 }, { kit: 5 }][i % 7], p2: i => i === 13 ? { gold: 150, kit: 10 } : [{ kit: 4 }, { gold: 30 }, { kit: 5 }, { credits: 25 }, { kit: 5 }, { gold: 40 }, { kit: 8 }][i % 7] },
    { id: 'recruiting', icon: '✉️', name: 'Recruiting Event', desc: 'Find and sign better players.', free: i => big(i) ? { cp: 40, tokens: 1 } : { cash: 1000 },
      p1: i => [{ cp: 40 }, { tokens: 1 }, { cash: 4000 }, { gold: 15 }, { cp: 50 }, { cash: 6000 }, { tokens: 2 }][i % 7], p2: i => i === 13 ? { rare: 1, gold: 100 } : [{ gold: 30 }, { cp: 80 }, { cash: 10000 }, { gold: 30 }, { tokens: 2 }, { cash: 15000 }, { gold: 60 }][i % 7] }
  ];
  const EV_DAYS = 14, evAt = n => { const idx = Math.floor(n / EV_DAYS); return { idx, th: THEMES[idx % THEMES.length], start: idx * EV_DAYS, today: n - idx * EV_DAYS }; };
  const fmtDay = n => new Date(n * 864e5).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  C.curEvent = () => evAt(dayNo());
  C.evx = () => { const M = meta(), E = C.curEvent(); if (!M.evx || M.evx.idx !== E.idx) { const o = M.evx;
      // the event ended: purchased rewards never get lost, they're mailed. Free drops are gone.
      if (o && (o.has1 || o.has2)) { const T = THEMES[o.idx % THEMES.length], got = {}; const add = r => { for (const k in r) got[k] = (got[k] || 0) + r[k]; }; for (let i = 0; i < EV_DAYS; i++) { if (o.has1 && !o.p1.includes(i)) add(T.p1(i)); if (o.has2 && !o.p2.includes(i)) add(T.p2(i)); } if (Object.keys(got).length) C.mail('rewards', T.icon, `${T.name}: your uncollected rewards`, 'Your premium rewards from the event that just ended.', got); }
      M.evx = { idx: E.idx, from: E.today, f: [], p1: [], p2: [], has1: false, has2: false }; } return M.evx; };
  const trackOf = (th, tr, i) => tr === 'f' ? th.free(i) : tr === 'p1' ? th.p1(i) : th.p2(i);
  C.evCanClaim = (tr, i) => { const X = C.evx(), E = C.curEvent(); if (X[tr].includes(i)) return false; if (tr === 'f') return i === E.today; if (i > E.today) return false; return tr === 'p1' ? X.has1 : X.has2; };
  C.evClaim = (tr, i) => { if (!C.evCanClaim(tr, i)) return null; const X = C.evx(), r = trackOf(C.curEvent().th, tr, i); X[tr].push(i); C.giveReward(r); return r; };
  C.evClaimAll = () => { const E = C.curEvent(), got = {}; for (let i = 0; i <= E.today; i++) for (const tr of ['f', 'p1', 'p2']) { const r = C.evClaim(tr, i); if (r) for (const k in r) got[k] = (got[k] || 0) + r[k]; } return Object.keys(got).length ? got : null; };
  C.evClaimable = () => { const E = C.curEvent(); let n = 0; for (let i = 0; i <= E.today; i++) for (const tr of ['f', 'p1', 'p2']) if (C.evCanClaim(tr, i)) n++; return n; };
  C.passPts = () => {};   // kept for older callers
  C.evBuy = n => { const X = C.evx(), E = C.curEvent(); if (n === 1) { if (X.has1) return 'owned'; X.has1 = true; } else { if (!X.has1) return 'need1'; if (X.has2) return 'owned'; X.has2 = true; } C.mail('purchases', '🧾', `Purchase: ${E.th.name} ${n === 1 ? '$4.99' : '$9.99'} pack`, 'Rewards up to today can be redeemed in the event. Anything uncollected is mailed when it ends.<br><small>Test store: nothing was charged.</small>', null); C.save(); return true; };

  // ================= Events hub: big tabs (Pass · Missions · Event) =================
  let evTab = 'missions', msTab = 'daily';
  C.openEvents = t => { if (t) evTab = t; C.ui.open('Events', eventsHTML); };
  A.evtab = v => { evTab = v; C.ui.refresh(); };
  A.mstab = v => { msTab = v; C.ui.refresh(); };
  A.dailytasks = () => { evTab = 'missions'; msTab = 'daily'; C.ui.closeAll(); C.openEvents(); };
  A.dailygift = A.dailytasks;
  // tabs: icon over label, full width, red-dot counts (round 6)
  function bigTabs() { const E = C.curEvent(), dots = { missions: C.mainReady() + C.daily().filter(t => t.n >= t.goal && !t.claimed).length + CHESTS.filter(([p], i) => meta().pts >= p && !meta().chests.includes(i)).length, event: C.evClaimable(), cal: 0 };
    return `<div class="evtabs">${[['missions', '🎯', 'Missions'], ['event', E.th.icon, E.th.name.replace(' Event', '')], ['cal', '📅', 'Calendar']].map(([k, ic, n]) => `<button class="${evTab === k ? 'on' : ''}" data-act="evtab" data-v="${k}"><span>${ic}</span>${n}${dots[k] ? `<em>${dots[k]}</em>` : ''}</button>`).join('')}</div>`; }
  function eventsHTML() {
    if (evTab === 'event') return bigTabs() + eventHTML();
    if (evTab === 'cal') return bigTabs() + calHTML();
    const dd = C.daily().filter(t => t.n >= t.goal && !t.claimed).length;
    const sub = `<div class="subtabs">${[['daily', 'Daily tasks', dd], ['main', 'Main tasks', C.mainReady()]].map(([k, n, d]) => `<button class="${msTab === k ? 'on' : ''}" data-act="mstab" data-v="${k}">${n}${d ? ` <em>${d}</em>` : ''}</button>`).join('')}</div>`;
    if (msTab === 'main') {
      const car = C.car(), M = meta(), open = MAIN.filter(t => !M.main.includes(t[0])).slice(0, 5);
      const rows = open.map(t => { const ok = t[3](car); return `<div class="mrow2"><div class="mh"><span>${t[1]}</span><b>${C.esc(t[2])}</b></div><div class="mb">${C.itemTiles(t[4])}${ok ? `<button class="btn sm2 claim" data-act="mainclaim" data-v="${t[0]}">Claim</button>` : `<button class="btn sm2 go" data-act="${t[5]}" data-v="${t[6]}">Go</button>`}</div></div>`; }).join('');
      return bigTabs() + sub + `<p class="note" style="margin-top:0">${M.main.length} of ${MAIN.length} done. Each one teaches a part of running your program.</p>${rows || '<p class="note">All main tasks done. 🎉</p>'}`;
    }
    const M = meta(), list = C.daily(), max = CHESTS[CHESTS.length - 1][0];
    const track = `<div class="ptrack"><div class="pstar"><i>★</i><b>${M.pts}</b></div><div class="pline"><div class="pfill" style="width:${Math.min(100, M.pts / max * 100)}%"></div>${CHESTS.map(([p], i) => `<button class="pchest ${M.chests.includes(i) ? 'got' : M.pts >= p ? 'ready' : ''}" style="left:${p / max * 100}%" data-act="chestopen" data-v="${i}">🧰<small>${p}</small></button>`).join('')}</div></div>`;
    const rows = list.map((t, i) => `<div class="mrow2 ${t.claimed ? 'done' : ''} ${t.id === 'login' && !t.claimed ? 'alert' : ''}"><div class="mh"><span>${t.def[1]}</span><b>${C.esc(t.def[2])}${t.id === 'login' ? '' : ` <small>(${t.n}/${t.goal})</small>`}</b>${t.id === 'login' && !t.claimed ? '<i class="ldot"></i>' : ''}</div><div class="mb">${C.itemTiles(Object.assign({ pts: 20 }, DREW[t.id]))}
      ${t.claimed ? '<span class="donechk">✔</span>' : t.n >= t.goal ? `<button class="btn sm2 claim" data-act="dailyclaim" data-v="${i}">Claim</button>` : `<button class="btn sm2 go" data-act="${t.def[4]}" data-v="${t.def[5]}">Go</button>`}</div></div>`).join('');
    return bigTabs() + sub + `<div class="nextref">⏱ New tasks in ${C.dur((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)}</div>${track}${rows}`;
  }
  ICON.pts = '<i class="ptsi">★</i>'; TIER.pts = 2; NAME.pts = 'Mission points';
  // the current themed event
  function eventHTML() {
    const X = C.evx(), E = C.curEvent(), th = E.th, left = (E.start + EV_DAYS) * 864e5 - Date.now();
    const cell = (tr, i) => { const got = X[tr].includes(i), can = C.evCanClaim(tr, i), lock = (tr === 'p1' && !X.has1) || (tr === 'p2' && !X.has2), missed = tr === 'f' && i < E.today && i >= (X.from || 0) && !got;
      return `<button class="pcell ${tr} ${got ? 'got' : ''} ${can ? 'ready' : ''} ${missed ? 'miss' : ''}" ${can ? `data-act="evclaim" data-v="${tr}|${i}"` : 'disabled'}>${lock ? '<i class="plock">🔒</i>' : ''}${C.itemTiles(trackOf(th, tr, i))}${got ? '<i class="pgot">✔</i>' : ''}${missed ? '<i class="pgot mis">Missed</i>' : ''}</button>`; };
    const rows = Array.from({ length: EV_DAYS }, (_, i) => `<div class="prow3 ${i <= E.today ? 'un' : ''} ${i === E.today ? 'now' : ''}"><b class="pday">${i + 1}</b>${cell('f', i)}${cell('p1', i)}${cell('p2', i)}</div>`).join('');
    return `<div class="card passhd2"><b>${th.icon} ${th.name}</b><small>Day ${E.today + 1} of ${EV_DAYS} · ${C.dur(left / 1000)} left · ${fmtDay(E.start)} – ${fmtDay(E.start + EV_DAYS - 1)}</small><p>${th.desc} Claim today's free drop on the day or it's gone. Premium packs open everything up to today, and uncollected premium rewards are mailed when the event ends.</p>
        <div class="evpacks"><button class="btn ${X.has1 ? 'sec2' : 'gold'}" data-act="evbuy" data-v="1" ${X.has1 ? 'disabled' : ''}>${X.has1 ? '✔ Pack 1' : 'Pack 1 · $4.99'}</button><button class="btn ${X.has2 ? 'sec2' : X.has1 ? 'gold' : 'sec2'}" data-act="evbuy" data-v="2" ${X.has2 ? 'disabled' : ''}>${X.has2 ? '✔ Pack 2' : X.has1 ? 'Pack 2 · $9.99' : '🔒 Pack 2 · $9.99'}</button></div></div>
      <div class="prow3 head"><b class="pday">Day</b><span>Free</span><span>$4.99</span><span>$9.99</span></div>${rows}
      <button class="btn full pri" data-act="evall" style="margin-top:10px">Claim all</button>`;
  }
  // the calendar shows now and next, never the whole schedule
  function calHTML() {
    const E = C.curEvent(), N = evAt(E.start + EV_DAYS), ev = C.event();
    const card = (e, tag) => `<div class="calcard ${tag === 'Now' ? 'now' : ''}"><span class="ci">${e.th.icon}</span><div><em>${tag}</em><b>${e.th.name}</b><small>${fmtDay(e.start)} – ${fmtDay(e.start + EV_DAYS - 1)}</small><p>${e.th.desc}</p></div></div>`;
    return `<h3 class="jh" style="margin-top:2px">Event calendar</h3>${card(E, 'Now')}${card(N, 'Next')}
      <h3 class="jh">This week, free for everyone</h3><div class="card evcard"><span>${ev.icon}</span><div><b>${ev.name}</b><p>${ev.desc}</p><small>Applies automatically · ends in ${C.dur((C.eventEnds() - C.now()) / 1000)}</small></div></div>
      <h3 class="jh">Rewards</h3>${C.streakHTML ? C.streakHTML() + C.piggyHTML() : ''}
      ${C.isVip() ? `<button class="btn full ${C.lo().vipDay !== dayKey() ? 'pri' : 'sec2'}" data-act="vipdaily" style="margin-top:8px" ${C.lo().vipDay !== dayKey() ? '' : 'disabled'}>👑 Coach's Club daily: <i class="coin"></i> 25</button>` : ''}`;
  }
  A.mainclaim = v => { const r = C.mainClaim(v); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  A.dailyclaim = v => { const r = C.dailyClaim(+v); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  // an unearned chest shows one preview, straight away, just above the chest that was tapped (FEEDBACK 78, 95)
  A.chestopen = (v, el) => { const r = C.chestOpen(+v); if (r) { C.toast('🧰 ' + C.rwText(r)); C.ui.refresh(); C.render(); return; } C.rewardPreview(CHESTS[+v][1], el); };
  A.evclaim = v => { const [t, i] = v.split('|'), r = C.evClaim(t, +i); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  A.evall = () => { const r = C.evClaimAll(); C.toast(r ? '✔ ' + C.rwText(r) : 'Nothing to claim yet'); C.ui.refresh(); C.render(); };
  A.evbuy = (v, el) => { const n = +v, X = C.evx(); if (n === 2 && !X.has1) return C.toast('Buy the $4.99 pack first');
    if (!(el && el.dataset.ok)) return C.confirm('Confirm purchase', `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store: nothing is charged.</div><p class="note">${C.curEvent().th.name} · Pack ${n} · ${n === 1 ? '$4.99' : '$9.99'}: opens this track, with everything up to today ready to redeem.</p>`, 'Buy ' + (n === 1 ? '$4.99' : '$9.99'), 'evbuy', v);
    if (C.evBuy(n) === true) { C.toast('✅ Test purchase complete'); C.ui.refresh(); C.render(); } };
  A.inventory = () => C.openInventory();
  // the comms button: "this is what to do next", straight to Main Tasks
  A.nexttask = () => { evTab = 'missions'; msTab = 'main'; C.ui.closeAll(); C.openEvents(); };
  // building action buttons open popups over the map
  A.bpop = v => { C.ui.asPopup = true; if (v === 'proginfo') C.openProgramInfo(); else if (v === 'playbook') C.openPlaybook(); else if (v === 'medical') C.openMedical(); else if (v === 'hqstaff') C.openStaffPop(); else if (v === 'kitroom') C.openKitRoom(); else if (v === 'academic') C.openAcademic(); };
  C.openStaffPop = () => C.ui.open('Staff on duty', () => { const S = C.staffState();
    return `<div class="hgrid" style="padding:0">${S.list.map(c => `<button class="hcard" data-act="coach" data-v="${c.id}" style="--rc:${C.RARITY[c.rar][1]}"><span class="hlv">Lv.${c.level}</span>${S.on.includes(c.id) ? '<em class="hon">ON</em>' : ''}<div class="hpic">${C.coachFace(c)}</div><b>${C.esc(c.fn)} ${C.esc(c.ln)}</b><small>${C.SPECS[c.spec][0]} ${C.SPECS[c.spec][1]}</small></button>`).join('')}</div>
      <div class="jbtns" style="grid-template-columns:1fr 1fr;margin-top:10px"><button class="btn sec2" data-act="market">🧑‍🏫 Market</button><button class="btn sec2" data-act="search">🎲 Search</button></div>`; });
  A.preseason = () => C.openPreseason();
  const oBuyPack = C.buyPack; C.buyPack = id => { const r = oBuyPack(id); if (r !== 'owned' && C.car()) { receipt(C.PACKS[id] ? C.PACKS[id].name || id : id, C.PACKS[id] && C.PACKS[id].r); } return r; };

  // claimable count for red dots (replaces the calendar-based count)
  C.loClaimable = () => { if (!C.car()) return 0; const M = meta(); return C.evClaimable() + C.mainReady() + C.daily().filter(t => t.n >= t.goal && !t.claimed).length + CHESTS.filter(([p], i) => M.pts >= p && !M.chests.includes(i)).length + (C.isVip() && C.lo().vipDay !== dayKey() ? 1 : 0); };

  // ================= Inbox: one place for messages, by topic =================
  C.mail = (f, icon, title, body, r) => { const M = meta(); M.inbox.unshift({ id: 'm' + C.now() + Math.floor(Math.random() * 1e4), f, icon, title, body, r: r || null, claimed: false, read: false, t: C.now() }); M.inbox = M.inbox.filter(x => C.now() - x.t < 30 * D || x.fav).slice(0, 120); C.save(); };
  function receipt(name, r) { C.mail('purchases', '🧾', 'Purchase: ' + name, `Thanks for your purchase. ${r ? 'Received: ' + C.rwText(r) + '.' : ''}<br><small>Test store: nothing was charged.</small>`, null); }
  const FOLDERS = [['match', '📋', 'Match reports'], ['director', '🏛', 'Director'], ['rewards', '🎁', 'Rewards'], ['purchases', '🧾', 'Purchases'], ['system', '⚙️', 'News & updates'], ['fav', '⭐', 'Favourites']];
  C.inboxUnread = () => { const car = C.car(); if (!car) return 0; sysMail(); return meta().inbox.filter(x => !x.read || (x.r && !x.claimed)).length + C.adUnread(); };
  function sysMail() { const M = meta(); if (!M.seenSys.includes('9h')) { M.seenSys.push('9h'); C.mail('system', '📣', 'New: Missions, the Pass, Inbox and Inventory', `Ray here. A few changes around the office:<br>• <b>Missions</b> (in Events): main tasks guide you step by step, daily tasks fill a points track with chests.<br>• <b>Themed events</b> replace the old calendar: claim a free drop each day.<br>• <b>Inventory</b> holds speed-ups and items.<br>• This <b>Inbox</b> keeps match reports, rewards and receipts.<br>Here's something to get you started.`, { gold: 50, sp15: 2 }); } }
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
  Object.assign(C.PACKS, { packTrain: { name: 'Training Pack', icon: '🏋️', price: '$1.99', r: { spt15: 4, spt60: 2 } }, packCoach: { name: 'Coaching Pack', icon: '🧢', price: '$2.99', r: { manual: 5, badge: 6, spr60: 1 } }, packBuild: { name: 'Building Pack', icon: '🔨', price: '$2.99', r: { spb15: 4, spb60: 2, crate: 2 } }, packRec: { name: 'Recovery Pack', icon: '🧴', price: '$1.99', r: { kit: 6, credits: 10 } } });
  A.evopen = () => { evTab = 'event'; C.ui.closeAll(); C.openEvents(); };
  A.sttab = v => { stTab = v; C.ui.refresh(); };
  C.openStoreAt = t => { stTab = t; C.openStore(); };
  const oStore = C.openStore;
  C.openStore = () => C.ui.open('Store', () => {
    const a = C.acct(), vip = C.isVip(), L = C.lo(), M = meta(); if (M.wk !== weekKey()) { M.wk = weekKey(); M.wbuy = {}; }
    const row = (act, v, icon, name, sub, price, owned) => `<button class="lrow ${owned ? 'lock' : ''}" data-act="${act}" data-v="${v}"><span class="li">${icon}</span><span class="lt"><b>${name}</b><small>${sub}</small></span><span class="lr">${owned ? '✔' : price}</span></button>`;
    const tabs = `<div class="bigtabs">${[['deals', 'Deals'], ['passes', 'Passes'], ['coins', 'Coins'], ['items', 'Items']].map(([k, n]) => `<button class="${stTab === k ? 'on' : ''}" data-act="sttab" data-v="${k}">${n}</button>`).join('')}</div>`;
    const test = `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px;margin-bottom:8px">🧪 Test store. Purchases are simulated and no money is charged.</div>`;
    let body = '';
    if (stTab === 'deals') { const dl = C.todayDeal(), dd = C.dealBought(), fmt = t => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      body = `<div class="pack"><div class="pkh"><b>${dl.icon} Today's deal: ${C.esc(dl.name)}</b><span class="ptag">Daily</span></div>${C.itemTiles(dl.r)}<div class="packft"><small>1 purchase a day</small><button class="btn sm2 ${dd ? 'sec2' : 'pri'}" data-act="buydeal" ${dd ? 'disabled' : ''}>${dd ? '✔ Bought' : `<s>${dl.was}</s> ${dl.price}`}</button></div></div>
        ${C.piggyHTML ? C.piggyHTML() : ''}<h3 class="jh">Weekly deals <small class="devp">${fmt(new Date(weekKey()))} – ${fmt(wkEnd() - 1)}</small></h3>
        ${WEEKLY.map(w => { const n = M.wbuy[w.id] || 0, left = w.lim - n; return `<div class="pack"><div class="pkh"><b>${w.icon} ${w.name}</b><span class="ptag t-${w.tag.toLowerCase()}">${w.tag}</span></div>${C.itemTiles(w.r)}<div class="packft"><small>${left} of ${w.lim} purchase${w.lim > 1 ? 's' : ''} left</small><button class="btn sm2 ${left ? 'pri' : 'sec2'}" data-act="buyweekly" data-v="${w.id}" ${left ? '' : 'disabled'}>${left ? w.price : 'Sold out'}</button></div></div>`; }).join('')}
        ${row('buypack', 'starter', '🎒', 'Starter Pack', C.rwText(C.PACKS.starter.r) + ' · once only', '$1.99', L.cos.includes('starter'))}`; }
    if (stTab === 'passes') body = `<div class="vipcard"><b>👑 Coach's Club</b><p>+1 slot in every queue (build, training, research, staff) · +1 career slot · <i class="coin"></i> 25 every day · rewarded ads without the ad</p>
        <button class="btn full ${vip ? 'sec2' : 'pri'}" data-act="buy" data-v="vip">${vip ? 'Active · ' + Math.ceil((a.vipUntil - C.now()) / 864e5) + ' days left (extend +30)' : 'Join · $4.99 / month'}</button></div>
      <h3 class="jh">${C.curEvent().th.icon} ${C.curEvent().th.name}</h3><button class="lrow" data-act="evopen"><span class="li">${C.curEvent().th.icon}</span><span class="lt"><b>Event packs</b><small>$4.99, then $9.99: open the premium tracks</small></span><span class="lr">›</span></button>`;
    if (stTab === 'coins') body = ['g100', 'g550', 'g1200'].map(k => row('buypack', k, '<i class="coin"></i>', C.PACKS[k].name, 'Speed-ups, coaching searches, agency scouts', C.PACKS[k].price)).join('');
    if (stTab === 'items') body = `<h3 class="jh" style="margin-top:2px">Themed packs</h3>${['packTrain', 'packCoach', 'packBuild', 'packRec'].map(k => `<div class="pack"><div class="pkh"><b>${C.PACKS[k].icon} ${C.PACKS[k].name}</b></div>${C.itemTiles(C.PACKS[k].r)}<div class="packft"><small></small><button class="btn sm2 pri" data-act="buypack" data-v="${k}">${C.PACKS[k].price}</button></div></div>`).join('')}
      ${row('buypack', 'xp', '📗', 'Coach XP bundle', C.rwText(C.PACKS.xp.r), '$2.99')}${row('buypack', 'clinic', '🎫', 'Clinic Credit pack', C.rwText(C.PACKS.clinic.r), '$2.99')}
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
  // ================= Rejuvenate: one place to freshen the squad, offered wherever tiredness shows (round 6) =================
  C.openRejuv = () => C.ui.open('Rejuvenate', () => { const car = C.car(), M = C.medState(), kits = (car.items && car.items.kit) || 0, xi = C.tac().xi.map(C.P).filter(Boolean), tired = car.squad.filter(p => !p.inj && p.energy < 70).sort((a, b) => a.energy - b.energy).slice(0, 8);
    return `<div class="srow"><span>🔋 Starting XI average</span><b>${Math.round(xi.reduce((s, p) => s + p.energy, 0) / (xi.length || 1))}%</b></div>
      <button class="lrow" data-act="teamsess"><span class="li">👥</span><span class="lt"><b>Team session: +12 for the whole squad</b><small>${M.team ? `Free in ${M.team} match${M.team > 1 ? 'es' : ''}` : 'Free now'}</small></span><span class="lr">${M.team ? `${C.GEM} ${C.TREAT.team}` : 'Free'}</span></button>
      <label class="fld">Recovery kits: +25 for one player (you have ${kits})</label>${tired.length ? tired.map(p => `<div class="medrow"><div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(C.sn(p))}</b><small>🔋 ${Math.round(p.energy)}%</small></div><div class="medbt"><button class="btn sm2 ${kits ? 'pri' : 'off'}" data-act="treat" data-v="${p.id}|kit" ${kits ? '' : 'disabled'}>🧴 Kit</button></div></div>`).join('') : '<p class="note">Everyone is fresh.</p>'}
      <div class="jbtns" style="grid-template-columns:1fr 1fr;margin-top:8px"><button class="btn sec2" data-act="buykitc">🧴 Buy kit · ${C.GEM} ${C.TREAT.kit}</button><button class="btn sec2" data-act="storeat" data-v="items">Recovery Pack</button></div>
      <p class="note">Resting a player for a match also restores Freshness: +30 on the bench, +40 out of the squad.</p>`; }, { popup: true });
  A.rejuv = () => C.openRejuv();
  // the Home tiles and campus buttons link here
  A.events = () => C.openEvents();
})(window.CFC);
