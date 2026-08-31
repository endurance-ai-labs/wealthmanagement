/* =========================================================
   HOUSEHOLD DETAIL
   The deepest page in the portal. Eleven tabs covering the
   portfolio and the life it belongs to.
   ========================================================= */

const HH_TABS = [
  ["overview",  "Overview"],
  ["world",     "Real world"],
  ["perf",      "Performance"],
  ["ips",       "Allocation & IPS"],
  ["holdings",  "Holdings & tax lots"],
  ["activity",  "Activity & cash flows"],
  ["private",   "Private markets"],
  ["planning",  "Planning"],
  ["documents", "Documents"],
  ["fees",      "Fees"],
  ["notes",     "Relationship"],
];

var hhTab = qs("tab") || "overview";
var hhId = qs("id") || (isExternal() ? CLIENT_HH : "HH-0001");

boot({ subtitle: "Private Wealth Portal" }, function () {
  if (isExternal()) hhId = CLIENT_HH;
  if (!visibleHouseholds().some((h) => h.id === hhId)) {
    $("#app").innerHTML = gate("Not in your book",
      "This household is assigned to another adviser. Ask the client service team if you need access.") + disclosure();
    return;
  }
  renderHousehold();
});

function hhGo(tab) {
  hhTab = tab;
  history.replaceState(null, "", "?id=" + hhId + "&tab=" + tab);
  renderHousehold();
}

