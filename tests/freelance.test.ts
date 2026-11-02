import { describe, expect, it } from "vitest";
import { invoiceTotals, projectQuote, rateHealth, requiredRate } from "@/tools/_lib/freelance";

/**
 * Hand-computed vectors for FreelanceCalc's core math (tools/_lib/freelance.ts).
 * Every number below is computed by hand in a comment next to the assertion.
 * The pure functions are total: invalid input must yield NaN fields, never throw.
 */

const closeTo = (received: number, expected: number, dp = 6) => expect(received).toBeCloseTo(expected, dp);

/* ------------------------------------------------------------------ */
/* requiredRate — (salary + expenses) ÷ (weeks × h/week) × (1 + margin) */
/* ------------------------------------------------------------------ */

describe("requiredRate", () => {
  it("66000 over 46w × 25h = 57.3913/h before margin, 68.8696/h at 20%", () => {
    // (60000 + 6000) / (46 × 25) = 66000 / 1150 = 57.3913043478…
    const base = requiredRate(60000, 6000, 46, 25, 0);
    closeTo(base.totalCosts, 66000);
    expect(base.billableHours).toBe(1150);
    closeTo(base.baseRate, 66000 / 1150);
    closeTo(base.baseRate, 57.3913043478);
    closeTo(base.requiredHourlyRate, 57.3913043478);
    closeTo(base.marginMultiplier, 1);

    // × 1.20 → 68.8695652173…
    const withMargin = requiredRate(60000, 6000, 46, 25, 20);
    closeTo(withMargin.requiredHourlyRate, 68.8695652174);
    closeTo(withMargin.marginMultiplier, 1.2);
  });

  it("57500 over the 46×25 default capacity is exactly 50/h with zero margin", () => {
    const r = requiredRate(57500, 0, 46, 25, 0);
    closeTo(r.requiredHourlyRate, 50, 10);
  });

  it("margin 100% doubles the break-even rate", () => {
    // 57.3913 × 2
    closeTo(requiredRate(60000, 6000, 46, 25, 100).requiredHourlyRate, 114.7826086957);
  });

  it("zero expenses and zero margin leave only the salary to cover", () => {
    const r = requiredRate(50000, 0, 50, 20, 0);
    closeTo(r.totalCosts, 50000);
    expect(r.billableHours).toBe(1000);
    closeTo(r.requiredHourlyRate, 50, 10);
  });

  it("stays finite at extreme but valid scale (1e21 target, fractional hours)", () => {
    const r = requiredRate(1e21, 0, 52, 7.5, 5);
    expect(Number.isFinite(r.requiredHourlyRate)).toBe(true);
    // relative comparison — absolute dp is meaningless at 1e18; margin 5% → ×1.05
    expect(r.requiredHourlyRate / ((1e21 / (52 * 7.5)) * 1.05)).toBeCloseTo(1, 9);
  });

  it("zero or negative billable capacity, negatives, margin < 0 and non-numbers all yield NaN without throwing", () => {
    for (const args of [
      [60000, 6000, 0, 25, 10], // weeks 0 → divide by zero
      [60000, 6000, 46, 0, 10], // hours/week 0
      [60000, 6000, -46, 25, 10], // negative weeks
      [-60000, 6000, 46, 25, 10], // negative salary
      [60000, -1, 46, 25, 10], // negative expenses
      [60000, 6000, 46, 25, -5], // negative margin
      [NaN, 6000, 46, 25, 10],
      [60000, Infinity, 46, 25, 10], // Infinity is not a valid amount
      ["60000" as unknown as number, 6000, 46, 25, 10], // strings are not numbers
    ]) {
      const r = requiredRate(args[0], args[1], args[2], args[3], args[4]);
      expect(Number.isFinite(r.requiredHourlyRate), JSON.stringify(args)).toBe(false);
      expect(Number.isNaN(r.requiredHourlyRate), JSON.stringify(args)).toBe(true);
    }
  });

  it("round-trips: rate × billable hours ÷ margin multiplier = total costs", () => {
    const r = requiredRate(82000, 9000, 44, 22, 15);
    closeTo((r.requiredHourlyRate * r.billableHours) / r.marginMultiplier, r.totalCosts, 6);
  });
});

