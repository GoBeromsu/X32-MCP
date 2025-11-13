# X32 MCP Server

Model Context Protocol (MCP) server for controlling Behringer X32/M32 digital mixers via OSC protocol.

## Features

### Connection & Information

- **Connect to X32/M32 mixers** over UDP/OSC (default port: 10023)
- **Retrieve console information** (`/info`) - model, version, server details
- **Get current mixer status** (`/status`) - state, IP address

### Parameter Control

- **Universal parameter access** via OSC address patterns
    - Get/Set any parameter using address patterns (e.g., `/ch/01/mix/fader`)
    - Type-safe parameter operations with TypeScript
- **High-level channel control** (channels 1-32)
    - Direct access to mix parameters (fader, pan, on/off)
    - Configuration settings (name, icon, color)
    - EQ parameters (type, frequency, gain, Q)
    - Dynamics parameters (on, mode, threshold, ratio, etc.)
- **Bus parameter control** (buses 1-16)
- **Extensible architecture** for Main LR, DCA, FX, and more

### Type System

- **Address Pattern typing** - strongly typed OSC addresses
- **Parameter type mapping** - automatic type inference for values
- **Zod schema validation** - runtime type checking for all inputs

## Installation

```bash
npm install
```

## Usage

### Start the MCP Server

```bash
npm run x32:server
```

The server runs on stdio transport and provides the following MCP tools:

#### Basic Tools

- **`x32_connect`** - Connect to X32/M32 mixer
    - Parameters: `host` (IP address), `port` (default: 10023)
    - Annotations: idempotent, open-world
- **`x32_get_info`** - Get console information
    - Returns: console model, version, server name/version
    - Annotations: read-only, idempotent
- **`x32_get_status`** - Get current mixer status
    - Returns: state, IP address, server name
    - Annotations: read-only, idempotent

#### Parameter Control Tools

- **`x32_get_parameter`** - Get any parameter by OSC address
    - Parameters: `address` (e.g., `/ch/01/mix/fader`)
    - Returns: parameter value (number, string, etc.)
    - Annotations: read-only, idempotent
- **`x32_set_parameter`** - Set any parameter by OSC address
    - Parameters: `address`, `value` (string or number)
    - Annotations: destructive, open-world
- **`x32_channel`** - High-level channel control
    - Parameters: `channel` (1-32), `action` (get/set), `parameter`, `value` (optional)
    - Examples: `mix/fader`, `config/name`, `eq/1/f`
    - Annotations: open-world

### Testing

Test the X32 connection with a real mixer:

```bash
npm run x32:test
```

Edit `test/x32-connection.test.ts` to configure your mixer's IP address and port.

## Configuration

Default X32/M32 OSC port: **10023**

## Architecture

```
src/x32-server/
├── index.ts                      # Main MCP server entry point
├── x32-connection.ts             # X32 UDP/OSC connection manager
├── types.ts                      # TypeScript type definitions & Address Pattern types
├── tools/                        # MCP tool definitions
│   ├── connect.tool.ts           # x32_connect tool
│   ├── info.tool.ts              # x32_get_info tool
│   ├── status.tool.ts            # x32_get_status tool
│   ├── get-parameter.tool.ts     # x32_get_parameter tool
│   ├── set-parameter.tool.ts     # x32_set_parameter tool
│   ├── channel.tool.ts           # x32_channel tool
│   └── index.ts                  # Tool registration exports
└── README.md                     # This file

test/
└── x32-connection.test.ts        # Connection & parameter tests
```

### Design Patterns

- **Separation of Concerns**: Each tool in separate file with proper annotations
- **Type Safety**: Address patterns mapped to expected value types
- **Universal API**: Low-level `getParameter`/`setParameter` for any OSC address
- **Helper Methods**: High-level methods for common operations (channels, buses)

## Protocol Documentation

For detailed information about the X32/M32 OSC protocol, see:

- `docs/OSC-Protocal.md` - Main protocol overview
- `docs/x32-protocol/` - Detailed protocol specifications

## Development

### Technology Stack

- **OSC Protocol**: `osc` npm package for OSC message handling
- **Event System**: Node.js `EventEmitter` for connection events
- **MCP SDK**: Model Context Protocol integration
- **Type Safety**: TypeScript with Zod schema validation
- **Transport**: stdio for local integration

### Adding New Tools

1. Create tool file in `src/x32-server/tools/`
2. Define tool with proper Zod schemas
3. Add appropriate annotations (readOnlyHint, destructiveHint, etc.)
4. Export registration function
5. Register in `tools/index.ts` and `index.ts`

Example:

```typescript
// tools/my-tool.tool.ts
export function registerMyTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'x32_my_tool',
        'Tool description',
        {
            param: z.string().describe('Parameter description')
        },
        {
            title: 'My Tool',
            readOnlyHint: true,
            idempotentHint: true
        },
        async ({ param }) => {
            // Implementation
        }
    );
}
```

### Extending Address Patterns

Add new patterns to `types.ts`:

```typescript
export interface ParamTypeMap {
    '/new/{id}/parameter': number;
    // ...
}
```

## Examples

### Basic Connection

```typescript
import { X32Connection } from './x32-connection.js';

const connection = new X32Connection();

// Connect to mixer
await connection.connect({
    host: '10.69.6.254',
    port: 10023
});

// Get console info
const info = await connection.getInfo();
console.log('Console Model:', info.consoleModel);
console.log('Version:', info.consoleVersion);

// Get status
const status = await connection.getStatus();
console.log('Status:', status.state);

await connection.disconnect();
```

### Universal Parameter Access

```typescript
// Get any parameter by address
const fader = await connection.getParameter<number>('/ch/01/mix/fader');
console.log('Fader:', fader); // 0.0 - 1.0

const name = await connection.getParameter<string>('/ch/01/config/name');
console.log('Name:', name);

// Set any parameter
await connection.setParameter('/ch/01/mix/fader', 0.75);
await connection.setParameter('/ch/01/config/name', 'Vocal 1');
```

### Channel Control (High-Level API)

```typescript
// Get channel parameters
const fader = await connection.getChannelParameter<number>(1, 'mix/fader');
const name = await connection.getChannelParameter<string>(1, 'config/name');
const eq = await connection.getChannelParameter<number>(1, 'eq/1/f');

// Set channel parameters
await connection.setChannelParameter(1, 'mix/fader', 0.8);
await connection.setChannelParameter(1, 'config/name', 'Lead Vocal');
await connection.setChannelParameter(1, 'mix/on', 1); // Unmute
```

### Bus Control

```typescript
// Get bus parameters
const busFader = await connection.getBusParameter<number>(1, 'mix/fader');

// Set bus parameters
await connection.setBusParameter(1, 'mix/fader', 0.7);
await connection.setBusParameter(1, 'mix/on', 1);
```

### Address Pattern Examples

```typescript
// Channel parameters
'/ch/01/mix/fader'; // Channel 1 fader (float 0.0-1.0)
'/ch/01/mix/on'; // Channel 1 on/off (int 0 or 1)
'/ch/01/config/name'; // Channel 1 name (string)
'/ch/01/eq/1/f'; // Channel 1 EQ band 1 frequency (float)
'/ch/01/dyn/thr'; // Channel 1 dynamics threshold (float)

// Bus parameters
'/bus/01/mix/fader'; // Bus 1 fader
'/bus/01/mix/pan'; // Bus 1 pan

// Main LR
'/main/st/mix/fader'; // Main stereo fader

// DCA
'/dca/1/fader'; // DCA 1 fader
```

## License

MIT
