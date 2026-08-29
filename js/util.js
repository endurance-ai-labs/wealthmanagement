/* =========================================================
   ROSEMONT PARTNERS — shared utilities
   Formatters, persona/permission model, approval chains,
   e-signature, source chips, and the household math that
   every page reads from. Demo build, fictional data.
   ========================================================= */

const $  = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

/* ---------- formatters ---------- */
const fmt$ = (n, dec = 0) =>
  (n < 0 ? "-" : "") + "$" + Math.abs(Number(n) || 0).toLocaleString("en-US",
    { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmt$2 = (n) => fmt$(n, 2);
const fmtM  = (n) => {
  const a = Math.abs(n);
  if (a >= 1e9) return (n < 0 ? "-" : "") + "$" + (a / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return (n < 0 ? "-" : "") + "$" + (a / 1e6).toFixed(1) + "M";
  if (a >= 1e3) return (n < 0 ? "-" : "") + "$" + Math.round(a / 1e3) + "K";
  return fmt$(n);
};
const fmtPct  = (n, dec = 1) => (isFinite(n) ? Number(n).toFixed(dec) : "0.0") + "%";
const fmtBps  = (n) => Math.round(n * 100) + " bps";
const fmtNum  = (n, dec = 2) => (Number(n) || 0).toLocaleString("en-US",
  { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtX    = (n) => (Number(n) || 0).toFixed(2) + "x";
const esc     = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const qs      = (k) => new URLSearchParams(window.location.search).get(k);

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const fmtDateShort = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" });
};
const fmtMonth = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};
const todayISO = () => RP.asOf;
const addDays  = (iso, d) => {
  const t = new Date(iso + "T12:00:00"); t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};
const daysBetween = (a, b) =>
  Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);

/* Signed return, coloured green up / red down. Never used for chrome. */
const ret = (n, dec = 2, suffix = "%") => {
  const c = n > 0.0001 ? "up" : n < -0.0001 ? "dn" : "flat";
  const sign = n > 0.0001 ? "+" : "";
  return `<span class="rp-ret ${c}">${sign}${Number(n).toFixed(dec)}${suffix}</span>`;
};
const money = (n, dec = 0) => {
  const c = n > 0 ? "up" : n < 0 ? "dn" : "flat";
  return `<span class="rp-ret ${c}">${n > 0 ? "+" : ""}${fmt$(n, dec)}</span>`;
};

/* ---------- pills ---------- */
const pill = (text, tone = "gray") => `<span class="rp-pill ${tone}">${esc(text)}</span>`;
const STATUS_TONE = {
  Active: "green", Approved: "green", Complete: "green", Completed: "green", Delivered: "green",
  Funded: "green", Executed: "green", Settled: "green", Current: "green", "On Track": "green",
  Cleared: "green", Reconciled: "green", Won: "green",
  Watch: "amber", Pending: "amber", "In Review": "amber", "In Progress": "amber", Drifted: "amber",
  Open: "amber", Scheduled: "amber", Draft: "amber", Proposed: "amber", Submitted: "amber",
  "Awaiting Client": "amber", Unfunded: "amber", "Past Due": "amber",
  Terminated: "red", Overdue: "red", Breach: "red", Failed: "red", Rejected: "red",
  Exception: "red", Lost: "red", Critical: "red",
  Prospect: "blue", "Under Review": "blue", New: "blue", Onboarding: "blue", Closed: "gray",
  Inactive: "gray", Archived: "gray",
};
const statusPill = (s) => pill(s, STATUS_TONE[s] || "gray");

/* ---------- horizontal bar ---------- */
const bar = (pct, tone = "") =>
  `<div class="rp-bar ${tone}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;

/* =========================================================
   PERSONAS — the Rosemont org drives access
   Permission flags:
     firm       firm-wide AUM, flows, executive command centre
     revenue    fee schedules, billing runs, revenue, profitability
     book       all households (0 = only households assigned to them)
     research   manager DD files, IC minutes, unpublished house views
     trading    blotter, rebalance execution, blocks, best execution
     compliance regulatory register, personal trading, exceptions
     external   client view: one household, nothing else
   ========================================================= */
const PERSONAS = [
  { id: "ceo",    name: "Margaret Holloway",    title: "Managing Partner & Chief Executive",
    init: "MH", perms: { firm: 1, revenue: 1, book: 1, research: 1, trading: 1, compliance: 1 }, access: "Full firm access" },
  { id: "cio",    name: "David Ferreira, CFA",  title: "Chief Investment Officer",
    init: "DF", perms: { firm: 1, revenue: 0, book: 1, research: 1, trading: 1, compliance: 0 }, access: "Investment team" },
  { id: "research", name: "Priya Raghavan, CFA", title: "Director of Research",
    init: "PR", perms: { firm: 1, revenue: 0, book: 1, research: 1, trading: 0, compliance: 0 }, access: "Research & due diligence" },
  { id: "pm",     name: "Nathan Cole, CFA, CAIA", title: "Senior Portfolio Manager",
    init: "NC", perms: { firm: 1, revenue: 0, book: 1, research: 1, trading: 1, compliance: 0 }, access: "Portfolio management" },
  { id: "advisor1", name: "Elaine Whitfield, CFP", title: "Partner & Senior Wealth Advisor",
    init: "EW", perms: { firm: 0, revenue: 0, book: 0, research: 1, trading: 0, compliance: 0 }, access: "Advisory — own book" },
  { id: "advisor2", name: "Marcus Devereaux, CFP", title: "Wealth Advisor",
    init: "MD", perms: { firm: 0, revenue: 0, book: 0, research: 1, trading: 0, compliance: 0 }, access: "Advisory — own book" },
  { id: "csa",    name: "Jenna Alvarado",       title: "Client Service Associate",
    init: "JA", perms: { firm: 0, revenue: 0, book: 0, research: 0, trading: 0, compliance: 0 }, access: "Client service" },
  { id: "trading", name: "Thomas Okonjo",       title: "Head of Trading & Operations",
    init: "TO", perms: { firm: 1, revenue: 0, book: 1, research: 0, trading: 1, compliance: 0 }, access: "Trading & operations" },
  { id: "cco",    name: "Rachel Stern, JD",     title: "Chief Compliance Officer",
    init: "RS", perms: { firm: 1, revenue: 0, book: 1, research: 1, trading: 0, compliance: 1 }, access: "Compliance & oversight" },
  { id: "cfo",    name: "Alan Pruitt",          title: "Chief Financial Officer",
    init: "AP", perms: { firm: 1, revenue: 1, book: 1, research: 0, trading: 0, compliance: 0 }, access: "Firm economics" },
  { id: "client", name: "Whitmore Family",      title: "Client — external portal",
    init: "W",  perms: { firm: 0, revenue: 0, book: 0, research: 0, trading: 0, compliance: 0, external: 1 } },
];

/* Advisor personas see only their own book. */
const ADVISOR_OF = { advisor1: "Elaine Whitfield", advisor2: "Marcus Devereaux" };
/* The CSA supports these two advisors. */
const CSA_SUPPORTS = ["Elaine Whitfield", "Marcus Devereaux"];
/* The external persona is scoped to one household. */
const CLIENT_HH = "HH-0001";

function currentRole()    { try { return localStorage.getItem("rp-role") || ""; } catch (e) { return ""; } }
function currentPersona() { return PERSONAS.find((p) => p.id === currentRole()) || null; }
function can(perm)        { const p = currentPersona(); return !!(p && p.perms[perm]); }
function isSignedIn()     { return !!currentPersona(); }
function isExternal()     { return can("external"); }
function setRole(id) {
  try {
    localStorage.setItem("rp-role", id);
    const p = PERSONAS.find((x) => x.id === id);
    localStorage.setItem("rp-mode", p && p.perms.external ? "client" : "internal");
  } catch (e) {}
  window.location.reload();
}
function signOutUser() { try { localStorage.removeItem("rp-role"); } catch (e) {} window.location.reload(); }

/* Households this persona may see. */
function visibleHouseholds() {
  const p = currentPersona();
  if (!p) return [];
  if (p.perms.external) return HOUSEHOLDS.filter((h) => h.id === CLIENT_HH);
  if (p.perms.book) return HOUSEHOLDS;
  if (p.id === "csa") return HOUSEHOLDS.filter((h) => CSA_SUPPORTS.includes(h.advisor));
  const mine = ADVISOR_OF[p.id];
  return mine ? HOUSEHOLDS.filter((h) => h.advisor === mine) : [];
}
function bookLabel() {
  const p = currentPersona();
  if (!p) return "";
  if (p.perms.external) return "Your household";
  if (p.perms.book) return "All households";
  if (p.id === "csa") return "Supported book";
  return ADVISOR_OF[p.id] ? "My book" : "No book assigned";
}

/* ---------- access gate ---------- */
/* GitHub Pages has no middleware, so the gate is client-side: a shared
   passphrase in front of the persona overlay. It keeps the demo off search
   and out of casual hands; it is not a security control. */
const GATE_PHRASE = "enduranceportal";
function gatePassed() { try { return localStorage.getItem("rp-gate") === "1"; } catch (e) { return true; } }
function submitGate(e) {
  e.preventDefault();
  const i = document.getElementById("gate-input");
  if (i.value.trim().toLowerCase() === GATE_PHRASE) {
    try { localStorage.setItem("rp-gate", "1"); } catch (err) {}
    window.location.reload();
  } else {
    document.getElementById("gate-err").style.display = "block";
    i.value = ""; i.focus();
  }
  return false;
}
function renderGate() {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="login-overlay">
      <div class="login-box" style="max-width:420px">
        <div class="login-logo">${RP_MARK_SVG(46)}</div>
        <div class="login-title">Rosemont Partners</div>
        <div class="login-sub">Private wealth portal &middot; demonstration environment</div>
        <form onsubmit="return submitGate(event)" style="margin-top:22px">
          <input id="gate-input" type="password" autocomplete="off" placeholder="Access code"
            style="width:100%;padding:11px 13px;font:inherit;font-size:14px;border:1px solid #dde3ea;border-radius:6px">
          <div id="gate-err" style="display:none;color:#a3392c;font-size:11.5px;margin-top:8px">
            That code is not recognised.</div>
          <button type="submit" style="width:100%;margin-top:12px;padding:11px;font:inherit;font-size:13px;
            font-weight:700;background:#1f3d5c;color:#fff;border:0;border-radius:6px;cursor:pointer">Enter</button>
        </form>
        <div class="login-foot" style="margin-top:18px">
          Rosemont Partners is a fictional firm and all data is synthetic.
          <a href="/wealthmanagement/welcome/">About the platform &rarr;</a>
        </div>
      </div>
    </div>`);
  setTimeout(() => { const i = document.getElementById("gate-input"); if (i) i.focus(); }, 50);
}

