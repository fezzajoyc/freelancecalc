/**
 * FreelanceCalc core math — currency-agnostic pure functions.
 *
 * Every function here is total (never throws): invalid input (NaN/Infinity,
 * negative where meaningless, zero where it would divide) yields NaN fields
 * so callers can render an honest error state instead of a fake number.
 * Currency never enters the math — engines and MCP handlers only format.
 *
 * Documented semantics (tests/freelance.test.ts locks these):
 *  - requiredRate: (salary + expenses) ÷ (billable weeks × hours/week) × (1 + margin%)
 *  - projectQuote: rush multiplies the HOURS before the rate; each revision
 *    round adds 10% of the pre-rush base; expenses are added last; milestone
 *    amounts are pct/100 × total (pctSum is reported, not enforced).
 *  - invoiceTotals: discount (percent + fixed) applies BEFORE tax and is
 *    capped at the subtotal; exclusive tax adds on top, inclusive tax is
 *    backed out of the total (tax = total × rate/(100+rate)).
 *  - rateHealth: income = rate × billable; utilization = billable ÷ worked;
 *    neededRate = target ÷ billable (the rate that hits the target at the
 *    same billable volume). Billable > worked is allowed and shows >100%.
 */

const NUM = (n: number) => Number.isFinite(n);

function nan<T extends object>(keys: readonly string[]): T {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = NaN;
  return out as T;
}

/* ------------------------------------------------------------------ */
/* 1. Required hourly rate                                             */
/* ------------------------------------------------------------------ */

export type RequiredRateResult = {
  /** salary + business expenses, the amount the year must cover */
  totalCosts: number;
  /** billable weeks × billable hours per week */
  billableHours: number;
  /** totalCosts ÷ billableHours — break-even rate before profit */
  baseRate: number;
  /** 1 + margin/100 */
  marginMultiplier: number;
  /** the answer: baseRate × marginMultiplier */
  requiredHourlyRate: number;
};

/**
 * Required hourly rate from a target annual salary.
 * Default capacity assumption is the honest freelance reality — about 46
 * billable weeks (6 off: holidays, sickness, admin) and 25 billable hours
 * per week (not 40; sales, admin and marketing are unpaid).
 */
export function requiredRate(
  targetSalary: number,
  annualExpenses: number,
  billableWeeks: number,
  billableHoursPerWeek: number,
  profitMarginPct: number,
): RequiredRateResult {
  const valid =
    NUM(targetSalary) && targetSalary >= 0 &&
    NUM(annualExpenses) && annualExpenses >= 0 &&
    NUM(billableWeeks) && billableWeeks > 0 &&
    NUM(billableHoursPerWeek) && billableHoursPerWeek > 0 &&
    NUM(profitMarginPct) && profitMarginPct >= 0;
  if (!valid) return nan<RequiredRateResult>(["totalCosts", "billableHours", "baseRate", "marginMultiplier", "requiredHourlyRate"]);

  const totalCosts = targetSalary + annualExpenses;
  const billableHours = billableWeeks * billableHoursPerWeek;
  const baseRate = totalCosts / billableHours;
  const marginMultiplier = 1 + profitMarginPct / 100;
  return { totalCosts, billableHours, baseRate, marginMultiplier, requiredHourlyRate: baseRate * marginMultiplier };
}

/* ------------------------------------------------------------------ */
/* 2. Project quote                                                    */
/* ------------------------------------------------------------------ */

export type Milestone = { pct: number; amount: number };

export type QuoteResult = {
  /** estimated hours × rate, before any multiplier */
  base: number;
  /** hours after the rush multiplier (rush applies to hours, then × rate) */
  rushHours: number;
  /** rushHours × rate — the labor part of the quote */
  laborTotal: number;
  /** revisionRounds × 10% of base (revisions are priced on the pre-rush base) */
  revisionFee: number;
  /** pass-through project expenses */
  expenses: number;
  /** laborTotal + revisionFee + expenses */
  total: number;
  /** milestone split of total at the given percentages */
  milestones: Milestone[];
  /** sum of the milestone percentages as given (UI warns when ≠ 100) */
  milestonePctSum: number;
  /** total − (total × pctSum/100): what the split leaves unassigned */
  unassigned: number;
};

/** Each revision round adds 10% of the base quote. */
export const REVISION_RATE = 0.1;

/**
 * Quote a project: hours × rate, rush multiplier applied to the hours,
 * revision rounds (+10% of base each), plus expenses, split into milestones.
 * `milestonePcts` defaults to the classic 50/25/25 (start / midway / delivery).
 */