/* ------------------------------------------------------------------ */
/* projectQuote — rush × hours, revisions = 10% of base each, 50/25/25  */
/* ------------------------------------------------------------------ */

describe("projectQuote", () => {
  it("20h @ 50, rush ×1.5, 2 revisions, 100 expenses → 1800 with 900/450/450 milestones", () => {
    // base = 20 × 50 = 1000; rush hours = 30 → labor 1500
    // revisions = 2 × 10% × base(1000, pre-rush) = 200; expenses 100
    // total = 1500 + 200 + 100 = 1800
    const q = projectQuote(20, 50, 1.5, 2, 100);
    closeTo(q.base, 1000);
    closeTo(q.rushHours, 30);
    closeTo(q.laborTotal, 1500);
    closeTo(q.revisionFee, 200);
    closeTo(q.expenses, 100);
    closeTo(q.total, 1800);
    expect(q.milestones.map((m) => m.amount)).toEqual([900, 450, 450]);
    expect(q.milestones.map((m) => m.pct)).toEqual([50, 25, 25]);
    closeTo(q.milestonePctSum, 100);
    closeTo(q.unassigned, 0);
  });

  it("rush applies to the hours before the rate, revisions price on the pre-rush base", () => {
    // labor = 20 × 2 × 50 = 2000; revisions = 3 × 100 = 300 → 2300 (not 2200 on the rushed base)
    const q = projectQuote(20, 50, 2, 3, 0);
    closeTo(q.laborTotal, 2000);
    closeTo(q.revisionFee, 300);
    closeTo(q.total, 2300);
  });

  it("without rush and revisions the quote is just hours × rate plus expenses", () => {
    const q = projectQuote(10, 100, 1, 0, 250);
    closeTo(q.total, 1250);
    closeTo(q.rushHours, 10);
  });

  it("splits at custom percentages and reports what a non-100% split leaves unassigned", () => {
    const even = projectQuote(10, 100, 1, 0, 0, [40, 30, 30]);
    expect(even.milestones.map((m) => m.amount)).toEqual([400, 300, 300]);
    closeTo(even.unassigned, 0);

    const partial = projectQuote(10, 100, 1, 0, 0, [60, 30]);
    expect(partial.milestones.map((m) => m.amount)).toEqual([600, 300]);
    closeTo(partial.milestonePctSum, 90);
    closeTo(partial.unassigned, 100); // 10% of 1000 stays unassigned

    const two = projectQuote(10, 100, 1, 0, 0, [50, 50]);
    expect(two.milestones.map((m) => m.amount)).toEqual([500, 500]);

    const none = projectQuote(10, 100, 1, 0, 0, []);
    expect(none.milestones).toEqual([]);
    closeTo(none.milestonePctSum, 0);
    closeTo(none.unassigned, 1000);
  });

  it("fractional revision rounds scale linearly (UI/MCP layer enforces integers)", () => {
    // 1.5 rounds × 10% × 1000 = 150
    closeTo(projectQuote(20, 50, 1, 1.5, 0).revisionFee, 150);
  });

  it("zero-hour freebies are valid: everything zero except expenses", () => {
    const q = projectQuote(0, 50, 1.5, 2, 75);
    closeTo(q.base, 0);
    closeTo(q.total, 75);
  });

  it("negative hours/rate/revisions/expenses, rush ≤ 0, NaN and negative percentages yield NaN without throwing", () => {
    const cases: any[] = [
      [-20, 50, 1.5, 2, 100, [50, 25, 25]], // negative hours
      [20, -50, 1.5, 2, 100, [50, 25, 25]], // negative rate
      [20, 50, 0, 2, 100, [50, 25, 25]], // rush ×0 would erase labor
      [20, 50, -2, 2, 100, [50, 25, 25]],
      [20, 50, 1.5, -1, 100, [50, 25, 25]], // negative revisions
      [20, 50, 1.5, 2, -100, [50, 25, 25]], // negative expenses
      [20, 50, 1.5, 2, 100, [50, -5, 25]], // negative milestone pct
      [NaN, 50, 1.5, 2, 100, [50, 25, 25]],
      [20, 50, Infinity, 2, 100, [50, 25, 25]],
      [20, 50, 1.5, 2, 100, "50/25/25"], // not an array
    ];
    for (const args of cases) {
      const q = projectQuote(args[0], args[1], args[2], args[3], args[4], args[5]);
      expect(Number.isNaN(q.total), JSON.stringify(args)).toBe(true);
      expect(q.milestones.length === 0 || q.milestones.every((m) => Number.isFinite(m.amount)), JSON.stringify(args)).toBe(true);
    }
  });

  it("round-trips: total = labor + revision fee + expenses, exactly", () => {
    const q = projectQuote(17.5, 83.2, 1.25, 2, 46.5, [40, 35, 25]);
    closeTo(q.total, q.laborTotal + q.revisionFee + q.expenses, 9);
    closeTo(q.milestones.reduce((s, m) => s + m.amount, 0), (q.total * q.milestonePctSum) / 100, 9);
  });
});

