/* =========================================================
   ROSEMONT PARTNERS — core dataset

   Everything below is generated once from fixed seeds, so
   every page reads the same numbers and the tie-out rules
   in scripts/tieout.js hold to the dollar:

     household MV = sum of accounts = sum of positions = sum of lots
     firm AUM     = detailed households + the aggregate tail
     revenue      = the fee schedule applied to billable assets
     roll-forward = begin + flows + market - fees = end
     allocation   = 100% at every level

   Rosemont Partners, LLC is a fictional firm. Every
   household, person, holding and figure is synthetic.
   ========================================================= */

const RP = {
  name: "Rosemont Partners",
  legal: "Rosemont Partners, LLC",
  tagline: "Private wealth management for families and the institutions they build",
  est: 2004,
  crd: "148207 (demo)",
  registration: "SEC-registered investment adviser",
  standard: "Fee-only fiduciary. Employee-owned. Open architecture. Custody held away.",
  hq: "One Rosemont Plaza, Suite 2400, Chicago, IL 60606",
  phone: "(312) 555-0140",
  email: "clientservice@rosemontpartners.com",
  asOf: "2026-08-28",
  quarter: "Q3 2026",
  priorQuarterEnd: "2026-06-30",
  yearStart: "2026-01-01",

  offices: [
    { city: "Chicago, IL",   role: "Headquarters",     staff: 46, aum: 4180000000 },
    { city: "Greenwich, CT", role: "Northeast",        staff: 16, aum: 2140000000 },
    { city: "Denver, CO",    role: "Mountain West",    staff: 12, aum: 1180000000 },
    { city: "Naples, FL",    role: "Southeast",        staff: 10, aum:  910000000 },
  ],

  headcount: { total: 84, advisors: 19, investment: 11, service: 22, operations: 14, planning: 7, corporate: 6, leadership: 5 },

  /* Tiered on total household assets. The single source of every fee figure. */
  feeSchedule: [
    { from: 0,        upTo: 2000000,  rate: 0.0100, label: "First $2M" },
    { from: 2000000,  upTo: 5000000,  rate: 0.0085, label: "Next $3M" },
    { from: 5000000,  upTo: 10000000, rate: 0.0070, label: "Next $5M" },
    { from: 10000000, upTo: 25000000, rate: 0.0055, label: "Next $15M" },
    { from: 25000000, upTo: null,     rate: 0.0040, label: "Above $25M" },
  ],

  custodians: [
    { name: "Schwab Advisor Services", share: 0.58 },
    { name: "Fidelity Institutional",  share: 0.31 },
    { name: "Pershing",                share: 0.11 },
  ],

  serviceTiers: [
    { id: "Founders", minAssets: 25000000, meetings: 4, calls: "Unlimited", planning: "Full family office", reporting: "Monthly", team: "Partner + advisor + CSA" },
    { id: "Private",  minAssets: 5000000,  meetings: 3, calls: "Unlimited", planning: "Comprehensive",      reporting: "Quarterly", team: "Advisor + CSA" },
    { id: "Core",     minAssets: 1000000,  meetings: 2, calls: "As needed", planning: "Goals-based",        reporting: "Quarterly", team: "Advisor + shared CSA" },
    { id: "Institutional", minAssets: 5000000, meetings: 4, calls: "Unlimited", planning: "Spending policy & IPS", reporting: "Quarterly", team: "CIO + advisor" },
  ],

  /* The firm's stated targets, used by the growth and team pages. */
  targets: { nnaAnnual: 620000000, organicGrowth: 0.075, retention: 0.972, householdsPerAdvisor: 45 },
};

/* Total discretionary AUM the firm reports. Detailed households below
   plus an aggregate tail that carries the remaining relationships. */
const TARGET_AUM = 8400000000;
const TOTAL_HOUSEHOLDS = 612;
const ADVISORY_ONLY_AUA = 1900000000;

/* =========================================================
   MODEL PORTFOLIOS
   Targets across the twelve asset classes. Every column
   sums to 100 by construction, checked at load.
   ========================================================= */
const MODELS = [
  { id: "CP",  name: "Capital Preservation", risk: 1, min: 500000,
    t: { USLC: 12, USSC: 3,  INTLD: 6,  EM: 1, CORE: 34, MUNI: 22, CRED: 4, CASH: 10, HF: 5,  PE: 0,  PC: 3,  RE: 0 },
    desc: "For capital that is already spoken for. Preservation of purchasing power ahead of growth." },
  { id: "CON", name: "Conservative", risk: 2, min: 500000,
    t: { USLC: 18, USSC: 4,  INTLD: 9,  EM: 2, CORE: 28, MUNI: 18, CRED: 5, CASH: 5,  HF: 6,  PE: 0,  PC: 4,  RE: 1 },
    desc: "Income and stability with a modest growth engine. Typical of households drawing on the portfolio." },
  { id: "MOD", name: "Moderate", risk: 3, min: 1000000,
    t: { USLC: 24, USSC: 6,  INTLD: 12, EM: 3, CORE: 20, MUNI: 12, CRED: 5, CASH: 3,  HF: 7,  PE: 3,  PC: 4,  RE: 1 },
    desc: "The middle of the risk range. Balanced between funding today's spending and tomorrow's." },
  { id: "BAL", name: "Balanced", risk: 4, min: 1000000,
    t: { USLC: 28, USSC: 7,  INTLD: 14, EM: 4, CORE: 14, MUNI: 9,  CRED: 4, CASH: 2,  HF: 7,  PE: 5,  PC: 4,  RE: 2 },
    desc: "Our most widely used allocation. Growth-leaning with a real defensive sleeve." },
  { id: "GRO", name: "Growth", risk: 5, min: 2000000,
    t: { USLC: 33, USSC: 9,  INTLD: 16, EM: 5, CORE: 8,  MUNI: 5,  CRED: 3, CASH: 2,  HF: 6,  PE: 7,  PC: 4,  RE: 2 },
    desc: "For households with a long horizon and no near-term draw on the portfolio." },
  { id: "AGG", name: "Aggressive Growth", risk: 6, min: 2000000,
    t: { USLC: 38, USSC: 11, INTLD: 18, EM: 6, CORE: 3,  MUNI: 2,  CRED: 2, CASH: 1,  HF: 4,  PE: 10, PC: 3,  RE: 2 },
    desc: "Maximum long-horizon growth. Accepts drawdowns that most households should not." },
  { id: "TAX", name: "Tax-Aware Balanced", risk: 4, min: 3000000,
    t: { USLC: 29, USSC: 7,  INTLD: 14, EM: 4, CORE: 3,  MUNI: 22, CRED: 2, CASH: 2,  HF: 6,  PE: 5,  PC: 4,  RE: 2 },
    desc: "Balanced risk, built for the highest tax brackets. Municipals, direct indexing and lot-level harvesting." },
  { id: "END", name: "Endowment", risk: 5, min: 10000000,
    t: { USLC: 20, USSC: 5,  INTLD: 11, EM: 4, CORE: 6,  MUNI: 3,  CRED: 3, CASH: 2,  HF: 12, PE: 16, PC: 10, RE: 8 },
    desc: "Perpetual-horizon capital. Heavy private and hedged sleeves, sized for illiquidity tolerance." },
];
const MODEL = {}; MODELS.forEach((m) => { MODEL[m.id] = m; });

/* Which funds implement each asset class, and in what proportion. */
const SLEEVES = {
  USLC:  [["F-002", 40], ["F-005", 30], ["F-003", 20], ["F-004", 10]],
  USSC:  [["F-011", 55], ["F-012", 25], ["F-013", 20]],
  INTLD: [["F-014", 50], ["F-016", 28], ["F-015", 22]],
  EM:    [["F-018", 62], ["F-019", 38]],
  CORE:  [["F-022", 45], ["F-021", 30], ["F-024", 15], ["F-025", 10]],
  MUNI:  [["F-026", 55], ["F-027", 25], ["F-029", 12], ["F-028", 8]],
  CRED:  [["F-032", 42], ["F-033", 33], ["F-035", 25]],
  CASH:  [["F-036", 70], ["F-037", 30]],
  HF:    [["F-042", 34], ["F-039", 26], ["F-040", 22], ["F-041", 18]],
  PE:    [["F-047", 34], ["F-046", 26], ["F-048", 20], ["F-050", 20]],
  PC:    [["F-054", 46], ["F-053", 34], ["F-055", 20]],
  RE:    [["F-060", 40], ["F-058", 30], ["F-059", 18], ["F-062", 12]],
};

/* =========================================================
   HOUSEHOLDS
   [id, name, segment, advisor, model, MV($M), since, state,
    tier, ipsReview, custodian, contact, note]
   ========================================================= */
