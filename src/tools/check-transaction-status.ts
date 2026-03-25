import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { xploreGet, formatError, formatSuccess } from "../lib/xplore-api.js";

export function registerCheckTransactionStatus(server: McpServer) {
  server.registerTool(
    "check_transaction_status",
    {
      description:
        "Check the status of a cross-chain transaction by its transaction hash. Returns the current status (PENDING, DONE, FAILED), sending and receiving transaction details, and the bridge/tool used.",
      inputSchema: {
        txHash: z
          .string()
          .describe("Transaction hash to check status for"),
      },
    },
    async (params) => {
      const { ok, status, data } = await xploreGet("/v1/status", {
        txHash: params.txHash,
      });

      if (!ok) return formatError(status, data);
      return formatSuccess(data);
    },
  );
}
