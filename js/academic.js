// Club FC: the Academic Center as a real part of the program (phase-9o, round 6 item 59). One page for each player's package,
// academics and wellbeing, and upgrades that help keep players happy and bring recruits in. Boosts here are first proposals.
(function (C) {
  const A = C.ACTS, YR = ['', 'Fr', 'So', 'Jr', 'Sr'];
  const acad = () => C.eff('academic');
  // family and fitting in come from morale, promises and game time for now
  const wellbeing = p => { const kept = C.promiseKept(p), apps = p.ss ? p.ss.apps : 0, fam = !kept ? ['😟', 'Worried'] : p.morale >= 65 ? ['😀', 'Happy'] : p.morale >= 45 ? ['🙂', 'Content'] : ['😟', 'Worried'], fit = p.morale >= 70 || apps >= 5 ? ['😀', 'Settled'] : p.morale >= 45 ? ['🙂', 'Settling in'] : ['😟', 'Struggling']; return { fam, fit }; };
  const standing = p => p.gpa >= 3.3 ? ['#16a34a', "Dean's List"] : p.gpa >= 2.5 ? ['#84cc16', 'Good standing'] : ['#eab308', 'Watch'];
  C.openAcademic = () => C.ui.open('Academic Center', () => { const car = C.car(), lv = acad(), rows = car.squad.slice().sort((a, b) => a.ln.localeCompare(b.ln));
    const pk = p => (p.acad ? '📚 Aid' : p.schol ? `🎓 ${C.money(p.schol)} · ${Math.round(p.schol / car.job.coa * 100)}%` : 'Walk-on');
    return `<div class="card acsum"><div><b>$${C.short(C.poolLeft())}</b><small>Scholarships left</small></div><div><b>${car.squad.filter(p => p.schol).length}</b><small>On scholarship</small></div><div><b>${car.squad.filter(p => !p.schol && !p.acad).length}</b><small>Walk-ons</small></div><div><b>${C.jobsLeft ? C.jobsLeft() : 0}</b><small>Jobs left</small></div></div>
      ${lv ? '' : `<button class="btn full pri" data-act="bldopen" data-v="academic" style="margin-top:8px">🔒 Unlocks at Coaches' Office Lv ${C.BUILDINGS.academic.needHQ}</button>`}
      ${rows.map(p => { const w = wellbeing(p), s = standing(p); return `<button class="acrow" data-act="player" data-v="${p.id}"><div class="pkf">${C.faceOf(p)}</div><div class="aci"><b>${C.esc(p.fn)} ${C.esc(p.ln)} <small>${YR[p.year]}</small></b><small>${pk(p)}${p.cjob ? ' · 💼 Job' : ''}${p.house ? ' · 🏠 Housing' : ''}${p.promise ? ` · ${C.ROLES[p.promise][0]} ${C.promiseKept(p) ? '✔' : '✖'}` : ''}</small><small><span style="color:${s[0]}">● GPA ${p.gpa} ${s[1]}</span> · Family ${w.fam[0]} · Fitting in ${w.fit[0]}</small></div></button>`; }).join('')}`; });
  A.academic = () => C.openAcademic();
  // boosts: a little squad morale after every match, and fewer players tempted by the transfer portal
  const wrap = (n, f) => { const o = C[n]; if (o) C[n] = (...a) => f(o, ...a); };
  wrap('applyResult', (o, m, f) => { const rep = o(m, f), lv = acad(); if (lv) C.car().squad.forEach(p => { p.morale = Math.min(100, p.morale + lv * .1); }); return rep; });
  C.acadRetention = () => Math.min(.3, acad() * .015);
})(window.CFC);
