/**
 * Example usage of error-messages utility
 * This file demonstrates how to use the error handling utilities
 * in different scenarios within the X32-MCP project
 */

import {
    formatConnectionError,
    formatValidationError,
    formatRangeError,
    formatNotConnectedError,
    formatTimeoutError,
    formatHardwareError,
    formatResponseError,
    formatChannelError,
    formatBusError,
    formatFaderError,
    createToolErrorMessage,
    getErrorText
} from './error-messages.js';

/**
 * Example 1: Connection errors in connection tools
 */
export function exampleConnectionToolError(): void {
    const host = '192.168.1.100';
    const port = 10023;

    try {
        // Simulated connection attempt
        throw new Error('ECONNREFUSED');
    } catch (error) {
        const errorMsg = formatConnectionError(host, port, error as Error);
        console.log('Connection Error:');
        console.log(getErrorText(errorMsg));
        console.log('\nStructured data:', {
            type: errorMsg.type,
            severity: errorMsg.severity
        });
    }
}

/**
 * Example 2: Validation errors in tool parameters
 */
export function exampleValidationError(): void {
    const channelInput = 'invalid';

    if (typeof channelInput !== 'number') {
        const errorMsg = formatValidationError('channel', channelInput, 'must be a number between 1 and 32', '16');
        console.log('Validation Error:');
        console.log(getErrorText(errorMsg));
    }
}

/**
 * Example 3: Range errors for channel numbers
 */
export function exampleChannelRangeError(): void {
    const channel = 99;

    if (channel < 1 || channel > 32) {
        const errorMsg = formatChannelError(channel);
        console.log('Channel Range Error:');
        console.log(getErrorText(errorMsg));
    }
}

/**
 * Example 4: Range errors for fader values
 */
export function exampleFaderRangeError(): void {
    const faderDb = -100;

    if (faderDb < -90 || faderDb > 10) {
        const errorMsg = formatFaderError(faderDb, 'db');
        console.log('Fader Range Error:');
        console.log(getErrorText(errorMsg));
    }
}

/**
 * Example 5: Not connected errors
 */
export function exampleNotConnectedError(): void {
    const isConnected = false;

    if (!isConnected) {
        const errorMsg = formatNotConnectedError('set channel volume', '192.168.1.100', 10023);
        console.log('Not Connected Error:');
        console.log(getErrorText(errorMsg));
    }
}

/**
 * Example 6: Timeout errors
 */
export function exampleTimeoutError(): void {
    const address = '/ch/01/mix/fader';
    const timeoutMs = 5000;

    const errorMsg = formatTimeoutError('get channel volume', address, timeoutMs);
    console.log('Timeout Error:');
    console.log(getErrorText(errorMsg));
}

/**
 * Example 7: Hardware communication errors
 */
export function exampleHardwareError(): void {
    try {
        // Simulated hardware error
        throw new Error('UDP send failed: Network is unreachable');
    } catch (error) {
        const errorMsg = formatHardwareError('set parameter', error as Error);
        console.log('Hardware Error:');
        console.log(getErrorText(errorMsg));
    }
}

/**
 * Example 8: Invalid response errors
 */
export function exampleResponseError(): void {
    const address = '/info';
    const expectedFormat = 'four string arguments (version, name, model, firmware)';
    const receivedData = ['V2.05', 'osc-server']; // Missing arguments

    const errorMsg = formatResponseError(address, expectedFormat, receivedData);
    console.log('Response Error:');
    console.log(getErrorText(errorMsg));
}

/**
 * Example 9: Using createToolErrorMessage for MCP tools
 */
export function exampleMcpToolError(): { content: { type: string; text: string }[]; isError: boolean } {
    try {
        // Simulated operation
        throw new Error('Not connected to X32/M32');
    } catch (error) {
        // Automatically formats error for MCP CallToolResult
        const errorText = createToolErrorMessage(error as Error);

        return {
            content: [
                {
                    type: 'text',
                    text: errorText
                }
            ],
            isError: true
        };
    }
}

/**
 * Simple connection interface for examples
 */
interface ExampleConnection {
    connected: boolean;
    setChannelParameter(channel: number, param: string, value: number): Promise<void>;
}

/**
 * Tool result type for examples
 */
interface ToolResult {
    content: { type: string; text: string }[];
    isError?: boolean;
}

/**
 * Example 10: Using in actual tool implementation
 */
export async function exampleChannelSetVolumeTool(
    connection: ExampleConnection,
    channel: number,
    value: number,
    unit: 'linear' | 'db'
): Promise<ToolResult> {
    // Check connection
    if (!connection.connected) {
        const errorMsg = formatNotConnectedError('set channel volume');
        return {
            content: [{ type: 'text', text: getErrorText(errorMsg) }],
            isError: true
        };
    }

    // Validate channel
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

    if (unit === 'linear' && (value < 0 || value > 1)) {
        const errorMsg = formatFaderError(value, 'linear');
        return {
            content: [{ type: 'text', text: getErrorText(errorMsg) }],
            isError: true
        };
    }

    try {
        // Attempt operation
        await connection.setChannelParameter(channel, 'mix/fader', value);
        return {
            content: [{ type: 'text', text: `Set channel ${channel} volume to ${value}` }]
        };
    } catch (error) {
        // Use createToolErrorMessage for automatic error classification
        const errorText = createToolErrorMessage(error as Error);
        return {
            content: [{ type: 'text', text: errorText }],
            isError: true
        };
    }
}

/**
 * Example 11: Custom range error with specific units
 */
export function exampleCustomRangeError(): void {
    const frequency = 25000; // Hz
    const minFreq = 20;
    const maxFreq = 20000;

    if (frequency < minFreq || frequency > maxFreq) {
        const errorMsg = formatRangeError('frequency', frequency, minFreq, maxFreq, 'Hz');
        console.log('Frequency Range Error:');
        console.log(getErrorText(errorMsg));
    }
}

/**
 * Example 12: Bus range error
 */
export function exampleBusRangeError(): void {
    const bus = 20;

    if (bus < 1 || bus > 16) {
        const errorMsg = formatBusError(bus);
        console.log('Bus Range Error:');
        console.log(getErrorText(errorMsg));
    }
}

/**
 * Run all examples
 */
export function runAllExamples(): void {
    console.log('=== Error Messages Utility Examples ===\n');

    console.log('--- Example 1: Connection Error ---');
    exampleConnectionToolError();
    console.log('\n');

    console.log('--- Example 2: Validation Error ---');
    exampleValidationError();
    console.log('\n');

    console.log('--- Example 3: Channel Range Error ---');
    exampleChannelRangeError();
    console.log('\n');

    console.log('--- Example 4: Fader Range Error ---');
    exampleFaderRangeError();
    console.log('\n');

    console.log('--- Example 5: Not Connected Error ---');
    exampleNotConnectedError();
    console.log('\n');

    console.log('--- Example 6: Timeout Error ---');
    exampleTimeoutError();
    console.log('\n');

    console.log('--- Example 7: Hardware Error ---');
    exampleHardwareError();
    console.log('\n');

    console.log('--- Example 8: Response Error ---');
    exampleResponseError();
    console.log('\n');

    console.log('--- Example 11: Custom Range Error ---');
    exampleCustomRangeError();
    console.log('\n');

    console.log('--- Example 12: Bus Range Error ---');
    exampleBusRangeError();
    console.log('\n');
}

// Uncomment to run examples:
// runAllExamples();
