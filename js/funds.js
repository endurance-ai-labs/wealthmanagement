/* =========================================================
   ROSEMONT PARTNERS — approved list, fund universe and
   manager due-diligence files.

   Every fund, strategy and manager here is INVENTED.
   Attaching fabricated performance and due-diligence
   findings to real fund names would be misleading, so the
   universe is fictional end to end. Only the benchmarks
   the funds are measured against carry real names.
   ========================================================= */

/* ---- asset classes and the capital market assumptions behind them ---- */
const ASSET_CLASSES = [
  { id: "USLC",  label: "US Large Cap Equity",       group: "Equity",      er: 7.2,  vol: 16.5, bench: "SPX",       benchName: "S&P 500" },
  { id: "USSC",  label: "US Small & Mid Cap",        group: "Equity",      er: 7.8,  vol: 20.0, bench: "RUT",       benchName: "Russell 2000" },
  { id: "INTLD", label: "International Developed",   group: "Equity",      er: 7.5,  vol: 17.2, bench: "EAFE",      benchName: "MSCI EAFE" },
  { id: "EM",    label: "Emerging Markets Equity",   group: "Equity",      er: 8.4,  vol: 21.5, bench: "EM",        benchName: "MSCI Emerging Markets" },
  { id: "CORE",  label: "Core Fixed Income",         group: "Fixed Income",er: 4.6,  vol: 5.2,  bench: "LBUSTRUU",  benchName: "Bloomberg US Aggregate" },
  { id: "MUNI",  label: "Municipal Fixed Income",    group: "Fixed Income",er: 3.6,  vol: 4.4,  bench: "LMBITR",    benchName: "Bloomberg Municipal Bond" },
  { id: "CRED",  label: "Credit & High Yield",       group: "Fixed Income",er: 6.4,  vol: 8.6,  bench: "LF98TRUU",  benchName: "Bloomberg US Corporate High Yield" },
  { id: "CASH",  label: "Cash & Equivalents",        group: "Fixed Income",er: 3.4,  vol: 0.8,  bench: "SHY13",     benchName: "US Treasury 1-3 Year" },
  { id: "HF",    label: "Hedged Strategies",         group: "Alternatives",er: 6.2,  vol: 7.4,  bench: "HFRIFWI",   benchName: "HFRI Fund Weighted" },
  { id: "PE",    label: "Private Equity",            group: "Alternatives",er: 10.4, vol: 24.0, bench: "CAUSPE",    benchName: "Cambridge US Private Equity" },
  { id: "PC",    label: "Private Credit",            group: "Alternatives",er: 8.6,  vol: 9.5,  bench: "CDLI",      benchName: "Cliffwater Direct Lending" },
  { id: "RE",    label: "Real Assets",               group: "Alternatives",er: 7.0,  vol: 13.5, bench: "ODCE",      benchName: "NCREIF ODCE" },
];
const AC = {}; ASSET_CLASSES.forEach((a) => { AC[a.id] = a; });

/* Correlation used by the efficient frontier and the risk page. */
const CMA_CORR = {
  USLC: { USLC: 1, USSC: .88, INTLD: .84, EM: .74, CORE: .18, MUNI: .12, CRED: .71, CASH: 0, HF: .78, PE: .72, PC: .54, RE: .62 },
  USSC: { USSC: 1, INTLD: .76, EM: .68, CORE: .14, MUNI: .09, CRED: .74, CASH: 0, HF: .74, PE: .70, PC: .56, RE: .64 },
  INTLD:{ INTLD: 1, EM: .82, CORE: .26, MUNI: .18, CRED: .70, CASH: 0, HF: .76, PE: .62, PC: .48, RE: .58 },
  EM:   { EM: 1, CORE: .24, MUNI: .14, CRED: .68, CASH: 0, HF: .70, PE: .58, PC: .46, RE: .52 },
  CORE: { CORE: 1, MUNI: .86, CRED: .42, CASH: .18, HF: .22, PE: .08, PC: .28, RE: .34 },
  MUNI: { MUNI: 1, CRED: .34, CASH: .16, HF: .16, PE: .04, PC: .22, RE: .28 },
  CRED: { CRED: 1, CASH: .06, HF: .66, PE: .54, PC: .72, RE: .56 },
  CASH: { CASH: 1, HF: .04, PE: 0, PC: .08, RE: .06 },
  HF:   { HF: 1, PE: .62, PC: .52, RE: .48 },
  PE:   { PE: 1, PC: .58, RE: .54 },
  PC:   { PC: 1, RE: .46 },
  RE:   { RE: 1 },
};
function cmaCorr(a, b) {
  if (CMA_CORR[a] && CMA_CORR[a][b] != null) return CMA_CORR[a][b];
  if (CMA_CORR[b] && CMA_CORR[b][a] != null) return CMA_CORR[b][a];
  return 0;
}

