import { z } from 'zod';
import { Server } from '../server/index.js';
import { CallToolResult } from '../types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Register x32_get_parameter tool
 * Gets parameter value by OSC address pattern
 */
export function registerGetParameterTool(server: Server, connection: X32Connection): void {
    server.tool(
        'x32_get_parameter',
        'Retrieves current parameter values from X32/M32 mixer using OSC address patterns. Use this tool to read fader positions, EQ settings, effects parameters, routing configurations, and other mixer state information for monitoring or automation purposes.',
        {
            address: z.string().describe('OSC address pattern for the parameter to read (e.g., "/ch/01/mix/fader" for channel 1 fader level, "/main/st/mix/fader" for main stereo fader, "/ch/01/eq/1/f" for channel 1 EQ band 1 frequency)')
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
