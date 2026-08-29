/* =========================================================
   COMPLIANCE
   The regulatory register, personal trading, the Marketing
   Rule, custody, AML and exam readiness.
   ========================================================= */

var cpCat = "All";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (!can("compliance") && !can("firm")) {
    app.innerHTML = gate("Restricted", "The compliance register is limited to oversight roles.") + disclosure();
    return;
  }
  render();
});

function cpSet(v) { cpCat = v; render(); }

function render() {
  const cats = [...new Set(COMPLIANCE.map((c) => c.category))].sort();
  const list = cpCat === "All" ? COMPLIANCE : COMPLIANCE.filter((c) => c.category === cpCat);
  const overdue = COMPLIANCE.filter((c) => c.status === "Overdue");
  const open = COMPLIANCE.filter((c) => c.status === "Open" || c.status === "In Progress");
  const done = COMPLIANCE.filter((c) => c.status === "Complete");

  $("#app").innerHTML = `
  ${toolbar("Compliance",
    `<select class="pa-btn" onchange="cpSet(this.value)">
       <option value="All">All categories</option>
       ${cats.map((c) => `<option value="${esc(c)}" ${c === cpCat ? "selected" : ""}>${esc(c)}</option>`).join("")}
     </select>
     <span class="demo-chip ${overdue.length ? "bad" : "ok"}">${overdue.length} overdue</span>`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${COMPLIANCE.length}</div><div class="l">Register items</div>
      <div class="s">Across ${cats.length} categories</div></div>
    <div class="demo-kpi"><div class="v">${done.length}</div><div class="l">Complete</div>
      <div class="s">${fmtPct((done.length / COMPLIANCE.length) * 100, 0)} of the annual programme</div></div>
    <div class="demo-kpi"><div class="v">${open.length}</div><div class="l">Open or in progress</div>
      <div class="s">Owned and dated</div></div>
    <div class="demo-kpi"><div class="v">${overdue.length}</div><div class="l">Overdue</div>
      <div class="s">Escalated to the CCO</div></div>
    <div class="demo-kpi"><div class="v">97.4%</div><div class="l">Form CRS delivered</div>
      <div class="s">16 households outstanding</div></div>
    <div class="demo-kpi"><div class="v">84 of 84</div><div class="l">Attestations received</div>
      <div class="s">Annual holdings, all access persons</div></div>
  </div>

  ${panel("Regulatory register", `
    <div class="rp-scroll" style="max-height:620px">
      <table class="demo-tbl">
        <thead><tr><th>Item</th><th>Category</th><th>Owner</th><th>Due</th><th>Status</th><th>Evidence</th></tr></thead>
        <tbody>${list.map((c) => `<tr>
          <td><b>${esc(c.item)}</b></td>
          <td class="dim">${esc(c.category)}</td>
          <td class="dim">${esc(c.owner)}</td>
          <td class="${c.overdue ? "" : "dim"}">${fmtDateShort(c.due)}</td>
          <td>${statusPill(c.status)}</td>
          <td class="dim" style="white-space:normal;max-width:460px">${esc(c.note)}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Every item carries an owner, a due date, a status and the
    evidence behind it. That last column is the difference between a compliance programme and a compliance
    calendar.</div>`, { k: list.length + " of " + COMPLIANCE.length })}

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Overdue items", overdue.length ? `
      ${overdue.map((c) => `<div style="padding:11px 0;border-bottom:1px solid var(--color-border-subtle)">
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline">
          <b>${esc(c.item)}</b>${statusPill(c.status)}</div>
        <div class="rp-note" style="margin-top:4px">Due ${fmtDate(c.due)}, owned by ${esc(c.owner)}. ${esc(c.note)}</div>
      </div>`).join("")}
      ${approvalChain("cmp-escalation", [
        { role: "csa", label: "Owner remediates", note: "Completes the outstanding work" },
        { role: "cco", label: "CCO reviews", note: "Confirms the evidence is sufficient" },
        { role: "ceo", label: "Executive noted", note: "Reported at the next management meeting" },
      ], { title: "Overdue item escalation" })}`
      : gate("Nothing overdue", "Every item is on or ahead of schedule."), { k: "Escalated" })}

    ${panel("Exam readiness", `
      <table class="demo-tbl" style="width:100%">
        <tbody>
          ${[["Last SEC examination", "March 2023, no deficiency letter"],
             ["Standing request list", "Maintained; last refreshed 4 August 2026"],
             ["Books and records", "Electronic, WORM-compliant, seven-year retention"],
             ["Advisory agreements", "574 of 612 on the current form"],
             ["Form ADV", "Amended 24 March 2026"],
             ["Form CRS", "Delivered to 97.4% of households"],
             ["Code of ethics", "84 access persons, quarterly reporting"],
             ["Custody", "Held away at three qualified custodians; SLOAs under review"],
             ["Marketing", "Two testimonials pending disclosure review"],
             ["Cybersecurity", "External penetration test completed July 2026"]]
            .map((r) => `<tr><td><b>${esc(r[0])}</b></td><td class="dim" style="white-space:normal">${esc(r[1])}</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">The 38 households still on the pre-2019 advisory agreement
      form are the largest single item an examiner would raise. Remediation is owned by client service with a
      November deadline.</div>`, { k: "Standing file" })}
  </div>

  ${disclosure()}`;
}
