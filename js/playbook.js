// Club FC: the Coach's Playbook (Phase 6, Q22). 11 branches × tiers I–III, levels with small capped bonuses,
// a real-time research queue with slots, and the bonuses that feed matches, recovery, training, recruiting and money.
(function (C) {
  // [id, icon, name, [[node name, effect key, per level, max level, what it says]]]
  C.PB = [
    ['att', '⚔️', 'Team Attack', [['Attacking Play I', 'sho', .005, 10, 'shooting'], ['Attacking Play II', 'sho', .005, 10, 'shooting'], ['Counter-Attack Mastery', 'sho', .004, 5, 'shooting']]],
    ['def', '🛡', 'Team Defence', [['Defensive Shape I', 'def', .005, 10, 'tackles and interceptions'], ['Defensive Shape II', 'def', .005, 10, 'tackles and interceptions'], ['Low Block Mastery', 'def', .004, 5, 'defending']]],
    ['pos', '🎯', 'Possession', [['Passing Patterns I', 'pas', .005, 10, 'pass success'], ['Passing Patterns II', 'pas', .005, 10, 'pass success'], ['Total Football', 'oop', .04, 5, 'less out-of-position penalty']]],
    ['set', '🚩', 'Set Pieces', [['Corners', 'set', .01, 10, 'set-piece threat'], ['Free Kicks', 'set', .01, 10, 'set-piece threat'], ['Set-Piece Specialists', 'set', .02, 5, 'set-piece threat']]],
    ['mor', '📣', 'Morale', [['Team Morale I', 'mor', .05, 10, 'morale gains'], ['Team Morale II', 'mor', .05, 10, 'morale gains'], ['Never Say Die', 'late', .01, 5, 'performance when losing late']]],
    ['con', '💪', 'Conditioning', [['Recovery I', 'rec', .01, 10, 'energy recovery'], ['Recovery II', 'rec', .01, 10, 'energy recovery'], ['Injury Resilience', 'inj', .04, 5, 'fewer injuries']]],
    ['dev', '🏋️', 'Development', [['Training Speed I', 'trn', .01, 10, 'training speed'], ['Training Speed II', 'trn', .01, 10, 'training speed'], ['Hidden Potential', 'xp', .04, 5, 'match development']]],
    ['scout', '🔍', 'Recruiting', [['Scouting Network', 'apps', .03, 10, 'applications'], ['Recruiting Pitch', 'pitch', .006, 10, 'offer appeal'], ['International Pipeline', 'agency', .06, 5, 'cheaper agency scouts']]],
    ['acad', '🎓', 'Academics', [['Study Hall', 'aid', .01, 10, 'academic aid'], ['Academic Aid', 'aid', .01, 10, 'academic aid'], ["Dean's List", 'aid', .02, 5, 'academic aid']]],
    ['prog', '💵', 'Program', [['Fan Engagement', 'crowd', .01, 10, 'attendance'], ['Boosters', 'gate', .02, 10, 'gate income'], ['Campus Jobs', 'jobs', .2, 5, 'campus jobs']]],
    ['staff', '🧑‍🏫', 'Staff', [['Staff Room', 'cxp', .03, 10, 'coach XP'], ['Extra Queue Slot', 'slot', 1, 1, 'a free 4th research and training slot'], ['Headhunter', 'hunt', .1, 5, 'better coaches in the market']]]
  ];
  C.PBSLOTS = [{ id: 'free', name: 'Free slot' }, { id: 'vip', name: "Coach's Club slot", why: "Join the Coach's Club" }, { id: 'iap', name: 'Extra research slot', why: 'One-off purchase' }, { id: 'prog', name: 'Earned slot', why: 'Playbook: Extra Queue Slot, or Film Room Lv 10' }];
  const pb = () => { const car = C.car(); if (!car.pb) car.pb = {}; if (!car.pbq) car.pbq = []; return car.pb; };
  const node = key => { const [b, t] = key.split('.'); const B = C.PB.find(x => x[0] === b); return { B, n: B[3][+t], t: +t }; };
  C.pbLv = key => pb()[key] || 0;
  // total bonus for an effect key
  C.pbv = k => { const P = pb(); let v = 0; for (const B of C.PB) B[3].forEach((n, t) => { if (n[1] === k) v += (P[B[0] + '.' + t] || 0) * n[2]; }); return v; };
  C.pbTotal = () => Object.values(pb()).reduce((s, v) => s + v, 0);
  C.pbSlotOpen = id => id === 'free' || (id === 'vip' && C.isVip()) || (id === 'iap' && C.acct().pslot3) || (id === 'prog' && (C.pbv('slot') >= 1 || C.level('film') >= 10));
  C.pbSlots = () => C.PBSLOTS.filter(s => C.pbSlotOpen(s.id)).length;
  C.pbRunning = () => { pb(); return C.car().pbq.length; };
  C.pbUnlocked = key => { const { B, t } = node(key); return t === 0 || C.pbLv(B[0] + '.' + (t - 1)) >= 5; };
  C.pbCost = (key, to) => { const t = node(key).t; return { cp: Math.round(8 * Math.pow(1.32, to + t * 4) / 5) * 5, cash: t ? Math.round(1500 * Math.pow(1.3, to + t * 3) / 100) * 100 : to > 4 ? Math.round(600 * Math.pow(1.3, to) / 100) * 100 : 0 }; };
  C.pbTime = (key, to) => Math.min(86400, Math.round(60 * Math.pow(1.55, to + node(key).t * 3) * (1 - C.level('film') * .01)));
  C.pbInQueue = key => C.car().pbq.find(q => q.key === key);
  C.pbStart = key => {
    const car = C.car(), { n } = node(key), to = C.pbLv(key) + 1; pb();
    if (to > n[3]) return 'max'; if (!C.pbUnlocked(key)) return 'locked'; if (C.pbInQueue(key)) return 'busy'; if (car.pbq.length >= C.pbSlots()) return 'slots';
    const k = C.pbCost(key, to); if (car.cp < k.cp) return 'cp'; if (car.cash < k.cash) return 'cash';
    car.cp -= k.cp; car.cash -= k.cash; const t = C.now(); car.pbq.push({ key, to, start: t, end: t + C.pbTime(key, to) * 1000 }); C.save(); return true;
  };
  C.tickPB = () => { const car = C.car(); if (!car || !car.pbq) return []; const done = car.pbq.filter(q => q.end <= C.now()), msg = [];
    for (const q of done) { pb()[q.key] = q.to; msg.push(`📋 ${node(q.key).n[0]} Lv ${q.to} researched`); }
    if (done.length) { car.pbq = car.pbq.filter(q => q.end > C.now()); C.save(); } return msg; };

  // ---------- everything the Playbook and staff add, in one place ----------
  C.teamBonus = () => {
    const f = C.staffF, tac = f('tac') * .04;
    return { sho: C.pbv('sho') + tac, def: C.pbv('def') + tac, pas: C.pbv('pas') + tac, gk: f('gk') * .06, oop: Math.min(.6, C.pbv('oop')), set: C.pbv('set'), late: C.pbv('late'),
      inj: Math.min(.6, C.pbv('inj') + f('snc') * .3), drain: f('snc') * .08 };
  };
  C.bonusLines = () => {
    const out = [];
    for (const B of C.PB) B[3].forEach((n, t) => { const lv = C.pbLv(B[0] + '.' + t); if (lv) out.push(`${B[1]} ${n[0]} ${lv}: ${n[1] === 'slot' ? n[4] : '+' + Math.round(lv * n[2] * 1000) / 10 + '% ' + n[4]}`); });
    for (const c of C.onStaff()) if (c.spec !== 'gen') out.push(`${C.SPECS[c.spec][0]} ${c.ln}: ${C.coachEffects(c)[0]}`);
    return out;
  };

  // ================= Playbook screen =================
  C.openPlaybook = () => C.ui.open('Playbook', () => {
    const car = C.car(); pb();
    const slots = C.PBSLOTS.map((s, i) => { const q = car.pbq[i];
      if (q) { const f = 1 - C.remaining(q) / ((q.end - q.start) / 1000); return `<button class="dq" data-act="pbnode" data-v="${q.key}"><span class="c">${C.ringSVG(f, '#38bdf8', 46)}<i style="font-style:normal;font-size:20px">${node(q.key).B[1]}</i></span><b data-until="${q.end}">${C.dur(C.remaining(q))}</b></button>`; }
      return C.pbSlotOpen(s.id) ? `<button class="dq free" data-act="toast" data-v="Tap a node to research it"><span class="c">📋</span><b>Free</b></button>` : `<button class="dq lock" data-act="pbslot" data-v="${s.id}"><span class="c">🔒</span><b>${s.id === 'vip' ? 'VIP' : s.id === 'iap' ? '$' : 'Earn'}</b></button>`; }).join('');
    return `<div class="raytake" style="margin-top:0"><span>📋</span><p><b>Your Playbook · <i class="cpi"></i> ${C.short(car.cp)} · 💵 ${C.short(car.cash)}</b>Know-how that travels with you to every job. Each tier opens when the one before reaches Lv 5.</p></div>
      <div class="dqrow pbq"><span>Research</span>${slots}</div>
      ${C.PB.map(B => `<div class="pbb"><h4>${B[1]} ${B[2]}</h4><div class="pbn">${B[3].map((n, t) => { const key = B[0] + '.' + t, lv = C.pbLv(key), un = C.pbUnlocked(key), q = C.pbInQueue(key);
        return `<button class="pbnode ${un ? '' : 'lock'} ${lv >= n[3] ? 'max' : ''} ${q ? 'run' : ''}" data-act="pbnode" data-v="${key}"><small>${['I', 'II', 'III'][t]}</small><b>${C.esc(n[0])}</b><div class="pbl"><i style="width:${lv / n[3] * 100}%"></i></div><em>${q ? '⏳' : un ? lv + '/' + n[3] : '🔒'}</em></button>`; }).join('')}</div></div>`).join('')}`;
  });
  C.openPBNode = key => C.ui.open('Research', () => {
    const car = C.car(), { B, n, t } = node(key), lv = C.pbLv(key), to = lv + 1, q = C.pbInQueue(key), un = C.pbUnlocked(key);
    const k = to <= n[3] ? C.pbCost(key, to) : null;
    return `<div class="pbhead"><span>${B[1]}</span><div><b>${C.esc(n[0])}</b><small>${B[2]} · Tier ${['I', 'II', 'III'][t]} · Lv ${lv} / ${n[3]}</small></div></div>
      <div class="card"><div class="srow"><span>Now</span><b>${n[1] === 'slot' ? (lv ? n[4] : '—') : '+' + Math.round(lv * n[2] * 1000) / 10 + '% ' + n[4]}</b></div>${k ? `<div class="srow"><span>Next</span><b style="color:var(--fit5)">${n[1] === 'slot' ? n[4] : '+' + Math.round(to * n[2] * 1000) / 10 + '% ' + n[4]}</b></div>` : ''}</div>
      ${q ? `<div class="card devnow" style="margin-top:10px"><span>⏳</span><div><b>Researching Lv ${q.to}</b><small><span data-until="${q.end}">${C.dur(C.remaining(q))}</span> left</small></div><button class="btn sm2" data-act="pbspeed" data-v="${key}">${C.isFreeFinish(q) ? 'Free' : '<i class="coin"></i> ' + C.goldToFinish(q)}</button></div>`
        : !un ? `<p class="note">🔒 Opens when ${C.esc(B[3][t - 1][0])} reaches Lv 5.</p>` : k ? `<div class="card" style="margin-top:10px"><div class="srow"><span><i class="cpi"></i> Coaching Points</span><b style="color:${car.cp >= k.cp ? 'inherit' : '#dc2626'}">${k.cp}</b></div>${k.cash ? `<div class="srow"><span>💵 Booster $</span><b style="color:${car.cash >= k.cash ? 'inherit' : '#dc2626'}">${C.short(k.cash)}</b></div>` : ''}<div class="srow"><span>⏱ Time</span><b>${C.dur(C.pbTime(key, to))}</b></div></div>
        <button class="btn full pri" data-act="pbgo" data-v="${key}" style="margin-top:12px">📋 Research Lv ${to}</button>` : '<p class="note">✨ Fully researched.</p>'}
      <p class="note">Bonuses are small and capped: tactics, players and fitness still decide matches.</p>`;
  });
})(window.CFC);
