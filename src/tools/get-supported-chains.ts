import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TokenDb } from "../lib/token-db.js";

export function registerGetSupportedChains(server: McpServer, tokenDb: TokenDb) {
  server.registerTool(
    "get_supported_chains",
    {
      description:
        "List all blockchain networks supported by deBridge for cross-chain swaps. Returns chain IDs and names.",
    },
    async () => {
      const chains = tokenDb.getChains();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(chains),
          },
        ],
      };
    },
  );
}
