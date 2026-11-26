// Club FC 1.07 (SCOPE_1.07; QA-98, QA-101, QA-102, QA-103, QA-105, QA-106): the season cycle, signposted.
// Regular season -> Postseason -> Offseason -> Graduation and new season -> Pre-season. Moments (conference champions, the
// National Championship announcement, the awards night, the promotion decision) queue up and show one at a time when the
// screen is free (after a match report closes, for example).
(function (C) {
  const A = C.ACTS, B = k => C.BUILDINGS[k].name, esc = s => C.esc(String(s));
  const cyc = () => { const car = C.car(); car.cyc = car.cyc || { q: [] }; return car.cyc; };
  C.cycleQueue = k => { const Q = cyc().q; if (!Q.includes(k)) Q.push(k); C.save(); };
  const S = () => C.sea(), R = () => S().R || 14, need = () => C.gateNeed ? C.gateNeed() : 0;

  // ================= hooks from season.js =================
  C.cycleLeagueEnd = Se => { const car = C.car();
    if (Se.regPos === 1) { (car.trophies = car.trophies || []).push({ season: Se.n, tier: car.tier, title: 'Conference champions' }); C.cycleQueue('confchamp'); }
    C.cycleQueue('post');
    if (car.tier > 1 && Se.regPos <= 4 && !C.hqOkFor(car.tier - 1)) C.cycleQueue('deadline'); };
  C.cycleSeasonEnd = Se => { const car = C.car(); Se.awards = awards(Se); applyAwards(Se.awards, Se);
    C.cycleQueue('awards'); if (Se.end && Se.end.promo) { Se.end.decide = 'pending'; C.cycleQueue('promo'); } C.cycleQueue('off'); C.save(); };

  // show the next queued moment when nothing else is open
  C.cycleShow = () => { const car = C.car(); if (!car || !car.cyc || !car.cyc.q.length || C.ui.isOpen()) return false; const k = car.cyc.q.shift(); C.save();
    ({ confchamp: openConfChamp, post: openPost, deadline: openDeadline, natann: openNatAnn, awards: openAwards, promo: openPromo, off: openOff })[k](); return true; };

  // ================= QA-98: the conference champions moment =================
  function openConfChamp() { const Se = S(), car = C.car(), col = C.college();
    C.ui.open('Conference champions', () => `<div class="cyhero">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 74)}<b>🏆 ${esc(Se.conf)} Champions!</b><p>First in the league after ${R()} matches. The trophy is in your cabinet.</p></div>
      <div class="card"><b>What's next</b><p class="note" style="margin:4px 0 0">The top 4 play the <b>conference tournament</b> (semi-finals, then the final). Its winner takes the conference's place in the <b>National Championship</b>. ${car.tier > 1 ? `Promotion: as champions you go up if your Coaches' Office reaches Lv ${need()}.` : ''}</p></div>
      <button class="btn full pri" data-act="back">On to the tournament</button>`); }

  // ================= QA-98 / QA-103: the Postseason card (also on Matchday) =================
  C.postCardHTML = () => { const Se = S(), car = C.car(), ph = Se.phase, pos = Se.regPos || C.myPos(), up = car.tier > 1;
    const step = (on, done, t, sub) => `<div class="cystep ${on ? 'on' : ''} ${done ? 'done' : ''}"><i>${done ? '✔' : on ? '▶' : '○'}</i><span><b>${t}</b><small>${sub}</small></span></div>`;
    const k = 6 - car.tier;
    return `<div class="card cypost"><b>🏟 How the season ends</b>
      ${step(ph === 'reg', ph !== 'reg', `League · ${R()} matches`, 'Everyone plays everyone twice. Top 4 go on')}
      ${step(ph === 'tourn', ['po', 'nat', 'done'].includes(ph), 'Conference tournament · top 4', `Semi-finals, then the final. Final $${(3000 * k).toLocaleString()}, winners $${(8000 * k).toLocaleString()} more. The winner goes to the National Championship`)}
      ${up ? step(ph === 'po', ph === 'done' && Se.fx.some(f => f.po && (f.h === 0 || f.a === 0)), 'Promotion play-off · 3rd and 4th', `Against the two weakest of the division above. Needs Coaches' Office Lv ${need()}`) : ''}
      ${step(ph === 'nat', ph === 'done' && Se.fx.some(f => f.nat && (f.h === 0 || f.a === 0)), 'National Championship · 8 tournament winners', 'Quarter-final $' + (3000 * k).toLocaleString() + ' … champions $' + (20000 * k).toLocaleString() + ' and a trophy')}
      ${up ? `<small class="mutey">1st and 2nd go up with Coaches' Office Lv ${need()} (now Lv ${C.level('hq')}). ${pos ? `You finished ${C.ord(pos)}.` : ''}</small>` : ''}</div>`; };
  function openPost() { const Se = S(), pos = Se.regPos || C.myPos();
    C.ui.open('The postseason', () => `<div class="cyhero sm"><b>${pos <= 4 ? `🎟 You're in the conference tournament (${C.ord(pos)})` : `League over: ${C.ord(pos)}`}</b><p>${pos <= 4 ? 'Every match from here is a knockout: rest tired players and use a team session before each one.' : 'Your season continues with the transfer window and recruiting once the postseason is played.'}</p></div>${C.postCardHTML()}<button class="btn full pri" data-act="back">Got it</button>`); }

  // ================= QA-98: the National Championship announcement and bracket =================
  C.bracketHTML = () => { const Se = S(); if (!Se.nat) return ''; const nm = i => esc(Se.teams[i].name), seed = i => (Se.nat.field.find(x => x.ti === i) || {}).seed || '';
    const rounds = [...new Set(Se.fx.filter(f => f.nat).map(f => f.md))].sort((a, b) => a - b), title = ['Quarter-finals', 'Semi-finals', 'Final'];
    return `<div class="card cybr"><b>🏆 National Championship</b>${rounds.map((md, r) => `<div class="cyrnd"><small>${title[r] || ''}</small>${Se.fx.filter(f => f.nat && f.md === md).map(f => { const me = f.h === 0 || f.a === 0, done = f.hs != null;
      return `<div class="cytie ${me ? 'me' : ''}"><span>(${seed(f.h)}) ${nm(f.h)}</span><b>${done ? `${f.hs}–${f.as}${f.pens ? ` <small>p ${f.pens[0]}–${f.pens[1]}</small>` : ''}` : 'v'}</b><span>${nm(f.a)} (${seed(f.a)})</span></div>`; }).join('')}</div>`).join('')}</div>`; };
  function openNatAnn() { C.ui.open('National Championship', () => `<div class="cyhero"><b>🎉 You're in the National Championship!</b><p>The 8 conference tournament winners, seeded by league points. The higher seed hosts the quarter-final and semi-final; the final is on neutral ground. Big day, Coach.</p></div>${C.bracketHTML()}<button class="btn full pri" data-act="back">Let's go</button>`); }

  // ================= QA-101: the promotion deadline =================
  C.deadlineOpen = () => { const car = C.car(); if (!car || car.pre || car.tier <= 1) return false; const Se = car.sea; if (!Se || Se.end || Se.legacy) return false;
    if (C.hqOkFor(car.tier - 1)) return false; const Rr = Se.R || 14;
    if (Se.phase === 'reg') return Se.md > Rr - 4 && C.myPos() <= 4;
    if (Se.phase === 'tourn') return (Se.regPos || 9) <= 4; return false; };
  C.deadlineHTML = () => { if (!C.deadlineOpen()) return ''; const hq = C.level('hq'), n = need(), g = C.gateStep ? C.gateStep() : null;
    return `<div class="card cydl"><b>⏳ Promotion deadline</b><p>${B('hq')} Lv ${hq} of ${n}: ${n - hq} level${n - hq > 1 ? 's' : ''} needed before the conference tournament ends.</p>${g && g.k ? `<button class="btn sm2 pri" data-act="cydlgo" data-v="${g.k}">Go: ${esc(g.text)}</button>` : '<small class="mutey">The next step is already building.</small>'}</div>`; };
  A.cydlgo = k => { C.ui.closeAll(); C.goToBuilding(k); };
  function openDeadline() { const Se = S(), pos = Se.regPos || C.myPos(), hq = C.level('hq'), n = need();
    C.ui.open('From the Director', () => `<div class="raytake" style="margin-top:0"><span>🏛</span><p><b>A promotion place, Coach, but the campus isn't there yet</b>You finished ${C.ord(pos)}. Promotion needs the ${B('hq')} at Lv ${n}; it's Lv ${hq}. ${pos <= 2 ? 'Get there before your last match of the season.' : 'Get there before the play-off is drawn, when the conference tournament ends.'}</p></div>${C.deadlineHTML()}<button class="btn full sec2" data-act="back">Later</button>`, { popup: true }); }
  // the task bar puts the promotion step first while the deadline is open
  const oStrip = C.stripTask; C.stripTask = () => { if (C.deadlineOpen()) { const g = C.gateStep && C.gateStep(); if (g && g.k) return { text: `Promotion: ${g.text}`, go: () => C.goToBuilding(g.k) }; } return oStrip(); };

  // ================= QA-98: the build-up before a postseason match (on the pre-match screen) =================
  C.bigMatchHTML = f => { if (!f || !f.ko) return ''; const Se = S(), lab = C.fxLabel(f).long, xi = C.tac().xi.map(C.P).filter(Boolean), av = Math.round(xi.reduce((s, p) => s + p.energy, 0) / (xi.length || 1)), k = 6 - C.car().tier;
    const stake = f.nat ? (f.natf ? `The national final: champions win $${(20000 * k).toLocaleString()}, +10 Reputation and a trophy.` : 'Win and you go through to the next round.') : f.po ? (f.pof ? 'Win and you are promoted.' : 'Win and you reach the promotion final.') : f.md === R() + 2 ? `The conference final: the winners take the National Championship place and $${(8000 * k).toLocaleString()} more.` : 'Win and you reach the conference final.';
    return `<div class="bigm"><b>🔥 ${esc(lab)}</b><p>${stake}</p><div class="bigfr"><i class="dropi"></i> XI ${av}% ${av < 80 ? '· freshen up first:' : '· ready'} ${av < 80 ? '<button class="btn sm2 pri" data-act="teamsess">👥 Team session</button><button class="btn sm2 sec2" data-act="rejuv">Rest / kits</button>' : ''}</div>
      ${C.deadlineOpen() && !f.nat ? `<div class="cylast">⚠ Last chance: promotion needs the ${B('hq')} at Lv ${need()} before the conference tournament ends (now Lv ${C.level('hq')}).</div>` : ''}${C.advice('snc')}</div>`; };
  C.radioLine = f => f && f.ko ? `📻 It's the ${esc(C.fxLabel(f).long)}! Duane and Bev are live from the press box.` : '';

  // ================= QA-105: the awards night =================
  const POSW = { ST: 5, LW: 3, RW: 3, AM: 3, LM: 2, RM: 2, CM: 1.5, DM: .8, LB: .5, RB: .5, LWB: .6, RWB: .6, CB: .4, GK: 0 };
  const grp = p => C.POSGROUP(p.pos);
  function awards(Se) { const car = C.car(), tbl = C.table(), r = C.rng(Se.n * 6151 + (car.created & 0xffff)), pool = [];
    // your players: their real season numbers
    car.squad.forEach(p => { const ss = p.ss || {}, apps = ss.lapps ?? ss.apps ?? 0; pool.push({ mine: 1, id: p.id, name: p.fn[0] + '. ' + p.ln, team: C.college().short, pos: p.pos, year: p.year, apps, g: ss.g || 0, avg: apps ? (ss.rs || 0) / Math.max(1, ss.apps || apps) : 0, up: p.rating - (p.r0 ?? p.rating) }); });
    // a light tally for the AI squads (the same players you meet), from their team's results
    tbl.forEach(row => { if (row.i === 0 || !Se.teams[row.i] || Se.teams[row.i].guest) return; let T; try { T = C.oppTeam(row.i); } catch (e) { return; }
      const xi = T.xi, avgR = xi.reduce((s, p) => s + p.rating, 0) / xi.length, w = xi.map(p => (POSW[p.pos] ?? 1) * p.rating), sw = w.reduce((a, b) => a + b, 0) || 1, ppg = row.p ? row.pts / row.p : 1.3;
      let left = row.gf; const goals = xi.map((p, i) => { const g = Math.floor(row.gf * w[i] / sw); left -= g; return g; }); while (left-- > 0) goals[Math.floor(r() * xi.length)]++;
      xi.forEach((p, i) => pool.push({ id: p.id, name: p.fn[0] + '. ' + p.ln, team: T.name, pos: p.pos, year: p.year, apps: row.p, g: goals[i], avg: Math.max(5.6, Math.min(8.6, 6.4 + (ppg - 1.4) * .45 + (p.rating - avgR) * .04 + (r() - .5) * .5)) })); });
    const min = Math.ceil(R() / 2), q = pool.filter(x => x.apps >= min), best = (l, f) => l.slice().sort((a, b) => f(b) - f(a))[0] || null;
    const lead = tbl[0] ? tbl[0].i : 0, coachNames = ['Dale Hughes', 'Morgan Reyes', 'Pat Okafor', 'Robin Novak', 'Casey Silva', 'Jordan Kim', 'Lee Brennan', 'Sam Patel'];
    const coach = lead === 0 ? { name: 'You', team: C.college().short, mine: 1 } : { name: coachNames[(Se.n * 7 + lead) % coachNames.length], team: Se.teams[lead].name };
    const xi = []; [['gk', 1], ['def', 4], ['mid', 3], ['fwd', 3]].forEach(([g, n]) => q.filter(x => C.POSGROUP(x.pos) === g).sort((a, b) => b.avg - a.avg).slice(0, n).forEach(x => xi.push(x)));
    const mine = pool.filter(x => x.mine && x.apps > 0), capId = (car.captains || [])[0];
    return { conf: [['🌟', 'Player of the Year', best(q, x => x.avg)], ['🎓', 'Freshman of the Year', best(q.filter(x => x.year === 1), x => x.avg)], ['👟', 'Golden Boot', best(pool, x => x.g)], ['🧤', 'Goalkeeper of the Year', best(q.filter(x => x.pos === 'GK'), x => x.avg)], ['🛡', 'Defender of the Year', best(q.filter(x => C.POSGROUP(x.pos) === 'def'), x => x.avg)]],
      coach, xi, prog: [['🏅', 'MVP', best(mine, x => x.avg)], ['📈', 'Most Improved', best(mine, x => x.up)], ['🌱', 'Best Freshman', best(mine.filter(x => x.year === 1), x => x.avg)], ['🅲', "Captain's award", capId ? mine.find(x => x.id === capId) || null : null]] }; }
  function applyAwards(Aw, Se) { const car = C.car(); car.honors = car.honors || []; let rep = 0;
    const give = (x, title) => { if (!x || !x.mine) return; const p = C.P(x.id); if (!p) return; (p.honors = p.honors || []).push({ s: Se.n, t: title }); p.morale = Math.min(100, (p.morale || 60) + 8); car.honors.push({ s: Se.n, t: title, n: x.name }); };
    Aw.conf.forEach(([, t, x]) => { if (x && x.mine) { give(x, t); rep++; } }); Aw.xi.forEach(x => give(x, 'All-Conference XI')); Aw.prog.forEach(([, t, x]) => give(x, t));
    if (Aw.coach.mine) { car.honors.push({ s: Se.n, t: 'Coach of the Year', n: 'You' }); car.adConf = C.clamp((car.adConf ?? 50) + 10, 0, 100); rep += 3; }
    if (rep) car.rep = C.clamp((car.rep ?? 10) + Math.min(5, rep), 0, 100); C.save(); }
  let awStep = 0;
  function openAwards() { awStep = 0; C.ui.open('Awards night', awardsHTML); }
  A.awnext = () => { awStep++; if (awStep > 3) return C.ui.back(); C.ui.refresh(); };
  A.awskip = () => { awStep = 3; C.ui.refresh(); };
  function awardsHTML() { const Se = S(), Aw = Se.awards; if (!Aw) return '<p class="note">No awards this season.</p>';
    const card = (ic, t, x) => `<div class="awc ${x && x.mine ? 'me' : ''}"><span>${ic}</span><div><small>${t}</small><b>${x ? esc(x.name) : '—'}</b>${x ? `<em>${esc(x.team)}${x.g != null && t === 'Golden Boot' ? ' · ' + x.g + ' goals' : x.avg ? ' · ' + x.avg.toFixed(2) : ''}</em>` : ''}</div></div>`;
    const E = Se.end || {}, nat = E.nat || {}, troph = [['🏆', 'Conference champions (league)', esc(Se.teams[(Se.regTable || [0])[0]].name)], ['🏆', 'Conference tournament champions', esc(E.champName || '—')], ['🏆', 'National champions', esc(nat.champName || '—')]];
    if (E.promo) troph.push(['⬆', 'Promotion earned', esc(C.college().short)]);
    const steps = [`<h3 class="jh">Team trophies</h3>${troph.map(([ic, t, n]) => `<div class="awc ${n === esc(C.college().short) ? 'me' : ''}"><span>${ic}</span><div><small>${t}</small><b>${n}</b></div></div>`).join('')}`,
      `<h3 class="jh">Conference awards</h3>${Aw.conf.map(([ic, t, x]) => card(ic, t, x)).join('')}${card('📋', 'Coach of the Year', Aw.coach)}`,
      `<h3 class="jh">All-Conference XI</h3><div class="card srows">${Aw.xi.map(x => `<div class="srow ${x.mine ? 'meb' : ''}"><span>${x.pos} · ${esc(x.name)}</span><b>${esc(x.team)} · ${x.avg.toFixed(2)}</b></div>`).join('')}</div>`,
      `<h3 class="jh">${esc(C.college().short)} awards</h3>${Aw.prog.map(([ic, t, x]) => card(ic, t, x)).join('')}<p class="note">Your award winners get a morale lift and a badge on their player card. Every award is kept in Your college → Honors.</p>`];
    return `<div class="cyhero sm"><b>🎖 Season ${Se.n} awards night</b></div>${steps[awStep]}<div class="jbtns" style="grid-template-columns:1fr 1fr">${awStep < 3 ? '<button class="btn sec2" data-act="awskip">Skip to the end</button>' : '<span></span>'}<button class="btn pri" data-act="awnext">${awStep < 3 ? 'Next' : 'Done'}</button></div>`; }

  // ================= QA-106: the promotion decision =================
  function openPromo() { const car = C.car(), Se = S(), t = car.tier, n = t - 1, k0 = 6 - t, k1 = 6 - n;
    const row = (l, a, b) => `<div class="srow"><span>${l}</span><b>${a} → ${b}</b></div>`;
    C.ui.open('Promotion', () => `<div class="cyhero"><b>⬆ You've earned promotion to ${esc(C.TIERS[n].name)}</b><p>Choose whether to go up next season.</p></div>
      <div class="card srows">${row('Division', esc(C.TIERS[t].name), esc(C.TIERS[n].name))}${row("Opponents' average", C.tierBase(t), C.tierBase(n))}${row('Your XI now', C.xiRating(), C.xiRating())}
        ${row('Cost to attend', C.money(C.TIER_COA[t]), C.money(C.TIER_COA[n]))}${row('Scholarship pool', C.money(C.TIER_COA[t] * C.TIER_FUNDED[t]), C.money(C.TIER_COA[n] * C.TIER_FUNDED[n]))}
        ${row('Prize money step', '×' + k0, '×' + k1)}${n > 1 ? row('Next promotion needs', `${B('hq')} Lv ${C.TIER_GATE[t - 1]}`, `${B('hq')} Lv ${C.TIER_GATE[n - 1]}`) : ''}</div>
      <button class="btn full buyg" data-act="promoyes">✔ Accept promotion (recommended)</button><button class="btn full sec2" data-act="promostay" style="margin-top:8px">Stay in ${esc(C.TIERS[t].name)}</button>
      <p class="note">Staying costs Director confidence, and the place goes to the next-best college in your conference. Promotion isn't saved for later.</p>`); }
  A.promoyes = () => { const Se = S(), car = C.car(); if (Se.end) { Se.end.decide = 'accept'; (car.trophies = car.trophies || []).push({ season: Se.n, tier: car.tier, title: 'Promoted' }); } C.save(); C.ui.back(); C.render(); C.toast('⬆ Promotion accepted'); };
  A.promostay = (v, el) => { if (!(el && el.dataset.ok)) return C.confirm('Stay down?', `<p>Stay in <b>${esc(C.TIERS[C.car().tier].name)}</b> next season?</p><p class="note">This can't be undone. Director confidence drops, and the next-best college in your conference is promoted instead.</p>`, 'Stay', 'promostay', '1');
    const Se = S(), car = C.car(), E = Se.end; if (!E) return; E.promo = false; E.stayed = true; E.decide = 'stay'; E.why = 'stayed'; E.toTier = null; car.adConf = C.clamp((car.adConf ?? 50) - 15, 0, 100);
    const next = (Se.regTable || []).find(i => i !== 0 && Se.teams[i] && Se.teams[i].name !== E.aiUpName); if (next != null) E.aiUp2Name = Se.teams[next].name;
    C.save(); C.ui.closeAll(); C.render(); C.toast(`You stay in ${C.TIERS[car.tier].name}`); };

  // ================= QA-102: the season review shows the outcome =================
  const oCard = C.careerCardHTML;
  C.careerCardHTML = () => { const car = C.car(), Se = car.sea, E = Se && Se.end; if (!E) return liveCard(oCard());
    const n = car.tier - 1, need0 = n >= 1 ? C.TIER_GATE[n] : 0, okHQ = n >= 1 && C.level('hq') >= need0, pos = E.pos, tick = b => b ? '✔' : '✖';
    const res = E.stayed ? `You chose to stay in ${esc(C.TIERS[car.tier].name)}${E.aiUp2Name ? `; ${esc(E.aiUp2Name)} go up instead` : ''}.` : E.promo ? `<b>Promoted to ${esc(C.TIERS[n].name)} next season.</b>` : n < 1 ? 'Top division: no promotion.' : pos <= 2 ? 'No promotion this season: the Coaches\' Office level was missing.' : pos <= 4 ? (E.why === 'hq' ? 'No promotion: the play-off was a walkover without the Coaches\' Office level.' : 'No promotion: the play-off was lost.') : 'No promotion this season.';
    return `<div class="card career cyout"><div class="srow"><span>League</span><b>${C.ord(pos)}${pos === 1 ? ' · conference champions' : ''}</b></div>
      <div class="srow"><span>Conference tournament</span><b>${E.champ ? 'won 🏆' : 'won by ' + esc(E.champName || '—')}</b></div>
      ${E.nat ? `<div class="srow"><span>National Championship</span><b>${E.nat.reached ? { qf: 'quarter-final', sf: 'semi-final', f: 'runners-up', champ: 'champions 🏆' }[E.nat.reached] : 'won by ' + esc(E.nat.champName || '—')}</b></div>` : ''}
      ${n >= 1 ? `<div class="cr2 ${E.promo ? 'ok' : ''}">${tick(pos <= 2 || (pos <= 4 && (E.promo || E.stayed)))} Finished ${C.ord(pos)}${pos > 2 && pos <= 4 ? (E.promo || E.stayed ? ' and won the play-off' : ' (play-off)') : ''} · ${tick(okHQ)} ${B('hq')} Lv ${C.level('hq')}${okHQ ? '' : ' of ' + need0}</div>` : ''}
      <p style="margin:6px 0 0">${res}</p></div>`; };
  // during the season the finishing line ticks when it's met
  function liveCard(h) { const car = C.car(), Se = car.sea; if (!Se || car.pre || car.tier <= 1) return h; const pos = C.myPos(), met = Se.phase === 'reg' ? pos <= 2 : (Se.regPos || pos) <= 2;
    return h.replace('<div class="cr2">○ Finish 1st or 2nd', `<div class="cr2 ${met ? 'ok' : ''}">${met ? '✔' : '○'} Finish 1st or 2nd`); }

  // ================= QA-103: the season phases (Matchday strip) and the Offseason card =================
  C.phaseNow = () => { const car = C.car(); if (car.pre) return 'pre'; const ph = (car.sea || {}).phase; return ph === 'reg' ? 'reg' : ph === 'done' ? 'off' : 'post'; };
  C.phaseStripHTML = () => { const now = C.phaseNow(), L = [['reg', 'Season'], ['post', 'Postseason'], ['off', 'Offseason'], ['grad', 'New season'], ['pre', 'Pre-season']];
    return `<div class="cyphase">${L.map(([k, n]) => `<span class="${k === now ? 'on' : ''}">${n}</span>`).join('<i>›</i>')}</div>`; };
  function openOff() { const car = C.car();
    C.ui.open('The offseason', () => `<div class="cyhero sm"><b>🗓 Offseason</b><p>The season is over. Before Season ${car.season + 1}:</p></div>
      <div class="card"><div class="cystep"><i>1</i><span><b>Transfer window</b><small>Players may leave, and you can sign from the portal (Recruit).</small></span></div>
      <div class="cystep"><i>2</i><span><b>Recruit your next class</b><small>Seniors graduate when the new season starts.</small></span></div>
      <div class="cystep"><i>3</i><span><b>Start Season ${car.season + 1}</b><small>On Matchday, when you're ready: graduation, the Director's briefing, then Pre-season.</small></span></div></div>
      <button class="btn full pri" data-act="back">Got it</button>`); }

  // ================= QA-103: the new-season sequence =================
  const oNext = C.startNextSeason;
  C.startNextSeason = () => { const car = C.car(), before = new Set(car.rosterAtStart || []), left = (car.leftLog || []).filter(x => x.s === car.season), up0 = car.tier;
    const grads = car.squad.filter(p => p.year >= 4 && !p.rs).map(p => ({ n: C.sn(p), pos: p.pos, apps: ((p.cs || {}).apps || 0) + ((p.ss || {}).apps || 0), g: ((p.cs || {}).g || 0) + ((p.ss || {}).g || 0) }));
    const r = oNext(); const car2 = C.car();
    const fresh = car2.squad.filter(p => !before.has(p.id)).map(p => ({ n: C.sn(p), pos: p.pos, yr: p.year, r: p.rating, from: p.from || '' }));
    const yrs = [1, 2, 3, 4].map(y => car2.squad.filter(p => p.year === y).length);
    car2.nsq = { s: car2.season, up: car2.tier < up0, grads, left, fresh, yrs }; car2.rosterAtStart = car2.squad.map(p => p.id); C.save();
    setTimeout(() => openNewSeason(0), 300); return r; };
  let nsStep = 0;
  function openNewSeason(i) { nsStep = i; C.ui.closeAll(); C.ui.open('Season ' + C.car().season, newSeasonHTML); }
  A.nsnext = () => { nsStep++; if (nsStep > 2) { C.ui.closeAll(); return C.openPreseason(); } C.ui.refresh(); };
  function newSeasonHTML() { const car = C.car(), N = car.nsq || {}, col = C.college(), Se = C.sea(), n = car.tier - 1, k = 6 - car.tier;
    const opp = Se.teams.slice(1).filter(t => !t.guest).map(t => t.rating), oavg = opp.length ? Math.round(opp.reduce((a, b) => a + b, 0) / opp.length) : C.tierBase(car.tier), me = C.xiRating(), cmp = C.rateCmp(oavg);
    const steps = [
      `<div class="cyhero">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 74)}<b>${N.up ? `⬆ Welcome to ${esc(C.TIERS[car.tier].name)}` : `🎬 Season ${car.season} begins`}</b><p>${esc(Se.conf || '')}${N.up ? ' · a new conference and stronger opponents' : ''}</p></div>`,
      `<div class="adhead"><div class="adface">🏛</div><div><b>${esc(C.AD.name)}</b><small>${esc(C.AD.title)} · the Director's briefing</small></div></div>
       <div class="card srows"><div class="srow"><span>This season's goal</span><b>${esc(C.goalText ? C.goalText() : '')}</b></div><div class="srow"><span>Meeting it pays</span><b>$${(5000 * k).toLocaleString()}</b></div>
       <div class="srow"><span>Division</span><b>${esc(C.TIERS[car.tier].name)}</b></div><div class="srow"><span>Cost to attend · pool</span><b>${C.money(car.job.coa)} · ${C.money(car.job.pool)}</b></div>
       <div class="srow"><span>Roster</span><b>${car.squad.length} of ${C.rosterCap()}</b></div>${n >= 1 ? `<div class="srow"><span>Promotion target</span><b>${B('hq')} Lv ${C.TIER_GATE[n]} (now ${C.level('hq')})</b></div>` : ''}
       <div class="srow"><span>Opponents' average</span><b>${oavg} · your XI ${me} · <span class="rtc ${cmp.c}">${cmp.w}</span></b></div></div>`,
      `<h3 class="jh">🎓 Graduation day</h3><div class="card srows">${(N.grads || []).map(g => `<div class="srow"><span>${esc(g.n)} · ${g.pos}</span><b>${g.apps} apps · ${g.g} goals · thank you!</b></div>`).join('') || '<p class="note">No seniors this year.</p>'}</div>
       <div class="card"><b>⬆ Moving up</b><p class="note" style="margin:4px 0 0">Fr ${N.yrs ? N.yrs[0] : 0} · So ${N.yrs ? N.yrs[1] : 0} · Jr ${N.yrs ? N.yrs[2] : 0} · Sr ${N.yrs ? N.yrs[3] : 0}</p></div>
       ${(N.left || []).length ? `<h3 class="jh">🚪 Left in the transfer window</h3><div class="card srows">${N.left.map(x => `<div class="srow"><span>${esc(x.n)}</span><b>${x.pos}</b></div>`).join('')}</div>` : ''}
       <h3 class="jh">🆕 New this season</h3><div class="card srows">${(N.fresh || []).map(x => `<div class="srow"><span>${esc(x.n)} · ${x.pos}</span><b>${['', 'Fr', 'So', 'Jr', 'Sr'][x.yr] || ''} · ${x.r}${x.from ? ' · ' + esc(x.from) : ''}</b></div>`).join('') || '<p class="note">Nobody new.</p>'}</div>`];
    return `${steps[nsStep]}<div class="nsdots">${[0, 1, 2].map(i => `<i class="${i === nsStep ? 'on' : ''}"></i>`).join('')}</div><button class="btn full pri" data-act="nsnext">${nsStep < 2 ? 'Next' : 'See your Pre-season'}</button>`; }

  // remember who was in the squad at the start of a season (for "New this season" and Most Improved)
  const oSs = A.startseasonok; if (oSs) A.startseasonok = (...a) => { const r = oSs(...a); const car = C.car(); if (car && !car.pre) { car.rosterAtStart = car.squad.map(p => p.id); car.squad.forEach(p => { p.r0 = p.rating; }); C.save(); } return r; };

  // ================= Matchday: the phase strip, the deadline, the postseason card and the bracket =================
  // inside the Matchday page, under the next-match card (1.07)
  C.cycleMatchdayHTML = () => { const car = C.car(), Se = car.sea; if (!Se) return ''; const ph = Se.phase, Rr = Se.R || 14;
    return C.phaseStripHTML() + ((ph === 'tourn' || ph === 'po' || ph === 'nat') || (ph === 'reg' && Se.md >= Rr - 1) ? C.postCardHTML() : '') + (Se.nat ? C.bracketHTML() : ''); };
  const oGd = C.gamedayHTML; if (oGd) C.gamedayHTML = () => C.deadlineHTML() + oGd();
})(window.CFC);
