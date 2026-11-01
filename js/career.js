// Club FC: career climb (Phase 7, Q25b, Q27). Reputation, tier bands, job offers gated by your program, moving
// (program buildings, staff and Playbook come with you; school buildings stay), players who may follow, loyalty rewards,
// reclassification (the stay route with a transition season), and a homecoming fixture against your old college.
(function (C) {
  C.BANDS = ['Low', 'Mid', 'High'];
  const TIER_RATING = { 5: 40, 4: 48, 3: 55, 2: 62, 1: 69 };
  const PROGRAM = Object.keys(C.BUILDINGS).filter(k => C.BUILDINGS[k].owner === 'program');
  const SCHOOL = Object.keys(C.BUILDINGS).filter(k => C.BUILDINGS[k].owner === 'school');
  C.PROGRAM_B = PROGRAM; C.SCHOOL_B = SCHOOL;

  // ---------- reputation and program level ----------
  C.rep = (car = C.car()) => Math.round(C.clamp(car.rep ?? 10, 0, 100));
  C.programLevel = (car = C.car()) => Math.round(PROGRAM.reduce((s, k) => s + car.b[k], 0) / PROGRAM.length * 10) / 10;
  C.band = (car = C.car()) => car.band ?? 0;
  C.tierLabel = (car = C.car()) => `${C.TIERS[car.tier].n} · ${C.BANDS[C.band(car)]}`;
  // reclassification: what your own college needs to move up a division
  C.reclassReqs = (car = C.car()) => {
    const cap = C.TIERS[car.tier].cap, S = car.sea;
    return [['🏛', `Coaches' Office Lv ${cap}`, car.b.hq >= cap], ['🏟', `Stadium Lv ${Math.max(3, cap - 1)}`, car.b.stadium >= Math.max(3, cap - 1)], ['🏠', `Dorms Lv ${Math.max(3, cap - 1)}`, car.b.dorms >= Math.max(3, cap - 1)],
      ['🏆', 'A top-2 finish', (car.best || 9) <= 2], ['🏛', 'Director confidence 60+', (car.adConf ?? 50) >= 60]];
  };
  C.canReclass = (car = C.car()) => car.tier > 1 && !car.reclass && C.reclassReqs(car).every(r => r[2]);

  // ---------- season end: reputation, offers (called from finishSeason) ----------
  C.careerSeasonEnd = () => {
    const car = C.car(), S = car.sea, e = S.end; if (!e || S.offersMade) return; S.offersMade = 1;
    car.rep = C.clamp((car.rep ?? 10) + (e.met ? 10 : -8) + (e.champ ? 15 : e.final ? 6 : 0) + Math.min(6, C.programLevel() - 2), 0, 100);
    car.best = Math.min(car.best || 9, e.pos);
    if (car.reclass && car.reclass.season === S.n) { car.reclass.done = true; }
    car.offers = makeOffers(car);
  };
  function makeOffers(car) {
    const r = C.rng((car.created & 0xffff) * 31 + car.season * 7), rep = C.rep(car), pl = C.programLevel(car), out = [];
    const options = [];
    if (rep >= 25 && C.band(car) < 2) options.push({ tier: car.tier, band: C.band(car) + 1 });
    if (car.tier > 1 && rep >= 45 && pl >= Math.min(6, C.TIERS[car.tier].cap * .6)) options.push({ tier: car.tier - 1, band: 0 });
    if (car.tier > 1 && rep >= 70 && pl >= C.TIERS[car.tier].cap * .8) options.push({ tier: car.tier - 1, band: 1 });
    const cols = C.COLLEGES.filter(c => c.id !== car.college && c.id !== car.homecoming).sort(() => r() - .5);
    options.forEach((o, i) => out.push(offer(car, o.tier, o.band, cols[i], r)));
    return out;
  }
  function offer(car, tier, band, col, r) {
    const stories = ['crumbling', 'promises', 'heroes'], story = stories[Math.floor(r() * 3)], st = C.STORIES[story];
    const coa = col.pub ? 26000 + Math.round(r() * 16) * 500 + (5 - tier) * 1500 : 50000 + Math.round(r() * 30) * 500;
    const eq = Math.min(car.gender === 'w' ? 9.9 : 9, 4 + (5 - tier) * 1.2 + band + Math.round(r() * 2) * .5);
    // the new school's own buildings always beat yours (Q27 realism)
    const b = {}; SCHOOL.forEach(k => b[k] = Math.min(C.TIERS[tier].cap, Math.max(car.b[k] + 1 + band, Math.round(C.TIERS[tier].cap * (.35 + band * .15)))));
    return { gender: car.gender, college: col.id, story, type: 'sch', stars: 2, coa, eq, limit: car.gender === 'w' ? 9.9 : 9, pool: Math.round(eq * coa / 1000) * 1000,
      cash: Math.round((st.cash + (5 - tier) * 8000 + band * 4000) / 500) * 500, rating: TIER_RATING[tier] + band * 2 + Math.round(r() * 2), mix: [5, 6, 6, 5], tier, band, b };
  }
  C.declineOffers = () => { const car = C.car(); if (!car.offers || !car.offers.length) return; car.offers = []; car.loyal = (car.loyal || 0) + 1; C.acct().gold += 50; car.adConf = Math.min(100, (car.adConf ?? 50) + 5); car.cash += 5000; C.save(); };

  // ---------- the move (Q27) ----------
  let invite = [];
  C.inviteToggle = id => { const i = invite.indexOf(id); if (i >= 0) invite.splice(i, 1); else if (invite.length < 5) invite.push(id); else C.toast('Up to 5 players'); C.ui.refresh(); };
  C.followChance = (p, o) => C.clamp(.35 + (o.tier < C.car().tier ? .2 : .05) + (p.morale - 60) / 150 + (C.promiseKept(p) ? .05 : -.15) + (p.year === 1 ? .1 : 0), .1, .9);
  C.makeMove = idx => {
    const car = C.car(), o = car.offers[idx]; if (!o) return null; const r = C.rng(C.now() & 0xffffff), oldCol = car.college;
    const joined = [], declined = [];
    for (const id of invite) { const p = C.P(id); if (!p || p.year >= 4) continue; (r() < C.followChance(p, o) ? joined : declined).push(p); }
    if (C.portalOpen()) C.closePortalNow();
    // new school, same coach: program buildings, staff, Playbook and items come along
    car.college = o.college; car.tier = o.tier; car.band = o.band; car.homecoming = oldCol;
    car.job = { story: o.story, type: o.type, stars: o.stars, coa: o.coa, eq: o.eq, limit: o.limit, pool: o.pool, rating: o.rating, mix: o.mix };
    SCHOOL.forEach(k => car.b[k] = o.b[k]); car.queue = car.queue.filter(q => C.BUILDINGS[q.key].owner === 'program');
    car.cash += o.cash; car.adConf = 50; car.reclass = null; car.offers = []; car.best = 9; car.moves = (car.moves || 0) + 1;
    car.history = (car.history || []).concat([{ col: oldCol, seasons: car.season - (car.joinedSeason || 1) + 1, tier: car.tier }]); car.joinedSeason = car.season + 1;
    const sq = C.genSquad(car, C.now() & 0xffffff).slice(0, Math.max(16, C.rosterCap(car) - joined.length - 2));
    joined.forEach(p => { p.schol = p.schol ? Math.round(Math.min(o.coa * .6, p.schol / 1000 * o.coa / 30) / 500) * 500 : 0; p.from = C.COLLEGES[oldCol].short + ' (followed you)'; p.promise = p.promise || 'rotation'; p.morale = Math.min(100, p.morale + 10); p.ss = null; });
    car.squad = sq.concat(joined); car.captains = []; car.devq = []; car.tac = null; C.assignNumbers(car.squad);
    if (car.rec) { car.rec.list = []; car.rec.jobsUsed = 0; car.rec.portal = null; }
    car.season++; car.sea = null; car.seen = Object.assign({}, car.seen, { welcomeMove: 0 }); invite = [];
    C.ensureSeason(car); C.save(); C.applyTheme();
    return { joined, declined, col: C.COLLEGES[o.college] };
  };

  // ---------- the stay route (Q25b) ----------
  C.applyReclass = () => { const car = C.car(); if (!C.canReclass(car)) return false; car.reclass = { season: car.season + 1 }; C.save(); return true; };
  // called when a new season starts: finish a transition season by moving the college up
  C.reclassStep = car => { if (car.reclass && car.reclass.done) { car.tier--; car.band = 0; car.job.rating = TIER_RATING[car.tier]; car.job.eq = Math.min(car.gender === 'w' ? 9.9 : 9, car.job.eq + 1.5); car.job.pool = Math.round(car.job.eq * car.job.coa / 1000) * 1000; car.reclass = null; car.best = 9; return true; } return false; };
  C.isTransition = (car = C.car()) => !!(car.reclass && car.sea && car.reclass.season === car.sea.n);

  // ================= screens =================
  C.openOffers = () => C.ui.open('Job offers', () => {
    const car = C.car(), O = car.offers || [], col = C.college();
    if (!O.length) return `<p class="note">No offers this time. Reputation ${C.rep()} / 100 and program level ${C.programLevel()} decide who calls.</p>`;
    const cmp = (o) => SCHOOL.map(k => `<div class="cmpr"><span>${C.BUILDINGS[k].icon} ${C.BUILDINGS[k].name}</span><b>${car.b[k]}</b><em>→</em><b class="up">${o.b[k]}</b></div>`).join('');
    return `<div class="scenebn">${C.artSlot('handshake', C.sceneHandshake(col.c1, col.c2))}</div><div class="raytake"><span>📨</span><p><b>Reputation ${C.rep()} · program Lv ${C.programLevel()}</b>Your staff, Playbook and program buildings come with you. ${C.esc(col.short)}'s own buildings stay.</p></div>
      ${O.map((o, i) => { const c = C.COLLEGES[o.college]; return `<div class="card offc"><div class="jhead">${C.crestSVG(c.c1, c.c2, c.abbr.slice(0, 2), 48)}<div><b>${C.esc(c.full)}</b><small>${C.TIERS[o.tier].n} · ${C.TIERS[o.tier].name} · ${C.BANDS[o.band]} band</small></div></div>
        <div class="kgrid"><div class="k"><small>Squad</small><b>avg ${o.rating}</b></div><div class="k"><small>Scholarships</small><b>${C.short(o.pool)}/yr</b></div><div class="k"><small>Booster budget</small><b>${C.short(o.cash)}</b></div><div class="k"><small>Story</small><b>${C.esc(C.STORIES[o.story].title)}</b></div></div>
        <h3 class="jh">School buildings (yours → theirs)</h3>${cmp(o)}
        <button class="btn full pri" data-act="takeoffer" data-v="${i}" style="margin-top:10px">Take this job…</button></div>`; }).join('')}
      <button class="btn full sec2" data-act="declineoffers">Stay loyal to ${C.esc(col.short)} (◆ 50, 💵 5K, Director 🙂)</button>`;
  });
  C.openMove = idx => { invite = []; C.ui.open('Who comes with you?', () => {
    const car = C.car(), o = car.offers[idx], c = C.COLLEGES[o.college], cand = car.squad.filter(p => p.year < 4).sort((a, b) => b.rating - a.rating);
    return `<p class="note" style="margin-top:0">Invite up to 5 players to follow you to ${C.esc(c.short)} through the portal. Each decides for themselves. Seniors are graduating.</p>
      ${cand.map(p => { const on = invite.includes(p.id); return `<button class="pkrow ${on ? 'sel' : ''}" data-act="invite" data-v="${p.id}"><div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><small><span class="pchip" style="background:var(--school)">${p.pos}</span> ${['', 'Fr', 'So', 'Jr'][p.year]} · ${on ? '✔ Invited' : 'Likely: ' + Math.round(C.followChance(p, o) * 100) + '%'}</small></div><b class="pkr">${p.rating}</b></button>`; }).join('')}
      <button class="btn full pri" data-act="domove" data-v="${idx}" style="margin-top:12px">🚚 Move to ${C.esc(c.short)} (${invite.length} invited)</button>`; }); };

  // career panel for the AD office / season end
  C.careerCardHTML = () => {
    const car = C.car(), reqs = C.reclassReqs(car);
    return `<div class="card career"><div class="srow"><span>Tier</span><b>${C.tierLabel(car)}</b></div><div class="srow"><span>Reputation</span><b>${C.rep()} / 100</b></div><div class="srow"><span>Program level</span><b>${C.programLevel()}</b></div>${car.loyal ? `<div class="srow"><span>Loyalty</span><b>${'❤️'.repeat(Math.min(5, car.loyal))}</b></div>` : ''}
      ${car.tier > 1 ? `<h4 class="rch">Move ${C.esc(C.college().short)} up a division</h4>${reqs.map(r => `<div class="cr2 ${r[2] ? 'ok' : ''}">${r[2] ? '✔' : '○'} ${r[0]} ${r[1]}</div>`).join('')}
        ${car.reclass ? `<p class="note">${car.reclass.done ? '✔ Transition season complete: the step up happens when the next season starts.' : `🔁 Transition season ${car.reclass.season}: no postseason, then ${C.TIERS[car.tier - 1].n}.`}</p>` : `<button class="btn full ${C.canReclass() ? 'pri' : 'sec2'}" data-act="reclass" ${C.canReclass() ? '' : 'disabled'} style="margin-top:8px">Apply to reclassify</button>`}` : ''}</div>`;
  };
})(window.CFC);
