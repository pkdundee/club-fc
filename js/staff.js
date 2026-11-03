// Club FC: staff (Phase 6, Q21b–c, Q30). Assistant coaches as heroes: rarity, level 1–60, licence D→Pro, a trait (superpower),
// staff slots, a coaching market, Coaching Search draws with visible odds, and one-line advice cards on the screens they cover.
(function (C) {
  const H = 3.6e6;
  C.SPECS = {
    tac: ['🧠', 'Tactician', 'Match-day quality: attack, defence and passing'],
    dev: ['🏋️', 'Development coach', 'Faster training plans and match development'],
    snc: ['💪', 'Strength & conditioning', 'Freshness recovery, fewer injuries, less fatigue'],
    gk: ['🧤', 'Goalkeeper coach', 'Keeper performance and development'],
    rec: ['🔍', 'Recruiting coordinator', 'Sharper scouting, more applications, better offers'],
    mot: ['📣', 'Motivator', 'Morale and keeping players from the portal'],
    gen: ['🧢', 'Generalist', 'A little of everything']
  };
  const TRAITS = { tac: ['🧩', 'Game Reader', 'match quality'], dev: ['🚀', 'Fast Tracker', 'match development'], snc: ['🫁', 'Iron Lungs', 'less fatigue in matches'], gk: ['🧱', 'Wall Builder', 'keeper saves'],
    rec: ['🗣', 'Silver Tongue', 'offer appeal'], mot: ['📢', 'Hype Machine', 'morale after a win'], gen: ['☕', 'Old Hand', 'everything, a little'] };
  const PERS = ['Calm', 'Fiery', 'Joker', 'Old-school', 'Data nerd'];
  C.LICENCE = ['D', 'C', 'B', 'A', 'Pro'];
  const LV_CAP = [20, 30, 40, 50, 60];
  const ODDS = [35, 30, 20, 10, 5], SEARCH_GOLD = 100;
  C.STAFFSLOTS = [{ id: 'free', name: 'Free slot' }, { id: 'vip', name: "Coach's Club slot", why: "Join the Coach's Club" }, { id: 'iap', name: 'Extra staff slot', why: 'One-off purchase' }, { id: 'prog', name: 'Earned slot', why: "Coaches' Office Lv 8" }];
  C.staffSlotOpen = id => id === 'free' || (id === 'vip' && C.isVip()) || (id === 'iap' && C.acct().sslot3) || (id === 'prog' && C.level('hq') >= 8);

  // ---------- state ----------
  const st = () => { const car = C.car(); if (!car.staff) { car.staff = { list: [ray()], on: ['ray'], market: [], mNext: 0, items: { manual: 5, credits: 10, books: 2 } }; } return car.staff; };
  C.staffState = st;
  function ray() { return { id: 'ray', fn: 'Ray', ln: 'Sullivan', female: 0, age: 52, spec: 'gen', rar: 1, level: 5, lic: 1, trait: 1, xp: 0, pers: 'Old-school', look: { skin: '#efc4a4', hair: '#5a3b24', eyes: '#4b3621', style: 'sidepart', female: 0, beard: 'stubble', grey: .6 }, salary: 0 }; }
  C.coach = id => st().list.find(c => c.id === id);
  // every coach has a male and a female equivalent with identical stats, costs and specialities (round 5); only the name, portrait and pronouns change
  C.swapCoach = id => { const S = st(), c = S.list.find(x => x.id === id) || S.market.find(x => x.id === id) || (S.cands || []).find(x => x.id === id); if (!c) return;
    const f = c.female ? 0 : 1, P = C.POOLS.us, names = P[f ? 3 : 2].split(' '), h = [...(c.fn + c.ln)].reduce((a, ch) => a * 31 + ch.charCodeAt(0) >>> 0, 7);
    c.fn = c.id === 'ray' ? (f ? 'Rae' : 'Ray') : names[h % names.length]; c.female = f;
    const lk = C.makeLook(C.rng(h), 'us', !!f); c.look = Object.assign({}, c.look, { style: lk.style, female: f, beard: f ? undefined : c.look.beard || lk.beard });
    C.save(); };
  C.onStaff = () => st().on.map(C.coach).filter(Boolean);

  // ---------- generation ----------
  function genCoach(r, rar, spec) {
    const car = C.car(), female = r() < .5, pools = Object.keys(C.POOLS), pool = r() < .7 ? ['us', 'us_hisp', 'us_irish', 'us_ital', 'us_mw'][Math.floor(r() * 5)] : pools[Math.floor(r() * pools.length)], P = C.POOLS[pool];
    const pk = s => { const a = s.split(/[ |]/); return a[Math.floor(r() * a.length)]; };
    const look = C.makeLook(r, pool, female); look.grey = r() * .5; if (!female && r() < .35) look.beard = 'stubble';
    spec = spec || ['tac', 'dev', 'snc', 'gk', 'rec', 'mot'][Math.floor(r() * 6)];
    return { id: 'c' + Math.floor(r() * 1e9).toString(36), fn: pk(P[female ? 3 : 2]), ln: pk(P[4]).replace(/^OBrien$/, "O'Brien"), female: female ? 1 : 0, age: 28 + Math.floor(r() * 30), spec, rar, level: 1 + Math.floor(r() * 4) + rar * 2, lic: 0, trait: 1, xp: 0, pers: PERS[Math.floor(r() * 5)], look, flag: P[0] };
  }
  function pickRar(r, boost = 0) { const w = ODDS.map((v, i) => v * (i >= 2 ? 1 + boost : 1)), t = w.reduce((s, v) => s + v, 0); let x = r() * t; for (let i = 0; i < 5; i++) { x -= w[i]; if (x <= 0) return i; } return 0; }

  // ---------- quality and effects ----------
  C.coachQ = c => Math.min(100, 18 + c.rar * 12 + c.level * .6 + c.lic * 5);
  C.coachPower = c => Math.round(C.coachQ(c) * 10 + c.trait * 40);
  C.staffPower = () => C.onStaff().reduce((s, c) => s + C.coachPower(c), 0);
  // strength 0..1 of a specialism on staff (the generalist counts at 40%)
  C.staffF = spec => { let f = 0; for (const c of C.onStaff()) { const q = C.coachQ(c) / 100; if (c.spec === spec) f = Math.max(f, q * (1 + (c.trait - 1) * .08)); else if (c.spec === 'gen') f = Math.max(f, q * .4); } return f; };
  // what a coach would actually change, in real numbers (before → after)
  C.coachBenefit = c => {
    const q = C.coachQ(c) / 100 * (c.spec === 'gen' ? .4 : 1) * (1 + (c.trait - 1) * .08), mm = s => C.dur(s);
    const base = Math.round((1200 + 40 * 50) / (1 + C.level('training') * .03));
    return { tac: `Team match quality +${Math.round(4 * q * 10) / 10}%`, dev: `Training plans: ${mm(base)} → ${mm(Math.round(base / (1 + .25 * q)))}`, snc: `Resting a match: +30 → +${Math.round(30 * (1 + .3 * q))} Freshness`,
      gk: `Keeper saves +${Math.round(6 * q * 10) / 10}%`, rec: `Applications: ${3 + C.level('recruit')} → ${Math.round((3 + C.level('recruit')) * (1 + .3 * q) * 10) / 10} a day`, mot: `Portal risk −${Math.round(30 * q)}% · morale after wins +${Math.round(50 * q)}%`, gen: 'A little of everything (40% strength)' }[c.spec];
  };
  C.coachEffects = c => {
    const q = C.coachQ(c) / 100 * (c.spec === 'gen' ? .4 : 1), p = v => '+' + Math.round(v * 100) + '%', t = c.trait;
    const E = { tac: [`Match quality ${p(.04 * q)}`], dev: [`Training speed ${p(.25 * q)}`, `Match development ${p(.2 * q)}`], snc: [`Freshness recovery ${p(.3 * q)}`, `Injuries −${Math.round(30 * q)}%`, `Fatigue −${Math.round(8 * q)}%`],
      gk: [`Keeper performance ${p(.06 * q)}`], rec: [`Applications ${p(.3 * q)}`, `Offer appeal ${p(.08 * q)}`], mot: [`Morale gains ${p(.5 * q)}`, `Portal risk −${Math.round(30 * q)}%`] };
    return c.spec === 'gen' ? ['A little of everything (40% strength)'] : E[c.spec].concat([`${TRAITS[c.spec][0]} ${TRAITS[c.spec][1]} Lv ${t}: ${t > 1 ? '+' + (t - 1) * 8 + '% to all of the above' : 'upgrade with Trait Books for +8% a level'}`]);
  };

  // ---------- slots, hiring ----------
  C.staffSlots = () => C.STAFFSLOTS.filter(s => C.staffSlotOpen(s.id)).length;
  C.assign = id => { const S = st(); if (S.on.includes(id)) { S.on = S.on.filter(x => x !== id); C.save(); return true; } if (S.on.length >= C.staffSlots()) return 'full'; S.on.push(id); C.save(); return true; };
  C.hireCost = c => c.rar >= 3 ? { gold: c.rar === 3 ? 150 : 300 } : { cash: Math.round((2000 + c.rar * 3000 + c.level * 150) / 100) * 100 };
  C.refreshMarket = (force) => { const S = st(); if (!force && C.now() < S.mNext && S.market.length) return; const r = C.rng(C.now() & 0xffffff), hunt = C.pbv ? C.pbv('hunt') : 0;
    S.market = [0, 1, 2, 3].map(() => genCoach(r, pickRar(r, hunt * 3))); S.mNext = C.now() + 48 * H; S.mNew = true; C.save(); };
  C.hire = id => { const S = st(), c = S.market.find(x => x.id === id); if (!c) return false; const cost = C.hireCost(c), car = C.car();
    if (cost.gold && C.acct().gold < cost.gold) return 'gold'; if (cost.cash && car.cash < cost.cash) return 'cash';
    if (cost.gold) C.acct().gold -= cost.gold; if (cost.cash) car.cash -= cost.cash;
    S.market = S.market.filter(x => x !== c); S.list.push(c); if (S.on.length < C.staffSlots()) S.on.push(c.id); C.save(); return c; };
  C.releaseCoach = id => { const S = st(); if (id === 'ray' && S.list.length === 1) return false; S.list = S.list.filter(c => c.id !== id); S.on = S.on.filter(x => x !== id); C.save(); return true; };
  // Coaching Search: visible odds; a repeat specialism at the same rarity becomes Clinic Credits
  C.searchCost = () => st().freeUsed ? SEARCH_GOLD : 0;
  C.search = () => { const a = C.acct(), S = st(), cost = C.searchCost(); if (a.gold < cost) return 'gold'; a.gold -= cost; S.freeUsed = true; S.pity = (S.pity || 0) + 1;
    const r = C.rng((C.now() ^ Math.floor(Math.random() * 1e9)) & 0x7fffffff); let rar = pickRar(r); if (S.pity >= 10) rar = Math.max(2, rar); if (rar >= 2) S.pity = 0; const c = genCoach(r, rar);
    if (S.list.some(x => x.spec === c.spec && x.rar === c.rar)) { const n = 10 + c.rar * 10; S.items.credits += n; C.save(); return { dup: c, credits: n }; }
    S.list.push(c); if (S.on.length < C.staffSlots()) S.on.push(c.id); C.save(); return { coach: c }; };

  // ---------- upgrades: level (manuals), licence (credits), trait (books) ----------
  C.xpNeed = c => 100 + c.level * 20;
  C.giveXP = (c, n) => { c.xp += n; let up = 0; while (c.level < LV_CAP[c.lic] && c.xp >= C.xpNeed(c)) { c.xp -= C.xpNeed(c); c.level++; up++; } if (c.level >= LV_CAP[c.lic]) c.xp = Math.min(c.xp, C.xpNeed(c)); return up; };
  C.useManual = id => { const S = st(), c = C.coach(id); if (!S.items.manual) return 'none'; if (c.level >= LV_CAP[c.lic]) return 'cap'; S.items.manual--; const up = C.giveXP(c, 100); C.save(); return up; };
  C.licCost = c => ({ credits: [10, 25, 50, 100][c.lic], cash: [3000, 8000, 20000, 50000][c.lic] });
  C.licenceUp = id => { const S = st(), c = C.coach(id), car = C.car(); if (c.lic >= 4) return 'max'; if (c.level < LV_CAP[c.lic]) return 'level'; const k = C.licCost(c);
    if (S.items.credits < k.credits) return 'credits'; if (car.cash < k.cash) return 'cash'; S.items.credits -= k.credits; car.cash -= k.cash; c.lic++; C.save(); return true; };
  C.traitUp = id => { const S = st(), c = C.coach(id); if (c.trait >= 5) return 'max'; const need = c.trait; if (S.items.books < need) return 'books'; S.items.books -= need; c.trait++; C.save(); return true; };
  C.lvCap = c => LV_CAP[c.lic];
  // after every match: staff on duty learn, and the odd coaching manual turns up
  C.staffAfterMatch = win => { const S = st(), n = Math.round((25 + (win > 0 ? 15 : 0)) * (1 + (C.pbv ? C.pbv('cxp') : 0))), ups = [];
    C.onStaff().forEach(c => { const u = C.giveXP(c, n); if (u) ups.push(`${c.ln} reached Lv ${c.level}`); });
    if (Math.random() < .5) S.items.manual++; if (Math.random() < .15) S.items.books++; if (win > 0 && Math.random() < .3) S.items.credits += 5; return ups; };

  // ---------- advice cards (Q21b): one line, from the coach who covers that screen ----------
  C.advice = spec => {
    const c = C.onStaff().find(x => x.spec === spec) || C.onStaff().find(x => x.spec === 'gen'); if (!c) return '';
    const car = C.car(), sq = car.squad, t = car.tac || {}; let line = '';
    if (spec === 'tac') { const F = C.FORMATIONS[t.form || '4-3-3'], bad = (t.xi || []).map((id, i) => [C.P(id), F[i] && F[i][0]]).filter(([p, pos]) => p && pos && C.fit(p, pos) < 4);
      const f = C.myFixture && C.myFixture(), S = car.sea; line = bad.length ? `${bad[0][0].ln} is out of position at ${bad[0][1]}. Worth a look.` : f && S ? `Next up: ${S.teams[f.h === 0 ? f.a : f.h].name}. They play ${S.teams[f.h === 0 ? f.a : f.h].form}.` : 'The shape looks right to me.'; }
    if (spec === 'snc') { const tired = sq.filter(p => p.energy < 60).sort((a, b) => a.energy - b.energy); line = tired.length ? `Rest ${tired.slice(0, 2).map(p => p.ln).join(' and ')}: under 60% energy.` : 'Legs look fresh. Good time to play.'; }
    if (spec === 'rec') { const cnt = {}; sq.forEach(p => { const g = C.POSGROUP(p.pos); cnt[g] = (cnt[g] || 0) + 1; }); const need = [['gk', 2, 'goalkeeper'], ['def', 7, 'defender'], ['mid', 7, 'midfielder'], ['fwd', 4, 'forward']].find(([g, n]) => (cnt[g] || 0) < n);
      line = need ? `We're thin: we need another ${need[2]}.` : sq.length < C.rosterCap() ? `${C.rosterCap() - sq.length} roster spots open. Let's find quality, not numbers.` : 'Roster is full. Only sign someone who starts.'; }
    if (spec === 'mot') { const sad = sq.filter(p => p.morale < 50 || (p.promise && C.promiseKept && !C.promiseKept(p))); line = sad.length ? `${sad[0].fn} ${sad[0].ln} isn't happy${sad[0].promise ? ': we promised them minutes' : ''}.` : 'The locker room is in a good place.'; }
    if (spec === 'dev') { const y = sq.filter(p => p.year <= 2).sort((a, b) => (b.pot - b.rating) - (a.pot - a.rating))[0]; line = y ? `${y.fn} ${y.ln} has the most room to grow (${y.rating} → ${y.pot}). Train them.` : 'Everyone is close to their ceiling.'; }
    if (spec === 'gk') { const g = sq.filter(p => p.pos === 'GK').sort((a, b) => b.rating - a.rating)[0]; if (g) { const k = Object.keys(C.GKATTR).sort((a, b) => g.a[a] - g.a[b])[0]; line = `${g.ln}'s weakest area is ${C.GKATTR[k][1].toLowerCase()}. Train it.`; } }
    if (!line) return '';
    const tone = { Calm: '', Fiery: ' 🔥', Joker: ' 😄', 'Old-school': '', 'Data nerd': ' 📊' }[c.pers] || '';
    return `<div class="advice"><div class="advf">${C.coachFace(c)}</div><p><b>${C.esc(c.fn)} ${C.esc(c.ln)} · ${C.SPECS[c.spec][1]}</b>${C.esc(line)}${tone}</p></div>`;
  };

  C.coachFace = (c, vb = '24 12 72 72') => { const col = C.college(); return `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">${window.faceV4(Object.assign({}, c.look, { role: 'coach', age: c.age, k1: col.c1, k2: col.c2 }))}</svg>`; };

  // ================= Staff tab =================
  C.staffHTML = () => {
    const S = st(), col = C.college(), on = C.onStaff(); C.refreshMarket();
    const slots = C.STAFFSLOTS.map((s, i) => { const c = on[i]; if (c) return `<button class="sslot" data-act="coach" data-v="${c.id}" style="--rc:${C.RARITY[c.rar][1]}"><span class="sf">${C.coachFace(c)}</span><b>${C.SPECS[c.spec][0]}</b></button>`;
      return C.staffSlotOpen(s.id) ? `<button class="sslot free" data-act="toast" data-v="Hire or assign a coach"><span class="sf">➕</span><b>Free</b></button>` : `<button class="sslot lock" data-act="sslotinfo" data-v="${s.id}"><span class="sf">🔒</span><b>${s.id === 'vip' ? 'VIP' : s.id === 'iap' ? '$' : 'HQ 8'}</b></button>`; }).join('');
    // hero-style cards (round 4): background in the rarity colour, level badge, trait as a 5-star row, the coach's Power
    const card = c => `<button class="hcard" data-act="coach" data-v="${c.id}" style="--rc:${C.RARITY[c.rar][1]}"><span class="hlv">Lv.${c.level}</span>${S.on.includes(c.id) ? '<em class="hon">ON</em>' : ''}
        <div class="hpic">${C.coachFace(c)}</div><div class="hstars">${'★'.repeat(C.cStars ? C.cStars(c) : 1)}<i>${'★'.repeat(5 - (C.cStars ? C.cStars(c) : 1))}</i></div>
        <b>${C.esc(c.fn)} ${C.esc(c.ln)}</b><small>${C.SPECS[c.spec][0]} ${C.SPECS[c.spec][1]}</small><span class="hpow"><i class="ppi"></i>${C.coachPower(c).toLocaleString()}</span></button>`;
    const bench = S.list.filter(c => !S.on.includes(c.id));
    return `<div class="view scrolly"><div class="phdr sq"><div class="row1">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 38)}<div><b>Staff</b><small>🏅 Staff Power ${C.staffPower().toLocaleString()} · 📗 ${S.items.manual} · 🎫 ${S.items.credits} · 📕 ${S.items.books}</small></div></div><div class="res hres">${C.resBar()}</div>
        <div class="sslots">${slots}</div></div>
      ${C.car().seen.staffGuide ? '' : `<div class="card sguide"><b>How staff works</b><ol><li><b>Slots:</b> only coaches on duty help. You start with 1 slot.</li><li><b>Hire:</b> the market refreshes every 2 days; Coaching Search draws a random coach.</li><li><b>Upgrade:</b> manuals add XP, Clinic Credits raise the licence, Trait Books power up the trait.</li></ol><button class="btn sm2" data-act="sguide">Got it</button></div>`}
      ${(() => { const top = S.market.slice().sort((a, b) => b.rar - a.rar || b.level - a.level)[0]; return top ? `<button class="cotd" data-act="coach" data-v="${top.id}" style="--rc:${C.RARITY[top.rar][1]}"><div class="cf">${C.coachFace(top)}</div><div class="ci"><small>⭐ Coach of the day</small><b>${C.esc(top.fn)} ${C.esc(top.ln)}</b><em>${C.SPECS[top.spec][0]} ${C.SPECS[top.spec][1]} · <span class="rarp" style="background:${C.RARITY[top.rar][1]}">${C.RARITY[top.rar][0]}</span></em><p>${C.coachBenefit(top)}</p></div><span class="hirebtn">Hire · ${C.hireCost(top).gold ? C.GEM + ' ' + C.hireCost(top).gold : '💵 ' + C.short(C.hireCost(top).cash)}</span></button>` : ''; })()}
      <button class="searchc" data-act="search"><span>🎲</span><div><b>Coaching Search</b><p>Draw a random coach. Odds shown · Rare or better within ${10 - (S.pity || 0)} searches.</p></div><em>${C.searchCost() ? C.GEM + ' ' + C.searchCost() : 'FREE'}</em></button>
      <div class="stiles"><button class="stile pb" data-act="playbook"><span>📋</span><b>Playbook</b><small>${C.pbRunning()} researching · ${C.pbTotal()} levels</small></button>
        <button class="stile" data-act="market"><span>🧑‍🏫</span><b>Coaching market${S.mNew ? ' <i class="newdot">NEW</i>' : ''}</b><small>4 coaches · new in <span data-until="${S.mNext}">${C.dur((S.mNext - C.now()) / 1000)}</span></small></button>
</div>
      <h3 class="jh" style="padding:0 16px">On duty</h3><div class="hgrid">${on.map(card).join('')}</div>
      ${bench.length ? `<h3 class="jh" style="padding:0 16px">Not assigned</h3><div class="hgrid">${bench.map(card).join('')}</div>` : ''}
      <p class="note" style="padding:0 16px">Coaches and your Playbook belong to you: they move with you to every new job.</p></div>`;
  };

  // ---------- coach card ----------
  C.openCoach = id => C.ui.open('Coach', () => {
    const c = C.coach(id) || st().market.find(x => x.id === id); if (!c) return '<p class="note">Gone.</p>';
    const S = st(), hired = S.list.includes(c), on = S.on.includes(c.id), col = C.college(), cap = LV_CAP[c.lic], k = C.licCost(c);
    return `<div class="chero" style="background:radial-gradient(120% 90% at 50% 20%,${C.shade(C.RARITY[c.rar][1], .1)} 0%,${C.shade(C.RARITY[c.rar][1], -.45)} 100%)"><svg class="cport" viewBox="0 0 120 120">${window.faceV4(Object.assign({}, c.look, { role: 'coach', age: c.age, k1: col.c1, k2: col.c2 }))}</svg>
        <div class="nameplate"><b>${C.esc(c.fn)} ${C.esc(c.ln)}</b><div class="tags"><span class="lic big">${C.LICENCE[c.lic]} licence</span><span class="rarp" style="background:${C.RARITY[c.rar][1]}">${C.RARITY[c.rar][0]}</span></div><small class="hometown">${C.SPECS[c.spec][0]} ${C.SPECS[c.spec][1]} · ${c.pers} · age ${c.age}</small></div></div>
      <div class="kpis" style="margin-top:12px"><div class="kpi"><b>${c.level}</b><small>Level / ${cap}</small></div><div class="kpi"><b>${Math.round(C.coachQ(c))}</b><small>Quality</small></div><div class="kpi"><b>${TRAITS[c.spec][0]}${c.trait}</b><small>Trait</small></div><div class="kpi"><b>${C.LICENCE[c.lic]}</b><small>Licence</small></div></div>
      <button class="btn sm2 sec2" data-act="cswap" data-v="${c.id}" style="margin-top:10px">⇄ ${c.female ? 'Male' : 'Female'} equivalent · same stats</button>
      ${hired ? `<div class="card" style="margin-top:10px"><small class="mutey">XP ${c.xp} / ${C.xpNeed(c)}</small><div class="hbar"><i style="width:${Math.min(100, c.xp / C.xpNeed(c) * 100)}%;background:var(--school2)"></i></div></div>` : ''}
      ${hired && C.starsHTML ? C.starsHTML(c) : ''}<h3 class="jh">What they'd do for you</h3><div class="card"><div class="eff" style="color:var(--fit5)">▶ ${C.coachBenefit(c)}</div>${C.coachEffects(c).map(e => `<div class="eff">✔ ${e}</div>`).join('')}<p class="note" style="margin:6px 0 0">${C.SPECS[c.spec][2]}.</p></div>
      ${hired ? `<h3 class="jh">Upgrade</h3>
        <button class="lrow" data-act="cmanual" data-v="${c.id}"><span class="li">📗</span><span class="lt"><b>Coaching manual · +100 XP</b><small>${S.items.manual} owned${c.level >= cap ? ' · at the level cap: raise the licence' : ''}</small></span></button>
        <button class="lrow ${c.lic >= 4 ? 'lock' : ''}" data-act="clic" data-v="${c.id}"><span class="li">🎫</span><span class="lt"><b>${c.lic >= 4 ? 'Pro licence: top rank' : `Licence ${C.LICENCE[c.lic]} → ${C.LICENCE[c.lic + 1]} · level cap ${LV_CAP[c.lic + 1]}`}</b><small>${c.lic >= 4 ? '' : `Needs Lv ${cap} · 🎫 ${k.credits} Clinic Credits · 💵 ${C.short(k.cash)}`}</small></span></button>
        <button class="lrow ${c.trait >= 5 ? 'lock' : ''}" data-act="ctrait" data-v="${c.id}"><span class="li">📕</span><span class="lt"><b>${TRAITS[c.spec][1]} ${c.trait >= 5 ? 'Lv 5 (max)' : `Lv ${c.trait} → ${c.trait + 1}`}</b><small>${c.trait >= 5 ? '' : `📕 ${c.trait} Trait Book${c.trait > 1 ? 's' : ''} (${S.items.books} owned)`}</small></span></button>
        <div class="jbtns"><button class="btn ${on ? 'sec2' : 'pri'}" data-act="cassign" data-v="${c.id}">${on ? 'Take off duty' : 'Put on duty'}</button><button class="btn danger" data-act="crelease" data-v="${c.id}">Release</button></div>`
      : `<button class="btn full pri" data-act="chire" data-v="${c.id}">Hire · ${C.hireCost(c).gold ? '<i class="coin"></i> ' + C.hireCost(c).gold : '💵 ' + C.short(C.hireCost(c).cash)}</button>`}`;
  });
  C.openCoachMarket = () => { st().mNew = false; C.save(); C.ui.open('Coaching market', () => { const S = st(); C.refreshMarket();
    return `<p class="note" style="margin-top:0">New coaches every 2 days. Common to Rare cost Booster $; Super Rare and Ultra Rare cost Coins.</p>
      ${S.market.map(c => `<button class="ccard" data-act="coach" data-v="${c.id}" style="--rc:${C.RARITY[c.rar][1]}"><div class="cf">${C.coachFace(c)}</div><div class="ci"><b>${C.esc(c.fn)} ${C.esc(c.ln)}</b><small>${C.SPECS[c.spec][0]} ${C.SPECS[c.spec][1]} · ${c.pers}</small><div class="ctags"><span>Lv ${c.level}</span><span class="rarp" style="background:${C.RARITY[c.rar][1]}">${C.RARITY[c.rar][0]}</span></div></div><em class="price">${C.hireCost(c).gold ? '<i class="coin"></i> ' + C.hireCost(c).gold : '💵 ' + C.short(C.hireCost(c).cash)}</em></button>`).join('') || '<p class="note">Everyone has been hired. New coaches soon.</p>'}`; }); };
  // career start: choose your first assistant (Ray the generalist or one of two specialists)
  let afterPick = null;
  C.openFirstCoach = then => { const S = st(), r = C.rng(C.now() & 0xffffff), specs = ['dev', 'snc', 'tac', 'rec', 'mot', 'gk'].sort(() => r() - .5);
    S.cands = [S.list.find(c => c.id === 'ray') || ray(), genCoach(r, 1, specs[0]), genCoach(r, r() < .5 ? 1 : 0, specs[1])]; afterPick = then || null; C.save();
    C.ui.open('Your first assistant', () => `<p class="note" style="margin-top:0">Pick one assistant coach to start with. You can hire more later in the Staff tab.</p>
      ${st().cands.map(c => `<button class="ccard pick" data-act="firstcoach" data-v="${c.id}" style="--rc:${C.RARITY[c.rar][1]}"><div class="cf">${C.coachFace(c)}</div><div class="ci"><b>${C.esc(c.fn)} ${C.esc(c.ln)}</b><small>${C.SPECS[c.spec][0]} ${C.SPECS[c.spec][1]} · ${c.pers}, age ${c.age}</small><p class="ben">▶ ${C.coachBenefit(c)}</p><div class="ctags"><span>Lv ${c.level}</span><span class="rarp" style="background:${C.RARITY[c.rar][1]}">${C.RARITY[c.rar][0]}</span></div></div></button>`).join('')}`); };
  C.pickFirstCoach = id => { const S = st(), c = (S.cands || []).find(x => x.id === id); if (!c) return; S.list = [c]; S.on = [c.id];
    S.market = S.cands.filter(x => x !== c && x.id !== 'ray').concat(S.market).slice(0, 4); S.cands = null; C.save(); C.ui.closeAll(); const f = afterPick; afterPick = null; if (f) f(); };
  C.openSearch = () => C.ui.open('Coaching Search', () => `<div class="card"><b>Odds</b>${ODDS.map((o, i) => `<div class="srow"><span><span class="rarp" style="background:${C.RARITY[i][1]}">${C.RARITY[i][0]}</span></span><b>${o}%</b></div>`).join('')}<p class="note" style="margin:6px 0 0">A repeat (same specialism and rarity as a coach you have) becomes Clinic Credits instead.</p></div>
      <button class="btn full pri" data-act="dosearch" style="margin-top:12px">🎲 Search · ${C.searchCost() ? C.GEM + ' ' + C.searchCost() : 'FREE'}</button><p class="note">Rare or better guaranteed within ${10 - (st().pity || 0)} searches.</p><p class="note">You have <i class="coin"></i> ${C.acct().gold}.</p>`);
})(window.CFC);
