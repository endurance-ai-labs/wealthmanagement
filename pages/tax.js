/* =========================================================
   TAX & ESTATE
   Harvesting against a gain budget, Roth conversion, gifting,
   charitable strategy and the estate structure.
   ========================================================= */

/* Declared before boot(): a constant a render helper reads must exist before
   the first render call, or it is still in the temporal dead zone. */
const EXEMPTION_2026 = 14200000; /* per person, illustrative */

var txHh = qs("hh") || (isExternal() ? CLIENT_HH : "HH-0001");

boot({ subtitle: "Private Wealth Portal" }, function () { render(); });
function txPick(id) { txHh = id; render(); }


function render() {
  const h = HH[txHh], w = WORLD[txHh];
  const lots = householdLots(txHh);
  const losses = lots.filter((l) => l.gain < 0 && !l.washSale);
  const harvestable = losses.reduce((s, l) => s + l.gain, 0);
  const blocked = lots.filter((l) => l.washSale).reduce((s, l) => s + l.gain, 0);
  const realized = TRADES.filter((t) => t.hhId === txHh).reduce((s, t) => s + t.realized, 0);
  const unrealized = lots.reduce((s, l) => s + l.gain, 0);
  const gainBudget = Math.round(h.mv * 0.008);
  const rate = 0.238; /* long-term capital gain plus net investment income tax */

  const estate = w.netWorth;
  const exempt = EXEMPTION_2026 * (w.family.some((f) => f.relation === "Spouse") ? 2 : 1);
  const taxable = Math.max(0, estate - exempt);
  const estateTax = Math.round(taxable * 0.40);

  $("#app").innerHTML = `
  ${toolbar("Tax & Estate",
    `${isExternal() ? "" : `<select class="pa-btn" onchange="txPick(this.value)">
      ${visibleHouseholds().map((x) => `<option value="${x.id}" ${x.id === txHh ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
     </select>`}${srcChips("pa", "plan")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${money(harvestable)}</div><div class="l">Harvestable losses</div>
      <div class="s">${losses.length} lots below basis</div></div>
    <div class="demo-kpi"><div class="v">${fmt$(Math.abs(harvestable) * rate)}</div><div class="l">Tax value if harvested</div>
      <div class="s">At ${fmtPct(rate * 100, 1)} combined</div></div>
    <div class="demo-kpi"><div class="v">${money(realized)}</div><div class="l">Realised gain, YTD</div>
      <div class="s">Budget ${fmt$(gainBudget)}</div></div>
    <div class="demo-kpi"><div class="v">${money(unrealized)}</div><div class="l">Unrealised gain</div>
      <div class="s">Embedded across taxable accounts</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(estate)}</div><div class="l">Gross estate</div>
      <div class="s">Exemption ${fmtM(exempt)}</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(estateTax)}</div><div class="l">Estimated estate tax</div>
      <div class="s">${taxable > 0 ? "Before planning" : "Within the exemption"}</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Harvesting opportunities", losses.length ? `
      <div class="rp-scroll" style="max-height:400px">
        <table class="demo-tbl">
          <thead><tr><th>Fund</th><th>Acquired</th><th>Term</th><th class="num">Value</th>
            <th class="num">Loss</th><th class="num">Tax value</th><th>Replacement</th></tr></thead>
          <tbody>${losses.sort((a, b) => a.gain - b.gain).slice(0, 30).map((l) => `<tr>
            <td><b>${esc(l.fund)}</b></td>
            <td>${fmtDateShort(l.acquired)}</td>
            <td>${esc(l.term)}</td>
            <td class="num">${fmt$(l.value)}</td>
            <td class="num">${money(l.gain)}</td>
            <td class="num">${fmt$(Math.abs(l.gain) * rate)}</td>
            <td class="dim">${esc((SLEEVES[l.assetClass] || [["", 0]])
              .map((s) => FUND[s[0]]).filter((f) => f && f.id !== l.fundId)[0] || { name: "—" }).name || "—"}</td>
          </tr>`).join("")}</tbody>
        </table>
      </div>
      <div class="rp-note" style="margin-top:10px">Harvesting sells the loss lot and buys a correlated but not
      substantially identical replacement, so the exposure never leaves the market. ${blocked
        ? "A further " + fmt$(Math.abs(blocked)) + " of losses is blocked by the wash-sale rule until the window closes."
        : "No lots are currently blocked by the wash-sale rule."}</div>`
      : gate("No losses to harvest", "Every taxable lot is above its basis."), { k: "Lot level" })}

    ${panel("Gain budget", `
      <table class="demo-tbl" style="width:100%">
        <tbody>
          <tr><td>Annual gain budget</td><td class="num">${fmt$(gainBudget)}</td></tr>
          <tr><td>Realised year to date</td><td class="num">${money(realized)}</td></tr>
          <tr><td>Losses available to offset</td><td class="num">${money(harvestable)}</td></tr>
          <tr><td>Carryforward from prior years</td><td class="num">${fmt$(-18400)}</td></tr>
          <tr style="font-weight:700"><td>Net taxable position</td>
            <td class="num">${money(realized + harvestable - 18400)}</td></tr>
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">The budget caps how much gain a rebalance may realise in a
      year. Where a trade would breach it, the proposal routes the sale to a tax-deferred registration instead,
      which is why the trading page shows registration on every leg.</div>
      <h4 class="rp-eyebrow" style="margin-top:16px">Roth conversion</h4>
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Fill to bracket</th><th class="num">Conversion</th><th class="num">Tax cost</th>
          <th class="num">Break-even</th></tr></thead>
        <tbody>${[[0.22, 0.22], [0.24, 0.24], [0.32, 0.32]].map((b) => {
          const amt = Math.round(h.mv * b[0] * 0.06 / 5000) * 5000;
          return `<tr><td>${fmtPct(b[0] * 100, 0)}</td>
            <td class="num">${fmt$(amt)}</td>
            <td class="num">${fmt$(amt * b[1])}</td>
            <td class="num">${Math.round(9 + b[1] * 30)} yrs</td></tr>`;
        }).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Converting only to the top of a bracket avoids paying a
      higher marginal rate than the one being avoided. Break-even is how long the account must grow before the
      conversion pays for itself.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Estate structure", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Entity</th><th>Role</th><th class="num">Value</th></tr></thead>
        <tbody>${w.entities.map((e) => `<tr>
          <td><b>${esc(e.name)}</b></td><td class="dim">${esc(e.role)}</td>
          <td class="num">${fmt$(e.value)}</td></tr>`).join("")}
          <tr><td><b>Held directly</b></td><td class="dim">Individual and joint registrations</td>
            <td class="num">${fmt$(h.mv - w.entities.reduce((s, e) => s + e.value, 0))}</td></tr>
          <tr><td><b>Outside the portfolio</b></td><td class="dim">Held away, property, less debt</td>
            <td class="num">${fmt$(w.heldAwayTotal + w.propertyTotal - w.debtTotal)}</td></tr>
        </tbody>
        <tfoot><tr style="font-weight:700"><td>Gross estate</td><td></td>
          <td class="num">${fmt$(estate)}</td></tr></tfoot>
      </table>
      <div class="rp-note" style="margin-top:10px">Assets inside an irrevocable trust are outside the taxable
      estate; everything else is inside it. That single line is usually the largest planning lever a family has,
      and it is why the entity map sits beside the tax numbers rather than in a separate document.</div>`,
      { k: "Entities" })}

    ${panel("Estate tax and gifting", `
      <table class="demo-tbl" style="width:100%">
        <tbody>
          <tr><td>Gross estate</td><td class="num">${fmt$(estate)}</td></tr>
          <tr><td>Exemption available</td><td class="num">${fmt$(exempt)}</td></tr>
          <tr><td>Taxable estate</td><td class="num">${fmt$(taxable)}</td></tr>
          <tr style="font-weight:700"><td>Estimated tax at 40%</td><td class="num">${fmt$(estateTax)}</td></tr>
        </tbody>
      </table>
      <h4 class="rp-eyebrow" style="margin-top:16px">Gifting</h4>
      <table class="demo-tbl" style="width:100%">
        <tbody>
          <tr><td>Annual exclusion per recipient</td><td class="num">${fmt$(19000)}</td></tr>
          <tr><td>Eligible recipients</td><td class="num">${Math.max(0, w.family.length - 1)}</td></tr>
          <tr><td>Exclusion gifts available this year</td>
            <td class="num">${fmt$(19000 * Math.max(0, w.family.length - 1) * (w.family.some((f) => f.relation === "Spouse") ? 2 : 1))}</td></tr>
          <tr><td>Lifetime exemption used to date</td><td class="num">${fmt$(Math.round(estate * 0.04))}</td></tr>
        </tbody>
      </table>
      <h4 class="rp-eyebrow" style="margin-top:16px">Charitable strategy</h4>
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Method</th><th class="num">Deduction</th><th class="num">Gain avoided</th>
          <th class="num">Net cost of a $100k gift</th></tr></thead>
        <tbody>
          <tr><td>Cash</td><td class="num">${fmt$(100000)}</td><td class="num">—</td><td class="num">${fmt$(62800)}</td></tr>
          <tr><td>Appreciated stock</td><td class="num">${fmt$(100000)}</td>
            <td class="num">${fmt$(14300)}</td><td class="num">${fmt$(48500)}</td></tr>
          <tr><td>Donor-advised fund, bunched</td><td class="num">${fmt$(100000)}</td>
            <td class="num">${fmt$(14300)}</td><td class="num">${fmt$(46100)}</td></tr>
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Giving appreciated stock rather than cash removes the embedded
      gain as well as producing the deduction. Bunching several years of giving into one deduction year adds the
      standard-deduction differential on top.</div>`)}
  </div>

  ${disclosure("Tax figures are illustrative and use simplified assumptions. Nothing here is tax advice.")}`;
}
