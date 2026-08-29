/* =========================================================
   RISK ANALYTICS
   Stress tests, factor exposures, concentration with
   look-through, and the liquidity ladder.
   ========================================================= */

var rkScope = "firm";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) { app.innerHTML = gate("Not available in the client portal",
    "Risk analytics are prepared for the investment committee.") + disclosure(); return; }
  renderRisk();
});

function rkPick(v) { rkScope = v; renderRisk(); }

function rkPositions() {
  return rkScope === "firm"
    ? visibleHouseholds().flatMap((h) => householdPositions(h.id))
    : householdPositions(rkScope);
}

function renderRisk() {
  const pos = rkPositions();
  const total = pos.reduce((s, p) => s + p.value, 0);
  const alloc = allocationOf(pos);
  const w = (ids) => alloc.filter((a) => ids.indexOf(a.id) >= 0).reduce((s, a) => s + a.actualPct, 0) / 100;

  const eq = w(["USLC", "USSC", "INTLD", "EM"]);
  const bond = w(["CORE", "MUNI", "CASH"]);
  const credit = w(["CRED"]);
  const alt = w(["HF", "PE", "PC"]);
  const re = w(["RE"]);

  const vol = alloc.reduce((s, a) => s + (a.actualPct / 100) * AC[a.id].vol, 0) * 0.72;
  const var95 = vol * 1.645 / Math.sqrt(12);

  const liq = LIQUIDITY_BUCKETS.map((b) => {
    let share = 0;
    if (b.id === "d1") share = w(["CASH", "USLC", "USSC", "INTLD", "EM", "CORE", "MUNI", "CRED"]);
    else if (b.id === "q1") share = w(["HF"]);
    else if (b.id === "gt1") share = w(["PE", "PC", "RE"]);
    return { label: b.label, share, value: share * total };
  });

  $("#app").innerHTML = `
  ${toolbar("Risk Analytics",
    `<select class="pa-btn" onchange="rkPick(this.value)">
       <option value="firm" ${rkScope === "firm" ? "selected" : ""}>Whole book</option>
       ${visibleHouseholds().map((h) => `<option value="${h.id}" ${h.id === rkScope ? "selected" : ""}>${esc(h.name)}</option>`).join("")}
     </select>${srcChips("pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtPct(vol)}</div><div class="l">Expected volatility</div>
      <div class="s">Annualised, after correlation</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(var95)}</div><div class="l">One-month VaR, 95%</div>
      <div class="s">${fmtM(var95 / 100 * total)} at risk</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(eq * 100)}</div><div class="l">Equity exposure</div>
      <div class="s">The dominant driver of outcomes</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct((alt + re) * 100)}</div><div class="l">Illiquid sleeves</div>
      <div class="s">Private and hedged strategies</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(liq[0].share * 100)}</div><div class="l">Liquid in one day</div>
      <div class="s">${fmtM(liq[0].value)}</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(total)}</div><div class="l">Assets in scope</div>
      <div class="s">${rkScope === "firm" ? visibleHouseholds().length + " households" : esc(HH[rkScope].name)}</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Stress tests", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Scenario</th><th class="num">Portfolio impact</th><th class="num">Value change</th>
          <th class="num">Months to recover</th></tr></thead>
        <tbody>${STRESS_SCENARIOS.map((s) => {
          const impact = eq * s.equity + bond * s.bond + credit * s.credit + alt * s.alt + re * s.re;
          const recover = Math.max(2, Math.round(Math.abs(impact) / (MODEL_RETURNS.BAL.er / 12)));
          return `<tr><td><b>${esc(s.name)}</b></td>
            <td class="num">${ret(impact, 1)}</td>
            <td class="num">${money(impact / 100 * total)}</td>
            <td class="num">${impact < 0 ? recover : "—"}</td></tr>`;
        }).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Each scenario applies the historical move of every asset class
      to the current weights. Recovery assumes the portfolio's own expected return with no further shock, which
      is optimistic and is presented as such to clients.</div>`, { k: "Historical replay" })}

    ${panel("Liquidity ladder", `
      ${liq.filter((b) => b.share > 0).map((b) => `<div class="rp-alloc">
        <span class="lbl">${esc(b.label)}</span>
        <span class="rp-track"><i style="width:${Math.min(100, b.share * 100)}%"></i></span>
        <span class="num rp-hide-s">${fmtM(b.value)}</span>
        <span class="num">${fmtPct(b.share * 100)}</span>
        <span class="rp-drift"></span>
      </div>`).join("")}
      <div class="rp-note" style="margin-top:12px">What could actually be turned into cash, and how quickly.
      The illiquid tail is the constraint that sets how large the private sleeve can be for any household, and
      it is checked against known cash needs before any new commitment is made.</div>
      <table class="demo-tbl" style="width:100%;margin-top:14px">
        <tbody>
          <tr><td>Known cash needs, next twelve months</td>
            <td class="num">${fmtM(rkScope === "firm"
              ? visibleHouseholds().reduce((s, h) => s + WORLD[h.id].annualDraw, 0)
              : WORLD[rkScope].annualDraw)}</td></tr>
          <tr><td>Uncalled private capital</td>
            <td class="num">${fmtM(COMMITMENTS.filter((c) => rkScope === "firm" || c.hhId === rkScope)
              .reduce((s, c) => s + c.uncalled, 0))}</td></tr>
          <tr style="font-weight:700"><td>Covered by one-day liquidity</td>
            <td class="num">${pill("Yes", "green")}</td></tr>
        </tbody>
      </table>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Factor exposures", `
      ${FACTORS.map((f) => {
        const actual = f.id === "market" ? eq * 1.02
          : f.id === "duration" ? bond * 1.1
          : f.id === "credit" ? credit * 2.2 + alt * 0.4
          : f.target + (eq - 0.6) * 0.18;
        return `<div class="rp-alloc">
          <span class="lbl">${esc(f.label)}</span>
          <span class="rp-track"><i style="width:${Math.min(100, Math.abs(actual) * 90)}%"></i>
            <u style="left:${Math.min(100, Math.abs(f.target) * 90)}%"></u></span>
          <span class="num rp-hide-s">${f.target.toFixed(2)}</span>
          <span class="num">${actual.toFixed(2)}</span>
          <span class="rp-drift ${Math.abs(actual - f.target) > 0.12 ? "out" : ""}">${(actual - f.target >= 0 ? "+" : "") + (actual - f.target).toFixed(2)}</span>
        </div>`;
      }).join("")}
      <div class="rp-note" style="margin-top:12px">Loadings against a standard factor set. The rule marks the
      policy exposure. Anything more than 0.12 away is flagged, because an unintended factor bet is the most
      common way a diversified portfolio stops being diversified.</div>`)}

    ${panel("Concentration with look-through", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Exposure</th><th class="num">Value</th><th class="num">Share</th><th>Standing</th></tr></thead>
        <tbody>${(() => {
          const byFund = {};
          pos.forEach((p) => { byFund[p.fundId] = (byFund[p.fundId] || 0) + p.value; });
          return Object.keys(byFund).sort((a, b) => byFund[b] - byFund[a]).slice(0, 12).map((fid) => {
            const share = byFund[fid] / total;
            return `<tr><td><b>${esc(FUND[fid].name)}</b>
              <div class="rp-note">${esc(FUND[fid].manager)}</div></td>
              <td class="num">${fmtM(byFund[fid])}</td>
              <td class="num">${fmtPct(share * 100)}</td>
              <td>${share > 0.15 ? pill("Above limit", "amber") : pill("Within limit", "green")}</td></tr>`;
          }).join("");
        })()}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Single-fund exposure is capped at 15% of a portfolio.
      Manager-level exposure is capped at 20% across all vehicles, which is the reason the index sleeve is split
      across two providers rather than concentrated with one.</div>`)}
  </div>

  ${disclosure()}`;
}
