/* =========================================================
   Blackmont Advisors — page smoke test
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
console.log("\nBlackmont Advisors — page smoke test\n" + "-".repeat(66));

for (const role of ROLES) {
  const store = { "bm-role": role, "bm-mode": role === "client" ? "client" : "internal" };
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
      for (const f of CORE.concat(["js/nav.js", "js/research.js"])) {
        vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8").replace(/^(const|let) /gm, "var "),
          sandbox, { filename: f });
      }
      vm.runInContext(fs.readFileSync(path.join(ROOT, "pages", page), "utf8").replace(/^(const|let) /gm, "var "),
        sandbox, { filename: "pages/" + page });
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

console.log("\n" + "-".repeat(66));
if (failed) { console.log("\n  " + failed + " of " + ran + " page renders failed.\n"); process.exit(1); }
console.log("\n  All " + ran + " page renders passed across " + ROLES.length + " roles.\n");
