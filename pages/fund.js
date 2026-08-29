/* =========================================================
   FUND TEARSHEET
   Terms, returns, risk, exposure, tax, private-market
   metrics, operational due diligence and the Rosemont
   scorecard behind the approval.
   ========================================================= */

var fId = qs("id") || "F-003";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) {
    app.innerHTML = gate("Not available in the client portal", "Fund research is an internal document.") + disclosure();
    return;
  }
  renderFund();
});

function renderFund() {
  const f = FUND[fId];
  if (!f) { $("#app").innerHTML = gate("Fund not found", "Return to the screener.") + disclosure(); return; }
  const mgr = MGR[f.manager];
  const held = POSITIONS.filter((p) => p.fundId === f.id);
  const heldValue = held.reduce((s, p) => s + p.value, 0);
  const households = [...new Set(held.map((p) => p.hhId))];
  const commits = COMMITMENTS.filter((c) => c.fundId === f.id);

  $("#app").innerHTML = `
  ${toolbar(f.name,
    `${statusPill(f.status)}<span class="demo-chip mut">${esc(f.vehicleLabel)}</span>
     <span class="demo-chip mut">${esc(f.acLabel)}</span>
     <select class="pa-btn" onchange="location.href='?id='+this.value">
       ${FUNDS.map((x) => `<option value="${x.id}" ${x.id === f.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
     </select>`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${f.aum ? fmtM(f.aum * 1e6) : "—"}</div><div class="l">Fund size</div>
      <div class="s">Inception ${fmtDate(f.inception)}</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(f.mgmtFee, 2)}</div><div class="l">Management fee</div>
      <div class="s">${f.perfFee ? fmtPct(f.perfFee, 1) + " performance fee" : "No performance fee"}</div></div>
    <div class="demo-kpi"><div class="v">${f.isPrivate ? ret(f.priv.irr, 1) : (f.y3 == null ? "—" : ret(f.y3, 1))}</div>
      <div class="l">${f.isPrivate ? "Net IRR since inception" : "Three years, annualised"}</div>
      <div class="s">${f.isPrivate ? "Vintage " + f.priv.vintage : "Benchmark " + (f.benchY3 == null ? "—" : f.benchY3.toFixed(1) + "%")}</div></div>
    <div class="demo-kpi"><div class="v">${f.isPrivate ? fmtX(f.priv.tvpi) : f.risk.sharpe.toFixed(2)}</div>
      <div class="l">${f.isPrivate ? "TVPI" : "Sharpe ratio"}</div>
      <div class="s">${f.isPrivate ? fmtX(f.priv.dpi) + " distributed" : "Three years"}</div></div>
    <div class="demo-kpi"><div class="v">${f.scoreAvg == null ? "—" : f.scoreAvg.toFixed(1)}</div>
      <div class="l">Rosemont score</div><div class="s">Average of six dimensions</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(heldValue)}</div><div class="l">Held for clients</div>
      <div class="s">${households.length} households</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Terms", `
      <dl class="rp-dl">
        <dt>Manager</dt><dd><a href="/wealthmanagement/managers/?id=${mgr ? mgr.id : ""}" style="color:var(--color-blue)">${esc(f.manager)}</a></dd>
        <dt>Strategy</dt><dd style="text-align:right">${esc(f.strategy)}</dd>
        <dt>Vehicle</dt><dd>${esc(f.vehicleLabel)}</dd>
        <dt>Identifier</dt><dd>${esc(f.code)}</dd>
        <dt>${f.isPrivate ? "Vintage" : "Inception"}</dt><dd>${f.isPrivate ? f.priv.vintage : fmtDate(f.inception)}</dd>
        <dt>Minimum</dt><dd>${f.min ? fmt$(f.min * 1000) : "None"}</dd>
        <dt>Management fee</dt><dd>${fmtPct(f.mgmtFee, 2)}</dd>
        <dt>Performance fee</dt><dd>${f.perfFee ? fmtPct(f.perfFee, 1) + " over an 8% hurdle, full catch-up" : "None"}</dd>
        <dt>Liquidity</dt><dd>${esc(f.liquidity)}</dd>
        <dt>Qualification</dt><dd>${esc(f.qualification)}</dd>
        <dt>Benchmark</dt><dd>${esc(f.benchName)}</dd>
        <dt>Tax reporting</dt><dd>${esc(f.taxForm)}</dd>
      </dl>`, { k: esc(f.status) })}

    ${panel("Returns", f.isPrivate ? `
      <dl class="rp-dl">
        <dt>Committed across clients</dt><dd>${fmt$(commits.reduce((s, c) => s + c.commitment, 0))}</dd>
        <dt>Called</dt><dd>${f.priv.calledPct}% of commitments</dd>
        <dt>TVPI</dt><dd>${fmtX(f.priv.tvpi)}</dd>
        <dt>DPI</dt><dd>${fmtX(f.priv.dpi)}</dd>
        <dt>RVPI</dt><dd>${fmtX(f.priv.rvpi)}</dd>
        <dt>Net IRR</dt><dd>${ret(f.priv.irr, 1)}</dd>
        <dt>Benchmark, ${f.benchName}</dt><dd>${f.benchY3 == null ? "—" : ret(f.benchY3, 1)}</dd>
        <dt>Public market equivalent</dt><dd>${(f.priv.tvpi / (1 + (f.benchY3 || 8) / 100)).toFixed(2)}x</dd>
      </dl>
      <div class="rp-note" style="margin-top:12px">A drawdown fund is measured on multiples and IRR, not on a
      time-weighted return. The public market equivalent asks whether the same cash flows into the listed
      benchmark would have done better.</div>` : `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Period</th><th class="num">Fund</th><th class="num">Benchmark</th><th class="num">Excess</th></tr></thead>
        <tbody>
          ${[["One year", f.y1, f.benchY1], ["Three years", f.y3, f.benchY3],
             ["Five years", f.y5, f.benchY5], ["Ten years", f.y10, f.benchY10],
             ["Since inception", f.itd, null]].map((p) => `<tr>
            <td>${esc(p[0])}</td>
            <td class="num">${p[1] == null ? "—" : ret(p[1], 1)}</td>
            <td class="num">${p[2] == null ? "—" : ret(p[2], 1)}</td>
            <td class="num">${p[1] == null || p[2] == null ? "—" : ret(p[1] - p[2], 1)}</td></tr>`).join("")}
        </tbody>
      </table>
      <h4 class="rp-eyebrow" style="margin-top:16px">Calendar years</h4>
      <table class="demo-tbl" style="width:100%">
        <thead><tr>${f.calendar.map((c) => `<th class="num">${c.year}</th>`).join("")}</tr></thead>
        <tbody><tr>${f.calendar.map((c) => `<td class="num">${ret(c.ret, 1)}</td>`).join("")}</tr></tbody>
      </table>`, { k: "Net of fees" })}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Risk", `
      <table class="demo-tbl" style="width:100%">
        <tbody>
          ${[["Standard deviation", fmtPct(f.risk.sd)], ["Beta to benchmark", f.risk.beta.toFixed(2)],
             ["R-squared", f.risk.r2.toFixed(2)], ["Alpha, three years", ret(f.risk.alpha, 2)],
             ["Sharpe ratio", f.risk.sharpe.toFixed(2)], ["Sortino ratio", f.risk.sortino.toFixed(2)],
             ["Tracking error", fmtPct(f.risk.te, 2)], ["Information ratio", f.risk.infoRatio.toFixed(2)],
             ["Maximum drawdown", ret(f.risk.maxDD, 1)], ["Months to recover", f.risk.recovery + " months"],
             ["Upside capture", f.risk.upCap + "%"], ["Downside capture", f.risk.downCap + "%"]]
            .map((r) => `<tr><td>${esc(r[0])}</td><td class="num">${r[1]}</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Derived from the fund's own return series against
      ${esc(f.benchName)}, with a ${fmtPct(3.6)} risk-free assumption. Alpha is the return left after paying for
      the beta the fund actually took.</div>`, { k: "Three years" })}

    ${panel("Rosemont scorecard", `
      ${SCORE_LABELS.map((lbl, i) => {
        const v = f.scores[i];
        return `<div class="rp-score">
          <span>${esc(lbl)}</span>
          <span class="rp-dots">${[1, 2, 3, 4, 5].map((n) =>
            `<i class="${v != null && n <= v ? "on " + (v >= 4 ? "hi" : v <= 2 ? "lo" : "") : ""}"></i>`).join("")}</span>
          <span class="num"><b>${v == null ? "—" : v}</b></span>
        </div>`;
      }).join("")}
      <div class="rp-note" style="margin-top:14px">
        ${esc(WATCH_NOTES[f.id] || (f.status === "Approved"
          ? "Approved for allocation across the models that carry this asset class. Annual refresh scheduled with the next on-site."
          : "Under initial review. No allocation until the committee votes."))}
      </div>
      <div class="rp-note" style="margin-top:10px">${esc(mgr ? mgr.view : "")}</div>`,
      { k: "Six dimensions" })}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Operational due diligence", `
      <dl class="rp-dl">
        <dt>Auditor</dt><dd>${esc(f.ops.auditor)}</dd>
        <dt>Administrator</dt><dd>${esc(f.ops.admin)}</dd>
        <dt>Custodian</dt><dd>${esc(f.ops.custodian)}</dd>
        <dt>Legal counsel</dt><dd>${esc(f.ops.counsel)}</dd>
        <dt>Valuation</dt><dd style="text-align:right">${esc(f.ops.valuation)}</dd>
        <dt>Key-person provision</dt><dd style="text-align:right">${esc(f.ops.keyPerson)}</dd>
        <dt>GP commitment</dt><dd>${esc(f.ops.gpCommit)}</dd>
        <dt>Side letter</dt><dd style="text-align:right">${esc(f.ops.sideLetter)}</dd>
        <dt>Last on-site</dt><dd>${fmtDate(f.ops.lastOnsite)}</dd>
        <dt>Regulatory history</dt><dd style="text-align:right">${esc(f.ops.regHistory)}</dd>
      </dl>`, { k: "ODD file" })}

    ${panel("Tax and client exposure", `
      <dl class="rp-dl">
        <dt>Turnover</dt><dd>${f.turnover}%</dd>
        <dt>Tax cost ratio</dt><dd>${fmtPct(f.taxCost, 2)}</dd>
        <dt>Reporting</dt><dd>${esc(f.taxForm)}</dd>
        <dt>Held for clients</dt><dd>${fmt$(heldValue)}</dd>
        <dt>Households holding</dt><dd>${households.length}</dd>
        <dt>Share of firm assets</dt><dd>${fmtPct((heldValue / FIRM.detailedAum) * 100, 2)}</dd>
      </dl>
      ${households.length ? `<div class="rp-scroll" style="max-height:220px;margin-top:14px">
        <table class="demo-tbl">
          <thead><tr><th>Household</th><th class="num">Value</th><th class="num">Of household</th></tr></thead>
          <tbody>${households.map((id) => {
            const v = held.filter((p) => p.hhId === id).reduce((s, p) => s + p.value, 0);
            return `<tr class="rp-click" onclick="location.href='/wealthmanagement/households/household/?id=${id}&tab=holdings'">
              <td>${esc(HH[id].name)}</td><td class="num">${fmt$(v)}</td>
              <td class="num">${((v / HH[id].mv) * 100).toFixed(2)}%</td></tr>`;
          }).join("")}</tbody>
        </table>
      </div>` : ""}`)}
  </div>

  <div style="margin-top:22px">
    ${panel("Approved-list decision", `
      ${approvalChain("fund-" + f.id, [
        { role: "research", label: "Analyst memo", note: "Due diligence complete, recommendation written" },
        { role: "research", label: "Director of research", note: "Reviews the file and the scorecard" },
        { role: "cio", label: "Committee vote", note: "Recorded in the minutes" },
        { role: "cio", label: "CIO signs", note: "Fund available for allocation" },
      ], { title: "Approved list — " + f.name })}
      <div class="rp-note">Nothing reaches a client portfolio without a written memo, a scorecard and a recorded
      vote. The minutes are on the investment committee page.</div>`)}
  </div>

  ${disclosure("This fund and its manager are invented, as is every figure on this page.")}`;
}