/* ---- vehicle taxonomy: the whole opportunity set an adviser touches ---- */
const VEHICLES = [
  { id: "IDX",   label: "Index Fund",              liquidity: "Daily",    qual: "None" },
  { id: "MF",    label: "Open-End Fund",           liquidity: "Daily",    qual: "None" },
  { id: "ETF",   label: "Passive ETF",             liquidity: "Intraday", qual: "None" },
  { id: "AETF",  label: "Active ETF",              liquidity: "Intraday", qual: "None" },
  { id: "BETF",  label: "Buffered ETF",            liquidity: "Intraday", qual: "None" },
  { id: "CCETF", label: "Covered-Call ETF",        liquidity: "Intraday", qual: "None" },
  { id: "CEF",   label: "Closed-End Fund",         liquidity: "Intraday", qual: "None" },
  { id: "UIT",   label: "Unit Investment Trust",   liquidity: "Daily",    qual: "None" },
  { id: "CIT",   label: "Collective Trust",        liquidity: "Daily",    qual: "Plan assets" },
  { id: "MMF",   label: "Money Market Fund",       liquidity: "Same day", qual: "None" },
  { id: "ESMA",  label: "Equity SMA",              liquidity: "Daily",    qual: "None" },
  { id: "FSMA",  label: "Fixed Income SMA",        liquidity: "Daily",    qual: "None" },
  { id: "MSMA",  label: "Municipal SMA",           liquidity: "Daily",    qual: "None" },
  { id: "DIRIDX",label: "Direct Indexing",         liquidity: "Daily",    qual: "None" },
  { id: "INTV",  label: "Interval Fund",           liquidity: "Quarterly 5%", qual: "None" },
  { id: "TOF",   label: "Tender-Offer Fund",       liquidity: "Quarterly 5%", qual: "Accredited" },
  { id: "BDC",   label: "Non-Traded BDC",          liquidity: "Quarterly 5%", qual: "Accredited" },
  { id: "NTREIT",label: "Non-Traded REIT",         liquidity: "Monthly 2%",   qual: "Accredited" },
  { id: "DST",   label: "DST / 1031 Exchange",     liquidity: "None",     qual: "Accredited" },
  { id: "HFLP",  label: "Hedge Fund (LP)",         liquidity: "Quarterly, 45-day notice", qual: "Qualified purchaser" },
  { id: "PFLP",  label: "Private Fund (LP)",       liquidity: "None — drawdown", qual: "Qualified purchaser" },
  { id: "NOTE",  label: "Structured Note",         liquidity: "Hold to maturity", qual: "Accredited" },
  { id: "ANN",   label: "Annuity / Insurance",     liquidity: "Contractual", qual: "Suitability review" },
  { id: "DAF",   label: "Donor-Advised Fund",      liquidity: "Grant schedule", qual: "None" },
  { id: "QOF",   label: "Qualified Opportunity Fund", liquidity: "10-year hold", qual: "Accredited" },
];
const VEH = {}; VEHICLES.forEach((v) => { VEH[v.id] = v; });

/* ---- manager firms ---- */
const MANAGERS = [
  ["Ashford Capital Management",  "Boston, MA",       1978, 486000, "Employee-owned", "Deep bench, low turnover; the firm's index and core bond desks are the backbone of our passive sleeve."],
  ["Kestrel Asset Management",    "Malvern, PA",      1986, 1240000, "Public", "Lowest-cost index provider on the platform; operational depth is the reason they carry the beta."],
  ["Brightwater Advisors",        "Charlotte, NC",    2002, 18400, "Employee-owned", "Dividend-value discipline that has held through three drawdowns without style drift."],
  ["Northmoor Investment Partners","New York, NY",    1994, 62000, "Employee-owned", "Quality-growth house. Concentrated, high active share, tolerant of tracking error."],
  ["Sable Ridge Capital",         "Greenwich, CT",    2007, 9800, "Partner-owned", "Relative-value and global quality; strong risk culture, thin succession bench."],
  ["Corvine Global Investors",    "London, UK",       1999, 44000, "Employee-owned", "European specialist that has broadened into global long/short. Consistent process."],
  ["Thornbury Asset Management",  "Chicago, IL",      1991, 27500, "Employee-owned", "Small-cap value with genuine capacity discipline; closed the flagship twice."],
  ["Vantage Rowe Investments",    "San Francisco, CA",1988, 84000, "Public", "Broad shelf. We use two strategies and monitor the rest; house-level turnover is elevated."],
  ["Marchmont Partners",          "New York, NY",     2004, 21600, "Partner-owned", "Event-driven and mezzanine. Alignment is strong; GP commitment above peer median."],
  ["Ledgewood Credit Partners",   "Stamford, CT",     2009, 38200, "Partner-owned", "Direct lending platform with an internal workout team, which is why we sized the allocation."],
  ["Halloway & Finch",            "Philadelphia, PA", 1963, 52400, "Employee-owned", "Municipal specialist. Ladder construction and credit surveillance are best in class."],
  ["Piedmont Reach Capital",      "Atlanta, GA",      2011, 14800, "Partner-owned", "Emerging markets and real assets. Newer firm; we monitor key-person risk closely."],
  ["Oakstone Private Equity",     "Boston, MA",       1996, 32000, "Partner-owned", "Middle-market buyout, four funds with us. Consistent sourcing, disciplined on entry price."],
  ["Ferndale Growth Partners",    "Menlo Park, CA",   2008, 11400, "Partner-owned", "Growth equity into software and health-tech. Marks have been conservative relative to peers."],
  ["Quill River Ventures",        "Palo Alto, CA",    2001, 6800, "Partner-owned", "Early-stage venture. Long duration, wide dispersion, sized accordingly."],
  ["Blackmere Secondaries",       "New York, NY",     2013, 18900, "Partner-owned", "LP-led and GP-led secondaries. Shortens the J-curve for newer private allocations."],
  ["Stonebrook Infrastructure",   "Denver, CO",       2006, 24600, "Partner-owned", "Core-plus infrastructure and energy transition. Long-dated, inflation-linked cash flows."],
  ["Harrowgate Real Estate",      "Dallas, TX",       1989, 29400, "Partner-owned", "Core through value-add property. Their 2022 vintage marks have been slow to reset."],
  ["Meridian Macro Advisers",     "Westport, CT",     2010, 7200, "Partner-owned", "Discretionary global macro. Co-portfolio manager departed in June; strategy on watch."],
  ["Cavendish Structured Solutions","New York, NY",   2015, 8600, "Bank-affiliated", "Structured notes and specialty finance. Counterparty concentration is the monitored risk."],
  ["Fairhaven Insurance Advisors","Hartford, CT",     1971, 46000, "Mutual", "Insurance-dedicated vehicles. Used only where the tax or longevity case is clear."],
  ["Larkspur Capital Group",      "Minneapolis, MN",  1997, 16200, "Employee-owned", "Defined-outcome and managed futures. Mechanical process, low key-person risk."],
].map((m, i) => ({
  id: "MGR-" + String(i + 1).padStart(2, "0"),
  name: m[0], hq: m[1], founded: m[2], firmAum: m[3], ownership: m[4], view: m[5],
}));
const MGR = {}; MANAGERS.forEach((m) => { MGR[m.name] = m; });