const HH_ROWS = [
  ["HH-0001","Whitmore Family","UHNW","Elaine Whitfield","TAX",41.2,"2019-11-04","IL","Founders","2026-03-12","Schwab","Robert & Diane Whitmore","Founder liquidity event 2019. Concentrated legacy position in the joint account is the central planning problem."],
  ["HH-0002","Ashcombe Family Trust","UHNW","Elaine Whitfield","END",96.2,"2008-02-19","IL","Founders","2026-01-22","Schwab","Katherine Ashcombe, Trustee","Third-generation family capital. Perpetual horizon, endowment allocation, four grantor trusts."],
  ["HH-0003","Delacroix Household","UHNW","Peter Nakamura","GRO",68.4,"2012-06-30","CT","Founders","2025-11-08","Pershing","Julien & Marta Delacroix","Two operating businesses still held outside the portfolio. Liquidity planning under way for 2027."],
  ["HH-0004","Sandoval Family Office","UHNW","Elaine Whitfield","END",52.6,"2015-09-14","FL","Founders","2026-05-30","Schwab","Elena Sandoval","Family office relationship. Rosemont runs the marketable book only."],
  ["HH-0005","Brennan-Locke Trust","UHNW","Caroline Estes","TAX",34.8,"2011-04-02","IL","Founders","2026-02-18","Fidelity","Thomas Brennan-Locke","Irrevocable trust with two beneficiary lines. Distribution standard is HEMS."],
  ["HH-0006","Kettering Household","UHNW","Marcus Devereaux","BAL",29.4,"2017-01-25","CO","Founders","2026-04-09","Schwab","Alan & Rosalind Kettering","Retired 2024. Portfolio now funds the entire spending need."],
  ["HH-0007","Nakashima Family","UHNW","Peter Nakamura","GRO",27.1,"2020-08-11","CT","Founders","2026-06-24","Fidelity","Kenji & Amy Nakashima","Still accumulating. Two children, both 529 plans funded to the exclusion limit."],
  ["HH-0008","Ferraro Household","UHNW","Sondra Vasquez","TAX",31.5,"2013-10-07","IL","Founders","2025-07-14","Schwab","Vincent Ferraro","Real estate operator. Portfolio is the diversifying asset against the property book."],
  ["HH-0009","Okonkwo Family","HNW","Marcus Devereaux","GRO",24.1,"2018-03-19","IL","Private","2026-07-14","Schwab","Chidi & Ngozi Okonkwo","Two physicians. Peak earning years, aggressive savings rate."],
  ["HH-0010","Sterling Household","HNW","Caroline Estes","BAL",22.4,"2014-05-06","CO","Private","2026-01-15","Fidelity","Marjorie Sterling","Widowed 2023. Estate plan restructured; beneficiary review completed in March."],
  ["HH-0011","Vandermeer Trust","HNW","Elaine Whitfield","TAX",19.6,"2016-11-22","IL","Private","2026-03-27","Schwab","Hendrik Vandermeer","Grantor trust. Annual exclusion gifting programme running since 2016."],
  ["HH-0012","Callahan Household","HNW","Marcus Devereaux","BAL",18.9,"2015-07-13","FL","Private","2025-12-04","Pershing","Sean & Bridget Callahan","Relocated to Florida in 2024. State tax situs change reduced the muni case."],
  ["HH-0013","Ibarra Family","HNW","Sondra Vasquez","MOD",16.2,"2019-02-28","IL","Private","2026-05-19","Schwab","Rafael & Luz Ibarra","Business sale closed 2022. Conservative by preference, not by capacity."],
  ["HH-0014","Pemberton Household","HNW","Grant Whitley","GRO",14.8,"2021-06-08","CT","Private","2026-04-30","Fidelity","James Pemberton","Technology executive. Significant unvested equity outside the portfolio."],
  ["HH-0015","Roswell Family Trust","HNW","Caroline Estes","CON",12.6,"2010-09-01","IL","Private","2026-02-06","Schwab","Patricia Roswell, Trustee","Income-first mandate. Trust distributes quarterly to three beneficiaries."],
  ["HH-0016","Haddad Household","HNW","Marcus Devereaux","BAL",11.4,"2017-10-17","CO","Private","2026-06-11","Schwab","Nadim & Layla Haddad","Both approaching retirement in 2028. Glide path begins next year."],
  ["HH-0017","Lindqvist Household","HNW","Grant Whitley","MOD",9.8,"2020-01-14","IL","Private","2025-06-23","Fidelity","Erik & Sofia Lindqvist","Dual citizens. Reporting requirements reviewed annually with counsel."],
  ["HH-0018","Ashworth Household","HNW","Nadia Osei","BAL",8.6,"2018-08-30","FL","Private","2026-07-02","Pershing","Charles Ashworth","Sold a professional practice in 2021. Deferred compensation runs through 2029."],
  ["HH-0019","Marchetti Family","HNW","Sondra Vasquez","GRO",7.9,"2022-03-11","IL","Private","2026-05-08","Schwab","Gianni & Rosa Marchetti","Newer relationship. Consolidating from three prior advisers."],
  ["HH-0020","Thibodeaux Household","HNW","Marcus Devereaux","CON",7.2,"2016-04-21","FL","Private","2026-01-29","Schwab","Marie Thibodeaux","Retired educator. Spending policy is 3.4% of a three-year average."],
  ["HH-0021","Osei-Bonsu Household","HNW","Nadia Osei","BAL",6.4,"2021-11-30","IL","Private","2026-06-27","Fidelity","Kwame & Adjoa Osei-Bonsu","Both in their forties. Education funding is the primary near-term goal."],
  ["HH-0022","Renner Household","HNW","Grant Whitley","MOD",5.8,"2019-05-16","CO","Private","2025-08-05","Schwab","David & Kate Renner","Second-home purchase planned for 2027; liquidity reserved."],
  ["HH-0023","Aldridge Household","Emerging","Nadia Osei","BAL",4.6,"2022-09-08","IL","Core","2026-04-15","Schwab","Simon Aldridge","Referred by the Kettering household."],
  ["HH-0024","Barros Household","Emerging","Marcus Devereaux","GRO",4.2,"2023-01-19","FL","Core","2026-07-21","Schwab","Ana Barros","Early career, high savings rate, long horizon."],
  ["HH-0025","Chen Household","Emerging","Nadia Osei","GRO",3.8,"2021-07-27","IL","Core","2026-03-05","Fidelity","Wei & Lin Chen","Two engineers. Concentrated employer stock managed down over three years."],
  ["HH-0026","Duarte Household","Emerging","Grant Whitley","BAL",3.4,"2022-11-14","CO","Core","2026-05-27","Schwab","Isabel Duarte","Inherited portfolio, repositioned over four quarters to manage gains."],
  ["HH-0027","Eriksson Household","Emerging","Nadia Osei","MOD",3.1,"2020-10-05","IL","Core","2026-02-13","Schwab","Anders Eriksson","Approaching retirement. Social Security claiming analysis completed."],
  ["HH-0028","Fontaine Household","Emerging","Sondra Vasquez","BAL",2.8,"2023-06-02","IL","Core","2026-06-18","Fidelity","Claire Fontaine","Divorce settlement in 2023. Rebuilding the plan from a new baseline."],
  ["HH-0029","Girard Household","Emerging","Grant Whitley","GRO",2.4,"2024-02-26","CO","Core","2026-07-09","Schwab","Luc Girard","Referred by a centre of influence at a Denver law firm."],
  ["HH-0030","Hollis Household","Emerging","Nadia Osei","CON",2.1,"2019-12-11","IL","Core","2026-01-08","Schwab","Margaret Hollis","Retired. Portfolio supplements a defined benefit pension."],
  ["HH-0031","Imada Household","Emerging","Marcus Devereaux","BAL",1.9,"2023-09-21","FL","Core","2026-05-14","Pershing","Sara Imada","Business owner. Solo 401(k) established at onboarding."],
  ["HH-0032","Jelani Household","Emerging","Nadia Osei","GRO",1.6,"2024-05-13","IL","Core","2026-06-30","Schwab","Amara Jelani","Physician in fellowship. Student loan strategy is part of the plan."],
  ["HH-0033","Kowalski Household","Emerging","Grant Whitley","MOD",1.4,"2022-04-07","IL","Core","2026-03-19","Fidelity","Piotr Kowalski","Consolidated four legacy retirement accounts at onboarding."],
  ["HH-0034","Lemaire Household","Emerging","Sondra Vasquez","CP",1.2,"2025-01-27","IL","Core","2026-07-28","Schwab","Yvette Lemaire","Newest relationship in the detailed book. Capital is earmarked for a 2027 purchase."],
  ["HH-0035","Harrowfield Foundation","Institutional","David Ferreira","END",48.6,"2009-05-01","IL","Institutional","2025-05-25","Schwab","Board Investment Committee","Private foundation. 5% distribution requirement drives the spending policy."],
  ["HH-0036","Calloway Family Foundation","Institutional","David Ferreira","BAL",31.2,"2013-03-14","IL","Institutional","2026-04-16","Schwab","Grants Committee","Grant-making foundation, three-year average spending rule."],
  ["HH-0037","St. Aldate's School Endowment","Institutional","Caroline Estes","END",22.4,"2011-08-22","CT","Institutional","2026-06-05","Fidelity","Finance Committee","School endowment. Spending policy 4.5% of a twelve-quarter average."],
  ["HH-0038","Meridian Health Retirement Plan","Institutional","David Ferreira","MOD",18.6,"2016-01-11","IL","Institutional","2026-05-21","Fidelity","Plan Committee","Defined contribution plan. Collective trusts only, no retail share classes."],
  ["HH-0039","Kettering Charitable Trust","Institutional","Marcus Devereaux","CON",12.4,"2018-07-19","CO","Institutional","2026-03-31","Schwab","Trustees","Charitable remainder trust connected to the Kettering household."],
  ["HH-0040","Ashcombe Donor-Advised Fund","Institutional","Elaine Whitfield","BAL",8.9,"2014-10-30","IL","Institutional","2026-01-17","Schwab","Katherine Ashcombe, Advisor","Granting vehicle for the Ashcombe family. Invested in the household model."],
];

