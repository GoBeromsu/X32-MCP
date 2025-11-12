import { z } from 'zod';
import { McpServer } from '../../server/mcp.js';
import { CallToolResult } from '../../types.js';
import { X32Connection } from '../x32-connection.js';

/**
 * Register x32_channel tool
 * High-level API for channel parameter access
 */
export function registerChannelTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'x32_channel',
        'Get or set channel parameters (high-level API for channels 1-32)',
        {
            channel: z.number().min(1).max(32).describe('Channel number (1-32)'),
            action: z.enum(['get', 'set']).describe('Action type: get or set'),
            parameter: z.string().describe('Parameter path (e.g., mix/fader, config/name, eq/1/f)'),
            value: z.union([z.string(), z.number()]).optional().describe('Value to set (required for set action)')
        },
        {
            title: 'X32 Channel Control',
            readOnlyHint: false,
            destructiveHint: false, // Depends on action
            idempotentHint: false,
            openWorldHint: true
        },
        async ({ channel, action, parameter, value }): Promise<CallToolResult> => {
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
                if (action === 'get') {
                    const result = await connection.getChannelParameter(channel, parameter);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Channel ${channel} ${parameter} = ${JSON.stringify(result)}`
                            }
                        ]
                    };
                } else {
                    // action === 'set'
                    if (value === undefined) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: 'Value is required for set action'
                                }
                            ],
                            isError: true
                        };
                    }
                    await connection.setChannelParameter(channel, parameter, value);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Set channel ${channel} ${parameter} = ${value}`
                            }
                        ]
                    };
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to ${action} channel parameter: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}
