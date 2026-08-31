/* =========================================================
   BLACKMONT BRAIN
   Floating assistant, present on every page. Answers are
   generated client-side from the live household, portfolio
   and fund data, so nothing it says can drift from what the
   rest of the portal shows. Illustrative demo output.
   ========================================================= */
(function () {
  if (window.__rpBrain) return;
  window.__rpBrain = true;

  var INK = "#16222e", SLATE = "#1f3d5c", BRASS = "#c9a96c";

  var css = document.createElement("style");
  css.textContent = [
    ".rb-fab{position:fixed;right:22px;bottom:22px;height:46px;width:46px;border-radius:999px;border:none;cursor:pointer;z-index:2147482000;",
    "background:" + INK + ";box-shadow:0 10px 26px rgba(22,34,46,.38);transition:transform .15s;display:flex;align-items:center;justify-content:center;}",
    ".rb-fab:hover{transform:translateY(-2px);}",
    ".rb-fab.open{background:" + SLATE + ";}",
    ".rb-panel{position:fixed;right:22px;bottom:82px;width:390px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 130px);z-index:2147482000;",
    "background:var(--color-bg-2,#fff);border:1px solid rgba(22,34,46,.16);border-radius:6px;box-shadow:0 24px 60px rgba(22,34,46,.28);display:none;flex-direction:column;overflow:hidden;",
    "font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}",
    ".rb-panel.open{display:flex;}",
    ".rb-head{background:linear-gradient(135deg," + INK + "," + SLATE + ");color:#fff;padding:13px 15px;}",
    ".rb-head .t{font-weight:700;font-size:14.5px;display:flex;align-items:center;gap:8px;}",
    ".rb-head .s{font-size:11px;color:#c6d2de;margin-top:2px;}",
    ".rb-head a{color:" + BRASS + ";text-decoration:none;font-size:11px;}",
    ".rb-head .dot{width:7px;height:7px;border-radius:50%;background:#6ee7a8;}",
    ".rb-disc{background:rgba(201,169,108,.14);color:#7a5f2c;font-size:10.5px;line-height:1.45;padding:7px 14px;border-bottom:1px solid rgba(201,169,108,.3);}",
    ".rb-body{flex:1;overflow-y:auto;padding:14px;background:var(--color-bg-3,#f4f6f8);display:flex;flex-direction:column;gap:11px;}",
    ".rb-msg{max-width:88%;font-size:12.5px;line-height:1.55;padding:9px 12px;border-radius:5px;white-space:pre-wrap;}",
    ".rb-msg.bot{background:var(--color-bg-2,#fff);border:1px solid var(--color-border,#dde3ea);color:var(--color-cloud-whisper,#16222e);align-self:flex-start;}",
    ".rb-msg.me{background:" + SLATE + ";color:#fff;align-self:flex-end;}",
    ".rb-sugg{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px;background:var(--color-bg-3,#f4f6f8);}",
    ".rb-sugg button{font:inherit;font-size:11px;cursor:pointer;background:var(--color-bg-2,#fff);color:" + SLATE + ";",
    "border:1px solid var(--color-border,#dde3ea);border-radius:99px;padding:5px 11px;}",
    ".rb-sugg button:hover{border-color:" + SLATE + ";}",
    ".rb-form{display:flex;gap:8px;padding:11px 13px;border-top:1px solid var(--color-border,#dde3ea);background:var(--color-bg-2,#fff);}",
    ".rb-form input{flex:1;font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid var(--color-border,#dde3ea);border-radius:4px;background:transparent;color:inherit;}",
    ".rb-form input:focus{outline:none;border-color:" + SLATE + ";}",
    ".rb-form button{font:inherit;font-size:12px;font-weight:700;cursor:pointer;background:" + SLATE + ";color:#fff;border:0;border-radius:4px;padding:8px 14px;}",
  ].join("");
  document.head.appendChild(css);

  var MARK = '<svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">'
    + '<circle cx="32" cy="32" r="30" fill="none" stroke="' + BRASS + '" stroke-width="2"/>'
    + '<circle cx="32" cy="32" r="22" fill="none" stroke="#fff" stroke-width="2" opacity=".85"/>'
    + '<circle cx="32" cy="32" r="7" fill="' + BRASS + '"/></svg>';

  var SUGGESTIONS = [
    "Which households are out of tolerance?",
    "What capital calls are due?",
    "Who holds Meridian Global Macro?",
    "What is our exposure to emerging markets?",
    "Which clients have unharvested losses?",
    "What is the firm's blended fee?",
  ];

  /* ---- answer engine: pattern match over the live datasets ---- */
  function answer(q) {
    var s = q.toLowerCase();
    var book = (typeof visibleHouseholds === "function") ? visibleHouseholds() : [];

    if (/toleran|drift|rebalanc/.test(s)) {
      var d = book.filter(function (h) { return isDrifted(allocationOf(householdPositions(h.id))); });
      if (!d.length) return "Nothing in your scope is outside its tolerance band right now.";
      return d.length + " household" + (d.length === 1 ? " is" : "s are") + " outside tolerance:\n\n"
        + d.map(function (h) {
            var a = allocationOf(householdPositions(h.id));
            var w = a.reduce(function (x, y) { return Math.abs(y.drift) - y.tolerance > Math.abs(x.drift) - x.tolerance ? y : x; }, a[0]);
            return "• " + h.name + " — " + w.label + " " + (w.drift >= 0 ? "+" : "") + w.drift.toFixed(1)
              + " points against a band of ±" + w.tolerance.toFixed(1) + ", last rebalanced "
              + h.monthsSinceRebalance + " months ago";
          }).join("\n")
        + "\n\nThe rebalance queue on the trading page has a tax-aware proposal for each.";
    }

    if (/capital call|call.*due|unfunded/.test(s)) {
      var calls = CAPITAL_CALLS.filter(function (c) {
        return book.some(function (h) { return h.id === c.hhId; });
      }).slice(0, 6);
      if (!calls.length) return "No capital calls are scheduled in your scope.";
      return calls.length + " calls scheduled, totalling "
        + fmt$(calls.reduce(function (s2, c) { return s2 + c.amount; }, 0)) + ":\n\n"
        + calls.map(function (c) {
            return "• " + c.hhName + " — " + fmt$(c.amount) + " to " + c.fund + ", due "
              + fmtDate(c.due) + " (" + c.status.toLowerCase() + "), funded from " + c.source.toLowerCase();
          }).join("\n");
    }

    var fundMatch = FUNDS.filter(function (f) {
      return s.indexOf(f.name.toLowerCase().split(",")[0].split("—")[0].trim().slice(0, 18)) >= 0;
    })[0];
    if (fundMatch && /who|hold|expos/.test(s)) {
      var pos = POSITIONS.filter(function (p) { return p.fundId === fundMatch.id; });
      var hh = {};
      pos.forEach(function (p) { hh[p.hhName] = (hh[p.hhName] || 0) + p.value; });
      var names = Object.keys(hh);
      if (!names.length) return "No client currently holds " + fundMatch.name + ".";
      return names.length + " households hold " + fundMatch.name + ", "
        + fmt$(pos.reduce(function (a, p) { return a + p.value; }, 0)) + " in total:\n\n"
        + names.sort(function (a, b) { return hh[b] - hh[a]; }).slice(0, 8).map(function (n) {
            return "• " + n + " — " + fmt$(hh[n]);
          }).join("\n")
        + (fundMatch.status !== "Approved" ? "\n\nNote: this fund is on " + fundMatch.status.toLowerCase()
            + ". " + (WATCH_NOTES[fundMatch.id] || "") : "");
    }

    var acMatch = ASSET_CLASSES.filter(function (a) {
      return s.indexOf(a.label.toLowerCase().split(" ")[0]) >= 0
        || (a.id === "EM" && /emerging/.test(s)) || (a.id === "PE" && /private equity/.test(s));
    })[0];
    if (acMatch && /expos|allocat|weight|how much/.test(s)) {
      var pos2 = book.reduce(function (a, h) { return a.concat(householdPositions(h.id)); }, []);
      var al = allocationOf(pos2).find(function (x) { return x.id === acMatch.id; });
      if (!al) return "There is no exposure to " + acMatch.label + " in your scope.";
      return acMatch.label + " is " + al.actualPct.toFixed(1) + "% of assets in your scope, "
        + fmt$(al.value) + ", against a policy weight of " + al.targetPct.toFixed(1) + "%.\n\n"
        + "The committee's current view is " + (HOUSE_VIEWS.find(function (v) { return v[0] === acMatch.id; }) || [,"neutral"])[1].toLowerCase()
        + ". The benchmark, " + acMatch.benchName + ", is "
        + (IDX[acMatch.bench] ? ret(IDX[acMatch.bench].ytd, 1).replace(/<[^>]+>/g, "") : "—") + " year to date.";
    }

    if (/loss|harvest|tax/.test(s)) {
      var rows = book.map(function (h) {
        var l = householdLots(h.id).filter(function (x) { return x.gain < 0 && !x.washSale; });
        return { h: h, loss: l.reduce(function (a, x) { return a + x.gain; }, 0), n: l.length };
      }).filter(function (x) { return x.loss < -5000; }).sort(function (a, b) { return a.loss - b.loss; });
      if (!rows.length) return "No meaningful harvestable losses in your scope.";
      return rows.length + " households carry harvestable losses:\n\n"
        + rows.slice(0, 6).map(function (x) {
            return "• " + x.h.name + " — " + fmt$(x.loss) + " across " + x.n + " lots, worth about "
              + fmt$(Math.abs(x.loss) * 0.238) + " in tax";
          }).join("\n")
        + "\n\nWash-sale conflicts are excluded. The tax page shows the replacement fund for each.";
    }

    if (/fee|revenue|blended/.test(s)) {
      if (typeof can === "function" && !can("revenue"))
        return "Firm revenue is limited to the executive and finance roles. Your own book's assets are on the home page.";
      return "The firm's blended fee is " + fmtBps(FIRM.blendedFee * 100) + " on " + fmtM(FIRM.aum)
        + " of discretionary assets, producing " + fmtM(FIRM.revenue) + " of annual revenue.\n\n"
        + FIRM.firmSegments.map(function (x) {
            return "• " + x.label + " — " + fmtM(x.aum) + " at " + fmtBps(x.blendedFee * 100);
          }).join("\n")
        + "\n\nThe schedule falls to 40 bps above $25M, which is why the largest segment carries the lowest rate.";
    }

    if (/largest|biggest|top/.test(s)) {
      var top = book.slice().sort(function (a, b) { return b.mv - a.mv; }).slice(0, 5);
      return "Largest relationships in your scope:\n\n" + top.map(function (h) {
        return "• " + h.name + " — " + fmt$(h.mv) + ", " + h.modelName + ", " + h.advisor;
      }).join("\n");
    }

    if (/market|index|s&p|equit/.test(s)) {
      return "Year to date: S&P 500 " + IDX.SPX.ytd.toFixed(1) + "%, Russell 2000 "
        + IDX.RUT.ytd.toFixed(1) + "%, MSCI EAFE " + IDX.EAFE.ytd.toFixed(1) + "%, emerging markets "
        + IDX.EM.ytd.toFixed(1) + "%.\n\nBloomberg US Aggregate " + IDX.LBUSTRUU.ytd.toFixed(1)
        + "%, municipals " + IDX.LMBITR.ytd.toFixed(1) + "%. The ten-year Treasury is at "
        + CURVE[8][1].toFixed(2) + "% with 2s10s at +"
        + Math.round((CURVE[8][1] - CURVE[4][1]) * 100) + " bps.\n\nInvestment grade "
        + SPREADS[0][1] + " bps, high yield " + SPREADS[1][1] + " bps — both in the bottom quartile of their history.";
    }

    return "I read the live household, portfolio, fund and market data in this portal. Try asking about "
      + "drifted portfolios, capital calls, who holds a particular fund, exposure to an asset class, "
      + "harvestable losses, the firm's fee, or where markets are.";
  }

  /* ---- UI ---- */
  var fab = document.createElement("button");
  fab.className = "rb-fab";
  fab.setAttribute("aria-label", "Open the Blackmont Brain");
  fab.innerHTML = MARK;

  var panel = document.createElement("div");
  panel.className = "rb-panel";
  panel.innerHTML =
    '<div class="rb-head"><div class="t"><span class="dot"></span>Blackmont Brain</div>'
    + '<div class="s">Reads the live portfolio data &middot; '
    + '<a href="/wealthmanagement/brain/">Open the full page</a></div></div>'
    + '<div class="rb-disc">Demonstration output, generated from synthetic data. Not advice.</div>'
    + '<div class="rb-body" id="rb-body"></div>'
    + '<div class="rb-sugg" id="rb-sugg"></div>'
    + '<form class="rb-form" id="rb-form"><input id="rb-input" placeholder="Ask about the book…" autocomplete="off">'
    + '<button type="submit">Ask</button></form>';

  document.addEventListener("DOMContentLoaded", mount);
  if (document.readyState !== "loading") mount();

  function mount() {
    if (document.querySelector(".rb-fab")) return;
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    var body = panel.querySelector("#rb-body");
    var sugg = panel.querySelector("#rb-sugg");

    say("bot", "I read this portal's live data. Ask me about the book, the portfolios, the funds or the market.");
    SUGGESTIONS.forEach(function (q) {
      var b = document.createElement("button");
      b.textContent = q;
      b.onclick = function () { ask(q); };
      sugg.appendChild(b);
    });

    fab.onclick = function () {
      panel.classList.toggle("open");
      fab.classList.toggle("open");
      if (panel.classList.contains("open")) panel.querySelector("#rb-input").focus();
    };
    panel.querySelector("#rb-form").onsubmit = function (e) {
      e.preventDefault();
      var i = panel.querySelector("#rb-input");
      if (i.value.trim()) { ask(i.value.trim()); i.value = ""; }
    };

    function say(who, text) {
      var d = document.createElement("div");
      d.className = "rb-msg " + who;
      d.textContent = text;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }
    function ask(q) {
      if (!panel.classList.contains("open")) { panel.classList.add("open"); fab.classList.add("open"); }
      say("me", q);
      setTimeout(function () {
        var a;
        try { a = answer(q); } catch (e) { a = "I could not read that from the data on this page."; }
        say("bot", a);
      }, 260);
    }
    window.rpBrainAsk = ask;
  }
})();
