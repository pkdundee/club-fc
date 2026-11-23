// CLUB FC 1.01: economy values in one place (FEEDBACK 125, SCOPE_1.01 item 13).
// CLUB FC 1.03 (FEEDBACK 217-219): provisional working values from Model v1/v2 are marked 'PROVISIONAL 1.03'; storage is approved (B5).
// Every value here is the phase-9t / 1.00 value, unchanged. The modules read them from C.ECON; the regression runner proves
// the formulas give the same results as 1.00. Change a value here only as part of an approved economy change.
window.CFC.ECON = {
  build: { base: 1200, growth: 1.33, round: 50, timeBase: 40, timeGrowth: 1.38, firstBuildSecs: 3,   // cost = base*mult*growth^(to-1) (unchanged)
    // PROVISIONAL 1.03 (ECONOMY_BALANCE_V1 s1.2): Coaches' Office time to reach each level, in seconds (index = level).
    // Lv 2-10 as 9t/Option A; 0.4 x Option A from Lv 15 (ramp from Lv 10); flatter Lv 26-30. Other buildings: x their multiplier / 1.6.
    hqSecs: [0, 3, 122, 168, 232, 600, 1200, 2400, 4500, 8100, 12600, 15534, 19152, 21942, 25138, 28800, 40103, 55843, 77760, 103680,
      138240, 176222, 224640, 283029, 356594, 449280, 518656, 598744, 691200, 772785, 864000] },
  finish: { freeSecs: 120, perMinute: 1, firstHourMins: 60, afterHourMinsPerCoin: 2,                   // 9t: 1 a minute for the first hour, then 1 per 2 minutes (no longer used)
    // PROVISIONAL 1.03 (P7, ECONOMY_TIMERS_V0 s4): Coins a minute 1.6 up to 5 m, then log-interpolated through the verified
    // Last War points (minutes: Coins), 1.0 a minute from 8 h; never below minCoins.
    points: { 5: 8, 60: 72, 180: 192, 480: 480 }, shortRate: 1.6, longRate: 1.0, minCoins: 2 },
  prod: { clubBase: 150, clubPerLv: 100, clubGrowth: 1.06, labBase: 4, labPerLv: 2,                    // Clubhouse Booster $/h; Performance Lab CP/h (unchanged)
    storeBase: 8, storePerLv: 0.2,   // APPROVED 1.03 (B5, FEEDBACK 218): storage 8 h + 0.2 h a level (9t: 6 h + 0.2 h)
    bubbleMins: 30 },                // 1.03 (FEEDBACK 208): the map bubble appears at 30 minutes of production; collecting works from 1 unit
  seats: { base: 200, perLv: 50, perLv2: 5 },                                                            // Stadium seats
  broadcast: { base: 300, perLv: 120, winMult: 1.5, perTierUp: 0.25 },                                   // per home match
  research: { cpBase: 8, cpGrowth: 1.32, cpTierStep: 4, cashBase: 1500, cashGrowth: 1.3, cashTierStep: 3, cashT0Base: 600, cashT0FromLv: 5, timeBase: 60, timeGrowth: 2.0, timeTierStep: 3, timeCap: 259200, cpMult: 4.5 },   // PROVISIONAL 1.03 (P5): 9t growth 1.55, cap 1 day, CP x1
  seasonBudget: { 5: 8000, 4: 20000, 3: 45000, 2: 90000, 1: 160000 },                                    // Booster $ each new season, by 9t tier
  tierRating: { 5: 40, 4: 48, 3: 55, 2: 62, 1: 69 },                                                      // recruit and opponent quality, by 9t tier
  training: { speedPerLv: 0.015 },   // 1.03.01 (QA-27): Training Ground +1.5% plan speed a level (9t: 3%)
  recruit: { jobValue: 4000, houseValue: 2500, scoutCP: 10, agencyCoins: 60, portalDays: 3 },
  treat: { spec: 40, rush: 20, kit: 15, team: 30 }                                                        // Coins
};
