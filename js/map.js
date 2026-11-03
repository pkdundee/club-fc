// Club FC: the College Map (phase-9i, round 4 item 30). Every program in the country, NPC-run for now, drawn as a campus
// that matches its tier. Tiers far above yours are ghosted; schools with a job opening for you glow and can be tapped.
// Built so real players can join the same map later (Event Modes).
(function (C) {
  const A = C.ACTS, W = 360, H = 232;
  // a coarse outline of the contiguous US (lon, lat)
  const US = [[-124.7, 48.4], [-123, 49], [-95.2, 49], [-94.8, 49.4], [-89.6, 48], [-84.8, 46.5], [-82.4, 45.3], [-82.5, 43], [-79, 43.3], [-76.8, 43.6], [-75, 45], [-71.5, 45], [-70, 46.7], [-67.8, 47.1], [-67, 44.8],
    [-70, 43.7], [-70.6, 42], [-71.2, 41.5], [-73.9, 40.6], [-74.2, 39.5], [-75.5, 38.5], [-76, 37], [-75.7, 35.8], [-77.5, 34.5], [-79, 33.5], [-80.8, 32], [-81.4, 30.5], [-80.1, 26.8], [-80.4, 25.2], [-81.3, 25.8],
    [-82.7, 27.8], [-83, 29.1], [-84.4, 29.9], [-86.5, 30.4], [-88.5, 30.4], [-89.6, 30.2], [-89.4, 29.2], [-90.4, 29.1], [-93.8, 29.7], [-95, 29.2], [-97.2, 27.6], [-97.4, 25.9], [-99.1, 26.4], [-101.4, 29.8],
    [-103.1, 29], [-104.5, 29.6], [-106.5, 31.8], [-108.2, 31.3], [-111, 31.3], [-114.8, 32.5], [-117.1, 32.5], [-118.5, 34], [-120.6, 34.6], [-121.9, 36.6], [-122.5, 37.8], [-123.8, 39.8], [-124.2, 41.9], [-124.1, 43.7], [-124, 46.2]];
  const ST = { TX: [-99.3, 31.3], LA: [-92, 31], SD: [-100.2, 44.4], MN: [-94.3, 46.3], NC: [-79.4, 35.5], MI: [-84.7, 43.6], NM: [-106.1, 34.4], MD: [-76.8, 39], NE: [-99.8, 41.5], AR: [-92.4, 34.9], AZ: [-111.7, 34.3],
    ME: [-69.2, 45.3], CA: [-119.6, 37.2], CO: [-105.5, 39], FL: [-81.7, 28.4], OH: [-82.8, 40.3], VA: [-78.8, 37.5], WA: [-120.5, 47.4], IN: [-86.3, 39.9], PA: [-77.6, 40.9], IL: [-89.2, 40], OR: [-120.6, 43.9],
    NH: [-71.6, 43.7], KS: [-98.4, 38.5], WI: [-89.8, 44.6], TN: [-86.4, 35.9], GA: [-83.4, 32.7], MO: [-92.5, 38.4], KY: [-85.3, 37.5], VT: [-72.7, 44], OK: [-97.5, 35.6], UT: [-111.7, 39.3], NV: [-116.6, 39.3],
    SC: [-80.9, 33.9], CT: [-72.7, 41.6], ID: [-114.6, 44.4], MT: [-109.6, 47], IA: [-93.5, 42], MS: [-89.7, 32.7], WY: [-107.5, 43], DE: [-75.5, 39], AL: [-86.8, 32.8] };
  const px = (lon, lat) => [(lon + 125) / 58 * W, (49.6 - lat) / 25 * H];
  const TIERC = { 1: '#f59e0b', 2: '#a855f7', 3: '#3b82f6', 4: '#22c55e', 5: '#94a3b8' };
  // place each school by its state, nudged apart when a state has several
  const pos = c => { const s = ST[c.state] || [-98, 39], same = C.COLLEGES.filter(x => x.state === c.state), i = same.indexOf(c), a = i * 2.4, d = same.length > 1 ? 1.1 + i * .3 : 0; return px(s[0] + Math.cos(a) * d * 1.3, s[1] + Math.sin(a) * d); };

  // a campus drawn to its tier: Tier 1 is a big stadium bowl, Tier 5 a single building (your own grows with your Coaches' Office)
  function campus(tier, c1, c2, k = 1) {
    const s = [0, 1.25, 1.1, .95, .82, .7][tier] * k * 1.45, col = TIERC[tier];
    const bowl = `<ellipse rx="${9 * s}" ry="${4.6 * s}" fill="${col}" stroke="#fff" stroke-width=".8"/><ellipse rx="${6.2 * s}" ry="${2.9 * s}" fill="#4ade80"/>`;
    const hall = `<path d="M${-6 * s} ${1 * s} V${-4 * s} L0 ${-8 * s} L${6 * s} ${-4 * s} V${1 * s}Z" fill="${c1}" stroke="#fff" stroke-width=".7"/><rect x="${-2 * s}" y="${-3 * s}" width="${4 * s}" height="${4 * s}" fill="${c2}"/>`;
    const base = `<ellipse cy="${1.6 * s}" rx="${8.5 * s}" ry="${3.2 * s}" fill="rgba(0,0,0,.25)"/>`;
    return base + (tier <= 2 ? bowl + `<g transform="translate(0,${-3 * s})">${tier === 1 ? hall : ''}</g>` : hall + (tier <= 3 ? `<rect x="${5 * s}" y="${-3 * s}" width="${3 * s}" height="${4 * s}" fill="${c2}" stroke="#fff" stroke-width=".5"/>` : ''));
  }

  let sel = null, tf = 0;
  C.openCollegeMap = id => { sel = id ?? null; C.ui.open('College Map', mapHTML); };
  A.collegemap = v => C.openCollegeMap(v === '' || v == null ? null : +v);
  A.mapsel = v => { sel = +v; C.ui.refresh(); };
  A.maptier = v => { tf = +v; sel = null; C.ui.refresh(); };
  const offerFor = id => { const car = C.car(); return (car.offers || []).findIndex(o => o.college === id); };

  function mapHTML() {
    const car = C.car(), my = car.college, myTier = car.tier, S = C.sea(), rivals = new Set((S.teams || []).map(t => t.col));
    const out = US.map(p => px(p[0], p[1]).map(v => v.toFixed(1)).join(',')).join(' ');
    const pins = C.COLLEGES.filter(c => c.id !== my && (!tf || c.tier === tf)).sort((a, b) => b.tier - a.tier).map(c => {
      const [x, y] = pos(c), open = offerFor(c.id) >= 0, ghost = !open && c.tier < myTier - 1, isSel = sel === c.id;
      return `<g class="mpin ${ghost ? 'ghost' : ''} ${open ? 'open' : ''}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" data-act="mapsel" data-v="${c.id}">
        ${open ? '<circle r="16" class="mglow"/>' : ''}${isSel ? '<circle r="15" fill="none" stroke="#0f172a" stroke-width="1.8"/>' : ''}${campus(c.tier, c.c1, c.c2)}<rect x="-12" y="-12" width="24" height="24" fill="transparent"/></g>`; }).join('');
    const me = C.COLLEGES[my], [mx, my2] = pos(me), grow = .8 + Math.min(1.2, car.b.hq / 20);
    const mine = `<g class="mpin me" transform="translate(${mx.toFixed(1)},${my2.toFixed(1)})" data-act="mapsel" data-v="${my}"><circle r="${11 * grow}" fill="rgba(253,224,71,.25)" stroke="#fde047" stroke-width="1.4"/>${campus(myTier, me.c1, me.c2, grow)}
      <g transform="translate(0,${-14 * grow})"><rect x="-11" y="-6" width="22" height="10" rx="5" fill="#fde047"/><text y="1.6" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="6.5" fill="#0f172a">YOU</text></g></g>`;
    const chips = `<div class="mapchips">${[0, 1, 2, 3, 4, 5].map(t => `<button class="${tf === t ? 'on' : ''}" data-act="maptier" data-v="${t}" style="${t ? `--tc:${TIERC[t]}` : ''}">${t ? 'T' + t : 'All'}</button>`).join('')}</div>`;
    const n = (car.offers || []).length;
    let info = `<p class="note" style="text-align:center">${n ? `🔔 ${n} school${n > 1 ? 's want' : ' wants'} you as head coach: the glowing campuses.` : 'Job openings appear at the end of each season. Tap any campus to see the program.'}</p>`;
    if (sel != null) { const c = C.COLLEGES[sel], i = offerFor(c.id), mineSel = c.id === my, tier = mineSel ? myTier : c.tier;
      const status = mineSel ? `Your program · ${C.tierLabel()}` : i >= 0 ? '🔔 Job opening for you' : c.tier < myTier - 1 ? `🔒 Out of reach: get to Tier ${c.tier + 1} first` : rivals.has(c.id) ? '⚔️ In your conference this season' : 'Not hiring right now';
      info = `<div class="mapcard" style="--tc:${TIERC[tier]}">${C.crestSVG(c.c1, c.c2, c.abbr.slice(0, 2), 46)}<div><b>${C.esc(c.full)}</b><small>${C.esc(c.mascot)} · ${c.state} · ${C.TIERS[tier].n}: ${C.TIERS[tier].name}</small><em>${status}</em></div>
        ${i >= 0 ? `<button class="btn sm2 claim" data-act="offers">View offer</button>` : ''}</div>`; }
    const legend = `<div class="maplegend">${[1, 2, 3, 4, 5].map(t => `<span><i style="background:${TIERC[t]}"></i>${C.TIERS[t].n}</span>`).join('')}</div>`;
    return `${chips}<div class="mapbox"><svg viewBox="0 0 ${W} ${H}" width="100%"><polygon points="${out}" fill="#bbf7d0" stroke="#15803d" stroke-width="1.2" stroke-linejoin="round"/>${pins}${mine}</svg></div>${legend}${info}
      <p class="note">${C.COLLEGES.length} programs. All are run by the game for now; when Event Modes open at Division II, other coaches will appear here too.</p>`;
  }
})(window.CFC);
