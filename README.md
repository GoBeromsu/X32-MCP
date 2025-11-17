# X32/M32 MCP Server

A comprehensive Model Context Protocol (MCP) server for controlling Behringer X32/M32 digital mixing consoles via OSC protocol.

## Overview

This MCP server enables AI assistants to control X32/M32 digital mixing consoles through semantic, task-based tools. It implements the OSC (Open Sound Control) protocol to communicate with the mixer over the network, providing intuitive control of channels, buses, effects, and
routing with a focus on type safety and developer experience.

## Features

### Connection Management

- Connect and disconnect from X32/M32 mixers over network
- Retrieve mixer information (model, firmware version)
- Monitor connection status and network configuration
- Auto-discovery support for standard X32 port (10023)

### Channel Control

- **Volume Control**: Set channel faders with both linear (0.0-1.0) and dB values (-90 to +10 dB)
- **Gain Control**: Adjust preamp gain for input channels
- **Mute/Solo**: Control channel mute and solo states
- **Pan Control**: Set stereo positioning with multiple input formats (percentage, LR notation, linear)
- **EQ Control**: Configure 4-band parametric EQ per channel
- **Channel Configuration**: Set custom names (max 12 characters) and colors (16 color options)

### Bus/Aux Control

- **Bus Volume**: Set mix bus fader levels with linear or dB values
- **Bus Mute**: Mute/unmute mix buses
- **Channel Sends**: Control channel send levels to buses
- **Bus State**: Retrieve complete bus configuration and status

### Effects Processing

- **Parameter Control**: Set effects parameters on 8 FX racks
- **Bypass Control**: Bypass or enable effects processing
- **State Retrieval**: Get complete effects rack state and configuration

### Main/Monitor Outputs

- **Main Output**: Control main stereo output volume and mute
- **Monitor Control**: Set monitor output levels

### Low-Level Access

- **Parameter Tools**: Direct access to any OSC parameter for advanced users
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

Complete reference of all 21 tools organized by domain:

### Connection Tools (4 tools)

| Tool                    | Description                                    | Parameters                                   |
| ----------------------- | ---------------------------------------------- | -------------------------------------------- |
| `connection_connect`    | Connect to X32/M32 mixer via OSC               | `host` (IP address), `port` (default: 10023) |
| `connection_disconnect` | Disconnect from mixer                          | None                                         |
| `connection_get_info`   | Get mixer model and firmware information       | None                                         |
| `connection_get_status` | Get current connection status and network info | None                                         |

### Channel Tools (8 tools)

| Tool                  | Description             | Parameters                                                   |
| --------------------- | ----------------------- | ------------------------------------------------------------ |
| `channel_set_volume`  | Set channel fader level | `channel` (1-32), `value`, `unit` (linear/db)                |
| `channel_set_gain`    | Set preamp gain         | `channel` (1-32), `gain` (0.0-1.0)                           |
| `channel_mute`        | Mute/unmute channel     | `channel` (1-32), `muted` (boolean)                          |
| `channel_solo`        | Solo/unsolo channel     | `channel` (1-32), `solo` (boolean)                           |
| `channel_set_name`    | Set channel name/label  | `channel` (1-32), `name` (max 12 chars)                      |
| `channel_set_color`   | Set channel strip color | `channel` (1-32), `color` (name or 0-15)                     |
| `channel_set_pan`     | Set stereo pan position | `channel` (1-32), `pan` (percentage/LR/linear)               |
| `channel_set_eq_band` | Configure EQ band       | `channel` (1-32), `band` (1-4), `parameter` (f/g/q), `value` |

### Bus Tools (4 tools)

| Tool             | Description                   | Parameters                                                  |
| ---------------- | ----------------------------- | ----------------------------------------------------------- |
| `bus_set_volume` | Set bus fader level           | `bus` (1-16), `value`, `unit` (linear/db)                   |
| `bus_mute`       | Mute/unmute bus               | `bus` (1-16), `muted` (boolean)                             |
| `bus_set_send`   | Set channel send level to bus | `channel` (1-32), `bus` (1-16), `value`, `unit` (linear/db) |
| `bus_get_state`  | Get complete bus state        | `bus` (1-16)                                                |

### FX Tools (3 tools)

