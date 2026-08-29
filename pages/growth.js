/* =========================================================
   GROWTH & PIPELINE
   Prospect pipeline, centres of influence, net new assets
   and win/loss.
   ========================================================= */

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (!can("firm")) { app.innerHTML = gate("Restricted", "Firm growth is limited to leadership roles.") + disclosure(); return; }
  render();
});

function render() {
  const assets = PROSPECTS.reduce((s, p) => s + p.assets, 0);
  const weighted = PROSPECTS.reduce((s, p) => s + p.weighted, 0);
  const revenue = PROSPECTS.reduce((s, p) => s + p.revenue * p.probability, 0);
  const stages = [...new Set(PROSPECTS.map((p) => p.stage))];
  const sources = [...new Set(PROSPECTS.map((p) => p.source))];

  $("#app").innerHTML = `
  ${toolbar("Growth & Pipeline", srcChips("crm"))}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtM(ROLLFORWARD.nna)}</div><div class="l">Net new assets, YTD</div>
      <div class="s">Target ${fmtM(RP.targets.nnaAnnual)}</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(ROLLFORWARD.organicGrowth * 100, 1)}</div>
      <div class="l">Organic growth</div><div class="s">Target ${fmtPct(RP.targets.organicGrowth * 100, 1)}</div></div>
    <div class="demo-kpi"><div class="v">${PROSPECTS.length}</div><div class="l">Active prospects</div>
      <div class="s">${fmtM(assets)} of assets in play</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(weighted)}</div><div class="l">Weighted pipeline</div>
      <div class="s">Probability adjusted</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(revenue)}</div><div class="l">Weighted revenue</div>
      <div class="s">If the pipeline closes as forecast</div></div>
    <div class="demo-kpi"><div class="v">${fmtPct(RP.targets.retention * 100, 1)}</div>
      <div class="l">Retention</div><div class="s">Trailing twelve months</div></div>
  </div>

  <div class="demo-grid demo-two">
    ${panel("Net new asset roll-forward", `
      <table class="demo-tbl" style="width:100%">
        <tbody>
          <tr><td>New households</td><td class="num">${money(ROLLFORWARD.newHouseholds)}</td></tr>
          <tr><td>Additions from existing clients</td><td class="num">${money(ROLLFORWARD.additions)}</td></tr>
          <tr><td>Withdrawals</td><td class="num">${money(ROLLFORWARD.withdrawals)}</td></tr>
          <tr><td>Client attrition</td><td class="num">${money(ROLLFORWARD.attrition)}</td></tr>
          <tr style="font-weight:700"><td>Net new assets</td><td class="num">${money(ROLLFORWARD.nna)}</td></tr>
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Against a ${fmtM(RP.targets.nnaAnnual)} annual target, the
      firm is at ${fmtPct((ROLLFORWARD.nna / RP.targets.nnaAnnual) * 100, 0)} through eight months. Withdrawals
      are mostly planned distributions rather than dissatisfaction; attrition of
      ${fmtM(Math.abs(ROLLFORWARD.attrition))} is four relationships, three of them below the tier minimum.</div>`,
      { k: ROLLFORWARD.periodLabel })}

    ${panel("Pipeline by stage", `
      ${stages.map((s) => {
        const inStage = PROSPECTS.filter((p) => p.stage === s);
        const a = inStage.reduce((x, p) => x + p.assets, 0);
        return `<div class="rp-alloc">
          <span class="lbl">${esc(s)}</span>
          <span class="rp-track"><i style="width:${Math.min(100, (a / assets) * 200)}%"></i></span>
          <span class="num rp-hide-s">${inStage.length}</span>
          <span class="num">${fmtM(a)}</span>
          <span class="rp-drift">${fmtPct(inStage[0].probability * 100, 0)}</span>
        </div>`;
      }).join("")}
      <div class="rp-note" style="margin-top:12px">The last column is the probability applied at that stage.
      Probabilities are set by the stage, not by the adviser's optimism, which is what makes the weighted number
      worth forecasting from.</div>`)}
  </div>

  ${panel("Prospects", `
    <div class="rp-scroll" style="max-height:480px">
      <table class="demo-tbl">
        <thead><tr><th>Prospect</th><th class="num">Assets</th><th>Stage</th><th class="num">Probability</th>
          <th class="num">Weighted</th><th class="num">Revenue</th><th>Source</th><th>Adviser</th>
          <th>Next step</th></tr></thead>
        <tbody>${PROSPECTS.sort((a, b) => b.weighted - a.weighted).map((p) => `<tr>
          <td><b>${esc(p.name)}</b><div class="rp-note">${esc(p.segment)} &middot; opened ${fmtDateShort(p.opened)}</div></td>
          <td class="num">${fmtM(p.assets)}</td>
          <td>${esc(p.stage)}</td>
          <td class="num">${fmtPct(p.probability * 100, 0)}</td>
          <td class="num">${fmtM(p.weighted)}</td>
          <td class="num">${fmt$(p.revenue)}</td>
          <td class="dim">${esc(p.source)}</td>
          <td class="dim">${esc(p.advisor)}</td>
          <td class="dim" style="white-space:normal">${esc(p.nextStep)}</td></tr>`).join("")}</tbody>
      </table>
    </div>`, { k: PROSPECTS.length + " active" })}

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Source attribution", `
      ${sources.map((s) => {
        const inSrc = PROSPECTS.filter((p) => p.source === s);
        const a = inSrc.reduce((x, p) => x + p.assets, 0);
        return `<div class="rp-alloc">
          <span class="lbl">${esc(s)}</span>
          <span class="rp-track"><i style="width:${Math.min(100, (a / assets) * 220)}%"></i></span>
          <span class="num rp-hide-s">${inSrc.length}</span>
          <span class="num">${fmtM(a)}</span>
          <span class="rp-drift">${fmtPct((a / assets) * 100, 0)}</span></div>`;
      }).join("")}
      <div class="rp-note" style="margin-top:12px">Client referrals and centres of influence together account for
      the majority of new assets. That is the expected shape for a fee-only firm with no marketing spend, and it
      is why the COI register below is treated as an asset.</div>`)}

    ${panel("Centres of influence", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Firm</th><th>Type</th><th class="num">Given</th><th class="num">Received</th>
          <th class="num">Assets introduced</th></tr></thead>
        <tbody>${COIS.sort((a, b) => b.assets - a.assets).map((c) => `<tr>
          <td><b>${esc(c.name)}</b><div class="rp-note">${esc(c.city)} &middot; since ${c.since}</div></td>
          <td class="dim">${esc(c.type)}</td>
          <td class="num">${c.given}</td>
          <td class="num">${c.received}</td>
          <td class="num">${fmtM(c.assets)}</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Referrals given are tracked alongside referrals received.
      A relationship where the flow only runs one way does not last, and there is no compensation in either
      direction, which is disclosed in the Form ADV.</div>`)}
  </div>

  ${disclosure()}`;
}
