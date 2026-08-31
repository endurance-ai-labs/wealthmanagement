/* ============================================================
   BLACKMONT ADVISORS — portal navigation
   Sticky headline marquee + market tape + topbar with grouped
   nav, section subnav, theme toggle and a global adviser/client
   view mode. Same framework as the CFP/Margins portal.
   ============================================================ */

const BASE = "/wealthmanagement";

/* ---- Theme: every load starts light ---- */
(function () {
  document.documentElement.setAttribute("data-theme", "light");
  try { localStorage.setItem("bm-theme", "light"); } catch (e) {}
})();

/* ---- View mode: adviser (full firm data) vs client (external-safe) ---- */
const RPMode = (function () {
  const KEY = "bm-mode";
  function get() { try { return localStorage.getItem(KEY) === "client" ? "client" : "internal"; } catch (e) { return "internal"; } }
  function set(m) { try { localStorage.setItem(KEY, m); } catch (e) {} window.location.reload(); }
  return { get, set, isInternal: () => get() === "internal" };
})();
window.RPMode = RPMode;

/* ------------------------------------------------------------
   NAV — 7 groups, 24 pages.
   ext: 1  => the item is also visible in the client portal
   ------------------------------------------------------------ */
const NAV_GROUPS = [
  { id: "home", label: "Home", href: BASE + "/", items: [], ext: 1 },
  {
    id: "clients", label: "Clients", items: [
      { href: BASE + "/clients/", label: "Client Book", hhFlyout: true },
      { href: BASE + "/households/", label: "Household Book" },
      { href: BASE + "/crossborder/", label: "Cross-Border Desk" },
      { href: BASE + "/reporting/",  label: "Reporting Center" },
      { href: BASE + "/documents/",  label: "Document Vault", ext: 1 },
      { href: BASE + "/meetings/",   label: "Meeting Desk", ext: 1 },
    ],
  },
  {
    id: "portfolios", label: "Portfolios", items: [
      { href: BASE + "/models/",      label: "Models & Allocation" },
      { href: BASE + "/trading/",     label: "Trading & Rebalancing" },
      { href: BASE + "/performance/", label: "Performance & Attribution" },
      { href: BASE + "/risk/",        label: "Risk Analytics" },
    ],
  },
  {
    id: "research", label: "Research", items: [
      { href: BASE + "/markets/",   label: "Global Markets", ext: 1 },
      { href: BASE + "/funds/",     label: "Fund Research" },
      { href: BASE + "/managers/",  label: "Manager Due Diligence" },
      { href: BASE + "/committee/", label: "Investment Committee" },
      { href: BASE + "/private/",   label: "Private Markets" },
    ],
  },
  {
    id: "planning", label: "Planning", items: [
      { href: BASE + "/planning/", label: "Wealth Planning", ext: 1 },
      { href: BASE + "/tax/",      label: "Tax & Estate", ext: 1 },
    ],
  },
  {
    id: "firm", label: "Firm", internalOnly: true, items: [
      { href: BASE + "/revenue/",    label: "Revenue & Billing" },
      { href: BASE + "/growth/",     label: "Growth & Pipeline" },
      { href: BASE + "/compliance/", label: "Compliance" },
      { href: BASE + "/operations/", label: "Operations" },
      { href: BASE + "/team/",       label: "Team & Capacity" },
    ],
  },
];

function _normalizePath(p) {
  if (!p) return "/";
  p = p.replace(/\/index\.html$/, "/");
  if (p === BASE) return "/";
  if (p.startsWith(BASE + "/")) p = p.slice(BASE.length);
  return p || "/";
}

const _GROUP_OF = {
  "/clients/": "clients", "/households/": "clients", "/crossborder/": "clients", "/reporting/": "clients", "/documents/": "clients", "/meetings/": "clients",
  "/models/": "portfolios", "/trading/": "portfolios", "/performance/": "portfolios", "/risk/": "portfolios",
  "/markets/": "research", "/funds/": "research", "/managers/": "research",
  "/committee/": "research", "/private/": "research",
  "/planning/": "planning", "/tax/": "planning",
  "/revenue/": "firm", "/growth/": "firm", "/compliance/": "firm",
  "/operations/": "firm", "/team/": "firm",
};
function _activeGroup(path) {
  path = _normalizePath(path);
  if (path === "/") return "home";
  for (const k in _GROUP_OF) if (path.startsWith(k)) return _GROUP_OF[k];
  return "home";
}

