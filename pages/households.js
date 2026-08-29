/* =========================================================
   HOUSEHOLD BOOK
   The register behind the Client Book: every relationship as
   a row, filterable, sortable, and drillable.
   ========================================================= */

var hbSeg = "All", hbAdvisor = "All", hbTier = "All", hbCustodian = "All", hbSort = "mv";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) {
    app.innerHTML = gate("Not available in the client portal",
      "The household register is an internal view.") + disclosure();
    return;
  }
  renderBook();
});

function hbSet(k, v) { ({ seg: () => (hbSeg = v), adv: () => (hbAdvisor = v), tier: () => (hbTier = v),
  cust: () => (hbCustodian = v), sort: () => (hbSort = v) })[k](); renderBook(); }

function renderBook() {
  const all = visibleHouseholds();
  let list = all;
  if (hbSeg !== "All") list = list.filter((h) => h.segment === hbSeg);
  if (hbAdvisor !== "All") list = list.filter((h) => h.advisor === hbAdvisor);
  if (hbTier !== "All") list = list.filter((h) => h.tier === hbTier);
  if (hbCustodian !== "All") list = list.filter((h) => h.custodian === hbCustodian);
  list = list.slice().sort({
    mv: (a, b) => b.mv - a.mv,
    ytd: (a, b) => householdReturns(b.id).ytd - householdReturns(a.id).ytd,
    flow: (a, b) => b.ytdFlow - a.ytdFlow,
    fee: (a, b) => annualFee(b.mv) - annualFee(a.mv),
    review: (a, b) => (a.ipsReview < b.ipsReview ? -1 : 1),
    name: (a, b) => (a.name < b.name ? -1 : 1),
  }[hbSort]);

  const scope = list.reduce((s, h) => s + h.mv, 0);
  const sel = (k, val, opts) => `<select class="pa-btn" onchange="hbSet('${k}',this.value)">
    ${opts.map((o) => `<option value="${esc(o)}" ${o === val ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;

  $("#app").innerHTML = `
  ${toolbar("Household Book",
    `${sel("seg", hbSeg, ["All", "UHNW", "HNW", "Emerging", "Institutional"])}
     ${sel("adv", hbAdvisor, ["All"].concat([...new Set(all.map((h) => h.advisor))].sort()))}
     ${sel("tier", hbTier, ["All"].concat([...new Set(all.map((h) => h.tier))]))}
     ${sel("cust", hbCustodian, ["All"].concat([...new Set(all.map((h) => h.custodian))]))}
     <span class="demo-chip mut">${list.length} of ${all.length}</span>${srcChips("pa", "crm")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtM(scope)}</div><div class="l">Assets in view</div>
      <div class="s">${list.length} households</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(scope / (list.length || 1))}</div><div class="l">Average relationship</div>
      <div class="s">${esc(bookLabel())}</div></div>
    <div class="demo-kpi"><div class="v">${money(list.reduce((s, h) => s + h.ytdFlow, 0))}</div>
      <div class="l">Net flows, YTD</div><div class="s">Contributions less withdrawals</div></div>
    ${can("revenue") ? `<div class="demo-kpi"><div class="v">${fmtM(list.reduce((s, h) => s + annualFee(h.mv), 0))}</div>
      <div class="l">Annual revenue</div><div class="s">${fmtBps(
        (list.reduce((s, h) => s + annualFee(h.mv), 0) / (scope || 1)) * 100)} blended</div></div>` : ""}
    <div class="demo-kpi"><div class="v">${list.filter((h) => h.ipsReview < RP.asOf).length}</div>
      <div class="l">Reviews past due</div><div class="s">Annual policy reviews</div></div>
    <div class="demo-kpi"><div class="v">${list.filter((h) => isDrifted(allocationOf(householdPositions(h.id)))).length}</div>
      <div class="l">Out of tolerance</div><div class="s">On the rebalance queue</div></div>
  </div>

  ${panel("Register", `
    <div class="rp-scroll" style="max-height:620px">
      <table class="demo-tbl">
        <thead><tr>
          <th onclick="hbSet('sort','name')" style="cursor:pointer">Household</th>
          <th>Adviser</th><th>Strategy</th>
          <th class="num" onclick="hbSet('sort','mv')" style="cursor:pointer">Assets</th>
          <th class="num" onclick="hbSet('sort','ytd')" style="cursor:pointer">YTD net</th>
          <th class="num">3yr</th>
          <th class="num" onclick="hbSet('sort','flow')" style="cursor:pointer">Net flows</th>
          ${can("revenue") ? '<th class="num" onclick="hbSet(\'sort\',\'fee\')" style="cursor:pointer">Fee</th>' : ""}
          <th>Custodian</th><th>Tier</th>
          <th onclick="hbSet('sort','review')" style="cursor:pointer">Next review</th>
          <th>Standing</th>
        </tr></thead>
        <tbody>${list.map((h) => {
          const r = householdReturns(h.id);
          const drift = isDrifted(allocationOf(householdPositions(h.id)));
          const due = h.ipsReview < RP.asOf;
          return `<tr class="rp-click" onclick="location.href='/wealthmanagement/households/household/?id=${h.id}'">
            <td><b>${esc(h.name)}</b><div class="rp-note">${esc(h.segment)} &middot; since ${h.since.slice(0, 4)}</div></td>
            <td class="dim">${esc(h.advisor)}</td>
            <td class="dim">${esc(h.modelName)}</td>
            <td class="num">${fmt$(h.mv)}</td>
            <td class="num">${ret(r.ytd)}</td>
            <td class="num">${ret(r.y3)}</td>
            <td class="num">${money(h.ytdFlow)}</td>
            ${can("revenue") ? `<td class="num">${fmt$(annualFee(h.mv))}</td>` : ""}
            <td class="dim">${esc(h.custodian.split(" ")[0])}</td>
            <td class="dim">${esc(h.tier)}</td>
            <td class="${due ? "" : "dim"}">${fmtDateShort(h.ipsReview)}</td>
            <td>${drift ? pill("Rebalance", "amber") : due ? pill("Review due", "amber") : pill("In order", "green")}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Click a column header to sort. Totals in the band above follow
    the filters; the register and the Client Book read the same underlying records.</div>`,
    { k: fmtM(scope) })}

  ${disclosure()}`;
}
