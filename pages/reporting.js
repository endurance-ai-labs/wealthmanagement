/* =========================================================
   REPORTING CENTER
   Quarterly client package builder, section toggles, a
   printable preview and the four-step release chain.
   ========================================================= */

var rpHh = qs("hh") || (isExternal() ? CLIENT_HH : "HH-0001");
var rpSections = null;

const RP_SECTIONS = [
  ["cover", "Cover and contents", 1],
  ["commentary", "Market commentary", 1],
  ["performance", "Performance", 1],
  ["allocation", "Allocation against policy", 1],
  ["holdings", "Holdings detail", 1],
  ["activity", "Activity and cash flows", 1],
  ["private", "Alternative investments supplement", 1],
  ["fees", "Fee disclosure", 1],
  ["disclosures", "Disclosures and definitions", 1],
];

boot({ subtitle: "Private Wealth Portal" }, function () {
  rpSections = {};
  RP_SECTIONS.forEach((s) => { rpSections[s[0]] = !!s[2]; });
  render();
});

function rpPick(id) { rpHh = id; render(); }
function rpToggle(k) { rpSections[k] = !rpSections[k]; render(); }

function render() {
  const h = HH[rpHh];
  const r = householdReturns(rpHh);
  const bench = policyBenchmark(h.model);
  const book = visibleHouseholds();
  const on = RP_SECTIONS.filter((s) => rpSections[s[0]]);

  $("#app").innerHTML = `
  ${toolbar("Reporting Center",
    `${isExternal() ? "" : `<select class="pa-btn" onchange="rpPick(this.value)">
       ${book.map((x) => `<option value="${x.id}" ${x.id === rpHh ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
     </select>`}
     <button class="pa-btn" onclick="window.print()">Print package</button>${srcChips("pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${book.length}</div><div class="l">Packages this quarter</div>
      <div class="s">Q2 2026, delivered</div></div>
    <div class="demo-kpi"><div class="v">${on.length}</div><div class="l">Sections included</div>
      <div class="s">of ${RP_SECTIONS.length} available</div></div>
    <div class="demo-kpi"><div class="v">100%</div><div class="l">Delivered on time</div>
      <div class="s">Within ten business days of quarter end</div></div>
    <div class="demo-kpi"><div class="v">${ret(r.ytd)}</div><div class="l">Household YTD, net</div>
      <div class="s">Benchmark ${ret(bench.ytd, 1)}</div></div>
    <div class="demo-kpi"><div class="v">${DOCUMENTS.filter((d) => d.type.indexOf("Quarterly") === 0).length}</div>
      <div class="l">Reports in the vault</div><div class="s">Seven-year retention</div></div>
    <div class="demo-kpi"><div class="v">Q3 2026</div><div class="l">Next cycle</div>
      <div class="s">Opens 1 October</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Package builder", `
      ${RP_SECTIONS.map((s) => `
        <label style="display:flex;align-items:center;gap:10px;padding:8px 0;
          border-bottom:1px solid var(--color-border-subtle);font-size:12.5px;cursor:pointer">
          <input type="checkbox" ${rpSections[s[0]] ? "checked" : ""} onchange="rpToggle('${s[0]}')"
            style="accent-color:var(--color-blue)">
          <span style="color:var(--color-cloud-whisper)">${esc(s[1])}</span>
        </label>`).join("")}
      <div class="rp-note" style="margin-top:12px">Section selection is per household. The alternatives
      supplement only appears where the family holds private funds; the fee disclosure is never optional.</div>`,
      { k: "Q3 2026 template" })}

    ${panel("Release chain", `
      ${approvalChain("report-" + rpHh, [
        { role: "csa", label: "Client service assembles", note: "Data pulled and the package built" },
        { role: "advisor1", label: "Adviser reviews", note: "Checks the numbers and the narrative" },
        { role: "cio", label: "CIO signs the commentary", note: "Market commentary approved for release" },
        { role: "cco", label: "Compliance review", note: "Marketing Rule and performance presentation" },
      ], { title: "Quarterly report release — " + h.name })}
      <div class="rp-note">A performance report is marketing under the Marketing Rule, so it cannot leave the
      firm without the compliance review. The chain is what makes that a control rather than a habit.</div>`)}
  </div>

  <div style="margin-top:22px">
    ${panel("Preview", `
      <div class="rp-doc">
        <div class="rp-doc-head">
          ${RP_MARK_SVG(52)}
          <div style="flex:1">
            <div class="word">BLACKMONT <span>ADVISORS</span></div>
            <div class="sub">Private Wealth Management</div>
            <div class="big-title">Quarterly Report</div>
            <div class="subtitle">${esc(h.name)} &middot; ${esc(RP.quarter)} &middot; as of ${fmtDate(RP.asOf)}</div>
          </div>
          <div class="right">${esc(RP.hq)}<br>${esc(RP.phone)}<br>${esc(RP.email)}</div>
        </div>

        ${rpSections.commentary ? `<h3 class="sect">Market commentary</h3>
        <p>Equity markets extended their advance through the third quarter, with the S&amp;P 500 up
        ${IDX.SPX.ytd.toFixed(1)}% year to date and international developed markets up
        ${IDX.EAFE.ytd.toFixed(1)}%. Bonds have recovered as the curve normalised: the Bloomberg US Aggregate
        returned ${IDX.LBUSTRUU.ytd.toFixed(1)}% with the ten-year Treasury at ${CURVE[8][1].toFixed(2)}%.
        We extended duration to neutral in June and continue to hold credit below policy weight, where
        ${SPREADS[1][1]} basis points of high-yield spread sits in the ${SPREADS[1][3]}th percentile of its own
        history and does not pay for the risk.</p>` : ""}

        ${rpSections.performance ? `<h3 class="sect">Performance</h3>
        <table><thead><tr><th>Period</th><th class="num">Your portfolio, net</th>
          <th class="num">Blended benchmark</th><th class="num">Difference</th></tr></thead>
          <tbody>
            ${[["Quarter to date", r.qtd, bench.ytd / 3], ["Year to date", r.ytd, bench.ytd],
               ["One year", r.y1, bench.y1], ["Three years, annualised", r.y3, bench.y3]].map((p) =>
              `<tr><td>${esc(p[0])}</td><td class="num">${p[1].toFixed(2)}%</td>
                <td class="num">${p[2].toFixed(2)}%</td>
                <td class="num">${(p[1] - p[2]).toFixed(2)}%</td></tr>`).join("")}
          </tbody></table>` : ""}

        ${rpSections.allocation ? `<h3 class="sect">Allocation against policy</h3>
        <table><thead><tr><th>Asset class</th><th class="num">Value</th><th class="num">Actual</th>
          <th class="num">Policy</th><th class="num">Difference</th></tr></thead>
          <tbody>${allocationOf(householdPositions(rpHh)).map((a) => `<tr>
            <td>${esc(a.label)}</td><td class="num">${fmt$(a.value)}</td>
            <td class="num">${a.actualPct.toFixed(1)}%</td><td class="num">${a.targetPct.toFixed(1)}%</td>
            <td class="num">${(a.drift >= 0 ? "+" : "") + a.drift.toFixed(1)}</td></tr>`).join("")}</tbody>
          <tfoot><tr><td>Total</td><td class="num">${fmt$(h.mv)}</td>
            <td class="num">100.0%</td><td class="num">100.0%</td><td class="num">—</td></tr></tfoot>
        </table>` : ""}

        ${rpSections.fees ? `<h3 class="sect">Fee disclosure</h3>
        <p>Your annual advisory fee is ${fmt$(annualFee(h.mv))}, an effective rate of
        ${fmtBps(effectiveRate(h.mv) * 100)} on ${fmt$(h.mv)} of billable assets, billed quarterly in arrears
        under the tiered schedule in your advisory agreement. Blackmont Advisors receives no commissions, no
        revenue sharing and no compensation from any product sponsor. Returns shown above are net of this
        fee.</p>` : ""}

        ${rpSections.disclosures ? `<h3 class="sect">Disclosures</h3>
        <p>Past performance does not indicate future results. Returns are time-weighted and net of advisory
        fees unless stated otherwise. The blended benchmark is the weighted return of the market index behind
        each asset class in your investment policy statement, rebalanced monthly. Alternative investments are
        valued on the most recent available marks, which lag public markets. This report is a demonstration
        environment: Blackmont Advisors is a fictional firm and every figure is synthetic.</p>` : ""}

        <div style="margin-top:28px;display:flex;gap:36px;flex-wrap:wrap">
          ${sigBlock("report-sig-" + rpHh, "advisor1", "Adviser of record")}
          ${sigBlock("report-cio-" + rpHh, "cio", "Chief Investment Officer, commentary")}
        </div>
      </div>`, { k: on.length + " sections" })}
  </div>

  ${disclosure()}`;
}
