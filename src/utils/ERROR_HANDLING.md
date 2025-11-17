# Error Handling Utilities

Comprehensive error handling utilities for the X32-MCP server that provide consistent, actionable error messages following MCP best practices.

## Overview

The error handling module (`error-messages.ts`) provides a standardized way to format error messages across the X32-MCP server. All error messages follow a consistent pattern with clear problem descriptions, specific details, actionable solutions, and next steps.

## Error Message Pattern

All error messages follow this structure:

```
Problem: [What went wrong]
Details: [Specific information]
Solution: [Steps to fix]
Next: [Alternative actions]
```

## Error Types

The module defines several standard error types:

- `ConnectionError`: Connection failures (timeout, refused, unreachable)
- `ValidationError`: Invalid parameters
- `RangeError`: Values out of bounds
- `HardwareError`: X32/M32 communication issues
- `TimeoutError`: Operation timed out
- `NotConnectedError`: No active connection
- `ResponseError`: Invalid response from mixer

## Core Functions

### Connection Errors

```typescript
formatConnectionError(host: string, port: number, error: Error | string): StructuredErrorMessage
```

Formats connection errors with context-aware messaging for:

- Connection timeout
- Connection refused (ECONNREFUSED)
- Host unreachable (EHOSTUNREACH)
- Generic connection failures

Example:

```typescript
const error = formatConnectionError('192.168.1.100', 10023, 'ECONNREFUSED');
console.log(error.formatted);
// Problem: Connection refused by X32/M32 mixer
// Details: The mixer at 192.168.1.100:10023 actively refused the connection...
// Solution: 1. Verify OSC is enabled on the mixer...
// Next: Verify OSC settings on mixer: Setup > Network > OSC...
```

### Validation Errors

```typescript
formatValidationError(paramName: string, value: unknown, constraint: string, suggestion?: string): StructuredErrorMessage
```

Formats parameter validation errors with optional suggestions.

Example:

```typescript
const error = formatValidationError('channel', 'invalid', 'must be a number between 1 and 32', '16');
```

### Range Errors

```typescript
formatRangeError(paramName: string, value: number, min: number, max: number, unit?: string): StructuredErrorMessage
```

Formats range validation errors with automatic suggestion of valid values.

Example:

```typescript
const error = formatRangeError('fader', -100, -90, 10, 'dB');
```

### Not Connected Errors

```typescript
formatNotConnectedError(suggestedAction: string, host?: string, port?: number): StructuredErrorMessage
```

Formats errors when operations are attempted without an active connection.

Example:

```typescript
const error = formatNotConnectedError('set channel volume', '192.168.1.100', 10023);
```

### Timeout Errors

```typescript
formatTimeoutError(operation: string, address: string, timeoutMs: number): StructuredErrorMessage
```

Formats timeout errors with OSC address context.

Example:

```typescript
const error = formatTimeoutError('get channel volume', '/ch/01/mix/fader', 5000);
```

### Hardware Errors

```typescript
formatHardwareError(operation: string, error: Error | string): StructuredErrorMessage
```

Formats hardware communication errors.

Example:

```typescript
const error = formatHardwareError('set parameter', new Error('UDP send failed'));
```

### Response Errors

```typescript
formatResponseError(address: string, expectedFormat: string, receivedData: unknown): StructuredErrorMessage
```

Formats errors for invalid or unexpected responses from the mixer.

Example:

```typescript
const error = formatResponseError('/info', 'four string arguments', ['V2.05', 'osc-server']);
```

## Domain-Specific Helpers

Convenience functions for common X32/M32 parameter validations:

### Channel Validation

```typescript
formatChannelError(channel: number, maxChannels: number = 32): StructuredErrorMessage
```

### Bus Validation

```typescript
formatBusError(bus: number, maxBuses: number = 16): StructuredErrorMessage
```

### Fader Level Validation

```typescript
formatFaderError(value: number, unit: 'linear' | 'db'): StructuredErrorMessage
```

### Gain Validation

```typescript
formatGainError(gain: number): StructuredErrorMessage
```

### EQ Band Validation

```typescript
formatEqBandError(band: number): StructuredErrorMessage
```

### FX Slot Validation

```typescript
formatFxSlotError(slot: number, maxSlots: number = 8): StructuredErrorMessage
```

## Utility Functions

### createToolErrorMessage

```typescript
createToolErrorMessage(error: Error | StructuredErrorMessage | string): string
```

Automatically formats errors for MCP tool responses. Detects error type and applies appropriate formatting.

Example:

```typescript
try {
    await connection.setParameter(address, value);
} catch (error) {
    const errorText = createToolErrorMessage(error);
    return {
        content: [{ type: 'text', text: errorText }],
        isError: true
    };
}
```

### getErrorText

```typescript
getErrorText(structuredError: StructuredErrorMessage): string
```

Extracts the formatted text from a structured error message.

### isConnectionError

```typescript
isConnectionError(error: Error | string): boolean
```

Detects if an error is connection-related.

### isTimeoutError

```typescript
isTimeoutError(error: Error | string): boolean
```

Detects if an error is timeout-related.

## Usage in MCP Tools

### Example: Channel Set Volume Tool

```typescript
async function channelSetVolumeTool(connection: X32Connection, channel: number, value: number, unit: 'linear' | 'db'): Promise<CallToolResult> {
    // Check connection
    if (!connection.connected) {
        const errorMsg = formatNotConnectedError('set channel volume');
        return {
            content: [{ type: 'text', text: getErrorText(errorMsg) }],
            isError: true
        };
    }

    // Validate channel range
    if (channel < 1 || channel > 32) {
        const errorMsg = formatChannelError(channel);
        return {
            content: [{ type: 'text', text: getErrorText(errorMsg) }],
            isError: true
        };
    }

    // Validate value range
    if (unit === 'db' && (value < -90 || value > 10)) {
        const errorMsg = formatFaderError(value, 'db');
        return {
            content: [{ type: 'text', text: getErrorText(errorMsg) }],
            isError: true
        };
    }

    try {
        await connection.setChannelParameter(channel, 'mix/fader', value);
        return {
            content: [{ type: 'text', text: `Set channel ${channel} volume` }]
        };
    } catch (error) {
        // Automatic error classification and formatting
        const errorText = createToolErrorMessage(error);
        return {
            content: [{ type: 'text', text: errorText }],
            isError: true
        };
    }
}
```

## Benefits

1. **Consistency**: All errors follow the same format across the entire codebase
2. **Actionability**: Every error includes specific steps to resolve the issue
3. **Context**: Errors include all relevant information (host, port, values, ranges)
4. **User-Friendly**: Clear language that explains what went wrong and how to fix it
5. **Type-Safe**: Full TypeScript support with proper types for all functions
6. **Testable**: Comprehensive test coverage (47 tests, 100% pass rate)
7. **MCP Best Practices**: Follows Model Context Protocol guidelines for error messages

## Testing

Run tests with:

```bash
npm test -- error-messages.test.ts
```

See `error-messages.example.ts` for usage examples.

## Files

- `error-messages.ts` - Core error handling utilities
- `error-messages.test.ts` - Comprehensive test suite (47 tests)
- `error-messages.example.ts` - Usage examples and patterns
- `ERROR_HANDLING.md` - This documentation

## Best Practices

1. Always use structured error messages for consistency
2. Include context (host, port, values) in error messages
3. Provide actionable next steps for users
4. Use domain-specific helpers for common validations
5. Use `createToolErrorMessage` for automatic error classification
6. Test error handling paths in all tools
7. Keep error messages clear and non-technical when possible
8. Include specific values in error details for debugging
