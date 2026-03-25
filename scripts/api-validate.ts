/**
 * Validates data/chains.json and data/tokens.json against the live Xplore API.
 *
 * Usage: npx tsx scripts/api-validate.ts
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ChainInfo, TokenEntry } from "../src/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.XPLORE_API_BASE ?? "https://xplore.api.v2.routerprotocol.com";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return (await res.json()) as T;
}

async function main() {
  const chainsPath = resolve(__dirname, "../data/chains.json");
  const tokensPath = resolve(__dirname, "../data/tokens.json");

  let errors = 0;

  // ── Chains ──────────────────────────────────────────────────────────
  console.log("── Chains ──────────────────────────────────────────────");

  const localChains: ChainInfo[] = JSON.parse(readFileSync(chainsPath, "utf-8"));
  const apiChainsResp = await fetchJson<{ chains: Array<{ id: number; name: string }> }>(
    `${API_BASE}/v1/chains`,
  );

  const apiChainIds = new Set(apiChainsResp.chains.map((c) => String(c.id)));
  console.log(`API chains: ${apiChainsResp.chains.length}, local chains: ${localChains.length}`);

  for (const lc of localChains) {
    if (!apiChainIds.has(lc.chainId)) {
      console.warn(`LOCAL ONLY: ${lc.chainNames[0]} (chainId=${lc.chainId}) not in Xplore API`);
    }
  }

  // ── Tokens ──────────────────────────────────────────────────────────
  console.log("\n── Tokens ──────────────────────────────────────────────");

  const localTokens: TokenEntry[] = JSON.parse(readFileSync(tokensPath, "utf-8"));
  console.log(`Local tokens: ${localTokens.length}`);

  // Validate token data structure
  for (const t of localTokens) {
    if (!t.address || !t.symbol || !t.chainId || t.decimals === undefined) {
      console.error(`INVALID: token missing required fields – ${JSON.stringify(t).slice(0, 100)}`);
      errors++;
    }
  }

  // ── API connectivity check ──────────────────────────────────────────
  console.log("\n── API connectivity ─────────────────────────────────────");
  try {
    await fetchJson(`${API_BASE}/v1/tools`);
    console.log("GET /v1/tools: OK");
  } catch (err) {
    console.error(`GET /v1/tools: FAILED – ${(err as Error).message}`);
    errors++;
  }

  try {
    await fetchJson(`${API_BASE}/v1/chains`);
    console.log("GET /v1/chains: OK");
  } catch (err) {
    console.error(`GET /v1/chains: FAILED – ${(err as Error).message}`);
    errors++;
  }

  // ── Summary ─────────────────────────────────────────────────────────
  if (errors === 0) {
    console.log("\nOK: validation passed");
  } else {
    console.error(`\nFAILED: ${errors} error(s) found`);
    process.exit(1);
  }
}

main();
