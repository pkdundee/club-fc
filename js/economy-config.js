// CLUB FC 1.01: economy values in one place (FEEDBACK 125, SCOPE_1.01 item 13).
// Every value here is the phase-9t / 1.00 value, unchanged. The modules read them from C.ECON; the regression runner proves
// the formulas give the same results as 1.00. Change a value here only as part of an approved economy change.
window.CFC.ECON = {
  build: { base: 1200, growth: 1.33, round: 50, timeBase: 40, timeGrowth: 1.38, firstBuildSecs: 3 },   // cost = base*mult*growth^(to-1); time = timeBase*timeGrowth^to*mult
  finish: { freeSecs: 120, perMinute: 1, firstHourMins: 60, afterHourMinsPerCoin: 2 },                  // Coins to finish: 1 a minute for the first hour, then 1 per 2 minutes
  prod: { clubBase: 150, clubPerLv: 100, clubGrowth: 1.06, labBase: 4, labPerLv: 2 },                   // Clubhouse Booster $/h; Performance Lab CP/h
  seats: { base: 200, perLv: 50, perLv2: 5 },                                                            // Stadium seats
  broadcast: { base: 300, perLv: 120, winMult: 1.5, perTierUp: 0.25 },                                   // per home match
  research: { cpBase: 8, cpGrowth: 1.32, cpTierStep: 4, cashBase: 1500, cashGrowth: 1.3, cashTierStep: 3, cashT0Base: 600, cashT0FromLv: 5, timeBase: 60, timeGrowth: 1.55, timeTierStep: 3, timeCap: 86400 },
  seasonBudget: { 5: 8000, 4: 20000, 3: 45000, 2: 90000, 1: 160000 },                                    // Booster $ each new season, by 9t tier
  tierRating: { 5: 40, 4: 48, 3: 55, 2: 62, 1: 69 },                                                      // recruit and opponent quality, by 9t tier
  recruit: { jobValue: 4000, houseValue: 2500, scoutCP: 10, agencyCoins: 60, portalDays: 3 },
  treat: { spec: 40, rush: 20, kit: 15, team: 30 }                                                        // Coins
};