/* ---------- sign-in overlay ---------- */
function renderSignIn() {
  if (!gatePassed()) return renderGate();
  const cards = PERSONAS.map((p) => {
    const access = p.access;
    return `<button class="login-card" onclick="setRole('${p.id}')">
      <span class="avatar">${p.perms.external ? "◇" : esc(p.init)}</span>
      <span class="who"><b>${esc(p.name)}</b><i>${esc(p.title)}</i></span>
      <span class="perm">${access}</span>
    </button>`;
  }).join("");

  document.body.insertAdjacentHTML("beforeend", `
    <div class="login-overlay">
      <div class="login-box">
        <div class="login-logo">${RP_MARK_SVG(46)}</div>
        <div class="login-title">Rosemont Partners</div>
        <div class="login-sub">Private Wealth Management &middot; client &amp; adviser portal</div>
        <div class="login-note">Select a user to enter. Permissions, visible households and every dollar
          figure on screen follow from the role you choose.</div>
        <div class="login-grid">${cards}</div>
        <div class="login-foot">
          Demonstration environment. Rosemont Partners is a fictional firm and every household, holding,
          fund, figure and document in this portal is synthetic.
          <a href="/wealthmanagement/welcome/">Read about the platform &rarr;</a>
        </div>
      </div>
    </div>`);
}

