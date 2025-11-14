import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Generic parameter tools
 * Low-level fallback tools for advanced users
 */

/**
 * Register get_parameter tool
 * Gets parameter value by OSC address pattern
 */
function registerGetParameterTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'get_parameter',
        {
            title: 'Get Parameter (Low-Level)',
            description: 'ADVANCED/LOW-LEVEL TOOL: Retrieves current parameter values from X32/M32 mixer using raw OSC address patterns. Consider using semantic tools (channel_*, bus_*, etc.) for common operations. Use this tool for parameters not covered by semantic tools or for debugging purposes.',
            inputSchema: {
                address: z.string().describe('OSC address pattern for the parameter to read (e.g., "/ch/01/mix/fader" for channel 1 fader level, "/main/st/mix/fader" for main stereo fader, "/ch/01/eq/1/f" for channel 1 EQ band 1 frequency)')
            },
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
        },
        async ({ address }): Promise<CallToolResult> => {
            if (!connection.connected) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Not connected to X32/M32 mixer. Use connection_connect first.'
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

/**
 * Register set_parameter tool
 * Sets parameter value by OSC address pattern
 */
function registerSetParameterTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'set_parameter',
        {
            title: 'Set Parameter (Low-Level)',
            description: 'ADVANCED/LOW-LEVEL TOOL: Controls X32/M32 mixer parameters by setting specific values via raw OSC address patterns. Consider using semantic tools (channel_*, bus_*, etc.) for common operations. Use this tool for parameters not covered by semantic tools or for advanced automation.',
            inputSchema: {
                address: z.string().describe('OSC address pattern for the parameter to control (e.g., "/ch/01/mix/fader" for channel 1 fader, "/main/st/mix/fader" for main stereo fader)'),
                value: z.union([z.string(), z.number()]).describe('Value to set - typically 0.0-1.0 for faders, 0/1 for mutes, or specific values for other parameters')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: false,
                openWorldHint: true
            }
        },
        async ({ address, value }): Promise<CallToolResult> => {
            if (!connection.connected) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Not connected to X32/M32 mixer. Use connection_connect first.'
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

/**
 * Register all generic parameter tools
 */
export function registerParameterTools(server: McpServer, connection: X32Connection): void {
    registerGetParameterTool(server, connection);
    registerSetParameterTool(server, connection);
}