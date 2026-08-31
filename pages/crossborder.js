/* =========================================================
   CROSS-BORDER DESK
   The practice's differentiator, made operational: which
   households have obligations outside the United States,
   what currency they are exposed to, what has to be filed
   and when, and which holdings are wrong for a US person
   living abroad.
   ========================================================= */

/* Declared before boot(): page constants used by render helpers must exist
   before the first render call. */
const XB_JURIS = {
  "HH-0002": ["United Kingdom", "Beneficiaries resident in London and Zurich"],
  "HH-0003": ["France", "Dual French and US citizens; assets on both sides"],
  "HH-0004": ["Nigeria", "Energy executive on a Lagos rotation, employer tax equalisation"],
  "HH-0007": ["Japan", "Tokyo posting through 2028"],
  "HH-0009": ["Mexico", "Family property in Mexico City"],
  "HH-0011": ["Netherlands", "Dutch national, US resident; treaty position reviewed annually"],
  "HH-0016": ["United Arab Emirates", "Dubai posting since 2022"],
  "HH-0017": ["Sweden", "Swedish and US citizens"],
  "HH-0021": ["Ghana", "Ghana and US; education funding is the near-term goal"],
  "HH-0024": ["Brazil", "Brazilian national, US green card"],
  "HH-0001": ["Singapore", "Adult child resident in Singapore, gifting question open"],
  "HH-0012": ["Canada", "Registered plan carried over from a Calgary posting"],
  "HH-0014": ["United Kingdom", "London secondment 2023 to 2025, accounts still open"],
  "HH-0029": ["France", "Recently repatriated, prior-year filings under review"],
};

const XB_FX = [
  ["EUR", "Euro", "EURUSD"], ["GBP", "Pound sterling", "GBPUSD"], ["JPY", "Japanese yen", "USDJPY"],
  ["CHF", "Swiss franc", "USDCHF"], ["CAD", "Canadian dollar", "USDCAD"], ["MXN", "Mexican peso", "USDMXN"],
];

const XB_FILINGS = [
  ["FinCEN Form 114 (FBAR)", "Foreign accounts above $10,000 in aggregate", "2026-10-15", "Extended deadline"],
  ["Form 8938 (FATCA)", "Specified foreign financial assets above the threshold", "2026-10-15", "Filed with the return"],
  ["Form 3520 / 3520-A", "Foreign trusts and large foreign gifts", "2026-10-15", "Two households in scope"],
  ["Form 5471 / 8865", "Interests in foreign corporations and partnerships", "2026-10-15", "One household in scope"],
  ["Form 8621 (PFIC)", "Passive foreign investment company holdings", "2026-10-15", "None held — by design"],
  ["Form 1116", "Foreign tax credit", "2026-10-15", "Nine households in scope"],
  ["Streamlined filing procedures", "Prior-year delinquency remediation", "Open", "One household under review"],
];

boot({ subtitle: "Advisory Portal" }, function (app) {
  if (isExternal()) {
    app.innerHTML = gate("Not available in the client portal",
      "Your own reporting status is on your household page.") + disclosure();
    return;
  }
  render();
});

function xbBook() {
  return visibleHouseholds()
    .filter((h) => XB_JURIS[h.id])
    .map((h) => ({ h, juris: XB_JURIS[h.id][0], note: XB_JURIS[h.id][1] }))
    .sort((a, b) => b.h.mv - a.h.mv);
}

