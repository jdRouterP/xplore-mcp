# Xplore MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)

A Model Context Protocol (MCP) server for [Router Protocol](https://www.routerprotocol.com)'s Xplore API — enabling AI agents to find optimal cross-chain and same-chain swap routes, check fees and conditions, track transactions, and initiate trades across major blockchain networks.

## Transport Modes

The Xplore MCP server supports two transport modes:

- **stdio** (default) - Requires Node.js/npm. For local agent frameworks and CLI tools via standard input/output
- **HTTP streaming** - Requires Docker OR Node.js/npm. For containerized deployments and web-based agents

## Setup

### Quick Start (npx)

Run directly without installation:

```bash
npx -y @router-protocol/xplore-mcp@latest
```

### Installation from Source

Clone and build:

```bash
git clone https://github.com/router-protocol/xplore-mcp.git
cd xplore-mcp
npm install
npm run build
```

### Running the Server

**stdio mode** (default):
```bash
npx -y @router-protocol/xplore-mcp@latest
# or from a cloned repo
npm start
```

**HTTP mode**:
```bash
MCP_TRANSPORT=http npx -y @router-protocol/xplore-mcp@latest
# or from a cloned repo
npm run start:http

# Custom port
MCP_TRANSPORT=http PORT=3001 npx -y @router-protocol/xplore-mcp@latest
```

**Docker HTTP mode**:
```bash
docker build -t xplore-mcp .
docker run -p 3000:3000 xplore-mcp
```

### Configuration for Agent Frameworks

**stdio configuration** (for local agents):

```json
"xplore": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@router-protocol/xplore-mcp@latest"]
}
```

**Streamable HTTP**:

```json
"xplore": {
  "type": "streamable-http",
  "url": "http://localhost:3001/mcp"
}
```

<details>
<summary>Claude Code (CLI & IDE plugins)</summary>

Add the MCP server:

```bash
claude mcp add xplore npx -- -y @router-protocol/xplore-mcp@latest
# OR
claude mcp add xplore --transport http http://127.0.0.1:3000/mcp
```

Verify the connection:

```bash
claude mcp list
```

</details>

<details>
<summary>Cursor</summary>

Add to `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "xplore": {
      "command": "npx",
      "args": ["-y", "@router-protocol/xplore-mcp@latest"]
    }
  }
}
```

</details>

<details>
<summary>GitHub Copilot (VS Code Chat)</summary>

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "mcpServers": {
    "xplore": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@router-protocol/xplore-mcp@latest"]
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
    "xplore": {
      "command": "npx",
      "args": ["-y", "@router-protocol/xplore-mcp@latest"]
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
    "xplore": {
      "command": "npx",
      "args": ["-y", "@router-protocol/xplore-mcp@latest"]
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
      "name": "xplore",
      "command": "npx",
      "args": ["-y", "@router-protocol/xplore-mcp@latest"]
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
    "xplore": {
      "command": {
        "path": "npx",
        "args": ["-y", "@router-protocol/xplore-mcp@latest"]
      }
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

[MIT](LICENSE), Copyright 2026 Router Protocol
