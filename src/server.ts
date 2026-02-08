import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TokenDb } from "./lib/token-db.js";
import { registerSearchTokens } from "./tools/search-tokens.js";
import { registerGetSupportedChains } from "./tools/get-supported-chains.js";
import { registerCreateTx } from "./tools/create-tx.js";

export function createServer(tokenDb: TokenDb) {
  const server = new McpServer({
    name: "debridge-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "get_instructions",
    { description: "Returns usage instructions for the deBridge MCP server" },
    () => ({
      content: [
        {
          type: "text",
          text: [
            "deBridge MCP Server",
            "",
            "This server provides tools for interacting with the deBridge protocol — a cross-chain interoperability layer for DeFi.",
            "",
            "Available tools:",
            "  - get_instructions: Show this help message",
            "  - search_tokens: Search for tokens by name, symbol, or address",
            "  - get_supported_chains: List supported blockchain networks",
            "  - create_tx: Create a cross-chain swap transaction via DLN",
          ].join("\n"),
        },
      ],
    }),
  );

  registerSearchTokens(server, tokenDb);
  registerGetSupportedChains(server, tokenDb);
  registerCreateTx(server);

  return server;
}