/* Registration templates by segment: [label, taxable, altEligible, share of household MV] */
const ACCT_TEMPLATES = {
  UHNW: [
    ["Revocable Trust — Joint",       1, 1, 0.28],
    ["Joint Taxable",                 1, 1, 0.17],
    ["Irrevocable Trust",             1, 1, 0.14],
    ["Traditional IRA — Primary",     0, 0, 0.11],
    ["Traditional IRA — Spouse",      0, 0, 0.07],
    ["Roth IRA",                      0, 0, 0.05],
    ["Family LLC",                    1, 1, 0.10],
    ["Donor-Advised Fund",            0, 0, 0.05],
    ["529 Plan",                      0, 0, 0.03],
  ],
  HNW: [
    ["Revocable Trust — Joint",       1, 1, 0.34],
    ["Joint Taxable",                 1, 1, 0.19],
    ["Traditional IRA — Primary",     0, 0, 0.18],
    ["Traditional IRA — Spouse",      0, 0, 0.11],
    ["Roth IRA",                      0, 0, 0.08],
    ["401(k) Rollover",               0, 0, 0.07],
    ["529 Plan",                      0, 0, 0.03],
  ],
  Emerging: [
    ["Joint Taxable",                 1, 0, 0.38],
    ["Traditional IRA — Primary",     0, 0, 0.27],
    ["Roth IRA",                      0, 0, 0.19],
    ["401(k) Rollover",               0, 0, 0.16],
  ],
  Institutional: [
    ["Operating Account",             0, 1, 0.62],
    ["Long-Term Reserve",             0, 1, 0.30],
    ["Liquidity Reserve",             0, 0, 0.08],
  ],
};

/* ---- deterministic PRNG, shared by every builder below ---- */
function _rand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const _round2 = (n) => Math.round(n * 100) / 100;

/* =========================================================
   BUILD: households, accounts, positions, tax lots
   ========================================================= */
const HOUSEHOLDS = [];
const ACCOUNTS = [];
const POSITIONS = [];
const LOTS = [];

(function buildBook() {
  HH_ROWS.forEach((row, hi) => {
    const [id, name, segment, advisor, modelId, mvM, since, state,
           tier, ipsReview, custodian, contact, note] = row;
    const rnd = _rand("rp-hh-" + id);
    const model = MODEL[modelId];
    const mv = Math.round(mvM * 1e6);

    /* Time since the last rebalance drives how far the portfolio has drifted.
       Households rebalanced recently sit on target; those that have gone a year
       or more without a trade are the ones the drift monitor should surface. */
    const msr = Math.round(rnd() * 17);
    const lastRebal = addDays(RP.asOf, -Math.round(msr * 30.4));

    /* One market move per asset class for the whole household. Every account
       holds the same sleeves and lives through the same market, so the drift is
       correlated across them. Drawing it per account, or per fund, averages it
       back to zero and the portfolio never leaves its tolerance band. */
    const hhDrift = {};
    ASSET_CLASSES.forEach((ac) => {
      const stretch = 0.3 + Math.min(msr, 15) / 7;
      hhDrift[ac.id] = 1 + (rnd() - 0.47) * (ac.vol / 100) * stretch;
    });

    /* Alternatives require both scale and a qualified-purchaser profile. */
    const qualified = mv >= 5000000 && segment !== "Emerging";

    /* --- accounts: template shares, jittered then renormalised to the household MV --- */
    const tpl = ACCT_TEMPLATES[segment];
    const raw = tpl.map((t) => t[3] * (0.82 + rnd() * 0.36));
    const rawSum = raw.reduce((a, b) => a + b, 0);
    let assigned = 0;
    const accts = tpl.map((t, ai) => {
      const isLast = ai === tpl.length - 1;
      const acctMv = isLast ? mv - assigned : Math.round((raw[ai] / rawSum) * mv);
      assigned += acctMv;
      return {
        id: id + "-A" + String(ai + 1).padStart(2, "0"),
        hhId: id, hhName: name,
        registration: t[0],
        taxable: !!t[1],
        altEligible: !!t[2] && qualified,
        custodian: custodian === "Schwab" ? "Schwab Advisor Services"
                 : custodian === "Fidelity" ? "Fidelity Institutional" : "Pershing",
        number: "****" + String(4000 + hi * 17 + ai * 3).slice(-4),
        opened: since,
        model: modelId,
        mv: acctMv,
      };
    });

    /* --- per-account target allocation: asset location applied here --- */
    accts.forEach((a) => {
      const t = Object.assign({}, model.t);

      /* Municipals belong in taxable accounts, taxable core in retirement accounts. */
      if (a.taxable) { t.CORE = 0; t.MUNI = (model.t.CORE || 0) + (model.t.MUNI || 0); }
      else           { t.MUNI = 0; t.CORE = (model.t.CORE || 0) + (model.t.MUNI || 0); }

      /* Illiquid sleeves only where the registration can hold them. */
      if (!a.altEligible) {
        const moved = (t.PE || 0) + (t.PC || 0) + (t.RE || 0) + (t.HF || 0);
        t.PE = t.PC = t.RE = t.HF = 0;
        /* Redistribute across the liquid growth and income sleeves pro rata. */
        const liquid = ["USLC", "USSC", "INTLD", "EM", "CORE", "MUNI", "CRED"];
        const base = liquid.reduce((s, k) => s + (t[k] || 0), 0);
        liquid.forEach((k) => { if (t[k]) t[k] += moved * (t[k] / base); });
      }

      const total = Object.keys(t).reduce((s, k) => s + t[k], 0);
      Object.keys(t).forEach((k) => { t[k] = (t[k] / total) * 100; });
      a.target = t;
    });

    /* --- positions: target, then seeded market drift, then renormalise to account MV --- */
    accts.forEach((a) => {
      const arnd = _rand("rp-pos-" + a.id);
      const draft = [];
      Object.keys(a.target).forEach((acId) => {
        const pct = a.target[acId];
        if (pct <= 0.001) return;
        const sleeve = SLEEVES[acId] || [];
        const sleeveTotal = sleeve.reduce((s, x) => s + x[1], 0) || 1;
        const classDrift = hhDrift[acId];
        sleeve.forEach(([fundId, w]) => {
          const targetVal = a.mv * (pct / 100) * (w / sleeveTotal);
          /* Skip immaterial slices: a $180k IRA holds a handful of funds, not the
             whole sleeve. Anything under the greater of $2,500 or 40 bps is dropped
             and its weight absorbed by the renormalisation below. */
          if (targetVal < Math.max(2500, a.mv * 0.004)) return;
          /* Small idiosyncratic dispersion between funds inside the sleeve. */
          const drift = classDrift * (1 + (arnd() - 0.5) * 0.05);
          draft.push({ fundId, acId, targetVal, value: targetVal * drift });
        });
      });
      const draftSum = draft.reduce((s, d) => s + d.value, 0) || 1;
      let placed = 0;
      draft.forEach((d, i) => {
        const isLast = i === draft.length - 1;
        const value = isLast ? a.mv - placed : Math.round((d.value / draftSum) * a.mv);
        placed += value;
        const f = FUND[d.fundId];
        POSITIONS.push({
          id: a.id + "-P" + String(i + 1).padStart(2, "0"),
          acctId: a.id, hhId: id, hhName: name,
          fundId: d.fundId, fund: f ? f.name : d.fundId, code: f ? f.code : "",
          assetClass: d.acId, assetClassLabel: AC[d.acId].label,
          vehicle: f ? f.vehicleLabel : "",
          taxable: a.taxable,
          value,
          targetValue: Math.round(d.targetVal),
        });
      });
    });

    HOUSEHOLDS.push({
      id, name, segment, advisor, model: modelId, modelName: model.name,
      mv, since, state, tier, contact, note,
      /* The stored date is when the policy was last reviewed. Reviews are
         annual, so the next one is a year later and "past due" is derived. */
      ipsReviewed: ipsReview,
      ipsReview: addDays(ipsReview, 365),
      custodian: custodian === "Schwab" ? "Schwab Advisor Services"
               : custodian === "Fidelity" ? "Fidelity Institutional" : "Pershing",
      qualified,
      accounts: accts.map((a) => a.id),
      riskProfile: ["Conservative", "Moderate", "Moderate", "Growth", "Growth", "Aggressive", "Moderate", "Growth"][model.risk - 1] || "Moderate",
      /* Flow and return figures, seeded per household but plausible for its size. */
      monthsSinceRebalance: msr,
      lastRebalance: lastRebal,
      ytdFlow: Math.round((rnd() - 0.42) * mv * 0.09),
      qtdFlow: Math.round((rnd() - 0.45) * mv * 0.035),
      lastContact: ["2026-08-14", "2026-07-30", "2026-08-21", "2026-06-18", "2026-08-05", "2026-07-11"][hi % 6],
      openItems: 0,
    });
    ACCOUNTS.push.apply(ACCOUNTS, accts);
  });
})();

const HH = {}; HOUSEHOLDS.forEach((h) => { HH[h.id] = h; });
const ACCT = {}; ACCOUNTS.forEach((a) => { ACCT[a.id] = a; });

