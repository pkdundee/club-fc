// CLUB FC 1.04 (SCOPE_1.04 s3; FEEDBACK 68, 212): Your program. Replaces the job market for new careers.
// Choose men's or women's, your state, your college's name, mascot, abbreviation and colors. Every start is equal.
// The same page renames a program (free once at the first promotion, and once for careers from earlier builds).
(function (C) {
  const A = C.ACTS;
  const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  const STATE_NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
  const PLACES = ['Cedar Hollow', 'Ironwood', 'Silver Lake', 'Fox Run', 'Willow Bend', 'Stone Bridge', 'Red Mesa', 'Clearwater', 'Pine Ridge', 'Hawk Valley', 'Elm Crossing', 'Copper Creek', 'Bramble Hill', 'Mill River', 'Oak Hollow',
    'Briar Glen', 'Falcon Ridge', 'Lone Pine', 'Bluewater', 'Thistle Downs', 'Ember Falls', 'Raven Hill', 'Saddle Creek', 'Highmoor', 'Wren Valley', 'Ashford', 'Northfield Pines', 'Larch Point', 'Sterling Bay', 'Kestrel Point'];
  const MASCOTS = ['Foxes', 'Hawks', 'Badgers', 'Comets', 'Wolves', 'Herons', 'Bison', 'Lynx', 'Otters', 'Falcons', 'Mustangs', 'Owls', 'Stags', 'Rangers', 'Pioneers', 'Storm', 'Ravens', 'Bobcats'];
  const COLORS = ['#991b1b', '#c2410c', '#b45309', '#15803d', '#0f766e', '#0369a1', '#1e3a8a', '#6d28d9', '#86198f', '#1e293b', '#f8fafc', '#facc15', '#fca5a5', '#93c5fd'];
  // real colleges, conferences and pro clubs are blocked (a short list; names must be original)
  const BLOCK = ['harvard', 'stanford', 'yale', 'princeton', 'duke', 'ucla', 'usc', 'notre dame', 'alabama', 'clemson', 'gonzaga', 'georgetown', 'syracuse', 'villanova', 'michigan', 'ohio state', 'penn state', 'texas a&m', 'florida state',
    'north carolina', 'virginia tech', 'big ten', 'big 12', 'big east', 'pac-12', 'pac 12', 'sec ', 'acc ', 'ncaa', 'naia', 'njcaa', 'mls', 'nwsl', 'barcelona', 'real madrid', 'manchester', 'chelsea', 'arsenal', 'liverpool', 'juventus', 'bayern', 'galaxy', 'sounders', 'timbers', 'inter miami'];
  // 1.06 (QA-90): offensive words and slurs, checked on the college name, mascot and abbreviation (offline, a list that can grow).
  // Whole words after undoing common disguises (numbers or symbols for letters, letters spaced out), so ordinary words that happen
  // to contain one aren't caught. A few roots also match as the start of a word (for example "fuckers").
  const RUDE = ['fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'asshole', 'arsehole', 'bastard', 'slut', 'whore', 'fag', 'faggot', 'nigger', 'nigga', 'retard', 'retarded', 'spic', 'chink', 'kike', 'wetback',
    'tranny', 'dyke', 'twat', 'wank', 'wanker', 'piss', 'porn', 'porno', 'nazi', 'nazis', 'hitler', 'rape', 'rapist', 'cum', 'jizz', 'tits', 'titties', 'boobs', 'penis', 'vagina', 'anal', 'sex', 'sexy', 'kkk', 'motherfucker',
    'bollocks', 'prick', 'coon', 'gook', 'beaner', 'raghead', 'paki', 'dildo', 'bullshit', 'dumbass', 'jackass', 'butthole', 'blowjob', 'handjob', 'hooker', 'pedo', 'pedophile', 'heil', 'isis', 'jihad'];
  const ROOTS = ['fuck', 'shit', 'cunt', 'nigg', 'fagg', 'bitch', 'whore', 'slut', 'wank', 'motherf'];
  const RUDE_ABBR = ['FU', 'FCK', 'FUK', 'FUC', 'SEX', 'KKK', 'NAZI', 'ASS', 'WTF', 'STFU', 'GTFO', 'DIK', 'CUM', 'FAG', 'NIG', 'KYS', 'SHIT', 'PISS', 'TIT', 'TITS', 'POO', 'PEE', 'XXX', 'SS', 'SH1T', 'PUTA', 'COCK', 'CUNT', 'DICK', 'HELL', 'DAMN', 'BOOB', 'PORN', 'RAPE', 'HOE', 'HOES', 'THOT', 'MILF', 'DTF'];
  const unmask = s => String(s || '').toLowerCase().replace(/[0@4]/g, m => ({ 0: 'o', '@': 'a', 4: 'a' })[m]).replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/[5$]/g, 's').replace(/7/g, 't')
    .replace(/\b(?:[a-z][\s._*-]+){2,}[a-z]\b/g, m => m.replace(/[\s._*-]+/g, ''));   // "f u c k", "s.h.i.t"
  C.nameRude = s => { const w = unmask(s).split(/[^a-z]+/).filter(Boolean); return w.some(x => RUDE.includes(x) || ROOTS.some(r => x.startsWith(r))); };
  C.abbrRude = s => RUDE_ABBR.includes(String(s || '').toUpperCase()) || C.nameRude(s);
  C.nameBlocked = s => { const t = ' ' + String(s || '').toLowerCase() + ' '; return BLOCK.some(b => t.includes(b.endsWith(' ') ? ' ' + b : b)); };

  // ---------- custom colleges live in the save and join the college list at load ----------
  C.registerCustomCollege = car => { if (!car || !car.myCol) return;
    let c = C.COLLEGES.find(x => x.custom && x.owner === car.id);
    if (!c) { c = Object.assign({ id: C.COLLEGES.length, custom: true, owner: car.id, pub: true, tier: 99 }, car.myCol); C.COLLEGES.push(c); }
    else Object.assign(c, car.myCol);
    car.college = c.id; };

  let P = null, mode = 'new';   // the page's working state
  const gen = r => { const used = new Set(C.COLLEGES.map(c => c.short.toLowerCase())), out = [], suf = ['College', 'State', 'University'];
    for (let i = 0; out.length < 3 && i < 60; i++) { const pl = PLACES[Math.floor(r() * PLACES.length)], sf = suf[Math.floor(r() * 3)], short = sf === 'State' ? pl + ' State' : pl;
      if (used.has(short.toLowerCase()) || out.some(o => o.short === short)) continue; out.push({ full: `${pl} ${sf}`, short }); }
    return out; };
  C.genCollegeNames = (r, k) => { const out = []; for (let i = 0; out.length < k && i < 20; i++) gen(r).forEach(n => { if (out.length < k && !out.some(o => o.short === n.short)) out.push(n); }); return out; };   // 1.05: National Championship champions
  const abbrOf = full => full.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4);
  const sync = () => { const v = id => { const e = document.getElementById(id); return e ? e.value : null; };
    const st = v('pgstate'); if (st != null) P.state = st; const cu = v('pgcustom'); if (cu != null) P.custom = cu.trim(); const ma = v('pgmascot'); if (ma != null) P.mascot = ma.trim(); const ab = v('pgabbr'); if (ab != null) P.abbr = ab.trim().toUpperCase(); };
  const chosen = () => P.custom ? { full: P.custom, short: P.custom.replace(/\s+(College|University)$/i, '') } : P.names[P.pick];

  C.openProgram = (m = 'new') => { mode = m; const r = C.rng(Date.now() & 0xffffff);
    if (m === 'rename') { const car = C.car(), col = C.college(car); P = { gender: car.gender, state: col.state, names: gen(r), pick: -1, custom: col.full, mascot: col.mascot, abbr: col.abbr, c1: col.c1, c2: col.c2 }; }
    else { const names = gen(r); P = { gender: 'w', state: STATES[Math.floor(r() * STATES.length)], names, pick: 0, custom: '', mascot: MASCOTS[Math.floor(r() * MASCOTS.length)], abbr: abbrOf(names[0].full), c1: COLORS[Math.floor(r() * 10)], c2: '#f8fafc' }; }
    C.ui.open(m === 'rename' ? 'Rename your program' : 'Your program', html); };
  function html() {
    const nm = chosen() || { full: '', short: '' }, sw = (k, cur) => COLORS.map(c => `<button class="pgc ${cur === c ? 'on' : ''}" style="background:${c}" data-act="${k}" data-v="${c}" aria-label="Color"></button>`).join('');
    return `<div class="pgprev">${C.crestSVG(P.c1, P.c2, (P.abbr || 'CF').slice(0, 2), 64)}<div><b>${C.esc(nm.full || 'Your college')}</b><small>${C.esc(P.mascot || '')} · ${P.gender === 'w' ? "Women's" : "Men's"} soccer · ${STATE_NAMES[P.state] || ''}</small></div></div>
      ${mode === 'new' ? `<label class="fld">Program</label><div class="seg3" style="grid-template-columns:1fr 1fr">${[['w', "Women's"], ['m', "Men's"]].map(([v, n]) => `<button class="${P.gender === v ? 'on' : ''}" data-act="pgsex" data-v="${v}">${n}</button>`).join('')}</div>
      <label class="fld" for="pgstate">Your state</label><select class="inp" id="pgstate">${STATES.map(s => `<option value="${s}" ${P.state === s ? 'selected' : ''}>${STATE_NAMES[s]}</option>`).join('')}</select>` : ''}
      <label class="fld">College name</label><div class="pgnames">${P.names.map((n, i) => `<button class="${!P.custom && P.pick === i ? 'on' : ''}" data-act="pgname" data-v="${i}">${C.esc(n.full)}</button>`).join('')}<button data-act="pgmore">↻ More names</button></div>
      <input class="inp" id="pgcustom" maxlength="32" placeholder="Or type your own name" value="${C.esc(P.custom)}">
      <label class="fld" for="pgmascot">Mascot</label><input class="inp" id="pgmascot" maxlength="18" value="${C.esc(P.mascot)}">
      <label class="fld" for="pgabbr">Abbreviation (2–4 letters)</label><input class="inp" id="pgabbr" maxlength="4" value="${C.esc(P.abbr)}" style="text-transform:uppercase">
      <label class="fld">First color</label><div class="pgcols">${sw('pgc1', P.c1)}</div><label class="fld">Second color</label><div class="pgcols">${sw('pgc2', P.c2)}</div>
      ${mode === 'new' ? `<p class="note">Every program starts equal: an FCSA Division V college, the same squad strength, ${C.money(45000)} Booster $, a ${C.money(C.TIER_COA[5])} cost to attend and ${C.TIER_FUNDED[5]} funded scholarships (${C.money(C.TIER_COA[5] * C.TIER_FUNDED[5])} a year). Your state is your home: it doesn't change the economy.</p>` : '<p class="note">Your record, campus and players stay the same.</p>'}
      <button class="btn full pri" data-act="pgstart">${mode === 'new' ? 'Start as head coach' : 'Save the new name'}</button>`; }
  A.pgrename = () => { if (!C.car() || !C.car().renameFree) return; C.openProgram('rename'); };
  A.pgsex = v => { sync(); P.gender = v; C.ui.refresh(); };
  A.pgname = v => { sync(); P.custom = ''; P.pick = +v; P.abbr = abbrOf(P.names[P.pick].full); C.ui.refresh(); };
  A.pgmore = () => { sync(); P.names = gen(C.rng(Date.now() & 0xffffff)); if (!P.custom) { P.pick = 0; P.abbr = abbrOf(P.names[0].full); } C.ui.refresh(); };
  A.pgc1 = v => { sync(); P.c1 = v; C.ui.refresh(); };
  A.pgc2 = v => { sync(); P.c2 = v; C.ui.refresh(); };
  A.pgstart = () => { sync(); const nm = chosen();
    if (!nm || nm.full.length < 3) return C.toast('Choose or type a college name');
    if (!P.mascot) return C.toast('Choose a mascot');
    if (!/^[A-Z]{2,4}$/.test(P.abbr)) return C.toast('The abbreviation needs 2 to 4 letters');
    if (C.nameRude(nm.full) || C.nameRude(P.mascot) || C.abbrRude(P.abbr)) return C.toast('Please choose a different name');
    if (C.nameBlocked(nm.full) || C.nameBlocked(P.mascot) || C.nameBlocked(P.abbr)) return C.toast('Please choose an original name (no real colleges, conferences or clubs)');
    if (P.c1 === P.c2) return C.toast('Choose two different colors');
    const col = { full: nm.full, short: nm.short, mascot: P.mascot, abbr: P.abbr, state: P.state, c1: P.c1, c2: P.c2 };
    if (mode === 'rename') { const car = C.car(); car.myCol = col; car.renamed = true; car.renameFree = false; C.registerCustomCollege(car); if (car.sea) { const me = car.sea.teams[0]; Object.assign(me, { name: col.short, abbr: col.abbr, c1: col.c1, c2: col.c2 }); }
      C.save(); C.ui.closeAll(); C.toast(`✅ Now ${col.full} ${col.mascot}`); C.render(); return; }
    const b = {}; for (const k in C.BUILDINGS) b[k] = C.BUILDINGS[k].start;
    const job = { gender: P.gender, college: -1, story: 'promises', style: 'balanced', type: 'sch', stars: 2, coa: C.TIER_COA[5], eq: C.TIER_FUNDED[5], limit: C.TIER_FUNDED[5], pool: C.TIER_COA[5] * C.TIER_FUNDED[5],
      rating: 42, mix: [0, 6, 5, 5], squad16: true, cash: 45000, b };
    const car = C.newCareer({ coach: 'Coach', pron: 'they', job, myCol: col });
    if (C.genBatch) C.genBatch();
    C.ui.closeAll(); C.tab = 'campus'; C.applyTheme(); C.render(); C.openFirstCoach(C.welcome); };
})(window.CFC);
