import { z } from 'zod';
import { McpServer } from '../../server/mcp.js';
import { CallToolResult } from '../../types.js';
import { X32Connection } from '../x32-connection.js';

/**
 * Register x32_set_parameter tool
 * Sets parameter value by OSC address pattern
 */
export function registerSetParameterTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'x32_set_parameter',
        'Set X32 parameter value by OSC address pattern',
        {
            address: z.string().describe('OSC address pattern (e.g., /ch/01/mix/fader)'),
            value: z.union([z.string(), z.number()]).describe('Value to set (string or number)')
        },
        {
            title: 'X32 Set Parameter',
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: false,
            openWorldHint: true
        },
        async ({ address, value }): Promise<CallToolResult> => {
            if (!connection.connected) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Not connected to X32/M32 mixer. Use x32_connect first.'
                        }
                    ],
                    isError: true
                };
            }

            try {
                await connection.setParameter(address, value);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Set ${address} = ${value}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set parameter: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}