| Tool               | Description                 | Parameters                                        |
| ------------------ | --------------------------- | ------------------------------------------------- |
| `fx_set_parameter` | Set effects parameter value | `fx` (1-8), `parameter` (1-64), `value` (0.0-1.0) |
| `fx_get_state`     | Get effects rack state      | `fx` (1-8)                                        |
| `fx_bypass`        | Bypass/enable effect        | `fx` (1-8), `bypass` (boolean)                    |

### Main/Monitor Tools (3 tools)

| Tool                | Description                   | Parameters                  |
| ------------------- | ----------------------------- | --------------------------- |
| `main_set_volume`   | Set main stereo output volume | `value`, `unit` (linear/db) |
| `main_mute`         | Mute/unmute main output       | `muted` (boolean)           |
| `monitor_set_level` | Set monitor output level      | `value`, `unit` (linear/db) |

### Low-Level Tools (2 tools)

| Tool            | Description                      | Parameters                    |
| --------------- | -------------------------------- | ----------------------------- |
| `get_parameter` | Get any parameter by OSC address | `address` (OSC path)          |
| `set_parameter` | Set any parameter by OSC address | `address` (OSC path), `value` |

## Usage Examples

### Basic Channel Setup

```javascript
// Connect to mixer
await connection_connect({ host: '192.168.1.100', port: 10023 });

// Set channel 1 to unity gain (0 dB)
await channel_set_volume({ channel: 1, value: 0, unit: 'db' });

// Name the channel
await channel_set_name({ channel: 1, name: 'Lead Vocal' });

// Set color to red
await channel_set_color({ channel: 1, color: 'red' });

// Pan slightly left
await channel_set_pan({ channel: 1, pan: 'L25' });
```

### Volume Control Examples

```javascript
// Using dB values
await channel_set_volume({ channel: 1, value: -10, unit: 'db' });

// Using linear values (0.0 to 1.0)
await channel_set_volume({ channel: 1, value: 0.75, unit: 'linear' });

// Unity gain (0 dB = 0.75 linear)
await channel_set_volume({ channel: 1, value: 0, unit: 'db' });
```

### Pan Control Examples

```javascript
// Using percentage (-100 to +100)
await channel_set_pan({ channel: 1, pan: -50 }); // 50% left

// Using LR notation
await channel_set_pan({ channel: 1, pan: 'L50' }); // 50% left
await channel_set_pan({ channel: 1, pan: 'C' }); // Center
await channel_set_pan({ channel: 1, pan: 'R75' }); // 75% right

// Using linear values (0.0 to 1.0)
await channel_set_pan({ channel: 1, pan: 0.5 }); // Center
```

### Bus Routing and Mixing

```javascript
// Set bus 1 volume
await bus_set_volume({ bus: 1, value: -6, unit: 'db' });

// Send channel 5 to bus 1 (aux send)
await bus_set_send({ channel: 5, bus: 1, value: 0.8, unit: 'linear' });

// Mute bus 2
await bus_mute({ bus: 2, muted: true });

// Get complete bus state
await bus_get_state({ bus: 1 });
```

### Effects Control

```javascript
// Set reverb time (example - parameter 01 on FX rack 1)
await fx_set_parameter({ fx: 1, parameter: 1, value: 0.7 });

// Bypass FX rack 2
await fx_bypass({ fx: 2, bypass: true });

// Get FX rack state
await fx_get_state({ fx: 1 });
```

### Main Output Control

```javascript
// Set main output to -3 dB
await main_set_volume({ value: -3, unit: 'db' });

// Mute main output (emergency mute)
await main_mute({ muted: true });

// Set monitor level
await monitor_set_level({ value: 0.6, unit: 'linear' });
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
│   ├── index.ts              # Entry point
│   ├── server.ts             # Server configuration
│   ├── mcp/                  # MCP protocol implementation
│   ├── tools/                # Domain-based tool implementations
│   │   ├── connection.ts     # Connection management (4 tools)
│   │   ├── channel.ts        # Channel control (8 tools)
│   │   ├── bus.ts            # Bus/aux control (4 tools)
│   │   ├── fx.ts             # Effects control (3 tools)
│   │   ├── main.ts           # Main/monitor outputs (3 tools)
│   │   └── parameter.ts      # Low-level parameter access (2 tools)
│   ├── services/             # Business logic
│   │   ├── x32-connection.ts # X32 OSC communication
│   │   └── __mocks__/        # Mock implementations for testing
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
│       ├── db-converter.ts   # dB/linear conversion
│       ├── color-converter.ts # Color mapping
│       └── pan-converter.ts  # Pan value conversion
├── docs/                     # Documentation
│   └── OSC-Protocol.md       # X32 OSC protocol reference
└── package.json              # Project metadata (v3.1.0)
```

