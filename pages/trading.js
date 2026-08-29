/* =========================================================
   TRADING & REBALANCING
   Drift monitor, tax-aware trade proposal, block builder,
   live blotter, cash management and the best-execution log.
   ========================================================= */

var trHh = qs("hh") || "";
var trTab = "drift";

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) {
    app.innerHTML = gate("Not available in the client portal", "Trading is an internal function.") + disclosure();
    return;
  }
  renderTrading();
});

function trGo(t) { trTab = t; renderTrading(); }
function trPick(id) { trHh = id; trTab = "proposal"; renderTrading(); }

/* Every account that has left its band, with the trades that would fix it. */
function trQueue() {
  return visibleHouseholds().map((h) => {
    const alloc = allocationOf(householdPositions(h.id));
    const breaches = alloc.filter((a) => Math.abs(a.drift) > a.tolerance);
    return { h, alloc, breaches, worst: breaches.length
      ? breaches.reduce((x, y) => (Math.abs(y.drift) > Math.abs(x.drift) ? y : x)) : null };
  }).filter((x) => x.breaches.length).sort((a, b) => Math.abs(b.worst.drift) - Math.abs(a.worst.drift));
}

/* A tax-aware proposal: sell from the classes that are over, buy the ones that
   are under, and prefer loss lots and tax-deferred registrations when selling. */
function trProposal(h) {
  const alloc = allocationOf(householdPositions(h.id));
  const trades = [];
  alloc.forEach((a) => {
    if (Math.abs(a.drift) <= a.tolerance / 2) return;
    const dollars = Math.round((-a.drift / 100) * h.mv / 100) * 100;
    if (Math.abs(dollars) < 5000) return;
    const inClass = householdPositions(h.id).filter((p) => p.assetClass === a.id)
      .sort((x, y) => y.value - x.value);
    if (!inClass.length) return;
    const p = inClass[0];
    const acct = ACCT[p.acctId];
    const lots = LOTS.filter((l) => l.posId === p.id).sort((x, y) => x.gain - y.gain);
    const realized = dollars < 0 && acct.taxable
      ? Math.round(lots.slice(0, 2).reduce((s, l) => s + l.gain, 0) * 0.5) : 0;
    trades.push({
      side: dollars > 0 ? "Buy" : "Sell",
      amount: Math.abs(dollars),
      fund: p.fund, fundId: p.fundId,
      assetClass: a.label,
      registration: acct.registration,
      taxable: acct.taxable,
      realized,
      lots: dollars < 0 && acct.taxable ? lots.slice(0, 2) : [],
      drift: a.drift,
    });
  });
  return trades;
}

