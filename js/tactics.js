// Club FC: tactics (Phase 5, Q18). Formation, mentality, the XI and bench, instructions, and the player picker.
(function (C) {
  const FITC = ['', '#dc2626', '#f97316', '#eab308', '#84cc16', '#16a34a'], FITS = ['', '!', '!', '~', '✓', '✓'];
  const INSTR = [['⬇⬇', 'Ultra defensive'], ['⬇', 'Defensive'], ['•', 'Balanced'], ['⬆', 'Attacking'], ['⬆⬆', 'Ultra attacking']];
  const MENT_ICON = ['🧱', '🛡', '⚖️', '⚔️', '🔥'];
  C.available = p => p && !p.inj && !p.ban;

  // ---------- the saved line-up, always kept valid ----------
  C.tac = () => {
    const car = C.car(); if (!car.tac) car.tac = { form: '4-3-3', ment: 2, xi: [], bench: [], instr: {}, auto: true };
    const t = car.tac, F = C.FORMATIONS[t.form], ok = id => { const p = C.P(id); return C.available(p); };
    t.xi = F.map((_, i) => ok(t.xi[i]) ? t.xi[i] : null);
    t.xi.forEach((id, i) => { if (id && t.xi.indexOf(id) !== i) t.xi[i] = null; });
    const score = (p, pos) => p.rating * [0, .5, .7, .85, .95, 1][C.fit(p, pos)] * (.6 + .4 * p.energy / 100) + (p.promise === 'starter' ? 6 : 0);
    t.empty = t.empty || [];
    F.forEach((s, i) => { if (t.xi[i] || t.empty[i]) return; let best = null, bs = -1; for (const p of car.squad) { if (!C.available(p) || t.xi.includes(p.id)) continue; const v = score(p, s[0]); if (v > bs) { bs = v; best = p; } } t.xi[i] = best ? best.id : null; });
    t.bench = t.bench.filter(id => ok(id) && !t.xi.includes(id));
    const rest = car.squad.filter(p => C.available(p) && !t.xi.includes(p.id) && !t.bench.includes(p.id)).sort((a, b) => b.rating - a.rating + (b.promise === 'rotation' ? 5 : 0) - (a.promise === 'rotation' ? 5 : 0));
    if (!t.bench.some(id => C.P(id).pos === 'GK')) { const gk = rest.find(p => p.pos === 'GK'); if (gk && t.bench.length < 9) { t.bench.unshift(gk.id); rest.splice(rest.indexOf(gk), 1); } }
    while (t.bench.length < 7 && rest.length) t.bench.push(rest.shift().id);
    return t;
  };
  // auto-manage rotation: swap XI players under 50% Freshness for a fresh player who fits (keeps promises where possible)
  C.autoRotate = () => {
    const car = C.car(), t = C.tac(); if (!t.auto) return 0; const F = C.FORMATIONS[t.form]; let n = 0;
    t.xi.forEach((id, i) => { const p = C.P(id); if (!p || p.energy >= 50) return;
      const pos = F[i][0], cand = car.squad.filter(q => C.available(q) && !t.xi.includes(q.id) && q.energy >= Math.max(45, p.energy + 25) && C.fit(q, pos) >= 3 && q.rating >= p.rating - 10)
        .sort((a, b) => (b.rating * [0, .5, .7, .85, .95, 1][C.fit(b, pos)]) - (a.rating * [0, .5, .7, .85, .95, 1][C.fit(a, pos)]))[0];
      if (!cand) return; const bi = t.bench.indexOf(cand.id); if (bi >= 0) t.bench[bi] = p.id; t.xi[i] = cand.id; n++; });
    if (n) C.save(); return n;
  };
  C.autoPick = () => { const t = C.tac(); t.xi = []; t.bench = []; t.empty = []; C.tac(); C.save(); };
  C.roles = () => { const t = C.tac(), out = {}; C.squad().forEach(p => out[p.id] = t.xi.includes(p.id) ? 'xi' : t.bench.includes(p.id) ? 'bench' : 'res'); return out; };
  C.setForm = f => { const t = C.tac(), old = C.FORMATIONS[t.form], F = C.FORMATIONS[f], ids = t.xi.slice(), nx = [];
    // keep players, moving each to the closest slot of the new shape
    F.forEach((s, i) => { let bi = -1, bd = 9; old.forEach((o, j) => { if (!ids[j]) return; const d = Math.hypot(o[1] - s[1], o[2] - s[2]) + (o[0] === s[0] ? -.2 : 0); if (d < bd) { bd = d; bi = j; } }); nx[i] = bi >= 0 ? ids[bi] : null; if (bi >= 0) ids[bi] = null; });
    t.form = f; t.xi = nx; t.empty = []; C.tac(); C.save(); };
  C.myTeam = home => {
    const car = C.car(), t = C.tac(), col = C.college();
    const kc = C.kitColours(col.c1, col.c2);
    return { name: col.short, short: col.short, abbr: col.abbr, c1: kc[0], c2: kc[1], form: t.form, ment: t.ment, xi: t.xi.map(C.P), bench: t.bench.map(C.P), instr: Object.assign({}, t.instr), auto: t.auto, home, me: true, bonus: C.teamBonus() };
  };

  // ---------- one token: kit circle, a dark gap, then the energy ring coloured by fit (Q18c) ----------
  C.tokenSVG = (p, fit, kit, size = 56, cap) => {
    const r = size / 2 - 3, c = 2 * Math.PI * r, e = Math.max(0, Math.min(1, p.energy / 100));
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(148,163,184,.45)" stroke-width="4"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${FITC[fit]}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${c * e} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r - 3}" fill="#0b1220"/><circle cx="${size / 2}" cy="${size / 2}" r="${r - 6}" fill="${kit[0]}" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>
      <text x="${size / 2}" y="${size / 2 + 6}" text-anchor="middle" font-family="Graduate,serif" font-size="${size * .3}" fill="${kit[1]}">${p.num}</text>
      ${cap ? `<g transform="translate(${size - 15},2)"><circle cx="6" cy="6" r="7" fill="#facc15" stroke="#0b1220" stroke-width="1.5"/><text x="6" y="10" text-anchor="middle" font-size="9" font-weight="900" fill="#0b1220">C</text></g>` : ''}</svg>`;
  };
  const kitOf = p => { const col = C.college(); return p.pos === 'GK' ? ['#facc15', '#111827'] : C.kitColours(col.c1, col.c2); };

  // ================= shared bits for the board, list and picker =================
  const PILL = ['#cbd5e1', '#f87171', '#fb923c', '#fcd34d', '#bef264', '#4ade80'];   // fit colours, lighter than the grass
  const ALLPOS = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'LM', 'RM', 'AM', 'LW', 'RW', 'ST'];
  // position labels with left/right for duplicates: LCM CM RCM, LCB RCB, LS RS
  C.slotLabels = form => { const F = C.FORMATIONS[form]; return F.map(s => { const same = F.filter(x => x[0] === s[0]); if (s[0] === 'GK' || same.length < 2 || (same.length === 3 && Math.abs(s[1] - .5) < .06)) return s[0]; return (s[1] < .5 ? 'L' : 'R') + (s[0] === 'ST' ? 'S' : s[0]); }); };
  // how good a player is in a given position (their attributes for that role, a little less if unfamiliar)
  C.posRating = (p, pos) => { if ((pos === 'GK') !== (p.pos === 'GK')) return Math.round(p.rating * .35);
    const key = C.KEY[pos], all = Object.keys(C.attrsOf(p)), km = key.reduce((s, k) => s + (p.a[k] || 0), 0) / key.length, am = all.reduce((s, k) => s + p.a[k], 0) / all.length;
    return Math.round((.6 * km + .4 * am) * [0, .85, .9, .95, .98, 1][C.fit(p, pos)]); };
  C.topPositions = p => p.pos === 'GK' ? [['GK', C.posRating(p, 'GK')]] : ALLPOS.filter(x => x !== 'GK').map(x => [x, C.posRating(p, x)]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const ring = (f, sz = 14) => { const r = sz / 2 - 2, c = 2 * Math.PI * r, col = f >= 70 ? '#4ade80' : f >= 50 ? '#facc15' : f >= 30 ? '#fb923c' : '#f87171';
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="rgba(148,163,184,.35)" stroke-width="2.4"/><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="2.4" stroke-dasharray="${c * Math.max(0, Math.min(1, f / 100))} ${c}" transform="rotate(-90 ${sz / 2} ${sz / 2})"/></svg>`; };
  const fcol = f => f >= 70 ? '#4ade80' : f >= 50 ? '#facc15' : f >= 30 ? '#fb923c' : '#f87171';
  C.condRing = ring; C.condCol = fcol; C.FITPILL = PILL;
  // status icons: captain, injured, suspended, one yellow from a ban
  C.badges = p => { const car = C.car(), b = [];
    if (car.captains.includes(p.id)) b.push('<i class="bdg cap" title="Captain">C</i>');
    if (p.inj) b.push(`<i class="bdg inj" title="Injured: out ${p.inj > 50 ? 'for the season' : p.inj + ' more'}">🩹</i>`);
    if (p.ban) b.push('<i class="bdg red" title="Suspended next match"></i>');
    else if (p.ss && p.ss.yc % 5 === 4) b.push('<i class="bdg yel" title="One more yellow card means a ban"></i>');
    return b.join(''); };

  // ================= tactics: board or list =================
  let tview = 'board';
  C.setTacView = v => { tview = v; C.ui.refresh(); };
  C.openTactics = (fromMatch) => C.ui.open('Tactics', () => `<div class="tacdef"><i class="xoi"></i> <b>Your default setup</b> · used for every match until you change it</div>` + boardHTML(fromMatch));
  function boardHTML(fromMatch) {
    const car = C.car(), t = C.tac(), F = C.FORMATIONS[t.form], L = C.slotLabels(t.form);
    const tokens = F.map((s, i) => { const p = C.P(t.xi[i]), left = s[1] * 100, top = 91 - s[2] * 83;
      if (!p) return `<div class="tk" style="left:${left}%;top:${top}%" data-act="pick" data-v="${i}"><button class="tkf empty" data-act="pick" data-v="${i}">+</button><button class="tkn" style="background:${PILL[0]}" data-act="pick" data-v="${i}"><span>Empty</span><i>▾</i></button><div class="tkm"><span class="tp">${L[i]}</span></div></div>`;
      const fit = C.fit(p, s[0]), ins = t.instr[p.id] ?? 2;
      return `<div class="tk" style="left:${left}%;top:${top}%" data-act="pick" data-v="${i}"><div class="tkb">${C.badges(p)}${ins !== 2 ? `<i class="bdg ins">${INSTR[ins][0]}</i>` : ''}</div>
        <button class="tkf" data-act="pick" data-v="${i}">${C.faceOf(p)}</button>
        <button class="tkn" style="background:${PILL[fit]}" data-act="pick" data-v="${i}"><span>${C.esc(p.ln)}</span><i>▾</i></button>
        <div class="tkm">${ring(p.energy)}<span class="tp">${L[i]}</span><span class="tr">${C.posRating(p, s[0])}</span></div></div>`; }).join('');
    const row = (p, chip, chipCol, rating, slot) => `<button class="lrw" data-act="${slot != null ? 'pick' : 'player'}" data-v="${slot != null ? slot : p.id}">
        <span class="lchip" style="background:${chipCol}">${chip}</span><span class="lnm">${C.esc(p.fn[0] + '. ' + p.ln)}${C.badges(p)}</span><b class="lrt">${rating}</b>
        <span class="ltop">${C.topPositions(p).map(([x, v]) => `<i style="background:${PILL[C.fit(p, x)]}">${x}${v}</i>`).join('')}</span><span class="lfr" style="color:${fcol(p.energy)}">${ring(p.energy)} ${Math.round(p.energy)}%</span></button>`;
    const list = F.map((s, i) => { const p = C.P(t.xi[i]); return p ? row(p, L[i], PILL[C.fit(p, s[0])], C.posRating(p, s[0]), i) : `<button class="lrw" data-act="pick" data-v="${i}"><span class="lchip" style="background:${PILL[0]}">${L[i]}</span><span class="lnm">Empty: tap to pick</span></button>`; }).join('')
      + t.bench.map((id, i) => row(C.P(id), 'SUB', '#64748b', C.P(id).rating, 'b' + i)).join('')
      + car.squad.filter(p => !t.xi.includes(p.id) && !t.bench.includes(p.id)).sort((a, b) => b.rating - a.rating).map(p => row(p, 'RES', '#334155', p.rating, null)).join('');
    const bench = t.bench.map((id, i) => { const p = C.P(id); return `<button class="btok" data-act="pick" data-v="b${i}"><span class="bf">${C.faceOf(p)}</span><b>${C.esc(p.ln)}</b><small>${ring(p.energy, 12)} ${p.pos} · ${p.rating}</small>${C.badges(p) ? `<em>${C.badges(p)}</em>` : ''}</button>`; }).join('') + (t.bench.length < 9 ? `<button class="btok add" data-act="pick" data-v="b${t.bench.length}"><span>+</span><small>Add</small></button>` : '');
    return `${C.advice('tac')}<div class="forms">${Object.keys(C.FORMATIONS).map(f => `<button class="${t.form === f ? 'on' : ''}" data-act="form" data-v="${f}">${f}</button>`).join('')}</div>
      <div class="ments">${C.MENTALITY.map((m, i) => `<button class="${t.ment === i ? 'on' : ''}" data-act="ment" data-v="${i}"><span>${MENT_ICON[i]}</span></button>`).join('')}</div><p class="mentl">${MENT_ICON[t.ment]} ${C.MENTALITY[t.ment]}</p>
      <div class="tview"><button class="${tview === 'board' ? 'on' : ''}" data-act="tacview" data-v="board">Board</button><button class="${tview === 'list' ? 'on' : ''}" data-act="tacview" data-v="list">List</button></div>
      ${tview === 'board' ? `<div class="board tall"><div class="bpitch"><i class="half"></i><i class="circ"></i><i class="box1"></i><i class="box2"></i></div>${tokens}</div>
        <div class="ringkey"><span><i style="background:${PILL[5]}"></i>Natural</span><span><i style="background:${PILL[4]}"></i>Good</span><span><i style="background:${PILL[3]}"></i>OK</span><span><i style="background:${PILL[2]}"></i>Poor</span><span><i style="background:${PILL[1]}"></i>Wrong</span><span>${ring(70)} Freshness</span></div>
        <h3 class="jh">Subs <small class="devp">${t.bench.length}/9</small></h3><div class="bench">${bench}</div>`
      : `<div class="tlist">${list}</div>`}
      <div class="jbtns"><button class="btn sec2" data-act="autopick">✨ Auto pick</button><button class="btn ${t.auto ? 'pri' : 'sec2'}" data-act="automan">${t.auto ? '✔ Auto-manage' : 'Auto-manage: off'}</button></div>
      <p class="note">With auto-manage on, your staff make subs for injuries and tired legs, change mentality late on and keep your playing-time promises.</p>
      ${fromMatch ? '<button class="btn full pri" data-act="back">Done</button>' : ''}`;
  }

  // ================= alternatives panel (ranked for the slot being filled) =================
  let pkXI = false, pkSubs = true;
  C.openPicker = slot => C.ui.open('Choose player', () => pickerHTML(slot));
  C.pickerToggle = k => { if (k === 'xi') pkXI = !pkXI; else pkSubs = !pkSubs; C.ui.refresh(); };
  C.pickerFilter = () => {};
  function pickerHTML(slot) {
    const car = C.car(), t = C.tac(), isB = String(slot)[0] === 'b', i = isB ? +String(slot).slice(1) : +slot;
    const pos = isB ? null : C.FORMATIONS[t.form][i][0], label = isB ? 'SUB' : C.slotLabels(t.form)[i], cur = C.P(isB ? t.bench[i] : t.xi[i]);
    const rate = p => pos ? C.posRating(p, pos) : p.rating, colOf = p => pos ? PILL[C.fit(p, pos)] : '#64748b';
    const line = (p, act) => { const un = !C.available(p);
      return `<button class="arow ${un ? 'lock' : ''}" ${act ? `data-act="${un ? 'toast' : 'setpick'}" data-v="${un ? (p.inj ? 'Injured: out ' + (p.inj > 50 ? 'for the season' : p.inj + ' more match' + (p.inj > 1 ? 'es' : '')) : 'Suspended for the next match') : slot + '|' + p.id}"` : ''}>
        <span class="lchip" style="background:${colOf(p)}">${label}</span><span class="anm">${C.esc(p.fn[0] + '. ' + p.ln)}${C.badges(p)}</span><b class="art">${rate(p)}</b><span class="afr" style="color:${fcol(p.energy)}">${ring(p.energy)} ${Math.round(p.energy)}%</span></button>`; };
    const inXI = id => t.xi.includes(id), onB = id => t.bench.includes(id);
    const cands = car.squad.filter(p => p !== cur && (pkXI || !inXI(p.id)) && (pkSubs || !onB(p.id)))
      .sort((a, b) => (C.available(b) - C.available(a)) || (rate(b) * (.6 + .4 * b.energy / 100)) - (rate(a) * (.6 + .4 * a.energy / 100)));
    const ins = cur && !isB ? t.instr[cur.id] ?? 2 : null;
    return `<div class="altp"><small class="ahd">Currently selected</small>${cur ? line(cur, false) : `<div class="arow"><span class="lchip" style="background:${PILL[0]}">${label}</span><span class="anm">Empty</span></div>`}
      ${ins != null ? `<div class="instr" style="margin-top:8px">${INSTR.map((x, k) => `<button class="${ins === k ? 'on' : ''}" data-act="instr" data-v="${cur.id}|${k}"><span>${x[0]}</span>${x[1]}</button>`).join('')}</div>` : ''}
      <div class="ahd2"><small class="ahd">Best alternatives</small><button class="chk ${pkXI ? 'on' : ''}" data-act="pktog" data-v="xi">Show XI</button><button class="chk ${pkSubs ? 'on' : ''}" data-act="pktog" data-v="subs">Show subs</button></div>
      <div class="alist">${cands.map(p => line(p, true)).join('') || '<p class="note">Nobody else available.</p>'}</div>
      ${cur ? `<button class="btn full altrm" data-act="unpick" data-v="${slot}">Remove player from line-up</button>` : ''}</div>`;
  }
  C.setPick = (slot, pid) => {
    const t = C.tac(), isB = String(slot)[0] === 'b', i = isB ? +String(slot).slice(1) : +slot, arr = isB ? t.bench : t.xi, cur = arr[i];
    const xi = t.xi.indexOf(pid), bi = t.bench.indexOf(pid); t.empty = t.empty || [];
    if (xi >= 0) { t.xi[xi] = cur || null; if (!cur) t.empty[xi] = true; } else if (bi >= 0) { if (cur) t.bench[bi] = cur; else t.bench.splice(bi, 1); }
    arr[i] = pid; if (isB) t.bench = t.bench.filter(Boolean); else t.empty[i] = false;
    C.save();
  };
  C.unpick = slot => { const t = C.tac(), isB = String(slot)[0] === 'b', i = isB ? +String(slot).slice(1) : +slot; t.empty = t.empty || []; if (isB) t.bench.splice(i, 1); else { t.xi[i] = null; t.empty[i] = true; } C.save(); };
})(window.CFC);
