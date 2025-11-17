/**
 * Error handling utilities for X32/M32 MCP Server
 * Provides consistent, actionable error messages following MCP best practices
 */

/**
 * Error types for X32/M32 operations
 */
export enum ErrorType {
    CONNECTION = 'ConnectionError',
    VALIDATION = 'ValidationError',
    HARDWARE = 'HardwareError',
    RANGE = 'RangeError',
    TIMEOUT = 'TimeoutError',
    NOT_CONNECTED = 'NotConnectedError',
    RESPONSE = 'ResponseError'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

/**
 * Structured error message interface
 */
export interface StructuredErrorMessage {
    type: ErrorType;
    severity: ErrorSeverity;
    problem: string;
    details: string;
    solution: string;
    next: string;
    formatted: string;
}

/**
 * Format a structured error message using the standard template
 * @param type Error type
 * @param severity Error severity
 * @param problem What went wrong
 * @param details Specific information about the error
 * @param solution Steps to fix the issue
 * @param next Alternative actions to try
 * @returns Structured error message
 */
export function formatErrorMessage(
    type: ErrorType,
    severity: ErrorSeverity,
    problem: string,
    details: string,
    solution: string,
    next: string
): StructuredErrorMessage {
    const formatted = [`Problem: ${problem}`, `Details: ${details}`, `Solution: ${solution}`, `Next: ${next}`].join('\n');

    return {
        type,
        severity,
        problem,
        details,
        solution,
        next,
        formatted
    };
}

/**
 * Format a connection error message
 * @param host Target host address
 * @param port Target port number
 * @param error Original error object or message
 * @returns Structured error message
 */
export function formatConnectionError(host: string, port: number, error: Error | string): StructuredErrorMessage {
    const errorMessage = error instanceof Error ? error.message : error;
    const isTimeout = errorMessage.toLowerCase().includes('timeout');
    const isRefused = errorMessage.toLowerCase().includes('refused') || errorMessage.toLowerCase().includes('econnrefused');
    const isUnreachable = errorMessage.toLowerCase().includes('unreachable') || errorMessage.toLowerCase().includes('ehostunreach');

    let problem: string;
    let details: string;
    let solution: string;
    let next: string;

    if (isTimeout) {
        problem = 'Connection to X32/M32 mixer timed out';
        details = `Failed to establish connection to ${host}:${port} within the timeout period. Error: ${errorMessage}`;
        solution =
            '1. Verify the mixer is powered on\n2. Check network connectivity (ping the mixer IP)\n3. Verify the IP address is correct\n4. Ensure no firewall is blocking UDP port ' +
            port;
        next = 'Try: ping ' + host + ' to verify network connectivity, or check the mixer network settings on the setup screen';
    } else if (isRefused) {
        problem = 'Connection refused by X32/M32 mixer';
        details = `The mixer at ${host}:${port} actively refused the connection. Error: ${errorMessage}`;
        solution =
            '1. Verify OSC is enabled on the mixer (Setup > Network > OSC)\n2. Check that port ' +
            port +
            ' is the correct OSC port (default: 10023)\n3. Ensure no other application is using the OSC connection';
        next = 'Verify OSC settings on mixer: Setup > Network > OSC, or try disconnecting other OSC clients';
    } else if (isUnreachable) {
        problem = 'X32/M32 mixer is unreachable on the network';
        details = `Cannot reach mixer at ${host}:${port}. The host may be on a different subnet or network. Error: ${errorMessage}`;
        solution =
            '1. Verify the mixer IP address matches your network subnet\n2. Check network cables are connected\n3. Ensure computer and mixer are on the same network\n4. Check mixer network settings (Setup > Network > IP Config)';
        next = 'Verify mixer IP address on Setup > Network > IP Config screen, or check your computer network settings';
    } else {
        problem = 'Failed to connect to X32/M32 mixer';
        details = `Connection attempt to ${host}:${port} failed. Error: ${errorMessage}`;
        solution =
            '1. Verify the mixer is powered on and connected to the network\n2. Check the IP address is correct (current: ' +
            host +
            ')\n3. Ensure port ' +
            port +
            ' is not blocked by firewall\n4. Verify network connectivity between computer and mixer';
        next = 'Use connection_connect tool with the correct IP address and port (default port: 10023)';
    }

    return formatErrorMessage(ErrorType.CONNECTION, ErrorSeverity.ERROR, problem, details, solution, next);
}

/**
 * Format a validation error message
 * @param paramName Parameter name that failed validation
 * @param value Invalid value provided
 * @param constraint Validation constraint that was violated
 * @param suggestion Optional suggestion for a valid value
 * @returns Structured error message
 */
export function formatValidationError(paramName: string, value: unknown, constraint: string, suggestion?: string): StructuredErrorMessage {
    const problem = `Invalid value for parameter "${paramName}"`;
    const details = `Received value: ${JSON.stringify(value)}. Constraint: ${constraint}`;
    const solution = suggestion ? `Use a value that ${constraint}. Suggested value: ${suggestion}` : `Provide a value that ${constraint}`;
    const next = 'Check the tool documentation for valid parameter ranges and formats';

    return formatErrorMessage(ErrorType.VALIDATION, ErrorSeverity.WARNING, problem, details, solution, next);
}

/**
 * Format a range error message
 * @param paramName Parameter name that is out of range
 * @param value Value that is out of range
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param unit Optional unit of measurement
 * @returns Structured error message
 */
export function formatRangeError(paramName: string, value: number, min: number, max: number, unit?: string): StructuredErrorMessage {
    const unitStr = unit ? ` ${unit}` : '';
    const problem = `Parameter "${paramName}" is out of valid range`;
    const details = `Received: ${value}${unitStr}. Valid range: ${min}${unitStr} to ${max}${unitStr}`;

    let suggestion: number;
    if (value < min) {
        suggestion = min;
    } else if (value > max) {
        suggestion = max;
    } else {
        suggestion = (min + max) / 2;
    }

    const solution = `Use a value between ${min}${unitStr} and ${max}${unitStr}. Suggested: ${suggestion}${unitStr}`;
    const next = `Retry with a valid value in the range [${min}, ${max}]`;

    return formatErrorMessage(ErrorType.RANGE, ErrorSeverity.WARNING, problem, details, solution, next);
}

/**
 * Format a "not connected" error message
 * @param suggestedAction Action that requires a connection
 * @param host Optional last known host
 * @param port Optional last known port
 * @returns Structured error message
 */
export function formatNotConnectedError(suggestedAction: string, host?: string, port?: number): StructuredErrorMessage {
    const problem = 'Not connected to X32/M32 mixer';
    const details = `Cannot ${suggestedAction} because there is no active connection to the mixer`;

    let solution: string;
    if (host && port) {
        solution = `Establish a connection first using: connection_connect with host="${host}" and port=${port}`;
    } else {
        solution = 'Establish a connection first using: connection_connect with the mixer IP address and port (default: 10023)';
    }

    const next = 'Use connection_connect tool to establish a connection before performing mixer operations';

    return formatErrorMessage(ErrorType.NOT_CONNECTED, ErrorSeverity.ERROR, problem, details, solution, next);
}

/**
 * Format a timeout error message
 * @param operation Operation that timed out
 * @param address OSC address that was accessed
 * @param timeoutMs Timeout duration in milliseconds
 * @returns Structured error message
 */
export function formatTimeoutError(operation: string, address: string, timeoutMs: number): StructuredErrorMessage {
    const problem = `Operation timed out: ${operation}`;
    const details = `No response received from OSC address "${address}" within ${timeoutMs}ms`;
    const solution =
        '1. Verify the mixer is still connected and powered on\n2. Check network stability and latency\n3. Ensure the OSC address is valid for your mixer model\n4. Verify mixer is not overloaded with requests';
    const next = 'Retry the operation, or check connection status with connection_get_status';

    return formatErrorMessage(ErrorType.TIMEOUT, ErrorSeverity.ERROR, problem, details, solution, next);
}

/**
 * Format a hardware communication error
 * @param operation Operation that failed
 * @param error Original error
 * @returns Structured error message
 */
export function formatHardwareError(operation: string, error: Error | string): StructuredErrorMessage {
    const errorMessage = error instanceof Error ? error.message : error;
    const problem = `Hardware communication error during ${operation}`;
    const details = `The X32/M32 mixer encountered a communication error. Error: ${errorMessage}`;
    const solution =
        '1. Check the mixer is still powered on and responsive\n2. Verify network connection stability\n3. Try reconnecting to the mixer\n4. Check mixer firmware is up to date';
    const next = 'Use connection_disconnect and then connection_connect to re-establish the connection';

    return formatErrorMessage(ErrorType.HARDWARE, ErrorSeverity.ERROR, problem, details, solution, next);
}

/**
 * Format an invalid response error
 * @param address OSC address that was queried
 * @param expectedFormat Expected response format
 * @param receivedData Actual data received
 * @returns Structured error message
 */
export function formatResponseError(address: string, expectedFormat: string, receivedData: unknown): StructuredErrorMessage {
    const problem = 'Invalid or unexpected response from X32/M32 mixer';
    const details = `Expected ${expectedFormat} from "${address}", but received: ${JSON.stringify(receivedData)}`;
    const solution =
        '1. Verify the OSC address is correct for your mixer model (X32 vs M32)\n2. Check mixer firmware version compatibility\n3. Ensure mixer is in normal operating mode\n4. Try querying a different parameter to verify communication';
    const next = 'Use connection_get_info to verify mixer model and firmware version';

    return formatErrorMessage(ErrorType.RESPONSE, ErrorSeverity.ERROR, problem, details, solution, next);
}

/**
 * Format a generic error with minimal context
 * @param operation Operation that failed
 * @param error Original error
 * @returns Structured error message
 */
export function formatGenericError(operation: string, error: Error | string): StructuredErrorMessage {
    const errorMessage = error instanceof Error ? error.message : error;
    const problem = `Operation failed: ${operation}`;
    const details = `Error: ${errorMessage}`;
    const solution = 'Review the error details and verify all parameters are correct';
    const next = 'Check mixer connection status with connection_get_status, or consult the documentation';

    return formatErrorMessage(ErrorType.HARDWARE, ErrorSeverity.ERROR, problem, details, solution, next);
}

/**
 * Helper to extract just the formatted text from a structured error
 * @param structuredError Structured error message
 * @returns Formatted error text ready for display
 */
export function getErrorText(structuredError: StructuredErrorMessage): string {
    return structuredError.formatted;
}

/**
 * Helper to check if an error is a connection-related error
 * @param error Error to check
 * @returns True if connection-related
 */
export function isConnectionError(error: Error | string): boolean {
    const msg = (error instanceof Error ? error.message : error).toLowerCase();
    return (
        msg.includes('connect') ||
        msg.includes('econnrefused') ||
        msg.includes('ehostunreach') ||
        msg.includes('enetunreach') ||
        msg.includes('timeout')
    );
}

/**
 * Helper to check if an error is a timeout error
 * @param error Error to check
 * @returns True if timeout-related
 */
export function isTimeoutError(error: Error | string): boolean {
    const msg = (error instanceof Error ? error.message : error).toLowerCase();
    return msg.includes('timeout') || msg.includes('timed out');
}

/**
 * Helper to format channel number validation error
 * @param channel Invalid channel number
 * @param maxChannels Maximum number of channels (default 32)
 * @returns Structured error message
 */
export function formatChannelError(channel: number, maxChannels: number = 32): StructuredErrorMessage {
    return formatRangeError('channel', channel, 1, maxChannels);
}

/**
 * Helper to format bus number validation error
 * @param bus Invalid bus number
 * @param maxBuses Maximum number of buses (default 16)
 * @returns Structured error message
 */
export function formatBusError(bus: number, maxBuses: number = 16): StructuredErrorMessage {
    return formatRangeError('bus', bus, 1, maxBuses);
}

/**
 * Helper to format fader level validation error
 * @param value Invalid fader value
 * @param unit Unit type ('linear' or 'db')
 * @returns Structured error message
 */
export function formatFaderError(value: number, unit: 'linear' | 'db'): StructuredErrorMessage {
    if (unit === 'db') {
        return formatRangeError('fader', value, -90, 10, 'dB');
    } else {
        return formatRangeError('fader', value, 0, 1, '');
    }
}

/**
 * Helper to format gain validation error
 * @param gain Invalid gain value
 * @returns Structured error message
 */
export function formatGainError(gain: number): StructuredErrorMessage {
    return formatRangeError('gain', gain, 0, 1);
}

/**
 * Helper to format EQ band number validation error
 * @param band Invalid band number
 * @returns Structured error message
 */
export function formatEqBandError(band: number): StructuredErrorMessage {
    return formatRangeError('EQ band', band, 1, 4);
}

/**
 * Helper to format FX slot number validation error
 * @param slot Invalid FX slot number
 * @param maxSlots Maximum number of FX slots (default 8)
 * @returns Structured error message
 */
export function formatFxSlotError(slot: number, maxSlots: number = 8): StructuredErrorMessage {
    return formatRangeError('FX slot', slot, 1, maxSlots);
}

/**
 * Create a user-friendly error message for MCP tool responses
 * @param error Error object, structured error, or string
 * @returns Formatted error text suitable for MCP CallToolResult
 */
export function createToolErrorMessage(error: Error | StructuredErrorMessage | string): string {
    if (typeof error === 'string') {
        return error;
    }

    if ('formatted' in error) {
        return error.formatted;
    }

    // Handle standard Error objects
    const errorMsg = error.message;

    // Try to provide context-aware error messages
    if (errorMsg.includes('Not connected')) {
        const structured = formatNotConnectedError('perform this operation');
        return structured.formatted;
    }

    if (isTimeoutError(errorMsg)) {
        const structured = formatTimeoutError('mixer operation', 'unknown', 5000);
        return structured.formatted;
    }

    if (isConnectionError(errorMsg)) {
        const structured = formatConnectionError('unknown', 10023, errorMsg);
        return structured.formatted;
    }

    // Generic fallback
    return `Error: ${errorMsg}\n\nSolution: Check the error details and verify all parameters are correct.\n\nNext: Verify connection status with connection_get_status`;
}
