/* =========================================================
   BLACKMONT ADVISORS — the client's real world

   The portfolio is only the part of a client's life we
   custody. This layer carries the rest: the family, the
   careers, the property, the assets held away, the debts,
   the entities, the insurance, and the events that are
   actually driving the plan.

   It is what turns a household row into a relationship.
   All of it is synthetic.
   ========================================================= */

const WORLD_POOLS = {
  careers: [
    ["Founder, exited", "Sold the operating company; proceeds are the portfolio"],
    ["Physician", "Partner in a private group practice"],
    ["Attorney", "Equity partner, litigation practice"],
    ["Technology executive", "Senior operating role, significant unvested equity"],
    ["Retired", "Fully retired; the portfolio funds the whole spending need"],
    ["Business owner", "Still operating; company held outside the portfolio"],
    ["Corporate executive", "Deferred compensation and restricted stock outstanding"],
    ["Academic", "Tenured faculty with a 403(b) and a state pension"],
    ["Real estate operator", "Property book held personally and through partnerships"],
    ["Consultant", "Independent practice with a solo 401(k)"],
  ],
  residenceTypes: ["Primary residence", "Second home", "Investment property", "Family compound"],
  cities: {
    IL: ["Winnetka, IL", "Lake Forest, IL", "Hinsdale, IL", "Chicago, IL", "Evanston, IL", "Glencoe, IL"],
    CT: ["Greenwich, CT", "New Canaan, CT", "Darien, CT", "Westport, CT"],
    CO: ["Cherry Hills Village, CO", "Boulder, CO", "Vail, CO", "Denver, CO"],
    FL: ["Naples, FL", "Palm Beach, FL", "Sarasota, FL", "Vero Beach, FL"],
  },
  heldAwayKinds: [
    ["Employer 401(k)", "Not custodied with us; reported for planning only", 1],
    ["Deferred compensation", "Pays out on a fixed schedule", 0],
    ["Concentrated employer stock", "Restricted; sale windows apply", 0],
    ["Private business equity", "Illiquid; independently appraised annually", 0],
    ["Direct real estate partnership", "K-1 reported, quarterly distributions", 0],
    ["Cash and operating deposits", "Held at the family bank", 1],
    ["529 plans held elsewhere", "Legacy accounts from a prior adviser", 1],
    ["Digital assets", "Self-custodied; disclosed for planning only", 1],
    ["Life insurance cash value", "Whole life, in force since inception", 0],
    ["Collectibles and art", "Scheduled on the umbrella policy", 0],
  ],
  liabilityKinds: [
    ["Primary residence mortgage", 0.0412, "2033-06-01"],
    ["Second home mortgage", 0.0538, "2031-09-01"],
    ["Securities-based line of credit", 0.0688, "Revolving"],
    ["Commercial property loan", 0.0574, "2029-03-01"],
    ["Education loans", 0.0450, "2030-12-01"],
  ],
  insuranceKinds: [
    ["Term life", "Northgate Mutual", "Level term, expires at retirement"],
    ["Whole life", "Fairhaven Life", "Cash value counted in the balance sheet"],
    ["Umbrella liability", "Osgood Casualty", "Reviewed against household net worth annually"],
    ["Long-term care", "Cranmere Life", "Hybrid policy with a return-of-premium rider"],
    ["Disability income", "Northgate Mutual", "Own-occupation, to age 65"],
  ],
  eventKinds: [
    ["Liquidity event", "Company sale closed; proceeds funded the portfolio"],
    ["Retirement", "Employment income ends; portfolio distributions begin"],
    ["Property purchase", "Cash reserved and staged out of short duration"],
    ["Education begins", "First tuition draw from the 529 plans"],
    ["Estate documents restated", "Reviewed with counsel and the beneficiary forms updated"],
    ["Gifting programme", "Annual exclusion gifts to the next generation"],
    ["Business transition", "Ownership transfer to management under discussion"],
    ["Charitable gift", "Appreciated stock contributed to the donor-advised fund"],
    ["Trust funding", "Assets retitled into the irrevocable trust"],
    ["Beneficiary review", "Designations confirmed at all three custodians"],
  ],
};

