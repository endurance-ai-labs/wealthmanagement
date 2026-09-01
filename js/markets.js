/* =========================================================
   ROSEMONT PARTNERS — market data
   90+ benchmarks across seven boards, the Treasury curve,
   credit spreads and the macro strip.

   Benchmark NAMES are real because a wealth portal that
   invented its benchmarks would not read as credible.
   Every level, return and spread attached to them is
   SYNTHETIC, generated once from a fixed seed so the tape,
   the boards and the client reports never disagree.
   ========================================================= */

const MKT_ASOF = "2026-08-28";

/* ---------------------------------------------------------
   Compact source rows:
   [code, name, level, ytd, y1, y3, y5, y10, fwdPE, divYld]
   Trailing analytics are optional and only carried where a
   real desk would quote them.
   --------------------------------------------------------- */

const BOARD_US = [
  ["SPX",   "S&P 500",                       6142.87,  9.8, 14.2, 12.6, 13.9, 12.4, 21.4, 1.24],
  ["SPXEW", "S&P 500 Equal Weight",          7284.55,  6.4,  9.8,  8.1, 10.6,  9.8, 17.2, 1.86],
  ["MID",   "S&P MidCap 400",                3421.60,  5.9,  8.4,  7.9, 10.8,  9.2, 16.4, 1.52],
  ["SML",   "S&P SmallCap 600",              1486.22,  3.8,  6.2,  5.4,  9.1,  8.4, 14.8, 1.74],
  ["DJI",   "Dow Jones Industrial Average", 44913.22,  7.2, 11.4, 10.2, 11.1, 10.9, 19.1, 1.68],
  ["COMP",  "Nasdaq Composite",             20184.36, 12.4, 18.6, 15.8, 16.2, 15.4, 27.6, 0.68],
  ["NDX",   "Nasdaq-100",                   22418.60, 13.1, 19.8, 17.4, 17.6, 17.2, 26.8, 0.62],
  ["RUI",   "Russell 1000",                  3384.90,  9.4, 13.8, 12.1, 13.4, 12.1, 21.0, 1.28],
  ["RUT",   "Russell 2000",                  2384.15,  3.2,  5.8,  4.9,  8.4,  7.9, 15.6, 1.42],
  ["RUA",   "Russell 3000",                  3512.44,  9.1, 13.4, 11.7, 13.1, 11.9, 20.6, 1.30],
  ["RLG",   "Russell 1000 Growth",           4286.10, 13.6, 19.4, 17.2, 16.8, 16.1, 29.4, 0.54],
  ["RLV",   "Russell 1000 Value",            2018.44,  5.2,  8.1,  7.2,  9.8,  8.6, 16.2, 2.16],
  ["RUO",   "Russell 2000 Growth",           1712.88,  4.1,  6.4,  4.2,  7.1,  7.8, 21.4, 0.62],
  ["RUJ",   "Russell 2000 Value",            2496.30,  2.4,  5.1,  5.6,  9.6,  7.9, 13.2, 2.08],
  ["NYA",   "NYSE Composite",               21486.30,  6.8, 10.2,  9.1, 10.4,  8.9, 17.8, 1.94],
  ["W5000", "Wilshire 5000",                62184.20,  9.0, 13.2, 11.6, 13.0, 11.8, 20.8, 1.31],
  ["VIX",   "CBOE Volatility Index",           14.62, -18.4, -22.6, null, null, null, null, null],
];