function renderHousehold() {
  const h = HH[hhId];
  const w = WORLD[hhId];
  const r = householdReturns(hhId);
  const bench = policyBenchmark(h.model);
  const drifted = isDrifted(allocationOf(householdPositions(hhId)));

  const body = {
    overview:  hhOverview, world: hhWorld, perf: hhPerf, ips: hhIps,
    holdings:  hhHoldings, activity: hhActivity, private: hhPrivate,
    planning:  hhPlanning, documents: hhDocuments, fees: hhFees, notes: hhNotes,
  }[hhTab] || hhOverview;

  $("#app").innerHTML = `
  ${toolbar(h.name,
    `<span class="demo-chip mut">${esc(segLabel(h.segment))}</span>
     <span class="demo-chip mut">${esc(h.tier)} service</span>
     ${drifted ? '<span class="demo-chip warn">Out of tolerance</span>' : '<span class="demo-chip ok">On target</span>'}
     ${srcChips("pa", "cust", "crm")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtM(h.mv)}</div><div class="l">Assets under management</div>
      <div class="s">${householdAccounts(hhId).length} accounts &middot; ${esc(h.custodian.split(" ")[0])}</div></div>
    <div class="demo-kpi"><div class="v">${ret(r.ytd)}</div><div class="l">Year to date, net</div>
      <div class="s">Benchmark ${ret(bench.ytd, 1)}</div></div>
    <div class="demo-kpi"><div class="v">${ret(r.y3)}</div><div class="l">Three years, annualised</div>
      <div class="s">Benchmark ${ret(bench.y3, 1)}</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(w.netWorth)}</div><div class="l">Total net worth</div>
      <div class="s">${fmtPct(w.managedShare * 100, 0)} managed by us</div></div>
    <div class="demo-kpi"><div class="v">${esc(h.modelName)}</div><div class="l">Strategy</div>
      <div class="s">${esc(h.riskProfile)} &middot; ${esc(h.advisor)}</div></div>
    <div class="demo-kpi"><div class="v">${w.annualDraw ? fmtM(w.annualDraw) : "None"}</div><div class="l">Annual distribution</div>
      <div class="s">${w.annualDraw ? fmtPct(w.distributionRate * 100, 1) + " of assets" : "Accumulating"}</div></div>
  </div>

  <div class="rp-tabs">
    ${HH_TABS.map((t) => `<button class="rp-tab ${hhTab === t[0] ? "on" : ""}"
      onclick="hhGo('${t[0]}')">${esc(t[1])}</button>`).join("")}
  </div>

  ${body(h, w, r, bench)}
  ${disclosure()}`;

  if (hhTab === "overview" || hhTab === "ips") drawHhAlloc();
  if (hhTab === "perf" || hhTab === "overview") drawHhGrowth();
}

/* ---------------- Overview ---------------- */
function hhOverview(h, w, r) {
  const accts = householdAccounts(h.id);
  return `
  <div class="demo-grid demo-two">
    ${panel("Accounts", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Registration</th><th>Custodian</th><th class="num">Value</th><th class="num">Share</th></tr></thead>
        <tbody>${accts.sort((a, b) => b.mv - a.mv).map((a) => `<tr>
          <td><b>${esc(a.registration)}</b><div class="rp-note">${esc(a.number)} &middot;
            ${a.taxable ? "Taxable" : "Tax-deferred"}${a.altEligible ? " &middot; alternatives eligible" : ""}</div></td>
          <td>${esc(a.custodian.split(" ")[0])}</td>
          <td class="num">${fmt$(a.mv)}</td>
          <td class="num">${((a.mv / h.mv) * 100).toFixed(1)}%</td>
        </tr>`).join("")}</tbody>
        <tfoot><tr style="font-weight:700"><td>Total</td><td></td>
          <td class="num">${fmt$(h.mv)}</td><td class="num">100.0%</td></tr></tfoot>
      </table>
      <div class="rp-note" style="margin-top:10px">Municipals are held in the taxable registrations and taxable
      bonds in the tax-deferred ones. That asset-location discipline is applied automatically to every account.</div>`,
      { k: esc(h.custodian) })}

    ${panel("Growth, net of fees", `
      <div class="rp-chart" style="height:170px"><canvas id="growthChart"></canvas></div>
      <div class="rp-note" style="margin-top:10px">Three years indexed to 100, net of all advisory fees,
      against the blended policy benchmark for ${esc(h.modelName)}.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Allocation against policy", `
      <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:0 0 160px"><div class="rp-chart" style="height:160px"><canvas id="allocChart"></canvas></div></div>
        <div style="flex:1 1 280px;min-width:0">${allocRows(householdPositions(h.id))}</div>
      </div>`)}

    ${panel("What is happening here", `
      <div class="rp-note" style="margin-bottom:12px;font-size:12.5px;color:var(--color-cloud-whisper)">
        ${esc(w.headline)}</div>
      ${w.risks.length ? `<h4 class="rp-eyebrow" style="margin-bottom:8px">Open risks</h4>
        <ul style="margin:0 0 14px 18px;font-size:12.5px">
          ${w.risks.map((x) => `<li style="margin-bottom:4px">${esc(x)}</li>`).join("")}</ul>` : ""}
      <dl class="rp-dl">
        <dt>Client since</dt><dd>${fmtDate(h.since)}</dd>
        <dt>Adviser</dt><dd>${esc(h.advisor)}</dd>
        <dt>Primary contact</dt><dd>${esc(h.contact)}</dd>
        <dt>Last contact</dt><dd>${fmtDate(h.lastContact)}</dd>
        <dt>Policy last reviewed</dt><dd>${fmtDate(h.ipsReviewed)}</dd>
        <dt>Next review due</dt><dd>${h.ipsReview < RP.asOf
          ? '<span class="bm-ret dn">' + fmtDate(h.ipsReview) + " &middot; past due</span>"
          : fmtDate(h.ipsReview)}</dd>
        <dt>Last rebalanced</dt><dd>${fmtDate(h.lastRebalance)} (${h.monthsSinceRebalance} months)</dd>
      </dl>`, { k: "Adviser view" })}
  </div>`;
}

/* ---------------- Real world ---------------- */
function hhWorld(h, w) {
  const sheet = [
    ["Managed by Blackmont", h.mv, "Custodied and discretionary"],
    ["Held away", w.heldAwayTotal, "Reported for planning, not managed"],
    ["Property", w.propertyTotal, "Primary and other residences"],
    ["Liabilities", -w.debtTotal, "Mortgages and lines of credit"],
  ];
  return `
  <div class="demo-grid demo-two">
    ${panel("The family", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Name</th><th>Relationship</th><th class="num">Age</th><th>Note</th></tr></thead>
        <tbody>${w.family.map((f) => `<tr>
          <td><b>${esc(f.name)}</b></td><td>${esc(f.relation)}</td>
          <td class="num">${f.age || "—"}</td><td class="dim">${esc(f.note)}</td>
        </tr>`).join("")}</tbody>
      </table>
      <dl class="rp-dl" style="margin-top:14px">
        <dt>Occupation</dt><dd>${esc(w.career[0])}</dd>
      </dl>
      <div class="rp-note" style="margin-top:6px">${esc(w.career[1])}</div>`,
      { k: "Relationship", chips: srcChip("crm") })}

    ${panel("Household balance sheet", `
      <table class="demo-tbl" style="width:100%">
        <tbody>${sheet.map((x) => `<tr>
          <td><b>${esc(x[0])}</b><div class="rp-note">${esc(x[2])}</div></td>
          <td class="num">${x[1] < 0 ? money(x[1]) : fmt$(x[1])}</td>
        </tr>`).join("")}</tbody>
        <tfoot><tr style="font-weight:700"><td>Net worth</td>
          <td class="num">${fmt$(w.netWorth)}</td></tr></tfoot>
      </table>
      <div class="rp-note" style="margin-top:10px">
        We manage ${fmtPct(w.managedShare * 100, 0)} of what this family owns. The rest is the advice
        opportunity and the reason the plan is built on the whole balance sheet rather than the portfolio alone.
      </div>`, { k: "Whole picture" })}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Assets held away", w.heldAway.length ? `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Asset</th><th class="num">Value</th><th>Liquidity</th></tr></thead>
        <tbody>${w.heldAway.map((a) => `<tr>
          <td><b>${esc(a.label)}</b><div class="rp-note">${esc(a.note)}</div></td>
          <td class="num">${fmt$(a.value)}</td>
          <td>${a.liquid ? pill("Liquid", "green") : pill("Illiquid", "amber")}</td>
        </tr>`).join("")}</tbody>
      </table>` : gate("Nothing held away", "Everything this household owns is custodied with us."))}

    ${panel("Property and debt", `
      ${w.residences.length ? `<h4 class="rp-eyebrow">Property</h4>
      <table class="demo-tbl" style="width:100%;margin-bottom:16px">
        <thead><tr><th>Property</th><th class="num">Value</th><th class="num">Mortgage</th><th class="num">Equity</th></tr></thead>
        <tbody>${w.residences.map((p) => `<tr>
          <td><b>${esc(p.type)}</b><div class="rp-note">${esc(p.location)}</div></td>
          <td class="num">${fmt$(p.value)}</td>
          <td class="num">${p.mortgage ? fmt$(p.mortgage) : "—"}</td>
          <td class="num">${fmt$(p.value - p.mortgage)}</td>
        </tr>`).join("")}</tbody>
      </table>` : ""}
      ${w.liabilities.length ? `<h4 class="rp-eyebrow">Liabilities</h4>
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Obligation</th><th class="num">Balance</th><th class="num">Rate</th><th>Matures</th></tr></thead>
        <tbody>${w.liabilities.map((l) => `<tr>
          <td>${esc(l.label)}</td><td class="num">${fmt$(l.balance)}</td>
          <td class="num">${fmtPct(l.rate * 100, 2)}</td><td>${esc(l.matures)}</td>
        </tr>`).join("")}</tbody>
      </table>` : `<div class="rp-note">No debt outstanding.</div>`}`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("What is coming", `
      <div class="rp-tl">
        ${w.events.map((e) => `<div class="rp-tl-item ${e.kind === "past" ? "done" : ""}">
          <div class="t">${esc(e.title)} <span class="rp-note" style="font-weight:400">&middot; ${fmtDate(e.date)}</span></div>
          <div class="d">${esc(e.note)}</div>
        </div>`).join("")}
      </div>`, { k: "Life events" })}

    <div>
      ${panel("Cash needs, next twelve months", w.cashNeeds.length ? `
        <table class="demo-tbl" style="width:100%">
          <thead><tr><th>Purpose</th><th>When</th><th class="num">Amount</th></tr></thead>
          <tbody>${w.cashNeeds.map((c) => `<tr>
            <td>${esc(c.purpose)}</td><td>${esc(c.when)}</td><td class="num">${fmt$(c.amount)}</td>
          </tr>`).join("")}</tbody>
        </table>
        <div class="rp-note" style="margin-top:10px">Known cash needs are reserved out of short duration
        rather than raised from equities, so a distribution never forces a sale into weakness.</div>`
        : gate("No scheduled cash needs", "Nothing is drawing on the portfolio in the next year."))}

      <div style="margin-top:22px">
        ${panel("Entities and insurance", `
          ${w.entities.length ? `<h4 class="rp-eyebrow">Entities</h4>
          <table class="demo-tbl" style="width:100%;margin-bottom:14px">
            <tbody>${w.entities.map((e) => `<tr>
              <td><b>${esc(e.name)}</b><div class="rp-note">${esc(e.role)}</div></td>
              <td class="num">${fmt$(e.value)}</td></tr>`).join("")}</tbody>
          </table>` : ""}
          ${w.insurance.length ? `<h4 class="rp-eyebrow">Insurance</h4>
          <table class="demo-tbl" style="width:100%">
            <tbody>${w.insurance.map((i) => `<tr>
              <td><b>${esc(i.type)}</b><div class="rp-note">${esc(i.carrier)} &middot; ${esc(i.note)}</div></td>
              <td class="num">${fmt$(i.benefit)}</td></tr>`).join("")}</tbody>
          </table>` : `<div class="rp-note">No policies on file.</div>`}`)}
      </div>
    </div>
  </div>`;
}