/* ---------------------------------------------------------
   FUND UNIVERSE
   [id, name, manager, assetClass, vehicle, strategy, code,
    inception, aum($M), minimum($K), mgmtFee%, perfFee%,
    status, scores[People,Process,Performance,Fit,Price,Ops],
    returns[y1,y3,y5,y10,itd],
    private[vintage, commitment$M, called%, tvpi, dpi, netIRR] | null]
   --------------------------------------------------------- */
const FUND_ROWS = [
  /* --- US large cap --- */
  ["F-001","Ashford US Large Cap Index Fund","Ashford Capital Management","USLC","IDX","Passive full replication of the US large cap market","AUSLX","2004-03-01",42800,10,0.03,0,"Approved",[4,5,4,5,5,5],[14.1,12.5,13.8,12.3,11.4],null],
  ["F-002","Kestrel US Core Equity ETF","Kestrel Asset Management","USLC","ETF","Total US market beta at the lowest available cost","KUSE","2011-06-14",96400,0,0.02,0,"Approved",[4,5,4,5,5,5],[13.9,12.2,13.5,12.1,12.8],null],
  ["F-003","Northmoor Quality Growth Fund","Northmoor Investment Partners","USLC","MF","Concentrated quality growth, 28 to 34 names, high active share","NQGFX","1998-09-30",18600,25,0.62,0,"Approved",[5,5,4,4,3,4],[17.8,14.9,16.2,14.6,11.9],null],
  ["F-004","Brightwater US Dividend Value","Brightwater Advisors","USLC","ESMA","Dividend growth and free cash flow yield, 45 to 60 names","BWDV","2005-01-03",8900,500,0.45,0,"Approved",[4,4,4,4,4,4],[9.4,8.6,10.9,9.4,9.1],null],
  ["F-005","Rosemont Direct Index — US Large Cap","Kestrel Asset Management","USLC","DIRIDX","Index replication in individual securities with continuous loss harvesting","RPDI","2019-04-01",1840,1000,0.20,0,"Approved",[4,5,4,5,5,4],[13.8,12.1,13.4,null,12.9],null],
  ["F-006","Corvine Concentrated Equity ETF","Corvine Global Investors","USLC","AETF","Active, 22 to 26 names, benchmark-agnostic","CCEQ","2020-02-11",3400,0,0.55,0,"Watch",[4,4,2,3,3,4],[8.9,7.1,11.2,null,10.4],null],
  ["F-007","Larkspur Buffered US Equity — September","Larkspur Capital Group","USLC","BETF","S&P 500 exposure with a 15% downside buffer over 12 months","LBSP","2021-09-20",1240,0,0.74,0,"Approved",[4,4,4,4,3,5],[9.1,8.4,null,null,8.8],null],
  ["F-008","Kestrel Covered Call Income ETF","Kestrel Asset Management","USLC","CCETF","Systematic index call overwriting for current income","KCCI","2017-05-08",6200,0,0.35,0,"Approved",[4,4,3,3,4,5],[10.2,9.1,10.4,null,9.6],null],
  ["F-009","Northmoor Closed-End Value Fund","Northmoor Investment Partners","USLC","CEF","Deep value with modest leverage, trading at a discount to NAV","NCVF","1993-11-15",1680,0,0.88,0,"Approved",[4,4,3,3,3,4],[11.4,9.8,12.1,10.2,9.8],null],
  ["F-010","Ashford Target Retirement 2045 Trust","Ashford Capital Management","USLC","CIT","Glide-path allocation for retirement plan assets","ATR45","2010-01-04",21400,0,0.08,0,"Approved",[4,4,4,4,5,5],[11.8,9.9,11.4,10.1,9.6],null],

  /* --- US small & mid --- */
  ["F-011","Kestrel US Small Cap Index ETF","Kestrel Asset Management","USSC","ETF","Passive small cap beta","KSML","2010-09-22",28600,0,0.04,0,"Approved",[4,5,3,5,5,5],[5.9,4.8,8.2,7.7,8.9],null],
  ["F-012","Thornbury Small Cap Value Fund","Thornbury Asset Management","USSC","MF","Small cap value, capacity-constrained, closed twice since inception","TSCVX","1994-07-01",4200,25,0.78,0,"Approved",[5,5,4,4,3,4],[8.4,7.9,12.4,10.1,11.2],null],
  ["F-013","Vantage Rowe Mid Cap Growth","Vantage Rowe Investments","USSC","MF","Mid cap growth with a quality overlay","VRMGX","1999-03-15",9800,25,0.68,0,"Approved",[3,4,4,4,3,4],[10.6,8.4,11.8,10.9,10.4],null],

  /* --- International developed --- */
  ["F-014","Kestrel International Developed Index ETF","Kestrel Asset Management","INTLD","ETF","Passive developed ex-US beta","KIDX","2009-08-04",64200,0,0.05,0,"Approved",[4,5,4,5,5,5],[10.6,8.4,9.0,6.2,6.8],null],
  ["F-015","Marchmont International Equity Fund","Marchmont Partners","INTLD","MF","Developed ex-US, valuation-aware, currency unhedged","MIEFX","2006-05-01",6400,25,0.71,0,"Approved",[4,4,4,4,3,4],[12.8,10.2,10.8,7.4,7.1],null],
  ["F-016","Sable Ridge Global ex-US Quality","Sable Ridge Capital","INTLD","ESMA","Quality-biased developed ex-US separate account","SRGQ","2012-10-01",3800,1000,0.55,0,"Approved",[4,5,4,4,4,4],[11.9,9.8,10.4,null,9.2],null],
  ["F-017","Corvine European Opportunities","Corvine Global Investors","INTLD","MF","Pan-European all cap, benchmark-agnostic","CEOFX","2001-04-02",5100,25,0.74,0,"Approved",[4,4,4,3,3,4],[13.4,10.9,11.2,6.8,7.4],null],

  /* --- Emerging markets --- */
  ["F-018","Kestrel Emerging Markets Index ETF","Kestrel Asset Management","EM","ETF","Passive emerging markets beta","KEMX","2010-01-20",42600,0,0.09,0,"Approved",[4,5,3,5,5,5],[8.1,3.9,4.6,4.0,4.4],null],
  ["F-019","Piedmont Reach EM Equity Fund","Piedmont Reach Capital","EM","MF","Emerging markets, domestic-demand tilt, 55 to 70 names","PREMX","2013-06-03",2900,25,0.89,0,"Approved",[4,4,4,3,2,3],[11.2,6.8,7.4,null,6.1],null],
  ["F-020","Thornbury Frontier & EM Small Cap","Thornbury Asset Management","EM","CEF","Frontier and EM small cap, closed-end structure for illiquid names","TFEM","2016-02-10",840,0,1.15,0,"Watch",[3,3,2,3,2,3],[4.2,-1.8,3.1,null,2.4],null],

  /* --- Core fixed income --- */
  ["F-021","Ashford Core Bond Fund","Ashford Capital Management","CORE","MF","Core intermediate, benchmark-aware, no off-benchmark credit","ACBFX","1988-01-04",34200,10,0.24,0,"Approved",[4,5,4,5,4,5],[6.6,2.4,-0.1,2.1,4.8],null],
  ["F-022","Kestrel US Aggregate Index ETF","Kestrel Asset Management","CORE","ETF","Passive aggregate bond beta","KAGG","2007-04-10",118000,0,0.03,0,"Approved",[4,5,4,5,5,5],[6.3,2.0,-0.5,1.7,3.1],null],
  ["F-023","Halloway & Finch Intermediate Gov/Credit","Halloway & Finch","CORE","FSMA","Laddered government and credit separate account","HFIGC","1996-01-02",12400,500,0.22,0,"Approved",[5,5,4,4,5,5],[6.4,2.6,0.2,2.2,4.4],null],
  ["F-024","Ashford Short Duration Fund","Ashford Capital Management","CORE","MF","One to three year duration, liquidity reserve sleeve","ASDFX","2003-09-15",16800,10,0.18,0,"Approved",[4,5,4,5,5,5],[5.2,3.6,1.8,1.5,2.4],null],
  ["F-025","Kestrel TIPS Index ETF","Kestrel Asset Management","CORE","ETF","Passive inflation-protected Treasury beta","KTIP","2008-11-03",22400,0,0.05,0,"Approved",[4,5,3,4,5,5],[6.0,3.1,2.0,2.3,2.8],null],

  /* --- Municipals --- */
  ["F-026","Rosemont Municipal Ladder 1–15 Year","Halloway & Finch","MUNI","MSMA","Laddered high-grade municipals, customised to state of residence","RPML","2008-01-02",2840,500,0.25,0,"Approved",[5,5,4,5,5,5],[5.6,2.8,1.0,2.3,3.1],null],
  ["F-027","Halloway & Finch National Municipal Fund","Halloway & Finch","MUNI","MF","Intermediate national municipal, AA average quality","HFNMX","1984-05-01",18900,10,0.34,0,"Approved",[5,5,4,4,4,5],[5.4,2.6,0.9,2.2,4.1],null],
  ["F-028","Halloway & Finch High Yield Municipal","Halloway & Finch","MUNI","MF","Lower-rated and non-rated municipal credit","HFHMX","1998-03-02",7400,25,0.52,0,"Approved",[5,4,4,3,4,5],[9.1,5.2,2.5,4.0,4.6],null],
  ["F-029","Kestrel Short Municipal ETF","Kestrel Asset Management","MUNI","ETF","One to five year municipal beta","KSMU","2013-01-15",9600,0,0.07,0,"Approved",[4,5,3,4,5,5],[4.1,2.9,1.6,1.4,1.8],null],
  ["F-030","Rosemont California Municipal SMA","Halloway & Finch","MUNI","MSMA","California state-specific ladder for high-bracket residents","RPCM","2011-06-01",1180,500,0.25,0,"Approved",[5,5,4,5,5,5],[5.5,2.7,0.9,2.2,2.8],null],
  ["F-031","Ashford Municipal Unit Trust — Series 92","Ashford Capital Management","MUNI","UIT","Fixed portfolio of insured municipals, defined termination","AMUT92","2024-09-16",180,5,0.15,0,"Approved",[4,4,3,2,4,5],[5.1,null,null,null,4.8],null],

  /* --- Credit --- */
  ["F-032","Ledgewood High Yield Fund","Ledgewood Credit Partners","CRED","MF","Upper-tier high yield, no CCC below 5% of the portfolio","LHYFX","2011-02-01",6800,25,0.55,0,"Approved",[4,5,4,4,4,4],[10.4,7.8,5.2,5.4,6.1],null],
  ["F-033","Ledgewood Bank Loan Fund","Ledgewood Credit Partners","CRED","MF","Senior secured floating rate loans","LBLFX","2013-08-01",4200,25,0.62,0,"Approved",[4,4,4,4,4,4],[8.4,8.6,6.4,4.8,5.2],null],
  ["F-034","Piedmont Reach Emerging Markets Debt","Piedmont Reach Capital","CRED","MF","Hard-currency sovereign and quasi-sovereign","PREDX","2015-04-01",1900,25,0.68,0,"Approved",[4,4,4,3,3,3],[8.9,5.1,1.4,null,3.6],null],
  ["F-035","Kestrel Preferred Securities ETF","Kestrel Asset Management","CRED","ETF","Institutional preferred and hybrid securities","KPFD","2012-03-19",8400,0,0.11,0,"Approved",[4,4,3,3,5,5],[7.6,3.3,0.8,3.4,3.9],null],

  /* --- Cash --- */
  ["F-036","Ashford Government Money Market","Ashford Capital Management","CASH","MMF","Government-only money market, daily liquidity","AGMXX","1982-06-01",84600,1,0.11,0,"Approved",[4,5,4,5,5,5],[4.6,4.4,2.8,1.8,2.4],null],
  ["F-037","Rosemont Treasury Bill Ladder","Halloway & Finch","CASH","FSMA","Direct Treasury bill ladder for balances above $2M","RPTB","2022-01-04",940,2000,0.08,0,"Approved",[5,5,4,5,5,5],[4.8,4.6,null,null,4.4],null],

  /* --- Hedged strategies --- */
  ["F-038","Meridian Global Macro Fund, L.P.","Meridian Macro Advisers","HF","HFLP","Discretionary global macro across rates, FX and commodities","MGMLP","2011-01-01",4100,1000,1.50,20,"Watch",[2,3,2,3,2,4],[1.4,3.8,6.9,5.1,7.2],null],
  ["F-039","Corvine Long/Short Equity, L.P.","Corvine Global Investors","HF","HFLP","Global long/short equity, 45% to 65% net","CLSLP","2008-04-01",3600,1000,1.50,20,"Approved",[4,4,4,4,3,4],[12.1,9.4,10.2,7.6,8.4],null],
  ["F-040","Marchmont Event-Driven Offshore, Ltd.","Marchmont Partners","HF","HFLP","Merger arbitrage and hard catalyst event-driven","MEDO","2009-07-01",2900,1000,1.50,20,"Approved",[4,5,4,4,3,4],[9.8,7.6,8.9,6.2,7.4],null],
  ["F-041","Sable Ridge Relative Value, L.P.","Sable Ridge Capital","HF","HFLP","Fixed income relative value and convertible arbitrage","SRRV","2012-01-01",2400,1000,1.25,15,"Approved",[4,4,4,4,4,4],[8.2,7.1,6.6,null,6.9],null],
  ["F-042","Vantage Rowe Multi-Strategy Fund, L.P.","Vantage Rowe Investments","HF","HFLP","Internally allocated multi-strategy with centralised risk","VRMS","2014-01-01",8900,2000,2.00,20,"Approved",[4,4,5,4,2,5],[11.4,10.2,9.6,null,9.1],null],
  ["F-043","Larkspur Managed Futures Fund","Larkspur Capital Group","HF","MF","Systematic trend following in a daily liquid wrapper","LMFTX","2013-05-01",2100,25,1.05,0,"Approved",[4,4,3,4,3,5],[-1.6,3.4,8.1,2.8,3.4],null],
  ["F-044","Blackmere Diversified Hedge Fund of Funds","Blackmere Secondaries","HF","HFLP","Multi-manager hedge allocation for smaller qualified accounts","BDHF","2015-01-01",1600,500,0.85,10,"Approved",[4,4,3,3,2,4],[7.9,6.4,6.1,null,5.8],null],
  ["F-045","Cavendish Tender-Offer Alternative Fund","Cavendish Structured Solutions","HF","TOF","Registered multi-strategy alternative with quarterly tenders","CTOAX","2019-10-01",1240,50,1.65,10,"Approved",[3,4,3,4,2,4],[8.6,7.2,null,null,6.8],null],

  /* --- Private equity --- */
  ["F-046","Oakstone Private Equity Fund VII, L.P.","Oakstone Private Equity","PE","PFLP","North American middle-market buyout, control positions","OPE7","2024-06-30",2400,5000,2.00,20,"Approved",[5,5,4,5,3,5],[null,null,null,null,4.2],[2024,2400,28,1.06,0.00,4.2]],
  ["F-047","Oakstone Private Equity Fund VI, L.P.","Oakstone Private Equity","PE","PFLP","North American middle-market buyout, prior vintage","OPE6","2021-03-31",1800,5000,2.00,20,"Approved",[5,5,5,5,3,5],[null,null,null,null,18.4],[2021,1800,88,1.74,0.62,18.4]],
  ["F-048","Ferndale Growth Partners IV, L.P.","Ferndale Growth Partners","PE","PFLP","Growth equity into software and health technology","FGP4","2023-09-30",1100,5000,2.00,20,"Approved",[4,5,4,4,3,4],[null,null,null,null,11.6],[2023,1100,54,1.28,0.08,11.6]],
  ["F-049","Quill River Ventures Fund V, L.P.","Quill River Ventures","PE","PFLP","Early-stage venture, seed through Series B","QRV5","2022-04-30",640,5000,2.50,25,"Watch",[4,4,2,3,2,4],[null,null,null,null,2.8],[2022,640,72,1.11,0.02,2.8]],
  ["F-050","Blackmere Secondaries Fund III, L.P.","Blackmere Secondaries","PE","PFLP","LP-led and GP-led secondaries, discount-driven","BMS3","2025-01-31",1400,5000,1.50,15,"Approved",[5,5,4,5,4,5],[null,null,null,null,14.8],[2025,1400,34,1.16,0.06,14.8]],
  ["F-051","Oakstone Co-Investment Vehicle II, L.P.","Oakstone Private Equity","PE","PFLP","No-fee, no-carry co-investment alongside the flagship","OCO2","2024-09-30",520,5000,0.00,0,"Approved",[5,5,4,4,5,5],[null,null,null,null,9.4],[2024,520,46,1.12,0.00,9.4]],
  ["F-052","Northmoor Continuation Fund I, L.P.","Northmoor Investment Partners","PE","PFLP","Single-asset continuation vehicle, extended hold","NCF1","2025-06-30",380,5000,1.25,12.5,"Under Review",[4,3,null,3,4,4],[null,null,null,null,null],[2025,380,18,1.02,0.00,null]],

  /* --- Private credit --- */
  ["F-053","Ledgewood Direct Lending Fund IV, L.P.","Ledgewood Credit Partners","PC","PFLP","Senior secured direct lending to sponsor-backed borrowers","LDL4","2023-06-30",2900,5000,1.50,15,"Approved",[5,5,4,5,4,5],[null,null,null,null,12.4],[2023,2900,76,1.22,0.24,12.4]],
  ["F-054","Ledgewood Private Credit Income Fund","Ledgewood Credit Partners","PC","INTV","Evergreen direct lending in an interval fund wrapper","LPCIX","2021-11-01",6200,50,1.25,12.5,"Approved",[5,4,4,5,3,5],[10.8,10.4,null,null,9.8],null],
  ["F-055","Marchmont Mezzanine Partners III, L.P.","Marchmont Partners","PC","PFLP","Junior capital and structured equity for the middle market","MMP3","2022-03-31",840,5000,1.75,17.5,"Approved",[4,4,4,4,3,4],[null,null,null,null,10.9],[2022,840,84,1.34,0.31,10.9]],
  ["F-056","Sable Ridge Opportunistic Credit II, L.P.","Sable Ridge Capital","PC","PFLP","Stressed, distressed and special situations credit","SROC2","2024-03-31",680,5000,1.75,17.5,"Approved",[4,4,null,4,3,4],[null,null,null,null,8.1],[2024,680,42,1.09,0.04,8.1]],
  ["F-057","Cavendish Specialty Finance BDC","Cavendish Structured Solutions","PC","BDC","Non-traded BDC lending to asset-backed and specialty borrowers","CSFB","2020-07-01",4400,25,1.25,12.5,"Approved",[3,4,4,4,3,4],[9.6,9.9,8.8,null,8.4],null],

  /* --- Real assets --- */
  ["F-058","Harrowgate Core Property Trust","Harrowgate Real Estate","RE","NTREIT","Perpetual core property, industrial and residential weighted","HCPT","2018-01-01",9800,25,1.00,10,"Watch",[4,4,2,4,3,4],[2.1,-3.4,3.6,null,4.8],null],
  ["F-059","Harrowgate Value-Add Fund V, L.P.","Harrowgate Real Estate","RE","PFLP","Value-add property, lease-up and repositioning","HVA5","2023-03-31",1200,5000,1.50,20,"Approved",[4,4,3,4,3,4],[null,null,null,null,7.4],[2023,1200,68,1.14,0.09,7.4]],
  ["F-060","Stonebrook Infrastructure Partners III, L.P.","Stonebrook Infrastructure","RE","PFLP","Core-plus infrastructure with contracted cash flows","SIP3","2022-09-30",1900,5000,1.50,15,"Approved",[5,5,4,5,4,5],[null,null,null,null,13.2],[2022,1900,81,1.41,0.28,13.2]],
  ["F-061","Stonebrook Energy Transition Fund I, L.P.","Stonebrook Infrastructure","RE","PFLP","Grid, storage and renewable generation assets","SET1","2025-03-31",900,5000,1.75,17.5,"Approved",[5,4,null,4,3,5],[null,null,null,null,6.8],[2025,900,26,1.05,0.00,6.8]],
  ["F-062","Piedmont Reach Farmland Fund II, L.P.","Piedmont Reach Capital","RE","PFLP","Row crop and permanent crop farmland, operated leases","PRF2","2021-06-30",480,5000,1.25,15,"Approved",[4,4,4,3,4,4],[null,null,null,null,9.1],[2021,480,94,1.38,0.42,9.1]],
  ["F-063","Kestrel Global REIT Index ETF","Kestrel Asset Management","RE","ETF","Passive global listed real estate","KREI","2011-09-07",7600,0,0.08,0,"Approved",[4,5,2,4,5,5],[3.6,-0.6,4.8,6.0,6.4],null],
  ["F-064","Harrowgate 1031 Exchange DST — Riverpoint Logistics","Harrowgate Real Estate","RE","DST","Single-asset Delaware statutory trust for 1031 exchanges","HDST-RP","2025-04-01",84,100,1.10,0,"Approved",[4,4,null,3,3,4],[null,null,null,null,5.6],null],

  /* --- Structured, insurance and purpose-built --- */
  ["F-065","Cavendish 3-Year Buffered Note — S&P 500","Cavendish Structured Solutions","USLC","NOTE","1.35x upside to a 42% cap with a 20% downside buffer","CAV-B3","2025-11-14",120,10,0.00,0,"Approved",[3,4,null,3,4,3],[null,null,null,null,7.9],null],
  ["F-066","Fairhaven Registered Index-Linked Annuity","Fairhaven Insurance Advisors","USLC","ANN","Six-year RILA, 20% buffer, index-linked crediting","FH-RILA","2024-02-01",0,25,1.05,0,"Approved",[4,4,null,3,2,5],[null,null,null,null,6.4],null],
  ["F-067","Fairhaven Single Premium Immediate Annuity","Fairhaven Insurance Advisors","CASH","ANN","Life-contingent income, joint and survivor available","FH-SPIA","2023-01-01",0,100,0.00,0,"Approved",[4,4,null,3,3,5],[null,null,null,null,null],null],
  ["F-068","Fairhaven Private Placement Life Platform","Fairhaven Insurance Advisors","HF","ANN","Insurance-dedicated funds inside a PPLI wrapper","FH-PPLI","2022-06-01",0,2000,0.55,0,"Approved",[4,4,null,4,3,5],[null,null,null,null,8.2],null],
  ["F-069","Rosemont Charitable Donor-Advised Fund","Ashford Capital Management","USLC","DAF","Granting vehicle invested in the household's own model","RPDAF","2009-01-01",412,5,0.25,0,"Approved",[5,5,4,5,5,5],[11.6,9.8,11.2,10.1,9.4],null],
  ["F-070","Piedmont Reach Opportunity Zone Fund II, L.P.","Piedmont Reach Capital","RE","QOF","Qualified opportunity zone development, ten-year hold","PROZ2","2022-12-31",340,5000,1.50,15,"Watch",[3,3,2,3,3,3],[null,null,null,null,4.1],[2022,340,88,1.08,0.00,4.1]],
];

