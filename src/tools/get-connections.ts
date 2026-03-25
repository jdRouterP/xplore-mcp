import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xploreGet, formatError, formatSuccess } from "../lib/xplore-api.js";

export function registerGetConnections(server: McpServer) {
  server.registerTool(
    "get_connections",
    {
      description:
        "List available connections between two chains, including supported tokens and routing tools. Use this to discover what swap routes are available before requesting a quote.",
      inputSchema: {
        fromChain: z
          .string()
          .optional()
          .describe("Source chain ID to filter by. Example: '1' (Ethereum)"),
        toChain: z
          .string()
          .optional()
          .describe("Destination chain ID to filter by. Example: '42161' (Arbitrum)"),
      },
    },
    async (params) => {
      const queryParams: Record<string, string> = {};
      if (params.fromChain) queryParams.fromChain = params.fromChain;
      if (params.toChain) queryParams.toChain = params.toChain;

      const { ok, status, data } = await xploreGet("/v1/connections", queryParams);

      if (!ok) return formatError(status, data);
      return formatSuccess(data);
    },
  );
}
