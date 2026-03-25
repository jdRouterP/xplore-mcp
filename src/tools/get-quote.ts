import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xploreGet, formatError, formatSuccess } from "../lib/xplore-api.js";

export function registerGetQuote(server: McpServer) {
  server.registerTool(
    "get_quote",
    {
      description:
        "Get a quote for a token swap (same-chain or cross-chain). Returns routing information, estimated output, fees, and transaction data. Use search_tokens first to resolve token names to addresses and get_supported_chains for chain IDs.",
      inputSchema: {
        fromChain: z
          .string()
          .describe("Source chain ID. Examples: '1' (Ethereum), '56' (BNB Chain), '137' (Polygon), '7565164' (Solana)"),
        toChain: z
          .string()
          .describe("Destination chain ID. Same as fromChain for same-chain swaps"),
        fromToken: z
          .string()
          .describe(
            "Source token address. Use 0x0000000000000000000000000000000000000000 for native tokens (ETH, BNB, etc.)",
          ),
        toToken: z
          .string()
          .describe("Destination token address"),
        fromAmount: z
          .string()
          .describe(
            "Amount in smallest units (wei, lamports). Example: '1000000000000000000' for 1 ETH (18 decimals), '1000000' for 1 USDC (6 decimals)",
          ),
        fromAddress: z
          .string()
          .describe("Sender wallet address"),
        toAddress: z
          .string()
          .describe("Recipient wallet address"),
        slippage: z
          .number()
          .optional()
          .default(0.03)
          .describe("Slippage tolerance as a decimal (e.g. 0.03 for 3%). Default: 0.03"),
      },
    },
    async (params) => {
      const queryParams: Record<string, string> = {
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.fromAmount,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        slippage: String(params.slippage),
      };

      const { ok, status, data } = await xploreGet("/v1/quote", queryParams);

      if (!ok) return formatError(status, data);
      return formatSuccess(data);
    },
  );
}
