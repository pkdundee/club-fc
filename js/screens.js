// Club FC: screens (Phases 0–4). Campus, upgrade card, careers, settings, test store, coming-soon tabs.
(function (C) {
  C.tab = 'home';  // Home is the hub; 'season' is shown as Matchday (matches, calendar and the season)
  const W = () => C.campusSize[0], H = () => C.campusSize[1];
  let zoom = 1, view = null;

  C.power = () => { const b = C.car().b; let p = 0; for (const k in b) p += b[k] * (k === 'hq' ? 300 : k === 'stadium' ? 200 : 120); return p; };
  // Program Power (playtest round 4): campus + staff + the squad's best XI, one number that only grows as the program does
  C.squadPower = () => { const r = C.squad().map(p => p.rating).sort((a, b) => b - a).slice(0, 11); return Math.round(r.reduce((s, v) => s + v * v, 0) / 4); };
  // 1.06 (QA-92): Program Power counts everything the program owns: buildings, every hired coach, research, the whole squad,
  // gear (worn or not) and inventory items that build the program. Speed-ups, Coins and Booster $ don't count. Display only.
  C.powerParts = () => { const car = C.car(), S = C.staffState ? C.staffState() : { list: [], items: {} }, it = car.items || {}, inv = (C.meta && C.meta().inv) || {}, si = S.items || {};
    const coach = (S.list || []).reduce((s, c) => s + (C.coachPower ? C.coachPower(c) : 0), 0);
    const squad = Math.round(car.squad.reduce((s, p) => s + p.rating * p.rating, 0) / 14);   // provisional weight, so no one part dominates
    const gear = (C.gearList ? C.gearList() : []).reduce((s, g) => s + Math.round(40 * (1 + g.rar) * g.lv), 0);
    const items = (si.manual || 0) * 5 + (si.books || 0) * 15 + (inv.badge || 0) * 10 + (it.kit || 0) * 3 + (si.credits || 0) * 1;
    return [['campus', '🏗', 'Campus', C.power()], ['coach', '🧑‍🏫', 'Coaches', coach], ['research', '📋', 'Research', C.pbPower ? C.pbPower() : 0], ['squad', '👕', 'Squad', squad], ['gear', '🎽', 'Gear', gear], ['items', '🎒', 'Items', items]]; };
  C.programPower = () => C.powerParts().reduce((s, x) => s + x[3], 0);
  C.powerBadge = (cls = '') => `<span class="ppow ${cls}" data-act="proginfo" title="Program Power: campus, staff and squad"><i class="ppi"></i>${C.programPower().toLocaleString()}</span>`;
  // the one build-queue icon (item 38) and the buildings list (items 31, 44)
  C.idleBuilders = () => Math.max(0, C.openSlots() - C.car().queue.length);
  C.newBuildable = () => Object.keys(C.BUILDINGS).filter(k => C.level(k) === 0 && !C.inQueue(k) && !C.locked(k));
  C.readyCount = () => Object.keys(C.BUILDINGS).filter(k => C.readyArrow(k) || (C.newBuildable().includes(k) && C.requirements(k).every(r => r[2]))).length;

  // ================= main render =================
  C.render = () => {
    const app = C.$('#screen');
    if (C.booting) return;   // the title screen is showing
    if (!C.car()) { app.innerHTML = splashHTML(); return; }
    if (C.tab === 'home') { app.innerHTML = C.homeHTML(); app.insertAdjacentHTML('beforeend', tabsHTML()); return; }
    if (C.tab === 'campus') { app.innerHTML = campusHTML(); mountMap(); }
    else if (C.tab === 'squad') app.innerHTML = C.squadHTML();
    else if (C.tab === 'recruit') app.innerHTML = C.recruitHTML();
    else if (C.tab === 'season') app.innerHTML = C.seasonHTML();
    else if (C.tab === 'staff') app.innerHTML = C.staffHTML();
    else app.innerHTML = soonHTML(C.tab);
    app.insertAdjacentHTML('beforeend', tabsHTML());
  };

  function tabsHTML() {
    const t = [['home', '🏠', 'Home'], ['season', '🏟', 'Matchday'], ['campus', '🏫', 'Campus'], ['squad', '👕', 'Squad'], ['recruit', '✉️', 'Recruit']];
    const dot = k => k === 'home' && C.car() && ((C.car().staff && C.car().staff.mNew) || C.loClaimable() || !C.giftClaimed()) ? '<i class="tabdot"></i>' : '';
    return `<nav class="tabs">${t.map(([k, i, n]) => `<button class="tab ${C.tab === k ? 'on' : ''}" data-act="tab" data-v="${k}"><span class="ti">${i}${dot(k)}</span>${n}</button>`).join('')}</nav>`;
  }

  // ================= campus =================
  function campusHTML() {
    // 9q layout (FEEDBACK 75, 82, 87): college badge as the profile icon top left, compact resources, Store top right,
    // small side buttons, the next task in a strip above the tabs, and the builders drawer along the bottom.
    const car = C.car(), col = C.college(), a = C.acct();
    const busy = car.queue.length, open = C.openSlots(), rc = C.readyCount();
    const sq = (act, icon, label, badge, bg) => `<button class="sqb" data-act="${act}"><span class="sqc" style="background:${bg}">${C.ico(icon, 26)}</span>${label ? `<b>${label}</b>` : ''}${badge ? `<i class="rd">${badge === true ? '' : badge}</i>` : ''}</button>`;
    const rnd = (act, icon, badge) => `<button class="rnd" data-act="${act}">${C.ico(icon, 24)}${badge ? `<i class="rd">${badge === true ? '' : badge}</i>` : ''}</button>`;
    const st = C.stripTask(), claim = st && st.claim, task = st ? st.text : '';
    const newB = Object.keys(C.BUILDINGS).filter(C.buildable).length, readyB = car.queue.some(q => C.buildReady(q.key));
    return `<div class="view">
      <div class="map" id="map"><div id="mapin"></div></div>
      ${C.topBar(true, 'hud top')}
      <div class="side tl9">
        ${sq('queue', 'hammer', busy + '/' + open, readyB ? true : 0, 'linear-gradient(160deg,#94a3b8,#475569)')}
        ${sq('rqueue', 'book', C.pbRunning() + '/' + C.pbSlots(), (car.pbq || []).some(q => q.end <= C.now()) ? true : 0, 'linear-gradient(160deg,#94a3b8,#475569)')}
      </div>
      <div class="side tr9">
        ${sq('events', 'gift', 'Events', C.evOnlyClaimable(), 'linear-gradient(160deg,#fbbf24,#d97706)')}
        ${car.pre ? sq('preseason', 'list', 'Pre-season', C.preTasksLeft ? C.preTasksLeft() : 0, 'linear-gradient(160deg,#4ade80,#15803d)') : ''}
        ${C.fwActive() ? sq('firstweek', 'cal', 'Week 1', C.fwClaimable(), 'linear-gradient(160deg,#fb923c,#c2410c)') : ''}
        ${C.portalOpen() ? sq('portalgo', 'door', 'Portal', true, 'linear-gradient(160deg,#c084fc,#7e22ce)') : ''}
      </div>
      <div class="side bl9">
        ${rnd('drawer', 'hammer', newB)}
      </div>
      <div class="side br9">
        <div class="mailrow">${C.adWaiting && C.adWaiting() && !C.drawerOpen ? `<button class="adport" data-act="inboxdir" aria-label="Message from the athletic director">${C.adFace()}<i></i></button>` : ''}${sq('inbox', 'mail', 'Inbox', C.inboxUnread(), 'linear-gradient(160deg,#60a5fa,#1d4ed8)')}</div>
        ${sq('inventory', 'bag', 'Inventory', 0, 'linear-gradient(160deg,#60a5fa,#1d4ed8)')}
      </div>
      <div class="tstrip9"><button class="tsradio" data-act="nexttask" aria-label="Missions">${C.ico('clip', 34)}${C.msClaimable() ? `<i class="rd">${C.msClaimable()}</i>` : ''}</button>
        ${task ? `<button class="taskstrip ${claim ? 'claim' : ''}" data-act="taskgo"><span class="tst">${C.esc(task)}</span>${claim ? `<span class="tsr">${C.giftIco(17)}</span>` : '<span class="tsg">›</span>'}</button>` : ''}</div>
      ${C.drawerOpen ? drawerHTML() : ''}
    </div>`;
  }
  // 1.02 (FEEDBACK 153, 171): fit the game frame to the screen from measurements, never a fixed number.
  // In the home-screen app iOS can report a window shorter than the screen by exactly the status-bar inset while the page
  // still starts at the top, which left a blank band at the bottom. When that is measured, the frame fills to the screen's
  // bottom edge. In Safari the frame fits the visible area (toolbars included). Settings has a test switch.
  const insetTop = () => { const pr = document.createElement('div'); pr.style.cssText = 'position:fixed;top:env(safe-area-inset-top);left:0;width:1px;height:1px;visibility:hidden'; document.body.appendChild(pr); const v = parseFloat(getComputedStyle(pr).top) || 0; pr.remove(); return v; };
  C.fitInfo = { mode: 'auto', applied: 'standard', gap: 0, inset: 0 };
  // the rule on its own, from measurements only (tested across iPhone sizes and modes by the regression runner)
  // Phone test (20 Nov, FEEDBACK 177): in that case iOS draws nothing of the page below the window, so a taller frame is
  // simply cut off. Instead ("band"): the frame stays the window's height, the bottom bars drop their home-bar padding, and
  // the strip below the window (the screen's curved corners), which shows the page background, takes the colour of the
  // bar at the bottom of the screen, so the bar runs on into the curve. "full" (the old attempt) stays as a test option.
  C.fitCalc = m => { const portrait = m.ih >= m.iw, sh = portrait ? Math.max(m.sw, m.shh) : Math.min(m.sw, m.shh), gap = Math.round(sh - m.ih);
    const short = m.sa && gap > 0 && m.top > 0 && Math.abs(gap - m.top) <= 2;
    const fit = m.mode === 'full' ? 'full' : m.mode === 'auto' && short ? 'band' : 'standard'; return { fit, full: fit === 'full', sh, gap }; };
  C.fitScreen = () => { const app = document.getElementById('app'); if (!app) return;
    const mode = (C.db && C.db.account && C.db.account.screenFit) || 'auto', sa = matchMedia('(display-mode: standalone)').matches || !!navigator.standalone, top = insetTop();
    const { fit, sh, gap } = C.fitCalc({ mode, sa, top, iw: innerWidth, ih: innerHeight, sw: screen.width, shh: screen.height });
    app.style.height = fit === 'full' ? sh + 'px' : ''; app.style.bottom = fit === 'full' ? 'auto' : '';
    const H = document.documentElement; H.classList.toggle('fitfull', fit === 'full'); H.classList.toggle('fitband', fit === 'band'); H.classList.toggle('standalone', sa);
    C.fitInfo = { mode, applied: fit === 'full' ? 'full height (' + sh + ')' : fit === 'band' ? 'window + bar colour below (' + gap + ')' : 'standard', gap, inset: top }; C.syncBand(); };
  // the strip below the window matches whatever bar is at the bottom now (a page's Back bar, or the tab bar)
  // FEEDBACK 179 (test, on the user's request): the strip is a fixed dark grey on every screen, so where the game's area ends is
  // visible against both the white tab bar and the black Back bar. iOS paints the status-bar area with the same page background,
  // so the background is two halves: navy at the top (as before), dark grey at the bottom. C.BAND_MATCH = true restores the matching.
  C.BAND_MATCH = false;
  C.syncBand = () => { const H = document.documentElement; if (!H.classList.contains('fitband')) { H.style.backgroundColor = ''; H.style.background = ''; document.body.style.background = ''; return; }
    // 1.02.02 (FEEDBACK 181): iOS paints both strips with the root background COLOUR only (the gradient showed white), so one solid colour
    if (!C.BAND_MATCH) { H.style.background = ''; document.body.style.background = ''; H.style.backgroundColor = '#4b5563'; document.body.style.backgroundColor = '#4b5563'; return; }
    const app = document.getElementById('app'); if (!app) return; const r = app.getBoundingClientRect(), el = document.elementFromPoint(r.left + 4, r.bottom - 2);
    let n = el, c = ''; while (n && n !== document.body) { const b = getComputedStyle(n).backgroundColor; if (b && b !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(b)) { c = b; break; } n = n.parentElement; }
    H.style.backgroundColor = c; document.body.style.backgroundColor = c; };
  { let pend = 0; const app0 = document.getElementById('app'); if (app0 && window.MutationObserver) new MutationObserver(() => { if (pend || !document.documentElement.classList.contains('fitband')) return; pend = 1; requestAnimationFrame(() => { pend = 0; C.syncBand(); }); }).observe(app0, { childList: true, subtree: true }); }
  ['resize', 'orientationchange'].forEach(e => window.addEventListener(e, () => setTimeout(C.fitScreen, 60)));
  if (window.visualViewport) visualViewport.addEventListener('resize', () => setTimeout(C.fitScreen, 60));
  C.ACTS.screenfit = v => { C.acct().screenFit = v; C.save(); C.fitScreen(); C.ui.refresh(); };
  // screen measurements for checking phone layouts (FEEDBACK 100)
  C.diagText = () => { const pr = document.createElement('div'); pr.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom);top:env(safe-area-inset-top)'; document.body.appendChild(pr);
    const cs = getComputedStyle(pr), sab = cs.height, sat = cs.top; pr.remove(); const app = C.$('#app'), r = app ? app.getBoundingClientRect() : { top: 0, bottom: 0, height: 0 }, tb = C.$('.tabs'), t = tb ? tb.getBoundingClientRect() : null;
    const vv = window.visualViewport;
    return [`screen ${screen.width}×${screen.height} · dpr ${devicePixelRatio}`, `window ${innerWidth}×${innerHeight}`, `visible ${vv ? Math.round(vv.width) + '×' + Math.round(vv.height) + ' · zoom ' + vv.scale.toFixed(2) : 'n/a'}`,
      `home-bar space ${sab} · top inset ${sat}`, `app frame ${Math.round(r.top)}–${Math.round(r.bottom)} (h ${Math.round(r.height)})`, t ? `tab bar ${Math.round(t.top)}–${Math.round(t.bottom)}` : 'tab bar n/a',
      `home-screen app ${matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'yes' : 'no'}`, `screen fit ${C.fitInfo.mode} → ${C.fitInfo.applied} · short by ${C.fitInfo.gap} · status bar ${C.fitInfo.inset}`].join('\n'); };
  // ---------- the one top bar (FEEDBACK 75, 97): college badge as the profile box, resources where you can spend, Store ----------
  C.topBar = (spend, cls = 'tbstatic') => { const car = C.car(), col = C.college(), a = C.acct();
    return `<div class="${cls} tb9">
        <button class="pf" data-act="profile" aria-label="Profile">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 44)}<span class="pflv">${car.b.hq || 0}</span></button>
        <div class="tbm">${spend ? `<div class="res">${C.resBar()}</div>` : `<b class="tbname">${C.esc(col.short)} ${C.esc(col.mascot)}</b>`}<div class="tbpow" data-act="proginfo"><i class="ppi"></i>${C.programPower().toLocaleString()}</div></div>
        <button class="storeb" data-act="store">${C.ico('cart', 22)}<span><i class="coin"></i><b id="r-gold2">${C.full(a.gold)}</b></span></button>
      </div>`; };
  // ---------- builders drawer (FEEDBACK 87): every building as a card, by type, in a scrolling strip along the bottom ----------
  C.drawerTab = 'economy';
  // 9t (FEEDBACK 103): every building stays in the drawer. Ready to build first, then still locked (ghosted), then built
  // (ghosted, "Building is active"). The tab bar sits under the cards, which overlap it by half their height.
  function drawerHTML() {
    const car = C.car(), keys = Object.keys(C.BUILDINGS).filter(k => C.BTYPE[k] === C.drawerTab);
    const built = k => C.level(k) > 0 || !!C.inQueue(k), order = k => C.buildable(k) ? 0 : built(k) ? 2 : 1;
    const card = k => { const d = C.BUILDINGS[k], lock = C.locked(k), act = built(k), ready = C.buildable(k);
      const foot = ready ? 'Build · Free' : act ? 'Building is active' : lock ? `Unlocks at Coaches' Office Lv ${d.needHQ}` : "Needs the Coaches' Office first";
      return `<button class="dcard ${ready ? 'new' : 'ghost'}" data-act="${ready ? 'dbuild' : 'dgo'}" data-v="${k}">${ready ? '<s>NEW</s>' : ''}
        <div class="dpic">${C.buildingThumb(k, Math.max(1, C.level(k)), car, 120, 80)}</div><b>${C.esc(d.name)}</b><small>${C.esc(C.BJOB[k] || '')}</small><em>${foot}</em></button>`; };
    // 1.02 (FEEDBACK 148): real tabs, no ✕ (a tap anywhere outside closes it), no scrollbar, mouse drag to scroll
    const nNew = t => Object.keys(C.BUILDINGS).filter(k => C.BTYPE[k] === t && C.buildable(k)).length;
    const tb = (k, n) => `<button class="dtab ${C.drawerTab === k ? 'on' : ''}" data-act="drawertab" data-v="${k}">${n}${nNew(k) ? `<i class="rd">${nNew(k)}</i>` : ''}</button>`;
    return `<div class="drawer d9 d102"><div class="dstrip">${keys.sort((a, b) => order(a) - order(b) || C.level(a) - C.level(b)).map(card).join('')}</div>
      <div class="dband"><div class="dtabs2"><button class="dlist" data-act="blist" aria-label="All your buildings">${C.ico('list', 18)}</button><span class="dsp"></span>${tb('economy', 'Economy')}${tb('soccer', 'Soccer')}<button class="dtab" disabled title="Coming later">Decoration</button></div></div></div>`;   // 1.02.05 (QA-16): list left, tabs right
  }
  // 1.02 (FEEDBACK 158.1): open on the tab holding the new building(s); Economy when there are none, or new ones on both tabs
  C.ACTS.drawer = () => { C.drawerOpen = !C.drawerOpen; C.selB = null;
    if (C.drawerOpen) { const tabs = new Set(Object.keys(C.BUILDINGS).filter(C.buildable).map(k => C.BTYPE[k])); C.drawerTab = tabs.size === 1 ? [...tabs][0] : 'economy'; }
    C.render(); };
  // 1.02 (FEEDBACK 158.2): "Build · Free" closes the drawer, pans to the plot and starts the same free Lv 1 build as the popup's button
  C.ACTS.dbuild = v => { C.goToBuilding(v); C.act('upgrade', v); };
  // mouse drag-to-scroll for the card strip (touch keeps its own swipe); a drag never counts as a tap on a card
  (() => { let d = null;
    document.addEventListener('pointerdown', e => { const s = e.pointerType === 'mouse' && e.target.closest('.dstrip'); d = s ? { s, x: e.clientX, l: s.scrollLeft, moved: false } : null; });
    document.addEventListener('pointermove', e => { if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 6) d.moved = true; if (d.moved) d.s.scrollLeft = d.l - dx; });
    document.addEventListener('pointerup', () => { if (d && d.moved) { const s = d.s; s.dataset.dragged = '1'; setTimeout(() => delete s.dataset.dragged, 0); } d = null; });
    document.addEventListener('click', e => { const s = e.target.closest && e.target.closest('.dstrip'); if (s && s.dataset.dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
    // 1.02.05 (QA-15): the browser's own image drag took over the mouse (the pictures moved, the strip didn't); stop it in the drawer
    document.addEventListener('dragstart', e => { if (e.target.closest && e.target.closest('.dstrip')) e.preventDefault(); }); })();
  C.ACTS.drawertab = v => { C.drawerTab = v; C.render(); };
  C.ACTS.profile = () => C.openProfile();
  // ---------- profile popup (FEEDBACK 75): coach, college, key stats, and the account buttons ----------
  C.openProfile = () => C.ui.open('Profile', () => { const car = C.car(), col = C.college();
    const b = (act, icon, n) => `<button class="pfb" data-act="${act}"><span>${icon}</span>${n}</button>`;
    return `<div class="pfhead">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 64)}<div><b>${C.esc(col.full)} ${C.esc(col.mascot)}</b><small>${car.gender === 'w' ? "Women's" : "Men's"} soccer · ${C.esc(C.tierLabel())} · Coach</small></div></div>
      <div class="pfstats"><div><small>Program Power</small><b>${C.programPower().toLocaleString()}</b></div><div><small>Coaches' Office</small><b>Lv ${car.b.hq || 0}</b></div><div><small>Reputation</small><b>${C.rep()}</b></div><div><small>Tier</small><b>${C.esc(C.tierLabel())}</b></div></div>
      <div class="pfbtns">${b('proginfo', '📊', 'Program')}${b('careers', '👤', 'Account')}${b('settings', '⚙️', 'Settings')}${b('collegemap', '🗺', 'Rankings')}${b('ask', '❓', 'Help')}</div>`; });

  // the next match, front and center (Q13: play whenever you like; energy is the natural limit)
  C.gamedayHTML = gamedayHTML;
  function gamedayHTML() {
    const S = C.sea(), f = C.myFixture();
    if (!f) return `<div class="gameday"><span class="gdc">🏆</span><div class="vs"><div><small>SEASON ${S.n} · ${S.end ? 'FINISHED ' + C.ord(S.end.pos).toUpperCase() : 'WAITING'}</small>${S.end && S.end.champ ? 'Conference champions!' : 'Season review'}</div></div><button class="go" data-act="tab" data-v="season">Review</button></div>`;
    const opp = S.teams[f.h === 0 ? f.a : f.h], xi = C.tac().xi.map(C.P).filter(Boolean), e = Math.round(xi.reduce((s, p) => s + p.energy, 0) / (xi.length || 1));
    return `<div class="gameday">${C.crestSVG(opp.c1, opp.c2, opp.abbr.slice(0, 2), 34)}<div class="vs"><div><small>${C.fxLabel(f).up} · ${f.n ? 'NEUTRAL' : f.h === 0 ? 'HOME' : 'AWAY'} · 🔋 ${e}%</small>vs ${C.esc(opp.name)} ${C.oppRatingChip(opp.rating)}</div></div><button class="gotac" data-act="tactics" aria-label="Tactics"><i class="xoi"></i></button><button class="go" data-act="prematch">▶ Play</button></div>`;
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

  // The ground-and-buildings layer is kept and reused until something on the campus changes, so taps and screen changes
  // never rebuild it (no blinking, FEEDBACK 73). Only the markers layer is redrawn.
  let baseCache = null;
  function mountMap() {
    const m = C.$('#map'), inner = C.$('#mapin'), L = C.campusLayers(C.car());
    let sv = baseCache && baseCache.key === L.key ? baseCache.svg : null;
    if (!sv) { inner.innerHTML = L.svg; sv = inner.querySelector('svg'); baseCache = { key: L.key, svg: sv }; }
    else if (sv.parentNode !== inner) { inner.innerHTML = ''; inner.appendChild(sv); }
    sv.querySelector('#camOver').innerHTML = L.over();
    applyZoom(zoom);
    if (!view) view = { sl: Math.max(0, (W() * zoom - m.clientWidth) / 2), st: 40 };
    if (m.dataset.wired) return; m.dataset.wired = '1';
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
    m.classList.toggle('zoomed', zoom > 1.15); C.applyFixed();
  }
  // groups that keep their screen size at any zoom (building action buttons)
  C.applyFixed = () => C.$$('#map .fixz').forEach(g => g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${(1 / zoom).toFixed(3)})`));
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
    set('#r-cash', '$' + C.full(car.cash)); set('#r-cp', C.full(car.cp)); set('#r-gold', C.full(C.acct().gold)); set('#r-gold2', C.full(C.acct().gold));
  };

  // ================= building actions when selected on the map (Last War style) =================
  // only shortcuts that aren't already a tap away elsewhere (tabs, campus buttons, collect bubbles)
  // every action button opens a popup: it never leaves the map (round 6)
  const SHORTCUTS = { hq: [['📊', 'Program', 'bpop', 'proginfo'], ['🧢', 'Staff', 'bpop', 'hqstaff']], lab: [['📋', 'Playbook', 'bpop', 'playbook']], med: [['🩺', 'Medical Room', 'bpop', 'medical']], kitroom: [['🎒', 'Kit Room', 'bpop', 'kitroom']], academic: [['📚', 'Academics', 'bpop', 'academic']] };
  C.buildingActions = k => {
    const lvl = C.level(k), q = C.inQueue(k), ready = C.readyArrow(k), out = [];
    if (lvl) (SHORTCUTS[k] || []).forEach(([icon, label, act, v]) => out.push({ icon, label, act, v }));
    // the upgrade button is always last (right-most) and stays active until the building's maximum level; only then is it an orange "i"
    out.push(q ? { icon: '⏩', label: 'Speed up', act: 'bldopen', v: k, main: true }
      : lvl >= C.topLevel(k) ? { icon: 'i', label: 'Details', act: 'bldopen', v: k, main: true, col: '#f97316' }
      : { icon: 'up', label: lvl ? 'Upgrade' : 'Build', act: 'bldopen', v: k, main: true });
    return out;
  };
  // ---------- Building Queue (item 38): every builder, what they're doing, and how to get more ----------
  // ---------- queues (FEEDBACK 93): every slot with its state; an idle slot takes you to the recommended next step ----------
  C.recommendBuilding = () => { const ks = Object.keys(C.BUILDINGS);
    return ks.find(C.buildable) || (C.readyArrow('hq') ? 'hq' : ks.filter(C.readyArrow).sort((a, b) => C.level(a) - C.level(b))[0]) || 'hq'; };
  const slotRow = (i, state, title, sub, btn) => `<div class="bqrow ${state}"><div class="bq-f">${state === 'lock' ? '🔒' : state === 'busy' ? '👷' : '😴'}<i>${i + 1}</i></div><div class="bq-t"><b>${title}</b>${sub}</div>${btn || ''}</div>`;
  C.openQueue = () => C.ui.open('Building Queue', () => {
    const car = C.car(), openS = C.SLOTS.filter(x => C.slotOpen(x.id)), rec = C.recommendBuilding();
    const rows = C.SLOTS.map((sl, i) => {
      if (!C.slotOpen(sl.id)) return slotRow(i, 'lock', C.esc(sl.name), `<small>${C.esc(sl.why)}: a permanent builder${C.nextBuilderPack && C.nextBuilderPack() !== sl.pack ? ' (after the packs before it)' : ''}</small>`, '<button class="btn sm2" data-act="storeat" data-v="items">Get</button>');
      const q = C.laneItem(car.queue, openS.indexOf(sl));
      if (q) { const d = C.BUILDINGS[q.key], f = C.buildReady(q.key) ? 1 : 1 - C.remaining(q) / ((q.end - q.start) / 1000);
        return slotRow(i, 'busy', `${C.esc(d.name)} → Lv ${q.to}`, `<div class="bq-bar"><i style="width:${Math.round(f * 100)}%"></i></div><small ${C.buildReady(q.key) ? '' : `data-timer="${q.key}"`}>${C.buildReady(q.key) ? 'Finished' : C.dur(C.remaining(q))}</small>`,
          C.buildReady(q.key) ? `<button class="btn sm2 pri" data-act="bdone" data-v="${q.key}">Complete</button>` : `<button class="btn sm2" data-act="bgo" data-v="${q.key}">Go</button>`); }
      return slotRow(i, 'idle', 'Idle', `<small>Next: ${C.esc(C.BUILDINGS[rec].name)}</small>`, `<button class="btn sm2 pri" data-act="bgo" data-v="${rec}">Go</button>`);
    }).join('');
    // 1.03: a build started in a withdrawn slot (Coaches' Office Lv 10 or Coach's Club) carries on until it finishes
    const extra = C.laneExtra(car.queue, openS.length).map((q, j) => slotRow(C.SLOTS.length + j, 'busy', `${C.esc(C.BUILDINGS[q.key].name)} → Lv ${q.to}`, `<small>${C.buildReady(q.key) ? 'Finished' : C.dur(C.remaining(q)) + ' · finishing in a retired slot'}</small>`,
      C.buildReady(q.key) ? `<button class="btn sm2 pri" data-act="bdone" data-v="${q.key}">Complete</button>` : `<button class="btn sm2" data-act="bgo" data-v="${q.key}">Go</button>`)).join('');
    return `<p class="note" style="margin-top:0">Each builder works on one building at a time. Tap Go on an idle builder for the recommended next upgrade.</p>${rows}${extra}`;
  });
  C.openResearchQueue = () => C.ui.open('Research Queue', () => {
    const car = C.car(), openS = C.PBSLOTS.filter(x => C.pbSlotOpen(x.id)), q = car.pbq || [];
    const rows = C.PBSLOTS.map((sl, i) => {
      if (!C.pbSlotOpen(sl.id)) return slotRow(i, 'lock', C.esc(sl.name), '<small>Available at Performance Lab Lv 10, or with the Playbook\'s Extra Queue Slot</small>', '');
      const r = C.laneItem(q, openS.indexOf(sl));
      if (r) { const nm = C.pbName ? C.pbName(r.key) : r.key; return slotRow(i, 'busy', `${C.esc(nm)} → Lv ${r.to}`, `<small>${C.dur(Math.max(0, (r.end - C.now()) / 1000))}</small>`, '<button class="btn sm2" data-act="playbook">Go</button>'); }
      return slotRow(i, 'idle', 'Idle', '<small>Start the recommended research</small>', '<button class="btn sm2 pri" data-act="playbook">Go</button>');
    }).join('');
    const extra = C.laneExtra(q, openS.length).map((r, j) => slotRow(C.PBSLOTS.length + j, 'busy', `${C.esc(C.pbName ? C.pbName(r.key) : r.key)} → Lv ${r.to}`, `<small>${C.dur(Math.max(0, (r.end - C.now()) / 1000))} · finishing in a retired slot</small>`, '<button class="btn sm2" data-act="playbook">Go</button>')).join('');
    return `<p class="note" style="margin-top:0">Research runs in the Performance Lab. Each slot researches one Playbook item at a time.</p>${rows}${extra}`;
  }, { popup: true });
  // take the player to a building on the campus map: pan to it and select it, ready to upgrade (FEEDBACK 93, 94)
  C.goToBuilding = k => { C.ui.closeAll(); C.drawerOpen = false; C.tab = 'campus'; C.selB = k; C.render();
    const m = C.$('#map'), pt = C.plotPoint(k); if (m && pt) { m.scrollLeft = pt[0] * zoom - m.clientWidth / 2; m.scrollTop = pt[1] * zoom - m.clientHeight / 2; view = { sl: m.scrollLeft, st: m.scrollTop }; } };
  C.ACTS.bgo = v => C.goToBuilding(v);
  C.ACTS.dgo = v => { C.goToBuilding(v); C.openBuilding(v); };   // 1.01 (FEEDBACK 132a): drawer card -> its plot, popup in front
  C.ACTS.rqueue = () => C.openResearchQueue();
  // the task strip (FEEDBACK 94): claims on the spot when done; otherwise takes you straight to the task
  // what the strip shows (FEEDBACK 94, 101): a finished Mission to claim; otherwise the next Mission if you can act on it now;
  // otherwise the most useful thing to do now. Long-term goals (a whole season, several wins) stay on the Missions screen.
  // the strip (9t, FEEDBACK 103): rewards to claim first (one at a time), then buildings and research. Recruiting, matches and
  // long-term goals stay on the Missions screen.
  C.stripTask = () => { const car = C.car(), ks = Object.keys(C.BUILDINGS);
    // 1.02.06 (FEEDBACK 200): ONE pinned task at a time. The next Main task, in order, stays on the bar until it is done (grey),
    // then turns green until it is collected (here, or on the Missions page); then the next one, including any already done.
    // With every Main task collected: today's Daily tasks the same way; then the campus suggestions below.
    const mt = C.MAIN.find(t => !C.mainDone(t[0]));
    if (mt) return mt[3](car) ? { claim: 1, text: `Claim: ${mt[2]}`, t: mt } : { text: mt[2], t: mt };
    const L = C.daily(), di = L.findIndex(t => !t.claimed);
    if (di >= 0) { const d = L[di], name = d.id === 'login' ? 'Login reward' : d.def[2];
      return d.n >= d.goal ? { claim: 1, text: `Claim: ${name}`, daily: di } : { text: `${name} (${d.n}/${d.goal})`, go: () => C.act(d.def[4], d.def[5]) }; }
    const done = car.queue.find(q => C.buildReady(q.key)); if (done) return { text: `Complete the ${C.BUILDINGS[done.key].name}`, go: () => C.goToBuilding(done.key) };
    const pd = (car.pbq || []).find(q => q.end <= C.now()); if (pd) return { text: `Complete the research: ${C.pbName(pd.key)}`, go: () => C.act('pbready') };   // 1.01 (FEEDBACK 140)
    const nb = ks.find(C.buildable); if (nb) return { text: `Build the ${C.BUILDINGS[nb].name}`, go: () => C.goToBuilding(nb) };
    const r = C.recommendBuilding(), pr = C.pbRecommend && C.pbRecommend();
    if (r && C.readyArrow(r) && C.freeSlot()) return { text: `Upgrade the ${C.BUILDINGS[r].name} to Lv ${C.level(r) + 1}`, go: () => C.goToBuilding(r) };
    if (pr && C.pbAffordable(pr) && C.pbRunning() < C.pbSlots()) return { text: `Research ${C.pbName(pr)}`, go: () => C.act('pbrec') };
    if (car.queue.length < C.openSlots()) { const n = ks.filter(k => C.level(k) > 0 && C.level(k) < C.topLevel(k) && (k === 'hq' || C.level(k) < C.level('hq'))).sort((a, b) => (a === 'hq' ? -1 : 0) || C.level(a) - C.level(b))[0];
      if (n) return { text: `Upgrade the ${C.BUILDINGS[n].name} to Lv ${C.level(n) + 1}`, go: () => C.goToBuilding(n) }; }
    if (pr) return { text: `Research ${C.pbName(pr)}`, go: () => C.act('pbrec') };
    const q = car.queue[0]; return q ? { text: `${C.BUILDINGS[q.key].name} upgrading · ${C.dur(C.remaining(q))}`, go: () => C.goToBuilding(q.key) } : null; };
  C.ACTS.taskgo = () => { const st = C.stripTask(); if (!st) return;
    if (st.go) return st.go();
    if (st.claim) { const strip = C.$('.taskstrip'), from = strip ? strip.getBoundingClientRect() : null, r = st.daily != null ? C.dailyClaim(st.daily) : C.mainClaim(st.t[0]); if (r) { C.render(); C.flyRewards(r, from); } return; }
    if (st.go) return st.go();
    const [act, v] = [st.t[5], st.t[6]];
    if (act === 'bldopen') return C.goToBuilding(v);
    if (act === 'tab') { C.tab = v; C.ui.closeAll(); return C.render(); }
    C.act(act, v); };
  // reward icons burst from the strip and fly to their balances in the top bar
  C.flyRewards = (r, from) => { if (!from) return; const map = { cash: ['💵', '#r-cash'], cp: ['<i class="cpi"></i>', '#r-cp'], gold: ['<i class="coin"></i>', '#r-gold2'] };
    Object.keys(r).forEach((k, ki) => { const m = map[k] || ['🎁', '.pf']; const to = C.$(m[1]); if (!to) return; const tr = to.getBoundingClientRect();
      for (let i = 0; i < 6; i++) { const el = document.createElement('div'); el.className = 'flyr'; el.innerHTML = m[0];
        const x0 = from.left + from.width / 2 + (Math.random() - .5) * 80, y0 = from.top + from.height / 2 + (Math.random() - .5) * 20;
        el.style.left = x0 + 'px'; el.style.top = y0 + 'px'; (document.getElementById('app') || document.body).appendChild(el);
        setTimeout(() => { el.style.transform = `translate(${(Math.random() - .5) * 60}px,${-30 - Math.random() * 40}px) scale(1.3)`; }, 20 + ki * 80);
        setTimeout(() => { el.style.transition = 'transform .55s cubic-bezier(.5,0,.7,1), opacity .55s'; el.style.transform = `translate(${tr.left + tr.width / 2 - x0}px,${tr.top + tr.height / 2 - y0}px) scale(.6)`; el.style.opacity = '.4'; }, 300 + i * 40 + ki * 80);
        setTimeout(() => { el.remove(); to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump'); }, 900 + i * 40 + ki * 80); } }); };
  // ---------- List of buildings (items 31, 44): everything on campus, what's ready, new builds first ----------
  // ---------- full list of buildings (FEEDBACK 77, 87): full screen, Economy / Soccer, 4 columns, each with its status ----------
  C.blistTab = 'economy';
  C.blistSort = 'status';
  C.ACTS.blistsort = () => { C.blistSort = { status: 'level', level: 'name', name: 'status' }[C.blistSort]; C.ui.refresh(); };
  C.openBuildList = () => C.ui.open('Buildings', () => {
    const car = C.car(), tab = C.blistTab === 'program' ? 'economy' : C.blistTab, keys = Object.keys(C.BUILDINGS).filter(k => C.BTYPE[k] === tab && C.level(k) > 0);   // 9r: built buildings; new ones are in the build drawer
    const rank = k => C.buildable(k) ? 0 : C.readyArrow(k) ? 1 : C.inQueue(k) ? 2 : C.locked(k) ? 4 : 3;
    const card = k => { const d = C.BUILDINGS[k], lv = C.level(k), q = C.inQueue(k), lock = C.locked(k), max = !lock && lv && (lv >= C.topLevel(k) || (k !== 'hq' && lv >= C.level('hq')));
      const flag = C.buildable(k) ? '<s class="bnew">NEW</s>' : C.readyArrow(k) ? '<i class="bup"></i>' : '';
      const lab = lock ? `🔒 HQ ${d.needHQ}` : q ? '🔨 ' + C.dur(C.remaining(q)) : !lv ? 'Build' : max ? 'Max Level' : 'Lv.' + lv;
      return `<button class="bcard9 ${lock ? 'off' : ''}" data-act="bgo" data-v="${k}">${flag}<div class="bpic">${C.buildingThumb(k, Math.max(1, lv), car, 110, 76)}<b class="blv">${lab}</b></div><span>${C.esc(d.name)}</span></button>`; };
    const n = t => Object.keys(C.BUILDINGS).filter(k => C.BTYPE[k] === t && C.level(k) > 0 && C.readyArrow(k)).length;
    const tb = (k, nm) => `<button class="${tab === k ? 'on' : ''}" data-act="blisttab" data-v="${k}">${nm}${n(k) ? ` <em>${n(k)}</em>` : ''}</button>`;
    return `<div class="bigtabs">${tb('economy', 'Economy')}${tb('soccer', 'Soccer')}</div>
      <div class="bgrid9">${keys.sort((a, b) => C.blistSort === 'level' ? C.level(b) - C.level(a) : C.blistSort === 'name' ? C.BUILDINGS[a].name.localeCompare(C.BUILDINGS[b].name) : rank(a) - rank(b) || C.level(a) - C.level(b)).map(card).join('')}</div>
      <div class="bfoot bfoot9"><span>👷 Building Queue: ${car.queue.length}/${C.openSlots()}</span><button class="bsort" data-act="blistsort">⇅ ${{ status: 'Ready first', level: 'Highest level', name: 'A–Z' }[C.blistSort || 'status']}</button></div>`;
  });
  C.ACTS.powpart = k => { const car = C.car(), S = C.staffState(), go = { campus: ['tab', 'campus'], coach: ['tab', 'staff'], research: ['playbook', ''], squad: ['tab', 'squad'], gear: ['bpop', 'kitroom'], items: ['inventory', ''] }[k];
    const list = k === 'campus' ? Object.keys(C.BUILDINGS).filter(b => car.b[b] > 0).map(b => [C.BUILDINGS[b].icon + ' ' + C.BUILDINGS[b].name, 'Lv ' + car.b[b], car.b[b] * (b === 'hq' ? 300 : b === 'stadium' ? 200 : 120)])
      : k === 'coach' ? S.list.map(c => [C.esc(c.fn + ' ' + c.ln) + (S.on.includes(c.id) ? ' · on duty' : ''), 'Lv ' + c.level, C.coachPower(c)])
      : k === 'research' ? Object.entries(C.car().pb || {}).filter(([, v]) => v > 0).map(([key, v]) => [C.esc(C.pbName ? C.pbName(key) : key), 'Lv ' + v, v * 60])
      : k === 'squad' ? car.squad.slice().sort((a, b) => b.rating - a.rating).map(p => [C.esc(C.sn(p)) + ' · ' + p.pos, p.rating, Math.round(p.rating * p.rating / 14)])
      : k === 'gear' ? C.gearList().map(g => [g.slot + ' · ' + ['Common', 'Uncommon', 'Rare', 'Epic', 'Ultra Rare'][g.rar] + (g.on ? ' · worn' : ''), 'Lv ' + g.lv, Math.round(40 * (1 + g.rar) * g.lv)])
      : [['📗 Coaching manuals', S.items.manual || 0, (S.items.manual || 0) * 5], ['📕 Trait Books', S.items.books || 0, (S.items.books || 0) * 15], ['🏅 Coaching Badges', C.meta().inv.badge || 0, (C.meta().inv.badge || 0) * 10], ['🧴 Recovery kits', (car.items || {}).kit || 0, ((car.items || {}).kit || 0) * 3], ['🎫 Clinic Credits', S.items.credits || 0, S.items.credits || 0]];
    const part = C.powerParts().find(x => x[0] === k);
    C.ui.open(part[2] + ' Power', () => `<div class="card powhd"><small>${part[1]} ${part[2]}</small><b><i class="ppi"></i> ${part[3].toLocaleString()}</b></div><div class="card srows">${list.sort((a, b) => b[2] - a[2]).map(r => `<div class="srow"><span>${r[0]}</span><b>${r[1]} · <span class="mutey">${r[2].toLocaleString()}</span></b></div>`).join('') || '<p class="note">Nothing yet.</p>'}</div>
      ${k === 'items' ? '<p class="note">Speed-ups, Coins and Booster $ don\'t count: they\'re spent, not owned strength.</p>' : ''}<button class="btn full pri" data-act="${go[0]}" data-v="${go[1]}">Go</button>`, { popup: true }); };
  C.openProgramInfo = () => C.ui.open('Program', () => {
    const car = C.car(), col = C.college(), t = C.table().find(x => x.i === 0);
    const rows = [['🪜', 'Tier', C.tierLabel()], ['⭐', 'Reputation', C.rep() + ' / 100'], ['🧳', 'Program level', C.programLevel()], ['🧱', 'Building cap', 'Lv ' + C.maxLevel('training')],
      ['📋', 'Playbook levels', C.pbTotal()],
      ['🏆', 'Season ' + C.sea().n, C.sea().end ? 'Finished ' + C.ord(C.sea().end.pos) : t && t.p ? C.ord(C.myPos()) + ' · ' + t.w + 'W ' + t.d + 'D ' + t.l + 'L' : 'Not started'],
      ['🏛', 'Director confidence', ['😟', '🙁', '😐', '🙂', '😀'][Math.min(4, Math.floor((car.adConf ?? 50) / 20))]], ['👕', 'Roster', car.squad.length + ' / ' + C.rosterCap()], ['🎓', 'Scholarships left', '$' + C.short(C.poolLeft())]];
    return `<div class="collegecard">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 56)}<div><b style="font-family:Graduate,serif;font-size:18px">${C.esc(col.full)}</b><br><small class="mutey">${car.gender === 'w' ? "Women's" : "Men's"} program</small></div></div><button class="btn full sec2" data-act="yourcollege" style="margin-top:10px">📜 Your college and contract</button>
      ${(parts => { const tot = parts.reduce((s, x) => s + x[3], 0) || 1; return `<div class="card powhd"><small>Program Power</small><b><i class="ppi"></i> ${tot.toLocaleString()}</b></div>
      <div class="card powbr">${parts.map(([k, ic, nm, v]) => `<button class="powrow" data-act="powpart" data-v="${k}"><span>${ic} ${nm}</span><i class="powbar"><i style="width:${Math.round(v / tot * 100)}%"></i></i><b>${v.toLocaleString()}</b><em>›</em></button>`).join('')}</div>`; })(C.powerParts())}
      <div class="card srows" style="margin-top:12px">${rows.map(r => `<div class="srow"><span>${r[0]} ${r[1]}</span><b>${r[2]}</b></div>`).join('')}</div>`;
  });

  // ================= upgrade card (Last War layout, Q29) =================
  C.openBuilding = k => C.ui.open(C.BUILDINGS[k].name, () => upgradeCard(k), { modal: true });

  function statRows(k, lv) {
    const def = C.BUILDINGS[k], now = lv ? def.stats(lv) : null, next = lv < C.topLevel(k) ? def.stats(lv + 1) : null;
    const rows = (next || now).map((r, i) => {
      const icon = r[0] === 'seat' ? C.seatIcon(C.college().c1) : r[0];
      const a = now ? now[i][2] : '—', b = next ? next[i][2] : null;
      return `<div class="tr"><span class="k">${icon} ${r[1]}</span><span class="v">${b != null ? `${a} <span class="ar">▶</span> <em>${b}</em>` : `<em>${a}</em>`}</span></div>`;
    });
    if (lv < C.topLevel(k)) { const f = C.featureAt(k, lv + 1); if (f) rows.push(`<div class="tr new"><span class="k">✨ New at Lv ${lv + 1}</span><span class="v"><em>${f}</em></span></div>`); }
    return rows.join('');
  }

  // one cost / condition row: have/need in red when short, with Obtain (money) or Go (a building) beside it (round 4, items 23 and 26)
  function costRow(r) {
    const [icon, txt, ok, kind] = r, m = /^(.*?) \/ (.*)$/.exec(txt);
    const label = kind === 'cash' && m ? `<span class="${ok ? '' : 'short'}">${m[1]}</span>/${m[2]}` : C.esc(txt);
    const end = ok ? '<b class="ok">✔</b>' : kind === 'cash' ? '<button class="obtain" data-act="store">Obtain</button>'
      : kind && C.BUILDINGS[kind] ? `<button class="obtain" data-act="bldopen" data-v="${kind}">Go</button>` : '<b class="no">✖</b>';
    return `<div class="cr ${ok ? '' : 'bad'}"><span class="ic">${icon}</span><span class="ct">${label}</span>${end}</div>`;
  }
  const speedItems = k => C.speedRow ? C.speedRow('b', k) : '';
  // 1.03 (FEEDBACK 208): a producer can be collected from its card from 1 whole unit; the map bubble waits for 30 minutes' worth
  function collectRow(k) {
    if (!C.PRODUCERS[k] || !C.level(k)) return '';
    const cp = C.PRODUCERS[k] === 'cp', amt = C.stored(k), cap = C.storeCap(k), f = v => cp ? `<i class="cpi"></i> ${C.full(v)}` : C.money(v);
    return `<div class="collrow" style="display:flex;align-items:center;gap:8px;margin:6px 12px 0;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.08);font-size:13px">
      <span style="flex:1">${cp ? 'Coaching Points' : 'Booster $'} ready: <b>${f(amt)}</b> <small style="opacity:.75">of ${f(cap)}</small></span>
      <button class="btn pri" data-act="collect" data-v="${k}" style="padding:6px 12px" ${amt >= 1 ? '' : 'disabled'}>Collect</button></div>`;
  }
  function upgradeCard(k) {
    const car = C.car(), def = C.BUILDINGS[k], lv = car.b[k], q = C.inQueue(k);
    const head = (lvTxt) => `<div class="uc"><div class="top"><div class="pic">${C.buildingThumb(k, q ? q.to : Math.min(30, lv + (lv < 30 ? 1 : 0)), car, 170, 112)}</div>
      <div class="ttl"><b>${C.esc(def.name)}</b><div class="lv">${lvTxt}</div><div class="xp">${def.owner === 'program' ? '🧳 Your program' : '🏛 School building'}</div></div>
      <button class="xbtn" data-act="close" aria-label="Close">✕</button></div><div class="desc">${def.desc}</div>${C.instDone && C.instDone.k === k && C.now() - C.instDone.t < 4000 ? `<div class="instok">✔ ${C.esc(def.name)} Lv ${C.instDone.to}${C.instDone.cp ? ` · +${C.instDone.cp} 🧪` : ''}</div>` : ''}${k === 'hq' && C.staffSlots ? `<div class="desc" style="font-weight:900">🧢 Coach slots: ${C.staffSlots()} of ${C.STAFFSLOTS.length} open${C.level('hq') < 5 ? " · the earned slot opens at Coaches' Office Lv 5" : ''}</div>` : ''}${collectRow(k)}`;   // 1.06 (QA-94)

    if (q && C.buildReady(k)) return head(`Lv.${lv} <span class="ar">▶</span> ${q.to}`) + `<div class="tbl">${statRows(k, lv)}</div>
        <div class="orig"><span>✅ Finished: tap Complete</span><span></span></div><div class="bt"><button class="upg" data-act="bdone" data-v="${k}">Complete</button></div></div>`;
    if (q) {
      const rem = C.remaining(q), free = C.isFreeFinish(q), g = C.goldToFinish(q), gems = C.acct().gold;
      return head(`Lv.${lv} <span class="ar">▶</span> ${q.to}`) + `<div class="tbl">${statRows(k, lv)}</div>
        <div class="orig"><span>Under construction · <b data-timer="${k}">${C.dur(rem)}</b> left</span><span>${C.GEM} ${C.short(gems)}</span></div>
        <div class="bt"><button class="fin" data-act="speed" data-v="${k}" style="flex:1;width:100%;max-width:none">${C.speedButtonHTML('b', k)}</button></div></div>`;   // 1.03 (P8): one recommended button; the popup has every option
    }
    if (lv >= C.topLevel(k)) return head(`Lv.30 <span class="ar">★</span>`) + `<div class="tbl">${statRows(k, lv)}</div><div class="maxed">✨ Fully upgraded</div></div>`;

    const reqs = C.requirements(k), ok = reqs.every(r => r[2]), t = C.timeOf(k, lv + 1), gi = C.coinsFor(t), gems = C.acct().gold;
    const slotMsg = ok && !C.freeSlot() ? `<span style="color:#fde68a">All build slots are busy</span>` : '<span></span>';
    return head(lv ? `Lv.${lv} <span class="ar">▶</span> ${lv + 1}` : `Build <span class="ar">▶</span> Lv 1`) +
      `<div class="tbl"><div class="tscroll">${statRows(k, lv)}</div><div class="costh">Cost</div>
        <div class="tscroll">${reqs.map(r => costRow(r)).join('')}</div></div>
      <div class="orig">${slotMsg}<span>Original Time: ${C.dur(t)}</span></div>
      <div class="bt">${lv ? `<button class="fin" data-act="instant" data-v="${k}" ${ok ? '' : 'disabled'}>Finish Now<br><em class="${gems < gi ? 'short' : ''}">${C.GEM} ${gi}</em></button>` : ''}
      <button class="upg" data-act="upgrade" data-v="${k}" ${C.canUpgrade(k) || (lv && C.canUpgradeIgnoringSlot(k)) ? '' : 'disabled'}>${lv ? `Upgrade<br>⏱ ${C.dur(t)}` : 'Build<br>Free'}</button></div></div>`;
  }

  // Pay Coins to skip the build time entirely (resources still required)
  C.instantUpgrade = k => {
    const car = C.car(), lv = car.b[k], to = lv + 1, t = C.timeOf(k, to), g = C.coinsFor(t);
    if (!C.requirements(k).every(r => r[2])) return false;
    if (C.acct().gold < g) { C.toast('Not enough Coins'); return false; }
    const cost = C.costOf(k, to); car.cash -= cost.cash; car.cp -= cost.cp; C.acct().gold -= g; car.b[k] = to;
    const q = { key: k, to, cp: to <= 1 ? 0 : C.upgradeReward(k, to) }; car.cp += q.cp;
    // 1.06 (QA-97): Finish Now completes in place: the reward is added and the popup moves on to the next level. Only the Coaches' Office keeps its level-up sequence.
    if (k === 'hq') { (C.lvlQueue = C.lvlQueue || []).push(q); C.save(); setTimeout(C.nextLevelUp, 300); return true; }
    C.instDone = { k, to, cp: q.cp, t: C.now() }; C.save(); return true;
  };

  // ================= careers (save slots, Q27) =================
  C.openCareers = () => C.ui.open('Careers', careersHTML);
  function careersHTML() {
    const rows = C.db.careers.map((car, i) => { const col = C.COLLEGES[car.college];
      return `<button class="lrow" data-act="switchcar" data-v="${i}">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 46)}
        <span class="lt"><b>${C.esc(col.short)} ${C.esc(col.mascot)}</b><small>${car.gender === 'w' ? "Women's" : "Men's"} · ${C.TIERS[car.tier].n} · ⚡ ${(() => { let p = 0; for (const k in car.b) p += car.b[k] * (k === 'hq' ? 300 : k === 'stadium' ? 200 : 120); return p.toLocaleString(); })()}</small></span>
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
      <button class="btn full sec2" data-act="tscenopen" style="margin-top:8px">🧪 Test scenarios (ready-made saves)…</button>
      <label class="fld">Art check: show every building at render… (map only, nothing is changed)</label>
      <div class="rgrid">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button class="${(a.testRender || 0) === v ? 'on' : ''}" data-act="testrender" data-v="${v}">${v || 'Off'}</button>`).join('')}</div>
      <p class="note">Testing tools are for this preview build only.</p>
      <label class="fld">Screen fit (iPhone home-screen app)</label>
      <div class="seg3">${[['auto', 'Auto'], ['standard', 'Standard'], ['full', 'Full height']].map(([k, n]) => `<button class="${(a.screenFit || 'auto') === k ? 'on' : ''}" data-act="screenfit" data-v="${k}">${n}</button>`).join('')}</div>
      <label class="fld">Screen check (send a screenshot of this if anything looks off)</label><div class="diag" id="diag">${C.diagText()}</div>
      <p class="note">Version: ${C.BUILD}</p><button class="btn full sec2" data-act="checkupdate">🔄 Check for update</button>
      ${C.has9tSave() && !C.imported9t() ? '<button class="btn full sec2" data-act="imp9t">Import phase-9t save (testing)…</button>' : ''}
      ${C.car() ? '<button class="btn full danger" data-act="resetcar">Reset this career…</button>' : ''}
      <button class="btn full danger" data-act="wipe" style="margin-top:6px">Delete all data (every career, Coins and purchases)…</button>`;
  });

  // ================= test store (Phase 8, Q21e) =================
  C.openStore = () => C.ui.open('Store', () => {
    const a = C.acct(), vip = C.isVip(), L = C.lo(), row = (act, v, icon, name, sub, price, owned) => `<button class="lrow ${owned ? 'lock' : ''}" data-act="${act}" data-v="${v}"><span class="li">${icon}</span><span class="lt"><b>${name}</b><small>${sub}</small></span><span class="lr">${owned ? '✔' : price}</span></button>`;
    return `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store. Purchases are simulated and no money is charged.</div>
      <div class="vipcard"><b>👑 Coach's Club</b><p>+1 training slot · +1 staff slot · +1 career slot · 25 Coins a day</p>
        <button class="btn full ${vip ? 'sec2' : 'pri'}" data-act="buy" data-v="vip">${vip ? 'Active · ' + Math.ceil((a.vipUntil - C.now()) / 864e5) + ' days left (extend +30)' : 'Join · $4.99 / month'}</button></div>
      <h3 class="jh">Packs</h3>${row('buypack', 'starter', '🎒', 'Starter Pack', C.rwText(C.PACKS.starter.r) + ' · once only', '$1.99', L.cos.includes('starter'))}
      ${row('buypack', 'pass', '🎟', 'Season Pass premium', 'Premium rewards for this 30-day pass', '$9.99', C.pass().prem)}
      ${row('buypack', 'xp', '📗', 'Coach XP bundle', C.rwText(C.PACKS.xp.r), '$2.99')}${row('buypack', 'clinic', '🎫', 'Clinic Credit pack', C.rwText(C.PACKS.clinic.r), '$2.99')}
      <h3 class="jh">Coins</h3>${['g100', 'g550', 'g1200'].map(k => row('buypack', k, '<i class="coin"></i>', C.PACKS[k].name, 'Speed-ups, coaching searches, agency scouts', C.PACKS[k].price)).join('')}
      <h3 class="jh">Permanent slots</h3>${row('buy', 'tslot3', '🏋️', 'Extra training slot', 'A permanent 3rd training-plan slot', '$2.99', a.tslot3)}
      ${row('buy', 'sslot3', '🧑‍🏫', 'Extra staff slot', 'A permanent 3rd coach on duty', '$2.99', a.sslot3)}
      ${row('buy', 'tokens', '🎟', '3 Number Changes', 'Give players the number they want', '$0.99')}
      <h3 class="jh">Kits (cosmetic)</h3>${Object.keys(C.KITS).map(k => row('kit', k, C.KITS[k][0], C.KITS[k][1], C.kit() === k ? 'Wearing now' : L.cos.includes('kit_' + k) || k === 'classic' ? 'Owned: tap to wear' : 'Changes how your team looks, nothing else', C.KITS[k][2] || 'Free', false)).join('')}
      <div class="card fair"><b>⚖️ Fair play promise</b><p>Money buys time and convenience, never results. No paid match wins, no attribute points past a player's potential, no buying players directly. Free players can reach everything.</p></div>`;
  });

  // ================= splash + coming soon =================
  function splashHTML() {
    return `<div class="splash"><div class="splashart">${C.artSlot('title', C.sceneTitle('#1e3a8a', '#f97316', 390, 844))}</div><h1>CLUB FC</h1><p>Build your college soccer program from a rundown field to national champions.</p>
      <button class="btn pri" style="padding:16px 30px" data-act="newcar">Start a career</button>
      <button class="btn" style="margin-top:12px;background:rgba(255,255,255,.15);color:#fff" data-act="help" data-v="">📖 Coach's Handbook</button>${C.has9tSave() && !C.imported9t() ? `<button class="btn" style="margin-top:12px;background:rgba(255,255,255,.08);color:#fff;font-size:13px" data-act="imp9t">Import phase-9t save (testing)…</button>` : ''}</div>`;
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