/* ---- Market tape. Mirrors the /markets/ dataset so the two never disagree. ---- */
const TICKER = [
  ["S&P 500",      "6,142.87", "+0.42%",  "up"],
  ["NASDAQ 100",   "22,418.60", "+0.68%", "up"],
  ["DOW",          "44,913.22", "+0.19%", "up"],
  ["RUSSELL 2000", "2,384.15", "-0.27%",  "down"],
  ["MSCI EAFE",    "2,596.40", "+0.31%",  "up"],
  ["MSCI EM",      "1,188.72", "-0.14%",  "down"],
  ["STOXX 600",    "574.31",   "+0.24%",  "up"],
  ["NIKKEI 225",   "41,206.80", "+0.55%", "up"],
  ["VIX",          "14.62",    "-3.1%",   "down"],
  ["UST 2-YR",     "3.62%",    "-3 bps",  "down"],
  ["UST 10-YR",    "4.12%",    "+1 bp",   "up"],
  ["UST 30-YR",    "4.55%",    "+2 bps",  "up"],
  ["2s10s",        "+50 bps",  "+4 bps",  "up"],
  ["FED FUNDS",    "3.75-4.00%", "hold",  "up"],
  ["SOFR",         "3.86%",    "+2 bps",  "up"],
  ["IG OAS",       "88 bps",   "-1 bp",   "down"],
  ["HY OAS",       "312 bps",  "+4 bps",  "up"],
  ["US AGG",       "2,284.10", "+0.09%",  "up"],
  ["MUNI 1-15Y",   "1,142.36", "+0.06%",  "up"],
  ["GOLD",         "$3,412/oz", "+0.7%",  "up"],
  ["WTI",          "$68.40",   "-1.2%",   "down"],
  ["DXY",          "98.42",    "-0.15%",  "down"],
  ["EUR/USD",      "1.1284",   "+0.18%",  "up"],
  ["CPI (YOY)",    "2.6%",     "-0.1 pt", "down"],
  ["CORE PCE",     "2.4%",     "unch",    "up"],
  ["FIRM AUM",     "$8.41B",   "+1.8% QTD", "up"],
];

const MARQUEE = [
  ["CROSS-BORDER", "FBAR and FATCA filing season opens \u2014 14 households have reportable foreign accounts this year"],
  ["BLACKMONT", "Independent since 1999. Not limited to the products of any one company."],
  ["PLANNING", "Social Security claiming analysis refreshed for every household within five years of eligibility"],
  ["PLAN SPONSORS", "Annual fiduciary reviews scheduled for all five employer plans before year end"],
  ["RISK", "Insurance and umbrella coverage reviewed against household net worth at every annual meeting"],
  ["OPERATIONS", "Q3 billing run opens 30 September \u2014 exception review closes the 26th"],
  ["BLACKMONT", "Carlsbad, California and League City, Texas \u2014 diversification is how we manage risk"],
];