/* ---------------------------------------------------------
   Expand rows into full fund objects, deriving the risk
   statistics from the authored returns, the asset class
   volatility and a fixed per-fund seed. Nothing is typed
   twice, so a tearsheet's Sharpe always agrees with the
   return and volatility shown beside it.
   --------------------------------------------------------- */
const RF = 3.6; /* risk-free assumption used across the platform */

function _fRand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FUNDS = FUND_ROWS.map((r) => {
  const [id, name, manager, ac, vehicle, strategy, code, inception,
         aum, min, mgmtFee, perfFee, status, scores, rets, priv] = r;
  const cls = AC[ac];
  const rnd = _fRand("rp-fund-" + id);
  const isPrivate = !!priv;
  const passive = ["IDX", "ETF", "DIRIDX", "CIT", "UIT"].indexOf(vehicle) >= 0;

  /* Benchmark comparison, taken from the live market board. */
  const bq = (typeof IDX !== "undefined" && IDX[cls.bench]) ? IDX[cls.bench] : null;
  const alt = (typeof ALT_BENCH !== "undefined") ? ALT_BENCH.find((a) => a.code === cls.bench) : null;
  const bench = bq || alt || { y1: cls.er, y3: cls.er, y5: cls.er, y10: cls.er };

  /* Volatility: passive tracks the class, active disperses around it. */
  const sd = +(cls.vol * (passive ? 0.99 + rnd() * 0.03 : 0.82 + rnd() * 0.42)).toFixed(1);
  const corr = passive ? 0.995 : 0.72 + rnd() * 0.24;
  const beta = +((sd / cls.vol) * corr).toFixed(2);
  const r2 = +(corr * corr).toFixed(2);

  const r3 = rets[1] != null ? rets[1] : (rets[4] != null ? rets[4] : cls.er);
  const b3 = bench.y3 != null ? bench.y3 : cls.er;
  const alpha = +(r3 - (RF + beta * (b3 - RF))).toFixed(2);
  const sharpe = +((r3 - RF) / sd).toFixed(2);
  const sortino = +(sharpe * (1.24 + rnd() * 0.28)).toFixed(2);
  const te = +(passive ? 0.04 + rnd() * 0.12 : 2.4 + rnd() * 4.2).toFixed(2);
  const infoRatio = +((r3 - b3) / te).toFixed(2);
  const maxDD = -+(cls.vol * (1.1 + rnd() * 0.8)).toFixed(1);
  const recovery = Math.round(6 + rnd() * 22);
  const upCap = +(beta * 100 + (alpha > 0 ? 4 + rnd() * 8 : -(2 + rnd() * 6))).toFixed(0);
  const downCap = +(beta * 100 - (alpha > 0 ? 5 + rnd() * 9 : -(1 + rnd() * 7))).toFixed(0);

  /* Calendar-year returns, anchored so the mean lands on the 5-year figure. */
  const anchor = rets[2] != null ? rets[2] : (rets[4] != null ? rets[4] : cls.er);
  const calendar = [2021, 2022, 2023, 2024, 2025].map((yr, i) => {
    const regime = [1.9, -1.35, 1.55, 1.15, 0.75][i]; /* strong, drawdown, recovery, up, modest */
    return { year: yr, ret: +(anchor * regime + (rnd() - 0.5) * sd * 0.55).toFixed(1) };
  });

  /* Tax profile. */
  const turnover = passive ? Math.round(3 + rnd() * 8) : Math.round(18 + rnd() * 72);
  const taxCost = +(passive ? 0.18 + rnd() * 0.22 : 0.55 + rnd() * 1.3).toFixed(2);
  const taxForm = isPrivate || vehicle === "HFLP" ? "Schedule K-1" : "Form 1099";

  const scoreAvg = (function () {
    const v = scores.filter((s) => s != null);
    return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null;
  })();

  return {
    id, name, manager, ac, acLabel: cls.label, vehicle,
    vehicleLabel: VEH[vehicle].label, strategy, code, inception,
    aum, min, mgmtFee, perfFee, status, scores, scoreAvg,
    y1: rets[0], y3: rets[1], y5: rets[2], y10: rets[3], itd: rets[4],
    priv: priv ? {
      vintage: priv[0], commitment: priv[1], calledPct: priv[2],
      tvpi: priv[3], dpi: priv[4], rvpi: +(priv[3] - priv[4]).toFixed(2), irr: priv[5],
    } : null,
    isPrivate,
    passive,
    liquidity: VEH[vehicle].liquidity,
    qualification: VEH[vehicle].qual,
    benchCode: cls.bench, benchName: cls.benchName,
    benchY1: bench.y1, benchY3: bench.y3, benchY5: bench.y5, benchY10: bench.y10,
    risk: { sd, beta, r2, alpha, sharpe, sortino, te, infoRatio, maxDD, recovery, upCap, downCap },
    calendar, turnover, taxCost, taxForm,
    /* Operational due diligence — the file behind every approval. */
    ops: {
      auditor:    ["Marlowe & Sterne LLP", "Cranfield Audit Group", "Hobbs Whitaker LLP", "Dunmore Assurance"][Math.floor(rnd() * 4)],
      admin:      ["Cranmere Fund Services", "Belport Administration", "Northgate Fund Services"][Math.floor(rnd() * 3)],
      custodian:  ["Schwab Advisor Services", "Fidelity Institutional", "Pershing", "Ravenswood Trust"][Math.floor(rnd() * 4)],
      counsel:    ["Prescott Vane LLP", "Ashby Crane & Doyle", "Rowe Lambert LLP"][Math.floor(rnd() * 3)],
      valuation:  isPrivate ? "Quarterly, independent third-party valuation agent" : "Daily, administrator-struck NAV",
      keyPerson:  isPrivate || vehicle === "HFLP" ? "Yes — two named principals, 24-month suspension trigger" : "Not applicable",
      gpCommit:   isPrivate ? +(1.5 + rnd() * 3.5).toFixed(1) + "% of commitments" : "Not applicable",
      sideLetter: isPrivate ? (rnd() > 0.5 ? "MFN elected; fee break at $10M" : "MFN elected; no economic terms") : "Not applicable",
      lastOnsite: ["2026-02-11", "2026-04-23", "2025-11-06", "2026-06-18", "2026-01-29"][Math.floor(rnd() * 5)],
      regHistory: id === "F-038" ? "No disciplinary history. Co-portfolio manager departed June 2026." : "No disciplinary history disclosed",
    },
  };
});
const FUND = {}; FUNDS.forEach((f) => { FUND[f.id] = f; });

