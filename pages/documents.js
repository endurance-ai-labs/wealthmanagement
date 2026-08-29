/* =========================================================
   DOCUMENT VAULT
   Every document the firm holds for a household, with type,
   period, status, retention class and access history.
   ========================================================= */

var dvCat = "All", dvHh = "All", dvQ = "";

boot({ subtitle: "Private Wealth Portal" }, function () { render(); });

function dvSet(k, v) { ({ cat: () => (dvCat = v), hh: () => (dvHh = v), q: () => (dvQ = v) })[k](); render(k === "q"); }

function render(keepFocus) {
  const book = visibleHouseholds().map((h) => h.id);
  let list = DOCUMENTS.filter((d) => book.indexOf(d.hhId) >= 0);
  if (dvCat !== "All") list = list.filter((d) => d.category === dvCat);
  if (dvHh !== "All") list = list.filter((d) => d.hhId === dvHh);
  if (dvQ) {
    const q = dvQ.toLowerCase();
    list = list.filter((d) => (d.type + " " + d.hhName + " " + d.period).toLowerCase().indexOf(q) >= 0);
  }
  const cats = [...new Set(DOCUMENTS.map((d) => d.category))].sort();
  const pending = list.filter((d) => d.status === "Pending");

  $("#app").innerHTML = `
  ${toolbar(isExternal() ? "Your Documents" : "Document Vault",
    `<select class="pa-btn" onchange="dvSet('cat',this.value)">
       <option value="All">All categories</option>
       ${cats.map((c) => `<option value="${esc(c)}" ${c === dvCat ? "selected" : ""}>${esc(c)}</option>`).join("")}
     </select>
     ${isExternal() ? "" : `<select class="pa-btn" onchange="dvSet('hh',this.value)">
       <option value="All">All households</option>
       ${visibleHouseholds().map((h) => `<option value="${h.id}" ${h.id === dvHh ? "selected" : ""}>${esc(h.name)}</option>`).join("")}
     </select>`}
     <input class="demo-search" id="dvq" placeholder="Search documents" value="${esc(dvQ)}"
       oninput="dvSet('q',this.value)">`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${list.length}</div><div class="l">Documents in view</div>
      <div class="s">of ${DOCUMENTS.filter((d) => book.indexOf(d.hhId) >= 0).length} on file</div></div>
    <div class="demo-kpi"><div class="v">${cats.length}</div><div class="l">Categories</div>
      <div class="s">Each with its own retention class</div></div>
    <div class="demo-kpi"><div class="v">${pending.length}</div><div class="l">Pending delivery</div>
      <div class="s">Not yet released to the client</div></div>
    <div class="demo-kpi"><div class="v">${list.reduce((s, d) => s + d.accessed, 0)}</div>
      <div class="l">Views recorded</div><div class="s">Access is logged on every document</div></div>
    <div class="demo-kpi"><div class="v">7 years</div><div class="l">Standard retention</div>
      <div class="s">Permanent for trust documents</div></div>
    <div class="demo-kpi"><div class="v">WORM</div><div class="l">Storage</div>
      <div class="s">Write once, compliant with the records rule</div></div>
  </div>

  ${panel("Documents", `
    <div class="rp-scroll" style="max-height:600px">
      <table class="demo-tbl">
        <thead><tr><th>Document</th>${isExternal() ? "" : "<th>Household</th>"}<th>Category</th>
          <th>Period</th><th>Date</th><th>Retention</th><th>Status</th><th class="num">Views</th></tr></thead>
        <tbody>${list.slice(0, 400).map((d) => `<tr>
          <td><b>${esc(d.type)}</b></td>
          ${isExternal() ? "" : `<td class="dim">${esc(d.hhName)}</td>`}
          <td class="dim">${esc(d.category)}</td>
          <td>${esc(d.period)}</td>
          <td>${fmtDateShort(d.date)}</td>
          <td class="dim">${esc(d.retention)}</td>
          <td>${statusPill(d.status)}</td>
          <td class="num">${d.accessed}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">Retention is set by document class, not by preference. Nothing
    is deleted before its class period expires, and every view is logged against the person who opened it.</div>`,
    { k: list.length + " documents" })}

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Retention schedule", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Document type</th><th>Category</th><th>Retention</th></tr></thead>
        <tbody>${DOC_TYPES.map((t) => `<tr>
          <td><b>${esc(t[0])}</b></td><td class="dim">${esc(t[1])}</td><td>${esc(t[2])}</td></tr>`).join("")}</tbody>
      </table>`, { k: "Books and records" })}

    ${panel("By category", `
      ${cats.map((c) => {
        const n = list.filter((d) => d.category === c).length;
        return `<div class="rp-alloc">
          <span class="lbl">${esc(c)}</span>
          <span class="rp-track"><i style="width:${(n / (list.length || 1)) * 220}%"></i></span>
          <span class="num rp-hide-s">${n}</span>
          <span class="num">${fmtPct((n / (list.length || 1)) * 100, 0)}</span>
          <span class="rp-drift"></span></div>`;
      }).join("")}
      <div class="rp-note" style="margin-top:12px">Statements and tax forms dominate by volume; agreements and
      trust documents dominate by consequence. The vault treats both the same way because an examiner will
      ask for either.</div>`)}
  </div>

  ${disclosure()}`;

  if (keepFocus) { const q = document.getElementById("dvq"); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }
}