### OSC Protocol Implementation

The server implements the X32/M32 OSC protocol for comprehensive mixer control:

- **Channel parameters** (`/ch/XX/...`) - 32 input channels with full processing control
- **Bus routing** (`/bus/XX/...`) - 16 mix buses for aux sends and monitor mixes
- **Effects** (`/fx/XX/...`) - 8 FX racks with full parameter control
- **Main mix** (`/main/...`) - Main stereo output and monitoring
- **Configuration** (`/config/...`) - Naming, colors, and system settings

See `docs/OSC-Protocol.md` for detailed protocol documentation.

### Value Conversions

The server handles automatic conversions between different value formats:

- **dB to Linear**: Fader values use non-linear mapping (-90 dB to +10 dB → 0.0 to 1.0)
- **Pan Values**: Supports percentage (-100 to +100), LR notation (L50/C/R75), and linear (0.0-1.0)
- **Color Mapping**: Named colors (red, green, blue, etc.) mapped to numeric values (0-15)

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest src/tools/channel.test.ts

# Run tests matching pattern
npx jest -t "channel_set_volume"
```

### Testing Infrastructure

The project includes a comprehensive mock testing infrastructure:

- **MockX32Connection**: Full OSC protocol simulation without hardware
- **Unit Tests**: Tests for all utility functions (db-converter, color-converter, pan-converter)
- **Integration Tests**: Domain tool tests verifying complete workflows
- **Type Safety**: Strict TypeScript checking with 100% type coverage

Test coverage includes:

- Channel operations (volume, gain, mute, solo, EQ, pan, name, color)
- Bus routing and mixing
- Effects parameter control
- Error handling and validation
- State management across multiple channels/buses

### Building

```bash
# Production build
npm run build

# Watch mode for development
npm run build:watch
```

### Linting

```bash
# Check code style
npm run lint

# Fix issues automatically
npm run lint:fix
```

## Testing with X32 Emulator

For development without physical hardware, you can use the X32 emulator:

1. Download the X32 emulator from the Behringer website
2. Run the emulator (default port: 10023)
3. Connect using `connection_connect` with host: `127.0.0.1` or emulator IP

Alternatively, use the built-in mock testing infrastructure for unit testing without any hardware.

## Color Reference

Available channel/bus colors:

| Color   | Value | Inverted         |
| ------- | ----- | ---------------- |
| Off     | 0     | -                |
| Red     | 1     | red-inv (9)      |
| Green   | 2     | green-inv (10)   |
| Yellow  | 3     | yellow-inv (11)  |
| Blue    | 4     | blue-inv (12)    |
| Magenta | 5     | magenta-inv (13) |
| Cyan    | 6     | cyan-inv (14)    |
| White   | 7     | white-inv (15)   |

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
- Maintain 100% type coverage for public APIs
- Add unit tests for all new functionality

### Tool Design Principles

When adding new tools, follow these principles:

- **Task-based**: Tools represent user intentions, not API endpoints
- **Domain-focused**: Group related operations by domain (channel, bus, fx, etc.)
- **Type-safe**: Use domain-specific parameters, not raw OSC addresses
- **Self-documenting**: Clear names, descriptions, and parameter definitions

See `CLAUDE.md` for detailed MCP tool design guidelines.

## Version History

- **v3.1.0** (Current) - Added bus, FX, and main/monitor tools, comprehensive testing infrastructure
- **v2.0.0** - ESM-only architecture, improved type safety
- **v1.0.0** - Initial release with channel and connection tools

## License

MIT

## Acknowledgments

- Based on the [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- OSC protocol implementation for Behringer X32/M32 mixers
- Thanks to Patrick-Gilles Maillot for X32 OSC documentation

## Support

For issues, questions, or contributions, please visit: https://github.com/GoBeromsu/X32-MCP

## Related Resources

- [X32/M32 OSC Protocol Documentation](docs/OSC-Protocol.md)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Behringer X32 Official Documentation](https://www.behringer.com/product.html?modelCode=P0ASF)