const SCORE_LABELS = ["People", "Process", "Performance", "Portfolio fit", "Price", "Operations"];

/* ---- watch-list triggers and IC decision history ---- */
const WATCH_NOTES = {
  "F-006": "Three-year return trails the S&P 500 by more than 500 bps with tracking error above the 6% band set at approval. Review scheduled for the October committee.",
  "F-020": "Assets have fallen below the $1B viability threshold and the discount to NAV has averaged 12% for four quarters.",
  "F-038": "Co-portfolio manager departed in June 2026. Key-person language was not triggered, but the research team has recommended no new allocations pending an on-site in October.",
  "F-049": "TVPI of 1.11x at four years is bottom-quartile for the 2022 venture vintage. Deployment pace was faster than the pacing model assumed.",
  "F-058": "Three-year return of -3.4% reflects a slower mark-down than listed real estate. Independent valuation cadence under review.",
  "F-070": "Development timeline has slipped two quarters against the original plan and the sponsor has requested an extension of the investment period.",
};

/* ---- due-diligence workflow state ---- */
const DD_WORKFLOW = FUNDS.filter((f) => !f.passive).slice(0, 22).map((f, i) => {
  const rnd = _fRand("rp-dd-" + f.id);
  const stages = ["Questionnaire", "Reference calls", "Background checks", "ADV & document review", "On-site visit", "Committee memo"];
  const done = f.status === "Under Review" ? 2 + Math.floor(rnd() * 2) : 6;
  return {
    fundId: f.id, fund: f.name, manager: f.manager,
    analyst: ["Priya Raghavan", "Nathan Cole", "David Ferreira"][i % 3],
    stages, done,
    opened: ["2026-05-04", "2026-06-12", "2026-03-18", "2026-07-01", "2026-02-24"][i % 5],
    refresh: ["2027-02-11", "2027-04-23", "2026-11-06", "2027-06-18", "2027-01-29"][i % 5],
    status: f.status,
  };
});

