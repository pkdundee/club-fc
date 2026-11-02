// Club FC: match day screens (Phase 5, Q20). Pre-match and countdown, the live pitch to scale, speeds and skips,
// campus-radio commentary, sound, live substitutions, half-time and the full-time report.
(function (C) {
  const { PW, PL, HALF } = C.PITCH;
  let M = null; // { m, f, my, speed, playing, raf, last, ev, line, lineT, cd, pickIn, report }

  // ================= campus radio: Duane (play-by-play) and Bev (stats) =================
  const L = {
    ko: ['🎙 Duane: Welcome to {station}, campus radio! It\'s {weather} and {crowd} are in. Let\'s go!', '📊 Bev: For the record, I have prepared eleven pages of notes. We will use none of them.'],
    goal: ['🎙 Duane: GOOOAL! {p} for {t}!', '🎙 Duane: IT\'S IN! {p}! Oh my goodness!', '🎙 Duane: {p} buries it! {t} take it {score}!', '🎙 Duane: What a finish from {p}!'],
    goal2: ['📊 Bev: That\'s {g} for {p} today. I\'m told that\'s good.', '📊 Bev: {a} with the assist. I\'m writing it in pen.', '📊 Bev: Historically, goals are the main way of scoring.', '📊 Bev: Shot number {s} for {t}. Persistence.'],
    pen: ['🎙 Duane: PENALTY! The ref points to the spot!', '📊 Bev: Penalty. From eleven metres. Or twelve yards, for the boosters.'],
    save: ['🎙 Duane: Big save from {k}!', '🎙 Duane: {p} goes for it… denied by {k}!', '📊 Bev: {k} has {sv} saves. Their gloves deserve a scholarship.'],
    miss: ['🎙 Duane: {p} shoots… just wide!', '🎙 Duane: Oh, {p} drags it past the post!', '📊 Bev: That one is landing in the parking lot.', '🎙 Duane: Over the bar from {p}!'],
    block: ['🎙 Duane: Blocked! Great body on the line from {o}!', '📊 Bev: {o} with the block. Selfless. Possibly painful.'],
    yellow: ['🎙 Duane: Yellow card for {p}! That means a spell off the field.', '📊 Bev: College rule: a yellow sends you off for a while. Like a sin bin, but with more paperwork.'],
    red: ['🎙 Duane: RED CARD! {p} is off!', '📊 Bev: {t} down to ten. Mathematically, that\'s one fewer.'],
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
  const label = f => f.md === 0 ? 'Homecoming friendly' : f.md <= 14 ? `Conference · Match ${f.md}` : f.md === 15 ? 'Conference semi-final' : 'Conference final';
  C.openPreMatch = () => {
    const f = C.myFixture(); if (!f) return C.toast('No match to play');
    const rot = C.autoRotate(); if (rot) C.toast(`🔄 Auto-manage rested ${rot} tired player${rot > 1 ? 's' : ''}`);
    const car = C.car(), my = f.h === 0 ? 0 : 1, opp = C.oppTeam(my === 0 ? f.a : f.h), t = C.tac();
    if (t.xi.filter(Boolean).length < 11) { C.toast(t.empty && t.empty.some(Boolean) ? 'Fill every position in Tactics first' : 'Not enough fit players for an XI'); return C.openTactics(); }
    M = { f, my, opp, cd: 5, speed: 1, playing: false, ev: 0 };
    M.att = C.attendance(f); M.locals = t.xi.map(C.P).filter(p => p && C.isLocal(p)).length;
    C.ui.closeAll(); drawPre(); countdown();
  };
  function teamPair() { const me = C.myTeam(M.my === 0), A = M.my === 0 ? me : M.opp, B = M.my === 0 ? M.opp : me; A.home = true; B.home = false; return [A, B]; }
  function drawPre() {
    const car = C.car(), f = M.f, t = C.tac(), S = C.sea(), oppT = S.teams[M.my === 0 ? f.a : f.h], col = C.college(), w = C.WEATHER[f.wx];
    const avgE = Math.round(t.xi.map(C.P).reduce((s, p) => s + p.energy, 0) / 11);
    const mineRows = t.xi.map(C.P).map((p, i) => `<div class="lu"><span class="lun">${p.num}</span><div class="luf">${C.faceOf(p)}</div><b>${C.esc(p.ln)}</b><small>${C.FORMATIONS[t.form][i][0]}</small></div>`).join('');
    const oppRows = M.opp.xi.map((p, i) => `<div class="lu r"><small>${C.FORMATIONS[M.opp.form][i][0]}</small><b>${C.esc(p.ln)}</b><span class="lun">${p.num}</span></div>`).join('');
    const home = M.my === 0;
    host().innerHTML = `<div class="pre"><div class="prehd"><small>${label(f)} · ${w[0]} ${w[1]} · 👥 ${M.att.toLocaleString()}</small>
        <div class="vsrow"><div>${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 54)}<b>${C.esc(col.short)}</b><small>${home ? 'Home' : 'Away'}</small></div><span class="vsx">VS</span><div>${C.crestSVG(oppT.c1, oppT.c2, oppT.abbr.slice(0, 2), 54)}<b>${C.esc(oppT.name)}</b><small>${C.table()[0].p ? C.ord(C.table().findIndex(x => x.i === (home ? f.a : f.h)) + 1) + ' in table' : 'Season opener'}</small></div></div>
        <div class="radio">📻 K${col.abbr} campus radio with Duane &amp; Bev</div></div>
      ${t.xi.map(C.P).filter(p => p.energy < 50).length ? `<div class="tiredw">⚠ ${t.xi.map(C.P).filter(p => p.energy < 50).length} of your XI are under 50% Freshness (avg ${avgE}%). Rest them this match or use a recovery kit in the Medical Room.</div>` : ''}
      <div class="lus"><div><h4>${t.form} · ${C.MENTALITY[t.ment]}</h4>${mineRows}</div><div><h4>${M.opp.form}</h4>${oppRows}</div></div>
      <div class="prebtns"><button class="btn sec2" data-act="mtac"><i class="xoi"></i> Tactics</button><button class="btn sec2" data-act="mquick">⏩ Quick result</button><button class="btn sec2" data-act="mleave">✕</button></div>
      <button class="btn full pri kick" data-act="mkick">▶ Kick off <span id="cdn">${M.cd ? '· ' + M.cd : ''}</span></button>
      ${M.cd ? '<button class="cdpause" data-act="mcdstop">Tap to stop the countdown</button>' : ''}</div>`;
  }
  function countdown() { clearInterval(M.cdT); M.cdT = setInterval(() => { if (!M || M.m) return clearInterval(M && M.cdT); if (C.ui.isOpen()) return; M.cd--; const n = C.$('#cdn'); if (n) n.textContent = M.cd > 0 ? '· ' + M.cd : ''; if (M.cd <= 0) { clearInterval(M.cdT); C.kickOff(); } }, 1000); }
  C.stopCountdown = () => { clearInterval(M.cdT); M.cd = 0; drawPre(); };
  C.leaveMatch = () => { if (M) { clearInterval(M.cdT); cancelAnimationFrame(M.raf); } crowdOff(); M = null; host().innerHTML = ''; C.render(); };

  // ================= live match =================
  C.kickOff = () => {
    clearInterval(M.cdT); const [A, B] = teamPair(), S = C.sea();
    M.m = C.createMatch(A, B, (C.car().created & 0xffff) * 131 + S.n * 977 + M.f.md * 7, { knockout: !!M.f.ko, med: [C.level('med') * (M.my === 0 ? 1 : 0), C.level('med') * (M.my === 1 ? 1 : 0)] });
    M.playing = true; M.last = performance.now(); M.acc = 0; M.lineT = 0; M.fillT = 0; M.kits = kitsFor(M.m.teams);
    drawLive(); say(line('ko')); setTimeout(() => M && M.m && say(line('ko').replace(/^.*$/, L.ko[1])), 2500);
    crowdOn(Math.min(1, M.att / 3000)); whistle(1);
    M.raf = requestAnimationFrame(loop);
  };
  C.quickMatch = () => { // auto-managed, straight to full time
    clearInterval(M.cdT); const [A, B] = teamPair(); A.auto = B.auto = true; const S = C.sea();
    M.m = C.createMatch(A, B, (C.car().created & 0xffff) * 131 + S.n * 977 + M.f.md * 7, { knockout: !!M.f.ko });
    C.simToEnd(M.m); finishUI();
  };
  function rate() { const m = M.m, b = m.ball, my = M.my; const near = Math.min(b.y, PL - b.y) < 30 || (b.fl && b.fl.type !== 'pass');
    return M.speed === 1 ? (near ? 2.3 : 5.5) : M.speed === 5 ? 17 : 34; }
  function loop(now) {
    if (!M || !M.m) return;
    const dt = Math.min(.1, (now - M.last) / 1000); M.last = now;
    if (M.playing && !C.ui.isOpen()) {
      M.acc += dt * rate(); let n = 0;
      while (M.acc >= C.PITCH.DT && n++ < 60) { M.acc -= C.PITCH.DT; C.stepMatch(M.m); events(); if (M.m.ht || M.m.done || !M.playing) { M.acc = 0; break; } }
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
      else if (e.type === 'offside') { say(line('offside', e)); whistle(1); }
      else if (['block', 'yellow', 'red', 'injury', 'knock', 'sub', 'back', 'claim', 'penalty'].includes(e.type)) { const k = e.type === 'penalty' ? 'pen' : e.type; if (e.type !== 'claim' || Math.random() < .3) say(line(k, e)); if (['yellow', 'red', 'penalty'].includes(e.type)) whistle(1); if (['yellow', 'red', 'injury', 'sub', 'penalty'].includes(e.type)) feed(e); }
      else if (e.type === 'ht') { say(line('ht')); whistle(2); }
      else if (e.type === 'ft') { say(line('ft')); whistle(3); }
      if (e.type === 'injury' && e.side === M.my && !m.teams[M.my].auto) { M.playing = false; setTimeout(() => C.openSubs(e.who), 50); }
    }
  }
  function say(t) { if (!t) return; const n = C.$('#tick'); if (n) { n.textContent = t; n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop'); } }
  function feed(e) { const n = C.$('#mfeed'); if (!n) return; const ic = { goal: '⚽', yellow: '🟨', red: '🟥', injury: '🩹', sub: '🔁', penalty: '🎯' }[e.type];
    const who = e.who ? e.who.p.ln : '', mine = e.side === M.my;
    n.insertAdjacentHTML('afterbegin', `<div class="${mine ? 'me' : ''}"><b>${e.min}'</b> ${ic} ${C.esc(who)}${e.type === 'sub' && e.extra && e.extra.off ? ' for ' + C.esc(e.extra.off.p.ln) : ''}</div>`); }

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
    host().innerHTML = `<div class="live"><div class="sbar">${C.crestSVG(T[0].c1, T[0].c2, T[0].abbr.slice(0, 2), 30)}<b class="tn">${sw(K[0])}${C.esc(T[0].abbr)}<small>H</small></b><b class="sc" id="msc">0 – 0</b><b class="tn">${sw(K[1])}${C.esc(T[1].abbr)}<small>A</small></b>${C.crestSVG(T[1].c1, T[1].c2, T[1].abbr.slice(0, 2), 30)}
        <span class="mn" id="mmin">1'</span><button class="mic" data-act="msound">${C.acct().sound ? '🔊' : '🔇'}</button></div>
      <div class="pitchw"><canvas id="pitch"></canvas></div><div class="tick" id="tick"></div>
      <div class="spd">${[1, 5, 10].map(s => `<button class="${M.speed === s ? 'on' : ''}" data-act="mspeed" data-v="${s}">${s}×</button>`).join('')}<button data-act="mpause" id="mpz">⏸</button><button data-act="mskip" data-v="ht" ${m.half > 1 ? 'disabled' : ''}>⏭ HT</button><button data-act="mskip" data-v="ft">⏭ FT</button></div>
      <div class="mrow"><div class="mfeed" id="mfeed"></div><div class="mbtns"><button class="btn sm2" data-act="msubs">🔁 Subs</button><button class="btn sm2" data-act="mment"><i class="xoi"></i> Plan</button></div></div>
      <div class="pend" id="mpend"></div></div>`;
    sizeCanvas();
  }
  function sizeCanvas() { const cv = C.$('#pitch'); if (!cv) return; const w0 = cv.parentElement.clientWidth, h0 = host().clientHeight - 230;
    let w = w0, h = w * (PL + 6) / (PW + 4); if (h > h0) { h = Math.max(320, h0); w = h * (PW + 4) / (PL + 6); }
    const dpr = window.devicePixelRatio || 1; cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; M.cw = w; M.ch = h; M.dpr = dpr; }
  function hud() {
    const m = M.m; const sc = C.$('#msc'); if (sc) sc.textContent = `${m.score[0]} – ${m.score[1]}`;
    const mn = C.$('#mmin'); if (mn) mn.textContent = m.ht ? 'HT' : m.done ? 'FT' : C.matchMinute(m) + "'";
    const pz = C.$('#mpz'); if (pz) pz.textContent = M.playing ? '⏸' : '▶';
    const pd = C.$('#mpend'); if (pd) { const p = m.pending.filter(s => s.side === M.my); pd.textContent = p.length ? `🔁 ${p.map(s => s.inP.ln + ' for ' + s.outE.p.ln).join(', ')} · at the next stoppage` : ''; }
  }

  // ---------- drawing to scale (Q20i): my team always attacks up the screen ----------
  function draw() {
    const cv = C.$('#pitch'); if (!cv) return; const g = cv.getContext('2d'), m = M.m, k = M.cw / (PW + 4), dpr = M.dpr, flip = M.my === 0;
    const X = x => (2 + (flip ? x : PW - x)) * k, Y = y => (3 + (flip ? PL - y : y)) * k;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#3f9e4a' : '#46a952'; g.fillRect(0, i * M.ch / 12, M.cw, M.ch / 12 + 1); }
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = Math.max(1, k * .14);
    const rect = (x1, y1, x2, y2) => g.strokeRect(Math.min(X(x1), X(x2)), Math.min(Y(y1), Y(y2)), Math.abs(X(x2) - X(x1)), Math.abs(Y(y2) - Y(y1)));
    rect(0, 0, PW, PL); g.beginPath(); g.moveTo(X(0), Y(PL / 2)); g.lineTo(X(PW), Y(PL / 2)); g.stroke();
    g.beginPath(); g.arc(X(PW / 2), Y(PL / 2), 9.15 * k, 0, 7); g.stroke();
    for (const end of [0, PL]) { const d = end ? -1 : 1; rect(PW / 2 - 20.16, end, PW / 2 + 20.16, end + d * 16.5); rect(PW / 2 - 9.16, end, PW / 2 + 9.16, end + d * 5.5);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(X(PW / 2), Y(end + d * 11), k * .3, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(Math.min(X(PW / 2 - 3.66), X(PW / 2 + 3.66)), Math.min(Y(end), Y(end - d * 1.6)), 7.32 * k, 1.6 * k);
      g.beginPath(); g.arc(X(PW / 2), Y(end + d * 11), 9.15 * k, (d > 0) === flip ? Math.PI * 1.2 : Math.PI * .2, (d > 0) === flip ? Math.PI * 1.8 : Math.PI * .8); g.stroke(); }
    // players: circles ~4.5% of pitch width
    const r = M.cw * .0235, T = m.teams;
    const kit = (M.kits || kitsFor(T)).kit, gkKit = (M.kits || kitsFor(T)).gk;
    g.font = `900 ${Math.round(r * 1.05)}px Nunito`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const e of m.ents) { if (!e.on || e.bin) continue; const gk = e.slot.pos === 'GK', [f1, f2] = gk ? gkKit[e.side] : kit[e.side];
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(X(e.x) + 1.5, Y(e.y) + 2, r, r * .8, 0, 0, 7); g.fill();
      g.fillStyle = f1; g.strokeStyle = f2; g.lineWidth = 1.8; g.beginPath(); g.arc(X(e.x), Y(e.y), r, 0, 7); g.fill(); g.stroke();
      g.fillStyle = gk ? '#111827' : f2; g.fillText(e.p.num, X(e.x), Y(e.y) + .5);
      if (e.knock && e.side === M.my) { g.fillStyle = '#ef4444'; g.beginPath(); g.arc(X(e.x) + r, Y(e.y) - r, r * .35, 0, 7); g.fill(); } }
    const b = m.ball; g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(X(b.x) + 1, Y(b.y) + 1.5, k * .5, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 1; g.beginPath(); g.arc(X(b.x), Y(b.y) - b.h * k * .6, k * (.55 + b.h * .08), 0, 7); g.fill(); g.stroke();
  }

  // ---------- controls ----------
  C.matchSpeed = s => { M.speed = +s; C.$$('.spd [data-act=mspeed]').forEach(b => b.classList.toggle('on', +b.dataset.v === M.speed)); };
  C.matchPause = () => { M.playing = !M.playing; if (M.m.ht) return C.secondHalf(); };
  C.matchSkip = v => { const m = M.m; if (v === 'ht' && m.half === 1) { C.simToHT(m); events(); M.playing = false; halfTime(); } else if (v === 'ft') { if (m.ht) m.ht = false; C.simToEnd(m); M.ev = m.events.length; finishUI(); } };
  C.toggleSound = () => { const a = C.acct(); a.sound = !a.sound; C.save(); if (a.sound) { crowdOn(Math.min(1, (M && M.att || 500) / 3000)); } else crowdOff(); const b = C.$('.mic'); if (b) b.textContent = a.sound ? '🔊' : '🔇'; };
  function halfTime() {
    const m = M.m, S = m.st, my = M.my;
    host().insertAdjacentHTML('beforeend', `<div class="htcard" id="htc"><b>Half-time</b><div class="hts">${m.teams[0].short} ${m.score[0]} – ${m.score[1]} ${m.teams[1].short}</div>
      ${statBars(S, my)}<div class="jbtns"><button class="btn sec2" data-act="msubs">🔁 Subs</button><button class="btn sec2" data-act="mment"><i class="xoi"></i> Plan</button></div><button class="btn full pri" data-act="m2h">▶ Second half</button></div>`);
  }
  C.secondHalf = () => { const n = C.$('#htc'); if (n) n.remove(); C.resumeHT(M.m); M.playing = true; whistle(1); const hb = C.$('[data-act=mskip][data-v=ht]'); if (hb) hb.disabled = true; };
  function statBars(S, my) {
    const row = (lab, a, b) => { const t = a + b || 1; return `<div class="sbr"><span>${a}</span><div><i style="width:${a / t * 100}%"></i></div><em>${lab}</em><div class="r"><i style="width:${b / t * 100}%"></i></div><span>${b}</span></div>`; };
    const pos = Math.round(S.poss[0] / (S.poss[0] + S.poss[1] || 1) * 100);
    return `<div class="sbars">${row('Possession %', pos, 100 - pos)}${row('Shots', S.shots[0], S.shots[1])}${row('On target', S.sot[0], S.sot[1])}${row('Corners', S.corners[0], S.corners[1])}${row('Fouls', S.fouls[0], S.fouls[1])}${row('Offsides', (S.offs || [0, 0])[0], (S.offs || [0, 0])[1])}${row('Cards', S.yc[0] + S.rc[0], S.yc[1] + S.rc[1])}</div>`;
  }

  // ---------- in-match plan: mentality and auto-manage ----------
  C.openMatchPlan = () => { M.playing = false; C.ui.open('Match plan', () => { const T = M.m.teams[M.my];
    return `<label class="fld">Mentality</label><div class="instr">${C.MENTALITY.map((x, i) => `<button class="${T.ment === i ? 'on' : ''}" data-act="mmset" data-v="${i}">${x}</button>`).join('')}</div>
      <button class="btn full ${T.auto ? 'pri' : 'sec2'}" data-act="mauto" style="margin-top:12px">${T.auto ? '✔ Auto-manage is on' : 'Turn on auto-manage'}</button>
      <p class="note">Your staff sub injured and tired players, protects or chases a lead late on, and keeps your playing-time promises.</p><button class="btn full sec2" data-act="back">Back to the match</button>`; }); };
  C.matchMent = v => { const T = M.m.teams[M.my]; T.ment = +v; T.ment0 = +v; C.ui.refresh(); };
  C.matchAuto = () => { const T = M.m.teams[M.my]; T.auto = !T.auto; C.ui.refresh(); };

  // ---------- substitutions (Q20f) ----------
  C.openSubs = (hurtE) => { M.playing = false; M.pickIn = null; C.ui.open('Substitutions', () => subsHTML(hurtE)); };
  function subsHTML(hurtE) {
    const m = M.m, my = M.my, T = m.teams[my], on = m.ents.filter(e => e.side === my && e.on);
    const pool = T.bench.concat(m.ents.filter(e => e.side === my && !e.on && !e.red && !e.injured).map(e => e.p)).filter((p, i, a) => a.indexOf(p) === i && C.canBringOn(m, my, p) && !m.pending.some(s => s.inP === p));
    const sel = M.pickIn;
    return `${hurtE ? `<div class="card" style="background:#fee2e2;color:#991b1b;font-weight:800">🩹 ${C.esc(hurtE.p.fn + ' ' + hurtE.p.ln)} is hurt. Choose a replacement.</div>` : ''}
      <p class="note" style="margin-top:6px">College rules: unlimited changes. A player taken off in the first half can come back once in the second.</p>
      <label class="fld">1. Bring on</label>${pool.length ? pool.map(p => `<button class="pkrow ${sel === p.id ? 'sel' : ''}" data-act="msin" data-v="${p.id}"><div class="pkf">${C.faceOf(p)}</div><div class="pki"><b>${C.esc(p.fn)} ${C.esc(p.ln)}</b><small><span class="pchip" style="background:var(--school)">${p.pos}</span> 🔋 ${Math.round(p.energy)}%</small></div><b class="pkr">${p.rating}</b></button>`).join('') : '<p class="note">Nobody available.</p>'}
      ${sel ? `<label class="fld">2. Take off</label>${on.map(e => `<button class="pkrow" data-act="msout" data-v="${m.ents.indexOf(e)}"><div class="pkf">${C.faceOf(e.p)}</div><div class="pki"><b>${C.esc(e.p.ln)} ${e.injured ? '🩹' : e.knock ? '🤕' : ''}${e.bin ? '🟨' : ''}</b><small><span class="pchip" style="background:${['', '#dc2626', '#f97316', '#eab308', '#84cc16', '#16a34a'][C.fit(pool.find(p => p.id === sel), e.slot.pos)]}">${e.slot.pos}</span> 🔋 ${Math.round(e.energy)}%</small></div></button>`).join('')}` : ''}
      <button class="btn full sec2" data-act="back" style="margin-top:10px">Back to the match</button>`;
  }
  C.subIn = id => { M.pickIn = id; C.ui.refresh(); };
  C.subOut = idx => { const m = M.m, e = m.ents[+idx], T = m.teams[M.my], pool = T.bench.concat(m.ents.filter(x => x.side === M.my && !x.on).map(x => x.p)), p = pool.find(x => x.id === M.pickIn);
    if (p && e) { C.queueSub(m, M.my, e, p); if (m.pause <= 0 && !m.ball.fl) { /* applied at the next stoppage */ } C.toast(`🔁 ${p.ln} comes on at the next stoppage`); }
    M.pickIn = null; C.ui.back(); };

  // ================= full time =================
  function finishUI() {
    cancelAnimationFrame(M.raf); crowdOff(); const rep = C.applyResult(M.m, M.f); const S = C.sea();
    host().innerHTML = ''; M = null; C.render();
    C.openReport(rep.md, true);
  }
  C.openReport = (md, fresh) => C.ui.open(fresh ? 'Full time' : 'Match report', () => reportHTML(C.sea().reports[md], fresh));
  function reportHTML(r, fresh) {
    if (!r) return '<p class="note">No report.</p>';
    const S = C.sea(), th = S.teams[r.h], ta = S.teams[r.a], my = r.my, win = Math.sign((my === 0 ? r.hs - r.as : r.as - r.hs)) || (r.pens ? Math.sign(my === 0 ? r.pens[0] - r.pens[1] : r.pens[1] - r.pens[0]) : 0);
    const ev = r.ev.map(e => `<div class="rev ${e.side === 0 ? '' : 'r'}"><b>${e.min}'</b> ${{ goal: '⚽', red: '🟥', yellow: '🟨', injury: '🩹', penalty: '🎯' }[e.type]} ${C.esc(e.who)}</div>`).join('');
    const mine = r.rated.filter(x => x.side === my).sort((a, b) => b.r - a.r);
    const gains = (r.gains || []).map(([id, g]) => { const p = C.P(id); if (!p) return ''; return `<div class="gain">▲ ${C.esc(p.ln)}: ${Object.keys(g).map(k => k === 'pos' ? 'more at home at ' + g[k] : (C.attrsOf(p)[k] || ['', k])[1] + ' +' + g[k]).join(', ')}</div>`; }).join('');
    return `<div class="rhd ${win > 0 ? 'w' : win < 0 ? 'l' : 'd'}"><div>${C.crestSVG(th.c1, th.c2, th.abbr.slice(0, 2), 44)}<b>${C.esc(th.name)}</b></div><div class="rsc">${r.hs} – ${r.as}${r.pens ? `<small>${r.pens[0]}–${r.pens[1]} on penalties</small>` : ''}<small>${win > 0 ? 'Win' : win < 0 ? 'Defeat' : 'Draw'}</small></div><div>${C.crestSVG(ta.c1, ta.c2, ta.abbr.slice(0, 2), 44)}<b>${C.esc(ta.name)}</b></div></div>
      ${ev ? `<div class="revs">${ev}</div>` : ''}
      ${r.potm ? `<div class="potm">🏅 Player of the Match: <b>${C.esc(r.potm.n)}</b></div>` : ''}
      <h3 class="jh">Team stats</h3><div class="card">${statBars(r.stats, my)}</div>
      <h3 class="jh">Your players</h3><div class="card rated">${mine.map(x => `<button class="srow" data-act="player" data-v="${x.id}"><span><span class="pchip" style="background:var(--school)">${x.pos}</span> ${C.esc(x.n)} ${x.g ? '⚽'.repeat(x.g) : ''}${x.a ? ' 🅰️'.repeat(x.a) : ''}</span><b class="rt ${x.r >= 7.5 ? 'hi' : x.r < 6 ? 'lo' : ''}">${x.r.toFixed(1)}</b></button>`).join('')}</div>
      ${(r.injuries && r.injuries.length) || r.flu ? `<h3 class="jh">Medical</h3><div class="card">${(r.injuries || []).map(i => `<div class="eff">${i[1]} ${C.esc(i[0])}: ${C.esc(i[2])} · ${i[3] === 'season' ? 'out for the season' : 'out ' + i[3] + ' match' + (i[3] > 1 ? 'es' : '')}</div>`).join('')}${r.flu ? `<div class="eff">🤒 Flu bug: ${r.flu.map(C.esc).join(', ')} miss the next match</div>` : ''}<button class="btn full sec2" data-act="medical" style="margin-top:8px">🩺 Medical Room</button></div>` : ''}
      ${gains ? `<h3 class="jh">Development</h3><div class="card">${gains}</div>` : ''}
      ${r.bonus && r.bonus.length ? `<h3 class="jh">Your edge</h3><div class="card edge">${r.bonus.slice(0, 8).map(b => `<div>${C.esc(b)}</div>`).join('')}</div>` : ''}
      ${fresh ? `${C.advice('snc')}<div class="card fin"><div>${r.gate ? `💵 Gate income <b>+${C.short(r.gate)}</b>` : '🚌 Away game'}</div><div><i class="cpi"></i> Coaching Points <b>+${r.cp || 0}</b></div>${(r.staffUps || []).map(u => `<div>🧑‍🏫 ${C.esc(u)}</div>`).join('')}<div>🏛 Director confidence <b>${r.conf > 0 ? '▲' : r.conf < 0 ? '▼' : '='}</b></div><div>📊 ${S.end ? 'Season over' : 'Now ' + C.ord(C.myPos()) + ' in the table'}</div></div>
        <button class="btn full pri" data-act="close">Continue</button>` : ''}`;
  }
})(window.CFC);
