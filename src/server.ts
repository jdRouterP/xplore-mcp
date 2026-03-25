import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TokenDb } from "./lib/token-db.js";
import { pkg } from "./lib/pkg.js";
import { registerSearchTokens } from "./tools/search-tokens.js";
import { registerGetSupportedChains } from "./tools/get-supported-chains.js";
import { registerGetQuote } from "./tools/get-quote.js";
import { registerCreateTransaction } from "./tools/create-transaction.js";
import { registerGetTradeDappUrl } from "./tools/get-trade-dapp-url.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillMd = readFileSync(resolve(__dirname, "../SKILL.md"), "utf-8");

export function createServer(tokenDb: TokenDb) {
  const server = new McpServer({
    name: pkg.name,
    version: pkg.version,
  });

  server.registerTool(
    "get_instructions",
    {
      description:
        "CALL THIS FIRST. Returns the full guide for the Xplore MCP server: " +
        "how to initiate cross-chain and same-chain cryptocurrency swaps and transfers, " +
        "get quotes, create transactions, and generate an app URL " +
        "for the user to complete the transaction. " +
        "Covers the recommended workflow (resolve chains → resolve tokens → get quote → create transaction → generate link) " +
        "and practical tips for every tool in this server.",
    },
    () => ({
      content: [{ type: "text", text: skillMd }],
    }),
  );

  registerSearchTokens(server, tokenDb);
  registerGetSupportedChains(server);
  registerGetQuote(server);
  registerCreateTransaction(server);
  registerGetTradeDappUrl(server);

  return server;
}
