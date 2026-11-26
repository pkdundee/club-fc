// Club FC: match day screens (Phase 5, Q20). Pre-match and countdown, the live pitch to scale, speeds and skips,
// campus-radio commentary, sound, live substitutions, half-time and the full-time report.
(function (C) {
  const { PW, PL, HALF } = C.PITCH;
  let M = null; // { m, f, my, speed, playing, raf, last, ev, line, lineT, cd, pickIn, report }

  // ================= campus radio: Duane (play-by-play) and Bev (stats) =================
  const L = {
    ko: ['🎙 Duane: Welcome to {station}, campus radio! It\'s {weather} and {crowd} are in. Let\'s go!', '📊 Bev: For the record, I have prepared eleven pages of notes. We will use none of them.'],
    goal: ['🎙 Duane: GOOOAL! {p} for {t}!', '🎙 Duane: IT\'S IN! {p}! Oh my goodness!', '🎙 Duane: {p} buries it! {t} take it {score}!', '🎙 Duane: What a finish from {p}!', '🎙 Duane: {p} finds the corner! {score}!', '🎙 Duane: Back of the net! {p} for {t}!', '🎙 Duane: Cool as you like from {p}. {score}.', '🎙 Duane: {p} SCORES! The {mascot} bench empties!'],
    goal2: ['📊 Bev: That\'s {g} for {p} today. I\'m told that\'s good.', '📊 Bev: {a} with the assist. I\'m writing it in pen.', '📊 Bev: Historically, goals are the main way of scoring.', '📊 Bev: Shot number {s} for {t}. Persistence.'],
    pen: ['🎙 Duane: PENALTY! The ref points to the spot!', '📊 Bev: Penalty. From eleven metres. Or twelve yards, for the boosters.'],
    save: ['🎙 Duane: Big save from {k}!', '🎙 Duane: {p} goes for it… denied by {k}!', '📊 Bev: {k} has {sv} saves. Their gloves deserve a scholarship.'],
    miss: ['🎙 Duane: {p} shoots… just wide!', '🎙 Duane: Oh, {p} drags it past the post!', '📊 Bev: That one is landing in the parking lot.', '🎙 Duane: Over the bar from {p}!', '🎙 Duane: {p} leans back and skies it.', '🎙 Duane: Inches wide from {p}!', '📊 Bev: {p} will want that one back.', '🎙 Duane: {p} snatches at it. Goal kick.'],
    corner: ['🎙 Duane: Corner kick to {t}.', '🎙 Duane: {t} win a corner. Bodies into the box.', '📊 Bev: Corner number {c} for {t}.', '🎙 Duane: It\'s behind for a corner!', '🎙 Duane: Corner. The big defenders are jogging up.'],
    throw: ['🎙 Duane: Throw-in to {t}.', '🎙 Duane: Out for a throw.', '📊 Bev: Throw-in. Underrated part of the game, I say.'],
    goalkick: ['🎙 Duane: Goal kick.', '🎙 Duane: Goal kick, {t} will restart.'],
    foul: ['🎙 Duane: Free kick! {o} brings down {p}.', '🎙 Duane: Whistle. {o} was late on {p}.', '🎙 Duane: Foul by {o}. Free kick to {t}.', '📊 Bev: That\'s foul number {f} for {ot}.', '🎙 Duane: {p} goes down under the challenge from {o}. Free kick.'],
    tackle: ['🎙 Duane: Great tackle from {p}!', '🎙 Duane: {p} wins it back!', '🎙 Duane: Strong in the challenge, {p}.'],
    int: ['🎙 Duane: Read it well, {p} intercepts.', '🎙 Duane: Cut out by {p}!', '🎙 Duane: {p} steps in and steals it.'],
    shape: ['📊 Bev: {t} change shape: {form} now.', '🎙 Duane: {t} reorganise into a {form}.'],
    block: ['🎙 Duane: Blocked! Great body on the line from {o}!', '📊 Bev: {o} with the block. Selfless. Possibly painful.'],
    yellow: ['🎙 Duane: Yellow card for {p}! That means a spell off the field.', '📊 Bev: College rule: a yellow sends you off for a while. Like a sin bin, but with more paperwork.'],
    red: ['🎙 Duane: RED CARD! {p} is OFF! The crowd can\'t believe it!', '🎙 Duane: Straight red! {p} has to go. {t} are down to ten!', '🎙 Duane: That\'s a second yellow, and {p} is off! Big moment!'],
    red2: ['📊 Bev: {t} down to ten. Mathematically, that\'s one fewer.', '📊 Bev: Ten men for {t}. The coach has a decision to make.', '📊 Bev: Every {t} player now has an extra yard to cover.'],
    back: ['🎙 Duane: {p} is back on after the yellow.'],
    injury: ['🎙 Duane: Oh no, {p} is down and that looks sore.', '📊 Bev: The trainer is jogging on. Respect the jog.'],
    knock: ['🎙 Duane: {p} takes a knock but plays on.'],
    sub: ['🎙 Duane: Change for {t}: {p} on, {o} off.', '📊 Bev: Fresh legs. {p} has been stretching since kick-off.'],
    claim: ['🎙 Duane: {k} comes and claims it. Confident!'],
    offside: ['🎙 Duane: Flag\'s up! {p} was offside.', '📊 Bev: Offside. The assistant referee has been waiting all half for that.', '🎙 Duane: {p} went too early. Offside.'],
    ht: ['🎙 Duane: That\'s half-time! {score}.', '📊 Bev: Halftime. The pep band has been warming up for this.'],
    ft: ['🎙 Duane: FULL TIME! {score}!', '📊 Bev: And that\'s the ball game. I\'ll have the stats sheet out by Tuesday.'],
    fill: ['📊 Bev: Possession {poss}%-{poss2}%. I counted. By hand.', '📊 Bev: {sh1} shots to {sh2}. Neither team is shy.', '🎙 Duane: Listen to this {crowdword} crowd!', '📊 Bev: The {mascot} are the {t} mascot. I asked.', '🎙 Duane: The {mascot} faithful are on their feet!', '📊 Bev: Fun fact: this pitch is roughly regulation size.', '🎙 Duane: Patient build-up here…', '📊 Bev: Weather update: still {weathershort}.', '🎙 Duane: Hold on to your foam fingers, folks!', '📊 Bev: {local} local players in the line-up. Their families brought cowbells.']
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function line(type, e) {
    const m = M.m, T = m.teams, nm = x => x ? x.p.fn + ' ' + x.p.ln : '', S = m.score, col = C.college();
    const st = { station: 'K' + col.abbr, weather: C.WEATHER[M.f.wx][2], weathershort: C.WEATHER[M.f.wx][1].toLowerCase(), crowd: M.att.toLocaleString(), score: `${T[0].short} ${S[0]}–${S[1]} ${T[1].short}`, mascot: col.mascot, crowdword: M.att > 1500 ? 'roaring' : M.att > 600 ? 'lively' : 'small but loud',
      poss: Math.round(m.st.poss[M.my] / (m.st.poss[0] + m.st.poss[1] || 1) * 100), sh1: m.st.shots[M.my], sh2: m.st.shots[1 - M.my], local: M.locals };
    st.poss2 = 100 - st.poss;
    if (e && e.side >= 0) { st.c = m.st.corners[e.side]; st.ot = T[1 - e.side].short; st.f = m.st.fouls[1 - e.side]; st.form = e.extra && e.extra.form || ''; }
    if (e) { st.p = nm(e.who); st.t = e.side >= 0 ? T[e.side].short : ''; st.o = e.extra ? nm(e.extra.by || e.extra.off) : ''; st.k = e.extra && e.extra.gk ? nm(e.extra.gk) : nm(e.who); st.a = e.extra && e.extra.assist ? nm(e.extra.assist) : '';
      st.g = e.who ? e.who.st.g : 0; st.s = e.side >= 0 ? m.st.shots[e.side] : 0; st.sv = e.extra && e.extra.gk ? e.extra.gk.st.sv : e.who ? e.who.st.sv : 0; }
    else st.t = T[M.my].short;
    let arr = L[type]; if (!arr) return null;
    if (type === 'goal2' && !st.a) arr = arr.filter(x => !x.includes('{a}'));
    if (type === 'fill' && !M.locals) arr = arr.filter(x => !x.includes('{local}'));
    return pick(arr).replace(/\{(\w+)\}/g, (_, k) => st[k] != null ? st[k] : '');
  }

  // ================= sound (WebAudio, synthesised; muted until switched on, Q20j) =================
  const A = { ctx: null, crowd: null };
  function audio() {
    if (!C.acct().sound) return null;
    if (!A.ctx) { try { A.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
      const len = A.ctx.sampleRate * 2, buf = A.ctx.createBuffer(1, len, A.ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; A.noise = buf; }
    if (A.ctx.state === 'suspended') A.ctx.resume();
    return A.ctx;
  }
  function crowdOn(level) {
    const ctx = audio(); if (!ctx || A.crowd) return;
    const src = ctx.createBufferSource(); src.buffer = A.noise; src.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; const g = ctx.createGain(); g.gain.value = .015 + level * .07;
    src.connect(f).connect(g).connect(ctx.destination); src.start(); A.crowd = { src, g, base: g.gain.value };
  }
  function crowdOff() { if (A.crowd) { try { A.crowd.src.stop(); } catch (e) { } A.crowd = null; } }
  function swell(mult, secs) { if (!A.crowd || !A.ctx) return; const g = A.crowd.g.gain, t = A.ctx.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(A.crowd.base * mult, t + .3); g.linearRampToValueAtTime(A.crowd.base, t + secs); }
  function whistle(n = 1) { const ctx = audio(); if (!ctx) return; for (let i = 0; i < n; i++) { const t = ctx.currentTime + i * .45, o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
    o.frequency.value = 2900; lfo.frequency.value = 28; lg.gain.value = 140; lfo.connect(lg).connect(o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t + .02); g.gain.setValueAtTime(.06, t + (i === n - 1 && n > 1 ? .7 : .3)); g.gain.linearRampToValueAtTime(0, t + (i === n - 1 && n > 1 ? .75 : .35));
    o.connect(g).connect(ctx.destination); o.start(t); lfo.start(t); o.stop(t + 1); lfo.stop(t + 1); } }
  function sting() { const ctx = audio(); if (!ctx) return; [523, 659, 784, 1047].forEach((fq, i) => { const t = ctx.currentTime + i * .12, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = fq; g.gain.setValueAtTime(.035, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + .3); }); }
  function ooh() { const ctx = audio(); if (!ctx) return; const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime; s.buffer = A.noise; f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(900, t + .4); f.frequency.linearRampToValueAtTime(350, t + 1); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .3); g.gain.linearRampToValueAtTime(0, t + 1.1); s.connect(f).connect(g).connect(ctx.destination); s.start(t); s.stop(t + 1.2); }

  // ================= pre-match (Q20a) =================
  const host = () => C.$('#matchv');
  const label = f => C.fxLabel(f).long;   // 1.04: friendlies, 14/18/22 matches, the play-off
  C.openPreMatch = () => {
    const f = C.myFixture(); if (!f) return C.toast('No match to play');
    const rot = C.autoRotate(); if (rot) C.toast(`🔄 Auto-manage rested ${rot} tired player${rot > 1 ? 's' : ''}`);
    const car = C.car(), my = f.h === 0 ? 0 : 1, opp = C.oppTeam(my === 0 ? f.a : f.h), t = C.tac();
    if (t.xi.filter(Boolean).length < 11) { C.toast(t.empty && t.empty.some(Boolean) ? 'Fill every position in Tactics first' : 'Not enough fit players for an XI'); return C.openTactics(); }
    M = { f, my, opp, cd: 0, speed: 1, playing: false, ev: 0 };   // 1.10 (QA-118): no countdown before kick-off; the match waits for Kick off or Quick result
    M.att = C.attendance(f); M.locals = t.xi.map(C.P).filter(p => p && C.isLocal(p)).length;
    C.ui.closeAll(); drawPre();
  };
  function teamPair() { const me = C.myTeam(M.my === 0), A = M.my === 0 ? me : M.opp, B = M.my === 0 ? M.opp : me; A.home = !(M.f && M.f.n); B.home = false; return [A, B]; }   // 1.04: the play-off is on neutral ground
  function drawPre() {
    const car = C.car(), f = M.f, t = C.tac(), S = C.sea(), oppT = S.teams[M.my === 0 ? f.a : f.h], col = C.college(), w = C.WEATHER[f.wx];
    const xs = t.xi.map(C.P).filter(Boolean), avgE = Math.round(xs.reduce((s, p) => s + p.energy, 0) / (xs.length || 1));   // 1.05.01 (QA-75): an empty slot never crashes
    const mineRows = t.xi.map(C.P).map((p, i) => p ? `<div class="lu"><span class="lun">${p.num}</span><div class="luf">${C.faceOf(p)}</div><b>${C.esc(C.sn(p))}</b><small>${C.FORMATIONS[t.form][i][0]}</small></div>` : `<div class="lu"><span class="lun">–</span><div class="luf"></div><b>Empty</b><small>${C.FORMATIONS[t.form][i][0]}</small></div>`).join('');
    const oppRows = M.opp.xi.map((p, i) => `<div class="lu r"><small>${C.FORMATIONS[M.opp.form][i][0]}</small><b>${C.esc(p.ln)}</b><div class="luf">${C.faceOf(p)}</div><span class="lun">${p.num}</span></div>`).join('');   // 1.10.01 (QA-141): faces for both sides
    const home = M.my === 0;
    host().innerHTML = `<div class="pre kpre"><div class="prehd"><small>${label(f)} · ${w[0]} ${w[1]} · 👥 ${M.att.toLocaleString()}</small>
        <div class="vsrow ${home ? '' : 'awayrow'}"><div>${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 54)}<b>${C.esc(col.short)}</b><small>${home ? 'Home' : 'Away'} · you</small></div><span class="vsx">VS${(k => `<em class="rtcmp ${k.c}">${k.me} v ${oppT.rating}<br>${k.w}</em>`)(C.rateCmp(oppT.rating))}</span><div>${C.crestSVG(oppT.c1, oppT.c2, oppT.abbr.slice(0, 2), 54)}<b>${C.esc(oppT.name)}</b><small>${C.table()[0].p ? C.ord(C.table().findIndex(x => x.i === (home ? f.a : f.h)) + 1) + ' in table' : 'Season opener'}</small></div></div>
        <div class="radio">${C.radioLine && C.radioLine(f) ? C.radioLine(f) : `📻 K${col.abbr} campus radio with Duane &amp; Bev`}</div></div>${C.bigMatchHTML ? C.bigMatchHTML(f) : ''}${C.scoutHTML ? C.scoutHTML(f) : ''}
      ${xs.filter(p => p.energy < 50).length ? `<div class="tiredw">⚠ ${xs.filter(p => p.energy < 50).length} of your XI are under 50% Freshness (avg ${avgE}%). Rest them this match, or <button class="btn sm2 pri" data-act="rejuv">🧴 Rejuvenate</button></div>` : ''}
      ${(mine => { const opp = `<div><h4>${C.esc(oppT.name)} · ${M.opp.form}</h4>${oppRows}</div>`; return `<div class="lus">${home ? mine + opp : opp + mine}</div>`; })(`<div><h4>${C.esc(col.short)} · ${t.form} · ${C.MENTALITY[t.ment]}</h4>${mineRows}</div>`)}
      <div class="prebtns"><button class="btn go" data-act="mtac">${C.kGlyph ? C.kGlyph('tactics', 18) : ''} Tactics</button><button class="btn go" data-act="mquick"><svg viewBox="0 0 24 24" width="18" height="18">${C.kRingG ? C.kRingG.speed : ''}</svg> Quick result</button></div>
      <p class="note resnote">Matches resume if the game closes. Abandoning one forfeits it 0–9.</p>
      <button class="btn full pri kick" data-act="mkick">▶ Kick off <span id="cdn">${M.cd ? '· ' + M.cd : ''}</span></button>
      ${M.cd ? '<button class="cdpause" data-act="mcdstop">Tap to stop the countdown</button>' : ''}</div><div class="pgft kpreft"><button class="backarrow" data-act="mleave" aria-label="Back"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M11 4 3 12l8 8v-5h10V9H11z" fill="#fff"/></svg></button></div>`;
  }
  function countdown() { clearInterval(M.cdT); M.cdT = setInterval(() => { if (!M || M.m) return clearInterval(M && M.cdT); if (C.ui.isOpen()) return; M.cd--; const n = C.$('#cdn'); if (n) n.textContent = M.cd > 0 ? '· ' + M.cd : ''; if (M.cd <= 0) { clearInterval(M.cdT); C.kickOff(); } }, 1000); }
  C.preRefresh = () => { if (M && !M.m && host() && host().innerHTML) drawPre(); };   // 1.05.01 (QA-75): back from Tactics, the line-up shown is the current one
  C.stopCountdown = () => { clearInterval(M.cdT); M.cd = 0; drawPre(); };
  C.leaveMatch = () => { if (M) { clearInterval(M.cdT); cancelAnimationFrame(M.raf); } crowdOff(); M = null; host().innerHTML = ''; C.render(); };

  // ================= live match =================
  // 1.05.01 (QA-75): a match never starts without 11. Kick off, Quick result and the countdown all check again
  function needXI() { if (C.tac().xi.filter(Boolean).length >= 11) return false; clearInterval(M.cdT); M.cd = 0; drawPre(); C.toast('You need 11 players: fill every position in Tactics first'); C.openTactics(true); return true; }
  C.kickOff = () => {
    if (needXI()) return; clearInterval(M.cdT); const [A, B] = teamPair(), S = C.sea();
    M.m = C.createMatch(A, B, (C.car().created & 0xffff) * 131 + S.n * 977 + M.f.md * 7, matchOpts());
    liveStart();
    M.playing = true; M.last = performance.now(); M.acc = 0; M.lineT = 0; M.fillT = 0; M.kits = kitsFor(M.m.teams);
    drawLive(); say(line('ko')); setTimeout(() => M && M.m && say(line('ko').replace(/^.*$/, L.ko[1])), 2500);
    crowdOn(Math.min(1, M.att / 3000)); whistle(1);
    M.raf = requestAnimationFrame(loop);
  };
  C.quickMatch = () => { // auto-managed, straight to full time
    if (needXI()) return; clearInterval(M.cdT); const [A, B] = teamPair(); A.auto = B.auto = true; const S = C.sea();
    M.m = C.createMatch(A, B, (C.car().created & 0xffff) * 131 + S.n * 977 + M.f.md * 7, matchOpts());
    C.simToEnd(M.m); finishUI();
  };
  // the same options for watched and quick matches, so both give the same result; the game profile follows the career (men's or women's)
  function matchOpts() { return { knockout: !!M.f.ko, managedPens: true, gender: C.car().gender, trace: !!M.debug, med: [C.level('med') * (M.my === 0 ? 1 : 0), C.level('med') * (M.my === 1 ? 1 : 0)], edge: M.my === 1 ? .04 * (1 - C.travelCut(C.eff('transport')) / 100) : (1 + .2 * C.eff('stadium')) / 100 }; }   // 1.09: the Stadium's home advantage, by level
  function rate() { const m = M.m, b = m.ball, my = M.my; const near = Math.min(b.y, PL - b.y) < 30 || (b.fl && b.fl.type !== 'pass');
    return M.speed === .25 ? 1 : M.speed === 1 ? (near ? 2.3 : 5.5) : M.speed === 5 ? 17 : 34; }
  function loop(now) {
    if (!M || !M.m) return;
    const dt = Math.min(.1, (now - M.last) / 1000); M.last = now;
    if (M.resumeAfter && !C.ui.isOpen()) { M.resumeAfter = false; resumeCountdown(); }
    if (!M.playing && !M.cdUntil && !C.ui.isOpen()) playBtn();
    if (M.playing && !C.ui.isOpen()) {
      M.acc += dt * rate(); let n = 0;
      while (M.acc >= C.PITCH.DT && n++ < 60) { M.acc -= C.PITCH.DT; liveStep(); events(); if (M.m.ht || M.m.done || !M.playing) { M.acc = 0; break; } }
      if (M.m.ht && M.playing) { M.playing = false; halfTime(); }
      if (M.m.done) return finishUI();
      M.fillT += dt; if (M.fillT > 9 / Math.sqrt(M.speed)) { M.fillT = 0; if (M.m.t - (M.lastEvT || 0) > 25) say(line('fill')); }
    }
    draw(); hud();
    M.raf = requestAnimationFrame(loop);
  }
  function events() {
    const m = M.m;
    while (M.ev < m.events.length) {
      const e = m.events[M.ev++];
      if (['goal', 'save', 'miss', 'block', 'yellow', 'red', 'injury', 'sub', 'penalty', 'back', 'claim', 'knock', 'offside'].includes(e.type)) M.lastEvT = m.t;
      if (e.type === 'goal') { say(line('goal', e)); setTimeout(() => M && M.m && say(line('goal2', e)), 2200 / M.speed); swell(3.2, 4); if (e.side === M.my && M.my === 0) sting(); whistle(1); feed(e); }
      else if (e.type === 'save' || e.type === 'miss') { if (Math.random() < (M.speed === 1 ? .8 : .4)) say(line(e.type, e)); ooh(); swell(1.8, 1.5); }
      else if (e.type === 'offside') { say(line('offside', e)); whistle(1); flag('OFFSIDE', e.side); }
      else if (e.type === 'corner') { if (M.speed <= 5 || Math.random() < .5) say(line('corner', e)); flag('CORNER', e.side); }
      else if (e.type === 'throw') { if (Math.random() < (M.speed === 1 ? .3 : .1)) say(line('throw', e)); flag('THROW-IN', e.side); }
      else if (e.type === 'goalkick') { if (Math.random() < .15) say(line('goalkick', e)); flag('GOAL KICK', e.side); }
      else if (e.type === 'foul') { if (Math.random() < (M.speed === 1 ? .7 : .35)) say(line('foul', e)); whistle(1); flag('FREE KICK', e.side); }
      else if ((e.type === 'tackle' || e.type === 'int') && M.speed === 1 && Math.random() < .25 && m.t - (M.lastEvT || 0) > 6) say(line(e.type, e));
      else if (e.type === 'shape') say(line('shape', e));
      else if (['block', 'yellow', 'red', 'injury', 'knock', 'sub', 'back', 'claim', 'penalty'].includes(e.type)) { const k = e.type === 'penalty' ? 'pen' : e.type; if (e.type !== 'claim' || Math.random() < .3) say(line(k, e)); if (['yellow', 'red', 'penalty'].includes(e.type)) whistle(1); if (['yellow', 'red', 'injury', 'sub', 'penalty'].includes(e.type)) feed(e); }
      else if (e.type === 'ht') { say(line('ht')); whistle(2); }
      else if (e.type === 'ft') { say(line('ft')); whistle(3); }
      if (e.type === 'injury' && e.side === M.my && !m.teams[M.my].auto) { M.playing = false; setTimeout(() => C.openSubs(e.who), 50); }
      if (e.type === 'red') { swell(2.5, 3); setTimeout(() => M && M.m && say(line('red2', e)), 2600 / M.speed); redMoment(e); }
    }
  }
  // a set piece or decision shows on the pitch for a moment, so it can be seen even at speed
  function flag(txt, side) { M.flag = { txt, side, until: performance.now() + 1500 }; }
  // red card: stop, show it, and (for your team) offer a change of shape
  function redMoment(e) {
    M.playing = false; const mine = e.side === M.my, T = M.m.teams[e.side], n = M.m.ents.filter(x => x.side === e.side && x.on).length;
    const forms = ['4-4-1', '4-3-2', '5-3-1', '4-4-2', '3-5-1'].filter(f => C.FORMATIONS[f]);
    host().insertAdjacentHTML('beforeend', `<div class="redcard" id="redc"><div class="rcard"></div><b>RED CARD</b><p>${C.esc(e.who.p.fn + ' ' + e.who.p.ln)} is sent off. ${C.esc(T.short)} are down to ${n}.</p>
      ${mine ? `<small>${T.auto ? 'Auto-manage has reorganised the team.' : 'Change your shape for ten players?'}</small><div class="rpitch" id="rpitch">${C.livePitchSVG(e.side, T.auto ? -1 : (M.redOff = e.who.i))}</div><div class="rcf">${['4-4-2', '4-3-3', '4-2-3-1', '5-3-2', '4-1-4-1'].map(f => `<button class="btn sm2 ${T.form === f ? 'pri' : ''}" data-act="mredform" data-v="${f}">${f}</button>`).join('')}</div>` : ''}
      <button class="btn full pri" data-act="mredgo">▶ Play on</button></div>`);
  }
  // 1.06 (QA-76): a small pitch of your players as they stand: filled slots show the shirt number, an empty slot is dashed,
  // and the sent-off player's place is a red cross until the shape changes. Attack is at the top.
  C.livePitchSVG = (side, offI) => { const m = M && M.m; if (!m) return ''; const T = m.teams[side], F = C.FORMATIONS[T.form] || [], on = m.ents.filter(e => e.side === side && e.on);
    const W = 150, H = 170, X = x => 12 + x * (W - 24), Y = y => H - 16 - y * (H - 32);
    const dots = F.map((sl, i) => { const e = on.find(z => z.i === i), x = X(sl[1]), y = Y(sl[2]);
      if (e) return `<g><circle cx="${x}" cy="${y}" r="9" fill="#1e3a8a" stroke="#fff" stroke-width="1.5"/><text x="${x}" y="${y + 3.5}" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">${e.p.num || ''}</text><text x="${x}" y="${y + 18}" font-size="7" font-weight="800" fill="#fff" text-anchor="middle">${sl[0]}</text></g>`;
      if (i === offI) return `<g><circle cx="${x}" cy="${y}" r="9" fill="#dc2626" stroke="#fff" stroke-width="1.5"/><text x="${x}" y="${y + 4}" font-size="11" font-weight="900" fill="#fff" text-anchor="middle">✖</text><text x="${x}" y="${y + 18}" font-size="7" font-weight="800" fill="#fecaca" text-anchor="middle">${sl[0]}</text></g>`;
      return `<g><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 2" opacity=".8"/><text x="${x}" y="${y + 18}" font-size="7" font-weight="800" fill="#e2e8f0" text-anchor="middle">${sl[0]} · empty</text></g>`; }).join('');
    return `<svg class="lpitch" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="#15803d" stroke="#fff" stroke-opacity=".6"/><line x1="2" y1="${H / 2}" x2="${W - 2}" y2="${H / 2}" stroke="#fff" stroke-opacity=".35"/><circle cx="${W / 2}" cy="${H / 2}" r="16" fill="none" stroke="#fff" stroke-opacity=".35"/>${dots}</svg>`; };
  C.redForm = f => { C.reshape(M.m, M.my, f); liveLog({ k: 'form', f }); M.redOff = -1; C.$$('.rcf button').forEach(b => b.classList.toggle('pri', b.dataset.v === f)); const n = C.$('#rpitch'); if (n) n.innerHTML = C.livePitchSVG(M.my, -1); };
  C.redGo = () => { const n = C.$('#redc'); if (n) n.remove(); M.playing = true; };
  function say(t) { if (!t) return; const n = C.$('#tick'); if (n) { n.textContent = t; n.classList.remove('tpop'); void n.offsetWidth; n.classList.add('tpop'); } }
  function feed(e) { if (e.type === 'sub') updPend(); const n = C.$('#mfeed'); if (!n) return; const ic = { goal: '⚽', yellow: '🟨', red: '🟥', injury: '🩹', sub: '🔁', penalty: '🎯' }[e.type];
    const who = e.who ? C.sn(e.who.p) : '', mine = e.side === M.my;
    const txt = `${C.esc(who)}${e.type === 'sub' && e.extra && e.extra.off ? ' for ' + C.esc(e.extra.off.p.ln) : ''}`;   // 1.06 (QA-77): home on the left, away on the right (as the score bar)
    n.insertAdjacentHTML('afterbegin', e.side === 1 ? `<div class="r ${mine ? 'me' : ''}">${txt} ${ic} <b>${e.min}'</b></div>` : `<div class="${mine ? 'me' : ''}"><b>${e.min}'</b> ${ic} ${txt}</div>`); }

  // kits: home team in home colours; away team switches to its away kit if the two look alike; keepers get a colour nobody else wears
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const cdist = (a, b) => { const x = rgb(a), y = rgb(b), rm = (x[0] + y[0]) / 2; return Math.sqrt((2 + rm / 256) * (x[0] - y[0]) ** 2 + 4 * (x[1] - y[1]) ** 2 + (2 + (255 - rm) / 256) * (x[2] - y[2]) ** 2); };
  const lum = h => { const c = rgb(h); return .3 * c[0] + .59 * c[1] + .11 * c[2]; };
  const alike = (a, b) => cdist(a, b) < 260 || (Math.abs(lum(a) - lum(b)) < 70 && cdist(a, b) < 340);
  function kitsFor(T) {
    const home = [T[0].c1, T[0].c2]; let away = [T[1].c1, T[1].c2];
    if (alike(home[0], away[0])) away = !alike(home[0], T[1].c2) ? [T[1].c2, T[1].c1] : ['#f8fafc', T[1].c1];
    const gks = ['#facc15', '#22d3ee', '#a3e635', '#f472b6', '#fb923c'].filter(c => !alike(c, home[0]) && !alike(c, away[0]));
    return { kit: [home, away], gk: [[gks[0] || '#facc15', home[0]], [gks[1] || gks[0] || '#22d3ee', away[0]]] };
  }
  function drawLive() {
    const m = M.m, T = m.teams;
    const K = M.kits.kit, sw = k => `<i class="kitsw" style="background:${k[0]};border-color:${k[1]}"></i>`;
    const you = i => i === M.my ? '<em class="you">YOU</em>' : '';
    host().innerHTML = `<div class="live"><div class="sbar">${C.crestSVG(T[0].c1, T[0].c2, T[0].abbr.slice(0, 2), 30)}<b class="tn ${M.my === 0 ? 'me' : ''}">${sw(K[0])}${C.esc(T[0].abbr)}<small>H</small>${you(0)}</b><b class="sc" id="msc">0 – 0</b><b class="tn ${M.my === 1 ? 'me' : ''}">${sw(K[1])}${C.esc(T[1].abbr)}<small>A</small>${you(1)}</b>${C.crestSVG(T[1].c1, T[1].c2, T[1].abbr.slice(0, 2), 30)}
        <span class="mn" id="mmin">1'</span><button class="mic" data-act="msound">${C.acct().sound ? '🔊' : '🔇'}</button></div>
      <div class="pitchw"><canvas id="pitch"></canvas></div><div class="tick" id="tick"></div>
      <div class="mkey">${[0, 1].map(i => i === M.my ? `<span>${sw(K[i])} <b>${C.esc(T[i].short)}</b> (you) <span id="mdir">attack ▲</span></span>` : `<span>${sw(K[i])} ${C.esc(T[i].short)}</span>`).join('')}</div>
      <div class="spd spd9"><button class="mplay ${M.playing ? '' : 'paused'}" data-act="mpause" id="mpz" aria-label="Play or pause">${M.playing ? '⏸' : '▶'}</button>${[[.25, '1×'], [1, '5×'], [5, '10×'], [10, '20×']].map(([v, n]) => `<button class="${M.speed === v ? 'on' : ''}" data-act="mspeed" data-v="${v}">${n}</button>`).join('')}<button class="anl ${M.debug ? 'on' : ''}" data-act="mdebug" title="Show passes, shots and lines"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 19V5M4 19h16" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M7 15l4-5 3 3 5-6" fill="none" stroke="#22d3ee" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><small>Analysis</small></button><button data-act="mskip" data-v="ht" ${m.half > 1 ? 'disabled' : ''}>⏭ HT</button><button data-act="mskip" data-v="ft">⏭ FT</button></div>
      <div id="subpend">${C.pendingSubsHTML ? C.pendingSubsHTML(M.m) : ''}</div><div class="mbtns9 one"><button class="btn go" data-act="msubs">🔁 Team Changes</button></div><div class="mfeed" id="mfeed"></div><div class="mcd" id="mcd"></div>
      <div class="pend" id="mpend"></div></div>`;
    sizeCanvas();
  }
  function sizeCanvas() { const cv = C.$('#pitch'); if (!cv) return; const w0 = cv.parentElement.clientWidth, h0 = host().clientHeight - 290;
    let w = w0, h = w * (PL + 6) / (PW + 4); if (h > h0) { h = Math.max(320, h0); w = h * (PW + 4) / (PL + 6); }
    const dpr = window.devicePixelRatio || 1; cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; M.cw = w; M.ch = h; M.dpr = dpr; }
  function hud() {
    const m = M.m; const sc = C.$('#msc'); if (sc) sc.textContent = `${m.score[0]} – ${m.score[1]}`;
    const mn = C.$('#mmin'); if (mn) mn.textContent = m.ht ? 'HT' : m.done ? 'FT' : C.matchMinute(m) + "'";
    const pz = C.$('#mpz'); if (pz) pz.textContent = M.playing ? '⏸' : '▶';
    const pd = C.$('#mpend'); if (pd) { const p = m.pending.filter(s => s.side === M.my); pd.textContent = p.length ? `🔁 ${p.map(s => s.inP.ln + ' for ' + s.outE.p.ln).join(', ')} · at the next stoppage` : ''; }
  }

  // ---------- drawing to scale (Q20i): my team attacks up the screen in the first half and down it after half-time (teams change ends) ----------
  function draw() {
    const cv = C.$('#pitch'); if (!cv) return; const g = cv.getContext('2d'), m = M.m, k = M.cw / (PW + 4), dpr = M.dpr, flip = (M.my === 0) !== (m.half === 2);
    const X = x => (2 + (flip ? x : PW - x)) * k, Y = y => (3 + (flip ? PL - y : y)) * k;
    const dir = C.$('#mdir'); if (dir) dir.textContent = m.half === 2 ? 'attack ▼' : 'attack ▲';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#3f9e4a' : '#46a952'; g.fillRect(0, i * M.ch / 12, M.cw, M.ch / 12 + 1); }
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = Math.max(1, k * .14);
    const rect = (x1, y1, x2, y2) => g.strokeRect(Math.min(X(x1), X(x2)), Math.min(Y(y1), Y(y2)), Math.abs(X(x2) - X(x1)), Math.abs(Y(y2) - Y(y1)));
    rect(0, 0, PW, PL); g.beginPath(); g.moveTo(X(0), Y(PL / 2)); g.lineTo(X(PW), Y(PL / 2)); g.stroke();
    g.beginPath(); g.arc(X(PW / 2), Y(PL / 2), 9.15 * k, 0, 7); g.stroke();
    // goals drawn a little larger than true scale so they read next to the player tokens; misses land clear of the frame
    const GW = 4.6, GD = 2.6;
    for (const end of [0, PL]) { const d = end ? -1 : 1; rect(PW / 2 - 20.16, end, PW / 2 + 20.16, end + d * 16.5); rect(PW / 2 - 9.16, end, PW / 2 + 9.16, end + d * 5.5);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(PW / 2), Y(end + d * 11), k * .3, 0, 7); g.fill();
      const gx = Math.min(X(PW / 2 - GW), X(PW / 2 + GW)), gy = Math.min(Y(end), Y(end - d * GD)), gw = 2 * GW * k, gh = GD * k;
      g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(gx, gy, gw, gh);
      g.save(); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = .7; g.beginPath(); for (let i = 1; i < 8; i++) { g.moveTo(gx + gw * i / 8, gy); g.lineTo(gx + gw * i / 8, gy + gh); } g.moveTo(gx, gy + gh / 2); g.lineTo(gx + gw, gy + gh / 2); g.stroke(); g.restore();
      g.save(); g.strokeStyle = '#fff'; g.lineWidth = Math.max(2, k * .3); g.strokeRect(gx, gy, gw, gh); g.restore();
      g.beginPath(); g.arc(X(PW / 2), Y(end + d * 11), 9.15 * k, (d > 0) === flip ? Math.PI * 1.2 : Math.PI * .2, (d > 0) === flip ? Math.PI * 1.8 : Math.PI * .8); g.stroke(); }
    // debug view: offside lines, recent passes and shots, positions
    if (M.debug) {
      for (const sd of [0, 1]) { if (!m.off) break; const ly = sd === 0 ? m.off[0] : PL - m.off[1]; g.save(); g.setLineDash([4, 4]); g.strokeStyle = sd === M.my ? 'rgba(250,204,21,.9)' : 'rgba(248,113,113,.9)'; g.beginPath(); g.moveTo(X(0), Y(ly)); g.lineTo(X(PW), Y(ly)); g.stroke(); g.restore(); }
      for (const t of (m.trace || []).filter(t => m.t - t.t < (t.k === 'shot' ? 6 : 3))) { g.save(); g.globalAlpha = 1 - (m.t - t.t) / (t.k === 'shot' ? 6 : 3);
        g.strokeStyle = t.k === 'shot' ? (t.res === 'goal' ? '#22c55e' : '#f97316') : t.thru ? '#a855f7' : t.side === M.my ? '#fde047' : '#fca5a5'; g.lineWidth = t.k === 'shot' ? 2.5 : 1.5;
        g.beginPath(); g.moveTo(X(t.fx), Y(t.fy)); g.lineTo(X(t.tx), Y(t.ty)); g.stroke();
        g.fillStyle = '#fff'; g.font = '700 9px Nunito'; g.textAlign = 'left'; g.fillText(t.k === 'shot' ? `${t.from} ${t.d}m ${t.res}` : `${t.from}→${t.to} ${t.ok}%`, X(t.fx) + 6, Y(t.fy) - 6); g.restore(); }
    }
    // players: bigger tokens; your team gets a white halo
    const r = M.cw * .029, T = m.teams;
    const kit = (M.kits || kitsFor(T)).kit, gkKit = (M.kits || kitsFor(T)).gk;
    g.font = `900 ${Math.round(r * 1.15)}px Nunito`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const e of m.ents) { if (!e.on || e.bin) continue; const gk = e.slot.pos === 'GK', [f1, f2] = gk ? gkKit[e.side] : kit[e.side], mine = e.side === M.my;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(X(e.x) + 1.5, Y(e.y) + 2, r, r * .8, 0, 0, 7); g.fill();
      if (mine) { g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(X(e.x), Y(e.y), r + 2.2, 0, 7); g.fill(); }
      g.fillStyle = f1; g.strokeStyle = f2; g.lineWidth = 2; g.beginPath(); g.arc(X(e.x), Y(e.y), r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = gk ? '#111827' : f2; g.fillText(e.p.num, X(e.x), Y(e.y) + .5);
      if (M.debug) { g.save(); g.font = '800 8px Nunito'; g.fillStyle = '#fff'; g.fillText(e.slot.pos, X(e.x), Y(e.y) + r + 7); g.restore(); g.font = `900 ${Math.round(r * 1.15)}px Nunito`; }
      if (e.knock && mine) { g.fillStyle = '#ef4444'; g.beginPath(); g.arc(X(e.x) + r, Y(e.y) - r, r * .35, 0, 7); g.fill(); } }
    if (m.ball.owner && M.debug) { const o = m.ball.owner; g.save(); g.strokeStyle = '#fde047'; g.lineWidth = 2; g.beginPath(); g.arc(X(o.x), Y(o.y), r + 5, 0, 7); g.stroke(); g.restore(); }
    const b = m.ball; g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(X(b.x) + 1, Y(b.y) + 1.5, k * .55, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 1; g.beginPath(); g.arc(X(b.x), Y(b.y) - b.h * k * .6, k * (.62 + b.h * .08), 0, 7); g.fill(); g.stroke();
    // set-piece label near the ball
    if (M.flag && performance.now() < M.flag.until) { const t = M.flag.txt, bx = clamp(X(b.x), 40, M.cw - 40), by = clamp(Y(b.y) - 22, 14, M.ch - 14);
      g.save(); g.font = '900 12px Nunito'; const w = g.measureText(t).width + 16; g.fillStyle = M.flag.side === M.my ? 'rgba(22,101,52,.92)' : 'rgba(15,23,42,.88)'; g.beginPath(); g.roundRect ? g.roundRect(bx - w / 2, by - 10, w, 20, 10) : g.rect(bx - w / 2, by - 10, w, 20); g.fill();
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, bx, by + .5); g.restore(); }
  }
  const clamp = C.clamp;

  // ---------- controls ----------
  C.matchSpeed = s => { M.speed = +s; C.$$('.spd [data-act=mspeed]').forEach(b => b.classList.toggle('on', +b.dataset.v === M.speed)); };
  // debug view (round 5): real-time speed plus pass, shot and offside-line drawing
  C.matchDebug = () => { M.debug = !M.debug; if (M.debug && !M.m.trace) M.m.trace = []; if (M.debug) C.matchSpeed(.25); const b = C.$('[data-act=mdebug]'); if (b) b.classList.toggle('on', M.debug); };
  C.matchPause = () => { if (M.cdUntil) return; M.playing = !M.playing; playBtn(); if (M.m.ht) return C.secondHalf(); };
  function playBtn() { const b = C.$('#mpz'); if (b) { b.textContent = M.playing ? '⏸' : '▶'; b.classList.toggle('paused', !M.playing); } }
  // back from Subs or the Plan (FEEDBACK 80): stays paused if it was paused; if it was playing, a 3-2-1 countdown, then play
  function resumeCountdown() { M.cdUntil = performance.now() + 3000; const el = C.$('#mcd');
    const tick = () => { if (!M || !M.cdUntil) return; const left = Math.ceil((M.cdUntil - performance.now()) / 1000);
      if (left <= 0) { M.cdUntil = 0; if (el) el.textContent = ''; M.playing = true; M.last = performance.now(); playBtn(); return; }
      if (el) { el.textContent = left; el.classList.remove('tpop'); void el.offsetWidth; el.classList.add('tpop'); } setTimeout(tick, 1000 - ((M.cdUntil - performance.now()) % 1000) + 5); };
    tick(); }
  // 1.10.01 (QA-138): skips step through the same saving path as play, so Resume picks up after a skip
  C.matchSkip = v => { const m = M.m; let g = 0;
    if (v === 'ht' && m.half === 1) { while (m.half === 1 && !m.ht && !m.done && g++ < 20000) liveStep(); liveSave(); events(); M.playing = false; halfTime(); }
    else if (v === 'ft') { if (m.ht) C.resumeHT(m); while (!m.done && g++ < 40000) { liveStep(); if (m.ht) C.resumeHT(m); } liveSave(); M.ev = m.events.length; finishUI(); } };
  C.toggleSound = () => { const a = C.acct(); a.sound = !a.sound; C.save(); if (a.sound) { crowdOn(Math.min(1, (M && M.att || 500) / 3000)); } else crowdOff(); const b = C.$('.mic'); if (b) b.textContent = a.sound ? '🔊' : '🔇'; };
  function halfTime() {
    const m = M.m, S = m.st, my = M.my;
    host().insertAdjacentHTML('beforeend', `<div class="htcard" id="htc"><b>Half-time</b><div class="hts">${m.teams[0].short} ${m.score[0]} – ${m.score[1]} ${m.teams[1].short}</div>
      ${statBars(S, my)}<button class="btn full go" data-act="msubs">🔁 Team Changes</button><button class="btn full pri" data-act="m2h">▶ Second half</button></div>`);
  }
  C.secondHalf = () => { const n = C.$('#htc'); if (n) n.remove(); C.resumeHT(M.m); M.playing = true; whistle(1); const hb = C.$('[data-act=mskip][data-v=ht]'); if (hb) hb.disabled = true; };
  function statBars(S, my) {
    const row = (lab, a, b) => { const t = a + b || 1; return `<div class="sbr"><span>${a}</span><div><i style="width:${a / t * 100}%"></i></div><em>${lab}</em><div class="r"><i style="width:${b / t * 100}%"></i></div><span>${b}</span></div>`; };
    const pos = Math.round(S.poss[0] / (S.poss[0] + S.poss[1] || 1) * 100);
    return `<div class="sbars">${row('Possession %', pos, 100 - pos)}${row('Shots', S.shots[0], S.shots[1])}${row('On target', S.sot[0], S.sot[1])}${row('Corners', S.corners[0], S.corners[1])}${row('Fouls', S.fouls[0], S.fouls[1])}${row('Offsides', (S.offs || [0, 0])[0], (S.offs || [0, 0])[1])}${row('Cards', S.yc[0] + S.rc[0], S.yc[1] + S.rc[1])}</div>`;
  }

  // ---------- in-match plan: mentality and auto-manage ----------
  // 1.10 (QA-124, QA-125): an in-match instruction for one player (journalled for resume)
  const MARROW = ['⬇⬇', '⬇', '•', '⬆', '⬆⬆'];
  function instrRow(e) { return `<label class="fld">Instruction</label><div class="instr pfi">${MARROW.map((x, k) => `<button class="${e.instr === k ? 'on' : ''}" data-act="minstr" data-v="${e.p.id}|${k}"><span>${x}</span>${['Ultra def', 'Defend', 'Balanced', 'Attack', 'Ultra att'][k]}</button>`).join('')}</div><p class="note pfin">${C.INSTR_TXT ? C.INSTR_TXT[e.instr] : ''}</p>`; }
  C.ACTS.minstr = v => { if (!M || !M.m) return; const [id, k] = String(v).split('|'), e = M.m.ents.find(x => x.side === M.my && x.on && x.p.id === id); if (!e) return; e.instr = +k; const T = M.m.teams[M.my]; T.instr = Object.assign({}, T.instr || {}, { [id]: +k }); liveLog({ k: 'instr', id, v: +k }); C.ui.refresh(); };
  let planSel = null;
  C.ACTS.mplansel = v => { planSel = v === '' ? null : +v; C.ui.refresh(); };
  C.ACTS.mplansub = v => { const idx = +v; planSel = null; C.ui.closeAll(); setTimeout(() => { C.openSubs(); C.subOut(idx); }, 0); };
  function planBoard() { const m = M.m, T = m.teams[M.my], F = C.FORMATIONS[T.form] || [], on = m.ents.filter(e => e.side === M.my && e.on);
    return `<div class="board tall mplanb">${F.map((sl, i) => { const e = on.find(z => z.i === i), left = 8 + sl[1] * 84, top = 88 - sl[2] * 80;
      if (!e) return `<div class="tk mpe" style="left:${left}%;top:${top}%"><small>${sl[0]}</small></div>`;
      const en = Math.round(e.energy);
      return `<button class="tk mptk ${planSel === m.ents.indexOf(e) ? 'sel' : ''}" style="left:${left}%;top:${top}%" data-act="mplansel" data-v="${m.ents.indexOf(e)}"><div class="tkf">${C.faceOf(e.p)}</div><div class="tkn">${C.esc(e.p.ln)}</div><div class="mpst"><span style="color:${en < 45 ? '#f87171' : en < 60 ? '#fbbf24' : '#86efac'}"><i class="dropi"></i>${en}</span> ⭐${C.matchRatingOf ? C.matchRatingOf(m, e) : ''}</div>${e.instr !== 2 ? `<i class="bdg ins">${MARROW[e.instr]}</i>` : ''}</button>`; }).join('')}</div>`; }
  C.openMatchPlan = () => { if (M.playing && !M.m.ht) M.resumeAfter = true; M.playing = false; planSel = null; C.ui.open('Match plan', () => { const m = M.m, T = m.teams[M.my];
    const sel = planSel != null ? m.ents[planSel] : null;
    return `<p class="note" style="margin-top:0">Tap a player for their instruction, or to take them off.</p>${planBoard()}
      ${sel ? `<div class="card pfocus">${C.matchFocusHTML(m, sel)}${instrRow(sel)}<div class="jbtns" style="grid-template-columns:1fr 1fr;margin-top:8px"><button class="btn sec2" data-act="mplansel" data-v="">Close</button><button class="btn go" data-act="mplansub" data-v="${planSel}">🔁 Sub off…</button></div></div>` : ''}
      <label class="fld">Formation</label><div class="forms mforms2">${Object.keys(C.FORMATIONS).map(f => `<button class="${T.form === f ? 'on' : ''}" data-act="mform" data-v="${f}">${f}</button>`).join('')}</div>
      <label class="fld">Mentality</label><div class="ments mments">${C.MENTALITY.map((x, i) => `<button class="${T.ment === i ? 'on' : ''}" data-act="mmset" data-v="${i}"><span>${MARROW[i]}</span><small>${['Ultra def', 'Defend', 'Balanced', 'Attack', 'Ultra att'][i]}</small></button>`).join('')}</div>
      <button class="btn full ${T.auto ? 'pri' : 'sec2'}" data-act="mauto" style="margin-top:12px">${T.auto ? '✔ Auto-manage is on' : 'Turn on auto-manage'}</button>
      <p class="note">Your staff sub injured and tired players, protects or chases a lead late on, and keeps your playing-time promises.</p><button class="btn full go" data-act="back">▶ Return to match</button>`; }); };
  C.openMatchPlanOld = () => { if (M.playing && !M.m.ht) M.resumeAfter = true; M.playing = false; C.ui.open('Match plan', () => { const T = M.m.teams[M.my];
    const nOn = M.m.ents.filter(e => e.side === M.my && e.on).length;
    return `${nOn < 11 ? `<div class="card" style="text-align:center;padding:8px"><b>Playing with ${nOn}</b><div class="rpitch">${C.livePitchSVG(M.my, M.redOff == null ? -1 : M.redOff)}</div><small class="mutey">✖ sent off · dashed = an empty position</small></div>` : `<div class="rpitch">${C.livePitchSVG(M.my, -1)}</div>`}<label class="fld">Formation</label><div class="instr mforms">${Object.keys(C.FORMATIONS).map(f => `<button class="${T.form === f ? 'on' : ''}" data-act="mform" data-v="${f}">${f}</button>`).join('')}</div>
      <label class="fld">Mentality</label><div class="instr">${C.MENTALITY.map((x, i) => `<button class="${T.ment === i ? 'on' : ''}" data-act="mmset" data-v="${i}">${x}</button>`).join('')}</div>
      <button class="btn full ${T.auto ? 'pri' : 'sec2'}" data-act="mauto" style="margin-top:12px">${T.auto ? '✔ Auto-manage is on' : 'Turn on auto-manage'}</button>
      <p class="note">Your staff sub injured and tired players, protects or chases a lead late on, and keeps your playing-time promises.</p><button class="btn full sec2" data-act="back">Back to the match</button>`; }); };
  C.ACTS.mform = f => { C.reshape(M.m, M.my, f); liveLog({ k: 'form', f }); M.redOff = -1; C.ui.refresh(); };   // 1.04.01 (QA-47): change the formation during a match
  C.matchMent = v => { const T = M.m.teams[M.my]; T.ment = +v; T.ment0 = +v; liveLog({ k: 'ment', v: +v }); C.ui.refresh(); };
  C.matchAuto = () => { const T = M.m.teams[M.my]; T.auto = !T.auto; liveLog({ k: 'auto', v: T.auto }); C.ui.refresh(); };

  // ---------- substitutions (Q20f) ----------
  C.openSubs = (hurtE) => { if (M.playing && !M.m.ht) M.resumeAfter = true; M.playing = false; M.pickOut = hurtE ? M.m.ents.indexOf(hurtE) : null; C.ui.open('Substitutions', () => subsHTML(hurtE)); };
  C.matchMySide = () => M ? M.my : 0;
  const updPend = () => { const n = C.$('#subpend'); if (n && M && M.m) n.innerHTML = C.pendingSubsHTML ? C.pendingSubsHTML(M.m) : ''; };
  C.subCancel = i => { if (!M || !M.m) return; const s0 = M.m.pending[i]; if (s0) liveLog({ k: 'unsub', out: s0.outE.p.id, in: s0.inP.id }); M.m.pending.splice(i, 1); updPend(); C.ui.refresh(); C.toast('Sub cancelled'); };
  function subsHTML(hurtE) {
    const m = M.m, my = M.my, T = m.teams[my], on = m.ents.filter(e => e.side === my && e.on);
    const pool = T.bench.concat(m.ents.filter(e => e.side === my && !e.on && !e.red && !e.injured).map(e => e.p)).filter((p, i, a) => a.indexOf(p) === i && C.canBringOn(m, my, p));
    const out = M.pickOut != null ? m.ents[M.pickOut] : null, FIT = ['', '#dc2626', '#f97316', '#eab308', '#84cc16', '#16a34a'];
    const row = (p, act, v, extra = '', best = false, mk = '') => `<button class="pkrow ${best ? 'best' : ''}" data-act="${act}" data-v="${v}"><div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><small>${extra}</small>${mk}</div><b class="pkr">${p.rating}</b>${best ? '<em class="bestt">Best</em>' : ''}</button>`;
    const pendOut = e => m.pending.find(s => s.side === my && s.outE === e), pendIn = p => m.pending.find(s => s.side === my && s.inP === p);
    const mark = t => `<em class="submark">🔁 ${t}</em>`;
    let body;
    if (!out) body = `<label class="fld">1. Who comes off?</label>` + on.map(e => row(e.p, 'msout', m.ents.indexOf(e), `<span class="pchip" style="background:var(--school)">${e.slot.pos}</span> <i class="dropi"></i> ${Math.round(e.energy)}% ${C.matchRatingOf ? '· ⭐ ' + C.matchRatingOf(m, e) : ''} ${e.injured ? '🩹' : e.knock ? '🤕' : ''}${e.bin ? '🟨' : ''}${pendOut(e) ? mark('Coming off for ' + C.esc(pendOut(e).inP.ln)) : ''}`)).join('');
    else { const pos = out.slot.pos, ranked = pool.map(p => [p, C.fit(p, pos) * 100 + p.rating + p.energy / 10]).sort((a, b) => b[1] - a[1]);
      body = `<div class="card pfocus">${C.matchFocusHTML ? C.matchFocusHTML(m, out) : ''}${instrRow(out)}<button class="btn sm2 sec2" data-act="msout" data-v="" style="margin-top:8px">Pick a different player</button></div>
        <label class="fld">2. Who comes on at ${pos}?</label>` + (ranked.length ? ranked.map(([p], i) => row(p, 'msin', p.id, `<span class="pchip" style="background:${FIT[C.fit(p, pos)]}">${p.pos}</span> ${C.FITLABEL[C.fit(p, pos)]} at ${pos} · <i class="dropi"></i> ${Math.round(p.energy)}%`, i < 2 && C.fit(p, pos) >= 3, pendIn(p) ? mark('Coming on for ' + C.esc(pendIn(p).outE.p.ln)) : '')).join('') : '<p class="note">Nobody left on the bench.</p>'); }
    return `${C.pendingSubsHTML ? C.pendingSubsHTML(m) : ''}${hurtE ? `<div class="card" style="background:#fee2e2;color:#991b1b;font-weight:800">🩹 ${C.esc(hurtE.p.fn + ' ' + hurtE.p.ln)} is hurt. Choose a replacement.</div>` : ''}
      <p class="note" style="margin-top:6px">College rules: unlimited changes. A player taken off in the first half can come back once in the second.</p>${body}
      <button class="btn full go" data-act="back" style="margin-top:10px">▶ Return to match</button>`;
  }
  C.subOut = idx => { M.pickOut = idx === '' || idx == null ? null : +idx; C.ui.refresh(); };
  C.subIn = id => { const m = M.m, e = m.ents[M.pickOut], T = m.teams[M.my], pool = T.bench.concat(m.ents.filter(x => x.side === M.my && !x.on).map(x => x.p)), p = pool.find(x => x.id === id);
    if (p && e) { const was = C.queueSub(m, M.my, e, p, true); liveLog({ k: 'sub', out: e.p.id, in: p.id }); C.toast(`🔁 ${e.p.ln} off, ${p.ln} on ${m.ht ? 'at the restart' : 'at the next stoppage'}${was && was.length ? ` · replaces ${was.map(s => s.inP.ln + ' for ' + s.outE.p.ln).join(', ')}` : ''}`); updPend(); }
    M.pickOut = null; C.ui.refresh(); };   // 1.10 (QA-117): stay on Substitutions for the next change

  // ================= full time =================
  function finishUI() {
    if (M.m.needPens && !M.m.pens) return shootout();   // 1.06 (QA-100): level after a knockout match: penalties on screen
    cancelAnimationFrame(M.raf); crowdOff(); const rep = C.applyResult(M.m, M.f); liveEnd(); const S = C.sea();
    host().innerHTML = ''; M = null; C.render();
    C.openReport(rep.md, true);
  }
  // ================= 1.10 (QA-127): matches resume; every key event is saved at once; Abandon = a 0–9 forfeit =================
  // The engine is deterministic from its seed, so a match is saved as: the fixture, the seed, the step count and your decisions
  // (subs, cancels, formation, Mentality, auto-manage, instructions, half-time restart) with the step they were made at.
  // Reopening replays it to the saved step, exactly as it was, and carries on.
  const KEYEV = new Set(['goal', 'yellow', 'red', 'injury', 'sub', 'penalty', 'ht', 'ft']);
  function liveStart() { const car = C.car(), S = C.sea(); M.m.stepN = 0; M.lastSave = performance.now();
    car.live = { v: 1, sn: S.n, md: M.f.md, seed: (car.created & 0xffff) * 131 + S.n * 977 + M.f.md * 7, n: 0, log: [], score: [0, 0], min: 1, opp: M.opp && (M.opp.short || M.opp.name), at: Date.now() }; C.save(); }
  function liveLog(d) { const car = C.car(); if (!car || !car.live || !M || !M.m || M.replaying) return; car.live.log.push(Object.assign({ s: M.m.stepN || 0 }, d)); liveSave(); }
  function liveSave(extra) { const car = C.car(); if (!car || !car.live || !M || !M.m || M.replaying) return; const L = car.live; L.n = M.m.stepN || 0; L.score = M.m.score.slice(); L.min = M.m.events.length ? (M.m.events[M.m.events.length - 1].min || L.min) : L.min; if (extra) Object.assign(L, extra); C.save(); M.lastSave = performance.now(); }
  function liveStep() { const m = M.m, e0 = m.events.length; C.stepMatch(m); m.stepN = (m.stepN || 0) + 1;
    let key = false; for (let i = e0; i < m.events.length; i++) if (KEYEV.has(m.events[i].type)) { key = true; break; }
    if (key || performance.now() - (M.lastSave || 0) > 4000) liveSave(); }
  function liveEnd() { const car = C.car(); if (car && car.live) { delete car.live; C.save(); } }
  C.resumeHTWrap = m => { liveLog({ k: 'ht' }); };
  // apply one logged decision while replaying
  function applyLog(d) { const m = M.m, T = m.teams[M.my], ent = id => m.ents.find(e => e.side === M.my && e.p.id === id && e.on), pl = id => T.bench.concat(m.ents.filter(x => x.side === M.my).map(x => x.p)).find(p => p.id === id);
    if (d.k === 'sub') { const e = ent(d.out), p = pl(d.in); if (e && p) C.queueSub(m, M.my, e, p, true); }
    else if (d.k === 'unsub') { const i = m.pending.findIndex(s => s.outE.p.id === d.out && s.inP.id === d.in); if (i >= 0) m.pending.splice(i, 1); }
    else if (d.k === 'swap') { const a = ent(d.a), b = ent(d.b); if (a && b) C.queueSwap(m, M.my, a, b); }
    else if (d.k === 'unswap') { m.swaps = (m.swaps || []).filter(s => !(s.a.p.id === d.a && s.b.p.id === d.b)); }
    else if (d.k === 'form') C.reshape(m, M.my, d.f);
    else if (d.k === 'ment') { T.ment = d.v; T.ment0 = d.v; }
    else if (d.k === 'auto') T.auto = d.v;
    else if (d.k === 'instr') { const e = m.ents.find(x => x.side === M.my && x.p.id === d.id); if (e) e.instr = d.v; }
    else if (d.k === 'ht') { if (m.ht) C.resumeHT(m); } }
  C._liveM = () => M && M.m;   // for checks
  C.matchLive = () => { const car = C.car(); return car && car.live && car.live.v ? car.live : null; };
  // on opening the game: a match in progress always offers Resume (nothing else opens until you choose)
  C.matchResumeCheck = () => { const L = C.matchLive(); if (!L || M) return; const S = C.sea(), f = C.myFixture && C.myFixture();
    if (!S || S.n !== L.sn || !f || f.md !== L.md) { liveEnd(); return; }
    C.ui.open('Match in progress', () => `<div class="card" style="text-align:center"><b style="font-size:17px">vs ${C.esc(L.opp || 'your opponent')}</b><div style="font:600 34px/1.1 Teko,sans-serif;margin:6px 0">${L.score[f.h === 0 ? 0 : 1]} – ${L.score[f.h === 0 ? 1 : 0]}</div><small class="mutey">${L.so ? 'In the penalty shootout' : 'At ' + L.min + "'"}</small></div>
      <p class="note">The game closed during this match. Resume from where it stopped, or abandon it (a 0–9 forfeit loss).</p>
      <button class="btn full pri" data-act="mresume">▶ Resume the match</button><button class="btn full danger" style="margin-top:8px" data-act="mabandon">Abandon (forfeit 0–9)</button>`, { modal: false, popup: true }); };
  C.ACTS.mresume = () => { const L = C.matchLive(); if (!L) return C.ui.closeAll(); C.ui.closeAll(); C.openPreMatch(); if (!M) return;
    const [A, B] = teamPair(); M.m = C.createMatch(A, B, L.seed, matchOpts()); M.m.stepN = 0; M.replaying = true;
    const log = (L.log || []).slice().sort((a, b) => a.s - b.s); let li = 0, g = 0;
    while ((M.m.stepN || 0) < L.n && !M.m.done && g++ < 40000) { while (li < log.length && log[li].s <= M.m.stepN) applyLog(log[li++]); if (M.m.ht && !log.slice(li).some(d => d.k === 'ht')) C.resumeHT(M.m); C.stepMatch(M.m); M.m.stepN++; }
    while (li < log.length) applyLog(log[li++]);
    M.replaying = false; M.ev = M.m.events.length; M.playing = false; M.last = performance.now(); M.acc = 0; M.lineT = 0; M.fillT = 0; M.kits = kitsFor(M.m.teams);
    if (L.so && M.m.needPens) { shootout(); SO.order = L.so.order.slice(); SO.started = true; SO.silent = true; for (let i = 0; i < L.so.n && !SO.done; i++) soKick(); SO.silent = false; drawShootout(); return; }
    drawLive(); const sc = C.$('#msc'); if (sc) sc.textContent = M.m.score[0] + ' – ' + M.m.score[1];
    M.m.events.filter(e => ['goal', 'yellow', 'red', 'injury', 'sub', 'penalty'].includes(e.type)).forEach(e => feed(e));
    say('▶ Resumed. Tap play when you are ready.'); if (M.m.ht) halfTime(); M.raf = requestAnimationFrame(loop); };
  C.ACTS.mabandon = () => C.confirm('Abandon the match?', '<p>This match counts as a <b>0–9 forfeit loss</b>: the table, results, form and Director confidence take it like any loss. This can\'t be undone.</p>', 'Abandon (forfeit)', 'mabandonok', '');
  C.ACTS.mabandonok = () => { const L = C.matchLive(); C.ui.closeAll(); if (!L) return; C.openPreMatch(); if (!M) return;
    const [A, B] = teamPair(); M.m = C.createMatch(A, B, L.seed, matchOpts()); const m = M.m; m.score = M.my === 0 ? [0, 9] : [9, 0]; m.done = true; m.forfeit = true;
    m.events.push({ type: 'ft', side: -1, min: 90 }); cancelAnimationFrame(M.raf); const rep = C.applyResult(m, M.f); liveEnd(); host().innerHTML = ''; M = null; C.render();
    C.mail('director', '🏳️', 'Match abandoned: forfeited 0–9', 'The match was abandoned, so it counts as a 0–9 forfeit loss.', null); C.openReport(rep.md, true); };

  // ================= 1.10.01 (QA-142 to QA-145): ONE journey for team changes =================
  // The match uses the Tactics page: the coach's live read, formations, Mentality arrows, the board (Freshness ring and
  // ⭐ match rating per player), the bench, Auto-manage and Return to match. Tapping a player opens ONE popup: the player
  // and their instruction on top, ranked replacements under it; a replacement becomes a sub at the next stoppage.
  const MSHORT = ['Ultra def', 'Defend', 'Balanced', 'Attack', 'Ultra att'];
  function liveRead(m, my) { const T = m.teams[my], on = m.ents.filter(e => e.side === my && e.on), mn = (m.events.length ? m.events[m.events.length - 1].min : 1) || 1;
    const d = m.score[my] - m.score[1 - my], tired = on.filter(e => e.energy < 50).sort((a, b) => a.energy - b.energy), down = on.length < 11, oppDown = m.ents.filter(e => e.side !== my && e.on).length < 11;
    if (down) return `Down to ${on.length}: tighten up. A Defensive shape will help.`;
    if (m.ht) return d < 0 ? `Half-time and we're behind. Let's be braver: try Attacking.` : d > 0 ? `Good half. Keep the shape and see it through.` : `Level at the break. A change or two could swing it.`;
    if (d < 0 && mn >= 60 && T.ment < 3) return `We need more going forward: try Attacking.`;
    if (d > 0 && mn >= 75 && T.ment > 1) return `Let's see this out: Defensive would do it.`;
    if (tired.length) return `${tired[0].p.ln}'s legs are going (${Math.round(tired[0].energy)}%): think about a change.`;
    if (oppDown) return `They're down to ten. Push on: Attacking.`;
    return d > 0 ? `We're on top. Stay patient.` : d < 0 ? `Keep going: one chance changes it.` : `It's tight. Stay in shape.`; }
  function benchPool(m, my) { const T = m.teams[my]; return T.bench.concat(m.ents.filter(e => e.side === my && !e.on && !e.red && !e.injured).map(e => e.p)).filter((p, i, a) => a.indexOf(p) === i && C.canBringOn(m, my, p)); }
  function teamHTML() { const m = M.m, my = M.my, T = m.teams[my], F = C.FORMATIONS[T.form] || [], L = C.slotLabels ? C.slotLabels(T.form) : F.map(s => s[0]), on = m.ents.filter(e => e.side === my && e.on), PILL = C.PILL || [];
    const pendOut = e => m.pending.find(s => s.side === my && s.outE === e), pendIn = p => m.pending.find(s => s.side === my && s.inP === p);
    const tokens = F.map((s, i) => { const e = on.find(z => z.i === i), left = s[1] * 100, top = 93 - s[2] * 86;
      if (!e) return `<div class="tk" style="left:${left}%;top:${top}%"><div class="tkf empty">✖</div><div class="tkn" style="background:#f87171"><span>${L[i]}</span></div></div>`;
      const fit = C.fit(e.p, s[0]), en = Math.round(e.energy), po = pendOut(e);
      return `<div class="tk" style="left:${left}%;top:${top}%" data-act="mpick" data-v="${m.ents.indexOf(e)}"><div class="tkb">${e.instr !== 2 ? `<i class="bdg ins">${MARROW[e.instr]}</i>` : ''}${po || (m.swaps || []).some(s => s.side === my && (s.a === e || s.b === e)) ? '<i class="bdg subm">🔁</i>' : ''}${e.bin ? '<i class="bdg yc"></i>' : ''}</div>
        <button class="tkf" data-act="mpick" data-v="${m.ents.indexOf(e)}">${C.faceOf(e.p)}</button>
        <button class="tkn" style="background:${PILL[fit] || '#cbd5e1'}" data-act="mpick" data-v="${m.ents.indexOf(e)}"><span>${C.esc(C.sn(e.p))}</span><i>▾</i></button>
        <div class="tkm">${C.frBadge ? C.frBadge(e.energy) : en}<span class="tr tmr">⭐ ${C.matchRatingOf(m, e)}</span></div></div>`; }).join('');
    const bench = benchPool(m, my).map(p => { const pi = pendIn(p); return `<div class="btok ${pi ? 'sel' : ''}"><span class="bf">${C.faceOf(p)}</span><b>${C.esc(C.sn(p))}</b><small>${C.tacRing ? C.tacRing(p.energy, 12) : ''} ${p.pos} · ${p.rating}</small>${pi ? `<em class="subm2">On for ${C.esc(pi.outE.p.ln)}</em>` : ''}</div>`; }).join('');
    return `<div class="tac2 tmatch"><div class="slimadv">${C.adviceLine ? C.adviceLine(liveRead(m, my)) : ''}</div>
      <div class="forms">${Object.keys(C.FORMATIONS).map(f => `<button class="${T.form === f ? 'on' : ''}" data-act="mform" data-v="${f}">${f}</button>`).join('')}</div>
      <div class="ments">${C.MENTALITY.map((x, i) => `<button class="${T.ment === i ? 'on' : ''}" data-act="mmset" data-v="${i}"><span>${MARROW[i]}</span><small>${MSHORT[i]}</small></button>`).join('')}</div>
      <div class="tview2"><span>${T.form} · ${C.MENTALITY[T.ment]} · ${m.score[0]}–${m.score[1]}</span></div>
      <div id="subpend">${C.pendingSubsHTML ? C.pendingSubsHTML(m) : ''}</div>
      <div class="board tall"><div class="bpitch"><i class="half"></i><i class="circ"></i><i class="box1"></i><i class="box2"></i></div>${tokens}</div>
      <p class="note" style="margin:4px 0 0;text-align:center">Tap a player to see how they're doing, change their instruction or bring someone on.</p>
      <h3 class="jh">Subs <small class="devp">${C.esc('College rules: unlimited changes; a player taken off in the first half can come back once in the second.')}</small></h3><div class="bench">${bench || '<p class="note">Nobody left on the bench.</p>'}</div>
      <div class="jbtns"><button class="btn ${T.auto ? 'go' : 'sec2'}" data-act="mauto">${T.auto ? '✔ Auto-manage' : 'Auto-manage: off'}</button><button class="btn pri" data-act="back">▶ Return to match</button></div></div>`; }
  function pickHTML(idx) { const m = M.m, my = M.my, e = m.ents[idx]; if (!e || !e.on) return '<p class="note">That player is no longer on the pitch.</p><button class="btn full go" data-act="back">Back</button>';
    const pos = e.slot.pos, FIT = ['', '#dc2626', '#f97316', '#eab308', '#84cc16', '#16a34a'], pendIn = p => m.pending.find(s => s.side === my && s.inP === p), po = m.pending.find(s => s.side === my && s.outE === e);
    // 1.10.03 (QA-164): Show subs = bring someone on; Show XI = swap positions with a team-mate on the pitch
    const swOf = x => (m.swaps || []).find(s => s.side === my && (s.a === x || s.b === x)), swMate = (s, x) => s.a === x ? s.b : s.a, sw = swOf(e);
    const cand = (mSubs ? benchPool(m, my).map(p => ({ p, x: null })) : []).concat(mXI && pos !== 'GK' ? m.ents.filter(x => x.side === my && x.on && x !== e && x.slot.pos !== 'GK').map(x => ({ p: x.p, x })) : []);
    const ranked = cand.map(c => [c, C.fit(c.p, pos) * 100 + c.p.rating + c.p.energy / 10]).sort((a, b) => b[1] - a[1]);
    const rows = ranked.map(([c], i) => { const p = c.p, best = i < 2 && C.fit(p, pos) >= 3, pi = c.x ? null : pendIn(p), ps = c.x ? swOf(c.x) : null;
      const act = c.x ? `data-act="mswap" data-v="${idx}|${m.ents.indexOf(c.x)}"` : `data-act="msin2" data-v="${idx}|${p.id}"`;
      return `<button class="pkrow ${best ? 'best' : ''}" ${act}><div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><small><span class="pchip" style="background:${FIT[C.fit(p, pos)]}">${c.x ? c.x.slot.pos : p.pos}</span> ${C.FITLABEL[C.fit(p, pos)]} at ${pos} · <i class="dropi"></i> ${Math.round(c.x ? c.x.energy : p.energy)}%</small>${c.x ? `<em class="swtag">On the pitch: swap positions</em>` : ''}${pi ? `<em class="submark">🔁 Coming on for ${C.esc(pi.outE.p.ln)}</em>` : ''}${ps ? `<em class="submark">🔁 Swapping with ${C.esc(swMate(ps, c.x).p.ln)}</em>` : ''}</div><b class="pkr">${p.rating}</b>${best ? '<em class="bestt">Best</em>' : ''}</button>`; }).join('');
    return `<div class="altp pfocus pk1">${C.matchFocusHTML(m, e)}${po ? `<p class="submark" style="margin:6px 0 0">🔁 Coming off for ${C.esc(po.inP.ln)} at the ${m.ht ? 'restart' : 'next stoppage'} <button class="btn sm2 sec2" data-act="subcancel" data-v="${m.pending.indexOf(po)}">Cancel</button></p>` : ''}${sw ? `<p class="submark" style="margin:6px 0 0">🔁 Swapping positions with ${C.esc(swMate(sw, e).p.ln)} at the ${m.ht ? 'restart' : 'next stoppage'} <button class="btn sm2 sec2" data-act="swapcancel" data-v="${m.swaps.indexOf(sw)}">Cancel</button></p>` : ''}${instrRow(e)}
      <div class="ahd2"><small class="ahd">Change for</small><button class="chk ${mXI ? 'on' : ''}" data-act="mpktog" data-v="xi">Show XI</button><button class="chk ${mSubs ? 'on' : ''}" data-act="mpktog" data-v="subs">Show subs</button></div><div class="alist pkscroll">${rows || `<p class="note">${mXI || mSubs ? 'Nobody available.' : 'Turn on Show XI or Show subs.'}</p>`}</div></div>`; }
  let mXI = false, mSubs = true;
  C.ACTS.mpktog = v => { if (v === 'xi') mXI = !mXI; else mSubs = !mSubs; C.ui.refresh(); };
  C.ACTS.mswap = v => { const [i, j] = String(v).split('|').map(Number), m = M.m, a = m.ents[i], b = m.ents[j]; if (!a || !b || !a.on || !b.on) return;
    C.queueSwap(m, M.my, a, b); liveLog({ k: 'swap', a: a.p.id, b: b.p.id });
    C.toast(`🔁 ${a.p.ln} to ${b.slot.pos}, ${b.p.ln} to ${a.slot.pos} ${m.ht ? 'at the restart' : 'at the next stoppage'}`); updPend(); C.ui.back(); C.ui.refresh(); };
  C.ACTS.swapcancel = v => { const m = M && M.m; if (!m || !m.swaps) return; const s = m.swaps[+v]; if (!s) return; liveLog({ k: 'unswap', a: s.a.p.id, b: s.b.p.id }); m.swaps.splice(+v, 1); updPend(); C.ui.refresh(); C.toast('Swap cancelled'); };
  C.openTeam = hurtE => { if (!M || !M.m) return; if ((M.playing || hurtE) && !M.m.ht) M.resumeAfter = true; M.playing = false;
    C.ui.open('Team Changes', teamHTML);
    if (hurtE) setTimeout(() => C.openTeamPick(M.m.ents.indexOf(hurtE)), 0); };
  C.openTeamPick = idx => { C.ui.asPopup = true; C.ui.open('Choose player', () => pickHTML(+idx)); };
  C.openSubs = hurtE => C.openTeam(hurtE);
  C.openMatchPlan = () => C.openTeam();
  C.ACTS.mpick = v => C.openTeamPick(v);
  C.ACTS.msin2 = v => { const [i, id] = String(v).split('|'), m = M.m, e = m.ents[+i], p = benchPool(m, M.my).find(x => x.id === id); if (!e || !p) return;
    const was = C.queueSub(m, M.my, e, p, true); liveLog({ k: 'sub', out: e.p.id, in: p.id });
    C.toast(`🔁 ${e.p.ln} off, ${p.ln} on ${m.ht ? 'at the restart' : 'at the next stoppage'}${was && was.length ? ` · replaces ${was.map(s => s.inP.ln + ' for ' + s.outE.p.ln).join(', ')}` : ''}`); updPend(); C.ui.back(); C.ui.refresh(); };

  // ================= 1.06 (QA-100): the penalty shootout =================
  let SO = null;
  function shootout() {
    const m = M.m; M.playing = false; cancelAnimationFrame(M.raf);
    if (!SO || SO.m !== m) SO = { m, order: C.penTakers(m, M.my).map(e => e.p.id), p: [0, 0], kicks: [[], []], i: 0, side: 0, t: null, fast: false, started: false, line: '' };
    drawShootout();
  }
  const soEnt = id => SO.m.ents.find(e => e.p.id === id && e.on && e.side === M.my);
  function soTaker(side, i) { const m = SO.m; if (side === M.my) { const ids = SO.order.filter(id => soEnt(id)); return soEnt(ids[i % Math.max(1, ids.length)]); } const xs = C.penTakers(m, side); return xs[i % Math.max(1, xs.length)]; }
  function soOver() { const p = SO.p, i = SO.i, d = (k, s) => SO.kicks[s].length; const a = d(0, 0), b = d(0, 1);
    if (a <= 5 && b <= 5) { const left0 = 5 - a, left1 = 5 - b; if (p[0] > p[1] + left1 || p[1] > p[0] + left0) return true; return a === 5 && b === 5 && p[0] !== p[1]; }
    return a === b && p[0] !== p[1]; }
  function soKick() { const m = SO.m, side = SO.side, k = SO.kicks[side].length, tk = soTaker(side, k), ok = C.penKick(m, side, tk);
    SO.kicks[side].push(ok ? 1 : 0); if (ok) SO.p[side]++; const T = m.teams[side];
    SO.line = `${ok ? '⚽' : '🧤'} ${tk ? C.esc(tk.p.fn[0] + '. ' + tk.p.ln) : 'Taker'} (${C.esc(T.short || T.name)}): ${ok ? (k % 2 ? 'Smashed home!' : 'Scores, low into the corner.') : (k % 2 ? 'Saved! The keeper guessed right.' : 'Wide! Dragged past the post.')}`;
    SO.side = 1 - side; if (SO.side === 0) SO.i++;
    if (soOver()) { m.pens = SO.p.slice(); SO.done = true; }
    liveSave({ so: { order: SO.order.slice(), n: SO.kicks[0].length + SO.kicks[1].length } });
    if (!SO.silent) drawShootout(); }
  function soRun() { clearTimeout(SO.t); if (SO.done) return; SO.started = true; soKick(); if (!SO.done) SO.t = setTimeout(soRun, SO.fast ? 450 : 1500); }
  C.soStart = () => { if (!SO) return; soRun(); };
  C.soFast = () => { if (!SO) return; SO.fast = !SO.fast; drawShootout(); };
  C.soQuick = () => { if (!SO) return; clearTimeout(SO.t); SO.started = true; let g = 0; while (!SO.done && g++ < 60) soKick(); };
  C.soAuto = () => { if (!SO) return; SO.order = C.penTakers(SO.m, M.my).map(e => e.p.id); drawShootout(); };
  C.soMove = v => { if (!SO || SO.started) return; const [id, d] = String(v).split('|'), i = SO.order.indexOf(id), j = i + (+d); if (i < 0 || j < 0 || j >= SO.order.length) return; [SO.order[i], SO.order[j]] = [SO.order[j], SO.order[i]]; drawShootout(); };
  C.soFinish = () => { if (!SO || !SO.done) return; clearTimeout(SO.t); SO = null; finishUI(); };
  function drawShootout() {
    const m = SO.m, T = m.teams, dots = s => { const k = SO.kicks[s], n = Math.max(5, k.length + (SO.done ? 0 : (s === SO.side ? 1 : 0))); let h = ''; for (let i = 0; i < n; i++) h += `<i class="${k[i] === 1 ? 'y' : k[i] === 0 ? 'n' : ''}">${k[i] === 1 ? '✔' : k[i] === 0 ? '✖' : ''}</i>`; return h; };
    const mine = SO.order.filter(id => soEnt(id)).map(id => soEnt(id)), fr = e => Math.round(e.energy);
    const list = mine.map((e, i) => `<div class="sotk ${i < 5 ? 'top' : ''}"><b>${i + 1}</b><span>${C.esc(e.p.fn[0] + '. ' + e.p.ln)} <small>${e.slot.pos} · Fin ${Math.round(C.penShotSkill(m, e))} · <i class="dropi"></i> ${fr(e)}%</small></span>${SO.started ? '' : `<button class="btn sm2" data-act="somove" data-v="${e.p.id}|-1" ${i ? '' : 'disabled'}>▲</button><button class="btn sm2" data-act="somove" data-v="${e.p.id}|1" ${i < mine.length - 1 ? '' : 'disabled'}>▼</button>`}</div>`).join('');
    host().innerHTML = `<div class="pre so"><div class="prehd"><small>PENALTIES · ${m.score[0]}–${m.score[1]} after full time</small>
      <div class="sorow"><b>${C.esc(T[0].short || T[0].name)}</b><span class="sodots">${dots(0)}</span><em>${SO.p[0]}</em></div>
      <div class="sorow"><b>${C.esc(T[1].short || T[1].name)}</b><span class="sodots">${dots(1)}</span><em>${SO.p[1]}</em></div>
      <div class="soline">${SO.line || (SO.started ? '' : '🎙 Duane: It all comes down to penalties! Pick your takers, Coach.')}</div></div>
      ${SO.done ? `<div class="card" style="text-align:center;font-weight:900">${SO.p[M.my] > SO.p[1 - M.my] ? '🏆 You win ' : '💔 You lose '}${SO.p[M.my]}–${SO.p[1 - M.my]} on penalties</div><button class="btn full pri kick" data-act="sofin">Continue</button>`
      : SO.started ? `<div class="prebtns"><button class="btn sec2" data-act="sofast">${SO.fast ? '1×' : '⏩ Fast'}</button><button class="btn sec2" data-act="soquick">⏭ Quick result</button></div>`
      : `<h4 class="jh">Your takers (in order; the first 5, then sudden death)</h4><div class="card sotks">${list}</div>
        <div class="prebtns"><button class="btn sec2" data-act="soauto">🧢 Auto (staff pick)</button><button class="btn sec2" data-act="soquick">⏭ Quick result</button></div>
        <button class="btn full pri kick" data-act="sostart">▶ Take the penalties</button>`}</div>`;
  }
  C.openReport = (md, fresh) => C.ui.open(fresh ? 'Full time' : 'Match report', () => reportHTML(C.sea().reports[md], fresh));
  function reportHTML(r, fresh) {
    if (!r) return '<p class="note">No report.</p>';
    const fr = (f => f && f.friendly ? f : null)(C.sea().fx.find(x => x.md === r.md && (x.h === 0 || x.a === 0)));   // 1.06 (QA-79)
    const S = C.sea(), th = S.teams[r.h], ta = S.teams[r.a], my = r.my, win = Math.sign((my === 0 ? r.hs - r.as : r.as - r.hs)) || (r.pens ? Math.sign(my === 0 ? r.pens[0] - r.pens[1] : r.pens[1] - r.pens[0]) : 0);
    const ev = r.ev.map(e => `<div class="rev ${e.side === 0 ? '' : 'r'}"><b>${e.min}'</b> ${{ goal: '⚽', red: '🟥', yellow: '🟨', injury: '🩹', penalty: '🎯' }[e.type]} ${C.esc(e.who)}</div>`).join('');
    const mine = r.rated.filter(x => x.side === my).sort((a, b) => b.r - a.r);
    const gains = (r.gains || []).map(([id, g, old]) => { const p = C.P(id); if (!p) return ''; const rt = old == null ? '' : (old !== p.rating ? ` ${old} → <b class="gup">${p.rating}</b>` : ` ${p.rating}`) + ' ·'; return `<div class="gain">▲ ${C.esc(p.ln)}${rt || ':'} ${Object.keys(g).map(k => k === 'pos' ? 'more at home at ' + g[k] : (C.attrsOf(p)[k] || ['', k])[1] + ' +' + g[k]).join(', ')}</div>`; }).join('');
    return `<div class="rhd ${win > 0 ? 'w' : win < 0 ? 'l' : 'd'}"><div>${C.crestSVG(th.c1, th.c2, th.abbr.slice(0, 2), 44)}<b>${C.esc(th.name)}</b></div><div class="rsc">${r.hs} – ${r.as}${r.pens ? `<small>${r.pens[0]}–${r.pens[1]} on penalties</small>` : ''}<small>${win > 0 ? 'Win' : win < 0 ? 'Defeat' : 'Draw'}</small></div><div>${C.crestSVG(ta.c1, ta.c2, ta.abbr.slice(0, 2), 44)}<b>${C.esc(ta.name)}</b></div></div>
      ${ev ? `<div class="revs">${ev}</div>` : ''}
      ${r.potm ? `<div class="potm">🏅 Player of the Match: <b>${C.esc(r.potm.n)}</b></div>` : ''}
      <h3 class="jh">Team stats</h3><div class="card">${statBars(r.stats, my)}</div>
      <h3 class="jh">Your players</h3><div class="card rated">${mine.map(x => `<button class="srow" data-act="player" data-v="${x.id}"><span><span class="pchip" style="background:var(--school)">${x.pos}</span> ${C.esc(x.n)} ${x.g ? '⚽'.repeat(x.g) : ''}${x.a ? ' 🅰️'.repeat(x.a) : ''}</span><b class="rt ${x.r >= 7.5 ? 'hi' : x.r < 6 ? 'lo' : ''}">${x.r.toFixed(1)}</b></button>`).join('')}</div>
      ${(r.injuries && r.injuries.length) || r.flu ? `<h3 class="jh">Medical</h3><div class="card">${(r.injuries || []).map(i => `<div class="eff">${i[1]} ${C.esc(i[0])}: ${C.esc(i[2])} · ${i[3] === 'season' ? 'out for the season' : 'out ' + i[3] + ' match' + (i[3] > 1 ? 'es' : '')}</div>`).join('')}${r.flu ? `<div class="eff">🤒 Flu bug: ${r.flu.map(C.esc).join(', ')} miss the next match</div>` : ''}<button class="btn full sec2" data-act="medical" style="margin-top:8px">🩺 Medical Room</button></div>` : ''}
      ${gains ? `<h3 class="jh">Development</h3><div class="card">${gains}</div>` : ''}
      ${fresh ? `${C.advice('snc')}<div class="card fin"><div>${r.gate ? `<i class="cashi"></i> Gate income <b>+${C.full(r.gate)}</b>` : '🚌 Away game'}</div>${r.bc ? `<div>📺 Broadcast money <b>+${C.full(r.bc)}</b></div>` : ''}${r.repUp ? `<div>⭐ Reputation <b>+${r.repUp.toFixed(1)}</b></div>` : ''}${fr ? '' : `<div><i class="cpi"></i> Coaching Points <b>+${r.cp || 0}</b></div>`}${(r.staffUps || []).map(u => `<div>🧑‍🏫 ${C.esc(u)}</div>`).join('')}${fr ? `<div>⚽ ${C.fxLabel(fr).long}</div>` : `<div>🏛 Director confidence <b>${r.conf > 0 ? '▲' : r.conf < 0 ? '▼' : '='}</b></div><div>📊 ${S.end ? 'Season over' : 'Now ' + C.ord(C.myPos()) + ' in the table'}</div>`}</div>
        <button class="btn full pri" data-act="close">Continue</button>` : ''}`;
  }
})(window.CFC);
