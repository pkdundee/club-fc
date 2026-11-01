// Club FC: the athletic director's office (Q8, Q21a) and the Coach's First Week event (Q13).
(function (C) {
  const AD = { name: 'Linda Haynes', title: 'Athletic Director' };
  const GOAL = { 3: 'Top 4 and reach the conference final', 2: 'Finish in the top half', 1: 'Stay out of the bottom 2' };
  C.AD = AD;

  // ---------- AD office ----------
  C.adMessages = car => {
    const st = C.STORIES[car.job.story], col = C.college(car), m = [];
    m.push({ id: 'welcome', icon: '✍️', title: 'Welcome to ' + col.short, body: `Coach ${C.esc(car.coach)}, glad to have you. You know the situation: <b>${C.esc(st.title.toLowerCase())}</b>. This season I'd like you to <b>${GOAL[car.job.stars].toLowerCase()}</b>. Longer term: ${C.esc(st.ambition.toLowerCase())}.` });
    m.push({ id: 'campus', icon: '🏗', title: 'About the campus', body: "The facilities budget is yours to spend. Start with the Coaches' Office: nothing else can be higher than it." });
    if (car.b.hq >= 3) m.push({ id: 'hq3', icon: '👏', title: 'Good progress', body: "The Coaches' Office is coming along. Boosters noticed. Keep building." });
    m.push({ id: 'review', icon: '📋', title: 'Reviews', body: 'I review every coach at mid-season and at the end of the season. Those reviews start once the season kicks off.' });
    return m;
  };
  C.adUnread = () => { const car = C.car(); return C.adMessages(car).filter(x => !car.seen['ad_' + x.id]).length; };
  C.openAD = () => {
    const car = C.car(); C.adMessages(car).forEach(x => car.seen['ad_' + x.id] = 1); C.save();
    C.ui.open("AD's Office", () => {
      const st = C.STORIES[car.job.story];
      return `<div class="adhead"><div class="adface">🏛</div><div><b>${AD.name}</b><small>${AD.title} · ${C.esc(C.college(car).short)}</small></div></div>
        <div class="kgrid"><div class="k"><small>Season goal</small><b>${GOAL[car.job.stars]}</b></div><div class="k"><small>Long-term ambition</small><b>${C.esc(st.ambition)}</b></div></div>
        <div class="card conf"><small>AD confidence</small><div class="cmeter">${['😟', '🙁', '😐', '🙂', '😀'].map((e, i) => `<span class="${i === 2 ? 'on' : ''}">${e}</span>`).join('')}</div><p class="note" style="margin-top:4px">Moves with results once the season starts.</p></div>
        ${C.adMessages(car).map(x => `<div class="admsg"><span>${x.icon}</span><div><b>${x.title}</b><p>${x.body}</p></div></div>`).join('')}`;
    });
  };

  // ---------- Coach's First Week (7 real days) ----------
  // Each task: [id, text, check(car) -> bool]. Counters live in car.fw.n.
  const n = (car, k) => (car.fw.n[k] || 0);
  const DAYS = [
    { title: 'Day 1 · Settle in', reward: { gold: 50, cash: 3000 }, tasks: [['hq2', "Upgrade the Coaches' Office to Lv 2", c => c.b.hq >= 2], ['col1', 'Collect Booster $ once', c => n(c, 'collect_cash') >= 1]] },
    { title: 'Day 2 · Strength', reward: { gold: 50, cp: 30 }, tasks: [['gym', 'Build the Gym', c => c.b.gym >= 1], ['spd', 'Use a speed-up', c => n(c, 'speed') >= 1]] },
    { title: 'Day 3 · Learn the game', reward: { gold: 60, cash: 4000 }, tasks: [['ask', 'Ask Ray a question', c => !!c.seen.ask], ['hb', "Read 'Scholarships' in the Handbook", c => !!c.seen.hb_schol]] },
    { title: 'Day 4 · Headquarters', reward: { gold: 60, cp: 40 }, tasks: [['hq3', "Coaches' Office Lv 3", c => c.b.hq >= 3], ['std2', 'Stadium Lv 2', c => c.b.stadium >= 2]] },
    { title: 'Day 5 · Film study', reward: { gold: 70, cash: 6000 }, tasks: [['film2', 'Film Room Lv 2', c => c.b.film >= 2], ['cp3', 'Collect Coaching Points 3 times', c => n(c, 'collect_cp') >= 3]] },
    { title: 'Day 6 · Busy campus', reward: { gold: 80, cp: 60 }, tasks: [['tr2', 'Training Ground Lv 2', c => c.b.training >= 2], ['up6', 'Start 6 upgrades in total', c => n(c, 'upgrade') >= 6]] },
    { title: 'Day 7 · Big week', reward: { gold: 200, cash: 15000, item: 'rareRecruit' }, tasks: [['hq4', "Coaches' Office Lv 4", c => c.b.hq >= 4], ['bst', 'Build the Booster Club', c => c.b.booster >= 1]] }
  ];
  C.fwInit = car => { if (!car.fw) car.fw = { start: Date.now(), n: {}, claimed: [] }; };
  C.fwEvent = k => { const car = C.car(); if (!car) return; C.fwInit(car); car.fw.n[k] = (car.fw.n[k] || 0) + 1; C.save(); };
  const dayIndex = car => { const s = new Date(car.fw.start); s.setHours(0, 0, 0, 0); const t = new Date(); t.setHours(0, 0, 0, 0); return Math.floor((t - s) / 864e5); };
  C.fwUnlocked = car => Math.min(6, dayIndex(car)); // day 0..6
  C.fwDone = (car, d) => DAYS[d].tasks.every(t => t[2](car));
  C.fwClaimable = () => { const car = C.car(); if (!car) return 0; C.fwInit(car); let k = 0; for (let d = 0; d <= C.fwUnlocked(car); d++) if (!car.fw.claimed.includes(d) && C.fwDone(car, d)) k++; return k; };
  C.fwActive = () => { const car = C.car(); if (!car) return false; C.fwInit(car); return car.fw.claimed.length < 7; };
  const rw = r => [r.gold ? `◆ ${r.gold}` : '', r.cash ? `💵 ${C.short(r.cash)}` : '', r.cp ? `📘 ${r.cp}` : '', r.item ? '🎁 Rare recruit' : ''].filter(Boolean).join(' · ');
  C.openFirstWeek = () => C.ui.open("Coach's First Week", () => {
    const car = C.car(); C.fwInit(car); const open = C.fwUnlocked(car);
    return `<div class="raytake" style="margin-top:0"><span>🧢</span><p><b>Ray</b>One chapter a day for your first week. Missed a day? You can catch up.</p></div>
      <div class="fwstrip">${DAYS.map((d, i) => `<i class="${car.fw.claimed.includes(i) ? 'done' : i <= open ? 'open' : ''}">${i + 1}</i>`).join('')}</div>
      ${DAYS.map((d, i) => { const locked = i > open, done = C.fwDone(car, i), got = car.fw.claimed.includes(i);
        return `<div class="fwday ${locked ? 'locked' : ''}"><div class="fwh"><b>${d.title}</b><small>${locked ? '🔒 Opens in ' + (i - open) + ' day' + (i - open > 1 ? 's' : '') : rw(d.reward)}</small></div>
          ${locked ? '' : d.tasks.map(t => `<div class="fwt ${t[2](car) ? 'ok' : ''}"><span>${t[2](car) ? '✔' : '○'}</span>${t[1]}</div>`).join('') + (got ? '<div class="fwclaimed">✔ Claimed</div>' : `<button class="btn full ${done ? 'pri' : 'sec2'}" data-act="fwclaim" data-v="${i}" ${done ? '' : 'disabled'}>${done ? 'Claim ' + rw(d.reward) : 'Finish both tasks to claim'}</button>`)}</div>`; }).join('')}`;
  });
  C.fwClaim = d => { const car = C.car(), r = DAYS[d].reward; if (car.fw.claimed.includes(d) || d > C.fwUnlocked(car) || !C.fwDone(car, d)) return false;
    car.fw.claimed.push(d); if (r.gold) C.acct().gold += r.gold; if (r.cash) car.cash += r.cash; if (r.cp) car.cp += r.cp; if (r.item) { car.items = car.items || {}; car.items[r.item] = (car.items[r.item] || 0) + 1; }
    C.save(); return rw(r); };
})(window.CFC);
