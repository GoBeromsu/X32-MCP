import { z } from 'zod';
import { McpServer } from '../../server/mcp.js';
import { CallToolResult } from '../../types.js';
import { X32Connection } from '../x32-connection.js';

/**
 * Register x32_get_parameter tool
 * Gets parameter value by OSC address pattern
 */
export function registerGetParameterTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'x32_get_parameter',
        'Get X32 parameter value by OSC address pattern',
        {
            address: z.string().describe('OSC address pattern (e.g., /ch/01/mix/fader)')
        },
        {
            title: 'X32 Get Parameter',
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async ({ address }): Promise<CallToolResult> => {
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
                const value = await connection.getParameter(address);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `${address} = ${JSON.stringify(value)}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get parameter: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}
