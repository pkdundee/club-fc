// Club FC 1.10 (SCOPE_1.10): the UI kit's screen hooks and the 1.09 fixes (QA-114 to QA-127, QA-134). Loaded after kit.js, before main.js.
(function (C) {
  const A = C.ACTS;

  // ---------- QA-134: no "Ray here" in Director messages (also in mail already in saved Inboxes) ----------
  C.fixRayMail = () => { const M = C.car() && C.meta && C.meta(); if (!M || !M.inbox) return; let n = 0;
    M.inbox.forEach(x => { if (x.body && /Ray here\. A few changes around the office:/.test(x.body)) { x.body = x.body.replace('Ray here. A few changes around the office:', 'A few changes around the office, Coach:'); n++; } }); if (n) C.save(); };
  // QA-116: a waiting sub made at half-time comes on at the restart
  const oPend = C.pendingSubsHTML; C.pendingSubsHTML = m => { const h = oPend ? oPend(m) : ''; return m && m.ht ? h.replace(/Coming on at the next stoppage/g, 'Coming on at the restart') : h; };

  // ---------- QA-119: opening a chest: it shakes, the lid pops, the rewards rise into the box above the track ----------
  let chT = null;
  const chBox = (html, label) => { const b = document.getElementById('chbox'); if (!b) return; clearTimeout(chT);
    if (!b.classList.contains('on')) b.innerHTML = '';
    b.insertAdjacentHTML('beforeend', `<div class="chgrp">${label ? `<small>${label}</small>` : ''}${html}</div>`); b.classList.add('on');
    chT = setTimeout(() => { b.classList.remove('on'); setTimeout(() => { if (!b.classList.contains('on')) b.innerHTML = ''; }, 400); }, 2800); };
  A.chestopen = (v, el) => { const i = +v, pts = C.meta().pts, row = C.CHESTS[i]; if (!row) return;
    const btn = document.querySelector(`.pchest[data-v="${i}"]`);
    const r = C.chestOpen(i);
    if (r) { if (btn) { btn.classList.add('opening'); }
      setTimeout(() => { C.ui.refresh(); C.render(); const b2 = document.querySelector(`.pchest[data-v="${i}"]`); if (b2) b2.classList.add('justopen');
        chBox(`<div class="chfly">${C.itemTiles(r)}</div>`, '🧰 Claimed'); }, 420);
      return; }
    chBox(C.itemTiles(row[1]), `At ${row[0]} ★`); };

  // ---------- QA-123 to QA-125: the player focus panel (Tactics, Substitutions, the match Plan) ----------
  C.INSTR_TXT = ['Ultra defensive: stays back and defends first.', 'Defensive: leans back, takes fewer risks going forward.', 'Balanced: plays to the team shape and Mentality.', 'Attacking: gets forward more and shoots more often.', 'Ultra attacking: joins every attack; leaves space behind.'];
  const yr = y => ['', 'Freshman', 'Sophomore', 'Junior', 'Senior', '5th year'][y] || '';
  const healthTxt = p => p.inj ? `<b class="pfbad">🩹 Injured: out ${p.inj > 50 ? 'for the season' : p.inj + ' more match' + (p.inj > 1 ? 'es' : '')}</b>` : p.knock ? '<b class="pfwarn">🤕 A knock: playable, at risk</b>' : '<b class="pfok">✔ Fit</b>';
  C.playerFocusHTML = (p, o = {}) => { const v = C.playerVoice ? C.playerVoice(p) : { line: '', f: [] }, ss = p.ss || {}, avg = ss.apps && ss.rs ? (ss.rs / ss.apps).toFixed(1) : '–';
    const mood = p.morale >= 75 ? 'pfok' : p.morale >= 45 ? 'pfwarn' : 'pfbad', why = (v.f || []).filter(x => x[1] < 0).map(x => x[0])[0] || (v.f || []).filter(x => x[1] > 0).map(x => x[0])[0] || '';
    return `<div class="pfhd"><div class="pff">${C.faceOf(p)}</div><div class="pfn"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><small>#${p.num || '–'} · ${p.pos}${o.label ? ` · playing <span class="pfchip" style="background:${o.fitCol || 'var(--school)'}">${o.label}</span>` : ''} · ${yr(p.year)}</small></div><b class="pfr">${o.rate != null ? o.rate : p.rating}</b></div>
      <div class="pfgrid"><div><small>Freshness</small><b>🔋 ${Math.round(p.energy)}%</b></div><div><small>Health</small>${healthTxt(p)}</div>
        <div><small>Morale</small><b class="${mood}">${Math.round(p.morale)}</b>${why ? `<em>${C.esc(why)}</em>` : ''}</div><div><small>This season</small><b>${ss.apps || 0} apps · ⭐ ${avg}</b><em>${ss.mins || 0} min · ${ss.g || 0} goals · ${ss.a || 0} assists</em></div></div>
      ${v.line ? `<p class="pfv">“${C.esc(v.line)}”</p>` : ''}`; };
  // this match so far (for Substitutions and the Plan)
  C.matchRatingOf = (m, e) => { try { const r = C.rateMatch(m).find(x => x.e === e); return r ? r.r.toFixed(1) : '6.0'; } catch (er) { return '–'; } };
  C.matchFocusHTML = (m, e) => { const s = e.st || {}, r = +C.matchRatingOf(m, e) || 6, en = Math.round(e.energy);
    const read = e.injured ? 'Injured: change them now' : en < 45 ? 'Out on their feet: a good one to change' : en < 60 && r < 6.5 ? 'Tiring, quiet game: a good one to change' : r >= 7.2 ? 'Playing well: worth keeping' : en < 60 ? 'Tiring, but playing their part' : 'Doing a job: fine to keep';
    return `<div class="pfhd"><div class="pff">${C.faceOf(e.p)}</div><div class="pfn"><b>${C.esc(e.p.fn)} ${C.esc(e.p.ln)}</b><small>#${e.p.num || '–'} · playing ${e.slot.pos} · ${e.p.rating}</small></div><b class="pfr">${C.matchRatingOf(m, e)}</b></div>
      <div class="pfgrid"><div><small>Freshness now</small><b class="${en < 45 ? 'pfbad' : en < 60 ? 'pfwarn' : 'pfok'}">🔋 ${en}%</b></div><div><small>Health</small>${e.injured ? '<b class="pfbad">🩹 Injured</b>' : e.knock ? '<b class="pfwarn">🤕 A knock</b>' : '<b class="pfok">✔ Fit</b>'}</div>
        <div><small>Morale</small><b>${Math.round(e.p.morale)}</b></div><div><small>This match</small><b>${s.g || 0} G · ${s.a || 0} A · ${s.sh || 0} shots</b><em>${s.pa ? Math.round(s.pc / s.pa * 100) + '% passing · ' : ''}${s.tk || 0} tackles${e.bin || s.yc ? ' · 🟨' : ''}</em></div></div>
      <p class="pfv">📋 ${read}</p>`; };

  // ---------- A10: one celebration (a banner, the items as tiles, confetti); tap anywhere to close ----------
  C.celebrate = (r, line) => { document.querySelectorAll('.kcel').forEach(x => x.remove()); const app = document.getElementById('app') || document.body;
    const conf = Array.from({ length: 26 }, (_, i) => `<i style="left:${(i * 37) % 100}%;background:${['#facc15', '#22c55e', '#3b82f6', '#ef4444', '#a855f7'][i % 5]};animation-delay:${(i % 7) * .08}s"></i>`).join('');
    app.insertAdjacentHTML('beforeend', `<div class="kcel" data-act="kcelx"><div class="kconf">${conf}</div><div class="kcelb"><div class="kban">CLAIMED!</div>${line ? `<p>${C.esc(line)}</p>` : ''}<div class="kcelt">${C.itemTiles(r)}</div><small>Tap to continue</small></div></div>`);
    setTimeout(() => { const n = document.querySelector('.kcel'); if (n) n.classList.add('out'); setTimeout(() => n && n.remove(), 400); }, 3200); };
  A.kcelx = () => document.querySelectorAll('.kcel').forEach(x => x.remove());

  // ---------- A12: the UI kit page (Settings → Test scenarios → UI kit), in three college colour sets ----------
  const KITSETS = [['Dark', '#1e3a8a', '#f97316'], ['Light', '#fde047', '#1e293b'], ['Clashing', '#16a34a', '#dc2626']];
  let kitSet = 0;
  A.uikit = v => { if (v != null && v !== '') kitSet = +v; C.ui.open('UI kit', () => { const [nm, c1, c2] = KITSETS[kitSet];
    const btn = (cls, t) => `<button class="btn ${cls}" style="padding:8px 12px;font-size:13px">${t}</button>`;
    return `<div class="bigtabs">${KITSETS.map((k, i) => `<button class="${i === kitSet ? 'on' : ''}" data-act="uikit" data-v="${i}">${k[0]}</button>`).join('')}</div>
      <div style="--school:${c1};--school2:${c2}">
      <h3 class="jh">Buttons by meaning</h3><div style="display:flex;flex-wrap:wrap;gap:6px">${btn('pri', 'Upgrade')}${btn('go', 'Go')}${btn('gold', '$1.99')}${btn('gold', 'Finish now 🪙 40')}${btn('danger', 'Remove')}${btn('off', 'Not yet')}${btn('sec2', 'Cancel')}</div>
      <h3 class="jh">Tabs</h3><div class="bigtabs"><button class="on">Main</button><button>Tab</button><button>Tab</button></div><div class="subtabs"><button class="on">Sub-tab <em>2</em></button><button>Sub-tab</button></div>
      <h3 class="jh">Red dot</h3><div style="display:flex;gap:24px"><span style="position:relative;display:inline-block">${C.kBadge('inbox', 40)}<i class="rd">3</i></span><span style="position:relative;display:inline-block">${C.kBadge('events', 40)}<i class="rd"></i></span></div>
      <h3 class="jh">Home badges · tab glyphs</h3><div style="display:flex;flex-wrap:wrap;gap:6px">${['match', 'tactics', 'campus', 'squad', 'recruit', 'staff', 'playbook', 'medical', 'events', 'inbox', 'inventory', 'store'].map(k => C.kBadge(k, 36)).join('')}</div>
      <div style="display:flex;gap:14px;margin-top:6px;color:${c1}">${['home', 'match', 'campus', 'squad', 'recruit'].map(k => C.kGlyph(k, 26)).join('')}</div>
      <h3 class="jh">Item tiles</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${[['green', C.kArt.chev(''), '5m', 12], ['purple', C.kArt.chev('build'), '1h', 3], ['blue', C.kArt.crate('blue'), 'Lv.2', 2], ['gold', C.kArt.chest('gold'), 'Lv.4', 1], ['purple', C.kArt.medal, '500', 36], ['purple', C.kArt.book, '', 2], ['green', C.kArt.xp, '100', 8], ['gold', C.kArt.ticket, '', 2]].map(a => C.kTile(...a)).join('')}</div>
      <h3 class="jh">Statuses</h3><div style="display:flex;flex-wrap:wrap;gap:8px">${Object.keys(C.kStatus).map(k => `<span title="${k}" style="width:34px;height:34px;display:inline-block">${C.kStatus[k].replace('class="kst"', 'class="kst" style="width:34px;height:34px"')}</span>`).join('')}</div>
      <h3 class="jh">Currencies · Program Power</h3><div class="res" style="display:flex;gap:6px;align-items:center">${C.kCash(22)}${C.kCP(22)}${C.kCoin(22)}${C.kPow(24)}</div>
      <h3 class="jh">List row (your row pinned)</h3><div class="lrow"><span>🏟</span><span class="lt"><b>Row title</b><small>A line under it</small></span><button class="btn sm2 go">Go</button></div>
      <h3 class="jh">Celebration</h3><button class="btn go" data-act="uikitcel">Show it</button></div>`; }); };
  A.uikitcel = () => C.celebrate({ sp5: 2, cash: 1500, gold: 40 }, 'A total of 3 rewards were claimed');

  // ---------- SCOPE_1.10 D: the Inventory's square tiles ----------
  const RARS = ['grey', 'grey', 'green', 'blue', 'purple', 'gold'];
  const SPEED_SUB = { g: '', b: 'build', r: 'research', t: 'train' };
  const timeLabel = m => m >= 60 ? (m / 60) + 'h' : m + 'm';
  C.invTileHTML = x => { const A2 = C.kArt, k = x.k, n = x.n;
    let r = RARS[Math.min(5, x.tier + 1)] || 'grey', art = null, label = '';
    const sp = C.XN && C.XN[k];
    if (sp && sp[3]) { art = A2.chev(SPEED_SUB[sp[3]] || ''); label = timeLabel(sp[2]); r = sp[2] >= 180 ? 'gold' : sp[2] >= 60 ? 'purple' : sp[2] >= 15 ? 'blue' : 'green'; }
    else if (/^crb/.test(k) || k === 'crate') { const t = +(k.slice(3) || 2); r = ['green', 'green', 'blue', 'purple', 'gold'][t] || 'green'; art = A2.crate(r); label = k === 'crate' ? '$5K' : (C.CRH[k] + 'h'); }
    else if (/^crp/.test(k)) { const t = +k.slice(3); r = ['green', 'green', 'blue', 'purple', 'gold'][t]; art = A2.chest(r); label = C.CRH[k] + 'h'; }
    else if (/^crc/.test(k)) { r = k === 'crc4' ? 'gold' : 'purple'; art = A2.chest(r); label = C.CRH[k] + 'h'; }
    else if (k === 'badge') { r = 'purple'; art = A2.medal; }
    else if (k === 'manual') { r = 'green'; art = A2.xp; label = '100'; }
    else if (k === 'books') { r = 'purple'; art = A2.book; }
    else if (k === 'tokens') { r = 'gold'; art = A2.ticket; }
    else if (k === 'kit') { r = 'blue'; art = A2.medkit; }
    else if (k === 'rare' || /^pk:/.test(k)) { r = 'gold'; art = A2.chest('gold'); }
    else if (k === 'credits') { r = 'blue'; art = () => `<text x="50" y="66" text-anchor="middle" font-size="44">${x.icon}</text>`; }
    if (!art) art = () => `<text x="50" y="66" text-anchor="middle" font-size="44">${x.icon}</text>`;
    return C.kTile(r, art, label, n); };
})(window.CFC);
