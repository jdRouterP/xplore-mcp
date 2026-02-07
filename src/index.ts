import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TokenDb } from "./lib/token-db.js";
import { createServer } from "./server.js";

const tokenDb = TokenDb.load();
const server = createServer(tokenDb);
const transport = new StdioServerTransport();
await server.connect(transport);