/* ---------------- Performance ---------------- */
function hhPerf(h, w, r, bench) {
  const periods = [
    ["Month to date", r.mtd, null],
    ["Quarter to date", r.qtd, null],
    ["Year to date", r.ytd, bench.ytd],
    ["One year", r.y1, bench.y1],
    ["Three years, annualised", r.y3, bench.y3],
    ["Since inception, annualised", r.itd, bench.y3],
  ];
  const cal = [2023, 2024, 2025].map((y, i) => {
    const slice = MODEL_RETURNS[h.model].monthly.slice(i * 12, i * 12 + 12);
    return [y, +(cumulative(slice) * 100).toFixed(2)];
  });
  return `
  <div class="demo-grid demo-two">
    ${panel("Returns", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Period</th><th class="num">Net of fees</th><th class="num">Gross</th>
          <th class="num">Benchmark</th><th class="num">Excess</th></tr></thead>
        <tbody>${periods.map((p) => `<tr>
          <td>${esc(p[0])}</td>
          <td class="num">${ret(p[1])}</td>
          <td class="num">${p[0].indexOf("Three") === 0 ? ret(r.y3gross) : "—"}</td>
          <td class="num">${p[2] == null ? "—" : ret(p[2])}</td>
          <td class="num">${p[2] == null ? "—" : ret(p[1] - p[2])}</td>
        </tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Time-weighted returns. Net figures deduct the household's own
      effective fee rate of ${fmtBps(effectiveRate(h.mv) * 100)}. The benchmark is the weighted return of the
      market index behind each asset class in the ${esc(h.modelName)} policy.</div>`,
      { k: "As of " + fmtDate(RP.asOf) })}

    ${panel("Growth of $100", `<div class="rp-chart" style="height:180px"><canvas id="growthChart"></canvas></div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Calendar years", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Year</th><th class="num">Return</th></tr></thead>
        <tbody>${cal.map((c) => `<tr><td>${c[0]}</td><td class="num">${ret(c[1])}</td></tr>`).join("")}
          <tr><td>2026 year to date</td><td class="num">${ret(r.ytd)}</td></tr></tbody>
      </table>`)}

    ${panel("Contribution to return", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Asset class</th><th class="num">Weight</th><th class="num">Return</th>
          <th class="num">Contribution</th></tr></thead>
        <tbody>${allocationOf(householdPositions(h.id)).map((a) => {
          const q = IDX[AC[a.id].bench] || ALT_BENCH.find((x) => x.code === AC[a.id].bench);
          const cls = q && q.ytd != null ? q.ytd : AC[a.id].er;
          return `<tr><td>${esc(a.label)}</td>
            <td class="num">${a.actualPct.toFixed(1)}%</td>
            <td class="num">${ret(cls, 1)}</td>
            <td class="num">${ret((a.actualPct / 100) * cls, 2)}</td></tr>`;
        }).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Weight multiplied by the asset class return, year to date.
      Contributions sum to the portfolio's gross return before manager selection and fees.</div>`)}
  </div>`;
}

/* ---------------- Allocation & IPS ---------------- */
function hhIps(h, w, r, bench) {
  const alloc = allocationOf(householdPositions(h.id));
  const key = "ips-" + h.id;
  return `
  <div class="demo-grid demo-two">
    ${panel("Current against policy", `
      <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:0 0 160px"><div class="rp-chart" style="height:160px"><canvas id="allocChart"></canvas></div></div>
        <div style="flex:1 1 300px;min-width:0">${allocRows(householdPositions(h.id))}</div>
      </div>
      <div class="rp-note" style="margin-top:12px">The band is the tighter of twenty per cent relative and four
      points absolute. ${isDrifted(alloc)
        ? "This portfolio has left its band and appears on the rebalance queue."
        : "Every sleeve is inside its band."}</div>`)}

    ${panel("Investment policy statement", `
      <dl class="rp-dl">
        <dt>Strategy</dt><dd>${esc(h.modelName)}</dd>
        <dt>Risk profile</dt><dd>${esc(h.riskProfile)}</dd>
        <dt>Expected return</dt><dd>${fmtPct(MODEL_RETURNS[h.model].er)}</dd>
        <dt>Expected volatility</dt><dd>${fmtPct(MODEL_RETURNS[h.model].vol)}</dd>
        <dt>Distribution rate</dt><dd>${w.annualDraw ? fmtPct(w.distributionRate * 100, 1) : "None"}</dd>
        <dt>Liquidity requirement</dt><dd>${fmt$(Math.max(w.annualDraw, h.mv * 0.02))} held in cash and short duration</dd>
        <dt>Alternatives permitted</dt><dd>${h.qualified ? "Yes — qualified purchaser" : "No"}</dd>
        <dt>Rebalancing</dt><dd>Tolerance band, reviewed monthly</dd>
        <dt>Tax management</dt><dd>${MODEL[h.model].id === "TAX" ? "Direct indexing with continuous harvesting" : "Lot-level selection and asset location"}</dd>
        <dt>Last reviewed</dt><dd>${fmtDate(h.ipsReviewed)}</dd>
      </dl>
      <div class="rp-note" style="margin-top:12px">${esc(MODEL[h.model].desc)}</div>`,
      { k: "Adopted policy" })}
  </div>

  <div style="margin-top:22px">
    ${panel("Policy change approval", `
      ${approvalChain(key, [
        { role: "advisor1", label: "Adviser drafts", note: "Proposes the change and the reason" },
        { role: "cio", label: "CIO review", note: "Confirms the change is consistent with the models" },
        { role: "client", label: "Client signature", note: "Adopts the revised policy" },
      ], { title: "Investment policy statement — adoption" })}
      <div class="rp-note">A policy change cannot reach the client without the CIO's review, and cannot take
      effect until the client has signed. Sign in as each role to advance the chain.</div>`)}
  </div>`;
}

/* ---------------- Holdings & tax lots ---------------- */
function hhHoldings(h) {
  const pos = householdPositions(h.id).sort((a, b) => b.value - a.value);
  const lots = householdLots(h.id);
  const gain = lots.reduce((s, l) => s + l.gain, 0);
  const unreal = lots.filter((l) => l.gain < 0).reduce((s, l) => s + l.gain, 0);
  return `
  <div class="demo-kpis" style="margin-bottom:20px">
    <div class="demo-kpi"><div class="v">${pos.length}</div><div class="l">Positions</div>
      <div class="s">${lots.length} tax lots</div></div>
    <div class="demo-kpi"><div class="v">${money(gain)}</div><div class="l">Unrealised gain</div>
      <div class="s">Across taxable registrations</div></div>
    <div class="demo-kpi"><div class="v">${money(unreal)}</div><div class="l">Harvestable losses</div>
      <div class="s">${lots.filter((l) => l.gain < 0).length} lots below basis</div></div>
    <div class="demo-kpi"><div class="v">${lots.filter((l) => l.washSale).length}</div><div class="l">Wash-sale conflicts</div>
      <div class="s">Blocked from harvesting</div></div>
  </div>

  ${panel("Holdings", `
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Fund</th><th>Asset class</th><th>Registration</th><th class="num">Value</th>
          <th class="num">Cost basis</th><th class="num">Gain</th><th class="num">Weight</th></tr></thead>
        <tbody>${pos.map((p) => {
          const pl = LOTS.filter((l) => l.posId === p.id);
          const basis = pl.reduce((s, l) => s + l.basis, 0);
          return `<tr class="rp-click" onclick="location.href='/wealthmanagement/funds/fund/?id=${p.fundId}'">
            <td><b>${esc(p.fund)}</b><div class="rp-note">${esc(p.code)} &middot; ${esc(p.vehicle)}</div></td>
            <td>${esc(p.assetClassLabel)}</td>
            <td class="dim">${esc(ACCT[p.acctId].registration)}</td>
            <td class="num">${fmt$(p.value)}</td>
            <td class="num">${p.taxable ? fmt$(basis) : "—"}</td>
            <td class="num">${p.taxable ? money(p.value - basis) : "—"}</td>
            <td class="num">${((p.value / h.mv) * 100).toFixed(2)}%</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Cost basis is shown only for taxable registrations.
    Click any row for the fund's tearsheet.</div>`, { k: fmt$(h.mv) + " total" })}

  <div style="margin-top:22px">
    ${panel("Tax lots below basis", `
      <div class="rp-scroll" style="max-height:360px">
        <table class="demo-tbl">
          <thead><tr><th>Fund</th><th>Acquired</th><th>Term</th><th class="num">Value</th>
            <th class="num">Basis</th><th class="num">Loss</th><th>Harvestable</th></tr></thead>
          <tbody>${lots.filter((l) => l.gain < 0).sort((a, b) => a.gain - b.gain).slice(0, 40).map((l) => `<tr>
            <td>${esc(l.fund)}</td><td>${fmtDateShort(l.acquired)}</td><td>${esc(l.term)}</td>
            <td class="num">${fmt$(l.value)}</td><td class="num">${fmt$(l.basis)}</td>
            <td class="num">${money(l.gain)}</td>
            <td>${l.washSale ? pill("Wash sale", "red") : pill("Yes", "green")}</td>
          </tr>`).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">Lots flagged as a wash sale were replaced within thirty days
      and cannot be harvested until the window closes.</div>`)}
  </div>`;
}

/* ---------------- Activity ---------------- */
function hhActivity(h, w) {
  const txns = TRANSACTIONS.filter((t) => t.hhId === h.id).slice(0, 60);
  const byType = {};
  TRANSACTIONS.filter((t) => t.hhId === h.id).forEach((t) => {
    byType[t.type] = (byType[t.type] || 0) + t.amount;
  });
  return `
  <div class="demo-grid demo-two">
    ${panel("Activity by type, three years", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Type</th><th class="num">Net amount</th></tr></thead>
        <tbody>${Object.keys(byType).sort((a, b) => Math.abs(byType[b]) - Math.abs(byType[a]))
          .map((k) => `<tr><td>${esc(k)}</td><td class="num">${money(byType[k])}</td></tr>`).join("")}</tbody>
      </table>`)}

    ${panel("Distribution plan", `
      ${w.annualDraw ? `<dl class="rp-dl">
        <dt>Annual distribution</dt><dd>${fmt$(w.annualDraw)}</dd>
        <dt>Rate on assets</dt><dd>${fmtPct(w.distributionRate * 100, 2)}</dd>
        <dt>Frequency</dt><dd>Quarterly</dd>
        <dt>Funded from</dt><dd>Cash and short duration</dd>
        <dt>Years of cover held in cash</dt><dd>${(householdPositions(h.id)
          .filter((p) => p.assetClass === "CASH").reduce((s, p) => s + p.value, 0) / w.annualDraw).toFixed(1)}</dd>
      </dl>
      <div class="rp-note" style="margin-top:10px">Holding the next year of distributions in cash means a
      scheduled withdrawal never forces a sale into a falling market.</div>`
      : gate("No distributions", "This household is still accumulating.")}`)}
  </div>

  <div style="margin-top:22px">
    ${panel("Transactions", `
      <div class="rp-scroll">
        <table class="demo-tbl">
          <thead><tr><th>Date</th><th>Type</th><th>Registration</th><th class="num">Amount</th></tr></thead>
          <tbody>${txns.map((t) => `<tr>
            <td>${fmtDateShort(t.date)}</td><td>${esc(t.type)}</td>
            <td class="dim">${esc(t.registration)}</td>
            <td class="num">${money(t.amount)}</td></tr>`).join("")}</tbody>
        </table>
      </div>`, { k: "Most recent 60" })}
  </div>`;
}

/* ---------------- Private markets ---------------- */
function hhPrivate(h) {
  const cs = COMMITMENTS.filter((c) => c.hhId === h.id);
  if (!cs.length) {
    return panel("Private markets", gate("No private commitments",
      h.qualified ? "This household is eligible but has not yet committed."
                  : "This household does not meet the qualified purchaser threshold."));
  }
  const commit = cs.reduce((s, c) => s + c.commitment, 0);
  const called = cs.reduce((s, c) => s + c.called, 0);
  const nav = cs.reduce((s, c) => s + c.nav, 0);
  const dist = cs.reduce((s, c) => s + c.distributed, 0);
  const calls = CAPITAL_CALLS.filter((c) => c.hhId === h.id);
  return `
  <div class="demo-kpis" style="margin-bottom:20px">
    <div class="demo-kpi"><div class="v">${fmtM(commit)}</div><div class="l">Committed</div>
      <div class="s">${cs.length} funds</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(called)}</div><div class="l">Called</div>
      <div class="s">${fmtPct((called / commit) * 100, 0)} of commitments</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(commit - called)}</div><div class="l">Uncalled</div>
      <div class="s">Reserved in short duration</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(nav)}</div><div class="l">Current value</div>
      <div class="s">Latest quarterly marks</div></div>
    <div class="demo-kpi"><div class="v">${fmtX((nav + dist) / called)}</div><div class="l">TVPI</div>
      <div class="s">${fmtX(dist / called)} distributed</div></div>
    <div class="demo-kpi"><div class="v">${calls.length}</div><div class="l">Calls scheduled</div>
      <div class="s">Next ${calls.length ? fmtDate(calls[0].due) : "—"}</div></div>
  </div>

  ${panel("Commitments", `
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Fund</th><th>Vintage</th><th class="num">Commitment</th><th class="num">Called</th>
          <th class="num">Distributed</th><th class="num">NAV</th><th class="num">TVPI</th>
          <th class="num">DPI</th><th class="num">Net IRR</th></tr></thead>
        <tbody>${cs.map((c) => `<tr class="rp-click" onclick="location.href='/wealthmanagement/funds/fund/?id=${c.fundId}'">
          <td><b>${esc(c.fund)}</b><div class="rp-note">${esc(c.manager)}</div></td>
          <td>${c.vintage}</td>
          <td class="num">${fmt$(c.commitment)}</td>
          <td class="num">${fmt$(c.called)}</td>
          <td class="num">${fmt$(c.distributed)}</td>
          <td class="num">${fmt$(c.nav)}</td>
          <td class="num">${fmtX(c.tvpi)}</td>
          <td class="num">${fmtX(c.dpi)}</td>
          <td class="num">${ret(c.irr, 1)}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>`)}

  ${calls.length ? `<div style="margin-top:22px">${panel("Upcoming capital calls", `
    <table class="demo-tbl" style="width:100%">
      <thead><tr><th>Fund</th><th>Due</th><th class="num">Amount</th><th>Source</th><th>Status</th></tr></thead>
      <tbody>${calls.map((c) => `<tr>
        <td>${esc(c.fund)}</td><td>${fmtDate(c.due)}</td>
        <td class="num">${fmt$(c.amount)}</td><td class="dim">${esc(c.source)}</td>
        <td>${statusPill(c.status)}</td></tr>`).join("")}</tbody>
    </table>
    ${approvalChain("call-" + h.id, [
      { role: "trading", label: "Notice received", note: "Logged and reconciled to the commitment" },
      { role: "advisor1", label: "Source confirmed", note: "Adviser confirms where the cash comes from" },
      { role: "client", label: "Client authorises", note: "Wire authorisation" },
      { role: "trading", label: "Wire released", note: "Callback verification completed" },
    ], { title: "Capital call funding" })}`)}</div>` : ""}`;
}

/* ---------------- Planning ---------------- */
function hhPlanning(h, w) {
  const goals = PLANNING_GOALS.filter((g) => g.hhId === h.id);
  return `
  <div class="demo-grid demo-two">
    ${panel("Goals", goals.length ? `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Goal</th><th>Priority</th><th class="num">Target</th>
          <th class="num">Horizon</th><th class="num">Funded</th></tr></thead>
        <tbody>${goals.map((g) => `<tr>
          <td><b>${esc(g.goal)}</b></td>
          <td>${pill(g.priority, g.priority === "Essential" ? "blue" : g.priority === "Important" ? "amber" : "gray")}</td>
          <td class="num">${fmt$(g.target)}</td><td class="num">${g.horizon} yrs</td>
          <td class="num"><b class="bm-ret ${g.funded >= 1 ? "up" : "dn"}">${Math.round(g.funded * 100)}%</b></td>
        </tr>`).join("")}</tbody>
      </table>` : gate("No goals recorded", "Goals are set at the next planning session."),
      { k: "Planning", chips: srcChip("plan") })}

    ${panel("Retirement position", `
      <dl class="rp-dl">
        <dt>Portfolio value</dt><dd>${fmt$(h.mv)}</dd>
        <dt>Annual spending need</dt><dd>${fmt$(w.annualDraw || MC_DEFAULTS.spending)}</dd>
        <dt>Withdrawal rate</dt><dd>${fmtPct((w.annualDraw || MC_DEFAULTS.spending) / h.mv * 100, 2)}</dd>
        <dt>Expected return</dt><dd>${fmtPct(MODEL_RETURNS[h.model].er)}</dd>
        <dt>Expected volatility</dt><dd>${fmtPct(MODEL_RETURNS[h.model].vol)}</dd>
        <dt>Real return after inflation</dt><dd>${fmtPct(MODEL_RETURNS[h.model].er - 2.6)}</dd>
      </dl>
      <div class="rp-note" style="margin-top:12px">
        At a ${fmtPct((w.annualDraw || MC_DEFAULTS.spending) / h.mv * 100, 2)} withdrawal rate against an
        expected real return of ${fmtPct(MODEL_RETURNS[h.model].er - 2.6)}, the portfolio's purchasing power is
        ${(w.annualDraw || MC_DEFAULTS.spending) / h.mv * 100 < MODEL_RETURNS[h.model].er - 2.6
          ? "expected to grow." : "expected to erode over a long horizon."}
        <a href="/wealthmanagement/planning/?hh=${h.id}" style="color:var(--color-blue)">Run the full projection &rarr;</a>
      </div>`)}
  </div>`;
}

/* ---------------- Documents ---------------- */
function hhDocuments(h) {
  const docs = DOCUMENTS.filter((d) => d.hhId === h.id);
  return panel("Documents", `
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Document</th><th>Category</th><th>Period</th><th>Date</th>
          <th>Status</th><th class="num">Views</th></tr></thead>
        <tbody>${docs.map((d) => `<tr>
          <td><b>${esc(d.type)}</b></td><td>${esc(d.category)}</td>
          <td>${esc(d.period)}</td><td>${fmtDateShort(d.date)}</td>
          <td>${statusPill(d.status)}</td><td class="num">${d.accessed}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">${docs.length} documents on file. Retention follows the
    books-and-records rule; nothing is deleted before its class retention period expires.</div>`,
    { k: docs.length + " documents" });
}

/* ---------------- Fees ---------------- */
function hhFees(h) {
  if (isExternal()) {
    const annual = annualFee(h.mv);
    return panel("Your fee", `
      <dl class="rp-dl">
        <dt>Assets billed</dt><dd>${fmt$(h.mv)}</dd>
        <dt>Annual fee</dt><dd>${fmt$(annual)}</dd>
        <dt>Effective rate</dt><dd>${fmtBps(effectiveRate(h.mv) * 100)}</dd>
        <dt>Billed</dt><dd>Quarterly in arrears</dd>
        <dt>This quarter</dt><dd>${fmt$(annual / 4)}</dd>
      </dl>
      <div class="rp-note" style="margin-top:12px">Your fee covers investment management, financial planning,
      tax coordination and everything your team does. There are no commissions, no proprietary products and no
      revenue from anyone but you.</div>`, { k: "Fee statement" });
  }
  const tiers = RP.feeSchedule.map((t) => {
    const slice = Math.max(0, Math.min(h.mv, t.upTo == null ? h.mv : t.upTo) - t.from);
    return { label: t.label, rate: t.rate, slice, fee: slice * t.rate };
  }).filter((t) => t.slice > 0);
  const annual = annualFee(h.mv);
  return `
  <div class="demo-grid demo-two">
    ${panel("Fee calculation", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Tier</th><th class="num">Rate</th><th class="num">Assets in tier</th>
          <th class="num">Annual fee</th></tr></thead>
        <tbody>${tiers.map((t) => `<tr>
          <td>${esc(t.label)}</td><td class="num">${fmtPct(t.rate * 100, 2)}</td>
          <td class="num">${fmt$(t.slice)}</td><td class="num">${fmt$(t.fee)}</td>
        </tr>`).join("")}</tbody>
        <tfoot><tr style="font-weight:700"><td>Total</td>
          <td class="num">${fmtBps(effectiveRate(h.mv) * 100)}</td>
          <td class="num">${fmt$(h.mv)}</td><td class="num">${fmt$(annual)}</td></tr></tfoot>
      </table>
      <div class="rp-note" style="margin-top:10px">Billed quarterly in arrears at ${fmt$(annual / 4)} per quarter.
      The schedule is the only place a fee is ever computed; nothing here is typed in.</div>`,
      { k: "Tiered schedule", chips: srcChip("pa") })}

    ${panel("Relationship economics", `
      <dl class="rp-dl">
        <dt>Annual revenue</dt><dd>${fmt$(annual)}</dd>
        <dt>Effective rate</dt><dd>${fmtBps(effectiveRate(h.mv) * 100)}</dd>
        <dt>Service tier</dt><dd>${esc(h.tier)}</dd>
        <dt>Meetings per year</dt><dd>${(RP.serviceTiers.find((t) => t.id === h.tier) || {}).meetings || "—"}</dd>
        <dt>Estimated service cost</dt><dd>${fmt$(Math.round(annual * (h.segment === "Emerging" ? 0.62 : 0.34)))}</dd>
        <dt>Contribution margin</dt><dd>${fmtPct((1 - (h.segment === "Emerging" ? 0.62 : 0.34)) * 100, 0)}</dd>
      </dl>
      <div class="rp-note" style="margin-top:12px">Service cost is modelled from the tier's meeting cadence and
      team assignment. Emerging-wealth relationships carry a thinner margin, which is why the tier caps the
      service commitment rather than the adviser absorbing it.</div>`, { k: "Internal" })}
  </div>`;
}

/* ---------------- Relationship ---------------- */
function hhNotes(h, w) {
  const ms = MEETINGS.filter((m) => m.hhId === h.id);
  return `
  <div class="demo-grid demo-two">
    ${panel("Meeting history", ms.length ? `
      <div class="rp-tl">
        ${ms.map((m) => `<div class="rp-tl-item ${m.upcoming ? "" : "done"}">
          <div class="t">${esc(m.kind)} &middot; ${fmtDate(m.date)}</div>
          <div class="d">${esc(m.location)} &middot; ${esc(m.attendees)}<br>${esc(m.notes || "Preparation pack ready.")}</div>
        </div>`).join("")}
      </div>` : gate("No meetings logged", "Nothing scheduled or recorded for this household."),
      { chips: srcChip("crm") })}

    ${panel("Open action items", `
      ${(() => {
        const acts = ms.flatMap((m) => m.actions.map((a) => Object.assign({}, a, { from: m.kind, date: m.date })));
        return acts.length ? `<table class="demo-tbl" style="width:100%">
          <thead><tr><th>Action</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>${acts.map((a) => `<tr>
            <td>${esc(a.text)}<div class="rp-note">From the ${esc(a.from.toLowerCase())} on ${fmtDateShort(a.date)}</div></td>
            <td>${esc(a.owner)}</td><td>${fmtDateShort(a.due)}</td>
            <td>${a.done ? pill("Complete", "green") : pill("Open", "amber")}</td>
          </tr>`).join("")}</tbody></table>`
          : gate("Nothing outstanding", "All action items from prior meetings are closed.");
      })()}`)}
  </div>`;
}

/* ---------------- shared bits ---------------- */
function allocRows(positions) {
  return allocationOf(positions).sort((a, b) => b.actualPct - a.actualPct).map((a) => `
    <div class="rp-alloc">
      <span class="lbl">${esc(a.label)}</span>
      <span class="rp-track" title="Target ${a.targetPct.toFixed(1)}%">
        <i style="width:${Math.min(100, a.actualPct * 2.4)}%"></i>
        <u style="left:${Math.min(100, a.targetPct * 2.4)}%"></u></span>
      <span class="num rp-hide-s">${fmtM(a.value)}</span>
      <span class="num">${a.actualPct.toFixed(1)}%</span>
      <span class="rp-drift ${Math.abs(a.drift) > a.tolerance ? "out" : ""}">${a.drift >= 0 ? "+" : ""}${a.drift.toFixed(1)}</span>
    </div>`).join("");
}

function drawHhAlloc() {
  const el = document.getElementById("allocChart");
  if (!el || typeof Chart === "undefined") return;
  const alloc = allocationOf(householdPositions(hhId)).sort((a, b) => b.actualPct - a.actualPct);
  new Chart(el, {
    type: "doughnut",
    data: { labels: alloc.map((a) => a.label),
      datasets: [{ data: alloc.map((a) => +a.actualPct.toFixed(2)),
        backgroundColor: ["#1f3d5c", "#2c5580", "#4a7ba8", "#7fa3c9", "#a8c2d9", "#94793f",
                          "#b39a63", "#8a2f3f", "#a85a68", "#c78d97", "#6d7885", "#9aa3ad"],
        borderWidth: 1, borderColor: getComputedStyle(document.body).backgroundColor }] },
    options: { cutout: "62%", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (c) => c.label + ": " + c.parsed.toFixed(1) + "%" } } } },
  });
}

function drawHhGrowth() {
  const el = document.getElementById("growthChart");
  if (!el || typeof Chart === "undefined") return;
  const h = HH[hhId];
  const r = householdReturns(hhId);
  const bm = MODEL_RETURNS[h.model].monthly;
  const bmGrowth = bm.reduce((a, x) => { a.push(a[a.length - 1] * (1 + (x - MODEL_RETURNS[h.model].active / 12) / 100)); return a; }, [100]);
  new Chart(el, {
    type: "line",
    data: { labels: ["Start"].concat(MONTHS.map(fmtMonth)),
      datasets: [
        { label: h.name + ", net", data: r.growth.map((v) => +v.toFixed(2)),
          borderColor: "#1f3d5c", backgroundColor: "rgba(31,61,92,.10)", borderWidth: 2, fill: true, pointRadius: 0, tension: 0.25 },
        { label: "Blended policy benchmark", data: bmGrowth.map((v) => +v.toFixed(2)),
          borderColor: "#94793f", borderWidth: 1.5, borderDash: [5, 3], fill: false, pointRadius: 0, tension: 0.25 },
      ] },
    options: { responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { labels: { boxWidth: 10, font: { size: 11 } } } },
      scales: { x: { ticks: { maxTicksLimit: 7, font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { font: { size: 10 } }, grid: { color: "rgba(128,128,128,.14)" } } } },
  });
}
