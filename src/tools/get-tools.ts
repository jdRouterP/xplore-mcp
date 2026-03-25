import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xploreGet, formatError, formatSuccess } from "../lib/xplore-api.js";

export function registerGetTools(server: McpServer) {
  server.registerTool(
    "get_tools",
    {
      description:
        "List available bridges and DEX exchanges that can be used for routing swaps. Optionally filter by supported chains.",
      inputSchema: {
        chains: z
          .string()
          .optional()
          .describe("Comma-separated chain IDs to filter by. Example: '1,42161'. Omit for all."),
      },
    },
    async (params) => {
      const queryParams: Record<string, string> = {};
      if (params.chains) {
        queryParams.chains = params.chains;
      }

      const { ok, status, data } = await xploreGet("/v1/tools", queryParams);

      if (!ok) return formatError(status, data);
      return formatSuccess(data);
    },
  );
}