/* ---- house views by asset class, set by the investment committee ---- */
const HOUSE_VIEWS = [
  ["USLC",  "Neutral",            "Medium", "Valuation is demanding and concentration is at a record, but earnings breadth is improving. We hold the benchmark weight and express the caution through quality rather than through cash."],
  ["USSC",  "Modest overweight",  "Long",   "The valuation discount to large cap is near a two-decade wide. We funded a 1.5 point overweight in June from US large cap."],
  ["INTLD", "Modest overweight",  "Long",   "Currency and valuation both work in the client's favour from here. Unhedged, deliberately."],
  ["EM",    "Neutral",            "Medium", "Cheap for a reason. We hold benchmark weight and let the active manager carry the country decisions."],
  ["CORE",  "Neutral duration",   "Medium", "Extended from short to neutral in June. Real yields near 1.9% are adequate compensation."],
  ["MUNI",  "Overweight",         "Long",   "For households above the 32% bracket, tax-equivalent yields still beat comparable corporates. Ladders, not funds, wherever the account is large enough."],
  ["CRED",  "Underweight",        "Short",  "312 bps of spread does not pay for the credit cycle we are in. Underweight funded into private credit and core."],
  ["CASH",  "Minimum",            "Short",  "Hold only planned spending plus one year of distributions. Cash drag has cost 4 points a year over the last three."],
  ["HF",    "Neutral",            "Long",   "The sleeve earns its place on drawdown mitigation, not on return. Fees remain the weakest part of the case."],
  ["PE",    "Overweight",         "Long",   "Commitment pacing continues. Entry multiples in the middle market have compressed while large buyout has not."],
  ["PC",    "Overweight",         "Long",   "Our highest-conviction alternative. Floating rate, senior secured, and the yield premium over syndicated credit is intact."],
  ["RE",    "Modest underweight", "Medium", "Core has repriced but transaction volume is still thin. New commitments go to infrastructure ahead of property."],
];
