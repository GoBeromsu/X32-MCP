import { z } from 'zod';
import { Server } from '../server/index.js';
import { CallToolResult } from '../types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Register x32_get_status tool
 * Retrieves current status from X32/M32 mixer
 */
export function registerStatusTool(server: Server, connection: X32Connection): void {
    server.tool(
        'x32_get_status',
        'Retrieves the current operational status of the connected X32 or M32 digital mixing console. Returns connection state, network information, and server details to monitor mixer availability and network configuration.',
        {},
        {
            title: 'X32 Get Status',
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async (): Promise<CallToolResult> => {
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
                const status = await connection.getStatus();
                const output = [`State: ${status.state}`, `IP Address: ${status.ipAddress}`, `Server Name: ${status.serverName}`].join(
                    '\n'
                );

                return {
                    content: [
                        {
                            type: 'text',
                            text: output
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get status: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}
