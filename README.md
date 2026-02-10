# deBridge MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-8A2BE2?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTEyIDJMMiA3djEwbDEwIDUgMTAtNVY3TDEyIDJ6Ii8+PC9zdmc+)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![GitHub Stars](https://img.shields.io/github/stars/debridge-finance/debridge-mcp?style=flat&logo=github)](https://github.com/debridge-finance/debridge-mcp)
[![GitHub Issues](https://img.shields.io/github/issues/debridge-finance/debridge-mcp?logo=github)](https://github.com/debridge-finance/debridge-mcp/issues)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/debridge-finance/debridge-mcp?logo=github)](https://github.com/debridge-finance/debridge-mcp/commits/main)

A Model Context Protocol (MCP) server for the [deBridge](https://debridge.finance) protocol — enabling AI agents to find optimal cross-chain swap routes, check fees and conditions, and initiate trades across major blockchain networks.

## Supported Agent Frameworks

This MCP server works with any framework that supports the Model Context Protocol:

- [Claude Code](https://github.com/anthropics/claude-code) & [Claude Desktop](https://claude.ai/download)
- [Cursor](https://cursor.sh)
- [Windsurf](https://codeium.com/windsurf)
- [Cline](https://github.com/cline/cline)
- [Continue](https://continue.dev)
- [Zed](https://zed.dev)

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
