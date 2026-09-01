/* =========================================================
   Rosemont Partners — page smoke test
   Loads every page script in a jsdom-free sandbox alongside
   the data layer and asserts each one renders without
   throwing. Catches the temporal-dead-zone and undefined-
   reference bugs that a static read misses.

     node scripts/smoke.js
   ========================================================= */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const CORE = ["js/util.js", "js/markets.js", "js/funds.js", "js/data.js", "js/world.js"];
const PAGES = fs.readdirSync(path.join(ROOT, "pages")).filter((f) => f.endsWith(".js"));

const ROLES = ["ceo", "advisor1", "csa", "client"];

function makeDom() {
  const nodes = [];
  function el(tag) {
    const n = {
      tagName: (tag || "div").toUpperCase(), style: {}, dataset: {}, children: [],
      _html: "", classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      setAttribute() {}, getAttribute: () => null, removeAttribute() {},
      addEventListener() {}, appendChild(c) { this.children.push(c); return c; },
      insertAdjacentHTML() {}, querySelector: () => null, querySelectorAll: () => [],
      focus() {}, setSelectionRange() {}, remove() {}, closest: () => null,
      getContext: () => null, scrollTop: 0, scrollHeight: 0, scrollWidth: 0,
      clientWidth: 0, clientHeight: 0, scrollLeft: 0,
      parentNode: null, insertBefore() {}, contains: () => false,
    };
    Object.defineProperty(n, "innerHTML", { get() { return this._html; }, set(v) { this._html = String(v); } });
    Object.defineProperty(n, "outerHTML", { get() { return this._html; }, set(v) { this._html = String(v); } });
    Object.defineProperty(n, "textContent", { get() { return this._text || ""; }, set(v) { this._text = String(v); } });
    nodes.push(n);
    return n;
  }
  const app = el("div"); app.id = "app";
  const topbar = el("div"); topbar.id = "topbar";
  const body = el("body");
  const doc = {
    body, head: el("head"), documentElement: el("html"), nodes,
    createElement: (t) => el(t),
    getElementById: (id) => (id === "app" ? app : id === "topbar" ? topbar : null),
    querySelector: (s) => (s === "#app" ? app : s === "#topbar" ? topbar : null),
    querySelectorAll: () => [],
    addEventListener() {}, readyState: "complete",
  };
  doc.documentElement.setAttribute = () => {};
  doc.documentElement.getAttribute = () => "light";
  return { doc, app };
}

let failed = 0, ran = 0;
console.log("\nRosemont Partners — page smoke test\n" + "-".repeat(66));

for (const role of ROLES) {
  const store = { "rp-role": role, "rp-mode": role === "client" ? "client" : "internal" };
  const results = [];

  for (const page of PAGES) {
    const { doc, app } = makeDom();
    const sandbox = {
      console: { log() {}, warn() {}, error() {} },
      localStorage: {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
      },
      document: doc,
      location: { pathname: "/wealthmanagement/", search: "", href: "", replace() {}, reload() {} },
      history: { replaceState() {} },
      URLSearchParams: global.URLSearchParams,
      requestAnimationFrame: () => {},
      setTimeout: () => 0,
      getComputedStyle: () => ({ getPropertyValue: () => "#1f3d5c", backgroundColor: "#fff" }),
      Chart: undefined,
      matchMedia: () => ({ matches: false, addEventListener() {} }),
      addEventListener() {}, removeEventListener() {},
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);

    let err = null;
    try {
      /* Concatenate rather than running each file separately. A browser gives
         every classic script one shared global lexical scope; node's vm gives
         each script its own, and the const-to-var rewrite that used to bridge
         that gap also destroyed temporal-dead-zone semantics, which is exactly
         the bug class these pages keep hitting. One program preserves both. */
      const files = CORE.concat(["js/nav.js", "js/research.js", "pages/" + page]);
      const bundle = files
        .map((f) => "\n/* ---- " + f + " ---- */\n" + fs.readFileSync(path.join(ROOT, f), "utf8"))
        .join("\n");
      vm.runInContext(bundle, sandbox, { filename: "bundle:" + page });
    } catch (e) {
      err = e.message;
    }

    ran++;
    const html = app._html || "";
    /* boot() swallows a page error into the error boundary — treat that as a failure too */
    const boundary = html.indexOf("This page could not be rendered") >= 0;
    if (err || boundary) {
      failed++;
      const detail = err || html.replace(/<[^>]+>/g, " ").split("This page could not be rendered")[1].trim().slice(0, 90);
      results.push(["FAIL", page, detail]);
    } else if (!html.length) {
      results.push(["skip", page, "no output (gated for this role)"]);
    } else {
      results.push(["ok", page, Math.round(html.length / 1024) + " KB rendered"]);
    }
  }

  const bad = results.filter((r) => r[0] === "FAIL");
  console.log("\n  Role: " + role + "   " + (results.length - bad.length) + " of " + results.length + " pages rendered");
  results.forEach((r) => {
    if (r[0] === "FAIL") console.log("    FAIL  " + r[1].padEnd(18) + r[2]);
  });
  if (!bad.length) console.log("    all pages rendered");
}

/* ---- static check ----
   A top-level const or let declared after the boot() call is still in the
   temporal dead zone when a render helper reads it. The runtime check above
   only catches this when the role being tested reaches that code path, so
   scan for it directly as well. */
console.log("\n" + "-".repeat(66));
let tdz = 0;
for (const page of PAGES) {
  const src = fs.readFileSync(path.join(ROOT, "pages", page), "utf8");
  const at = src.indexOf("boot(");
  if (at < 0) continue;
  const after = src.slice(at);
  const names = [];
  const re = /^(?:const|let)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(after))) names.push({ name: m[1], at: m.index });
  for (const d of names) {
    if (new RegExp("\\b" + d.name + "\\b").test(after.slice(0, d.at))) {
      console.log("  FAIL  " + page + ": '" + d.name + "' is read before it is declared");
      tdz++;
    }
  }
}
console.log(tdz ? "  " + tdz + " temporal-dead-zone risk(s)"
                : "  no constant is read before its declaration");

console.log("\n" + "-".repeat(66));
if (failed || tdz) {
  console.log("\n  " + failed + " of " + ran + " page renders failed; "
    + tdz + " temporal-dead-zone risk(s).\n");
  process.exit(1);
}
console.log("\n  All " + ran + " page renders passed across " + ROLES.length + " roles.\n");
