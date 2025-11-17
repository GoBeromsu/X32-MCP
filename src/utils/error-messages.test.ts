import {
    ErrorType,
    ErrorSeverity,
    formatErrorMessage,
    formatConnectionError,
    formatValidationError,
    formatRangeError,
    formatNotConnectedError,
    formatTimeoutError,
    formatHardwareError,
    formatResponseError,
    formatGenericError,
    getErrorText,
    isConnectionError,
    isTimeoutError,
    formatChannelError,
    formatBusError,
    formatFaderError,
    formatGainError,
    formatEqBandError,
    formatFxSlotError,
    createToolErrorMessage
} from './error-messages.js';

describe('Error Messages Utility', () => {
    describe('formatErrorMessage', () => {
        it('should format a complete error message', () => {
            const result = formatErrorMessage(
                ErrorType.CONNECTION,
                ErrorSeverity.ERROR,
                'Test problem',
                'Test details',
                'Test solution',
                'Test next action'
            );

            expect(result.type).toBe(ErrorType.CONNECTION);
            expect(result.severity).toBe(ErrorSeverity.ERROR);
            expect(result.problem).toBe('Test problem');
            expect(result.details).toBe('Test details');
            expect(result.solution).toBe('Test solution');
            expect(result.next).toBe('Test next action');
            expect(result.formatted).toContain('Problem: Test problem');
            expect(result.formatted).toContain('Details: Test details');
            expect(result.formatted).toContain('Solution: Test solution');
            expect(result.formatted).toContain('Next: Test next action');
        });

        it('should include all sections in formatted output', () => {
            const result = formatErrorMessage(
                ErrorType.VALIDATION,
                ErrorSeverity.WARNING,
                'Invalid input',
                'Value out of range',
                'Use correct range',
                'Retry with valid value'
            );

            const lines = result.formatted.split('\n');
            expect(lines).toHaveLength(4);
            expect(lines[0]).toMatch(/^Problem:/);
            expect(lines[1]).toMatch(/^Details:/);
            expect(lines[2]).toMatch(/^Solution:/);
            expect(lines[3]).toMatch(/^Next:/);
        });
    });

    describe('formatConnectionError', () => {
        it('should format timeout connection errors', () => {
            const result = formatConnectionError('192.168.1.100', 10023, 'Connection timeout');

            expect(result.type).toBe(ErrorType.CONNECTION);
            expect(result.severity).toBe(ErrorSeverity.ERROR);
            expect(result.problem).toContain('timed out');
            expect(result.details).toContain('192.168.1.100:10023');
            expect(result.solution).toContain('powered on');
            expect(result.next).toContain('ping');
        });

        it('should format connection refused errors', () => {
            const result = formatConnectionError('192.168.1.100', 10023, 'ECONNREFUSED');

            expect(result.problem).toContain('refused');
            expect(result.solution).toContain('OSC');
            expect(result.next).toContain('Setup');
        });

        it('should format host unreachable errors', () => {
            const result = formatConnectionError('192.168.1.100', 10023, 'EHOSTUNREACH');

            expect(result.problem).toContain('unreachable');
            expect(result.solution).toContain('subnet');
            expect(result.next).toContain('IP address');
        });

        it('should handle generic connection errors', () => {
            const result = formatConnectionError('192.168.1.100', 10023, 'Unknown error');

            expect(result.problem).toContain('Failed to connect');
            expect(result.details).toContain('Unknown error');
            expect(result.solution).toContain('powered on');
        });

        it('should handle Error objects', () => {
            const error = new Error('Network error');
            const result = formatConnectionError('192.168.1.100', 10023, error);

            expect(result.details).toContain('Network error');
        });
    });

    describe('formatValidationError', () => {
        it('should format validation error with suggestion', () => {
            const result = formatValidationError('channel', 99, 'must be between 1 and 32', '16');

            expect(result.type).toBe(ErrorType.VALIDATION);
            expect(result.severity).toBe(ErrorSeverity.WARNING);
            expect(result.problem).toContain('channel');
            expect(result.details).toContain('99');
            expect(result.details).toContain('must be between 1 and 32');
            expect(result.solution).toContain('16');
        });

        it('should format validation error without suggestion', () => {
            const result = formatValidationError('color', 'invalid', 'must be a valid color name');

            expect(result.problem).toContain('color');
            expect(result.details).toContain('"invalid"');
            expect(result.solution).not.toContain('Suggested value');
        });

        it('should handle complex values', () => {
            const result = formatValidationError('config', { invalid: 'object' }, 'must be a string');

            expect(result.details).toContain('{"invalid":"object"}');
        });
    });

    describe('formatRangeError', () => {
        it('should format range error with unit', () => {
            const result = formatRangeError('fader', -100, -90, 10, 'dB');

            expect(result.type).toBe(ErrorType.RANGE);
            expect(result.problem).toContain('fader');
            expect(result.details).toContain('-100 dB');
            expect(result.details).toContain('-90 dB to 10 dB');
            expect(result.solution).toContain('-90 dB');
        });

        it('should format range error without unit', () => {
            const result = formatRangeError('channel', 0, 1, 32);

            expect(result.details).toContain('Received: 0');
            expect(result.details).toContain('Valid range: 1 to 32');
            expect(result.solution).toContain('between 1 and 32');
        });

        it('should suggest minimum value when below range', () => {
            const result = formatRangeError('volume', -1, 0, 1);

            expect(result.solution).toContain('Suggested: 0');
        });

        it('should suggest maximum value when above range', () => {
            const result = formatRangeError('volume', 2, 0, 1);

            expect(result.solution).toContain('Suggested: 1');
        });

        it('should suggest midpoint for values in range', () => {
            const result = formatRangeError('gain', 0.5, 0, 1);

            expect(result.solution).toContain('Suggested: 0.5');
        });
    });

    describe('formatNotConnectedError', () => {
        it('should format error with host and port', () => {
            const result = formatNotConnectedError('set channel volume', '192.168.1.100', 10023);

            expect(result.type).toBe(ErrorType.NOT_CONNECTED);
            expect(result.problem).toContain('Not connected');
            expect(result.details).toContain('set channel volume');
            expect(result.solution).toContain('192.168.1.100');
            expect(result.solution).toContain('10023');
        });

        it('should format error without host and port', () => {
            const result = formatNotConnectedError('get mixer info');

            expect(result.details).toContain('get mixer info');
            expect(result.solution).toContain('connection_connect');
            expect(result.solution).not.toContain('192.168');
        });
    });

    describe('formatTimeoutError', () => {
        it('should format timeout error', () => {
            const result = formatTimeoutError('get channel volume', '/ch/01/mix/fader', 5000);

            expect(result.type).toBe(ErrorType.TIMEOUT);
            expect(result.problem).toContain('timed out');
            expect(result.problem).toContain('get channel volume');
            expect(result.details).toContain('/ch/01/mix/fader');
            expect(result.details).toContain('5000ms');
            expect(result.solution).toContain('powered on');
            expect(result.next).toContain('connection_get_status');
        });
    });

    describe('formatHardwareError', () => {
        it('should format hardware error with Error object', () => {
            const error = new Error('UDP send failed');
            const result = formatHardwareError('set parameter', error);

            expect(result.type).toBe(ErrorType.HARDWARE);
            expect(result.problem).toContain('set parameter');
            expect(result.details).toContain('UDP send failed');
            expect(result.solution).toContain('powered on');
            expect(result.next).toContain('re-establish');
        });

        it('should format hardware error with string', () => {
            const result = formatHardwareError('get status', 'Communication lost');

            expect(result.details).toContain('Communication lost');
        });
    });

    describe('formatResponseError', () => {
        it('should format response error', () => {
            const result = formatResponseError('/info', 'four string arguments', ['V2.05', 'osc-server']);

            expect(result.type).toBe(ErrorType.RESPONSE);
            expect(result.problem).toContain('Invalid or unexpected response');
            expect(result.details).toContain('/info');
            expect(result.details).toContain('four string arguments');
            expect(result.details).toContain('["V2.05","osc-server"]');
            expect(result.solution).toContain('OSC address');
            expect(result.next).toContain('connection_get_info');
        });
    });

    describe('formatGenericError', () => {
        it('should format generic error', () => {
            const error = new Error('Something went wrong');
            const result = formatGenericError('mixer operation', error);

            expect(result.problem).toContain('Operation failed');
            expect(result.problem).toContain('mixer operation');
            expect(result.details).toContain('Something went wrong');
        });
    });

    describe('getErrorText', () => {
        it('should extract formatted text from structured error', () => {
            const structured = formatValidationError('test', 'value', 'constraint');
            const text = getErrorText(structured);

            expect(text).toBe(structured.formatted);
            expect(text).toContain('Problem:');
            expect(text).toContain('Details:');
            expect(text).toContain('Solution:');
            expect(text).toContain('Next:');
        });
    });

    describe('isConnectionError', () => {
        it('should detect connection errors from Error objects', () => {
            expect(isConnectionError(new Error('ECONNREFUSED'))).toBe(true);
            expect(isConnectionError(new Error('Connection failed'))).toBe(true);
            expect(isConnectionError(new Error('EHOSTUNREACH'))).toBe(true);
            expect(isConnectionError(new Error('Connection timeout'))).toBe(true);
        });

        it('should detect connection errors from strings', () => {
            expect(isConnectionError('Failed to connect')).toBe(true);
            expect(isConnectionError('ENETUNREACH')).toBe(true);
        });

        it('should return false for non-connection errors', () => {
            expect(isConnectionError(new Error('Invalid parameter'))).toBe(false);
            expect(isConnectionError('Something else went wrong')).toBe(false);
        });
    });

    describe('isTimeoutError', () => {
        it('should detect timeout errors from Error objects', () => {
            expect(isTimeoutError(new Error('Request timeout'))).toBe(true);
            expect(isTimeoutError(new Error('Operation timed out'))).toBe(true);
        });

        it('should detect timeout errors from strings', () => {
            expect(isTimeoutError('Timeout waiting for response')).toBe(true);
        });

        it('should return false for non-timeout errors', () => {
            expect(isTimeoutError(new Error('Invalid parameter'))).toBe(false);
        });
    });

    describe('Domain-specific helpers', () => {
        describe('formatChannelError', () => {
            it('should format channel range error', () => {
                const result = formatChannelError(0);

                expect(result.type).toBe(ErrorType.RANGE);
                expect(result.problem).toContain('channel');
                expect(result.details).toContain('1 to 32');
            });

            it('should support custom max channels', () => {
                const result = formatChannelError(50, 48);

                expect(result.details).toContain('1 to 48');
            });
        });

        describe('formatBusError', () => {
            it('should format bus range error', () => {
                const result = formatBusError(0);

                expect(result.problem).toContain('bus');
                expect(result.details).toContain('1 to 16');
            });

            it('should support custom max buses', () => {
                const result = formatBusError(20, 24);

                expect(result.details).toContain('1 to 24');
            });
        });

        describe('formatFaderError', () => {
            it('should format fader error in dB', () => {
                const result = formatFaderError(-100, 'db');

                expect(result.problem).toContain('fader');
                expect(result.details).toContain('dB');
                expect(result.details).toContain('-90 dB to 10 dB');
            });

            it('should format fader error in linear', () => {
                const result = formatFaderError(1.5, 'linear');

                expect(result.details).toContain('0 to 1');
                expect(result.details).not.toContain('dB');
            });
        });

        describe('formatGainError', () => {
            it('should format gain range error', () => {
                const result = formatGainError(-0.5);

                expect(result.problem).toContain('gain');
                expect(result.details).toContain('0 to 1');
            });
        });

        describe('formatEqBandError', () => {
            it('should format EQ band range error', () => {
                const result = formatEqBandError(5);

                expect(result.problem).toContain('EQ band');
                expect(result.details).toContain('1 to 4');
            });
        });

        describe('formatFxSlotError', () => {
            it('should format FX slot range error', () => {
                const result = formatFxSlotError(0);

                expect(result.problem).toContain('FX slot');
                expect(result.details).toContain('1 to 8');
            });

            it('should support custom max slots', () => {
                const result = formatFxSlotError(5, 4);

                expect(result.details).toContain('1 to 4');
            });
        });
    });

    describe('createToolErrorMessage', () => {
        it('should handle string errors', () => {
            const result = createToolErrorMessage('Simple error message');

            expect(result).toBe('Simple error message');
        });

        it('should handle structured errors', () => {
            const structured = formatValidationError('test', 'value', 'constraint');
            const result = createToolErrorMessage(structured);

            expect(result).toBe(structured.formatted);
        });

        it('should handle not connected errors', () => {
            const error = new Error('Not connected to X32/M32');
            const result = createToolErrorMessage(error);

            expect(result).toContain('Not connected');
            expect(result).toContain('connection_connect');
        });

        it('should handle timeout errors', () => {
            const error = new Error('Operation timed out');
            const result = createToolErrorMessage(error);

            expect(result).toContain('timed out');
            expect(result).toContain('Solution:');
        });

        it('should handle connection errors', () => {
            const error = new Error('ECONNREFUSED');
            const result = createToolErrorMessage(error);

            expect(result).toContain('connection');
            expect(result).toContain('Solution:');
        });

        it('should handle generic errors', () => {
            const error = new Error('Something unexpected');
            const result = createToolErrorMessage(error);

            expect(result).toContain('Something unexpected');
            expect(result).toContain('Solution:');
            expect(result).toContain('connection_get_status');
        });
    });

    describe('Error message completeness', () => {
        it('should always include all required sections', () => {
            const testCases = [
                formatConnectionError('192.168.1.100', 10023, 'timeout'),
                formatValidationError('param', 'value', 'constraint'),
                formatRangeError('level', 2, 0, 1),
                formatNotConnectedError('operation'),
                formatTimeoutError('op', '/address', 5000),
                formatHardwareError('op', 'error'),
                formatResponseError('/info', 'format', null),
                formatGenericError('op', 'error')
            ];

            testCases.forEach(result => {
                expect(result.problem).toBeTruthy();
                expect(result.details).toBeTruthy();
                expect(result.solution).toBeTruthy();
                expect(result.next).toBeTruthy();
                expect(result.formatted).toContain('Problem:');
                expect(result.formatted).toContain('Details:');
                expect(result.formatted).toContain('Solution:');
                expect(result.formatted).toContain('Next:');
            });
        });

        it('should provide actionable next steps', () => {
            const testCases = [
                formatConnectionError('192.168.1.100', 10023, 'timeout'),
                formatNotConnectedError('set volume'),
                formatTimeoutError('get info', '/info', 5000)
            ];

            testCases.forEach(result => {
                expect(result.next).toMatch(/connection_connect|connection_get_status|ping|verify/i);
            });
        });
    });
});
