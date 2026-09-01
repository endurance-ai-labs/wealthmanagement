/* =========================================================
   HOME
   Adviser and executive view: the firm command centre.
   Client view: the household's own portfolio overview.
   ========================================================= */
/* Root-first landing: a new visitor sees the marketing page. The "Enter the
   portal" links carry ?enter=1, which suppresses the redirect and shows the
   gate; anyone already signed in goes straight to the dashboard. */
if (!isSignedIn() && location.search.indexOf("enter") < 0) {
  location.replace("/wealthmanagement/welcome/");
}

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  const me = currentPersona();
  const clientView = me.perms.external || !RPMode.isInternal();
  app.innerHTML = clientView ? clientHome() : firmHome();
  if (!clientView) drawFirmCharts(); else drawClientCharts();
});

/* ---------------------------------------------------------
   ADVISER / EXECUTIVE
   --------------------------------------------------------- */
function firmHome() {
  const me = currentPersona();
  const book = visibleHouseholds();
  const firmWide = can("firm");

  const scopeAum = book.reduce((s, h) => s + h.mv, 0);
  const scopeRevenue = book.reduce((s, h) => s + annualFee(h.mv), 0);

  /* Trailing series for the headline figures. These are derived from the
     roll-forward and the market path, not invented: assets are walked from the
     beginning-of-year balance through the same monthly returns the portfolios
     earned, and revenue follows assets through the fee schedule. Where no real
     series exists — a household count, a point-in-time exception count — the
     tile carries no sparkline rather than a decorative one. */
  const ytdPath = (function () {
    const r = MODEL_RETURNS.BAL.monthly.slice(-YTD_MONTHS);
    const flowPerMonth = ROLLFORWARD.nna / YTD_MONTHS;
    let v = ROLLFORWARD.begin;
    return r.map((m) => { v = v * (1 + m / 100) + flowPerMonth; return Math.round(v); });
  })();
  const nnaPath = ytdPath.map((_, i) => Math.round((ROLLFORWARD.nna / YTD_MONTHS) * (i + 1)));
  const revPath = ytdPath.map((v) => Math.round(v * FIRM.blendedFee));

  /* Headline figures switch between the whole firm and the signed-in
     adviser's own book, so a wealth adviser never sees firm economics. */
  const kpis = firmWide ? [
    ["Assets under management", fmtM(FIRM.aum), ret((ROLLFORWARD.end / ROLLFORWARD.begin - 1) * 100, 1).replace(/<[^>]+>/g, "") + " year to date", "up", ytdPath],
    ["Advisory-only assets", fmtM(FIRM.aua), "Held away, reported not managed", ""],
    ["Net new assets, YTD", fmtM(ROLLFORWARD.nna), fmtPct(ROLLFORWARD.organicGrowth * 100, 1) + " organic growth", ROLLFORWARD.nna > 0 ? "up" : "dn", nnaPath],
    ["Households", FIRM.households.toLocaleString(), "Average " + fmtM(FIRM.avgRelationship), ""],
    can("revenue") ? ["Revenue run-rate", fmtM(FIRM.revenue), fmtBps(FIRM.blendedFee * 100) + " blended", "", revPath]
                   : ["Client retention", fmtPct(RP.targets.retention * 100, 1), "Trailing twelve months", "up"],
    ["Households out of tolerance", String(driftedHouseholds().length), "Of " + HOUSEHOLDS.length + " monitored in detail", ""],
  ] : [
    ["Assets under management", fmtM(scopeAum), book.length + " households", ""],
    ["Average relationship", fmtM(scopeAum / (book.length || 1)), bookLabel(), ""],
    ["Net flows, YTD", fmtM(book.reduce((s, h) => s + h.ytdFlow, 0)), "Contributions less withdrawals", ""],
    ["Reviews past due", String(book.filter((h) => h.ipsReview < RP.asOf).length), "Annual IPS review dates", ""],
    ["Meetings in the next 30 days", String(MEETINGS.filter((m) => m.upcoming && book.some((h) => h.id === m.hhId)).length), "Across your book", ""],
    ["Out of tolerance", String(driftedHouseholds().filter((h) => book.some((b) => b.id === h.id)).length), "Needing a rebalance", ""],
  ];

  return `
  ${toolbar(firmWide ? "Firm Command Center" : "My Practice",
    `<span class="demo-chip mut">As of ${fmtDate(RP.asOf)}</span>${srcChips("pa", "cust", "crm")}`)}

  <div class="demo-kpis">
    ${kpis.map((k) => `<div class="demo-kpi">
      ${k[4] ? `<span class="spark">${sparkSVG(k[4], { w: 62, h: 22, color: "var(--color-blue)" })}</span>` : ""}
      <div class="v">${k[1]}</div><div class="l">${esc(k[0])}</div>
      <div class="s"><span class="${k[3]}">${esc(k[2])}</span></div></div>`).join("")}
  </div>

  <div class="demo-grid demo-two">
    ${firmWide ? rollForwardPanel() : ""}
    ${openItemsPanel()}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${allocationPanel(firmWide ? POSITIONS : book.flatMap((h) => householdPositions(h.id)),
      firmWide ? "Firm allocation against policy" : "Book allocation against policy")}
    ${concentrationPanel(book, firmWide)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${flowsPanel(firmWide)}
    ${marketPanel()}
  </div>

  ${disclosure()}`;
}

