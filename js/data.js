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
  ].map(([full, short, mascot, abbr, state, c1, c2, pub], id) => ({ id, full, short, mascot, abbr, state, c1, c2, pub }));

  // ---- tiers (Q27): each caps building levels ----
  C.TIERS = [
    null,
    { n: 'Tier 1', name: 'Power conference', cap: 30 },
    { n: 'Tier 2', name: 'Division I mid-major', cap: 24 },
    { n: 'Tier 3', name: 'Division I low-major', cap: 18 },
    { n: 'Tier 4', name: 'Division II', cap: 12 },
    { n: 'Tier 5', name: 'Small college', cap: 6 }
  ];

  // ---- buildings (Q25c, Q27): owner 'program' moves with the coach, 'school' stays ----
  const pct = v => (Math.round(v * 10) / 10) + '%';
  const seats = l => Math.round(200 + 50 * l + 5 * l * l);
  C.prod = {
    media: l => l ? 200 + 80 * l : 0,                          // Booster $ per hour (match video and streaming)
    booster: l => l ? Math.round(150 + 100 * l * Math.pow(1.06, l)) : 0, // Booster $ per hour (donations)
    film: l => 4 + 2 * l                                       // Coaching Points per hour
  };
  C.STORE_HOURS = l => 6 + l * .2;

  C.BUILDINGS = {
    hq: { name: "Coaches' Office", icon: '🏛', owner: 'program', start: 1, mult: 1.6,
      desc: 'Your headquarters. Its level caps every other building and unlocks slots. It earns nothing itself.',
      stats: l => [['🧱', 'Building cap', 'Lv ' + l], ['🔨', 'Build slots', l >= 10 ? '+1 earned' : 'Lv 10: +1'], ['🧢', 'Staff slots', l >= 8 ? '+1 earned' : 'Lv 8: +1']] },
    stadium: { name: 'Stadium', icon: '🏟', owner: 'school', start: 1, mult: 1.3,
      desc: 'Seats, gate income and home advantage. Bigger crowds, louder atmosphere.',
      stats: l => [['seat', 'Seats', seats(l).toLocaleString()], ['💵', 'Gate income / home game', C.money(seats(l) * 3)], ['📣', 'Home advantage', pct(1 + .2 * l)]] },
    training: { name: 'Training Ground', icon: '⚽', owner: 'program', start: 1, mult: 1.2,
      desc: 'Team training quality and how fast players develop.',
      stats: l => [['📈', 'Team training', '+' + pct(2 * l)], ['🏋️', 'Development speed', '+' + pct(1.5 * l)]] },
    gym: { name: 'Gym', icon: '🏋️', owner: 'program', start: 0, mult: 1.1,
      desc: 'Strength and conditioning: faster energy recovery and fewer injuries.',
      stats: l => [['🔋', 'Freshness recovery', '+' + pct(1.5 * l)], ['🩹', 'Injury chance', '−' + pct(l)]] },
    med: { name: 'Sports Medicine', icon: '🩺', owner: 'program', start: 1, mult: 1.1,
      desc: 'Faster recovery from injuries, and free recovery items each day.',
      stats: l => [['⏱', 'Injury recovery', '+' + pct(3 * l)], ['💊', 'Recovery items / day', 1 + Math.floor(l / 5)]] },
    film: { name: 'Performance Lab', icon: '🔬', owner: 'program', start: 1, mult: 1.15,
      desc: 'Sports science and data. Produces Coaching Points for your Playbook.',
      stats: l => [['<i class="cpi"></i>', 'Coaching Points / hour', C.prod.film(l)], ['🔬', 'Research speed', '+' + pct(l)]] },
    recruit: { name: 'Recruiting Office', icon: '✉️', owner: 'program', start: 1, mult: 1.15,
      desc: 'More applications, sharper scouting and more campus jobs to offer recruits.',
      stats: l => [['📨', 'Applications / day', 3 + l], ['🔍', 'Rating range', '±' + Math.max(1, 4 - Math.floor(l / 3))], ['💼', 'Campus jobs / season', 2 + Math.floor(l / 3)]] },
    video: { name: 'Video Room', icon: '🎞', owner: 'program', start: 0, mult: 1.15, needHQ: 3,
      desc: 'Game film: opponent reports before matches, sharper scouting and highlight reels for recruits.',
      stats: l => [['📄', 'Opponent report', l >= 5 ? 'Full (shape, key players)' : l ? 'Basic (shape)' : '—'], ['🎯', 'Match familiarity', '+' + pct(.5 * l)], ['💛', 'Recruit interest', '+' + Math.round(1.5 * l)]] },
    media: { name: 'Media Centre', icon: '📡', owner: 'school', start: 1, mult: 1.1,
      desc: 'Sells match video and streaming subscriptions to fans and families. Earns Booster $ every hour.',
      stats: l => [['💵', 'Booster $ / hour', C.money(C.prod.media(l))], ['📦', 'Storage', C.STORE_HOURS(l).toFixed(1) + 'h']] },
    dorms: { name: 'Dorms', icon: '🏠', owner: 'school', start: 1, mult: 1.1,
      desc: 'Campus life: bigger roster and more appeal to recruits.',
      stats: l => [['👕', 'Roster size', Math.min(28, 24 + Math.ceil(l / 3))], ['💛', 'Recruit appeal', '+' + pct(l)]] },
    academic: { name: 'Academic Center', icon: '📚', owner: 'school', start: 0, mult: 1.2, needHQ: 8,
      desc: 'Study support: eligibility safety and more academic-aid recruits.',
      stats: l => [['✅', 'Eligibility safety', '+' + pct(2 * l)], ['📚', 'Academic-aid recruits', '+' + l]] },
    booster: { name: 'Booster Club', icon: '💵', owner: 'school', start: 0, mult: 1.0,
      desc: 'Local supporters. Produces Booster $ every hour.',
      stats: l => [['💵', 'Booster $ / hour', C.money(C.prod.booster(l))], ['📦', 'Storage', C.STORE_HOURS(l).toFixed(1) + 'h']] },
    skills: { name: 'Skills Field', icon: '🎯', owner: 'school', start: 1, mult: 1.0,
      desc: 'Home of the skills mini-games (coming later): more free tries each day.',
      stats: l => [['🎯', 'Free mini-game tries / day', 3 + Math.floor(l / 3)]] }
  };

  // Cost to reach level `to` (Booster $, Coaching Points) and build time in seconds.
  C.costOf = (key, to) => { const m = C.BUILDINGS[key].mult;
    return { cash: Math.round(1200 * m * Math.pow(1.33, to - 1) / 50) * 50, cp: 0 }; };  // buildings cost Booster $ only (Coaching Points are for the Playbook)
  C.timeOf = (key, to) => Math.round((to <= 1 ? 30 : 40 * Math.pow(1.38, to)) * C.BUILDINGS[key].mult);

  // What visibly changes at each level (matches the art rules in art-campus.js)
  C.featureAt = (key, l) => {
    if (l === 30) return 'Gold finish';
    if (key === 'stadium') return { 1: 'A small bleacher', 2: 'Team benches', 3: 'First floodlight', 4: 'Flagpole', 5: 'Scoreboard', 6: 'School-colour seats', 7: 'End stand', 9: 'Stand roof', 13: 'Running track', 20: 'End-stand roof' }[l]
      || (l % 3 === 0 ? 'Extra row of seats' : 'Longer stand, more fans');
    if (key === 'training') return { 1: 'Pitch and shed', 3: 'Second goal, floodlight' }[l] || (l % 3 === 0 ? 'Extra floodlight' : 'More cones and kit');
    if (key === 'skills') return l === 1 ? 'Practice field' : 'More drills';
    if (l > 1 && (l - 1) % 6 === 0) return 'New look: a bigger building';
    const l6 = (l - 1) % 6 + 1;
    if (key === 'hq') return { 1: 'Brick office', 2: 'Planter', 3: 'Columned entrance', 4: 'Planter', 5: 'Clock tower', 6: 'Bench' }[l6];
    return { 1: 'Built', 2: 'Planter', 3: 'Second planter', 4: 'Flag and banner', 5: 'Bench', 6: 'Lamp post' }[l6];
  };

  // Build queue slots (Q21c): 1 free, 2nd VIP, 3rd one-off purchase, 4th progression
  C.SLOTS = [
    { id: 'free', name: 'Free slot' },
    { id: 'vip', name: "Coach's Club slot", why: "Join the Coach's Club" },
    { id: 'iap', name: 'Extra slot', why: 'One-off purchase' },
    { id: 'prog', name: 'Earned slot', why: "Coaches' Office Lv 10" }
  ];

  // Campus plot layout: s = row down the screen, d = column (honeycomb)
  C.PLOTS = [
    { s: 0, d: -2, k: 'trees' }, { s: 0, d: 0, k: 'water' }, { s: 0, d: 2, k: 'trees' },
    { s: 1, d: -1, b: 'film' }, { s: 1, d: 1, b: 'med' },
    { s: 2, d: -2, b: 'recruit' }, { s: 2, d: 0, b: 'hq' }, { s: 2, d: 2, b: 'skills' },
    { s: 3, d: -1, b: 'dorms' }, { s: 3, d: 1, b: 'training' },
    { s: 4, d: -2, b: 'gym' }, { s: 4, d: 0, b: 'stadium', span: 1 }, { s: 4, d: 2, b: 'video' },
    { s: 6, d: -2, b: 'booster' }, { s: 6, d: 2, b: 'academic' },
    { s: 7, d: -1, b: 'media' }, { s: 7, d: 1, k: 'lake' },
    { s: 8, d: -2, k: 'land', tier: 4 }, { s: 8, d: 0, k: 'land', tier: 4 }, { s: 8, d: 2, k: 'trees' },
    { s: 9, d: -1, k: 'trees' }, { s: 9, d: 1, k: 'land', tier: 3 },
    { s: 10, d: -2, k: 'trees' }, { s: 10, d: 0, k: 'land', tier: 3 }, { s: 10, d: 2, k: 'trees' }
  ];
})(window.CFC);
