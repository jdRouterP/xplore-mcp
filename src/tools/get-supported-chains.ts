import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xploreGet, formatError, formatSuccess } from "../lib/xplore-api.js";

export function registerGetSupportedChains(server: McpServer) {
  server.registerTool(
    "get_supported_chains",
    {
      description:
        "List all blockchain networks supported by Xplore for cross-chain and same-chain swaps. Returns chain IDs, names, native tokens, and logos.",
    },
    async () => {
      const { ok, status, data } = await xploreGet("/v1/chains", {});

      if (!ok) return formatError(status, data);
      return formatSuccess(data);
    },
  );
}