export function projectQuote(
  estimatedHours: number,
  hourlyRate: number,
  rushMultiplier: number,
  revisionRounds: number,
  expenses: number,
  milestonePcts: number[] = [50, 25, 25],
): QuoteResult {
  const valid =
    NUM(estimatedHours) && estimatedHours >= 0 &&
    NUM(hourlyRate) && hourlyRate >= 0 &&
    NUM(rushMultiplier) && rushMultiplier > 0 &&
    NUM(revisionRounds) && revisionRounds >= 0 &&
    NUM(expenses) && expenses >= 0 &&
    Array.isArray(milestonePcts) && milestonePcts.every((p) => NUM(p) && p >= 0);
  if (!valid) {
    return {
      base: NaN, rushHours: NaN, laborTotal: NaN, revisionFee: NaN,
      expenses: NaN, total: NaN, milestones: [], milestonePctSum: NaN, unassigned: NaN,
    };
  }

  const base = estimatedHours * hourlyRate;
  const rushHours = estimatedHours * rushMultiplier;
  const laborTotal = rushHours * hourlyRate;
  const revisionFee = base * REVISION_RATE * revisionRounds;
  const total = laborTotal + revisionFee + expenses;

  const milestonePctSum = milestonePcts.reduce((s, p) => s + p, 0);
  const milestones = milestonePcts.map((p) => ({ pct: p, amount: (total * p) / 100 }));
  return { base, rushHours, laborTotal, revisionFee, expenses, total, milestones, milestonePctSum, unassigned: total - (total * milestonePctSum) / 100 };
}

/* ------------------------------------------------------------------ */
/* 3. Invoice line totals                                              */
/* ------------------------------------------------------------------ */

export type InvoiceLineInput = { qty: number; unitPrice: number };

export type InvoiceTotalsResult = {
  /** Σ qty × unitPrice */
  subtotal: number;
  /** percent + fixed discount, capped at the subtotal */
  discount: number;
  /** subtotal − discount (the taxable base) */
  discountedSubtotal: number;
  /** tax amount. Exclusive: rate% × base. Inclusive: backed out of the total. */
  tax: number;
  /** amount before tax (exclusive: discountedSubtotal; inclusive: total − tax) */
  net: number;
  /** what the client pays */
  total: number;
  /** which tax mode was applied */
  taxInclusive: boolean;
};

/**
 * Invoice math over line items. Discount applies BEFORE tax, and cannot push
 * the total below zero (it is capped at the subtotal). Exclusive tax is added
 * on top of the discounted base; inclusive tax is contained in it and backed
 * out: tax = total × rate/(100+rate).
 */
export function invoiceTotals(
  lines: InvoiceLineInput[],
  taxPct: number,
  taxInclusive: boolean,
  discountPct: number,
  discountFixed: number,
): InvoiceTotalsResult {
  const linesValid = Array.isArray(lines) && lines.every(
    (l) => l && NUM(l.qty) && l.qty >= 0 && NUM(l.unitPrice) && l.unitPrice >= 0,
  );
  const valid =
    linesValid &&
    NUM(taxPct) && taxPct >= 0 &&
    NUM(discountPct) && discountPct >= 0 &&
    NUM(discountFixed) && discountFixed >= 0;
  if (!valid) {
    return { subtotal: NaN, discount: NaN, discountedSubtotal: NaN, tax: NaN, net: NaN, total: NaN, taxInclusive: Boolean(taxInclusive) };
  }

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const discount = Math.min(subtotal, (subtotal * discountPct) / 100 + discountFixed);
  const discountedSubtotal = subtotal - discount;

  if (taxInclusive) {
    const total = discountedSubtotal;
    const tax = (total * taxPct) / (100 + taxPct);
    return { subtotal, discount, discountedSubtotal, tax, net: total - tax, total, taxInclusive: true };
  }
  const tax = (discountedSubtotal * taxPct) / 100;
  return { subtotal, discount, discountedSubtotal, tax, net: discountedSubtotal, total: discountedSubtotal + tax, taxInclusive: false };
}

/* ------------------------------------------------------------------ */
/* 4. Rate health check                                                */
/* ------------------------------------------------------------------ */

export type RateHealthStatus = "shortfall" | "on_target" | "surplus";

export type RateHealthResult = {
  /** current rate × billable hours — what last month actually made */
  income: number;
  /** billable ÷ worked hours × 100 (can exceed 100 if you billed more than you worked) */
  utilizationPct: number;
  /** income − target; negative means shortfall */
  gap: number;
  status: RateHealthStatus;
  /** target ÷ billable hours — the rate that hits the target at this billable volume */
  neededRate: number;
};

const EPS = 1e-9;

/**
 * Compare last month's real numbers against an income target. Honest edges:
 * 0 billable hours → no income and no rate can fix it (neededRate = NaN);
 * billable above worked hours shows utilization above 100% rather than being hidden.
 */
export function rateHealth(
  currentRate: number,
  billableHours: number,
  totalWorkedHours: number,
  targetMonthlyIncome: number,
): RateHealthResult {
  const valid =
    NUM(currentRate) && currentRate >= 0 &&
    NUM(billableHours) && billableHours >= 0 &&
    NUM(totalWorkedHours) && totalWorkedHours > 0 &&
    NUM(targetMonthlyIncome) && targetMonthlyIncome >= 0;
  if (!valid) return { ...nan<RateHealthResult>(["income", "utilizationPct", "gap", "neededRate"]), status: "shortfall" as RateHealthStatus };

  const income = currentRate * billableHours;
  const utilizationPct = (billableHours / totalWorkedHours) * 100;
  const gap = income - targetMonthlyIncome;
  const status: RateHealthStatus = gap < -EPS ? "shortfall" : gap > EPS ? "surplus" : "on_target";
  return { income, utilizationPct, gap, status, neededRate: billableHours > 0 ? targetMonthlyIncome / billableHours : NaN };
}
