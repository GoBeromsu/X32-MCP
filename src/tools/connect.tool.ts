import { z } from 'zod';
import { Server } from '../server/index.js';
import { CallToolResult } from '../types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Register x32_connect tool
 * Establishes connection to X32/M32 mixer
 */
export function registerConnectTool(server: Server, connection: X32Connection): void {
    server.tool(
        'x32_connect',
        'Establishes a connection to an X32 or M32 digital mixing console using the OSC (Open Sound Control) protocol. Use this tool when you need to control mixer functions remotely. The mixer must be powered on and connected to the same network.',
        {
            host: z.string().describe('IP address of the X32/M32 mixer on the network (e.g., "192.168.1.100")'),
            port: z.number().default(10023).describe('OSC port number for communication with the mixer (standard port is 10023)')
        },
        {
            title: 'Connect to X32/M32 Mixer',
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async ({ host, port }): Promise<CallToolResult> => {
            if (connection.connected) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Already connected to X32/M32 mixer'
                        }
                    ]
                };
            }

            try {
                await connection.connect({ host, port });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Successfully connected to X32/M32 at ${host}:${port}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Connection to X32/M32 mixer failed: ${error instanceof Error ? error.message : String(error)}. Please verify the mixer is powered on, connected to the network, and the IP address is correct. Check that port ${port} is not blocked by firewall.`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}
