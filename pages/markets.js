/* =========================================================
   GLOBAL MARKETS
   Ninety-eight benchmarks across seven boards, the Treasury
   curve, credit spreads, valuation percentiles, breadth,
   correlation and the macro strip. The topbar tape reads the
   same dataset, so the two never disagree.
   ========================================================= */

var mkBoard = "us";
var mkCol = "ytd";

boot({ subtitle: "Private Wealth Portal" }, function () { renderMarkets(); });

function mkGo(b) { mkBoard = b; renderMarkets(); }
function mkSort(c) { mkCol = c; renderMarkets(); }

function renderMarkets() {
  const boards = BOARDS.concat([{ id: "alts", label: "Alternatives", note: "Index returns for the private and hedged sleeves." }]);
  const b = boards.find((x) => x.id === mkBoard);
  const rows = mkBoard === "alts" ? ALT_BENCH.slice() : INDICES.filter((q) => q.board === mkBoard);
  rows.sort((x, y) => (y[mkCol] == null ? -1e9 : y[mkCol]) - (x[mkCol] == null ? -1e9 : x[mkCol]));

  $("#app").innerHTML = `
  ${toolbar("Global Markets",
    `<span class="demo-chip mut">As of ${fmtDate(MKT_ASOF)}</span>
     <select class="pa-btn" onchange="mkSort(this.value)">
       ${[["ytd", "Sort: year to date"], ["y1", "Sort: one year"], ["y3", "Sort: three years"],
          ["y5", "Sort: five years"], ["y10", "Sort: ten years"]].map((o) =>
         `<option value="${o[0]}" ${o[0] === mkCol ? "selected" : ""}>${o[1]}</option>`).join("")}
     </select>`)}

  <div class="demo-kpis">
    ${["SPX", "RUT", "EAFE", "EM", "LBUSTRUU", "LMBITR"].map((c) => {
      const q = IDX[c];
      return `<div class="demo-kpi">
        <div class="v">${ret(q.ytd, 1)}</div><div class="l">${esc(q.name)}</div>
        <div class="s">1D ${ret(q.d1)} &middot; 1Y ${ret(q.y1, 1)}</div></div>`;
    }).join("")}
  </div>

  <div class="rp-tabs">${boards.map((x) =>
    `<button class="rp-tab ${mkBoard === x.id ? "on" : ""}" onclick="mkGo('${x.id}')">${esc(x.label)}</button>`).join("")}</div>

  ${panel(b.label, `
    <div class="rp-scroll" style="max-height:560px">
      <table class="demo-tbl">
        <thead><tr><th>Benchmark</th>${mkBoard === "alts" ? "" : '<th class="num">Level</th><th class="num">1 day</th><th class="num">WTD</th><th class="num">MTD</th><th class="num">QTD</th>'}
          <th class="num">YTD</th><th class="num">1 yr</th><th class="num">3 yr</th><th class="num">5 yr</th>
          <th class="num">10 yr</th>${["us", "sector", "intl"].indexOf(mkBoard) >= 0 ? '<th class="num">Fwd P/E</th><th class="num">Yield</th><th class="num">From high</th>' : ""}</tr></thead>
        <tbody>${rows.map((q) => `<tr>
          <td><b>${esc(q.name)}</b><div class="rp-note">${esc(q.code)}</div></td>
          ${mkBoard === "alts" ? "" : `
            <td class="num">${q.level.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="num">${ret(q.d1)}</td><td class="num">${ret(q.wtd)}</td>
            <td class="num">${ret(q.mtd)}</td><td class="num">${ret(q.qtd)}</td>`}
          <td class="num">${q.ytd == null ? "—" : ret(q.ytd, 1)}</td>
          <td class="num">${q.y1 == null ? "—" : ret(q.y1, 1)}</td>
          <td class="num">${q.y3 == null ? "—" : ret(q.y3, 1)}</td>
          <td class="num">${q.y5 == null ? "—" : ret(q.y5, 1)}</td>
          <td class="num">${q.y10 == null ? "—" : ret(q.y10, 1)}</td>
          ${["us", "sector", "intl"].indexOf(mkBoard) >= 0 ? `
            <td class="num">${q.fwdPE == null ? "—" : q.fwdPE.toFixed(1)}</td>
            <td class="num">${q.divYld == null ? "—" : q.divYld.toFixed(2) + "%"}</td>
            <td class="num">${q.ddown == null ? "—" : ret(q.ddown, 1)}</td>` : ""}
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">${esc(b.note)} Three, five and ten year figures are annualised.</div>`,
    { k: rows.length + " benchmarks" })}

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Treasury curve", `
      <div class="rp-chart" style="height:180px"><canvas id="curveChart"></canvas></div>
      <table class="demo-tbl" style="width:100%;margin-top:12px">
        <thead><tr><th>Tenor</th><th class="num">Yield</th><th class="num">One month ago</th>
          <th class="num">One year ago</th><th class="num">Change, 1yr</th></tr></thead>
        <tbody>${CURVE.map((c) => `<tr>
          <td>${esc(c[0])}</td><td class="num">${c[1].toFixed(2)}%</td>
          <td class="num dim">${c[2].toFixed(2)}%</td><td class="num dim">${c[3].toFixed(2)}%</td>
          <td class="num">${ret((c[1] - c[3]) * 100, 0, " bps")}</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">2s10s at
      +${Math.round((IDX ? 0 : 0) + (CURVE[8][1] - CURVE[4][1]) * 100)} bps, positively sloped after two years of
      inversion. That normalisation is the reason duration was extended to neutral in June.</div>`,
      { k: "As of " + fmtDate(MKT_ASOF) })}

    ${panel("Policy rates and credit", `
      <h4 class="rp-eyebrow">Policy and reference rates</h4>
      <table class="demo-tbl" style="width:100%;margin-bottom:16px">
        <tbody>${POLICY.map((p) => `<tr><td><b>${esc(p[0])}</b></td>
          <td class="num">${esc(p[1])}</td><td class="dim">${esc(p[2])}</td></tr>`).join("")}</tbody>
      </table>
      <h4 class="rp-eyebrow">Credit spreads</h4>
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Spread</th><th class="num">Level</th><th class="num">1 month</th>
          <th class="num">20yr percentile</th></tr></thead>
        <tbody>${SPREADS.map((s) => `<tr>
          <td>${esc(s[0])}</td><td class="num">${s[1]}</td>
          <td class="num">${ret(s[2], 0, " bps")}</td>
          <td class="num">${s[3]}th</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">A low percentile means spreads are tight against their own
      history. Investment grade at the 18th percentile is the reason credit is underweight in every model.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Valuation against twenty years of history", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Asset</th><th>Measure</th><th class="num">Level</th>
          <th class="num">Percentile</th><th>Read</th></tr></thead>
        <tbody>${VALUATION.map((v) => `<tr>
          <td><b>${esc(v[0])}</b></td><td class="dim">${esc(v[1])}</td>
          <td class="num">${typeof v[2] === "number" ? v[2].toFixed(v[2] > 50 ? 0 : 1) : v[2]}</td>
          <td class="num">${v[3]}th</td>
          <td class="dim">${esc(v[4])}</td></tr>`).join("")}</tbody>
      </table>`, { k: "Percentile of own history" })}

    ${panel("Breadth and macro", `
      <h4 class="rp-eyebrow">Breadth</h4>
      <table class="demo-tbl" style="width:100%;margin-bottom:16px">
        <tbody>${BREADTH.map((b) => `<tr><td><b>${esc(b[0])}</b>
          <div class="rp-note">${esc(b[3])}</div></td>
          <td class="num">${esc(b[1])}</td></tr>`).join("")}</tbody>
      </table>
      <h4 class="rp-eyebrow">Macro</h4>
      <div class="rp-scroll" style="max-height:280px">
        <table class="demo-tbl">
          <thead><tr><th>Indicator</th><th class="num">Latest</th><th class="num">Prior</th><th>Note</th></tr></thead>
          <tbody>${MACRO.map((m) => `<tr>
            <td>${esc(m[0])}</td><td class="num">${esc(m[1])}</td>
            <td class="num dim">${esc(m[2])}</td><td class="dim">${esc(m[4])}</td></tr>`).join("")}</tbody>
        </table>
      </div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Cross-asset correlation, three years monthly", `
      <div class="rp-scroll">
        <table class="demo-tbl">
          <thead><tr><th></th>${CORR_ASSETS.map((a) => `<th class="num">${esc(a.split(" ")[0])}</th>`).join("")}</tr></thead>
          <tbody>${CORR_ASSETS.map((a, i) => `<tr><td><b>${esc(a)}</b></td>
            ${CORR[i].map((v, j) => `<td class="num" style="background:rgba(31,61,92,${(Math.abs(v) * 0.20).toFixed(2)})">${
              i === j ? "—" : v.toFixed(2)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">Deeper shading is a higher absolute correlation. Municipals
      against equities at 0.12 is why the muni sleeve does diversifying work that credit does not.</div>`)}

    ${panel("Seasonality", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Month</th><th class="num">Average S&amp;P 500 return</th><th></th></tr></thead>
        <tbody>${SEASONALITY.map((s) => `<tr>
          <td>${esc(s[0])}</td><td class="num">${ret(s[1], 1)}</td>
          <td><div class="rp-track" style="height:12px"><i style="width:${Math.min(100, Math.abs(s[1]) * 55)}%;
            background:${s[1] >= 0 ? "var(--color-green)" : "var(--color-red)"}"></i></div></td>
        </tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Long-run monthly averages, shown because clients ask.
      We do not position on seasonality.</div>`)}
  </div>

  ${disclosure("Benchmark names are real; every level and return attached to them is generated.")}`;

  drawCurve();
}

function drawCurve() {
  const el = document.getElementById("curveChart");
  if (!el || typeof Chart === "undefined") return;
  new Chart(el, {
    type: "line",
    data: { labels: CURVE.map((c) => c[0]),
      datasets: [
        { label: "Today", data: CURVE.map((c) => c[1]), borderColor: "#1f3d5c", borderWidth: 2.2, pointRadius: 2.5, tension: 0.3 },
        { label: "One month ago", data: CURVE.map((c) => c[2]), borderColor: "#94793f", borderWidth: 1.4, borderDash: [4, 3], pointRadius: 0, tension: 0.3 },
        { label: "One year ago", data: CURVE.map((c) => c[3]), borderColor: "#9aa3ad", borderWidth: 1.2, borderDash: [2, 3], pointRadius: 0, tension: 0.3 },
      ] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { boxWidth: 10, font: { size: 11 } } } },
      scales: { y: { ticks: { callback: (v) => v.toFixed(1) + "%", font: { size: 10 } },
          grid: { color: "rgba(128,128,128,.14)" } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } } } },
  });
}
