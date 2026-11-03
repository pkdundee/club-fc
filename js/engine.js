// Club FC: match engine (Phase 5, Q20b). Deterministic: the same seed and the same decisions always give the same match,
// so watching, skipping and Quick result agree. Pitch in metres: x across (0..68), y along (0..105). Side 0 attacks towards y = 105.
(function (C) {
  const PW = 68, PL = 105, HALF = 600, DT = .1;        // one half = 600 sim seconds (45 game minutes)
  C.PITCH = { PW, PL, HALF, DT };
  const FIT_MULT = [0, .72, .84, .93, .98, 1];
  const clamp = C.clamp;

  // ---------- formations: slot positions (x across 0..1, y from own goal 0..1) ----------
  C.FORMATIONS = {
    '4-3-3': [['GK', .5, 0], ['LB', .14, .22], ['CB', .38, .17], ['CB', .62, .17], ['RB', .86, .22], ['DM', .5, .36], ['CM', .3, .5], ['CM', .7, .5], ['LW', .16, .76], ['ST', .5, .84], ['RW', .84, .76]],
    '4-4-2': [['GK', .5, 0], ['LB', .14, .22], ['CB', .38, .17], ['CB', .62, .17], ['RB', .86, .22], ['LM', .14, .52], ['CM', .38, .46], ['CM', .62, .46], ['RM', .86, .52], ['ST', .38, .82], ['ST', .62, .82]],
    '4-2-3-1': [['GK', .5, 0], ['LB', .14, .22], ['CB', .38, .17], ['CB', .62, .17], ['RB', .86, .22], ['DM', .37, .36], ['DM', .63, .36], ['LW', .17, .64], ['AM', .5, .62], ['RW', .83, .64], ['ST', .5, .84]],
    '3-5-2': [['GK', .5, 0], ['CB', .27, .18], ['CB', .5, .15], ['CB', .73, .18], ['LM', .1, .5], ['DM', .5, .35], ['CM', .32, .52], ['CM', .68, .52], ['RM', .9, .5], ['ST', .38, .82], ['ST', .62, .82]],
    '5-3-2': [['GK', .5, 0], ['LB', .1, .28], ['CB', .3, .16], ['CB', .5, .14], ['CB', .7, .16], ['RB', .9, .28], ['CM', .3, .48], ['DM', .5, .4], ['CM', .7, .48], ['ST', .4, .82], ['ST', .6, .82]],
    '4-1-4-1': [['GK', .5, 0], ['LB', .14, .22], ['CB', .38, .17], ['CB', .62, .17], ['RB', .86, .22], ['DM', .5, .34], ['LM', .12, .52], ['CM', .38, .5], ['CM', .62, .5], ['RM', .88, .52], ['ST', .5, .84]],
    '4-4-1-1': [['GK', .5, 0], ['LB', .14, .22], ['CB', .38, .17], ['CB', .62, .17], ['RB', .86, .22], ['LM', .12, .5], ['CM', .38, .46], ['CM', .62, .46], ['RM', .88, .5], ['AM', .5, .66], ['ST', .5, .85]],
    '4-1-2-1-2': [['GK', .5, 0], ['LB', .14, .22], ['CB', .38, .17], ['CB', .62, .17], ['RB', .86, .22], ['DM', .5, .34], ['CM', .3, .48], ['CM', .7, .48], ['AM', .5, .62], ['ST', .38, .84], ['ST', .62, .84]],
    '4-3-2-1': [['GK', .5, 0], ['LB', .14, .22], ['CB', .38, .17], ['CB', .62, .17], ['RB', .86, .22], ['CM', .3, .46], ['DM', .5, .38], ['CM', .7, .46], ['AM', .36, .66], ['AM', .64, .66], ['ST', .5, .85]],
    '3-4-3': [['GK', .5, 0], ['CB', .27, .18], ['CB', .5, .15], ['CB', .73, .18], ['LM', .1, .48], ['CM', .38, .45], ['CM', .62, .45], ['RM', .9, .48], ['LW', .16, .78], ['ST', .5, .85], ['RW', .84, .78]],
    '5-4-1': [['GK', .5, 0], ['LB', .1, .28], ['CB', .3, .16], ['CB', .5, .14], ['CB', .7, .16], ['RB', .9, .28], ['LM', .14, .48], ['CM', .38, .44], ['CM', .62, .44], ['RM', .86, .48], ['ST', .5, .82]]
  };
  C.MENTALITY = ['Ultra defensive', 'Defensive', 'Balanced', 'Attacking', 'Ultra attacking'];
  // Men's and women's games differ in pace, range and power only (GENDER-MATCH-GUIDE.md). Injuries, Freshness and rewards are identical.
  C.PROFILES = {
    m: { run: 1, passRange: 1, passSpeed: 1, passErr: 1, press: 1, shotRange: 1, shotPower: 1, gkReach: 1, aerial: 1 },
    w: { run: .91, passRange: .85, passSpeed: .9, passErr: 1.1, press: 1.08, shotRange: .85, shotPower: .9, gkReach: .85, aerial: .9 }
  };

  // ---------- setup ----------
  // team: { name, short, abbr, c1, c2, form, ment, xi:[player x11 in slot order], bench:[players], home, auto, manage }
  C.createMatch = (A, B, seed, opts = {}) => {
    const m = { rng: C.rng(seed || 1), t: 0, half: 1, done: false, ht: false, score: [0, 0], events: [], pause: 0, restart: null, last: [null, null],
      teams: [A, B], ents: [], subs: [[], []], pending: [], knockout: !!opts.knockout, pens: null, stop: false,
      st: { offs: [0, 0], poss: [0, 0], shots: [0, 0], sot: [0, 0], corners: [0, 0], fouls: [0, 0], yc: [0, 0], rc: [0, 0], passes: [0, 0], cmp: [0, 0] },
      ball: { x: PW / 2, y: PL / 2, h: 0, owner: null, fl: null }, poss: 0, lastTouch: null, used: [0, 0], offAt: {}, med: opts.med || [0, 0],
      prof: C.PROFILES[opts.gender === 'w' ? 'w' : 'm'], deep: [PL, PL], trace: opts.trace ? [] : null };
    [A, B].forEach((T, side) => { const F = C.FORMATIONS[T.form]; T.xi.forEach((p, i) => { if (p) m.ents.push(ent(m, p, side, F[i], i)); }); });
    kickoff(m, 0); say(m, -1, 'ko', ''); return m;
  };
  function ent(m, p, side, slot, i) {
    return { p, side, slot: { pos: slot[0], x: slot[1], y: slot[2] }, i, x: PW / 2, y: PL / 2, vx: 0, vy: 0, on: true, bin: 0, dec: 1, knock: 0, injured: false, yc: 0, energy: p.energy,
      instr: (m.teams[side].instr || {})[p.id] ?? 2, st: { mins: 0, pa: 0, pc: 0, sh: 0, sot: 0, g: 0, a: 0, tk: 0, int: 0, blk: 0, clr: 0, sv: 0, fl: 0, drb: 0, conc: 0 }, fit: C.fit(p, slot[0]) };
  }
  const minute = m => Math.min(m.half === 1 ? 45 : 90, Math.floor(m.t / HALF * 45) + 1) + (m.half === 2 && m.t < HALF ? 45 : 0);
  C.matchMinute = minute;
  function say(m, side, type, who, extra) { m.events.push({ min: minute(m), side, type, who, extra, t: m.t, score: m.score.slice() }); }
  const active = (m, side) => m.ents.filter(e => e.on && !e.bin && (side == null || e.side === side));
  const gkOf = (m, side) => active(m, side).find(e => e.slot.pos === 'GK');
  const dirOf = side => side === 0 ? 1 : -1;
  const goalY = side => side === 0 ? PL : 0;            // the goal a side attacks
  // Freshness (0–100): full performance from 70, then −4%, −10%, −18%; and injury risk ×1 → ×4
  C.freshPerf = f => f >= 70 ? 1 : f >= 50 ? .96 : f >= 30 ? .90 : .82;
  C.freshRisk = f => f >= 70 ? 1 : f >= 50 ? 1.5 : f >= 30 ? 2.5 : 4;
  const YEAR_RISK = [1, 1.4, 1.2, 1, .85, .8];   // first-years get hurt most; resilience grows every year
  const DRAIN = { GK: .25, CB: .6, DM: .85, AM: .9, ST: .85 };  // share of a full 90-minute drain by position (others 1.0)
  const BKEY = { sho: 'sho', def: 'def', pas: 'pas', stp: 'gk', ref: 'gk', psn: 'gk', crs: 'gk' };
  function eff(m, e, k) { const v = e.p.a[k] != null ? e.p.a[k] : 30, T = m.teams[e.side], bn = T.bonus || {};
    const fm = FIT_MULT[e.fit] + (1 - FIT_MULT[e.fit]) * (bn.oop || 0), late = bn.late && m.t > HALF * 1.66 && m.score[e.side] < m.score[1 - e.side] ? 1 + bn.late : 1;
    return v * fm * C.freshPerf(e.energy) * (e.knock ? .88 : 1) * (e.p.rushed ? .85 : 1) * (T.home ? 1.04 : 1) * (1 + (bn[BKEY[k]] || 0)) * late; }
  const shotSkill = (m, e) => e.slot.pos === 'GK' ? 10 : eff(m, e, 'sho');
  const keepSkill = (m, e) => e ? (eff(m, e, 'stp') * .5 + eff(m, e, 'ref') * .3 + eff(m, e, 'psn') * .2) : 10;

  // ---------- shape: where a player wants to be (compact block that shifts with the ball, Q20b) ----------
  function homePos(m, e) {
    const T = m.teams[e.side], att = m.poss === e.side, by = e.side === 0 ? m.ball.y / PL : 1 - m.ball.y / PL, bx = e.side === 0 ? m.ball.x / PW : 1 - m.ball.x / PW;
    let depth;
    if (e.slot.pos === 'GK') depth = .02 + Math.max(0, by - .5) * .12;
    else {
      const mt = (T.ment - 2) * .03;
      if (att) {
        // in possession: the back line steps up with the ball, as far as halfway when camped in their half
        const line = clamp(.14 + (by - .3) * .6 + mt, .1, .48);
        depth = line + (e.slot.y - .17) * .7 + (e.instr - 2) * .035;
        if (['LB', 'RB'].includes(e.slot.pos) && by > .5) depth += .1;            // full-backs overlap
        if (['ST', 'LW', 'RW', 'AM'].includes(e.slot.pos)) depth += .04 + (e.instr - 2) * .02;   // runs in behind
      } else {
        // out of possession: drop off quickly. Edge of the box with the ball in midfield, inside it when they attack deep.
        const line = clamp(by - .34 + mt, .06, .36);
        depth = line + (e.slot.y - .17) * .42 + (e.instr - 2) * .02;
        // defenders stay goal-side of the deepest runner (never left behind by an attacker who is onside)
        // defenders drop with the deepest runner, holding a line level with them (so a mistimed run is still offside)
        // they react once a runner is a couple of metres past, so a mistimed run can still be caught offside
        if (e.slot.y < .3) { const run = m.deep[e.side] / PL + .005; if (depth > run + .02) depth = Math.max(run, line - .1, .04); }
      }
      depth = clamp(depth, .04, .93);
      // attackers hold on the offside line (MATCH-ENGINE-GUIDE §4); 'lean' makes a few runs mistimed
      if (att && m.off) { const cap = (m.off[e.side] - .6 + (e.lean || 0)) / PL; if (depth > cap) depth = Math.max(.05, cap); }
    }
    let fx = e.slot.x + (bx - .5) * (e.slot.pos === 'GK' ? .15 : .42);
    if (!att) fx = .5 + (fx - .5) * .8;
    const wob = e.slot.pos === 'GK' ? 0 : Math.sin(m.t * .35 + e.i * 1.9) * 1.4;
    return [clamp((e.side === 0 ? fx : 1 - fx) * PW + wob, 1, PW - 1), e.side === 0 ? depth * PL : (1 - depth) * PL];
  }
  function moveTo(e, tx, ty, sp, dt) {          // smooth: steer velocity towards the target
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), want = d < .3 ? 0 : Math.min(sp, d * 1.8);
    const wx = d ? dx / d * want : 0, wy = d ? dy / d * want : 0, k = Math.min(1, dt * 3.5);
    e.vx += (wx - e.vx) * k; e.vy += (wy - e.vy) * k; e.x = clamp(e.x + e.vx * dt, .5, PW - .5); e.y = clamp(e.y + e.vy * dt, -1, PL + 1);
  }
  const speed = (m, e) => 4.6 * m.prof.run * (.78 + eff(m, e, e.slot.pos === 'GK' ? 'ref' : 'pac') / 230);

  // ---------- restarts ----------
  function kickoff(m, side) {
    const b = m.ball; b.fl = null; b.x = PW / 2; b.y = PL / 2; b.h = 0; m.poss = side;
    for (const e of active(m)) { const h = homePos(m, e); e.x = h[0]; e.y = e.side === 0 ? Math.min(h[1], PL / 2 - 2) : Math.max(h[1], PL / 2 + 2); e.vx = e.vy = 0; }
    const own = active(m, side).filter(e => e.slot.pos !== 'GK'); if (!own.length) return;
    const k = own.reduce((a, c) => c.slot.y - Math.abs(c.slot.x - .5) * .4 > a.slot.y - Math.abs(a.slot.x - .5) * .4 ? c : a);
    k.x = PW / 2; k.y = PL / 2 - dirOf(side) * .8; own2(m, k); k.dec = .6;
  }
  function own2(m, e) { m.ball.owner = e; m.poss = e.side; m.lastTouch = e; }
  // stop play; the restart happens after a short pause (subs are made here)
  function stoppage(m, type, side, x, y, secs = 1.6) { const b = m.ball; if (type === 'corner' || type === 'throw' || type === 'goalkick') say(m, side, type, ''); b.owner = null; b.fl = null; b.h = 0; b.x = x; b.y = y; m.poss = side; m.restart = { type, side, x, y }; m.pause = secs; if (type === 'corner') m.st.corners[side]++; }
  function doRestart(m) {
    const r = m.restart; m.restart = null; applySubs(m); manage(m);
    if (r.type === 'kickoff') return kickoff(m, r.side);
    const pool = active(m, r.side).filter(e => r.type === 'goalkick' ? e.slot.pos === 'GK' : e.slot.pos !== 'GK');
    let k = pool[0], bd = 1e9; for (const e of pool) { const d = Math.hypot(e.x - r.x, e.y - r.y); if (d < bd) { bd = d; k = e; } }
    if (!k) return kickoff(m, r.side);
    k.x = clamp(r.x, .5, PW - .5); k.y = clamp(r.y, 0, PL); k.vx = k.vy = 0; m.ball.x = k.x; m.ball.y = k.y; own2(m, k);
    if (r.type === 'corner') { k.dec = .4; k.force = 'cross'; }
    else if (r.type === 'freekick' && Math.hypot(PW / 2 - r.x, goalY(r.side) - r.y) < 28) { k.dec = .5; k.force = m.rng() < .45 ? 'shot' : null; k.fk = k.force === 'shot'; }
    else if (r.type === 'penalty') { k.x = PW / 2; k.y = r.side === 0 ? PL - 11 : 11; m.ball.x = k.x; m.ball.y = k.y; k.dec = .8; k.force = 'pen'; }
    else k.dec = .35 + m.rng() * .3;
  }
  // ball leaving the pitch: who restarts and how
  function outOfPlay(m, x, y, lastSide) {
    const other = 1 - lastSide;
    if (y > PL || y < 0) {
      const attacking = (y > PL ? 0 : 1);       // the side attacking that goal
      if (lastSide === attacking) return stoppage(m, 'goalkick', other, PW / 2 + (m.rng() - .5) * 10, y > PL ? PL - 5.5 : 5.5, 2);
      return stoppage(m, 'corner', other, x < PW / 2 ? 0 : PW, y > PL ? PL : 0, 2.2);
    }
    stoppage(m, 'throw', other, x < PW / 2 ? 0 : PW, clamp(y, 2, PL - 2), 1.2);
  }

  // ---------- nearest helpers ----------
  function nearest(m, side, x, y, skip) { let best = null, bd = 1e9; for (const o of active(m, side)) { if (o === skip) continue; const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; best = o; } } return [best, bd]; }
  // an opponent close to the line from (ax,ay) to (bx,by)
  function laneThreat(m, side, ax, ay, bx, by) {
    let best = null, bd = 1e9, bt = 0; const L = Math.hypot(bx - ax, by - ay) || 1;
    for (const o of active(m, 1 - side)) { const t = clamp(((o.x - ax) * (bx - ax) + (o.y - ay) * (by - ay)) / (L * L), .1, .95);
      const d = Math.hypot(ax + (bx - ax) * t - o.x, ay + (by - ay) * t - o.y); if (d < bd) { bd = d; best = o; bt = t; } }
    return [best, bd, bt];
  }

  // ---------- decisions (MATCH-ENGINE-GUIDE §5–6) ----------
  const depthOf = (side, y) => side === 0 ? y : PL - y;            // 0 = own goal line, PL = the goal being attacked
  // the offside line for attackers of `side`: second-last opponent, never behind halfway or the ball
  function offLine(m, side) { const ds = active(m, 1 - side).map(o => depthOf(side, o.y)).sort((a, b) => b - a); return Math.max(ds.length > 1 ? ds[1] : PL, PL / 2, depthOf(side, m.ball.y)); }
  // angle of goal a shooter can see (radians)
  function goalAngle(e) { const gy = goalY(e.side), a1 = Math.atan2(PW / 2 - 3.66 - e.x, gy - e.y), a2 = Math.atan2(PW / 2 + 3.66 - e.x, gy - e.y); return Math.abs(a1 - a2); }
  const GRP = p => p === 'GK' ? 'gk' : ['CB'].includes(p) ? 'cb' : ['LB', 'RB'].includes(p) ? 'fb' : p === 'DM' ? 'dm' : p === 'CM' ? 'cm' : p === 'AM' ? 'am' : ['LM', 'RM', 'LW', 'RW'].includes(p) ? 'w' : 'st';
  // who each position likes to pass to (position playbooks)
  const ROLE = { gk: { cb: .8, fb: .6, dm: .5, cm: .2, w: 0, am: -.2, st: -.4 }, cb: { dm: .5, cm: .5, fb: .4, cb: .1, w: .1, am: .1, st: 0, gk: -1.2 },
    fb: { w: .6, cm: .3, dm: .2, am: .3, st: .1, cb: 0 }, dm: { cm: .4, am: .4, w: .2, fb: .2, st: .2, cb: 0 }, cm: { am: .5, st: .5, w: .4, cm: .1, fb: .1, dm: 0 },
    am: { st: .6, w: .4, cm: .1 }, w: { st: .5, am: .5, cm: .2, fb: .1 }, st: { am: .4, w: .4, cm: .4, st: .3 } };

  function decide(m, e) {
    const side = e.side, gy = goalY(side), d = Math.hypot(e.x - PW / 2, gy - e.y), T = m.teams[side];
    const prog = depthOf(side, e.y) / PL, wide = Math.abs(e.x - PW / 2) > 17, f = e.force; e.force = null;
    if (f === 'pen') return shoot(m, e, 11, true);
    if (f === 'cross') return cross(m, e);
    if (f === 'shot') return shoot(m, e, d);
    if (e.slot.pos === 'GK') return gkDistribute(m, e);
    const press = nearest(m, 1 - side, e.x, e.y)[1], ang = goalAngle(e);
    // shot selection: never from tight angles (under 15° of goal visible) unless point-blank
    const SR = 32 * m.prof.shotRange;
    let shootP = d > SR || (ang < .26 && d > 6) ? 0 : Math.pow((SR - d) / SR, 1.5) * (.15 + .015 * T.ment + .05 * (e.instr - 2));
    if (d < 7 && ang >= .26) shootP = Math.max(shootP, .18);
    if (m.rng() < shootP) return shoot(m, e, d);
    if (prog > .7 && wide && m.rng() < (ang < .26 ? .6 : .22)) return cross(m, e);
    const c = choosePass(m, e, prog, press);
    if (prog > .55 && press > 2.5 && m.rng() < .35 + (eff(m, e, 'dri') - 40) / 150) { e.dec = .5 + m.rng() * .5; e.carry = 1; return; }  // run at them
    if (c && (press < 4 || m.rng() < .75)) return pass(m, e, c);
    e.dec = .4 + m.rng() * .6; e.carry = 1;
  }

  // one pass option: lane, receiver space, offside
  function option(m, e, t) {
    const side = e.side, dist = Math.hypot(t.x - e.x, t.y - e.y), [, lane] = laneThreat(m, side, e.x, e.y, t.x, t.y), open = nearest(m, 1 - side, t.x, t.y)[1];
    const offs = t.slot.pos !== 'GK' && m.off && depthOf(side, t.y) > m.off[side] + .3;
    return { t, dist, lane, open, offs, fwd: depthOf(side, t.y) - depthOf(side, e.y), lat: Math.abs(t.x - e.x) };
  }
  function choosePass(m, e, prog, press = 9) {
    const side = e.side, T = m.teams[side], g = GRP(e.slot.pos), longOK = g === 'gk' || (g === 'cb' && (e.p.a.pas || 0) >= 50);
    const maxD = (longOK ? 55 : 32) * m.prof.passRange, riskW = prog < .33 ? 1.4 : prog < .66 ? 1 : .6, offMiss = .05 + Math.max(0, 50 - (e.p.a.pas || 40)) / 500;
    let best = null, bs = -1e9, fallback = null, fb = 1e9;
    for (const t of active(m, side)) {
      if (t === e) continue; const o = option(m, e, t); if (o.dist < 4 || o.dist > maxD) continue;
      if (t.slot.pos === 'GK' && !(press < 3 && prog < .33)) continue;            // back to the keeper only when pressed deep
      if (o.offs && m.rng() > offMiss) continue;                                    // good passers don't find offside runners
      if (prog > .66 && o.fwd < -6) { if (o.dist < fb && GRP(t.slot.pos) !== 'cb') { fb = o.dist; fallback = o; } continue; } // final third: recycle only if blocked
      if (o.lat > 28 && o.fwd < 8 && (prog > .66 || o.open < 8)) continue;          // switches only from deep, to a free player
      const back = o.fwd < -3, safety = clamp(.55 + Math.min(o.lane, 6) * .06 + Math.min(o.open, 10) * .035 - o.dist / 120, .05, 1);
      const sc = o.fwd / 10 * (1 + .12 * (T.ment - 2)) + safety * 3 * riskW + ((ROLE[g] || {})[GRP(t.slot.pos)] || 0) + (back ? (press < 3 ? -.3 : -1.8) : 0) + (m.rng() - .5) * .7;
      if (sc > bs) { bs = sc; best = o; }
      // through ball: a runner near the line with space behind the defence
      if (['st', 'w', 'am'].includes(GRP(t.slot.pos)) && !o.offs && m.off && depthOf(side, t.y) > m.off[side] - 4 && depthOf(side, e.y) < m.off[side] - 3) {
        const pd = Math.min(PL - 7, m.off[side] + 6 + m.rng() * 4), px = clamp(t.x + (PW / 2 - t.x) * .2, 4, PW - 4), py = side === 0 ? pd : PL - pd;
        const space = nearest(m, 1 - side, px, py)[1], gk = gkOf(m, 1 - side), gkd = gk ? Math.hypot(gk.x - px, gk.y - py) : 99;
        if (space > 5 && gkd > 9 && Math.hypot(px - e.x, py - e.y) < 40) { const ts = 1.4 + (pd - depthOf(side, e.y)) / 12 + (eff(m, e, 'pas') - 45) / 40 + (m.rng() - .5) * .6;
          if (ts > bs) { bs = ts; best = Object.assign({}, o, { thru: { x: px, y: py }, dist: Math.hypot(px - e.x, py - e.y) }); } }
      }
    }
    return best || fallback;
  }
  // goalkeeper distribution, in the order coaches teach it (guide §6)
  function gkDistribute(m, e) {
    const side = e.side, mates = active(m, side).filter(t => t !== e).map(t => option(m, e, t)).filter(o => !o.offs);
    const pick = (f) => mates.filter(f).sort((a, b) => b.open - a.open)[0];
    const oppsHigh = active(m, 1 - side).filter(o => depthOf(side, o.y) < PL * .45).length;
    const g = o => GRP(o.t.slot.pos);
    let c = null;
    if (oppsHigh >= 6) c = pick(o => ['cm', 'dm', 'w', 'fb'].includes(g(o)) && o.open > 8 && o.dist < 35);   // 1. quick release on the counter
    c = c || pick(o => g(o) === 'cb' && o.open > 6 && o.lane > 2 && o.dist < 28);                              // 2. short to a free centre-back
    c = c || pick(o => ['fb', 'w'].includes(g(o)) && o.open > 7 && o.lane > 2 && o.dist < 35);                 // 3. short to a full-back or wide player
    c = c || pick(o => g(o) === 'dm' && o.open > 6 && o.lane > 2 && o.dist < 35);                              // 4. into the defensive midfielder
    c = c || pick(o => g(o) === 'cm' && o.open > 8 && o.dist < 55);                                             // 5. long to a free central midfielder
    if (!c && (e.hold || 0) < 4) { e.hold = (e.hold || 0) + .8; e.dec = .8; return; }                           // 7. hold while teammates spread
    c = c || mates.filter(o => ['st', 'w', 'am'].includes(g(o)) && o.dist < 62).sort((a, b) => b.fwd - a.fwd)[0]; // 6. long kick into the forwards' zone
    e.hold = 0; if (c) { c.long = c.dist > 32; return pass(m, e, c); }
    e.dec = .6;
  }
  function pass(m, e, c) {
    if (!c) { e.dec = .5; e.carry = 1; return; }
    const T = m.teams[e.side]; m.st.passes[e.side]++; e.st.pa++;
    // offside: judged when the ball is played
    // most offsides come from runs timed a moment too early onto a through ball (MATCH-ENGINE-GUIDE §4)
    if (!c.offs && m.off && c.fwd > 4 && ['st', 'w', 'am'].includes(GRP(c.t.slot.pos)) && depthOf(e.side, c.t.y) > m.off[e.side] - 6 && m.rng() < (c.thru ? .32 : .22) - (eff(m, c.t, 'pac') - 50) / 1000) c.offs = true;
    if (c.offs) { m.st.offs = m.st.offs || [0, 0]; m.st.offs[e.side]++; say(m, e.side, 'offside', c.t); return stoppage(m, 'freekick', 1 - e.side, c.t.x, c.t.y, 1.8); }
    const ok = 1 - (1 - clamp(.92 + (eff(m, e, 'pas') - 42) / 150 - c.dist / 170 + (Math.min(c.lane, 5) - 1.5) * .03 - (T.ment - 2) * .02 - (c.long ? .12 : 0) - (c.thru ? .1 : 0), .4, .97)) * m.prof.passErr;
    if (m.trace) m.trace.push({ t: m.t, k: 'pass', fx: e.x, fy: e.y, tx: c.thru ? c.thru.x : c.t.x, ty: c.thru ? c.thru.y : c.t.y, side: e.side, ok: Math.round(ok * 100), from: e.p.ln, to: c.t.p.ln, thru: !!c.thru });
    const b = m.ball; b.owner = null; const lead = c.t.slot.pos === 'GK' ? 0 : 2.5;
    const tx = c.thru ? c.thru.x : c.t.x + (c.t.vx || 0) * .4, ty = c.thru ? c.thru.y : c.t.y + dirOf(e.side) * lead * (m.poss === e.side ? 1 : 0);
    let res = c.thru ? 'thru' : 'ok', tgt = c.t;
    if (m.rng() > ok) { const r = m.rng(), [cut, , ct] = laneThreat(m, e.side, e.x, e.y, tx, ty);
      if (r < .6 && cut) { res = 'int'; tgt = cut; b.fl = { type: 'pass', fx: b.x, fy: b.y, tx: e.x + (tx - e.x) * ct, ty: e.y + (ty - e.y) * ct, t: 0, dur: .15 + c.dist * ct / 24, res, tgt, from: e }; return; }
      if (r < .85) { res = 'out'; const ox = tx + (m.rng() - .5) * 10, oy = ty + dirOf(e.side) * (3 + m.rng() * 6); b.fl = { type: 'pass', fx: b.x, fy: b.y, tx: ox, ty: oy, t: 0, dur: .3 + c.dist / 22, res, from: e }; return; }
      res = 'mis'; tgt = nearest(m, 1 - e.side, tx, ty)[0] || c.t; }
    b.fl = { type: 'pass', fx: b.x, fy: b.y, tx, ty, t: 0, dur: (.18 + c.dist / 23) / m.prof.passSpeed, res, tgt, from: e, h: c.dist > 25 ? 1 : 0 };
  }
  function cross(m, e) {
    const side = e.side, gy = goalY(side), box = active(m, side).filter(t => t !== e && Math.abs(t.y - gy) < 18 && t.slot.pos !== 'GK');
    m.st.passes[side]++; e.st.pa++; const b = m.ball; b.owner = null;
    const tgt = box.length ? box[Math.floor(m.rng() * box.length)] : null, tx = tgt ? tgt.x : PW / 2 + (m.rng() - .5) * 12, ty = gy - dirOf(side) * (6 + m.rng() * 6);
    b.fl = { type: 'cross', fx: b.x, fy: b.y, tx, ty, t: 0, dur: .9, from: e, tgt, h: 1 };
  }
  function shoot(m, e, d, pen) {
    const side = e.side, gk = gkOf(m, 1 - side), s = shotSkill(m, e), g = keepSkill(m, gk), T = m.teams[side];
    m.st.shots[side]++; e.st.sh++; e.fk = false;
    let res;
    if (pen) res = m.rng() < .76 ? 'goal' : m.rng() < .6 ? 'save' : 'miss';
    else {
      const [blocker, bd] = laneThreat(m, side, e.x, e.y, PW / 2, goalY(side));
      if (blocker && bd < 1.4 && blocker.slot.pos !== 'GK' && m.rng() < .45) { blocker.st.blk++; res = 'block'; m.ball.blocker = blocker; }
      else { const onP = clamp(.5 + (s - 40) / 180 - d / 85 + (e.header ? -.06 : 0), .12, .8);
        const goalP = clamp((.5 + (s - g) / 110 - d / 70 + (e.header ? -.05 : 0) - (2 - m.teams[1 - side].ment) * .03) * (m.prof.shotPower / m.prof.gkReach) ** 1.5, .05, .6);
        res = m.rng() < onP ? (m.rng() < goalP ? 'goal' : 'save') : 'miss'; }
    }
    e.header = false;
    if (res === 'goal' || res === 'save') { m.st.sot[side]++; e.st.sot++; }
    const gy = goalY(side), dir = dirOf(side), b = m.ball; b.owner = null;
    let tx = PW / 2 + (m.rng() * 2 - 1) * 3.2, ty = gy + dir * (res === 'goal' ? 1 : 0);
    let high = 0;
    if (res === 'miss') { if (m.rng() < .55) { tx = PW / 2 + (m.rng() < .5 ? -1 : 1) * (4.9 + m.rng() * 2.6); } else { tx = PW / 2 + (m.rng() * 2 - 1) * 3.4; high = 1; } ty = gy + dir * 2; }
    if (res === 'save') ty = gy - dir * 1;
    if (res === 'block') { tx = e.x + (m.rng() - .5) * 6; ty = e.y + dir * 2.5; }
    b.fl = { type: 'shot', fx: b.x, fy: b.y, tx, ty, t: 0, dur: res === 'block' ? .2 : Math.max(.3, d / (28 * m.prof.shotPower)), res, from: e, gk, h: high, pen };
    if (m.trace) m.trace.push({ t: m.t, k: 'shot', fx: e.x, fy: e.y, tx, ty, side, res, from: e.p.ln, d: Math.round(d) });
    T.shotAt = m.t;
  }

  // ---------- resolving the ball arriving ----------
  function arrive(m) {
    const f = m.ball.fl, b = m.ball; m.ball.fl = null; b.h = 0;
    if (f.type === 'pass') {
      if (f.res === 'out') return outOfPlay(m, f.tx, f.ty, f.from.side);
      if (!f.tgt || !f.tgt.on || f.tgt.bin) return stoppage(m, 'throw', 1 - f.from.side, 0, b.y, 1);
      if (f.res === 'thru') {   // race for a ball played into space: the runner, a defender or the keeper
        const [o, od] = nearest(m, 1 - f.from.side, f.tx, f.ty), rd = Math.hypot(f.tgt.x - f.tx, f.tgt.y - f.ty);
        if (o && od < rd && od < 4) { if (o.slot.pos === 'GK') { o.st.sv++; say(m, o.side, 'claim', o); } else o.st.int++; o.x = f.tx; o.y = f.ty; b.x = f.tx; b.y = f.ty; own2(m, o); o.dec = .5; return; }
        f.from.st.pc++; m.st.cmp[f.from.side]++; m.last[f.from.side] = { e: f.from, t: m.t }; f.tgt.x = f.tx; f.tgt.y = f.ty; b.x = f.tx; b.y = f.ty; own2(m, f.tgt); f.tgt.dec = .3 + m.rng() * .3; f.tgt.carry = 1; return;
      }
      if (f.res === 'ok') { f.from.st.pc++; m.st.cmp[f.from.side]++; m.last[f.from.side] = { e: f.from, t: m.t }; }
      if (f.res === 'int') { f.tgt.st.int++; say(m, f.tgt.side, 'int', f.tgt); }
      if (f.res === 'int') { f.tgt.x = b.x; f.tgt.y = b.y; } else { b.x = f.tgt.x; b.y = f.tgt.y; }
      own2(m, f.tgt); f.tgt.dec = .35 + m.rng() * .6; f.tgt.carry = 0; return;
    }
    if (f.type === 'cross') {
      const side = f.from.side, gk = gkOf(m, 1 - side);
      if (gk && Math.abs(f.ty - gk.y) < 9 && m.rng() < .25 + eff(m, gk, 'crs') / 250) { gk.st.sv++; own2(m, gk); b.x = gk.x; b.y = gk.y; gk.dec = 1.2; say(m, gk.side, 'claim', gk); return; }
      const att = f.tgt && f.tgt.on ? f.tgt : nearest(m, side, f.tx, f.ty)[0], [def] = nearest(m, 1 - side, f.tx, f.ty);
      const aw = att ? (eff(m, att, 'phy') * .5 + eff(m, att, 'sho') * .3) * m.prof.aerial : 10, dw = def ? eff(m, def, 'def') * .6 + eff(m, def, 'phy') * .4 : 10;
      if (att && m.rng() < aw * (1 + ((m.teams[side].bonus || {}).set || 0)) / (aw + dw * 2)) { f.from.st.pc++; m.st.cmp[side]++; m.last[side] = { e: f.from, t: m.t }; att.x = f.tx; att.y = f.ty; b.x = att.x; b.y = att.y; att.header = true; return shoot(m, att, Math.hypot(att.x - PW / 2, goalY(side) - att.y)); }
      if (def) { def.st.clr++; const r = m.rng(); if (r < .3) return stoppage(m, 'corner', side, f.tx < PW / 2 ? 0 : PW, goalY(side), 2.2); if (r < .55) return outOfPlay(m, f.tx < PW / 2 ? -1 : PW + 1, f.ty, 1 - side);
        own2(m, def); b.x = def.x; b.y = def.y; def.dec = .3; return; }
      return stoppage(m, 'goalkick', 1 - side, PW / 2, side === 0 ? PL - 5.5 : 5.5);
    }
    if (f.type === 'shot') {
      const side = f.from.side, gk = f.gk && f.gk.on ? f.gk : gkOf(m, 1 - side);
      if (f.res === 'goal') { m.score[side]++; f.from.st.g++; const as = m.last[side]; if (as && as.e !== f.from && m.t - as.t < 12 && !f.pen) as.e.st.a++; if (gk) gk.st.conc++;
        say(m, side, 'goal', f.from, { assist: as && as.e !== f.from && m.t - as.t < 12 && !f.pen ? as.e : null, pen: f.pen }); m.last = [null, null]; m.restart = { type: 'kickoff', side: 1 - side }; m.pause = 4; b.owner = null; return; }
      if (f.res === 'save') { if (gk) gk.st.sv++; say(m, side, 'save', f.from, { gk });
        if (gk && m.rng() < .6) { own2(m, gk); b.x = gk.x; b.y = gk.y; gk.dec = 1.3; return; }
        return stoppage(m, 'corner', side, m.rng() < .5 ? 0 : PW, goalY(side), 2.2); }
      if (f.res === 'block') { say(m, side, 'block', f.from, { by: b.blocker }); const r = m.rng(); if (r < .4) return stoppage(m, 'corner', side, f.tx < PW / 2 ? 0 : PW, goalY(side), 2.2);
        const [n] = nearest(m, null, f.tx, f.ty); if (n) { own2(m, n); n.dec = .4; return; } }
      say(m, side, 'miss', f.from, { d: Math.round(Math.hypot(f.fx - PW / 2, goalY(side) - f.fy)) });
      return stoppage(m, 'goalkick', 1 - side, PW / 2, side === 0 ? PL - 5.5 : 5.5, 2.2);
    }
  }

  // ---------- fouls, cards, injuries (Q20g) ----------
  function foul(m, def, att) {
    m.st.fouls[def.side]++; def.st.fl++;
    const T = m.teams[def.side], tired = def.energy < 45 ? .05 : 0, card = m.rng();
    const yP = .1 + (2 - T.ment) * .02 + (2 - def.instr) * .03 + tired;
    if (card < .004) send(m, def, 'red');
    else if (card < yP) { def.yc++; m.st.yc[def.side]++; if (def.yc >= 2) send(m, def, 'red2'); else { def.bin = 5 * HALF / 45; def.st.yc = 1; say(m, def.side, 'yellow', def); } }
    if (m.rng() < .012) hurt(m, att);
    const inBox = Math.abs(att.y - goalY(att.side)) < 16.5 && Math.abs(att.x - PW / 2) < 20;
    if (inBox && m.rng() < .045) { say(m, att.side, 'penalty', att, { by: def }); return stoppage(m, 'penalty', att.side, PW / 2, att.side === 0 ? PL - 11 : 11, 3); }
    say(m, att.side, 'foul', att, { by: def });
    stoppage(m, 'freekick', att.side, att.x, att.y, 1.8);
  }
  function send(m, e, why) { e.on = false; e.st.rc = 1; m.st.rc[e.side]++; e.red = true; say(m, e.side, 'red', e, { why }); if (m.ball.owner === e) m.ball.owner = null;
    m.pause = Math.max(m.pause, 4); m.redAlert = { side: e.side, e };
    if (m.teams[e.side].auto) C.reshape(m, e.side, null); }
  // change shape during a match (also after a red card): put the players still on the pitch into the new formation's slots
  C.reshape = (m, side, form) => {
    const T = m.teams[side]; form = form || T.form; const F = C.FORMATIONS[form]; T.form = form;
    const on = m.ents.filter(e => e.side === side && e.on), out = on.filter(e => e.slot.pos !== 'GK'), gk = on.find(e => e.slot.pos === 'GK');
    // with fewer than 10 outfield players, leave the most advanced slots empty
    let slots = F.map((s, i) => ({ s, i })).filter(o => o.s[0] !== 'GK').sort((a, b) => a.s[2] - b.s[2]).slice(0, out.length);
    const used = new Set();
    out.slice().sort((a, b) => FIT_MULT[5] - a.fit - (FIT_MULT[5] - b.fit)).forEach(e => { let best = null, bs = -1e9;
      for (const o of slots) { if (used.has(o.i)) continue; const sc = FIT_MULT[C.fit(e.p, o.s[0])] * 3 - Math.hypot(o.s[1] - e.slot.x, o.s[2] - e.slot.y); if (sc > bs) { bs = sc; best = o; } }
      if (best) { used.add(best.i); e.slot = { pos: best.s[0], x: best.s[1], y: best.s[2] }; e.i = best.i; e.fit = C.fit(e.p, best.s[0]); } });
    if (gk) gk.slot = { pos: 'GK', x: .5, y: 0 };
    say(m, side, 'shape', '', { form });
  };
  function hurt(m, e) { if (!e.on || e.injured) return; if (m.rng() < .7) { e.knock = 1; say(m, e.side, 'knock', e); } else { e.injured = true; e.knock = 1; say(m, e.side, 'injury', e); m.teams[e.side].needSub = e; } }

  // ---------- substitutions (Q20f): made at the next stoppage ----------
  C.queueSub = (m, side, outE, inP) => { if (!m.pending.some(s => s.outE === outE || s.inP === inP)) m.pending.push({ side, outE, inP }); };
  C.canBringOn = (m, side, p) => { const o = m.offAt[p.id]; if (m.ents.some(e => e.p === p && e.on)) return false; if (o == null) return true; return o.half === 1 && m.half === 2 && !o.back; };
  function applySubs(m) {
    for (const s of m.pending.splice(0)) {
      const e = s.outE; if (!e.on && !e.injured) continue;
      if (!C.canBringOn(m, s.side, s.inP)) continue;
      e.on = false; m.offAt[e.p.id] = { half: m.half, back: m.offAt[e.p.id] ? true : false };
      const n = ent(m, s.inP, s.side, [e.slot.pos, e.slot.x, e.slot.y], e.i); n.x = e.side === 0 ? 1 : PW - 1; n.y = e.y; n.instr = e.instr; n.energy = s.inP.energy;
      const back = m.offAt[s.inP.id]; if (back) back.back = true;
      const old = m.ents.find(x => x.p === s.inP); if (old) { n.st = old.st; m.ents.splice(m.ents.indexOf(old), 1); }
      m.ents.push(n); m.used[s.side]++; if (m.teams[s.side].needSub === e) m.teams[s.side].needSub = null;
      say(m, s.side, 'sub', n, { off: e });
    }
  }
  // auto-manage (or the AI coach): injuries, tired legs, cards, chasing a game, promised minutes (Q20h)
  function manage(m) {
    const mn = minute(m);
    m.teams.forEach((T, side) => {
      if (!T.auto) { if (T.needSub && T.needSub.on === false) T.needSub = null; return; }
      const on = active(m, side).concat(m.ents.filter(e => e.side === side && e.bin)), bench = T.bench.filter(p => C.canBringOn(m, side, p) && !p.injured);
      const pick = (e) => { let best = null, bs = -1; for (const p of bench) { if (m.pending.some(s => s.inP === p)) continue; const s = p.rating * FIT_MULT[C.fit(p, e.slot.pos)] + (p.promise === 'rotation' ? 8 : 0); if (s > bs) { bs = s; best = p; } } return best; };
      if (T.needSub && T.needSub.injured) { const p = pick(T.needSub); if (p) C.queueSub(m, side, T.needSub, p); else T.needSub = null; }
      if (mn >= 58 && m.used[side] < (T.maxSubs || 7)) {
        const tired = on.filter(e => e.slot.pos !== 'GK' && !m.pending.some(s => s.outE === e) && (e.energy < 58 || (e.yc && mn >= 65) || (e.knock && mn >= 60))).sort((a, b) => a.energy - b.energy);
        const n = mn >= 80 ? 3 : mn >= 70 ? 2 : 1, done = m.used[side] + m.pending.filter(s => s.side === side).length;
        for (const e of tired.slice(0, Math.max(0, n * 2 - done))) { const p = pick(e); if (p) C.queueSub(m, side, e, p); }
      }
      if (mn >= 70 && T.ment0 == null) T.ment0 = T.ment;
      if (mn >= 70) { const diff = m.score[side] - m.score[1 - side]; T.ment = diff < 0 ? Math.min(4, T.ment0 + 1) : diff > 0 && mn >= 78 ? Math.max(1, T.ment0 - 1) : T.ment0; }
    });
  }

  // ---------- one step ----------
  C.stepMatch = (m) => {
    if (m.done || m.ht) return;
    const dt = DT; m.t += dt; m.st.poss[m.poss] += dt;
    for (const e of m.ents) { if (!e.on) continue; if (e.bin) { e.bin -= dt; if (e.bin <= 0) { e.bin = 0; say(m, e.side, 'back', e); } continue; }
      e.st.mins += 45 / HALF * dt;
      e.energy = Math.max(5, e.energy - dt * (26 / (2 * HALF)) * (1.25 - eff(m, e, e.slot.pos === 'GK' ? 'str' : 'phy') / 220) * (1 + (e.instr - 2) * .12) * (e.fit < 3 ? 1.15 : 1) * (DRAIN[e.slot.pos] || 1) * (1 - ((m.teams[e.side].bonus || {}).drain || 0)));
      if (m.rng() < dt * 2.3e-5 * (e.slot.pos === 'GK' ? .4 : 1) * (YEAR_RISK[e.p.year] || 1) * C.freshRisk(e.energy) * (e.p.reinj > 0 ? 2 : 1) * (e.p.rushed ? 3 : 1) * (1 - m.med[e.side] * .01) * (1 - ((m.teams[e.side].bonus || {}).inj || 0))) hurt(m, e); }
    m.off = [offLine(m, 0), offLine(m, 1)];
    for (const sd of [0, 1]) { let mn = PL; for (const o of m.ents) if (o.on && !o.bin && o.side !== sd && o.slot.pos !== 'GK') { const d = depthOf(sd, o.y); if (d < mn) mn = d; } m.deep[sd] = mn; }
    if (Math.floor(m.t / 2) !== Math.floor((m.t - dt) / 2)) for (const e of m.ents) if (e.on && ['ST', 'LW', 'RW', 'AM'].includes(e.slot.pos)) e.lean = clamp((e.lean || 0) + (m.rng() - .5) * 1.1, -1.5, 2.1);
    const b = m.ball;
    if (m.pause > 0) {
      m.pause -= dt;
      for (const e of active(m)) { const h = homePos(m, e); moveTo(e, h[0], h[1], 4, dt); }
      if (m.pause <= 0 && m.restart) doRestart(m);
    } else {
      if (b.fl) { const f = b.fl; f.t += dt; const k = Math.min(1, f.t / f.dur);
        const tx = f.tgt && f.res === 'ok' ? f.tgt.x : f.tx, ty = f.tgt && f.res === 'ok' ? f.tgt.y : f.ty;
        b.x = f.fx + (tx - f.fx) * k; b.y = f.fy + (ty - f.fy) * k; b.h = f.h ? Math.sin(k * Math.PI) * 3 : 0;
        if (k >= 1) arrive(m); }
      else if (b.owner) {
        const e = b.owner;
        if (!e.on || e.bin) { const [n] = nearest(m, null, b.x, b.y); if (n) own2(m, n); }
        else {
          if (e.slot.pos !== 'GK') {
            const gy = goalY(e.side), prog = e.side === 0 ? e.y / PL : 1 - e.y / PL, tx = prog > .7 ? PW / 2 + (e.x - PW / 2) * .55 : e.x + (e.slot.x - .5) * 2, dx = tx - e.x, dy = gy - e.y, dd = Math.hypot(dx, dy) || 1;
            const near = nearest(m, 1 - e.side, e.x, e.y)[1], sp = speed(m, e) * (e.carry ? .95 : .7) * (near < 4 ? .55 : 1); e.vx = dx / dd * sp; e.vy = dy / dd * sp; e.x = clamp(e.x + e.vx * dt, 1, PW - 1); e.y = clamp(e.y + e.vy * dt, 1, PL - 1);
          }
          b.x = e.x; b.y = e.y + dirOf(e.side) * .7;
          const [o, od] = nearest(m, 1 - e.side, e.x, e.y);
          if (o && od < 2.5 && e.slot.pos !== 'GK') {
            const de = eff(m, o, 'def'), dr = eff(m, e, 'dri'), ment = m.teams[o.side].ment;
            const deep = Math.abs(goalY(e.side) - e.y) < 32 ? 1.4 : .8;
            if (m.rng() < dt * 2.6 * deep * (1 + (2 - ment) * .1)) {
              const r = m.rng(), win = de / (de + dr * 1.1);
              if (r < .15 + (o.energy < 45 ? .04 : 0)) foul(m, o, e);
              else if (r < .15 + win * .55) { o.st.tk++; say(m, o.side, 'tackle', o, { on: e }); if (m.rng() < .25) outOfPlay(m, e.x < PW / 2 ? -1 : PW + 1, e.y, o.side); else { own2(m, o); o.dec = .3 + m.rng() * .4; o.carry = 0; } }
              else { e.st.drb++; e.x += (e.x < o.x ? -1 : 1) * 1.2; e.dec = Math.min(e.dec, .5); }
            }
          }
          if (b.owner === e) { e.dec -= dt * (od < 4 ? 2 : 1); if (e.dec <= 0) decide(m, e); }
        }
      }
      else { const [n] = nearest(m, null, b.x, b.y); if (n) { own2(m, n); n.dec = .4; } }
      // off the ball: two nearest defenders press and cover, everyone else holds shape
      const defSide = 1 - m.poss; let p1 = null, p2 = null, d1 = 1e9, d2 = 1e9;
      for (const e of active(m, defSide)) { if (e.slot.pos === 'GK') continue; const d = Math.hypot(e.x - b.x, e.y - b.y); if (d < d1) { p2 = p1; d2 = d1; p1 = e; d1 = d; } else if (d < d2) { p2 = e; d2 = d; } }
      for (const e of active(m)) {
        if (e === b.owner || (b.fl && b.fl.tgt === e && b.fl.res !== 'out')) { if (b.fl && b.fl.tgt === e) moveTo(e, b.fl.tx, b.fl.ty, speed(m, e), dt); continue; }
        const sp = speed(m, e);
        if (e === p1 && !b.fl) moveTo(e, b.x, b.y, sp * 1.05 * m.prof.press, dt);
        else if (e === p2) { const gy = goalY(m.poss); moveTo(e, (b.x + PW / 2) / 2, b.y + (gy - b.y) * .25, sp * .9, dt); }
        else if (e.slot.pos === 'GK') { const gl = e.side === 0 ? 0 : PL, h = homePos(m, e); moveTo(e, clamp(PW / 2 + (b.x - PW / 2) * .18, PW / 2 - 3.5, PW / 2 + 3.5), h[1], sp, dt); }
        else { const h = homePos(m, e); moveTo(e, h[0], h[1], sp * .85, dt); }
      }
    }
    if (m.half === 1 && m.t >= HALF) { m.half = 2; m.ht = true; m.t = HALF; say(m, -1, 'ht', ''); applySubs(m); manage(m); m.ball.fl = null; kickoff(m, 1); }
    else if (m.half === 2 && m.t >= 2 * HALF) finish(m);
  };
  function finish(m) {
    m.done = true;
    if (m.knockout && m.score[0] === m.score[1]) {   // penalty shootout
      const p = [0, 0]; let i = 0; const sk = side => { const xs = active(m, side).filter(e => e.slot.pos !== 'GK').sort((a, b) => shotSkill(m, b) - shotSkill(m, a)); return xs; };
      const A = sk(0), B = sk(1);
      while (i < 5 || (p[0] === p[1] && i < 20)) { for (const s of [0, 1]) { const tk = (s ? B : A)[i % Math.max(1, (s ? B : A).length)], g = gkOf(m, 1 - s); if (m.rng() < clamp(.75 + ((tk ? shotSkill(m, tk) : 40) - keepSkill(m, g)) / 300, .55, .9)) p[s]++; } i++;
        if (i <= 5 && (p[0] > p[1] + (5 - i) || p[1] > p[0] + (5 - i))) break; }
      m.pens = p;
    }
    say(m, -1, 'ft', '');
  }
  C.resumeHT = m => { m.ht = false; };
  C.simToEnd = m => { let n = 0; while (!m.done && n++ < 20000) { C.stepMatch(m); if (m.ht) m.ht = false; } return m; };
  C.simToHT = m => { let n = 0; while (m.half === 1 && !m.done && n++ < 10000) C.stepMatch(m); return m; };

  // ---------- ratings and player of the match (Q20k) ----------
  C.rateMatch = m => {
    const out = [];
    for (const e of m.ents) {
      const s = e.st; if (s.mins < 1) continue;
      const res = Math.sign(m.score[e.side] - m.score[1 - e.side]);
      let r = 6.2 + s.g * 1 + s.a * .6 + s.sot * .15 + s.tk * .12 + s.int * .12 + s.blk * .12 + s.clr * .05 + s.sv * .3 + s.drb * .05 + (s.pa ? (s.pc / s.pa - .75) * 2 : 0) + res * .3 - (s.yc ? .3 : 0) - (s.rc ? 1.5 : 0);
      if (e.slot.pos === 'GK' || ['CB', 'LB', 'RB'].includes(e.slot.pos)) r -= m.score[1 - e.side] * (e.slot.pos === 'GK' ? .3 : .15);
      if (e.slot.pos === 'GK' && m.score[1 - e.side] === 0 && s.mins > 60) r += .5;
      r = 6 + (r - 6) * Math.min(1, s.mins / 45);
      out.push({ e, r: Math.round(clamp(r, 3, 10) * 10) / 10 });
    }
    out.sort((a, b) => b.r - a.r); return out;
  };
})(window.CFC);
