/* =========================================================
   Blackmont Advisors — integrity check
   Loads the data layer outside the browser and asserts every
   tie-out rule from the build outline. Run before deploying:

     node scripts/tieout.js

   Following the portal-learns-from-bugs pattern, any bug
   found in the data layer becomes a new check here.
   ========================================================= */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const FILES = ["js/util.js", "js/markets.js", "js/funds.js", "js/data.js"];

const sandbox = {
  console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  document: { querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {} }), body: { appendChild() {} } },
  window: {},
  location: { pathname: "/wealthmanagement/", search: "" },
  URLSearchParams: global.URLSearchParams,
  requestAnimationFrame: () => {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);

for (const f of FILES) {
  let src = fs.readFileSync(path.join(ROOT, f), "utf8");
  /* In a browser these files share one global lexical scope. Node's vm gives
     each script its own, so promote top-level const/let to var for the check. */
  src = src.replace(/^(const|let) /gm, "var ");
  try {
    vm.runInContext(src, sandbox, { filename: f });
  } catch (e) {
    console.error("\n  LOAD FAILED in " + f + "\n  " + e.message + "\n");
    process.exit(1);
  }
}

const {
  HOUSEHOLDS, ACCOUNTS, POSITIONS, LOTS, FIRM, ROLLFORWARD, MODELS, FUNDS,
  COMMITMENTS, INDICES, TIEOUTS, allocationOf, householdPositions,
  householdAccounts, annualFee, householdReturns, TRANSACTIONS, TRADES,
  COMPLIANCE, DOCUMENTS, PROSPECTS, BREAKS, ASSET_CLASSES, VEHICLES, MANAGERS,
} = sandbox;

let failed = 0;
function check(name, pass, detail) {
  const mark = pass ? "  ok  " : "  FAIL";
  console.log(mark + "  " + name + (detail ? "   " + detail : ""));
  if (!pass) failed++;
}
const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1 : tol);
const money = (n) => "$" + (n / 1e6).toFixed(1) + "M";

console.log("\nBlackmont Advisors — data integrity\n" + "-".repeat(62));

/* --- the rules stated in the build outline --- */
TIEOUTS.forEach((t) => check(t[0], t[1]));

console.log("-".repeat(62));

/* --- coverage: does the dataset actually contain what was scoped --- */
check("40 detailed households", HOUSEHOLDS.length === 40, HOUSEHOLDS.length + "");
check("Accounts built", ACCOUNTS.length >= 140, ACCOUNTS.length + " accounts");
check("Positions built", POSITIONS.length >= 1500, POSITIONS.length + " positions");
check("Tax lots built", LOTS.length >= 2000, LOTS.length + " lots");
check("70 funds across the universe", FUNDS.length === 70, FUNDS.length + "");
check("25 vehicle types", VEHICLES.length === 25, VEHICLES.length + "");
check("12 asset classes", ASSET_CLASSES.length === 12, ASSET_CLASSES.length + "");
check("22 manager files", MANAGERS.length === 22, MANAGERS.length + "");
check("90+ benchmarks quoted", INDICES.length + sandbox.ALT_BENCH.length >= 90,
  (INDICES.length + sandbox.ALT_BENCH.length) + " across seven boards");
check("8 model portfolios", MODELS.length === 8, MODELS.length + "");
check("Private commitments", COMMITMENTS.length >= 25, COMMITMENTS.length + "");
check("Transactions", TRANSACTIONS.length >= 500, TRANSACTIONS.length + "");
check("Trade blotter", TRADES.length === 180, TRADES.length + "");
check("Compliance register", COMPLIANCE.length >= 40, COMPLIANCE.length + " items");
check("Documents", DOCUMENTS.length >= 300, DOCUMENTS.length + "");
check("Prospect pipeline", PROSPECTS.length >= 30, PROSPECTS.length + "");
check("Reconciliation breaks", BREAKS.length === 25, BREAKS.length + "");

console.log("-".repeat(62));