const BOARD_SECTOR = [
  ["S5INFT", "Information Technology", 5286.40, 16.2, 24.1, 21.4, 21.8, 20.6, 29.8, 0.62],
  ["S5COND", "Consumer Discretionary", 1842.10,  8.4, 12.8,  9.6, 11.4, 12.2, 25.4, 0.78],
  ["S5TELS", "Communication Services",  412.86, 11.8, 17.2, 15.1, 13.6, 10.4, 19.2, 0.94],
  ["S5FINL", "Financials",              914.22, 10.6, 15.4, 12.8, 13.2, 11.1, 14.6, 1.72],
  ["S5INDU", "Industrials",              1284.90,  7.9, 11.6, 11.4, 12.6, 11.2, 21.4, 1.42],
  ["S5HLTH", "Health Care",            1698.44,  4.2,  5.8,  4.1,  7.9,  8.8, 17.8, 1.86],
  ["S5CONS", "Consumer Staples",        894.16,  3.1,  4.4,  3.8,  6.2,  8.1, 20.2, 2.64],
  ["S5ENRS", "Energy",                  742.88,  2.6,  1.8,  6.4, 18.4,  5.2, 13.4, 3.42],
  ["S5UTIL", "Utilities",               412.44,  9.2, 12.1,  8.6,  7.4,  8.9, 18.6, 3.04],
  ["S5RLST", "Real Estate",             268.90,  1.4,  2.2, -1.6,  3.8,  5.4, 34.2, 3.68],
  ["S5MATR", "Materials",               586.12,  4.8,  6.9,  4.2,  9.6,  8.4, 18.9, 1.98],
];

const BOARD_INTL = [
  ["ACWI",   "MSCI ACWI",                    892.40,  8.9, 12.8, 10.9, 11.8, 10.2, 19.4, 1.72],
  ["ACWX",   "MSCI ACWI ex-USA",             364.18,  7.4, 10.1,  7.8,  8.4,  6.6, 14.8, 3.02],
  ["EAFE",   "MSCI EAFE",                   2596.40,  8.1, 10.9,  8.6,  9.2,  6.4, 14.6, 3.14],
  ["EM",     "MSCI Emerging Markets",       1188.72,  6.2,  8.4,  4.1,  4.8,  4.2, 12.9, 2.86],
  ["MXEU",   "MSCI Europe",                 2148.60,  9.4, 12.2,  9.8, 10.1,  6.9, 14.2, 3.28],
  ["MXJP",   "MSCI Japan",                  1846.22, 10.6, 14.8, 12.4, 10.8,  7.4, 16.1, 2.24],
  ["FM",     "MSCI Frontier Markets",        648.90,  5.4,  7.2,  6.8,  6.1,  3.8, 11.4, 3.86],
  ["SXXP",   "STOXX Europe 600",             574.31,  8.8, 11.6,  9.2,  9.8,  6.2, 14.4, 3.22],
  ["UKX",    "FTSE 100",                    8942.60,  7.1,  9.4,  8.1,  8.9,  5.4, 12.1, 3.68],
  ["DAX",    "DAX 40",                     21486.40, 11.2, 15.1, 11.8, 11.2,  7.8, 15.2, 2.74],
  ["CAC",    "CAC 40",                      8214.88,  6.4,  8.2,  6.9,  9.4,  6.1, 13.8, 3.14],
  ["SMI",    "Swiss Market Index",          12684.20,  6.9,  8.8,  5.4,  6.8,  6.4, 17.4, 2.96],
  ["NKY",    "Nikkei 225",                 41206.80, 10.4, 15.2, 13.1, 11.6,  8.2, 18.4, 1.86],
  ["TPX",    "TOPIX",                       2884.16, 11.1, 15.8, 13.6, 11.9,  7.9, 15.8, 2.14],
  ["HSI",    "Hang Seng",                  22148.90,  9.8, 12.4, -1.2, -3.4, -0.8,  9.8, 3.94],
  ["SHSZ300","CSI 300",                     4126.44,  7.2,  9.1, -2.8, -1.6,  2.4, 12.6, 2.68],
  ["KOSPI",  "KOSPI",                       3184.60, 12.6, 16.4,  6.2,  4.9,  5.1, 11.2, 2.02],
  ["NIFTY",  "Nifty 50",                   26418.20,  8.4, 11.2, 12.9, 15.4, 12.1, 22.4, 1.18],
  ["AS51",   "S&P/ASX 200",                  8916.40,  6.1,  8.9,  7.4,  8.8,  6.9, 17.2, 3.48],
  ["SPTSX",  "S&P/TSX Composite",           27184.60,  8.6, 11.8,  9.6, 11.4,  7.8, 15.4, 2.86],
  ["IBOV",   "Ibovespa",                   142886.00,  9.4,  6.8,  8.4, 10.2,  6.1,  8.4, 5.12],
  ["MEXBOL", "S&P/BMV IPC",                 58412.40,  7.8,  9.6,  8.1, 11.6,  6.4, 13.1, 3.42],
];

