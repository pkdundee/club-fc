// Club FC: static game data (colleges, tiers, buildings).
(function (C) {
  // ---- colleges: 4 name forms each (Q19). Original names, no near-copies of real colleges. ----
  // [full, short, mascot, abbr, state, colour1, colour2, public?]
  C.COLLEGES = [
    ['Cactus Flats College', 'Cactus Flats', 'Jackrabbits', 'CFC', 'TX', '#1e3a8a', '#f97316', true],
    ['Bayou State College', 'Bayou State', 'Crawdads', 'BSC', 'LA', '#5b21b6', '#fbbf24', true],
    ['Prairie Wind College', 'Prairie Wind', 'Pheasants', 'PWC', 'SD', '#166534', '#facc15', false],
    ['Taconite College', 'Taconite', 'Miners', 'TAC', 'MN', '#7f1d1d', '#cbd5e1', true],
    ['Hickory Ridge College', 'Hickory Ridge', 'Ridgebacks', 'HRC', 'NC', '#0f766e', '#f8fafc', false],
    ['Driftwood Shores College', 'Driftwood Shores', 'Gulls', 'DSC', 'MI', '#0369a1', '#fde047', true],
    ['Painted Mesa College', 'Painted Mesa', 'Roadrunners', 'PMC', 'NM', '#b91c1c', '#fcd34d', true],
    ['Saltmarsh College', 'Saltmarsh', 'Herons', 'SMC', 'MD', '#0c4a6e', '#86efac', false],
    ['Sandcrane State', 'Sandcrane State', 'Cranes', 'SCS', 'NE', '#9a3412', '#fef3c7', true],
    ['Pine Hollow College', 'Pine Hollow', 'Bobcats', 'PHC', 'AR', '#14532d', '#f97316', false],
    ['Copper Canyon College', 'Copper Canyon', 'Prospectors', 'CCC', 'AZ', '#78350f', '#38bdf8', true],
    ['Harbor Point College', 'Harbor Point', 'Mariners', 'HPC', 'ME', '#1e293b', '#ef4444', false]
  ].map(([full, short, mascot, abbr, state, c1, c2, pub], id) => ({ id, full, short, mascot, abbr, state, c1, c2, pub, tier: 5 }));
  // Higher tiers (phase-9i): invented names, none based on a real school. Appended so existing saves keep their college ids.
  [[1, [['Ironhorse University', 'Ironhorse', 'Stallions', 'IHU', 'TX', '#7c2d12', '#fbbf24', true], ['Crown Valley University', 'Crown Valley', 'Monarchs', 'CVU', 'CA', '#4c1d95', '#fde047', false],
      ['Summit Lakes University', 'Summit Lakes', 'Elk', 'SLU', 'CO', '#064e3b', '#e5e7eb', true], ['Bluewater University', 'Bluewater', 'Marlins', 'BWU', 'FL', '#075985', '#f97316', true],
      ['Northgate State University', 'Northgate State', 'Wolves', 'NSU', 'OH', '#991b1b', '#f8fafc', true], ['Stormhaven University', 'Stormhaven', 'Thunder', 'SHU', 'NC', '#1e3a8a', '#93c5fd', false],
      ['Kingsbridge University', 'Kingsbridge', 'Lions', 'KBU', 'VA', '#78350f', '#facc15', false], ['Silverpine University', 'Silverpine', 'Timberwolves', 'SPU', 'WA', '#334155', '#4ade80', true],
      ['Goldleaf University', 'Goldleaf', 'Owls', 'GLU', 'IN', '#3f6212', '#fcd34d', true]]],
   [2, [['Cobblestone University', 'Cobblestone', 'Foxes', 'CSU', 'PA', '#9f1239', '#fef3c7', false], ['Willowbrook State', 'Willowbrook State', 'Kestrels', 'WBS', 'IL', '#0f766e', '#fde68a', true],
      ['Thistledown University', 'Thistledown', 'Ravens', 'TDU', 'OR', '#581c87', '#a3e635', false], ['Granitecrest University', 'Granitecrest', 'Mountaineers', 'GCU', 'NH', '#374151', '#f59e0b', true],
      ['Sunfield State', 'Sunfield State', 'Sunbirds', 'SFS', 'KS', '#ca8a04', '#1e3a8a', true], ['Kettle River University', 'Kettle River', 'Otters', 'KRU', 'WI', '#1d4ed8', '#fbbf24', true],
      ['Cedar Hollow University', 'Cedar Hollow', 'Hounds', 'CHU', 'TN', '#166534', '#f97316', false], ['Starfield University', 'Starfield', 'Comets', 'SFU', 'GA', '#111827', '#38bdf8', false],
      ['Bramblewood State', 'Bramblewood State', 'Hedgehogs', 'BWS', 'MO', '#6b21a8', '#fca5a5', true]]],
   [3, [['Larkspur University', 'Larkspur', 'Larks', 'LKU', 'KY', '#1e40af', '#c4b5fd', false], ['Flintlock State', 'Flintlock State', 'Minutemen', 'FLS', 'VA', '#7f1d1d', '#d6d3d1', true],
      ['Quarry Ridge University', 'Quarry Ridge', 'Stonecutters', 'QRU', 'VT', '#57534e', '#22c55e', false], ['Windmill State', 'Windmill State', 'Whirlwinds', 'WMS', 'OK', '#b45309', '#e0f2fe', true],
      ['Juniper Gap University', 'Juniper Gap', 'Coyotes', 'JGU', 'UT', '#365314', '#fdba74', true], ['Tumbleweed State', 'Tumbleweed State', 'Drifters', 'TWS', 'NV', '#a16207', '#0f172a', true],
      ['Lantern Bay University', 'Lantern Bay', 'Pelicans', 'LBU', 'SC', '#0e7490', '#fef08a', false], ['Maplecroft University', 'Maplecroft', 'Grey Owls', 'MCU', 'CT', '#9a3412', '#cbd5e1', false],
      ['Bellwether University', 'Bellwether', 'Rams', 'BLU', 'OH', '#312e81', '#fbbf24', true]]],
   [4, [['Pebble Creek College', 'Pebble Creek', 'Trout', 'PCC', 'ID', '#0369a1', '#bbf7d0', true], ['Sawmill State', 'Sawmill State', 'Lumberjacks', 'SMS', 'MT', '#854d0e', '#e5e7eb', true],
      ['Bluebonnet College', 'Bluebonnet', 'Armadillos', 'BBC', 'TX', '#4338ca', '#fde047', false], ['Gristmill College', 'Gristmill', 'Millers', 'GMC', 'IA', '#92400e', '#f8fafc', true],
      ['Shady Grove College', 'Shady Grove', 'Possums', 'SGC', 'MS', '#14532d', '#d9f99d', false], ['Sagebrush State', 'Sagebrush State', 'Wranglers', 'SBS', 'WY', '#713f12', '#93c5fd', true],
      ['Lighthouse Point College', 'Lighthouse Point', 'Keepers', 'LPC', 'DE', '#b91c1c', '#f8fafc', false], ['Orchard Hill College', 'Orchard Hill', 'Pippins', 'OHC', 'WA', '#15803d', '#fca5a5', true],
      ['Kiln Creek College', 'Kiln Creek', 'Potters', 'KCC', 'AL', '#7c2d12', '#67e8f9', true]]],
   // 1.04 (SCOPE_1.04 s1): T2 conferences have 10 teams and T1 12, so one more T2 and three more T1 colleges (original names)
   [2, [['Ridgeline State', 'Ridgeline State', 'Ridgerunners', 'RLS', 'CO', '#0f766e', '#fde68a', true]]],
   [1, [['Granite Peak University', 'Granite Peak', 'Summiteers', 'GPK', 'NH', '#334155', '#facc15', false], ['Cascade Falls University', 'Cascade Falls', 'Otters', 'CFU', 'OR', '#075985', '#f1f5f9', true],
      ['Prairie Wind University', 'Prairie Wind', 'Twisters', 'PWU', 'KS', '#6d28d9', '#fcd34d', true]]]
  ].forEach(([tier, list]) => list.forEach(([full, short, mascot, abbr, state, c1, c2, pub]) => C.COLLEGES.push({ id: C.COLLEGES.length, full, short, mascot, abbr, state, c1, c2, pub, tier })));
  // colleges at a tier (with neighbours if a tier ever runs short)
  C.collegesAt = (tier, skip = []) => { let out = C.COLLEGES.filter(c => c.tier === tier && !skip.includes(c.id)); for (let d = 1; out.length < 8 && d < 5; d++) out = out.concat(C.COLLEGES.filter(c => Math.abs(c.tier - tier) === d && !skip.includes(c.id) && !out.includes(c))); return out; };

  // ---- tiers (Q27): each caps building levels ----
  C.TIERS = [
    null,
    { n: 'Tier 1', name: 'FCSA Division I', cap: 30 },      // 1.04 (FEEDBACK 108): the five college tiers; 1.06 (QA-91): the Federated College Soccer Association
    { n: 'Tier 2', name: 'FCSA Division II', cap: 24 },
    { n: 'Tier 3', name: 'FCSA Division III', cap: 18 },
    { n: 'Tier 4', name: 'FCSA Division IV', cap: 12 },
    { n: 'Tier 5', name: 'FCSA Division V', cap: 6 }
  ];
  // 1.04 (FEEDBACK 108, 207, 212): conference size (matches = 2 x (size - 1)), the Campus HQ level needed to be promoted INTO a tier,
  // and each tier's cost to attend and funded scholarships (working values, 205/207)
  C.CONF_SIZE = { 5: 8, 4: 8, 3: 8, 2: 10, 1: 12 };
  // 1.05 (FEEDBACK 229): 8 regional conferences per tier; yours is your state's region. The National Championship is national.
  C.REGIONS = { Northeast: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY'], 'Mid-Atlantic': ['NJ', 'PA', 'DE', 'MD', 'VA', 'WV'], Southeast: ['NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'TN', 'KY'],
    'Great Lakes': ['OH', 'MI', 'IN', 'IL', 'WI'], 'Midwest Plains': ['MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'], 'South Central': ['TX', 'OK', 'AR', 'LA'], Mountain: ['MT', 'ID', 'WY', 'CO', 'UT', 'NV', 'AZ', 'NM'], Pacific: ['WA', 'OR', 'CA', 'AK', 'HI'] };
  C.regionOf = st => Object.keys(C.REGIONS).find(k => C.REGIONS[k].includes(st)) || 'Midwest Plains';
  // 1.05 (QA-55): every AI college has a fixed strength within its tier, spread evenly from -5 to +7 around the tier's starting level
  C.tierBase = t => C.ECON.tierRating[t] + 2;   // T5 42 (a new squad), T4 50, T3 57, T2 64, T1 71
  const hash = n => { let h = (n + 1) * 2654435761 >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; };
  const OFF = {}; C.collegeOffset = id => { if (OFF[id] != null) return OFF[id]; const c = C.COLLEGES[id]; if (!c || c.custom) return 0;
    const same = C.COLLEGES.filter(x => x.tier === c.tier && !x.custom).sort((a, b) => hash(a.id) - hash(b.id)), n = same.length;
    same.forEach((x, i) => OFF[x.id] = Math.round(-5 + 12 * i / Math.max(1, n - 1))); return OFF[id]; };
  C.collegeRating = (id, season) => { const c = C.COLLEGES[id]; return C.tierBase(c.tier) + C.collegeOffset(id) + ((hash(id * 31 + (season || 0)) % 3) - 1); };   // +/-1 each season
  C.TIER_GATE = { 4: 10, 3: 15, 2: 20, 1: 25 };
  C.TIER_COA = { 5: 30000, 4: 31500, 3: 33000, 2: 34500, 1: 36000 };
  C.TIER_FUNDED = { 5: 6, 4: 8, 3: 10, 2: 12, 1: 14 };

  // ---- buildings (Q25c, Q27): owner 'program' moves with the coach, 'school' stays ----
  const pct = v => (Math.round(v * 10) / 10) + '%';
  const seats = l => { const S = C.ECON.seats; return Math.round(S.base + S.perLv * l + S.perLv2 * l * l); };
  C.prod = {
    booster: l => { const P = C.ECON.prod; return l ? Math.round(P.clubBase + P.clubPerLv * l * Math.pow(P.clubGrowth, l)) : 0; }, // Booster $ per hour (Clubhouse fundraising)
    lab: l => C.ECON.prod.labBase + C.ECON.prod.labPerLv * l                                        // Coaching Points per hour
  };
  // Media Center (9p, FEEDBACK 67): exposure, not hourly income. Broadcast money after each home match, more for a win and at higher tiers,
  // and extra Reputation from every win.
  C.broadcastPay = (l, win, tier) => { const W = C.ECON.broadcast; return l ? Math.round((W.base + W.perLv * l) * (win ? W.winMult : 1) * (1 + (5 - tier) * W.perTierUp) / 10) * 10 : 0; };
  C.mediaRep = l => Math.min(30, l);   // % extra Reputation from wins
  C.WIN_REP = .5;                      // Reputation for a league or cup win, before the Media Center bonus
  // Transport and Nutrition (9p, FEEDBACK 69; numbers to tune)
  C.travelCut = l => Math.min(75, 2.5 * l);   // % of the home side's advantage removed on away days
  C.physGrowth = l => 2 * l;                   // % faster Pace and Physical growth from matches
  C.nutMorale = l => l * .05;                  // morale after each match
  C.STORE_HOURS = l => C.ECON.prod.storeBase + l * C.ECON.prod.storePerLv;   // 1.03 (B5): 8 h + 0.2 h a level

  C.BUILDINGS = {
    hq: { name: "Coaches' Office", icon: '🏛', owner: 'program', start: 0, mult: 1.6,
      desc: 'Your headquarters. Its level caps every other building and unlocks slots. It earns nothing itself.',
      stats: l => [['🧱', 'Building cap', 'Lv ' + l], ['🧢', 'Staff slots', l >= 5 ? '+1 earned' : 'Lv 5: +1']] },
    stadium: { name: 'Stadium', icon: '🏟', owner: 'school', start: 0, mult: 1.3,
      desc: 'Seats, gate income and home advantage. Bigger crowds, louder atmosphere.',
      stats: l => [['seat', 'Seats', seats(l).toLocaleString()], ['💵', 'Gate income / home game', C.money(seats(l) * 3)], ['📣', 'Home advantage', pct(1 + .2 * l)]] },
    training: { name: 'Training Ground', icon: '⚽', owner: 'program', start: 0, mult: 1.2,
      desc: 'How fast training plans run, and a second training slot at Lv 10.',   // 1.03.01 (QA-27): +1.5% a level, code and card
      stats: l => [['🏋️', 'Training plan speed', '+' + pct(1.5 * l)], ['➕', 'Training slots', l >= 10 ? '+1 earned' : 'Lv 10: +1']] },
    gym: { name: 'Gym', icon: '🏋️', owner: 'program', start: 0, mult: 1.1,
      desc: 'Strength and conditioning: faster energy recovery and fewer injuries.',
      stats: l => [['🔋', 'Freshness recovery', '+' + pct(1.5 * l)], ['🩹', 'Injury chance', '−' + pct(l)]] },
    med: { name: 'Sports Medicine', icon: '🩺', owner: 'program', start: 0, mult: 1.1,
      desc: 'Faster recovery from injuries, and free recovery items each day.',
      stats: l => [['⏱', 'Injury recovery', '+' + pct(3 * l)], ['💊', 'Recovery items / day', 1 + Math.floor(l / 5)]] },
    lab: { name: 'Performance Lab', icon: '🔬', owner: 'program', start: 0, mult: 1.15,
      desc: 'Sports science and data. Produces Coaching Points for your Playbook.',
      stats: l => [['<i class="cpi"></i>', 'Coaching Points / hour', C.prod.lab(l)], ['🔬', 'Research speed', '+' + pct(l)]] },
    recruit: { name: 'Recruiting Office', icon: '✉️', owner: 'program', start: 0, mult: 1.15,
      desc: 'More applications, sharper scouting and more campus jobs to offer recruits.',
      stats: l => [['📨', 'Applications / day', 3 + l], ['🔍', 'Rating range', '±' + Math.max(1, 4 - Math.floor(l / 3))], ['💼', 'Campus jobs / season', 2 + Math.floor(l / 3)]] },
    video: { name: 'Analysis Suite', icon: '🎞', owner: 'program', start: 0, mult: 1.15,
      desc: "Coaches' film and opponent analysis. Opponent reports arrive in a later update.",   // 1.03: listed effects weren't applied; the card shows only the truth
      stats: l => [['📄', 'Opponent reports', 'Coming in a later update']] },
    media: { name: 'Media Center', icon: '📡', owner: 'school', start: 0, mult: 1.1,
      desc: 'Broadcasts and streams your matches, and gets the program noticed. Earns money after every home match and adds Reputation for every win.',
      stats: l => [['📺', 'Broadcast money / home match', C.money(C.broadcastPay(l, false, C.car ? (C.car() || {}).tier || 5 : 5))], ['🏆', 'After a win', '×1.5'], ['⭐', 'Reputation from wins', '+' + pct(C.mediaRep(l))]] },
    dorms: { name: 'Dorms', icon: '🏠', owner: 'school', start: 0, mult: 1.1,
      desc: 'Campus life: bigger roster and more appeal to recruits.',
      stats: l => [['👕', 'Roster size', Math.min(28, 24 + Math.ceil(l / 3))], ['💛', 'Recruit appeal', '+' + pct(l)]] },
    academic: { name: 'Academic Center', icon: '📚', owner: 'school', start: 0, mult: 1.2,
      desc: "Every player's package, grades and wellbeing in one place. Support here keeps players happy and impresses recruits.",
      stats: l => [['📚', 'Academic aid', '+' + pct(l)], ['😀', 'Morale after each match', '+' + (l * .1).toFixed(1)], ['🚪', 'Transfer portal risk', '−' + pct(Math.min(30, l * 1.5))], ['💛', 'Recruit interest', '+' + l]] },
    kitroom: { name: 'Kit Room', icon: '🎒', owner: 'program', start: 0, mult: 1.1,
      desc: 'Where your gear lives. New pieces are delivered here, and its level sets how far gear can be upgraded.',
      stats: l => [['📦', 'New gear', l ? 'Every ' + Math.max(8, 26 - l * 2) + 'h' : '—'], ['⬆', 'Gear upgrade limit', 'Lv ' + (2 + l * 2)], ['✨', 'Better gear chance', '+' + pct(Math.min(15, l))]] },
    booster: { name: 'Clubhouse', icon: '🥂', owner: 'school', start: 0, mult: 1.0,
      desc: 'Where players relax and supporters meet. Fundraisers here bring in Booster $ every hour.',
      stats: l => [['💵', 'Booster $ / hour', C.money(C.prod.booster(l))], ['📦', 'Storage', C.STORE_HOURS(l).toFixed(1) + 'h']] },
    transport: { name: 'Transport', icon: '🚌', owner: 'school', start: 0, mult: 1.1,
      desc: 'Team buses and travel planning. Players arrive fresher for away games, so the home side has less of an edge.',
      stats: l => [['🚌', "Home side's edge on away days", '−' + pct(C.travelCut(l))]] },
    nutrition: { name: 'Nutrition', icon: '🥗', owner: 'program', start: 0, mult: 1.1,
      desc: 'Team meals and a fueling station. Players grow stronger and faster, and feel better after matches.',
      stats: l => [['💪', 'Pace and Physical growth', '+' + pct(C.physGrowth(l))], ['😀', 'Morale after each match', '+' + C.nutMorale(l).toFixed(2)]] },
    skills: { name: 'Skills Field', icon: '🎯', owner: 'school', start: 0, mult: 1.0,
      desc: 'Home of the skills mini-games (coming later): more free tries each day.',
      stats: l => [['🎯', 'Free mini-game tries / day', 3 + Math.floor(l / 3)]] }
  };

  // Unlocks (9q, FEEDBACK 84): a new career starts with blank plots; the Coaches' Office is built first, then 7 more.
  // These appear as the Coaches' Office grows. Before that their plot is blank ground with nothing on the map.
  Object.entries({ booster: 2, kitroom: 2, video: 3, academic: 3, gym: 4, skills: 4, transport: 5, nutrition: 10 }).forEach(([k, l]) => C.BUILDINGS[k].needHQ = l);
  // Building types for the builders drawer and the full list (FEEDBACK 87)
  C.BTYPE = { hq: 'economy', booster: 'economy', media: 'economy', lab: 'economy', recruit: 'economy', transport: 'economy', academic: 'economy',
    stadium: 'soccer', training: 'soccer', gym: 'soccer', med: 'soccer', video: 'soccer', nutrition: 'soccer', kitroom: 'soccer', dorms: 'soccer', skills: 'soccer' };
  C.BJOB = { hq: 'Leads the campus: no building goes above it', stadium: 'Seats, gate money and home advantage', training: 'Training plan speed and a training slot',
    gym: 'Freshness recovery, fewer injuries', med: 'Faster injury recovery', lab: 'Makes Coaching Points', recruit: 'Applications and scouting',
    video: 'Opponent reports (coming later)', media: 'Broadcast money and Reputation', dorms: 'Roster size and recruit appeal',
    academic: 'Academic aid and player wellbeing', kitroom: 'Gear deliveries and upgrades', booster: 'Fundraising: Booster $ every hour',
    transport: 'Fresher legs on away days', nutrition: 'Faster physical growth', skills: 'Skills mini-games (coming later)' };

  // Cost to reach level `to` (Booster $, Coaching Points) and build time in seconds.
  C.costOf = (key, to) => { const m = C.BUILDINGS[key].mult; if (to <= 1) return { cash: 0, cp: 0 };   // first build is free (FEEDBACK 85)
    const B = C.ECON.build; return { cash: Math.round(B.base * m * Math.pow(B.growth, to - 1) / B.round) * B.round, cp: 0 }; };  // buildings cost Booster $ only (Coaching Points are for the Playbook)
  // 1.03 (PROVISIONAL): the Coaches' Office timer table; other buildings scale by multiplier / 1.6. First build: a few seconds.
  C.timeOf = (key, to) => { const B = C.ECON.build, T = B.hqSecs; if (to <= 1) return B.firstBuildSecs;
    const base = to < T.length ? T[to] : T[T.length - 1] * Math.pow(T[T.length - 1] / T[T.length - 2], to - T.length + 1);
    return Math.round(base * C.BUILDINGS[key].mult / 1.6); };

  // Painted art (9p): one render per band of levels. Renders 8 to 10 are for later levels.
  C.renderOf = l => l >= 50 ? 10 : l >= 45 ? 9 : l >= 40 ? 8 : l >= 30 ? 7 : Math.max(1, Math.min(6, Math.floor(l / 5) + 1));
  C.featureAt = (key, l) => l === 30 ? 'New look: gold finish' : C.renderOf(l) !== C.renderOf(l - 1) ? 'New look: a bigger building' : '';

  // Build queue slots. 1.03 (FEEDBACK 212): 4 in all, 1 free + 3 permanent paid, bought in order (Builder Packs I-III).
  // No earned (Coaches' Office Lv 10) or Coach's Club build slot any more.
  C.SLOTS = [
    { id: 'free', name: 'Free builder' },
    { id: 'bq1', name: '2nd builder', why: 'Builder Pack I', pack: 'bp1' },
    { id: 'bq2', name: '3rd builder', why: 'Builder Pack II', pack: 'bp2' },
    { id: 'bq3', name: '4th builder', why: 'Builder Pack III', pack: 'bp3' }
  ];

  // Campus plot layout: s = row down the screen, d = column (honeycomb)
  C.PLOTS = [
    { s: 0, d: -2, k: 'trees' }, { s: 0, d: 0, k: 'water' }, { s: 0, d: 2, k: 'trees' },
    { s: 1, d: -1, b: 'lab' }, { s: 1, d: 1, b: 'med' },
    { s: 2, d: -2, b: 'recruit' }, { s: 2, d: 0, b: 'hq' }, { s: 2, d: 2, b: 'skills' },
    { s: 3, d: -1, b: 'dorms' }, { s: 3, d: 1, b: 'training' },
    { s: 4, d: -2, b: 'gym' }, { s: 4, d: 0, b: 'stadium', span: 1 }, { s: 4, d: 2, b: 'video' },
    { s: 6, d: -2, b: 'booster' }, { s: 6, d: 2, b: 'academic' },
    { s: 7, d: -1, b: 'media' }, { s: 7, d: 1, k: 'lake' },
    { s: 8, d: -2, b: 'transport' }, { s: 8, d: 0, k: 'land', tier: 4 }, { s: 8, d: 2, b: 'kitroom' },
    { s: 9, d: -1, k: 'trees' }, { s: 9, d: 1, b: 'nutrition' },
    { s: 10, d: -2, k: 'trees' }, { s: 10, d: 0, k: 'land', tier: 3 }, { s: 10, d: 2, k: 'trees' }
  ];
})(window.CFC);
