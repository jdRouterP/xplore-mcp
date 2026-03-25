import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xplorePost, formatError, formatSuccess } from "../lib/xplore-api.js";

export function registerCreateTransaction(server: McpServer) {
  server.registerTool(
    "create_transaction",
    {
      description:
        "Create a swap transaction with full route details. Fetches advanced routes and populates each step with transaction data ready for signing. Use get_quote first for a quick estimate, then this tool when ready to build the actual transaction.",
      inputSchema: {
        fromChain: z
          .string()
          .describe("Source chain ID. Examples: '1' (Ethereum), '56' (BNB Chain), '137' (Polygon)"),
        toChain: z
          .string()
          .describe("Destination chain ID. Same as fromChain for same-chain swaps"),
        fromToken: z
          .string()
          .describe(
            "Source token address. Use 0x0000000000000000000000000000000000000000 for native tokens",
          ),
        toToken: z
          .string()
          .describe("Destination token address"),
        fromAmount: z
          .string()
          .describe("Amount in smallest units (wei, lamports)"),
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
      // Step 1: Get advanced routes
      const routesBody = {
        fromChainId: params.fromChain,
        toChainId: params.toChain,
        fromTokenAddress: params.fromToken,
        toTokenAddress: params.toToken,
        fromAmount: params.fromAmount,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        options: {
          slippage: params.slippage,
        },
      };

      const routesResult = await xplorePost("/v1/advanced/routes", {}, routesBody);

      if (!routesResult.ok) return formatError(routesResult.status, routesResult.data);

      const routesData = routesResult.data as { routes?: unknown[] };
      if (!routesData.routes || routesData.routes.length === 0) {
        return formatError(404, { message: "No routes found for this swap" });
      }

      // Pick the first (best) route
      const route = routesData.routes[0] as { steps?: unknown[] };
      if (!route.steps || route.steps.length === 0) {
        return formatSuccess(route);
      }

      // Step 2: Populate each step with transaction data
      const populatedSteps = [];
      for (const step of route.steps) {
        const stepResult = await xplorePost(
          "/v1/advanced/stepTransaction",
          { senderAddress: params.fromAddress },
          step,
        );

        if (!stepResult.ok) return formatError(stepResult.status, stepResult.data);
        populatedSteps.push(stepResult.data);
      }

      return formatSuccess({ ...route, steps: populatedSteps });
    },
  );
}
