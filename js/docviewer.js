/* =========================================================
   DOCUMENT VIEWER
   Opens a document from the vault and renders it from the
   household's live records, so what a client sees on paper
   and what the portal shows can never diverge.

   Opening one logs the access, which is what makes the
   vault's "access is logged on every document" true rather
   than decorative.
   ========================================================= */

const DV_KEY = "rp-docviews";

function dvViews() {
  try { return JSON.parse(localStorage.getItem(DV_KEY) || "{}"); } catch (e) { return {}; }
}
function dvLogView(id) {
  const v = dvViews();
  const me = currentPersona();
  v[id] = v[id] || { n: 0, log: [] };
  v[id].n += 1;
  v[id].log.unshift({ by: me ? me.name : "—", at: new Date().toISOString() });
  v[id].log = v[id].log.slice(0, 6);
  try { localStorage.setItem(DV_KEY, JSON.stringify(v)); } catch (e) {}
}
/* Recorded views plus anything opened in this browser. */
function dvCount(d) {
  const v = dvViews()[d.id];
  return d.accessed + (v ? v.n : 0);
}

/* ---------- letterhead shared by every document ---------- */
function dvHead(title, sub, right) {
  return `<div class="rp-doc-head">
    ${RP_MARK_SVG(46)}
    <div style="flex:1">
      <div class="word">${esc(RP.name)}</div>
      <div class="sub">${esc(RP.tagline)}</div>
      <div class="big-title">${esc(title)}</div>
      <div class="subtitle">${esc(sub)}</div>
    </div>
    <div class="right">${right || esc(RP.hq)}</div>
  </div>`;
}

const dvRow = (k, v) => `<tr><td>${esc(k)}</td><td class="num">${v}</td></tr>`;

