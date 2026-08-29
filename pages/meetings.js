/* =========================================================
   MEETING DESK
   Upcoming meetings with an auto-assembled preparation pack,
   past meeting notes and the action items they produced.
   ========================================================= */

var mtSel = null;

boot({ subtitle: "Private Wealth Portal" }, function () {
  const book = visibleHouseholds().map((h) => h.id);
  const mine = MEETINGS.filter((m) => book.indexOf(m.hhId) >= 0);
  mtSel = (mine.find((m) => m.upcoming) || mine[0] || {}).id || null;
  render();
});

function mtPick(id) { mtSel = id; render(); }

function render() {
  const book = visibleHouseholds().map((h) => h.id);
  const mine = MEETINGS.filter((m) => book.indexOf(m.hhId) >= 0);
  const upcoming = mine.filter((m) => m.upcoming);
  const past = mine.filter((m) => !m.upcoming);
  const m = mine.find((x) => x.id === mtSel) || mine[0];
  const openActions = past.flatMap((x) => x.actions.filter((a) => !a.done)
    .map((a) => Object.assign({}, a, { hh: x.hhName, from: x.kind })));

  if (!m) { $("#app").innerHTML = toolbar("Meeting Desk", "") +
    gate("No meetings", "Nothing scheduled or recorded in your scope.") + disclosure(); return; }

  const h = HH[m.hhId], w = WORLD[m.hhId];
  const r = householdReturns(m.hhId);
  const bench = policyBenchmark(h.model);
  const drift = allocationOf(householdPositions(m.hhId));
  const calls = CAPITAL_CALLS.filter((c) => c.hhId === m.hhId);

  $("#app").innerHTML = `
  ${toolbar("Meeting Desk",
    `<span class="demo-chip mut">${upcoming.length} upcoming</span>
     <span class="demo-chip ${openActions.length ? "warn" : "ok"}">${openActions.length} open actions</span>
     ${srcChips("crm", "pa")}`)}

  <div class="demo-grid demo-two">
    ${panel("Schedule", `
      <h4 class="rp-eyebrow">Upcoming</h4>
      <table class="demo-tbl" style="width:100%;margin-bottom:16px">
        <tbody>${upcoming.map((x) => `<tr class="rp-click" onclick="mtPick('${x.id}')"
          ${x.id === m.id ? 'style="background:var(--color-blue-pale)"' : ""}>
          <td><b>${esc(x.hhName)}</b><div class="rp-note">${esc(x.kind)} &middot; ${esc(x.location)}</div></td>
          <td class="num">${fmtDateShort(x.date)}<div class="rp-note">${daysBetween(RP.asOf, x.date)} days</div></td>
        </tr>`).join("")}</tbody>
      </table>
      <h4 class="rp-eyebrow">Recent</h4>
      <table class="demo-tbl" style="width:100%">
        <tbody>${past.slice(0, 8).map((x) => `<tr class="rp-click" onclick="mtPick('${x.id}')"
          ${x.id === m.id ? 'style="background:var(--color-blue-pale)"' : ""}>
          <td><b>${esc(x.hhName)}</b><div class="rp-note">${esc(x.kind)}</div></td>
          <td class="num">${fmtDateShort(x.date)}</td></tr>`).join("")}</tbody>
      </table>`, { k: mine.length + " meetings" })}

    ${panel(m.upcoming ? "Preparation pack" : "Meeting record", `
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:baseline;margin-bottom:12px">
        <b style="font-size:15px;color:var(--color-cloud-whisper)">${esc(m.hhName)}</b>
        <span class="rp-note">${esc(m.kind)} &middot; ${fmtDate(m.date)} &middot; ${esc(m.location)}</span>
      </div>

      <h4 class="rp-eyebrow">Since we last met</h4>
      <table class="demo-tbl" style="width:100%;margin-bottom:14px">
        <tbody>
          <tr><td>Portfolio value</td><td class="num">${fmt$(h.mv)}</td></tr>
          <tr><td>Return, year to date, net</td><td class="num">${ret(r.ytd)} against ${ret(bench.ytd, 1)}</td></tr>
          <tr><td>Net flows, year to date</td><td class="num">${money(h.ytdFlow)}</td></tr>
          <tr><td>Allocation standing</td><td class="num">${isDrifted(drift)
            ? pill("Out of tolerance", "amber") : pill("On target", "green")}</td></tr>
          <tr><td>Policy review</td><td class="num">${h.ipsReview < RP.asOf
            ? pill("Past due", "amber") : fmtDateShort(h.ipsReview)}</td></tr>
          <tr><td>Capital calls scheduled</td><td class="num">${calls.length
            ? fmt$(calls.reduce((s, c) => s + c.amount, 0)) : "None"}</td></tr>
        </tbody>
      </table>

      <h4 class="rp-eyebrow">What is going on in their life</h4>
      <div class="rp-note" style="margin-bottom:10px">${esc(w.headline)}</div>
      ${w.events.filter((e) => e.kind === "upcoming").length ? `<ul style="margin:0 0 14px 18px;font-size:12.5px">
        ${w.events.filter((e) => e.kind === "upcoming").map((e) =>
          `<li style="margin-bottom:4px">${esc(e.title)}, ${fmtDate(e.date)}. ${esc(e.note)}</li>`).join("")}
      </ul>` : ""}

      <h4 class="rp-eyebrow">Agenda</h4>
      <ol style="margin:0 0 14px 18px;font-size:12.5px">
        ${m.agenda.map((a) => `<li style="margin-bottom:4px">${esc(a)}</li>`).join("")}
      </ol>

      ${m.notes ? `<h4 class="rp-eyebrow">Notes</h4>
        <div class="rp-note" style="margin-bottom:12px">${esc(m.notes)}</div>` : ""}

      ${m.actions.length ? `<h4 class="rp-eyebrow">Action items</h4>
      <table class="demo-tbl" style="width:100%">
        <tbody>${m.actions.map((a) => `<tr>
          <td>${esc(a.text)}<div class="rp-note">${esc(a.owner)}</div></td>
          <td class="num">${fmtDateShort(a.due)}</td>
          <td>${a.done ? pill("Complete", "green") : pill("Open", "amber")}</td></tr>`).join("")}</tbody>
      </table>` : ""}

      <div class="rp-note" style="margin-top:12px">The pack assembles itself from the household's live data the
      morning of the meeting. Nobody rebuilds it by hand, which is why it is never out of date.</div>`,
      { k: m.upcoming ? "Auto-assembled" : "On file" })}
  </div>

  <div style="margin-top:22px">
    ${panel("Open action items across the book", openActions.length ? `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Action</th><th>Household</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
        <tbody>${openActions.map((a) => `<tr>
          <td>${esc(a.text)}<div class="rp-note">From the ${esc(a.from.toLowerCase())}</div></td>
          <td class="dim">${esc(a.hh)}</td>
          <td class="dim">${esc(a.owner)}</td>
          <td class="${a.due < RP.asOf ? "" : "dim"}">${fmtDateShort(a.due)}</td>
          <td>${a.due < RP.asOf ? pill("Past due", "amber") : pill("Open", "blue")}</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">An action item recorded in a meeting is routed to its owner
      and stays visible here until it closes. Compliance sees the same record, which is what turns a meeting
      note into evidence of advice given.</div>`
      : gate("Nothing outstanding", "Every action item from prior meetings is closed."))}
  </div>

  ${disclosure()}`;
}
