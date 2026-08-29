/* =========================================================
   OPERATIONS
   Reconciliation breaks, transfers, corporate actions,
   onboarding and data quality.
   ========================================================= */

/* Declared before boot(): a page constant used by a render helper must exist
   before the first render call, or it is still in the temporal dead zone. */
const ONBOARDING = [
  ["Ravenscroft Household", 8400000, "Documents collected", 4, "Schwab", "Elaine Whitfield"],
  ["Nakagawa Family", 3200000, "KYC in review", 3, "Fidelity", "Marcus Devereaux"],
  ["Pilcher Household", 14600000, "Custodian submitted", 5, "Schwab", "Caroline Estes"],
  ["Odunlami Family", 2100000, "Awaiting signatures", 2, "Schwab", "Nadia Osei"],
  ["Varga Household", 6800000, "Funding in transit", 6, "Pershing", "Grant Whitley"],
  ["Bellweather Trust", 22400000, "Model assignment", 7, "Fidelity", "Peter Nakamura"],
];
const ONB_STEPS = ["Agreement signed", "Documents collected", "KYC in review", "Awaiting signatures",
                   "Custodian submitted", "Funding in transit", "Model assignment", "Funded"];

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) { app.innerHTML = gate("Not available in the client portal", "Operations is internal.") + disclosure(); return; }
  render();
});

function render() {
  const aged = BREAKS.filter((b) => b.age > 10);
  const byCustodian = {};
  BREAKS.forEach((b) => { byCustodian[b.custodian] = (byCustodian[b.custodian] || 0) + 1; });

  $("#app").innerHTML = `
  ${toolbar("Operations",
    `<span class="demo-chip ${aged.length ? "warn" : "ok"}">${aged.length} aged breaks</span>${srcChips("cust", "pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${BREAKS.length}</div><div class="l">Open breaks</div>
      <div class="s">Across three custodians</div></div>
    <div class="demo-kpi"><div class="v">${aged.length}</div><div class="l">Aged past ten days</div>
      <div class="s">Escalated to the head of operations</div></div>
    <div class="demo-kpi"><div class="v">${money(BREAKS.reduce((s, b) => s + b.amount, 0))}</div>
      <div class="l">Net break value</div><div class="s">Absolute ${fmtM(BREAKS.reduce((s, b) => s + Math.abs(b.amount), 0))}</div></div>
    <div class="demo-kpi"><div class="v">${CORP_ACTIONS.length}</div><div class="l">Corporate actions</div>
      <div class="s">Next 60 days</div></div>
    <div class="demo-kpi"><div class="v">${ONBOARDING.length}</div><div class="l">Households onboarding</div>
      <div class="s">${fmtM(ONBOARDING.reduce((s, o) => s + o[1], 0))} expected</div></div>
    <div class="demo-kpi"><div class="v">99.94%</div><div class="l">Positions reconciled</div>
      <div class="s">Daily, against all three custodians</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Reconciliation breaks", `
      <div class="rp-scroll" style="max-height:420px">
        <table class="demo-tbl">
          <thead><tr><th>Break</th><th>Type</th><th>Household</th><th>Custodian</th>
            <th class="num">Amount</th><th class="num">Age</th><th>Owner</th><th>Status</th></tr></thead>
          <tbody>${BREAKS.map((b) => `<tr>
            <td class="mono">${esc(b.id)}</td>
            <td>${esc(b.type)}</td>
            <td class="dim">${esc(b.hhName)}</td>
            <td class="dim">${esc(b.custodian.split(" ")[0])}</td>
            <td class="num">${money(b.amount)}</td>
            <td class="num ${b.age > 10 ? "" : "dim"}">${b.age}d</td>
            <td class="dim">${esc(b.owner)}</td>
            <td>${statusPill(b.status)}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">Positions and cash reconcile daily against every custodian.
      A break older than ten days is escalated, because an aged break is usually a process problem rather than a
      data problem.</div>`, { k: BREAKS.length + " open" })}

    <div>
      ${panel("Corporate actions", `
        <table class="demo-tbl" style="width:100%">
          <thead><tr><th>Action</th><th>Security</th><th>Ex date</th><th class="num">Accounts</th><th>Status</th></tr></thead>
          <tbody>${CORP_ACTIONS.map((c) => `<tr>
            <td><b>${esc(c.type)}</b><div class="rp-note">${esc(c.rate)}</div></td>
            <td class="dim">${esc(c.security)}</td>
            <td>${fmtDateShort(c.exDate)}</td>
            <td class="num">${c.accounts}</td>
            <td>${statusPill(c.status)}</td></tr>`).join("")}</tbody>
        </table>`, { k: "Next 60 days" })}

      <div style="margin-top:22px">
        ${panel("Breaks by custodian", `
          ${Object.keys(byCustodian).map((c) => `<div class="rp-alloc">
            <span class="lbl">${esc(c.split(" ")[0])}</span>
            <span class="rp-track"><i style="width:${(byCustodian[c] / BREAKS.length) * 100}%"></i></span>
            <span class="num rp-hide-s">${byCustodian[c]}</span>
            <span class="num">${fmtPct((byCustodian[c] / BREAKS.length) * 100, 0)}</span>
            <span class="rp-drift"></span></div>`).join("")}
          <div class="rp-note" style="margin-top:12px">Break volume by custodian is tracked because a
          disproportionate share at one venue is a vendor conversation, not an operations one.</div>`)}
      </div>
    </div>
  </div>

  <div style="margin-top:22px">
    ${panel("Onboarding pipeline", `
      <div class="rp-scroll">
        <table class="demo-tbl">
          <thead><tr><th>Household</th><th class="num">Expected assets</th><th>Stage</th>
            <th>Progress</th><th>Custodian</th><th>Adviser</th></tr></thead>
          <tbody>${ONBOARDING.map((o) => `<tr>
            <td><b>${esc(o[0])}</b></td>
            <td class="num">${fmtM(o[1])}</td>
            <td>${esc(o[2])}</td>
            <td><div class="rp-track" style="height:12px"><i style="width:${(o[3] / 8) * 100}%"></i></div>
              <div class="rp-note">${o[3]} of 8 steps</div></td>
            <td class="dim">${esc(o[4])}</td>
            <td class="dim">${esc(o[5])}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      ${approvalChain("onboard-bellweather", [
        { role: "csa", label: "Client service collects", note: "Agreement, identification and account forms" },
        { role: "advisor1", label: "Adviser confirms", note: "Suitability, goals and the proposed model" },
        { role: "cco", label: "AML and KYC", note: "Screening and enhanced review where flagged" },
        { role: "trading", label: "Custodian opened", note: "Accounts opened and linked" },
        { role: "pm", label: "Model assigned", note: "Funded and traded into target" },
      ], { title: "New household onboarding — Bellweather Trust" })}
      <div class="rp-note">No account is traded before the compliance screen clears. The chain is the control,
      not a checklist someone keeps in a spreadsheet.</div>`, { k: ONB_STEPS.length + " steps" })}
  </div>

  ${disclosure()}`;
}
