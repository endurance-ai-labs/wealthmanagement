/* =========================================================
   TEAM & CAPACITY
   Adviser capacity against the model, service standards,
   credentials, ratios and succession.
   ========================================================= */

/* Declared before boot(): a page constant used by a render helper must exist
   before the first render call, or it is still in the temporal dead zone. */
const CREDENTIALS = [
  ["CFA charterholders", 9], ["CFP professionals", 14], ["CPA", 3],
  ["JD", 2], ["CAIA", 4], ["CFA Level II or III candidates", 6],
];

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (!can("firm")) { app.innerHTML = gate("Restricted", "Firm capacity is limited to leadership roles.") + disclosure(); return; }
  render();
});

function render() {
  const over = ADVISORS.filter((a) => a.households > a.capacity);
  const totalHh = ADVISORS.reduce((s, a) => s + a.households, 0);

  $("#app").innerHTML = `
  ${toolbar("Team & Capacity",
    `<span class="demo-chip ${over.length ? "warn" : "ok"}">${over.length} advisers over capacity</span>`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${RP.headcount.total}</div><div class="l">Staff</div>
      <div class="s">Across four offices</div></div>
    <div class="demo-kpi"><div class="v">${RP.headcount.advisors}</div><div class="l">Advisers</div>
      <div class="s">${totalHh} households assigned</div></div>
    <div class="demo-kpi"><div class="v">${(FIRM.households / RP.headcount.service).toFixed(0)}:1</div>
      <div class="l">Households per service associate</div><div class="s">Target 25:1</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(FIRM.aum / RP.headcount.total)}</div>
      <div class="l">Assets per employee</div><div class="s">Firm-wide</div></div>
    <div class="demo-kpi"><div class="v">${over.length}</div><div class="l">Over capacity</div>
      <div class="s">Above ${RP.targets.householdsPerAdvisor} households</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(RP.targets.retention * 100, 1)}</div>
      <div class="l">Client retention</div><div class="s">Trailing twelve months</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Adviser capacity", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Adviser</th><th>Office</th><th class="num">Households</th>
          <th>Against capacity</th><th class="num">Detailed assets</th><th>Standing</th></tr></thead>
        <tbody>${ADVISORS.map((a) => {
          const hh = HOUSEHOLDS.filter((h) => h.advisor === a.name);
          const util = a.households / a.capacity;
          return `<tr>
            <td><b>${esc(a.name)}</b><div class="rp-note">${esc(a.title)} &middot; since ${a.tenure}</div></td>
            <td class="dim">${esc(a.office)}</td>
            <td class="num">${a.households}</td>
            <td><div class="rp-track" style="height:14px">
              <i style="width:${Math.min(100, util * 100)}%;background:${util > 1 ? "var(--color-amber)" : "var(--color-blue)"}"></i>
              <u style="left:100%"></u></div>
              <div class="rp-note">${fmtPct(util * 100, 0)} of ${a.capacity}</div></td>
            <td class="num">${fmtM(hh.reduce((s, h) => s + h.mv, 0))}</td>
            <td>${util > 1 ? pill("Over", "amber") : util > 0.85 ? pill("Near", "blue") : pill("Room", "green")}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Capacity is set at ${RP.targets.householdsPerAdvisor}
      households, weighted by service tier. Two advisers are past it, which is the binding constraint on how
      much new business the firm can take before the next hire.</div>`, { k: "Model capacity" })}

    ${panel("Service standards", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Tier</th><th class="num">Minimum</th><th class="num">Meetings</th>
          <th>Planning</th><th>Reporting</th><th>Team</th></tr></thead>
        <tbody>${RP.serviceTiers.map((t) => `<tr>
          <td><b>${esc(t.id)}</b></td>
          <td class="num">${fmtM(t.minAssets)}</td>
          <td class="num">${t.meetings}/yr</td>
          <td class="dim">${esc(t.planning)}</td>
          <td class="dim">${esc(t.reporting)}</td>
          <td class="dim">${esc(t.team)}</td></tr>`).join("")}</tbody>
      </table>
      <h4 class="rp-eyebrow" style="margin-top:16px">Standards met</h4>
      <table class="demo-tbl" style="width:100%">
        <tbody>
          <tr><td>Meetings held against commitment</td><td class="num">${pill("94% met", "green")}</td></tr>
          <tr><td>Quarterly reports delivered on time</td><td class="num">${pill("100%", "green")}</td></tr>
          <tr><td>Annual policy reviews completed</td><td class="num">${pill("4 past due", "amber")}</td></tr>
          <tr><td>Response within one business day</td><td class="num">${pill("98%", "green")}</td></tr>
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">The tier caps the service commitment so an adviser is never
      asked to deliver a family-office relationship on a core-tier fee.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Credentials and offices", `
      <h4 class="rp-eyebrow">Credentials</h4>
      <table class="demo-tbl" style="width:100%;margin-bottom:16px">
        <tbody>${CREDENTIALS.map((c) => `<tr><td>${esc(c[0])}</td><td class="num">${c[1]}</td></tr>`).join("")}</tbody>
      </table>
      <h4 class="rp-eyebrow">Offices</h4>
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Office</th><th>Role</th><th class="num">Staff</th><th class="num">Assets</th></tr></thead>
        <tbody>${RP.offices.map((o) => `<tr>
          <td><b>${esc(o.city)}</b></td><td class="dim">${esc(o.role)}</td>
          <td class="num">${o.staff}</td><td class="num">${fmtM(o.aum)}</td></tr>`).join("")}</tbody>
      </table>`)}

    ${panel("Succession and key-person risk", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Relationship concentration</th><th class="num">Households</th>
          <th class="num">Assets</th><th>Continuity plan</th></tr></thead>
        <tbody>${ADVISORS.slice(0, 5).map((a) => {
          const hh = HOUSEHOLDS.filter((h) => h.advisor === a.name);
          const assets = hh.reduce((s, h) => s + h.mv, 0);
          return `<tr><td><b>${esc(a.name)}</b></td>
            <td class="num">${a.households}</td>
            <td class="num">${fmtM(assets)}</td>
            <td>${a.tenure < 2015 ? pill("Named successor", "green") : pill("To be assigned", "amber")}</td></tr>`;
        }).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Every relationship above $10M has a named second adviser who
      attends at least one meeting a year. Continuity is a client protection, not an HR exercise: a family should
      never meet their new adviser for the first time in a crisis.</div>
      <div class="rp-note" style="margin-top:8px">Ownership is spread across 14 partners, with no individual
      holding more than 11% of the firm.</div>`)}
  </div>

  ${disclosure()}`;
}
