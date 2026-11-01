// Club FC: start-up, the one-second clock and all tap handling.
(function (C) {
  const LEVEL_NAMES = k => C.BUILDINGS[k].name;

  C.applyTheme = () => { const t = C.acct().theme; if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    const col = C.car() ? C.college() : null; const r = document.documentElement.style;
    if (col) { r.setProperty('--school', col.c1); r.setProperty('--school2', col.c2); } };

  function act(a, v, el) {
    const car = C.car();
    switch (a) {
      case 'tab': C.tab = v; C.ui.closeAll(); C.render(); break;
      case 'back': C.ui.back(); break;
      case 'close': C.ui.closeAll(); break;
      case 'bgclose': C.ui.back(); break;
      case 'toast': C.toast(v); break;
      case 'zoom': C.zoomBy(+v); break;
      // buildings
      case 'bld': if (C.mapDragged()) return; C.openBuilding(v); break;
      case 'land': if (C.mapDragged()) return; C.toast(`Campus expansion land. Opens when your program reaches Tier ${v}.`); break;
      case 'upgrade': if (C.startUpgrade(v)) { C.toast(`🔨 ${LEVEL_NAMES(v)} upgrade started`); C.ui.closeAll(); C.render(); } break;
      case 'instant': if (C.instantUpgrade(v)) { C.toast(`✨ ${LEVEL_NAMES(v)} is now Lv ${car.b[v]}`); C.ui.closeAll(); C.render(); } break;
      case 'speed': { const q = C.inQueue(v); if (!q) break; const free = C.isFreeFinish(q);
        if (C.finishNow(q, !free)) { C.toast(`✨ ${LEVEL_NAMES(v)} is now Lv ${car.b[v]}`); C.ui.closeAll(); C.render(); } else C.toast('Not enough Gold'); break; }
      case 'adspeed': { const q = C.inQueue(v); if (!q) break; C.toast('▶ Ad finished (test): −15 minutes'); C.adSpeedUp(q);
        if (!C.inQueue(v)) { C.ui.closeAll(); C.render(); } else C.ui.refresh(); break; }
      case 'collect': { const amt = C.collect(v); if (amt) C.toast(`${C.PRODUCERS[v] === 'cp' ? '📘' : '💵'} +${C.short(amt)} collected`); if (C.ui.isOpen()) C.ui.refresh(); C.redrawMap(); C.updateLive(); break; }
      case 'slotinfo': { const s = C.SLOTS.find(x => x.id === v); C.toast(`🔒 ${s.name}: ${s.why}`); if (v !== 'prog') C.openStore(); break; }
      // careers
      case 'careers': C.openCareers(); break;
      case 'newcar': C.openNewCareer(C.ui.isOpen()); break;
      case 'draftg': C.draft().gender = v; C.draft().coach = (C.$('#coachName') || {}).value || ''; C.ui.refresh(); break;
      case 'draftc': C.draft().college = +v; C.draft().coach = (C.$('#coachName') || {}).value || ''; C.ui.refresh(); break;
      case 'startcar': { const d = C.draft(); d.coach = ((C.$('#coachName') || {}).value || '').trim() || 'Rookie';
        C.newCareer({ coach: d.coach, gender: d.gender, college: d.college }); C.ui.closeAll(); C.tab = 'campus'; C.applyTheme(); C.render(); welcome(); break; }
      case 'switchcar': C.db.active = +v; C.save(); C.ui.closeAll(); C.tab = 'campus'; C.applyTheme(); C.render(); break;
      case 'delcar': C.ui.open('Delete a career', () => C.db.careers.map((c, i) => `<button class="lrow" data-act="delone" data-v="${i}"><span class="li">🗑</span><span class="lt"><b>${C.esc(c.coach)} · ${C.esc(C.COLLEGES[c.college].short)}</b><small>Tap to delete. This can't be undone.</small></span></button>`).join('')); break;
      case 'delone': C.deleteCareer(+v); C.ui.closeAll(); C.applyTheme(); C.render(); C.toast('Career deleted'); break;
      // settings + store
      case 'settings': C.openSettings(); break;
      case 'theme': C.acct().theme = v; C.save(); C.applyTheme(); C.ui.refresh(); break;
      case 'testcap': C.acct().testCap = +v; C.save(); C.ui.refresh(); C.redrawMap(); break;
      case 'cheat': if (v === 'gold') C.acct().gold += 500; if (v === 'cash') car.cash += 20000; if (v === 'cp') car.cp += 100;
        if (v === 'finish') car.queue.forEach(q => q.end = C.now());
        C.save(); C.tick(); C.render(); C.ui.refresh(); C.toast('Done'); break;
      case 'wipe': C.ui.open('Delete all data', () => `<p class="note" style="font-size:14px">This deletes every career and resets Gold and purchases on this device.</p><button class="btn full danger" data-act="wipeyes">Yes, delete everything</button>`); break;
      case 'wipeyes': try { localStorage.removeItem('clubfc2'); } catch (e) { } location.reload(); break;
      case 'store': C.openStore(); break;
      case 'buy': { const a2 = C.acct();
        if (v === 'vip') a2.vipUntil = Math.max(a2.vipUntil, C.now()) + 30 * 864e5;
        if (v === 'slot3') { if (a2.slot3) break; a2.slot3 = true; }
        if (v === 'gold') a2.gold += 500;
        C.save(); C.toast('✅ Test purchase complete'); C.ui.refresh(); if (C.tab === 'campus') C.render(); break; }
    }
  }

  function welcome() {
    const col = C.college();
    C.ui.open('Welcome', () => `<div class="collegecard">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 64)}<div><b style="font-family:Graduate,serif;font-size:20px">${C.esc(col.full)}</b><br><small style="color:var(--mute);font-weight:800">${C.esc(col.mascot)} · ${col.state} · Tier 5</small></div></div>
      <div class="card" style="margin-top:14px;font-size:14px;line-height:1.5;font-weight:700">Coach ${C.esc(C.car().coach)}, the campus is yours.<br>🔨 Tap a building to upgrade it, or an empty plot to build.<br>💵 Tap the bubbles to collect Booster $ and 📘 Coaching Points.<br>🏛 The Coaches' Office level caps everything else.</div>
      <button class="btn full pri" data-act="close">Let's build</button>`);
  }

  // one tap handler for everything
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.dataset.act === 'bgclose' && e.target !== el) return;
    act(el.dataset.act, el.dataset.v, el);
  });

  // one-second clock: finish builds, update timers, refresh live pop-ups
  let n = 0;
  setInterval(() => {
    if (!C.car()) return;
    const done = C.tick();
    if (done.length) { done.forEach(q => C.toast(`✨ ${LEVEL_NAMES(q.key)} reached Lv ${q.to}`)); C.render(); if (C.ui.isOpen()) C.ui.refresh(); return; }
    C.updateLive();
    if (C.ui.isOpen() && C.$('.uc [data-timer]')) C.ui.refresh();
    if (++n % 20 === 0 && !C.ui.isOpen()) C.redrawMap(); // let new collect bubbles appear
  }, 1000);

  // start
  C.load(); C.tickRealDay(); C.applyTheme(); C.render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})(window.CFC);
