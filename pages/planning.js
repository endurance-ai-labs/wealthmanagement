/* =========================================================
   WEALTH PLANNING
   Goals, a Monte Carlo engine with live drivers, retirement
   cash flow and education funding. Scenarios persist locally.
   ========================================================= */

var plHh = qs("hh") || (isExternal() ? CLIENT_HH : "HH-0001");
var plState = null;

boot({ subtitle: "Private Wealth Portal" }, function () {
  plState = loadScenario();
  render();
});

function loadScenario() {
  const d = Object.assign({}, MC_DEFAULTS);
  try {
    const raw = JSON.parse(localStorage.getItem("rp-plan:" + plHh) || "null");
    if (raw) Object.assign(d, raw);
  } catch (e) {}
  const h = HH[plHh], w = WORLD[plHh];
  if (w && w.annualDraw) d.spending = w.annualDraw;
  d.startValue = h.mv;
  return d;
}
function saveScenario() {
  try { localStorage.setItem("rp-plan:" + plHh, JSON.stringify(plState)); } catch (e) {}
  render();
}
function plSet(k, v) { plState[k] = isNaN(+v) ? v : +v; saveScenario(); }
function plPick(id) { plHh = id; plState = loadScenario(); render(); }
function plReset() { try { localStorage.removeItem("rp-plan:" + plHh); } catch (e) {} plState = loadScenario(); render(); }

/* Deterministic Monte Carlo: 1,000 paths from a fixed seed, so the
   probability shown is the same on every load and every machine. */
function runMonteCarlo() {
  const h = HH[plHh];
  const er = MODEL_RETURNS[plState.allocation || h.model].er / 100;
  const vol = MODEL_RETURNS[plState.allocation || h.model].vol / 100;
  const years = Math.max(1, plState.longevity - (2026 - 1963));
  const infl = plState.inflation / 100;
  const rnd = _rand("rp-mc-" + plHh + plState.spending + plState.longevity + plState.allocation + plState.inflation);
  const paths = 1000;
  let success = 0;
  const bands = Array.from({ length: years + 1 }, () => []);
  for (let p = 0; p < paths; p++) {
    let v = plState.startValue;
    bands[0].push(v);
    let alive = true;
    for (let y = 1; y <= years; y++) {
      /* Box-Muller from the seeded stream. */
      const u1 = Math.max(1e-9, rnd()), u2 = rnd();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const r = er + vol * z;
      const draw = plState.spending * Math.pow(1 + infl, y);
      v = Math.max(0, v * (1 + r) - draw);
      if (v <= 0) alive = false;
      bands[y].push(v);
    }
    if (alive) success++;
  }
  const pct = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length * p)]; };
  return {
    probability: success / paths, years,
    p10: bands.map((b) => pct(b, 0.10)),
    p50: bands.map((b) => pct(b, 0.50)),
    p90: bands.map((b) => pct(b, 0.90)),
  };
}

