# deBridge MCP Server

A Model Context Protocol (MCP) server for the [deBridge](https://debridge.finance) protocol — enabling AI agents to find optimal cross-chain swap routes, check fees and conditions, and initiate trades across major blockchain networks.

## Supported Agent Frameworks

This MCP server works with any framework that supports the Model Context Protocol:

- [Claude Code](https://github.com/anthropics/claude-code) & [Claude Desktop](https://claude.ai/download)
- [Cursor](https://cursor.sh)
- [Windsurf](https://codeium.com/windsurf)
- [Cline](https://github.com/cline/cline)
- [Continue](https://continue.dev)
- [Zed](https://zed.dev)

## Supported Chains

deBridge supports cross-chain swaps across:

**EVM Networks:**
- Ethereum
- Arbitrum
- Optimism
- Base
- Polygon
- BNB Chain
- Avalanche
- Linea
- Gnosis
- Fantom
- Core
- Metis
- Neon

**Non-EVM:**
- Solana
- Tron

## Installation

```bash
npm install
npm run build
```

## Usage

### With Claude Code

Add to `~/.claude/claude_code_config.json`:

```json
{
  "mcpServers": {
    "debridge": {
      "command": "node",
      "args": ["/path/to/debridge-mcp/dist/index.js"]
    }
  }
}
```

### With Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "debridge": {
      "command": "node",
      "args": ["/path/to/debridge-mcp/dist/index.js"]
    }
  }
}
```

## Development

```bash
# Run in dev mode (no build needed)
npm run dev

# Test with MCP Inspector
npm run inspect

# Run tests
npm test
```

## License

MIT
