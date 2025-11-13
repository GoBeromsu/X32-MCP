#!/usr/bin/env node
import { Server } from './server/index.js';
import { StdioServerTransport } from './server/stdio.js';
import { X32Connection } from './services/x32-connection.js';
import {
    registerConnectTool,
    registerInfoTool,
    registerStatusTool,
    registerGetParameterTool,
    registerSetParameterTool,
    registerChannelTool
} from './tools/index.js';

/**
 * X32 MCP Server
 * Model Context Protocol server for X32/M32 mixer control
 */
async function main() {
    // Create X32 connection instance
    const connection = new X32Connection();

    // Create MCP server using the SDK directly
    const server = new Server(
        {
            name: 'x32-mcp-server',
            version: '1.0.0'
        },
        {
            capabilities: {
                tools: {}
            }
        }
    );

    // Register all tools
    registerConnectTool(server, connection);
    registerInfoTool(server, connection);
    registerStatusTool(server, connection);
    registerGetParameterTool(server, connection);
    registerSetParameterTool(server, connection);
    registerChannelTool(server, connection);

    // Setup connection event handlers
    connection.on('connected', () => {
        console.error('X32 Connected');
    });

    connection.on('disconnected', () => {
        console.error('X32 Disconnected');
    });

    connection.on('error', error => {
        console.error('X32 Error:', error);
    });

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    console.error('X32 MCP Server running on stdio');
    console.error('Available tools:');
    console.error('  - x32_connect: Connect to X32/M32 mixer');
    console.error('  - x32_get_info: Get console information');
    console.error('  - x32_get_status: Get current status');
    console.error('  - x32_get_parameter: Get parameter by OSC address');
    console.error('  - x32_set_parameter: Set parameter by OSC address');
    console.error('  - x32_channel: Get/set channel parameters');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.error('\nShutting down...');
        if (connection.connected) {
            await connection.disconnect();
        }
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.error('\nShutting down...');
        if (connection.connected) {
            await connection.disconnect();
        }
        process.exit(0);
    });
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});