/* Hand-authored profiles for the households the demo opens on. */
const WORLD_ANCHORS = {
  "HH-0001": {
    headline: "Concentrated legacy position is 22% of the household. Staged reduction agreed through 2028.",
    family: [
      { name: "Robert Whitmore", relation: "Client", age: 63, note: "Founder; sold the company in 2019" },
      { name: "Diane Whitmore", relation: "Spouse", age: 61, note: "Retired from the family business in 2020" },
      { name: "Caleb Whitmore", relation: "Son", age: 34, note: "Beneficiary of the 2019 irrevocable trust" },
      { name: "Nora Whitmore-Reyes", relation: "Daughter", age: 31, note: "Beneficiary; two children in the 529 plans" },
      { name: "Two grandchildren", relation: "Grandchildren", age: 7, note: "Ages 7 and 4; 529 plans funded to the exclusion limit" },
    ],
    career: ["Founder, exited", "Sold Whitmore Industrial Supply in November 2019; proceeds are the portfolio"],
    events: [
      { date: "2019-11-04", title: "Company sale closed", note: "$38.4M net proceeds funded the relationship", kind: "past" },
      { date: "2023-05-18", title: "Estate documents restated", note: "Revocable trusts restated; irrevocable trust funded for both children", kind: "past" },
      { date: "2026-03-12", title: "Investment policy reviewed", note: "Tax-Aware Balanced retained; concentration limit set at 15%", kind: "past" },
      { date: "2027-06-01", title: "Second home purchase", note: "$1.8M, Door County. Cash being staged out of short duration", kind: "upcoming" },
      { date: "2029-01-01", title: "Retirement income begins", note: "Portfolio becomes the primary income source at $480k a year", kind: "upcoming" },
    ],
    risks: ["Single position at 22% of household assets", "Second-home purchase inside 24 months"],
  },
  "HH-0002": {
    headline: "Third generation. Four grantor trusts, perpetual horizon, endowment allocation.",
    family: [
      { name: "Katherine Ashcombe", relation: "Trustee", age: 68, note: "Second generation; chairs the family investment committee" },
      { name: "Peter Ashcombe", relation: "Beneficiary", age: 44, note: "Third generation; separate grantor trust" },
      { name: "Louisa Ashcombe-Hart", relation: "Beneficiary", age: 41, note: "Third generation; separate grantor trust" },
      { name: "Five grandchildren", relation: "Fourth generation", age: 19, note: "Ages 12 to 24; education trusts funded" },
    ],
    career: ["Family capital", "No operating business since the 1998 sale; the capital is the enterprise"],
    events: [
      { date: "2008-02-19", title: "Relationship opened", note: "Consolidated from two prior advisers", kind: "past" },
      { date: "2024-09-30", title: "Private markets programme expanded", note: "Commitment pacing raised to $6M a year across four vintages", kind: "past" },
      { date: "2026-01-22", title: "Spending policy reaffirmed", note: "3.8% of a twelve-quarter average", kind: "past" },
      { date: "2026-11-15", title: "Family investment committee", note: "Annual meeting with the third generation attending", kind: "upcoming" },
    ],
    risks: ["Illiquidity at 34% of household assets", "Key-person concentration on a single trustee"],
  },
  "HH-0003": {
    headline: "Two operating businesses still outside the portfolio. Liquidity planning under way for 2027.",
    family: [
      { name: "Julien Delacroix", relation: "Client", age: 57, note: "Owner and operator of both businesses" },
      { name: "Marta Delacroix", relation: "Spouse", age: 55, note: "Chief operating officer of the larger company" },
      { name: "Théo Delacroix", relation: "Son", age: 26, note: "Working in the business; possible successor" },
    ],
    career: ["Business owner", "Two operating companies; a sale process is expected to open in 2027"],
    events: [
      { date: "2012-06-30", title: "Relationship opened", note: "Initial funding from a partial recapitalisation", kind: "past" },
      { date: "2025-04-10", title: "Valuation refreshed", note: "Independent appraisal of both companies for estate purposes", kind: "past" },
      { date: "2027-03-01", title: "Sale process expected to open", note: "Pre-transaction planning with counsel begins in Q4 2026", kind: "upcoming" },
    ],
    risks: ["Over half of net worth sits in illiquid business equity", "No completed pre-transaction estate planning"],
  },
  "HH-0006": {
    headline: "Retired in 2024. The portfolio now funds the entire spending need, and it is 17 months since the last rebalance.",
    family: [
      { name: "Alan Kettering", relation: "Client", age: 71, note: "Retired from a manufacturing career in 2024" },
      { name: "Rosalind Kettering", relation: "Spouse", age: 69, note: "Retired teacher with a state pension" },
    ],
    career: ["Retired", "Both retired. Required minimum distributions begin for Alan in 2028"],
    events: [
      { date: "2024-06-28", title: "Retirement", note: "Employment income ended; distributions began the following quarter", kind: "past" },
      { date: "2026-04-09", title: "Investment policy reviewed", note: "Balanced retained; distribution rate set at 3.9%", kind: "past" },
      { date: "2026-09-30", title: "Rebalance overdue", note: "US large cap has drifted well outside its tolerance band", kind: "upcoming" },
      { date: "2028-04-01", title: "Required minimum distributions begin", note: "Modelled at $214k in the first year", kind: "upcoming" },
    ],
    risks: ["Portfolio has not been rebalanced in 17 months", "Sequence-of-returns risk in the first decade of drawdown"],
  },
};

