/* =========================================================
   FUND RESEARCH
   Seventy funds across twenty-five vehicle types. Screener,
   scorecards, the approved list, and the watch-list reasons.
   ========================================================= */

var fnAc = "All", fnVeh = "All", fnStatus = "All", fnLiq = "All", fnSort = "aum", fnQ = "";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) {
    app.innerHTML = gate("Not available in the client portal",
      "Fund research is prepared for the investment committee.") + disclosure();
    return;
  }
  renderFunds();
});

function fnSet(k, v) {
  ({ ac: () => (fnAc = v), veh: () => (fnVeh = v), st: () => (fnStatus = v),
     liq: () => (fnLiq = v), sort: () => (fnSort = v), q: () => (fnQ = v) })[k]();
  renderFunds(k === "q");
}

function fnList() {
  let l = FUNDS.slice();
  if (fnAc !== "All") l = l.filter((f) => f.ac === fnAc);
  if (fnVeh !== "All") l = l.filter((f) => f.vehicle === fnVeh);
  if (fnStatus !== "All") l = l.filter((f) => f.status === fnStatus);
  if (fnLiq !== "All") l = l.filter((f) => (fnLiq === "Liquid" ? !f.isPrivate && f.liquidity !== "None" : f.isPrivate));
  if (fnQ) {
    const q = fnQ.toLowerCase();
    l = l.filter((f) => (f.name + " " + f.manager + " " + f.strategy + " " + f.code).toLowerCase().indexOf(q) >= 0);
  }
  return l.sort({
    aum: (a, b) => b.aum - a.aum,
    score: (a, b) => (b.scoreAvg || 0) - (a.scoreAvg || 0),
    y3: (a, b) => (b.y3 == null ? -99 : b.y3) - (a.y3 == null ? -99 : a.y3),
    fee: (a, b) => a.mgmtFee - b.mgmtFee,
    name: (a, b) => (a.name < b.name ? -1 : 1),
  }[fnSort]);
}