/* ---------- brand mark ---------- */
function RP_MARK_SVG(size = 30) {
  return `<svg class="rp-mark" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="30.5" fill="none" stroke="var(--rp-brass)" stroke-width="1.4"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="var(--rp-claret)" stroke-width="1.4"/>
    <path d="M32 9.2 L39.5 24.4 L56.3 26.8 L44.1 38.7 L47.0 55.4 L32 47.5 L17.0 55.4 L19.9 38.7 L7.7 26.8 L24.5 24.4 Z"
      fill="none" stroke="var(--rp-claret)" stroke-width="1.3" stroke-linejoin="round" opacity="0.55"/>
    <circle cx="32" cy="32" r="6" fill="var(--rp-claret)"/>
  </svg>`;
}

/* ---------- source-of-truth chips ---------- */
const SRC = {
  pa:    ["Portfolio Accounting", "Positions, performance and cost basis"],
  cust:  ["Custody", "Schwab, Fidelity and Pershing feeds"],
  crm:   ["CRM", "Relationships, activity and pipeline"],
  plan:  ["Planning", "Goals, projections and Monte Carlo"],
  brain: ["Rosemont Brain", "Generated from the live portfolio data"],
};
function srcChip(kind) {
  const s = SRC[kind];
  if (!s) return "";
  return `<span class="demo-src" title="${esc(s[1])}"><b>${esc(s[0])}</b></span>`;
}
function srcChips() {
  return [...arguments].map(srcChip).join("");
}

