/* =========================================================
   REVENUE & BILLING
   Fee schedules, the quarterly billing run with its approval
   chain, revenue by adviser and segment, and realisation.
   ========================================================= */

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (!can("revenue")) {
    app.innerHTML = gate("Restricted", "Firm economics are limited to the executive and finance roles.") + disclosure();
    return;
  }
  render();
});

function render() {
  const q = FIRM.revenue / 4;
  const exceptions = HOUSEHOLDS.filter((h) => h.qtdFlow < -h.mv * 0.02 || h.mv < 1000000);

  $("#app").innerHTML = `
  ${toolbar("Revenue & Billing",
    `<span class="demo-chip mut">Q3 2026 run opens 30 September</span>${srcChips("pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtM(FIRM.revenue)}</div><div class="l">Revenue run-rate</div>
      <div class="s">Schedule applied to ${fmtM(FIRM.aum)}</div></div>
    <div class="demo-kpi"><div class="v">${fmtBps(FIRM.blendedFee * 100)}</div><div class="l">Blended fee</div>
      <div class="s">Across ${FIRM.households} households</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(q)}</div><div class="l">This quarter</div>
      <div class="s">Billed in arrears</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(FIRM.revenue / FIRM.households)}</div>
      <div class="l">Revenue per household</div><div class="s">Firm average</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(FIRM.revenue / RP.headcount.total)}</div>
      <div class="l">Revenue per employee</div><div class="s">${RP.headcount.total} staff</div></div>
    <div class="demo-kpi"><div class="v">${exceptions.length}</div><div class="l">Exceptions to review</div>
      <div class="s">Before the run releases</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Fee schedule", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Tier</th><th class="num">Rate</th><th class="num">Fee at the top of the tier</th></tr></thead>
        <tbody>${RP.feeSchedule.map((t) => `<tr>
          <td>${esc(t.label)}</td><td class="num">${fmtPct(t.rate * 100, 2)}</td>
          <td class="num">${t.upTo ? fmt$(annualFee(t.upTo)) : "—"}</td></tr>`).join("")}</tbody>
      </table>
      <h4 class="rp-eyebrow" style="margin-top:16px">Effective rate by relationship size</h4>
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Relationship</th><th class="num">Annual fee</th><th class="num">Effective rate</th></tr></thead>
        <tbody>${[1e6, 2.5e6, 5e6, 10e6, 25e6, 50e6, 100e6].map((v) => `<tr>
          <td>${fmtM(v)}</td><td class="num">${fmt$(annualFee(v))}</td>
          <td class="num">${fmtBps(effectiveRate(v) * 100)}</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Householding aggregates related accounts before the schedule
      is applied, so a family reaches breakpoints faster than its individual accounts would. Held-away and
      advisory-only assets are excluded from billing.</div>`, { k: "Tiered, householded" })}

    ${panel("Revenue by segment", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Segment</th><th class="num">Households</th><th class="num">Assets</th>
          <th class="num">Revenue</th><th class="num">Blended fee</th><th class="num">Share of revenue</th></tr></thead>
        <tbody>${FIRM.firmSegments.map((s) => `<tr>
          <td><b>${esc(s.label)}</b></td>
          <td class="num">${s.households}</td>
          <td class="num">${fmtM(s.aum)}</td>
          <td class="num">${fmtM(s.revenue)}</td>
          <td class="num">${fmtBps(s.blendedFee * 100)}</td>
          <td class="num">${fmtPct((s.revenue / FIRM.revenue) * 100, 1)}</td></tr>`).join("")}</tbody>
        <tfoot><tr style="font-weight:700"><td>Total</td><td class="num">${FIRM.households}</td>
          <td class="num">${fmtM(FIRM.aum)}</td><td class="num">${fmtM(FIRM.revenue)}</td>
          <td class="num">${fmtBps(FIRM.blendedFee * 100)}</td><td class="num">100.0%</td></tr></tfoot>
      </table>
      <div class="rp-note" style="margin-top:10px">Ultra high net worth is 61% of assets but only
      ${fmtPct((FIRM.firmSegments[0].revenue / FIRM.revenue) * 100, 0)} of revenue, because the schedule falls to
      40 bps above $25M. Emerging wealth is the reverse: 5.8% of assets at
      ${fmtBps(FIRM.firmSegments[2].blendedFee * 100)}. That tension is the whole argument for the tiered service
      model on the team page.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Quarterly billing run", `
      ${approvalChain("billing-q3-2026", [
        { role: "trading", label: "Operations calculates", note: "Schedule applied to billable assets" },
        { role: "cfo", label: "CFO review", note: "Exceptions and prorations confirmed" },
        { role: "cco", label: "Fee reasonableness", note: "Tested against the disclosed schedule" },
        { role: "cfo", label: "Released to custodians", note: "Debited and posted to client statements" },
      ], { title: "Q3 2026 billing run" })}
      <table class="demo-tbl" style="width:100%">
        <tbody>
          <tr><td>Households to bill</td><td class="num">${FIRM.households}</td></tr>
          <tr><td>Billable assets</td><td class="num">${fmtM(FIRM.aum)}</td></tr>
          <tr><td>Calculated fee</td><td class="num">${fmtM(q)}</td></tr>
          <tr><td>Prorations for mid-quarter funding</td><td class="num">${fmt$(-41800)}</td></tr>
          <tr><td>Exceptions held back</td><td class="num">${exceptions.length}</td></tr>
          <tr style="font-weight:700"><td>Net to release</td><td class="num">${fmtM(q - 41800)}</td></tr>
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Nothing releases until all four signatures are in place.
      The compliance check tests a sample against the disclosed schedule, which is how a billing error is caught
      before it reaches a client rather than after.</div>`, { k: "Q3 2026" })}

    ${panel("Exceptions", exceptions.length ? `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Household</th><th class="num">Assets</th><th class="num">Quarter flow</th>
          <th>Reason</th><th>Owner</th></tr></thead>
        <tbody>${exceptions.map((h) => `<tr>
          <td>${esc(h.name)}</td><td class="num">${fmt$(h.mv)}</td>
          <td class="num">${money(h.qtdFlow)}</td>
          <td class="dim">${h.mv < 1000000 ? "Below the schedule minimum" : "Large withdrawal, proration required"}</td>
          <td class="dim">${esc(h.advisor)}</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Exception review with advisers closes 26 September. Anything
      unresolved is held out of the run rather than billed on an assumption.</div>`
      : gate("No exceptions", "Every household bills cleanly this quarter."))}
  </div>

  ${disclosure()}`;
}
