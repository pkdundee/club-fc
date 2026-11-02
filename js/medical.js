// Club FC: fitness, injuries and the Medical Room (phase-9c, FITNESS-INJURY-DESIGN.md).
// Freshness changes only with matches (no real-time waiting). Injuries last a number of matches.
(function (C) {
  // [key, icon, name, min, max, weight, flags]   flags: c = concussion protocol (no Coins), s = season-ending
  const MINOR = [['ankle', '🦶', 'Ankle sprain', 1, 2, 18], ['ham', '🦵', 'Hamstring strain', 1, 3, 12], ['groin', '🦵', 'Groin strain', 1, 3, 8], ['dead', '🦵', 'Thigh bruise (dead leg)', 1, 1, 8],
    ['quad', '🦵', 'Quad strain', 1, 2, 6], ['calf', '🦵', 'Calf strain', 1, 2, 6], ['knee', '🦵', 'Knee bruise', 1, 1, 5], ['conc', '🧠', 'Concussion', 2, 3, 4, 'c'], ['hip', '🦵', 'Hip flexor strain', 1, 2, 4],
    ['shin', '🦶', 'Shin splints', 1, 2, 3], ['toe', '🦶', 'Foot sprain (turf toe)', 1, 2, 3], ['back', '🔙', 'Back spasm', 1, 1, 3], ['ribs', '🫁', 'Bruised ribs', 1, 2, 2]];
  const MODERATE = [['hankle', '🦶', 'High ankle sprain', 3, 5, 3], ['ham2', '🦵', 'Hamstring strain (moderate)', 4, 6, 3], ['mcl', '🦵', 'Knee ligament (MCL) sprain', 4, 7, 2], ['foot', '🦶', 'Broken toe', 5, 8, 2], ['shoulder', '💪', 'Shoulder dislocation', 3, 6, 1]];
  const SEVERE = [['acl', '🦵', 'Torn knee ligament (ACL)', 99, 99, 1, 's'], ['leg', '🦴', 'Broken leg', 99, 99, 1, 's']];
  C.INJURY_SEV = ['Minor', 'Moderate', 'Season-ending'];
  const pickW = (r, list) => { const t = list.reduce((s, x) => s + x[5], 0); let v = r() * t; for (const x of list) { v -= x[5]; if (v <= 0) return x; } return list[0]; };

  C.medState = (car = C.car()) => { if (!car.med) car.med = { physio: 1, prog: 0, team: 0, adDay: '', flu: 99 }; return car.med; };
  C.medLv = () => C.level('med');
  C.physioEvery = () => Math.max(1, Math.round(3 - C.medLv() / 10));       // 1 per 3 matches at Lv1 → 1 per match around Lv20
  C.teamEvery = () => Math.max(1, 3 - Math.floor(C.medLv() / 10));
  C.recMult = () => Math.min(1.5, 1 + C.level('gym') * .015 + C.pbv('rec') + C.staffF('snc') * .3);

  // A player picks up an injury in a match
  C.assignInjury = (p, r) => {
    const roll = r(), list = roll < .015 ? SEVERE : roll < .15 ? MODERATE : MINOR, x = pickW(r, list), sev = list === SEVERE ? 2 : list === MODERATE ? 1 : 0;
    let n = x[3] + Math.floor(r() * (x[4] - x[3] + 1));
    if (sev < 2 && r() < C.medLv() * .02) n = Math.max(x[3] === 2 && x[6] === 'c' ? 2 : 1, n - 1);   // Sports Medicine: chance of a faster recovery
    p.inj = n; p.injury = { k: x[0], icon: x[1], name: x[2], sev, tot: n, conc: x[6] === 'c', season: x[6] === 's', physio: false, spec: false };
    if (sev === 2) p.rs = true;   // medical redshirt: they keep this year of eligibility
    p.injHist = (p.injHist || 0) + 1;
  };

  // After every match: Freshness for those who didn't play, injury countdowns, re-injury windows, physio and the flu bug
  C.afterMatchMedical = (m, my, played, r) => {
    const car = C.car(), M = C.medState(), T = m.teams[my], squadIds = new Set(T.xi.concat(T.bench).map(p => p.id)), mult = C.recMult();
    for (const p of car.squad) {
      if (!played.has(p.id)) p.energy = Math.min(100, p.energy + (squadIds.has(p.id) ? 30 : 40) * mult);
      p.energy = Math.min(100, Math.round(p.energy + 10 * mult));
      if (p.rushed) p.rushed = false;
      if (p.reinj > 0) p.reinj--;
      if (p.injury && !p.inj) { p.reinj = 5; p.injury = null; }
    }
    M.prog++; if (M.prog >= C.physioEvery()) { M.prog = 0; M.physio = Math.min(3, M.physio + 1); }
    if (M.team > 0) M.team--;
    M.flu = (M.flu || 0) + 1;
    // flu bug: only when nobody is injured; rarer with good Sports Medicine and Dorms; at most once every 8 matches
    if (M.flu >= 8 && !car.squad.some(p => p.inj) && r() < Math.max(.01, .04 * (1 - C.medLv() * .02 - C.level('dorms') * .01))) {
      const pool = car.squad.filter(p => !p.ban).sort(() => r() - .5).slice(0, 2 + Math.floor(r() * 3));
      pool.forEach(p => { p.inj = 1; p.injury = { k: 'flu', icon: '🤒', name: 'Flu bug', sev: 0, tot: 1, conc: false, season: false, physio: true, spec: true }; });
      M.flu = 0; return pool.map(p => p.ln);
    }
    return null;
  };

  // ---------- treatments ----------
  const minorOrMod = p => p.injury && p.injury.sev < 2 && !p.injury.conc && p.injury.k !== 'flu';
  C.TREAT = { spec: 40, rush: 20, kit: 15, team: 30 };
  C.treat = (pid, kind) => {
    const car = C.car(), p = C.P(pid), M = C.medState(), a = C.acct(); if (!p) return 'gone';
    if (kind === 'physio') { if (!p.inj || !p.injury || p.injury.sev !== 0 || p.injury.conc || p.injury.physio) return 'no'; if (M.physio < 1) return 'none'; M.physio--; p.injury.physio = true; p.inj = Math.max(0, p.inj - 1); }
    else if (kind === 'spec') { if (!minorOrMod(p) || p.injury.spec) return 'no'; if (a.gold < C.TREAT.spec) return 'coins'; a.gold -= C.TREAT.spec; p.injury.spec = true; p.inj = Math.max(0, p.inj - 1); }
    else if (kind === 'rush') { if (!minorOrMod(p) || p.inj !== 1) return 'no'; const kits = (car.items && car.items.kit) || 0; if (kits) car.items.kit--; else { if (a.gold < C.TREAT.rush) return 'coins'; a.gold -= C.TREAT.rush; } p.inj = 0; p.rushed = true; p.reinj = 5; p.injury = null; }
    else if (kind === 'kit') { car.items = car.items || {}; if (!car.items.kit) return 'nokit'; car.items.kit--; p.energy = Math.min(100, p.energy + 25); }
    if (p.injury && !p.inj) { p.reinj = 5; p.injury = null; }
    C.save(); return true;
  };
  C.teamSession = () => { const car = C.car(), M = C.medState(), a = C.acct();
    if (M.team > 0) { if (a.gold < C.TREAT.team) return 'coins'; a.gold -= C.TREAT.team; } else M.team = C.teamEvery();
    car.squad.forEach(p => p.energy = Math.min(100, p.energy + 12)); C.save(); return true; };
  C.buyRecoveryKit = () => { const a = C.acct(), car = C.car(); if (a.gold < C.TREAT.kit) return 'coins'; a.gold -= C.TREAT.kit; car.items = car.items || {}; car.items.kit = (car.items.kit || 0) + 1; C.save(); return true; };
  C.adPhysio = () => { const M = C.medState(); if (M.adDay === C.todayKey()) return 'used'; if (C.adsLeft() <= 0) return 'ads'; C.acct().adsUsed++; M.adDay = C.todayKey(); M.physio = Math.min(3, M.physio + 1); C.save(); return true; };

  // ================= Medical Room =================
  C.openMedical = () => C.ui.open('Medical Room', () => {
    const car = C.car(), M = C.medState(), kits = (car.items && car.items.kit) || 0;
    const inj = car.squad.filter(p => p.inj).sort((a, b) => b.inj - a.inj), tired = car.squad.filter(p => !p.inj && p.energy < 60).sort((a, b) => a.energy - b.energy);
    const btn = (on, act, v, label) => `<button class="btn sm2 ${on ? '' : 'off'}" data-act="${act}" data-v="${v}" ${on ? '' : 'disabled'}>${label}</button>`;
    const row = p => { const j = p.injury || { icon: '🩹', name: 'Injury', sev: 0 }, sev = C.INJURY_SEV[j.sev];
      return `<div class="medrow"><div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(p.fn[0] + '. ' + p.ln)} <span class="sevt s${j.sev}">${sev}</span></b><small>${j.icon} ${C.esc(j.name)} · ${j.season ? 'out for the season (medical redshirt)' : 'out ' + p.inj + ' more match' + (p.inj > 1 ? 'es' : '')}</small></div>
        <div class="medbt">${j.sev === 0 && !j.conc && j.k !== 'flu' ? btn(!j.physio && M.physio > 0, 'treat', p.id + '|physio', '🩺 Physio') : ''}
        ${minorOrMod(p) ? btn(!j.spec, 'treatc', p.id + '|spec', `${C.GEM} ${C.TREAT.spec}`) : ''}
        ${minorOrMod(p) && p.inj === 1 ? btn(true, 'treatc', p.id + '|rush', 'Rush back') : ''}
        ${j.conc ? '<small class="mutey">Protocol: can\'t be rushed</small>' : ''}</div></div>`; };
    return `<div class="medtop"><div><b>${M.physio}</b><small>🩺 Physio sessions</small><em>+1 every ${C.physioEvery()} match${C.physioEvery() > 1 ? 'es' : ''}</em></div>
        <div><b>${kits}</b><small>🧴 Recovery kits</small><em>+25 Freshness</em></div><div><b>${M.team ? M.team : '✔'}</b><small>👥 Team session</small><em>${M.team ? 'free in ' + M.team + ' match' + (M.team > 1 ? 'es' : '') : 'ready, free'}</em></div></div>
      <div class="jbtns" style="margin-top:8px"><button class="btn sec2" data-act="teamsess">${M.team ? `👥 Team session · ${C.GEM} ${C.TREAT.team}` : '👥 Team session · free'}</button><button class="btn sec2" data-act="buykitc">🧴 Buy kit · ${C.GEM} ${C.TREAT.kit}</button></div>
      <button class="btn full sec2" data-act="adphysio" style="margin-top:8px" ${M.adDay === C.todayKey() ? 'disabled' : ''}>▶ ${M.adDay === C.todayKey() ? 'Ad physio used today' : 'Watch an ad: +1 physio session'}</button>
      <h3 class="jh">Injured <small class="devp">${inj.length}</small></h3>${inj.length ? inj.map(row).join('') : '<p class="note">Nobody injured. 🙌</p>'}
      <h3 class="jh">Tired <small class="devp">under 60% Freshness</small></h3>${tired.length ? tired.map(p => `<div class="medrow"><div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(p.fn[0] + '. ' + p.ln)}</b><small>🔋 ${Math.round(p.energy)}% · rest them a match or use a kit</small></div><div class="medbt">${btn(kits > 0, 'treat', p.id + '|kit', '🧴 Kit')}</div></div>`).join('') : '<p class="note">Everyone is fresh.</p>'}
      <p class="note">Freshness only changes with matches: playing costs it, resting restores it. First-years get injured most; players get sturdier every year. Concussions and season-ending injuries can't be shortened.</p>`;
  });
})(window.CFC);
