# deBridge MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-8A2BE2?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTEyIDJMMiA3djEwbDEwIDUgMTAtNVY3TDEyIDJ6Ii8+PC9zdmc+)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![GitHub Stars](https://img.shields.io/github/stars/debridge-finance/debridge-mcp?style=flat&logo=github)](https://github.com/debridge-finance/debridge-mcp)
[![GitHub Issues](https://img.shields.io/github/issues/debridge-finance/debridge-mcp?logo=github)](https://github.com/debridge-finance/debridge-mcp/issues)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/debridge-finance/debridge-mcp?logo=github)](https://github.com/debridge-finance/debridge-mcp/commits/main)

A Model Context Protocol (MCP) server for the [deBridge](https://debridge.com) protocol — enabling AI agents to find optimal cross-chain swap routes, check fees and conditions, and initiate trades across major blockchain networks.

https://github.com/user-attachments/assets/8ebe88ff-db3c-455e-9efb-50389e4bf5bd

## Agent Frameworks Setup

> **Note:** Currently only frameworks with a `stdio` JavaScript runtime are supported. An HTTPS endpoint is planned for a future release.

Clone the repository and build the project:

```bash
git clone https://github.com/debridge-finance/debridge-mcp.git
cd debridge-mcp
npm install
npm run build
```

Then add the following MCP server configuration to your agent (via UI, config file, or CLI):

```json
"debridge": {
  "type": "stdio",
  "command": "node",
  "args": ["/full/path/to/debridge-mcp/dist/index.js"]
}
```

<details>
<summary>Claude Code</summary>

Add the MCP server:

```bash
claude mcp add debridge node /full/path/to/debridge-mcp/dist/index.js
```

Verify the connection:

```bash
claude mcp list
```

</details>

<details>
<summary>Claude Desktop</summary>

TBD

</details>

<details>
<summary>Cursor</summary>

TBD

</details>

<details>
<summary>Windsurf</summary>

TBD

</details>

<details>
<summary>Cline</summary>

TBD

</details>

<details>
<summary>Continue</summary>

TBD

</details>

<details>
<summary>Zed</summary>

TBD

</details>


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

[MIT](LICENSE), Copyright 2026 deBridge
