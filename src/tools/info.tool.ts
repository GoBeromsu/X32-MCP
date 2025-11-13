import { z } from 'zod';
import { Server } from '../server/index.js';
import { CallToolResult } from '../types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Register x32_get_info tool
 * Retrieves console information from X32/M32 mixer
 */
export function registerInfoTool(server: Server, connection: X32Connection): void {
    server.tool(
        'x32_get_info',
        'Retrieves detailed console information from connected X32 or M32 digital mixing console. Returns model name, firmware version, server details, and other system information useful for identifying mixer capabilities and troubleshooting.',
        {},
        {
            title: 'X32 Get Info',
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
                const info = await connection.getInfo();
                const output = [
                    `Console Model: ${info.consoleModel}`,
                    `Console Version: ${info.consoleVersion}`,
                    `Server Name: ${info.serverName}`,
                    `Server Version: ${info.serverVersion}`
                ].join('\n');

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
                            text: `Failed to get info: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}
