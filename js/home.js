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

  // ---------- Next step (round 4, item 13): one suggested action from the assistant coach ----------
  C.nextStep = () => {
    const car = C.car(), d = daily(), inj = car.squad.filter(p => p.inj && p.injury && !p.injury.physio && p.injury.sev === 0 && !p.injury.conc && p.injury.k !== 'flu').length;
    const ready = Object.keys(C.BUILDINGS).filter(k => C.readyArrow(k) || (C.newBuildable().includes(k) && C.requirements(k).every(r => r[2])));
    if (!d.gift) return ['🎁', 'Claim your daily gift.', 'dailygift', ''];
    if (C.mainNext) { const t = C.mainNext(); if (t && (car.pre || C.meta().main.length < 10)) return t[3](car) ? ['🎯', `Claim your Mission reward: ${t[2]}.`, 'events', ''] : [t[1], t[2] + '.', t[5], t[6]]; }
    if (C.loClaimable()) return ['🎉', `You have ${C.loClaimable()} reward${C.loClaimable() > 1 ? 's' : ''} waiting in Events.`, 'events', ''];
    if (C.idleBuilders() && ready.length) return ['🔨', `A builder is free: upgrade the ${C.BUILDINGS[ready[0]].name}.`, 'bldopen', ready[0]];
    const coll = Object.keys(C.PRODUCERS).filter(k => C.bubble(k));
    if (coll.length) return ['💵', 'Income is waiting on campus: collect it.', 'tab', 'campus'];
    if (C.pbRunning && !C.pbRunning() && car.cp >= 20) return ['📋', 'Start some Playbook research.', 'playbook', ''];
    if (inj && C.medState().physio > 0) return ['🩺', `Use a physio session on an injured player.`, 'medical', ''];
    if (C.adUnread()) return ['🏛', 'The Director has a message for you.', 'ad', ''];
    if (C.inboxUnread && C.meta().inbox.some(x => x.r && !x.claimed)) return ['✉️', 'You have rewards waiting in your Inbox.', 'inbox', ''];
    if (C.portalOpen()) return ['🚪', 'The transfer window is open.', 'portalgo', ''];
    return C.myFixture() ? ['⚽', 'Pick your line-up and play the next match.', 'prematch', ''] : ['🏆', 'Review the season.', 'tab', 'season'];
  };
  C.nextStepHTML = () => { const [icon, text, act, v] = C.nextStep(), c = C.onStaff().find(x => x.spec === 'gen') || C.onStaff()[0];
    return `<button class="nstep" data-act="${act}" data-v="${v}"><span class="nsf">${c ? C.coachFace(c) : icon}</span><span class="nst"><small>Next step</small>${icon} ${C.esc(text)}</span><em>›</em></button>`; };

  // ---------- Home ----------
  C.homeHTML = () => {
    const car = C.car(), col = C.college(), a = C.acct(), deal = C.todayDeal(), ev = C.event(), d = daily(), inj = car.squad.filter(p => p.inj).length;
    // Footium-style grid (round 5): white, icons floating, 3 × 4 with no widow. Settings lives in the header.
    const tile = (icon, name, act, v, badge) => `<button class="htile" data-act="${act}" data-v="${v}"><span class="hi">${icon}</span><b>${name}</b>${badge ? `<em>${badge}</em>` : ''}</button>`;
    const S = car.staff || {};
    return `<div class="view scrolly home">
      <div class="phdr sq"><div class="row1">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 44)}<div style="flex:1"><b>Coach ${C.esc(car.coach)}</b><small>${C.esc(col.short)} · ${C.tierLabel()} · ⭐ ${C.rep()}</small></div><button class="hgear" data-act="collegemap" data-v="" aria-label="College Map">🗺</button><button class="hgear" data-act="ask" aria-label="Help">❓</button><button class="hgear" data-act="settings" aria-label="Settings">⚙️</button></div>
        <div class="res hres">${C.resBar()}</div><div class="hpow">${C.powerBadge('lt')}</div></div>
      ${C.nextStepHTML()}
      ${d.gift ? '' : `<button class="gift" data-act="dailygift"><span>🎁</span><div><b>Daily gift</b><small>${C.rwText(C.GIFT)} · free, once a day</small></div><em>Claim</em></button>`}
      <div class="homebn">${C.gamedayHTML()}</div>
      <div class="htiles">
        ${tile('🏟', 'Matchday', 'tab', 'season')}${tile('<i class="xoi big"></i>', 'Tactics', 'tactics', '')}${tile('🏫', 'Campus', 'tab', 'campus', C.idleBuilders() && C.readyCount() ? '!' : '')}
        ${tile('👕', 'Squad', 'tab', 'squad')}${tile('📝', 'Recruit', 'tab', 'recruit', C.portalOpen() ? '🚪' : '')}${tile('🧢', 'Staff', 'tab', 'staff', S.mNew ? 'NEW' : '')}
        ${tile('📋', 'Playbook', 'playbook', '', C.pbRunning() ? C.pbRunning() : '')}${tile('🩺', 'Medical', 'medical', '', inj || '')}${tile('🎁', 'Events', 'events', '', C.loClaimable() || '')}
        ${tile('✉️', 'Inbox', 'inbox', '', C.inboxUnread() || '')}${tile('🎒', 'Inventory', 'inventory', '')}${tile('🛒', 'Store', 'store', '')}
      </div>
      <div class="deal ${d.deal ? 'done' : ''}"><div class="dl"><small>Today's deal</small><b>${deal.icon} ${C.esc(deal.name)}</b><p>${C.rwText(deal.r)}</p></div>
        ${d.deal ? '<span class="dbought">✔ Bought today</span>' : `<button class="dbuy" data-act="buydeal" data-v="${deal.id}"><s>${deal.was}</s>${deal.price}</button>`}</div>
      <button class="evbn" data-act="events"><span>${ev.icon}</span><div><b>${ev.name}</b><small>${ev.desc}</small></div>${C.loClaimable() ? `<em>${C.loClaimable()}</em>` : ''}</button>
      <p class="note" style="text-align:center;padding:8px 16px">🧪 Test build: purchases are simulated.</p></div>`;
  };
  // the one resource bar used on every tab (round 4, item 13): Booster $, Coaching Points, Coins (+ opens the Store)
  C.schChip = () => `<span class="schip" title="Scholarship money left this year"><i class="schi"></i>$${C.short(C.poolLeft())} scholarships left</span>`;
  C.resBar = () => { const car = C.car(), a = C.acct();
    return `<span><i>💵</i><b id="r-cash">$${C.short(car.cash)}</b></span><span><i class="cpi"></i><b id="r-cp">${C.short(car.cp)}</b></span><span data-act="store"><i class="coin"></i><b id="r-gold">${C.short(a.gold)}</b><em class="plus">+</em></span>`; };
})(window.CFC);
