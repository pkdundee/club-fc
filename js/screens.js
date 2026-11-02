// Club FC: screens (Phases 0–4). Campus, upgrade card, careers, settings, test store, coming-soon tabs.
(function (C) {
  C.tab = 'season';  // 'season' is shown as Home: matches, calendar and the season
  const W = () => C.campusSize[0], H = () => C.campusSize[1];
  let zoom = 1, view = null;

  C.power = () => { const b = C.car().b; let p = 0; for (const k in b) p += b[k] * (k === 'hq' ? 300 : k === 'stadium' ? 200 : 120); return p; };

  // ================= main render =================
  C.render = () => {
    const app = C.$('#screen');
    if (!C.car()) { app.innerHTML = splashHTML(); return; }
    if (C.tab === 'campus') { app.innerHTML = campusHTML(); mountMap(); }
    else if (C.tab === 'squad') app.innerHTML = C.squadHTML();
    else if (C.tab === 'recruit') app.innerHTML = C.recruitHTML();
    else if (C.tab === 'season') app.innerHTML = C.seasonHTML();
    else if (C.tab === 'staff') app.innerHTML = C.staffHTML();
    else app.innerHTML = soonHTML(C.tab);
    app.insertAdjacentHTML('beforeend', tabsHTML());
  };

  function tabsHTML() {
    const t = [['season', '🏠', 'Home'], ['campus', '🏫', 'Campus'], ['squad', '👕', 'Squad'], ['staff', '🧢', 'Staff'], ['recruit', '✉️', 'Recruit']];
    const dot = k => k === 'staff' && C.car().staff && C.car().staff.mNew ? '<i class="tabdot"></i>' : '';
    return `<nav class="tabs">${t.map(([k, i, n]) => `<button class="tab ${C.tab === k ? 'on' : ''}" data-act="tab" data-v="${k}"><span class="ti">${i}${dot(k)}</span>${n}</button>`).join('')}</nav>`;
  }

  // ================= campus =================
  function campusHTML() {
    const car = C.car(), col = C.college(), a = C.acct(), tier = C.TIERS[car.tier];
    const slots = C.SLOTS.map((s, i) => {
      const q = car.queue[i];
      if (q) { const tot = (q.end - q.start) / 1000, f = 1 - C.remaining(q) / tot;
        return `<button class="qb" data-act="bld" data-v="${q.key}"><div class="c">${C.ringSVG(f, '#f97316', 54)}${C.BUILDINGS[q.key].icon}</div><span data-timer="${q.key}">${C.dur(C.remaining(q))}</span></button>`; }
      if (C.slotOpen(s.id)) return `<button class="qb free" data-act="toast" data-v="Tap a building or an empty plot to build"><div class="c">🔨</div>Free</button>`;
      return `<button class="qb lock" data-act="slotinfo" data-v="${s.id}"><div class="c">🔒</div>${s.id === 'vip' ? 'VIP' : s.id === 'iap' ? '$' : 'Lv 10'}</button>`;
    }).join('');
    return `<div class="view">
      <div class="map" id="map"><div id="mapin"></div></div>
      <div class="hud top">
        <div class="idrow">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 38)}<div><b>${C.esc(col.short)}</b><small>${C.tierLabel()} · ${car.gender === 'w' ? "Women's" : "Men's"} · ⭐ ${C.rep()}</small></div>
          <span class="power" title="Campus rating: goes up as buildings level up">🏗 ${C.power().toLocaleString()}</span></div>
        <div class="res"><span><i>💵</i><b id="r-cash">$${C.short(car.cash)}</b></span><span><i class="cpi"></i><b id="r-cp">${C.short(car.cp)}</b></span><span data-act="store"><i class="coin"></i><b id="r-gold">${C.short(a.gold)}</b><em class="plus">+</em></span></div>
      </div>
      <div class="side sl">${slots}</div>
      <div class="side sr">
        ${C.fwActive() ? `<button class="ev" data-act="firstweek"><div class="c" style="background:linear-gradient(150deg,#f97316,#ea580c)">📅</div>Week 1${C.fwClaimable() ? `<span class="dot">${C.fwClaimable()}</span>` : ''}</button>` : ''}
        ${C.portalOpen() ? `<button class="ev" data-act="portalgo"><div class="c" style="background:linear-gradient(150deg,#a855f7,#6d28d9)">🚪</div>Portal<span class="dot">!</span></button>` : ''}
        <button class="ev" data-act="events"><div class="c" style="background:linear-gradient(150deg,#f59e0b,#d97706)">🎁</div>Events${C.loClaimable() ? `<span class="dot">${C.loClaimable()}</span>` : ''}</button>
        <button class="ev" data-act="ad"><div class="c" style="background:linear-gradient(150deg,#0ea5e9,#0369a1)">🏛</div>Director${C.adUnread() ? `<span class="dot">${C.adUnread()}</span>` : ''}</button>
        <button class="ev" data-act="ask"><div class="c" style="background:linear-gradient(150deg,#16a34a,#15803d)">❓</div>Help</button>
        <button class="ev" data-act="store"><div class="c" style="background:linear-gradient(150deg,#ef4444,#b91c1c)">🛒</div>Store</button>
        <button class="ev" data-act="settings"><div class="c" style="background:linear-gradient(150deg,#64748b,#334155)">⚙️</div>Settings</button>
      </div>
      <div class="zbtns"><button data-act="zoom" data-v="1" aria-label="Zoom in">+</button><button data-act="zoom" data-v="-1" aria-label="Zoom out">−</button></div>
    </div>`;
  }

  // the next match, front and centre (Q13: play whenever you like; energy is the natural limit)
  C.gamedayHTML = gamedayHTML;
  function gamedayHTML() {
    const S = C.sea(), f = C.myFixture();
    if (!f) return `<div class="gameday"><span class="gdc">🏆</span><div class="vs"><div><small>SEASON ${S.n} · ${S.end ? 'FINISHED ' + C.ord(S.end.pos).toUpperCase() : 'WAITING'}</small>${S.end && S.end.champ ? 'Conference champions!' : 'Season review'}</div></div><button class="go" data-act="tab" data-v="season">Review</button></div>`;
    const opp = S.teams[f.h === 0 ? f.a : f.h], xi = C.tac().xi.map(C.P).filter(Boolean), e = Math.round(xi.reduce((s, p) => s + p.energy, 0) / (xi.length || 1));
    return `<div class="gameday">${C.crestSVG(opp.c1, opp.c2, opp.abbr.slice(0, 2), 34)}<div class="vs"><div><small>${f.md === 0 ? 'HOMECOMING' : f.md <= 14 ? 'MATCH ' + f.md + ' OF 14' : f.md === 15 ? 'SEMI-FINAL' : 'FINAL'} · ${f.h === 0 ? 'HOME' : 'AWAY'} · 🔋 ${e}%</small>vs ${C.esc(opp.name)}</div></div><button class="go" data-act="prematch">▶ Play</button></div>`;
  }

  let dragged = false;
  // Pan and zoom. One finger (or the left mouse button held down) drags the map; two fingers pinch to zoom.
  const pts = new Map(); let g = null;
  const mid = p => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
  const gap = p => Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
  function startGesture(m) { const p = [...pts.values()], c = mid(p); g = { m, x: c[0], y: c[1], sl: m.scrollLeft, st: m.scrollTop, dist: p.length > 1 ? gap(p) : 0, z: zoom }; }
  function endGesture(e) { if (!pts.delete(e.pointerId)) return; if (pts.size && g) startGesture(g.m); else { g = null; setTimeout(() => dragged = false, 0); } }
  window.addEventListener('pointermove', e => {
    if (!g || !pts.has(e.pointerId)) return;
    if (!g.m.isConnected) { g = null; pts.clear(); return; }
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) return endGesture(e);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    const p = [...pts.values()], c = mid(p), m = g.m, dx = c[0] - g.x, dy = c[1] - g.y;
    if (Math.abs(dx) + Math.abs(dy) > 8 || p.length > 1) dragged = true;
    if (p.length > 1 && g.dist) {
      const r = m.getBoundingClientRect(), ux = (g.sl + g.x - r.left) / g.z, uy = (g.st + g.y - r.top) / g.z;
      applyZoom(g.z * gap(p) / g.dist);
      m.scrollLeft = ux * zoom - (c[0] - r.left); m.scrollTop = uy * zoom - (c[1] - r.top);
    } else { m.scrollLeft = g.sl - dx; m.scrollTop = g.st - dy; }
  });
  window.addEventListener('pointerup', endGesture); window.addEventListener('pointercancel', endGesture);

  function mountMap() {
    const m = C.$('#map'), inner = C.$('#mapin');
    inner.innerHTML = C.campusSVG(C.car());
    applyZoom(zoom);
    if (!view) view = { sl: Math.max(0, (W() * zoom - m.clientWidth) / 2), st: 40 };
    m.scrollLeft = view.sl; m.scrollTop = view.st;
    m.addEventListener('scroll', () => { view.sl = m.scrollLeft; view.st = m.scrollTop; }, { passive: true });
    m.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') { if (e.button !== 0) return; e.preventDefault(); }
      if (pts.size === 0) dragged = false;
      pts.set(e.pointerId, [e.clientX, e.clientY]); startGesture(m);
    });
    m.addEventListener('wheel', e => { e.preventDefault(); const r = m.getBoundingClientRect(); setZoom(zoom * Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0025)), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  }
  C.mapDragged = () => dragged;
  C.redrawMap = () => { if (C.tab === 'campus' && C.$('#mapin')) mountMap(); };

  function applyZoom(n) {
    // never zoom out past the point where the map just fills the screen (width or height, whichever is reached first)
    const mm = C.$('#map'), minZ = mm && mm.clientWidth ? Math.max(mm.clientWidth / W(), mm.clientHeight / H()) : .65;
    zoom = C.clamp(n, minZ, Math.max(2.2, minZ));
    const m = C.$('#map'), sv = m && m.querySelector('svg'); if (!sv) return;
    sv.setAttribute('width', W() * zoom); sv.setAttribute('height', H() * zoom);
    m.classList.toggle('zoomed', zoom > 1.15);
  }
  // Zoom keeping the point under (ax, ay) still; defaults to the middle of the screen.
  function setZoom(n, ax, ay) {
    const m = C.$('#map'); if (!m) return;
    if (ax == null) { ax = m.clientWidth / 2; ay = m.clientHeight / 2; }
    const ux = (m.scrollLeft + ax) / zoom, uy = (m.scrollTop + ay) / zoom;
    applyZoom(n);
    m.scrollLeft = ux * zoom - ax; m.scrollTop = uy * zoom - ay;
  }
  C.zoomBy = dir => setZoom(zoom * (dir > 0 ? 1.35 : 1 / 1.35));

  // Live bits that change every second without redrawing the map
  C.updateLive = () => {
    const car = C.car(); if (!car) return;
    for (const q of car.queue) {
      C.$$(`[data-timer="${q.key}"]`).forEach(e => e.textContent = C.dur(C.remaining(q)));
      const bar = C.$(`[data-bar="${q.key}"]`); if (bar) bar.setAttribute('width', (28 * C.clamp(1 - C.remaining(q) / ((q.end - q.start) / 1000), 0, 1)).toFixed(1));
    }
    const set = (id, v) => { const e = C.$(id); if (e) e.textContent = v; };
    set('#r-cash', '$' + C.short(car.cash)); set('#r-cp', C.short(car.cp)); set('#r-gold', C.short(C.acct().gold));
  };

  // ================= building actions when selected on the map (Last War style) =================
  // only shortcuts that aren't already a tap away elsewhere (tabs, campus buttons, collect bubbles)
  const SHORTCUTS = { hq: [['📊', 'Program', 'proginfo', '']], film: [['📋', 'Playbook', 'playbook', '']], med: [['🩺', 'Medical Room', 'medical', '']] };
  C.buildingActions = k => {
    const lvl = C.level(k), q = C.inQueue(k), ready = C.readyArrow(k), out = [];
    if (lvl) (SHORTCUTS[k] || []).forEach(([icon, label, act, v]) => out.push({ icon, label, act, v }));
    out.push(q ? { icon: '⏩', label: 'Speed up', act: 'bldopen', v: k, main: true, hot: true }
      : !lvl ? { icon: 'up', label: 'Build', act: 'bldopen', v: k, main: true, hot: true }
      : ready ? { icon: 'up', label: 'Upgrade', act: 'bldopen', v: k, main: true, hot: true } : { icon: 'ℹ️', label: 'Details', act: 'bldopen', v: k, main: true, col: '#64748b' });
    return out;
  };
  C.openProgramInfo = () => C.ui.open('Program', () => {
    const car = C.car(), col = C.college(), t = C.table().find(x => x.i === 0);
    const rows = [['🪜', 'Tier', C.tierLabel()], ['⭐', 'Reputation', C.rep() + ' / 100'], ['🧳', 'Program level', C.programLevel()], ['🧱', 'Building cap', 'Lv ' + C.maxLevel('training')],
      ['🏗', 'Campus rating', C.power().toLocaleString()], ['🧑‍🏫', 'Staff Power', C.staffPower().toLocaleString()], ['📋', 'Playbook levels', C.pbTotal()],
      ['🏆', 'Season ' + C.sea().n, C.sea().end ? 'Finished ' + C.ord(C.sea().end.pos) : t && t.p ? C.ord(C.myPos()) + ' · ' + t.w + 'W ' + t.d + 'D ' + t.l + 'L' : 'Not started'],
      ['🏛', 'Director confidence', ['😟', '🙁', '😐', '🙂', '😀'][Math.min(4, Math.floor((car.adConf ?? 50) / 20))]], ['👕', 'Roster', car.squad.length + ' / ' + C.rosterCap()], ['🎓', 'Scholarships left', C.short(C.poolLeft())]];
    return `<div class="collegecard">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 56)}<div><b style="font-family:Graduate,serif;font-size:18px">${C.esc(col.full)}</b><br><small class="mutey">Coach ${C.esc(car.coach)} · ${car.gender === 'w' ? "Women's" : "Men's"} program</small></div></div>
      <div class="card srows" style="margin-top:12px">${rows.map(r => `<div class="srow"><span>${r[0]} ${r[1]}</span><b>${r[2]}</b></div>`).join('')}</div>`;
  });

  // ================= upgrade card (Last War layout, Q29) =================
  C.openBuilding = k => C.ui.open(C.BUILDINGS[k].name, () => upgradeCard(k), { modal: true });

  function statRows(k, lv) {
    const def = C.BUILDINGS[k], now = lv ? def.stats(lv) : null, next = lv < 30 ? def.stats(lv + 1) : null;
    const rows = (next || now).map((r, i) => {
      const icon = r[0] === 'seat' ? C.seatIcon(C.college().c1) : r[0];
      const a = now ? now[i][2] : '—', b = next ? next[i][2] : null;
      return `<div class="tr"><span class="k">${icon} ${r[1]}</span><span class="v">${b != null ? `${a} <span class="ar">▶</span> <em>${b}</em>` : `<em>${a}</em>`}</span></div>`;
    });
    if (lv < 30) { const f = C.featureAt(k, lv + 1); if (f) rows.push(`<div class="tr new"><span class="k">✨ New at Lv ${lv + 1}</span><span class="v"><em>${f}</em></span></div>`); }
    return rows.join('');
  }

  function upgradeCard(k) {
    const car = C.car(), def = C.BUILDINGS[k], lv = car.b[k], q = C.inQueue(k);
    const head = (lvTxt) => `<div class="uc"><div class="top"><div class="pic">${C.buildingThumb(k, q ? q.to : Math.min(30, lv + (lv < 30 ? 1 : 0)), car, 170, 112)}</div>
      <div class="ttl"><b>${C.esc(def.name)}</b><div class="lv">${lvTxt}</div><div class="xp">${def.owner === 'program' ? '🧳 Your program' : '🏛 School building'}</div></div>
      <button class="xbtn" data-act="close" aria-label="Close">✕</button></div><div class="desc">${def.desc}</div>`;

    if (q) {
      const rem = C.remaining(q), free = C.isFreeFinish(q), g = C.goldToFinish(q), gems = C.acct().gold;
      return head(`Lv.${lv} <span class="ar">▶</span> ${q.to}`) + `<div class="tbl">${statRows(k, lv)}</div>
        <div class="orig"><span>Under construction · <b data-timer="${k}">${C.dur(rem)}</b> left</span><span>${C.GEM} ${C.short(gems)}</span></div>
        <div class="bt"><button class="fin" data-act="speed" data-v="${k}">${free ? 'Finish<br><em style="color:#15803d">Free</em>' : `Finish Now<br><em class="${gems < g ? 'short' : ''}">${C.GEM} ${g}</em>`}</button>
        <button class="upg" data-act="adspeed" data-v="${k}" ${C.adsLeft() <= 0 ? 'disabled' : ''}>▶ Watch ad<br>−15 min (${C.adsLeft()} left)</button></div></div>`;
    }
    if (lv >= 30) return head(`Lv.30 <span class="ar">★</span>`) + `<div class="tbl">${statRows(k, lv)}</div><div class="maxed">✨ Fully upgraded</div></div>`;

    const reqs = C.requirements(k), ok = reqs.every(r => r[2]), t = C.timeOf(k, lv + 1), gi = C.coinsFor(t), gems = C.acct().gold;
    const prod = C.PRODUCERS[k] && lv ? `<div class="adrow"><button data-act="collect" data-v="${k}">Collect ${C.PRODUCERS[k] === 'cp' ? '<i class="cpi"></i>' : '💵'} ${C.short(C.stored(k))}</button></div>` : '';
    const slotMsg = ok && !C.freeSlot() ? `<span style="color:#fde68a">All build slots are busy</span>` : '<span></span>';
    return head(lv ? `Lv.${lv} <span class="ar">▶</span> ${lv + 1}` : `Build <span class="ar">▶</span> Lv 1`) +
      `<div class="tbl">${statRows(k, lv)}<div class="costh">Cost</div>
        <div class="crs">${reqs.map(r => `<span class="crc ${r[2] ? '' : 'bad'}">${r[0]} ${C.esc(r[1])} ${r[2] ? '<b class="ok">✔</b>' : '<b class="no">✖</b>'}</span>`).join('')}</div></div>
      <div class="orig">${slotMsg}<span>${C.GEM} ${C.short(gems)}</span></div>
      <div class="bt"><button class="fin" data-act="instant" data-v="${k}" ${ok ? '' : 'disabled'}>Finish Now<br><em class="${gems < gi ? 'short' : ''}">${C.GEM} ${gi}</em></button>
      <button class="upg" data-act="upgrade" data-v="${k}" ${C.canUpgrade(k) ? '' : 'disabled'}>${lv ? 'Upgrade' : 'Build'}<br>⏱ ${C.dur(t)}</button></div>${prod}</div>`;
  }

  // Pay Coins to skip the build time entirely (resources still required)
  C.instantUpgrade = k => {
    const car = C.car(), lv = car.b[k], to = lv + 1, t = C.timeOf(k, to), g = C.coinsFor(t);
    if (!C.requirements(k).every(r => r[2])) return false;
    if (C.acct().gold < g) { C.toast('Not enough Coins'); return false; }
    const cost = C.costOf(k, to); car.cash -= cost.cash; car.cp -= cost.cp; C.acct().gold -= g; car.b[k] = to; C.save(); return true;
  };

  // ================= careers (save slots, Q27) =================
  C.openCareers = () => C.ui.open('Careers', careersHTML);
  function careersHTML() {
    const rows = C.db.careers.map((car, i) => { const col = C.COLLEGES[car.college];
      return `<button class="lrow" data-act="switchcar" data-v="${i}">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 46)}
        <span class="lt"><b>${C.esc(car.coach)} · ${C.esc(col.short)}</b><small>${car.gender === 'w' ? "Women's" : "Men's"} · ${C.TIERS[car.tier].n} · ⚡ ${(() => { let p = 0; for (const k in car.b) p += car.b[k] * (k === 'hq' ? 300 : k === 'stadium' ? 200 : 120); return p.toLocaleString(); })()}</small></span>
        <span class="lr">${i === C.db.active ? '<span class="pill">Playing</span>' : '›'}</span></button>`; }).join('');
    const free = C.careerSlots() - C.db.careers.length;
    const add = free > 0 ? `<button class="lrow" data-act="newcar"><span class="li">➕</span><span class="lt"><b>New career</b><small>${free} free slot${free > 1 ? 's' : ''}</small></span><span class="lr">›</span></button>`
      : `<button class="lrow lock" data-act="store"><span class="li">🔒</span><span class="lt"><b>More career slots</b><small>Coach's Club adds a slot</small></span><span class="lr">›</span></button>`;
    return `${rows}${add}<p class="note">Each career is its own coach and college. Coins and purchases are shared. Switch any time; timers keep running.</p>
      ${C.db.careers.length > 1 ? `<button class="btn full danger" data-act="delcar">Delete a career…</button>` : ''}`;
  }

  // ================= settings (with test tools) =================
  C.openSettings = () => C.ui.open('Settings', () => {
    const a = C.acct();
    return `<button class="lrow" data-act="careers"><span class="li">🧑‍🏫</span><span class="lt"><b>Careers</b><small>Switch or start a career</small></span><span class="lr">›</span></button>
      <button class="lrow" data-act="help" data-v=""><span class="li">📖</span><span class="lt"><b>Coach's Handbook</b><small>How US college soccer works</small></span><span class="lr">›</span></button>
      <button class="lrow" data-act="replayintro"><span class="li">🎬</span><span class="lt"><b>Replay the intro</b><small>The opening explainer screens</small></span><span class="lr">›</span></button>
      <label class="fld">Sound</label><div class="seg2"><button class="${a.sound ? 'on' : ''}" data-act="sound" data-v="1">🔊 On</button><button class="${a.sound ? '' : 'on'}" data-act="sound" data-v="0">🔇 Off</button></div>
      <label class="fld">Theme</label><div class="seg3">${['auto', 'light', 'dark'].map(t => `<button class="${a.theme === t ? 'on' : ''}" data-act="theme" data-v="${t}">${{ auto: 'Auto', light: 'Light', dark: 'Dark' }[t]}</button>`).join('')}</div>
      <label class="fld">Testing tools</label>
      <div class="seg3"><button data-act="cheat" data-v="gold">+500 <i class="coin"></i></button><button data-act="cheat" data-v="cash">+$20K</button><button data-act="cheat" data-v="cp">+100 <i class="cpi"></i></button></div>
      <button class="btn full sec2" data-act="cheat" data-v="finish">Finish all builds now</button>
      <div class="seg2" style="margin-top:8px"><button data-act="cheat" data-v="apps">+ Applications</button><button data-act="cheat" data-v="camp">Camp ready</button></div>
      <div class="seg2" style="margin-top:8px"><button data-act="cheat" data-v="rep">+30 reputation</button><button data-act="cheat" data-v="prog">Program buildings +3</button></div>
      <div class="seg2" style="margin-top:8px"><button data-act="cheat" data-v="rest">Full Freshness</button><button data-act="cheat" data-v="season">Skip to season end</button></div>
      <button class="btn full sec2" data-act="cheat" data-v="portal" style="margin-top:8px">${C.car() && C.portalOpen() ? '🚪 Close the transfer window now' : '🚪 Open a transfer window'}</button>
      <label class="fld">Building cap override (try higher levels)</label>
      <div class="seg3">${[0, 12, 18].map(v => `<button class="${a.testCap === v ? 'on' : ''}" data-act="testcap" data-v="${v}">${v ? 'Lv ' + v : 'Off'}</button>`).join('')}</div>
      <div class="seg2" style="margin-top:8px">${[24, 30].map(v => `<button class="${a.testCap === v ? 'on' : ''}" data-act="testcap" data-v="${v}">Lv ${v}</button>`).join('')}</div>
      <p class="note">Testing tools are for this preview build only.</p>
      <p class="note">Version: ${C.BUILD}</p><button class="btn full sec2" data-act="checkupdate">🔄 Check for update</button>
      <button class="btn full danger" data-act="wipe">Delete all saved data…</button>`;
  });

  // ================= test store (Phase 8, Q21e) =================
  C.openStore = () => C.ui.open('Store', () => {
    const a = C.acct(), vip = C.isVip(), L = C.lo(), row = (act, v, icon, name, sub, price, owned) => `<button class="lrow ${owned ? 'lock' : ''}" data-act="${act}" data-v="${v}"><span class="li">${icon}</span><span class="lt"><b>${name}</b><small>${sub}</small></span><span class="lr">${owned ? '✔' : price}</span></button>`;
    return `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store. Purchases are simulated and no money is charged.</div>
      <div class="vipcard"><b>👑 Coach's Club</b><p>+1 slot in every queue (build, training, research, staff) · +1 career slot · <i class="coin"></i> 25 every day · rewarded ads without the ad</p>
        <button class="btn full ${vip ? 'sec2' : 'pri'}" data-act="buy" data-v="vip">${vip ? 'Active · ' + Math.ceil((a.vipUntil - C.now()) / 864e5) + ' days left (extend +30)' : 'Join · $4.99 / month'}</button></div>
      <h3 class="jh">Packs</h3>${row('buypack', 'starter', '🎒', 'Starter Pack', C.rwText(C.PACKS.starter.r) + ' · once only', '$1.99', L.cos.includes('starter'))}
      ${row('buypack', 'pass', '🎟', 'Season Pass premium', 'Premium rewards for this 30-day pass', '$9.99', C.pass().prem)}
      ${row('buypack', 'xp', '📗', 'Coach XP bundle', C.rwText(C.PACKS.xp.r), '$2.99')}${row('buypack', 'clinic', '🎫', 'Clinic Credit pack', C.rwText(C.PACKS.clinic.r), '$2.99')}
      <h3 class="jh">Coins</h3>${['g100', 'g550', 'g1200'].map(k => row('buypack', k, '<i class="coin"></i>', C.PACKS[k].name, 'Speed-ups, coaching searches, agency scouts', C.PACKS[k].price)).join('')}
      <h3 class="jh">Permanent slots</h3>${row('buy', 'slot3', '🔨', 'Extra build slot', 'A permanent 3rd build slot', '$2.99', a.slot3)}${row('buy', 'tslot3', '🏋️', 'Extra training slot', 'A permanent 3rd training-plan slot', '$2.99', a.tslot3)}
      ${row('buy', 'pslot3', '📋', 'Extra research slot', 'A permanent 3rd Playbook slot', '$2.99', a.pslot3)}${row('buy', 'sslot3', '🧑‍🏫', 'Extra staff slot', 'A permanent 3rd coach on duty', '$2.99', a.sslot3)}
      ${row('buy', 'tokens', '🎟', '3 Number Changes', 'Give players the number they want', '$0.99')}
      <h3 class="jh">Kits (cosmetic)</h3>${Object.keys(C.KITS).map(k => row('kit', k, C.KITS[k][0], C.KITS[k][1], C.kit() === k ? 'Wearing now' : L.cos.includes('kit_' + k) || k === 'classic' ? 'Owned: tap to wear' : 'Changes how your team looks, nothing else', C.KITS[k][2] || 'Free', false)).join('')}
      <div class="card fair"><b>⚖️ Fair play promise</b><p>Money buys time and convenience, never results. No paid match wins, no attribute points past a player's potential, no buying players directly. Free players can reach everything.</p></div>`;
  });

  // ================= splash + coming soon =================
  function splashHTML() {
    return `<div class="splash"><div class="splashart">${C.artSlot('title', C.sceneTitle('#1e3a8a', '#f97316', 390, 844))}</div><h1>CLUB FC</h1><p>Build your college soccer program from a rundown field to national champions.</p>
      <button class="btn pri" style="padding:16px 30px" data-act="newcar">Start a career</button>
      <button class="btn" style="margin-top:12px;background:rgba(255,255,255,.15);color:#fff" data-act="help" data-v="">📖 Coach's Handbook</button></div>`;
  }
  const SOON = {
    squad: ['👕', 'Squad', 'Your players, faces, numbers, training plans and the new player cards.', 'Phase 3'],
    staff: ['🧢', 'Staff', 'Hire and upgrade assistant coaches like heroes: levels, licences and superpowers.', 'Phase 6'],
    season: ['🏆', 'Season', 'Fixtures, the league table and the new match day.', 'Phase 5'],
  };
  function soonHTML(t) {
    const s = SOON[t];
    return `<div class="view scrolly"><div class="phdr"><b>${s[1]}</b><small>${C.esc(C.college().short)} · <i class="coin"></i> ${C.short(C.acct().gold)}</small></div>
      <div class="card soon"><div class="big">${s[0]}</div><b>Coming in ${s[3]}</b><p>${s[2]}</p></div></div>`;
  }
})(window.CFC);