/* ---- tax lots: split every taxable position into one to four lots ---- */
(function buildLots() {
  POSITIONS.forEach((p) => {
    const rnd = _rand("rp-lot-" + p.id);
    const n = p.taxable ? 1 + Math.floor(rnd() * 4) : 1;
    const dates = ["2019-06-14", "2020-04-02", "2021-03-18", "2022-10-11", "2023-08-24", "2024-05-09", "2025-02-27", "2026-01-16", "2026-05-22"];
    /* Split into shares that always sum back to the position value exactly. */
    const weights = Array.from({ length: n }, () => 0.35 + rnd() * 0.65);
    const wSum = weights.reduce((a, b) => a + b, 0);
    let placed = 0;
    for (let i = 0; i < n; i++) {
      const isLast = i === n - 1;
      const value = isLast ? p.value - placed : Math.round((weights[i] / wSum) * p.value);
      placed += value;
      if (value <= 0) continue;
      const acq = dates[Math.floor(rnd() * dates.length)];
      /* Older lots carry larger embedded gains. */
      const age = (new Date(RP.asOf) - new Date(acq)) / (365.25 * 86400000);
      const gainPct = p.taxable ? (age * (0.055 + rnd() * 0.09) - 0.04) : 0;
      const basis = Math.round(value / (1 + gainPct));
      LOTS.push({
        id: p.id + "-L" + (i + 1),
        posId: p.id, acctId: p.acctId, hhId: p.hhId,
        fundId: p.fundId, fund: p.fund, assetClass: p.assetClass,
        acquired: acq, value, basis,
        gain: value - basis,
        term: (new Date(RP.asOf) - new Date(acq)) > 366 * 86400000 ? "Long" : "Short",
        washSale: false,
      });
    }
  });
  /* Two deliberate wash-sale conflicts for the trading page to catch. */
  const flagged = LOTS.filter((l) => l.gain < 0 && l.term === "Short").slice(0, 2);
  flagged.forEach((l) => { l.washSale = true; });
})();

/* ---- roll-ups: household and account values derive, never get typed ---- */
function positionsFor(pred) { return POSITIONS.filter(pred); }
function householdPositions(hhId) { return POSITIONS.filter((p) => p.hhId === hhId); }
function accountPositions(acctId) { return POSITIONS.filter((p) => p.acctId === acctId); }
function householdLots(hhId) { return LOTS.filter((l) => l.hhId === hhId); }
function householdAccounts(hhId) { return ACCOUNTS.filter((a) => a.hhId === hhId); }

/* Allocation of any position set, actual and target, as percentages. */
function allocationOf(positions) {
  const total = positions.reduce((s, p) => s + p.value, 0) || 1;
  const tTotal = positions.reduce((s, p) => s + p.targetValue, 0) || 1;
  return ASSET_CLASSES.map((ac) => {
    const inClass = positions.filter((p) => p.assetClass === ac.id);
    const val = inClass.reduce((s, p) => s + p.value, 0);
    const tgt = inClass.reduce((s, p) => s + p.targetValue, 0);
    const actualPct = (val / total) * 100;
    const targetPct = (tgt / tTotal) * 100;
    return {
      id: ac.id, label: ac.label, group: ac.group,
      value: val, actualPct, targetPct,
      drift: actualPct - targetPct,
      /* The band is the tighter of 20% relative and 4 points absolute,
         with a 1 point floor for the smallest sleeves. */
      tolerance: Math.max(1.0, Math.min(4.0, targetPct * 0.20)),
    };
  }).filter((a) => a.actualPct > 0.001 || a.targetPct > 0.001);
}
function isDrifted(alloc) { return alloc.some((a) => Math.abs(a.drift) > a.tolerance); }

/* =========================================================
   FIRM AGGREGATES
   Detailed households plus the aggregate tail. Every firm
   figure on every page comes from this object.
   ========================================================= */
const FIRM = (function () {
  const detailedAum = HOUSEHOLDS.reduce((s, h) => s + h.mv, 0);
  const tailAum = TARGET_AUM - detailedAum;
  const tailCount = TOTAL_HOUSEHOLDS - HOUSEHOLDS.length;

  /* The firm's full segment mix. The detailed 40 are a representative sample
     drawn from it; the tail carries the remaining relationships. */
  const firmSegments = [
    { id: "UHNW",          label: "Ultra high net worth ($25M+)",    households: 74,  share: 0.610 },
    { id: "HNW",           label: "High net worth ($5\u201325M)",   households: 268, share: 0.268 },
    { id: "Emerging",      label: "Emerging wealth ($1\u20135M)",   households: 216, share: 0.058 },
    { id: "Institutional", label: "Foundations, endowments & plans", households: 54,  share: 0.064 },
  ].map((seg) => {
    const detailed = HOUSEHOLDS.filter((h) => h.segment === seg.id);
    const aum = Math.round(TARGET_AUM * seg.share);
    return Object.assign({}, seg, {
      aum,
      detailedCount: detailed.length,
      detailedAum: detailed.reduce((s, h) => s + h.mv, 0),
      tailCount: seg.households - detailed.length,
      tailAum: aum - detailed.reduce((s, h) => s + h.mv, 0),
    });
  });

  /* Give the tail a real size distribution within each segment, then bill it
     household by household. Relationship sizes inside a segment are skewed,
     so a lognormal-shaped spread is closer to the truth than a flat average
     and it materially changes the blended rate. */
  const tailBook = [];
  firmSegments.forEach((seg) => {
    if (seg.tailCount <= 0) return;
    const rnd = _rand("rp-tail-" + seg.id);
    const weights = Array.from({ length: seg.tailCount }, () => Math.exp((rnd() - 0.5) * 1.35));
    const wSum = weights.reduce((a, b) => a + b, 0);
    let placed = 0;
    weights.forEach((w, i) => {
      const isLast = i === seg.tailCount - 1;
      const mv = isLast ? seg.tailAum - placed : Math.round((w / wSum) * seg.tailAum);
      placed += mv;
      tailBook.push({ segment: seg.id, mv });
    });
  });

  const detailedFee = HOUSEHOLDS.reduce((s, h) => s + annualFee(h.mv), 0);
  const tailFee = tailBook.reduce((s, t) => s + annualFee(t.mv), 0);
  const revenue = detailedFee + tailFee;

  const segments = ["UHNW", "HNW", "Emerging", "Institutional"].map((seg) => {
    const inSeg = HOUSEHOLDS.filter((h) => h.segment === seg);
    return { id: seg, households: inSeg.length, aum: inSeg.reduce((s, h) => s + h.mv, 0) };
  });

  /* Revenue by segment, used on the revenue page. */
  firmSegments.forEach((seg) => {
    const dFee = HOUSEHOLDS.filter((h) => h.segment === seg.id).reduce((s, h) => s + annualFee(h.mv), 0);
    const tFee = tailBook.filter((t) => t.segment === seg.id).reduce((s, t) => s + annualFee(t.mv), 0);
    seg.revenue = dFee + tFee;
    seg.blendedFee = seg.revenue / seg.aum;
  });

  return {
    aum: TARGET_AUM,
    aua: ADVISORY_ONLY_AUA,
    total: TARGET_AUM + ADVISORY_ONLY_AUA,
    households: TOTAL_HOUSEHOLDS,
    detailedAum, detailedHouseholds: HOUSEHOLDS.length,
    tailAum, tailCount, tailBook,
    avgRelationship: Math.round(TARGET_AUM / TOTAL_HOUSEHOLDS),
    revenue,
    blendedFee: revenue / TARGET_AUM,
    segments, firmSegments,
  };
})();

/* ---- AUM roll-forward: begin + flows + market - fees = end, exactly ---- */
const ROLLFORWARD = (function () {
  const end = FIRM.aum;
  const newHouseholds = 214000000;
  const additions = 386000000;
  const withdrawals = -248000000;
  const attrition = -96000000;
  const fees = -Math.round(FIRM.revenue * 0.66); /* three quarters billed year to date */
  const marketReturn = 512000000;
  const nna = newHouseholds + additions + withdrawals + attrition;
  const begin = end - nna - marketReturn - fees;
  return {
    begin, newHouseholds, additions, withdrawals, attrition, fees, marketReturn, nna, end,
    organicGrowth: nna / begin,
    periodLabel: "Year to date, 1 January to 28 August 2026",
  };
})();

/* Advisers, used by the team, growth and revenue pages. */
const ADVISORS = [
  { name: "Elaine Whitfield",  title: "Partner & Senior Wealth Advisor", office: "Chicago",   households: 38, tenure: 2009, capacity: 45 },
  { name: "Marcus Devereaux",  title: "Wealth Advisor",                  office: "Chicago",   households: 52, tenure: 2016, capacity: 45 },
  { name: "Caroline Estes",    title: "Partner & Senior Wealth Advisor", office: "Greenwich", households: 34, tenure: 2011, capacity: 45 },
  { name: "Peter Nakamura",    title: "Senior Wealth Advisor",           office: "Greenwich", households: 29, tenure: 2013, capacity: 45 },
  { name: "Sondra Vasquez",    title: "Wealth Advisor",                  office: "Chicago",   households: 47, tenure: 2018, capacity: 45 },
  { name: "Grant Whitley",     title: "Wealth Advisor",                  office: "Denver",    households: 41, tenure: 2019, capacity: 45 },
  { name: "Nadia Osei",        title: "Wealth Advisor",                  office: "Naples",    households: 58, tenure: 2020, capacity: 45 },
  { name: "David Ferreira",    title: "Chief Investment Officer",        office: "Chicago",   households: 12, tenure: 2007, capacity: 20 },
];

/* =========================================================
   PERFORMANCE
   36 months of returns per model and per benchmark. Household
   returns derive from the model plus a small tracking term,
   so a household's number never contradicts its allocation.
   ========================================================= */
