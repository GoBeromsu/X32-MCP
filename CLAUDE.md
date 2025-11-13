# MCP TypeScript SDK Guide

## Build & Test Commands

```sh
npm run build        # Build ESM and CJS versions
npm run lint         # Run ESLint
npm test             # Run all tests
npx jest path/to/file.test.ts  # Run specific test file
npx jest -t "test name"        # Run tests matching pattern
```

## Code Style Guidelines

- **TypeScript**: Strict type checking, ES modules, explicit return types
- **Naming**: PascalCase for classes/types, camelCase for functions/variables
- **Files**: Lowercase with hyphens, test files with `.test.ts` suffix
- **Imports**: ES module style, include `.js` extension, group imports logically
- **Error Handling**: Use TypeScript's strict mode, explicit error checking in tests
- **Formatting**: 2-space indentation, semicolons required, single quotes preferred
- **Testing**: Co-locate tests with source files, use descriptive test names
- **Comments**: JSDoc for public APIs, inline comments for complex logic

## Project description

```
OSC UDP Transport (raw)
        ↓
Address Pattern DSL (/ch/01/mix/fader)
        ↓
MCP Tool Layer (task-based)
```

## MCP Tool Design Principles

### Core Philosophy

**Tools represent semantic user intentions, not API endpoints.**

MCP tools must be designed as **task-based abstractions** that reflect meaningful user actions, not thin wrappers around OSC address patterns. Each tool should represent a complete, semantically meaningful operation that an LLM agent would naturally choose.

### Tool Naming Convention

#### Pattern: `<domain>_<action>`

- **Domain**: The logical grouping (e.g., `channel`, `bus`, `fx`, `main`, `connection`)
- **Action**: The semantic task being performed (e.g., `set_volume`, `mute`, `get_state`)
- **Separator**: Use underscore (`_`) between domain and action
- **Case**: Use lowercase with underscores (snake_case)

#### Examples:

**✅ GOOD - Task-based, semantic actions:**

```
channel_set_volume           # Set channel fader level
channel_set_gain             # Set channel preamp gain
channel_mute                 # Mute/unmute a channel
channel_solo                 # Solo a channel
channel_get_state            # Get complete channel state
channel_set_eq_band          # Set specific EQ band parameters
bus_set_volume               # Set bus fader level
fx_set_parameter             # Set effects parameter
main_set_volume              # Set main stereo fader
connection_connect           # Connect to X32/M32
connection_get_info          # Get mixer information
```

**❌ BAD - Generic CRUD operations:**

```
channel                      # Too vague, unclear intention
get_parameter                # Generic API wrapper
set_parameter                # Generic API wrapper
channel_get                  # Unclear what is being retrieved
channel_set                  # Unclear what is being set
x32_channel_set_volume       # Unnecessary prefix
```

### Tool Granularity Rules

1. **One Tool = One Semantic Task**
    - Each tool should represent a single, clear user intention
    - Avoid mega-tools with multiple actions in a single tool
    - Avoid generic get/set tools that require users to know OSC addresses

2. **Domain Grouping**
    - Group related operations by domain (channel, bus, fx, etc.)
    - Keep domain boundaries clear and logical
    - Use domain prefix in tool names for discoverability

3. **Parameter Specificity**
    - Tool parameters should use domain-specific terminology, not raw OSC paths
    - Example: `channel: number, level: float` instead of `address: string, value: any`
    - Validate parameters at the tool level, not just at OSC level

4. **Expected Tool Count**
    - Target: 20-40 tools for complete X32/M32 control
    - Too few tools (< 10): Likely too generic, poor UX
    - Too many tools (> 100): Likely wrapping individual endpoints

### Implementation Guidelines

#### DO:

- Design tools around user workflows and intentions
- Use descriptive, action-oriented names
- Provide clear, domain-specific parameters
- Include comprehensive descriptions and examples
- Group related operations by domain
- Validate inputs at tool level with clear error messages

#### DON'T:

- Create thin wrappers around individual OSC endpoints
- Use generic get/set tools that expose raw OSC addresses
- Combine unrelated operations in a single tool
- Use technical jargon without explanation
- Require users to know OSC address patterns

### Migration Path

