// Club FC: squad screens (Phases 3–4). Squad list, player card, training plans, numbers, captains, release.
(function (C) {
  let filter = 'all';
  const yrN = ['', 'Fr', 'So', 'Jr', 'Sr'];
  const ec = e => e >= 80 ? '#16a34a' : e >= 60 ? '#84cc16' : e >= 40 ? '#eab308' : '#f97316';
  // morale in the 5-colour scheme: a face drawn green, lime, gold, orange or red
  C.moraleFace = (m, size = 18) => { const i = m >= 80 ? 0 : m >= 65 ? 1 : m >= 50 ? 2 : m >= 35 ? 3 : 4, col = ['#16a34a', '#84cc16', '#eab308', '#f97316', '#dc2626'][i], mouth = ['M7 13.5q5 5 10 0', 'M7.5 14q4.5 3 9 0', 'M8 15h8', 'M7.5 16q4.5-3 9 0', 'M7 17q5-5 10 0'][i];
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-label="Morale"><circle cx="12" cy="12" r="11" fill="${col}"/><circle cx="8.3" cy="9.3" r="1.6" fill="#111827"/><circle cx="15.7" cy="9.3" r="1.6" fill="#111827"/><path d="${mouth}" fill="none" stroke="#111827" stroke-width="1.9" stroke-linecap="round"/></svg>`; };
  const moraleIcon = m => C.moraleFace(m);
  const ROLE = { xi: ['XI', 'var(--school)'], bench: ['Bench', 'var(--sky)'], res: ['Reserves', 'var(--silver)'], inj: ['Injured', '#dc2626'] };
  const STARS = n => `<span class="rstars">${'★'.repeat(n)}<i>${'★'.repeat(5 - n)}</i></span>`;
  // current job in the side: the position they're selected at, otherwise SUB, RES or INJ in grey
  const selBadge = (p, t, role) => { if (p.inj) return '<span class="pos off">INJ</span>'; const i = t.xi.indexOf(p.id); if (i >= 0) { const q = C.FORMATIONS[t.form][i][0]; return `<span class="pos ${C.POSGROUP(q)}">${q}</span>`; } return `<span class="pos off">${role === 'bench' ? 'SUB' : 'RES'}</span>`; };
  const LOCKI = '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#fff" stroke-width="2.4"/><rect x="5" y="11" width="14" height="10" rx="2.5" fill="#fff"/></svg>';
  C.yrIcon = n => { const r = 6, c = 2 * Math.PI * r; return `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="3"/><circle cx="8" cy="8" r="${r}" fill="none" stroke="var(--school2)" stroke-width="3" stroke-dasharray="${c * n / 4} ${c}" transform="rotate(-90 8 8)"/></svg>`; };
  const kitOf = p => { const col = C.college(), k = C.kitColours(col.c1, col.c2); return p.pos === 'GK' ? { k1: '#facc15', k2: '#111827' } : { k1: k[0], k2: k[1] }; };
  C.faceOf = (p, vb = '24 12 72 72') => `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">${window.faceV4(Object.assign({}, p.look, kitOf(p)))}</svg>`;
  const schLabel = p => (p.acad && !p.schol ? '📚 Aid' : p.schol ? `🎓 ${Math.round(p.schol / C.car().job.coa * 100)}%` : 'Walk-on') + (p.cjob ? ' + 💼' : '');

  // ================= squad list =================
  C.squadHTML = () => {
    const car = C.car(), sq = car.squad, roles = C.roles(), col = C.college();
    // 9q (FEEDBACK 89): your players by line, not a team sheet. A player is in every line their positions fit, ranked by
    // ability there; All is ranked by rating. XI / bench / reserves now live in Matchday team selection.
    const t = C.tac(), G = { gk: ['gk'], def: ['def'], mid: ['mid'], att: ['fwd'] };
    const inLine = (p, ln) => [p.pos].concat(p.sec || []).some(x => G[ln].includes(C.POSGROUP(x)));
    const lineScore = (p, ln) => p.rating - (G[ln].includes(C.POSGROUP(p.pos)) ? 0 : 4);
    const f9 = ['all', 'gk', 'def', 'mid', 'att'].includes(filter) ? filter : 'all';
    const list = sq.filter(p => f9 === 'all' || inLine(p, f9)).sort((a, b) => f9 === 'all' ? b.rating - a.rating : lineScore(b, f9) - lineScore(a, f9));
    // training slots: running plans first; locked slots carry their requirement inside the icon, active ones need no tag
    let qi = 0;
    const dev = C.DEVSLOTS.map(s => { if (C.devSlotOpen(s.id)) { const q = car.devq[qi++];
        if (q) { const p = C.P(q.pid), f = 1 - C.remaining(q) / ((q.end - q.start) / 1000); return `<button class="dq" data-act="player" data-v="${q.pid}"><span class="c">${C.ringSVG(f, '#22c55e', 46)}<i>${C.faceOf(p)}</i></span><b data-dtimer="${q.pid}">${C.dur(C.remaining(q))}</b></button>`; }
        return `<button class="dq free" data-act="toast" data-v="Open a player card and tap Train"><span class="c"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg></span></button>`; }
      return `<button class="dq lockd" data-act="devslot" data-v="${s.id}"><span class="c">${LOCKI}<em>${s.id === 'vip' ? 'VIP' : s.id === 'iap' ? '$2.99' : 'TG 10'}</em></span></button>`; }).join('');
    const rare = car.items && car.items.rareRecruit ? `<button class="rarebn" data-act="rare">🎁 You have a Rare recruit from your First Week. <b>Sign them</b>${car.squad.length >= C.rosterCap() ? ' (roster full: upgrade the Dorms or release a player)' : ''}</button>` : '';
    // the header stays put; only the list scrolls (round 6)
    return `<div class="view sqv">
      ${C.topBar(false)}<div class="phdr9"><b>Squad</b><small>${sq.length} / ${C.rosterCap()} players · 🎟 ${car.tokens}</small></div>
      <div class="ptabs9">${[['all', 'All'], ['gk', 'GK'], ['def', 'DEF'], ['mid', 'MID'], ['att', 'ATT']].map(([k, n]) => `<button class="${f9 === k ? 'on' : ''}" data-act="sqf" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="sqscroll" id="sqscroll">${(n => n.length ? `<div class="slimadv" data-act="advall">${n[0]}${n.length > 1 ? `<em class="advn">+${n.length - 1}</em>` : ''}</div>` : '')(C.allAdvice())}${rare}
      ${list.map(p => `<button class="prow" style="--mk:${p.inj ? '#dc2626' : ROLE[roles[p.id]][1]}" data-act="player" data-v="${p.id}">
        <div class="av plain"><div class="face">${C.faceOf(p)}</div><span class="num">${p.num}</span>${p.inj ? '<span class="injx"></span>' : ''}</div>
        <div class="pinfo"><b>${C.esc(p.fn)} ${C.esc(p.ln)}${car.captains.includes(p.id) ? ' <span class="cap">C</span>' : ''}${p.want && p.want !== p.num ? ' <span title="Wants a different number">🎟</span>' : ''}${C.inDev(p.id) ? ' <span title="In training">🏋️</span>' : ''}${p.ban ? ' <span title="Suspended">🟥</span>' : ''}</b>
          <div class="tags">${selBadge(p, t, roles[p.id])}<span class="yr plain">${yrN[p.year]}</span>${STARS(p.stars)}${p.rs ? '<span class="sch">🎽</span>' : ''}</div>
          <div class="pmatch">${C.topPositions(p).map(([x, v]) => `<i style="background:${C.FITPILL[C.fit(p, x)]}">${x}${v}</i>`).join('')}</div></div>
        <div class="rate3"><b>${p.rating}</b>${p.up > 0 ? `<span class="up">▲ +${p.up}</span>` : ''}<span class="cond" style="color:${C.condCol(p.energy)}">${C.condRing(p.energy, 13)} ${Math.round(p.energy)}%</span>${moraleIcon(p.morale)}</div></button>`).join('')}
      <p class="note" style="padding:0 16px">★ Development Stars come from completing training plans. Freshness drops when players play and comes back when they rest a match.</p></div></div>`;
  };
  C.setSquadFilter = v => { filter = v; C.render(); };
  // Promises (Q7a): line-up for the first few matches, then real starts and appearances
  C.promiseKept = (p, roleNow = C.roles()[p.id]) => {
    if (!p.promise) return true; const n = C.car().sea ? C.car().sea.fx.filter(f => (f.h === 0 || f.a === 0) && f.hs != null).length : 0, ss = p.ss || { st: 0, apps: 0 };
    if (n < 3) return p.promise === 'starter' ? roleNow === 'xi' : p.promise === 'rotation' ? roleNow !== 'res' : true;
    return p.promise === 'starter' ? ss.st / n >= .6 : p.promise === 'rotation' ? ss.apps / n >= .5 : true;
  };

  // ================= player card =================
  C.openPlayer = id => C.ui.open('Player', () => cardHTML(id));
  function cardHTML(id) {
    const car = C.car(), p = C.P(id); if (!p) return '<p class="note">This player has left.</p>';
    const col = C.college(), gk = p.pos === 'GK', A = C.attrsOf(p), q = C.inDev(id), rar = C.RARITY[p.rar];
    const acol = v => v >= 65 ? 'var(--fit5)' : v >= 55 ? 'var(--fit4)' : v >= 45 ? 'var(--fit3)' : v >= 30 ? 'var(--fit2)' : 'var(--fit1)';
    const heroBg = gk ? 'radial-gradient(120% 90% at 50% 20%,#facc15 0%,#ca8a04 55%,#713f12 100%)' : `radial-gradient(120% 90% at 50% 20%,${C.shade(col.c1, .25)} 0%,${col.c1} 55%,${C.shade(col.c1, -.5)} 100%)`;
    const devHTML = q ? `<div class="card devnow"><span>🏋️</span><div><b>${q.focus.startsWith('pos:') ? 'Retraining: ' + q.focus.slice(4) : 'Training: ' + A[q.focus][1]}</b><small><span data-dtimer="${id}">${C.dur(C.remaining(q))}</span> left</small></div>
        <button class="btn sm2 go" data-act="devspeedpop" data-v="${id}">⏩ Speed up</button></div>`
      : `${C.capNote ? C.capNote(p) : ''}<button class="trainbtn" data-act="train" data-v="${id}"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M2 12h20M6 7v10M18 7v10M3.5 9.5v5M20.5 9.5v5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>Train</button>`;
    const P = C.portalOpen(), risk = P && P.risk[id], roleNow = C.roles()[id];
    const kept = C.promiseKept(p, roleNow);
    const extras = [p.acad && p.schol ? '📚 Academic aid' : '', p.cjob ? '💼 Campus job' : '', p.house ? '🏠 Housing help' : '', p.raise ? `📈 +${Math.round(p.raise * 100)}% next year` : ''].filter(Boolean);
    return `${risk ? `<button class="riskbn" data-act="keep" data-v="${id}">🚪 Thinking about the portal: ${C.REASONS[risk.why][0]} ${C.REASONS[risk.why][2]}. <b>Try to keep</b></button>` : ''}<div class="phero" style="background:${heroBg}">
        <div class="bignum">${p.num}</div><div class="phf">${C.faceOf(p)}${p.inj ? '<span class="injx"></span>' : ''}</div>
        <div class="phi"><b>${C.esc(p.fn)} ${C.esc(p.ln)}${car.captains.includes(id) ? ' <span class="cap big">C</span>' : ''}</b>
          <div class="pmatch">${C.topPositions(p).map(([x, v]) => `<i style="background:${C.FITPILL[C.fit(p, x)]}">${x}${v}</i>`).join('')}<span class="yr plain" style="border-color:rgba(255,255,255,.5);color:#fff">${yrN[p.year]}</span></div>
          <small class="hometown">${p.flag} ${C.esc(p.town)} · GPA ${p.gpa}</small></div></div>
      <div class="kpis" style="margin-top:12px">
        <div class="kpi"><b>${p.rating}</b><small>Rating</small></div><div class="kpi"><b style="color:var(--fit5)">${p.pot}</b><small>Potential</small></div>
        <div class="kpi"><div class="mini">${C.ringSVG(p.energy / 100, ec(p.energy), 40, 4)}<span>${Math.round(p.energy)}%</span></div><small>Freshness</small></div>
        <div class="kpi">${C.moraleFace(p.morale, 30)}<small>Morale</small></div></div>${p.energy < 60 && !p.inj ? (() => { const kits = (car.items && car.items.kit) || 0;   // 1.01 (D7.7): the recovery kit right here, the same action as the Medical Room
          return `<div class="cardacts">${kits ? `<button class="btn full pri" data-act="treat" data-v="${id}|kit" style="margin-top:8px">🧴 Use Recovery Kit: +25 Freshness <small>(you have ${kits})</small></button>` : `<button class="btn full sec2" data-act="buykitc" style="margin-top:8px">🧴 Buy a recovery kit · ${C.GEM} ${C.TREAT.kit}</button>`}<button class="btn sm2 sec2" data-act="rejuv" style="margin-top:6px">👥 Team recovery options</button></div>`; })() : ''}
        ${p.inj && C.injButtons ? `<div class="card" style="margin-top:8px"><b>${(p.injury || {}).icon || '🩹'} ${C.esc((p.injury || {}).name || 'Injury')}</b> <small class="mutey">${(p.injury || {}).season ? 'out for the season (medical redshirt)' : 'out ' + p.inj + ' more match' + (p.inj > 1 ? 'es' : '')}</small><div class="medbt" style="margin-top:6px">${C.injButtons(p)}</div></div>` : ''}
      <h3 class="jh">${gk ? 'Goalkeeping' : 'Skills'} <button class="hlink" data-act="help" data-v="attrs">?</button></h3>
      <div class="card"><div class="attrs">${Object.keys(A).map(k => `<div class="attr ${C.KEY[p.pos].includes(k) ? 'key' : ''}"><span class="ai">${A[k][0]}</span><div class="ab"><div><span>${A[k][1]}</span><em>${p.a[k]}<small>/${C.attrCap(p, k)}</small></em></div><div class="bar capb"><i style="width:${p.a[k]}%;background:${acol(p.a[k])}"></i><u style="left:${C.attrCap(p, k)}%"></u></div></div></div>`).join('')}</div>
        ${gk ? `<div class="kstyle">Style: ${C.KEEPER_STYLE(p).map(s => `<span>${s}</span>`).join('')}</div>` : ''}</div>
      <h3 class="jh">Development ${STARS(p.stars)} <small class="devp">${p.stars >= 5 ? 'all 5 stars' : `${p.dev}/${p.stars + 2} plans to next ★`}</small></h3>${devHTML}${C.gearRowHTML ? C.gearRowHTML(p) : ''}
      <h3 class="jh">Squad number</h3>
      <div class="card numcard"><svg class="jersey" viewBox="0 0 60 60"><path d="M18 6 L24 4 Q30 9 36 4 L42 6 L56 14 L50 26 L44 23 V56 H16 V23 L10 26 L4 14Z" fill="${kitOf(p).k1}" stroke="${kitOf(p).k2}" stroke-width="1.5"/><text x="30" y="44" text-anchor="middle" font-family="Graduate,serif" font-size="20" fill="${kitOf(p).k2}">${p.num}</text></svg>
        <div style="flex:1"><b style="font-size:15px">Wears No. ${p.num}</b><br><small class="mutey">${p.want ? (p.want === p.num ? 'Their favourite number · 😀' : `Wants No. ${p.want} · morale lower until they get it`) : 'No preference'}</small></div>
        <button class="btn sm2" data-act="numbers" data-v="${id}">Change</button></div>
      ${p.want && p.want !== p.num ? `<button class="btn full sec2" data-act="numpick" data-v="${id}|${p.want}" style="margin-top:8px">Give No. ${p.want} (🎟 1)${car.squad.some(x => x.num === p.want) ? ' · worn by ' + C.esc(C.sn(car.squad.find(x => x.num === p.want))) : ''}</button>` : ''}
      <h3 class="jh">Package <button class="hlink" data-act="academic" data-v="">📚</button></h3>
      <div class="card srows"><div class="srow"><span>Scholarship</span><b>${p.acad ? '📚 Academic aid (college pays)' : p.schol ? `🎓 ${C.money(p.schol)}/yr · ${Math.round(p.schol / car.job.coa * 100)}% of costs` : 'Walk-on (no athletic aid)'}</b></div>
        ${!p.acad && C.poolLeft() >= 500 && (p.schol || 0) < car.job.coa ? `<div class="srow"><span>Pool left ${C.money(C.poolLeft())}</span><button class="btn sm2 pri" data-act="schup" data-v="${p.id}">+$500 scholarship</button></div>` : ''}
        ${extras.length ? `<div class="srow"><span>Extras</span><b>${extras.join(' · ')}</b></div>` : ''}
        ${p.promise ? `<div class="srow"><span>Promise</span><b>${C.ROLES[p.promise][0]} ${C.ROLES[p.promise][1]} · ${kept ? '<span style="color:var(--fit5)">kept ✔</span>' : '<span style="color:var(--fit1)">not kept ✖</span>'}</b></div>` : ''}
        ${p.from ? `<div class="srow"><span>Joined from</span><b>${C.esc(p.from)}</b></div>` : ''}
        <div class="srow"><span>Leadership</span><b>${p.lead}</b></div></div>
      ${p.promise ? `<p class="note">Promises are checked against real minutes once 3 matches are played${p.ss && p.ss.apps ? ` (started ${p.ss.st} of ${C.sea().fx.filter(f => (f.h === 0 || f.a === 0) && f.hs != null).length})` : ''}.</p>` : ''}
      <div class="jbtns"><button class="btn sec2" data-act="captain" data-v="${id}">${car.captains.includes(id) ? '✖ Remove captain' : '🅲 Make captain'}</button><button class="btn danger" data-act="release" data-v="${id}">Release…</button></div>
      <h3 class="jh">This season</h3><div class="kpis">${p.ss && p.ss.apps ? `<div class="kpi"><b>${p.ss.apps}</b><small>Apps</small></div><div class="kpi"><b>${p.pos === 'GK' ? p.ss.cs : p.ss.g}</b><small>${p.pos === 'GK' ? 'Clean sheets' : 'Goals'}</small></div><div class="kpi"><b>${p.ss.a}</b><small>Assists</small></div><div class="kpi"><b>${(p.ss.rs / p.ss.apps).toFixed(1)}</b><small>Avg rating</small></div>` : '<p class="note" style="grid-column:1/-1;margin:0">No matches yet this season.</p>'}</div>
      ${p.cs ? `<p class="note">Career: ${p.cs.seasons} season${p.cs.seasons > 1 ? 's' : ''} · ${p.cs.apps} apps · ${p.cs.g} goals · ${p.cs.a} assists</p>` : ''}${p.inj ? `<p class="note" style="color:#b91c1c">🩹 Injured: out for ${p.inj} more match${p.inj > 1 ? 'es' : ''}</p>` : ''}${p.ban ? '<p class="note" style="color:#b91c1c">🟥 Suspended for the next match</p>' : ''}`;
  }

  // ================= train: a page with the player's core details fixed at the top =================
  // advice from the coach about THIS player: the key skill with the most room to grow
  const trainAdvice = p => { const A = C.attrsOf(p), keys = C.KEY[p.pos].filter(k => p.a[k] < C.attrCap(p, k)), others = Object.keys(A).filter(k => p.a[k] < C.attrCap(p, k));
    const pool = keys.length ? keys : others; if (!pool.length) return `${p.fn} is at their limit in every skill. Consider retraining a position.`;
    const best = pool.sort((a, b) => (C.attrCap(p, b) - p.a[b]) - (C.attrCap(p, a) - p.a[a]))[0];
    return `For ${p.fn} I'd work on ${A[best][1]}: ${keys.length ? 'a key skill for a ' + p.pos + ' with' : 'it has'} the most room to grow (${p.a[best]}, can reach ${C.attrCap(p, best)}).`; };
  const trainBoosts = p => { const b = [], lv = C.level('training'), pb = Math.round(C.pbv('trn') * 100), co = Math.round(C.staffF('dev') * 25);
    if (C.event && C.event().id === 'camp') b.push(['🏋️', 'Training Camp event', '−25% time', 1]);
    if (lv) b.push(['⚽', `Training Ground Lv ${lv}`, `+${Math.round(lv * C.ECON.training.speedPerLv * 1000) / 10}% speed`]); if (pb) b.push(['📋', 'Playbook', `+${pb}% speed`]); if (co) b.push(['🧢', 'Development coach', `+${co}% speed`]); if (p.year <= 2) b.push(['🎓', p.year === 1 ? 'Freshman' : 'Sophomore', `+${p.year === 1 ? 20 : 10}% speed`]);
    return `<div class="trboost">${b.map(x => `<span class="${x[3] ? 'evb' : ''}">${x[0]} ${x[1]} <b>${x[2]}</b></span>`).join('')}</div>`; };
  const planInfo = (p, f) => { const A = C.attrsOf(p); return f.startsWith('pos:') ? `Retrain as ${f.slice(4)}` : `${A[f][1]} ${p.a[f]} → ${Math.min(C.attrCap(p, f), p.a[f] + (p.year <= 2 ? 2 : 1))}`; };
  C.openTrain = id => C.ui.open('Training plan', () => {
    const p = C.P(id), A = C.attrsOf(p), c = C.onStaff().find(x => x.spec === (p.pos === 'GK' ? 'gk' : 'dev')) || C.onStaff().find(x => x.spec === 'gen') || C.onStaff()[0];
    const rows = Object.keys(A).map(k => { const cap = C.attrCap(p, k), at = p.a[k] >= cap;
      return `<button class="lrow ${at ? 'lock' : ''}" ${at ? 'disabled' : `data-act="planask" data-v="${id}|${k}"`}><span class="li">${A[k][0]}</span><span class="lt"><b>${A[k][1]} ${p.a[k]} → ${Math.min(cap, p.a[k] + (p.year <= 2 ? 2 : 1))}</b><small>${at ? "At this player's limit" : `⏱ ${C.dur(C.planTime(p, k))} · 💵 ${C.full(C.planCost(p, k))}`}</small></span><span class="lr">${C.KEY[p.pos].includes(k) ? '<span class="pill">Key</span>' : ''}</span></button>`; }).join('');
    return `<div class="trhd"><div class="trp"><div class="phf sm">${C.faceOf(p)}</div><div class="trn"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><div class="pmatch">${C.topPositions(p).map(([x, v]) => `<i style="background:${C.FITPILL[C.fit(p, x)]}">${x}${v}</i>`).join('')}</div></div>
        <div class="trk"><b>${p.rating}</b><small>Rating</small></div><div class="trk"><b style="color:var(--fit5)">${p.pot}</b><small>Potential</small></div></div>${trainBoosts(p)}</div>
      ${c ? `<div class="advice"><div class="advf">${C.coachFace(c)}</div><p><b>${C.esc(c.fn)} ${C.esc(c.ln)} · ${C.SPECS[c.spec][1]}</b>${C.esc(trainAdvice(p))}</p></div>` : ''}
      <p class="note">${p.year <= 2 ? 'Young players improve fastest: +2 per plan.' : 'Upperclassmen improve slower: +1 per plan.'} ${p.stars < 5 ? `${p.stars + 2 - p.dev} more plan${p.stars + 2 - p.dev > 1 ? 's' : ''} earn${p.stars + 2 - p.dev > 1 ? '' : 's'} a Development Star.` : ''}</p>
      ${rows}<button class="lrow" data-act="reposask" data-v="${id}"><span class="li">🔄</span><span class="lt"><b>Reposition training</b><small>Learn a new position</small></span><span class="lr">›</span></button>`;
  });
  const A2 = C.ACTS;
  // not a slot free? Say how to get more, offering only what you don't already have
  C.slotsBusy = () => { const a = C.acct(), vip = C.isVip();
    C.ui.open('All training slots busy', () => `<p class="note" style="margin-top:0">Every training slot is in use. Wait for one to finish, or open another:</p>
      ${C.level('training') < 10 ? `<button class="lrow" data-act="bldopen" data-v="training"><span class="li">⚽</span><span class="lt"><b>Training Ground Lv 10</b><small>Earns a slot for free · now Lv ${C.level('training')}</small></span><span class="lr">›</span></button>` : ''}
      ${vip ? '' : `<button class="lrow" data-act="storeat" data-v="passes"><span class="li">👑</span><span class="lt"><b>Coach's Club</b><small>+1 training slot and more</small></span><span class="lr">$4.99/mo</span></button>`}
      ${a.tslot3 ? '' : `<button class="lrow" data-act="storeat" data-v="items"><span class="li">🏋️</span><span class="lt"><b>Extra Training Slot</b><small>A permanent extra slot</small></span><span class="lr">$2.99</span></button>`}`, { popup: true }); };
  A2.train = v => { if (!C.devFree()) return C.slotsBusy(); C.openTrain(v); };
  // every selection confirms first
  A2.planask = v => { const [id, f] = v.split('|'), p = C.P(id); C.confirm('Start training?', `<div class="card"><b style="font-size:15px">${C.esc(C.sn(p))}: ${planInfo(p, f)}</b><div class="srow" style="margin-top:6px"><span>Time</span><b>⏱ ${C.dur(C.planTime(p, f))}</b></div><div class="srow"><span>Cost</span><b>💵 ${C.full(C.planCost(p, f))}</b></div></div>`, 'Start', 'plan', v); };
  A2.reposask = id => { const p = C.P(id), near = C.nearPositions(p);
    C.ui.open('Reposition training', () => `<p class="note" style="margin-top:0">Current positions:</p><div class="pmatch" style="margin-bottom:8px">${C.topPositions(p).map(([x, v]) => `<i style="background:${C.FITPILL[C.fit(p, x)]}">${x}${v}</i>`).join('')}</div>
      ${near.length ? near.map(q => `<button class="lrow" data-act="planask" data-v="${id}|pos:${q}"><span class="li">🔄</span><span class="lt"><b>Retrain as ${q}</b><small>${C.FITLABEL[C.fit(p, q)]} now · ⏱ ${C.dur(C.planTime(p, 'pos:' + q))} · 💵 ${C.full(C.planCost(p, 'pos:' + q))}</small></span></button>`).join('') : '<p class="note">No nearby positions to learn.</p>'}`, { popup: true }); };
  A2.plan = v => { const [pid, f] = v.split('|'), r = C.startPlan(pid, f);
    if (r === true) { C.toast('🏋️ Training plan started'); C.ui.popTo('Player'); if (C.tab === 'squad') C.render(); }
    else if (r === 'pre') C.toast('🗓 Player training starts with the season'); else if (r === 'cash') C.toast('Not enough Booster $'); else if (r === 'cap') C.toast("At this player's limit"); else C.slotsBusy(); };
  // speeding up training is explained, and confirmed
  A2.devspeedpop = id => { const q = C.inDev(id); if (!q) return; const free = C.isFreeFinish(q), g = C.goldToFinish(q), p = C.P(id);
    C.ui.open('Speed up training', () => `<div class="card"><b>${C.esc(C.sn(p))}</b><div class="srow"><span>Time left</span><b data-dtimer="${id}">${C.dur(C.remaining(q))}</b></div></div>
      <p class="note">Finish the plan straight away, or wait: plans keep running while you're away.${free ? ' With 2 minutes or less left, it is free.' : ''}</p>
      <button class="btn full ${free || C.acct().gold >= g ? 'pri' : 'sec2'}" data-act="devfinish" data-v="${id}">${free ? 'Finish for free' : `Finish now · <i class="coin"></i> ${g}`}</button><p class="note" style="text-align:center">You have <i class="coin"></i> ${C.short(C.acct().gold)}</p>${C.speedRow ? (C.speedRow('t', id) ? `<label class="fld">Or use a speed-up</label>${C.speedRow('t', id)}` : '<p class="note">Training speed-ups come from Missions, events and the Store.</p>') : ''}`, { popup: true }); };
  A2.devfinish = id => { const q = C.inDev(id); if (!q) return C.ui.back(); if (!C.isFreeFinish(q)) { const g = C.goldToFinish(q); if (C.acct().gold < g) return C.toast('Not enough Coins'); C.acct().gold -= g; } q.end = C.now(); C.tickDev().forEach(m => C.toast(m)); C.save(); C.ui.back(); C.ui.refresh(); C.render(); };
  A2.devslot = v => { if (v === 'prog') return C.ui.open('Training Ground Lv 10', () => `<p class="note" style="margin-top:0">This training slot opens when your Training Ground reaches <b>Lv 10</b>. It's Lv ${C.level('training')} now.</p><button class="btn full pri" data-act="bldopen" data-v="training">Go to the Training Ground</button>`, { popup: true });
    C.openStoreAt && C.openStoreAt(v === 'vip' ? 'passes' : 'items'); };
  // 1.03.01 (QA-42 a): small amounts left in the scholarship pool can top up any player in $500 steps (up to the full cost to attend);
  // the player is pleased (+3 morale, provisional)
  A2.schup = id => { const p = C.P(id), car = C.car(); if (!p || p.acad || C.poolLeft() < 500) return; const add = Math.min(500, car.job.coa - (p.schol || 0)); if (add <= 0) return;
    p.schol = (p.schol || 0) + add; p.morale = Math.min(100, (p.morale || 60) + 3); C.save(); C.toast(`🎓 ${C.sn(p)}: scholarship ${C.money(p.schol)} a year`); C.ui.refresh(); };
  A2.storeat = v => C.openStoreAt && C.openStoreAt(v);

  // ================= numbers: taken numbers swap, and you see who you'd be taking one from =================
  C.openNumbers = id => C.ui.open('Squad number', () => {
    const p = C.P(id), car = C.car(), taken = {}, roles = C.roles(); car.squad.forEach(x => taken[x.num] = x);
    const nums = []; for (let n = 1; n <= 40; n++) nums.push(n);
    // 1.02 (FEEDBACK 155): the tickets up front with ways to get more; grid classes renamed (.tok/.tk clashed with the Tactics pitch markers)
    const tk = car.tokens || 0;
    return `<div class="card ticketcard"><span class="tki">🎟</span><div><b>${tk} Number Change${tk === 1 ? "" : "s"}</b><small>${tk ? 'Each change uses one.' : 'You need one to change a number.'}</small></div>
        <div class="tkbtns"><button class="btn sm2 sec2" data-act="events">Events</button><button class="btn sm2 pri" data-act="numstore">Store</button></div></div>
      <p class="note" style="margin-top:8px">Tap a number. If someone wears it, you'll see who they are, and the two of you swap.</p>
      <div class="numgrid ${tk ? '' : 'nolock'}">${nums.map(n => { const t = taken[n], w = t && t.want === n; return `<button class="${t ? (t.id === id ? 'nme' : 'ntaken') : ''} ${p.want === n ? 'nwant' : ''} ${w && t.id !== id ? 'nfav' : ''} ${t && t.id !== id && roles[t.id] === 'xi' ? 'nreg' : ''}" data-act="${t && t.id === id ? 'toast' : 'numpick'}" data-v="${t && t.id === id ? 'Already wearing it' : id + '|' + n}">${n}</button>`; }).join('')}</div>
      <p class="note">⭐ = the number ${C.esc(p.fn)} wants · ❤ = the holder's favourite · bold = worn by a starter. Get more Number Changes from Events and the Store.</p>`;
  });
  A2.numpick = v => { const [id, ns] = v.split('|'), n = +ns, p = C.P(id), car = C.car(), o = car.squad.find(q => q.num === n && q.id !== id), roles = C.roles();
    const rolTxt = { xi: 'a starter', bench: 'on the bench', res: 'in the reserves' };
    const who = o ? `<div class="card numo"><div class="relface">${C.faceOf(o)}</div><div><b>${C.esc(o.fn)} ${C.esc(o.ln)}</b><small>${o.pos} · rating ${o.rating} · ${rolTxt[roles[o.id]]}</small><small>${o.want === n ? `<span class="short">❤ No. ${n} is their favourite: losing it hurts their morale</span>` : 'No strong feeling about this number'}</small></div></div>` : '';
    C.confirm(o ? `Swap No. ${n}?` : `Take No. ${n}?`, `${who}<p class="note">${C.esc(p.fn)} takes No. ${n}${o ? `, and ${C.esc(o.fn)} takes No. ${p.num}` : ''}. ${p.want === n ? 'That\'s the number they want. 😀 ' : ''}Uses 🎟 1 (you have ${car.tokens}).</p>`, 'Confirm', 'numgo', v); };
  A2.numgo = v => { const [id, n] = v.split('|'), r = C.swapNumber(id, +n); if (r === 'ok') { C.toast('🎟 Number changed'); C.ui.popTo('Player'); C.render(); } else C.toast('No Number Changes left (see the Store)'); };

  // ================= release =================
  C.openRelease = id => C.ui.open('Release player', () => {
    const p = C.P(id);
    return `<div class="collegecard"><div class="relface">${C.faceOf(p)}</div><div><b style="font-size:17px">${C.esc(p.fn)} ${C.esc(p.ln)}</b><br><small class="mutey">${p.pos} · ${yrN[p.year]} · rating ${p.rating}</small></div></div>
      <div class="card" style="margin-top:12px;font-size:14px;line-height:1.5;font-weight:700">If you release ${C.esc(p.fn)}:<br>🎓 ${p.schol ? C.money(p.schol) + ' a year goes back to your scholarship pool' : 'no scholarship money is freed (walk-on)'}<br>🚪 They enter the transfer portal<br>😐 Squad morale dips slightly</div>
      <div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Keep</button><button class="btn danger" data-act="releaseyes" data-v="${id}">Release</button></div>`;
  });
})(window.CFC);