const BOARD_FI = [
  ["LBUSTRUU", "Bloomberg US Aggregate",             2284.10,  4.9,  6.4,  2.1, -0.4,  1.8],
  ["LUATTRUU", "Bloomberg US Treasury",              2394.86,  4.4,  5.8,  1.4, -1.1,  1.2],
  ["SHY13",    "US Treasury 1-3 Year",               2648.22,  4.2,  5.1,  3.4,  1.6,  1.4],
  ["IEF710",   "US Treasury 7-10 Year",              2412.40,  5.1,  6.6,  1.1, -1.9,  1.1],
  ["TLT20",    "US Treasury 20+ Year",               1846.12,  6.2,  7.8, -2.4, -6.8, -0.6],
  ["LUACTRUU", "Bloomberg US Corporate IG",          3418.60,  5.6,  7.9,  3.6,  0.4,  2.9],
  ["LF98TRUU", "Bloomberg US Corporate High Yield",  2812.44,  6.8, 10.2,  7.4,  4.9,  5.1],
  ["LMBITR",   "Bloomberg Municipal Bond",           1418.90,  4.1,  5.4,  2.6,  0.8,  2.2],
  ["LMHYTR",   "Bloomberg High Yield Municipal",     1096.22,  6.4,  8.9,  5.1,  2.4,  4.1],
  ["LBUTTRUU", "Bloomberg US TIPS",                  1642.86,  4.8,  6.1,  2.9,  1.9,  2.4],
  ["LUMSTRUU", "Bloomberg US MBS",                   2216.40,  4.6,  6.0,  1.9, -0.9,  1.4],
  ["LG38TRUU", "Bloomberg Global Aggregate ex-USD",   942.16,  5.4,  6.9,  0.6, -2.8, -0.4],
  ["JPEIDIVR", "JPM EMBI Global Diversified",        1184.60,  6.1,  8.6,  4.8,  1.2,  3.4],
  ["SPBDAL",   "Morningstar LSTA Leveraged Loan",    3084.22,  5.9,  8.1,  8.4,  6.1,  4.8],
  ["PFF",      "ICE US Preferred Securities",         624.88,  5.2,  7.4,  3.1,  0.6,  3.2],
];

/* Treasury curve: [tenor label, yield %, prior month, prior year] */
const CURVE = [
  ["1M",  4.06, 4.11, 4.88], ["3M",  4.02, 4.08, 4.79], ["6M",  3.88, 3.94, 4.62],
  ["1Y",  3.71, 3.79, 4.34], ["2Y",  3.62, 3.71, 4.06], ["3Y",  3.64, 3.72, 3.96],
  ["5Y",  3.78, 3.84, 3.92], ["7Y",  3.96, 4.01, 4.02], ["10Y", 4.12, 4.16, 4.14],
  ["20Y", 4.46, 4.49, 4.48], ["30Y", 4.55, 4.58, 4.42],
];

const POLICY = [
  ["Fed Funds target",        "3.75 – 4.00%", "unchanged at the July meeting"],
  ["SOFR",                    "3.86%",        "+2 bps on the day"],
  ["Prime rate",              "6.75%",        "unchanged"],
  ["30-year mortgage (avg)",  "6.18%",        "-6 bps week over week"],
  ["AAA municipal 10-year",   "2.84%",        "69% of the 10-year Treasury"],
  ["Muni / Treasury 10-year", "69.0%",        "below the 5-year median of 74%"],
];

/* Credit spreads: [name, OAS bps, 1m change bps, 20yr percentile] */
const SPREADS = [
  ["US Investment Grade OAS",  88,  -1, 18],
  ["US High Yield OAS",       312,  +4, 22],
  ["US CCC & Lower OAS",      764, +21, 31],
  ["EM Sovereign OAS",        248,  -3, 26],
  ["Municipal AAA spread",     14,   0, 34],
  ["MOVE Index",             84.6, -4.2, 28],
];