/* ------------------------------------------------------------------ */
/* invoiceTotals — discount before tax, exclusive adds, inclusive backs */
/* ------------------------------------------------------------------ */

describe("invoiceTotals", () => {
  const twoLines = [
    { qty: 2, unitPrice: 50 },
    { qty: 2, unitPrice: 50 },
  ];

  it("200 subtotal, 10% discount, 10% exclusive tax → 198 with discount applied before tax", () => {
    // subtotal 200 → discount 20 → base 180 → tax 18 → total 198
    const r = invoiceTotals(twoLines, 10, false, 10, 0);
    closeTo(r.subtotal, 200);
    closeTo(r.discount, 20);
    closeTo(r.discountedSubtotal, 180);
    closeTo(r.tax, 18);
    closeTo(r.net, 180);
    closeTo(r.total, 198);
    expect(r.taxInclusive).toBe(false);
  });

  it("inclusive tax stays inside the total: 180 base at 10% → tax 16.3636, net 163.6364, client pays 180", () => {
    // tax = 180 × 10/110 = 16.363636…; net = 163.636363…
    const r = invoiceTotals(twoLines, 10, true, 10, 0);
    closeTo(r.total, 180);
    closeTo(r.tax, 16.3636363636);
    closeTo(r.net, 163.6363636364);
    closeTo(r.net + r.tax, r.total, 9);
  });

  it("exclusive and inclusive are consistent through the closed formulas", () => {
    // exclusive: total = base × (1 + rate); inclusive: net = total ÷ (1 + rate)
    const excl = invoiceTotals(twoLines, 21, false, 0, 0);
    closeTo(excl.total, excl.discountedSubtotal * 1.21, 9);
    const incl = invoiceTotals(twoLines, 21, true, 0, 0);
    closeTo(incl.net, incl.total / 1.21, 9);
    // same base: exclusive total equals inclusive total × (1 + rate)
    closeTo(excl.total, incl.total * 1.21, 9);
  });

  it("percent and fixed discounts combine before tax", () => {
    // 200 − (10% + 10) = 170 → tax 17 → 187
    const r = invoiceTotals(twoLines, 10, false, 10, 10);
    closeTo(r.discount, 30);
    closeTo(r.discountedSubtotal, 170);
    closeTo(r.total, 187);
  });

  it("discount is capped at the subtotal: the total reaches zero but never goes negative", () => {
    const r = invoiceTotals(twoLines, 10, false, 50, 500);
    closeTo(r.discount, 200);
    closeTo(r.discountedSubtotal, 0);
    closeTo(r.tax, 0);
    closeTo(r.total, 0);
  });

  it("an empty invoice and zero-qty lines are valid zeros", () => {
    const empty = invoiceTotals([], 10, false, 0, 0);
    expect(empty.subtotal).toBe(0);
    expect(empty.total).toBe(0);
    const zeroQty = invoiceTotals([{ qty: 0, unitPrice: 50 }], 10, false, 0, 0);
    expect(zeroQty.total).toBe(0);
  });

  it("fractional quantities and prices compute line math exactly", () => {
    // 1.5 × 20 = 30, no tax no discount
    const r = invoiceTotals([{ qty: 1.5, unitPrice: 20 }], 0, false, 0, 0);
    closeTo(r.subtotal, 30);
    closeTo(r.total, 30);
  });

  it("stays finite at extreme scale (1e9 per line)", () => {
    const r = invoiceTotals([{ qty: 1e9, unitPrice: 2 }], 7.5, false, 0, 0);
    expect(Number.isFinite(r.total)).toBe(true);
    closeTo(r.total, 2e9 * 1.075, 4);
  });

  it("negative prices/qty, negative tax or discount, NaN/Infinity inputs and non-arrays yield NaN without throwing", () => {
    const cases: any[] = [
      [[{ qty: 2, unitPrice: -50 }], 10, false, 0, 0],
      [[{ qty: -2, unitPrice: 50 }], 10, false, 0, 0],
      [twoLines, -10, false, 0, 0],
      [twoLines, 10, false, -10, 0],
      [twoLines, 10, false, 0, -10],
      [[{ qty: NaN, unitPrice: 50 }], 10, false, 0, 0],
      [[{ qty: 2, unitPrice: Infinity }], 10, false, 0, 0],
      [null, 10, false, 0, 0],
      [[{ qty: 2, unitPrice: "50" }], 10, false, 0, 0],
    ];
    for (const [lines, tax, incl, pct, fixed] of cases) {
      const r = invoiceTotals(lines, tax, incl, pct, fixed);
      expect(Number.isNaN(r.total), JSON.stringify([lines, tax])).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ */
/* rateHealth — income vs target, utilization, needed rate              */
/* ------------------------------------------------------------------ */

describe("rateHealth", () => {
  it("rate 50 × 100h vs target 6000 → income 5000, shortfall 1000, needed rate 60", () => {
    const r = rateHealth(50, 100, 160, 6000);
    closeTo(r.income, 5000);
    closeTo(r.utilizationPct, 62.5); // 100/160
    closeTo(r.gap, -1000);
    expect(r.status).toBe("shortfall");
    closeTo(r.neededRate, 60); // 6000 / 100
  });

  it("an exact hit is on_target, a positive gap is surplus", () => {
    const hit = rateHealth(50, 100, 160, 5000);
    closeTo(hit.gap, 0);
    expect(hit.status).toBe("on_target");

    const over = rateHealth(70, 100, 160, 6000);
    closeTo(over.gap, 1000);
    expect(over.status).toBe("surplus");
    closeTo(over.neededRate, 60); // still target ÷ billable
  });

  it("billable above worked hours shows utilization above 100% instead of hiding it", () => {
    const r = rateHealth(50, 120, 100, 5000);
    closeTo(r.utilizationPct, 120);
    expect(r.status).toBe("surplus");
  });

  it("zero billable hours: zero income, honest shortfall, and no rate can fix it (neededRate NaN)", () => {
    const r = rateHealth(50, 0, 160, 6000);
    expect(r.income).toBe(0);
    closeTo(r.utilizationPct, 0);
    closeTo(r.gap, -6000);
    expect(r.status).toBe("shortfall");
    expect(Number.isNaN(r.neededRate)).toBe(true);
  });

  it("zero target at zero billable is on target (nothing owed)", () => {
    const r = rateHealth(50, 0, 160, 0);
    expect(r.income).toBe(0);
    expect(r.gap).toBe(0);
    expect(r.status).toBe("on_target");
    expect(Number.isNaN(r.neededRate)).toBe(true);
  });

  it("negative rate or target, worked hours of 0 and non-numbers yield NaN without throwing", () => {
    for (const [rate, billable, worked, target] of [
      [-50, 100, 160, 6000],
      [50, -100, 160, 6000],
      [50, 100, 0, 6000], // division by zero in utilization
      [50, 100, -160, 6000],
      [50, 100, 160, -6000],
      [NaN, 100, 160, 6000],
      [50, Infinity, 160, 6000],
      ["50" as unknown as number, 100, 160, 6000],
    ]) {
      const r = rateHealth(rate, billable, worked, target);
      expect(Number.isNaN(r.income), JSON.stringify([rate, billable, worked])).toBe(true);
    }
  });

  it("round-trips: income ÷ billable hours equals the current rate", () => {
    const r = rateHealth(63.7, 87.5, 150, 7000);
    closeTo(r.income / 87.5, 63.7, 9);
  });
});