/* ---------- the body, by document type ---------- */
function dvBody(d) {
  const h = HH[d.hhId];
  if (!h) return `<p>This record is no longer available.</p>`;
  const w = WORLD[d.hhId];
  const r = householdReturns(d.hhId);
  const bench = policyBenchmark(h.model);
  const t = d.type;

  if (t.indexOf("Quarterly performance") === 0) {
    const alloc = allocationOf(householdPositions(h.id));
    return `
      <h3 class="sect">Performance</h3>
      <table><thead><tr><th>Period</th><th class="num">Net of fees</th>
        <th class="num">Blended benchmark</th><th class="num">Difference</th></tr></thead>
        <tbody>${[["Quarter to date", r.qtd, bench.ytd / 3], ["Year to date", r.ytd, bench.ytd],
                  ["One year", r.y1, bench.y1], ["Three years, annualised", r.y3, bench.y3]]
          .map((p) => `<tr><td>${esc(p[0])}</td><td class="num">${p[1].toFixed(2)}%</td>
            <td class="num">${p[2].toFixed(2)}%</td>
            <td class="num">${(p[1] - p[2]).toFixed(2)}%</td></tr>`).join("")}</tbody></table>
      <h3 class="sect">Allocation against policy</h3>
      <table><thead><tr><th>Asset class</th><th class="num">Value</th><th class="num">Actual</th>
        <th class="num">Policy</th></tr></thead>
        <tbody>${alloc.map((a) => `<tr><td>${esc(a.label)}</td>
          <td class="num">${fmt$(a.value)}</td><td class="num">${a.actualPct.toFixed(1)}%</td>
          <td class="num">${a.targetPct.toFixed(1)}%</td></tr>`).join("")}</tbody>
        <tfoot><tr><td>Total</td><td class="num">${fmt$(h.mv)}</td>
          <td class="num">100.0%</td><td class="num">100.0%</td></tr></tfoot></table>
      <p>Returns are time-weighted and net of advisory fees. The blended benchmark is the weighted
      return of the market index behind each asset class in your investment policy statement.</p>`;
  }

  if (t.indexOf("Investment policy") === 0) {
    return `
      <h3 class="sect">Policy</h3>
      <table><tbody>
        ${dvRow("Strategy", esc(h.modelName))}
        ${dvRow("Risk profile", esc(h.riskProfile))}
        ${dvRow("Expected return", fmtPct(MODEL_RETURNS[h.model].er))}
        ${dvRow("Expected volatility", fmtPct(MODEL_RETURNS[h.model].vol))}
        ${dvRow("Distribution rate", w.annualDraw ? fmtPct(w.distributionRate * 100, 1) : "None")}
        ${dvRow("Alternatives permitted", h.qualified ? "Yes" : "No")}
        ${dvRow("Rebalancing", "Tolerance band, reviewed monthly")}
        ${dvRow("Last reviewed", fmtDate(h.ipsReviewed))}
      </tbody></table>
      <h3 class="sect">Strategic targets</h3>
      <table><thead><tr><th>Asset class</th><th class="num">Target</th><th class="num">Band</th></tr></thead>
        <tbody>${ASSET_CLASSES.filter((a) => MODEL[h.model].t[a.id] > 0).map((a) => `<tr>
          <td>${esc(a.label)}</td><td class="num">${MODEL[h.model].t[a.id].toFixed(0)}%</td>
          <td class="num">&plusmn;${Math.max(1, Math.min(4, MODEL[h.model].t[a.id] * 0.2)).toFixed(1)}</td>
        </tr>`).join("")}</tbody></table>
      <p>${esc(MODEL[h.model].desc)}</p>`;
  }

  if (t.indexOf("Fee statement") === 0) {
    const annual = annualFee(h.mv);
    const tiers = RP.feeSchedule.map((x) => {
      const slice = Math.max(0, Math.min(h.mv, x.upTo == null ? h.mv : x.upTo) - x.from);
      return { label: x.label, rate: x.rate, slice, fee: slice * x.rate };
    }).filter((x) => x.slice > 0);
    return `
      <h3 class="sect">Calculation</h3>
      <table><thead><tr><th>Tier</th><th class="num">Rate</th><th class="num">Assets in tier</th>
        <th class="num">Annual</th></tr></thead>
        <tbody>${tiers.map((x) => `<tr><td>${esc(x.label)}</td>
          <td class="num">${fmtPct(x.rate * 100, 2)}</td><td class="num">${fmt$(x.slice)}</td>
          <td class="num">${fmt$(x.fee)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td>Total</td><td class="num">${fmtBps(effectiveRate(h.mv) * 100)}</td>
          <td class="num">${fmt$(h.mv)}</td><td class="num">${fmt$(annual)}</td></tr></tfoot></table>
      <table style="margin-top:14px"><tbody>
        ${dvRow("Billed this quarter", fmt$(annual / 4))}
        ${dvRow("Billing method", "Quarterly in arrears, debited from the account")}
      </tbody></table>
      <p>${esc(RP.name)} receives no commissions, no revenue sharing and no compensation from any
      product sponsor. Returns reported to you are net of this fee.</p>`;
  }

  if (t.indexOf("Custodial statement") === 0) {
    const accts = householdAccounts(h.id);
    return `
      <h3 class="sect">Accounts</h3>
      <table><thead><tr><th>Registration</th><th>Custodian</th><th>Account</th>
        <th class="num">Value</th></tr></thead>
        <tbody>${accts.map((a) => `<tr><td>${esc(a.registration)}</td>
          <td>${esc(a.custodian)}</td><td>${esc(a.number)}</td>
          <td class="num">${fmt$(a.mv)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td>Total</td><td></td><td></td><td class="num">${fmt$(h.mv)}</td></tr></tfoot></table>
      <p>Assets are held at a qualified custodian. ${esc(RP.name)} never takes possession of client
      assets; this statement is a reconciliation of the custodian's own records.</p>`;
  }

  if (t.indexOf("Capital call") === 0) {
    const call = CAPITAL_CALLS.find((c) => c.hhId === h.id) || CAPITAL_CALLS[0];
    return `
      <h3 class="sect">Notice</h3>
      <table><tbody>
        ${dvRow("Fund", esc(call.fund))}
        ${dvRow("Manager", esc(call.manager))}
        ${dvRow("Amount called", fmt$(call.amount))}
        ${dvRow("Due", fmtDate(call.due))}
        ${dvRow("Funding source", esc(call.source))}
        ${dvRow("Status", call.status)}
      </tbody></table>
      <p>Wire instructions are issued separately and verified by callback before any funds move.
      No instruction to move money is ever accepted by email alone.</p>`;
  }

  if (t.indexOf("Beneficiary") === 0) {
    const fam = (w.family || []).filter((f) => f.relation !== "Client");
    return `
      <h3 class="sect">Designations</h3>
      <table><thead><tr><th>Name</th><th>Relationship</th><th class="num">Share</th></tr></thead>
        <tbody>${fam.length ? fam.map((f, i) => `<tr><td>${esc(f.name)}</td>
          <td>${esc(f.relation)}</td>
          <td class="num">${i === 0 ? "100% primary" : Math.round(100 / Math.max(1, fam.length - 1)) + "% contingent"}</td>
        </tr>`).join("") : "<tr><td colspan='3'>No designations on file.</td></tr>"}</tbody></table>
      <p>Beneficiary designations override the will. They are confirmed with each custodian at
      every annual review, because this is the single most common place an estate plan fails.</p>`;
  }

  if (t.indexOf("Form CRS") === 0) {
    return `
      <h3 class="sect">Acknowledgement</h3>
      <p>${esc(h.contact)} acknowledges receipt of the Form CRS relationship summary for
      ${esc(RP.legal)}, delivered ${fmtDate(d.date)}.</p>
      <table><tbody>
        ${dvRow("Registration", esc(RP.registration))}
        ${dvRow("Standard of care", "Fiduciary")}
        ${dvRow("Delivered", fmtDate(d.date))}
      </tbody></table>
      <p>${esc(RP.standard)}</p>`;
  }

  if (t.indexOf("Financial plan") === 0) {
    const goals = PLANNING_GOALS.filter((g) => g.hhId === h.id);
    return `
      <h3 class="sect">Position</h3>
      <table><tbody>
        ${dvRow("Portfolio value", fmt$(h.mv))}
        ${dvRow("Total net worth", fmt$(w.netWorth))}
        ${dvRow("Annual spending", w.annualDraw ? fmt$(w.annualDraw) : "Accumulating")}
        ${dvRow("Withdrawal rate", w.annualDraw ? fmtPct(w.distributionRate * 100, 2) : "—")}
      </tbody></table>
      ${goals.length ? `<h3 class="sect">Goals</h3>
      <table><thead><tr><th>Goal</th><th>Priority</th><th class="num">Target</th>
        <th class="num">Funded</th></tr></thead>
        <tbody>${goals.map((g) => `<tr><td>${esc(g.goal)}</td><td>${esc(g.priority)}</td>
          <td class="num">${fmt$(g.target)}</td>
          <td class="num">${Math.round(g.funded * 100)}%</td></tr>`).join("")}</tbody></table>` : ""}
      <p>Projections use the capital market assumptions adopted by the investment committee and are
      not a guarantee of any outcome.</p>`;
  }

  if (t.indexOf("Advisory agreement") === 0) {
    return `
      <h3 class="sect">Terms</h3>
      <table><tbody>
        ${dvRow("Client", esc(h.name))}
        ${dvRow("Adviser", esc(h.advisor))}
        ${dvRow("Services", "Discretionary investment management and financial planning")}
        ${dvRow("Fee", fmtBps(effectiveRate(h.mv) * 100) + " on billable assets")}
        ${dvRow("Custody", esc(h.custodian))}
        ${dvRow("Effective", fmtDate(h.since))}
        ${dvRow("Termination", "Either party, in writing, without penalty")}
      </tbody></table>
      <p>${esc(RP.standard)}</p>`;
  }

  /* Statements, tax forms, trust documents and anything else. */
  return `
    <h3 class="sect">Summary</h3>
    <table><tbody>
      ${dvRow("Household", esc(h.name))}
      ${dvRow("Document", esc(d.type))}
      ${dvRow("Category", esc(d.category))}
      ${dvRow("Period", esc(d.period))}
      ${dvRow("Dated", fmtDate(d.date))}
      ${dvRow("Retention", esc(d.retention))}
    </tbody></table>
    <p>This document is held in the vault under its retention class and cannot be deleted before
    that period expires. Every access is logged against the person who opened it.</p>`;
}

/* ---------- open ---------- */
function openDoc(id) {
  const d = DOCUMENTS.find((x) => x.id === id);
  if (!d) return;
  dvLogView(id);
  const h = HH[d.hhId];
  const v = dvViews()[id];

  const ov = document.createElement("div");
  ov.className = "dv-ov";
  ov.innerHTML = `
    <div class="dv-sheet" role="dialog" aria-modal="true" aria-label="${esc(d.type)}">
      <div class="dv-bar">
        <span><b>${esc(d.type)}</b> &middot; ${esc(h ? h.name : "")} &middot; ${esc(d.period)}</span>
        <span class="dv-bar-actions">
          <button class="pa-btn" onclick="window.print()">Print</button>
          <button class="pa-btn" onclick="closeDoc()">Close</button>
        </span>
      </div>
      <div class="dv-scroll">
        <div class="rp-doc">
          ${dvHead(d.type, (h ? h.name : "") + " · " + d.period + " · dated " + fmtDate(d.date),
                   esc(RP.hq) + "<br>" + esc(d.category) + "<br>Retention: " + esc(d.retention))}
          ${dvBody(d)}
          <div style="margin-top:26px;display:flex;gap:36px;flex-wrap:wrap">
            ${sigBlock("doc-" + d.id, "advisor1", "Adviser of record")}
          </div>
          <div class="dv-log">
            <b>Access log.</b> ${v ? v.n : 0} view${(v && v.n) === 1 ? "" : "s"} recorded in this
            session${v && v.log.length ? ", most recently by " + esc(v.log[0].by) : ""}.
            Total on file: ${dvCount(d)}.
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = "hidden";
  ov.addEventListener("mousedown", (e) => { if (e.target === ov) closeDoc(); });
  document.addEventListener("keydown", dvEsc);
  const btn = ov.querySelector(".pa-btn");
  if (btn) btn.focus();
}

function dvEsc(e) { if (e.key === "Escape") closeDoc(); }
function closeDoc() {
  const ov = document.querySelector(".dv-ov");
  if (ov) ov.remove();
  document.body.style.overflow = "";
  document.removeEventListener("keydown", dvEsc);
}