function renderFunds(keepFocus) {
  const l = fnList();
  const sel = (k, val, opts) => `<select class="pa-btn" onchange="fnSet('${k}',this.value)">
    ${opts.map((o) => `<option value="${esc(o[0])}" ${o[0] === val ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select>`;

  $("#app").innerHTML = `
  ${toolbar("Fund Research",
    `${sel("ac", fnAc, [["All", "All asset classes"]].concat(ASSET_CLASSES.map((a) => [a.id, a.label])))}
     ${sel("veh", fnVeh, [["All", "All vehicles"]].concat(VEHICLES.map((v) => [v.id, v.label])))}
     ${sel("st", fnStatus, [["All", "All statuses"], ["Approved", "Approved"], ["Watch", "Watch"], ["Under Review", "Under review"]])}
     ${sel("liq", fnLiq, [["All", "Liquid and private"], ["Liquid", "Liquid only"], ["Private", "Private only"]])}
     ${sel("sort", fnSort, [["aum", "Sort: fund size"], ["score", "Sort: Rosemont score"], ["y3", "Sort: three-year return"], ["fee", "Sort: fee"], ["name", "Sort: name"]])}
     <input class="demo-search" id="fnq" placeholder="Search funds, managers, strategies"
       value="${esc(fnQ)}" oninput="fnSet('q',this.value)">`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${l.length}</div><div class="l">Funds in view</div>
      <div class="s">of ${FUNDS.length} on the platform</div></div>
    <div class="demo-kpi"><div class="v">${[...new Set(l.map((f) => f.vehicle))].length}</div>
      <div class="l">Vehicle types</div><div class="s">of ${VEHICLES.length} covered</div></div>
    <div class="demo-kpi"><div class="v">${l.filter((f) => f.status === "Approved").length}</div>
      <div class="l">Approved</div><div class="s">Available for allocation</div></div>
    <div class="demo-kpi"><div class="v">${l.filter((f) => f.status === "Watch").length}</div>
      <div class="l">On watch</div><div class="s">No new allocations</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(l.reduce((s, f) => s + f.mgmtFee, 0) / (l.length || 1), 2)}</div>
      <div class="l">Average management fee</div><div class="s">Excluding performance fees</div></div>
    <div class="demo-kpi"><div class="v">${[...new Set(l.map((f) => f.manager))].length}</div>
      <div class="l">Managers</div><div class="s">Across the selection</div></div>
  </div>

  ${panel("Screener", `
    <div class="rp-scroll" style="max-height:620px">
      <table class="demo-tbl">
        <thead><tr><th>Fund</th><th>Asset class</th><th>Vehicle</th><th class="num">Fund size</th>
          <th class="num">Minimum</th><th class="num">Mgmt fee</th><th class="num">Perf fee</th>
          <th class="num">1 yr</th><th class="num">3 yr</th><th class="num">Since inception</th>
          <th>Liquidity</th><th class="num">Score</th><th>Status</th></tr></thead>
        <tbody>${l.map((f) => `<tr class="rp-click" onclick="location.href='/wealthmanagement/funds/fund/?id=${f.id}'">
          <td><b>${esc(f.name)}</b><div class="rp-note">${esc(f.manager)} &middot; ${esc(f.code)}</div></td>
          <td class="dim">${esc(f.acLabel)}</td>
          <td class="dim">${esc(f.vehicleLabel)}</td>
          <td class="num">${f.aum ? fmtM(f.aum * 1e6) : "—"}</td>
          <td class="num">${f.min ? fmt$(f.min * 1000) : "None"}</td>
          <td class="num">${fmtPct(f.mgmtFee, 2)}</td>
          <td class="num">${f.perfFee ? fmtPct(f.perfFee, 1) : "—"}</td>
          <td class="num">${f.y1 == null ? "—" : ret(f.y1, 1)}</td>
          <td class="num">${f.y3 == null ? "—" : ret(f.y3, 1)}</td>
          <td class="num">${f.itd == null ? "—" : ret(f.itd, 1)}</td>
          <td class="dim">${esc(f.liquidity)}</td>
          <td class="num">${f.scoreAvg == null ? "—" : `<b>${f.scoreAvg.toFixed(1)}</b>`}</td>
          <td>${statusPill(f.status)}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Private funds show since-inception net IRR rather than a
    time-weighted return, because a drawdown structure makes a time-weighted number meaningless.
    Click any row for the tearsheet.</div>`, { k: l.length + " funds" })}

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Watch list", `
      ${FUNDS.filter((f) => f.status === "Watch" || f.status === "Under Review").map((f) => `
        <div style="padding:11px 0;border-bottom:1px solid var(--color-border-subtle)">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap">
            <b><a href="/wealthmanagement/funds/fund/?id=${f.id}" style="color:var(--color-blue)">${esc(f.name)}</a></b>
            ${statusPill(f.status)}</div>
          <div class="rp-note" style="margin-top:4px">${esc(WATCH_NOTES[f.id] || "Under initial review; no allocation until the committee votes.")}</div>
        </div>`).join("")}
      <div class="rp-note" style="margin-top:12px">A fund on watch stays in existing portfolios but takes no new
      money. Removal from the watch list requires a fresh committee vote.</div>`,
      { k: "No new allocations" })}

    ${panel("Vehicle coverage", `
      <div class="rp-scroll" style="max-height:420px">
        <table class="demo-tbl">
          <thead><tr><th>Vehicle</th><th class="num">Funds</th><th>Liquidity</th><th>Qualification</th></tr></thead>
          <tbody>${VEHICLES.map((v) => {
            const n = FUNDS.filter((f) => f.vehicle === v.id).length;
            return `<tr><td><b>${esc(v.label)}</b></td><td class="num">${n}</td>
              <td class="dim">${esc(v.liquidity)}</td><td class="dim">${esc(v.qual)}</td></tr>`;
          }).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">Twenty-five vehicle types, from index funds and municipal
      ladders through interval funds, buyout partnerships, structured notes and insurance-dedicated wrappers.
      Qualification is checked against the registration before any allocation is permitted.</div>`)}
  </div>

  ${disclosure("Fund and manager names are invented. Attaching fabricated performance to a real fund would be misleading, so the universe is fictional end to end.")}`;

  if (keepFocus) { const q = document.getElementById("fnq"); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
}
