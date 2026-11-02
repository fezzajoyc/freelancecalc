import { z } from "zod";
import { invoiceTotals, projectQuote, rateHealth, requiredRate } from "../tools/_lib/freelance";

/**
 * FreelanceCalc MCP tool registry: exposes the same pure functions that power
 * the website's four calculators (tools/_lib/freelance.ts). Humans and AI run
 * the same tested math — the math is currency-agnostic: every amount is a
 * plain number in whatever currency the caller is using.
 */

const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const err = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const });

/** Round for output; keeps JSON free of float noise (never feeds it NaN — guarded at call sites). */
const r = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;

export type McpToolDef = {
  name: string;
  title: string;
  description: string;
  schema: Record<string, any>;
  run: (args: any) => { content: { type: "text"; text: string }[]; isError?: boolean };
};

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "required_rate",
    title: "Required hourly rate",
    description:
      "Derive the hourly rate a freelancer must charge: (target annual salary + business expenses) ÷ (billable weeks × billable hours per week) × (1 + profit margin). Honest defaults reflect freelance reality: 46 billable weeks/year (6 off) and 25 billable hours/week — not 40. Currency-agnostic: all amounts are plain numbers.",
    schema: {
      target_salary: z.number().min(0).describe("annual take-home you want, in your currency"),
      annual_expenses: z.number().min(0).default(0).describe("business expenses per year: software, insurance, gear, accounting"),
      billable_weeks: z.number().positive().max(52).default(46).describe("weeks per year you will actually bill (46 = 52 − 6 off/sick/admin)"),
      billable_hours_per_week: z.number().positive().max(80).default(25).describe("hours per week you will actually bill (25 ≈ freelance reality, not 40)"),
      profit_margin_pct: z.number().min(0).default(0).describe("profit margin % for slow months and growth (10–20 typical)"),
    },
    run: (a) => {
      const res = requiredRate(a.target_salary, a.annual_expenses, a.billable_weeks, a.billable_hours_per_week, a.profit_margin_pct);
      if (!Number.isFinite(res.requiredHourlyRate)) {
        return err("invalid input: salary/expenses/margin must be ≥ 0, and billable weeks and hours must be > 0 — with no billable time there is no rate");
      }
      return json({
        required_hourly_rate: r(res.requiredHourlyRate, 4),
        break_even_rate: r(res.baseRate, 4),
        total_to_cover: r(res.totalCosts),
        billable_hours_per_year: r(res.billableHours, 2),
        margin_multiplier: r(res.marginMultiplier, 4),
        formula: `(${a.target_salary} + ${a.annual_expenses}) ÷ (${a.billable_weeks} × ${a.billable_hours_per_week} = ${r(res.billableHours, 2)} h) × ${r(res.marginMultiplier, 4)}`,
      });
    },
  },
  {
    name: "project_quote",
    title: "Project quote",
    description:
      "Quote a freelance project: estimated hours × hourly rate with a rush multiplier applied to the hours, each revision round adding 10% of the base, expenses added last, then the total split into milestone payments (50/25/25 by default). Currency-agnostic: all amounts are plain numbers.",
    schema: {
      estimated_hours: z.number().min(0).describe("estimated working hours"),
      hourly_rate: z.number().min(0).describe("your hourly rate in your currency"),
      rush_multiplier: z.number().positive().default(1).describe("×1 none, ×1.25/×1.5/×2 rush — applied to the hours before the rate"),
      revision_rounds: z.number().int().min(0).default(0).describe("contracted revision rounds; each adds 10% of the base (hours × rate)"),
      expenses: z.number().min(0).default(0).describe("project expenses to pass through: licenses, plugins, travel"),
      milestone_pcts: z.array(z.number().min(0)).default([50, 25, 25]).describe("milestone payment percentages of the total"),
    },
    run: (a) => {
      const res = projectQuote(a.estimated_hours, a.hourly_rate, a.rush_multiplier, a.revision_rounds, a.expenses, a.milestone_pcts);
      if (!Number.isFinite(res.total)) {
        return err("invalid input: hours/rate/revisions/expenses must be ≥ 0 and the rush multiplier > 0");
      }
      return json({
        base: r(res.base),
        rush_hours: r(res.rushHours, 4),
        labor_total: r(res.laborTotal),
        revision_fee: r(res.revisionFee),
        expenses: r(res.expenses),
        total: r(res.total),
        milestone_pct_sum: r(res.milestonePctSum, 4),
        unassigned_by_split: r(res.unassigned),
        milestones: res.milestones.map((m, i) => ({ payment: i + 1, pct: m.pct, amount: r(m.amount) })),
        formula: `hours × rush × rate + rounds × 10% × base + expenses = ${r(res.total)}`,
      });
    },
  },
  {
    name: "invoice_totals",
    title: "Invoice line totals",
    description:
      "Total an invoice from line items. Order of operations is fixed: discount (percent + fixed, capped at the subtotal) applies BEFORE tax; exclusive tax is added on top, inclusive tax is backed out of the total (tax = total × rate/(100+rate)). Currency-agnostic: all amounts are plain numbers.",
    schema: {
      lines: z
        .array(z.object({ qty: z.number().min(0), unit_price: z.number().min(0) }))
        .min(1)
        .describe("line items; line amount = qty × unit_price"),
      tax_pct: z.number().min(0).default(0).describe("tax/VAT/sales-tax rate in %"),
      tax_inclusive: z.boolean().default(false).describe("true when unit prices already contain the tax"),
      discount_pct: z.number().min(0).default(0).describe("percentage discount off the subtotal"),
      discount_fixed: z.number().min(0).default(0).describe("fixed discount amount off the subtotal"),
    },
    run: (a) => {
      const lines = (a.lines as { qty: number; unit_price: number }[]).map((l) => ({ qty: l.qty, unitPrice: l.unit_price }));
      const res = invoiceTotals(lines, a.tax_pct, a.tax_inclusive, a.discount_pct, a.discount_fixed);
      if (!Number.isFinite(res.total)) {
        return err("invalid input: quantities, unit prices, tax rate and discounts must be non-negative numbers");
      }
      return json({
        subtotal: r(res.subtotal),
        discount: r(res.discount),
        discounted_subtotal: r(res.discountedSubtotal),
        tax: r(res.tax, 4),
        net_before_tax: r(res.net, 4),
        total: r(res.total),
        tax_inclusive: res.taxInclusive,
        order: "discount → tax",
      });
    },
  },
  {
    name: "rate_health",
    title: "Rate health check",
    description:
      "Check a freelance rate against last month's reality: income = rate × billable hours vs a monthly target; utilization = billable ÷ total worked hours; needed rate = target ÷ billable hours (the rate that hits the target at this billable volume). Currency-agnostic: all amounts are plain numbers.",
    schema: {
      current_rate: z.number().min(0).describe("your current hourly rate"),
      billable_hours: z.number().min(0).describe("hours you actually billed last month"),
      total_worked_hours: z.number().positive().describe("hours you actually worked last month (denominator of utilization)"),
      target_monthly_income: z.number().min(0).describe("the monthly income you need, same currency as current_rate"),
    },
    run: (a) => {
      const res = rateHealth(a.current_rate, a.billable_hours, a.total_worked_hours, a.target_monthly_income);
      if (!Number.isFinite(res.income)) {
        return err("invalid input: rate/billable/target must be ≥ 0 and total worked hours > 0");
      }
      if (!Number.isFinite(res.neededRate)) {
        return err("0 billable hours: income is zero and no rate can reach the target — the fix is billable work, not pricing");
      }
      return json({
        income: r(res.income),
        utilization_pct: r(res.utilizationPct, 4),
        gap: r(res.gap),
        status: res.status,
        needed_rate: r(res.neededRate, 4),
        note: "needed_rate assumes the same billable volume; more billable hours lower it proportionally. 50–70% utilization is typical for freelancers.",
      });
    },
  },
];