function render() {
  const book = xbBook();
  const assets = book.reduce((s, x) => s + x.h.mv, 0);
  const jurisdictions = [...new Set(book.map((x) => x.juris))];
  const all = visibleHouseholds();

  /* Non-dollar exposure comes from the international and emerging sleeves,
     which is where a US household actually holds foreign currency risk. */
  const fxExposure = book.map((x) => {
    const alloc = allocationOf(householdPositions(x.h.id));
    const intl = alloc.filter((a) => a.id === "INTLD" || a.id === "EM")
      .reduce((s, a) => s + a.value, 0);
    return { hh: x.h, juris: x.juris, note: x.note, intl, pct: (intl / x.h.mv) * 100 };
  });
  const totalIntl = fxExposure.reduce((s, x) => s + x.intl, 0);

  $("#app").innerHTML = `
  ${toolbar("Cross-Border Desk",
    `<span class="demo-chip mut">${book.length} households</span>
     <span class="demo-chip mut">${jurisdictions.length} jurisdictions</span>
     ${srcChips("crm", "pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${book.length}</div><div class="l">Households with obligations abroad</div>
      <div class="s">of ${all.length} in ${esc(bookLabel().toLowerCase())}</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(assets)}</div><div class="l">Assets in scope</div>
      <div class="s">${fmtPct((assets / all.reduce((s, h) => s + h.mv, 0)) * 100, 0)} of the book</div></div>
    <div class="demo-kpi"><div class="v">${jurisdictions.length}</div><div class="l">Jurisdictions</div>
      <div class="s">${esc(jurisdictions.slice(0, 3).join(", "))}${jurisdictions.length > 3 ? " and more" : ""}</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(totalIntl)}</div><div class="l">Non-dollar exposure</div>
      <div class="s">International and emerging sleeves</div></div>
    <div class="demo-kpi"><div class="v">${daysBetween(RP.asOf, "2026-10-15")}</div>
      <div class="l">Days to the filing deadline</div><div class="s">15 October, extended</div></div>
    <div class="demo-kpi"><div class="v">0</div><div class="l">PFIC holdings</div>
      <div class="s">By construction, not by luck</div></div>
  </div>

  <div class="rp-note" style="margin:0 0 16px">
    A US person living abroad is a different planning problem, not a variation on the same one. Foreign funds
    are usually PFICs and are punitive to hold; foreign accounts are reportable; a foreign pension may not be
    recognised; and the local adviser rarely understands the US side. This desk is where that work is tracked
    rather than remembered.
  </div>

  ${panel("Households with obligations outside the United States", `
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Household</th><th>Jurisdiction</th><th class="num">Assets</th>
          <th class="num">Non-dollar</th><th>Reporting</th><th>Adviser</th><th>Situation</th></tr></thead>
        <tbody>${fxExposure.map((x) => `<tr class="rp-click"
          onclick="location.href='/wealthmanagement/households/household/?id=${x.hh.id}&tab=world'">
          <td><b>${esc(x.hh.name)}</b><div class="rp-note">${esc(x.hh.tier)} &middot; since ${x.hh.since.slice(0, 4)}</div></td>
          <td>${esc(x.juris)}</td>
          <td class="num">${fmt$(x.hh.mv)}</td>
          <td class="num">${fmt$(x.intl)}<div class="rp-note">${x.pct.toFixed(1)}%</div></td>
          <td>${x.hh.mv > 1000000 ? pill("FBAR + 8938", "blue") : pill("FBAR", "gray")}</td>
          <td class="dim">${esc(x.hh.advisor)}</td>
          <td class="dim" style="white-space:normal;max-width:340px">${esc(x.note)}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Reporting status is derived from account balances and
    residency, not from a checkbox someone remembers to tick. Click through for the household's full picture.</div>`,
    { k: fmtM(assets) })}

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Filing calendar", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Filing</th><th>Triggered by</th><th>Due</th><th>Status</th></tr></thead>
        <tbody>${XB_FILINGS.map((f) => `<tr>
          <td><b>${esc(f[0])}</b></td>
          <td class="dim" style="white-space:normal">${esc(f[1])}</td>
          <td>${f[2] === "Open" ? "Open" : fmtDateShort(f[2])}</td>
          <td class="dim">${esc(f[3])}</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Blackmont does not prepare returns. The desk tracks what is
      triggered, tells the household's accountant before the deadline, and keeps the evidence that the
      conversation happened.</div>
      ${approvalChain("xb-filing-2026", [
        { role: "csa", label: "Balances confirmed", note: "Peak foreign account balances gathered" },
        { role: "advisor1", label: "Adviser reviews", note: "Confirms what is triggered for each household" },
        { role: "ceo", label: "Kent signs off", note: "Client and accountant notified" },
      ], { title: "2026 reporting season" })}`, { k: "2026 season" })}

    ${panel("Currency exposure", `
      ${XB_FX.map((c) => {
        const q = IDX[c[2]];
        const n = book.filter((x) => {
          const j = x.juris;
          return (c[0] === "EUR" && (j === "France" || j === "Netherlands"))
            || (c[0] === "GBP" && j === "United Kingdom")
            || (c[0] === "JPY" && j === "Japan")
            || (c[0] === "CHF" && j === "Switzerland")
            || (c[0] === "CAD" && j === "Canada")
            || (c[0] === "MXN" && j === "Mexico");
        }).length;
        return `<div class="rp-alloc">
          <span class="lbl">${esc(c[1])}</span>
          <span class="rp-track"><i style="width:${Math.min(100, n * 22)}%"></i></span>
          <span class="num rp-hide-s">${n} hh</span>
          <span class="num">${q ? q.level.toFixed(4) : "—"}</span>
          <span class="rp-drift">${q ? ret(q.ytd, 1).replace(/<[^>]+>/g, "") : "—"}</span>
        </div>`;
      }).join("")}
      <div class="rp-note" style="margin-top:12px">The last column is the year-to-date move. We hedge the
      spending sleeve for a household that spends in a foreign currency, and leave the growth sleeve unhedged,
      because currency is not a risk you are paid to take over a long horizon but it is a risk you cannot carry
      on next year's school fees.</div>
      <table class="demo-tbl" style="width:100%;margin-top:14px">
        <tbody>
          <tr><td>Dollar index, year to date</td><td class="num">${ret(IDX.DXY.ytd, 1)}</td></tr>
          <tr><td>Households spending in a foreign currency</td><td class="num">6</td></tr>
          <tr><td>Spending sleeves hedged</td><td class="num">${pill("6 of 6", "green")}</td></tr>
          <tr><td>Growth sleeves hedged</td><td class="num">${pill("None, by policy", "gray")}</td></tr>
        </tbody>
      </table>`)}
  </div>

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("PFIC screen", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Check</th><th class="num">Result</th></tr></thead>
        <tbody>
          <tr><td>Non-US domiciled funds held by US persons</td><td class="num">${pill("None", "green")}</td></tr>
          <tr><td>UCITS or offshore share classes on the platform</td><td class="num">${pill("None", "green")}</td></tr>
          <tr><td>Foreign pensions requiring treaty analysis</td><td class="num">3 households</td></tr>
          <tr><td>Foreign trusts (Form 3520 / 3520-A)</td><td class="num">2 households</td></tr>
          <tr><td>Accounts a foreign bank has restricted for US persons</td><td class="num">1 household</td></tr>
        </tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Every fund on the approved list is US-domiciled. That is a
      deliberate constraint: a single offshore fund in a US person's portfolio can turn an ordinary year into a
      punitive tax event, and the client will not discover it until their accountant does.</div>`,
      { k: "Clean" })}

    ${panel("What we do and do not do", `
      <h4 class="rp-eyebrow">We do</h4>
      <ul style="margin:0 0 14px 18px;font-size:12.5px">
        <li style="margin-bottom:5px">Track what each household's residency and accounts actually trigger</li>
        <li style="margin-bottom:5px">Keep every holding US-domiciled so nothing becomes a PFIC by accident</li>
        <li style="margin-bottom:5px">Hedge the spending sleeve where a household spends in another currency</li>
        <li style="margin-bottom:5px">Brief the household's accountant before the deadline, in writing</li>
        <li>Coordinate with local counsel on estate documents that have to work in two systems</li>
      </ul>
      <h4 class="rp-eyebrow">We do not</h4>
      <ul style="margin:0 0 0 18px;font-size:12.5px">
        <li style="margin-bottom:5px">Prepare tax returns or file forms on a client's behalf</li>
        <li style="margin-bottom:5px">Give legal advice on residency, immigration or treaty position</li>
        <li>Hold accounts in jurisdictions where we are not permitted to advise</li>
      </ul>
      <div class="rp-note" style="margin-top:12px">Being clear about the second list is what makes the first
      list credible. An adviser who claims to do everything abroad is an adviser who has not read the rules.</div>`)}
  </div>

  ${disclosure("Reporting requirements shown here are illustrative and simplified. Nothing on this page is tax or legal advice.")}`;
}
