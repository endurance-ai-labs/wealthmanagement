/* =========================================================
   RESEARCH CONSOLE
   A predictive search bar that sits on every page in the
   Research group. It does three things:

     1. Looks anything up on the spot, across every record
        the platform holds: benchmarks, sectors, funds,
        managers, asset classes and house views.
     2. Learns. Every selection is scored by how often and
        how recently it was chosen, so the things a person
        actually uses rise to the top of their own list.
     3. Adds coverage. Anything not on the platform can be
        raised as a coverage request from the search bar,
        which enters the research queue rather than
        appearing as though it were already researched.

   On (3): a request records what was asked for. It does not
   invent performance for a security the platform does not
   cover, because a number that looks researched but is not
   is worse than an honest gap.
   ========================================================= */

/* ---------- the searchable index, built once ---------- */
let _rsIndex = null;

function researchIndex() {
  if (_rsIndex) return _rsIndex;
  const ix = [];

  if (typeof INDICES !== "undefined") {
    INDICES.forEach((q) => ix.push({
      id: "idx:" + q.code, kind: "Benchmark", label: q.name, sub: q.code,
      group: { us: "US equity", sector: "US sector", intl: "International",
               fi: "Fixed income", commod: "Commodities", fx: "Currencies" }[q.board] || q.board,
      ref: q, href: "/wealthmanagement/markets/",
    }));
  }
  if (typeof ALT_BENCH !== "undefined") {
    ALT_BENCH.forEach((q) => ix.push({
      id: "alt:" + q.code, kind: "Benchmark", label: q.name, sub: q.code,
      group: "Alternatives", ref: q, href: "/wealthmanagement/markets/",
    }));
  }
  if (typeof FUNDS !== "undefined") {
    FUNDS.forEach((f) => ix.push({
      id: "fund:" + f.id, kind: "Fund", label: f.name, sub: f.manager + " · " + f.vehicleLabel,
      group: f.acLabel, ref: f, href: "/wealthmanagement/funds/fund/?id=" + f.id,
    }));
  }
  if (typeof MANAGERS !== "undefined") {
    MANAGERS.forEach((m) => ix.push({
      id: "mgr:" + m.id, kind: "Manager", label: m.name, sub: m.hq + " · founded " + m.founded,
      group: "Managers", ref: m, href: "/wealthmanagement/managers/?id=" + m.id,
    }));
  }
  if (typeof ASSET_CLASSES !== "undefined") {
    ASSET_CLASSES.forEach((a) => ix.push({
      id: "ac:" + a.id, kind: "Asset class", label: a.label, sub: "Benchmark: " + a.benchName,
      group: a.group, ref: a, href: "/wealthmanagement/committee/",
    }));
  }
  if (typeof HOUSE_VIEWS !== "undefined") {
    HOUSE_VIEWS.forEach((v) => ix.push({
      id: "view:" + v[0], kind: "House view", label: (AC[v[0]] ? AC[v[0]].label : v[0]) + " — " + v[1],
      sub: v[2] + " horizon", group: "Committee", ref: v, href: "/wealthmanagement/committee/",
    }));
  }
  ix.push.apply(ix, userAdditions().map((u) => ({
    id: "add:" + u.id, kind: u.kind, label: u.name, sub: "Coverage requested " + fmtDateShort(u.added),
    group: "Added by you", ref: u, href: null, added: true,
  })));

  _rsIndex = ix;
  return ix;
}

/* ---------- what the person has looked up before ---------- */
const RS_LEARN_KEY = "rp-learn";
const RS_ADD_KEY = "rp-coverage";

function rsLearnStore() {
  try { return JSON.parse(localStorage.getItem(RS_LEARN_KEY) || "{}"); } catch (e) { return {}; }
}
function rsRemember(id) {
  const s = rsLearnStore();
  const e = s[id] || { n: 0, t: 0 };
  e.n += 1; e.t = Date.now();
  s[id] = e;
  try { localStorage.setItem(RS_LEARN_KEY, JSON.stringify(s)); } catch (err) {}
  _rsIndex = null; /* additions may have changed */
}
function rsForget() {
  try { localStorage.removeItem(RS_LEARN_KEY); } catch (e) {}
}