function renderTopbar(opts = {}) {
  const target = document.getElementById("topbar");
  if (!target) return;
  const subtitle = opts.subtitle || "Private Wealth Portal";
  const path = _normalizePath(window.location.pathname);
  const activeGroupId = _activeGroup(path);

  if (typeof isSignedIn === "function" && !isSignedIn()) { renderSignIn(); target.outerHTML = ""; return; }
  const me = currentPersona();
  const external = !!me.perms.external || !RPMode.isInternal();

  /* Filter groups and items down to what this view may see. */
  const groups = NAV_GROUPS
    .map((g) => {
      if (!external) return g;
      if (g.internalOnly) return null;
      if (!g.items.length) return g.ext ? g : null;
      const items = g.items.filter((it) => it.ext);
      return items.length ? Object.assign({}, g, { items }) : null;
    })
    .filter(Boolean);

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  function groupHTML(g, withFlyouts) {
    const active = g.id === activeGroupId;
    const href = g.items.length === 0 ? g.href : g.items[0].href;
    if (g.items.length === 0) {
      return `<div class="nav-item"><a href="${href}" data-group="${g.id}" class="${active ? "active" : ""}">${g.label}</a></div>`;
    }
    const dd = g.items.map((it) => {
      const on = path === _normalizePath(it.href) || (it.href !== BASE + "/" && path.startsWith(_normalizePath(it.href)));
      if (it.hhFlyout && withFlyouts) {
        return `<div class="nav-dd-fly-parent">
          <a href="${it.href}" class="nav-dropdown-item ${on ? "active" : ""}">${it.label} <span class="nav-caret" style="float:right">▸</span></a>
          <div class="nav-flyout" data-hh-flyout></div></div>`;
      }
      return `<a href="${it.href}" class="nav-dropdown-item ${on ? "active" : ""}">${it.label}</a>`;
    }).join("");
    return `<div class="nav-item nav-item-with-dropdown">
      <a href="${href}" data-group="${g.id}" class="${active ? "active" : ""}">${g.label} <span class="nav-caret">▾</span></a>
      <div class="nav-dropdown">${dd}</div></div>`;
  }

  const groupLinks = groups.map((g) => groupHTML(g, true)).join("");
  const allGroupLinks = groups.map((g) => groupHTML(g, false)).join("");

  let subBar;
  if (activeGroup && activeGroup.items.length > 1) {
    const subItems = activeGroup.items.map((it) => {
      const on = path === _normalizePath(it.href) || path.startsWith(_normalizePath(it.href));
      if (it.hhFlyout) {
        return `<span class="subnav-fly-parent">
          <a href="${it.href}" class="section-subnav-item ${on ? "active" : ""}">${it.label} <span class="nav-caret">▾</span></a>
          <div class="nav-flyout subnav-flyout" data-hh-flyout></div></span>`;
      }
      return `<a href="${it.href}" class="section-subnav-item ${on ? "active" : ""}">${it.label}</a>`;
    }).join("");
    subBar = `<nav class="section-subnav" id="section-subnav" aria-label="${activeGroup.label} sub-navigation">
      <div class="section-subnav-inner">
        <span class="section-subnav-label">${activeGroup.label}</span>
        <div class="section-subnav-items">${subItems}</div>
      </div></nav>`;
  } else {
    subBar = `<div class="section-subnav section-subnav--empty" id="section-subnav" aria-hidden="true">
      <div class="section-subnav-inner"><span class="section-subnav-label">&nbsp;</span>
      <div class="section-subnav-items"><span class="section-subnav-item">&nbsp;</span></div></div></div>`;
  }

  const tickerHtml = TICKER.map((t) =>
    `<span class="ticker-item"><span class="ticker-label">${t[0]}</span><span class="ticker-value">${t[1]}</span><span class="ticker-change ${t[3]}">${t[2]}</span></span>`
  ).join('<span class="ticker-sep">·</span>') + '<span class="ticker-sep">·</span>';

  const marqueeItems = MARQUEE.map((m) =>
    `<span class="news-marquee-item"><span class="news-marquee-source">${m[0]}</span><span class="news-marquee-text">${m[1]}</span><span class="news-marquee-sep">—</span></span>`
  ).join("");

  const accessLabel = (me.access || "").toUpperCase() + " · " + bookLabel().toUpperCase();

  target.outerHTML = `
    <div class="news-marquee" id="news-marquee"><div class="news-marquee-track">${marqueeItems}${marqueeItems}</div></div>
    <div class="market-ticker" id="market-ticker"><div class="ticker-track">${tickerHtml}${tickerHtml}</div></div>
    <div class="portal-topbar">
      <a class="brand" href="${BASE}/" style="cursor:pointer;text-decoration:none">
        ${RP_MARK_SVG(30)}
        <div class="rp-brand-text">
          <div class="rp-word">Blackmont <span>Partners</span></div>
          <div class="rp-word-sub">${subtitle}</div>
        </div>
      </a>
      <nav class="nav nav-desktop">${groupLinks}</nav>
      <div class="portal-topbar-right">
        <div class="mode-toggle" title="Switch between the adviser view and the client-facing portal" style="${me.perms.external ? "display:none" : ""}">
          <button id="rpmode-int" class="${RPMode.isInternal() ? "on" : ""}"><span class="mt-lbl">ADVISER</span></button>
          <button id="rpmode-ext" class="${RPMode.isInternal() ? "" : "on"}"><span class="mt-lbl">CLIENT</span></button>
        </div>
        <button class="nav-icon-btn theme-toggle" id="theme-toggle" title="Toggle light / dark mode" aria-label="Toggle theme">
          <svg class="theme-icon-moon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg class="theme-icon-sun" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </button>
        <div class="nav-item nav-item-with-dropdown nav-user-btn" id="nav-user-btn" title="Account & role">
          <a href="#" class="nav-icon-btn nav-user-trigger" aria-label="Account" onclick="event.preventDefault()">
            <span class="nav-user-avatar">${me.perms.external ? "◇" : me.init}</span>
            <span class="nav-user-label">${me.name.split(" ")[0]}</span>
            <span class="nav-caret">▾</span>
          </a>
          <div class="nav-dropdown nav-dropdown-right">
            <div class="nav-user-card">
              <div class="nav-user-card-title">${me.name} <span class="nav-user-badge">DEMO</span></div>
              <div class="nav-user-card-sub">${me.title}</div>
              <div class="nav-user-card-meta">${accessLabel}</div>
            </div>
            <div class="nav-user-card" style="padding-top:6px">
              <div class="nav-user-card-meta" style="margin-bottom:4px">SWITCH USER (DEMO)</div>
              ${PERSONAS.map((p) => `<a href="#" class="nav-dropdown-item" style="padding:6px 0;${p.id === me.id ? "color:var(--color-blue);font-weight:700" : ""}" onclick="event.preventDefault();setRole('${p.id}')">${p.id === me.id ? "● " : "○ "}${p.name} — ${p.title}</a>`).join("")}
            </div>
            <div class="nav-dropdown-divider"></div>
            <a href="#" class="nav-dropdown-item" onclick="event.preventDefault();signOutUser()">Sign out</a>
          </div>
        </div>
      </div>
    </div>
    <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu">
      <span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>
    </button>
    <nav class="nav nav-mobile" id="nav-menu" aria-hidden="true">${allGroupLinks}</nav>
    <div class="nav-scrim" id="nav-scrim" hidden></div>
    ${subBar}`;

  document.body.classList.remove("has-sidenav", "has-sidenav-collapsed");

  if (!document.querySelector(".demo-watermark")) {
    const wm = document.createElement("div");
    wm.className = "demo-watermark";
    wm.textContent = "Demo environment · fictional data";
    document.body.appendChild(wm);
  }

  _wireMobileNav();
  _wireThemeToggle();
  _wireModeToggle();
  _fillHouseholdFlyouts();

  /* Match the tape's scroll speed (px/s) to the headline marquee above it. */
  (function syncTickerSpeed(tries) {
    const mt = document.querySelector(".news-marquee-track");
    const tt = document.querySelector(".ticker-track");
    if (!mt || !tt) return;
    if ((!mt.scrollWidth || !tt.scrollWidth) && tries < 40) return requestAnimationFrame(() => syncTickerSpeed(tries + 1));
    if (mt.scrollWidth && tt.scrollWidth) tt.style.animationDuration = (37 * tt.scrollWidth / mt.scrollWidth).toFixed(1) + "s";
  })(0);
}

