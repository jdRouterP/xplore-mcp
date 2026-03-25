import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { TokenDb } from "../src/lib/token-db.js";
import { pkg } from "../src/lib/pkg.js";
import { createServer } from "../src/server.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name: string) {
  return JSON.parse(
    readFileSync(resolve(__dirname, "fixtures/live-api", name), "utf-8"),
  );
}

function setupClient() {
  const tokenDb = TokenDb.load();
  const server = createServer(tokenDb);
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  return {
    server,
    clientTransport,
    serverTransport,
    async init() {
      await server.connect(serverTransport);
      const client = new Client({ name: "test-client", version: "1.0.0" });
      await client.connect(clientTransport);
      return client;
    },
    async close() {
      await clientTransport.close();
      await serverTransport.close();
    },
  };
}

describe("xplore-mcp server", () => {
  let ctx: ReturnType<typeof setupClient>;
  let client: Client;

  beforeEach(async () => {
    ctx = setupClient();
    client = await ctx.init();
  });

  afterEach(async () => {
    await ctx.close();
  });

  it("returns server info on initialize", async () => {
    const info = client.getServerVersion();
    expect(info).toEqual({ name: pkg.name, version: pkg.version });
  });

  it("lists tools", async () => {
    const result = await client.listTools();
    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual(["create_transaction", "get_instructions", "get_quote", "get_supported_chains", "get_trade_dapp_url", "search_tokens"]);
  });

  it("returns instructions from get_instructions tool", async () => {
    const result = await client.callTool({ name: "get_instructions" });
    expect(result.content).toHaveLength(1);
    const text = (result.content as Array<{ type: string; text: string }>)[0];
    expect(text.type).toBe("text");
    expect(text.text).toContain("Xplore MCP Server");
  });

  describe("search_tokens", () => {
    it("finds USDC across chains", async () => {
      const result = await client.callTool({
        name: "search_tokens",
        arguments: { query: "USDC" },
      });
      const content = (result.content as Array<{ type: string; text: string }>)[0];
      const data = JSON.parse(content.text);
      expect(data.total).toBeGreaterThan(0);
      expect(data.results.every((t: { symbol: string }) => t.symbol === "USDC")).toBe(true);
    });

    it("filters by chainId", async () => {
      const result = await client.callTool({
        name: "search_tokens",
        arguments: { query: "USDC", chainId: "1" },
      });
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.total).toBeGreaterThanOrEqual(1);
      expect(data.results[0].chainId).toBe("1");
      expect(data.results[0].symbol).toBe("USDC");
    });

    it("filters by name", async () => {
      const result = await client.callTool({
        name: "search_tokens",
        arguments: { query: "USDC", name: "coin" },
      });
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.total).toBeGreaterThan(0);
      expect(data.results.every((t: { names: string[] }) => t.names.some((n: string) => n.toLowerCase().includes("coin")))).toBe(true);
    });

    it("looks up by EVM address", async () => {
      const result = await client.callTool({
        name: "search_tokens",
        arguments: { query: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
      });
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.total).toBe(1);
      expect(data.results[0].symbol).toBe("USDC");
      expect(data.results[0].chainId).toBe("1");
    });

    it("looks up by Solana address", async () => {
      const result = await client.callTool({
        name: "search_tokens",
        arguments: { query: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
      });
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.total).toBe(1);
      expect(data.results[0].symbol).toBe("USDC");
      expect(data.results[0].chainId).toBe("7565164");
    });

    it("returns empty for no match", async () => {
      const result = await client.callTool({
        name: "search_tokens",
        arguments: { query: "NONEXISTENT" },
      });
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.total).toBe(0);
      expect(data.results).toEqual([]);
    });

    it("respects limit", async () => {
      const result = await client.callTool({
        name: "search_tokens",
        arguments: { query: "USD", limit: 2 },
      });
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.total).toBeLessThanOrEqual(2);
    });
  });

  describe("get_quote", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    function mockFetch(fixture: string, status = 200) {
      const body = loadFixture(fixture);
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }

    it("quotes ETH → USDC same-chain swap on Ethereum", async () => {
      mockFetch("quote-eth-usdc-ethereum.json");
      const result = await client.callTool({
        name: "get_quote",
        arguments: {
          fromChain: "1",
          toChain: "1",
          fromToken: "0x0000000000000000000000000000000000000000",
          toToken: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          fromAmount: "1000000000000000000",
          fromAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          toAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        },
      });
      expect(result.isError).toBeUndefined();
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.id).toBeDefined();
      expect(data.action.fromToken.symbol).toBe("ETH");
      expect(data.action.toToken.symbol).toBe("USDC");
      expect(data.estimate.toAmount).toBeDefined();
    });

    it("quotes cross-chain ETH → USDC (Ethereum → Arbitrum)", async () => {
      mockFetch("quote-eth-usdc-crosschain.json");
      const result = await client.callTool({
        name: "get_quote",
        arguments: {
          fromChain: "1",
          toChain: "42161",
          fromToken: "0x0000000000000000000000000000000000000000",
          toToken: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          fromAmount: "1000000000000000000",
          fromAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          toAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        },
      });
      expect(result.isError).toBeUndefined();
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.id).toBeDefined();
      expect(data.action.fromChainId).toBe("1");
      expect(data.action.toChainId).toBe("42161");
    });

    it("returns API error for invalid token", async () => {
      mockFetch("quote-error-invalid-token.json", 504);
      const result = await client.callTool({
        name: "get_quote",
        arguments: {
          fromChain: "1",
          toChain: "1",
          fromToken: "0x0000000000000000000000000000000000000000",
          toToken: "0x0000000000000000000000000000000000000001",
          fromAmount: "1000000000000000000",
          fromAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          toAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        },
      });
      expect(result.isError).toBe(true);
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.statusCode).toBe(504);
    });
  });

  describe("get_supported_chains", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns chains from API", async () => {
      const body = loadFixture("chains-xplore.json");
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
      const result = await client.callTool({
        name: "get_supported_chains",
        arguments: {},
      });
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.chains).toBeDefined();
      expect(data.chains.length).toBeGreaterThan(0);
      const names = data.chains.map((c: { name: string }) => c.name);
      expect(names).toContain("Ethereum");
    });
  });

  describe("create_transaction", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns error when no routes found", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ routes: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
      const result = await client.callTool({
        name: "create_transaction",
        arguments: {
          fromChain: "1",
          toChain: "1",
          fromToken: "0x0000000000000000000000000000000000000000",
          toToken: "0x0000000000000000000000000000000000000001",
          fromAmount: "1000000000000000000",
          fromAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          toAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        },
      });
      expect(result.isError).toBe(true);
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.error).toContain("No routes found");
    });

    it("fetches routes and populates steps with tx data", async () => {
      const routesResponse = {
        routes: [{
          id: "route-1",
          fromChainId: "1",
          toChainId: "42161",
          steps: [{ id: "step-1", type: "swap", tool: "relay" }],
        }],
      };
      const stepResponse = {
        id: "step-1",
        type: "swap",
        tool: "relay",
        transactionRequest: {
          from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          to: "0x1234",
          data: "0xabcd",
          value: "1000000000000000000",
          chainId: "1",
        },
      };

      let callCount = 0;
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        callCount++;
        const body = callCount === 1 ? routesResponse : stepResponse;
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const result = await client.callTool({
        name: "create_transaction",
        arguments: {
          fromChain: "1",
          toChain: "42161",
          fromToken: "0x0000000000000000000000000000000000000000",
          toToken: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          fromAmount: "1000000000000000000",
          fromAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          toAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        },
      });
      expect(result.isError).toBeUndefined();
      const data = JSON.parse((result.content as Array<{ text: string }>)[0].text);
      expect(data.id).toBe("route-1");
      expect(data.steps).toHaveLength(1);
      expect(data.steps[0].transactionRequest).toBeDefined();
      expect(data.steps[0].transactionRequest.data).toBe("0xabcd");
    });
  });
});
