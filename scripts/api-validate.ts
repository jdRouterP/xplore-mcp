/**
 * Validates data/chains.json and data/tokens.json against the live deBridge API.
 *
 * Usage: npx tsx scripts/validate.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ChainInfo, TokenEntry } from "../src/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE_URI = "https://deswap.debridge.finance/v1.0"
const CHAINS_API = API_BASE_URI + "/supported-chains-info";
const TOKEN_LIST_API = API_BASE_URI + "/token-list";

/** Shape returned by the deBridge supported-chains-info endpoint. */
interface ApiChain {
  /**
   * Synthetic deBridge-local ID to avoid chainId overlaps across networks.
   * Mapped to `debridgeSubscriptionId` locally.
   */
  chainId: number;
  /** Real blockchain chain ID (e.g. 1 for Ethereum mainnet). */
  originalChainId: number;
  chainName: string;
}

/** Shape returned by the deBridge token-list endpoint (per token). */
interface ApiToken {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 5000;

/** Fetch JSON with exponential back-off on non-2xx responses. */
async function fetchJson<T>(url: string): Promise<T> {
  let delay = INITIAL_DELAY_MS;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as T;
    if (attempt >= MAX_RETRIES) {
      throw new Error(`${url} returned ${res.status} after ${MAX_RETRIES} attempts`);
    }
    console.warn(`  ↻ ${res.status} – retry ${attempt}/${MAX_RETRIES} in ${delay}ms`);
    await sleep(delay);
    delay *= 2;
  }
}

/** Returns the deBridge subscription ID used for API calls. */
function getSubId(chain: ChainInfo): string {
  return chain.debridgeSubscriptionId ?? chain.chainId;
}