const BOARD_COMMOD = [
  ["BCOM",  "Bloomberg Commodity Index",  108.42,  6.4,  4.2,  2.1,  9.8,  2.4],
  ["SPGSCI","S&P GSCI",                   582.16,  4.1,  1.8,  1.4, 14.2,  1.1],
  ["XAU",   "Gold (spot, $/oz)",         3412.80, 18.6, 24.2, 19.4, 14.8, 10.2],
  ["XAG",   "Silver (spot, $/oz)",         41.24, 22.4, 28.6, 16.8, 12.4,  8.4],
  ["HG",    "Copper ($/lb)",                4.86,  9.2, 12.4,  6.1,  8.9,  6.2],
  ["CL",    "WTI Crude ($/bbl)",            68.40, -6.4, -8.9, -4.2, 12.6,  1.8],
  ["CO",    "Brent Crude ($/bbl)",          72.18, -5.8, -8.1, -3.9, 12.1,  2.1],
  ["NG",    "Natural Gas ($/MMBtu)",         3.42, 12.8, 18.4, -6.4, 14.2, -1.4],
  ["C",     "Corn (¢/bu)",                 428.50, -3.2, -5.4, -8.6,  4.2,  0.6],
  ["W",     "Wheat (¢/bu)",                548.25, -1.8, -4.1, -9.8,  2.6, -0.4],
];

const BOARD_FX = [
  ["DXY",     "US Dollar Index",  98.42, -4.6, -6.2, -0.8,  1.4,  0.6],
  ["EURUSD",  "EUR / USD",       1.1284,  5.2,  6.8,  1.4, -0.9, -0.2],
  ["USDJPY",  "USD / JPY",       142.60, -6.1, -8.4,  2.6,  6.4,  3.1],
  ["GBPUSD",  "GBP / USD",       1.3412,  4.8,  6.1,  2.1,  0.4, -0.6],
  ["USDCHF",  "USD / CHF",       0.7986, -4.2, -5.8, -2.9, -3.1, -2.4],
  ["USDCAD",  "USD / CAD",       1.3486, -3.1, -4.2,  0.4,  1.1,  0.8],
  ["AUDUSD",  "AUD / USD",       0.6824,  3.4,  4.1, -1.2, -2.4, -1.1],
  ["USDCNY",  "USD / CNY",       7.0842, -2.4, -3.1,  0.8,  1.9,  0.4],
  ["USDMXN",  "USD / MXN",      18.4210, -8.6, -4.2,  1.6, -1.4,  2.1],
];

const BOARD_ALTS = [
  ["HFRIFWI", "HFRI Fund Weighted Composite",        6.4,  8.9,  6.8,  7.4,  5.2],
  ["HFRIEHI", "HFRI Equity Hedge",                   8.2, 11.4,  8.9,  9.6,  6.8],
  ["HFRIMI",  "HFRI Macro",                          3.1,  4.2,  4.6,  6.1,  3.4],
  ["HFRIEDI", "HFRI Event-Driven",                   6.9,  9.6,  7.2,  8.4,  5.6],
  ["HFRIRVA", "HFRI Relative Value",                 5.4,  7.8,  6.9,  6.4,  4.8],
  ["SGCTA",   "SG Trend (managed futures)",         -2.4, -1.8,  3.1,  7.8,  2.6],
  ["CAUSPE",  "Cambridge US Private Equity",         7.8, 11.2, 12.4, 17.6, 15.2],
  ["CAUSVC",  "Cambridge US Venture Capital",        3.4,  5.1,  1.8, 14.2, 13.8],
  ["CDLI",    "Cliffwater Direct Lending Index",     6.2, 10.4, 11.8,  9.6,  9.1],
  ["ODCE",    "NCREIF ODCE (core real estate)",      1.8,  2.4, -3.6,  2.8,  4.9],
  ["NFI",     "NCREIF Farmland",                     3.4,  5.2,  6.1,  7.4,  6.8],
  ["NTI",     "NCREIF Timberland",                   4.1,  6.8,  8.4,  9.2,  5.4],
  ["FNERTR",  "FTSE Nareit All Equity REITs",        2.1,  3.4, -0.8,  4.6,  6.2],
  ["SPGINFR", "S&P Global Infrastructure",           7.6, 10.2,  6.4,  7.9,  5.8],
];

