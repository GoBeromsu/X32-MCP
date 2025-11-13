import { z } from 'zod';
import { Server } from '../server/index.js';
import { CallToolResult } from '../types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Register x32_channel tool
 * High-level API for channel parameter access
 */
export function registerChannelTool(server: Server, connection: X32Connection): void {
    server.tool(
        'x32_channel',
        'Provides high-level access to input channel parameters on X32/M32 mixer (channels 1-32). Use this tool for convenient channel control including fader levels, EQ settings, compression, effects sends, configuration, and routing. Supports both reading current values and setting new values.',
        {
            channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
            action: z.enum(['get', 'set']).describe('Action to perform: "get" to read current value, "set" to change value'),
            parameter: z.string().describe('Channel parameter path (e.g., "mix/fader" for channel fader, "config/name" for channel name, "eq/1/f" for EQ band 1 frequency, "comp/thr" for compressor threshold, "mix/01/level" for aux send 1 level)'),
            value: z.union([z.string(), z.number()]).optional().describe('New value to set (required when action is "set"). Use 0.0-1.0 for faders, string for names, specific values for EQ/compression parameters')
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
