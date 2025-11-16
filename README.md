# X32/M32 MCP Server

A Model Context Protocol (MCP) server for controlling Behringer X32/M32 digital mixing consoles via OSC protocol.

## Overview

This MCP server enables AI assistants to control X32/M32 digital mixing consoles through semantic, task-based tools. It implements the OSC (Open Sound Control) protocol to communicate with the mixer over the network, providing intuitive channel control, routing, and configuration capabilities.

## Features

### 🎛️ Channel Control
- **Volume Control**: Set channel faders with support for both linear (0.0-1.0) and dB values (-90 to +10 dB)
- **Gain Control**: Adjust preamp gain for input channels
- **Mute/Solo**: Control channel mute and solo states
- **Pan Control**: Set stereo positioning with multiple input formats (percentage, LR notation, linear)
- **EQ Control**: Configure 4-band parametric EQ per channel

### 🎨 Channel Configuration
- **Naming**: Set custom channel names (max 12 characters)
- **Colors**: Assign channel strip colors for visual organization (16 colors including inverted variants)

### 🔌 Connection Management
- **Connect/Disconnect**: Establish and manage connections to X32/M32 mixers
- **Status Monitoring**: Get connection status and mixer information
- **Auto-discovery**: Support for standard X32 port (10023)

### 🔧 Low-Level Access
- **Parameter Control**: Direct access to any OSC parameter for advanced users
- **Generic Get/Set**: Read and write any mixer parameter by OSC address

## Installation

```bash
# Clone the repository
git clone https://github.com/GoBeromsu/X32-MCP.git
cd X32-MCP

# Install dependencies
npm install

# Build the project
npm run build
```

## Quick Start

### 1. Start the MCP Server

```bash
npm start
```

The server will run on stdio transport, ready to accept connections from MCP clients.

### 2. Connect with an MCP Client

#### Using Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "x32": {
      "command": "node",
      "args": ["/path/to/X32-MCP/dist/index.js"]
    }
  }
}
```

#### Using MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Then connect to the stdio server at the X32-MCP path.

### 3. Connect to Your X32/M32

Use the connection tool to establish a connection:

```
connection_connect with host: "192.168.1.100" and port: 10023
```

## Available Tools

### Connection Tools

| Tool | Description |
|------|-------------|
| `connection_connect` | Connect to X32/M32 mixer |
| `connection_disconnect` | Disconnect from mixer |
| `connection_get_info` | Get mixer model and firmware info |
| `connection_get_status` | Get current connection status |

### Channel Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `channel_set_volume` | Set channel fader | `channel`, `value`, `unit` (linear/db) |
| `channel_set_gain` | Set preamp gain | `channel`, `gain` |
| `channel_mute` | Mute/unmute channel | `channel`, `muted` |
| `channel_solo` | Solo/unsolo channel | `channel`, `solo` |
| `channel_set_name` | Set channel name | `channel`, `name` |
| `channel_set_color` | Set channel color | `channel`, `color` |
| `channel_set_pan` | Set stereo position | `channel`, `pan` |
| `channel_set_eq_band` | Configure EQ band | `channel`, `band`, `parameter`, `value` |

### Low-Level Tools

| Tool | Description |
|------|-------------|
| `get_parameter` | Get any parameter by OSC address |
| `set_parameter` | Set any parameter by OSC address |

## Usage Examples

### Basic Channel Setup

```javascript
// Connect to mixer
await connection_connect({ host: "192.168.1.100", port: 10023 });

// Set channel 1 to unity gain (0 dB)
await channel_set_volume({ channel: 1, value: 0, unit: "db" });

// Name the channel
await channel_set_name({ channel: 1, name: "Lead Vocal" });

// Set color to red
await channel_set_color({ channel: 1, color: "red" });

// Pan slightly left
await channel_set_pan({ channel: 1, pan: "L25" });
```

### Volume Control Examples

```javascript
// Using dB values
await channel_set_volume({ channel: 1, value: -10, unit: "db" });

// Using linear values (0.0 to 1.0)
await channel_set_volume({ channel: 1, value: 0.75, unit: "linear" });

// Unity gain (0 dB)
await channel_set_volume({ channel: 1, value: 0, unit: "db" });
```

### Pan Control Examples

```javascript
// Using percentage (-100 to +100)
await channel_set_pan({ channel: 1, pan: -50 });  // 50% left

// Using LR notation
await channel_set_pan({ channel: 1, pan: "L50" });  // 50% left
await channel_set_pan({ channel: 1, pan: "C" });    // Center
await channel_set_pan({ channel: 1, pan: "R75" });  // 75% right

// Using linear values (0.0 to 1.0)
await channel_set_pan({ channel: 1, pan: 0.5 });  // Center
```

## Technical Details

### Architecture

```
MCP Client (Claude, etc.)
        ↓
MCP Protocol (stdio/HTTP)
        ↓
X32 MCP Server (this project)
        ↓
OSC Protocol (UDP)
        ↓
X32/M32 Mixer
```

### Project Structure

```
X32-MCP/
├── src/
│   ├── index.ts           # Entry point
│   ├── server.ts           # Server configuration
│   ├── mcp/                # MCP protocol implementation
│   ├── tools/              # Domain-based tool implementations
│   │   ├── channel.ts     # Channel control tools
│   │   ├── connection.ts  # Connection management tools
│   │   └── parameter.ts   # Low-level parameter tools
│   ├── services/           # Business logic
│   │   └── x32-connection.ts  # X32 OSC communication
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
│       ├── db-converter.ts    # dB/linear conversion
│       ├── color-converter.ts # Color mapping
│       └── pan-converter.ts   # Pan value conversion
└── docs/                   # Documentation
    └── OSC-Protocol.md     # X32 OSC protocol reference
```

### OSC Protocol Implementation

The server implements the X32/M32 OSC protocol for:
- Channel parameters (`/ch/XX/...`)
- Bus routing (`/bus/XX/...`)
- Effects (`/fx/XX/...`)
- Main mix (`/main/...`)
- Configuration (`/config/...`)

See `docs/OSC-Protocol.md` for detailed protocol documentation.

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Testing with X32 Emulator

For development without physical hardware, you can use the X32 emulator:

1. Download the X32 emulator from the Behringer website
2. Run the emulator (default port: 10023)
3. Connect using `connection_connect` with host: `10.69.6.254`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style and patterns
4. Add tests for new features
5. Submit a pull request

### Code Style Guidelines

- Use semantic, task-based tool names (`channel_set_volume`, not `set_parameter`)
- Keep tools focused on single responsibilities
- Include comprehensive JSDoc comments
- Follow TypeScript strict mode requirements

## License

MIT

## Acknowledgments

- Based on the [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- OSC protocol implementation for Behringer X32/M32 mixers
- Thanks to Patrick-Gilles Maillot for X32 OSC documentation

## Support

For issues, questions, or contributions, please visit:
https://github.com/GoBeromsu/X32-MCP