For existing generic tools (`get_parameter`, `set_parameter`):

1. Keep as low-level fallback tools for advanced users
2. Mark as "advanced" or "low-level" in descriptions
3. Prioritize building semantic, task-based tools
4. Gradually deprecate generic tools as semantic tools cover use cases

### Tool Structure Template

```typescript
export function register<Domain><Action>Tool(
  server: McpServer,
  connection: X32Connection
): void {
  server.registerTool(
    '<domain>_<action>',
    {
      title: '<Human-readable action description>',
      description: 'Clear explanation of what this tool does, when to use it, and expected outcomes',
      inputSchema: {
        // Domain-specific parameters, not raw OSC addresses
        <param1>: z.<type>().describe('Clear parameter description'),
        <param2>: z.<type>().describe('Clear parameter description')
      },
      annotations: {
        readOnlyHint: <boolean>,
        destructiveHint: <boolean>,
        idempotentHint: <boolean>,
        openWorldHint: true
      }
    },
    async (params): Promise<CallToolResult> => {
      // Implementation with clear error handling
    }
  );
}
```

### Progressive Implementation Strategy

Based on X32/M32 OSC protocol documentation, implement tools in this order:

1. **Phase 1: Connection & Info** (3-4 tools)
    - `connection_connect`, `connection_disconnect`, `connection_get_info`, `connection_get_status`

2. **Phase 2: Channel Control** (8-12 tools)
    - `channel_set_volume`, `channel_set_gain`, `channel_mute`, `channel_solo`
    - `channel_set_pan`, `channel_get_state`, `channel_set_eq_band`, `channel_set_compressor`

3. **Phase 3: Bus & Routing** (6-8 tools)
    - `bus_set_volume`, `bus_mute`, `bus_set_send`, `bus_get_state`

4. **Phase 4: Effects** (4-6 tools)
    - `fx_set_parameter`, `fx_get_state`, `fx_bypass`

5. **Phase 5: Main & Monitoring** (3-5 tools)
    - `main_set_volume`, `main_mute`, `monitor_set_level`

6. **Phase 6: Advanced** (3-5 tools)
    - `scene_load`, `scene_save`, `meter_subscribe`

## Project Structure

```
mcp-server-x32/
└── src/
    ├── index.ts        # Entry point for starting the MCP server
    ├── server.ts       # Server bootstrap: loads tools, sets up transport, registers capabilities
    ├── mcp/            # Core MCP protocol layer (server wiring, protocol utilities, session lifecycle)
    ├── tools/          # Task-level tools exposed to LLMs (task abstraction, not raw API calls)
    │   ├── channel.ts      # Channel domain tools (set_volume, mute, solo, get_state, etc.)
    │   ├── bus.ts          # Bus domain tools (set_volume, mute, set_send, etc.)
    │   ├── fx.ts           # Effects domain tools (set_parameter, bypass, get_state, etc.)
    │   ├── main.ts         # Main/routing domain tools (set_volume, mute, etc.)
    │   ├── connection.ts   # Connection domain tools (connect, disconnect, get_info, etc.)
    │   └── scene.ts        # Scene management tools (load, save, etc.)
        ...
    ├── services/       # Domain logic for X32 control (OSC communication, address patterns, get/set logic)
    ├── types/          # Shared TypeScript types used across MCP, tools, and services
    └── utils/          # Reusable utilities (logging, validation, error helpers, environment helpers)
```

### Tool File Organization

**Principle: One file per domain, multiple tools per file**

- Each file represents a logical domain (channel, bus, fx, etc.)
- Each file contains multiple task-based tools within that domain
- Tools are registered as separate MCP tools but organized by domain

**Why domain-based files?**

- X32/M32 is inherently organized as domain-based subsystems
- Each domain has independent semantic meaning
- Improves code maintainability and readability
- Reduces cross-domain conflicts

**Example: `bus.ts`**

```typescript
// Multiple tools in one domain file
export function registerBusTools(server: McpServer, connection: X32Connection): void {
    registerBusSetVolumeTool(server, connection);
    registerBusMuteTool(server, connection);
    registerBusGetStateTool(server, connection);
}
```

- Tests alongside source files with `.test.ts` suffix
- Node.js >= 18 required
