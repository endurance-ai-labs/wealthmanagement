/* =========================================================
   CLIENT BOOK
   The asset-book pattern applied to people. Every household
   is a card carrying its real world, not just its balance:
   who the family is, what they do, what they own that we do
   not custody, what they owe, and what is coming next.
   Clicking a card opens the full relationship view.
   ========================================================= */

/* Declared before boot(): page constants used by render helpers must exist
   before the first render call, or the classic temporal-dead-zone error fires. */
const CB_SEG_TONE = {
  UHNW:          ["#12243a", "#1f3d5c"],
  HNW:           ["#1b3247", "#2c5580"],
  Emerging:      ["#233544", "#3d6a8f"],
  Institutional: ["#2a2330", "#5c3742"],
};

var cbSeg = "All";
var cbAdvisor = "All";
var cbSort = "assets";
var cbQuery = "";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) {
    app.innerHTML = gate("Not available in the client portal",
      "The client book is an internal view of the whole practice.") + disclosure();
    return;
  }
  renderClientBook();
});

function cbBook() {
  let list = visibleHouseholds();
  if (cbSeg !== "All") list = list.filter((h) => h.segment === cbSeg);
  if (cbAdvisor !== "All") list = list.filter((h) => h.advisor === cbAdvisor);
  if (cbQuery) {
    const q = cbQuery.toLowerCase();
    list = list.filter((h) =>
      h.name.toLowerCase().indexOf(q) >= 0 ||
      h.contact.toLowerCase().indexOf(q) >= 0 ||
      (WORLD[h.id] && WORLD[h.id].headline.toLowerCase().indexOf(q) >= 0));
  }
  const key = {
    assets:   (a, b) => b.mv - a.mv,
    networth: (a, b) => WORLD[b.id].netWorth - WORLD[a.id].netWorth,
    name:     (a, b) => (a.name < b.name ? -1 : 1),
    attention:(a, b) => cbAttention(b).length - cbAttention(a).length,
    contact:  (a, b) => (a.lastContact < b.lastContact ? -1 : 1),
  }[cbSort];
  return list.slice().sort(key);
}

/* What about this relationship needs a human, right now. */
function cbAttention(h) {
  const w = WORLD[h.id];
  const out = [];
  if (isDrifted(allocationOf(householdPositions(h.id)))) out.push("Out of tolerance");
  if (h.ipsReview < RP.asOf) out.push("IPS review due");
  if (CAPITAL_CALLS.some((c) => c.hhId === h.id && c.status === "Unfunded")) out.push("Call unfunded");
  if (daysBetween(h.lastContact, RP.asOf) > 60) out.push("No contact 60 days");
  if (w.debtTotal / w.netWorth > 0.15) out.push("Leverage above 15%");
  return out;
}

function cbSetSeg(v)     { cbSeg = v; renderClientBook(); }
function cbSetAdvisor(v) { cbAdvisor = v; renderClientBook(); }
function cbSetSort(v)    { cbSort = v; renderClientBook(); }
function cbSearch(v)     { cbQuery = v; renderClientBook(true); }

