// CLUB FC 1.01: economy values in one place (FEEDBACK 125, SCOPE_1.01 item 13).
// CLUB FC 1.03 (FEEDBACK 217-219): provisional working values from Model v1/v2 are marked 'PROVISIONAL 1.03'; storage is approved (B5).
// Every value here is the phase-9t / 1.00 value, unchanged. The modules read them from C.ECON; the regression runner proves
// the formulas give the same results as 1.00. Change a value here only as part of an approved economy change.
window.CFC.ECON = {
  build: { base: 1200, growth: 1.33, round: 50, timeBase: 40, timeGrowth: 1.38, firstBuildSecs: 3,   // cost = base*mult*growth^(to-1) x costMult
    costMult: 0.1,   // 1.11 Foundation (A-4, PROVISIONAL): 0.1 x the 1.10 cost, Lv 1-30 (V3.2 cost_x). 1 = the 1.10 cost
    // PROVISIONAL 1.03 (ECONOMY_BALANCE_V1 s1.2): Coaches' Office time to reach each level, in seconds (index = level).
    // Lv 2-10 as 9t/Option A; 0.4 x Option A from Lv 15 (ramp from Lv 10); flatter Lv 26-30. Other buildings: x their multiplier / 1.6.
    // 1.11 Foundation (FEEDBACK 248, A-4; PROVISIONAL, for gameplay testing): the Phase 4 V3.2 campus timers, from econ5.py
    // (V2 anchors, x2.8 above Lv 10). The 1.10 table was: 0, 3, 122, 168, 232, 600, 1200, 2400, 4500, 8100, 12600, 15534, 19152, 21942, 25138, 28800,
    // 40103, 55843, 77760, 103680, 138240, 176222, 224640, 283029, 356594, 449280, 518656, 598744, 691200, 772785, 864000
    // 1.12 (FEEDBACK 258): Last War HQ timers, Lv 1-30 (lastwarvault; cpt-hedge agrees within 40 minutes at Lv 30). Chain 395 days. 1.11 table: 0, 3, 108, 180, 216, 612, ...
    hqSecs: [0, 3, 3, 47, 60, 660, 2100, 5580, 11220, 15720, 20400, 26520, 34500, 44880, 58380, 81720, 111600, 158400, 223200, 313200, 439200, 568800, 741600, 964800, 1350000, 1890000, 2649600, 3708000, 5191200, 6750000, 8774400] },
  finish: { freeSecs: 120, perMinute: 1, firstHourMins: 60, afterHourMinsPerCoin: 2,                   // 9t: 1 a minute for the first hour, then 1 per 2 minutes (no longer used)
    // PROVISIONAL 1.03 (P7, ECONOMY_TIMERS_V0 s4): Coins a minute 1.6 up to 5 m, then log-interpolated through the verified
    // Last War points (minutes: Coins), 1.0 a minute from 8 h; never below minCoins.
    points: { 5: 8, 60: 72, 180: 192, 480: 480 }, shortRate: 1.6, longRate: 1.0, minCoins: 2 },
  prod: { clubBase: 150, clubPerLv: 100, clubGrowth: 1.06, labBase: 4, labPerLv: 2,
    clubMult: 1.5,   // 1.11 Foundation (A-4, PROVISIONAL): Clubhouse output x1.5 (V3.2 club_x). 1 = the 1.10 output                    // Clubhouse Booster $/h; Performance Lab CP/h (unchanged)
    storeBase: 8, storePerLv: 0.2,   // APPROVED 1.03 (B5, FEEDBACK 218): storage 8 h + 0.2 h a level (9t: 6 h + 0.2 h)
    bubbleMins: 30 },                // 1.03 (FEEDBACK 208): the map bubble appears at 30 minutes of production; collecting works from 1 unit
  seats: { base: 200, perLv: 50, perLv2: 5 },                                                            // Stadium seats
  broadcast: { base: 300, perLv: 120, winMult: 1.5, perTierUp: 0.25 },                                   // per home match
  research: { cpBase: 8, cpGrowth: 1.32, cpTierStep: 4, cashBase: 1500, cashGrowth: 1.3, cashTierStep: 3, cashT0Base: 600, cashT0FromLv: 5, timeBase: 60, timeGrowth: 2.0, timeTierStep: 3, timeCap: 259200, cpMult: 4.5 },   // PROVISIONAL 1.03 (P5): 9t growth 1.55, cap 1 day, CP x1
  seasonBudget: { 5: 8000, 4: 20000, 3: 45000, 2: 90000, 1: 160000 },                                    // Booster $ each new season, by 9t tier
  tierRating: { 5: 40, 4: 48, 3: 55, 2: 62, 1: 69 },                                                      // recruit and opponent quality, by 9t tier
  // 1.12 (FEEDBACK 258): Helpers (was Staff Help). One Helper a Dorms level (max 30); each takes 1% of the time left, at least 15 s,
  // applied once per job as the students arrive (helpers.js). Construction and research. (1.11 values: base 5, perDorms 0.5, minSecs 60.)
  // 1.11 Foundation (B-1, Phase 4 V2/V3): Staff Help. Every construction and research job gets base + Dorms level x perDorms helps (max),
  // each cutting pct of the time left, at least minSecs. Applied when the job starts. on: false turns it off.
  staffHelp: { on: true, base: 0, perDorms: 1, max: 30, pct: 0.01, minSecs: 15, delayMs: 1200, walkMs: 2400, gapMs: 280, perWalker: 3 },
  training: { speedPerLv: 0.015,     // 1.03.01 (QA-27): Training Ground +1.5% plan speed a level (9t: 3%)
    costMult: 0 },                    // 1.11 (QA-182, FEEDBACK 212): training plans cost time only. 1 would bring back the 1.10 Booster $ cost
  // 1.11 Foundation (B-2, PROVISIONAL): football Booster $ costs scale with the FCSA division (Tier 5 = Division V ... Tier 1 = Division I).
  // Applies to ID Camps, NIL, coach hires and licences. All 1 = the 1.10 prices. (The game has five tiers: FEEDBACK 108.)
  footballCost: { 5: 1, 4: 1.5, 3: 2, 2: 2.5, 1: 3 },
  recruit: { jobValue: 4000, houseValue: 2500, scoutCP: 10, agencyCoins: 60, portalDays: 3 },
  treat: { spec: 40, rush: 20, kit: 15, team: 30 }                                                        // Coins
};

// 1.11 Foundation (B-4, FEEDBACK 248): variants. A variant is a set of overrides on C.ECON (and later, feature switches), played on its OWN save
// (save key + '__' + id), so nothing earned in one variant reaches another, and the foundation save is never touched. Every variant starts
// from the same shared start point (Settings → Test scenarios → Variants). 1.11 has no design variants: only a no-change Sandbox for checking the switch.
(function (C) {
  C.VARIANTS = {
    foundation: { name: 'Foundation', desc: 'The 1.11 Foundation build as approved', econ: {} },
    sandbox: { name: 'Sandbox (no changes)', desc: 'Identical to the foundation, on its own save: for checking that variants stay separate', econ: {} }
  };
  let id = 'foundation'; try { id = localStorage.getItem('clubfc_v112_variant') || 'foundation'; } catch (e) { }
  if (!C.VARIANTS[id]) id = 'foundation';
  C.VARIANT = id;
  const merge = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') merge(a[k], b[k]); else a[k] = b[k]; } return a; };
  merge(C.ECON, C.VARIANTS[id].econ || {});
})(window.CFC);

