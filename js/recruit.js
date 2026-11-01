// Club FC: recruiting (Phase 4). Recruit routes, offer negotiation (Q6, Q7a) and the transfer portal window (Q7b).
(function (C) {
  const H = 3.6e6;
  const yrN = ['', 'Fr', 'So', 'Jr', 'Sr'];
  const SRC = { inbox: ['📨', 'Application'], camp: ['🏕', 'ID Camp'], jc: ['🚌', 'Junior college'], agency: ['🌍', 'Agency'], portal: ['🚪', 'Portal'] };
  C.ROLES = { starter: ['⭐', 'Starter', "You'll start for us."], rotation: ['🔄', 'Rotation', "You'll get real games."], squad: ['⏳', 'Squad', "Good squad: you'll earn your chance."], redshirt: ['🎽', 'Redshirt', 'Train for a year, keep all 4 seasons.'] };
  const ROLE_ORDER = ['redshirt', 'squad', 'rotation', 'starter'];
  const XI_SLOTS = { GK: 1, CB: 2, LB: 1, RB: 1, DM: 1, CM: 2, AM: 1, LM: 1, RM: 1, LW: 1, RW: 1, ST: 1 };
  const POSLIST = ['GK', 'CB', 'CB', 'LB', 'RB', 'DM', 'CM', 'CM', 'AM', 'LM', 'RM', 'LW', 'RW', 'ST', 'ST'];
  const KITS = [['#dc2626', '#fff'], ['#2563eb', '#fff'], ['#111827', '#facc15'], ['#16a34a', '#fff'], ['#7c3aed', '#fde68a'], ['#f8fafc', '#1e3a8a'], ['#ea580c', '#111827'], ['#0891b2', '#f8fafc']];
  const INTL = ['eng', 'ger', 'swe', 'esp', 'fra', 'bra', 'mex', 'yor', 'gha', 'jam', 'jpn', 'kor'];
  const JOB_VALUE = 4000, HOUSE_VALUE = 2500, SCOUT_CP = 10, AGENCY_GOLD = 60, PORTAL_DAYS = 3;
  C.REASONS = { up: ['📈', 'Moving up', 'Bigger programs are watching'], mins: ['⏱', 'Minutes', 'Wants more playing time'], promise: ['💔', 'Broken promise', 'Was promised a bigger role'], home: ['🏠', 'Homesick', 'Misses home'] };

  // ---------- state ----------
  const rec = () => { const car = C.car(); if (!car.rec) car.rec = { list: [], nextApp: C.now() - 2.5 * appEvery(), campReady: 0, jcNext: 0, jobsUsed: 0, signed: 0, portal: null, last: null }; return car.rec; };
  const appEvery = () => 24 * H / ((3 + C.level('recruit')) * (1 + C.pbv('apps') + C.staffF('rec') * .3));
  C.jobsCap = () => 2 + Math.floor(C.level('recruit') / 3) + Math.floor(C.pbv('jobs'));
  C.jobsLeft = () => Math.max(0, C.jobsCap() - rec().jobsUsed);
  C.campCost = () => Math.round((1500 + 300 * C.level('recruit')) / 100) * 100;
  const isJC = () => C.car().job.type === 'juco', isAcad = () => C.car().job.type === 'acad';
  C.R = id => rec().list.find(r => r.id === id);
  const round5 = v => Math.round(v / 5) * 5, floor5 = v => Math.floor(v / 5) * 5;
  const rivals = () => C.COLLEGES.filter(c => c.id !== C.car().college).map(c => c.short);

  // ---------- generation ----------
  function genRecruit(r, src, sub) {
    const car = C.car(), j = car.job, lvR = C.level('recruit');
    let year = 1, base = j.rating - 7 + r() * 10 + lvR * .6, rar = r() < .05 + lvR * .01 ? (r() < .2 ? 2 : 1) : 0, pool, from = '';
    if (src === 'camp') base += 2;
    if (src === 'jc') { year = 3; base += 4; }
    if (src === 'agency') { rar = r() < .3 ? 2 : 1; base += 3; pool = INTL[Math.floor(r() * INTL.length)]; }
    if (src === 'portal') {
      if (sub === 'down') { year = 2 + Math.floor(r() * 2); base = j.rating + 2 + r() * 6; from = `a ${C.TIERS[Math.max(1, car.tier - 1 - Math.floor(r() * 2))].n} program`; }
      else if (sub === 'grad') { year = 4; base = j.rating + 1 + r() * 5; from = 'a graduate transfer'; }
      else { year = 2 + Math.floor(r() * 2); base = j.rating - 2 + r() * 6; from = rivals()[Math.floor(r() * rivals().length)]; }
    }
    if (isJC() && year > 2) year = 2;
    const pos = POSLIST[Math.floor(r() * POSLIST.length)];
    const p = C.genPlayer(r, { gender: car.gender, pos, rating: Math.round(base), rar, year, pool });
    const rel = p.rating - j.rating;
    let ask = isAcad() ? C.clamp(.08 + rel * .01 + r() * .15, .05, .35) : C.clamp(.2 + rel * .035 + rar * .08 + r() * .15 + (year >= 3 ? .05 : 0), .05, 1);
    let want = year === 1 && rel < 2 ? 'squad' : rel >= 6 || sub === 'down' ? 'starter' : 'rotation';
    if (year >= 3 && want === 'squad') want = 'rotation';
    const kit = KITS[Math.floor(r() * KITS.length)];
    Object.assign(p, { src, from, ask, want, kit, u: r(), scouted: src === 'camp', interest: Math.round(40 + r() * 30 + C.level('dorms') + (src === 'camp' ? 10 : 0)), deal: { round: 0, last: null, low: 0 } });
    const t = C.now();
    if (src === 'inbox') p.exp = t + 48 * H;
    if (src === 'camp' || src === 'agency') p.exp = t + 72 * H;
    if (r() < (src === 'portal' ? .6 : .35)) { p.rival = { c: rivals()[Math.floor(r() * rivals().length)], end: t + (4 + r() * 16) * H }; p.ask = Math.min(1, p.ask + .08); }
    return p;
  }
  const newRng = () => C.rng((C.now() ^ Math.floor(Math.random() * 1e9)) & 0x7fffffff);

  // ---------- clock: new applications, expiries, rivals, the JC list, the portal closing ----------
  // Returns { changed, msgs } so the clock can redraw and toast.
  C.tickRecruit = () => {
    const car = C.car(); if (!car || !car.squad) return { changed: false, msgs: [] };
    const R = rec(), t = C.now(), msgs = []; let changed = false, apps = 0;
    const inbox = () => R.list.filter(x => x.src === 'inbox').length;
    while (t >= R.nextApp) { if (inbox() < 8) { R.list.push(genRecruit(newRng(), 'inbox')); apps++; } R.nextApp += appEvery(); if (inbox() >= 8) R.nextApp = Math.max(R.nextApp, t + appEvery()); }
    if (apps) { changed = true; msgs.push(apps > 1 ? `📨 ${apps} new applications` : '📨 New application'); }
    if (!isJC() && t >= R.jcNext) { R.list = R.list.filter(x => x.src !== 'jc' || x.deal.round > 0); const r = newRng(); for (let i = 0; i < 4; i++) R.list.push(genRecruit(r, 'jc')); R.jcNext = t + 24 * H; changed = true; }
    for (const x of [...R.list]) {
      if (x.rival && x.rival.end <= t) { msgs.push(`❌ ${x.fn} ${x.ln} committed to ${x.rival.c}`); drop(x.id); changed = true; }
      else if (x.exp && x.exp <= t) { drop(x.id); changed = true; }
    }
    if (R.portal && R.portal.end <= t) { msgs.push(closePortal()); changed = true; }
    if (changed) C.save();
    return { changed, msgs };
  };
  const drop = id => { const R = rec(); R.list = R.list.filter(x => x.id !== id); };

  // ---------- scouting: a range until scouted (Recruiting Office narrows it) ----------
  const fuzz = () => Math.max(1, 4 - Math.floor(C.level("recruit") / 3) - (C.staffF('rec') > .5 ? 1 : 0));
  const ratingTxt = x => { if (x.scouted) return String(x.rating); const w = fuzz(), lo = x.rating - Math.round(x.u * 2 * w); return `${lo}–${lo + 2 * w}`; };
  const attrTxt = (x, v) => x.scouted ? v : '~' + round5(v);
  C.scout = id => { const car = C.car(), x = C.R(id); if (!x || x.scouted) return false; if (car.cp < SCOUT_CP) return 'cp'; car.cp -= SCOUT_CP; x.scouted = true; C.save(); return true; };

  // ---------- face in their own high-school / club kit ----------
  const rface = (x, vb = '24 12 72 72') => `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">${window.faceV4(Object.assign({}, x.look, { k1: x.kit[0], k2: x.kit[1] }))}</svg>`;

  // ---------- depth chart credibility (Q7a) ----------
  const better = x => C.squad().filter(p => C.fit(p, x.pos) >= 4 && p.rating > x.rating).length;
  const credible = (x, role) => role === 'starter' ? better(x) < XI_SLOTS[x.pos] : role === 'rotation' ? better(x) < XI_SLOTS[x.pos] + 3 : true;

  // ---------- the offer ----------
  const aidOK = x => x.gpa >= 3.3;
  const aidAmt = x => Math.round(C.car().job.coa * (.15 + (x.gpa - 3.3) / .7 * .2 + C.level('academic') * .01) * (1 + C.pbv('aid')) / 500) * 500;
  C.maxPct = () => isAcad() ? 0 : Math.min(100, floor5(C.poolLeft() / C.car().job.coa * 100));
  function calc(x, o) {
    const coa = C.car().job.coa, schol = o.pct / 100 * coa;
    const val = schol + (o.job ? JOB_VALUE : 0) + (o.aid ? aidAmt(x) : 0) + (o.house ? HOUSE_VALUE : 0) + (o.raise ? .05 * coa : 0);
    const askAmt = x.ask * coa, cover = askAmt ? val / askAmt : 1.2;
    const diff = ROLE_ORDER.indexOf(o.role) - ROLE_ORDER.indexOf(x.want);
    let role = diff >= 0 ? .08 + (o.role === 'starter' ? .1 : 0) : -.15 * -diff, warn = '';
    if (!credible(x, o.role)) { role = Math.min(role, o.role === 'starter' ? .02 : -.05); warn = `${better(x)} better ${x.pos}${better(x) > 1 ? 's' : ''} on your roster: less convincing.`; }
    if (o.role === 'redshirt' && x.year >= 2) { role = -.35; warn = 'Upperclassmen hate sitting out a season.'; }
    const appeal = C.level('dorms') * .008 + C.level('stadium') * .004 + (x.interest - 50) / 400 + C.pbv('pitch') + C.staffF('rec') * .08;
    const happy = Math.min(cover, 1.25) * .85 + role + appeal;
    return { val, schol, askAmt, happy, warn, coa };
  }
  const mood = h => h >= 1 ? ['😀', '#16a34a', 'Ready to sign'] : h >= .8 ? ['🙂', '#84cc16', 'Close'] : h >= .6 ? ['😐', '#eab308', 'Not there yet'] : ['😟', '#f97316', 'Well short'];

  let O = null; // the offer being built: {id, pct, job, aid, house, raise, role}
  C.openRecruit = id => C.ui.open('Recruit', () => profileHTML(id));
  C.openOffer = id => { const x = C.R(id); if (!x) return;
    O = x.offer ? Object.assign({}, x.offer) : { id, pct: Math.min(C.maxPct(), round5(x.ask * 60)), job: false, aid: false, house: false, raise: false, role: x.want };
    O.pct = Math.min(O.pct, C.maxPct()); if (O.job && !C.jobsLeft()) O.job = false;
    C.ui.open('Make an offer', offerHTML); };
  C.offerSet = (k, v) => { if (!O) return; const x = C.R(O.id);
    if (k === 'role') O.role = v;
    else if (k === 'job' && !O.job && !C.jobsLeft()) return C.toast('No campus jobs left this season');
    else if (k === 'aid' && !aidOK(x)) return C.toast('Academic aid needs a GPA of 3.3 or more');
    else if (k === 'house' && !O.house && C.car().cash < HOUSE_VALUE) return C.toast('Not enough Booster $');
    else O[k] = !O[k];
    x.offer = Object.assign({}, O); C.ui.refresh(); };

  function poolBar(thisAmt) {
    const j = C.car().job, used = C.committed(), w = v => Math.max(0, Math.min(100, v / j.pool * 100)).toFixed(1) + '%';
    return `<div class="poolbar"><i class="u" style="width:${w(used)}"></i><i class="t" style="width:${w(thisAmt)}"></i></div>
      <div class="poolkey"><span><i class="u"></i>Used ${C.short(used)}</span><span><i class="t"></i>This offer <b id="oThis">${C.short(thisAmt)}</b></span><span>Left <b id="oLeft">${C.short(Math.max(0, j.pool - used - thisAmt))}</b></span></div>`;
  }

  function offerHTML() {
    const x = C.R(O.id); if (!x) return '<p class="note">This recruit is no longer available.</p>';
    const car = C.car(), c = calc(x, O), m = mood(c.happy), full = car.squad.length >= C.rosterCap(), maxP = C.maxPct();
    const chip = (k, icon, label, sub, ok) => `<button class="xchip ${O[k] ? 'on' : ''} ${ok ? '' : 'off'}" data-act="oset" data-v="${k}"><span>${icon}</span><b>${label}</b><small>${sub}</small></button>`;
    const reply = x.deal.last ? `<div class="reply ${x.deal.last.k}"><span>${x.deal.last.e}</span><p>${C.esc(x.deal.last.t)}</p></div>` : '';
    return `<div class="ohead"><div class="relface">${rface(x)}</div><div style="flex:1"><b>${C.esc(x.fn)} ${C.esc(x.ln)}</b><small>${x.pos} · ${yrN[x.year]} · ${ratingTxt(x)}${x.rival ? ` · ⚔ ${C.esc(x.rival.c)} <span data-until="${x.rival.end}">${C.dur((x.rival.end - C.now()) / 1000)}</span>` : ''}</small></div>
        <div class="rounds">${[0, 1, 2].map(i => `<i class="${i < x.deal.round ? 'used' : i === x.deal.round ? 'now' : ''}"></i>`).join('')}<small>Round ${Math.min(3, x.deal.round + 1)} of 3</small></div></div>
      ${reply}
      <div class="card happy"><div class="hrow"><span class="he" id="oMoodE">${m[0]}</span><div style="flex:1"><small>Family happy · hopes for ${Math.round(x.ask * 100)}% (${C.short(c.askAmt)})</small>
        <div class="hbar"><i id="oMood" style="width:${Math.min(100, c.happy * 100).toFixed(0)}%;background:${m[1]}"></i><em></em></div></div></div>
        <div class="covered"><b id="oVal">${C.money(c.val)}</b> of ${C.money(c.coa)} covered</div></div>
      <h3 class="jh">🎓 Scholarship <b class="opct" id="oPctTxt">${O.pct}%</b></h3>
      ${isAcad() ? '<p class="note" style="margin-top:0">Academic colleges give no athletic scholarships. Use aid, a campus job and the role.</p>'
        : `<input type="range" class="slider" id="oPct" min="0" max="${maxP}" step="5" value="${O.pct}" ${maxP ? '' : 'disabled'}>${poolBar(c.schol)}`}
      <h3 class="jh">Extras</h3>
      <div class="xchips">${chip('job', '💼', 'Campus job', `${C.jobsLeft()} left · ${C.short(JOB_VALUE)}/yr`, C.jobsLeft() || O.job)}
        ${chip('aid', '📚', 'Academic aid', aidOK(x) ? `${C.short(aidAmt(x))} · college pays` : `Needs GPA 3.3 (${x.gpa})`, aidOK(x))}
        ${chip('house', '🏠', 'Housing help', `💵 ${C.short(HOUSE_VALUE)} once`, car.cash >= HOUSE_VALUE || O.house)}
        ${chip('raise', '📈', 'More next year', '+10% if they perform', !isAcad())}</div>
      <h3 class="jh">Role pitch <small class="devp">wants ${C.ROLES[x.want][0]} ${C.ROLES[x.want][1]}</small></h3>
      <div class="rolepick">${ROLE_ORDER.slice().reverse().map(k => `<button class="${O.role === k ? 'on' : ''}" data-act="orole" data-v="${k}"><span>${C.ROLES[k][0]}</span>${C.ROLES[k][1]}</button>`).join('')}</div>
      <p class="pitch">“${C.ROLES[O.role][2]}”${c.warn ? `<br><b class="warn">⚠ ${C.esc(c.warn)}</b>` : ''}</p>
      ${full ? `<p class="note" style="color:#b91c1c">👕 Roster full (${car.squad.length}/${C.rosterCap()}). Upgrade the Dorms or release a player first.</p>` : ''}
      <button class="btn full pri" data-act="osend" ${full ? 'disabled' : ''}>✉️ Send offer</button>
      <p class="note">Promises are tracked. A broken one hurts morale and can send a player to the transfer portal. <button class="hlink" data-act="help" data-v="offers">?</button></p>`;
  }
  // live slider: update numbers without redrawing the sheet
  document.addEventListener('input', e => {
    if (e.target.id !== 'oPct' || !O) return; const x = C.R(O.id); if (!x) return;
    O.pct = +e.target.value; x.offer = Object.assign({}, O);
    const c = calc(x, O), m = mood(c.happy), j = C.car().job, set = (id, v) => { const n = C.$('#' + id); if (n) n.textContent = v; };
    set('oPctTxt', O.pct + '%'); set('oVal', C.money(c.val)); set('oThis', C.short(c.schol)); set('oLeft', C.short(Math.max(0, j.pool - C.committed() - c.schol))); set('oMoodE', m[0]);
    const b = C.$('#oMood'); if (b) { b.style.width = Math.min(100, c.happy * 100).toFixed(0) + '%'; b.style.background = m[1]; }
    const t = C.$('.poolbar .t'); if (t) t.style.width = Math.min(100, c.schol / j.pool * 100).toFixed(1) + '%';
  });

  // The family's reply: accept, counter, or walk away (Q6)
  C.sendOffer = () => {
    const x = C.R(O.id); if (!x) return; const car = C.car();
    if (car.squad.length >= C.rosterCap()) return C.toast('Roster is full');
    const c = calc(x, O), d = x.deal; d.round++;
    if (c.happy >= 1) return sign(x, O);
    const walk = () => { const where = x.rival ? x.rival.c : rivals()[Math.floor(Math.random() * rivals().length)]; drop(x.id); C.save(); C.ui.closeAll(); C.render(); C.toast(`❌ ${x.fn} ${x.ln} committed to ${where}`); };
    if (c.happy < .6) { x.interest -= 15; if (d.low || d.round >= 3) return walk(); d.low = 1; d.last = { k: 'bad', e: '😠', t: "That's a long way short of what we need." }; C.save(); return C.ui.refresh(); }
    if (d.round >= 3) return walk();
    const needPct = Math.ceil((O.pct + (1 - c.happy) / .85 * x.ask * 100 + .01) / 5) * 5;
    let t;
    if (!isAcad() && needPct <= C.maxPct() && needPct - O.pct <= 25) t = `Could you do ${needPct}%?`;
    else if (!O.job && C.jobsLeft()) t = 'A campus job would really help us.';
    else if (ROLE_ORDER.indexOf(O.role) < ROLE_ORDER.indexOf(x.want)) t = `${x.fn} wants to hear they'll get games.`;
    else if (!O.house && car.cash >= HOUSE_VALUE) t = 'Any help with housing?';
    else t = 'Can you find a little more?';
    d.last = { k: 'mid', e: '🤔', t }; C.save(); C.ui.refresh();
  };

  function sign(x, o) {
    const car = C.car(), R = rec(), c = calc(x, o);
    const p = Object.assign({}, x); ['src', 'ask', 'want', 'kit', 'u', 'scouted', 'interest', 'deal', 'offer', 'rival', 'exp'].forEach(k => delete p[k]);
    p.schol = Math.round(c.schol / 500) * 500; p.acad = !!o.aid; p.cjob = !!o.job; p.house = !!o.house; p.raise = o.raise ? .1 : 0; p.promise = o.role; p.rs = o.role === 'redshirt'; p.from = x.from || SRC[x.src][1];
    p.morale = 75; p.num = 0;
    if (o.job) R.jobsUsed++; if (o.house) car.cash -= HOUSE_VALUE;
    car.squad.push(p); C.assignNumbers(car.squad); drop(x.id); R.signed++; O = null; C.save();
    C.ui.closeAll(); C.render(); const col = C.college();
    C.ui.open('Signed!', () => `<div class="scenebn">${C.artSlot('signing', C.sceneSigning(col.c1, col.c2, p.num))}</div><div class="collegecard" style="margin-top:12px"><div class="relface">${C.faceOf(p)}</div><div><b style="font-size:18px">${C.esc(p.fn)} ${C.esc(p.ln)}</b><br><small class="mutey">${p.pos} · No. ${p.num} · ${p.schol ? Math.round(p.schol / C.car().job.coa * 100) + '% scholarship' : p.acad ? 'academic aid' : 'walk-on'}${p.cjob ? ' + 💼' : ''}</small></div></div>
      <button class="btn full pri" data-act="player" data-v="${p.id}" style="margin-top:14px">See player card</button>`);
  }

  // ---------- routes ----------
  C.runCamp = () => { const car = C.car(), R = rec(); if (C.now() < R.campReady) return 'wait'; if (car.cash < C.campCost()) return 'cash';
    car.cash -= C.campCost(); R.campReady = C.now() + 8 * H; const r = newRng(); R.list = R.list.filter(x => x.src !== 'camp' || x.deal.round > 0);
    for (let i = 0; i < 3; i++) R.list.push(genRecruit(r, 'camp')); C.save(); return true; };
  const agencyGold = () => Math.round(AGENCY_GOLD * (1 - Math.min(.5, C.pbv('agency'))));
  C.hireAgency = () => { const a = C.acct(); if (a.gold < agencyGold()) return 'gold'; a.gold -= agencyGold(); rec().list.push(genRecruit(newRng(), 'agency')); C.save(); return true; };
  C.passRecruit = id => { drop(id); C.save(); };
  C.appsNow = () => { const R = rec(); R.nextApp = C.now() - 3 * appEvery(); };

  // ---------- transfer portal (Q7b) ----------
  C.portalOpen = () => { const p = C.car() && rec().portal; return p && p.end > C.now() ? p : null; };
  C.openPortalWindow = () => {
    const car = C.car(), R = rec(); if (C.portalOpen()) return false;
    const roles = C.roles(), top = [...car.squad].sort((a, b) => b.rating - a.rating).slice(0, 3).map(p => p.id), risk = {}, r = newRng();
    for (const p of car.squad) {
      if (p.year >= 4) continue;
      const opts = [];
      if (car.tier >= 3 && top.includes(p.id)) opts.push(['up', car.tier === 5 ? .5 : .35]);
      if (!C.promiseKept(p, roles[p.id])) opts.push(['promise', p.promise === 'starter' ? .6 : .5]);
      const apps = p.ss ? p.ss.apps : 0, games = car.sea ? car.sea.fx.filter(f => (f.h === 0 || f.a === 0) && f.hs != null).length : 0;
      if ((games >= 5 ? apps / games < .3 : roles[p.id] === 'res') && p.year >= 2 && p.morale < 75) opts.push(['mins', .35]);
      if (r() < .03) opts.push(['home', .45]);
      if (!opts.length) continue;
      const [why, ch] = opts.sort((a, b) => b[1] - a[1])[0];
      risk[p.id] = { why, chance: C.clamp((ch + (60 - p.morale) / 200 - (car.captains.includes(p.id) ? .1 : 0)) * (1 - C.staffF('mot') * .3), .05, .9), done: [] };
    }
    R.list = R.list.filter(x => x.src !== 'portal');
    ['down', 'down', 'down', 'side', 'side', 'grad'].forEach(s => { const x = genRecruit(r, 'portal', s); R.list.push(x); });
    R.portal = { start: C.now(), end: C.now() + PORTAL_DAYS * 24 * H, risk };
    R.list.filter(x => x.src === 'portal').forEach(x => { x.exp = R.portal.end; if (x.rival) x.rival.end = Math.min(x.rival.end, R.portal.end); });
    C.save(); return true;
  };
  C.keepOption = (pid, k) => {
    const car = C.car(), P = C.portalOpen(), k0 = P && P.risk[pid], p = C.P(pid); if (!k0 || k0.done.includes(k)) return false;
    if (k === 'raise') { const add = Math.round(car.job.coa * .1 / 500) * 500; if (isAcad() || C.poolLeft() < add) return 'pool'; p.schol += add; k0.chance *= k0.why === 'up' ? .6 : .55; }
    if (k === 'nil') { const cost = nilCost(); if (car.cash < cost) return 'cash'; car.cash -= cost; k0.chance *= k0.why === 'up' ? .55 : .7; }
    if (k === 'role') { p.promise = 'starter'; k0.chance *= k0.why === 'up' ? .8 : .45; }
    k0.done.push(k); p.morale = Math.min(100, p.morale + 6); C.save(); return true;
  };
  const nilCost = () => 1000 * (8 - C.car().tier);
  C.letGo = pid => { const P = C.portalOpen(); if (!P) return; leave(pid); delete P.risk[pid]; C.save(); };
  function leave(pid) { const car = C.car(); car.squad = car.squad.filter(p => p.id !== pid); car.captains = car.captains.filter(x => x !== pid); car.devq = car.devq.filter(q => q.pid !== pid); }
  function closePortal() {
    const car = C.car(), R = rec(), P = R.portal, r = newRng(), left = [], stayed = [];
    for (const pid in P.risk) { const p = C.P(pid); if (!p) continue; const k = P.risk[pid];
      if (r() < k.chance) { left.push([p.fn + ' ' + p.ln, k.why, k.why === 'up' ? `a ${C.TIERS[Math.max(1, car.tier - 1 - Math.floor(r() * 2))].n} program` : rivals()[Math.floor(r() * rivals().length)]]); leave(pid); }
      else stayed.push(p.fn + ' ' + p.ln); }
    R.list = R.list.filter(x => x.src !== 'portal');
    R.last = { at: C.now(), left, stayed }; R.portal = null; R.jobsUsed = 0;
    return `🚪 Transfer window closed: ${left.length} left, ${stayed.length} stayed`;
  }
  C.closePortalNow = () => { const R = rec(); if (!R.portal) return null; return closePortal(); };

  // ================= Recruit tab =================
  let route = 'inbox';
  C.setRoute = v => { route = v; C.render(); };
  C.recruitHTML = () => {
    const car = C.car(), R = rec(), col = C.college(), t = C.now(), P = C.portalOpen();
    const count = s => R.list.filter(x => x.src === s).length;
    const tile = (k, icon, name, sub, n, cls = '') => `<button class="rtile ${route === k ? 'on' : ''} ${cls}" data-act="rroute" data-v="${k}"><span class="ri">${icon}</span><b>${name}</b><small>${sub}</small>${n ? `<em>${n}</em>` : ''}</button>`;
    const tiles = [
      tile('inbox', '📨', 'Applications', count('inbox') >= 8 ? 'Inbox full' : `Next <span data-until="${R.nextApp}">${C.dur((R.nextApp - t) / 1000)}</span>`, count('inbox')),
      tile('camp', '🏕', 'ID Camp', t < R.campReady ? `Ready in <span data-until="${R.campReady}">${C.dur((R.campReady - t) / 1000)}</span>` : `Run · 💵 ${C.short(C.campCost())}`, count('camp')),
      isJC() ? tile('agency', '🌍', 'Agency scout', `◆ ${agencyGold()} a recruit`, count('agency')) : tile('jc', '🚌', 'JC transfers', `New in <span data-until="${R.jcNext}">${C.dur((R.jcNext - t) / 1000)}</span>`, count('jc')),
      isJC() ? '' : tile('agency', '🌍', 'Agency scout', `◆ ${agencyGold()} a recruit`, count('agency')),
      tile('portal', '🚪', 'Transfer portal', P ? `Open · closes in <span data-until="${P.end}">${C.dur((P.end - t) / 1000)}</span>` : 'Opens after the season', P ? count('portal') : 0, 'wide ' + (P ? 'live' : ''))
    ].join('');
    let body = '';
    if (route === 'camp') body = `<button class="btn full pri" data-act="camp" ${t < R.campReady ? 'disabled' : ''} style="margin:10px 16px 0;width:calc(100% - 32px)">${t < R.campReady ? '🏕 Next camp in ' + C.dur((R.campReady - t) / 1000) : `🏕 Run an ID Camp · 💵 ${C.short(C.campCost())}`}</button><p class="note" style="padding:0 16px">3 players attend. You see them play, so their ratings are exact.</p>`;
    if (route === 'agency') body = `<button class="btn full pri" data-act="agency" style="margin:10px 16px 0;width:calc(100% - 32px)">🌍 Hire an agency scout · ◆ ${agencyGold()}</button><p class="note" style="padding:0 16px">One international recruit, Uncommon or better.</p>`;
    if (route === 'jc') body = `<p class="note" style="padding:0 16px">Juniors from two-year colleges: ready now, with 2 seasons left.</p>`;
    if (route === 'portal') body = portalHTML(P, R);
    const list = R.list.filter(x => x.src === route).sort((a, b) => (b.rival ? 1 : 0) - (a.rival ? 1 : 0) || b.rating - a.rating);
    const cards = list.map(x => `<button class="prow rc" style="--mk:${C.RARITY[x.rar][1]}" data-act="recruit" data-v="${x.id}">
        <div class="av"><div class="face" style="inset:2px">${rface(x)}</div></div>
        <div class="pinfo"><b>${C.esc(x.fn)} ${C.esc(x.ln)} <small class="flag">${x.flag}</small></b>
          <div class="tags"><span class="pos ${C.POSGROUP(x.pos)}">${x.pos}</span><span class="yr">${C.yrIcon(x.year)}${yrN[x.year]}</span><span class="sch">${C.ROLES[x.want][0]} ${isAcad() ? '' : '🎓 ' + Math.round(x.ask * 100) + '%'}</span>
          ${x.rival ? `<span class="rv">⚔ <span data-until="${x.rival.end}">${C.dur((x.rival.end - t) / 1000)}</span></span>` : ''}${x.deal.round ? `<span class="rdeal">R${x.deal.round}</span>` : ''}</div></div>
        <div class="rate"><b class="${x.scouted ? '' : 'fz'}">${ratingTxt(x)}</b><small>${x.scouted ? 'Rating' : '🔍 Range'}</small></div></button>`).join('');
    const empty = route !== 'portal' || P ? `<p class="note" style="padding:0 16px;text-align:center">${{ inbox: 'No applications right now. New ones arrive through the day.', camp: 'Run a camp to see new players.', jc: 'No transfers listed.', agency: 'Hire a scout to find an international player.', portal: 'Nobody left in the portal.' }[route]}</p>` : '';
    return `<div class="view scrolly">
      <div class="phdr sq"><div class="row1">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 38)}<div><b>Recruiting</b><small>👕 ${car.squad.length}/${C.rosterCap()} · 🎓 ${C.short(C.poolLeft())} left · 💼 ${C.jobsLeft()} jobs</small></div><button class="hlink" style="margin-left:auto" data-act="help" data-v="offers">?</button></div></div>
      <div style="padding:0 16px">${C.advice('rec')}</div><div class="rtiles">${tiles}</div>${body}${cards || empty}</div>`;
  };

  function portalHTML(P, R) {
    if (!P) return `<div class="card portalc"><b>🚪 The portal is closed</b><p>It opens for ${PORTAL_DAYS} days after every season. Players can only move then.</p>${R.last ? lastHTML(R.last) : ''}<small class="mutey">It opens automatically when the season ends (or from Settings for testing).</small></div>`;
    const ids = Object.keys(P.risk).filter(id => C.P(id));
    const lvl = c => c >= .45 ? ['High', '#dc2626'] : c >= .25 ? ['Medium', '#f59e0b'] : ['Low', '#16a34a'];
    const rows = ids.map(id => { const p = C.P(id), k = P.risk[id], L = lvl(k.chance), why = C.REASONS[k.why];
      return `<button class="prow risk" style="--mk:${L[1]}" data-act="keep" data-v="${id}"><div class="av"><div class="face" style="inset:2px">${C.faceOf(p)}</div></div>
        <div class="pinfo"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><div class="tags"><span class="pos ${C.POSGROUP(p.pos)}">${p.pos}</span><span class="sch">${why[0]} ${why[2]}</span></div></div>
        <div class="rate"><b style="color:${L[1]};font-size:16px">${L[0]}</b><small>Risk</small></div></button>`; }).join('');
    return `<div class="raytake" style="margin:10px 16px 0"><span>🚪</span><p><b>Staff report</b>${ids.length ? `${ids.length} of ours might leave. Tap one to try to keep them.` : 'Nobody looks likely to leave.'} Below them: players from other programs.</p></div>
      ${rows ? `<h3 class="jh" style="padding:0 16px">Might leave</h3>${rows}` : ''}<h3 class="jh" style="padding:0 16px">In the portal</h3>`;
  }
  const lastHTML = L => `<div class="lastwin"><b>Last window</b>${L.left.map(l => `<div>🚪 ${C.esc(l[0])} left · ${C.REASONS[l[1]][0]} → ${C.esc(l[2])}</div>`).join('')}${L.stayed.map(s => `<div>✔ ${C.esc(s)} stayed</div>`).join('')}${!L.left.length && !L.stayed.length ? '<div>No movement</div>' : ''}</div>`;

  // ---------- keep a player (portal) ----------
  C.openKeep = pid => C.ui.open('Keep a player', () => {
    const P = C.portalOpen(), p = C.P(pid), k = P && P.risk[pid]; if (!k || !p) return '<p class="note">The window has closed.</p>';
    const why = C.REASONS[k.why], add = Math.round(C.car().job.coa * .1 / 500) * 500;
    const opt = (key, icon, label, sub) => `<button class="lrow ${k.done.includes(key) ? 'lock' : ''}" data-act="keepopt" data-v="${pid}|${key}"><span class="li">${icon}</span><span class="lt"><b>${label}</b><small>${k.done.includes(key) ? '✔ Done' : sub}</small></span></button>`;
    return `<div class="collegecard"><div class="relface">${C.faceOf(p)}</div><div><b style="font-size:17px">${C.esc(p.fn)} ${C.esc(p.ln)}</b><br><small class="mutey">${p.pos} · ${yrN[p.year]} · rating ${p.rating}</small></div></div>
      <div class="card" style="margin-top:12px"><b>${why[0]} ${why[1]}</b><p class="note" style="margin:4px 0 8px">${why[2]}.</p>
        <div class="hbar"><i style="width:${Math.round(k.chance * 100)}%;background:${k.chance >= .45 ? '#dc2626' : k.chance >= .25 ? '#f59e0b' : '#16a34a'}"></i></div><small class="mutey">Chance of leaving: ${Math.round(k.chance * 100)}%</small></div>
      ${isAcad() ? '' : opt('raise', '🎓', 'Raise their scholarship', `+${C.short(add)} a year from the pool`)}
      ${opt('nil', '💵', 'Booster NIL deal', `💵 ${C.short(nilCost())} once`)}
      ${p.promise === 'starter' && !k.done.includes('role') ? '' : opt('role', '⭐', 'Promise a starting role', 'Free, but you must keep it')}
      <button class="btn full danger" data-act="letgo" data-v="${pid}" style="margin-top:12px">Let them go now</button>
      <p class="note">Some players leave whatever you do. That's small-college life.</p>`;
  });

  // ================= recruit profile =================
  function profileHTML(id) {
    const x = C.R(id); if (!x) return '<p class="note">This recruit is no longer available.</p>';
    const A = C.attrsOf(x), rar = C.RARITY[x.rar], src = SRC[x.src];
    return `<div class="rhero" style="background:linear-gradient(160deg,${x.kit[0]},${C.shade(x.kit[0], -.45)})"><div class="rport">${rface(x, '10 0 100 100')}</div>
        <div class="nameplate"><b>${C.esc(x.fn)} ${C.esc(x.ln)}</b><div class="tags"><span class="pos ${C.POSGROUP(x.pos)}">${x.pos}</span><span class="yr" style="border-color:rgba(255,255,255,.4);color:#fff">${C.yrIcon(x.year)}${yrN[x.year]}</span><span class="rarp" style="background:${rar[1]}">${rar[0]}</span></div>
        <small class="hometown">${x.flag} ${C.esc(x.town)} · GPA ${x.gpa}</small><small class="hometown">${src[0]} ${src[1]}${x.from ? ' · from ' + C.esc(x.from) : ''}</small></div></div>
      <div class="kpis" style="margin-top:12px"><div class="kpi"><b class="${x.scouted ? '' : 'fz'}" style="${x.scouted ? '' : 'font-size:18px'}">${ratingTxt(x)}</b><small>Rating</small></div><div class="kpi"><b style="color:var(--fit5)">${x.scouted ? x.pot : '?'}</b><small>Potential</small></div>
        <div class="kpi"><b style="font-size:22px">${C.ROLES[x.want][0]}</b><small>Wants</small></div><div class="kpi"><b>${Math.round(x.ask * 100)}%</b><small>Hopes</small></div></div>
      ${x.rival ? `<div class="card rivalc">⚔ <b>${C.esc(x.rival.c)}</b> has made an offer. Decision in <b data-until="${x.rival.end}">${C.dur((x.rival.end - C.now()) / 1000)}</b></div>` : ''}
      <h3 class="jh">${x.pos === 'GK' ? 'Goalkeeping' : 'Skills'} ${x.scouted ? '' : '<small class="devp">estimates</small>'}</h3>
      <div class="card"><div class="attrs">${Object.keys(A).map(k => `<div class="attr ${C.KEY[x.pos].includes(k) ? 'key' : ''}"><span class="ai">${A[k][0]}</span><div class="ab"><div><span>${A[k][1]}</span><em>${attrTxt(x, x.a[k])}</em></div><div class="bar"><i style="width:${x.scouted ? x.a[k] : round5(x.a[k])}%;background:${x.scouted ? 'var(--fit4)' : 'var(--silver)'}"></i></div></div></div>`).join('')}</div></div>
      ${x.scouted ? '' : `<button class="btn full sec2" data-act="scout" data-v="${id}" style="margin-top:10px">🔍 Scout for exact ratings · 📘 ${SCOUT_CP}</button>`}
      <div class="jbtns"><button class="btn sec2" data-act="rpass" data-v="${id}">Not interested</button><button class="btn pri" data-act="offer" data-v="${id}">✉️ ${x.deal.round ? 'Improve offer' : 'Make an offer'}</button></div>`;
  }
})(window.CFC);
