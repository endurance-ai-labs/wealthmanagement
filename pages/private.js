/* =========================================================
   PRIVATE MARKETS DESK
   Commitments, capital calls and distributions, the J-curve,
   vintage diversification and the pacing model.
   ========================================================= */

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) { app.innerHTML = gate("Not available in the client portal",
    "Your own commitments are on your household page.") + disclosure(); return; }
  render();
});

function render() {
  const book = visibleHouseholds().map((h) => h.id);
  const cs = COMMITMENTS.filter((c) => book.indexOf(c.hhId) >= 0);
  const commit = cs.reduce((s, c) => s + c.commitment, 0);
  const called = cs.reduce((s, c) => s + c.called, 0);
  const nav = cs.reduce((s, c) => s + c.nav, 0);
  const dist = cs.reduce((s, c) => s + c.distributed, 0);
  const calls = CAPITAL_CALLS.filter((c) => book.indexOf(c.hhId) >= 0);

  /* By fund, then by vintage: the two views the committee actually uses. */
  const byFund = {};
  cs.forEach((c) => {
    byFund[c.fundId] = byFund[c.fundId] || { fund: c.fund, manager: c.manager, ac: c.assetClass,
      vintage: c.vintage, commitment: 0, called: 0, nav: 0, dist: 0, households: 0,
      tvpi: c.tvpi, dpi: c.dpi, irr: c.irr };
    const b = byFund[c.fundId];
    b.commitment += c.commitment; b.called += c.called; b.nav += c.nav; b.dist += c.distributed; b.households++;
  });
  const funds = Object.keys(byFund).map((k) => Object.assign({ id: k }, byFund[k]))
    .sort((a, b) => b.commitment - a.commitment);

  const vintages = {};
  cs.forEach((c) => { vintages[c.vintage] = (vintages[c.vintage] || 0) + c.commitment; });

  $("#app").innerHTML = `
  ${toolbar("Private Markets", srcChips("pa"))}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtM(commit)}</div><div class="l">Committed</div>
      <div class="s">${funds.length} funds, ${cs.length} positions</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(called)}</div><div class="l">Called</div>
      <div class="s">${fmtPct((called / commit) * 100, 0)} of commitments</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(commit - called)}</div><div class="l">Uncalled</div>
      <div class="s">Reserved in short duration</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(nav)}</div><div class="l">Current value</div>
      <div class="s">Latest quarterly marks</div></div>
    <div class="demo-kpi"><div class="v">${fmtX((nav + dist) / called)}</div><div class="l">TVPI</div>
      <div class="s">${fmtX(dist / called)} distributed to date</div></div>
    <div class="demo-kpi"><div class="v">${calls.length}</div><div class="l">Calls scheduled</div>
      <div class="s">${fmtM(calls.reduce((s, c) => s + c.amount, 0))} over 90 days</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Capital calls", `
      <div class="rp-scroll" style="max-height:400px">
        <table class="demo-tbl">
          <thead><tr><th>Household</th><th>Fund</th><th>Due</th><th class="num">Days</th>
            <th class="num">Amount</th><th>Source</th><th>Status</th></tr></thead>
          <tbody>${calls.map((c) => {
            const days = daysBetween(RP.asOf, c.due);
            return `<tr class="rp-click" onclick="location.href='/wealthmanagement/households/household/?id=${c.hhId}&tab=private'">
              <td><b>${esc(c.hhName)}</b></td>
              <td class="dim">${esc(c.fund)}</td>
              <td>${fmtDateShort(c.due)}</td>
              <td class="num ${days < 14 ? "" : "dim"}">${days}</td>
              <td class="num">${fmt$(c.amount)}</td>
              <td class="dim">${esc(c.source)}</td>
              <td>${statusPill(c.status)}</td></tr>`;
          }).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">The uncalled balance is held in short duration rather than
      equities, so a call never forces a sale. A call inside fourteen days with an unconfirmed source is
      escalated to the adviser the morning it is logged.</div>`, { k: "Next 90 days" })}

    ${panel("J-curve by vintage", `<div class="rp-chart" style="height:200px"><canvas id="jcurve"></canvas></div>
      <div class="rp-note" style="margin-top:10px">Each vintage begins below one times as fees and early marks
      run ahead of value creation, then crosses over as the portfolio matures. The 2025 vintages sitting near
      1.05x are exactly where they should be at eighteen months.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Fund positions", `
      <div class="rp-scroll">
        <table class="demo-tbl">
          <thead><tr><th>Fund</th><th>Strategy</th><th class="num">Vintage</th><th class="num">Households</th>
            <th class="num">Committed</th><th class="num">Called</th><th class="num">NAV</th>
            <th class="num">TVPI</th><th class="num">DPI</th><th class="num">Net IRR</th></tr></thead>
          <tbody>${funds.map((f) => `<tr class="rp-click" onclick="location.href='/wealthmanagement/funds/fund/?id=${f.id}'">
            <td><b>${esc(f.fund)}</b><div class="rp-note">${esc(f.manager)}</div></td>
            <td class="dim">${esc(AC[f.ac].label)}</td>
            <td class="num">${f.vintage}</td><td class="num">${f.households}</td>
            <td class="num">${fmtM(f.commitment)}</td><td class="num">${fmtM(f.called)}</td>
            <td class="num">${fmtM(f.nav)}</td>
            <td class="num">${fmtX(f.tvpi)}</td><td class="num">${fmtX(f.dpi)}</td>
            <td class="num">${ret(f.irr, 1)}</td></tr>`).join("")}</tbody>
        </table>
      </div>`, { k: funds.length + " funds" })}

    ${panel("Pacing model", `
      <h4 class="rp-eyebrow">Vintage diversification</h4>
      ${Object.keys(vintages).sort().map((v) => `<div class="rp-alloc">
        <span class="lbl">${v}</span>
        <span class="rp-track"><i style="width:${Math.min(100, (vintages[v] / commit) * 260)}%"></i></span>
        <span class="num rp-hide-s">${fmtM(vintages[v])}</span>
        <span class="num">${fmtPct((vintages[v] / commit) * 100, 0)}</span>
        <span class="rp-drift"></span></div>`).join("")}
      <div class="rp-note" style="margin-top:12px">Commitments are spread across vintages deliberately. A single
      vintage above thirty per cent of the programme is the one concentration the committee will not accept,
      because vintage risk is the largest single driver of private-market dispersion.</div>
      <table class="demo-tbl" style="width:100%;margin-top:14px">
        <tbody>
          <tr><td>Target annual commitment pace</td><td class="num">${fmtM(commit / 5)}</td></tr>
          <tr><td>Committed this year</td><td class="num">${fmtM(cs.filter((c) => c.vintage >= 2025).reduce((s, c) => s + c.commitment, 0))}</td></tr>
          <tr><td>Uncalled as a share of net worth</td><td class="num">${fmtPct(((commit - called) /
            visibleHouseholds().reduce((s, h) => s + WORLD[h.id].netWorth, 0)) * 100, 1)}</td></tr>
          <tr><td>Largest single vintage</td><td class="num">${fmtPct((Math.max(...Object.values(vintages)) / commit) * 100, 0)}</td></tr>
        </tbody>
      </table>`)}
  </div>

  ${disclosure()}`;

  drawJ(funds);
}

function drawJ(funds) {
  const el = document.getElementById("jcurve");
  if (!el || typeof Chart === "undefined") return;
  const vint = [...new Set(funds.map((f) => f.vintage))].sort();
  const colours = ["#1f3d5c", "#2c5580", "#4a7ba8", "#7fa3c9", "#94793f", "#8a2f3f"];
  new Chart(el, {
    type: "line",
    data: { labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7"],
      datasets: vint.map((v, i) => {
        const age = 2026 - v;
        const target = funds.filter((f) => f.vintage === v)
          .reduce((s, f) => s + f.tvpi, 0) / funds.filter((f) => f.vintage === v).length;
        return { label: v + " vintage",
          data: [0.92, 0.98, 1.06, 1.18, 1.34, 1.52, 1.74].map((x, j) => (j <= age ? +(x * (target / 1.2)).toFixed(2) : null)),
          borderColor: colours[i % colours.length], borderWidth: 2, pointRadius: 2, tension: 0.3, spanGaps: false };
      }) },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { boxWidth: 10, font: { size: 10 } } } },
      scales: { y: { ticks: { callback: (v) => v.toFixed(2) + "x", font: { size: 10 } },
          grid: { color: "rgba(128,128,128,.14)" } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } } } },
  });
}
