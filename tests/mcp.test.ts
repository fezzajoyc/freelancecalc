import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "@/mcp/server";

async function connect() {
  const server = createServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

const body = (r: any) => JSON.parse(r.content[0].text);

describe("freelancecalc MCP server", () => {
  it("exposes the four money tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["invoice_totals", "project_quote", "rate_health", "required_rate"]);
    await client.close();
  });

  it("required_rate: 60000 + 6000 over 46w × 25h at 20% margin → 68.8696/h", async () => {
    const client = await connect();
    const r = await client.callTool({
      name: "required_rate",
      arguments: { target_salary: 60000, annual_expenses: 6000, billable_weeks: 46, billable_hours_per_week: 25, profit_margin_pct: 20 },
    });
    const parsed = body(r);
    expect(parsed.required_hourly_rate).toBeCloseTo(68.8696, 3);
    expect(parsed.break_even_rate).toBeCloseTo(57.3913, 3);
    expect(parsed.billable_hours_per_year).toBe(1150);
    expect(parsed.formula).toContain("1150");
    await client.close();
  });

  it("required_rate: defaults apply (46 weeks, 25 h, 0 margin)", async () => {
    const client = await connect();
    const r = await client.callTool({ name: "required_rate", arguments: { target_salary: 57500 } });
    const parsed = body(r);
    expect(parsed.billable_hours_per_year).toBe(1150);
    expect(parsed.required_hourly_rate).toBeCloseTo(50, 6);
    await client.close();
  });

  it("project_quote: 20h @ 50 with rush ×1.5, 2 revisions, 100 expenses → 1800 split 900/450/450", async () => {
    const client = await connect();
    const r = await client.callTool({
      name: "project_quote",
      arguments: { estimated_hours: 20, hourly_rate: 50, rush_multiplier: 1.5, revision_rounds: 2, expenses: 100 },
    });
    const parsed = body(r);
    expect(parsed.base).toBe(1000); // revisions price on the pre-rush base
    expect(parsed.rush_hours).toBe(30); // rush multiplies the hours
    expect(parsed.labor_total).toBe(1500);
    expect(parsed.revision_fee).toBe(200);
    expect(parsed.total).toBe(1800);
    expect(parsed.milestones).toEqual([
      { payment: 1, pct: 50, amount: 900 },
      { payment: 2, pct: 25, amount: 450 },
      { payment: 3, pct: 25, amount: 450 },
    ]);
    await client.close();
  });

  it("invoice_totals: 10% discount before 10% exclusive tax on 200 → 198; inclusive backs the tax out", async () => {
    const client = await connect();
    const excl = await client.callTool({
      name: "invoice_totals",
      arguments: {
        lines: [{ qty: 2, unit_price: 50 }, { qty: 2, unit_price: 50 }],
        tax_pct: 10, discount_pct: 10,
      },
    });
    const e = body(excl);
    expect(e.subtotal).toBe(200);
    expect(e.discount).toBe(20);
    expect(e.discounted_subtotal).toBe(180);
    expect(e.tax).toBeCloseTo(18, 6);
    expect(e.total).toBeCloseTo(198, 6);
    expect(e.order).toBe("discount → tax");

    const incl = await client.callTool({
      name: "invoice_totals",
      arguments: { lines: [{ qty: 4, unit_price: 50 }], tax_pct: 10, tax_inclusive: true },
    });
    const i = body(incl);
    expect(i.total).toBe(200);
    expect(i.tax).toBeCloseTo(18.1818, 3); // backed out of the total
    expect(i.net_before_tax).toBeCloseTo(181.8182, 3);
    await client.close();
  });

  it("rate_health: rate 50 × 100h vs target 6000 → 5000 income, 1000 shortfall, 60/h needed", async () => {
    const client = await connect();
    const r = await client.callTool({
      name: "rate_health",
      arguments: { current_rate: 50, billable_hours: 100, total_worked_hours: 160, target_monthly_income: 6000 },
    });
    const parsed = body(r);
    expect(parsed.income).toBe(5000);
    expect(parsed.utilization_pct).toBeCloseTo(62.5, 6);
    expect(parsed.gap).toBe(-1000);
    expect(parsed.status).toBe("shortfall");
    expect(parsed.needed_rate).toBeCloseTo(60, 6);
    await client.close();
  });

  it("handles invalid input at two layers: schema (zod → isError) and logic (NaN → isError, never null)", async () => {
    const client = await connect();
    // schema layer: negative salary is rejected by zod and surfaced as an isError result
    const schemaBad = await client.callTool({ name: "required_rate", arguments: { target_salary: -1 } });
    expect((schemaBad as any).isError).toBe(true);
    expect((schemaBad.content as any)[0].text).toContain("-32602");
    // schema layer: zero billable weeks is rejected by zod (.positive) and surfaced as an isError result
    const zeroWeeks = await client.callTool({ name: "required_rate", arguments: { target_salary: 100, billable_weeks: 0 } });
    expect((zeroWeeks as any).isError).toBe(true);
    expect((zeroWeeks.content as any)[0].text).toContain("-32602");
    // logic layer: zero billable hours in rate_health → honest error, never a JSON null from NaN
    const zeroBillable = await client.callTool({
      name: "rate_health",
      arguments: { current_rate: 50, billable_hours: 0, total_worked_hours: 160, target_monthly_income: 6000 },
    });
    expect((zeroBillable as any).isError).toBe(true);
    expect((zeroBillable.content as any)[0].text).toContain("no rate can reach the target");
    await client.close();
  });
});
