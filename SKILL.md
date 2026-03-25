# Xplore MCP Server

This server helps you initiate cross-chain and same-chain cryptocurrency swaps and transfers
via Router Protocol's Xplore API. It can get quotes, create transactions, show available paths,
explain expected fees, and generate a URL to redirect the user to the Router Protocol App
to complete the transaction.

## Workflow

Follow these steps to fulfill a user's swap or transfer request:

1. **Resolve chains**: Call `get_supported_chains` to list supported blockchain networks
   and map the user's chain names (e.g. "Ethereum", "Solana") to numeric chain IDs.

2. **Resolve tokens**: Call `search_tokens` with the token name or symbol (e.g. "USDC",
   "ETH") and the relevant `chainId` to get the token's contract address and decimals.
   Always confirm the correct token with the user when multiple results are returned.

3. **Get a quote**: Call `get_quote` with the source and destination chain IDs, token
   addresses, amount in smallest units, and the sender's wallet address. Works for both
   same-chain swaps (fromChain == toChain) and cross-chain swaps.
   The response includes the estimated output amount, fees, and route details.
   Present the quote to the user before proceeding.

4. **Create transaction**: When ready to execute, call `create_transaction` with the same
   parameters. This returns full route details with populated transaction data ready for
   signing and submission.

5. **Generate an app link**: Call `get_dapp_url` with the chain IDs, token addresses,
   the human-readable amount (NOT in smallest units), and the recipient `address` (if known)
   to produce a URL. Share this URL with the user so they can review and execute the swap
   in the Router Protocol App.

6. **Track transaction**: After the user submits a transaction, call `check_transaction_status`
   with the transaction hash to monitor progress. The status will be PENDING, DONE, or FAILED.

### Discovery (optional)

Before quoting, you can optionally explore available routes:

- Call `get_connections` to check what token pairs and routing tools are available between
  two chains.
- Call `get_tools` to see which bridges and DEX exchanges are available for routing.

## Tools

- `get_instructions` — Show this guide.
- `get_supported_chains` — List all supported blockchain networks with their chain IDs.
- `search_tokens` — Look up tokens by name, symbol, or address. Supports filtering by chain.
- `get_quote` — Get a quote for a token swap (same-chain or cross-chain). Returns estimated
  output, fees, route details, and transaction data for simple routes.
- `create_transaction` — Build a swap transaction with full route and step details.
  Returns populated transaction data ready for signing.
- `get_dapp_url` — Generate a pre-filled Router Protocol App URL for the user to
  execute the swap. Accepts an optional `address` parameter to pre-fill the recipient wallet.
- `check_transaction_status` — Check the status of a transaction by its hash.
  Returns status (PENDING/DONE/FAILED), sending/receiving details, and the bridge used.
- `get_tools` — List available bridges and DEX exchanges for routing. Optionally filter by chain.
- `get_connections` — List available connections between two chains with supported tokens and tools.

## Tips

- Always resolve token addresses via `search_tokens` rather than guessing addresses.
- Convert amounts to smallest units (wei, lamports) for `get_quote` and `create_transaction`,
  but use human-readable decimals for `get_dapp_url`.
- Use `0x0000000000000000000000000000000000000000` as the token address for native
  tokens (ETH, BNB, MATIC, etc.) on EVM chains.
- Present the estimated output and fees from `get_quote` to the user before proceeding.
- For same-chain swaps, set `toChain` equal to `fromChain`.
