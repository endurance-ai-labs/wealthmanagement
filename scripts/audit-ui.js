/* =========================================================
   UI AUDIT
   Paste-able into the browser console, or driven page by
   page from a harness. Reports layout defects that are
   objectively wrong rather than matters of taste:

     - the page scrolls sideways
     - an element paints outside its own panel
     - two pieces of text overlap
     - a grid row has more children than it has columns,
       which silently wraps into an implicit row
     - content is clipped without a scroller to reach it
     - interactive targets too small to hit
     - images or canvases with no dimensions

   window.uiAudit() returns a structured report.
   ========================================================= */
(function () {
  function box(el) { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }
  /* Deliberately wider than the viewport: the headline marquee and the market
     tape both scroll by design, so nothing inside them is a defect. */
  const DELIBERATE = ".news-marquee, .market-ticker, .ticker-track, .news-marquee-track";
  function inDeliberate(el) { return !!(el.closest && el.closest(DELIBERATE)); }

  function vis(el) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
    const b = box(el);
    return b.w > 0 && b.h > 0;
  }
  /* An element scrolled out of view inside a scroller keeps a rect that extends
     past its clipping box. That is not an overlap with what follows, so skip it. */
  function clippedByScroller(el) {
    let a = el.parentElement;
    while (a && a !== document.body) {
      const cs = getComputedStyle(a);
      if (/auto|scroll|hidden/.test(cs.overflowY + cs.overflowX)) {
        const ab = box(a), eb = box(el);
        if (eb.b > ab.b + 1 || eb.t < ab.t - 1 || eb.r > ab.r + 1 || eb.l < ab.l - 1) return true;
      }
      a = a.parentElement;
    }
    return false;
  }

  /* A pinned header or totals band deliberately paints over the rows that
     scroll beneath it. Opaque and sticky is a pattern, not a collision. */
  function stickyOpaque(el) {
    let a = el;
    while (a && a !== document.body) {
      const cs = getComputedStyle(a);
      if (cs.position === "sticky" && cs.backgroundColor &&
          !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) return true;
      a = a.parentElement;
    }
    return false;
  }

  function label(el) {
    const id = el.id ? "#" + el.id : "";
    const cls = typeof el.className === "string" && el.className.trim()
      ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
    const txt = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return el.tagName.toLowerCase() + id + cls + (txt ? ' "' + txt + '"' : "");
  }

  window.uiAudit = function () {
    const out = { url: location.pathname + location.search, width: innerWidth, issues: [] };
    const add = (sev, type, msg, el) => out.issues.push({ sev, type, msg, el: el ? label(el) : null });

    /* ---- 1. the page must not scroll sideways ---- */
    const de = document.documentElement;
    if (de.scrollWidth > de.clientWidth + 1) {
      add("high", "page-hscroll",
        "Page scrolls sideways by " + (de.scrollWidth - de.clientWidth) + "px");
      /* find what is sticking out */
      const limit = de.clientWidth;
      [...document.querySelectorAll("body *")].forEach((el) => {
        if (!vis(el) || inDeliberate(el)) return;
        const b = box(el);
        if (b.r > limit + 1 && b.w <= limit + 1 && el.children.length === 0) {
          add("high", "page-hscroll-source",
            "Sticks " + Math.round(b.r - limit) + "px past the viewport", el);
        }
      });
    }

    /* ---- 2. grid rows with more children than columns ---- */
    document.querySelectorAll("*").forEach((el) => {
      if (inDeliberate(el)) return;
      const cs = getComputedStyle(el);
      if (cs.display !== "grid") return;
      const cols = cs.gridTemplateColumns.split(" ").filter((x) => x && x !== "none").length;
      if (!cols) return;
      const kids = [...el.children].filter(vis);
      if (kids.length > cols && cs.gridAutoFlow.indexOf("column") < 0) {
        /* only a defect when the row was clearly meant to be one line */
        const rowsUsed = new Set(kids.map((k) => Math.round(box(k).t))).size;
        const spanning = kids.some((k) => {
          const gc = getComputedStyle(k).gridColumn || "";
          return gc.indexOf("/") >= 0 && (gc.indexOf("-1") >= 0 || gc.indexOf("span") >= 0);
        });
        if (!spanning && rowsUsed > 1 && el.className && /alloc|score|kpi-row/.test(el.className)) {
          add("high", "grid-wrap",
            kids.length + " visible children in " + cols + " columns, wrapping onto " +
            rowsUsed + " lines", el);
        }
      }
    });

    /* ---- 3. children painting outside their panel ---- */
    document.querySelectorAll(".demo-panel, .rs-detail, .rp-doc").forEach((p) => {
      if (!vis(p)) return;
      const pb = box(p);
      const cs = getComputedStyle(p);
      const padR = parseFloat(cs.paddingRight) || 0;
      [...p.querySelectorAll("*")].forEach((el) => {
        if (!vis(el) || el.children.length) return;
        /* ignore anything inside a deliberate scroller */
        if (el.closest(".rp-scroll, .demo-tbl-wrap, .rs-list, .rp-chart")) return;
        if (clippedByScroller(el)) return;
        const b = box(el);
        if (b.r > pb.r - padR + 2) {
          add("med", "panel-overflow",
            "Extends " + Math.round(b.r - (pb.r - padR)) + "px past its panel", el);
        }
      });
    });

    /* ---- 4. overlapping text ---- */
    const texts = [...document.querySelectorAll("body *")].filter((el) =>
      vis(el) && !inDeliberate(el) && el.children.length === 0
      && (el.textContent || "").trim().length > 1
      && !el.closest(".rs-list, .nav-dropdown, .login-overlay, .rp-chart, .demo-watermark")
      && !clippedByScroller(el) && !stickyOpaque(el));
    for (let i = 0; i < texts.length; i++) {
      const a = box(texts[i]);
      for (let j = i + 1; j < Math.min(texts.length, i + 25); j++) {
        const b = box(texts[j]);
        if (texts[j].contains(texts[i]) || texts[i].contains(texts[j])) continue;
        const ox = Math.min(a.r, b.r) - Math.max(a.l, b.l);
        const oy = Math.min(a.b, b.b) - Math.max(a.t, b.t);
        if (ox > 4 && oy > 4) {
          add("high", "text-overlap",
            'Overlaps "' + (texts[j].textContent || "").trim().slice(0, 28) + '" by ' +
            Math.round(ox) + "x" + Math.round(oy) + "px", texts[i]);
          break;
        }
      }
    }

    /* ---- 5. clipped content with no way to reach it ---- */
    document.querySelectorAll("*").forEach((el) => {
      if (!vis(el) || inDeliberate(el)) return;
      /* html and body clip on purpose so the marquee cannot push the page sideways */
      if (el === document.body || el === document.documentElement) return;
      const cs = getComputedStyle(el);
      const clipped = el.scrollWidth > el.clientWidth + 2;
      if (!clipped) return;
      const scrollable = /auto|scroll/.test(cs.overflowX);
      if (!scrollable && cs.overflowX === "hidden") {
        add("med", "clipped", "Content clipped by " + (el.scrollWidth - el.clientWidth) +
          "px with no scroller", el);
      }
    });

    /* ---- 6. tap targets ---- */
    document.querySelectorAll("button, a, select, input, .rp-tab, .pa-btn").forEach((el) => {
      if (!vis(el)) return;
      if (el.closest(".ticker-track, .news-marquee-track")) return;
      const b = box(el);
      if (b.h < 22 || b.w < 16) {
        add("low", "tap-target", Math.round(b.w) + "x" + Math.round(b.h) + "px", el);
      }
    });

    /* ---- 7. media with no dimensions ---- */
    document.querySelectorAll("canvas, img, svg").forEach((el) => {
      if (!vis(el)) return;
      const b = box(el);
      if (b.w < 2 || b.h < 2) add("high", "zero-size", "Rendered at " +
        Math.round(b.w) + "x" + Math.round(b.h), el);
    });

    /* ---- 8. horizontal scrollers that give no visual hint ---- */
    document.querySelectorAll(".rp-scroll, .demo-tbl-wrap").forEach((el) => {
      if (!vis(el)) return;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientHeight >= el.scrollHeight - 2) {
        add("low", "silent-hscroll",
          "Scrolls " + (el.scrollWidth - el.clientWidth) + "px sideways", el);
      }
    });

    out.counts = out.issues.reduce((a, i) => { a[i.sev] = (a[i.sev] || 0) + 1; return a; }, {});
    return out;
  };
})();
