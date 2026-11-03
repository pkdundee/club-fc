// Club FC: the job market (Phase 2). 12 openings on 3 looping pages, each page 2 women's + 2 men's
// with balanced trade-offs (Q3, Q4, Q8, Q9, Q12). Each opening has a full preview before you sign.
(function (C) {
  // Stories. "strong" = better squad, less money; "weak" = weaker squad, more money or room to build.
  const STORIES = {
    crumbling: { set: 'strong', stars: 3, kind: 'Win now', title: 'Talented squad, crumbling facilities', eq: 4, cash: 12000,
      text: 'The locker room is a portable cabin and one floodlight works. But this roster has real players, and the athletic director expects results.',
      ambition: 'Win the conference within 2 seasons', ray: 'Good players, terrible facilities. Win early, then spend.', lv: { stadium: 1, training: 1, med: 1, dorms: 1 } },
    promises: { set: 'strong', stars: 3, kind: 'Win now', title: 'New athletic director, big promises', eq: 4, cash: 15000,
      text: 'A new athletic director wants a winner fast and has already told the local paper. Older squad, decent office, not much money left.',
      ambition: 'Reach the national tournament in 3 seasons', ray: 'Pressure from day one. The seniors can carry you this year.', lv: { hq: 2, film: 2 } },
    heroes: { set: 'strong', stars: 2, kind: 'Steady', title: 'Local heroes, tiny crowd', eq: 4, cash: 16000,
      text: 'Half the squad grew up within 20 miles. The town loves them, but only about 80 people come to games.',
      ambition: 'Double the crowd and finish top half', ray: 'Loyal squad. Fill those bleachers and they will run through walls.', lv: { dorms: 2, recruit: 2 } },
    boosters: { set: 'weak', stars: 1, kind: 'Build', title: 'Keen boosters, empty trophy cabinet', eq: 5, cash: 34000,
      text: 'Local businesses love the team and donate generously. The squad, honestly, does not win much. Money to spend, players to find.',
      ambition: 'Be respectable in year 1, contenders by year 3', ray: 'Plenty of cash. Build the campus and recruit hard.', lv: { booster: 2, stadium: 1 } },
    floods: { set: 'weak', stars: 1, kind: 'Build', title: 'The pitch floods when it rains', eq: 5, cash: 26000,
      text: 'Drainage is "on the list". The last coach left mid-season for a high-school job. Low expectations and a young squad.',
      ambition: 'Stay out of the bottom 2 while you rebuild', ray: 'Nobody expects anything. Perfect time to build properly.', lv: { training: 1, film: 1 } },
    blank: { set: 'weak', stars: 2, kind: 'Steady', title: 'A blank slate', eq: 6, cash: 22000,
      text: 'Mostly young players, a modest budget and an athletic director who just wants the program "to be respectable". The biggest scholarship pool on the board.',
      ambition: 'Top half this season, then build from there', ray: 'Biggest scholarship pool here. Recruiting heaven.', lv: { recruit: 2 } }
  };
  const STRONG = ['crumbling', 'promises', 'heroes'], WEAK = ['boosters', 'floods', 'blank'];
  const TYPES = {
    sch: { icon: '🎓', name: 'Scholarship college', hint: 'like NAIA or Division II', line: 'Partial athletic scholarships from a yearly pool.' },
    juco: { icon: '🚌', name: 'Junior college', hint: 'two-year college', line: 'Players stay 2 years. High turnover; your best players move on to 4-year colleges.' },
    acad: { icon: '📚', name: 'Academic college', hint: 'like Division III', line: 'No athletic scholarships. You recruit with academic aid, the campus and playing time.' }
  };
  const GOAL = { 3: 'Top 4 and reach the conference final', 2: 'Finish in the top half', 1: 'Stay out of the bottom 2' };
  const WEAKSPOT = ['No natural left back', 'Thin at striker', 'Only one goalkeeper', 'Slow centre backs', 'No creative midfielder', 'Small squad'];
  const POSN = ['ST', 'CB', 'CM', 'GK', 'RW', 'LB', 'AM', 'DM'];
  C.STORIES = STORIES; C.JOBTYPES = TYPES;

  C.makeJobs = seed => {
    const r = C.rng(seed), pick = a => a[Math.floor(r() * a.length)], shuffle = a => a.map(v => [r(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
    const cols = shuffle(C.COLLEGES.filter(c => c.tier === 5).map(c => c.id));   // first jobs are always at small colleges
    const jobs = [];
    // 3 pages x (2 women's + 2 men's), each gender gets one strong and one weak story per page
    for (let p = 0; p < 3; p++) {
      const slots = shuffle([['w', STRONG[(p) % 3]], ['w', WEAK[(p + 1) % 3]], ['m', STRONG[(p + 2) % 3]], ['m', WEAK[(p) % 3]]]);
      for (const [g, st] of slots) jobs.push({ page: p, gender: g, story: st });
    }
    // Schools: 10 unique, then 2 schools repeat on page 3 with the other program and a different story
    jobs.slice(0, 10).forEach((j, i) => j.college = cols[i]);
    const used = new Set();
    for (const j of jobs.slice(10)) {
      const src = jobs.slice(0, 4).find(s => s.gender !== j.gender && s.story !== j.story && !used.has(s.college)) || jobs.slice(0, 8).find(s => s.gender !== j.gender && !used.has(s.college));
      j.college = src.college; used.add(src.college); j.repeat = true;
    }
    // Two junior colleges and one academic college, never on a repeated school
    const plain = shuffle(jobs.filter(j => !j.repeat));
    jobs.forEach(j => j.type = 'sch'); plain[0].type = 'juco'; plain[1].type = 'juco'; plain[2].type = 'acad';
    // Details for the preview
    jobs.forEach((j, i) => {
      const st = STORIES[j.story], col = C.COLLEGES[j.college];
      j.id = i; j.stars = st.stars;
      j.coa = j.type === 'juco' ? 9000 + Math.round(r() * 6) * 500 : col.pub ? 26000 + Math.round(r() * 16) * 500 : 50000 + Math.round(r() * 30) * 500;
      j.limit = j.type === 'juco' ? 18 : j.gender === 'w' ? 9.9 : 9.0;
      j.eq = j.type === 'acad' ? 0 : j.type === 'juco' ? st.eq + 4 : st.eq;
      j.pool = Math.round(j.eq * j.coa / 1000) * 1000;
      j.cash = st.cash + Math.round(r() * 6) * 500;
      j.rating = { 3: 46, 2: 42, 1: 38 }[st.stars] + Math.round(r() * 3);
      j.mix = { 'Win now': [3, 4, 7, 8], Steady: [5, 6, 6, 5], Build: [8, 7, 4, 3] }[st.kind].slice();
      if (j.type === 'juco') j.mix = [12, 10, 0, 0];
      j.weak = pick(WEAKSPOT);
      j.top = shuffle(POSN).slice(0, 3).map((pos, k) => ({ pos, rating: j.rating + 9 - k * 2 - Math.round(r() * 2), yr: ['Fr', 'So', 'Jr', 'Sr'][Math.min(3, Math.floor(r() * 4) + (st.kind === 'Win now' ? 1 : 0))] }));
      j.last = { 3: 3, 2: 6, 1: 9 }[st.stars] + Math.round(r() * 1);
      const b = {}; for (const k in C.BUILDINGS) b[k] = C.BUILDINGS[k].start; Object.assign(b, st.lv); j.b = b;
    });
    return jobs;
  };

  // ---------------- job board ----------------
  let M = null; // { jobs, page, short:Set, onlyShort, pick }
  C.market = () => M;
  C.openMarket = replace => {
    M = { jobs: C.makeJobs(Date.now() & 0xffffff), page: 0, short: new Set(), onlyShort: false, pick: null, coach: '', pron: 'they' };
    (replace ? C.ui.replace : C.ui.open)('Job openings', boardHTML);
  };

  const ladder = lvl => `<span class="ladder">${[1, 2, 3, 4, 5].map(i => `<i class="${i === lvl ? 'on' : ''}"></i>`).join('')}</span>`;
  function jobCard(j) {
    const col = C.COLLEGES[j.college], st = STORIES[j.story], ty = TYPES[j.type], sv = (j.rating - 34) / 16, bv = C.clamp(j.cash / 40000, 0, 1), pv = j.limit ? C.clamp(j.eq / 10, 0, 1) : 0;
    return `<div class="jc" data-act="job" data-v="${j.id}">
      <div class="jrow">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 50)}<div class="jt"><b>${C.esc(col.short)} ${C.esc(col.mascot)}</b>
        <small>${j.gender === 'w' ? "♀ Women's" : "♂ Men's"} · ${col.state} · ${ty.icon} ${ty.name}</small></div>
        <button class="star ${M.short.has(j.id) ? 'on' : ''}" data-act="shortlist" data-v="${j.id}" aria-label="Shortlist">${M.short.has(j.id) ? '★' : '☆'}</button></div>
      <div class="lvlbadge">${ladder(1)} Level 1 · Small college <span class="mute">(${ty.hint})</span></div>
      <div class="jstory"><b>${C.esc(st.title)}</b> · ${st.kind}</div>
      <div class="jvals">
        <div><small>Squad</small><b class="st">${'★'.repeat(j.stars)}<i>${'★'.repeat(3 - j.stars)}</i></b><em>avg ${j.rating}</em><span style="--w:${(C.clamp(sv, 0, 1) * 100).toFixed(0)}%;--c:#3b82f6"></span></div>
        <div><small>Budget</small><b>💵 ${C.short(j.cash)}</b><em>one-off</em><span style="--w:${(bv * 100).toFixed(0)}%;--c:#16a34a"></span></div>
        <div><small>Scholarships</small><b>${j.eq ? '🎓 ' + j.eq + '/' + j.limit : '📚 Aid'}</b><em>${j.eq ? C.short(j.pool) + '/yr' : 'academic only'}</em><span style="--w:${(pv * 100).toFixed(0)}%;--c:#f59e0b"></span></div></div>
    </div>`;
  }
  function boardHTML() {
    const list = M.onlyShort ? M.jobs.filter(j => M.short.has(j.id)) : M.jobs.filter(j => j.page === M.page);
    return `<div class="jnav"><button data-act="jpage" data-v="-1" aria-label="Previous page">‹</button>
        <span>${M.onlyShort ? `☆ Shortlist (${M.short.size})` : `Page ${M.page + 1} of 3 · 12 openings`}</span>
        <button data-act="jpage" data-v="1" aria-label="Next page">›</button></div>
      <div class="jfilter"><button class="${M.onlyShort ? '' : 'on'}" data-act="jshort" data-v="0">All openings</button><button class="${M.onlyShort ? 'on' : ''}" data-act="jshort" data-v="1">☆ Shortlist</button></div>
      <div data-swipe="jpage">${list.length ? list.map(jobCard).join('') : '<p class="note" style="text-align:center;padding:30px 0">Tap ☆ on an opening to shortlist it.</p>'}</div>
      <p class="note">Every page has 2 women's and 2 men's openings: one stronger squad with less money, and one weaker squad with more room to build. Tap an opening to look around before you sign.</p>`;
  }
  C.jobPage = d => { if (M.onlyShort) return; M.page = (M.page + d + 3) % 3; C.ui.refresh(); };
  C.toggleShort = id => { M.short.has(id) ? M.short.delete(id) : M.short.add(id); C.ui.refresh(); };

  // ---------------- college preview ----------------
  C.openJob = id => { M.pick = id; C.ui.open(C.COLLEGES[M.jobs[id].college].short, jobHTML); };
  function jobHTML() {
    const j = M.jobs[M.pick], col = C.COLLEGES[j.college], st = STORIES[j.story], ty = TYPES[j.type];
    const fake = { college: j.college, gender: j.gender, b: j.b, queue: [], tier: 5 };
    const total = j.mix.reduce((a, b) => a + b, 0), mixCols = ['#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'];
    const fac = Object.keys(C.BUILDINGS).map(k => { const d = C.BUILDINGS[k], l = j.b[k];
      return `<div class="fac"><span>${d.icon}</span><b>${d.name}</b><em>${l ? 'Lv ' + l : d.needHQ ? '🔒' : 'Empty plot'}</em></div>`; }).join('');
    return `<div class="jprev">${C.campusSVG(fake, { preview: true })}<span class="jtag">${ty.icon} ${ty.name} · Level 1</span></div>
      <div class="jhead">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 54)}<div><b>${C.esc(col.full)}</b><small>${C.esc(col.mascot)} · ${j.gender === 'w' ? "Women's" : "Men's"} soccer · ${col.state} · Flyover Conference</small></div></div>
      <div class="card jcard"><b>${C.esc(st.title)}</b><p>${C.esc(st.text)}</p></div>
      <div class="kgrid">
        <div class="k"><small>Athletic director's goal</small><b>${GOAL[j.stars]}</b></div>
        <div class="k"><small>Long-term ambition</small><b>${C.esc(st.ambition)}</b></div>
        <div class="k"><small>Last season</small><b>${C.ord(j.last)} of 10</b></div>
        <div class="k"><small>Program type</small><b>${st.kind}</b></div>
      </div>
      <h3 class="jh">💵 Money</h3>
      <div class="kgrid">
        <div class="k"><small>Cost to attend</small><b>${C.money(j.coa)}/yr</b><small>${j.type === 'juco' ? 'Two-year college' : col.pub ? 'Public college' : 'Private: most recruits get academic aid'}</small></div>
        <div class="k"><small>Scholarships</small><b>${j.eq ? `🎓 ${j.eq} of ${j.limit} funded` : 'None'}</b><small>${j.eq ? C.money(j.pool) + ' a year' : 'Academic aid only'}</small></div>
        <div class="k"><small>Booster budget</small><b>${C.money(j.cash)}</b><small>Spending money for the campus</small></div>
        <div class="k"><small>College type</small><b>${ty.icon} ${ty.name}</b><small>${ty.line}</small></div>
      </div>
      <h3 class="jh">👕 Squad</h3>
      <div class="card">
        <div class="srow"><span>Strength</span><b>${'★'.repeat(j.stars)}${'☆'.repeat(3 - j.stars)} · avg ${j.rating}</b></div>
        <div class="srow"><span>Best players</span><b>${j.top.map(t => `${t.pos} ${t.rating} (${t.yr})`).join(' · ')}</b></div>
        <div class="srow"><span>Weak spot</span><b>⚠ ${C.esc(j.weak)}</b></div>
        <div class="mixbar">${j.mix.map((n, i) => n ? `<i style="flex:${n};background:${mixCols[i]}">${['Fr', 'So', 'Jr', 'Sr'][i]} ${n}</i>` : '').join('')}</div>
        <small class="note" style="display:block;margin-top:6px">Class years: ${j.mix[3]} seniors graduate after this season.</small>
      </div>
      <h3 class="jh">🏛 Facilities</h3>
      <div class="facs">${fac}</div>
      <div class="raytake"><span>👀</span><p><b>First impressions</b>${C.esc(st.ray)}</p></div>
      <div class="jbtns"><button class="btn sec2" data-act="back">‹ Back to openings</button><button class="btn sec2" data-act="shortlist" data-v="${j.id}">${M.short.has(j.id) ? '★ Shortlisted' : '☆ Shortlist'}</button></div>
      <button class="btn full pri" data-act="signjob">Sign the contract</button>`;
  }

  // ---------------- coach identity, then start ----------------
  C.openIdentity = () => C.ui.open('Your coach', () => {
    const j = M.jobs[M.pick], col = C.COLLEGES[j.college];
    return `<div class="jhead">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 46)}<div><b>${C.esc(col.short)} ${C.esc(col.mascot)}</b><small>${j.gender === 'w' ? "Women's" : "Men's"} soccer · head coach</small></div></div>
      <label class="fld" for="coachName">Your name</label><input class="inp" id="coachName" maxlength="20" placeholder="Coach name" value="${C.esc(M.coach)}">
      <label class="fld">Pronouns</label><div class="seg3">${[['she', 'She'], ['he', 'He'], ['they', 'They']].map(([v, n]) => `<button class="${M.pron === v ? 'on' : ''}" data-act="pron" data-v="${v}">${n}</button>`).join('')}</div>
      <p class="note">Men and women coach both men's and women's programs. Your choice doesn't change which jobs you're offered.</p>
      <button class="btn full pri" data-act="startjob">Start as head coach</button>`;
  });
})(window.CFC);
