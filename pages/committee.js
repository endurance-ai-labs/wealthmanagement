/* =========================================================
   INVESTMENT COMMITTEE
   House views, capital market assumptions, the approved list
   and the minutes behind every decision.
   ========================================================= */

/* Declared before boot(): a page constant used by a render helper must exist
   before the first render call, or it is still in the temporal dead zone. */
const VIEW_TONE = { "Overweight": "green", "Modest overweight": "green", "Neutral": "gray",
  "Neutral duration": "gray", "Minimum": "amber", "Modest underweight": "amber", "Underweight": "red" };

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) { app.innerHTML = gate("Not available in the client portal",
    "Committee papers are internal until the quarterly commentary is published.") + disclosure(); return; }
  render();
});

function render() {
  const approved = FUNDS.filter((f) => f.status === "Approved");
  const watch = FUNDS.filter((f) => f.status === "Watch");
  const review = FUNDS.filter((f) => f.status === "Under Review");

  $("#app").innerHTML = `
  ${researchConsole({
    title: "Research console",
    kinds: ["Asset class", "House view", "Benchmark", "Fund"],
    addKinds: ["Asset class", "Agenda item", "Sector", "Fund"],
    placeholder: "Search asset classes, house views, benchmarks…",
  })}

  ${toolbar("Investment Committee",
    `<span class="demo-chip mut">Next meeting 16 September 2026</span>${srcChips("pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${approved.length}</div><div class="l">On the approved list</div>
      <div class="s">Available for allocation</div></div>
    <div class="demo-kpi"><div class="v">${watch.length}</div><div class="l">On watch</div>
      <div class="s">No new money</div></div>
    <div class="demo-kpi"><div class="v">${review.length}</div><div class="l">Under review</div>
      <div class="s">Awaiting a vote</div></div>
    <div class="demo-kpi"><div class="v">${IC_MINUTES.reduce((s, m) => s + m.items.length, 0)}</div>
      <div class="l">Decisions this quarter</div><div class="s">Across three meetings</div></div>
    <div class="demo-kpi"><div class="v">${HOUSE_VIEWS.filter((v) => v[1].indexOf("verweight") > 0).length}</div>
      <div class="l">Overweights</div><div class="s">Asset classes above policy</div></div>
    <div class="demo-kpi"><div class="v">${HOUSE_VIEWS.filter((v) => v[1].indexOf("nderweight") > 0 || v[1] === "Minimum").length}</div>
      <div class="l">Underweights</div><div class="s">Funding the overweights</div></div>
  </div>

  ${panel("House views", `
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Asset class</th><th>Position</th><th>Horizon</th>
          <th class="num">Expected return</th><th class="num">Volatility</th><th>Rationale</th></tr></thead>
        <tbody>${HOUSE_VIEWS.map((v) => {
          const a = AC[v[0]];

          return `<tr>
            <td><b>${esc(a.label)}</b><div class="rp-note">${esc(a.benchName)}</div></td>
            <td>${pill(v[1], VIEW_TONE[v[1]] || "gray")}</td>
            <td class="dim">${esc(v[2])}</td>
            <td class="num">${a.er.toFixed(1)}%</td>
            <td class="num">${a.vol.toFixed(1)}%</td>
            <td class="dim" style="white-space:normal;max-width:520px">${esc(v[3])}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Views are expressed inside the tolerance bands, never by moving
    to cash. A view that cannot be implemented within the band is not a view, it is a market call.</div>`,
    { k: "Adopted August 2026" })}

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Minutes", `
      ${IC_MINUTES.map((m) => `
        <div style="border:1px solid var(--color-border);border-radius:4px;padding:13px 15px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:baseline">
            <b>${esc(m.id)} &middot; ${fmtDate(m.date)}</b>
            <span class="rp-note">Chair ${esc(m.chair)} &middot; ${m.present.length} present</span></div>
          <table class="demo-tbl" style="width:100%;margin-top:10px">
            <thead><tr><th>Item</th><th>Decision</th><th class="num">Vote</th></tr></thead>
            <tbody>${m.items.map((i) => `<tr>
              <td><b>${esc(i.topic)}</b></td>
              <td class="dim" style="white-space:normal">${esc(i.decision)}</td>
              <td class="num">${esc(i.vote)}</td></tr>`).join("")}</tbody>
          </table>
        </div>`).join("")}
      <div class="rp-note">Every decision that changes a model, an approved-list status or a capital market
      assumption is minuted with the vote recorded. That record is the first thing an examiner asks for.</div>`,
      { k: "Last three meetings" })}

    <div>
      ${panel("Approved list movement", `
        <table class="demo-tbl" style="width:100%">
          <thead><tr><th>Fund</th><th>Asset class</th><th>Status</th><th class="num">Score</th></tr></thead>
          <tbody>${watch.concat(review).map((f) => `<tr class="rp-click" onclick="location.href='/wealthmanagement/funds/fund/?id=${f.id}'">
            <td><b>${esc(f.name)}</b><div class="rp-note">${esc(f.manager)}</div></td>
            <td class="dim">${esc(f.acLabel)}</td>
            <td>${statusPill(f.status)}</td>
            <td class="num">${f.scoreAvg == null ? "—" : f.scoreAvg.toFixed(1)}</td></tr>`).join("")}</tbody>
        </table>
        <div class="rp-note" style="margin-top:10px">Watch-list triggers are set at approval, not invented after
        the fact: a manager departure, three years of underperformance beyond the agreed tracking error, assets
        below a viability threshold, or an operational change.</div>`, { k: "Watch and review" })}

      <div style="margin-top:22px">
        ${panel("Capital market assumptions", `
          <div class="rp-scroll" style="max-height:340px">
            <table class="demo-tbl">
              <thead><tr><th>Asset class</th><th class="num">Return</th><th class="num">Volatility</th>
                <th class="num">Correlation to US equity</th></tr></thead>
              <tbody>${ASSET_CLASSES.map((a) => `<tr>
                <td>${esc(a.label)}</td><td class="num">${a.er.toFixed(1)}%</td>
                <td class="num">${a.vol.toFixed(1)}%</td>
                <td class="num">${cmaCorr("USLC", a.id).toFixed(2)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <div class="rp-note" style="margin-top:10px">Ten-year forward assumptions, refreshed quarterly. They
          drive the models, the efficient frontier and every Monte Carlo projection in the planning module, so a
          change here moves the whole platform at once.</div>`, { k: "Ten-year forward" })}
      </div>
    </div>
  </div>

  <div style="margin-top:22px">
    ${panel("September agenda", `
      ${approvalChain("ic-2026-09", [
        { role: "research", label: "Papers circulated", note: "Five days before the meeting" },
        { role: "pm", label: "Portfolio impact modelled", note: "Trade and tax impact by household" },
        { role: "cio", label: "Committee votes", note: "Recorded in the minutes" },
        { role: "cco", label: "Compliance logged", note: "Filed to the books and records" },
      ], { title: "Investment committee — September 2026" })}
      <ul style="margin:0 0 0 18px;font-size:12.5px">
        <li style="margin-bottom:5px">Meridian Global Macro: on-site findings and a recommendation to retain or terminate</li>
        <li style="margin-bottom:5px">Harrowgate Core Property Trust: independent valuation review</li>
        <li style="margin-bottom:5px">Private credit sizing: proposal to raise the sleeve by one point in Growth and Endowment</li>
        <li style="margin-bottom:5px">Direct indexing: extending harvesting to the international sleeve</li>
        <li>Q4 capital market assumptions: first read</li>
      </ul>`)}
  </div>

  ${coverageQueue()}

  ${disclosure()}`;
}
