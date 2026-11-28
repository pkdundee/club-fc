// Club FC 1.09 (SCOPE_1.09; QA-107 to QA-112): the interim 1.08 feedback. Loaded after cycle.js, before main.js.
(function (C) {
  const A = C.ACTS;

  // ---------- QA-109: no First Week; a bonus for completing Pre-season ----------
  C.fwActive = () => false;
  C.fwMailUnclaimed = () => {};
  const PRE_BONUS = { gold: 200, cash: 10000, spb5: 12, cp: 100 };   // 1.12: Building speed-ups
  const oSs = A.startseasonok;
  A.startseasonok = (...a) => { const car0 = C.car(), first = car0 && car0.pre && car0.season === 1 && !car0.preLite && !car0.preBonus; const r = oSs(...a); const car = C.car();
    if (first && car && !car.pre) { car.preBonus = 1; C.mail('rewards', '🎉', 'Pre-season complete: your bonus', 'Pre-season done, Coach: the campus is built, the staff hired and the squad ready. Here is your bonus for the season ahead.', Object.assign({}, PRE_BONUS)); C.save(); C.toast('🎉 Pre-season bonus: claim it in the Inbox'); }
    return r; };

  // ---------- QA-110: all 4 coach slots from day 1 ("Empty", not "Free"); the paid slot retires ----------
  C.staffSlotOpen = () => true;
  const oStaff = C.staffHTML;
  C.staffHTML = () => { let h = oStaff(); const on = C.onStaff();
    // coaches fill the slots in order; the rest are Empty
    h = h.replace(/<div class="sslots">[\s\S]*?<\/div>/, m => m); return h.replace(/<b>Free<\/b>/g, '<b>Empty</b>'); };
  C.ACTS.sslotinfo = () => C.toast('Every coach slot is open: assign a coach');
  // one-time refund for anyone who bought the retired $2.99 Extra staff slot
  C.staffRefund = () => { const a = C.acct(); if (a.sslot3 && !a.sslot3Ref && C.car()) { a.sslot3Ref = 1; C.mail('purchases', '🧾', 'Refund: Extra staff slot', 'Every program now has 4 coach slots from day 1, so the Extra staff slot has been retired. Its value comes back to you in Coins.', { gold: 300 }); C.save(); } };

  // ---------- QA-107: recruit missions count from the start of a new career ----------
  const oRec = C.recMission;
  C.recMission = () => { const M = C.meta(), car = C.car(); if (!M.rq && car && car.season === 1 && car.pre) { const open = C.rosterCap(car) - car.squad.length + ((car.rec && car.rec.signed) || 0); M.rq = { base: 0, step: 0, goal: Math.max(0, open), done: open <= 0 }; } return oRec(); };

  // ---------- QA-108: in Pre-season the Coaches' Office Lv 5 task steps through the buildings it needs ----------
  const oStrip = C.stripTask;
  C.stripTask = () => { const car = C.car(); if (car && car.pre && C.preNext) { const t = C.preNext(); if (t && t[0] === 'hq5' && C.gateStep) { const g = C.gateStep(5); if (g && g.k) return { text: g.text, go: () => C.goToBuilding(g.k) }; } } return oStrip(); };

  // ---------- QA-111: a sub waiting for a stoppage is shown, with Cancel ----------
  C.pendingSubsHTML = m => { if (!m || !m.pending) return ''; const L = m.pending.filter(s => s.side === (C.matchMySide ? C.matchMySide() : 0));
    return L.map((s, i) => `<div class="subpend">🔁 Coming on at the next stoppage: <b>${C.esc(s.inP.fn[0] + '. ' + s.inP.ln)}</b> for <b>${C.esc(s.outE.p.fn[0] + '. ' + s.outE.p.ln)}</b> <button class="btn sm2 sec2" data-act="subcancel" data-v="${m.pending.indexOf(s)}">Cancel</button></div>`).join(''); };

  // ---------- QA-112: shirt numbers ----------
  const holderOf = n => C.car().squad.find(q => q.num === n);
  // a wish is "on hold" when the number belongs to a better-rated player
  C.wishOnHold = p => { if (!p.want || p.want === p.num) return false; const h = holderOf(p.want); return !!(h && h.id !== p.id && h.rating > p.rating); };
  C.wishActive = p => !!(p.want && p.want !== p.num && !C.wishOnHold(p));
  // a cherished number (wanted and got) can't be given to a lower-rated player
  C.numBlocked = (p, n) => { const h = holderOf(n); return !!(h && h.id !== p.id && h.want === n && h.rating > p.rating); };
  // after each of your matches: an unmet wish costs 2 morale, at most 8 in all
  const oApply = C.applyResult;
  C.applyResult = (m, f) => { const rep = oApply(m, f); C.car().squad.forEach(p => { if (C.wishActive(p)) { const pen = p.wishPen || 0; if (pen < 8) { p.wishPen = pen + 2; p.morale = Math.max(10, (p.morale || 60) - 2); } } }); C.save(); return rep; };
  // 1.09: the Academic Center's morale after each match (+0.1 a level)
  const oApply2 = C.applyResult; C.applyResult = (m, f) => { const rep = oApply2(m, f), a = C.eff('academic') * .1; if (a) C.car().squad.forEach(p => { p.morale = Math.min(100, (p.morale || 60) + a); }); return rep; };
  // 1.09: the Analysis Suite's opponent report (formation, the players to watch, the weak line) before every match
  C.scoutHTML = f => { if (!f || !C.eff('video')) return ''; const Se = C.sea(), ti = f.h === 0 ? f.a : f.h; let T; try { T = C.oppTeam(ti); } catch (e) { return ''; }
    const top = T.xi.slice().sort((a, b) => b.rating - a.rating).slice(0, 2), line = g => { const l = T.xi.filter(p => C.POSGROUP(p.pos) === g); return l.length ? l.reduce((s, p) => s + p.rating, 0) / l.length : 99; };
    const weak = [['def', 'defense'], ['mid', 'midfield'], ['fwd', 'attack']].sort((a, b) => line(a[0]) - line(b[0]))[0];
    return `<div class="scout"><b>📄 Analysis Suite report · Lv ${C.eff('video')}</b><small>They play ${T.form}. Watch ${top.map(p => `${C.esc(p.fn[0] + '. ' + p.ln)} (${p.pos} ${p.rating})`).join(' and ')}. Weakest line: their ${weak[1]}. Your edge: +${(C.eff('video') * .1).toFixed(1)}% shooting, defending and passing.</small></div>`; };
  // giving the wanted number lifts the penalty at once
  const oSet = C.giveNumber; if (oSet) C.giveNumber = (pid, n) => { const p = C.P(pid); if (p && C.numBlocked(p, n)) return 'cherished'; const r = oSet(pid, n); if (r === 'ok' && p && p.want === n && p.wishPen) { p.morale = Math.min(100, p.morale + p.wishPen); p.wishPen = 0; C.save(); } return r; };
  const oSwap = C.swapNumber; if (oSwap) C.swapNumber = (pid, n) => { const p = C.P(pid); if (p && C.numBlocked(p, n)) return 'cherished'; const r = oSwap(pid, n); if (p && p.num === n && p.want === n && p.wishPen) { p.morale = Math.min(100, p.morale + p.wishPen); p.wishPen = 0; C.save(); } return r; };
  const oNP = A.numpick; A.numpick = v => { const [id, ns] = String(v).split('|'), p = C.P(id), h = holderOf(+ns); if (p && C.numBlocked(p, +ns)) return C.toast(`No. ${ns} is ${C.sn(h)}'s cherished number: only a better-rated player can take it`); return oNP(v); };
  A.subcancel = i => { if (C.subCancel) C.subCancel(+i); };
  // "Ask to choose another": they pick a free number they like; a one-off −2
  A.numother = id => { const p = C.P(id), car = C.car(); if (!p || !p.want) return; const used = new Set(car.squad.map(q => q.num)), likes = (C.LIKES && C.LIKES[p.pos]) || [];
    const pick = likes.find(n => !used.has(n) && n !== p.want) || [...Array(99).keys()].map(i => i + 1).find(n => !used.has(n));
    if (pick) { p.morale = Math.max(10, (p.morale || 60) - 2 + (p.wishPen || 0)); p.wishPen = 0; p.want = pick; C.save(); C.toast(`${C.sn(p)} would now like No. ${pick}`); C.ui.refresh(); C.render(); } };
})(window.CFC);