function driftedHouseholds() {
  return HOUSEHOLDS.filter((h) => isDrifted(allocationOf(householdPositions(h.id))));
}

function rollForwardPanel() {
  const r = ROLLFORWARD;
  const rows = [
    ["Beginning assets, 1 January", r.begin, "base"],
    ["New households", r.newHouseholds, "pos"],
    ["Additions from existing clients", r.additions, "pos"],
    ["Withdrawals", r.withdrawals, "neg"],
    ["Client attrition", r.attrition, "neg"],
    ["Advisory fees", r.fees, "neg"],
    ["Market return", r.marketReturn, "pos"],
    ["Ending assets, " + fmtDate(RP.asOf), r.end, "base"],
  ];
  return panel("Assets under management roll-forward", `
    <table class="demo-tbl" style="width:100%">
      <tbody>${rows.map((x) => `
        <tr${x[2] === "base" ? ' style="font-weight:700"' : ""}>
          <td>${esc(x[0])}</td>
          <td class="num">${x[2] === "base" ? fmtM(x[1]) : money(x[1])}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div class="rp-note" style="margin-top:10px">Net new assets of ${fmtM(r.nna)} represent
    ${fmtPct(r.organicGrowth * 100, 1)} organic growth against a ${fmtPct(RP.targets.organicGrowth * 100, 1)} target.
    Beginning plus flows plus market return less fees ties to ending assets exactly.</div>`,
    { k: r.periodLabel, chips: srcChip("pa") });
}

function openItemsPanel() {
  const me = currentPersona();
  const book = visibleHouseholds();
  const drifted = driftedHouseholds().filter((h) => book.some((b) => b.id === h.id));
  const overdueIps = book.filter((h) => h.ipsReview < RP.asOf);
  const unfunded = CAPITAL_CALLS.filter((c) => c.status === "Unfunded" || c.status === "Awaiting Client");
  const myBreaks = can("trading") ? BREAKS.filter((b) => b.status === "Overdue") : [];
  const myCompliance = can("compliance") ? COMPLIANCE.filter((c) => c.overdue) : [];
  const myMeetings = MEETINGS.filter((m) => m.upcoming && book.some((h) => h.id === m.hhId)).slice(0, 3);

  const items = [];
  drifted.slice(0, 4).forEach((h) => {
    const worst = allocationOf(householdPositions(h.id))
      .reduce((m, x) => (Math.abs(x.drift) - x.tolerance > Math.abs(m.drift) - m.tolerance ? x : m));
    items.push(["warn", h.name + " is out of tolerance",
      worst.label + " is " + ret(worst.drift, 1, " points") + " against a band of &plusmn;" + worst.tolerance.toFixed(1) +
      ". Last rebalanced " + h.monthsSinceRebalance + " months ago.",
      "/wealthmanagement/trading/?hh=" + h.id, "Open the rebalance proposal"]);
  });
  unfunded.slice(0, 2).forEach((c) => {
    items.push([c.status === "Unfunded" ? "warn" : "", "Capital call: " + c.hhName,
      fmt$(c.amount) + " to " + c.fund + ", due " + fmtDate(c.due) + " (" + daysBetween(RP.asOf, c.due) + " days). Source: " + c.source + ".",
      "/wealthmanagement/private/", "Fund the call"]);
  });
  overdueIps.slice(0, 2).forEach((h) => {
    items.push(["", "Investment policy review past due: " + h.name,
      "Annual review date was " + fmtDate(h.ipsReview) + ".",
      "/wealthmanagement/households/household/?id=" + h.id + "&tab=ips", "Review the policy"]);
  });
  myBreaks.slice(0, 2).forEach((b) => {
    items.push(["warn", "Reconciliation break aged " + b.age + " days",
      b.type + " on " + b.hhName + " at " + b.custodian + ", " + money(b.amount) + ".",
      "/wealthmanagement/operations/", "Open the break register"]);
  });
  myCompliance.slice(0, 2).forEach((c) => {
    items.push(["warn", "Compliance item overdue: " + c.item,
      c.note, "/wealthmanagement/compliance/", "Open the register"]);
  });
  myMeetings.forEach((m) => {
    items.push(["", m.kind + ": " + m.hhName,
      fmtDate(m.date) + ", " + m.location + ". Preparation pack is ready.",
      "/wealthmanagement/meetings/", "Open the prep pack"]);
  });

  return panel("What needs you", items.length ? `
    <div class="rp-tl">
      ${items.slice(0, 8).map((i) => `<div class="rp-tl-item ${i[0]}">
        <div class="t">${esc(i[1])}</div>
        <div class="d">${i[2]}</div>
        <a class="rp-note" href="${i[3]}" style="color:var(--color-blue)">${esc(i[4])} &rarr;</a>
      </div>`).join("")}
    </div>` : gate("Nothing outstanding", "No drifted portfolios, overdue reviews or unfunded calls in your scope."),
    { k: esc(me.name) + " &middot; " + esc(bookLabel()) });
}

function allocationPanel(positions, title) {
  const alloc = allocationOf(positions).sort((a, b) => b.actualPct - a.actualPct);
  const total = positions.reduce((s, p) => s + p.value, 0);
  return panel(title, `
    <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      <div style="flex:0 0 190px;max-width:100%"><div class="rp-chart" style="height:190px"><canvas id="allocChart"></canvas></div></div>
      <div style="flex:1 1 320px;min-width:0">
        ${alloc.map((a) => `
          <div class="rp-alloc">
            <span class="lbl">${esc(a.label)}</span>
            <span class="rp-track" title="Target ${a.targetPct.toFixed(1)}%">
              <i style="width:${Math.min(100, a.actualPct * 2.4)}%"></i>
              <u style="left:${Math.min(100, a.targetPct * 2.4)}%"></u>
            </span>
            <span class="num rp-hide-s">${fmtM(a.value)}</span>
            <span class="num">${a.actualPct.toFixed(1)}%</span>
            <span class="rp-drift ${Math.abs(a.drift) > a.tolerance ? "out" : ""}">${a.drift >= 0 ? "+" : ""}${a.drift.toFixed(1)}</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="rp-note" style="margin-top:12px">Bars show the actual weight; the vertical rule marks the policy
    target. The final column is drift in percentage points, amber where it has left its tolerance band.
    Total ${fmtM(total)}.</div>`,
    { k: "Look-through", chips: srcChip("pa") });
}

function concentrationPanel(book, firmWide) {
  const top = book.slice().sort((a, b) => b.mv - a.mv).slice(0, 12);
  const base = firmWide ? FIRM.aum : book.reduce((s, h) => s + h.mv, 0);
  const topShare = top.reduce((s, h) => s + h.mv, 0) / base;
  return panel("Largest relationships", `
    <div class="rp-scroll" style="max-height:340px">
      <table class="demo-tbl">
        <thead><tr><th>Household</th><th>Adviser</th><th class="num">Assets</th>
          <th class="num">Share</th><th class="num">YTD net</th></tr></thead>
        <tbody>${top.map((h) => {
          const r = householdReturns(h.id);
          return `<tr class="rp-click" onclick="location.href='/wealthmanagement/households/household/?id=${h.id}'">
            <td><b>${esc(h.name)}</b><div class="rp-note">${esc(h.segment)} &middot; ${esc(h.modelName)}</div></td>
            <td>${esc(h.advisor.split(" ")[0])} ${esc(h.advisor.split(" ")[1] || "")}</td>
            <td class="num">${fmtM(h.mv)}</td>
            <td class="num">${((h.mv / base) * 100).toFixed(2)}%</td>
            <td class="num">${ret(r.ytd)}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">The twelve largest relationships in scope represent
    ${fmtPct(topShare * 100, 1)} of assets. Concentration above 25% in the top ten is reported to the
    executive committee each quarter.</div>`,
    { k: firmWide ? "Firm" : bookLabel() });
}

function flowsPanel(firmWide) {
  const rows = firmWide
    ? ADVISORS.map((a) => {
        const hh = HOUSEHOLDS.filter((h) => h.advisor === a.name);
        return { label: a.name, sub: a.office + " office", n: a.households,
                 aum: Math.round((a.households / RP.targets.householdsPerAdvisor) * 0 + hh.reduce((s, h) => s + h.mv, 0)),
                 flow: hh.reduce((s, h) => s + h.ytdFlow, 0) };
      }).sort((a, b) => b.aum - a.aum)
    : FIRM.firmSegments.map((s) => ({ label: s.label, sub: s.households + " households", n: s.households, aum: s.aum, flow: 0 }));

  return panel(firmWide ? "Flows by adviser" : "Segment mix", `
    <table class="demo-tbl" style="width:100%">
      <thead><tr><th>${firmWide ? "Adviser" : "Segment"}</th><th class="num">Households</th>
        <th class="num">Assets in detail</th>${firmWide ? '<th class="num">Net flows YTD</th>' : '<th class="num">Share</th>'}</tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td><b>${esc(r.label)}</b><div class="rp-note">${esc(r.sub)}</div></td>
        <td class="num">${r.n}</td>
        <td class="num">${fmtM(r.aum)}</td>
        <td class="num">${firmWide ? money(r.flow) : fmtPct((r.aum / FIRM.aum) * 100, 1)}</td>
      </tr>`).join("")}</tbody>
    </table>
    <div class="rp-note" style="margin-top:10px">${firmWide
      ? "Assets shown are the detailed sample carried in this environment. Household counts are the adviser's full book."
      : "Segment shares reconcile to total firm assets of " + fmtM(FIRM.aum) + "."}</div>`,
    { chips: srcChip("crm") });
}

function marketPanel() {
  const watch = ["SPX", "RUT", "EAFE", "EM", "LBUSTRUU", "LMBITR", "XAU", "VIX"];
  return panel("Markets", `
    <div class="rp-board">
      ${watch.map((c) => {
        const q = IDX[c]; if (!q) return "";
        return `<div class="rp-quote">
          <span class="n">${esc(q.name)}</span>
          <span class="lv">${q.level.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span class="sub"><span>1D <b>${ret(q.d1)}</b></span><span>YTD <b>${ret(q.ytd, 1)}</b></span>
            <span>1Y <b>${ret(q.y1, 1)}</b></span></span>
        </div>`;
      }).join("")}
    </div>
    <div class="rp-note" style="margin-top:12px">
      The 10-year Treasury is at ${CURVE.find((c) => c[0] === "10Y")[1].toFixed(2)}%, the 2s10s curve at
      +${Math.round((CURVE.find((c) => c[0] === "10Y")[1] - CURVE.find((c) => c[0] === "2Y")[1]) * 100)} bps,
      investment grade at ${SPREADS[0][1]} bps and high yield at ${SPREADS[1][1]} bps.
      <a href="/wealthmanagement/markets/" style="color:var(--color-blue)">Open the full market desk &rarr;</a>
    </div>`,
    { k: "As of " + fmtDate(MKT_ASOF) });
}

/* ---------------------------------------------------------
   CLIENT VIEW
   --------------------------------------------------------- */
function clientHome() {
  const h = HH[currentPersona().perms.external ? CLIENT_HH : (visibleHouseholds()[0] || HOUSEHOLDS[0]).id];
  const r = householdReturns(h.id);
  const bench = policyBenchmark(h.model);
  const alloc = allocationOf(householdPositions(h.id)).sort((a, b) => b.actualPct - a.actualPct);
  const goals = PLANNING_GOALS.filter((g) => g.hhId === h.id);
  const nextMeeting = MEETINGS.find((m) => m.upcoming && m.hhId === h.id);
  const docs = DOCUMENTS.filter((d) => d.hhId === h.id && d.status === "Delivered").slice(0, 5);
  const commits = COMMITMENTS.filter((c) => c.hhId === h.id);

  return `
  ${toolbar(h.name, `<span class="demo-chip mut">As of ${fmtDate(RP.asOf)}</span>`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtM(h.mv)}</div><div class="l">Portfolio value</div>
      <div class="s">${householdAccounts(h.id).length} accounts</div></div>
    <div class="demo-kpi"><div class="v">${ret(r.ytd)}</div><div class="l">Year to date, net of fees</div>
      <div class="s">Benchmark ${ret(bench.ytd, 1)}</div></div>
    <div class="demo-kpi"><div class="v">${ret(r.y1)}</div><div class="l">One year</div>
      <div class="s">Benchmark ${ret(bench.y1, 1)}</div></div>
    <div class="demo-kpi"><div class="v">${ret(r.y3)}</div><div class="l">Three years, annualised</div>
      <div class="s">Benchmark ${ret(bench.y3, 1)}</div></div>
    <div class="demo-kpi"><div class="v">${esc(h.modelName)}</div><div class="l">Investment strategy</div>
      <div class="s">${esc(h.riskProfile)} risk profile</div></div>
    <div class="demo-kpi"><div class="v">${commits.length}</div><div class="l">Private market funds</div>
      <div class="s">${fmtM(commits.reduce((s, c) => s + c.commitment, 0))} committed</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Growth of your portfolio", `
      <div class="rp-chart" style="height:150px"><canvas id="growthChart"></canvas></div>
      <div class="rp-note" style="margin-top:10px">Three years, net of all fees, indexed to 100 at the start.
      Your blended benchmark is the weighted return of the market indices behind each part of your allocation.</div>`,
      { k: "Three years, net" })}

    ${panel("How your money is invested", `
      <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:0 0 170px"><div class="rp-chart" style="height:170px"><canvas id="allocChart"></canvas></div></div>
        <div style="flex:1 1 260px;min-width:0">
          ${alloc.map((a) => `<div class="rp-alloc">
            <span class="lbl">${esc(a.label)}</span>
            <span class="rp-track"><i style="width:${Math.min(100, a.actualPct * 2.4)}%"></i>
              <u style="left:${Math.min(100, a.targetPct * 2.4)}%"></u></span>
            <span class="num rp-hide-s">${fmtM(a.value)}</span>
            <span class="num">${a.actualPct.toFixed(1)}%</span>
            <span class="rp-drift">${a.targetPct.toFixed(1)}%</span>
          </div>`).join("")}
        </div>
      </div>
      <div class="rp-note" style="margin-top:10px">The final column is the long-term target set in your
      investment policy statement. Small differences are normal between rebalances.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Your goals", goals.length ? `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Goal</th><th>Priority</th><th class="num">Horizon</th><th class="num">Funded</th></tr></thead>
        <tbody>${goals.map((g) => `<tr>
          <td><b>${esc(g.goal)}</b><div class="rp-note">Target ${fmtM(g.target)}</div></td>
          <td>${pill(g.priority, g.priority === "Essential" ? "blue" : g.priority === "Important" ? "amber" : "gray")}</td>
          <td class="num">${g.horizon} yrs</td>
          <td class="num"><b class="rp-ret ${g.funded >= 1 ? "up" : "dn"}">${Math.round(g.funded * 100)}%</b></td>
        </tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Funded status is the probability-weighted value of assets
      earmarked for the goal against what it will cost. Above 100% means the goal is fully funded on current
      assumptions.</div>` : gate("No goals recorded", "Your adviser will set these up at your next planning session."),
      { k: "Planning" })}

    ${panel("Recent documents", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Document</th><th>Period</th><th class="num">Delivered</th></tr></thead>
        <tbody>${docs.map((d) => `<tr>
          <td><b>${esc(d.type)}</b><div class="rp-note">${esc(d.category)}</div></td>
          <td>${esc(d.period)}</td>
          <td class="num">${fmtDateShort(d.date)}</td>
        </tr>`).join("")}</tbody>
      </table>
      ${nextMeeting ? `<div class="rp-note" style="margin-top:12px">
        Your next meeting is a <b>${esc(nextMeeting.kind.toLowerCase())}</b> on
        ${fmtDate(nextMeeting.date)} (${esc(nextMeeting.location.toLowerCase())}).</div>` : ""}
      <div class="rp-note" style="margin-top:6px">
        <a href="/wealthmanagement/documents/" style="color:var(--color-blue)">Open your document vault &rarr;</a></div>`,
      { k: "Your vault" })}
  </div>

  ${disclosure()}`;
}

/* ---------------------------------------------------------
   CHARTS
   --------------------------------------------------------- */
function chartColours() {
  const css = getComputedStyle(document.documentElement);
  const blue = css.getPropertyValue("--color-blue").trim() || "#1f3d5c";
  return ["#1f3d5c", "#2c5580", "#4a7ba8", "#7fa3c9", "#a8c2d9", "#94793f",
          "#b39a63", "#8a2f3f", "#a85a68", "#c78d97", "#6d7885", "#9aa3ad", blue];
}

function drawAllocDoughnut(positions) {
  const el = document.getElementById("allocChart");
  if (!el || typeof Chart === "undefined") return;
  const alloc = allocationOf(positions).sort((a, b) => b.actualPct - a.actualPct);
  new Chart(el, {
    type: "doughnut",
    data: {
      labels: alloc.map((a) => a.label),
      datasets: [{ data: alloc.map((a) => +a.actualPct.toFixed(2)),
        backgroundColor: chartColours(), borderWidth: 1,
        borderColor: getComputedStyle(document.body).backgroundColor }],
    },
    options: {
      cutout: "62%", plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (c) => c.label + ": " + c.parsed.toFixed(1) + "%" } } },
      responsive: true, maintainAspectRatio: false,
    },
  });
}

function drawFirmCharts() {
  const book = visibleHouseholds();
  drawAllocDoughnut(can("firm") ? POSITIONS : book.flatMap((h) => householdPositions(h.id)));
}

function drawClientCharts() {
  const h = HH[currentPersona().perms.external ? CLIENT_HH : (visibleHouseholds()[0] || HOUSEHOLDS[0]).id];
  drawAllocDoughnut(householdPositions(h.id));

  const el = document.getElementById("growthChart");
  if (!el || typeof Chart === "undefined") return;
  const r = householdReturns(h.id);
  const bm = MODEL_RETURNS[h.model].monthly;
  const bmGrowth = bm.reduce((a, x) => { a.push(a[a.length - 1] * (1 + (x - 0.28) / 100)); return a; }, [100]);
  new Chart(el, {
    type: "line",
    data: {
      labels: ["Start"].concat(MONTHS.map(fmtMonth)),
      datasets: [
        { label: "Your portfolio, net", data: r.growth.map((v) => +v.toFixed(2)),
          borderColor: "#1f3d5c", backgroundColor: "rgba(31,61,92,.10)", borderWidth: 2, fill: true, pointRadius: 0, tension: 0.25 },
        { label: "Blended benchmark", data: bmGrowth.map((v) => +v.toFixed(2)),
          borderColor: "#94793f", borderWidth: 1.5, borderDash: [5, 3], fill: false, pointRadius: 0, tension: 0.25 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { labels: { boxWidth: 10, font: { size: 11 } } } },
      scales: {
        x: { ticks: { maxTicksLimit: 7, font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { font: { size: 10 } }, grid: { color: "rgba(128,128,128,.14)" } },
      },
    },
  });
}
