import { describe, it, expect } from "vitest";
import { TokenDb } from "./token-db.js";

describe("TokenDb.search", () => {
  const db = TokenDb.load();

  it("exact symbol match returns all chains", () => {
    const results = db.search("USDC");
    expect(results.every((t) => t.symbol === "USDC")).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  it("symbol match is case-insensitive", () => {
    const results = db.search("usdc");
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results[0].symbol).toBe("USDC");
  });

  it("filters by chainId", () => {
    const results = db.search("USDC", "42161");
    expect(results.length).toBe(1);
    expect(results[0].chainId).toBe("42161");
  });

  it("exact EVM address lookup (case-insensitive)", () => {
    const results = db.search("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
    expect(results.length).toBe(1);
    expect(results[0].symbol).toBe("USDC");
    expect(results[0].chainId).toBe("1");
  });

  it("Solana address lookup", () => {
    const results = db.search("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    expect(results.length).toBe(1);
    expect(results[0].symbol).toBe("USDC");
    expect(results[0].chainId).toBe("7565164");
  });

  it("name substring match (e.g. 'tether' finds USDT)", () => {
    const results = db.search("tether");
    expect(results.every((t) => t.symbol === "USDT")).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it("symbol prefix match (e.g. 'USD' matches USDC and USDT)", () => {
    const results = db.search("USD");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((t) => t.symbol.startsWith("USD"))).toBe(true);
  });

  it("respects limit parameter", () => {
    const results = db.search("USD", undefined, 2);
    expect(results.length).toBe(2);
  });

  it("returns empty array for no matches", () => {
    const results = db.search("NONEXISTENT");
    expect(results).toEqual([]);
  });

  it("prioritizes exact symbol over name substring", () => {
    const results = db.search("ETH");
    expect(results[0].symbol).toBe("ETH");
  });
});
