import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MCP_TOOLS } from "./tools";

/**
 * FreelanceCalc MCP server (stdio): exposes the pure functions behind the
 * site's four freelance money calculators as AI-executable tools.
 * Humans and AI run the same tested implementation.
 *
 * 构建后运行:npx freelancecalc-mcp(或 node mcp/dist/server.mjs)
 */

export function createServer() {
  const server = new McpServer(
    { name: "freelancecalc", version: "1.0.0" },
    {
      instructions:
        "FreelanceCalc: freelance rate and money calculators (https://freelancecalc.app). These executable tools run the same tested logic as the website. All math is currency-agnostic — every amount is a plain number in the caller's currency; no conversion or formatting is applied. Required-rate defaults model freelance reality (46 billable weeks/year, 25 billable hours/week). Results are estimates for planning, not financial advice.",
    },
  );

  for (const tool of MCP_TOOLS) {
    server.registerTool(tool.name, {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.schema,
    }, async (args) => {
      try {
        return tool.run(args ?? {});
      } catch (e) {
        return {
          content: [{ type: "text" as const, text: `error: ${(e as Error).message}` }],
          isError: true,
        };
      }
    });
  }
  return server;
}

export async function runStdio() {
  const server = createServer();
  await server.connect(new StdioServerTransport());
  // stdio 模式下保持进程存活;stderr 可写日志(stdout 是协议通道)
  console.error(`freelancecalc MCP server: ${MCP_TOOLS.length} tools ready`);
}

if (process.argv[1] && process.argv[1].includes("server")) {
  void runStdio();
}
