import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Connection domain tools
 * Handles connection, disconnection, info, and status operations
 */

/**
 * Register connection_connect tool
 * Establishes connection to X32/M32 mixer
 */
function registerConnectionConnectTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'connection_connect',
        {
            title: 'Connect to X32/M32 Mixer',
            description: 'Establishes a connection to an X32 or M32 digital mixing console using the OSC (Open Sound Control) protocol. Use this tool when you need to control mixer functions remotely. The mixer must be powered on and connected to the same network.',
            inputSchema: {
                host: z.string().describe('IP address of the X32/M32 mixer on the network (e.g., "192.168.1.100")'),
                port: z.number().default(10023).describe('OSC port number for communication with the mixer (standard port is 10023)')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
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

/**
 * Register connection_disconnect tool
 * Disconnects from X32/M32 mixer
 */
function registerConnectionDisconnectTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'connection_disconnect',
        {
            title: 'Disconnect from X32/M32 Mixer',
            description: 'Disconnects from the currently connected X32 or M32 digital mixing console. Use this tool to cleanly terminate the OSC connection when mixer control is no longer needed.',
            inputSchema: {},
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
        },
        async (): Promise<CallToolResult> => {
            if (!connection.connected) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Not connected to X32/M32 mixer'
                        }
                    ]
                };
            }

            try {
                await connection.disconnect();
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Successfully disconnected from X32/M32 mixer'
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Register connection_get_info tool
 * Retrieves console information from X32/M32 mixer
 */
function registerConnectionGetInfoTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'connection_get_info',
        {
            title: 'Get X32/M32 Console Information',
            description: 'Retrieves detailed console information from connected X32 or M32 digital mixing console. Returns model name, firmware version, server details, and other system information useful for identifying mixer capabilities and troubleshooting.',
            inputSchema: {},
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
        },
        async (): Promise<CallToolResult> => {
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
                const info = await connection.getInfo();
                const output = [
                    `Console Model: ${info.consoleModel}`,
                    `Console Version: ${info.consoleVersion}`,
                    `McpServer Name: ${info.serverName}`,
                    `McpServer Version: ${info.serverVersion}`
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

/**
 * Register connection_get_status tool
 * Retrieves current status from X32/M32 mixer
 */
function registerConnectionGetStatusTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'connection_get_status',
        {
            title: 'Get X32/M32 Connection Status',
            description: 'Retrieves the current operational status of the connected X32 or M32 digital mixing console. Returns connection state, network information, and server details to monitor mixer availability and network configuration.',
            inputSchema: {},
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
        },
        async (): Promise<CallToolResult> => {
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
                const status = await connection.getStatus();
                const output = [`State: ${status.state}`, `IP Address: ${status.ipAddress}`, `McpServer Name: ${status.serverName}`].join(
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

/**
 * Register all connection domain tools
 */
export function registerConnectionTools(server: McpServer, connection: X32Connection): void {
    registerConnectionConnectTool(server, connection);
    registerConnectionDisconnectTool(server, connection);
    registerConnectionGetInfoTool(server, connection);
    registerConnectionGetStatusTool(server, connection);
}