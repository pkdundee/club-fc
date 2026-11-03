// Club FC: progression (phase-9j, round 4 items 14, 16, 32–36). Coach stars promoted with Coaching Badges, a player rating
// cap set by the Coaches' Office, the Piggy Bank and Win Streak rewards. All numbers here are first proposals, easy to tune.
(function (C) {
  const A = C.ACTS, meta = () => C.meta();

  // ================= coach stars (Last War tier style) =================
  // A coach starts with stars by rarity. Each star has 5 sections; a section costs as many badges as the current star count
  // (1 star: 1 badge a section, 5 for the star … 4 stars: 4 a section, 20 for the star). Each section adds +1% quality, each star +5%.
  const START = [1, 1, 2, 2, 3];
  C.cStars = c => { if (c.stars == null) { c.stars = START[c.rar] || 1; c.sec = 0; } return c.stars; };
  C.secCost = c => C.cStars(c);
  const oQ = C.coachQ; C.coachQ = c => Math.min(100, oQ(c) * (1 + .05 * (C.cStars(c) - 1) + .01 * (c.sec || 0)));
  C.promoteCoach = id => { const c = C.coach(id); if (!c) return 'gone'; C.cStars(c); if (c.stars >= 5) return 'max';
    const inv = meta().inv, k = C.secCost(c); if ((inv.badge || 0) < k) return 'badges';
    inv.badge -= k; c.sec = (c.sec || 0) + 1; if (c.sec >= 5) { c.sec = 0; c.stars++; } C.save(); return c.sec === 0 ? 'star' : true; };
  C.starsHTML = c => { C.cStars(c); const k = C.secCost(c), have = meta().inv.badge || 0, max = c.stars >= 5;
    return `<h3 class="jh">Stars</h3><div class="card cstar"><div class="cstars">${'★'.repeat(c.stars)}<i>${'★'.repeat(5 - c.stars)}</i></div>
      ${max ? '<p class="note" style="margin:4px 0 0;text-align:center">✨ Five stars: fully promoted</p>' : `<div class="csecs">${[0, 1, 2, 3, 4].map(i => `<i class="${i < (c.sec || 0) ? 'on' : ''}"></i>`).join('')}</div>
      <div class="srow"><span>Next section: +1% quality${(c.sec || 0) === 4 ? ', then a new star (+5%)' : ''}</span><b class="${have < k ? 'short' : ''}">🏅 ${have} / ${k}</b></div>
      <button class="btn full ${have >= k ? 'pri' : 'sec2'}" data-act="cpromote" data-v="${c.id}">${have >= k ? 'Promote' : 'Get Coaching Badges'}</button>`}
      <p class="note" style="margin:6px 0 0">Coaching Badges come from Missions, the Pass and the Store. Stars stay with the coach for your whole career.</p></div>`; };
  A.cpromote = v => { const r = C.promoteCoach(v); if (r === 'badges') { C.toast('Not enough Coaching Badges'); C.openStore(); return; } if (r === 'star') C.toast('⭐ New star!'); else if (r === true) C.toast('🏅 Section complete'); C.ui.refresh(); C.render(); };

  // ================= player rating cap from the Coaches' Office =================
  // 2 points per level (your proposal), starting high enough that today's players (45–55 at Lv 1) still grow: Lv 1 → 57 … Lv 23+ → 100.
  C.ratingCap = (car = C.car()) => Math.min(100, 55 + 2 * (car ? car.b.hq : 1));
  const oCap = C.attrCap; C.attrCap = (p, k) => Math.min(oCap(p, k), C.ratingCap() + 4);
  C.capNote = p => p.rating >= C.ratingCap() - 1 ? `<div class="capnote">🏛 At your facility cap (${C.ratingCap()}). Upgrade the Coaches' Office to let players grow further.</div>` : '';

  // ================= Piggy Bank: Coins pile up as you play; break it open (test purchase) =================
  const PIG_MAX = 300;
  C.piggy = () => meta().piggy || 0;
  C.piggyAdd = n => { const M = meta(); M.piggy = Math.min(PIG_MAX, (M.piggy || 0) + n); };
  C.piggyHTML = () => { const n = C.piggy(); return `<div class="piggy"><span>🐷</span><div><b>Piggy Bank</b><small>Wins add 🪙 5, tasks add 🪙 2 · up to ${PIG_MAX}</small><div class="hbar"><i style="width:${n / PIG_MAX * 100}%;background:#f472b6"></i></div></div>
    <button class="btn sm2 ${n >= 50 ? 'pri' : 'sec2'}" data-act="piggybreak" ${n >= 50 ? '' : 'disabled'}>🪙 ${n}<br><small>${n >= 50 ? '$1.99' : 'min 50'}</small></button></div>`; };
  A.piggybreak = (v, el) => { const n = C.piggy(); if (n < 50) return;
    if (!(el && el.dataset.ok)) return C.confirm('Break the Piggy Bank', `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store: nothing is charged.</div><p class="note">Get <b>🪙 ${n} Coins</b> for $1.99.</p>`, 'Buy $1.99', 'piggybreak', '');
    meta().piggy = 0; C.giveReward({ gold: n }); C.mail('purchases', '🧾', 'Purchase: Piggy Bank', `You broke the Piggy Bank: 🪙 ${n} Coins.<br><small>Test store: nothing was charged.</small>`, null); C.toast(`🐷 +${n} Coins`); C.ui.refresh(); C.render(); };

  // ================= Win Streak: rewards for consecutive wins, sent to the Inbox =================
  const STREAK = [[2, { gold: 10 }], [3, { gold: 20, sp15: 1 }], [5, { gold: 40, badge: 3 }], [8, { gold: 80, badge: 6, sp60: 1 }]];
  C.STREAK = STREAK;
  C.streak = () => meta().streak || 0;
  C.streakHTML = () => { const n = C.streak(), next = STREAK.find(s => s[0] > n);
    return `<div class="streak"><span>🔥</span><div><b>Win streak: ${n}</b><small>${next ? `${next[0] - n} more win${next[0] - n > 1 ? 's' : ''} for ${C.rwText(next[1])}` : 'Top reward reached: keep it going!'}</small></div><div class="stks">${STREAK.map(s => `<i class="${n >= s[0] ? 'on' : ''}">${s[0]}</i>`).join('')}</div></div>`; };

  // ================= hooks =================
  const wrap = (name, f) => { const o = C[name]; if (o) C[name] = (...a) => f(o, ...a); };
  wrap('applyResult', (o, m, f) => { const rep = o(m, f), M = meta(), us = rep.my === 0 ? rep.hs : rep.as, them = rep.my === 0 ? rep.as : rep.hs;
    if (us > them) { M.streak = (M.streak || 0) + 1; C.piggyAdd(5); const hit = STREAK.find(s => s[0] === M.streak); if (hit) C.mail('rewards', '🔥', `${hit[0]}-match win streak!`, `${hit[0]} wins in a row. Here's your streak reward.`, hit[1]); }
    else M.streak = 0;
    C.save(); return rep; });
  wrap('dailyClaim', (o, ...a) => { const r = o(...a); if (r) C.piggyAdd(2); return r; });
  wrap('mainClaim', (o, ...a) => { const r = o(...a); if (r) C.piggyAdd(2); return r; });
})(window.CFC);
