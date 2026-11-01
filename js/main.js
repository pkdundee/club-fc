// Club FC: start-up, the one-second clock and all tap handling.
(function (C) {
  const LEVEL_NAMES = k => C.BUILDINGS[k].name;

  C.applyTheme = () => { const t = C.acct().theme; if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    const col = C.car() ? C.college() : null; const r = document.documentElement.style;
    if (col) { r.setProperty('--school', col.c1); r.setProperty('--school2', col.c2); } };

  let e2 = null;
  function act(a, v, el) {
    const car = C.car();
    switch (a) {
      case 'tab': C.tab = v; C.ui.closeAll(); C.render(); break;
      case 'back': C.ui.back(); break;
      case 'close': C.ui.closeAll(); if (C.car() && C.tab === 'campus') C.render(); break;
      case 'bgclose': C.ui.back(); break;
      case 'toast': C.toast(v); break;
      case 'zoom': C.zoomBy(+v); break;
      // buildings
      case 'bld': if (C.mapDragged()) return; C.openBuilding(v); break;
      case 'land': if (C.mapDragged()) return; C.toast(`Campus expansion land. Opens when your program reaches Tier ${v}.`); break;
      case 'upgrade': if (C.startUpgrade(v)) { C.fwEvent('upgrade'); C.toast(`🔨 ${LEVEL_NAMES(v)} upgrade started`); C.ui.closeAll(); C.render(); } break;
      case 'instant': if (C.instantUpgrade(v)) { C.fwEvent('upgrade'); C.fwEvent('speed'); C.toast(`✨ ${LEVEL_NAMES(v)} is now Lv ${car.b[v]}`); C.ui.closeAll(); C.render(); } break;
      case 'speed': { const q = C.inQueue(v); if (!q) break; const free = C.isFreeFinish(q);
        if (C.finishNow(q, !free)) { C.fwEvent('speed'); C.toast(`✨ ${LEVEL_NAMES(v)} is now Lv ${car.b[v]}`); C.ui.closeAll(); C.render(); } else C.toast('Not enough Gold'); break; }
      case 'adspeed': { const q = C.inQueue(v); if (!q) break; C.toast('▶ Ad finished (test): −15 minutes'); C.adSpeedUp(q); C.fwEvent('speed');
        if (!C.inQueue(v)) { C.ui.closeAll(); C.render(); } else C.ui.refresh(); break; }
      case 'collect': { const amt = C.collect(v); if (amt) C.fwEvent(C.PRODUCERS[v] === 'cp' ? 'collect_cp' : 'collect_cash'); if (amt) C.toast(`${C.PRODUCERS[v] === 'cp' ? '📘' : '💵'} +${C.short(amt)} collected`); if (C.ui.isOpen()) C.ui.refresh(); C.redrawMap(); C.updateLive(); break; }
      case 'slotinfo': { const s = C.SLOTS.find(x => x.id === v); C.toast(`🔒 ${s.name}: ${s.why}`); if (v !== 'prog') C.openStore(); break; }
      // careers
      case 'careers': C.openCareers(); break;
      case 'newcar': if (!C.car() && !C.introSeen()) C.openIntro(() => C.openMarket(true)); else C.openMarket(C.ui.isOpen()); break;
      case 'intronext': C.introNext(); break;
      case 'introskip': C.introDone(); break;
      case 'replayintro': C.openIntro(); break;
      case 'help': C.openHandbook(v); break;
      case 'ask': C.openAsk(); break;
      case 'ad': C.openAD(); C.render(); break;
      case 'firstweek': C.openFirstWeek(); break;
      case 'fwclaim': { const r = C.fwClaim(+v); if (r) { C.toast('🎁 ' + r); C.ui.refresh(); C.render(); } break; }
      case 'job': if (e2.target.closest('[data-act=shortlist]')) return; C.openJob(+v); break;
      case 'shortlist': C.toggleShort(+v); break;
      case 'jpage': C.jobPage(+v); break;
      case 'jshort': C.market().onlyShort = v === '1'; C.ui.refresh(); break;
      case 'signjob': C.openIdentity(); break;
      case 'pron': C.market().coach = (C.$('#coachName') || {}).value || ''; C.market().pron = v; C.ui.refresh(); break;
      case 'startjob': { const M = C.market(); const coach = ((C.$('#coachName') || {}).value || '').trim() || 'Rookie';
        C.newCareer({ coach, pron: M.pron, job: M.jobs[M.pick] }); C.ui.closeAll(); C.tab = 'campus'; C.applyTheme(); C.render(); welcome(); break; }
      case 'switchcar': C.db.active = +v; C.save(); C.ui.closeAll(); C.tab = 'campus'; C.applyTheme(); C.render(); break;
      case 'delcar': C.ui.open('Delete a career', () => C.db.careers.map((c, i) => `<button class="lrow" data-act="delone" data-v="${i}"><span class="li">🗑</span><span class="lt"><b>${C.esc(c.coach)} · ${C.esc(C.COLLEGES[c.college].short)}</b><small>Tap to delete. This can't be undone.</small></span></button>`).join('')); break;
      case 'delone': C.deleteCareer(+v); C.ui.closeAll(); C.applyTheme(); C.render(); C.toast('Career deleted'); break;
      // settings + store
      // squad (Phase 3)
      case 'sqf': C.setSquadFilter(v); break;
      case 'player': C.openPlayer(v); break;
      case 'train': C.openTrain(v); break;
      case 'plan': { const [pid, f] = v.split('|'); const r = C.startPlan(pid, f);
        if (r === true) { C.toast('🏋️ Training plan started'); C.ui.back(); C.ui.refresh(); if (C.tab === 'squad') C.render(); }
        else C.toast(r === 'cash' ? 'Not enough Booster $' : r === 'cap' ? "At this player's limit" : 'All training slots are busy'); break; }
      case 'devspeed': { const q = C.inDev(v); if (!q) break; const free = C.isFreeFinish(q); if (!free) { const g = C.goldToFinish(q); if (C.acct().gold < g) { C.toast('Not enough Gold'); break; } C.acct().gold -= g; }
        q.end = C.now(); C.tickDev().forEach(m => C.toast(m)); C.fwEvent('speed'); C.ui.refresh(); if (C.tab === 'squad') C.render(); break; }
      case 'devslot': { const s2 = C.DEVSLOTS.find(x => x.id === v); C.toast(`🔒 ${s2.name}: ${s2.why}`); if (v !== 'prog') C.openStore(); break; }
      case 'numbers': C.openNumbers(v); break;
      case 'setnum': { const [pid, n] = v.split('|'); const r = C.giveNumber(pid, +n); if (r === 'ok') { C.toast('🎟 Number changed'); C.ui.back(); C.ui.refresh(); C.render(); } else C.toast(r === 'none' ? 'No Number Changes left (see the Store)' : 'That number is taken'); break; }
      case 'givenum': { const p = C.P(v), r = C.giveNumber(v, p.want); if (r === 'ok') { C.toast(`😀 ${p.ln} now wears No. ${p.want}`); C.ui.refresh(); C.render(); } else C.toast(r === 'none' ? 'No Number Changes left (see the Store)' : `No. ${p.want} is taken: change the other player's number first`); break; }
      case 'captain': if (!C.toggleCaptain(v)) C.toast('Up to 3 captains'); C.ui.refresh(); C.render(); break;
      case 'release': C.openRelease(v); break;
      case 'releaseyes': if (C.release(v)) { C.toast('Player released'); C.ui.closeAll(); C.render(); } else C.toast('Keep at least 16 players'); break;
      case 'rare': { const p = C.useRareRecruit(); if (p === 'full') C.toast('Roster is full'); else if (p) { C.render(); C.openPlayer(p.id); C.toast(`🎉 ${p.fn} ${p.ln} signed (Rare ${p.pos})`); } break; }
      case 'settings': C.openSettings(); break;
      case 'theme': C.acct().theme = v; C.save(); C.applyTheme(); C.ui.refresh(); break;
      case 'testcap': C.acct().testCap = +v; C.save(); C.ui.refresh(); C.redrawMap(); break;
      case 'cheat': if (v === 'gold') C.acct().gold += 500; if (v === 'cash') car.cash += 20000; if (v === 'cp') car.cp += 100;
        if (v === 'finish') { car.queue.forEach(q => q.end = C.now()); (car.devq || []).forEach(q => q.end = C.now()); C.tickDev(); }
        C.save(); C.tick(); C.render(); C.ui.refresh(); C.toast('Done'); break;
      case 'wipe': C.ui.open('Delete all data', () => `<p class="note" style="font-size:14px">This deletes every career and resets Gold and purchases on this device.</p><button class="btn full danger" data-act="wipeyes">Yes, delete everything</button>`); break;
      case 'wipeyes': try { localStorage.removeItem('clubfc2_p3'); } catch (e) { } location.reload(); break;
      case 'store': C.openStore(); break;
      case 'buy': { const a2 = C.acct();
        if (v === 'vip') a2.vipUntil = Math.max(a2.vipUntil, C.now()) + 30 * 864e5;
        if (v === 'slot3') { if (a2.slot3) break; a2.slot3 = true; }
        if (v === 'gold') a2.gold += 500;
        if (v === 'tslot3') { if (a2.tslot3) break; a2.tslot3 = true; }
        if (v === 'tokens' && car) car.tokens += 3;
        C.save(); C.toast('✅ Test purchase complete'); C.ui.refresh(); if (C.tab === 'campus') C.render(); break; }
    }
  }

  function welcome() {
    const col = C.college();
    C.ui.open('Welcome', () => `<div class="collegecard">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 64)}<div><b style="font-family:Graduate,serif;font-size:20px">${C.esc(col.full)}</b><br><small style="color:var(--mute);font-weight:800">${C.esc(col.mascot)} · ${col.state} · Tier 5</small></div></div>
      <div class="card" style="margin-top:14px;font-size:14px;line-height:1.5;font-weight:700">Coach ${C.esc(C.car().coach)}, welcome. ${C.esc(C.STORIES[C.car().job.story].title)}.<br><br>🔨 Tap a building to upgrade it, or an empty plot to build.<br>💵 Tap the bubbles to collect Booster $ and 📘 Coaching Points.<br>🏛 The Coaches' Office level caps everything else.</div>
      <button class="btn full pri" data-act="close">Let's build</button>`);
  }

  // one tap handler for everything
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.dataset.act === 'bgclose' && e.target !== el) return;
    e2 = e; act(el.dataset.act, el.dataset.v, el);
  });

  // horizontal swipe on [data-swipe] (job pages)
  let sx = null, sy = null;
  document.addEventListener('touchstart', e => { if (!e.target.closest('[data-swipe]')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) C.jobPage(dx < 0 ? 1 : -1); }, { passive: true });

  // one-second clock: finish builds, update timers, refresh live pop-ups
  let n = 0;
  setInterval(() => {
    if (!C.car()) return;
    const dmsg = C.tickDev(); if (dmsg.length) { dmsg.forEach(m => C.toast(m)); if (C.tab === 'squad') C.render(); if (C.ui.isOpen()) C.ui.refresh(); }
    C.$$('[data-dtimer]').forEach(e => { const q = C.inDev(e.dataset.dtimer); if (q) e.textContent = C.dur(C.remaining(q)); });
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