function userAdditions(kind) {
  let all = [];
  try { all = JSON.parse(localStorage.getItem(RS_ADD_KEY) || "[]"); } catch (e) {}
  return kind ? all.filter((a) => a.kind === kind) : all;
}
function addCoverage(rec) {
  const all = userAdditions();
  all.unshift(rec);
  try { localStorage.setItem(RS_ADD_KEY, JSON.stringify(all)); } catch (e) {}
  _rsIndex = null;
}
function dropCoverage(id) {
  const all = userAdditions().filter((a) => a.id !== id);
  try { localStorage.setItem(RS_ADD_KEY, JSON.stringify(all)); } catch (e) {}
  _rsIndex = null;
}

/* ---------- scoring ----------
   Match quality first, then what this person actually uses.
   Frequency is damped with a log so one heavily used item cannot
   bury a better textual match, and recency decays over a fortnight. */
function rsScore(item, q, learn) {
  const label = item.label.toLowerCase();
  const sub = (item.sub || "").toLowerCase();
  let base = 0;
  if (!q) {
    base = 1; /* empty query: pure recall, ranked by learning below */
  } else if (label === q) base = 120;
  else if (label.startsWith(q)) base = 90;
  else if (label.split(/[\s—·-]+/).some((w) => w.startsWith(q))) base = 70;
  else if (label.indexOf(q) >= 0) base = 45;
  else if (sub.indexOf(q) >= 0) base = 25;
  else return -1;

  /* shorter labels win ties, so "S&P 500" beats "S&P 500 Equal Weight" */
  base -= Math.min(12, label.length / 8);

  const e = learn[item.id];
  if (e) {
    const days = (Date.now() - e.t) / 86400000;
    base += Math.min(30, 10 * Math.log(1 + e.n));   /* frequency */
    base += Math.max(0, 14 - days);                  /* recency, two weeks */
  }
  if (item.added) base += 6;
  return base;
}