const MONTHS = (function () {
  const out = [];
  const end = new Date("2026-08-01T12:00:00");
  for (let i = 35; i >= 0; i--) {
    const d = new Date(end); d.setMonth(d.getMonth() - i);
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
})();

function cumulative(series) {
  return series.reduce((acc, r) => acc * (1 + r / 100), 1) - 1;
}
function annualise(series) {
  const c = cumulative(series);
  return (Math.pow(1 + c, 12 / series.length) - 1) * 100;
}

/* Find the constant monthly drift that makes a series of wiggles compound to a
   target. Bisection: cheap, deterministic, and it lets the shape stay random
   while the endpoints stay tied to the benchmark. */
function _solveDrift(wiggles, target) {
  let lo = -20, hi = 20;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const c = cumulative(wiggles.map((w) => w + mid));
    if (c < target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/* Blended policy benchmark for a model: the weighted return of the real market
   index behind each asset class, taken straight from the market boards. */
function policyBenchmark(modelId) {
  const m = MODEL[modelId];
  const w = (key) => Object.keys(m.t).reduce((s, k) => {
    const q = (typeof IDX !== "undefined" && IDX[AC[k].bench])
      || (typeof ALT_BENCH !== "undefined" && ALT_BENCH.find((a) => a.code === AC[k].bench));
    const v = q && q[key] != null ? q[key] : AC[k].er;
    return s + (m.t[k] / 100) * v;
  }, 0);
  return { ytd: +w("ytd").toFixed(2), y1: +w("y1").toFixed(2), y3: +w("y3").toFixed(2), y5: +w("y5").toFixed(2) };
}

const YTD_MONTHS = 8; /* January through August 2026 */

const MODEL_RETURNS = (function () {
  const out = {};
  MODELS.forEach((m) => {
    const rnd = _rand("rp-ret-" + m.id);
    const bench = policyBenchmark(m.id);

    /* Expected return and volatility implied by the model's own weights. */
    const er = Object.keys(m.t).reduce((s, k) => s + (m.t[k] / 100) * AC[k].er, 0);
    const vol = Math.sqrt(
      Object.keys(m.t).reduce((s, a) =>
        s + Object.keys(m.t).reduce((s2, b) =>
          s2 + (m.t[a] / 100) * (m.t[b] / 100) * AC[a].vol * AC[b].vol * cmaCorr(a, b), 0), 0)
    );
    const mVol = vol / Math.sqrt(12);

    /* Active return the model is expected to add over its blended benchmark:
       positive where the model leans on active managers, near zero where it is
       mostly index exposure. */
    const activeShare = 1 - (m.t.CASH + m.t.CORE + m.t.MUNI) / 100;
    const active = +((rnd() - 0.35) * 1.6 * activeShare).toFixed(2);

    /* A regime shape shared by every model, so they all draw down and recover
       together the way a single market makes them. */
    const shape = MONTHS.map((_, i) =>
      (Math.sin((i / 35) * Math.PI * 1.7) * 0.55 + (rnd() - 0.5) * 1.1) * mVol);

    /* Anchor the last eight months to the year-to-date benchmark, and the
       twenty-eight before that to whatever is left of the three-year number.
       The series then reproduces both figures exactly. */
    const targetYtd = (bench.ytd + active) / 100;
    const target3yr = Math.pow(1 + (bench.y3 + active) / 100, 3) - 1;
    const targetPrior = (1 + target3yr) / (1 + targetYtd) - 1;

    const priorShape = shape.slice(0, MONTHS.length - YTD_MONTHS);
    const ytdShape = shape.slice(MONTHS.length - YTD_MONTHS);
    const dPrior = _solveDrift(priorShape, targetPrior);
    const dYtd = _solveDrift(ytdShape, targetYtd);

    const monthly = priorShape.map((w) => +(w + dPrior).toFixed(3))
      .concat(ytdShape.map((w) => +(w + dYtd).toFixed(3)));

    out[m.id] = { er: +er.toFixed(2), vol: +vol.toFixed(1), active, bench, monthly };
  });
  return out;
})();

/* Household performance: the model series plus a seeded tracking term, then
   net of that household's own effective fee rate. */
function householdReturns(hhId) {
  const h = HH[hhId];
  if (!h) return null;
  const base = MODEL_RETURNS[h.model].monthly;
  const rnd = _rand("rp-hhret-" + hhId);
  const monthly = base.map((r) => +(r + (rnd() - 0.5) * 0.34).toFixed(2));
  const fee = effectiveRate(h.mv) * 100 / 12;
  const net = monthly.map((r) => +(r - fee).toFixed(2));
  return {
    monthly, net,
    mtd: net[net.length - 1],
    qtd: +(cumulative(net.slice(-2)) * 100).toFixed(2),
    ytd: +(cumulative(net.slice(-YTD_MONTHS)) * 100).toFixed(2),
    y1:  +(cumulative(net.slice(-12)) * 100).toFixed(2),
    y3:  +annualise(net).toFixed(2),
    y3gross: +annualise(monthly).toFixed(2),
    itd: +annualise(net).toFixed(2),
    growth: net.reduce((a, r) => { a.push(a[a.length - 1] * (1 + r / 100)); return a; }, [100]),
  };
}



/* =========================================================
   PRIVATE MARKETS — commitments by household
   ========================================================= */
const COMMITMENTS = (function () {
  const privFunds = FUNDS.filter((f) => f.isPrivate);
  const eligible = HOUSEHOLDS.filter((h) => h.qualified && (MODEL[h.model].t.PE > 0 || MODEL[h.model].t.PC > 0));
  const out = [];
  eligible.forEach((h, hi) => {
    const rnd = _rand("rp-commit-" + h.id);
    const n = h.segment === "Institutional" ? 5 + Math.floor(rnd() * 3)
            : h.mv > 40000000 ? 6 + Math.floor(rnd() * 3)
            : 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const f = privFunds[(hi * 3 + i * 5) % privFunds.length];
      const commitment = Math.round((h.mv * (0.015 + rnd() * 0.035)) / 25000) * 25000;
      if (commitment < 100000) continue;
      const called = Math.round(commitment * (f.priv.calledPct / 100));
      const nav = Math.round(called * (f.priv.tvpi - f.priv.dpi));
      const distributed = Math.round(called * f.priv.dpi);
      out.push({
        id: "CMT-" + h.id.slice(-4) + "-" + (i + 1),
        hhId: h.id, hhName: h.name, advisor: h.advisor,
        fundId: f.id, fund: f.name, manager: f.manager,
        assetClass: f.ac, vintage: f.priv.vintage,
        commitment, called, uncalled: commitment - called,
        distributed, nav,
        tvpi: f.priv.tvpi, dpi: f.priv.dpi, irr: f.priv.irr,
        closed: f.inception,
      });
    }
  });
  return out;
})();

/* Upcoming capital calls, one of which is deliberately unfunded and near. */
const CAPITAL_CALLS = COMMITMENTS
  .filter((c) => c.uncalled > 150000)
  .slice(0, 14)
  .map((c, i) => {
    const due = ["2026-09-08", "2026-09-15", "2026-09-24", "2026-10-06", "2026-10-19",
                 "2026-11-03", "2026-11-17", "2026-12-01"][i % 8];
    const amount = Math.round(c.uncalled * (0.12 + (i % 5) * 0.05) / 5000) * 5000;
    return {
      id: "CALL-" + String(i + 1).padStart(3, "0"),
      commitmentId: c.id, hhId: c.hhId, hhName: c.hhName, advisor: c.advisor,
      fund: c.fund, manager: c.manager, amount, due,
      status: i === 0 ? "Unfunded" : i < 4 ? "Awaiting Client" : "Scheduled",
      source: i % 3 === 0 ? "Cash reserve" : i % 3 === 1 ? "Liquidate short duration" : "Distribution recycle",
    };
  });

/* =========================================================
   OPERATIONS: trades, reconciliation breaks, corporate actions
   ========================================================= */
const TRADES = (function () {
  const out = [];
  const rnd = _rand("rp-trades");
  const reasons = ["Rebalance to target", "New funding", "Raise cash for distribution", "Tax-loss harvest",
                   "Model change — duration", "Concentrated position reduction", "Capital call funding"];
  for (let i = 0; i < 180; i++) {
    const p = POSITIONS[Math.floor(rnd() * POSITIONS.length)];
    const acct = ACCT[p.acctId];
    const side = rnd() > 0.46 ? "Buy" : "Sell";
    const amount = Math.round((p.value * (0.03 + rnd() * 0.18)) / 100) * 100;
    const d = new Date("2026-08-28T12:00:00"); d.setDate(d.getDate() - Math.floor(rnd() * 21));
    const status = i < 6 ? "Pending" : i < 12 ? "Executed" : "Settled";
    out.push({
      id: "TRD-" + String(24100 + i),
      date: d.toISOString().slice(0, 10),
      hhId: p.hhId, hhName: p.hhName, acctId: p.acctId,
      registration: acct.registration, custodian: acct.custodian,
      fundId: p.fundId, fund: p.fund, code: p.code,
      side, amount, status,
      reason: reasons[Math.floor(rnd() * reasons.length)],
      block: rnd() > 0.72 ? "BLK-" + String(880 + (i % 12)) : "",
      realized: side === "Sell" && acct.taxable ? Math.round((rnd() - 0.35) * amount * 0.22) : 0,
      trader: ["T. Okonjo", "N. Cole"][i % 2],
    });
  }
  return out;
})();

const BLOCKS = (function () {
  const groups = {};
  TRADES.filter((t) => t.block).forEach((t) => {
    groups[t.block] = groups[t.block] || { id: t.block, fund: t.fund, side: t.side, legs: [], amount: 0 };
    groups[t.block].legs.push(t);
    groups[t.block].amount += t.amount;
  });
  return Object.keys(groups).map((k) => groups[k]).sort((a, b) => b.amount - a.amount);
})();

const BREAKS = (function () {
  const types = ["Price variance", "Position quantity", "Missing cost basis", "Unposted dividend",
                 "Cash variance", "Corporate action not applied", "Duplicate transaction"];
  const rnd = _rand("rp-breaks");
  return Array.from({ length: 25 }, (_, i) => {
    const p = POSITIONS[Math.floor(rnd() * POSITIONS.length)];
    const age = i < 3 ? 12 + Math.floor(rnd() * 9) : Math.floor(rnd() * 6);
    return {
      id: "BRK-" + String(3300 + i),
      type: types[i % types.length],
      hhId: p.hhId, hhName: p.hhName, acctId: p.acctId,
      custodian: ACCT[p.acctId].custodian,
      fund: p.fund,
      amount: Math.round((rnd() - 0.4) * 42000),
      age,
      owner: ["T. Okonjo", "J. Alvarado", "Operations queue"][i % 3],
      status: age > 10 ? "Overdue" : age > 4 ? "In Progress" : "Open",
      opened: addDays(RP.asOf, -age),
    };
  }).sort((a, b) => b.age - a.age);
})();

const CORP_ACTIONS = [
  { id: "CA-4411", type: "Cash dividend",     security: "Kestrel US Core Equity ETF",     exDate: "2026-09-18", payDate: "2026-09-24", rate: "$0.842 / share", accounts: 148, status: "Scheduled" },
  { id: "CA-4409", type: "Capital gain",      security: "Northmoor Quality Growth Fund",  exDate: "2026-12-11", payDate: "2026-12-15", rate: "Est. 3.1% of NAV", accounts: 62, status: "Estimated" },
  { id: "CA-4404", type: "Fund merger",       security: "Thornbury Frontier & EM Small Cap", exDate: "2026-10-30", payDate: "2026-10-30", rate: "Into TSCVX", accounts: 9, status: "In Review" },
  { id: "CA-4398", type: "Share class change",security: "Ledgewood High Yield Fund",      exDate: "2026-09-02", payDate: "2026-09-02", rate: "Investor → Institutional", accounts: 71, status: "Scheduled" },
  { id: "CA-4392", type: "Special distribution", security: "Harrowgate Core Property Trust", exDate: "2026-09-30", payDate: "2026-10-10", rate: "$0.21 / unit", accounts: 24, status: "Scheduled" },
  { id: "CA-4387", type: "Return of capital", security: "Stonebrook Infrastructure Partners III", exDate: "2026-09-12", payDate: "2026-09-19", rate: "$1.84M aggregate", accounts: 18, status: "Confirmed" },
];

/* =========================================================
   TRANSACTIONS — 36 months of household activity
   ========================================================= */
const TRANSACTIONS = (function () {
  const out = [];
  const rnd = _rand("rp-txn");
  const types = [
    ["Contribution", 1], ["Withdrawal", -1], ["Dividend", 1], ["Interest", 1],
    ["Advisory fee", -1], ["Capital call", -1], ["Distribution received", 1],
    ["Purchase", 0], ["Sale", 0], ["Transfer in", 1],
  ];
  HOUSEHOLDS.forEach((h) => {
    const n = 14 + Math.floor(rnd() * 12);
    for (let i = 0; i < n; i++) {
      const t = types[Math.floor(rnd() * types.length)];
      const d = new Date("2026-08-28T12:00:00");
      d.setDate(d.getDate() - Math.floor(rnd() * 1000));
      const accts = householdAccounts(h.id);
      const a = accts[Math.floor(rnd() * accts.length)];
      const base = t[0] === "Advisory fee" ? annualFee(h.mv) / 4
                 : t[0] === "Dividend" || t[0] === "Interest" ? h.mv * (0.002 + rnd() * 0.004)
                 : h.mv * (0.004 + rnd() * 0.03);
      out.push({
        id: "TXN-" + String(out.length + 100000),
        date: d.toISOString().slice(0, 10),
        hhId: h.id, hhName: h.name, acctId: a.id, registration: a.registration,
        type: t[0],
        amount: Math.round(base) * (t[1] === 0 ? (rnd() > 0.5 ? 1 : -1) : t[1]),
      });
    }
  });
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
})();

/* =========================================================
   GROWTH: prospects, centres of influence
   ========================================================= */
const PROSPECTS = (function () {
  const names = ["Ravenscroft Household", "Nakagawa Family", "Pilcher Household", "Odunlami Family",
    "Varga Household", "Bellweather Trust", "Sandifer Household", "Quintero Family",
    "Ainsworth Household", "Torvald Family Trust", "Mbeki Household", "Castellano Family",
    "Whitfield Endowment Fund", "Prasad Household", "Lindgren Household", "Achebe Family",
    "Grovener Trust", "Sattler Household", "Oyelaran Family", "Bramwell Household",
    "Tuominen Household", "Reyes-Vega Family", "Hollister Trust", "Nkemdirim Household",
    "Auclair Household", "Petrakis Family", "Wynn-Davies Household", "Solberg Family",
    "Ibe Household", "Ferrante Trust", "Kowalczyk Household", "Dagher Family",
    "Ravensworth School Fund", "Lindholm Household", "Achterberg Household"];
  const stages = [["Identified", .10], ["Discovery held", .25], ["Proposal delivered", .45],
                  ["Verbal commitment", .75], ["Paperwork out", .90]];
  const sources = ["Client referral", "Centre of influence", "Professional network", "Event", "Digital / inbound"];
  const rnd = _rand("rp-prospects");
  return names.map((n, i) => {
    const st = stages[i % stages.length];
    const assets = Math.round((1.2 + rnd() * 34) * 1e6 / 1e5) * 1e5;
    return {
      id: "PRO-" + String(2600 + i),
      name: n,
      assets,
      stage: st[0], probability: st[1],
      weighted: Math.round(assets * st[1]),
      revenue: Math.round(annualFee(assets)),
      source: sources[i % sources.length],
      advisor: ADVISORS[i % 7].name,
      opened: addDays(RP.asOf, -(20 + i * 9)),
      nextStep: ["Second meeting scheduled", "Draft IPS to send", "Awaiting custodian paperwork",
                 "Introduce the CIO", "Portfolio review delivered", "Follow up after their board meeting"][i % 6],
      segment: assets >= 25e6 ? "UHNW" : assets >= 5e6 ? "HNW" : "Emerging",
    };
  });
})();

const COIS = [
  { name: "Harker Estrada LLP",        type: "Estate counsel",   city: "Chicago",   given: 6, received: 11, assets: 184000000, since: 2009 },
  { name: "Lindell & Roe CPAs",        type: "Tax",              city: "Chicago",   given: 9, received: 14, assets: 226000000, since: 2007 },
  { name: "Pemberton Advisory Group",  type: "Investment banking", city: "Greenwich", given: 2, received: 6, assets: 148000000, since: 2014 },
  { name: "Cranbourne Trust Company",  type: "Corporate trustee", city: "Chicago",  given: 4, received: 5, assets: 96000000, since: 2012 },
  { name: "Vale & Whitcombe",          type: "Family law",       city: "Denver",    given: 3, received: 4, assets: 42000000, since: 2019 },
  { name: "Osgood Insurance Partners", type: "Risk & insurance", city: "Naples",    given: 7, received: 3, assets: 38000000, since: 2018 },
  { name: "Trellis Business Brokers",  type: "M&A advisory",     city: "Chicago",   given: 1, received: 7, assets: 132000000, since: 2016 },
];

/* =========================================================
   COMPLIANCE REGISTER
   ========================================================= */
const COMPLIANCE = [
  ["Form ADV Part 1 annual amendment", "Regulatory filing", "Rachel Stern", "2026-03-31", "Complete", "Filed 24 March 2026. No material changes to Item 5 or Item 8."],
  ["Form ADV Part 2A brochure delivery", "Disclosure", "Rachel Stern", "2026-04-30", "Complete", "Delivered to 612 of 612 households. Evidence retained in the vault."],
  ["Form CRS delivery tracking", "Disclosure", "Jenna Alvarado", "2026-09-30", "In Progress", "97.4% delivered. 16 households outstanding, all newly onboarded."],
  ["Annual compliance review — Rule 206(4)-7", "Programme", "Rachel Stern", "2026-12-15", "In Progress", "Testing under way across six modules. Trading and billing complete."],
  ["Code of ethics — quarterly personal trading", "Personal trading", "Rachel Stern", "2026-10-10", "Open", "Q3 reports due from 84 access persons."],
  ["Code of ethics — annual holdings attestation", "Personal trading", "Rachel Stern", "2026-02-14", "Complete", "84 of 84 attestations received."],
  ["Marketing Rule review — performance advertising", "Marketing", "Rachel Stern", "2026-09-15", "In Progress", "Reviewing the Q3 client package and three prospect presentations."],
  ["Marketing Rule review — testimonials", "Marketing", "Rachel Stern", "2026-09-15", "Open", "Two client testimonials pending disclosure and compensation review."],
  ["Custody rule — surprise examination", "Custody", "Alan Pruitt", "2026-11-30", "Scheduled", "Independent accountant engaged. Fieldwork booked for November."],
  ["Custody rule — standing letters of authorisation", "Custody", "Thomas Okonjo", "2026-09-30", "In Progress", "Reviewing 42 SLOAs against the seven conditions."],
  ["AML / KYC refresh — high risk households", "AML", "Jenna Alvarado", "2026-08-31", "Overdue", "Three households past the refresh date. Escalated to the CCO on 20 August."],
  ["AML / KYC — new account screening", "AML", "Jenna Alvarado", "2026-09-30", "In Progress", "All eleven onboarding households screened; two require enhanced review."],
  ["Books and records retention audit", "Records", "Rachel Stern", "2026-10-31", "Open", "Annual sample of 60 records across email, trading and client files."],
  ["Business continuity plan test", "BCP", "Thomas Okonjo", "2026-06-30", "Complete", "Full failover exercise completed 18 June. Two findings, both remediated."],
  ["Cybersecurity penetration test", "Cyber", "Thomas Okonjo", "2026-07-31", "Complete", "External test completed. No critical findings; two medium items closed in August."],
  ["Cybersecurity — annual staff training", "Cyber", "Rachel Stern", "2026-11-30", "Open", "Assigned to all 84 staff. 41% complete."],
  ["Vendor due diligence — portfolio accounting", "Vendor", "Thomas Okonjo", "2026-09-30", "In Progress", "SOC 1 Type 2 received and reviewed. Contract renewal in October."],
  ["Vendor due diligence — CRM", "Vendor", "Thomas Okonjo", "2026-12-31", "Open", "Annual review not yet started."],
  ["Best execution committee — quarterly review", "Trading", "Nathan Cole", "2026-10-15", "Open", "Q3 review scheduled. Q2 found no exceptions across 1,842 trades."],
  ["Trade error log review", "Trading", "Rachel Stern", "2026-09-30", "In Progress", "One open error from August. Client make-whole calculated at $4,120."],
  ["Fee billing accuracy test", "Billing", "Alan Pruitt", "2026-07-15", "Complete", "Q2 billing tested against the schedule on a 25-household sample. No exceptions."],
  ["Client complaint log", "Complaints", "Rachel Stern", "2026-12-31", "Complete", "No complaints received year to date."],
  ["Gifts and entertainment log", "Conflicts", "Rachel Stern", "2026-12-31", "In Progress", "Fourteen entries year to date, all within the $250 threshold."],
  ["Political contributions pre-clearance", "Conflicts", "Rachel Stern", "2026-12-31", "In Progress", "Three requests pre-cleared. No pay-to-play exposure identified."],
  ["Outside business activity attestation", "Conflicts", "Rachel Stern", "2026-02-14", "Complete", "84 of 84 received. Six activities disclosed and approved."],
  ["Advisory agreement refresh — legacy form", "Documentation", "Jenna Alvarado", "2026-11-30", "Open", "38 households still on the pre-2019 agreement form."],
  ["Investment policy statement reviews", "Documentation", "Elaine Whitfield", "2026-09-30", "Overdue", "Four households past their annual review date. Meetings being scheduled."],
  ["Regulatory examination readiness file", "Examination", "Rachel Stern", "2026-12-31", "In Progress", "Standing request list maintained; last refreshed 4 August."],
  ["Solicitor and promoter agreements", "Marketing", "Rachel Stern", "2026-12-31", "Complete", "Two agreements in place, both with required disclosure."],
  ["Proxy voting policy review", "Governance", "David Ferreira", "2026-12-31", "Open", "Annual review of the policy and the third-party voting agent."],
  ["Valuation policy — private funds", "Valuation", "Priya Raghavan", "2026-10-31", "In Progress", "Reviewing quarterly marks across nineteen private vehicles."],
  ["Insurance — E&O and fidelity bond renewal", "Insurance", "Alan Pruitt", "2026-10-01", "In Progress", "Renewal quotes received; coverage limits under review."],
  ["Disaster recovery — data restoration test", "BCP", "Thomas Okonjo", "2026-12-15", "Open", "Scheduled with the vendor for December."],
  ["Privacy notice annual delivery", "Privacy", "Jenna Alvarado", "2026-01-31", "Complete", "Delivered with the year-end statement package."],
  ["Senior investor and diminished capacity policy", "Client protection", "Rachel Stern", "2026-12-31", "In Progress", "Trusted contact on file for 71% of households over 70."],
  ["Wire and disbursement controls test", "Operations", "Alan Pruitt", "2026-09-30", "In Progress", "Callback verification tested on a 30-wire sample."],
  ["Model portfolio documentation review", "Investment", "David Ferreira", "2026-10-31", "Open", "Confirming every model change since January is minuted."],
  ["Sub-adviser oversight review", "Investment", "Priya Raghavan", "2026-11-15", "Open", "Annual review of the two sub-advised sleeves."],
  ["Soft dollar and research payment review", "Trading", "Nathan Cole", "2026-12-31", "Complete", "No soft dollar arrangements. Research paid from the firm's own resources."],
  ["Custodian SOC report review", "Vendor", "Thomas Okonjo", "2026-08-31", "Complete", "All three custodian SOC 1 reports reviewed; no exceptions relevant to us."],
  ["Employee onboarding compliance training", "Training", "Rachel Stern", "2026-12-31", "In Progress", "Six new hires year to date, all completed within 30 days."],
  ["Written supervisory procedures update", "Programme", "Rachel Stern", "2026-12-31", "In Progress", "Updating for the private-markets workflow added in March."],
  ["Class action and claims filing", "Operations", "Jenna Alvarado", "2026-12-31", "In Progress", "Third-party filer engaged; 2025 recoveries of $61,400 credited to clients."],
  ["Held-away asset supervision policy", "Investment", "Rachel Stern", "2026-11-30", "Open", "Defining supervision standards for the $1.9B advisory-only book."],
  ["Annual privacy and safeguards risk assessment", "Privacy", "Thomas Okonjo", "2026-12-31", "Open", "Not yet started. Owner assigned in July."],
].map((c, i) => ({
  id: "CMP-" + String(i + 1).padStart(3, "0"),
  item: c[0], category: c[1], owner: c[2], due: c[3], status: c[4], note: c[5],
  overdue: c[4] === "Overdue",
}));

/* =========================================================
   MEETINGS
   ========================================================= */
const MEETINGS = (function () {
  const kinds = ["Annual review", "Portfolio review", "Planning session", "Onboarding", "Estate strategy",
                 "Tax planning", "Committee meeting", "Introductory"];
  return HOUSEHOLDS.slice(0, 24).map((h, i) => {
    const upcoming = i < 9;
    const d = addDays(RP.asOf, upcoming ? 3 + i * 4 : -(6 + i * 11));
    return {
      id: "MTG-" + String(1400 + i),
      hhId: h.id, hhName: h.name, advisor: h.advisor,
      kind: kinds[i % kinds.length],
      date: d,
      upcoming,
      attendees: h.contact,
      location: ["Chicago office", "Video", "Client home", "Greenwich office", "Video"][i % 5],
      agenda: [
        "Performance and allocation since the last meeting",
        i % 2 ? "Cash flow and distribution plan for the next twelve months" : "Progress against the funded status of each goal",
        i % 3 === 0 ? "Private markets: commitments, calls and pacing" : "Tax position and harvesting year to date",
        "Open items and next steps",
      ],
      notes: upcoming ? "" : [
        "Reviewed performance against the blended policy benchmark. No concerns raised.",
        "Discussed the concentrated position and agreed a staged reduction over six quarters.",
        "Confirmed the distribution schedule remains adequate through the next twelve months.",
      ][i % 3],
      actions: upcoming ? [] : [
        { text: "Send the revised investment policy statement", owner: h.advisor, due: addDays(d, 7), done: i % 3 !== 0 },
        { text: "Model the Roth conversion at three bracket levels", owner: "Marcus Devereaux", due: addDays(d, 14), done: i % 2 === 0 },
        { text: "Update the beneficiary designations with the custodian", owner: "Jenna Alvarado", due: addDays(d, 21), done: false },
      ].slice(0, 1 + (i % 3)),
    };
  });
})();

/* =========================================================
   DOCUMENTS
   ========================================================= */
const DOC_TYPES = [
  ["Quarterly performance report", "Reporting", "7 years"],
  ["Investment policy statement",  "Governance", "Life of relationship + 5"],
  ["Advisory agreement",           "Governance", "Life of relationship + 5"],
  ["Form CRS acknowledgement",     "Regulatory", "5 years"],
  ["Fee statement",                "Billing",    "7 years"],
  ["Custodial statement",          "Statements", "7 years"],
  ["Form 1099 composite",          "Tax",        "7 years"],
  ["Schedule K-1",                 "Tax",        "7 years"],
  ["Capital call notice",          "Private markets", "Life of fund + 6"],
  ["Distribution notice",          "Private markets", "Life of fund + 6"],
  ["Trust document",               "Legal",      "Permanent"],
  ["Beneficiary designation",      "Legal",      "Life of relationship + 5"],
  ["Meeting summary",              "Relationship", "5 years"],
  ["Financial plan",               "Planning",   "5 years"],
];

const DOCUMENTS = (function () {
  const out = [];
  const rnd = _rand("rp-docs");
  HOUSEHOLDS.forEach((h) => {
    DOC_TYPES.forEach((t, ti) => {
      if (ti > 6 && rnd() > 0.55) return;
      if ((t[0] === "Schedule K-1" || t[0].indexOf("call") > 0) && !h.qualified) return;
      const d = addDays(RP.asOf, -Math.floor(rnd() * 400));
      out.push({
        id: "DOC-" + String(out.length + 70000),
        hhId: h.id, hhName: h.name, advisor: h.advisor,
        type: t[0], category: t[1], retention: t[2],
        period: t[0].indexOf("Quarterly") === 0 ? "Q2 2026" : d.slice(0, 4),
        date: d,
        status: rnd() > 0.12 ? "Delivered" : "Pending",
        accessed: Math.floor(rnd() * 9),
      });
    });
  });
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
})();

/* =========================================================
   INVESTMENT COMMITTEE
   ========================================================= */
const IC_MINUTES = [
  { id: "IC-2026-08", date: "2026-08-12", chair: "David Ferreira",
    present: ["David Ferreira", "Priya Raghavan", "Nathan Cole", "Margaret Holloway", "Rachel Stern"],
    items: [
      { topic: "Meridian Global Macro — co-portfolio manager departure", decision: "Moved to Watch. No new allocations pending an October on-site.", vote: "5-0" },
      { topic: "Q3 capital market assumptions refresh", decision: "Adopted. Core fixed income expected return raised 30 bps to 4.6%.", vote: "5-0" },
      { topic: "Blackmere Secondaries Fund III", decision: "Approved for the private equity sleeve up to 20% of new commitments.", vote: "4-1" },
    ] },
  { id: "IC-2026-07", date: "2026-07-15", chair: "David Ferreira",
    present: ["David Ferreira", "Priya Raghavan", "Nathan Cole", "Margaret Holloway"],
    items: [
      { topic: "US small cap overweight", decision: "Raised to a 1.5 point overweight, funded from US large cap.", vote: "4-0" },
      { topic: "Harrowgate Core Property Trust valuation cadence", decision: "Placed on Watch pending an independent valuation review.", vote: "4-0" },
    ] },
  { id: "IC-2026-06", date: "2026-06-10", chair: "David Ferreira",
    present: ["David Ferreira", "Priya Raghavan", "Nathan Cole", "Margaret Holloway", "Rachel Stern"],
    items: [
      { topic: "Duration positioning", decision: "Extended from short to neutral across all models.", vote: "5-0" },
      { topic: "Credit underweight", decision: "Reduced high yield by 1 point, funded into private credit.", vote: "4-1" },
      { topic: "Direct indexing minimum", decision: "Lowered from $2M to $1M following the fee reduction.", vote: "5-0" },
    ] },
];

/* =========================================================
   PLANNING
   ========================================================= */
const PLANNING_GOALS = [
  { hhId: "HH-0001", goal: "Retirement income from 2029",   target: 480000, horizon: 3,  priority: "Essential", funded: 1.14 },
  { hhId: "HH-0001", goal: "Grandchildren's education",     target: 900000, horizon: 8,  priority: "Important", funded: 0.92 },
  { hhId: "HH-0001", goal: "Charitable intent at death",    target: 5000000, horizon: 25, priority: "Aspirational", funded: 1.36 },
  { hhId: "HH-0001", goal: "Second home, Door County",      target: 1800000, horizon: 2,  priority: "Important", funded: 0.78 },
];

const MC_DEFAULTS = {
  spending: 480000, retireYear: 2029, savings: 180000, allocation: "TAX",
  longevity: 95, inflation: 2.6, taxRate: 0.372, startValue: 41200000,
};

/* =========================================================
   RISK — stress scenarios and factor exposures
   ========================================================= */
const STRESS_SCENARIOS = [
  { name: "Global financial crisis (Oct 2007 – Mar 2009)", equity: -50.9, bond: 7.9, credit: -26.2, alt: -21.4, re: -37.8 },
  { name: "COVID drawdown (Feb – Mar 2020)",               equity: -33.8, bond: 3.1, credit: -12.7, alt: -9.6,  re: -24.1 },
  { name: "2022 rate shock (Jan – Oct 2022)",              equity: -24.5, bond: -15.7, credit: -14.2, alt: -6.2, re: -28.4 },
  { name: "Dot-com unwind (Mar 2000 – Oct 2002)",          equity: -44.7, bond: 24.8, credit: -6.4, alt: 6.1,   re: 18.2 },
  { name: "Parallel +200 bps rate shock",                  equity: -8.4,  bond: -11.2, credit: -7.8, alt: -2.1, re: -12.6 },
  { name: "Credit spreads widen 300 bps",                  equity: -14.2, bond: 1.4,  credit: -18.6, alt: -5.4, re: -9.8 },
];

const FACTORS = [
  { id: "market",   label: "Market (beta)",   target: 0.62 },
  { id: "size",     label: "Size",            target: -0.08 },
  { id: "value",    label: "Value",           target: 0.06 },
  { id: "quality",  label: "Quality",         target: 0.18 },
  { id: "momentum", label: "Momentum",        target: 0.02 },
  { id: "lowvol",   label: "Low volatility",  target: 0.11 },
  { id: "duration", label: "Duration",        target: 0.24 },
  { id: "credit",   label: "Credit",          target: 0.14 },
];

/* Liquidity ladder buckets used on the risk page. */
const LIQUIDITY_BUCKETS = [
  { id: "d1",  label: "1 day",     classes: ["CASH", "USLC", "USSC", "INTLD", "EM", "CORE", "MUNI", "CRED"] },
  { id: "w1",  label: "1 week",    classes: [] },
  { id: "m1",  label: "1 month",   classes: [] },
  { id: "q1",  label: "1 quarter", classes: ["HF"] },
  { id: "y1",  label: "1 year",    classes: [] },
  { id: "gt1", label: "Beyond 1 year", classes: ["PE", "PC", "RE"] },
];

/* =========================================================
   INTEGRITY: every rule from the build outline, checked at
   load. Failures print to the console rather than silently
   producing a portal whose columns do not add up.
   ========================================================= */
const TIEOUTS = (function () {
  const results = [];
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1 : tol);

  let ok = true;
  HOUSEHOLDS.forEach((h) => {
    const acctSum = householdAccounts(h.id).reduce((s, a) => s + a.mv, 0);
    const posSum = householdPositions(h.id).reduce((s, p) => s + p.value, 0);
    if (!near(acctSum, h.mv) || !near(posSum, h.mv, 2)) ok = false;
  });
  results.push(["Household MV = accounts = positions", ok]);

  let lotOk = true;
  POSITIONS.forEach((p) => {
    const ls = LOTS.filter((l) => l.posId === p.id);
    if (ls.length && !near(ls.reduce((s, l) => s + l.value, 0), p.value, 2)) lotOk = false;
  });
  results.push(["Position value = sum of tax lots", lotOk]);

  results.push(["Firm AUM = detailed + tail",
    near(FIRM.detailedAum + FIRM.tailAum, FIRM.aum, 1)]);

  results.push(["Revenue = fee schedule applied to assets",
    near(FIRM.revenue, HOUSEHOLDS.reduce((s, h) => s + annualFee(h.mv), 0)
      + FIRM.tailBook.reduce((s, t) => s + annualFee(t.mv), 0), 1)]);

  results.push(["Every household in the book is billed",
    FIRM.tailBook.length + HOUSEHOLDS.length === TOTAL_HOUSEHOLDS]);

  results.push(["Segment AUM sums to firm AUM",
    near(FIRM.firmSegments.reduce((s, x) => s + x.aum, 0), FIRM.aum, 4)]);

  results.push(["Roll-forward closes to ending AUM",
    near(ROLLFORWARD.begin + ROLLFORWARD.nna + ROLLFORWARD.marketReturn + ROLLFORWARD.fees,
      ROLLFORWARD.end, 1)]);

  let allocOk = true;
  HOUSEHOLDS.forEach((h) => {
    const a = allocationOf(householdPositions(h.id));
    if (!near(a.reduce((s, x) => s + x.actualPct, 0), 100, 0.01)) allocOk = false;
    if (!near(a.reduce((s, x) => s + x.targetPct, 0), 100, 0.01)) allocOk = false;
  });
  results.push(["Allocation sums to 100% at every level", allocOk]);

  let modelOk = true;
  MODELS.forEach((m) => {
    if (!near(Object.keys(m.t).reduce((s, k) => s + m.t[k], 0), 100, 0.01)) modelOk = false;
  });
  results.push(["Model targets sum to 100%", modelOk]);

  let privOk = true;
  COMMITMENTS.forEach((c) => {
    if (!near(c.called + c.uncalled, c.commitment, 2)) privOk = false;
  });
  results.push(["Called + uncalled = commitment", privOk]);

  let perfOk = true;
  MODELS.forEach((m) => {
    const r = MODEL_RETURNS[m.id];
    const ytd = cumulative(r.monthly.slice(-YTD_MONTHS)) * 100;
    const y3 = annualise(r.monthly);
    if (Math.abs(ytd - (r.bench.ytd + r.active)) > 0.02) perfOk = false;
    if (Math.abs(y3 - (r.bench.y3 + r.active)) > 0.02) perfOk = false;
  });
  results.push(["Model returns reproduce the blended benchmark", perfOk]);

  const failures = results.filter((r) => !r[1]);
  if (failures.length && typeof console !== "undefined") {
    console.error("Rosemont tie-out failures:", failures.map((f) => f[0]));
  }
  return results;
})();
