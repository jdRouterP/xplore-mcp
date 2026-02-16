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

## Transport Modes

The deBridge MCP server supports two transport modes for local deployment:

- **stdio** (default) - Requires Node.js/npm. For local agent frameworks and CLI tools via standard input/output
- **HTTP streaming** - Requires Docker OR Node.js/npm. For containerized deployments and web-based agents

## Setup

### Installation

Clone and build:

```bash
git clone https://github.com/debridge-finance/debridge-mcp.git
cd debridge-mcp
npm install
npm run build
```

### Running the Server

**JS stdio mode**:
```bash
npm start
# or for development
npm run dev
```

**JS HTTP mode**:
```bash
npm run start:http
# or for development with auto-reload
npm run dev:http

# Custom port
MCP_TRANSPORT=http PORT=3001 npm start
```

**Docker HTTP mode**:
```bash
docker build -t debridge-mcp .
docker run -p 3000:3000 debridge-mcp
```

### Configuration for Agent Frameworks

**stdio configuration** (for local agents):

```json
"debridge": {
  "type": "stdio",
  "command": "node",
  "args": ["/full/path/to/debridge-mcp/dist/index.js"]
}
```

**Streamable HTTP**:

```json
"debridge": {
  "type": "streamable-http",
  "url": "http://localhost:3001/mcp"
}
```


<details>
<summary>Claude Code (CLI & IDE plugins)</summary>

Add the MCP server:

```bash
claude mcp add debridge node /full/path/to/debridge-mcp/dist/index.js
# OR
claude mcp add debridge --transport http http://127.0.0.1:3000/mcp
```

Verify the connection:

```bash
claude mcp list
```

</details>


<details>
<summary>OpenClaw (via mcp-adapter plugin)</summary>

Install the [mcp-adapter](https://github.com/androidStern-personal/openclaw-mcp-adapter) plugin:
```bash
openclaw plugins install mcp-adapter
```

Add to `~/.openclaw/openclaw.json`:
```json
{
  "plugins": {
    "entries": {
      "mcp-adapter": {
        "enabled": true,
        "config": {
          "servers": [
            {
              "name": "debridge",
              "transport": "stdio",
              "command": "node",
              "args": ["/full/path/to/debridge-mcp/dist/index.js"]
            }
          ]
        }
      }
    }
  }
}
```

Add `"mcp-adapter"` to your sandbox allowlist and restart:
```bash
openclaw gateway restart
```

Verify the connection:
```bash
openclaw plugins list
```

</details>

<details>
<summary>GitHub Copilot (VS Code Chat)</summary>

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "mcpServers": {
    "debridge": {
      "type": "stdio",
      "command": "node",
      "args": ["/full/path/to/debridge-mcp/dist/index.js"]
    }
  }
}
```

</details>

<details>
<summary>Claude Web & Desktop Apps</summary>

Not supported until [Streamable HTTP](https://github.com/debridge-finance/debridge-mcp/issues/1) is implemented.

</details>

<details>
<summary>Cursor</summary>

Add to `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "debridge": {
      "command": "node",
      "args": ["/full/path/to/debridge-mcp/dist/index.js"]
    }
  }
}
```

</details>

<details>
<summary>Windsurf</summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "debridge": {
      "command": "node",
      "args": ["/full/path/to/debridge-mcp/dist/index.js"]
    }
  }
}
```

</details>

<details>
<summary>Cline</summary>

Open Cline settings in VS Code, go to MCP Servers, click "Edit MCP Settings" and add:

```json
{
  "mcpServers": {
    "debridge": {
      "command": "node",
      "args": ["/full/path/to/debridge-mcp/dist/index.js"]
    }
  }
}
```

</details>

<details>
<summary>Continue</summary>

Add to `~/.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "debridge",
      "command": "node",
      "args": ["/full/path/to/debridge-mcp/dist/index.js"]
    }
  ]
}
```

</details>

<details>
<summary>Zed</summary>

Add to your Zed settings (`~/.config/zed/settings.json`):

```json
{
  "context_servers": {
    "debridge": {
      "command": {
        "path": "node",
        "args": ["/full/path/to/debridge-mcp/dist/index.js"]
      }
    }
  }
}
```

</details>

<details>
<summary>OpenClaw</summary>

Add to your OpenClaw config (`~/.openclaw/mcp.json`):

```json
{
  "mcpServers": {
    "debridge": {
      "command": "node",
      "args": ["/full/path/to/debridge-mcp/dist/index.js"]
    }
  }
}
```

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
