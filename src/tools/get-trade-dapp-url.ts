import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const ROUTER_APP_BASE = "https://app.routerprotocol.com/swap";

export function registerGetDappUrl(server: McpServer) {
  server.registerTool(
    "get_dapp_url",
    {
      description:
        "Generate a Router Protocol app URL that redirects the user to complete a swap in the browser. Use search_tokens to resolve token names to addresses and get_supported_chains for chain IDs before calling this tool.",
      inputSchema: {
        fromChain: z
          .string()
          .describe("Source chain ID. Examples: '1' (Ethereum), '56' (BNB Chain), '137' (Polygon), '7565164' (Solana)"),
        toChain: z
          .string()
          .describe("Destination chain ID. Examples: '1' (Ethereum), '56' (BNB Chain), '42161' (Arbitrum)"),
        fromToken: z
          .string()
          .optional()
          .default("")
          .describe("Token address on the source chain. Leave empty for the chain's native token (ETH, BNB, etc.)"),
        toToken: z
          .string()
          .optional()
          .default("")
          .describe("Token address on the destination chain. Leave empty for the chain's native token"),
        amount: z
          .string()
          .describe("Human-readable amount to swap (e.g. '1.5', '100'). NOT in smallest units — use decimal notation"),
        address: z
          .string()
          .optional()
          .describe("Recipient wallet address on the destination chain. Use when the recipient differs from the sender's connected wallet"),
      },
    },
    async (params) => {
      const url = new URL(ROUTER_APP_BASE);

      url.searchParams.set("fromChain", params.fromChain);
      url.searchParams.set("toChain", params.toChain);
      if (params.fromToken) url.searchParams.set("fromToken", params.fromToken);
      if (params.toToken) url.searchParams.set("toToken", params.toToken);
      url.searchParams.set("amount", params.amount);
      if (params.address) {
        url.searchParams.set("address", params.address);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: url.toString(),
          },
        ],
      };
    },
  );
}
