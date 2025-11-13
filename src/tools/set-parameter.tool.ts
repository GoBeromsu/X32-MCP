import { z } from 'zod';
import { Server } from '../server/index.js';
import { CallToolResult } from '../types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Register x32_set_parameter tool
 * Sets parameter value by OSC address pattern
 */
export function registerSetParameterTool(server: Server, connection: X32Connection): void {
    server.tool(
        'x32_set_parameter',
        'Controls X32/M32 mixer parameters by setting specific values via OSC address patterns. Use this tool to adjust faders, EQ settings, effects, routing, and other mixer parameters. Common parameters include channel faders (/ch/XX/mix/fader), EQ controls (/ch/XX/eq/), and effects (/fx/).',
        {
            address: z.string().describe('OSC address pattern for the parameter to control (e.g., "/ch/01/mix/fader" for channel 1 fader, "/main/st/mix/fader" for main stereo fader)'),
            value: z.union([z.string(), z.number()]).describe('Value to set - typically 0.0-1.0 for faders, 0/1 for mutes, or specific values for other parameters')
        },
        {
            title: 'Set X32/M32 Parameter',
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