/* ---------------------------------------------------------
   Build a real-world profile for every household.
   --------------------------------------------------------- */
const WORLD = {};

(function buildWorld() {
  HOUSEHOLDS.forEach((h, hi) => {
    const rnd = _rand("bm-world-" + h.id);
    const anchor = WORLD_ANCHORS[h.id] || {};
    const institutional = h.segment === "Institutional";

    /* --- family --- */
    let family = anchor.family;
    if (!family) {
      if (institutional) {
        family = [
          { name: h.contact, relation: "Primary contact", age: null, note: "Signs on behalf of the governing body" },
          { name: "Investment committee", relation: "Governing body", age: null, note: (3 + Math.floor(rnd() * 5)) + " voting members, meets quarterly" },
        ];
      } else {
        const names = h.contact.split(" & ");
        const primaryAge = 42 + Math.floor(rnd() * 33);
        family = [{ name: names[0], relation: "Client", age: primaryAge, note: "Primary decision maker" }];
        if (names[1]) family.push({ name: names[1], relation: "Spouse", age: primaryAge - 2 + Math.floor(rnd() * 5), note: "Joint on the taxable accounts" });
        const kids = Math.floor(rnd() * 4);
        for (let k = 0; k < kids; k++) {
          family.push({
            name: ["Child", "Child", "Child"][k] + " " + (k + 1),
            relation: rnd() > 0.5 ? "Son" : "Daughter",
            age: Math.max(4, primaryAge - 30 + Math.floor(rnd() * 18)),
            note: primaryAge - 30 + k * 3 < 22 ? "529 plan beneficiary" : "Contingent beneficiary",
          });
        }
      }
    }

    /* --- career --- */
    const career = anchor.career || (institutional
      ? ["Institutional", "Governed by a written spending policy and investment policy statement"]
      : WORLD_POOLS.careers[hi % WORLD_POOLS.careers.length]);

    /* --- residences --- */
    const cityPool = WORLD_POOLS.cities[h.state] || WORLD_POOLS.cities.IL;
    const residences = institutional ? [] : Array.from(
      { length: h.mv > 25e6 ? 3 : h.mv > 8e6 ? 2 : 1 },
      (_, i) => {
        const value = Math.round((h.mv * (i === 0 ? 0.16 : 0.07) * (0.7 + rnd() * 0.7)) / 25000) * 25000;
        return {
          type: WORLD_POOLS.residenceTypes[i],
          location: cityPool[(hi + i) % cityPool.length],
          value,
          mortgage: rnd() > 0.55 ? Math.round(value * (0.18 + rnd() * 0.34) / 25000) * 25000 : 0,
        };
      });

    /* --- assets held away --- */
    const heldAwayCount = institutional ? 1 : 2 + Math.floor(rnd() * 3);
    const heldAway = Array.from({ length: heldAwayCount }, (_, i) => {
      const kind = WORLD_POOLS.heldAwayKinds[(hi * 3 + i * 2) % WORLD_POOLS.heldAwayKinds.length];
      return {
        label: kind[0], note: kind[1], liquid: !!kind[2],
        value: Math.round((h.mv * (0.03 + rnd() * 0.22)) / 25000) * 25000,
      };
    });
    /* The Delacroix business equity is the point of that household, so make it dominant. */
    if (h.id === "HH-0003") {
      heldAway.length = 0;
      heldAway.push({ label: "Private business equity — two operating companies", note: "Independently appraised April 2025; illiquid until a sale process", liquid: false, value: 84000000 });
      heldAway.push({ label: "Cash and operating deposits", note: "Held at the company's commercial bank", liquid: true, value: 3400000 });
    }
    if (h.id === "HH-0001") {
      heldAway.length = 0;
      heldAway.push({ label: "Concentrated legacy position", note: "Held in the joint taxable account; 22% of household assets and the central planning problem", liquid: false, value: 9060000 });
      heldAway.push({ label: "Cash and operating deposits", note: "Held at the family bank; covers eighteen months of spending", liquid: true, value: 840000 });
      heldAway.push({ label: "Collectibles and art", note: "Scheduled on the umbrella policy", liquid: false, value: 620000 });
    }

    /* --- liabilities --- */
    const liabilities = [];
    residences.forEach((r, i) => {
      if (r.mortgage) {
        const k = WORLD_POOLS.liabilityKinds[i === 0 ? 0 : 1];
        liabilities.push({ label: k[0] + " — " + r.location, balance: r.mortgage, rate: k[1], matures: k[2] });
      }
    });
    if (!institutional && rnd() > 0.62) {
      const k = WORLD_POOLS.liabilityKinds[2];
      liabilities.push({ label: k[0], balance: Math.round(h.mv * 0.04 / 25000) * 25000, rate: k[1], matures: k[2] });
    }

    /* --- insurance --- */
    const insurance = institutional ? [] : Array.from(
      { length: 2 + Math.floor(rnd() * 3) },
      (_, i) => {
        const k = WORLD_POOLS.insuranceKinds[(hi + i) % WORLD_POOLS.insuranceKinds.length];
        return { type: k[0], carrier: k[1], note: k[2],
                 benefit: Math.round((h.mv * (0.08 + rnd() * 0.4)) / 50000) * 50000 };
      });

    /* --- entities: derived from the actual registrations, never invented --- */
    const entities = householdAccounts(h.id)
      .filter((a) => /Trust|LLC|Donor|529|Foundation|Partnership/.test(a.registration))
      .map((a) => ({
        name: a.registration,
        type: /Trust/.test(a.registration) ? "Trust"
            : /LLC|Partnership/.test(a.registration) ? "Entity"
            : /Donor/.test(a.registration) ? "Charitable" : "Education",
        role: /Irrevocable/.test(a.registration) ? "Grantor trust, HEMS standard"
            : /Revocable/.test(a.registration) ? "Revocable, grantor is trustee"
            : /Donor/.test(a.registration) ? "Advised by the client"
            : "Custodial",
        value: a.mv,
      }));

    /* --- events --- */
    let events = anchor.events;
    if (!events) {
      events = [];
      const pastCount = 2 + Math.floor(rnd() * 2);
      for (let i = 0; i < pastCount; i++) {
        const k = WORLD_POOLS.eventKinds[(hi * 2 + i) % WORLD_POOLS.eventKinds.length];
        events.push({ date: addDays(h.since, Math.floor(rnd() * 2000)), title: k[0], note: k[1], kind: "past" });
      }
      const upcoming = 1 + Math.floor(rnd() * 2);
      for (let i = 0; i < upcoming; i++) {
        const k = WORLD_POOLS.eventKinds[(hi * 2 + pastCount + i) % WORLD_POOLS.eventKinds.length];
        events.push({ date: addDays(RP.asOf, 60 + Math.floor(rnd() * 900)), title: k[0], note: k[1], kind: "upcoming" });
      }
      events.sort((a, b) => (a.date < b.date ? -1 : 1));
    }

    /* --- cash needs over the next twelve months --- */
    const distributionRate = institutional ? 0.045 + rnd() * 0.012
      : (family[0] && family[0].age > 66) ? 0.034 + rnd() * 0.018
      : rnd() > 0.6 ? 0.012 + rnd() * 0.02 : 0;
    const annualDraw = Math.round((h.mv * distributionRate) / 5000) * 5000;
    const cashNeeds = [];
    if (annualDraw > 0) {
      cashNeeds.push({ when: "Ongoing", amount: annualDraw,
        purpose: institutional ? "Grant and operating distributions" : "Living expenses, distributed quarterly" });
    }
    const nearEvent = events.find((e) => e.kind === "upcoming" && /purchase|Property/i.test(e.title));
    if (nearEvent) cashNeeds.push({ when: fmtDate(nearEvent.date), amount: Math.round(h.mv * 0.045 / 25000) * 25000, purpose: nearEvent.title });
    const call = CAPITAL_CALLS.find((c) => c.hhId === h.id);
    if (call) cashNeeds.push({ when: fmtDate(call.due), amount: call.amount, purpose: "Capital call — " + call.fund });

    /* --- balance sheet --- */
    const heldAwayTotal = heldAway.reduce((s, x) => s + x.value, 0);
    const propertyTotal = residences.reduce((s, x) => s + x.value, 0);
    const debtTotal = liabilities.reduce((s, x) => s + x.balance, 0);
    const netWorth = h.mv + heldAwayTotal + propertyTotal - debtTotal;

    /* --- headline: what an adviser would say about this family today --- */
    const drift = allocationOf(householdPositions(h.id));
    const worstDrift = drift.reduce((m, x) => (Math.abs(x.drift) - x.tolerance > Math.abs(m.drift) - m.tolerance ? x : m), drift[0]);
    const headline = anchor.headline || (
      isDrifted(drift) ? worstDrift.label + " has drifted " + worstDrift.drift.toFixed(1) + " points outside its band; last rebalanced " + h.monthsSinceRebalance + " months ago."
      : h.ipsReview < RP.asOf ? "Investment policy review has been due since " + fmtDate(h.ipsReview) + "."
      : call ? "Capital call of " + fmt$(call.amount) + " to " + call.fund + " due " + fmtDate(call.due) + "."
      : annualDraw > 0 ? "Drawing " + fmt$(annualDraw) + " a year, or " + fmtPct(distributionRate * 100, 1) + " of the portfolio."
      : "Accumulating. No distributions and no open items."
    );

    WORLD[h.id] = {
      hhId: h.id, headline, family, career, residences, heldAway, liabilities,
      insurance, entities, events, cashNeeds,
      distributionRate, annualDraw,
      heldAwayTotal, propertyTotal, debtTotal, netWorth,
      managedShare: h.mv / netWorth,
      risks: anchor.risks || [
        isDrifted(drift) ? "Allocation outside tolerance" : null,
        heldAwayTotal / netWorth > 0.35 ? "Large share of net worth held away from the portfolio" : null,
        debtTotal / netWorth > 0.15 ? "Leverage above 15% of net worth" : null,
        h.ipsReview < RP.asOf ? "Investment policy review past due" : null,
      ].filter(Boolean),
    };
  });
})();

function worldOf(hhId) { return WORLD[hhId]; }