function rsSearch(q, kinds, limit) {
  const learn = rsLearnStore();
  const query = (q || "").trim().toLowerCase();
  let pool = researchIndex();
  if (kinds && kinds.length) pool = pool.filter((i) => kinds.indexOf(i.kind) >= 0);
  return pool
    .map((i) => ({ i, s: rsScore(i, query, learn) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit || 8)
    .map((x) => Object.assign({ score: x.s, used: !!learn[x.i.id] }, x.i));
}

/* =========================================================
   THE COMPONENT
   ========================================================= */
const RS = { q: "", open: false, active: -1, hits: [], sel: null, ctx: null };

/* ctx: { kinds:[], addKinds:[], title, placeholder, onAdd } */
function researchConsole(ctx) {
  RS.ctx = ctx;
  return `
  <section class="demo-panel rs-panel">
    <div class="demo-panel-head">
      <h2>${esc(ctx.title || "Research console")}</h2>
      <span class="k">Predictive · learns what you use</span>
    </div>
    <div class="rs-wrap">
      <div class="rs-field">
        <span class="rs-icon" aria-hidden="true">⌕</span>
        <input id="rs-input" class="rs-input" type="text" autocomplete="off" spellcheck="false"
          role="combobox" aria-expanded="false" aria-controls="rs-list" aria-autocomplete="both"
          placeholder="${esc(ctx.placeholder || "Search benchmarks, funds, managers, sectors…")}"
          oninput="rsType(this.value)" onkeydown="rsKey(event)" onfocus="rsType(this.value)">
        <span class="rs-ghost" id="rs-ghost" aria-hidden="true"></span>
        <button class="rs-clear" onclick="rsClear()" title="Clear" aria-label="Clear search">✕</button>
      </div>
      <div class="rs-list" id="rs-list" role="listbox" hidden></div>
    </div>
    <div id="rs-detail"></div>
    <div class="rp-note rs-hint">
      Type to search every record the platform holds. The list reorders as it learns which results you
      actually open. Anything we do not cover can be raised as a coverage request from here.
    </div>
  </section>`;
}

function rsType(v) {
  RS.q = v;
  const kinds = (RS.ctx && RS.ctx.kinds) || [];
  RS.hits = rsSearch(v, kinds, 8);
  RS.active = RS.hits.length ? 0 : -1;
  rsPaint();
}

function rsPaint() {
  const list = document.getElementById("rs-list");
  const input = document.getElementById("rs-input");
  const ghost = document.getElementById("rs-ghost");
  if (!list || !input) return;

  const q = RS.q.trim();
  const canAdd = q.length >= 2;

  /* inline completion: only when the top hit genuinely extends what was typed */
  let completion = "";
  if (q && RS.hits.length) {
    const top = RS.hits[0].label;
    if (top.toLowerCase().startsWith(q.toLowerCase()) && top.length > q.length) {
      completion = top.slice(q.length);
    }
  }
  ghost.textContent = completion ? RS.q + completion : "";
  ghost.dataset.completion = completion;

  const rows = RS.hits.map((h, i) => `
    <div class="rs-opt ${i === RS.active ? "on" : ""}" role="option" id="rs-opt-${i}"
      aria-selected="${i === RS.active}" onmousedown="event.preventDefault();rsPick(${i})"
      onmouseenter="rsHover(${i})">
      <span class="rs-opt-main">
        <b>${rsMark(h.label, q)}</b>
        <i>${esc(h.sub || "")}</i>
      </span>
      <span class="rs-opt-meta">
        ${h.used ? '<span class="rs-learned" title="You have opened this before">often used</span>' : ""}
        <span class="demo-chip mut">${esc(h.kind)}</span>
      </span>
    </div>`).join("");

  const addRow = canAdd ? `
    <div class="rs-opt rs-add ${RS.active === RS.hits.length ? "on" : ""}" role="option"
      id="rs-opt-${RS.hits.length}" aria-selected="${RS.active === RS.hits.length}"
      onmousedown="event.preventDefault();rsPick(${RS.hits.length})" onmouseenter="rsHover(${RS.hits.length})">
      <span class="rs-opt-main"><b>+ Request coverage of &ldquo;${esc(q)}&rdquo;</b>
        <i>Not on the platform. Raise it with the research team.</i></span>
    </div>` : "";

  if (!RS.hits.length && !canAdd) {
    list.hidden = true; input.setAttribute("aria-expanded", "false"); return;
  }
  list.innerHTML = rows + addRow;
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
  if (RS.active >= 0) input.setAttribute("aria-activedescendant", "rs-opt-" + RS.active);
}

function rsMark(text, q) {
  if (!q) return esc(text);
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>"
    + esc(text.slice(i + q.length));
}

function rsHover(i) { RS.active = i; rsPaint(); }

function rsKey(e) {
  const max = RS.hits.length + (RS.q.trim().length >= 2 ? 1 : 0) - 1;
  if (e.key === "ArrowDown") { e.preventDefault(); RS.active = Math.min(max, RS.active + 1); rsPaint(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); RS.active = Math.max(0, RS.active - 1); rsPaint(); }
  else if (e.key === "Enter") { e.preventDefault(); if (RS.active >= 0) rsPick(RS.active); }
  else if (e.key === "Escape") { rsClose(); }
  else if (e.key === "Tab" || e.key === "ArrowRight") {
    /* accept the inline completion */
    const g = document.getElementById("rs-ghost");
    const c = g && g.dataset.completion;
    if (c && RS.hits.length) {
      e.preventDefault();
      /* Accept the canonical label rather than the typed prefix plus the
         remainder, so the input ends up correctly cased. */
      const input = document.getElementById("rs-input");
      input.value = RS.hits[0].label;
      rsType(input.value);
    }
  }
}

function rsClose() {
  const list = document.getElementById("rs-list");
  if (list) list.hidden = true;
  const input = document.getElementById("rs-input");
  if (input) input.setAttribute("aria-expanded", "false");
}
function rsClear() {
  const input = document.getElementById("rs-input");
  if (input) { input.value = ""; input.focus(); }
  RS.q = ""; RS.sel = null;
  const d = document.getElementById("rs-detail"); if (d) d.innerHTML = "";
  rsType("");
}

function rsPick(i) {
  if (i < RS.hits.length) {
    const hit = RS.hits[i];
    rsRemember(hit.id);
    RS.sel = hit;
    const input = document.getElementById("rs-input");
    if (input) input.value = hit.label;
    RS.q = hit.label;
    rsClose();
    rsDetail(hit);
  } else {
    rsOpenAdd(RS.q.trim());
  }
}

/* ---------- the result card ---------- */
function rsDetail(hit) {
  const d = document.getElementById("rs-detail");
  if (!d) return;
  let body = "";

  if (hit.kind === "Benchmark") {
    const q = hit.ref;
    const rows = [["Year to date", q.ytd], ["One year", q.y1], ["Three years", q.y3],
                  ["Five years", q.y5], ["Ten years", q.y10]];
    body = `
      <div class="rs-grid">
        ${q.level != null ? `<div class="rs-stat"><b>${q.level.toLocaleString("en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b><span>Level</span></div>` : ""}
        ${rows.filter((r) => r[1] != null).map((r) =>
          `<div class="rs-stat"><b>${ret(r[1], 1)}</b><span>${esc(r[0])}</span></div>`).join("")}
        ${q.fwdPE ? `<div class="rs-stat"><b>${q.fwdPE.toFixed(1)}</b><span>Forward P/E</span></div>` : ""}
        ${q.divYld ? `<div class="rs-stat"><b>${q.divYld.toFixed(2)}%</b><span>Dividend yield</span></div>` : ""}
      </div>`;
  } else if (hit.kind === "Fund") {
    const f = hit.ref;
    const held = POSITIONS.filter((p) => p.fundId === f.id);
    body = `
      <div class="rs-grid">
        <div class="rs-stat"><b>${f.aum ? fmtM(f.aum * 1e6) : "—"}</b><span>Fund size</span></div>
        <div class="rs-stat"><b>${fmtPct(f.mgmtFee, 2)}</b><span>Management fee</span></div>
        <div class="rs-stat"><b>${f.isPrivate ? ret(f.priv.irr, 1) : (f.y3 == null ? "—" : ret(f.y3, 1))}</b>
          <span>${f.isPrivate ? "Net IRR" : "Three years"}</span></div>
        <div class="rs-stat"><b>${f.scoreAvg == null ? "—" : f.scoreAvg.toFixed(1)}</b><span>Score</span></div>
        <div class="rs-stat"><b>${statusPill(f.status)}</b><span>Status</span></div>
        <div class="rs-stat"><b>${fmtM(held.reduce((s, p) => s + p.value, 0))}</b><span>Held for clients</span></div>
      </div>
      <div class="rp-note" style="margin-top:10px">${esc(f.strategy)}.
      ${WATCH_NOTES[f.id] ? esc(WATCH_NOTES[f.id]) : ""}</div>`;
  } else if (hit.kind === "Manager") {
    const m = hit.ref;
    const funds = FUNDS.filter((f) => f.manager === m.name);
    body = `
      <div class="rs-grid">
        <div class="rs-stat"><b>${fmtM(m.firmAum * 1e6)}</b><span>Firm assets</span></div>
        <div class="rs-stat"><b>${m.founded}</b><span>Founded</span></div>
        <div class="rs-stat"><b>${funds.length}</b><span>Strategies we use</span></div>
        <div class="rs-stat"><b>${esc(m.ownership)}</b><span>Ownership</span></div>
      </div>
      <div class="rp-note" style="margin-top:10px">${esc(m.view)}</div>`;
  } else if (hit.kind === "Asset class") {
    const a = hit.ref;
    const v = HOUSE_VIEWS.find((x) => x[0] === a.id);
    body = `
      <div class="rs-grid">
        <div class="rs-stat"><b>${a.er.toFixed(1)}%</b><span>Expected return</span></div>
        <div class="rs-stat"><b>${a.vol.toFixed(1)}%</b><span>Volatility</span></div>
        <div class="rs-stat"><b>${v ? esc(v[1]) : "—"}</b><span>House view</span></div>
        <div class="rs-stat"><b>${esc(a.benchName)}</b><span>Benchmark</span></div>
      </div>
      ${v ? `<div class="rp-note" style="margin-top:10px">${esc(v[3])}</div>` : ""}`;
  } else if (hit.added) {
    const u = hit.ref;
    body = `
      <div class="rp-note">Coverage requested ${fmtDate(u.added)} by ${esc(u.by)}.
      ${esc(u.note || "")}</div>
      ${approvalChain("cov-" + u.id, [
        { role: "research", label: "Analyst screen", note: "Initial assessment and peer set" },
        { role: "research", label: "Director of research", note: "Decides whether it enters full due diligence" },
        { role: "cio", label: "Committee", note: "Vote to add to the approved list" },
      ], { title: "Coverage request" })}
      <div class="rp-note">No performance is shown for a request. The platform reports what it has
      researched, and an honest gap is more useful than a number that only looks researched.</div>`;
  } else {
    body = `<div class="rp-note">${esc(hit.sub || "")}</div>`;
  }

  d.innerHTML = `
    <div class="rs-detail">
      <div class="rs-detail-head">
        <div>
          <b>${esc(hit.label)}</b>
          <i>${esc(hit.kind)}${hit.group ? " · " + esc(hit.group) : ""}</i>
        </div>
        <div class="rs-actions">
          ${hit.href ? `<a class="pa-btn" href="${hit.href}">Open the full record</a>` : ""}
          ${hit.added ? `<button class="pa-btn" onclick="rsDrop('${esc(hit.ref.id)}')">Withdraw request</button>` : ""}
        </div>
      </div>
      ${body}
    </div>`;
}

function rsDrop(id) { dropCoverage(id); location.reload(); }

/* ---------- raising a coverage request ---------- */
function rsOpenAdd(term) {
  const kinds = (RS.ctx && RS.ctx.addKinds) || ["Sector", "Company", "Fund", "Manager", "Benchmark"];
  const d = document.getElementById("rs-detail");
  if (!d) return;
  rsClose();
  d.innerHTML = `
    <div class="rs-detail">
      <div class="rs-detail-head"><div><b>Request coverage</b>
        <i>Enters the research queue. Nothing is presented as researched until it has been.</i></div></div>
      <div class="rs-form">
        <label>Name
          <input class="rp-in" id="rs-add-name" value="${esc(term)}"></label>
        <label>Type
          <select class="rp-in" id="rs-add-kind">
            ${kinds.map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join("")}
          </select></label>
        <label>Closest asset class
          <select class="rp-in" id="rs-add-ac">
            ${ASSET_CLASSES.map((a) => `<option value="${esc(a.id)}">${esc(a.label)}</option>`).join("")}
          </select></label>
        <label class="rs-form-wide">Why it matters
          <input class="rp-in" id="rs-add-note" placeholder="What decision would this inform?"></label>
      </div>
      <div class="rs-actions" style="margin-top:12px">
        <button class="pa-btn" onclick="rsSubmitAdd()">Raise the request</button>
        <button class="pa-btn" onclick="rsClear()">Cancel</button>
      </div>
    </div>`;
  const n = document.getElementById("rs-add-name");
  if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
}

function rsSubmitAdd() {
  const name = (document.getElementById("rs-add-name") || {}).value || "";
  if (!name.trim()) return;
  const me = currentPersona();
  const rec = {
    id: "COV-" + Math.abs(hashCode(name + Date.now())).toString(36).slice(0, 7).toUpperCase(),
    name: name.trim(),
    kind: (document.getElementById("rs-add-kind") || {}).value || "Company",
    ac: (document.getElementById("rs-add-ac") || {}).value || "USLC",
    note: (document.getElementById("rs-add-note") || {}).value || "",
    by: me ? me.name : "—",
    added: RP.asOf,
  };
  addCoverage(rec);
  rsRemember("add:" + rec.id);
  location.reload();
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return h;
}

/* ---------- the coverage queue, rendered on each research page ---------- */
function coverageQueue() {
  const adds = userAdditions();
  if (!adds.length) return "";
  return panel("Coverage requests", `
    <table class="demo-tbl" style="width:100%">
      <thead><tr><th>Request</th><th>Type</th><th>Closest asset class</th><th>Raised by</th>
        <th>Raised</th><th>Stage</th><th></th></tr></thead>
      <tbody>${adds.map((a) => {
        const st = apprState("cov-" + a.id, 3).filter(Boolean).length;
        return `<tr>
          <td><b>${esc(a.name)}</b>${a.note ? `<div class="rp-note">${esc(a.note)}</div>` : ""}</td>
          <td>${esc(a.kind)}</td>
          <td class="dim">${esc(AC[a.ac] ? AC[a.ac].label : a.ac)}</td>
          <td class="dim">${esc(a.by)}</td>
          <td>${fmtDateShort(a.added)}</td>
          <td>${st === 3 ? pill("Approved", "green") : pill(st + " of 3", "amber")}</td>
          <td><button class="pa-btn" onclick="dropCoverage('${esc(a.id)}');location.reload()">Withdraw</button></td>
        </tr>`;
      }).join("")}</tbody>
    </table>
    <div class="rp-note" style="margin-top:10px">Requests raised from the search bar. They are queued for the
    research team, not treated as covered: a request carries no performance figures until the work is done.</div>`,
    { k: adds.length + " open" });
}

/* Close the list on an outside click. */
document.addEventListener("mousedown", function (e) {
  const w = document.querySelector(".rs-wrap");
  if (w && !w.contains(e.target)) rsClose();
});