/* Macro strip: [indicator, value, prior, direction, note] */
const MACRO = [
  ["CPI (year over year)",        "2.6%",        "2.7%",  "down", "Shelter still the largest single contributor"],
  ["Core PCE (year over year)",   "2.4%",        "2.4%",  "flat", "Third consecutive month at or below 2.5%"],
  ["Unemployment rate",           "4.1%",        "4.0%",  "up",   "Participation steady at 62.6%"],
  ["Nonfarm payrolls (3m avg)",   "+118k",       "+134k", "down", "Cooling but not contracting"],
  ["ISM Manufacturing",           "49.8",        "48.9",  "up",   "Twelfth month below 50"],
  ["ISM Services",                "53.2",        "52.6",  "up",   "New orders the strongest component"],
  ["Real GDP (annualised)",       "2.1%",        "2.4%",  "down", "Consumption decelerating, capex firm"],
  ["Retail sales (year over year)","3.2%",       "3.6%",  "down", "Goods soft, services resilient"],
  ["Housing starts (SAAR)",       "1.34M",       "1.31M", "up",   "Single-family leading the improvement"],
  ["Initial jobless claims (4wk)","218k",        "224k",  "down", "Historically low"],
  ["Conference Board LEI",        "-0.2% m/m",   "-0.3%", "up",   "Contracting more slowly"],
  ["Consumer sentiment",          "68.4",        "66.2",  "up",   "Inflation expectations anchored at 3.0%"],
];

/* ---------------------------------------------------------
   Expand the compact rows into quote objects. Short-horizon
   returns are derived from a fixed seed and each series'
   own volatility so the whole board moves coherently.
   --------------------------------------------------------- */
