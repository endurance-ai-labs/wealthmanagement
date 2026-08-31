/* =========================================================
   MODELS & ALLOCATION
   The eight model portfolios, their strategic targets, the
   capital market assumptions behind them, the sleeve funds
   that implement them, and the dispersion of live accounts.
   ========================================================= */

var mdSel = "BAL";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) {
    app.innerHTML = gate("Not available in the client portal",
      "Your own allocation is on the home page.") + disclosure();
    return;
  }
  renderModels();
});

function mdPick(id) { mdSel = id; renderModels(); }

function renderModels() {
  const m = MODEL[mdSel];
  const r = MODEL_RETURNS[mdSel];
  const users = HOUSEHOLDS.filter((h) => h.model === mdSel);
  const assets = users.reduce((s, h) => s + h.mv, 0);

  /* Blended expense ratio of the sleeve funds, weighted by the model. */
  const expense = Object.keys(m.t).reduce((s, k) => {
    const sleeve = SLEEVES[k] || [];
    const tot = sleeve.reduce((a, x) => a + x[1], 0) || 1;
    const w = sleeve.reduce((a, [fid, wt]) => a + (FUND[fid].mgmtFee * wt) / tot, 0);
    return s + (m.t[k] / 100) * w;
  }, 0);

  $("#app").innerHTML = `
  ${toolbar("Models & Allocation",
    `<select class="pa-btn" onchange="mdPick(this.value)">
       ${MODELS.map((x) => `<option value="${x.id}" ${x.id === mdSel ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
     </select>${srcChips("pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtPct(r.er)}</div><div class="l">Expected return</div>
      <div class="s">Ten-year capital market assumption</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(r.vol)}</div><div class="l">Expected volatility</div>
      <div class="s">Annualised standard deviation</div></div>
    <div class="demo-kpi"><div class="v">${((r.er - 3.4) / r.vol).toFixed(2)}</div><div class="l">Return per unit of risk</div>
      <div class="s">Excess over cash, divided by volatility</div></div>
    <div class="demo-kpi"><div class="v">${fmtBps(expense * 100)}</div><div class="l">Blended expense ratio</div>
      <div class="s">Weighted across the sleeve funds</div></div>
    <div class="demo-kpi"><div class="v">${users.length}</div><div class="l">Households assigned</div>
      <div class="s">${fmtM(assets)} in this model</div></div>
    <div class="demo-kpi"><div class="v">${fmt$(m.min)}</div><div class="l">Minimum</div>
      <div class="s">Account size to implement fully</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel(m.name + " — strategic targets", `
      <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:0 0 170px"><div class="rp-chart" style="height:170px"><canvas id="modelChart"></canvas></div></div>
        <div style="flex:1 1 300px;min-width:0">
          ${["Equity", "Fixed Income", "Alternatives"].map((grp) => {
            const rows = ASSET_CLASSES.filter((a) => a.group === grp && m.t[a.id] > 0);
            const sub = rows.reduce((s, a) => s + m.t[a.id], 0);
            return `<h4 class="rp-eyebrow" style="margin-top:12px">${grp} &middot; ${sub.toFixed(0)}%</h4>
              ${rows.map((a) => `<div class="rp-alloc">
                <span class="lbl">${esc(a.label)}</span>
                <span class="rp-track"><i style="width:${Math.min(100, m.t[a.id] * 2.4)}%"></i></span>
                <span class="num rp-hide-s">${a.er.toFixed(1)}%</span>
                <span class="num">${m.t[a.id].toFixed(0)}%</span>
                <span class="rp-drift">&plusmn;${Math.max(1, Math.min(4, m.t[a.id] * 0.2)).toFixed(1)}</span>
              </div>`).join("")}`;
          }).join("")}
        </div>
      </div>
      <div class="rp-note" style="margin-top:12px">${esc(m.desc)} The column before the weight is the ten-year
      expected return for that asset class; the last column is the rebalancing band.</div>`)}

    ${panel("Capital market assumptions", `
      <div class="rp-scroll" style="max-height:420px">
        <table class="demo-tbl">
          <thead><tr><th>Asset class</th><th class="num">Expected return</th><th class="num">Volatility</th>
            <th class="num">Return per unit</th><th>Benchmark</th></tr></thead>
          <tbody>${ASSET_CLASSES.map((a) => `<tr>
            <td><b>${esc(a.label)}</b><div class="rp-note">${esc(a.group)}</div></td>
            <td class="num">${a.er.toFixed(1)}%</td>
            <td class="num">${a.vol.toFixed(1)}%</td>
            <td class="num">${((a.er - 3.4) / a.vol).toFixed(2)}</td>
            <td class="dim">${esc(a.benchName)}</td>
          </tr>`).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">Ten-year forward assumptions adopted by the investment
      committee in August 2026. Return per unit is excess return over a 3.4% cash assumption divided by
      volatility.</div>`, { k: "Adopted Aug 2026" })}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Sleeve implementation", `
      <div class="rp-scroll" style="max-height:440px">
        <table class="demo-tbl">
          <thead><tr><th>Asset class</th><th>Fund</th><th>Vehicle</th>
            <th class="num">Sleeve weight</th><th class="num">Model weight</th>
            <th class="num">Fee</th><th>Status</th></tr></thead>
          <tbody>${Object.keys(m.t).filter((k) => m.t[k] > 0).map((k) => {
            const sleeve = SLEEVES[k] || [];
            const tot = sleeve.reduce((a, x) => a + x[1], 0) || 1;
            return sleeve.map(([fid, wt], i) => {
              const f = FUND[fid];
              return `<tr class="rp-click" onclick="location.href='/wealthmanagement/funds/fund/?id=${fid}'">
                <td>${i === 0 ? "<b>" + esc(AC[k].label) + "</b>" : ""}</td>
                <td>${esc(f.name)}<div class="rp-note">${esc(f.manager)}</div></td>
                <td class="dim">${esc(f.vehicleLabel)}</td>
                <td class="num">${((wt / tot) * 100).toFixed(0)}%</td>
                <td class="num">${(m.t[k] * (wt / tot)).toFixed(2)}%</td>
                <td class="num">${fmtPct(f.mgmtFee, 2)}</td>
                <td>${statusPill(f.status)}</td>
              </tr>`;
            }).join("");
          }).join("")}</tbody>
        </table>
      </div>`, { k: "Approved list only" })}

    ${panel("Live account dispersion", users.length ? `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Household</th><th class="num">Assets</th><th class="num">Largest drift</th>
          <th class="num">Months since rebalance</th><th>Standing</th></tr></thead>
        <tbody>${users.sort((a, b) => b.mv - a.mv).map((h) => {
          const al = allocationOf(householdPositions(h.id));
          const worst = al.reduce((x, y) => (Math.abs(y.drift) - y.tolerance > Math.abs(x.drift) - x.tolerance ? y : x), al[0]);
          const out = Math.abs(worst.drift) > worst.tolerance;
          return `<tr class="rp-click" onclick="location.href='/wealthmanagement/households/household/?id=${h.id}&tab=ips'">
            <td>${esc(h.name)}</td><td class="num">${fmt$(h.mv)}</td>
            <td class="num"><span class="rp-drift ${out ? "out" : ""}">${worst.drift >= 0 ? "+" : ""}${worst.drift.toFixed(1)}</span>
              <div class="rp-note">${esc(worst.label)}</div></td>
            <td class="num">${h.monthsSinceRebalance}</td>
            <td>${out ? pill("Rebalance", "amber") : pill("In band", "green")}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Dispersion is what actually happens to a model once it is
      live. Accounts left un-rebalanced the longest show the widest drift, which is the whole argument for a
      tolerance-band policy rather than a calendar one.</div>`
      : gate("No households assigned", "This model is approved but not currently in use."),
      { k: users.length + " accounts" })}
  </div>

  <div style="margin-top:22px">
    ${panel("Model change approval", `
      ${approvalChain("model-" + mdSel, [
        { role: "pm", label: "Portfolio manager proposes", note: "Change, rationale and expected impact" },
        { role: "research", label: "Research review", note: "Confirms the sleeve funds remain approved" },
        { role: "cio", label: "CIO approves", note: "Signs the revised target set" },
        { role: "trading", label: "Implementation plan", note: "Trade schedule and tax impact by household" },
      ], { title: "Model change — " + m.name })}
      <div class="rp-note">Every change to a model target passes through research and the CIO before a single
      trade is written. The minutes of the decision live on the investment committee page.</div>`)}
  </div>

  ${disclosure()}`;

  drawModelChart();
}

function drawModelChart() {
  const el = document.getElementById("modelChart");
  if (!el || typeof Chart === "undefined") return;
  const m = MODEL[mdSel];
  const rows = ASSET_CLASSES.filter((a) => m.t[a.id] > 0);
  new Chart(el, {
    type: "doughnut",
    data: { labels: rows.map((a) => a.label),
      datasets: [{ data: rows.map((a) => m.t[a.id]),
        backgroundColor: ["#1f3d5c", "#2c5580", "#4a7ba8", "#7fa3c9", "#a8c2d9", "#94793f",
                          "#b39a63", "#c9b083", "#8a2f3f", "#a85a68", "#c78d97", "#6d7885"],
        borderWidth: 1, borderColor: getComputedStyle(document.body).backgroundColor }] },
    options: { cutout: "60%", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (c) => c.label + ": " + c.parsed + "%" } } } },
  });
}