/* =========================================================
   APPROVAL CHAINS
   Role-gated, multi-step, persisted locally. A step unlocks
   only when every step before it is complete AND the signed-in
   persona matches the role that owns it.
   ========================================================= */
function apprState(key, n) {
  try {
    const raw = JSON.parse(localStorage.getItem("rp-appr:" + key) || "[]");
    return Array.from({ length: n }, (_, i) => !!raw[i]);
  } catch (e) { return Array.from({ length: n }, () => false); }
}
function apprSave(key, arr) {
  try { localStorage.setItem("rp-appr:" + key, JSON.stringify(arr)); } catch (e) {}
}
function apprComplete(key, n) { return apprState(key, n).every(Boolean); }
function resetChain(key) { try { localStorage.removeItem("rp-appr:" + key); } catch (e) {} window.location.reload(); }

function approveStep(key, idx) {
  const el = document.querySelector(`[data-chain="${key}"]`);
  const n = el ? Number(el.dataset.steps) : idx + 1;
  const st = apprState(key, n);
  st[idx] = new Date().toISOString();
  apprSave(key, st);
  window.location.reload();
}

/**
 * steps: [{ role, label, note }]
 * The signed-in persona may only advance a step whose role matches theirs.
 */
function approvalChain(key, steps, opts = {}) {
  const st = apprState(key, steps.length);
  const me = currentPersona();
  const rows = steps.map((s, i) => {
    const done = st[i];
    const prevDone = i === 0 || st[i - 1];
    const persona = PERSONAS.find((p) => p.id === s.role);
    const mine = me && me.id === s.role;
    const nudgeKey = `rp-nudge:${key}:${i}`;
    let nudged = "";
    try { nudged = localStorage.getItem(nudgeKey) || ""; } catch (e) {}

    let action;
    if (done) {
      action = `<span class="demo-chip ok">Signed</span>`;
    } else if (!prevDone) {
      action = `<span class="demo-chip mut">Waiting</span>`;
    } else if (mine) {
      action = `<button class="pa-btn" onclick="approveStep('${key}',${i})">Approve &amp; sign</button>`;
    } else {
      action = `<span class="demo-chip warn">Awaiting ${esc((persona && persona.name.split(" ")[0]) || s.role)}</span>`;
    }

    const nudgeBtn = (!done && prevDone && !mine && persona && me && !me.perms.external)
      ? `<button class="slack-nudge" onclick="slackNudge('${key}',${i})">${SLACK_MARK}Message ${esc(persona.name.split(" ")[0])}</button>`
      : "";

    return `<div class="appr-step ${done ? "done" : prevDone ? "active" : ""}">
      <div class="appr-who">
        <b>${esc(s.label)}</b>
        <i>${esc((persona && persona.name) || "")}${s.note ? " &middot; " + esc(s.note) : ""}</i>
        ${done ? `<em class="appr-stamp">Signed ${fmtDate(String(done).slice(0, 10))}</em>` : ""}
        ${nudged ? `<em class="appr-nudged">⌲ Reminder sent ${esc(nudged)}</em>` : ""}
      </div>
      <div class="appr-act">${action}${nudgeBtn}</div>
    </div>`;
  }).join('<span class="appr-arrow">→</span>');

  const complete = st.every(Boolean);
  return `<div class="appr-chain" data-chain="${key}" data-steps="${steps.length}">
    <div class="appr-head">
      <span class="rp-eyebrow">${esc(opts.title || "Approval chain")}</span>
      ${complete ? `<span class="demo-chip ok">Fully executed</span>` : `<span class="demo-chip warn">${st.filter(Boolean).length} of ${steps.length} complete</span>`}
      <button class="appr-reset" onclick="resetChain('${key}')" title="Reset for the demo">↺</button>
    </div>
    <div class="appr-steps">${rows}</div>
  </div>`;
}

