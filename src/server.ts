import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createServer() {
  const server = new McpServer({
    name: "debridge-mcp",
    version: "0.1.0",
  });

  server.tool("get-instructions", "Returns usage instructions for the deBridge MCP server", () => ({
    content: [
      {
        type: "text",
        text: [
          "deBridge MCP Server",
          "",
          "This server provides tools for interacting with the deBridge protocol — a cross-chain interoperability layer for DeFi.",
          "",
          "Available tools:",
          "  - get-instructions: Show this help message",
        ].join("\n"),
      },
    ],
  }));

  return server;
}
