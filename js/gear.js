// Club FC: player gear (phase-9k, round 4 item 34). Equipment belongs to your program, not the player: boots, shin pads,
// a training vest and keeper gloves add + boosts to attributes, and when a player graduates their gear comes back to the
// kit room for the next one. Gear comes from playing (Missions, chests, the free Pass track), never from the Store,
// so money still never buys results. Boosts apply in matches only; a player's rating and development stay their own.
(function (C) {
  const A = C.ACTS, meta = () => C.meta();
  const OUT = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'], GK = ['stp', 'crs', 'str', 'ref', 'psn', 'dis'];
  C.GEAR = {
    boots: { icon: '👟', name: 'Boots', main: ['pac', 'dri'], gkMain: ['dis', 'ref'] },
    shins: { icon: '🦺', name: 'Shin pads', main: ['def', 'phy'] },
    vest: { icon: '🎽', name: 'Training vest', main: ['phy', 'pas'], gkMain: ['str', 'psn'] },
    gloves: { icon: '🧤', name: 'Keeper gloves', main: ['stp', 'crs'], gk: true }
  };
  const RAR = C.RARITY;   // Common … Ultra Rare
  C.gearSlots = p => p.pos === 'GK' ? ['gloves', 'boots', 'vest'] : ['boots', 'shins', 'vest'];
  C.gearCap = g => 5 * (g.rar + 1);                                   // level cap by rarity: 5, 10, 15, 20, 25
  C.gearMain = g => Math.round(1 + g.rar * 1.2 + g.lv * .35);          // added to both main attributes
  C.gearCost = g => Math.round(600 * (g.lv + 1) * (1 + g.rar * .5) / 50) * 50;
  const gear = () => { const M = meta(); if (!M.gear) M.gear = []; return M.gear; };
  C.gearList = gear;
  const holder = g => g.on && C.P(g.on) ? g.on : null;                 // gear on a player who has left is free again
  C.gearOn = (p, slot) => gear().find(g => holder(g) === p.id && g.slot === slot) || null;

  // a new piece: rarity rolled (mostly Common/Uncommon), one bonus line per rarity step
  C.makeGear = (r, slot, rar) => { if (rar == null) { const x = r(); rar = x < .5 ? 0 : x < .8 ? 1 : x < .95 ? 2 : x < .99 ? 3 : 4; }
    if (!slot) slot = ['boots', 'shins', 'vest', 'gloves'][Math.floor(r() * 4)];
    const pool = C.GEAR[slot].gk ? GK : OUT, ex = [];
    for (let i = 0; i < rar; i++) ex.push([pool[Math.floor(r() * pool.length)], 1 + (r() < .3 ? 1 : 0)]);
    return { id: 'g' + Math.floor(r() * 1e9).toString(36), slot, rar, lv: 1, ex, on: null }; };

  // what a piece adds to one player: both main attributes, plus any bonus lines that player has
  C.gearBonus = p => { const out = {}; for (const s of C.gearSlots(p)) { const g = C.gearOn(p, s); if (!g) continue; const d = C.GEAR[s], main = p.pos === 'GK' && d.gkMain ? d.gkMain : d.main, v = C.gearMain(g);
      main.forEach(k => { if (p.a[k] != null) out[k] = (out[k] || 0) + v; }); g.ex.forEach(([k, n]) => { if (p.a[k] != null) out[k] = (out[k] || 0) + n; }); } return out; };
  C.gearTotal = p => Object.values(C.gearBonus(p)).reduce((s, v) => s + v, 0);

  // matches: each player takes the field with their gear (a copy, so saved attributes never change)
  const withGear = p => { if (!p) return p; const b = C.gearBonus(p); if (!Object.keys(b).length) return p; const a = Object.assign({}, p.a); for (const k in b) a[k] = Math.min(99, a[k] + b[k]); return Object.assign({}, p, { a }); };
  const oTeam = C.myTeam; C.myTeam = home => { const T = oTeam(home); T.xi = T.xi.map(withGear); T.bench = T.bench.map(withGear); return T; };

  // rewards: 'gear' gives random pieces
  const oGive = C.giveReward; C.giveReward = r => { if (r && r.gear && C.car()) { const rr = C.rng((C.now() ^ Math.floor(Math.random() * 1e9)) & 0x7fffffff); for (let i = 0; i < r.gear; i++) gear().push(C.makeGear(rr)); r = Object.assign({}, r); delete r.gear; } oGive(r); };
  const oText = C.rwText; C.rwText = r => { if (!r || !r.gear) return oText(r); const o = Object.assign({}, r); delete o.gear; return [oText(o), `🎒 ${r.gear > 1 ? r.gear + '× ' : ''}Gear`].filter(Boolean).join(' · '); };
  const oTiles = C.itemTiles; C.itemTiles = r => { if (!r || !r.gear) return oTiles(r); const o = Object.assign({}, r); delete o.gear; const s = oTiles(o); return s.slice(0, s.lastIndexOf('</span>')) + `<span class="itile t3" title="Gear">🎒<b>${r.gear}</b></span></span>`; };

  // equip, unequip, upgrade
  C.equip = (gid, pid) => { const g = gear().find(x => x.id === gid), p = C.P(pid); if (!g || !p || !C.gearSlots(p).includes(g.slot)) return false;
    const cur = C.gearOn(p, g.slot); if (cur) cur.on = null; g.on = pid; C.save(); return true; };
  C.unequip = gid => { const g = gear().find(x => x.id === gid); if (g) { g.on = null; C.save(); } };
  C.upgradeGear = gid => { const g = gear().find(x => x.id === gid), car = C.car(); if (!g) return 'gone'; if (g.lv >= C.gearCap(g)) return 'max'; const k = C.gearCost(g); if (car.cash < k) return 'cash';
    car.cash -= k; g.lv++; C.save(); return true; };

  // ---------- screens ----------
  const tile = (g, slot, empty) => g ? `<span class="gtile r${g.rar}"><i>${C.GEAR[g.slot].icon}</i><b>Lv.${g.lv}</b><em>${'★'.repeat(Math.max(1, g.rar))}</em></span>` : `<span class="gtile empty"><i>${C.GEAR[slot].icon}</i><b>${empty || '+'}</b></span>`;
  const lineTxt = (g, p) => { const d = C.GEAR[g.slot], main = p && p.pos === 'GK' && d.gkMain ? d.gkMain : d.main, all = C.attrsOf(p || { pos: d.gk ? 'GK' : 'ST' }), nm = k => (C.ATTR[k] || C.GKATTR[k] || ['', k])[1];
    return `<div class="gline main">${main.map(nm).join(' · ')} <b>+${C.gearMain(g)}</b></div>${g.ex.map(([k, n]) => `<div class="gline">🔹 ${nm(k)} <b>+${n}</b></div>`).join('')}`; };
  // the gear row on a player's card
  C.gearRowHTML = p => `<h3 class="jh">Gear ${C.gearTotal(p) ? `<small class="devp">+${C.gearTotal(p)} in matches</small>` : ''}</h3><div class="grow">${C.gearSlots(p).map(s => `<button class="gslot" data-act="gearslot" data-v="${p.id}|${s}">${tile(C.gearOn(p, s), s)}<small>${C.GEAR[s].name}</small></button>`).join('')}</div>
    <p class="note" style="margin-top:4px">Gear belongs to your program: it comes back to the kit room when a player leaves.</p>`;
  let pick = null;
  A.gearslot = v => { const [pid, slot] = v.split('|'); pick = { pid, slot }; C.ui.open(C.GEAR[slot].name, slotHTML); };
  function slotHTML() {
    const p = C.P(pick.pid), slot = pick.slot, cur = C.gearOn(p, slot), list = gear().filter(g => g.slot === slot && g !== cur).sort((a, b) => b.rar - a.rar || b.lv - a.lv);
    const row = (g, worn) => { const who = holder(g) ? C.P(g.on) : null;
      return `<div class="gcard r${g.rar}">${tile(g)}<div class="gi"><b>${RAR[g.rar][0]} ${C.GEAR[g.slot].name}</b>${lineTxt(g, p)}${who && !worn ? `<small>Worn by ${C.esc(who.ln)}</small>` : ''}</div>
        <div class="gb">${worn ? `<button class="btn sm2 sec2" data-act="gearoff" data-v="${g.id}">Remove</button>` : `<button class="btn sm2 pri" data-act="gearon" data-v="${g.id}">${who ? 'Swap' : 'Equip'}</button>`}
        <button class="btn sm2 ${g.lv >= C.gearCap(g) ? 'sec2' : ''}" data-act="gearup" data-v="${g.id}" ${g.lv >= C.gearCap(g) ? 'disabled' : ''}>${g.lv >= C.gearCap(g) ? 'Max' : `⬆ 💵 ${C.short(C.gearCost(g))}`}</button></div></div>`; };
    return `${cur ? `<label class="fld">Wearing</label>${row(cur, true)}` : ''}<label class="fld">Kit room</label>${list.length ? list.map(g => row(g, false)).join('') : '<p class="note">No spare pieces for this slot yet. Gear comes from Missions, chests and the free Pass track.</p>'}`;
  }
  A.gearon = v => { if (C.equip(v, pick.pid)) { C.toast('🎒 Equipped'); C.ui.back(); C.ui.refresh(); } };
  A.gearoff = v => { C.unequip(v); C.ui.refresh(); };
  A.gearup = v => { const r = C.upgradeGear(v); C.toast(r === true ? '⬆ Gear upgraded' : r === 'cash' ? 'Not enough Booster $' : 'At the level cap'); C.ui.refresh(); C.render(); };
  // the kit room, in the Inventory
  C.kitRoomHTML = () => { const list = gear().slice().sort((a, b) => b.rar - a.rar || b.lv - a.lv);
    return list.length ? `<div class="kitg">${list.map(g => { const who = holder(g) ? C.P(g.on) : null; return `<div class="kitc">${tile(g)}<small>${C.GEAR[g.slot].name}</small><em>${who ? C.esc(who.ln) : 'Spare'}</em></div>`; }).join('')}</div>` : '<p class="note">No gear yet.</p>'; };

  // ---------- sources (gameplay only) and a starter set ----------
  const ensureStarter = () => { const car = C.car(); if (!car) return; const M = meta(); if (M.gearStart) return; M.gearStart = 1; const r = C.rng((car.created & 0xffffff) ^ 0x9e37);
    ['boots', 'shins', 'vest', 'gloves'].forEach(s => gear().push(C.makeGear(r, s, 0))); C.save(); };
  const oRender = C.render; C.render = () => { if (C.car()) ensureStarter(); return oRender(); };
})(window.CFC);