function renderClientBook(keepFocus) {
  const app = $("#app");
  const list = cbBook();
  const all = visibleHouseholds();
  const advisors = [...new Set(all.map((h) => h.advisor))].sort();

  const managed = list.reduce((s, h) => s + h.mv, 0);
  const netWorth = list.reduce((s, h) => s + WORLD[h.id].netWorth, 0);
  const heldAway = list.reduce((s, h) => s + WORLD[h.id].heldAwayTotal + WORLD[h.id].propertyTotal, 0);
  const debt = list.reduce((s, h) => s + WORLD[h.id].debtTotal, 0);
  const draw = list.reduce((s, h) => s + WORLD[h.id].annualDraw, 0);
  const needAttention = list.filter((h) => cbAttention(h).length);

  const sel = (id, val, opts, fn) => `<select class="pa-btn" onchange="${fn}(this.value)">
    ${opts.map((o) => `<option value="${esc(o[0])}" ${o[0] === val ? "selected" : ""}>${esc(o[1])}</option>`).join("")}
  </select>`;

  app.innerHTML = `
  ${toolbar("Client Book",
    `${sel("seg", cbSeg, [["All", "All segments"]].concat(
        ["UHNW", "HNW", "Emerging", "Institutional"].map((s) => [s, segLabel(s)])), "cbSetSeg")}
     ${sel("adv", cbAdvisor, [["All", "All advisers"]].concat(advisors.map((a) => [a, a])), "cbSetAdvisor")}
     ${sel("sort", cbSort, [["assets", "Sort: assets"], ["networth", "Sort: net worth"],
        ["attention", "Sort: needs attention"], ["contact", "Sort: least recent contact"],
        ["name", "Sort: name"]], "cbSetSort")}
     <input class="demo-search" id="cbq" placeholder="Search families, contacts, situations"
       value="${esc(cbQuery)}" oninput="cbSearch(this.value)">
     ${srcChips("crm", "pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${list.length}</div><div class="l">Relationships in view</div>
      <div class="s">of ${all.length} in ${esc(bookLabel().toLowerCase())}</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(managed)}</div><div class="l">Assets we manage</div>
      <div class="s">${fmtPct((managed / (netWorth || 1)) * 100, 0)} of their net worth</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(netWorth)}</div><div class="l">Total net worth</div>
      <div class="s">Managed, held away and property, less debt</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(heldAway)}</div><div class="l">Held away from us</div>
      <div class="s">The advice opportunity</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(debt)}</div><div class="l">Liabilities</div>
      <div class="s">${fmtPct((debt / (netWorth || 1)) * 100, 1)} of net worth</div></div>
    <div class="demo-kpi"><div class="v">${needAttention.length}</div><div class="l">Need attention</div>
      <div class="s">${draw > 0 ? fmtM(draw) + " drawn annually" : "No distributions"}</div></div>
  </div>

  <div class="rp-note" style="margin:0 0 16px">
    Every card is a family, not an account. The line under the name is what an adviser would say about them
    today, generated from their actual position, drift, calls and review dates. Click through for the full
    relationship.
  </div>

  <div class="demo-props">${list.map(cbCard).join("")}</div>

  ${list.length === 0 ? gate("No relationships match", "Clear a filter or change the search.") : ""}

  ${disclosure()}`;

  if (keepFocus) {
    const q = document.getElementById("cbq");
    if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }
}

function cbCard(h) {
  const w = WORLD[h.id];
  const r = householdReturns(h.id);
  const flags = cbAttention(h);
  const tone = CB_SEG_TONE[h.segment] || CB_SEG_TONE.HNW;
  const initials = h.name.replace(/[^A-Za-z ]/g, "").split(" ")
    .filter(Boolean).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const nextEvent = w.events.filter((e) => e.kind === "upcoming")[0];
  const commits = COMMITMENTS.filter((c) => c.hhId === h.id);

  return `
  <a class="demo-prop" href="/wealthmanagement/households/household/?id=${h.id}">
    <div class="demo-prop-visual" style="background:
        radial-gradient(ellipse 120% 90% at 85% -20%, rgba(201,169,108,0.26), transparent 60%),
        linear-gradient(135deg, ${tone[1]}, ${tone[0]})">
      <span class="mono">${esc(initials)}</span>
      <span style="text-align:right;color:rgba(244,242,237,.82);font-size:10px;letter-spacing:.12em;text-transform:uppercase">
        ${esc(segLabel(h.segment))}<br>
        <span style="font-size:9.5px;color:rgba(244,242,237,.6)">${esc(h.tier)} service</span>
      </span>
    </div>

    <div class="demo-prop-body">
      <div class="demo-prop-name">${esc(h.name)}</div>
      <div class="demo-prop-loc">${esc(w.career[0])} &middot; ${esc(h.state)} &middot; client since ${h.since.slice(0, 4)}
        &middot; ${esc(h.advisor)}</div>

      <div class="rp-note" style="margin-top:9px;min-height:32px;color:var(--color-text-muted);line-height:1.45">
        ${esc(w.headline)}
      </div>

      <div class="demo-prop-stats">
        <div><div class="v">${fmtM(h.mv)}</div><div class="l">Managed</div></div>
        <div><div class="v">${fmtM(w.netWorth)}</div><div class="l">Net worth</div></div>
        <div><div class="v">${r.ytd >= 0 ? "+" : ""}${r.ytd.toFixed(1)}%</div><div class="l">YTD net</div></div>
      </div>

      <div class="demo-prop-stats" style="border-top:0;padding-top:6px;margin-top:6px">
        <div><div class="v">${w.family.filter((f) => f.relation !== "Governing body").length}</div><div class="l">In the family</div></div>
        <div><div class="v">${fmtM(w.heldAwayTotal + w.propertyTotal)}</div><div class="l">Held away</div></div>
        <div><div class="v">${w.annualDraw ? fmtM(w.annualDraw) : "—"}</div><div class="l">Annual draw</div></div>
      </div>

      <div class="demo-prop-spark">${sparkSVG(householdReturns(h.id).growth.slice(-24), { w: 300, h: 34 })}</div>

      <div class="demo-prop-row2">
        <span style="display:flex;gap:5px;flex-wrap:wrap">
          <span class="demo-chip mut">${esc(h.modelName)}</span>
          ${commits.length ? `<span class="demo-chip mut">${commits.length} private funds</span>` : ""}
          ${flags.length
            ? flags.slice(0, 1).map((f) => `<span class="demo-chip warn">${esc(f)}</span>`).join("")
            : `<span class="demo-chip ok">In good order</span>`}
          ${flags.length > 1 ? `<span class="demo-chip warn">+${flags.length - 1}</span>` : ""}
        </span>
      </div>

      <div class="rp-note" style="margin-top:9px;padding-top:9px;border-top:1px solid var(--color-border-subtle)">
        ${nextEvent
          ? `<b style="color:var(--color-cloud-whisper)">Next:</b> ${esc(nextEvent.title)} &middot; ${fmtDate(nextEvent.date)}`
          : `<b style="color:var(--color-cloud-whisper)">Last contact:</b> ${fmtDate(h.lastContact)}`}
      </div>
    </div>
  </a>`;
}
