// Club FC: gear and the Kit Room (phase-9o, round 6 item 58). Your program owns its gear: a starter set, then pieces earned
// through play and delivered to the Kit Room building, where they're also upgraded. Pieces give % boosts in matches, at most
// +20% on any skill, and come back to the Kit Room when a player leaves. Never sold in the Store: money doesn't buy results.
(function (C) {
  const A = C.ACTS, meta = () => C.meta();
  const OUT = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'], GK = ['stp', 'crs', 'str', 'ref', 'psn', 'dis'];
  const SHIN = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M7 2.5h10c1 0 1.6.8 1.5 1.8l-1.3 13c-.2 2.300-2.600 4.200-5.200 4.200s-5-1.900-5.200-4.200l-1.300-13C5.400 3.300 6 2.500 7 2.500z" fill="#e2e8f0" stroke="#334155" stroke-width="1.200"/><path d="M12 5.500v12M8.500 8h7M9 12h6" stroke="#64748b" stroke-width="1.300" stroke-linecap="round"/></svg>';
  C.GEAR = {
    boots: { icon: '👟', name: 'Boots', main: ['pac', 'dri'], gkMain: ['dis', 'ref'] },
    shins: { icon: SHIN, name: 'Shin pads', main: ['def', 'phy'] },
    base: { icon: '👕', name: 'Base layer', main: ['phy', 'pac'], gkMain: ['str', 'psn'] },
    tracker: { icon: '⌚', name: 'Performance tracker', main: ['pas', 'sho'], gkMain: ['psn', 'dis'] },
    gloves: { icon: '🧤', name: 'Keeper gloves', main: ['stp', 'crs'], gk: true }
  };
  const SLOTKEYS = ['boots', 'shins', 'base', 'tracker', 'gloves'], RAR = C.RARITY, MAXPCT = 20;
  C.gearSlots = p => p.pos === 'GK' ? ['gloves', 'boots', 'base', 'tracker'] : ['boots', 'shins', 'base', 'tracker'];
  // level cap by rarity (5 … 25), and the Kit Room's level also limits upgrades
  C.gearCap = g => 5 * (g.rar + 1);
  C.kitLevel = () => C.eff('kitroom');
  C.gearLvMax = g => Math.min(C.gearCap(g), 2 + C.kitLevel() * 2);
  // a piece boosts its two main skills: Common 1–2%, Ultra Rare 3–5%
  C.gearPct = g => Math.round((1 + g.rar * .5 + (g.lv - 1) / Math.max(1, C.gearCap(g) - 1) * (1 + g.rar * .25)) * 10) / 10;
  C.gearCost = g => Math.round(600 * (g.lv + 1) * (1 + g.rar * .5) / 50) * 50;
  const gear = () => { const M = meta(); if (!M.gear) M.gear = []; M.gear.forEach(g => { if (g.slot === 'vest') g.slot = 'base'; }); return M.gear; };
  C.gearList = gear;
  const holder = g => g.on && C.P(g.on) ? g.on : null;                 // gear on a player who has left is free again
  C.gearOn = (p, slot) => gear().find(g => holder(g) === p.id && g.slot === slot) || null;
  const nm = k => (C.ATTR[k] || C.GKATTR[k] || ['', k])[1];

  // a new piece: rarity rolled (mostly Common/Uncommon, better with a higher Kit Room), one +1% bonus line per rarity step
  C.makeGear = (r, slot, rar) => { if (rar == null) { const x = r() - Math.min(.15, (C.car() ? C.kitLevel() : 0) * .01); rar = x < .5 ? 0 : x < .8 ? 1 : x < .95 ? 2 : x < .99 ? 3 : 4; }
    if (!slot) slot = SLOTKEYS[Math.floor(r() * SLOTKEYS.length)];
    const pool = C.GEAR[slot].gk ? GK : OUT, ex = [];
    for (let i = 0; i < rar; i++) ex.push([pool[Math.floor(r() * pool.length)], 1]);
    return { id: 'g' + Math.floor(r() * 1e9).toString(36), slot, rar, lv: 1, ex, on: null }; };

  // what a player's gear adds, as % per skill, capped at +20%
  C.gearBonus = p => { const out = {}; for (const s of C.gearSlots(p)) { const g = C.gearOn(p, s); if (!g) continue; const d = C.GEAR[s], main = p.pos === 'GK' && d.gkMain ? d.gkMain : d.main, v = C.gearPct(g);
      main.forEach(k => { if (p.a[k] != null) out[k] = (out[k] || 0) + v; }); g.ex.forEach(([k, n]) => { if (p.a[k] != null) out[k] = (out[k] || 0) + n; }); }
    for (const k in out) out[k] = Math.min(MAXPCT, Math.round(out[k] * 10) / 10); return out; };
  C.gearTop = p => Object.values(C.gearBonus(p)).reduce((m, v) => Math.max(m, v), 0);

  // matches: players take the field with their gear (a copy, so saved skills never change)
  const scale = (p, b) => { const a = Object.assign({}, p.a); for (const k in b) a[k] = Math.min(99, Math.round(a[k] * (1 + b[k] / 100))); return Object.assign({}, p, { a }); };
  const withGear = p => { if (!p) return p; const b = C.gearBonus(p); return Object.keys(b).length ? scale(p, b) : p; };
  const oTeam = C.myTeam; C.myTeam = home => { const T = oTeam(home); T.xi = T.xi.map(withGear); T.bench = T.bench.map(withGear); return T; };
  // other programs have kit rooms too: their squads get a matching lift, so gear keeps pace rather than running away
  const oOpp = C.oppTeam; C.oppTeam = ti => { const T = oOpp(ti), pct = Math.min(12, C.kitLevel()), up = p => { if (!p || !pct) return p; const b = {}; Object.keys(p.a).forEach(k => b[k] = pct); return scale(p, b); }; T.xi = T.xi.map(up); T.bench = (T.bench || []).map(up); return T; };

  // rewards: 'gear' gives random pieces
  const oGive = C.giveReward; C.giveReward = r => { if (r && r.gear && C.car()) { const rr = C.rng((C.now() ^ Math.floor(Math.random() * 1e9)) & 0x7fffffff); for (let i = 0; i < r.gear; i++) gear().push(C.makeGear(rr)); r = Object.assign({}, r); delete r.gear; } oGive(r); };
  const oText = C.rwText; C.rwText = r => { if (!r || !r.gear) return oText(r); const o = Object.assign({}, r); delete o.gear; return [oText(o), `🎒 ${r.gear > 1 ? r.gear + '× ' : ''}Gear`].filter(Boolean).join(' · '); };
  const oTiles = C.itemTiles; C.itemTiles = r => { if (!r || !r.gear) return oTiles(r); const o = Object.assign({}, r); delete o.gear; const s = oTiles(o); return s.slice(0, s.lastIndexOf('</span>')) + `<span class="itile t3" title="Gear">🎒<b>${r.gear}</b></span></span>`; };

  // equip, unequip, upgrade
  C.equip = (gid, pid) => { const g = gear().find(x => x.id === gid), p = C.P(pid); if (!g || !p || !C.gearSlots(p).includes(g.slot)) return false;
    const cur = C.gearOn(p, g.slot); if (cur) cur.on = null; g.on = pid; C.save(); return true; };
  C.unequip = gid => { const g = gear().find(x => x.id === gid); if (g) { g.on = null; C.save(); } };
  C.upgradeGear = gid => { const g = gear().find(x => x.id === gid), car = C.car(); if (!g) return 'gone'; if (!C.kitLevel()) return 'nokit'; if (g.lv >= C.gearCap(g)) return 'max'; if (g.lv >= C.gearLvMax(g)) return 'kit'; const k = C.gearCost(g); if (car.cash < k) return 'cash';
    car.cash -= k; g.lv++; C.save(); return true; };

  // ---------- Kit Room deliveries: a new piece arrives on a timer, faster as it levels up ----------
  const H = 36e5;
  C.kitEvery = () => Math.max(8, 26 - C.kitLevel() * 2) * H;
  const kitNext = () => { const M = meta(); if (M.kitAt == null) M.kitAt = C.now() + C.kitEvery(); return M.kitAt; };
  C.kitReady = () => C.kitLevel() > 0 && C.now() >= kitNext();
  C.kitCollect = () => { if (!C.kitReady()) return null; const M = meta(); M.kitAt = C.now() + C.kitEvery(); const r = C.rng((C.now() ^ 0x51ed) & 0x7fffffff), g = C.makeGear(r); gear().push(g); C.save(); return g; };

  // ---------- screens ----------
  const tile = (g, slot) => g ? `<span class="gtile r${g.rar}"><i>${C.GEAR[g.slot].icon}</i><b>Lv.${g.lv}</b><em>${'★'.repeat(Math.max(1, g.rar))}</em></span>` : `<span class="gtile empty"><i>${C.GEAR[slot].icon}</i><b>+</b></span>`;
  const lineTxt = (g, p) => { const d = C.GEAR[g.slot], main = p && p.pos === 'GK' && d.gkMain ? d.gkMain : d.main;
    return `<div class="gline main">${main.map(nm).join(' · ')} <b>+${C.gearPct(g)}%</b></div>${g.ex.map(([k, n]) => `<div class="gline">🔹 ${nm(k)} <b>+${n}%</b></div>`).join('')}`; };
  const upBtn = g => { const at = g.lv >= C.gearCap(g); return !C.kitLevel() ? `<button class="btn sm2 sec2" data-act="bldopen" data-v="kitroom">🔒 Kit Room</button>` : at ? '<button class="btn sm2 sec2" disabled>Max level</button>' : g.lv >= C.gearLvMax(g) ? `<button class="btn sm2 sec2" data-act="bldopen" data-v="kitroom">Needs Kit Room Lv ${Math.ceil((g.lv - 1) / 2)}</button>` : `<button class="btn sm2" data-act="gearup" data-v="${g.id}">Upgrade: 💵 ${C.full(C.gearCost(g))}</button>`; };
  // the gear row on a player's card
  C.gearRowHTML = p => `<h3 class="jh">Gear ${C.gearTop(p) ? `<small class="devp">up to +${C.gearTop(p)}% in matches</small>` : ''}</h3><div class="grow">${C.gearSlots(p).map(s => `<button class="gslot" data-act="gearslot" data-v="${p.id}|${s}">${tile(C.gearOn(p, s), s)}<small>${C.GEAR[s].name}</small></button>`).join('')}</div>
    <p class="note" style="margin-top:4px">Tap a slot to equip gear you own. It comes back to the Kit Room when a player leaves.</p>`;
  let pick = null;
  A.gearslot = v => { const [pid, slot] = v.split('|'); pick = { pid, slot }; C.ui.open(C.GEAR[slot].name, slotHTML, { popup: true }); };
  function slotHTML() {
    const p = C.P(pick.pid), slot = pick.slot, cur = C.gearOn(p, slot), list = gear().filter(g => g.slot === slot && g !== cur).sort((a, b) => b.rar - a.rar || b.lv - a.lv);
    const row = (g, worn) => { const who = holder(g) ? C.P(g.on) : null;
      return `<div class="gcard r${g.rar}">${tile(g)}<div class="gi"><b>${RAR[g.rar][0]} ${C.GEAR[g.slot].name}</b>${lineTxt(g, p)}${who && !worn ? `<small>Worn by ${C.esc(C.sn(who))}</small>` : ''}</div>
        <div class="gb">${worn ? `<button class="btn sm2 sec2" data-act="gearoff" data-v="${g.id}">Remove</button>` : `<button class="btn sm2 pri" data-act="gearon" data-v="${g.id}">${who ? 'Swap' : 'Equip'}</button>`}${upBtn(g)}</div></div>`; };
    return `${cur ? `<label class="fld">Wearing</label>${row(cur, true)}` : ''}<label class="fld">In your Kit Room</label>${list.length ? list.map(g => row(g, false)).join('') : `<p class="note">You don't own a spare one. Gear is earned, not bought: from Missions, chests, free event drops and Kit Room deliveries.</p>`}`;
  }
  A.gearon = v => { if (C.equip(v, pick.pid)) { C.toast('🎒 Equipped'); C.ui.back(); C.ui.refresh(); } };
  A.gearoff = v => { C.unequip(v); C.ui.refresh(); };
  A.gearup = v => { const g = gear().find(x => x.id === v); C.confirm('Upgrade gear?', `<div class="card"><b>${RAR[g.rar][0]} ${C.GEAR[g.slot].name}</b><div class="srow"><span>Level</span><b>${g.lv} ▶ ${g.lv + 1}</b></div><div class="srow"><span>Cost</span><b>💵 ${C.full(C.gearCost(g))}</b></div></div>`, 'Upgrade', 'gearupgo', v); };
  A.gearupgo = v => { const r = C.upgradeGear(v); C.toast(r === true ? '⬆ Gear upgraded' : r === 'cash' ? 'Not enough Booster $' : 'Can\'t upgrade this yet'); C.ui.refresh(); C.render(); };
  // everything you own: the Inventory's Gear tab and the Kit Room popup
  C.kitRoomHTML = () => { const list = gear().slice().sort((a, b) => b.rar - a.rar || b.lv - a.lv);
    return list.length ? `<div class="kitg">${list.map(g => { const who = holder(g) ? C.P(g.on) : null; return `<div class="kitc">${tile(g)}<small>${C.GEAR[g.slot].name}</small><em>${who ? C.esc(C.sn(who)) : 'Spare'}</em></div>`; }).join('')}</div>` : '<p class="note">No gear yet.</p>'; };
  C.openKitRoom = () => C.ui.open('Kit Room', () => { const lv = C.kitLevel(), ready = C.kitReady();
    return `${lv ? `<div class="card kitdel"><span>📦</span><div><b>${ready ? 'A delivery has arrived' : 'Next delivery'}</b><small>${ready ? 'New gear for your program' : C.dur((kitNext() - C.now()) / 1000) + ' · one piece every ' + Math.round(C.kitEvery() / H) + 'h'}</small></div><button class="btn sm2 ${ready ? 'claim' : 'sec2'}" data-act="kitcollect" ${ready ? '' : 'disabled'}>Collect</button></div>` : `<button class="btn full pri" data-act="bldopen" data-v="kitroom">🔒 Unlocks at Coaches' Office Lv ${C.BUILDINGS.kitroom.needHQ}</button>`}
      <p class="note">Gear is upgraded from a player's card, up to level ${lv ? 2 + lv * 2 : 0} with this Kit Room. Boosts are percentages, at most +${MAXPCT}% on any skill.</p>${C.kitRoomHTML()}`; }, { popup: true });
  A.kitcollect = () => { const g = C.kitCollect(); if (g) { C.toast(`📦 ${RAR[g.rar][0]} ${C.GEAR[g.slot].name}`); C.ui.refresh(); C.render(); } };

  // a starter set for every career
  const ensureStarter = () => { const car = C.car(); if (!car) return; if (car.b.kitroom == null) car.b.kitroom = 0; const M = meta(); if (M.gearStart) return; M.gearStart = 1; const r = C.rng((car.created & 0xffffff) ^ 0x9e37);
    ['boots', 'shins', 'base', 'gloves'].forEach(s => gear().push(C.makeGear(r, s, 0))); C.save(); };
  const oRender = C.render; C.render = () => { if (C.car()) ensureStarter(); return oRender(); };
})(window.CFC);