/* ---------- Slack-style nudge (pure simulation) ---------- */
const SLACK_MARK = `<svg width="12" height="12" viewBox="0 0 122 122" aria-hidden="true" style="flex:none">
  <path fill="#E01E5A" d="M25.8 77.6a12.9 12.9 0 1 1-12.9-12.9h12.9zm6.5 0a12.9 12.9 0 0 1 25.8 0v32.3a12.9 12.9 0 0 1-25.8 0z"/>
  <path fill="#36C5F0" d="M45.2 25.8a12.9 12.9 0 1 1 12.9-12.9v12.9zm0 6.5a12.9 12.9 0 0 1 0 25.8H12.9a12.9 12.9 0 0 1 0-25.8z"/>
  <path fill="#2EB67D" d="M96.9 45.2a12.9 12.9 0 1 1 12.9 12.9H96.9zm-6.5 0a12.9 12.9 0 0 1-25.8 0V12.9a12.9 12.9 0 0 1 25.8 0z"/>
  <path fill="#ECB22E" d="M77.6 96.9a12.9 12.9 0 1 1-12.9 12.9V96.9zm0-6.5a12.9 12.9 0 0 1 0-25.8h32.3a12.9 12.9 0 0 1 0 25.8z"/>
</svg>`;

function slackNudge(key, idx) {
  const el = document.querySelector(`[data-chain="${key}"]`);
  const stepEls = el ? el.querySelectorAll(".appr-step") : [];
  const label = stepEls[idx] ? stepEls[idx].querySelector("b").textContent : "the next approval";
  const who = stepEls[idx] ? stepEls[idx].querySelector("i").textContent.split(" · ")[0] : "";
  const me = currentPersona();
  const first = (who || "there").split(" ")[0];

  const ov = document.createElement("div");
  ov.className = "slk-ov";
  ov.innerHTML = `
    <div class="slk-card">
      <div class="slk-head"><span class="slk-x" onclick="this.closest('.slk-ov').remove()">✕</span>
        <b>Rosemont Partners</b><span class="slk-dm-label">Direct message</span></div>
      <div class="slk-peer">
        <span class="slk-ava">${esc((who || "?").split(" ").map((w) => w[0]).join("").slice(0, 2))}</span>
        <span><b>${esc(who)}</b><i class="slk-pres">Active</i></span>
      </div>
      <div class="slk-body">
        <div class="slk-day">Today</div>
        <div class="slk-msg">
          <span class="slk-ava sm">${esc((me && me.init) || "R")}</span>
          <div><div class="slk-msg-head"><b>${esc((me && me.name) || "You")}</b>
            <span class="slk-app">APP</span><span class="slk-time">just now</span></div>
            <div class="slk-text">Hi ${esc(first)} — <b>${esc(label)}</b> is waiting on you.
            Everything before it is signed. It is on the
            <a href="${esc(location.pathname)}">${esc(document.title.split("·")[0].trim())}</a> page in the portal.</div>
            <div class="slk-reacts"></div>
          </div>
        </div>
      </div>
      <div class="slk-composer"><span class="slk-spin"></span><i class="slk-status">Sending…</i></div>
    </div>`;
  document.body.appendChild(ov);

  setTimeout(() => {
    const s = ov.querySelector(".slk-status");
    if (s) { s.textContent = "✓ Delivered"; s.classList.add("ok"); }
    const sp = ov.querySelector(".slk-spin"); if (sp) sp.remove();
  }, 750);

  setTimeout(() => {
    const r = ov.querySelector(".slk-reacts");
    if (r) r.innerHTML = `<span class="slk-react">👀 1</span>`;
    const stamp = new Date().toLocaleString("en-US",
      { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    try { localStorage.setItem(`rp-nudge:${key}:${idx}`, stamp); } catch (e) {}
  }, 1900);
}

/* =========================================================
   E-SIGNATURE
   ========================================================= */
function sigBlock(key, roleId, caption) {
  let signed = "";
  try { signed = localStorage.getItem("rp-sig:" + key) || ""; } catch (e) {}
  const persona = PERSONAS.find((p) => p.id === roleId);
  const me = currentPersona();
  const mine = me && me.id === roleId;
  if (signed) {
    const [name, when] = signed.split("|");
    return `<div class="sig">
      <div class="sig-script">${esc(name)}</div>
      <div class="sig-meta">${esc((persona && persona.title) || "")} &middot; signed ${esc(when)}</div>
      <div class="sig-cap">${esc(caption || "")}</div></div>`;
  }
  return `<div class="sig">
    ${mine
      ? `<button class="sig-btn" onclick="signDoc('${key}','${roleId}')">Sign as ${esc((persona && persona.name) || "")}</button>`
      : `<span class="demo-chip warn">Awaiting ${esc((persona && persona.name) || roleId)}</span>`}
    <div class="sig-cap">${esc(caption || "")}</div></div>`;
}
function signDoc(key, roleId) {
  const persona = PERSONAS.find((p) => p.id === roleId);
  const when = new Date().toLocaleString("en-US",
    { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  try { localStorage.setItem("rp-sig:" + key, `${persona ? persona.name : roleId}|${when}`); } catch (e) {}
  window.location.reload();
}

/* =========================================================
   SPARKLINE — inline SVG, no library
   ========================================================= */
function sparkSVG(series, opts = {}) {
  const w = opts.w || 132, h = opts.h || 34, pad = 2;
  if (!series || series.length < 2) return "";
  const lo = Math.min(...series), hi = Math.max(...series), span = hi - lo || 1;
  const x = (i) => pad + (i * (w - pad * 2)) / (series.length - 1);
  const y = (v) => h - pad - ((v - lo) / span) * (h - pad * 2);
  const line = series.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(series.length - 1).toFixed(1)},${h} L${x(0).toFixed(1)},${h} Z`;
  const up = series[series.length - 1] >= series[0];
  const c = opts.color || (up ? "var(--color-green)" : "var(--color-red)");
  const id = "sp" + Math.abs(series[0] * 1e6 | 0) + series.length + (up ? "u" : "d");
  return `<svg class="rp-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c}" stop-opacity=".26"/>
      <stop offset="100%" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(series.length - 1).toFixed(1)}" cy="${y(series[series.length - 1]).toFixed(1)}" r="2" fill="${c}"/>
  </svg>`;
}

/* =========================================================
   FEE MATH — the single place fees are ever computed
   ========================================================= */
function annualFee(billableAssets, schedule) {
  const sch = schedule || RP.feeSchedule;
  let left = billableAssets, fee = 0;
  for (const t of sch) {
    if (left <= 0) break;
    const slice = t.upTo === null ? left : Math.min(left, t.upTo - (t.from || 0));
    fee += slice * t.rate;
    left -= slice;
  }
  return fee;
}
function effectiveRate(billableAssets, schedule) {
  return billableAssets > 0 ? annualFee(billableAssets, schedule) / billableAssets : 0;
}

/* =========================================================
   DISCLOSURE — every page carries it
   ========================================================= */
function disclosure(extra) {
  return `<div class="rp-disc">
    <b>Demonstration environment.</b> Rosemont Partners, LLC is a fictional firm. Every household, account,
    holding, fund, manager, person, document and figure shown here is synthetic and generated for illustration.
    Index and benchmark names are real; the levels and returns attached to them are not. Nothing in this portal
    is investment, tax or legal advice.${extra ? " " + extra : ""}
  </div>`;
}

/* ---------- misc ---------- */
function toolbar(title, right) {
  return `<div class="pa-toolbar"><span class="pa-title">${esc(title)}</span>
    <span class="pa-spacer"></span>${right || ""}</div>`;
}
function panel(title, body, opts = {}) {
  return `<section class="demo-panel">
    <div class="demo-panel-head"><h2>${esc(title)}</h2>
      <span class="k">${opts.k || ""}</span></div>
    ${opts.chips ? `<div class="rp-toolrow">${opts.chips}</div>` : ""}
    ${body}</section>`;
}
function gate(title, msg) {
  return `<div class="rp-gate"><b>${esc(title)}</b>${esc(msg)}</div>`;
}
/* Deterministic pseudo-random from a string seed — used everywhere so
   the demo shows the same numbers on every load and every machine. */
function seedRand(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* =========================================================
   PAGE BOOT
   Every page calls boot(). It renders the chrome, stops if
   nobody is signed in (the overlay handles that), and keeps
   one page's error from blanking the whole portal.
   ========================================================= */
function boot(opts, fn) {
  RPNav.renderTopbar(opts || {});
  if (!isSignedIn()) return;
  const app = $("#app");
  try {
    fn(app);
  } catch (e) {
    if (typeof console !== "undefined") console.error(e);
    app.innerHTML = `<div class="rp-gate"><b>This page could not be rendered</b>
      ${esc(e && e.message ? e.message : String(e))}</div>` + disclosure();
  }
}