function _mkRand(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function _expand(rows, board, hasAnalytics) {
  return rows.map((r) => {
    const [code, name, level, ytd, y1, y3, y5, y10, fwdPE, dy] = r;
    const rnd = _mkRand("rp-mkt-" + code);
    /* Annualised volatility implied by the asset's own YTD dispersion. */
    const vol = board === "fi" ? 4.5 : board === "fx" ? 7 : board === "commod" ? 22 : 15;
    const dVol = vol / Math.sqrt(252);
    const d1  = +((rnd() - 0.42) * dVol * 2.4).toFixed(2);
    const wtd = +(d1 + (rnd() - 0.45) * dVol * 3.1).toFixed(2);
    const mtd = +((ytd || 0) * 0.11 + (rnd() - 0.5) * dVol * 4).toFixed(2);
    const qtd = +((ytd || 0) * 0.34 + (rnd() - 0.5) * dVol * 5).toFixed(2);
    /* Drawdown from the trailing high, scaled to volatility. */
    const ddown = -+(rnd() * vol * 0.55).toFixed(1);
    return {
      code, name, board, level, d1, wtd, mtd, qtd,
      ytd: ytd, y1: y1, y3: y3, y5: y5, y10: y10,
      fwdPE: hasAnalytics ? fwdPE : null,
      divYld: hasAnalytics ? dy : null,
      ddown,
      hist: Array.from({ length: 24 }, (_, i) => {
        const drift = (ytd || 0) / 100 / 24;
        return 100 * (1 + drift * i + (rnd() - 0.5) * (vol / 100) * 0.42);
      }),
    };
  });
}

const INDICES = [].concat(
  _expand(BOARD_US,     "us",     true),
  _expand(BOARD_SECTOR, "sector", true),
  _expand(BOARD_INTL,   "intl",   true),
  _expand(BOARD_FI,     "fi",     false),
  _expand(BOARD_COMMOD, "commod", false),
  _expand(BOARD_FX,     "fx",     false)
);

const IDX = {};
INDICES.forEach((q) => { IDX[q.code] = q; });

const ALT_BENCH = BOARD_ALTS.map((r) => ({
  code: r[0], name: r[1], board: "alts",
  ytd: r[2], y1: r[3], y3: r[4], y5: r[5], y10: r[6],
}));

const BOARDS = [
  { id: "us",     label: "US equity",              note: "Price returns; total return where the index is quoted that way." },
  { id: "sector", label: "US sectors",             note: "GICS level 1, measured against the S&P 500." },
  { id: "intl",   label: "International equity",   note: "Quoted in local currency unless the name says otherwise." },
  { id: "fi",     label: "Fixed income",           note: "Total return indices." },
  { id: "commod", label: "Commodities",            note: "Spot and front-month futures." },
  { id: "fx",     label: "Currencies",             note: "A positive change is dollar weakness for the crosses." },
];

/* Cross-asset correlation matrix, 3-year monthly, symmetric by construction. */
const CORR_ASSETS = ["S&P 500", "Russell 2000", "MSCI EAFE", "MSCI EM", "US Agg", "US HY", "Municipals", "Gold", "Commodities", "REITs"];
const CORR = (function () {
  const seed = [
    [1.00, 0.88, 0.84, 0.74, 0.18, 0.71, 0.12, 0.06, 0.34, 0.72],
    [null, 1.00, 0.76, 0.68, 0.14, 0.74, 0.09, 0.02, 0.36, 0.74],
    [null, null, 1.00, 0.82, 0.26, 0.70, 0.18, 0.16, 0.42, 0.66],
    [null, null, null, 1.00, 0.24, 0.68, 0.14, 0.22, 0.46, 0.58],
    [null, null, null, null, 1.00, 0.42, 0.86, 0.28, 0.06, 0.44],
    [null, null, null, null, null, 1.00, 0.34, 0.10, 0.38, 0.64],
    [null, null, null, null, null, null, 1.00, 0.22, 0.02, 0.38],
    [null, null, null, null, null, null, null, 1.00, 0.44, 0.18],
    [null, null, null, null, null, null, null, null, 1.00, 0.32],
    [null, null, null, null, null, null, null, null, null, 1.00],
  ];
  for (let i = 0; i < seed.length; i++) for (let j = 0; j < i; j++) seed[i][j] = seed[j][i];
  return seed;
})();

/* Valuation percentiles against 20 years of the asset's own history. */
const VALUATION = [
  ["US large cap",          "Forward P/E",      21.4, 92, "Rich against its own history; earnings growth is doing the work"],
  ["US small cap",          "Forward P/E",      15.6, 44, "Cheapest US equity sleeve on a relative basis"],
  ["International developed", "Forward P/E",    14.6, 38, "Discount to the US near the widest since 2008"],
  ["Emerging markets",      "Forward P/E",      12.9, 34, "Cheap, but earnings revisions remain negative"],
  ["US investment grade",   "OAS (bps)",          88, 18, "Little compensation for credit risk"],
  ["US high yield",         "OAS (bps)",         312, 22, "Tight; carry is the whole return case"],
  ["Municipals (10-yr AAA)", "Ratio to UST",    69.0, 34, "Fair to slightly rich for high-bracket buyers"],
  ["Core real estate",      "Cap rate spread",   1.4, 62, "Repricing largely complete, transaction volume still thin"],
];

/* Seasonality: average S&P 500 monthly return, 1950 to date (illustrative). */
const SEASONALITY = [
  ["Jan", 1.1], ["Feb", -0.1], ["Mar", 1.1], ["Apr", 1.4], ["May", 0.2], ["Jun", 0.1],
  ["Jul", 1.2], ["Aug", 0.0], ["Sep", -0.6], ["Oct", 0.9], ["Nov", 1.6], ["Dec", 1.4],
];

/* Market breadth. */
const BREADTH = [
  ["S&P 500 above 200-day",       "72%",   "up",   "Broad but narrowing"],
  ["S&P 500 above 50-day",        "64%",   "down", "Short-term momentum fading"],
  ["Equal weight vs cap weight",  "-3.4%", "down", "Year-to-date; concentration still widening"],
  ["Advance / decline line",      "Rising","up",   "Confirms the trend at the index level"],
  ["New highs minus new lows",    "+86",   "up",   "Positive for eleven straight sessions"],
  ["Top 10 weight in S&P 500",    "38.2%", "up",   "A record; the single largest portfolio risk we monitor"],
];