/* --- arithmetic that a viewer could check by hand --- */
const hhSum = HOUSEHOLDS.reduce((s, h) => s + h.mv, 0);
check("Detailed household total matches FIRM.detailedAum", near(hhSum, FIRM.detailedAum), money(hhSum));
check("Firm AUM matches the declared target", FIRM.aum > 0 && FIRM.aum === sandbox.TARGET_AUM, money(FIRM.aum));
check("Blended fee is inside the schedule's own range",
  FIRM.blendedFee > 0.0030 && FIRM.blendedFee < 0.0115,
  (FIRM.blendedFee * 10000).toFixed(1) + " bps");
/* Revenue is not asserted against a fixed range: each firm has its own
   schedule and scale. What must hold is that it equals the schedule applied
   to assets, and that the resulting blended rate is plausible for the book. */
check("Revenue equals the schedule applied to the whole book",
  Math.abs(FIRM.revenue - (HOUSEHOLDS.reduce((s, h) => s + annualFee(h.mv), 0)
    + FIRM.tailBook.reduce((s, t) => s + annualFee(t.mv), 0))) < 1,
  "$" + (FIRM.revenue / 1e6).toFixed(1) + "M");
check("Roll-forward beginning AUM is positive", ROLLFORWARD.begin > 0, money(ROLLFORWARD.begin));

/* every account belongs to a household, every position to an account */
check("No orphan accounts", ACCOUNTS.every((a) => HOUSEHOLDS.some((h) => h.id === a.hhId)));
check("No orphan positions", POSITIONS.every((p) => ACCOUNTS.some((a) => a.id === p.acctId)));
check("No orphan lots", LOTS.every((l) => POSITIONS.some((p) => p.id === l.posId)));
check("No negative position values", POSITIONS.every((p) => p.value >= 0));
check("Every position maps to a real fund", POSITIONS.every((p) => FUNDS.some((f) => f.id === p.fundId)));

/* asset location: municipals never sit in a retirement account */
check("No municipals in tax-deferred accounts",
  !POSITIONS.some((p) => p.assetClass === "MUNI" && !p.taxable));
check("No taxable core bonds in taxable accounts",
  !POSITIONS.some((p) => p.assetClass === "CORE" && p.taxable));
check("No private funds in ineligible registrations",
  !POSITIONS.some((p) => ["PE", "PC", "RE", "HF"].indexOf(p.assetClass) >= 0
    && !ACCOUNTS.find((a) => a.id === p.acctId).altEligible));

/* performance derives rather than being typed */
const r = householdReturns("HH-0001");
check("Household returns derive from the model", r && r.monthly.length === 36,
  r ? r.ytd.toFixed(2) + "% YTD net" : "missing");
check("Net return is below gross", r && r.y3 < r.y3gross,
  r ? r.y3.toFixed(2) + "% net vs " + r.y3gross.toFixed(2) + "% gross" : "");

/* the deliberate imperfections the demo needs on screen */
const drifted = HOUSEHOLDS.filter((h) => {
  const a = allocationOf(householdPositions(h.id));
  return a.some((x) => Math.abs(x.drift) > x.tolerance);
});
check("At least one household is out of tolerance", drifted.length >= 1,
  drifted.length + " drifted");
check("Watch-list funds exist", FUNDS.filter((f) => f.status === "Watch").length >= 3,
  FUNDS.filter((f) => f.status === "Watch").length + " on watch");
check("Overdue compliance items exist", COMPLIANCE.filter((c) => c.overdue).length >= 2,
  COMPLIANCE.filter((c) => c.overdue).length + " overdue");
check("Aged reconciliation breaks exist", BREAKS.filter((b) => b.age > 10).length >= 3,
  BREAKS.filter((b) => b.age > 10).length + " over ten days");
check("Wash-sale conflicts flagged", LOTS.filter((l) => l.washSale).length >= 2,
  LOTS.filter((l) => l.washSale).length + " flagged");

console.log("-".repeat(62));
if (failed) {
  console.log("\n  " + failed + " check(s) failed.\n");
  process.exit(1);
}
console.log("\n  All checks passed. "
  + HOUSEHOLDS.length + " households · " + ACCOUNTS.length + " accounts · "
  + POSITIONS.length + " positions · " + LOTS.length + " lots · "
  + FUNDS.length + " funds · " + INDICES.length + " benchmarks.\n");
