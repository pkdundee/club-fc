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
  // 1.03: 1-minute (P9), 8 h and 24 h general items; 3 h and 8 h building and research items; Booster Crates (FEEDBACK 213, 215, PROVISIONAL)
  const XN = { sp1: ['⏩', '1m speed-up', 1, 'g'], sp5: ['⏩', '5m speed-up', 5, 'g'], sp15: ['⏩', '15m speed-up', 15, 'g'], sp60: ['⏩', '1h speed-up', 60, 'g'], sp180: ['⏩', '3h speed-up', 180, 'g'],
    sp480: ['⏩', '8h speed-up', 480, 'g'], sp1440: ['⏩', '24h speed-up', 1440, 'g'],
    spb15: ['🔨', '15m building speed-up', 15, 'b'], spb60: ['🔨', '1h building speed-up', 60, 'b'], spb180: ['🔨', '3h building speed-up', 180, 'b'], spb480: ['🔨', '8h building speed-up', 480, 'b'],
    spt15: ['🏋️', '15m training speed-up', 15, 't'], spt60: ['🏋️', '1h training speed-up', 60, 't'],
    spr15: ['📋', '15m research speed-up', 15, 'r'], spr60: ['📋', '1h research speed-up', 60, 'r'], spr180: ['📋', '3h research speed-up', 180, 'r'], spr480: ['📋', '8h research speed-up', 480, 'r'],
    crate: ['📦', 'Booster crate ($5K)'], badge: ['🏅', 'Coaching Badge'],
    crb1: ['📦', 'Common Booster Crate'], crb2: ['📦', 'Rare Booster Crate'], crb3: ['📦', 'Epic Booster Crate'], crb4: ['📦', 'Legendary Booster Crate'], crc2: ['🎁', 'Rare Choice Crate'],
    crp1: ['🧪', 'Common CP Crate'], crp2: ['🧪', 'Rare CP Crate'], crp3: ['🧪', 'Epic CP Crate'], crp4: ['🧪', 'Legendary CP Crate'], crc4: ['🎁', 'Legendary Choice Crate'] };   // 1.05: CP Crates, Legendary Choice
  // a Crate holds hours of production, sized when it's opened: Booster Crates = Clubhouse output; the Choice Crate = Clubhouse or Performance Lab
  const CRH = { crb1: 1, crb2: 4, crb3: 8, crb4: 24, crc2: 4, crp1: 1, crp2: 4, crp3: 8, crp4: 24, crc4: 24 }; C.CRH = CRH;
  const isChoice = k => /^crc/.test(k), isCP = k => /^crp/.test(k); C.isChoiceCrate = isChoice;
  C.XN = XN;
  C.speedKeys = type => Object.keys(XN).filter(k => XN[k][3] && (XN[k][3] === 'g' || XN[k][3] === type));
  const ICON = { gold: '<i class="coin"></i>', cash: '💵', cp: '<i class="cpi"></i>', manual: '📗', credits: '🎫', kit: '🧴', books: '📕', tokens: '🎟', rare: '🎁', coach: '🧑‍🏫' };
  const NAME = { gold: 'Coins', cash: 'Booster $', cp: 'Coaching Points', manual: 'Coaching manual', credits: 'Clinic Credits', kit: 'Recovery kit', books: 'Trait Book', tokens: 'Number Change', rare: 'Rare recruit', coach: 'Rare coach' };
  const TIER = { sp1: 1, sp480: 4, sp1440: 4, spb180: 3, spb480: 4, spr180: 3, spr480: 4, crb1: 1, crb2: 2, crb3: 3, crb4: 4, crc2: 3, crp1: 1, crp2: 2, crp3: 3, crp4: 4, crc4: 4, spb15: 2, spb60: 3, spt15: 2, spt60: 3, spr15: 2, spr60: 3, badge: 3, gold: 3, coach: 4, rare: 4, books: 3, sp60: 3, sp180: 4, crate: 2, sp15: 2, cash: 1, cp: 1, manual: 1, credits: 1, kit: 1, tokens: 2, sp5: 1 };
  const oText = C.rwText, oGive = C.giveReward;
  C.rwText = r => { const a = {}, b = []; for (const k in r) { if (XN[k]) b.push(`${XN[k][0]} ${r[k] > 1 ? r[k] + '× ' : ''}${XN[k][1]}`); else a[k] = r[k]; } return [Object.keys(a).length ? oText(a) : '', ...b].filter(Boolean).join(' · '); };
  C.giveReward = r => { const a = {}, inv = C.car() ? meta().inv : null; for (const k in r) { if (XN[k]) { if (inv) inv[k] = (inv[k] || 0) + r[k]; } else a[k] = r[k]; } oGive(a); C.save(); };
  // rewards as item tiles (Last War style): icon, amount, colour by value
  C.itemTiles = r => `<span class="itiles">${Object.keys(r).map(k => { const v = r[k], ic = XN[k] ? XN[k][0] : ICON[k] || '🎁', lab = k === 'cash' ? C.full(v) : XN[k] && XN[k][2] ? (XN[k][2] >= 60 ? XN[k][2] / 60 + 'h' : XN[k][2] + 'm') + (v > 1 ? ' ×' + v : '') : k === 'crate' ? '$5K' + (v > 1 ? ' ×' + v : '') : CRH[k] ? CRH[k] + 'h' + (v > 1 ? ' ×' + v : '') : v;
    return `<span class="itile t${TIER[k] || 1}" data-act="itemdet" data-v="${k}|${v}" title="${C.esc(XN[k] ? XN[k][1] : NAME[k] || k)}">${ic}<b>${lab}</b></span>`; }).join('')}</span>`;
  // 1.03.01 (QA-21): tapping any reward or pack item shows what it is (a small popup)
  const DESC = { gold: 'Coins: finish timers, coaching searches and more. Shared by all your careers.', cash: 'Booster $: pays for buildings, research and recruiting.', cp: 'Coaching Points: pay for Playbook research.',
    manual: 'Coaching manual: gives a coach 100 XP.', credits: 'Clinic Credits: pay for coach licences.', kit: "Recovery kit: restores a tired player's Freshness.", books: "Trait Book: upgrades a coach's trait.",
    tokens: 'Number Change: gives a player the shirt number they want.', rare: 'Rare recruit: signs a Rare freshman on academic aid.', coach: 'Rare coach: joins your staff.', badge: "Coaching Badge: raises a coach's stars.",
    crate: 'Booster crate: $5,000 Booster $.', gear: 'Gear: goes to your Kit Room; equip it from a player\'s card.' };
  C.itemInfo = k => { if (CRH[k]) return [XN[k][0], XN[k][1], `${CRH[k]} hours of ${isChoice(k) ? 'Clubhouse or Performance Lab' : isCP(k) ? 'Performance Lab' : 'Clubhouse'} output at your level when opened. Now: ${isCP(k) ? C.full(C.crateAmount(k, 'cp')) + ' Coaching Points' : C.money(C.crateAmount(k, 'cash'))}${isChoice(k) ? ' or ' + C.full(C.crateAmount(k, 'cp')) + ' Coaching Points' : ''}.`];
    if (XN[k] && XN[k][3]) return [XN[k][0], XN[k][1], `Takes ${XN[k][2] >= 60 ? XN[k][2] / 60 + ' h' : XN[k][2] + ' min'} off ${({ g: 'any building, research or training plan', b: 'buildings', r: 'research', t: 'training plans' })[XN[k][3]]}.`];
    return [XN[k] ? XN[k][0] : ICON[k] || '🎁', XN[k] ? XN[k][1] : NAME[k] || k, DESC[k] || '']; };
  A.itemdet = v => { const [k, n] = String(v).split('|'), [ic, nm, ds] = C.itemInfo(k);
    C.ui.open(nm, () => `<div style="text-align:center"><div style="font-size:48px">${ic}</div><b style="font-size:18px">${C.esc(nm)}${+n > 1 && !['cash', 'gold', 'cp'].includes(k) ? ' ×' + n : ['cash'].includes(k) ? ' ' + C.money(+n) : ['gold', 'cp'].includes(k) ? ' ' + C.full(+n) : ''}</b><p class="note">${ds}</p></div>`, { popup: true }); };

  // use a speed-up on something running: b = building, t = training, r = research
  const target = (kind, id) => kind === 'b' ? C.inQueue(id) : kind === 't' ? C.inDev(id) : C.car().pbq.find(q => q.key === id);
  C.useSpeed = (kind, id, key) => { const inv = meta().inv, q = target(kind, id), x = XN[key]; if (!q || !(inv[key] > 0) || !(x[3] === 'g' || x[3] === kind)) return false; inv[key]--; q.end -= x[2] * 60000; C.save(); if (kind === 'b') C.tick(); return true; };
  C.speedRow = (kind, id) => { const inv = meta().inv, ks = C.speedKeys(kind).filter(k => inv[k] > 0); return ks.length ? `<div class="spitems">${ks.map(k => `<button data-act="usespeed" data-v="${kind}|${id}|${k}">${XN[k][0]} ${XN[k][2] >= 60 ? XN[k][2] / 60 + 'h' : XN[k][2] + 'm'}<em>×${inv[k]}</em></button>`).join('')}</div>` : ''; };
  C.openCrate = () => { const inv = meta().inv; if (!(inv.crate > 0)) return false; inv.crate--; C.car().cash += 5000; C.save(); return true; };
  // 1.03: Crates open for hours of production at the building's level now (shown before opening); storage limits don't apply
  C.crateAmount = (k, res) => { if (isCP(k)) res = 'cp'; const lvB = Math.max(1, C.level('booster') || 0), lvL = Math.max(1, C.level('lab') || 0);
    return Math.floor((res === 'cp' ? C.prod.lab(lvL) : C.prod.booster(lvB)) * CRH[k]); };
  C.openCrateX = (k, res) => { if (isCP(k)) res = 'cp'; const inv = meta().inv; if (!CRH[k] || !(inv[k] > 0)) return 0; const amt = C.crateAmount(k, res); inv[k]--;
    C.car()[res === 'cp' ? 'cp' : 'cash'] += amt; C.save(); return amt; };
  A.invcratex = k => { const inv = meta().inv; if (!(inv[k] > 0)) return;
    const b = C.crateAmount(k, 'cash'), cp = C.crateAmount(k, 'cp');
    if (isChoice(k)) return C.ui.open(XN[k][1], () => `<p class="note" style="margin-top:0">Choose what it holds: ${CRH[k]} hours of production at your current level.</p>
      <button class="btn full pri" data-act="cratepick" data-v="${k}|cash">💵 ${C.money(b)} Booster $</button>
      <button class="btn full pri" style="margin-top:8px" data-act="cratepick" data-v="${k}|cp"><i class="cpi"></i> ${C.full(cp)} Coaching Points</button>`, { popup: true });
    C.ui.open(XN[k][1], () => `<p class="note" style="margin-top:0">${CRH[k]} hours of Clubhouse output at Lv ${Math.max(1, C.level('booster'))}.</p>
      <button class="btn full pri" data-act="cratepick" data-v="${k}|cash">Open for 💵 ${C.money(b)}</button>`, { popup: true }); };
  A.cratepick = v => { const [k, res] = v.split('|'), amt = C.openCrateX(k, res); if (!amt) return; C.ui.back();
    C.toast(`📦 +${res === 'cp' ? '<i class="cpi"></i> ' + C.full(amt) : C.money(amt)}`); C.ui.refresh(); C.render(); };

  // ================= Inventory =================
  // 1.03.01 (QA-24, QA-25, QA-32, reference image): tabs Special · Resources · Speed-ups · Gear, opening on Special every time.
  // Tapping an item shows its details in a panel at the bottom; usable items get a quantity slider and Use in the Back bar.
  // Nothing here sends you to another page; an item used on something else opens a popup.
  let invTab = 'special', invSel = null;
  const typeTxt = { g: 'any building, research or training plan', b: 'buildings', r: 'research', t: 'training plans' };
  const invItems = () => { const car = C.car(), inv = meta().inv, S = C.staffState(), it = car.items || {};
    const L = [];
    const add = (tab, k, icon, name, n, tier, desc, use) => L.push({ tab, k, icon, name, n: n || 0, tier: tier || 1, desc, use });
    Object.keys(meta().pk || {}).forEach(id => { const e = meta().pk[id]; if (e.n > 0) add('special', 'pk:' + id, e.icon, e.name, e.n, 3, `A pack: open it to add ${C.rwText(e.r)}.`, 'pack'); });   // 1.06 (QA-87)
    add('special', 'rare', '🎁', 'Rare recruit', it.rareRecruit, 4, 'Signs a Rare freshman on academic aid straight away (no scholarship money). Needs a free roster place.', 'rare');
    add('special', 'crc4', XN.crc4[0], XN.crc4[1], inv.crc4, TIER.crc4, `Choose when opening: ${CRH.crc4} hours of Clubhouse output or of Performance Lab output, at your levels now.`, 'crate');
    add('special', 'crc2', XN.crc2[0], XN.crc2[1], inv.crc2, TIER.crc2, `Choose when opening: ${CRH.crc2} hours of Clubhouse output or of Performance Lab output, at your levels now.`, 'crate');
    add('special', 'tokens', '🎟', 'Number Change', car.tokens, 2, "Gives a player the shirt number they want. Used from the player's card.");
    add('special', 'kit', '🧴', 'Recovery kit', it.kit, 1, "Restores a tired player's Freshness. Used from the player's card or the Medical Room.");
    ['crp1', 'crp2', 'crp3', 'crp4'].forEach(k => add('res', k, XN[k][0], XN[k][1], inv[k], TIER[k], `${CRH[k]} hours of Performance Lab output at your level, worked out when you open it. Now: ${C.full(C.crateAmount(k, 'cp'))} Coaching Points each.`, 'crate'));
    ['crb1', 'crb2', 'crb3', 'crb4'].forEach(k => add('res', k, XN[k][0], XN[k][1], inv[k], TIER[k], `${CRH[k]} hours of Clubhouse output at your level, worked out when you open it. Now: ${C.money(C.crateAmount(k, 'cash'))} each. Storage limits don't apply.`, 'crate'));
    if (inv.crate) add('res', 'crate', '📦', 'Booster crate ($5K)', inv.crate, 2, 'Opens for $5,000 Booster $.', 'crate');
    add('coach', 'badge', '🏅', 'Coaching Badge', inv.badge, 3, "Raises a coach's stars. Used on the coach's page (Staff).");
    add('coach', 'manual', '📗', 'Coaching manual', S.items.manual, 1, 'Gives a coach 100 XP. Used on the coach\'s page (Staff).');
    add('coach', 'books', '📕', 'Trait Book', S.items.books, 3, "Upgrades a coach's trait. Used on the coach's page (Staff).");
    add('coach', 'credits', '🎫', 'Clinic Credits', S.items.credits, 1, "Pay for coach licences. Used on the coach's page (Staff).");
    Object.keys(XN).filter(k => XN[k][3]).sort((a, b) => XN[a][2] - XN[b][2]).forEach(k => add('speed', k, XN[k][0], XN[k][1], inv[k], TIER[k], `Takes ${XN[k][2] >= 60 ? XN[k][2] / 60 + ' h' : XN[k][2] + ' min'} off ${typeTxt[XN[k][3]]}.`, 'speed'));
    return L; };
  const invQty = () => { const e = document.getElementById('invq'); return Math.max(1, +(e && e.value) || 1); };
  C.openInventory = () => { invTab = 'special'; invSel = null; C.ui.open('Inventory', () => {
    const tabs = [['special', 'Special'], ['res', 'Resources'], ['speed', 'Speed-ups'], ['coach', 'Coach'], ['gear', 'Gear']];   // 1.10: a Coach tab
    const tabsHTML = `<div class="bigtabs invtabs">${tabs.map(([k, n]) => `<button class="${invTab === k ? 'on' : ''}" data-act="invtab" data-v="${k}">${n}</button>`).join('')}</div>`;
    if (invTab === 'gear') return `${tabsHTML}${C.kitRoomHTML ? C.kitRoomHTML() : ''}<p class="note">Equip gear from a player's card. It returns here when a player leaves.</p>`;
    const L = invItems().filter(x => x.tab === invTab && (x.n > 0 || invTab === 'speed' || invTab === 'res' || invTab === 'coach'));
    if (invSel && !L.find(x => x.k === invSel)) invSel = null;
    const sel = L.find(x => x.k === invSel);
    const grid = L.map(x => C.invTileHTML ? `<button class="invk ${x.n ? '' : 'none'} ${x.k === invSel ? 'sel' : ''}" data-act="invsel" data-v="${x.k}">${C.invTileHTML(x)}</button>` : `<button class="invc t${x.tier} ${x.n ? '' : 'none'} ${x.k === invSel ? 'sel' : ''}" data-act="invsel" data-v="${x.k}"><span>${x.icon}</span><b>${x.n}</b><small>${C.esc(x.name.replace(' speed-up', '').replace(' Crate', ''))}</small></button>`).join('');
    const det = sel ? `<div class="invdet"><b>${sel.icon} ${C.esc(sel.name)}</b><small>Owned: ${sel.n}</small><p>${sel.desc}</p>
      ${sel.use && sel.n > 1 ? `<div class="invslide"><input type="range" id="invq" min="1" max="${sel.n}" value="${sel.use === 'speed' ? 1 : sel.n}" oninput="document.getElementById('invqv').textContent=this.value"><span id="invqv">${sel.use === 'speed' ? 1 : sel.n}</span></div>` : ''}</div>`
      : `<div class="invdet empty"><p>Tap an item to see what it does.</p></div>`;
    return `<div class="invwrap">${tabsHTML}<div class="invg">${grid || '<p class="note">Nothing here yet.</p>'}</div>${det}</div>`;
  }, { foot: () => { const sel = invItems().find(x => x.k === invSel); return sel && sel.use && sel.n > 0 && invTab !== 'gear' ? `<button class="btn go invuse" data-act="invuse">Use</button>` : ''; } }); };
  A.invtab = v => { invTab = v; invSel = null; C.ui.refresh(); };
  A.invsel = v => { invSel = v; C.ui.refresh(); };
  A.invuse = () => { const sel = invItems().find(x => x.k === invSel); if (!sel || !sel.n) return; const n = Math.min(sel.n, sel.n > 1 ? invQty() : 1), inv = meta().inv;
    if (sel.use === 'pack') { const e = meta().pk[sel.k.slice(3)], tot = {}; for (let i = 0; i < n; i++) { C.giveReward(e.r); for (const k in e.r) tot[k] = (tot[k] || 0) + e.r[k]; } e.n -= n; C.save();
      C.ui.open('Opened: ' + e.name, () => `<p class="note" style="margin-top:0">${n > 1 ? n + ' packs' : 'The pack'} contained:</p><div class="card">${C.itemTiles(tot)}</div><button class="btn full pri" data-act="back">Done</button>`, { popup: true }); return C.render(); }
    if (sel.use === 'rare') return C.act('rare');
    if (sel.use === 'crate') {
      if (sel.k === 'crate') { let t = 0; for (let i = 0; i < n; i++) if (C.openCrate()) t += 5000; C.toast(`📦 +${C.money(t)}`); C.ui.refresh(); return C.render(); }
      if (isChoice(sel.k)) return C.ui.open(XN[sel.k][1], () => `<p class="note" style="margin-top:0">Open ${n} for:</p>
        <button class="btn full pri" data-act="cratepickn" data-v="${sel.k}|cash|${n}">💵 ${C.money(C.crateAmount(sel.k, 'cash') * n)} Booster $</button>
        <button class="btn full pri" style="margin-top:8px" data-act="cratepickn" data-v="${sel.k}|cp|${n}"><i class="cpi"></i> ${C.full(C.crateAmount(sel.k, 'cp') * n)} Coaching Points</button>`, { popup: true });
      return C.ui.open('Open Crates', () => `<div class="useit">${C.itemTiles({ [sel.k]: n })}</div><p class="note" style="text-align:center">Open ${n} for <b style="color:var(--fit5)">${isCP(sel.k) ? C.full(C.crateAmount(sel.k, 'cp') * n) + '</b> Coaching Points' : C.money(C.crateAmount(sel.k, 'cash') * n) + '</b> Booster $'}</p>
        <div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Cancel</button><button class="btn pri" data-act="cratepickn" data-v="${sel.k}|${isCP(sel.k) ? 'cp' : 'cash'}|${n}">Open</button></div>`, { popup: true }); }
    if (sel.use === 'speed') return useSpeedOn(sel.k, n);
  };
  A.cratepickn = v => { const [k, res, nn] = v.split('|'); let t = 0; for (let i = 0; i < +nn; i++) t += C.openCrateX(k, res); C.ui.back();
    if (t) C.toast(`📦 +${res === 'cp' ? '<i class="cpi"></i> ' + C.full(t) : C.money(t)}`); C.ui.refresh(); C.render(); };
  // a speed-up from the Inventory: pick what to use it on (a popup; no page change)
  function useSpeedOn(key, n) { const car = C.car(), ty = XN[key][3], rows = [];
    if (ty === 'g' || ty === 'b') car.queue.forEach(x => rows.push(['b', x.key, C.BUILDINGS[x.key].icon, `${C.BUILDINGS[x.key].name} → Lv ${x.to}`, C.remaining(x)]));
    if (ty === 'g' || ty === 't') car.devq.forEach(x => { const p = C.P(x.pid); if (p) rows.push(['t', x.pid, '🏋️', `Training: ${C.sn(p)}`, C.remaining(x)]); });
    if (ty === 'g' || ty === 'r') car.pbq.forEach(x => rows.push(['r', x.key, '📋', C.pbName ? C.pbName(x.key) : 'Playbook research', C.remaining(x)]));
    const live = rows.filter(x => x[4] > 0);
    if (!live.length) return C.toast('Nothing is running that this speed-up can use');
    C.ui.open('Use a speed-up', () => `<p class="note" style="margin-top:0">${n}× ${XN[key][1]}: pick what to speed up.</p>${live.map(x => `<button class="lrow" data-act="usespeedn" data-v="${x[0]}|${x[1]}|${key}|${n}"><span class="li">${x[2]}</span><span class="lt"><b>${C.esc(x[3])}</b><small>${C.dur(x[4])} left</small></span><span class="lr">⏩</span></button>`).join('')}`, { popup: true }); }
  A.usespeedn = v => { const [kind, id, key, nn] = v.split('|'); let used = 0;
    for (let i = 0; i < +nn; i++) { const q = kind === 'b' ? C.inQueue(id) : kind === 't' ? C.inDev(id) : C.car().pbq.find(x => x.key === id); if (!q || q.end <= C.now()) break; if (C.useSpeed(kind, id, key)) used++; else break; }
    if (used) { C.toast(`${XN[key][0]} ${used}× ${XN[key][1]} used`); C.dailyEvent('speed'); } C.ui.back(); C.ui.refresh(); C.render(); };
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
    ['bhq', '🏛', "Build the Coaches' Office", c => c.b.hq >= 1, { gold: 10 }, 'dgo', 'hq'],
    ['bcamp', '🏗', 'Build your 7 starting buildings', c => ['stadium','training','med','lab','recruit','media','dorms'].every(k => c.b[k] >= 1), { cash: 2000 }, 'tab', 'campus'],
    ['coach', '🧢', 'Hire your first assistant coach', c => (C.staffState().list || []).length >= 1, { cash: 2000 }, 'tab', 'staff'],
    ['hq2', '🏛', "Upgrade the Coaches' Office to Lv 2", c => c.b.hq >= 2, { gold: 20, sp15: 1, sp1: 6 }, 'dgo', 'hq'],
    ['offer', '✉️', 'Make a scholarship offer to a recruit', c => (meta().ms.offers || 0) >= 1, { cp: 30 }, 'tab', 'recruit'],
    ['sign', '✍️', 'Sign a recruit', c => (c.rec && c.rec.signed || 0) >= 1, { cash: 3000 }, 'tab', 'recruit'],
    ['collect', '💵', 'Collect income on campus', c => (meta().ms.collect || 0) >= 1, { crate: 1 }, 'tab', 'campus'],
    ['research', '📋', 'Start Playbook research', c => (meta().ms.research || 0) >= 1, { cp: 40 }, 'playbook', ''],
    ['roster', '👕', 'Fill the roster to 22 players', c => c.squad.length >= 22, { gold: 30 }, 'tab', 'recruit'],
    ['start', '🏁', 'Start the season', c => !c.pre, { gold: 50, sp60: 1 }, 'preseason', ''],
    ['play', '⚽', 'Play your first match', c => (meta().ms.match || 0) >= 1, { sp60: 1 }, 'prematch', ''],
    ['train', '🏋️', 'Start a training plan', c => (meta().ms.train || 0) >= 1, { manual: 2, gear: 1 }, 'tab', 'squad'],
    ['win', '🏆', 'Win a match', c => (meta().ms.win || 0) >= 1, { gold: 30, crate: 1 }, 'prematch', ''],
    ['hq3', '🏛', "Upgrade the Coaches' Office to Lv 3", c => c.b.hq >= 3, { sp60: 2, badge: 5 }, 'dgo', 'hq'],
    ['video', '🎞', 'Upgrade the Analysis Suite to Lv 2', c => c.b.video >= 2, { gold: 40 }, 'dgo', 'video'],
    ['wins3', '🏆', 'Win 3 matches', c => (meta().ms.win || 0) >= 3, { gold: 60, books: 1, gear: 2 }, 'prematch', ''],
    ['hq5', '🏛', "Reach Coaches' Office Lv 5", c => c.b.hq >= 5, { gold: 80, sp180: 1 }, 'dgo', 'hq'],
    ['gym', '🏋️', 'Upgrade the Gym to Lv 2', c => c.b.gym >= 2, { sp15: 2 }, 'dgo', 'gym'],
    ['top4', '📊', 'Finish a season in the top 4', c => (meta().ms.top4 || 0) >= 1, { gold: 150, rare: 1 }, 'tab', 'season']
  ];
  C.MAIN = MAIN;
  C.mainDone = id => meta().main.includes(id);
  // Recruiting Missions, one step at a time (9t, FEEDBACK 103): while roster spots are open, "Sign 1 recruit", then 2, then 3,
  // up to the spots that were open. They live on the Missions screen, not the task strip. A new series starts whenever spots open again.
  const recState = () => { const M = meta(), car = C.car(), signed = (car.rec && car.rec.signed) || 0, open = C.rosterCap(car) - car.squad.length;
    if (!M.rq || (M.rq.done && open > 0)) M.rq = { base: signed, step: 0, goal: Math.max(0, open), done: open <= 0 };
    return Object.assign({ signed, open }, M.rq); };
  C.recMission = () => { const r = recState(); if (r.done || r.step >= r.goal) return null; const k = r.step + 1;
    return ['rec' + k, '✍️', `Sign ${k} recruit${k > 1 ? 's' : ''}`, () => r.signed - r.base >= k, { cash: 500 * k, pts: 0 }, 'tab', 'recruit']; };
  const allMain = () => { const m = C.recMission(); return (m ? [m] : []).concat(MAIN); };
  C.mainNext = () => MAIN.find(t => !meta().main.includes(t[0])) || null;
  C.mainReady = () => { const car = C.car(), m = C.recMission(); return MAIN.filter(t => !meta().main.includes(t[0]) && t[3](car)).length + (m && m[3](car) ? 1 : 0); };
  C.mainClaim = id => { const M = meta(), car = C.car();
    if (/^rec\d+$/.test(id)) { const m = C.recMission(); if (!m || m[0] !== id || !m[3](car)) return null; delete m[4].pts; M.rq.step++; if (M.rq.step >= M.rq.goal) M.rq.done = true; C.giveReward(m[4]); C.save(); return m[4]; }
    const t = MAIN.find(x => x[0] === id); if (!t || M.main.includes(id) || !t[3](car)) return null; M.main.push(id); C.giveReward(t[4]); C.save(); return t[4]; };

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
  C.evCanClaim = (tr, i) => { const X = C.evx(), E = C.curEvent(); if (X[tr].includes(i)) return false; if (tr === 'f') return i === E.today || (!!X.has1 && i < E.today && i >= (X.from || 0)); /* 1.04 (QA-28): Advanced unlocks missed free days */ if (i > E.today) return false; return tr === 'p1' ? X.has1 : X.has2; };
  C.evClaim = (tr, i) => { if (!C.evCanClaim(tr, i)) return null; const X = C.evx(), r = trackOf(C.curEvent().th, tr, i); X[tr].push(i); C.giveReward(r); return r; };
  C.evClaimAll = () => { const E = C.curEvent(), got = {}; for (let i = 0; i <= E.today; i++) for (const tr of ['f', 'p1', 'p2']) { const r = C.evClaim(tr, i); if (r) for (const k in r) got[k] = (got[k] || 0) + r[k]; } return Object.keys(got).length ? got : null; };
  C.evClaimable = () => { const E = C.curEvent(); let n = 0; for (let i = 0; i <= E.today; i++) for (const tr of ['f', 'p1', 'p2']) if (C.evCanClaim(tr, i)) n++; return n; };
  C.passPts = () => {};   // kept for older callers
  C.evBuy = n => { const X = C.evx(), E = C.curEvent(); if (n === 1) { if (X.has1) return 'owned'; X.has1 = true; } else { if (!X.has1) return 'need1'; if (X.has2) return 'owned'; X.has2 = true; } C.mail('purchases', '🧾', `Purchase: ${E.th.name} ${n === 1 ? '$4.99' : '$9.99'} pack`, 'Rewards up to today can be redeemed in the event. Anything uncollected is mailed when it ends.<br><small>Test store: nothing was charged.</small>', null); C.save(); return true; };

  // ================= 1.02.06 (FEEDBACK 200): Missions is its own page, reached from the task bar's clipboard box;
  // Events keeps the themed event and the calendar, with a small text menu (the selected tab shows its icon) =================
  let evTab = 'event', msTab = 'daily';
  C.openEvents = t => { if (t === 'missions') return C.openMissions(); if (t) evTab = t; C.ui.open('Events', eventsHTML); };
  C.openMissions = t => { if (t) msTab = t; C.ui.open('Missions', missionsHTML); };
  A.evtab = v => { evTab = v; C.ui.refresh(); };
  A.mstab = v => { msTab = v; C.ui.refresh(); };
  A.dailytasks = () => { msTab = 'daily'; C.ui.closeAll(); C.openMissions(); };
  A.dailygift = A.dailytasks;
  // the Events menu: small text tabs in a row that scrolls; the selected one shows its icon instead (red-dot counts kept)
  function bigTabs() { const E = C.curEvent(), dots = { event: C.evClaimable(), cal: C.isVip() && C.lo().vipDay !== dayKey() ? 1 : 0 };
    return `<div class="evmenu">${[['event', E.th.icon, E.th.name.replace(' Event', '')], ['cal', '📅', 'Calendar']].map(([k, ic, n]) => `<button class="${evTab === k ? 'on' : ''}" data-act="evtab" data-v="${k}" aria-label="${C.esc(n)}">${evTab === k ? `<span class="evi">${ic}</span>` : `<span class="evt">${C.esc(n)}</span>`}${dots[k] ? `<em>${dots[k]}</em>` : ''}</button>`).join('')}</div>`; }
  function eventsHTML() { if (evTab === 'cal') return bigTabs() + calHTML(); return bigTabs() + eventHTML(); }
  function missionsHTML() {
    const dd = C.daily().filter(t => t.n >= t.goal && !t.claimed).length;
    const car0 = C.car(), pass = false, showMain = true;   // 1.06 (QA-85): Missions is Main and Daily again; the Pass is in the Store   // 1.05: the Career Progression Pass replaces the Main tasks after Pre-season
    if (msTab === 'main' && !showMain) msTab = 'cpp'; if (msTab === 'cpp' && !pass) msTab = 'daily';
    const sub = `<div class="subtabs">${[['daily', 'Daily tasks', dd]].concat(pass ? [['cpp', 'Progression', C.cppClaimable()]] : []).concat(showMain ? [['main', 'Main tasks', C.mainReady()]] : []).map(([k, n, d]) => `<button class="${msTab === k ? 'on' : ''}" data-act="mstab" data-v="${k}">${n}${d ? ` <em>${d}</em>` : ''}</button>`).join('')}</div>`;
    if (msTab === 'cpp') return sub + C.cppHTML();
    if (msTab === 'main') {
      const car = C.car(), M = meta(), open = allMain().filter(t => !M.main.includes(t[0])).sort((a, b) => b[3](car) - a[3](car)).slice(0, 6);   // ready to claim first (9t)
      const rows = open.map(t => { const ok = t[3](car); return `<div class="mrow2"><div class="mh"><span>${t[1]}</span><b>${C.esc(t[2])}</b></div><div class="mb">${C.itemTiles(t[4])}${ok ? `<button class="btn sm2 claim" data-act="mainclaim" data-v="${t[0]}">Claim</button>` : `<button class="btn sm2 go" data-act="${t[5]}" data-v="${t[6]}">Go</button>`}</div></div>`; }).join('');
      return sub + `<p class="note" style="margin-top:0">${M.main.length} of ${MAIN.length} done. Each one teaches a part of running your program.</p>${rows || '<p class="note">All main tasks done. 🎉</p>'}`;
    }
    const M = meta(), list = C.daily(), max = CHESTS[CHESTS.length - 1][0];
    const track = `<div class="ptrack"><div class="pstar"><i>★</i><b>${M.pts}</b></div><div class="pline"><div class="pfill" style="width:${Math.min(100, M.pts / max * 100)}%"></div>${CHESTS.map(([p], i) => `<button class="pchest ${M.chests.includes(i) ? 'got' : M.pts >= p ? 'ready' : ''}" style="left:${p / max * 100}%" data-act="chestopen" data-v="${i}">${C.chestSVG(M.chests.includes(i) ? 'open' : M.pts >= p ? 'ready' : 'idle', 30)}<small>${p}</small></button>`).join('')}</div></div>`;
    const rows = list.map((t, i) => [t, i]).sort((a, b) => ((b[0].n >= b[0].goal && !b[0].claimed) - (a[0].n >= a[0].goal && !a[0].claimed)) || (a[0].claimed - b[0].claimed)).map(([t, i]) => `<div class="mrow2 ${t.claimed ? 'done' : ''} ${t.id === 'login' && !t.claimed ? 'alert' : ''}"><div class="mh"><span>${t.def[1]}</span><b>${C.esc(t.def[2])}${t.id === 'login' ? '' : ` <small>(${t.n}/${t.goal})</small>`}</b>${t.id === 'login' && !t.claimed ? '<i class="ldot"></i>' : ''}</div><div class="mb">${C.itemTiles(Object.assign({ pts: 20 }, DREW[t.id]))}
      ${t.claimed ? '<span class="donechk">✔</span>' : t.n >= t.goal ? `<button class="btn sm2 claim" data-act="dailyclaim" data-v="${i}">Claim</button>` : `<button class="btn sm2 go" data-act="${t.def[4]}" data-v="${t.def[5]}">Go</button>`}</div></div>`).join('');
    return sub + `<div class="nextref">⏱ New tasks in ${C.dur((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)}</div>${track}${rows}`;   // 1.10 (QA-119): the rewards box
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
  A.chestopen = (v, el) => { const r = C.chestOpen(+v); if (r) { C.toast('🧰 ' + C.rwText(r)); C.ui.refresh(); C.render(); const n = document.querySelector(`.pchest[data-v="${+v}"]`); if (n) n.classList.add('justopen'); return; } C.rewardPreview(CHESTS[+v][1], el); };
  A.evclaim = v => { const [t, i] = v.split('|'), r = C.evClaim(t, +i); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } };
  A.evall = () => { const r = C.evClaimAll(); if (r && C.celebrate) C.celebrate(r, 'Event rewards claimed'); else C.toast(r ? '✔ ' + C.rwText(r) : 'Nothing to claim yet'); C.ui.refresh(); C.render(); };
  A.evbuy = (v, el) => { const n = +v, X = C.evx(); if (n === 2 && !X.has1) return C.toast('Buy the $4.99 pack first');
    if (!(el && el.dataset.ok)) return C.confirm('Confirm purchase', `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store: nothing is charged.</div><p class="note">${C.curEvent().th.name} · Pack ${n} · ${n === 1 ? '$4.99' : '$9.99'}: opens this track, with everything up to today ready to redeem.</p>`, 'Buy ' + (n === 1 ? '$4.99' : '$9.99'), 'evbuy', v);
    if (C.evBuy(n) === true) { C.toast('✅ Test purchase complete'); C.ui.refresh(); C.render(); } };
  A.inventory = () => C.openInventory();
  // the comms button: "this is what to do next", straight to Main Tasks
  A.nexttask = () => { const dd = C.daily().filter(t => t.n >= t.goal && !t.claimed).length; msTab = C.cppClaimable && C.cppClaimable() && !dd ? 'cpp' : C.mainReady() && !dd ? 'main' : C.mainNext() && !dd && C.car().pre ? 'main' : C.cpp && C.cpp() && !dd ? 'cpp' : 'daily'; C.ui.closeAll(); C.openMissions(); };
  // building action buttons open popups over the map
  A.bpop = v => { C.ui.asPopup = true; if (v === 'proginfo') C.openProgramInfo(); else if (v === 'playbook') C.openPlaybook(); else if (v === 'medical') C.openMedical(); else if (v === 'hqstaff') C.openStaffPop(); else if (v === 'kitroom') C.openKitRoom(); else if (v === 'academic') C.openAcademic(); };
  // 1.06 (QA-94): the Coaches' Office Staff shortcut opens the one Staff screen; Back returns to the Coaches' Office
  C.openStaffPop = () => { C.ui.asPopup = false; C.ui.open('Staff', () => `<div class="staffpage">${C.staffHTML()}</div>`); };
  A.preseason = () => C.openPreseason();
  // 1.03: Builder Packs I-III, in order; each card lists its contents (Last War style tiles) and its builder
  C.builderPacksHTML = () => { const nxt = C.nextBuilderPack(); return ['bp1', 'bp2', 'bp3'].map(k => { const P = C.PACKS[k], own = C.acct()['bq' + P.queue], can = nxt === k;
    return `<div class="pack"><div class="pkh"><b>${P.icon} ${P.name}</b><span class="ptag">${['2nd', '3rd', '4th'][P.queue - 1]} builder, permanent</span></div>${C.itemTiles(P.r)}
      <div class="packft"><small>${own ? 'Owned' : can ? 'Adds a permanent builder' : 'After ' + C.PACKS[nxt].name}</small><button class="btn sm2 ${own || !can ? 'sec2' : 'pri'}" data-act="buypack" data-v="${k}" ${own || !can ? 'disabled' : ''}>${own ? '✔' : P.price}</button></div></div>`; }).join(''); };
  // 1.03.01 (QA-30, reference image): Upgrade with every builder busy offers the next permanent builder
  C.openBuilderOffer = id => { const P = C.PACKS[id]; if (!P) return C.openQueue();
    C.ui.open(P.name, () => `<div class="bofr"><div class="bofr-ic">👷</div><b class="bofr-t">${['2nd', '3rd', '4th'][P.queue - 1]} builder</b>
      <p><b style="color:#dc2626">Permanently unlock</b> a ${['2nd', '3rd', '4th'][P.queue - 1]} builder, so ${P.queue + 1} buildings can be upgraded at once.</p>
      <p class="note">All your builders are busy now. Included:</p>${C.itemTiles(P.r)}
      <button class="btn full pri" data-act="buypack" data-v="${id}" style="margin-top:10px">Permanent unlock · ${P.price}</button>
      <button class="btn full sec2" data-act="rqueueb" style="margin-top:6px">See the Building Queue</button></div>`, { popup: true }); };
  A.rqueueb = () => { C.ui.back(); C.openQueue(); };
  const oBuyPack = C.buyPack; C.buyPack = id => { const r = oBuyPack(id); if (r !== 'owned' && r !== 'order' && C.car()) { receipt(C.PACKS[id] ? C.PACKS[id].name || id : id, C.PACKS[id] && C.PACKS[id].r); } return r; };

  // claimable count for red dots (replaces the calendar-based count)
  C.msClaimable = () => { if (!C.car()) return 0; const M = meta(); return C.mainReady() + C.daily().filter(t => t.n >= t.goal && !t.claimed).length + CHESTS.filter(([p], i) => M.pts >= p && !M.chests.includes(i)).length; };
  C.evOnlyClaimable = () => { if (!C.car()) return 0; return C.evClaimable() + (C.isVip() && C.lo().vipDay !== dayKey() ? 1 : 0); };
  C.loClaimable = () => { if (!C.car()) return 0; const M = meta(); return C.evClaimable() + C.mainReady() + C.daily().filter(t => t.n >= t.goal && !t.claimed).length + CHESTS.filter(([p], i) => M.pts >= p && !M.chests.includes(i)).length + (C.isVip() && C.lo().vipDay !== dayKey() ? 1 : 0); };

  // ================= Inbox: one place for messages, by topic =================
  C.mail = (f, icon, title, body, r) => { const M = meta(); const x = { id: 'm' + C.now() + Math.floor(Math.random() * 1e4), f, icon, title, body, r: r || null, claimed: false, read: false, t: C.now() };
    // 1.06 (QA-63): every purchase mail carries its cost, and the Purchases folder keeps a running total
    if (f === 'purchases' && /^Purchase:/.test(title)) { const usd = C.priceOf(title + ' ' + (body || '')); if (usd != null) { x.cost = usd; x.body = `<b>Cost: $${usd.toFixed(2)}</b> (test store)<br>` + x.body; } x.kind = 'buy'; const L = C.ledger(); L.usd += usd || 0; L.n++; }
    M.inbox.unshift(x); C.mailPrune(M); C.save(); };
  // the test ledger: real-money test purchases and the resources added by test tools
  C.ledger = () => { const M = meta(); return M.ledger || (M.ledger = { usd: 0, n: 0, gold: 0, cash: 0, cp: 0, acts: 0 }); };
  C.priceOf = txt => { let m = String(txt).match(/\$(\d+\.\d\d)/); if (m) return +m[1];
    const nm = String(txt).replace(/^Purchase:\s*/, '').split(/[<(]/)[0].trim(); const all = Object.values(C.PACKS || {}).concat(typeof WEEKLY !== 'undefined' ? WEEKLY : []);
    const hit = all.find(p => p && p.name && nm.startsWith(p.name) && p.price); if (hit) { m = String(hit.price).match(/(\d+\.\d\d)/); if (m) return +m[1]; } return null; };
  C.testMail = (what, add) => { const L = C.ledger(); L.acts++; Object.keys(add || {}).forEach(k => { if (L[k] != null) L[k] += add[k]; });
    const M = meta(); M.inbox.unshift({ id: 'm' + C.now() + Math.floor(Math.random() * 1e4), f: 'purchases', icon: '🧪', title: 'TEST: ' + what, body: `Test tool used: <b>${C.esc(what)}</b>. Not free-to-play: recorded so economy tests can see what came from outside the game.`, r: null, claimed: false, read: true, t: C.now(), kind: 'test' }); C.mailPrune(M); C.save(); };
  // 1.02 (FEEDBACK 157, 171): mail with an unclaimed reward, and favourites, are never removed by the 30-day clean-up or the 120 cap.
  // Only other mail ages out, and the cap trims the oldest of it. (1.01 removed unclaimed rewards too.)
  const MAIL_DAYS = 30, MAIL_CAP = 120;
  C.mailKeep = x => !!(x.fav || (x.r && !x.claimed));
  C.mailPrune = M => { M = M || meta(); const keep = M.inbox.filter(C.mailKeep).length; let room = Math.max(0, MAIL_CAP - keep);
    M.inbox = M.inbox.filter(x => { if (C.mailKeep(x)) return true; if (C.now() - x.t >= MAIL_DAYS * D || room <= 0) return false; room--; return true; }); };
  function receipt(name, r) { C.mail('purchases', '🧾', 'Purchase: ' + name, `Thanks for your purchase. ${r ? 'Received: ' + C.rwText(r) + '.' : ''}<br><small>Test store: nothing was charged.</small>`, null); }
  const FOLDERS = [['match', '📋', 'Match reports'], ['director', '🏛', 'Director'], ['rewards', '🎁', 'Rewards'], ['purchases', '🧾', 'Purchases'], ['system', '⚙️', 'News & updates'], ['fav', '⭐', 'Favourites']];
  C.inboxUnread = () => { const car = C.car(); if (!car) return 0; sysMail(); return meta().inbox.filter(x => !x.read || (x.r && !x.claimed)).length; };   // 1.01: mail only (the Director's notes are mail now)
  function sysMail() { C.syncADMail && C.syncADMail(C.car()); const M = meta();
    // 1.03 (FEEDBACK 170, 212): research is capped at 2 slots, so a bought research slot is refunded once in Coins; build slots are now Builder Packs
    { const a = C.acct(); if (a.pslot3Refund === 'due') { a.pslot3Refund = 'done'; C.mail('system', '📋', 'Research slots: two for everyone', 'Research now runs in 2 slots: the free one and the one you earn at Performance Lab Lv 10. Your extra research slot has been withdrawn, and here is a refund. Anything already researching finishes as normal.', { gold: 360 }); } }
    if (!M.seenSys.includes('103q')) { M.seenSys.push('103q'); C.mail('system', '🔨', 'Builders: one free, three to buy', `You have one free builder. Builder Packs I, II and III each add a permanent builder, in that order, with speed-ups and Booster Crates to get it working.${C.acct().bq1 ? ' Your extra build slot is now your 2nd builder.' : ''} The Coach's Club and Coaches' Office Lv 10 no longer add a builder; any build already running in those slots finishes as normal. Free finishes are now earned: the Coaches' Office and Performance Lab give a longer free window as they level up. Here are some 1-minute speed-ups to start with.`, { sp1: 10 }); } if (!M.seenSys.includes('9h')) { M.seenSys.push('9h'); C.mail('system', '📣', 'New: Missions, the Pass, Inbox and Inventory', `A few changes around the office, Coach:<br>• <b>Missions</b> (in Events): main tasks guide you step by step, daily tasks fill a points track with chests.<br>• <b>Themed events</b> replace the old calendar: claim a free drop each day.<br>• <b>Inventory</b> holds speed-ups and items.<br>• This <b>Inbox</b> keeps match reports, rewards and receipts.<br>Here's something to get you started.`, { gold: 50, sp15: 2 }); } }
  // 1.02 (FEEDBACK 157): Inbox menu → folder page (headlines) → message page. Back goes up one level each time.
  const folderName = k => (FOLDERS.find(f => f[0] === k) || [0, '', 'Inbox'])[2];
  const inFolder = k => meta().inbox.filter(x => k === 'fav' ? x.fav : x.f === k);
  const isNew = x => !x.read || (x.r && !x.claimed);
  const ago = t => { const s = Math.max(0, (C.now() - t) / 1000); return s < 3600 ? Math.max(1, Math.floor(s / 60)) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago'; };
  C.openInbox = () => { C.mailPrune(); C.save(); C.ui.open('Inbox', inboxHTML); };
  function inboxHTML() {
    sysMail(); const M = meta();
    return FOLDERS.map(([k, ic, n]) => { const list = inFolder(k), un = list.filter(isNew).length, gift = list.some(x => x.r && !x.claimed);
      return `<button class="mfold" data-act="mfold" data-v="${k}"><span class="mfi">${ic}</span><b>${n}</b>${gift ? `<span class="mgift">${C.giftIco(20)}</span>` : ''}${un ? `<i class="mdot">${un}</i>` : ''}<em>›</em></button>`; }).join('')
      + '<p class="note">Mail older than 30 days is deleted automatically. Favourites and unclaimed rewards are kept.</p>';
  }
  const FRESH = new Set();   // 1.06 (QA-62): messages being read for the first time show a red dot inside
  A.inboxdir = () => { C.openInbox(); A.mfold('director'); };   // 1.06 (QA-89): the AD portrait opens the Director folder
  let curFolder = null;   // 1.03.01 (QA-34): previous/next move through the folder the message was opened from
  function folderHTML(k) { curFolder = k;
    const list = inFolder(k), canClaim = list.some(x => x.r && !x.claimed), canDel = list.some(x => x.read && !C.mailKeep(x));
    return `${k === 'director' ? C.adOfficeCard() : ''}${k === 'purchases' ? (L => `<div class="card ledg"><b>🧾 Running total (testing)</b><div class="srow"><span>Test purchases</span><b>$${L.usd.toFixed(2)} · ${L.n}</b></div><div class="srow"><span>🧪 Test resources added</span><b>${[L.gold ? `<i class="coin"></i> ${L.gold.toLocaleString()}` : '', L.cash ? `💵 ${C.full(L.cash)}` : '', L.cp ? `🧪 ${L.cp} CP` : '', `${L.acts} action${L.acts === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}</b></div></div>`)(C.ledger()) : ''}${list.length ? list.map(x => `<button class="mrowh ${isNew(x) ? 'new' : ''} ${x.kind === 'test' ? 'tst' : ''}" data-act="mopen" data-v="${x.id}"><span class="mi">${x.icon}</span><span class="mt"><b>${C.esc(x.title)}</b><small>${x.kind === 'test' ? '<em class="tsttag">TEST</em> ' : x.cost != null ? `<em class="buytag">$${x.cost.toFixed(2)}</em> ` : ''}${ago(x.t)}${x.fav ? ' · ⭐' : ''}</small></span>${x.r && !x.claimed ? `<span class="mgift">${C.giftIco(20)}</span>` : ''}${!x.read ? '<i class="mrd"></i>' : ''}<em>›</em></button>`).join('') : '<p class="note">Nothing here yet.</p>'}
`;
  }
  // 1.02.05 (FEEDBACK 193-195): the Inbox actions sit in the standard Back bar (its depth and the Back arrow are unchanged)
  const STAR = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="#fff" stroke="#0f2a55" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const STAR_ON = STAR.replace('fill="#fff"', 'fill="#fde047"');
  const BIN = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M5 6.5h14l-1.2 13.5a1.6 1.6 0 0 1-1.6 1.5H7.8a1.6 1.6 0 0 1-1.6-1.5z" fill="#fff" stroke="#0f2a55" stroke-width="1.6" stroke-linejoin="round"/><path d="M3.5 6.5h17M9 3.5h6v3H9z" fill="#fff" stroke="#0f2a55" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 10v8M14 10v8" stroke="#0f2a55" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const folderFoot = k => () => { const list = inFolder(k); if (!list.length) return ''; const canClaim = list.some(x => x.r && !x.claimed), canDel = list.some(x => x.read && !C.mailKeep(x));
    return `<div class="mbar"><button class="mbtn red" data-act="mdelall" data-v="${k}" ${canDel ? '' : 'disabled'}>Delete All</button><button class="mbtn blue" data-act="mclaimall" data-v="${k}" ${canClaim ? '' : 'disabled'}>Claim All${canClaim ? '<i class="mbdot"></i>' : ''}</button></div>`; };
  const msgFoot = id => () => { const x = meta().inbox.find(m => m.id === id); if (!x) return ''; const wait = x.r && !x.claimed;
    const L = curFolder ? inFolder(curFolder) : [], i = L.findIndex(m => m.id === id), chev = d => `<svg viewBox="0 0 24 24" width="22" height="22"><path d="${d ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'}" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const nav = i < 0 ? '' : `<button class="mico mchev" data-act="mnav" data-v="${id}|-1" aria-label="Previous message" ${i > 0 ? '' : 'disabled'}>${chev(0)}</button><button class="mico mchev" data-act="mnav" data-v="${id}|1" aria-label="Next message" ${i < L.length - 1 ? '' : 'disabled'}>${chev(1)}</button>`;
    return `<div class="mbar">${nav}<button class="mico" data-act="mfav" data-v="${x.id}" aria-label="Favourite">${x.fav ? STAR_ON : STAR}</button><button class="mico" data-act="mdel" data-v="${x.id}" aria-label="Delete" ${wait ? 'disabled' : ''}>${BIN}</button><span class="mbsp"></span>${wait ? `<button class="mbtn green" data-act="mclaim" data-v="${x.id}">Claim</button>` : ''}</div>`; };
  function msgHTML(id) {
    const x = meta().inbox.find(m => m.id === id); if (!x) return '<p class="note">This message has been deleted.</p>';
    const fromAD = x.f === 'director' || x.f === 'system';
    return `<div class="mail">${FRESH.has(x.id) ? '<i class="mfresh" title="New"></i>' : ''}<div class="mh"><span>${x.icon}</span><div><b>${C.esc(x.title)}</b><small>${new Date(x.t).toLocaleString()}</small></div></div>
      ${fromAD ? `<div class="mfrom"><span class="mff">${C.adFace()}</span><small>From <b>${C.esc(C.AD.name)}</b> · ${C.esc(C.AD.title)}</small></div>` : ''}
      <div class="mbody">${x.body}</div>${x.md != null ? `<button class="btn sm2 sec2" data-act="report" data-v="${x.md}">Full report</button>` : ''}${x.r ? `<div class="mrw">${C.itemTiles(x.r)}${x.claimed ? '<span class="donechk">✔ Claimed</span>' : ''}</div>` : ''}</div>
      ${x.r && !x.claimed ? '<p class="note">Claim the reward first. Messages with a reward waiting are never deleted.</p>' : ''}`;
  }
  // 1.01 (FEEDBACK 133): Director is a message folder; the Office has its own button inside
  A.mfold = v => { if (!v) return C.ui.back(); C.ui.open(folderName(v), () => folderHTML(v), { foot: folderFoot(v) }); };
  A.mnav = v => { const [id, d] = v.split('|'), L = curFolder ? inFolder(curFolder) : [], i = L.findIndex(m => m.id === id), t = L[i + +d]; if (!t) return; C.ui.back(); A.mopen(t.id); };
  A.mopen = v => { const x = meta().inbox.find(m => m.id === v); if (!x) return; if (!x.read) FRESH.add(x.id); else FRESH.delete(x.id); x.read = true; C.save(); C.ui.open(folderName(x.f), () => msgHTML(v), { foot: msgFoot(v) }); C.render(); };
  A.mfav = v => { const x = meta().inbox.find(m => m.id === v); if (x) { x.fav = !x.fav; C.save(); C.ui.refresh(); } };
  const claimOne = x => { x.claimed = true; x.read = true; C.giveReward(x.r); };
  A.mclaim = v => { const x = meta().inbox.find(m => m.id === v); if (x && x.r && !x.claimed) { claimOne(x); C.toast('🎁 ' + C.rwText(x.r)); C.ui.refresh(); C.render(); } };
  A.mclaimall = k => { const list = inFolder(k).filter(x => x.r && !x.claimed); if (!list.length) return; const tot = {};
    list.forEach(x => { claimOne(x); for (const r in x.r) tot[r] = (tot[r] || 0) + x.r[r]; }); if (C.celebrate) C.celebrate(tot, `A total of ${list.length} reward${list.length > 1 ? 's were' : ' was'} claimed`); else C.toast('🎁 ' + C.rwText(tot)); C.ui.refresh(); C.render(); };
  A.mdel = v => { const M = meta(), x = M.inbox.find(m => m.id === v); if (!x) return; if (x.r && !x.claimed) return C.toast('Claim the reward first');
    M.inbox = M.inbox.filter(m => m !== x); C.save(); C.ui.back(); C.render(); };
  A.mdelall = k => { const del = inFolder(k).filter(x => x.read && !C.mailKeep(x)), kept = inFolder(k).length - del.length; if (!del.length) return;
    C.confirm('Delete all', `<p>Delete <b>${del.length}</b> read message${del.length > 1 ? 's' : ''} in ${C.esc(folderName(k))}?</p><p class="note">${kept ? `${kept} kept: unread, favourites and unclaimed rewards are never deleted.` : 'Unread messages, favourites and unclaimed rewards are never deleted.'}</p>`, 'Delete', 'mdelallok', k); };
  A.mdelallok = k => { const M = meta(), del = new Set(inFolder(k).filter(x => x.read && !C.mailKeep(x)));
    M.inbox = M.inbox.filter(x => !del.has(x)); C.save(); C.ui.back(); C.toast(`🗑 Deleted ${del.size}`); C.ui.refresh(); C.render(); };
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
  // 1.06 (QA-87): a bought pack arrives in the Inventory as one item; opening it adds its contents. Coins, crates, builders and slots stay instant.
  C.packToInv = (id, P) => { if (!P || !P.r || !C.car()) return false; const ks = Object.keys(P.r); if (!ks.length || (ks.length === 1 && (ks[0] === 'gold' || /^cr[bpc]\d$/.test(ks[0])))) return false;
    const M = meta(); M.pk = M.pk || {}; const e = M.pk[id] || (M.pk[id] = { name: P.name, icon: P.icon || '🎁', r: P.r, n: 0 }); e.n++; C.save(); return true; };
  C.buyWeekly = id => { const M = meta(), w = WEEKLY.find(x => x.id === id); if (M.wk !== weekKey()) { M.wk = weekKey(); M.wbuy = {}; } const n = M.wbuy[id] || 0; if (!w || n >= w.lim) return 'limit'; M.wbuy[id] = n + 1; if (!C.packToInv(id, w)) C.giveReward(w.r); receipt(w.name, w.r); return true; };
  A.buyweekly = v => { const r = C.buyWeekly(v); C.toast(r === true ? '✅ Test purchase complete' : 'Purchase limit reached this week'); C.ui.refresh(); C.render(); };
  Object.assign(C.PACKS, { cpR: { name: 'Rare CP Crate', icon: '🧪', price: '$0.99', r: { crp2: 1 } }, cpE: { name: 'Epic CP Crate', icon: '🧪', price: '$1.99', r: { crp3: 1 } }, cpL: { name: 'Legendary CP Crate', icon: '🧪', price: '$4.99', r: { crp4: 1 } } });   // 1.06 (QA-95): real money only, provisional prices
  Object.assign(C.PACKS, { packTrain: { name: 'Training Pack', icon: '🏋️', price: '$1.99', r: { spt15: 4, spt60: 2 } }, packCoach: { name: 'Coaching Pack', icon: '🧢', price: '$2.99', r: { manual: 5, badge: 6, spr60: 1 } }, packBuild: { name: 'Building Pack', icon: '🔨', price: '$2.99', r: { spb15: 4, spb60: 2, crate: 2 } }, packRec: { name: 'Recovery Pack', icon: '🧴', price: '$1.99', r: { kit: 6, credits: 10 } } });
  A.evopen = () => { evTab = 'event'; C.ui.closeAll(); C.openEvents(); };
  A.sttab = v => { stTab = v; C.ui.refresh(); };
  C.openStoreAt = t => { stTab = t; C.openStore(); };
  A.numstore = () => C.openStoreAt('items');
  const oStore = C.openStore;
  C.openStore = () => C.ui.open('Store', () => {
    const a = C.acct(), vip = C.isVip(), L = C.lo(), M = meta(); if (M.wk !== weekKey()) { M.wk = weekKey(); M.wbuy = {}; }
    // 1.06 (QA-87): every product is the same card: icon, name, contents (tiles) or what it does, and a green price button
    const row = (act, v, icon, name, sub, price, owned, r) => `<div class="pack prod ${owned ? 'own' : ''}"><div class="pkh"><b>${icon} ${name}</b></div>${r ? C.itemTiles(r) : `<p class="pdesc">${sub}</p>`}<div class="packft"><small>${r && sub ? sub : ''}</small><button class="btn sm2 buyg" data-act="${act}" data-v="${v}" ${owned ? 'disabled' : ''}>${owned ? '✔ Owned' : price}</button></div></div>`;
    const tabs = `<div class="bigtabs">${[['deals', 'Deals'], ['passes', 'Passes'], ['coins', 'Coins'], ['items', 'Items']].map(([k, n]) => `<button class="${stTab === k ? 'on' : ''}" data-act="sttab" data-v="${k}">${n}</button>`).join('')}</div>`;
    const test = `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px;margin-bottom:8px">🧪 Test store. Purchases are simulated and no money is charged.</div>`;
    let body = '';
    if (stTab === 'deals') { const dl = C.todayDeal(), dd = C.dealBought(), fmt = t => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      body = `<div class="pack"><div class="pkh"><b>${dl.icon} Today's deal: ${C.esc(dl.name)}</b><span class="ptag">Daily</span></div>${C.itemTiles(dl.r)}<div class="packft"><small>1 purchase a day</small><button class="btn sm2 ${dd ? 'sec2' : 'pri'}" data-act="buydeal" ${dd ? 'disabled' : ''}>${dd ? '✔ Bought' : `<s>${dl.was}</s> ${dl.price}`}</button></div></div>
        ${C.piggyHTML ? C.piggyHTML() : ''}<h3 class="jh">Weekly deals <small class="devp">${fmt(new Date(weekKey()))} – ${fmt(wkEnd() - 1)}</small></h3>
        ${WEEKLY.map(w => { const n = M.wbuy[w.id] || 0, left = w.lim - n; return `<div class="pack"><div class="pkh"><b>${w.icon} ${w.name}</b><span class="ptag t-${w.tag.toLowerCase()}">${w.tag}</span></div>${C.itemTiles(w.r)}<div class="packft"><small>${left} of ${w.lim} purchase${w.lim > 1 ? 's' : ''} left</small><button class="btn sm2 ${left ? 'pri' : 'sec2'}" data-act="buyweekly" data-v="${w.id}" ${left ? '' : 'disabled'}>${left ? w.price : 'Sold out'}</button></div></div>`; }).join('')}
        ${row('buypack', 'starter', '🎒', 'Starter Pack', 'Once only', '$1.99', L.cos.includes('starter'), C.PACKS.starter.r)}`; }
    if (stTab === 'passes') body = `${C.cpp && C.cpp() ? (n => `<button class="passcard" data-act="passopen"><span>🎓</span><span><b>Career Progression Pass</b><small>Rewards · Daily Tasks · Target Tasks${C.cpp().closed ? ' · ended' : ''}</small></span>${n ? `<i class="mdot">${n}</i>` : ''}<em>›</em></button>`)(C.cppClaimable()) : '<p class="note">The Career Progression Pass starts with the season.</p>'}<div class="vipcard"><b>👑 Coach's Club</b><p>+1 training slot · +1 career slot · 25 Coins a day</p>
        <button class="btn full ${vip ? 'sec2' : 'pri'}" data-act="buy" data-v="vip">${vip ? 'Active · ' + Math.ceil((a.vipUntil - C.now()) / 864e5) + ' days left (extend +30)' : 'Join · $4.99 / month'}</button></div>
      <h3 class="jh">${C.curEvent().th.icon} ${C.curEvent().th.name}</h3><button class="lrow" data-act="evopen"><span class="li">${C.curEvent().th.icon}</span><span class="lt"><b>Event packs</b><small>$4.99, then $9.99: open the premium tracks</small></span><span class="lr">›</span></button>`;
    if (stTab === 'coins') body = ['g100', 'g550', 'g1200'].map(k => row('buypack', k, '<i class="coin"></i>', C.PACKS[k].name, 'Speed-ups, coaching searches, agency scouts', C.PACKS[k].price, false, C.PACKS[k].r)).join('');
    if (stTab === 'items') body = `<h3 class="jh" style="margin-top:2px">Themed packs</h3>${['packTrain', 'packCoach', 'packBuild', 'packRec'].map(k => `<div class="pack"><div class="pkh"><b>${C.PACKS[k].icon} ${C.PACKS[k].name}</b></div>${C.itemTiles(C.PACKS[k].r)}<div class="packft"><small></small><button class="btn sm2 pri" data-act="buypack" data-v="${k}">${C.PACKS[k].price}</button></div></div>`).join('')}
      ${row('buypack', 'xp', '📗', 'Coach XP bundle', '', '$2.99', false, C.PACKS.xp.r)}${row('buypack', 'clinic', '🎫', 'Clinic Credit pack', '', '$2.99', false, C.PACKS.clinic.r)}
      <h3 class="jh">Builders</h3>${C.builderPacksHTML()}
      <h3 class="jh">Booster Crates</h3>${['crR', 'crE', 'crL'].map(k => row('buypack', k, '📦', C.PACKS[k].name, `${C.CRH[C.PACKS[k].r && Object.keys(C.PACKS[k].r)[0]]} h of Clubhouse output, sized when opened`, C.PACKS[k].price, false, C.PACKS[k].r)).join('')}
      <h3 class="jh">CP Crates</h3>${['cpR', 'cpE', 'cpL'].map(k => row('buypack', k, '🧪', C.PACKS[k].name, `${C.CRH[Object.keys(C.PACKS[k].r)[0]]} h of Performance Lab output, sized when opened`, C.PACKS[k].price, false, C.PACKS[k].r)).join('')}
      <h3 class="jh">Permanent slots</h3>${row('buy', 'tslot3', '🏋️', 'Extra training slot', 'A permanent 3rd training-plan slot', '$2.99', a.tslot3)}
      ${row('buy', 'tokens', '🎟', '3 Number Changes', 'Give players the number they want', '$0.99')}
      <h3 class="jh">Kits (cosmetic)</h3>${Object.keys(C.KITS).map(k => row('kit', k, C.KITS[k][0], C.KITS[k][1], C.kit() === k ? 'Wearing now' : L.cos.includes('kit_' + k) || k === 'classic' ? 'Owned: tap to wear' : 'Changes how your team looks, nothing else', C.KITS[k][2] || 'Free', false)).join('')}`;
    return `${tabs}${test}${body}<div class="card fair"><b>⚖️ Fair play promise</b><p>Money buys time and convenience, never results. No paid match wins, no attribute points past a player's potential, no buying players directly.</p></div>`;
  });
  const oDeal = C.buyDeal; C.buyDeal = () => { const r = oDeal(); if (r === true) receipt(C.todayDeal().name, C.todayDeal().r); return r; };

  // ================= pre-season (round 5): recruit, build and hire before the first match =================
  C.PRE_MIN = 22;   // 22 players to start the season
  // 1.04 (SCOPE_1.04 s6; FEEDBACK 205, 224): a new career's Pre-season tasks, all needed before Start Season.
  // Later seasons: Pre-season is the 5 friendlies only. [id, icon, text, done(car), act, value]
  const PRE = [
    ['bhq', '🏛', "Build the Coaches' Office", c => c.b.hq >= 1, 'dgo', 'hq'],
    ['bcamp', '🏗', 'Build your 7 starting buildings', c => ['stadium', 'training', 'med', 'lab', 'recruit', 'media', 'dorms'].every(k => c.b[k] >= 1), 'tab', 'campus'],
    ['hq5', '🏛', "Upgrade the Coaches' Office to Lv 5", c => c.b.hq >= 5, 'dgo', 'hq'],
    ['research', '📋', 'Start Playbook research', c => (meta().ms.research || 0) >= 1, 'playbook', ''],
    ['coach2', '🧢', 'Hire 2 coaches', c => (C.staffState().list || []).length >= 2, 'tab', 'staff'],
    ['squadrev', '👀', 'Review your squad', c => !!meta().ms.squadview, 'tab', 'squad'],
    ['offer', '✉️', 'Make a scholarship offer to a recruit', c => (meta().ms.offers || 0) >= 1, 'tab', 'recruit'],
    ['roster', '👕', 'Sign to 22 with every position covered', c => c.squad.length >= C.PRE_MIN && C.coverageOK(c), 'tab', 'recruit'],
    ['lineup', '📋', 'Set your line-up', c => !!meta().ms.lineup, 'tactics', ''],
    ['friendlies', '⚽', 'Play the 5 pre-season friendlies', c => C.friendliesLeft(c) === 0, 'prematch', '']];
  const preList = car => car.season > 1 || car.preLite ? PRE.filter(t => t[0] === 'roster' || t[0] === 'friendlies') : PRE;   // 1.08 (QA-104): every Pre-season needs the roster
  C.preNext = () => { const car = C.car(); return preList(car).find(t => !t[3](car)) || null; };   // 1.06 (QA-78): the task bar follows Pre-season
  C.preTasksLeft = () => { const car = C.car(); return preList(car).filter(t => !t[3](car)).length; };
  const preReady = car => preList(car).every(t => t[3](car)) && car.squad.length >= C.PRE_MIN && C.coverageOK(car) && (car.season > 1 || car.preLite || (C.staffState().list || []).length >= 2);
  C.openPreseason = () => C.ui.open('Pre-season', () => {
    const car = C.car(), n = car.squad.length, ok = preReady(car), cap = C.rosterCap(car), left = Math.max(0, cap - n), cv = C.coverage(car), first = !(car.season > 1 || car.preLite);
    const cov = Object.keys(C.COVER).map(k => `<span class="${cv[k] >= C.COVER[k] ? '' : 'short'}">${({ gk: 'GK', def: 'DEF', mid: 'MID', fwd: 'FWD' })[k]} ${cv[k]}/${C.COVER[k]}</span>`).join(' · ');
    return `<div class="card prehd3"><b>🗓 Pre-season · Season ${car.season}</b><p>${first ? 'Build your campus, hire your staff, fill your roster, then play 5 friendlies. Every task is needed before the season starts. Player training starts with the season.' : 'Five friendlies to get ready, then the season starts. Friendlies don\'t count in the table and don\'t tire or injure anyone.'}</p></div>
      <div class="card">${preList(car).map(t => { const done = t[3](car); return `<div class="pstep ${done ? 'done' : ''}"><span>${done ? '✔' : t[1]}</span><b>${C.esc(t[2])}${t[0] === 'friendlies' && !done ? ` (${5 - C.friendliesLeft(car)}/5)` : ''}</b>${done ? '' : `<button class="btn sm2 go" data-act="${t[4]}" data-v="${t[5]}">Go</button>`}</div>`; }).join('')}</div>
      ${C.friendliesLeft(car) ? `<button class="btn full pri" data-act="prematch">⚽ Play friendly ${6 - C.friendliesLeft(car)} of 5</button>` : ''}
      ${!first ? `<div class="card preroster"><div class="srow"><span>👕 Roster</span><b class="${n >= C.PRE_MIN ? '' : 'short'}">${n} players · ${C.PRE_MIN} needed</b></div><div class="srow"><span>Positions</span><b class="covl">${cov}</b></div>
        <div class="jbtns" style="grid-template-columns:1fr 1fr;margin-top:6px"><button class="btn sec2" data-act="tab" data-v="recruit">✉️ Recruit</button><button class="btn sec2" data-act="tryouts" ${car.tryS === car.season ? 'disabled' : ''}>🎽 ${car.tryS === car.season ? 'Tryouts held' : 'Hold walk-on tryouts'}</button></div></div>` : ''}
      ${first && C.friendliesLeft(car) < 5 ? `<div class="card fresht"><b>🔋 Freshness</b><p>Matches tire your players. Friendlies cost half as much and never injure anyone. Refresh the <b>whole team</b> with a team recovery session, and <b>individuals</b> by resting them or using a recovery kit.</p><button class="btn full sec2" data-act="rejuv">Refresh players</button></div>` : ''}
      ${first ? `<div class="card preroster"><div class="srow"><span>👕 Roster</span><b class="${n >= C.PRE_MIN ? '' : 'short'}">${n} players · ${C.PRE_MIN} needed</b></div><div class="srow"><span>Positions</span><b class="covl">${cov}</b></div><div class="srow"><span>Places left</span><b>${left} (up to ${cap})</b></div>${car.job.eq ? `<div class="srow"><span>🎓 Scholarships left</span><b>${C.money(C.poolLeft())}</b></div>` : ''}</div>` : ''}
      <button class="btn full ${ok ? 'pri' : 'sec2'}" data-act="startseason" ${ok ? '' : 'disabled'}>${ok ? '🏁 Start the season' : `Finish the pre-season tasks to start (${C.preTasksLeft()} left)`}</button>`;
  });
  // 1.08 (QA-104): walk-on tryouts are your choice, once a Pre-season: pick from a few free, low-rated walk-ons (no scholarship)
  let tryList = null;
  A.tryouts = () => { const car = C.car(); if (!car.pre || car.tryS === car.season) return; const r = C.rng((C.now() & 0xffffff) ^ 77), cv = C.coverage(car), short = Object.keys(C.COVER).filter(k => cv[k] < C.COVER[k]);
    const posFor = { gk: ['GK'], def: ['CB', 'LB', 'RB'], mid: ['CM', 'DM'], fwd: ['ST', 'LW', 'RW'] }, want = short.length ? short : ['def', 'mid', 'fwd', 'gk'];
    tryList = [0, 1, 2, 3, 4].map(i => { const g = want[i % want.length], pos = posFor[g][Math.floor(r() * posFor[g].length)]; const p = C.genPlayer(r, { gender: car.gender, pos, rating: car.job.rating - 9 + Math.floor(r() * 5), year: 1 }); p.from = 'Walk-on tryout'; return p; });
    car.tryS = car.season; C.save(); openTry(); };
  const openTry = () => C.ui.open('Walk-on tryouts', () => { const car = C.car(), room = C.rosterCap() - car.squad.length;
    return `<p class="note" style="margin-top:0">Walk-ons join for free (no scholarship). They're raw, but they fill a gap. ${room} roster place${room === 1 ? '' : 's'} left.</p>${(tryList || []).map((p, i) => p.signed ? '' : `<div class="medrow"><div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(p.fn[0] + '. ' + p.ln)}</b><small>${p.pos} · Fr · ${p.rating}</small></div><div class="medbt"><button class="btn sm2 pri" data-act="trysign" data-v="${i}" ${room > 0 ? '' : 'disabled'}>Sign</button></div></div>`).join('')}<button class="btn full sec2" data-act="back" style="margin-top:8px">Done</button>`; }, { popup: true });
  A.trysign = v => { const car = C.car(), p = tryList && tryList[+v]; if (!p || p.signed || car.squad.length >= C.rosterCap()) return; const q = Object.assign({}, p); delete q.signed; car.squad.push(q); C.assignNumbers(car.squad); p.signed = 1; C.save(); C.toast('🎽 ' + C.sn(q) + ' joins as a walk-on'); C.ui.refresh(); C.render(); };
  // 1.04.01 (QA-44): after the first friendly of a new career, a short Freshness tutorial: the team and individual ways to refresh
  C.freshTutorial = () => { const car = C.car(); if (!car || car.season > 1 || car.preLite || meta().ms.freshTut || C.friendliesLeft(car) >= 5) return; meta().ms.freshTut = 1; C.save();
    C.ui.open('Freshness', () => `<div class="card"><b>🔋 Your players get tired</b><p>Every match uses Freshness. Tired players play worse and get injured more often. Friendlies cost half as much, and never injure anyone.</p></div>
      <div class="pstep"><span>👥</span><b>Refresh the whole team: a team recovery session (free every few matches)</b></div>
      <div class="pstep"><span>🪑</span><b>Refresh one player: rest them for a match (+30 on the bench, +40 out of the squad)</b></div>
      <div class="pstep"><span>🧴</span><b>Or give one player a recovery kit (+25 straight away)</b></div>
      <button class="btn full pri" data-act="rejuv">Refresh players now</button><button class="btn full sec2" data-act="back" style="margin-top:6px">Got it</button>`, { popup: true }); };
  // 1.02 (FEEDBACK 156.4): a readiness check before the season starts. Advice only.
  C.readiness = () => { const car = C.car(), out = [], cap = C.rosterCap(car), n = car.squad.length;
    if (cap > n) out.push(['👕', `${cap - n} roster place${cap - n > 1 ? 's' : ''} left`, 'tab', 'recruit']);
    if (car.job.eq && C.poolLeft() > 0) out.push(['🎓', `${C.money(C.poolLeft())} of scholarships unspent`, 'tab', 'recruit']);
    const nb = Object.keys(C.BUILDINGS).find(C.buildable), up = Object.keys(C.BUILDINGS).find(k => C.readyArrow(k));
    if (C.freeSlot() && (nb || up)) out.push(['🔨', nb ? `A builder is free: build the ${C.BUILDINGS[nb].name}` : `A builder is free: upgrade the ${C.BUILDINGS[up].name}`, 'dgo', nb || up]);
    if (C.pbRunning() < C.pbSlots()) out.push(['📋', `${C.pbSlots() - C.pbRunning()} research slot${C.pbSlots() - C.pbRunning() > 1 ? 's' : ''} free`, 'playbook', '']);
    const rw = C.loClaimable() + meta().inbox.filter(x => x.r && !x.claimed).length; if (rw) out.push(['🎁', `${rw} reward${rw > 1 ? 's' : ''} to claim`, C.msClaimable() ? 'nexttask' : C.evOnlyClaimable() ? 'events' : 'inbox', '']);
    return out; };
  A.startseason = () => { const car = C.car(); if (!preReady(car)) return C.openPreseason(); const list = C.readiness();
    const up = car.tier > 1 ? car.tier - 1 : null, gl = C.SEASON_GOAL[car.job.stars], need = up ? C.TIER_GATE[up] : 0, okHQ = up && C.hqOkFor(up);
    const obj = `<div class="card objs"><b>🎯 This season's objectives</b><div class="pstep"><span>🏛</span><b>Director's goal: ${C.esc(gl ? gl[0] : 'Do your best')}</b></div>
      ${up ? `<div class="pstep ${okHQ ? 'done' : ''}"><span>${okHQ ? '✔' : '🏗'}</span><b>Reach ${C.BUILDINGS.hq.name} Lv ${need} (now Lv ${C.level('hq')}) to be allowed promotion to ${C.esc(C.TIERS[up].name)}</b></div>
      <div class="pstep"><span>🥇</span><b>Finish 1st or 2nd: promoted automatically</b></div><div class="pstep"><span>⚔️</span><b>Finish 3rd or 4th: promotion play-off against the bottom teams of the league above</b></div>` : '<div class="pstep"><span>👑</span><b>Top tier: win the conference</b></div>'}</div>`;
    C.ui.open('Ready for the season?', () => `${obj}${list.length ? `<p class="note" style="margin-top:0">You can still do these before your first match:</p>${list.map(([ic, txt, act, v]) => `<div class="pstep"><span>${ic}</span><b>${txt}</b><button class="btn sm2 go" data-act="${act}" data-v="${v}">Go</button></div>`).join('')}` : '<p class="note" style="margin-top:0">Everything is ready.</p>'}
      <p class="note">Once the season starts, league matches open and training plans begin.</p><div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Not yet</button><button class="btn pri" data-act="startseasonok">🏁 Start the season</button></div>`, { popup: true }); };
  A.startseasonok = () => { const car = C.car(); if (!preReady(car)) return; car.pre = false; if (C.releaseBatch) C.releaseBatch(); if (car.sea && car.sea.md < 1) car.sea.md = 1;
    C.mail('director', '🏁', 'The season is under way', 'Good luck out there, Coach.', null); C.save(); C.ui.closeAll(); C.toast('🏁 The season has started!'); C.render(); };
  // matches wait for the season, except the friendlies; player training waits too
  const oPre = C.openPreMatch; C.openPreMatch = () => { const car = C.car(); if (car && car.pre) { if (C.friendliesLeft(car) && C.myFixture()) return oPre(); return C.openPreseason(); } return oPre(); };
  const oPlan = C.startPlan; C.startPlan = (...a) => { const car = C.car(); if (car && car.pre) return 'pre'; const r = oPlan(...a); if (r === true) { meta().ms.train = (meta().ms.train || 0) + 1; C.dailyEvent('train'); } return r; };
  const oGameday = C.gamedayHTML; C.gamedayHTML = () => { const car = C.car(); if (!car || !car.pre) return oGameday();
    if (C.friendliesLeft(car) && C.myFixture()) return oGameday();
    const n = car.squad.length; return `<div class="gameday pre"><span class="gdc">🗓</span><div class="vs"><div><small>PRE-SEASON · SEASON ${car.season}</small>${car.season > 1 || car.preLite ? 'Ready for the season' : 'Build your program'}</div></div><button class="go" data-act="preseason">${C.preTasksLeft() ? `See tasks (${C.preTasksLeft()} left)` : '🏁 Start the season'}</button></div>`; };
  const oTac = C.openTactics; C.openTactics = (...a) => { if (C.car()) meta().ms.lineup = 1; return oTac(...a); };   // 1.04: "Set your line-up"
  // a brand-new career starts in pre-season (older saves are already mid-season)
  const oNew = C.newCareer; C.newCareer = o => { const car = oNew(o); car.pre = true; C.save(); return car; };

  // ================= hooks: counters for Missions, the Inbox's match reports =================
  const wrap = (name, f) => { const o = C[name]; if (o) C[name] = (...a) => f(o, ...a); };
  const ms = k => { const M = meta(); M.ms[k] = (M.ms[k] || 0) + 1; };
  wrap('sendOffer', (o, ...a) => { ms('offers'); C.dailyEvent('offer'); return o(...a); });
  wrap('collect', (o, ...a) => { const r = o(...a); if (r) { ms('collect'); C.dailyEvent('collect'); } return r; });
  wrap('pbStart', (o, ...a) => { const r = o(...a); if (r === true) { ms('research'); C.dailyEvent('research'); } return r; });
  wrap('startUpgrade', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('upgrade'); return r; });
  wrap('finishNow', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('speed'); return r; });
  wrap('useSpeed', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('speed'); return r; });
  wrap('claimGift', (o, ...a) => { const r = o(...a); if (r) C.dailyEvent('gift'); return r; });
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
      <div class="jbtns" style="grid-template-columns:1fr 1fr;margin-top:8px"><button class="btn sec2" data-act="buykitc">🧴 Buy kit · ${C.GEM} ${C.TREAT.kit}</button><button class="btn sec2" data-act="buypack" data-v="packRec">🧴 Recovery Pack · ${C.PACKS.packRec.price}</button></div>
      <p class="note">Resting a player for a match also restores Freshness: +30 on the bench, +40 out of the squad.</p>`; }, { popup: true });
  A.rejuv = () => C.openRejuv();
  // the Home tiles and campus buttons link here
  A.events = () => C.openEvents();
})(window.CFC);
