import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TokenDb } from "../lib/token-db.js";

export function registerSearchTokens(server: McpServer, tokenDb: TokenDb) {
  server.registerTool(
    "search_tokens",
    {
      description:
        "Search for tokens by name, symbol, or contract address in the deBridge token database. Returns matching tokens with address, symbol, name, decimals, and chain info. Use this to resolve human-readable token names to contract addresses before creating swap orders.",
      inputSchema: {
        query: z.string().describe(
          "Token name, symbol, or contract address. Examples: 'USDC', 'ethereum', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'",
        ),
        chainId: z.string().optional().describe(
          "Filter by chain ID. Examples: '1' (Ethereum), '42161' (Arbitrum), '7565164' (Solana)",
        ),
        name: z.string().optional().describe(
          "Filter by token name (partial, case-insensitive). Examples: 'coin', 'ether'",
        ),
        limit: z.number().optional().default(10).describe("Max results (default 10)"),
      },
    },
    async ({ query, chainId, name, limit }) => {
      let results = tokenDb.search(query, chainId, limit);
      if (name) {
        const lower = name.toLowerCase();
        results = results.filter((t) =>
          t.names.some((n) => n.toLowerCase().includes(lower)),
        );
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ results, total: results.length, query, chainId, name }),
          },
        ],
      };
    },
  );
}
