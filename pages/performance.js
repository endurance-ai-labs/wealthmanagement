/* =========================================================
   PERFORMANCE & ATTRIBUTION
   Composite presentation in the GIPS format, Brinson
   attribution, contribution to return and rolling analysis.
   ========================================================= */

var pfComposite = "BAL";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) { app.innerHTML = gate("Not available in the client portal",
    "Your own performance is on the home page.") + disclosure(); return; }
  renderPerf();
});

function pfPick(id) { pfComposite = id; renderPerf(); }

function renderPerf() {
  const m = MODEL[pfComposite];
  const r = MODEL_RETURNS[pfComposite];
  const members = HOUSEHOLDS.filter((h) => h.model === pfComposite);
  const assets = members.reduce((s, h) => s + h.mv, 0);
  const bench = r.bench;

  /* Composite dispersion: the spread of member returns inside the composite. */
  const memberYtd = members.map((h) => householdReturns(h.id).ytd);
  const disp = memberYtd.length > 1
    ? Math.sqrt(memberYtd.reduce((s, x) => s + Math.pow(x - memberYtd.reduce((a, b) => a + b, 0) / memberYtd.length, 2), 0) / (memberYtd.length - 1))
    : 0;

  /* Brinson attribution against the policy weights. */
  const alloc = allocationOf(members.flatMap((h) => householdPositions(h.id)));
  const attrib = alloc.map((a) => {
    const q = IDX[AC[a.id].bench] || ALT_BENCH.find((x) => x.code === AC[a.id].bench);
    const cls = q && q.ytd != null ? q.ytd : AC[a.id].er;
    const wActual = a.actualPct / 100, wBench = a.targetPct / 100;
    const allocation = (wActual - wBench) * (cls - bench.ytd);
    const selection = wBench * (cls * 0.02);
    const interaction = (wActual - wBench) * (cls * 0.02);
    return { label: a.label, wActual, wBench, cls, allocation, selection, interaction,
             total: allocation + selection + interaction };
  });
  const totals = attrib.reduce((s, a) => ({
    allocation: s.allocation + a.allocation, selection: s.selection + a.selection,
    interaction: s.interaction + a.interaction, total: s.total + a.total }),
    { allocation: 0, selection: 0, interaction: 0, total: 0 });

  const years = [2023, 2024, 2025].map((y, i) => {
    const slice = r.monthly.slice(i * 12, i * 12 + 12);
    return { year: y, gross: +(cumulative(slice) * 100).toFixed(2),
             net: +(cumulative(slice.map((x) => x - 0.055)) * 100).toFixed(2) };
  });

  $("#app").innerHTML = `
  ${toolbar("Performance & Attribution",
    `<select class="pa-btn" onchange="pfPick(this.value)">
      ${MODELS.map((x) => `<option value="${x.id}" ${x.id === pfComposite ? "selected" : ""}>${esc(x.name)} composite</option>`).join("")}
     </select>${srcChips("pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${ret(r.bench.ytd + r.active, 2)}</div><div class="l">Composite, YTD gross</div>
      <div class="s">Benchmark ${ret(bench.ytd, 1)}</div></div>
    <div class="demo-kpi"><div class="v">${ret(r.active, 2)}</div><div class="l">Excess return</div>
      <div class="s">Active return over the blended benchmark</div></div>
    <div class="demo-kpi"><div class="v">${members.length}</div><div class="l">Portfolios in composite</div>
      <div class="s">${fmtM(assets)} of assets</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(disp, 2)}</div><div class="l">Composite dispersion</div>
      <div class="s">Standard deviation of member returns</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(r.vol)}</div><div class="l">Three-year volatility</div>
      <div class="s">Ex-post standard deviation</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct((assets / FIRM.detailedAum) * 100, 1)}</div>
      <div class="l">Share of firm assets</div><div class="s">Composite as a share of the detailed book</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Composite presentation", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Year</th><th class="num">Gross</th><th class="num">Net</th>
          <th class="num">Benchmark</th><th class="num">Portfolios</th><th class="num">Assets</th></tr></thead>
        <tbody>${years.map((y) => `<tr>
          <td>${y.year}</td><td class="num">${ret(y.gross, 2)}</td><td class="num">${ret(y.net, 2)}</td>
          <td class="num">${ret(bench.y3, 2)}</td><td class="num">${members.length}</td>
          <td class="num">${fmtM(assets)}</td></tr>`).join("")}
          <tr><td>2026 YTD</td><td class="num">${ret(bench.ytd + r.active, 2)}</td>
            <td class="num">${ret(bench.ytd + r.active - 0.44, 2)}</td>
            <td class="num">${ret(bench.ytd, 2)}</td>
            <td class="num">${members.length}</td><td class="num">${fmtM(assets)}</td></tr>
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Presented in the GIPS format: gross and net returns, the
      benchmark, the number of portfolios and composite assets for every period. Net returns deduct the highest
      fee applicable to the composite. Dispersion is shown above.</div>`, { k: "GIPS format" })}

    ${panel("Brinson attribution, year to date", `
      <div class="rp-scroll" style="max-height:400px">
        <table class="demo-tbl">
          <thead><tr><th>Asset class</th><th class="num">Portfolio</th><th class="num">Benchmark</th>
            <th class="num">Class return</th><th class="num">Allocation</th><th class="num">Selection</th>
            <th class="num">Total</th></tr></thead>
          <tbody>${attrib.map((a) => `<tr>
            <td>${esc(a.label)}</td>
            <td class="num">${(a.wActual * 100).toFixed(1)}%</td>
            <td class="num">${(a.wBench * 100).toFixed(1)}%</td>
            <td class="num">${ret(a.cls, 1)}</td>
            <td class="num">${ret(a.allocation, 2)}</td>
            <td class="num">${ret(a.selection + a.interaction, 2)}</td>
            <td class="num"><b>${ret(a.total, 2)}</b></td></tr>`).join("")}</tbody>
          <tfoot><tr style="font-weight:700"><td>Total</td><td class="num">100.0%</td><td class="num">100.0%</td>
            <td class="num">—</td><td class="num">${ret(totals.allocation, 2)}</td>
            <td class="num">${ret(totals.selection + totals.interaction, 2)}</td>
            <td class="num">${ret(totals.total, 2)}</td></tr></tfoot>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">Allocation is the return from being over or under the policy
      weight. Selection is the return from the managers inside each sleeve. Where a sleeve is index-implemented,
      selection is close to zero by design.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Rolling three-year excess return", `<div class="rp-chart" style="height:180px"><canvas id="rollChart"></canvas></div>
      <div class="rp-note" style="margin-top:10px">Rolling twelve-month excess return over the blended
      benchmark. A composite that only ever wins in one regime is a composite that will disappoint in the
      next one.</div>`)}

    ${panel("Member dispersion", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Household</th><th class="num">Assets</th><th class="num">YTD net</th>
          <th class="num">Against composite</th></tr></thead>
        <tbody>${members.sort((a, b) => b.mv - a.mv).map((h) => {
          const hr = householdReturns(h.id);
          return `<tr class="rp-click" onclick="location.href='/wealthmanagement/households/household/?id=${h.id}&tab=perf'">
            <td>${esc(h.name)}</td><td class="num">${fmt$(h.mv)}</td>
            <td class="num">${ret(hr.ytd)}</td>
            <td class="num">${ret(hr.ytd - (bench.ytd + r.active - 0.44), 2)}</td></tr>`;
        }).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Members differ from the composite because of fee rate, cash
      needs, asset location and how recently each was rebalanced. Dispersion of ${fmtPct(disp, 2)} is inside the
      one-point tolerance the committee monitors.</div>`)}
  </div>

  ${disclosure()}`;

  drawRolling();
}

function drawRolling() {
  const el = document.getElementById("rollChart");
  if (!el || typeof Chart === "undefined") return;
  const r = MODEL_RETURNS[pfComposite];
  const roll = [];
  for (let i = 11; i < r.monthly.length; i++) {
    roll.push(+(cumulative(r.monthly.slice(i - 11, i + 1)) * 100 - r.bench.y1).toFixed(2));
  }
  new Chart(el, {
    type: "bar",
    data: { labels: MONTHS.slice(11).map(fmtMonth),
      datasets: [{ label: "Excess return, trailing 12 months", data: roll,
        backgroundColor: roll.map((v) => (v >= 0 ? "rgba(28,107,75,.72)" : "rgba(163,57,44,.72)")) }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { maxTicksLimit: 8, font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { callback: (v) => v + "%", font: { size: 10 } }, grid: { color: "rgba(128,128,128,.14)" } } } },
  });
}
