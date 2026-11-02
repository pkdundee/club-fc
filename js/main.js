// Club FC: start-up, the one-second clock and all tap handling.
(function (C) {
  const LEVEL_NAMES = k => C.BUILDINGS[k].name;

  C.applyTheme = () => { const t = C.acct().theme; if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    const col = C.car() ? C.college() : null; const r = document.documentElement.style;
    if (col) { r.setProperty('--school', col.c1); r.setProperty('--school2', col.c2); } };

  let e2 = null;
  C.BUILD = 'phase-9d · 2 Nov 2026';
  // actions that spend something: show a preview first, act only once confirmed
  const NEEDS_OK = { buydeal: 1, buy: 1, buypack: 1, cmanual: 1, clic: 1, ctrait: 1, treatc: 1, buykitc: 1, teamsess: 1, chire: 1 };
  function preview(a, v) {
    const own = (n, x) => `<div class="srow"><span>You have</span><b>${x} ${n}</b></div>`, gold = C.short(C.acct().gold);
    if (a === 'cmanual' || a === 'clic' || a === 'ctrait') { const c = C.coach(v), S = C.staffState(), k = C.licCost(c);
      const t = { cmanual: ['📗 Coaching manual', `+100 XP for ${c.fn} ${c.ln} (Lv ${c.level}, ${c.xp}/${C.xpNeed(c)} XP)`, '1 manual', own('manuals', S.items.manual)],
        clic: ['🎫 Licence upgrade', `${C.LICENCE[c.lic]} → ${C.LICENCE[Math.min(4, c.lic + 1)]} licence: level cap ${C.lvCap(c)} → ${[20, 30, 40, 50, 60][Math.min(4, c.lic + 1)]}`, `🎫 ${k.credits} Clinic Credits + 💵 ${C.short(k.cash)}`, own('Clinic Credits', S.items.credits)],
        ctrait: ['📕 Trait upgrade', `Trait Lv ${c.trait} → ${c.trait + 1}: +8% to everything this coach does`, `📕 ${c.trait} Trait Book${c.trait > 1 ? 's' : ''}`, own('Trait Books', S.items.books)] }[a];
      return [t[0], `<div class="card"><p style="font-weight:800">${t[1]}</p><div class="srow"><span>Costs</span><b>${t[2]}</b></div>${t[3]}</div>`, 'Confirm']; }
    if (a === 'treatc') { const [pid, kind] = v.split('|'), p = C.P(pid), kits = (C.car().items && C.car().items.kit) || 0;
      return kind === 'spec' ? ['Specialist treatment', `<div class="card"><p style="font-weight:800">${C.esc(p.fn + ' ' + p.ln)}: ${C.esc(p.injury.name)}. One match off their recovery (${p.inj} → ${p.inj - 1}). Once per injury.</p><div class="srow"><span>Costs</span><b>${C.GEM} ${C.TREAT.spec}</b></div><div class="srow"><span>You have</span><b>${C.GEM} ${gold}</b></div></div>`, 'Treat']
        : ['Rush back', `<div class="card"><p style="font-weight:800">${C.esc(p.fn + ' ' + p.ln)} plays next match, not fully fit: −15% and ×3 risk of re-injury.</p><div class="srow"><span>Costs</span><b>${kits ? '🧴 1 recovery kit' : C.GEM + ' ' + C.TREAT.rush}</b></div><div class="srow"><span>You have</span><b>${kits ? kits + ' kits' : C.GEM + ' ' + gold}</b></div></div>`, 'Rush back']; }
    if (a === 'chire') { const c = C.staffState().market.find(x => x.id === v); if (!c) return null; const k = C.hireCost(c);
      return ['Hire coach', `<div class="card"><p style="font-weight:800">${C.esc(c.fn + ' ' + c.ln)} · ${C.SPECS[c.spec][1]} (${C.RARITY[c.rar][0]})</p><p class="note">▶ ${C.coachBenefit(c)}</p><div class="srow"><span>Costs</span><b>${k.gold ? C.GEM + ' ' + k.gold : '💵 ' + C.short(k.cash)}</b></div><div class="srow"><span>You have</span><b>${k.gold ? C.GEM + ' ' + C.short(C.acct().gold) : '💵 ' + C.short(C.car().cash)}</b></div></div>`, 'Hire']; }
    if (a === 'buydeal') { const dl = C.todayDeal(); return ["Today's deal", `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store: nothing is charged.</div><div class="card" style="margin-top:8px"><p style="font-weight:900;font-size:16px">${dl.icon} ${C.esc(dl.name)}</p><p class="note">${C.rwText(dl.r)}</p><div class="srow"><span>Price</span><b><s style="opacity:.5">${dl.was}</s> ${dl.price}</b></div></div>`, 'Buy (test)']; }
    if (a === 'buykitc') return ['Buy a recovery kit', `<div class="card"><p style="font-weight:800">🧴 +25 Freshness to one player, any time.</p><div class="srow"><span>Costs</span><b>${C.GEM} ${C.TREAT.kit}</b></div><div class="srow"><span>You have</span><b>${C.GEM} ${gold}</b></div></div>`, 'Buy'];
    if (a === 'teamsess') return C.medState().team > 0 ? ['Team recovery session', `<div class="card"><p style="font-weight:800">👥 +12 Freshness for the whole squad. Free again in ${C.medState().team} match${C.medState().team > 1 ? 'es' : ''}.</p><div class="srow"><span>Costs now</span><b>${C.GEM} ${C.TREAT.team}</b></div><div class="srow"><span>You have</span><b>${C.GEM} ${gold}</b></div></div>`, 'Run session'] : null;
    if (a === 'buy' || a === 'buypack') return ['Confirm purchase', `<div class="card" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:13px">🧪 Test store: nothing is charged.</div><p class="note">${a === 'buypack' && C.PACKS[v] ? C.esc(C.PACKS[v].name) + ' · ' + C.PACKS[v].price : { vip: "Coach's Club · $4.99 / month", slot3: 'Extra build slot · $2.99', tslot3: 'Extra training slot · $2.99', pslot3: 'Extra research slot · $2.99', sslot3: 'Extra staff slot · $2.99', tokens: '3 Number Changes · $0.99', gold: '500 Coins · $4.99' }[v] || v}</p>`, 'Buy (test)'];
    return null;
  }
  function act(a, v, el) {
    const car = C.car();
    if (NEEDS_OK[a] && !(el && el.dataset.ok)) { const pv = preview(a, v); if (pv) return C.confirm(pv[0], pv[1], pv[2], a, v); }
    if (el && el.dataset.ok) C.ui.back();
    switch (a) {
      case 'tab': C.tab = v; C.selB = null; C.ui.closeAll(); C.render(); break;
      case 'proginfo': C.openProgramInfo(); break;
      case 'back': C.ui.back(); break;
      case 'close': C.ui.closeAll(); if (C.car() && C.tab === 'campus') C.render(); break;
      case 'bgclose': C.ui.back(); break;
      case 'toast': C.toast(v); break;
      case 'zoom': C.zoomBy(+v); break;
      // buildings
      // tap selects a building (name, level, big action button); tapping it again or the button opens the upgrade card
      case 'bld': if (C.mapDragged()) return; if (C.selB === v) C.openBuilding(v); else { C.selB = v; C.redrawMap(); } break;
      case 'bldopen': if (C.mapDragged()) return; C.openBuilding(v); break;
      case 'land': if (C.mapDragged()) return; C.toast(`Campus expansion land. Opens when your program reaches Tier ${v}.`); break;
      case 'upgrade': if (C.startUpgrade(v)) { C.selB = null; C.fwEvent('upgrade'); C.toast(`🔨 ${LEVEL_NAMES(v)} upgrade started`); C.ui.closeAll(); C.render(); } break;
      case 'instant': if (C.instantUpgrade(v)) { C.fwEvent('upgrade'); C.fwEvent('speed'); C.toast(`✨ ${LEVEL_NAMES(v)} is now Lv ${car.b[v]}`); C.ui.closeAll(); C.render(); } break;
      case 'speed': { const q = C.inQueue(v); if (!q) break; const free = C.isFreeFinish(q);
        if (C.finishNow(q, !free)) { C.fwEvent('speed'); C.toast(`✨ ${LEVEL_NAMES(v)} is now Lv ${car.b[v]}`); C.ui.closeAll(); C.render(); } else C.toast('Not enough Coins'); break; }
      case 'adspeed': { const q = C.inQueue(v); if (!q) break; C.toast('▶ Ad finished (test): −15 minutes'); C.adSpeedUp(q); C.fwEvent('speed');
        if (!C.inQueue(v)) { C.ui.closeAll(); C.render(); } else C.ui.refresh(); break; }
      case 'collect': { const amt = C.collect(v); if (amt) C.fwEvent(C.PRODUCERS[v] === 'cp' ? 'collect_cp' : 'collect_cash'); if (amt) C.toast(`${C.PRODUCERS[v] === 'cp' ? '<i class="cpi"></i>' : '💵'} +${C.short(amt)} collected`); if (C.ui.isOpen()) C.ui.refresh(); C.redrawMap(); C.updateLive(); break; }
      case 'slotinfo': { const s = C.SLOTS.find(x => x.id === v); C.toast(`🔒 ${s.name}: ${s.why}`); if (v !== 'prog') C.openStore(); break; }
      // careers
      case 'careers': C.openCareers(); break;
      case 'newcar': if (!C.car() && !C.introSeen()) C.openIntro(() => C.openMarket(true)); else C.openMarket(C.ui.isOpen()); break;
      case 'intronext': C.introNext(); break;
      case 'introskip': C.introDone(); break;
      case 'replayintro': C.openIntro(); break;
      case 'help': C.openHandbook(v); break;
      case 'ask': C.openAsk(); break;
      case 'ad': C.openAD(); C.render(); break;
      case 'firstweek': C.openFirstWeek(); break;
      case 'fwclaim': { const r = C.fwClaim(+v); if (r) { C.toast('🎁 ' + r); C.ui.refresh(); C.render(); } break; }
      case 'job': if (e2.target.closest('[data-act=shortlist]')) return; C.openJob(+v); break;
      case 'shortlist': C.toggleShort(+v); break;
      case 'jpage': C.jobPage(+v); break;
      case 'jshort': C.market().onlyShort = v === '1'; C.ui.refresh(); break;
      case 'signjob': C.openIdentity(); break;
      case 'pron': C.market().coach = (C.$('#coachName') || {}).value || ''; C.market().pron = v; C.ui.refresh(); break;
      case 'startjob': { const M = C.market(); const coach = ((C.$('#coachName') || {}).value || '').trim() || 'Rookie';
        C.newCareer({ coach, pron: M.pron, job: M.jobs[M.pick] }); C.ui.closeAll(); C.tab = 'campus'; C.applyTheme(); C.render(); C.openFirstCoach(welcome); break; }
      case 'firstcoach': C.pickFirstCoach(v); C.render(); break;
      case 'sguide': C.car().seen.staffGuide = 1; C.save(); C.render(); break;
      case 'switchcar': C.db.active = +v; C.save(); C.ui.closeAll(); C.tab = 'home'; C.applyTheme(); C.render(); break;
      case 'delcar': C.ui.open('Delete a career', () => C.db.careers.map((c, i) => `<button class="lrow" data-act="delone" data-v="${i}"><span class="li">🗑</span><span class="lt"><b>${C.esc(c.coach)} · ${C.esc(C.COLLEGES[c.college].short)}</b><small>Tap to delete. This can't be undone.</small></span></button>`).join('')); break;
      case 'delone': C.deleteCareer(+v); C.ui.closeAll(); C.applyTheme(); C.render(); C.toast('Career deleted'); break;
      // settings + store
      // squad (Phase 3)
      case 'sqf': C.setSquadFilter(v); break;
      case 'player': C.openPlayer(v); break;
      case 'train': C.openTrain(v); break;
      case 'plan': { const [pid, f] = v.split('|'); const r = C.startPlan(pid, f);
        if (r === true) { C.toast('🏋️ Training plan started'); C.ui.back(); C.ui.refresh(); if (C.tab === 'squad') C.render(); }
        else C.toast(r === 'cash' ? 'Not enough Booster $' : r === 'cap' ? "At this player's limit" : 'All training slots are busy'); break; }
      case 'devspeed': { const q = C.inDev(v); if (!q) break; const free = C.isFreeFinish(q); if (!free) { const g = C.goldToFinish(q); if (C.acct().gold < g) { C.toast('Not enough Coins'); break; } C.acct().gold -= g; }
        q.end = C.now(); C.tickDev().forEach(m => C.toast(m)); C.fwEvent('speed'); C.ui.refresh(); if (C.tab === 'squad') C.render(); break; }
      case 'devslot': { const s2 = C.DEVSLOTS.find(x => x.id === v); C.toast(`🔒 ${s2.name}: ${s2.why}`); if (v !== 'prog') C.openStore(); break; }
      case 'numbers': C.openNumbers(v); break;
      case 'setnum': { const [pid, n] = v.split('|'); const r = C.giveNumber(pid, +n); if (r === 'ok') { C.toast('🎟 Number changed'); C.ui.back(); C.ui.refresh(); C.render(); } else C.toast(r === 'none' ? 'No Number Changes left (see the Store)' : 'That number is taken'); break; }
      case 'givenum': { const p = C.P(v), r = C.giveNumber(v, p.want); if (r === 'ok') { C.toast(`😀 ${p.ln} now wears No. ${p.want}`); C.ui.refresh(); C.render(); } else C.toast(r === 'none' ? 'No Number Changes left (see the Store)' : `No. ${p.want} is taken: change the other player's number first`); break; }
      case 'captain': if (!C.toggleCaptain(v)) C.toast('Up to 3 captains'); C.ui.refresh(); C.render(); break;
      case 'release': C.openRelease(v); break;
      case 'releaseyes': if (C.release(v)) { C.toast('Player released'); C.ui.closeAll(); C.render(); } else C.toast('Keep at least 16 players'); break;
      case 'rare': { const p = C.useRareRecruit(); if (p === 'full') C.toast('Roster is full'); else if (p) { C.render(); C.openPlayer(p.id); C.toast(`🎉 ${p.fn} ${p.ln} signed (Rare ${p.pos})`); } break; }
      // recruiting (Phase 4)
      case 'rroute': C.setRoute(v); break;
      case 'recruit': C.openRecruit(v); break;
      case 'scout': { const r = C.scout(v); if (r === 'cp') C.toast('Not enough Coaching Points'); else { C.toast('🔍 Scouted'); C.ui.refresh(); C.render(); } break; }
      case 'rpass': C.passRecruit(v); C.ui.closeAll(); C.render(); break;
      case 'offer': C.openOffer(v); break;
      case 'oset': C.offerSet(v); break;
      case 'orole': C.offerSet('role', v); break;
      case 'osend': C.sendOffer(); break;
      case 'camp': { const r = C.runCamp(); if (r === true) { C.toast('🏕 3 players came to your ID Camp'); C.render(); } else C.toast(r === 'cash' ? 'Not enough Booster $' : 'The next camp is not ready yet'); break; }
      case 'agency': { const r = C.hireAgency(); if (r === true) { C.toast('🌍 Your scout found a player'); C.render(); } else C.toast('Not enough Coins'); break; }
      case 'portalgo': C.ui.closeAll(); C.tab = 'recruit'; C.setRoute('portal'); break;
      case 'keep': C.openKeep(v); break;
      case 'keepopt': { const [pid, k] = v.split('|'); const r = C.keepOption(pid, k); if (r === true) { C.toast('🤝 Done. Their chance of leaving dropped'); C.ui.refresh(); C.render(); } else if (r) C.toast(r === 'pool' ? 'Not enough scholarship money left' : 'Not enough Booster $'); break; }
      case 'letgo': C.letGo(v); C.toast('They have entered the portal'); C.ui.closeAll(); C.render(); break;
      // season and match day (Phase 5)
      case 'prematch': C.openPreMatch(); break;
      case 'mkick': C.kickOff(); break;
      case 'mquick': C.quickMatch(); break;
      case 'mleave': C.leaveMatch(); break;
      case 'mcdstop': C.stopCountdown(); break;
      case 'mtac': C.stopCountdown(); C.openTactics(true); break;
      case 'mspeed': C.matchSpeed(v); break;
      case 'mpause': C.matchPause(); break;
      case 'mskip': C.matchSkip(v); break;
      case 'msound': C.toggleSound(); break;
      case 'm2h': C.secondHalf(); break;
      case 'msubs': C.openSubs(); break;
      case 'msin': C.subIn(v); break;
      case 'msout': C.subOut(v); break;
      case 'mment': C.openMatchPlan(); break;
      case 'mmset': C.matchMent(v); break;
      case 'mauto': C.matchAuto(); break;
      case 'report': C.openReport(+v); break;
      case 'seav': C.setSeasonView(v); break;
      case 'nextseason': { const r = C.startNextSeason(); C.render(); C.toast(r.up ? `🎉 ${C.college().short} moved up to ${C.TIERS[car.tier].n}! Building caps raised.` : `🎓 ${r.left.length} seniors graduated${r.walk.length ? ` · ${r.walk.length} walk-ons joined` : ''} · 💵 Director's budget +${C.short(r.budget)}`); break; }
      case 'tactics': C.openTactics(); break;
      case 'form': C.setForm(v); C.ui.refresh(); break;
      case 'ment': C.tac().ment = +v; C.save(); C.ui.refresh(); break;
      case 'pick': C.openPicker(v); break;
      case 'pkf': C.pickerFilter(v); break;
      case 'setpick': { const [s, pid] = v.split('|'); C.setPick(s, pid); C.ui.back(); C.ui.refresh(); if (C.tab === 'squad') C.render(); break; }
      case 'unpick': C.unpick(v); C.ui.back(); C.ui.refresh(); break;
      case 'instr': { const [pid, k] = v.split('|'); C.tac().instr[pid] = +k; C.save(); C.ui.refresh(); break; }
      case 'autopick': C.autoPick(); C.ui.refresh(); C.toast('✨ Picked the strongest fit XI'); break;
      case 'automan': C.tac().auto = !C.tac().auto; C.save(); C.ui.refresh(); break;
      case 'sound': C.acct().sound = v === '1'; C.save(); C.ui.refresh(); break;
      // staff and Playbook (Phase 6)
      case 'coach': C.openCoach(v); break;
      case 'market': C.openCoachMarket(); break;
      case 'search': C.openSearch(); break;
      case 'dosearch': { const r = C.search(); if (r === 'gold') C.toast('Not enough Coins'); else { C.ui.back(); if (r.coach) C.openCoach(r.coach.id); C.toast(r.coach ? `🎉 ${C.RARITY[r.coach.rar][0]} ${C.SPECS[r.coach.spec][1]}: ${r.coach.fn} ${r.coach.ln}` : `Repeat ${C.SPECS[r.dup.spec][1]}: +${r.credits} 🎫 Clinic Credits`); C.render(); } break; }
      case 'chire': { const r = C.hire(v); if (r === 'gold') C.toast('Not enough Coins'); else if (r === 'cash') C.toast('Not enough Booster $'); else if (r) { C.ui.back(); C.ui.refresh(); C.toast(`✍️ ${r.fn} ${r.ln} joins your staff`); C.render(); } break; }
      case 'cassign': { const r = C.assign(v); if (r === 'full') C.toast('All staff slots are full'); C.ui.refresh(); C.render(); break; }
      case 'crelease': if (C.releaseCoach(v)) { C.ui.back(); C.render(); C.toast('Coach released'); } break;
      case 'cmanual': { const r = C.useManual(v); C.toast(r === 'none' ? 'No coaching manuals left' : r === 'cap' ? 'At the level cap: raise the licence' : r ? `⬆ Level up! Lv ${C.coach(v).level}` : '+100 XP'); C.ui.refresh(); C.render(); break; }
      case 'clic': { const r = C.licenceUp(v); C.toast(r === true ? `🎫 ${C.LICENCE[C.coach(v).lic]} licence earned` : { max: 'Already Pro', level: 'Reach the level cap first', credits: 'Not enough Clinic Credits', cash: 'Not enough Booster $' }[r]); C.ui.refresh(); C.render(); break; }
      case 'ctrait': { const r = C.traitUp(v); C.toast(r === true ? '📕 Trait upgraded' : r === 'max' ? 'Trait is at max' : 'Not enough Trait Books'); C.ui.refresh(); C.render(); break; }
      case 'sslotinfo': { const s2 = C.STAFFSLOTS.find(x => x.id === v); C.toast(`🔒 ${s2.name}: ${s2.why}`); if (v !== 'prog') C.openStore(); break; }
      case 'playbook': C.openPlaybook(); break;
      case 'pbnode': C.openPBNode(v); break;
      case 'pbgo': { const r = C.pbStart(v); if (r === true) { C.toast('📋 Research started'); C.ui.back(); C.ui.refresh(); } else C.toast({ max: 'Fully researched', locked: 'Locked', busy: 'Already researching', slots: 'All research slots are busy', cp: 'Not enough Coaching Points', cash: 'Not enough Booster $' }[r]); break; }
      case 'pbspeed': { const q = C.pbInQueue(v); if (!q) break; if (!C.isFreeFinish(q)) { const g = C.goldToFinish(q); if (C.acct().gold < g) { C.toast('Not enough Coins'); break; } C.acct().gold -= g; } q.end = C.now(); C.tickPB().forEach(m => C.toast(m)); C.ui.refresh(); break; }
      case 'pbslot': { const s2 = C.PBSLOTS.find(x => x.id === v); C.toast(`🔒 ${s2.name}: ${s2.why}`); if (v !== 'prog') C.openStore(); break; }
      // career (Phase 7)
      case 'offers': C.openOffers(); break;
      case 'takeoffer': C.openMove(+v); break;
      case 'invite': C.inviteToggle(v); break;
      case 'domove': { const r = C.makeMove(+v); if (!r) break; C.ui.closeAll(); C.tab = 'campus'; C.render();
        C.ui.open('New job', () => `<div class="scenebn">${C.artSlot('handshake', C.sceneHandshake(r.col.c1, r.col.c2))}</div><div class="collegecard">${C.crestSVG(r.col.c1, r.col.c2, r.col.abbr.slice(0, 2), 64)}<div><b style="font-family:Graduate,serif;font-size:20px">${C.esc(r.col.full)}</b><br><small class="mutey">${C.tierLabel()}</small></div></div>
          <div class="card" style="margin-top:12px;font-size:14px;font-weight:700;line-height:1.5">🧳 Your program buildings, staff and Playbook came with you.<br>${r.joined.length ? '✔ Followed you: ' + r.joined.map(p => C.esc(p.ln)).join(', ') : 'Nobody followed you.'}${r.declined.length ? '<br>✖ Stayed behind: ' + r.declined.map(p => C.esc(p.ln)).join(', ') : ''}<br>🏠 Your first game is a homecoming friendly at your old college.</div>
          <button class="btn full pri" data-act="close">Let's go</button>`); break; }
      case 'declineoffers': C.declineOffers(); C.ui.closeAll(); C.render(); C.toast('❤️ Loyalty noted: <i class="coin"></i> 50, 💵 5K and a happier Director'); break;
      case 'reclass': if (C.applyReclass()) { C.toast('🔁 Approved: next season is a transition season'); C.ui.refresh(); C.render(); } break;
      // live-ops and store (Phase 8)
      case 'events': C.openEvents(); break;
      case 'evtab': C.setEventsTab(v); break;
      case 'calclaim': { const r = C.calClaim(); if (r) { C.toast('🎁 ' + C.rwText(r)); C.ui.refresh(); C.render(); } break; }
      case 'taskclaim': { const r = C.taskClaim(+v); if (r) { C.toast('✔ ' + C.rwText(r)); C.ui.refresh(); C.render(); } break; }
      case 'chest': { const r = C.chestClaim(); if (r) { C.toast('🧰 ' + C.rwText(r)); C.ui.refresh(); C.render(); } break; }
      case 'vipdaily': { const r = C.vipDaily(); if (r) { C.toast('👑 ' + C.rwText(r)); C.ui.refresh(); C.render(); } break; }
      case 'adreward': { const r = C.adReward(); if (r) { C.toast((C.isVip() ? '👑 ' : '▶ Ad finished (test): ') + C.rwText(r)); C.ui.refresh(); C.render(); } break; }
      case 'passclaim': { const [t, i] = v.split('|'); const r = C.passClaim(t, +i); if (r === 'prem') C.toast('Unlock the premium track first'); else if (r) { C.toast('🎟 ' + C.rwText(r)); C.ui.refresh(); C.render(); } break; }
      case 'buypack': { const r = C.buyPack(v); C.toast(r === 'owned' ? 'Already bought' : '✅ Test purchase complete'); C.ui.refresh(); C.render(); break; }
      case 'kit': C.buyKit(v); C.toast(`${C.KITS[v][0]} ${C.KITS[v][1]}`); C.ui.refresh(); C.render(); break;
      // fitness and injuries (phase-9c)
      case 'medical': C.openMedical(); break;
      case 'treat': case 'treatc': { const [pid, kind] = v.split('|'); const r = C.treat(pid, kind);
        C.toast(r === true ? { physio: '🩺 Physio done: one match off', spec: '🩺 Treated: one match off', rush: '⚡ Rushed back for the next match', kit: '🧴 +25 Freshness' }[kind] : { coins: 'Not enough Coins', none: 'No physio sessions left', nokit: 'No recovery kits', no: "Can't do that for this injury" }[r] || 'Not possible'); C.ui.refresh(); C.render(); break; }
      case 'teamsess': { const r = C.teamSession(); C.toast(r === true ? '👥 Team recovery session: +12 Freshness' : 'Not enough Coins'); C.ui.refresh(); C.render(); break; }
      case 'buykitc': { const r = C.buyRecoveryKit(); C.toast(r === true ? '🧴 Recovery kit bought' : 'Not enough Coins'); C.ui.refresh(); break; }
      case 'adphysio': { const r = C.adPhysio(); C.toast(r === true ? '▶ Ad finished (test): +1 physio session' : r === 'used' ? 'Used today' : 'No ads left today'); C.ui.refresh(); break; }
      // Home (phase-9d)
      case 'dailygift': { const r = C.claimGift(); if (r) { C.toast('🎁 ' + C.rwText(r)); C.render(); } break; }
      case 'buydeal': { const r = C.buyDeal(); C.toast(r === true ? '✅ Test purchase complete' : 'Already bought today'); C.render(); break; }
      case 'settings': C.openSettings(); break;
      case 'checkupdate': C.toast('Checking…'); (navigator.serviceWorker ? navigator.serviceWorker.getRegistration().then(r => r && r.update()) : Promise.resolve()).catch(() => {}).finally(() => setTimeout(() => location.reload(), 600)); break;
      case 'theme': C.acct().theme = v; C.save(); C.applyTheme(); C.ui.refresh(); break;
      case 'testcap': C.acct().testCap = +v; C.save(); C.ui.refresh(); C.redrawMap(); break;
      case 'cheat': if (v === 'gold') C.acct().gold += 500; if (v === 'cash') car.cash += 20000; if (v === 'cp') car.cp += 100;
        if (v === 'apps') C.appsNow();
        if (v === 'rest') car.squad.forEach(p => p.energy = 100);
        if (v === 'rep') car.rep = Math.min(100, (car.rep ?? 10) + 30);
        if (v === 'prog') C.PROGRAM_B.forEach(k => car.b[k] = Math.min(C.tierCap(), car.b[k] + 3));
        if (v === 'season') { C.simRestOfSeason(); C.ui.closeAll(); C.tab = 'season'; C.render(); C.toast('Season skipped to the end'); break; }
        if (v === 'camp' && car.rec) car.rec.campReady = 0;
        if (v === 'portal') { const m = C.portalOpen() ? C.closePortalNow() : (C.openPortalWindow(), '🚪 Transfer window open for 3 days'); C.save(); C.ui.closeAll(); C.tab = 'recruit'; C.setRoute('portal'); C.toast(m); break; }
        if (v === 'finish') { car.queue.forEach(q => q.end = C.now()); (car.devq || []).forEach(q => q.end = C.now()); (car.pbq || []).forEach(q => q.end = C.now()); C.tickDev(); C.tickPB(); }
        C.save(); C.tick(); C.render(); C.ui.refresh(); C.toast('Done'); break;
      case 'wipe': C.ui.open('Delete all data', () => `<p class="note" style="font-size:14px">This deletes every career and resets Coins and purchases on this device.</p><button class="btn full danger" data-act="wipeyes">Yes, delete everything</button>`); break;
      case 'wipeyes': try { localStorage.removeItem('clubfc2_p9d'); } catch (e) { } location.reload(); break;
      case 'store': C.openStore(); break;
      case 'buy': { const a2 = C.acct();
        if (v === 'vip') a2.vipUntil = Math.max(a2.vipUntil, C.now()) + 30 * 864e5;
        if (v === 'slot3') { if (a2.slot3) break; a2.slot3 = true; }
        if (v === 'gold') a2.gold += 500;
        if (v === 'tslot3') { if (a2.tslot3) break; a2.tslot3 = true; }
        if (v === 'tokens' && car) car.tokens += 3;
        if (v === 'sslot3') { if (a2.sslot3) break; a2.sslot3 = true; }
        if (v === 'pslot3') { if (a2.pslot3) break; a2.pslot3 = true; }
        C.save(); C.toast('✅ Test purchase complete'); C.ui.refresh(); if (C.tab === 'campus') C.render(); break; }
    }
  }

  function welcome() {
    const col = C.college();
    C.ui.open('Welcome', () => `<div class="scenebn">${C.artSlot('arrival', C.sceneArrival(col.c1, col.c2))}</div><div class="collegecard">${C.crestSVG(col.c1, col.c2, col.abbr.slice(0, 2), 64)}<div><b style="font-family:Graduate,serif;font-size:20px">${C.esc(col.full)}</b><br><small style="color:var(--mute);font-weight:800">${C.esc(col.mascot)} · ${col.state} · Tier 5</small></div></div>
      <div class="card" style="margin-top:14px;font-size:14px;line-height:1.5;font-weight:700">Coach ${C.esc(C.car().coach)}, welcome. ${C.esc(C.STORIES[C.car().job.story].title)}.<br><br>🔨 Tap a building to upgrade it, or an empty plot to build.<br>💵 Tap the bubbles to collect Booster $ and <i class="cpi"></i> Coaching Points.<br>🏛 The Coaches' Office level caps everything else.</div>
      <button class="btn full pri" data-act="close">Let's build</button>`);
  }

  // one tap handler for everything
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) { if (C.selB && e.target.closest('#map') && !C.mapDragged()) { C.selB = null; C.redrawMap(); } return; }
    if (el.dataset.act === 'bgclose' && e.target !== el) return;
    e2 = e; act(el.dataset.act, el.dataset.v, el);
  });

  // horizontal swipe on [data-swipe] (job pages)
  let sx = null, sy = null;
  document.addEventListener('touchstart', e => { if (!e.target.closest('[data-swipe]')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) C.jobPage(dx < 0 ? 1 : -1); }, { passive: true });

  // one-second clock: finish builds, update timers, refresh live pop-ups
  let n = 0;
  setInterval(() => {
    if (!C.car()) return;
    const dmsg = C.tickDev(); if (dmsg.length) { dmsg.forEach(m => C.toast(m)); if (C.tab === 'squad') C.render(); if (C.ui.isOpen()) C.ui.refresh(); }
    if (C.recover() && C.tab === 'squad' && !C.ui.isOpen() && ++n % 30 === 0) C.render();
    const pm = C.tickPB(); if (pm.length) { pm.forEach(x => C.toast(x)); if (C.ui.isOpen()) C.ui.refresh(); }
    const rt = C.tickRecruit(); rt.msgs.forEach(m => C.toast(m)); if (rt.changed && !C.ui.isOpen() && C.tab !== 'campus') C.render();
    C.$$('[data-until]').forEach(e => { e.textContent = C.dur((+e.dataset.until - C.now()) / 1000); });
    C.$$('[data-dtimer]').forEach(e => { const q = C.inDev(e.dataset.dtimer); if (q) e.textContent = C.dur(C.remaining(q)); });
    const done = C.tick();
    if (done.length) { done.forEach(q => C.toast(`✨ ${LEVEL_NAMES(q.key)} reached Lv ${q.to}`)); C.render(); if (C.ui.isOpen()) C.ui.refresh(); return; }
    C.updateLive();
    if (C.ui.isOpen() && C.$('.uc [data-timer]')) C.ui.refresh();
    if (++n % 20 === 0 && !C.ui.isOpen()) C.redrawMap(); // let new collect bubbles appear
  }, 1000);

  // start
  // launch: title/loading screen for a few seconds, then Home (or the start-a-career screen)
  C.load(); C.tickRealDay(); C.applyTheme(); C.booting = true; C.tab = 'home';
  C.$('#screen').innerHTML = C.titleHTML();
  const ready = C.loadArtManifest ? C.loadArtManifest() : Promise.resolve();
  Promise.all([ready, new Promise(r => setTimeout(r, C.TITLE_MS))]).then(() => { C.booting = false; C.render(); });
  const cs = C.$('#calstrip .next'); if (cs) cs.scrollIntoView({ inline: 'center', block: 'nearest' });
  // offline support; when a new upload takes over, reload once so the new version shows straight away
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const had = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; location.reload(); } });
  }
})(window.CFC);