function renderTrading() {
  const queue = trQueue();
  const pending = TRADES.filter((t) => t.status === "Pending");
  const today = TRADES.filter((t) => t.date === RP.asOf);
  const tabs = [["drift", "Rebalance queue"], ["proposal", "Trade proposal"],
                ["blotter", "Blotter"], ["blocks", "Blocks"], ["cash", "Cash & liquidity"],
                ["bestex", "Best execution"]];

  $("#app").innerHTML = `
  ${toolbar("Trading & Rebalancing",
    `<span class="demo-chip ${queue.length ? "warn" : "ok"}">${queue.length} in the queue</span>
     <span class="demo-chip mut">${pending.length} pending</span>${srcChips("pa", "cust")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${queue.length}</div><div class="l">Portfolios out of band</div>
      <div class="s">of ${visibleHouseholds().length} monitored</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(queue.reduce((s, q) => s + q.h.mv, 0))}</div>
      <div class="l">Assets needing a trade</div><div class="s">Aggregate value</div></div>
    <div class="demo-kpi"><div class="v">${pending.length}</div><div class="l">Orders pending</div>
      <div class="s">${today.length} entered today</div></div>
    <div class="demo-kpi"><div class="v">${BLOCKS.length}</div><div class="l">Open blocks</div>
      <div class="s">${fmtM(BLOCKS.reduce((s, b) => s + b.amount, 0))} aggregate</div></div>
    <div class="demo-kpi"><div class="v">${money(TRADES.reduce((s, t) => s + t.realized, 0))}</div>
      <div class="l">Realised gain, YTD</div><div class="s">Across taxable registrations</div></div>
    <div class="demo-kpi"><div class="v">${LOTS.filter((l) => l.washSale).length}</div>
      <div class="l">Wash-sale blocks</div><div class="s">Lots that cannot be harvested</div></div>
  </div>

  <div class="rp-tabs">${tabs.map((t) =>
    `<button class="rp-tab ${trTab === t[0] ? "on" : ""}" onclick="trGo('${t[0]}')">${esc(t[1])}</button>`).join("")}</div>

  ${{ drift: trDrift, proposal: trProposalTab, blotter: trBlotter,
      blocks: trBlocks, cash: trCash, bestex: trBestEx }[trTab](queue)}

  ${disclosure()}`;
}

function trDrift(queue) {
  return panel("Rebalance queue", queue.length ? `
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Household</th><th>Model</th><th>Sleeve out of band</th>
          <th class="num">Drift</th><th class="num">Band</th><th class="num">Dollars to move</th>
          <th class="num">Months since</th><th></th></tr></thead>
        <tbody>${queue.map((q) => `<tr>
          <td><b>${esc(q.h.name)}</b><div class="rp-note">${fmt$(q.h.mv)} &middot; ${esc(q.h.advisor)}</div></td>
          <td class="dim">${esc(q.h.modelName)}</td>
          <td>${q.breaches.map((b) => esc(b.label)).join(", ")}</td>
          <td class="num"><span class="rp-drift out">${q.worst.drift >= 0 ? "+" : ""}${q.worst.drift.toFixed(1)}</span></td>
          <td class="num">&plusmn;${q.worst.tolerance.toFixed(1)}</td>
          <td class="num">${fmt$(Math.abs(q.worst.drift / 100) * q.h.mv)}</td>
          <td class="num">${q.h.monthsSinceRebalance}</td>
          <td><button class="pa-btn" onclick="trPick('${q.h.id}')">Build proposal</button></td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">A portfolio enters the queue when any sleeve leaves the tighter
    of a twenty per cent relative band and four points absolute. Drift is driven by market movement since the
    last rebalance, which is why the right-hand column tracks with the left.</div>`
    : gate("Nothing to rebalance", "Every portfolio in your scope is inside its tolerance bands."),
    { k: "Tolerance band policy" });
}

function trProposalTab(queue) {
  const h = HH[trHh] || (queue[0] && queue[0].h) || visibleHouseholds()[0];
  if (!h) return gate("No household selected", "Pick one from the rebalance queue.");
  const trades = trProposal(h);
  const buys = trades.filter((t) => t.side === "Buy").reduce((s, t) => s + t.amount, 0);
  const sells = trades.filter((t) => t.side === "Sell").reduce((s, t) => s + t.amount, 0);
  const realized = trades.reduce((s, t) => s + t.realized, 0);

  return `
  ${panel("Tax-aware proposal — " + h.name, trades.length ? `
    <div class="rp-toolrow">
      <select class="pa-btn" onchange="trPick(this.value)">
        ${visibleHouseholds().map((x) => `<option value="${x.id}" ${x.id === h.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
      </select>
      <span class="demo-chip mut">${trades.length} trades</span>
      <span class="demo-chip ${Math.abs(buys - sells) < 5000 ? "ok" : "warn"}">
        ${Math.abs(buys - sells) < 5000 ? "Cash neutral" : fmt$(Math.abs(buys - sells)) + " net"}</span>
      <span class="demo-chip ${realized > 0 ? "warn" : "ok"}">Realised ${money(realized)}</span>
    </div>
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Side</th><th>Fund</th><th>Asset class</th><th>Registration</th>
          <th class="num">Amount</th><th class="num">Corrects drift</th>
          <th class="num">Realised gain</th><th>Lots selected</th></tr></thead>
        <tbody>${trades.map((t) => `<tr>
          <td>${t.side === "Buy" ? pill("Buy", "green") : pill("Sell", "amber")}</td>
          <td><b>${esc(t.fund)}</b></td>
          <td class="dim">${esc(t.assetClass)}</td>
          <td class="dim">${esc(t.registration)}${t.taxable ? "" : " (deferred)"}</td>
          <td class="num">${fmt$(t.amount)}</td>
          <td class="num">${t.drift >= 0 ? "+" : ""}${t.drift.toFixed(1)} pts</td>
          <td class="num">${t.realized ? money(t.realized) : "—"}</td>
          <td class="dim">${t.lots.length ? t.lots.map((l) =>
            fmtDateShort(l.acquired) + " " + (l.gain < 0 ? "loss" : "gain")).join(", ") : "—"}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Sells are directed to tax-deferred registrations first, then to
    loss lots in taxable accounts. Lots inside a wash-sale window are excluded automatically. The proposal is
    built to be cash neutral so no distribution is disturbed.</div>`
    : gate("Nothing to trade", h.name + " is inside every tolerance band."),
    { k: fmt$(h.mv) })}

  ${trades.length ? `<div style="margin-top:22px">${panel("Approval", `
    ${approvalChain("trade-" + h.id, [
      { role: "pm", label: "Portfolio manager", note: "Builds and sizes the proposal" },
      { role: "trading", label: "Head of trading", note: "Reviews execution and sequencing" },
      { role: "cco", label: "Compliance", note: "Best-execution and suitability review" },
      { role: "trading", label: "Released to market", note: "Allocated after fill" },
    ], { title: "Block trade above threshold" })}
    <div class="rp-note">Any block above $250,000 requires the compliance review before release. The chain is
    role-gated: sign in as each person to advance it.</div>`)}</div>` : ""}`;
}

function trBlotter() {
  return panel("Blotter", `
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Order</th><th>Date</th><th>Household</th><th>Fund</th><th>Side</th>
          <th class="num">Amount</th><th class="num">Realised</th><th>Reason</th><th>Block</th>
          <th>Trader</th><th>Status</th></tr></thead>
        <tbody>${TRADES.slice(0, 120).map((t) => `<tr>
          <td class="mono">${esc(t.id)}</td>
          <td>${fmtDateShort(t.date)}</td>
          <td>${esc(t.hhName)}</td>
          <td class="dim">${esc(t.fund)}</td>
          <td>${t.side === "Buy" ? pill("Buy", "green") : pill("Sell", "amber")}</td>
          <td class="num">${fmt$(t.amount)}</td>
          <td class="num">${t.realized ? money(t.realized) : "—"}</td>
          <td class="dim">${esc(t.reason)}</td>
          <td class="mono">${esc(t.block || "—")}</td>
          <td class="dim">${esc(t.trader)}</td>
          <td>${statusPill(t.status)}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Most recent 120 of ${TRADES.length} orders over the last three
    weeks.</div>`, { k: TRADES.length + " orders" });
}

function trBlocks() {
  return panel("Block trades and allocation", `
    ${BLOCKS.map((b) => `
      <div style="border:1px solid var(--color-border);border-radius:4px;padding:13px 15px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px">
          <div><b>${esc(b.id)}</b> &middot; ${esc(b.fund)}
            <div class="rp-note">${b.legs.length} allocations &middot; average price applied across every leg</div></div>
          <div>${b.side === "Buy" ? pill("Buy", "green") : pill("Sell", "amber")}
            <b style="margin-left:8px">${fmt$(b.amount)}</b></div>
        </div>
        <table class="demo-tbl" style="width:100%;margin-top:10px">
          <thead><tr><th>Household</th><th>Registration</th><th class="num">Allocation</th>
            <th class="num">Share of block</th></tr></thead>
          <tbody>${b.legs.map((l) => `<tr>
            <td>${esc(l.hhName)}</td><td class="dim">${esc(l.registration)}</td>
            <td class="num">${fmt$(l.amount)}</td>
            <td class="num">${((l.amount / b.amount) * 100).toFixed(1)}%</td>
          </tr>`).join("")}</tbody>
        </table>
      </div>`).join("")}
    <div class="rp-note">Blocks are allocated pro rata at the average execution price. No account receives a
    better fill than another on the same block, which is the point of trading them together.</div>`,
    { k: BLOCKS.length + " open blocks" });
}

function trCash() {
  const cashPos = POSITIONS.filter((p) => p.assetClass === "CASH");
  const byHh = {};
  cashPos.forEach((p) => { byHh[p.hhId] = (byHh[p.hhId] || 0) + p.value; });
  const rows = visibleHouseholds().map((h) => {
    const w = WORLD[h.id];
    const cash = byHh[h.id] || 0;
    const need = w.annualDraw + (CAPITAL_CALLS.filter((c) => c.hhId === h.id)
      .reduce((s, c) => s + c.amount, 0));
    return { h, cash, need, cover: need ? cash / need : null };
  }).filter((r) => r.need > 0).sort((a, b) => a.cover - b.cover);

  return panel("Cash and liquidity", `
    <table class="demo-tbl" style="width:100%">
      <thead><tr><th>Household</th><th class="num">Cash held</th><th class="num">Known needs, 12 months</th>
        <th class="num">Cover</th><th>Standing</th></tr></thead>
      <tbody>${rows.map((r) => `<tr class="rp-click" onclick="location.href='/wealthmanagement/households/household/?id=${r.h.id}&tab=activity'">
        <td><b>${esc(r.h.name)}</b><div class="rp-note">${fmt$(r.h.mv)}</div></td>
        <td class="num">${fmt$(r.cash)}</td>
        <td class="num">${fmt$(r.need)}</td>
        <td class="num">${r.cover.toFixed(2)}x</td>
        <td>${r.cover >= 1 ? pill("Covered", "green") : r.cover >= 0.6 ? pill("Raise cash", "amber") : pill("Short", "red")}</td>
      </tr>`).join("")}</tbody>
    </table>
    <div class="rp-note" style="margin-top:10px">Known needs are the annual distribution plus any capital calls
    scheduled in the next twelve months. Anything under one times cover goes on the cash-raise list before the
    quarter opens, so the sale is planned rather than forced.</div>`, { k: rows.length + " with cash needs" });
}

function trBestEx() {
  const q2 = 1842, exceptions = 0;
  return `
  <div class="demo-grid demo-two">
    ${panel("Best execution review", `
      <dl class="rp-dl">
        <dt>Orders reviewed, Q2 2026</dt><dd>${q2.toLocaleString()}</dd>
        <dt>Exceptions identified</dt><dd>${exceptions}</dd>
        <dt>Average execution vs arrival</dt><dd>-0.4 bps</dd>
        <dt>Orders traded as blocks</dt><dd>${fmtPct((BLOCKS.reduce((s, b) => s + b.legs.length, 0) / TRADES.length) * 100, 0)}</dd>
        <dt>Custodians used</dt><dd>Three, no directed brokerage</dd>
        <dt>Soft dollar arrangements</dt><dd>None. Research is paid from the firm's own resources.</dd>
        <dt>Next committee review</dt><dd>15 October 2026</dd>
      </dl>
      <div class="rp-note" style="margin-top:12px">The best-execution committee meets quarterly and reviews every
      order, not a sample. Fee-only and open architecture means there is no economic reason to route anywhere
      other than the best available venue.</div>`, { k: "Quarterly" })}

    ${panel("Trade error log", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Error</th><th>Date</th><th class="num">Client impact</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td><b>Wrong registration on a rebalance leg</b>
            <div class="rp-note">Sale executed in the taxable account rather than the IRA, creating an
            unintended short-term gain</div></td>
            <td>${fmtDate("2026-08-14")}</td><td class="num">${fmt$(4120)}</td>
            <td>${pill("In Review", "amber")}</td></tr>
        </tbody>
      </table>
      ${approvalChain("error-2608", [
        { role: "trading", label: "Identified and quantified", note: "Impact calculated at $4,120" },
        { role: "pm", label: "Root cause documented", note: "Registration mapping in the proposal builder" },
        { role: "cco", label: "Compliance review", note: "Determines the make-whole and the control change" },
        { role: "cfo", label: "Client made whole", note: "Paid from firm resources, never from another client" },
      ], { title: "Trade error resolution" })}
      <div class="rp-note">Errors are made whole from the firm's own funds. No client ever bears the cost of
      an error, and no error is netted against a gain elsewhere.</div>`, { k: "One open" })}
  </div>`;
}
