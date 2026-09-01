# Generates the HTML shell for every portal page.
# Page logic lives in pages/<name>.js so the shells stay identical and
# a change to the boot sequence is a one-line edit here.
import io, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
BASE = "/wealthmanagement"

PAGES = [
    # (directory, page script, <title>, topbar subtitle, og description)
    ("",             "home",        "Rosemont Partners — Private Wealth Portal", "Private Wealth Portal",
     "Client reporting, portfolio operations, global market research and firm governance in one governed system."),
    ("clients",      "clients",     "Client Book",                 "Private Wealth Portal", "A live view into every client's real world: family, career, property, assets held away and what is coming next."),
    ("households",   "households",  "Household Book",              "Private Wealth Portal", "Every household relationship, its assets, flows and service standing."),
    ("households/household", "household", "Household",             "Private Wealth Portal", "Performance, allocation, holdings, tax lots, private markets and planning for a single household."),
    ("reporting",    "reporting",   "Reporting Center",            "Private Wealth Portal", "Quarterly client package builder and release chain."),
    ("documents",    "documents",   "Document Vault",              "Private Wealth Portal", "Statements, tax forms, agreements and private-market notices."),
    ("meetings",     "meetings",    "Meeting Desk",                "Private Wealth Portal", "Client meeting preparation, notes and action items."),
    ("models",       "models",      "Models & Allocation",         "Private Wealth Portal", "Model portfolios, strategic targets and capital market assumptions."),
    ("trading",      "trading",     "Trading & Rebalancing",       "Private Wealth Portal", "Drift monitor, tax-aware trade proposals, blotter and best execution."),
    ("performance",  "performance", "Performance & Attribution",   "Private Wealth Portal", "Composite performance, attribution and contribution to return."),
    ("risk",         "risk",        "Risk Analytics",              "Private Wealth Portal", "Stress tests, factor exposures, concentration and the liquidity ladder."),
    ("markets",      "markets",     "Global Markets",              "Private Wealth Portal", "Ninety-eight benchmarks across seven boards, the Treasury curve and credit spreads."),
    ("funds",        "funds",       "Fund Research",               "Private Wealth Portal", "Seventy funds across twenty-five vehicle types, screened and scored."),
    ("funds/fund",   "fund",        "Fund Tearsheet",              "Private Wealth Portal", "Terms, returns, risk, exposure, tax and operational due diligence."),
    ("managers",     "managers",    "Manager Due Diligence",       "Private Wealth Portal", "Due-diligence workflow, manager files and memo generation."),
    ("committee",    "committee",   "Investment Committee",        "Private Wealth Portal", "House views, capital market assumptions, approved list and minutes."),
    ("private",      "private",     "Private Markets",             "Private Wealth Portal", "Commitments, capital calls, the J-curve and the pacing model."),
    ("planning",     "planning",    "Wealth Planning",             "Private Wealth Portal", "Goals, Monte Carlo, retirement cash flow and education funding."),
    ("tax",          "tax",         "Tax & Estate",                "Private Wealth Portal", "Harvesting, gain budget, Roth conversion, gifting and the estate structure."),
    ("revenue",      "revenue",     "Revenue & Billing",           "Private Wealth Portal", "Fee schedules, the quarterly billing run and revenue by adviser."),
    ("growth",       "growth",      "Growth & Pipeline",           "Private Wealth Portal", "Prospect pipeline, centres of influence and net new assets."),
    ("compliance",   "compliance",  "Compliance",                  "Private Wealth Portal", "The regulatory register, personal trading, marketing and exam readiness."),
    ("operations",   "operations",  "Operations",                  "Private Wealth Portal", "Reconciliation breaks, transfers, corporate actions and onboarding."),
    ("team",         "team",        "Team & Capacity",             "Private Wealth Portal", "Adviser capacity, service standards, credentials and succession."),
    ("brain",        "brain",       "Rosemont Brain",              "Private Wealth Portal", "Ask questions of the live portfolio, household and fund data."),
]

TPL = """<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} &middot; Rosemont Partners</title>
<meta name="description" content="{desc}">
<meta property="og:site_name" content="Rosemont Partners">
<meta property="og:title" content="{title} &middot; Rosemont Partners">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<link rel="icon" type="image/svg+xml" href="{base}/assets/brand/rosemont-mark.svg">
<link rel="stylesheet" href="{base}/css/theme.css">
<link rel="stylesheet" href="{base}/css/demo.css">
<link rel="stylesheet" href="{base}/css/rosemont.css">
</head>
<body>
<div id="topbar"></div>
<main class="page">
  <div class="demo-wrap" id="app"></div>
</main>

<script src="{base}/js/util.js"></script>
<script src="{base}/js/markets.js"></script>
<script src="{base}/js/funds.js"></script>
<script src="{base}/js/data.js"></script>
<script src="{base}/js/world.js"></script>
<script src="{base}/js/nav.js"></script>
<script src="{base}/js/research.js"></script>
<script src="{base}/js/docviewer.js"></script>
<script src="{base}/vendor/chart.umd.min.js"></script>
<script src="{base}/js/brain.js" defer></script>
<script src="{base}/pages/{page}.js"></script>
</body>
</html>
"""

written = []
for d, page, title, subtitle, desc in PAGES:
    outdir = os.path.join(ROOT, d) if d else ROOT
    if not os.path.isdir(outdir):
        os.makedirs(outdir)
    html = TPL.format(base=BASE, title=title, desc=desc, page=page)
    with io.open(os.path.join(outdir, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    written.append((d or "/") + " -> pages/" + page + ".js")

print("wrote %d page shells" % len(written))
for w in written:
    print("   " + w)
