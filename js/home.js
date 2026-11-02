// Club FC: title/loading screen and the Home page (phase-9d). Home is the hub: today's gift and deal,
// the event, the next match, and a tile for every part of the game.
(function (C) {
  // ---------- title / loading screen: shown for a few seconds on launch ----------
  C.TITLE_MS = 2800;
  C.titleHTML = () => `<div class="title"><div class="splashart">${C.artSlot('title', C.sceneTitle('#1e3a8a', '#f97316', 390, 844))}</div>
      <h1>CLUB FC</h1><p class="tag">College soccer · build your program</p>
      <div class="loadbar"><i></i></div><small class="ver">${C.esc(C.BUILD || '')}</small></div>`;

  // ---------- daily gift and deal (test store: nothing is charged) ----------
  const DEALS = [
    { id: 'coins', icon: '<i class="coin"></i>', name: 'Coin chest', r: { gold: 300 }, price: '$1.99', was: '$2.99' },
    { id: 'recovery', icon: '🧴', name: 'Recovery bundle', r: { kit: 3, gold: 40 }, price: '$0.99', was: '$1.99' },
    { id: 'coach', icon: '📗', name: 'Coach boost', r: { manual: 5, books: 1 }, price: '$1.99', was: '$3.49' },
    { id: 'builder', icon: '🔨', name: 'Builder bundle', r: { cash: 25000, gold: 100 }, price: '$2.99', was: '$4.99' },
    { id: 'scout', icon: '🔍', name: 'Scouting pack', r: { cp: 120, gold: 60 }, price: '$0.99', was: '$1.99' }
  ];
  C.DEALS = DEALS;
  const dayNo = () => Math.floor(new Date().setHours(0, 0, 0, 0) / 864e5);
  C.todayDeal = () => DEALS[dayNo() % DEALS.length];
  const daily = () => { const car = C.car(); if (!car.daily || car.daily.day !== C.todayKey()) car.daily = { day: C.todayKey(), gift: false, deal: false }; return car.daily; };
  C.GIFT = { gold: 10, cash: 1500 };
  C.claimGift = () => { const d = daily(); if (d.gift) return null; d.gift = true; C.giveReward(C.GIFT); return C.GIFT; };
  C.buyDeal = () => { const d = daily(); if (d.deal) return 'owned'; d.deal = true; C.giveReward(C.todayDeal().r); return true; };
  C.dealBought = () => daily().deal;
  C.giftClaimed = () => daily().gift;

  // ---------- Home ----------
  C.homeHTML = () => {
    const car = C.car(), col = C.college(), a = C.acct(), deal = C.todayDeal(), ev = C.event(), d = daily(), inj = car.squad.filter(p => p.inj).length;
    const tile = (icon, name, act, v, badge, cls = '') => `<button class="htile ${cls}" data-act="${act}" data-v="${v}"><span class="hi">${icon}</span><b>${name}</b>${badge ? `<em>${badge}</em>` : ''}</button>`;
    const S = car.staff || {};
    return `<div class="view scrolly home">
      <div class="phdr sq"><div class="row1">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 44)}<div><b>Coach ${C.esc(car.coach)}</b><small>${C.esc(col.short)} · ${C.tierLabel()} · ⭐ ${C.rep()}</small></div></div>
        <div class="res hres"><span><i>💵</i><b>$${C.short(car.cash)}</b></span><span><i class="cpi"></i><b>${C.short(car.cp)}</b></span><span data-act="store"><i class="coin"></i><b>${C.short(a.gold)}</b><em class="plus">+</em></span></div></div>
      ${d.gift ? '' : `<button class="gift" data-act="dailygift"><span>🎁</span><div><b>Daily gift</b><small>${C.rwText(C.GIFT)} · free, once a day</small></div><em>Claim</em></button>`}
      <div class="deal ${d.deal ? 'done' : ''}"><div class="dl"><small>Today's deal</small><b>${deal.icon} ${C.esc(deal.name)}</b><p>${C.rwText(deal.r)}</p></div>
        ${d.deal ? '<span class="dbought">✔ Bought today</span>' : `<button class="dbuy" data-act="buydeal" data-v="${deal.id}"><s>${deal.was}</s>${deal.price}</button>`}</div>
      <div class="homebn">${C.gamedayHTML()}</div>
      <button class="evbn" data-act="events"><span>${ev.icon}</span><div><b>${ev.name}</b><small>${ev.desc}</small></div>${C.loClaimable() ? `<em>${C.loClaimable()}</em>` : ''}</button>
      <div class="htiles">
        ${tile('🏟', 'Matchday', 'tab', 'season')}${tile('<i class="xoi big"></i>', 'Tactics', 'tactics', '')}${tile('🏫', 'Campus', 'tab', 'campus')}
        ${tile('👕', 'Squad', 'tab', 'squad')}${tile('✉️', 'Recruit', 'tab', 'recruit', C.portalOpen() ? '🚪' : '')}${tile('🧢', 'Staff', 'tab', 'staff', S.mNew ? 'NEW' : '')}
        ${tile('📋', 'Playbook', 'playbook', '', C.pbRunning() ? C.pbRunning() : '')}${tile('🩺', 'Medical', 'medical', '', inj || '')}${tile('🎁', 'Events', 'events', '', C.loClaimable() || '')}
        ${tile('🏛', 'Director', 'ad', '', C.adUnread() || '')}${tile('🛒', 'Store', 'store', '')}${tile('❓', 'Help', 'ask', '')}
        ${tile('⚙️', 'Settings', 'settings', '')}
      </div>
      <p class="note" style="text-align:center;padding:0 16px 8px">🧪 Test build: purchases are simulated.</p></div>`;
  };
})(window.CFC);
