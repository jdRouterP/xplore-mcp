import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const DLN_API_BASE = "https://dln.debridge.finance/v1.0";

export function registerCreateTx(server: McpServer) {
  server.registerTool(
    "create_tx",
    {
      description:
        "Create a cross-chain swap transaction via the deBridge DLN protocol. Returns transaction data that must be signed and submitted to the source chain. Use search_tokens first to resolve token names to addresses and get_supported_chains to find chain IDs.",
      inputSchema: {
        srcChainId: z
          .string()
          .describe("Source chain ID. Examples: '1' (Ethereum), '56' (BNB Chain), '137' (Polygon), '7565164' (Solana)"),
        srcChainTokenIn: z
          .string()
          .describe(
            "Token address on the source chain to swap from. Use 0x0000000000000000000000000000000000000000 for native tokens (ETH, BNB, etc.)",
          ),
        srcChainTokenInAmount: z
          .string()
          .describe(
            "Amount of source token in smallest units (wei, lamports). Example: '1000000000000000000' for 1 ETH (18 decimals), '1000000' for 1 USDC (6 decimals)",
          ),
        dstChainId: z
          .string()
          .describe("Destination chain ID. Examples: '1' (Ethereum), '56' (BNB Chain), '42161' (Arbitrum)"),
        dstChainTokenOut: z
          .string()
          .describe("Token address on the destination chain to receive"),
        dstChainTokenOutAmount: z
          .string()
          .optional()
          .default("auto")
          .describe("Output amount in smallest units, or 'auto' for best available quote (default: 'auto')"),
        dstChainTokenOutRecipient: z
          .string()
          .describe("Wallet address on the destination chain that will receive the tokens"),
        srcChainOrderAuthorityAddress: z
          .string()
          .describe(
            "Address on the source chain authorized to manage the order (cancel, etc). Typically the sender's wallet address",
          ),
        dstChainOrderAuthorityAddress: z
          .string()
          .describe(
            "Address on the destination chain authorized to manage the order. Typically the recipient's wallet address",
          ),
        affiliateFeePercent: z
          .number()
          .optional()
          .describe("Affiliate fee percentage (e.g. 0.1 for 0.1%)"),
        affiliateFeeRecipient: z
          .string()
          .optional()
          .describe("Wallet address to receive affiliate fees"),
        prependOperatingExpenses: z
          .boolean()
          .optional()
          .describe("Whether to prepend estimated operating expenses to the input amount"),
      },
    },
    async (params) => {
      const url = new URL(`${DLN_API_BASE}/dln/order/create-tx`);

      url.searchParams.set("srcChainId", params.srcChainId);
      url.searchParams.set("srcChainTokenIn", params.srcChainTokenIn);
      url.searchParams.set("srcChainTokenInAmount", params.srcChainTokenInAmount);
      url.searchParams.set("dstChainId", params.dstChainId);
      url.searchParams.set("dstChainTokenOut", params.dstChainTokenOut);
      url.searchParams.set("dstChainTokenOutAmount", params.dstChainTokenOutAmount);
      url.searchParams.set("dstChainTokenOutRecipient", params.dstChainTokenOutRecipient);
      url.searchParams.set("srcChainOrderAuthorityAddress", params.srcChainOrderAuthorityAddress);
      url.searchParams.set("dstChainOrderAuthorityAddress", params.dstChainOrderAuthorityAddress);

      if (params.affiliateFeePercent !== undefined) {
        url.searchParams.set("affiliateFeePercent", String(params.affiliateFeePercent));
      }
      if (params.affiliateFeeRecipient) {
        url.searchParams.set("affiliateFeeRecipient", params.affiliateFeeRecipient);
      }
      if (params.prependOperatingExpenses !== undefined) {
        url.searchParams.set("prependOperatingExpenses", String(params.prependOperatingExpenses));
      }

      const response = await fetch(url.toString());
      const body = await response.json();

      if (!response.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: body.message ?? body.error ?? body, statusCode: response.status }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(body),
          },
        ],
      };
    },
  );
}
