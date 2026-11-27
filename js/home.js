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
  C.GIFT = { cp: 5, cash: 500 };   // a small daily pick-up, redeemed in Events > Missions > Daily
  C.claimGift = () => { const d = daily(); if (d.gift) return null; d.gift = true; C.giveReward(C.GIFT); return C.GIFT; };
  C.buyDeal = () => { const d = daily(); if (d.deal) return 'owned'; d.deal = true; const dl = C.todayDeal(); if (!(C.packToInv && C.packToInv('deal_' + dl.name, dl))) C.giveReward(dl.r); return true; };
  C.dealBought = () => daily().deal;
  C.giftClaimed = () => daily().gift;

  // ---------- Next step (round 4, item 13): one suggested action from the assistant coach ----------
  C.nextStep = () => {
    const car = C.car(), d = daily(), inj = car.squad.filter(p => p.inj && p.injury && !p.injury.physio && p.injury.sev === 0 && !p.injury.conc && p.injury.k !== 'flu').length;
    const ready = Object.keys(C.BUILDINGS).filter(k => C.readyArrow(k) || (C.newBuildable().includes(k) && C.requirements(k).every(r => r[2])));
    if (!C.loginClaimed()) return ['🎁', 'Claim your login reward.', 'dailytasks', ''];
    if (C.stripTask) { const st = C.stripTask(); if (st && (car.pre || C.meta().main.length < 10 || st.go)) return [st.claim ? '🎯' : '👉', st.text + '.', 'taskgo', '']; }   // same as the campus task strip (9s)
    if (C.msClaimable()) return ['🎉', `You have ${C.msClaimable()} reward${C.msClaimable() > 1 ? 's' : ''} waiting in Missions.`, 'nexttask', ''];
    if (C.evOnlyClaimable()) return ['🎉', `You have ${C.evOnlyClaimable()} reward${C.evOnlyClaimable() > 1 ? 's' : ''} waiting in Events.`, 'events', ''];
    if (C.idleBuilders() && ready.length) return ['🔨', `A builder is free: upgrade the ${C.BUILDINGS[ready[0]].name}.`, 'dgo', ready[0]];
    const coll = Object.keys(C.PRODUCERS).filter(k => C.bubble(k));
    if (coll.length) return ['💵', 'Income is waiting on campus: collect it.', 'tab', 'campus'];
    if (C.pbRunning && !C.pbRunning() && car.cp >= 20) return ['📋', 'Start some Playbook research.', 'playbook', ''];
    if (C.myFixture() && C.tac().xi.map(C.P).filter(p => p && p.energy < 50).length >= 3) return ['🧴', 'Your starters are tired: rejuvenate before the next match.', 'rejuv', ''];
    if (inj && C.medState().physio > 0) return ['🩺', `Use a physio session on an injured player.`, 'medical', ''];
    if ((C.meta().inbox || []).some(x => x.f === 'director' && !x.read)) return ['🏛', 'The Director has a message for you.', 'inbox', ''];   // 1.01: Director notes are mail
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
    const tile = (icon, name, act, v, badge) => `<button class="htile" data-act="${act}" data-v="${v}"><span class="hi">${icon}${badge ? `<em>${badge}</em>` : ''}</span><b>${name}</b></button>`;   // 1.10.01 (QA-146): the dot on the icon
    const S = car.staff || {};
    return `<div class="view scrolly home">
      ${C.topBar(true)}
      <div class="hhead9" style="--c1:${col.c1}">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 52)}<div><b>${C.esc(col.short)} ${C.esc(col.mascot)}</b><small>${car.gender === 'w' ? "Women's" : "Men's"} soccer · ${C.tierLabel()} · ⭐ ${C.rep()}${C.sea && C.sea() && C.table && C.table().find(x => x.i === 0) && C.table().find(x => x.i === 0).p ? ' · ' + (t => t.w + 'W ' + t.d + 'D ' + t.l + 'L')(C.table().find(x => x.i === 0)) : ''}</small></div></div>
      ${C.nextStepHTML()}
      ${C.loginClaimed() ? '' : `<button class="gift" data-act="dailytasks"><span>🎁</span><div><b>Login reward</b><small>${C.rwText(C.GIFT)} · waiting in your Daily tasks</small></div><em>Go</em><i class="ldot"></i></button>`}
      <div class="homebn">${C.gamedayHTML()}</div>
      <div class="htiles">
        ${tile(C.kBadge('match'), 'Matchday', 'tab', 'season')}${tile(C.kBadge('tactics'), 'Tactics', 'tactics', '')}${tile(C.kBadge('campus'), 'Campus', 'tab', 'campus', C.idleBuilders() && C.readyCount() ? '!' : '')}
        ${tile(C.kBadge('squad'), 'Squad', 'tab', 'squad')}${tile(C.kBadge('recruit'), 'Recruit', 'tab', 'recruit', C.portalOpen() ? '!' : '')}${tile(C.kBadge('staff'), 'Staff', 'tab', 'staff', S.mNew ? 'NEW' : '')}
        ${tile(C.kBadge('playbook'), 'Playbook', 'playbook', '', C.pbRunning() ? C.pbRunning() : '')}${tile(C.kBadge('medical'), 'Medical', 'medical', '', inj || '')}${tile(C.kBadge('events'), 'Events', 'events', '', C.evOnlyClaimable() || '')}
        ${tile(C.kBadge('inbox'), 'Inbox', 'inbox', '', C.inboxUnread() || '')}${tile(C.kBadge('inventory'), 'Inventory', 'inventory', '')}${tile(C.kBadge('store'), 'Store', 'store', '')}
      </div>
      <div class="deal ${d.deal ? 'done' : ''}"><div class="dl"><small>Today's deal</small><b>${deal.icon} ${C.esc(deal.name)}</b><p>${C.rwText(deal.r)}</p></div>
        ${d.deal ? '<span class="dbought">✔ Bought today</span>' : `<button class="dbuy" data-act="buydeal" data-v="${deal.id}"><s>${deal.was}</s>${deal.price}</button>`}</div>
      <button class="evbn" data-act="events"><span>${ev.icon}</span><div><b>${ev.name} · free this week</b><small>${ev.desc}</small></div>${C.evOnlyClaimable() ? `<em>${C.evOnlyClaimable()}</em>` : ''}</button>
      <p class="note" style="text-align:center;padding:8px 16px">🧪 Test build: purchases are simulated.</p></div>`;
  };
  // the one resource bar used on every tab (round 4, item 13): Booster $, Coaching Points, Coins (+ opens the Store)
  C.schChip = () => `<span class="schip" title="Scholarship money left this year"><i class="schi"></i>$${C.short(C.poolLeft())} of $${C.short(C.car().job.pool)} left</span>`;   // 1.06 (QA-64)
  C.resBar = () => { const car = C.car(), a = C.acct();
    return `<span>${C.kCash(17)}<b id="r-cash">$${C.full(car.cash)}</b></span><span>${C.kCP(17)}<b id="r-cp">${C.bar(car.cp)}</b></span><span data-act="store">${C.kCoin(17)}<b id="r-gold">${C.bar(a.gold)}</b><em class="plus">+</em></span>`; };
})(window.CFC);
