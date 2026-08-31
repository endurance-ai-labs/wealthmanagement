/* =========================================================
   MANAGER DUE DILIGENCE
   The workflow, the manager files behind the funds, and the
   memo the committee actually votes on.
   ========================================================= */

var mgSel = qs("id") || MANAGERS[0].id;

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (!can("research") && !can("firm")) {
    app.innerHTML = gate("Restricted", "Due-diligence files are limited to the investment team.") + disclosure();
    return;
  }
  render();
});

function mgPick(id) { mgSel = id; render(); }

function render() {
  const m = MANAGERS.find((x) => x.id === mgSel) || MANAGERS[0];
  const funds = FUNDS.filter((f) => f.manager === m.name);
  const held = POSITIONS.filter((p) => funds.some((f) => f.id === p.fundId));
  const heldValue = held.reduce((s, p) => s + p.value, 0);
  const wf = DD_WORKFLOW.filter((d) => d.manager === m.name);

  $("#app").innerHTML = `
  ${researchConsole({
    title: "Research console",
    kinds: ["Manager", "Fund"],
    addKinds: ["Manager", "Strategy", "Fund"],
    placeholder: "Search managers and their strategies…",
  })}

  ${toolbar("Manager Due Diligence",
    `<select class="pa-btn" onchange="mgPick(this.value)">
       ${MANAGERS.map((x) => `<option value="${x.id}" ${x.id === m.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
     </select>${srcChips("pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${MANAGERS.length}</div><div class="l">Managers on the platform</div>
      <div class="s">${FUNDS.length} strategies</div></div>
    <div class="demo-kpi"><div class="v">${funds.length}</div><div class="l">Strategies from ${esc(m.name.split(" ")[0])}</div>
      <div class="s">${funds.filter((f) => f.status === "Approved").length} approved</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(heldValue)}</div><div class="l">Client assets with them</div>
      <div class="s">${fmtPct((heldValue / FIRM.detailedAum) * 100, 1)} of the detailed book</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(m.firmAum * 1e6)}</div><div class="l">Their firm assets</div>
      <div class="s">Founded ${m.founded}</div></div>
    <div class="demo-kpi"><div class="v">${DD_WORKFLOW.filter((d) => d.done < d.stages.length).length}</div>
      <div class="l">Reviews in progress</div><div class="s">Across all managers</div></div>
    <div class="demo-kpi"><div class="v">${FUNDS.filter((f) => f.status === "Watch").length}</div>
      <div class="l">Strategies on watch</div><div class="s">Under active monitoring</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel(m.name, `
      <dl class="rp-dl">
        <dt>Headquarters</dt><dd>${esc(m.hq)}</dd>
        <dt>Founded</dt><dd>${m.founded}</dd>
        <dt>Ownership</dt><dd>${esc(m.ownership)}</dd>
        <dt>Firm assets</dt><dd>${fmtM(m.firmAum * 1e6)}</dd>
        <dt>Strategies we use</dt><dd>${funds.length}</dd>
        <dt>Client assets with them</dt><dd>${fmt$(heldValue)}</dd>
        <dt>Manager concentration limit</dt><dd>20% of a portfolio</dd>
      </dl>
      <h4 class="rp-eyebrow" style="margin-top:16px">Our view</h4>
      <div class="rp-note">${esc(m.view)}</div>
      <h4 class="rp-eyebrow" style="margin-top:16px">Strategies</h4>
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Strategy</th><th>Vehicle</th><th class="num">Score</th><th>Status</th></tr></thead>
        <tbody>${funds.map((f) => `<tr class="rp-click" onclick="location.href='/wealthmanagement/funds/fund/?id=${f.id}'">
          <td><b>${esc(f.name)}</b><div class="rp-note">${esc(f.acLabel)}</div></td>
          <td class="dim">${esc(f.vehicleLabel)}</td>
          <td class="num">${f.scoreAvg == null ? "—" : f.scoreAvg.toFixed(1)}</td>
          <td>${statusPill(f.status)}</td></tr>`).join("")}</tbody>
      </table>`, { k: "Manager file" })}

    ${panel("Due-diligence workflow", `
      <div class="rp-scroll" style="max-height:480px">
        <table class="demo-tbl">
          <thead><tr><th>Strategy</th><th>Analyst</th><th>Progress</th><th>Opened</th>
            <th>Next refresh</th><th>Status</th></tr></thead>
          <tbody>${DD_WORKFLOW.map((d) => `<tr ${d.manager === m.name ? 'style="background:var(--color-blue-pale)"' : ""}>
            <td><b>${esc(d.fund)}</b><div class="rp-note">${esc(d.manager)}</div></td>
            <td class="dim">${esc(d.analyst)}</td>
            <td><div class="rp-track" style="height:12px"><i style="width:${(d.done / d.stages.length) * 100}%"></i></div>
              <div class="rp-note">${d.done} of ${d.stages.length} &middot; ${esc(d.stages[Math.min(d.done, d.stages.length - 1)])}</div></td>
            <td>${fmtDateShort(d.opened)}</td>
            <td>${fmtDateShort(d.refresh)}</td>
            <td>${statusPill(d.status)}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">Six stages: questionnaire, reference calls, background checks,
      ADV and document review, on-site visit, committee memo. Nothing skips a stage, and every approved strategy
      refreshes annually whether or not anything has changed.</div>`, { k: DD_WORKFLOW.length + " in the file" })}
  </div>

  <div style="margin-top:22px">
    ${panel("Due-diligence memo", `
      <div class="rp-doc">
        <div class="rp-doc-head">
          ${RP_MARK_SVG(52)}
          <div style="flex:1">
            <div class="word">BLACKMONT <span>ADVISORS</span></div>
            <div class="sub">Investment Research</div>
            <div class="big-title">Manager Due Diligence</div>
            <div class="subtitle">${esc(m.name)} &middot; prepared ${fmtDate(RP.asOf)}</div>
          </div>
          <div class="right">Confidential<br>Investment committee<br>Not for distribution</div>
        </div>

        <h3 class="sect">Firm</h3>
        <p>${esc(m.name)} was founded in ${m.founded} and is headquartered in ${esc(m.hq)}. The firm is
        ${esc(m.ownership.toLowerCase())} and manages ${fmtM(m.firmAum * 1e6)}. Blackmont currently allocates
        ${fmt$(heldValue)} of client capital across ${funds.length}
        ${funds.length === 1 ? "strategy" : "strategies"}, representing
        ${fmtPct((heldValue / FIRM.detailedAum) * 100, 1)} of the detailed book and well inside the 20% manager
        concentration limit.</p>

        <h3 class="sect">Assessment</h3>
        <p>${esc(m.view)}</p>

        <h3 class="sect">Scorecard</h3>
        <table><thead><tr><th>Strategy</th>${SCORE_LABELS.map((s) => `<th class="num">${esc(s)}</th>`).join("")}
          <th class="num">Average</th></tr></thead>
          <tbody>${funds.map((f) => `<tr><td>${esc(f.name)}</td>
            ${f.scores.map((s) => `<td class="num">${s == null ? "—" : s}</td>`).join("")}
            <td class="num">${f.scoreAvg == null ? "—" : f.scoreAvg.toFixed(1)}</td></tr>`).join("")}</tbody>
        </table>

        <h3 class="sect">Operational review</h3>
        <p>${funds.length ? `Auditor ${esc(funds[0].ops.auditor)}; administrator ${esc(funds[0].ops.admin)};
        counsel ${esc(funds[0].ops.counsel)}. ${esc(funds[0].ops.valuation)}.
        ${esc(funds[0].ops.regHistory)}. Last on-site ${fmtDate(funds[0].ops.lastOnsite)}.` : ""}</p>

        <h3 class="sect">Recommendation</h3>
        <p>${funds.some((f) => f.status === "Watch")
          ? "Retain existing allocations. Place the affected strategy on watch and take no new money pending the October on-site."
          : "Retain on the approved list at current sizing. No change recommended."}</p>

        <div style="margin-top:28px;display:flex;gap:36px;flex-wrap:wrap">
          ${sigBlock("dd-analyst-" + m.id, "research", "Director of Research")}
          ${sigBlock("dd-cio-" + m.id, "cio", "Chief Investment Officer")}
        </div>
      </div>`, { k: "Committee paper" })}
  </div>

  ${coverageQueue()}

  ${disclosure("Every manager, strategy and finding on this page is invented.")}`;
}
