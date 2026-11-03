// Club FC: squad screens (Phases 3–4). Squad list, player card, training plans, numbers, captains, release.
(function (C) {
  let filter = 'all';
  const yrN = ['', 'Fr', 'So', 'Jr', 'Sr'];
  const ec = e => e >= 80 ? '#16a34a' : e >= 60 ? '#84cc16' : e >= 40 ? '#eab308' : '#f97316';
  const moraleIcon = m => m >= 80 ? '😀' : m >= 65 ? '🙂' : m >= 50 ? '😐' : m >= 35 ? '🙁' : '😟';
  const ROLE = { xi: ['XI', 'var(--school)'], bench: ['Bench', 'var(--sky)'], res: ['Reserves', 'var(--silver)'] };
  C.yrIcon = n => { const r = 6, c = 2 * Math.PI * r; return `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="3"/><circle cx="8" cy="8" r="${r}" fill="none" stroke="var(--school2)" stroke-width="3" stroke-dasharray="${c * n / 4} ${c}" transform="rotate(-90 8 8)"/></svg>`; };
  const kitOf = p => { const col = C.college(), k = C.kitColours(col.c1, col.c2); return p.pos === 'GK' ? { k1: '#facc15', k2: '#111827' } : { k1: k[0], k2: k[1] }; };
  C.faceOf = (p, vb = '24 12 72 72') => `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">${window.faceV4(Object.assign({}, p.look, kitOf(p)))}</svg>`;
  const schLabel = p => (p.acad && !p.schol ? '📚 Aid' : p.schol ? `🎓 ${Math.round(p.schol / C.car().job.coa * 100)}%` : 'Walk-on') + (p.cjob ? ' + 💼' : '');

  // ================= squad list =================
  C.squadHTML = () => {
    const car = C.car(), sq = car.squad, roles = C.roles(), col = C.college();
    const list = sq.filter(p => filter === 'all' || roles[p.id] === filter).sort((a, b) => ({ xi: 0, bench: 1, res: 2 }[roles[a.id]] - { xi: 0, bench: 1, res: 2 }[roles[b.id]]) || ['gk', 'def', 'mid', 'fwd'].indexOf(C.POSGROUP(a.pos)) - ['gk', 'def', 'mid', 'fwd'].indexOf(C.POSGROUP(b.pos)) || b.rating - a.rating);
    const count = k => sq.filter(p => roles[p.id] === k).length;
    const dev = C.DEVSLOTS.map((s, i) => { const q = car.devq[i];
      if (q) { const p = C.P(q.pid), f = 1 - C.remaining(q) / ((q.end - q.start) / 1000); return `<button class="dq" data-act="player" data-v="${q.pid}"><span class="c">${C.ringSVG(f, '#22c55e', 46)}<i>${C.faceOf(p)}</i></span><b data-dtimer="${q.pid}">${C.dur(C.remaining(q))}</b></button>`; }
      return C.devSlotOpen(s.id) ? `<button class="dq free" data-act="toast" data-v="Open a player card and tap Train"><span class="c">🏋️</span><b>Free</b></button>` : `<button class="dq lock" data-act="devslot" data-v="${s.id}"><span class="c">🔒</span><b>${s.id === 'vip' ? 'VIP' : s.id === 'iap' ? '$' : 'TG 10'}</b></button>`; }).join('');
    const rare = car.items && car.items.rareRecruit ? `<button class="rarebn" data-act="rare">🎁 You have a Rare recruit from your First Week. <b>Sign them</b>${car.squad.length >= C.rosterCap() ? ' (roster full: upgrade the Dorms or release a player)' : ''}</button>` : '';
    return `<div class="view scrolly">
      <div class="phdr sq"><div class="row1">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 38)}<div><b>Squad</b><small>${sq.length} / ${C.rosterCap()} players · 🎟 ${car.tokens} number changes</small></div></div>
        <div class="res hres">${C.resBar()}</div><div class="chips">${C.schChip()}</div>
        <div class="dqrow"><span>Training plans</span>${dev}</div><div class="sqbtns"><button class="tacbn" data-act="tactics"><i class="xoi"></i> Tactics · ${C.tac().form}</button><button class="tacbn" data-act="medical">🩺 Medical${car.squad.filter(p => p.inj).length ? ' · ' + car.squad.filter(p => p.inj).length : ''}</button></div></div>
      ${rare}<div style="padding:0 16px">${C.advice(sq.some(p => p.energy < 60) ? 'snc' : 'mot')}</div>
      <div class="filters">${[['all', 'All ' + sq.length], ['xi', 'XI ' + count('xi')], ['bench', 'Bench ' + count('bench')], ['res', 'Reserves ' + count('res')]].map(([k, n]) => `<button class="f ${filter === k ? 'on' : ''}" data-act="sqf" data-v="${k}">${k !== 'all' ? `<i style="background:${ROLE[k][1]}"></i>` : ''}${n}</button>`).join('')}</div>
      ${list.map(p => `<button class="prow" style="--mk:${ROLE[roles[p.id]][1]}" data-act="player" data-v="${p.id}">
        <div class="av plain"><div class="face">${C.faceOf(p)}</div><span class="num">${p.num}</span></div>
        <div class="pinfo"><b>${C.esc(p.fn)} ${C.esc(p.ln)}${car.captains.includes(p.id) ? ' <span class="cap">C</span>' : ''}${p.want && p.want !== p.num ? ' <span title="Wants a different number">🎟</span>' : ''}${C.inDev(p.id) ? ' <span title="In training">🏋️</span>' : ''}${p.inj ? ' <span title="Injured">🩹</span>' : ''}${p.ban ? ' <span title="Suspended">🟥</span>' : ''}</b>
          <div class="tags"><span class="pos ${C.POSGROUP(p.pos)}">${p.pos}</span><span class="yr plain">${yrN[p.year]}</span><span class="sch">${schLabel(p)}</span>${p.rs ? '<span class="sch">🎽</span>' : ''}</div>
          <div class="pmatch">${C.topPositions(p).map(([x, v]) => `<i style="background:${C.FITPILL[C.fit(p, x)]}">${x}${v}</i>`).join('')}<span class="cond" style="color:${C.condCol(p.energy)}">${C.condRing(p.energy, 14)} ${Math.round(p.energy)}%</span></div></div>
        <div class="rate"><b>${p.rating}</b>${p.up > 0 ? `<span class="up">▲ +${p.up}</span>` : `<small>${moraleIcon(p.morale)}</small>`}</div></button>`).join('')}
      <p class="note" style="padding:0 16px">XI and bench come from your Tactics. Freshness drops when players play and comes back when they rest a match.</p></div>`;
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
        <button class="btn sm2" data-act="devspeed" data-v="${id}">${C.isFreeFinish(q) ? 'Free' : '<i class="coin"></i> ' + C.goldToFinish(q)}</button></div>`
      : `${C.capNote ? C.capNote(p) : ''}<button class="btn full pri" data-act="train" data-v="${id}">🏋️ Train</button>`;
    const P = C.portalOpen(), risk = P && P.risk[id], roleNow = C.roles()[id];
    const kept = C.promiseKept(p, roleNow);
    const extras = [p.acad && p.schol ? '📚 Academic aid' : '', p.cjob ? '💼 Campus job' : '', p.house ? '🏠 Housing help' : '', p.raise ? `📈 +${Math.round(p.raise * 100)}% next year` : ''].filter(Boolean);
    return `${risk ? `<button class="riskbn" data-act="keep" data-v="${id}">🚪 Thinking about the portal: ${C.REASONS[risk.why][0]} ${C.REASONS[risk.why][2]}. <b>Try to keep</b></button>` : ''}<div class="hero" style="background:${heroBg};margin:0 -16px">
        <div class="bignum">${p.num}</div><svg class="port" viewBox="0 0 120 120">${window.faceV4(Object.assign({}, p.look, kitOf(p), { num: p.num }))}</svg>
        <div class="nameplate"><b>${C.esc(p.fn)} ${C.esc(p.ln)}${car.captains.includes(id) ? ' <span class="cap big">C</span>' : ''}</b>
          <div class="tags"><span class="pos ${C.POSGROUP(p.pos)}">${p.pos}</span><span class="yr plain" style="border-color:rgba(255,255,255,.5);color:#fff">${yrN[p.year]}</span><span class="stars">${'★'.repeat(p.stars)}${'☆'.repeat(5 - p.stars)}</span><span class="rarp" style="background:${rar[1]}">${rar[0]}</span></div>
          <small class="hometown">${p.flag} ${C.esc(p.town)} · GPA ${p.gpa}</small></div></div>
      <div class="kpis" style="margin-top:12px">
        <div class="kpi"><b>${p.rating}</b><small>Rating</small></div><div class="kpi"><b style="color:var(--fit5)">${p.pot}</b><small>Potential</small></div>
        <div class="kpi"><div class="mini">${C.ringSVG(p.energy / 100, ec(p.energy), 40, 4)}<span>${Math.round(p.energy)}%</span></div><small>Freshness</small></div>
        <div class="kpi"><b style="font-size:24px">${moraleIcon(p.morale)}</b><small>Morale</small></div></div>
      <h3 class="jh">${gk ? 'Goalkeeping' : 'Skills'} <button class="hlink" data-act="help" data-v="attrs">?</button></h3>
      <div class="card"><div class="attrs">${Object.keys(A).map(k => `<div class="attr ${C.KEY[p.pos].includes(k) ? 'key' : ''}"><span class="ai">${A[k][0]}</span><div class="ab"><div><span>${A[k][1]}</span><em>${p.a[k]}</em></div><div class="bar"><i style="width:${p.a[k]}%;background:${acol(p.a[k])}"></i></div></div></div>`).join('')}</div>
        ${gk ? `<div class="kstyle">Style: ${C.KEEPER_STYLE(p).map(s => `<span>${s}</span>`).join('')}</div>` : `<div class="kstyle">Also plays: ${p.sec.length ? p.sec.map(s => `<span>${s}</span>`).join('') : '<span>Only ' + p.pos + '</span>'}</div>`}</div>
      <h3 class="jh">Development <small class="devp">${p.dev}/${p.stars + 2} to next ★</small></h3>${devHTML}${C.gearRowHTML ? C.gearRowHTML(p) : ''}
      <h3 class="jh">Squad number <span class="tok">🎟 ${car.tokens}</span></h3>
      <div class="card numcard"><svg class="jersey" viewBox="0 0 60 60"><path d="M18 6 L24 4 Q30 9 36 4 L42 6 L56 14 L50 26 L44 23 V56 H16 V23 L10 26 L4 14Z" fill="${kitOf(p).k1}" stroke="${kitOf(p).k2}" stroke-width="1.5"/><text x="30" y="44" text-anchor="middle" font-family="Graduate,serif" font-size="20" fill="${kitOf(p).k2}">${p.num}</text></svg>
        <div style="flex:1"><b style="font-size:15px">Wears No. ${p.num}</b><br><small class="mutey">${p.want ? (p.want === p.num ? 'Their favourite number · 😀' : `Wants No. ${p.want} · morale lower until they get it`) : 'No preference'}</small></div>
        <button class="btn sm2" data-act="numbers" data-v="${id}">Change</button></div>
      ${p.want && p.want !== p.num ? `<button class="btn full sec2" data-act="givenum" data-v="${id}" style="margin-top:8px">Give No. ${p.want} (🎟 1)${car.squad.some(x => x.num === p.want) ? ' · taken by ' + C.esc(car.squad.find(x => x.num === p.want).ln) : ''}</button>` : ''}
      <h3 class="jh">Package</h3>
      <div class="card srows"><div class="srow"><span>Scholarship</span><b>${p.acad ? '📚 Academic aid (college pays)' : p.schol ? `🎓 ${C.money(p.schol)}/yr · ${Math.round(p.schol / car.job.coa * 100)}% of costs` : 'Walk-on (no athletic aid)'}</b></div>
        ${extras.length ? `<div class="srow"><span>Extras</span><b>${extras.join(' · ')}</b></div>` : ''}
        ${p.promise ? `<div class="srow"><span>Promise</span><b>${C.ROLES[p.promise][0]} ${C.ROLES[p.promise][1]} · ${kept ? '<span style="color:var(--fit5)">kept ✔</span>' : '<span style="color:var(--fit1)">not kept ✖</span>'}</b></div>` : ''}
        ${p.from ? `<div class="srow"><span>Joined from</span><b>${C.esc(p.from)}</b></div>` : ''}
        <div class="srow"><span>Leadership</span><b>${p.lead}</b></div></div>
      ${p.promise ? `<p class="note">Promises are checked against real minutes once 3 matches are played${p.ss && p.ss.apps ? ` (started ${p.ss.st} of ${C.sea().fx.filter(f => (f.h === 0 || f.a === 0) && f.hs != null).length})` : ''}.</p>` : ''}
      <div class="jbtns"><button class="btn sec2" data-act="captain" data-v="${id}">${car.captains.includes(id) ? '✖ Remove captain' : '🅲 Make captain'}</button><button class="btn danger" data-act="release" data-v="${id}">Release…</button></div>
      <h3 class="jh">This season</h3><div class="kpis">${p.ss && p.ss.apps ? `<div class="kpi"><b>${p.ss.apps}</b><small>Apps</small></div><div class="kpi"><b>${p.pos === 'GK' ? p.ss.cs : p.ss.g}</b><small>${p.pos === 'GK' ? 'Clean sheets' : 'Goals'}</small></div><div class="kpi"><b>${p.ss.a}</b><small>Assists</small></div><div class="kpi"><b>${(p.ss.rs / p.ss.apps).toFixed(1)}</b><small>Avg rating</small></div>` : '<p class="note" style="grid-column:1/-1;margin:0">No matches yet this season.</p>'}</div>
      ${p.cs ? `<p class="note">Career: ${p.cs.seasons} season${p.cs.seasons > 1 ? 's' : ''} · ${p.cs.apps} apps · ${p.cs.g} goals · ${p.cs.a} assists</p>` : ''}${p.inj ? `<p class="note" style="color:#b91c1c">🩹 Injured: out for ${p.inj} more match${p.inj > 1 ? 'es' : ''}</p>` : ''}${p.ban ? '<p class="note" style="color:#b91c1c">🟥 Suspended for the next match</p>' : ''}`;
  }

  // ================= train =================
  C.openTrain = id => C.ui.open('Training plan', () => {
    const p = C.P(id), A = C.attrsOf(p), car = C.car();
    const rows = Object.keys(A).map(k => { const cap = C.attrCap(p, k), at = p.a[k] >= cap;
      return `<button class="lrow ${at ? 'lock' : ''}" data-act="plan" data-v="${id}|${k}"><span class="li">${A[k][0]}</span><span class="lt"><b>${A[k][1]} ${p.a[k]} → ${Math.min(cap, p.a[k] + (p.year <= 2 ? 2 : 1))}</b><small>${at ? 'At this player\'s limit' : `⏱ ${C.dur(C.planTime(p, k))} · 💵 ${C.short(C.planCost(p, k))}`}</small></span><span class="lr">${C.KEY[p.pos].includes(k) ? '<span class="pill">Key</span>' : ''}</span></button>`; }).join('');
    const pos = C.nearPositions(p).map(q => `<button class="lrow" data-act="plan" data-v="${id}|pos:${q}"><span class="li">🔄</span><span class="lt"><b>Retrain as ${q}</b><small>${C.FITLABEL[C.fit(p, q)]} now · ⏱ ${C.dur(C.planTime(p, 'pos:' + q))} · 💵 ${C.short(C.planCost(p, 'pos:' + q))}</small></span></button>`).join('');
    return `${C.advice(p.pos === 'GK' ? 'gk' : 'dev')}<div class="raytake" style="margin-top:0"><span>🏋️</span><p><b>Training</b>${p.year <= 2 ? 'Young players improve fastest: +2 per plan.' : 'Upperclassmen improve slower: +1 per plan.'} Every ${p.stars + 2} plans earns a Development Star.</p></div>
      ${C.devFree() ? '' : '<p class="note" style="color:#b91c1c">All training slots are busy.</p>'}
      ${rows}${pos ? `<label class="fld">Position retraining</label>${pos}` : ''}
      <p class="note">Training Ground Lv ${C.level('training')} speeds plans up by ${C.level('training') * 3}%. Plans keep running while you're away.</p>`;
  });

  // ================= numbers =================
  C.openNumbers = id => C.ui.open('Squad number', () => {
    const p = C.P(id), car = C.car(), taken = {}; car.squad.forEach(x => taken[x.num] = x);
    const nums = []; for (let n = 0; n <= 40; n++) nums.push(n);
    return `<p class="note" style="margin-top:0">Numbers are hard to take back: changing one uses a 🎟 Number Change. You have <b>${car.tokens}</b>.</p>
      <div class="numgrid">${nums.map(n => { const t = taken[n]; return `<button class="${t ? (t.id === id ? 'me' : 'tk') : ''} ${p.want === n ? 'want' : ''}" data-act="${t ? 'toast' : 'setnum'}" data-v="${t ? (t.id === id ? 'Already wearing it' : 'Taken by ' + C.esc(t.fn + ' ' + t.ln)) : id + '|' + n}">${n}</button>`; }).join('')}</div>
      <p class="note">⭐ = the number ${C.esc(p.fn)} wants. More Number Changes come from events, the Season Pass and the store.</p>`;
  });

  // ================= release =================
  C.openRelease = id => C.ui.open('Release player', () => {
    const p = C.P(id);
    return `<div class="collegecard"><div class="relface">${C.faceOf(p)}</div><div><b style="font-size:17px">${C.esc(p.fn)} ${C.esc(p.ln)}</b><br><small class="mutey">${p.pos} · ${yrN[p.year]} · rating ${p.rating}</small></div></div>
      <div class="card" style="margin-top:12px;font-size:14px;line-height:1.5;font-weight:700">If you release ${C.esc(p.fn)}:<br>🎓 ${p.schol ? C.money(p.schol) + ' a year goes back to your scholarship pool' : 'no scholarship money is freed (walk-on)'}<br>🚪 They enter the transfer portal<br>😐 Squad morale dips slightly</div>
      <div class="jbtns" style="grid-template-columns:1fr 1fr"><button class="btn sec2" data-act="back">Keep</button><button class="btn danger" data-act="releaseyes" data-v="${id}">Release</button></div>`;
  });
})(window.CFC);
