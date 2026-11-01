// Club FC: screens (Phase 0 + 1). Campus, upgrade card, careers, settings, test store, coming-soon tabs.
(function (C) {
  C.tab = 'campus';
  const W = () => C.campusSize[0], H = () => C.campusSize[1];
  let zoom = 1, view = null;

  C.power = () => { const b = C.car().b; let p = 0; for (const k in b) p += b[k] * (k === 'hq' ? 300 : k === 'stadium' ? 200 : 120); return p; };

  // ================= main render =================
  C.render = () => {
    const app = C.$('#screen');
    if (!C.car()) { app.innerHTML = splashHTML(); return; }
    if (C.tab === 'campus') { app.innerHTML = campusHTML(); mountMap(); }
    else app.innerHTML = soonHTML(C.tab);
    app.insertAdjacentHTML('beforeend', tabsHTML());
  };

  function tabsHTML() {
    const t = [['campus', '🏫', 'Campus'], ['squad', '👕', 'Squad'], ['staff', '🧢', 'Staff'], ['recruit', '✉️', 'Recruit'], ['season', '🏆', 'Season']];
    return `<nav class="tabs">${t.map(([k, i, n]) => `<button class="tab ${C.tab === k ? 'on' : ''}" data-act="tab" data-v="${k}"><span class="ti">${i}</span>${n}</button>`).join('')}</nav>`;
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
        <div class="idrow">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 38)}<div><b>${C.esc(col.short)}</b><small>${tier.n} · ${tier.name} · ${car.gender === 'w' ? "Women's" : "Men's"}</small></div>
          <span class="power">⚡ ${C.power().toLocaleString()}</span></div>
        <div class="res"><span><i>💵</i><b id="r-cash">${C.short(car.cash)}</b></span><span><i>📘</i><b id="r-cp">${C.short(car.cp)}</b></span><span data-act="store"><i style="background:#7c3aed">◆</i><b id="r-gold">${C.short(a.gold)}</b><em class="plus">+</em></span></div>
      </div>
      <div class="side sl">${slots}</div>
      <div class="side sr">
        <button class="ev" data-act="careers"><div class="c" style="background:linear-gradient(150deg,#0ea5e9,#0369a1)">🧑‍🏫</div>Careers</button>
        <button class="ev" data-act="store"><div class="c" style="background:linear-gradient(150deg,#ef4444,#b91c1c)">🛒</div>Store</button>
        <button class="ev" data-act="settings"><div class="c" style="background:linear-gradient(150deg,#64748b,#334155)">⚙️</div>Settings</button>
      </div>
      <div class="zbtns"><button data-act="zoom" data-v="1" aria-label="Zoom in">+</button><button data-act="zoom" data-v="-1" aria-label="Zoom out">−</button></div>
      <div class="gameday">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 34)}<div class="vs"><div><small>PRESEASON · GAME DAY ${car.gameDay} OF 28</small>Build your campus</div></div><button class="go" data-act="toast" data-v="Matches arrive in a later update. For now, build up your campus." >▶ Play</button></div>
    </div>`;
  }

  let dragged = false;
  function mountMap() {
    const m = C.$('#map'), inner = C.$('#mapin');
    inner.innerHTML = C.campusSVG(C.car());
    const sv = inner.querySelector('svg'); sv.setAttribute('width', W() * zoom); sv.setAttribute('height', H() * zoom);
    m.classList.toggle('zoomed', zoom > 1.15);
    if (!view) view = { sl: Math.max(0, (W() * zoom - m.clientWidth) / 2), st: 40 };
    m.scrollLeft = view.sl; m.scrollTop = view.st;
    m.addEventListener('scroll', () => { view.sl = m.scrollLeft; view.st = m.scrollTop; }, { passive: true });
    let d = null;
    m.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; d = [e.clientX, e.clientY, m.scrollLeft, m.scrollTop]; dragged = false; });
    m.addEventListener('pointermove', e => { if (!d) return; const dx = e.clientX - d[0], dy = e.clientY - d[1]; if (Math.abs(dx) + Math.abs(dy) > 6) dragged = true; m.scrollLeft = d[2] - dx; m.scrollTop = d[3] - dy; });
    window.addEventListener('pointerup', () => { d = null; setTimeout(() => dragged = false, 0); }, { once: true });
    m.addEventListener('wheel', e => { e.preventDefault(); setZoom(zoom - e.deltaY * .003); }, { passive: false });
  }
  C.mapDragged = () => dragged;
  C.redrawMap = () => { if (C.tab === 'campus' && C.$('#mapin')) mountMap(); };

  function setZoom(n) {
    const m = C.$('#map'); if (!m) return;
    const cx = (m.scrollLeft + m.clientWidth / 2) / (W() * zoom), cy = (m.scrollTop + m.clientHeight / 2) / (H() * zoom);
    zoom = C.clamp(n, .65, 2.2);
    const sv = m.querySelector('svg'); sv.setAttribute('width', W() * zoom); sv.setAttribute('height', H() * zoom);
    m.classList.toggle('zoomed', zoom > 1.15);
    m.scrollLeft = cx * W() * zoom - m.clientWidth / 2; m.scrollTop = cy * H() * zoom - m.clientHeight / 2;
  }
  C.zoomBy = dir => setZoom(zoom + (dir > 0 ? .4 : -.35));

  // Live bits that change every second without redrawing the map
  C.updateLive = () => {
    const car = C.car(); if (!car) return;
    for (const q of car.queue) {
      C.$$(`[data-timer="${q.key}"]`).forEach(e => e.textContent = C.dur(C.remaining(q)));
      const bar = C.$(`[data-bar="${q.key}"]`); if (bar) bar.setAttribute('width', (28 * C.clamp(1 - C.remaining(q) / ((q.end - q.start) / 1000), 0, 1)).toFixed(1));
    }
    const set = (id, v) => { const e = C.$(id); if (e) e.textContent = v; };
    set('#r-cash', C.short(car.cash)); set('#r-cp', C.short(car.cp)); set('#r-gold', C.short(C.acct().gold));
  };

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
    const head = (lvTxt) => `<div class="uc"><div class="top"><div class="pic">${C.buildingThumb(k, q ? q.to : Math.min(30, lv + (lv < 30 ? 1 : 0)), car)}</div>
      <div class="ttl"><b>${C.esc(def.name)}</b><div class="lv">${lvTxt}</div><div class="xp">${def.owner === 'program' ? '🧳 Your program' : '🏛 School building'}</div></div>
      <button class="xbtn" data-act="close" aria-label="Close">✕</button></div><div class="desc">${def.desc}</div>`;

    if (q) {
      const rem = C.remaining(q), free = C.isFreeFinish(q), g = C.goldToFinish(q);
      return head(`Lv.${lv} <span class="ar">▶</span> ${q.to}`) + `<div class="tbl">${statRows(k, lv)}</div>
        <div class="orig">Under construction · <b data-timer="${k}">${C.dur(rem)}</b> left</div>
        <div class="bt"><button class="fin" data-act="speed" data-v="${k}">${free ? 'Finish<br><em style="color:#15803d">Free</em>' : `Finish Now<br><em>◆ ${g}</em>`}</button>
        <button class="upg" data-act="adspeed" data-v="${k}" ${C.adsLeft() <= 0 ? 'disabled' : ''}>▶ Watch ad<br>−15 min (${C.adsLeft()} left)</button></div></div>`;
    }
    if (lv >= 30) return head(`Lv.30 <span class="ar">★</span>`) + `<div class="tbl">${statRows(k, lv)}</div><div class="maxed">✨ Fully upgraded</div></div>`;

    const reqs = C.requirements(k), ok = reqs.every(r => r[2]), t = C.timeOf(k, lv + 1), gi = Math.max(1, Math.ceil(t / 90));
    const prod = C.PRODUCERS[k] && lv ? `<div class="adrow"><button data-act="collect" data-v="${k}">Collect ${C.PRODUCERS[k] === 'cp' ? '📘' : '💵'} ${C.short(C.stored(k))}</button></div>` : '';
    const slotMsg = ok && !C.freeSlot() ? `<div class="orig" style="color:#fde68a">All build slots are busy</div>` : '';
    return head(lv ? `Lv.${lv} <span class="ar">▶</span> ${lv + 1}` : `Build <span class="ar">▶</span> Lv 1`) +
      `<div class="tbl">${statRows(k, lv)}<div class="costh">Cost</div>
        ${reqs.map(r => `<div class="cr ${r[2] ? '' : 'bad'}"><span class="ic">${r[0]}</span>${C.esc(r[1])}${r[2] ? '<span class="ok">✔</span>' : '<span class="no">✖</span>'}</div>`).join('')}</div>
      <div class="orig">Time: ${C.dur(t)}</div>${slotMsg}
      <div class="bt"><button class="fin" data-act="instant" data-v="${k}" ${ok ? '' : 'disabled'}>Finish Now<br><em>◆ ${gi}</em></button>
      <button class="upg" data-act="upgrade" data-v="${k}" ${C.canUpgrade(k) ? '' : 'disabled'}>${lv ? 'Upgrade' : 'Build'}<br>⏱ ${C.dur(t)}</button></div>${prod}</div>`;
  }

  // Pay Gold to skip the build time entirely (resources still required)
  C.instantUpgrade = k => {
    const car = C.car(), lv = car.b[k], to = lv + 1, t = C.timeOf(k, to), g = Math.max(1, Math.ceil(t / 90));
    if (!C.requirements(k).every(r => r[2])) return false;
    if (C.acct().gold < g) { C.toast('Not enough Gold'); return false; }
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
    return `${rows}${add}<p class="note">Each career is its own coach and college. Gold and purchases are shared. Switch any time; timers keep running.</p>
      ${C.db.careers.length > 1 ? `<button class="btn full danger" data-act="delcar">Delete a career…</button>` : ''}`;
  }

  // ================= new career (short version; the full job market is Phase 2) =================
  let draft = null;
  C.openNewCareer = (replace) => {
    const r = C.rng(Date.now() & 0xffff), ids = C.COLLEGES.map(c => c.id).sort(() => r() - .5).slice(0, 4);
    draft = { coach: '', gender: 'w', college: ids[0], options: ids };
    (replace ? C.ui.replace : C.ui.open)('New career', newCareerHTML);
  };
  function newCareerHTML() {
    return `<label class="fld" for="coachName">Your name</label><input class="inp" id="coachName" maxlength="20" placeholder="Coach name" value="${C.esc(draft.coach)}">
      <label class="fld">Program</label><div class="seg2"><button class="${draft.gender === 'w' ? 'on' : ''}" data-act="draftg" data-v="w">Women's soccer</button><button class="${draft.gender === 'm' ? 'on' : ''}" data-act="draftg" data-v="m">Men's soccer</button></div>
      <label class="fld">College (Tier 5 · small colleges)</label>
      ${draft.options.map(id => { const c = C.COLLEGES[id]; return `<button class="lrow ${draft.college === id ? '' : ''}" style="${draft.college === id ? 'outline:3px solid var(--school2)' : ''}" data-act="draftc" data-v="${id}">${C.crestSVG(c.c1, c.c2, c.abbr.slice(0, 2), 46)}<span class="lt"><b>${C.esc(c.full)}</b><small>${C.esc(c.mascot)} · ${c.state} · ${c.pub ? 'Public' : 'Private'}</small></span>${draft.college === id ? '<span class="lr">✔</span>' : ''}</button>`; }).join('')}
      <p class="note">The full job market (12 openings, squads and stories) arrives in the next update.</p>
      <button class="btn full pri" data-act="startcar">Sign the contract</button>`;
  }
  C.draft = () => draft;

  // ================= settings (with test tools) =================
  C.openSettings = () => C.ui.open('Settings', () => {
    const a = C.acct();
    return `<label class="fld">Theme</label><div class="seg3">${['auto', 'light', 'dark'].map(t => `<button class="${a.theme === t ? 'on' : ''}" data-act="theme" data-v="${t}">${{ auto: 'Auto', light: 'Light', dark: 'Dark' }[t]}</button>`).join('')}</div>
      <label class="fld">Testing tools</label>
      <div class="seg3"><button data-act="cheat" data-v="gold">+500 ◆</button><button data-act="cheat" data-v="cash">+$20K</button><button data-act="cheat" data-v="cp">+100 📘</button></div>
      <button class="btn full sec2" data-act="cheat" data-v="finish">Finish all builds now</button>
      <label class="fld">Building cap override (try higher levels)</label>
      <div class="seg3">${[0, 12, 18].map(v => `<button class="${a.testCap === v ? 'on' : ''}" data-act="testcap" data-v="${v}">${v ? 'Lv ' + v : 'Off'}</button>`).join('')}</div>
      <div class="seg2" style="margin-top:8px">${[24, 30].map(v => `<button class="${a.testCap === v ? 'on' : ''}" data-act="testcap" data-v="${v}">Lv ${v}</button>`).join('')}</div>
      <p class="note">Testing tools are for this preview build only.</p>
      <button class="btn full danger" data-act="wipe">Delete all saved data…</button>`;
  });

  // ================= test store =================
  C.openStore = () => C.ui.open('Store', () => {
    const a = C.acct(), vip = C.isVip();
    return `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store. Purchases are simulated and no money is charged.</div>
      <button class="lrow" data-act="buy" data-v="vip"><span class="li">👑</span><span class="lt"><b>Coach's Club</b><small>${vip ? 'Active · ' + Math.ceil((a.vipUntil - C.now()) / 864e5) + ' days left' : '2nd build slot, +1 career slot, skip-ad rewards · 30 days'}</small></span><span class="lr">${vip ? '✔' : '$4.99'}</span></button>
      <button class="lrow ${a.slot3 ? 'lock' : ''}" data-act="buy" data-v="slot3"><span class="li">🔨</span><span class="lt"><b>Extra build slot</b><small>A permanent 3rd build slot</small></span><span class="lr">${a.slot3 ? '✔' : '$2.99'}</span></button>
      <button class="lrow" data-act="buy" data-v="gold"><span class="li">◆</span><span class="lt"><b>500 Gold</b><small>For speed-ups</small></span><span class="lr">$4.99</span></button>
      <p class="note">Money never buys results. It speeds things up; free players can reach everything.</p>`;
  });

  // ================= splash + coming soon =================
  function splashHTML() {
    return `<div class="splash"><h1>CLUB FC</h1><p>Build your college soccer program from a rundown field to national champions.</p>
      <button class="btn pri" style="padding:16px 30px" data-act="newcar">Start a career</button></div>`;
  }
  const SOON = {
    squad: ['👕', 'Squad', 'Your players, faces, numbers, training plans and the new player cards.', 'Phase 3'],
    staff: ['🧢', 'Staff', 'Hire and upgrade assistant coaches like heroes: levels, licences and superpowers.', 'Phase 6'],
    recruit: ['✉️', 'Recruiting', 'Negotiate scholarships, campus jobs and role promises. Transfer portal windows.', 'Phase 4'],
    season: ['🏆', 'Season', 'Fixtures, the league table and the new match day.', 'Phase 5']
  };
  function soonHTML(t) {
    const s = SOON[t];
    return `<div class="view scrolly"><div class="phdr"><b>${s[1]}</b><small>${C.esc(C.college().short)} · ◆ ${C.short(C.acct().gold)}</small></div>
      <div class="card soon"><div class="big">${s[0]}</div><b>Coming in ${s[3]}</b><p>${s[2]}</p></div></div>`;
  }
})(window.CFC);
