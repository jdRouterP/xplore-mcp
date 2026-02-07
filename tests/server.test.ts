import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

describe("debridge-mcp server", () => {
  let client: Client;
  let closeTransports: () => Promise<void>;

  beforeEach(async () => {
    const server = createServer();
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);

    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);

    closeTransports = async () => {
      await clientTransport.close();
      await serverTransport.close();
    };
  });

  afterEach(async () => {
    await closeTransports();
  });

  it("returns server info on initialize", async () => {
    const info = client.getServerVersion();
    expect(info).toEqual({ name: "debridge-mcp", version: "0.1.0" });
  });

  it("lists tools", async () => {
    const result = await client.listTools();
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe("get-instructions");
  });

  it("returns instructions from get-instructions tool", async () => {
    const result = await client.callTool({ name: "get-instructions" });
    expect(result.content).toHaveLength(1);
    const text = (result.content as Array<{ type: string; text: string }>)[0];
    expect(text.type).toBe("text");
    expect(text.text).toContain("deBridge MCP Server");
  });
});