function _wireModeToggle() {
  const i = document.getElementById("rpmode-int"), e = document.getElementById("rpmode-ext");
  if (i) i.addEventListener("click", () => { if (!RPMode.isInternal()) RPMode.set("internal"); });
  if (e) e.addEventListener("click", () => { if (RPMode.isInternal()) RPMode.set("client"); });
}

function _fillHouseholdFlyouts() {
  const hosts = document.querySelectorAll("[data-hh-flyout]");
  if (!hosts.length || typeof visibleHouseholds !== "function") return;
  const list = visibleHouseholds().slice(0, 14);
  const html = list.map((h) =>
    `<a href="${BASE}/households/household/?id=${h.id}"><span>${h.name}</span><span class="fl-meta">${fmtM(h.mv)} · ${h.segment}</span></a>`
  ).join("");
  hosts.forEach((el) => { el.innerHTML = html; });
}

function _wireMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  const scrim = document.getElementById("nav-scrim");
  if (!toggle || !menu) return;
  const close = () => { document.body.classList.remove("nav-open"); toggle.setAttribute("aria-expanded", "false"); if (scrim) scrim.hidden = true; };
  const open  = () => { document.body.classList.add("nav-open"); toggle.setAttribute("aria-expanded", "true"); if (scrim) scrim.hidden = false; };
  toggle.addEventListener("click", () => { document.body.classList.contains("nav-open") ? close() : open(); });
  if (scrim) scrim.addEventListener("click", close);
  menu.querySelectorAll(".nav-item-with-dropdown > a").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        const item = a.parentElement;
        if (!item.classList.contains("open")) {
          e.preventDefault();
          menu.querySelectorAll(".nav-item-with-dropdown.open").forEach((o) => o.classList.remove("open"));
          item.classList.add("open");
        }
      }
    });
  });
  menu.querySelectorAll(".nav-dropdown-item, .nav-item:not(.nav-item-with-dropdown) > a")
    .forEach((a) => a.addEventListener("click", close));
  window.addEventListener("resize", () => { if (!window.matchMedia("(max-width: 900px)").matches) close(); });
}

function _wireThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("bm-theme", theme); } catch (e) {}
    const moon = btn.querySelector(".theme-icon-moon"), sun = btn.querySelector(".theme-icon-sun");
    if (theme === "light") { if (moon) moon.style.display = "none"; if (sun) sun.style.display = ""; }
    else { if (moon) moon.style.display = ""; if (sun) sun.style.display = "none"; }
  }
  apply(document.documentElement.getAttribute("data-theme") || "light");
  btn.addEventListener("click", () => {
    apply(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");
  });
}

/* sticky bottom horizontal scrollbar helper */
(function loadStickyHscroll() {
  if (window.__rpStickyLoaded) return;
  window.__rpStickyLoaded = true;
  const s = document.createElement("script");
  s.src = BASE + "/js/sticky-hscroll.js";
  s.async = true;
  document.head.appendChild(s);
})();

window.RPNav = { renderTopbar };
