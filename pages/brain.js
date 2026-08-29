/* =========================================================
   ROSEMONT BRAIN — full page
   The same engine as the floating assistant, with the data
   it reads laid out so nobody has to take it on trust.
   ========================================================= */

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  const book = visibleHouseholds();
  const sources = [
    ["Households", book.length + " relationships", "Assets, model, adviser, service tier, review dates"],
    ["Accounts", ACCOUNTS.filter((a) => book.some((h) => h.id === a.hhId)).length + " registrations",
      "Registration type, custodian, tax status, alternatives eligibility"],
    ["Positions", POSITIONS.filter((p) => book.some((h) => h.id === p.hhId)).length + " holdings",
      "Fund, asset class, value and target value"],
    ["Tax lots", LOTS.filter((l) => book.some((h) => h.id === l.hhId)).length + " lots",
      "Acquisition date, basis, gain, holding period, wash-sale flags"],
    ["Funds", FUNDS.length + " strategies", "Terms, returns, risk, scorecard, operational due diligence"],
    ["Benchmarks", (INDICES.length + ALT_BENCH.length) + " indices", "Levels and returns across seven boards"],
    ["Commitments", COMMITMENTS.length + " private positions", "Called, uncalled, NAV, TVPI, DPI, IRR"],
    ["Capital calls", CAPITAL_CALLS.length + " scheduled", "Amount, due date, funding source, status"],
    ["Compliance", COMPLIANCE.length + " register items", "Owner, due date, status, evidence"],
    ["Client world", Object.keys(WORLD).length + " profiles", "Family, career, property, held-away assets, life events"],
  ];

  app.innerHTML = `
  ${toolbar("Rosemont Brain",
    `<span class="demo-chip mut">Reads live portal data</span>${srcChip("brain")}`)}

  <div class="demo-grid demo-two">
    ${panel("Ask", `
      <div class="rp-note" style="margin-bottom:14px">The assistant answers from the same records every page in
      this portal reads. It does not have a separate knowledge base, so it cannot tell you something the
      register does not already show. Use the button in the corner of any page, or start here.</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${["Which households are out of tolerance?",
           "What capital calls are due?",
           "Who holds Meridian Global Macro?",
           "What is our exposure to emerging markets?",
           "Which clients have unharvested losses?",
           "What is the firm's blended fee?",
           "Where are markets year to date?",
           "Who are the largest relationships?"].map((q) =>
          `<button class="pa-btn" onclick="window.rpBrainAsk && window.rpBrainAsk(${JSON.stringify(q).replace(/"/g, "&quot;")})">${esc(q)}</button>`).join("")}
      </div>`, { k: "Try one" })}

    ${panel("What it reads", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Source</th><th class="num">Records in your scope</th><th>Fields</th></tr></thead>
        <tbody>${sources.map((s) => `<tr>
          <td><b>${esc(s[0])}</b></td>
          <td class="num">${esc(s[1])}</td>
          <td class="dim" style="white-space:normal">${esc(s[2])}</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Scope follows the signed-in role. An adviser asking about the
      book gets their own households; the chief executive gets all of them. The assistant cannot see past the
      same permission wall the pages use.</div>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("What it will not do", `
      <ul style="margin:0 0 0 18px;font-size:12.5px">
        <li style="margin-bottom:6px">Give investment, tax or legal advice. It reports what the data says.</li>
        <li style="margin-bottom:6px">Answer outside the signed-in role's permissions.</li>
        <li style="margin-bottom:6px">Produce a number that contradicts a page. Every figure it quotes is
          computed from the same records, so the answer and the register cannot diverge.</li>
        <li style="margin-bottom:6px">Send anything, trade anything or change anything. It is read-only.</li>
        <li>Invent a fact it cannot find. If the data does not support an answer, it says so.</li>
      </ul>`, { k: "Boundaries" })}

    ${panel("Why it sits inside the portal", `
      <div class="rp-note" style="line-height:1.6">
        An assistant bolted onto a separate index goes stale the moment a position changes. This one has no
        index: it queries the live objects the pages render from. When a rebalance moves a weight, the next
        answer moves with it.
        <br><br>
        That is the whole argument for owning the system rather than renting six of them. The client statement,
        the adviser's book, the committee's research, the trading blotter, the fee run and the compliance file
        all read the same records — and so does the assistant.
      </div>`)}
  </div>

  ${disclosure()}`;
});
