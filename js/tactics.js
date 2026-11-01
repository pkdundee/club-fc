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
    F.forEach((s, i) => { if (t.xi[i]) return; let best = null, bs = -1; for (const p of car.squad) { if (!C.available(p) || t.xi.includes(p.id)) continue; const v = score(p, s[0]); if (v > bs) { bs = v; best = p; } } t.xi[i] = best ? best.id : null; });
    t.bench = t.bench.filter(id => ok(id) && !t.xi.includes(id));
    const rest = car.squad.filter(p => C.available(p) && !t.xi.includes(p.id) && !t.bench.includes(p.id)).sort((a, b) => b.rating - a.rating + (b.promise === 'rotation' ? 5 : 0) - (a.promise === 'rotation' ? 5 : 0));
    if (!t.bench.some(id => C.P(id).pos === 'GK')) { const gk = rest.find(p => p.pos === 'GK'); if (gk && t.bench.length < 9) { t.bench.unshift(gk.id); rest.splice(rest.indexOf(gk), 1); } }
    while (t.bench.length < 7 && rest.length) t.bench.push(rest.shift().id);
    return t;
  };
  C.autoPick = () => { const t = C.tac(); t.xi = []; t.bench = []; C.tac(); C.save(); };
  C.roles = () => { const t = C.tac(), out = {}; C.squad().forEach(p => out[p.id] = t.xi.includes(p.id) ? 'xi' : t.bench.includes(p.id) ? 'bench' : 'res'); return out; };
  C.setForm = f => { const t = C.tac(), old = C.FORMATIONS[t.form], F = C.FORMATIONS[f], ids = t.xi.slice(), nx = [];
    // keep players, moving each to the closest slot of the new shape
    F.forEach((s, i) => { let bi = -1, bd = 9; old.forEach((o, j) => { if (!ids[j]) return; const d = Math.hypot(o[1] - s[1], o[2] - s[2]) + (o[0] === s[0] ? -.2 : 0); if (d < bd) { bd = d; bi = j; } }); nx[i] = bi >= 0 ? ids[bi] : null; if (bi >= 0) ids[bi] = null; });
    t.form = f; t.xi = nx; C.tac(); C.save(); };
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

  // ================= tactics board =================
  C.openTactics = (fromMatch) => C.ui.open('Tactics', () => boardHTML(fromMatch));
  function boardHTML(fromMatch) {
    const car = C.car(), t = C.tac(), F = C.FORMATIONS[t.form];
    const tokens = F.map((s, i) => { const p = C.P(t.xi[i]); const left = s[1] * 100, top = 92 - s[2] * 84;
      if (!p) return `<button class="tok empty" style="left:${left}%;top:${top}%" data-act="pick" data-v="${i}"><span class="tr">+</span><b>${s[0]}</b></button>`;
      const ins = t.instr[p.id] ?? 2, fit = C.fit(p, s[0]);
      return `<button class="tok" style="left:${left}%;top:${top}%" data-act="pick" data-v="${i}">${C.tokenSVG(p, fit, kitOf(p), 54, car.captains.includes(p.id))}${ins !== 2 ? `<i class="ins">${INSTR[ins][0]}</i>` : ''}<b>${C.esc(p.ln)}</b></button>`; }).join('');
    const bench = t.bench.map((id, i) => { const p = C.P(id); return `<button class="btok" data-act="pick" data-v="b${i}">${C.tokenSVG(p, 5, kitOf(p), 44)}<b>${C.esc(p.ln)}</b><small>${p.pos}</small></button>`; }).join('') + (t.bench.length < 9 ? `<button class="btok add" data-act="pick" data-v="b${t.bench.length}"><span>+</span><small>Add</small></button>` : '');
    const out = car.squad.filter(p => !C.available(p));
    return `${C.advice('tac')}<div class="forms">${Object.keys(C.FORMATIONS).map(f => `<button class="${t.form === f ? 'on' : ''}" data-act="form" data-v="${f}">${f}</button>`).join('')}</div>
      <div class="ments">${C.MENTALITY.map((m, i) => `<button class="${t.ment === i ? 'on' : ''}" data-act="ment" data-v="${i}"><span>${MENT_ICON[i]}</span></button>`).join('')}</div><p class="mentl">${MENT_ICON[t.ment]} ${C.MENTALITY[t.ment]}</p>
      <div class="board"><div class="bpitch"><i class="half"></i><i class="circ"></i><i class="box1"></i><i class="box2"></i></div>${tokens}</div>
      <div class="ringkey"><span><i style="background:${FITC[5]}"></i>Natural</span><span><i style="background:${FITC[3]}"></i>Competent</span><span><i style="background:${FITC[1]}"></i>Out of position</span><span>◔ ring = energy</span></div>
      <h3 class="jh">Bench <small class="devp">${t.bench.length}/9</small></h3><div class="bench">${bench}</div>
      ${out.length ? `<p class="note">Unavailable: ${out.map(p => `${p.inj ? '🩹' : '🟥'} ${C.esc(p.ln)}`).join(' · ')}</p>` : ''}
      <div class="jbtns"><button class="btn sec2" data-act="autopick">✨ Auto pick</button><button class="btn ${t.auto ? 'pri' : 'sec2'}" data-act="automan">${t.auto ? '✔ Auto-manage' : 'Auto-manage: off'}</button></div>
      <p class="note">With auto-manage on, your staff make subs for injuries and tired legs, changes mentality late on and keeps your playing-time promises.</p>
      ${fromMatch ? '<button class="btn full pri" data-act="back">Done</button>' : ''}`;
  }

  // ================= player picker (Q18e) =================
  let pf = 'all';
  C.openPicker = slot => C.ui.open('Choose player', () => pickerHTML(slot));
  function pickerHTML(slot) {
    const car = C.car(), t = C.tac(), roles = C.roles(), isB = String(slot)[0] === 'b', i = isB ? +String(slot).slice(1) : +slot;
    const pos = isB ? null : C.FORMATIONS[t.form][i][0], cur = C.P(isB ? t.bench[i] : t.xi[i]);
    const rows = car.squad.filter(p => p !== cur && (pf === 'all' || roles[p.id] === pf)).sort((a, b) => (pos ? C.fit(b, pos) - C.fit(a, pos) : 0) || b.rating - a.rating).map(p => {
      const fit = pos ? C.fit(p, pos) : 5, un = !C.available(p);
      return `<button class="pkrow ${un ? 'lock' : ''}" style="--mk:${{ xi: '#fff', bench: 'var(--sky)', res: 'var(--silver)' }[roles[p.id]]}" data-act="${un ? 'toast' : 'setpick'}" data-v="${un ? (p.inj ? 'Injured: out for ' + p.inj + ' more match' + (p.inj > 1 ? 'es' : '') : 'Suspended for the next match') : slot + '|' + p.id}">
        <div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><small><span class="pchip" style="background:${FITC[fit]}">${p.pos}</span>${pos ? ` ${FITS[fit]} ${C.FITLABEL[fit]} here` : ''} · ${un ? (p.inj ? '🩹 Injured' : '🟥 Banned') : '🔋 ' + Math.round(p.energy) + '%'}</small></div><b class="pkr">${p.rating}</b></button>`; }).join('');
    const ins = cur && !isB ? t.instr[cur.id] ?? 2 : null;
    return `<div class="filling">Filling: <b>${pos ? pos + ' (' + C.POSNAME[pos].toLowerCase() + ')' : 'bench spot ' + (i + 1)}</b></div>
      ${cur ? `<div class="card curp"><div class="pkf">${C.faceOf(cur)}</div><div style="flex:1"><b>${C.esc(cur.fn)} ${C.esc(cur.ln)}</b><small class="mutey">${cur.pos}${pos ? ' · ' + C.FITLABEL[C.fit(cur, pos)] + ' here' : ''} · 🔋 ${Math.round(cur.energy)}%</small></div>${isB ? `<button class="btn sm2" data-act="unpick" data-v="${slot}">Remove</button>` : ''}</div>
        ${ins != null ? `<label class="fld">Instruction</label><div class="instr">${INSTR.map((x, k) => `<button class="${ins === k ? 'on' : ''}" data-act="instr" data-v="${cur.id}|${k}"><span>${x[0]}</span>${x[1].replace('Ultra ', 'Ultra ')}</button>`).join('')}</div>` : ''}` : ''}
      <div class="filters" style="padding:10px 0 0">${[['all', 'All'], ['xi', 'XI'], ['bench', 'Bench'], ['res', 'Reserves']].map(([k, n]) => `<button class="f ${pf === k ? 'on' : ''}" data-act="pkf" data-v="${k}">${n}</button>`).join('')}</div>${rows}`;
  }
  C.pickerFilter = v => { pf = v; C.ui.refresh(); };
  C.setPick = (slot, pid) => {
    const t = C.tac(), isB = String(slot)[0] === 'b', i = isB ? +String(slot).slice(1) : +slot, arr = isB ? t.bench : t.xi, cur = arr[i];
    const xi = t.xi.indexOf(pid), bi = t.bench.indexOf(pid);
    if (xi >= 0) t.xi[xi] = cur || null; else if (bi >= 0) { if (cur) t.bench[bi] = cur; else t.bench.splice(bi, 1); }
    arr[i] = pid; if (isB) t.bench = t.bench.filter(Boolean);
    C.save();
  };
  C.unpick = slot => { const t = C.tac(), isB = String(slot)[0] === 'b', i = isB ? +String(slot).slice(1) : +slot; if (isB) t.bench.splice(i, 1); else t.xi[i] = null; C.save(); };
})(window.CFC);
