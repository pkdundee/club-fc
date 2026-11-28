// Club FC 1.10 (SCOPE_1.10): the UI kit's screen hooks and the 1.09 fixes (QA-114 to QA-127, QA-134). Loaded after kit.js, before main.js.
(function (C) {
  const A = C.ACTS;

  // ---------- QA-134: no "Ray here" in Director messages (also in mail already in saved Inboxes) ----------
  C.fixRayMail = () => { const M = C.car() && C.meta && C.meta(); if (!M || !M.inbox) return; let n = 0;
    M.inbox.forEach(x => { if (x.body && /Ray here\. A few changes around the office:/.test(x.body)) { x.body = x.body.replace('Ray here. A few changes around the office:', 'A few changes around the office, Coach:'); n++; } }); if (n) C.save(); };
  // QA-116: a waiting sub made at half-time comes on at the restart
  const oPend = C.pendingSubsHTML; C.pendingSubsHTML = m => { const h0 = oPend ? oPend(m) : '', my = C.matchMySide ? C.matchMySide() : 0;
    const h = h0 + (m && m.swaps ? m.swaps.filter(s => s.side === my).map(s => `<div class="subpend">🔁 Swapping positions at the next stoppage: <b>${C.esc(s.a.p.ln)}</b> (${s.a.slot.pos}) ↔ <b>${C.esc(s.b.p.ln)}</b> (${s.b.slot.pos}) <button class="btn sm2 sec2" data-act="swapcancel" data-v="${m.swaps.indexOf(s)}">Cancel</button></div>`).join('') : ''); return m && m.ht ? h.replace(/Coming on at the next stoppage/g, 'Coming on at the restart') : h; };

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
  // 1.10.02 (QA-156): one header: face, name, shirt number badge, the 3 preferred positions, and the big box = rating at the position played (fit colour)
  C.pfHead = (p, pos, extra) => { const P = C.PILL || [], fit = pos ? C.fit(p, pos) : 5, rate = pos ? C.posRating(p, pos) : p.rating;
    const tops = (C.topPositions ? C.topPositions(p) : []).slice(0, 3).map(([x, v]) => `<i style="background:${P[C.fit(p, x)] || '#cbd5e1'}">${x} ${v}</i>`).join('');
    return `<div class="pfhd"><div class="pff">${C.faceOf(p)}</div><div class="pfn"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><small><span class="pfnum">${p.num || '–'}</span> ${pos ? `playing ${pos}` : p.pos}${extra ? ' · ' + extra : ''}</small><span class="pftops">${tops}</span></div><b class="pfr" style="background:${P[fit] || '#cbd5e1'};color:#0f172a">${rate}</b></div>`; };
  C.playerFocusHTML = (p, o = {}) => { const v = C.playerVoice ? C.playerVoice(p) : { line: '', f: [] }, ss = p.ss || {}, avg = ss.apps && ss.rs ? (ss.rs / ss.apps).toFixed(1) : '–';
    const mood = p.morale >= 75 ? 'pfok' : p.morale >= 45 ? 'pfwarn' : 'pfbad', why = (v.f || []).filter(x => x[1] < 0).map(x => x[0])[0] || (v.f || []).filter(x => x[1] > 0).map(x => x[0])[0] || '';
    return `${C.pfHead(p, o.pos, yr(p.year))}
      <div class="pfgrid"><div><small>Freshness</small><b>${C.kDrop ? C.kDrop(15) : ""} ${Math.round(p.energy)}%</b></div><div><small>Health</small>${healthTxt(p)}</div>
        <div><small>Morale</small><b class="${mood}">${C.kMorale ? C.kMorale(p.morale, 16) : ''} ${Math.round(p.morale)}</b>${why ? `<em>${C.esc(why)}</em>` : ''}</div><div><small>This season</small><b>${ss.apps || 0} apps · ⭐ ${avg}</b><em>${ss.mins || 0} min · ${ss.g || 0} goals · ${ss.a || 0} assists</em></div></div>
      ${v.line ? `<p class="pfv">“${C.esc(v.line)}”</p>` : ''}`; };
  // this match so far (for Substitutions and the Plan)
  C.matchRatingOf = (m, e) => { try { const r = C.rateMatch(m).find(x => x.e === e); return r ? r.r.toFixed(1) : '6.0'; } catch (er) { return '–'; } };
  C.matchFocusHTML = (m, e) => { const s = e.st || {}, r = +C.matchRatingOf(m, e) || 6, en = Math.round(e.energy);
    const read = e.injured ? 'Injured: change them now' : en < 45 ? 'Out on their feet: a good one to change' : en < 60 && r < 6.5 ? 'Tiring, quiet game: a good one to change' : r >= 7.2 ? 'Playing well: worth keeping' : en < 60 ? 'Tiring, but playing their part' : 'Doing a job: fine to keep';
    const mo = Math.round(e.p.morale), mc = mo >= 75 ? 'pfok' : mo >= 45 ? 'pfwarn' : 'pfbad';
    return `${C.pfHead(e.p, e.slot.pos)}
      <div class="pfgrid"><div><small>Freshness now</small><b class="${en < 45 ? 'pfbad' : en < 60 ? 'pfwarn' : 'pfok'}">${C.kDrop ? C.kDrop(15) : ""} ${en}%</b></div><div><small>Health</small>${e.injured ? '<b class="pfbad">🩹 Injured</b>' : e.knock ? '<b class="pfwarn">🤕 A knock</b>' : '<b class="pfok">✔ Fit</b>'}</div>
        <div><small>Morale</small><b class="${mc}">${C.kMorale ? C.kMorale(mo, 16) : ''} ${mo}</b></div><div><small>This match</small><b class="pfbig">⭐ ${C.matchRatingOf(m, e)}</b><em>${s.g || 0} G · ${s.a || 0} A · ${s.sh || 0} shots</em><em>${s.pa ? Math.round(s.pc / s.pa * 100) + '% passing · ' : ''}${s.tk || 0} tackles${e.bin || s.yc ? ' · 🟨' : ''}</em></div></div>
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
  A.uikitcel = () => C.celebrate({ spb5: 2, cash: 1500, gold: 40 }, 'A total of 3 rewards were claimed');

  // ---------- QA-144: the coach's line, with any text (used for the live read in a match) ----------
  C.adviceLine = line => { const c = C.onStaff().find(x => x.spec === 'tac') || C.onStaff().find(x => x.spec === 'gen') || C.onStaff()[0]; if (!c || !line) return '';
    return `<div class="advice"><div class="advf">${C.coachFace(c)}</div><p><b>${C.esc(c.fn)} ${C.esc(c.ln)} · ${C.SPECS[c.spec][1]}</b>${C.esc(line)}</p></div>`; };

  // ---------- icon sheet v5 (approved 25 Nov): skills, morale, freshness ----------
  const SW = 'fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"';
  const flatB = (c, d, g, ci, s) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true" class="kv5">${ci ? `<circle cx="12" cy="12.9" r="10.5" fill="${d}"/><circle cx="12" cy="12" r="10.5" fill="${c}"/>` : `<rect x="1.5" y="2.4" width="21" height="21" rx="5.5" fill="${d}"/><rect x="1.5" y="1.5" width="21" height="21" rx="5.5" fill="${c}"/>`}${g}</svg>`;
  const SKG = {
    pace: ['#f59e0b', '#b45309', `<path d="M13.5 3.5L6 13.5h5l-1.5 7 7.5-10h-5z" fill="#fff"/>`],
    shooting: ['#ef4444', '#b91c1c', `<circle cx="12" cy="12" r="7" ${SW} stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#fff"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" ${SW} stroke-width="2"/>`],
    passing: ['#3b82f6', '#1d4ed8', `<path d="M4 9h13M13.5 5.5L17 9l-3.5 3.5M20 15H7M10.5 11.5L7 15l3.5 3.5" ${SW} stroke-width="2.4"/>`],
    dribbling: ['#8b5cf6', '#5b21b6', `<path d="M5 18c3-1 3-5 6-5s3 4 6 3" ${SW} stroke-width="2" stroke-dasharray="2.5 2.2"/><circle cx="17.5" cy="7.5" r="3.4" fill="#fff"/>`],
    defending: ['#0ea5e9', '#0369a1', `<path d="M4 5h16" ${SW} stroke-width="2.4"/><path d="M7 8v8M5.2 14.2L7 16l1.8-1.8M12 8v9M10.2 15.2L12 17l1.8-1.8M17 8v8M15.2 14.2L17 16l1.8-1.8" ${SW} stroke-width="1.9"/>`],
    physical: ['#10b981', '#047857', `<path d="M4.5 12h2M17.5 12h2" ${SW} stroke-width="2.4"/><rect x="6.5" y="7.5" width="2.6" height="9" rx="1" fill="#fff"/><rect x="14.9" y="7.5" width="2.6" height="9" rx="1" fill="#fff"/><path d="M9 12h6" ${SW} stroke-width="2.8"/>`],
    glove: ['#14b8a6', '#0f766e', `<path d="M7 20v-8.5a1.5 1.5 0 0 1 3 0V7a1.5 1.5 0 0 1 3 0v4.5V6a1.5 1.5 0 0 1 3 0v6.5l1.3-2a1.5 1.5 0 0 1 2.5 1.6L17 18a3 3 0 0 1-2.6 2z" fill="#fff"/>`],
    hands: ['#6366f1', '#3730a3', `<path d="M7 20V9M17 20V9M4.5 11.5L7 9l2.5 2.5M14.5 11.5L17 9l2.5 2.5" ${SW} stroke-width="2.4"/><circle cx="12" cy="5" r="2.4" fill="#fff"/>`],
  };
  C.kSkill = (k, s = 26) => { const d = SKG[k] || SKG.pace; return flatB(d[0], d[1], d[2], false, s); };
  const SKMAP = { pac: 'pace', sho: 'shooting', pas: 'passing', dri: 'dribbling', def: 'defending', phy: 'physical', stp: 'glove', crs: 'hands', str: 'physical', ref: 'pace', psn: 'shooting', dis: 'passing' };
  [C.ATTR, C.GKATTR].forEach(A0 => A0 && Object.keys(A0).forEach(k => { if (SKMAP[k]) A0[k][0] = C.kSkill(SKMAP[k]); }));
  const face = m => `<circle cx="9" cy="10" r="1.4" fill="#fff"/><circle cx="15" cy="10" r="1.4" fill="#fff"/><path d="${m}" ${SW} stroke-width="2"/>`;
  C.kMorale = (v, s = 20) => v >= 75 ? flatB('#22c55e', '#15803d', face('M8 13.5c1 1.9 2.3 2.8 4 2.8s3-.9 4-2.8'), true, s) : v >= 45 ? flatB('#f59e0b', '#b45309', face('M8.5 15h7'), true, s) : flatB('#ef4444', '#b91c1c', face('M8 16.3c1-1.8 2.3-2.7 4-2.7s3 .9 4 2.7'), true, s);
  C.kDrop = (s = 20) => flatB('#06b6d4', '#0e7490', `<path d="M12 4.5c3 3.8 5.2 6.6 5.2 9.4a5.2 5.2 0 0 1-10.4 0c0-2.8 2.2-5.6 5.2-9.4z" fill="#fff"/>`, true, s);

  // ---------- QA-148: the approved v3.3 tiles for every reward and cost ----------
  const RNAME = { gold: 'Coins', cash: 'Booster $', cp: 'Coaching Points', pts: 'Points', manual: 'Coaching manual', credits: 'Clinic Credits', kit: 'Recovery kit', books: 'Trait Book', tokens: 'Number Change', rare: 'Rare recruit', coach: 'Rare coach', badge: 'Coaching Badge', crate: 'Booster crate ($5K)', gear: 'Gear' };
  C.rewardName = k => (C.XN && C.XN[k] && C.XN[k][1]) || RNAME[k] || k;
  const star = () => `<path d="M50 14l10.6 22 24 3-17.6 16.4 4.6 23.8L50 67.6 28.4 79.2 33 55.4 15.4 39l24-3z" fill="#fde047" stroke="#b45309" stroke-width="4" stroke-linejoin="round"/>`;
  const coachArt = () => `<circle cx="50" cy="38" r="15" fill="#fde68a" stroke="#92400e" stroke-width="3"/><path d="M24 82c2-17 12-26 26-26s24 9 26 26z" fill="#60a5fa" stroke="#1e3a8a" stroke-width="3"/><path d="M33 30c4-10 30-10 34 0" fill="#2563eb" stroke="#1e3a8a" stroke-width="3"/>`;
  const rTile = (k, v) => { const A2 = C.kArt;
    if (k === 'gold') return C.kTile('gold', A2.coins, '', C.short ? C.short(v) : v);
    if (k === 'cash') return C.kTile(v >= 100000 ? 'purple' : v >= 10000 ? 'blue' : 'green', A2.cash, '$' + (C.short ? C.short(v) : v), null);
    if (k === 'cp') return C.kTile('blue', A2.cp, '', v);
    if (k === 'pts') return C.kTile('blue', star, '', v);
    if (k === 'coach') return C.kTile('gold', coachArt, '', v > 1 ? v : null);
    if (C.invTileHTML) return C.invTileHTML({ k, n: v, tier: 2, icon: '🎁' });
    return C.kTile('grey', () => '', '', v); };
  const oTiles = C.itemTiles;
  C.itemTiles = r => { if (!r) return ''; const keys = Object.keys(r).filter(k => k !== 'gear'), g = r.gear ? oTiles({ gear: r.gear }) : '';
    return `<span class="itiles ktiles">${keys.map(k => `<span class="itk" data-act="itemdet" data-v="${k}|${r[k]}" title="${C.esc(C.rewardName(k))}">${rTile(k, r[k])}</span>`).join('')}${g}</span>`; };

  // ---------- 1.10.03 (QA-168): Your edge, on the pre-match page: only what affects a match, name and effect ----------
  const EDGE_IC = { sho: 'shooting', def: 'defending', pas: 'passing' }, EDGE_KEYS = ['sho', 'def', 'pas', 'oop', 'set', 'late', 'inj'];
  C.edgeLines = () => { const rows = {};
    for (const B of C.PB || []) B[3].forEach((n, t) => { if (!EDGE_KEYS.includes(n[1])) return; const lv = C.pbLv(B[0] + '.' + t); if (!lv) return;
      const name = n[0].replace(/ (I|II|III)$/, ''), k = name + '|' + n[1]; rows[k] = rows[k] || { name, key: n[1], ic: B[1], v: 0, txt: n[4] }; rows[k].v += lv * n[2]; });
    const out = Object.values(rows).map(r => ({ ic: EDGE_IC[r.key] && C.kSkill ? C.kSkill(EDGE_IC[r.key], 18) : r.ic, t: `${r.name}: +${Math.round(r.v * 1000) / 10}% ${r.txt}` }));
    for (const c of (C.onStaff ? C.onStaff() : [])) { if (!['tac', 'gk', 'snc', 'atk', 'pos', 'dfc'].includes(c.spec)) continue; const ef = C.coachEffects(c); const S = C.SPECS[c.spec];
      const l = c.spec === 'snc' ? ef.filter(x => /^(Injuries|Fatigue)/.test(x)).join(', ') : ef[0]; out.push({ ic: S[0], t: `${S[1]} ${c.ln}: ${l}` }); }
    return out; };
  C.edgeHTML = () => { const L = C.edgeLines(); return L.length ? `<div class="scout edgec"><b>Your edge</b>${L.map(x => `<div class="edl"><span class="edi">${x.ic}</span>${C.esc(x.t)}</div>`).join('')}</div>` : ''; };
  const oScout = C.scoutHTML; C.scoutHTML = f => (oScout ? oScout(f) : '') + C.edgeHTML();

  // ---------- 1.10.04 (QA-171): a tap on the map goes to the building whose picture is under the finger ----------
  // Each building picture is read once into a small alpha mask; the front-most picture with paint at the tap point wins.
  // Anything not ready (still loading, a drawn fallback) keeps the old tap area, so a tap never does nothing.
  const MASK = {}, MW = 384;
  const maskOf = href => { if (MASK[href] !== undefined) return MASK[href]; MASK[href] = null;
    const im = new Image(); im.onload = () => { try { const w = MW, h = Math.round(MW * im.naturalHeight / im.naturalWidth), cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(im, 0, 0, w, h); MASK[href] = { w, h, d: cx.getImageData(0, 0, w, h).data }; } catch (e) { MASK[href] = false; } };
    im.onerror = () => { MASK[href] = false; }; im.src = href; return null; };
  const bldImgs = () => [...document.querySelectorAll('#map image[data-bk]')];
  const warm = () => bldImgs().forEach(i => maskOf(i.getAttribute('href')));
  document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('#map')) warm(); }, true);
  C.pickBld = (e, v) => { try { const x = e.clientX, y = e.clientY; if (x == null) return v;
      const ok = k => !!document.querySelector(`#map .hits polygon[data-v="${k}"]`);
      for (const im of bldImgs().reverse()) { const k = im.dataset.bk; if (!ok(k)) continue; const r = im.getBoundingClientRect(); if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
        const M = maskOf(im.getAttribute('href')); if (!M) continue; const u = Math.floor((x - r.left) / r.width * M.w), w = Math.floor((y - r.top) / r.height * M.h);
        if (M.d[(w * M.w + u) * 4 + 3] > 40) return k; }
    } catch (err) { } return v; };

  // ---------- QA-151: chests: a drop-down list under the chest (preview); shake, open and celebrate (claim) ----------
  // 1.10.03 (QA-162): closing also removes the waiting "close on the next tap", so it can't close the next list as it opens
  let dropOff = null;
  const closeDrop = () => { document.querySelectorAll('.chdrop').forEach(x => x.remove()); if (dropOff) { document.removeEventListener('click', dropOff); dropOff = null; } };
  const chestDrop = (r, btn, label) => { closeDrop(); const app = document.getElementById('app') || document.body; if (!btn) return;
    const a = app.getBoundingClientRect(), b = btn.getBoundingClientRect(), el = document.createElement('div'); el.className = 'chdrop';
    el.innerHTML = `<i class="chdt"></i>${label ? `<small>${label}</small>` : ''}${Object.keys(r).map(k => `<div class="chdr">${rTile(k, r[k])}<b>${C.esc(C.rewardName(k))}</b><em>${k === 'cash' ? C.money(r[k]) : r[k]}</em></div>`).join('')}`;
    app.appendChild(el); const w = el.offsetWidth, cx = b.left + b.width / 2 - a.left, x = Math.max(8, Math.min(a.width - w - 8, cx - w / 2));
    el.style.left = x + 'px'; el.style.top = (b.bottom - a.top + 8) + 'px'; el.querySelector('.chdt').style.left = Math.max(14, Math.min(w - 14, cx - x)) + 'px';
    setTimeout(() => { if (dropOff) document.removeEventListener('click', dropOff); dropOff = () => closeDrop(); document.addEventListener('click', dropOff, { once: true }); }, 0); };
  A.chestopen = (v, el) => { const i = +v, row = C.CHESTS[i]; if (!row) return; closeDrop();
    const btn = document.querySelector(`.pchest[data-v="${i}"]`), r = C.chestOpen(i);
    if (r) { if (btn) btn.classList.add('opening'); setTimeout(() => { C.ui.refresh(); C.render(); if (C.celebrate) C.celebrate(r, `Chest at ${row[0]} ★ opened`); }, 420); return; }
    chestDrop(C.chestReward ? C.chestReward(i) : row[1], btn, `Rewards at ${row[0]} ★`); };

  // ---------- SCOPE_1.10 D: the Inventory's square tiles ----------
  const RARS = ['grey', 'grey', 'green', 'blue', 'purple', 'gold'];
  const SPEED_SUB = { g: '', b: 'build', r: 'research', t: 'train' };
  const timeLabel = m => m >= 60 ? (m / 60) + 'h' : m + 'm';   // 24h shows as 24h (icon sheet v7.1)
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
    else if (k === 'credits') { r = 'blue'; art = A2.clinic; }   // 1.11.01 (v6)
    else if (k === 'kit') { r = 'blue'; art = A2.medkit; }
    else if (k === 'rare' || /^pk:/.test(k)) { r = 'gold'; art = A2.chest('gold'); }
    else if (k === 'credits') { r = 'blue'; art = () => `<text x="50" y="66" text-anchor="middle" font-size="44">${x.icon}</text>`; }
    if (!art) art = () => `<text x="50" y="66" text-anchor="middle" font-size="44">${x.icon}</text>`;
    return C.kTile(r, art, label, n); };
})(window.CFC);
