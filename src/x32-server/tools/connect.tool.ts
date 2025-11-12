import { z } from 'zod';
import { McpServer } from '../../server/mcp.js';
import { CallToolResult } from '../../types.js';
import { X32Connection } from '../x32-connection.js';

/**
 * Register x32_connect tool
 * Establishes connection to X32/M32 mixer
 */
export function registerConnectTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'x32_connect',
        'Connect to X32/M32 mixer via OSC protocol',
        {
            host: z.string().describe('X32/M32 mixer IP address'),
            port: z.number().default(10023).describe('X32/M32 mixer OSC port (default: 10023)')
        },
        {
            title: 'X32 Connect',
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
                            text: `Failed to connect: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}