async function fetchTokensForChain(subId: string): Promise<Map<string, ApiToken>> {
  const { tokens } = await fetchJson<{ tokens: Record<string, ApiToken> }>(
    `${TOKEN_LIST_API}?chainId=${subId}`,
  );
  const map = new Map<string, ApiToken>();
  for (const [addr, token] of Object.entries(tokens)) {
    map.set(addr.toLowerCase(), token);
  }
  return map;
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  const chainsPath = resolve(__dirname, "../data/chains.json");
  const tokensPath = resolve(__dirname, "../data/tokens.json");

  let errors = 0;

  // ════════════════════════════════════════════════════════════════════
  // Phase 1: Chains
  // ════════════════════════════════════════════════════════════════════
  console.log("── Phase 1: Chains ──────────────────────────────────────");

  let localChains: ChainInfo[];
  try {
    localChains = JSON.parse(readFileSync(chainsPath, "utf-8"));
    if (!Array.isArray(localChains)) {
      console.error("FAIL: data/chains.json root is not an array");
      process.exit(1);
    }
  } catch (err) {
    console.error(`FAIL: Unable to parse data/chains.json – ${(err as Error).message}`);
    process.exit(1);
  }

  const { chains: apiChains } = await fetchJson<{ chains: ApiChain[] }>(CHAINS_API);

  // Build lookup: debridgeSubscriptionId → local entry
  const localBySubId = new Map<string, ChainInfo>();
  for (const lc of localChains) {
    localBySubId.set(getSubId(lc), lc);
  }

  const apiSubIds = new Set<string>();
  let chainsAdded = 0;

  for (const ac of apiChains) {
    const subId = String(ac.chainId);
    const chainId = String(ac.originalChainId);
    apiSubIds.add(subId);

    const local = localBySubId.get(subId);
    if (!local) {
      const newEntry: ChainInfo =
        chainId === subId
          ? { chainId, chainNames: [ac.chainName] }
          : { chainId, debridgeSubscriptionId: subId, chainNames: [ac.chainName] };
      localChains.push(newEntry);
      localBySubId.set(subId, newEntry);
      console.log(`ADDED chain: ${ac.chainName} (chainId=${chainId}, debridgeSubscriptionId=${subId})`);
      chainsAdded++;
      continue;
    }

    if (String(local.chainId) !== chainId) {
      console.error(`CHAIN_ID: ${ac.chainName} – local="${local.chainId}" ≠ API=${chainId}`);
      errors++;
    }

    const localSubId = getSubId(local);
    if (localSubId !== subId) {
      console.error(`SUB_ID: ${ac.chainName} – local="${localSubId}" ≠ API=${subId}`);
      errors++;
    }

    const localNamesLower = local.chainNames.map((n) => n.toLowerCase());
    if (!localNamesLower.includes(ac.chainName.toLowerCase())) {
      console.error(`NAME: chain ${subId} – API name "${ac.chainName}" not in [${local.chainNames.join(", ")}]`);
      errors++;
    }
  }

  for (const lc of localChains) {
    if (!apiSubIds.has(getSubId(lc))) {
      console.error(`EXTRA chain: "${lc.chainNames[0]}" (debridgeSubscriptionId=${getSubId(lc)}) not in API`);
      errors++;
    }
  }

  if (chainsAdded > 0) {
    localChains.sort((a, b) => Number(a.chainId) - Number(b.chainId));
    writeFileSync(chainsPath, JSON.stringify(localChains, null, 2) + "\n");
    console.log(`Wrote ${chainsAdded} new chain(s) to chains.json`);
  }
  console.log(`Chains: API=${apiChains.length}, local=${localChains.length}\n`);

  // ════════════════════════════════════════════════════════════════════
  // Phase 2: Tokens
  // ════════════════════════════════════════════════════════════════════
  console.log("── Phase 2: Tokens ─────────────────────────────────────");

  let localTokens: TokenEntry[];
  try {
    localTokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
    if (!Array.isArray(localTokens)) {
      console.error("FAIL: data/tokens.json root is not an array");
      process.exit(1);
    }
  } catch (err) {
    console.error(`FAIL: Unable to parse data/tokens.json – ${(err as Error).message}`);
    process.exit(1);
  }

  // Build index: real chainId → Map<addressLower, TokenEntry>
  const localTokenIndex = new Map<string, Map<string, TokenEntry>>();
  for (const t of localTokens) {
    if (!localTokenIndex.has(t.chainId)) {
      localTokenIndex.set(t.chainId, new Map());
    }
    localTokenIndex.get(t.chainId)!.set(t.address.toLowerCase(), t);
  }

  let tokensAdded = 0;
  let tokensChecked = 0;
  let namesFixed = 0;
  let tokensModified = false;

  for (let i = 0; i < localChains.length; i++) {
    const chain = localChains[i];
    const subId = getSubId(chain);       // debridgeSubscriptionId — for API calls
    const realChainId = chain.chainId;    // real ledger chain ID — for local storage

    let apiTokens: Map<string, ApiToken>;
    try {
      apiTokens = await fetchTokensForChain(subId);
    } catch (err) {
      console.error(`FAIL: could not fetch tokens for chain ${chain.chainNames[0]} (${subId}) – ${(err as Error).message}`);
      errors++;
      continue;
    }

    const localMap = localTokenIndex.get(realChainId) ?? new Map<string, TokenEntry>();

    // Check for extra local tokens not in API
    for (const [, local] of localMap) {
      if (!apiTokens.has(local.address.toLowerCase())) {
        console.error(`UNSUPPORTED: ${local.symbol} (${local.address}) on chain ${realChainId} not in API`);
        errors++;
      }
    }

    // Check every API token exists locally; validate matches; add missing
    for (const [addrLower, remote] of apiTokens) {
      const local = localMap.get(addrLower);

      if (!local) {
        const newToken: TokenEntry = {
          address: remote.address,
          symbol: remote.symbol,
          names: [remote.name],
          decimals: remote.decimals,
          chainId: realChainId,
        };
        localTokens.push(newToken);
        localMap.set(addrLower, newToken);
        tokensAdded++;
        continue;
      }

      tokensChecked++;

      // Verify decimals
      if (local.decimals !== remote.decimals) {
        console.error(`DECIMALS: ${local.symbol} on chain ${realChainId} – local=${local.decimals}, API=${remote.decimals}`);
        errors++;
      }

      // Verify symbol: OK if either local or remote symbol appears among names
      if (local.symbol !== remote.symbol) {
        const namesLc = local.names.map((n) => n.toLowerCase());
        const known = namesLc.includes(local.symbol.toLowerCase())
          || namesLc.includes(remote.symbol.toLowerCase());
        if (!known) {
          console.warn(`SYMBOL (warn): ${local.address} on chain ${realChainId} – local="${local.symbol}", API="${remote.symbol}"`);
        }
      }

      // Check API name is findable via local symbol or any element of names
      const namesLower = local.names.map((n) => n.toLowerCase());
      const apiNameLower = remote.name.toLowerCase();
      const matchesSymbol = local.symbol.toLowerCase() === apiNameLower;
      const matchesNames = namesLower.includes(apiNameLower);

      if (!matchesSymbol && !matchesNames) {
        // Auto-fix: add the API name to local names array
        local.names.push(remote.name);
        tokensModified = true;
        namesFixed++;
      }
    }

    // After reconciliation, verify count equality
    const localCount = localMap.size;
    const apiCount = apiTokens.size;
    if (localCount !== apiCount) {
      console.error(`COUNT: chain ${chain.chainNames[0]} (${realChainId}) – local=${localCount}, API=${apiCount}`);
      errors++;
    }
  }

  // Ensure every chain has at least one token
  for (const chain of localChains) {
    const chainTokens = localTokens.filter((t) => t.chainId === chain.chainId);
    if (chainTokens.length === 0) {
      console.error(`EMPTY: chain ${chain.chainNames[0]} (${chain.chainId}) has no tokens in tokens.json`);
      errors++;
    }
  }

  if (tokensAdded > 0 || tokensModified) {
    // Sort tokens: by chainId numerically, then by address
    localTokens.sort((a, b) => {
      const chainCmp = Number(a.chainId) - Number(b.chainId);
      if (chainCmp !== 0) return chainCmp;
      return a.address.toLowerCase().localeCompare(b.address.toLowerCase());
    });
    writeFileSync(tokensPath, JSON.stringify(localTokens, null, 2) + "\n");
    if (tokensAdded > 0) console.log(`Added ${tokensAdded} new token(s) to tokens.json`);
    if (namesFixed > 0) console.log(`Fixed ${namesFixed} token name(s) in tokens.json`);
  }
  console.log(`Tokens: checked=${tokensChecked}, added=${tokensAdded}, namesFixed=${namesFixed}\n`);

  // ════════════════════════════════════════════════════════════════════
  // Summary
  // ════════════════════════════════════════════════════════════════════
  if (errors === 0) {
    console.log("OK: all chains and tokens are valid");
  } else {
    console.error(`FAILED: ${errors} error(s) found`);
    process.exit(1);
  }
}

main();
