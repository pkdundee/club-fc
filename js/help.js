// Club FC: learning tools (Q2). Replayable intro, Coach's Handbook, and Help (searchable questions).
(function (C) {
  // ---------- intro (shown before the first career, replayable from Settings) ----------
  const INTRO = [
    () => `<div class="introart scene">${C.artSlot('arrival', C.sceneArrival('#1e3a8a', '#f97316', 390, 220))}</div>
      <h2 class="ih">Every coach starts somewhere.</h2>
      <p class="ip">Somewhere in small-town America there's a college soccer team with a bumpy field, one working floodlight and a roster full of <b>walk-ons</b>: players with no scholarship who play for the love of it.</p>
      <p class="ip">They need a head coach. <b>That's you.</b></p>`,
    () => `<h2 class="ih">This isn't club football.</h2><p class="ip">US college soccer works differently from European leagues:</p>
      ${[['🏫', 'Teams are colleges', 'Players are students. Each plays up to 4 seasons, then graduates. Every year a class leaves and a new one arrives.'],
        ['🎓', 'Scholarships, not transfer fees', 'You attract players by paying part of their college costs from a yearly scholarship pool. Nobody is bought or sold.'],
        ['🏗', 'You build the program', 'Upgrade your campus and staff. Bigger colleges will want you, or your own college can move up a division.']]
        .map(([e, t, d]) => `<div class="ibox"><span>${e}</span><div><b>${t}</b><p>${d}</p></div></div>`).join('')}`,
    () => `<h2 class="ih">Your career ladder</h2><p class="ip">Start at the bottom. Each tier lifts your building cap and brings bigger budgets and tougher opponents.</p>
      ${[5, 4, 3, 2, 1].map(t => { const T = C.TIERS[t]; return `<div class="ibox ${t === 5 ? 'here' : ''}"><span>${['', '🏟', '⭐', '📈', '🎓', '📍'][t]}</span><div><b>${T.n} · ${T.name}</b><p>Buildings up to Lv ${T.cap}${t === 5 ? '. You start here.' : ''}</p></div></div>`; }).join('')}`
  ];
  let step = 0, after = null;
  C.openIntro = (then) => { step = 0; after = then || null; C.ui.open('Welcome', introHTML); };
  function introHTML() {
    return `${INTRO[step]()}<div class="idots">${INTRO.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div>
      <button class="btn full pri" data-act="intronext">${step < INTRO.length - 1 ? 'Next' : after ? 'See the job openings' : 'Done'}</button>
      ${step < INTRO.length - 1 ? '<button class="btn full sec2" data-act="introskip" style="margin-top:8px">Skip</button>' : ''}`;
  }
  C.introNext = () => { if (step < INTRO.length - 1) { step++; C.ui.refresh(); } else C.introDone(); };
  C.introDone = () => { try { localStorage.setItem('clubfc2_p9c_intro', '1'); } catch (e) { } if (after) { const f = after; after = null; f(); } else C.ui.back(); };
  C.introSeen = () => { try { return !!localStorage.getItem('clubfc2_p9c_intro'); } catch (e) { return true; } };

  // ---------- Coach's Handbook ----------
  C.HANDBOOK = [
    ['start', '👋', 'Start here', `<p>You're the head coach of a small US college soccer program. Two things matter:</p><ul><li><b>Your campus</b>: upgrade buildings to make your program stronger. The Coaches' Office level caps every other building.</li><li><b>Your team</b>: recruit students in the Recruit tab, develop them, and win matches (match day arrives in a later update).</li></ul><p>Better programs bring better job offers, or your own college can move up a division.</p>`],
    ['basics', '🏫', 'College soccer in 2 minutes', `<p>Most talented young Americans play for their high school and a youth club, then go to <b>college</b> on a full or (more often) partial scholarship while they study.</p><p>College teams belong to universities. There's <b>no promotion or relegation</b> and no transfer fees. Each player can compete for <b>4 seasons</b>.</p><p>The season runs in the fall: preseason in August, games through October, tournaments in November.</p>`],
    ['levels', '🪜', 'Levels and tiers', `<p>Real colleges play in NCAA Division I, II and III, the NAIA and junior colleges. Club FC uses five tiers:</p><ul><li><b>Tier 5</b> small colleges (where you start)</li><li><b>Tier 4</b> like Division II</li><li><b>Tier 3</b> Division I low-major</li><li><b>Tier 2</b> Division I mid-major</li><li><b>Tier 1</b> Power conferences</li></ul><p>Each tier caps how high buildings can go (Lv 6, 12, 18, 24, 30).</p>`],
    ['campus', '🏗', 'Your campus', `<p>Tap a building to see what the next level does, then <b>Upgrade</b>. Builds take real time; you can speed them up with Coins, a rewarded ad, or free when 3 minutes or less are left.</p><p>The <b>Coaches' Office</b> is your headquarters: no other building can be higher than it. Empty plots can be built on; locked land opens at higher tiers.</p><p>You start with one build slot. The Coach's Club adds one, a one-off purchase adds one, and Coaches' Office Lv 10 earns one.</p>`],
    ['program', '🧳', 'Program vs school buildings', `<p><b>Your program</b> (Coaches' Office, Training Ground, Gym, Sports Medicine, Performance Lab, Video Room, Recruiting Office) moves with you when you take a new job: your systems, staff and standards.</p><p><b>School buildings</b> (Stadium, Dorms, Academic Center, Booster Club, Media Centre, Skills Field) belong to the college and stay behind. A bigger college always has better ones.</p>`],
    ['schol', '🎓', 'Scholarships & cost of attendance', `<p><b>Cost of attendance</b> is a year of tuition, housing, food and books: roughly $26,000 to $34,000 at a public college, more at private ones (which usually give academic aid).</p><p>An <b>athletic scholarship</b> pays part of that, every year the player stays. Soccer scholarships are usually <b>partial</b>, e.g. $15,000 of a $28,000 cost.</p><p>Your college funds a number of full scholarships each year (e.g. "5 of 9.9 funded"): that's your <b>scholarship pool</b>, shared out across the squad.</p>`],
    ['walkon', '🚶', 'Walk-ons', `<p>A <b>walk-on</b> plays with no athletic scholarship. Small programs have lots of them, and some become stars who earn a scholarship later.</p>`],
    ['elig', '📅', 'Class years', `<p>Freshman (Fr), Sophomore (So), Junior (Jr), Senior (Sr): a player's 1st to 4th season. A <b>redshirt</b> trains for a year without using one. Every season seniors graduate and a new class arrives.</p>`],
    ['types', '🚌', 'College types', `<ul><li>🎓 <b>Scholarship college</b> (like NAIA / Division II): partial athletic scholarships.</li><li>🚌 <b>Junior college</b>: two-year college. Players stay 2 years; the best move on to 4-year colleges.</li><li>📚 <b>Academic college</b> (like Division III): no athletic scholarships. You recruit with academic aid, the campus and playing time.</li></ul>`],
    ['money', '💵', 'Money in Club FC', `<ul><li>💵 <b>Booster $</b>: spending money for buildings, training and recruiting. The <b>Media Centre</b> (match video and streaming) and <b>Booster Club</b> (donations) earn it every hour; tap the bubbles to collect. Home games add gate money, and the Director gives a budget each season plus prize money.</li><li><i class="cpi"></i> <b>Coaching Points</b>: made by the <b>Performance Lab</b> and earned in matches. They pay for Playbook research.</li><li>🎓 <b>Scholarship pool</b>: only pays player scholarships.</li><li><i class="coin"></i> <b>Coins</b>: speed things up and pay for treatments and searches. Never buys results.</li></ul>`],
    ['attrs', '📊', 'Player skills', `<p><b>Outfield players</b>: ⚡ Pace, 🎯 Shooting, 🔁 Passing, 🌀 Dribbling, 🛡 Defending, 💪 Physical.</p><p><b>Goalkeepers</b> have their own: 🧤 Shot-stopping, ✈️ Crosses (comes and claims, or stays on the line), 💪 Strength (holds their own in a crowded box), ⚡ Reflexes, 🧭 Positioning, 🦶 Distribution.</p><p>Highlighted skills matter most for the player's position. <b>Rating</b> is how good they are now; <b>Potential</b> is how good they could become.</p>`],
    ['numbers', '🎟', 'Squad numbers', `<p>You assign numbers, and some players want a particular one ("I should be No. 10"). Getting it lifts their morale. Numbers are hard to take back: changing one uses a 🎟 Number Change.</p>`],
    ['ad', '🏛', 'The athletic director', `<p>Your boss, the Director. They set your season goal and long-term ambition, reviews you mid-season and at season's end, and controls budgets. Beat expectations and you earn more reputation; keep missing them and you'll end up on the hot seat.</p>`],
    ['offers', '✉️', 'Recruiting offers', `<p>Every recruit's family <b>hopes</b> for a share of the cost of attendance. Build a package to get there:</p><ul><li>🎓 <b>Scholarship</b> from your pool, every year they stay</li><li>💼 <b>Campus job</b> (limited each season, no pool money)</li><li>📚 <b>Academic aid</b> for a GPA of 3.3+, paid by the college</li><li>🏠 <b>Housing help</b> from Booster $</li><li>📈 <b>More next year</b>, a promised raise</li></ul><p>Then pitch a <b>role</b>: ⭐ Starter, 🔄 Rotation, ⏳ Squad or 🎽 Redshirt. Families check your depth chart, so a Starter pitch counts for less if two better players are ahead. You get <b>3 rounds</b>; lowball twice and they walk. Rival offers have a deadline.</p>`],
    ['portal', '🚪', 'The transfer portal', `<p>Players can only change colleges during the <b>transfer window</b>, a few days after the season.</p><ul><li>📈 Small-college stars get interest from bigger programs</li><li>⏱ Bench players want minutes</li><li>💔 Broken promises push players out</li></ul><p>Try to keep them with a scholarship raise, a booster NIL deal or a role promise. Some still leave. In return, the portal brings <b>drop-down transfers</b>: good players from bigger programs who want to start.</p>`],
    ['season', '🏆', 'The season', `<p>You play 14 conference matches, home and away. The <b>top 4</b> reach the conference tournament: semi-final, then final.</p><p>Play whenever you like. <b>Freshness</b> is the limit: playing a match costs it and resting a match brings it back, so rotate your squad. Tired players perform worse and get injured more. After the season the transfer window opens; seniors graduate when the next season starts.</p>`],
    ['matchday', '⚽', 'Match day', `<ul><li>▶ <b>Play</b> to watch at 1×, 5× or 10×, or skip to half-time or full time. Skipping gives the same result.</li><li>⏩ <b>Quick result</b>: auto-manage plays it and you see the report.</li><li>🟨 A yellow card sends a player off for 5 minutes (college sin bin). 🟥 Red: off, and banned for the next match. 5 yellows in a season: a one-match ban.</li><li>🔁 Unlimited substitutions; a player taken off in the first half can return once in the second.</li><li>📈 Players improve slowly from what they do in matches.</li></ul>`],
    ['staff', '🧑‍🏫', 'Your staff', `<p>Assistant coaches work like heroes. Each has a <b>specialism</b> (🧠 Tactician, 🏋️ Development, 💪 Strength &amp; conditioning, 🧤 Goalkeeper, 🔍 Recruiting, 📣 Motivator), a <b>rarity</b>, a <b>level</b>, a <b>licence</b> (D → C → B → A → Pro) and a <b>trait</b>.</p><ul><li>📗 Coaching manuals give XP; matches give XP too.</li><li>🎫 Clinic Credits raise the licence, which raises the level cap.</li><li>📕 Trait Books power up the trait.</li></ul><p>Only coaches <b>on duty</b> (in a staff slot) help. They also give one-line advice on the screens they cover. Ray is your free generalist.</p>`],
    ['playbook', '📋', 'The Playbook', `<p>Your research tree: 11 branches, each with Tier I, II and III. A tier opens when the one before reaches Lv 5.</p><p>Research costs <i class="cpi"></i> Coaching Points (from matches, more for wins) and, higher up, 💵 Booster $. It runs in real time in the research queue.</p><p>Bonuses are <b>small and capped</b>. They show on the match report under "Your edge". The Playbook belongs to you and moves with you to every job.</p>`],
    ['career', '🪜', 'Your career', `<p>Two ways up:</p><ul><li>🚚 <b>Move</b>: win, build your program and grow your ⭐ reputation, and better colleges make offers at the end of a season. Your program buildings, staff and Playbook come with you; the old school's buildings stay. Invite up to 5 players to follow (they decide).</li><li>🔁 <b>Reclassify</b>: meet the requirements and your own college moves up a division after a transition season with no postseason.</li></ul><p>Turning offers down earns loyalty rewards.</p>`],
    ['events', '🎁', 'Events and rewards', `<ul><li>📅 <b>28-day calendar</b>: one reward a day you play. Day 14: a Rare recruit. Day 28: a Rare coach.</li><li>✔ <b>3 daily tasks</b>, and a <b>weekly chest</b> for 15 tasks.</li><li>🎟 <b>Season Pass</b>: 30 tiers over 30 days, a free and a premium track.</li><li>⚔️ <b>Weekly event</b>: a new bonus every Monday.</li><li>▶ Up to 5 rewarded ads a day.</li></ul><p>Money buys time, never results.</p>`],
    ['titleix', '⚖️', "Women's soccer & Title IX", `<p><b>Title IX</b> (1972) requires equal athletic opportunities for women, so there are more women's college soccer programs than men's. In Club FC every job board has equal men's and women's openings.</p>`]
  ];
  C.openHandbook = id => {
    if (!id) return C.ui.open("Coach's Handbook", () => C.HANDBOOK.map(h => `<button class="lrow" data-act="help" data-v="${h[0]}"><span class="li">${h[1]}</span><span class="lt"><b>${h[2]}</b></span><span class="lr">›</span></button>`).join(''));
    const h = C.HANDBOOK.find(x => x[0] === id); if (!h) return;
    if (C.car()) { C.car().seen['hb_' + id] = 1; C.save(); }
    C.ui.open(h[2], () => `<div class="hbtext"><div class="hbicon">${h[1]}</div>${h[3]}</div>`);
  };

  // ---------- Help: searchable questions ----------
  C.FAQ = [
    ['What is a scholarship?', "A yearly amount that pays part of a player's college costs. Most soccer scholarships are partial, e.g. $15,000 of a $28,000 cost.", 'schol'],
    ['What is a walk-on?', 'A player with no athletic scholarship. Small programs have lots of them.', 'walkon'],
    ['How do I upgrade a building?', 'Tap it on the campus, check the cost and tap Upgrade. Builds take real time; speed up with Coins or an ad.', 'campus'],
    ["Why can't I upgrade past a level?", "No building can be higher than your Coaches' Office, and your tier caps everything (Tier 5 = Lv 6).", 'campus'],
    ['How do I get more Booster $?', "Tap the 💵 bubbles over the Media Centre and Booster Club, win home games, and collect the Director's season budget and prize money.", 'money'],
    ['How do I get a second build slot?', "Join the Coach's Club, buy the extra slot, or reach Coaches' Office Lv 10.", 'campus'],
    ['What moves with me to a new job?', "Your program buildings, research and staff. The stadium, dorms and other school buildings stay.", 'program'],
    ['What are the tiers?', 'Five levels from small colleges (Tier 5) to Power conferences (Tier 1). Each raises the building cap.', 'levels'],
    ['What do Fr, So, Jr and Sr mean?', "Freshman, Sophomore, Junior and Senior: a player's 1st to 4th season.", 'elig'],
    ['What is a junior college?', 'A two-year college. Players stay two years, then the best transfer to four-year colleges.', 'types'],
    ['Who is the Director?', 'The athletic director: your boss. Sets goals, reviews you and controls budgets. (Not to be confused with rewarded ads.)', 'ad'],
    ['Is the store real money?', 'No. Every purchase in this build is a test and nothing is charged.', 'money'],
    ["Why are there so many women's programs?", "Title IX requires equal opportunities for women in college sport.", 'titleix'],
    ['How do players improve?', 'Open a player card and tap Train to start a plan. Young players improve fastest. Matches will add more growth later.', 'attrs'],
    ['Why does a player want a number?', 'Some players have a favourite number. Give it to them (🎟 Number Change) to lift their morale.', 'numbers'],
    ['How do I sign a player?', 'Open the Recruit tab, tap a recruit and make an offer: scholarship, extras and a role. Up to 3 rounds.', 'offers'],
    ['What is a campus job?', 'Paid work on campus, worth about $4,000 a year to the family. It costs no pool money, but you only have a few each season.', 'offers'],
    ['Why is the rating a range?', 'You have not seen them play. Scout them with Coaching Points, or meet them at an ID Camp. A better Recruiting Office narrows the range.', 'offers'],
    ['What is a redshirt?', 'A player trains for a year without playing, so they keep all 4 seasons. Fine for raw freshmen; older players dislike it.', 'elig'],
    ['When is the transfer portal open?', 'For 3 days after each season. Players can only change colleges then.', 'portal'],
    ['Where are daily rewards?', 'Tap 🎁 Events on the campus: calendar, tasks, weekly chest, the Season Pass and this week\'s event.', 'events'],
    ['How do I get better coaches?', 'Staff tab: the Coaching market (new every 2 days) or Coaching Search (<i class="coin"></i> Coins, odds shown).', 'staff'],
    ['What are Coaching Points for?', 'Playbook research. The Performance Lab makes them, and matches earn them (more for a win). Buildings cost Booster $ only.', 'playbook'],
    ['How do I play a match?', 'Open 🏠 Home and tap ▶ Play on the next-match banner. Watch, skip, or take a Quick result.', 'matchday'],
    ['Why are my players tired?', 'Matches use Freshness. Rest a player for a match (bench or out of the squad) to bring it back. The Gym, Conditioning research and recovery kits help.', 'season'],
    ['What is the Medical Room?', 'On the Sports Medicine building (and the Squad tab): treat injuries with physio, specialist treatment or rushing a player back, and use recovery kits.', 'season'],
    ['What happens with a yellow card?', 'The player goes off for 5 minutes (a college sin bin), then comes back. Two yellows make a red.', 'matchday'],
    ['How do I change my line-up?', 'Squad tab → <i class="xoi"></i> Tactics. Tap a player on the board to swap them.', 'matchday']
  ];
  let q = '';
  C.openAsk = () => { q = ''; if (C.car()) { C.car().seen.ask = 1; C.save(); } C.ui.open('Help', askHTML); };
  function askHTML() {
    const L = C.FAQ.filter(f => !q || (f[0] + ' ' + f[1]).toLowerCase().includes(q.toLowerCase()));
    return `<div class="raytake" style="margin-top:0"><span>❓</span><p><b>Help</b>Search a question, or browse the Coach's Handbook.</p></div>
      <input class="inp" id="faqQ" placeholder="Search questions" value="${C.esc(q)}" style="margin-top:10px">
      <div id="faqL">${L.map(f => `<details class="faq"><summary>${C.esc(f[0])}</summary><p>${C.esc(f[1])}</p><button class="btn sec2" data-act="help" data-v="${f[2]}">📖 Learn more</button></details>`).join('') || '<p class="note">No answer for that yet. Try the Handbook.</p>'}</div>
      <button class="btn full sec2" data-act="help" data-v="">📖 Open the Coach's Handbook</button>`;
  }
  document.addEventListener('input', e => { if (e.target.id === 'faqQ') { q = e.target.value; const pos = e.target.selectionStart; C.ui.refresh(); const n = C.$('#faqQ'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } });
})(window.CFC);