function render() {
  const h = HH[plHh], w = WORLD[plHh];
  const mc = runMonteCarlo();
  const goals = PLANNING_GOALS.filter((g) => g.hhId === plHh);
  const tone = mc.probability >= 0.85 ? "ok" : mc.probability >= 0.7 ? "warn" : "bad";

  $("#app").innerHTML = `
  ${toolbar("Wealth Planning",
    `${isExternal() ? "" : `<select class="pa-btn" onchange="plPick(this.value)">
       ${visibleHouseholds().map((x) => `<option value="${x.id}" ${x.id === plHh ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
     </select>`}
     <span class="demo-chip ${tone}">${fmtPct(mc.probability * 100, 0)} probability of success</span>
     <button class="pa-btn" onclick="plReset()">Reset scenario</button>${srcChips("plan")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtPct(mc.probability * 100, 0)}</div>
      <div class="l">Probability of success</div><div class="s">1,000 simulated paths</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(plState.startValue)}</div><div class="l">Starting portfolio</div>
      <div class="s">${esc(h.name)}</div></div>
    <div class="demo-kpi"><div class="v">${fmt$(plState.spending)}</div><div class="l">Annual spending</div>
      <div class="s">${fmtPct((plState.spending / plState.startValue) * 100, 2)} withdrawal rate</div></div>
    <div class="demo-kpi"><div class="v">${mc.years}</div><div class="l">Years modelled</div>
      <div class="s">To age ${plState.longevity}</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(mc.p50[mc.years])}</div><div class="l">Median ending value</div>
      <div class="s">In nominal dollars</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(mc.p10[mc.years])}</div><div class="l">Tenth percentile</div>
      <div class="s">The outcome that should drive the plan</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Projection", `<div class="rp-chart" style="height:220px"><canvas id="mcChart"></canvas></div>
      <div class="rp-note" style="margin-top:10px">The shaded band is the tenth to ninetieth percentile of a
      thousand paths; the line is the median. Spending grows with inflation each year. A plan should be built
      to survive the bottom of the band, not to celebrate the top of it.</div>`, { k: "1,000 paths" })}

    ${panel("Drivers", `
      ${[["spending", "Annual spending", 100000, 1500000, 10000, fmt$],
         ["longevity", "Plan to age", 80, 105, 1, (v) => v],
         ["inflation", "Inflation assumption", 1.5, 4.5, 0.1, (v) => v.toFixed(1) + "%"]].map((d) => `
        <div class="rp-lever">
          <label for="lv-${d[0]}">${esc(d[1])}</label>
          <span class="val">${d[5](plState[d[0]])}</span>
          <input id="lv-${d[0]}" type="range" min="${d[2]}" max="${d[3]}" step="${d[4]}"
            value="${plState[d[0]]}" oninput="plSet('${d[0]}', this.value)">
        </div>`).join("")}
      <div class="rp-lever">
        <label for="lv-alloc">Allocation</label>
        <span class="val">${fmtPct(MODEL_RETURNS[plState.allocation || h.model].er)} expected</span>
        <select id="lv-alloc" class="pa-btn" style="grid-column:1/-1;width:100%"
          onchange="plSet('allocation', this.value)">
          ${MODELS.map((m) => `<option value="${m.id}" ${m.id === (plState.allocation || h.model) ? "selected" : ""}>
            ${esc(m.name)} — ${fmtPct(MODEL_RETURNS[m.id].er)} return, ${fmtPct(MODEL_RETURNS[m.id].vol)} volatility</option>`).join("")}
        </select>
      </div>
      <div class="rp-note" style="margin-top:14px">Move a driver and the projection recomputes. The scenario is
      saved against this household, so it is still here at the next meeting. Raising the allocation raises the
      median and widens the band; it does not reliably raise the tenth percentile, which is the point clients
      most often miss.</div>`, { k: "Live scenario" })}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Goals", goals.length ? `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Goal</th><th>Priority</th><th class="num">Target</th><th class="num">Horizon</th>
          <th class="num">Funded</th><th></th></tr></thead>
        <tbody>${goals.map((g) => `<tr>
          <td><b>${esc(g.goal)}</b></td>
          <td>${pill(g.priority, g.priority === "Essential" ? "blue" : g.priority === "Important" ? "amber" : "gray")}</td>
          <td class="num">${fmt$(g.target)}</td><td class="num">${g.horizon} yrs</td>
          <td class="num"><b class="rp-ret ${g.funded >= 1 ? "up" : "dn"}">${Math.round(g.funded * 100)}%</b></td>
          <td><div class="rp-track" style="height:12px"><i style="width:${Math.min(100, g.funded * 70)}%;
            background:${g.funded >= 1 ? "var(--color-green)" : "var(--color-amber)"}"></i>
            <u style="left:70%"></u></div></td>
        </tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">The rule on each bar marks fully funded. Essential goals are
      funded from the safest assets; aspirational goals carry the market risk. That ordering, not the total,
      is what makes a plan robust.</div>` : gate("No goals recorded", "Goals are set at the planning session."))}

    ${panel("Retirement cash flow", `
      <div class="rp-scroll" style="max-height:360px">
        <table class="demo-tbl">
          <thead><tr><th>Year</th><th class="num">Portfolio, median</th><th class="num">Withdrawal</th>
            <th class="num">Rate</th></tr></thead>
          <tbody>${mc.p50.slice(0, 20).map((v, y) => {
            const draw = plState.spending * Math.pow(1 + plState.inflation / 100, y);
            return `<tr><td>${2026 + y}</td>
              <td class="num">${fmtM(v)}</td>
              <td class="num">${y === 0 ? "—" : fmt$(draw)}</td>
              <td class="num">${y === 0 ? "—" : fmtPct((draw / v) * 100, 2)}</td></tr>`;
          }).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">The withdrawal rate climbing over time is the honest signal
      to watch: a plan fails when the rate outruns the return, not on any single bad year.</div>`)}
  </div>

  ${disclosure()}`;

  drawMC(mc);
}

function drawMC(mc) {
  const el = document.getElementById("mcChart");
  if (!el || typeof Chart === "undefined") return;
  const labels = mc.p50.map((_, i) => 2026 + i);
  new Chart(el, {
    type: "line",
    data: { labels,
      datasets: [
        { label: "90th percentile", data: mc.p90.map((v) => Math.round(v)), borderColor: "rgba(31,61,92,.30)",
          backgroundColor: "rgba(31,61,92,.12)", borderWidth: 1, fill: "+2", pointRadius: 0, tension: 0.25 },
        { label: "Median", data: mc.p50.map((v) => Math.round(v)), borderColor: "#1f3d5c",
          borderWidth: 2.2, fill: false, pointRadius: 0, tension: 0.25 },
        { label: "10th percentile", data: mc.p10.map((v) => Math.round(v)), borderColor: "rgba(138,47,63,.55)",
          borderWidth: 1.4, borderDash: [4, 3], fill: false, pointRadius: 0, tension: 0.25 },
      ] },
    options: { responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { labels: { boxWidth: 10, font: { size: 11 } } },
        tooltip: { callbacks: { label: (c) => c.dataset.label + ": " + fmtM(c.parsed.y) } } },
      scales: { y: { ticks: { callback: (v) => fmtM(v), font: { size: 10 } },
          grid: { color: "rgba(128,128,128,.14)" } },
        x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 10 } } } } },
  });
}
