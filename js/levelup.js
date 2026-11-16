// Club FC: level-up screens (9q, FEEDBACK 76). The Coaches' Office gets a full-screen celebration; other buildings a banner
// over the map. Both show what changed (old ▶ new), anything newly unlocked, and the reward. Tap anywhere to continue.
(function (C) {
  let showing = false;
  const rows = (k, from, to) => { const d = C.BUILDINGS[k]; if (!from) return '';
    const a = d.stats(from), b = d.stats(to);
    return b.map((r, i) => a[i][2] === r[2] ? '' : `<div class="lu-row"><span>${r[0] === 'seat' ? '🪑' : r[0]} ${C.esc(r[1])}</span><b>${a[i][2]}</b><i>▶</i><em>${r[2]}</em></div>`).join(''); };
  const tile = (pic, label, n) => `<div class="lu-tile">${n ? '<s>NEW</s>' : ''}${pic}<small>${label}</small></div>`;
  function show(q) {
    const k = q.key, d = C.BUILDINGS[k], car = C.car(), hq = k === 'hq', first = q.to <= 1, col = C.college();
    const unlocked = hq ? Object.keys(C.BUILDINGS).filter(b => C.BUILDINGS[b].needHQ === q.to) : [];
    const reward = q.cp ? tile('<span class="cpi big"></span>', '+' + q.cp + ' Coaching Points') : '';
    const news = unlocked.map(b => tile(`<div class="lu-pic">${C.buildingThumb(b, 1, car, 90, 64)}</div>`, C.BUILDINGS[b].name, 1)).join('');
    const el = document.createElement('div');
    el.className = 'lvlup ' + (hq && !first ? 'big' : 'small');
    el.style.setProperty('--c1', col.c1); el.style.setProperty('--c2', col.c2);
    el.innerHTML = hq && !first
      ? `<div class="lu-in"><div class="lu-lv">LEVEL</div><div class="lu-n">${q.to}</div><div class="lu-b">${C.buildingThumb(k, q.to, car, 260, 190)}</div>
          <div class="lu-name">${C.esc(d.name)}</div><div class="lu-rows">${rows(k, q.to - 1, q.to)}<div class="lu-row"><span>🧱 Every building can now reach</span><b></b><i></i><em>Lv ${q.to}</em></div></div>
          <div class="lu-tiles">${news}${reward}</div><p class="lu-tap">Tap anywhere to continue</p></div>`
      : `<div class="lu-in"><div class="lu-rib">${C.esc(d.name.toUpperCase())} ${first ? 'BUILT!' : 'LEVEL UP!'}</div>
          <div class="lu-rows">${first ? `<div class="lu-row"><span>${C.esc(C.BJOB[k] || d.desc)}</span></div>` : rows(k, q.to - 1, q.to)}</div>
          ${reward ? `<div class="lu-tiles">${reward}</div>` : ''}<p class="lu-tap">Tap to continue</p></div>`;
    document.body.appendChild(el); showing = true;
    requestAnimationFrame(() => el.classList.add('on'));
    el.addEventListener('click', () => { el.remove(); showing = false;
      // a new building (FEEDBACK 85, 86): the athletic director explains it in Mail, and the map pans to its plot
      if (unlocked.length) { unlocked.forEach(b => C.mail('director', '🏗', `New building: ${C.BUILDINGS[b].name}`, `Coach, the Coaches' Office upgrade means we can now build the <b>${C.esc(C.BUILDINGS[b].name)}</b>. ${C.esc(C.BUILDINGS[b].desc)} Its plot is ready: tap the green badge on the campus map. The first build is free.`));
        C.goToBuilding(unlocked[0]); C.toast(`🏗 New: ${unlocked.map(b => C.BUILDINGS[b].name).join(', ')}`); }
      next(); });
  }
  function next() { if (showing || !C.lvlQueue || !C.lvlQueue.length) return; show(C.lvlQueue.shift()); }
  C.nextLevelUp = next;
  // a small reward list above a tapped chest; any tap elsewhere closes it
  C.rewardPreview = (r, el) => { document.querySelectorAll('.chpop').forEach(x => x.remove()); if (!el) return C.toast('🧰 ' + C.rwText(r));
    const b = el.getBoundingClientRect(), p = document.createElement('div'); p.className = 'chpop';
    p.innerHTML = `<b>Rewards</b>${C.itemTiles ? C.itemTiles(r) : C.esc(C.rwText(r))}`; document.body.appendChild(p);
    const w = p.offsetWidth, x = Math.max(8, Math.min(innerWidth - w - 8, b.left + b.width / 2 - w / 2)); p.style.left = x + 'px'; p.style.top = Math.max(8, b.top - p.offsetHeight - 8) + 'px';
    setTimeout(() => document.addEventListener('click', () => p.remove(), { once: true }), 0); };

  // Ask before spending Coins to finish something now (FEEDBACK 79, 81). "Don't show me today" skips it until tomorrow.
  C.confirmCoins = (n, go) => {
    const a = C.acct(), today = C.todayKey();
    if (!n || a.coinTip === today) { C.ok2spend = 1; return go(); }
    if (a.gold < n) { C.toast('Not enough Coins'); return; }
    const el = document.createElement('div'); el.className = 'lvlup small on cconf';
    el.innerHTML = `<div class="cc-box"><b class="cc-h">Finish now?</b><p>Use ${C.GEM} <b>${n}</b> Coins to finish straight away?</p>
      <label class="cc-chk"><input type="checkbox" id="ccday"> Don't show me today</label>
      <div class="cc-btns"><button class="btn sec2" data-cc="0">Cancel</button><button class="btn pri" data-cc="1">Confirm</button></div></div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('[data-cc]'); if (!b && e.target !== el) return;
      const yes = b && b.dataset.cc === '1'; if (yes && el.querySelector('#ccday').checked) { a.coinTip = today; C.save(); }
      el.remove(); if (yes) { C.ok2spend = 1; go(); } });
  };
})(window.CFC);
