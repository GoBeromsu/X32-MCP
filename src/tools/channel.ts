import { z } from 'zod';
import { McpServer } from '../mcp/mcp.js';
import { CallToolResult } from '../spec.types.js';
import { X32Connection } from '../services/x32-connection.js';

/**
 * Channel domain tools
 * Semantic, task-based tools for channel control
 */

/**
 * Register channel_set_volume tool
 * Set channel fader level
 */
function registerChannelSetVolumeTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'channel_set_volume',
        'Set the fader level (volume) for a specific input channel on the X32/M32 mixer. This controls the channel fader position which affects the signal level sent to the main mix.',
        {
            channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
            level: z.number().min(0).max(1).describe('Fader level from 0.0 (minimum/off) to 1.0 (maximum/unity gain)')
        },
        {
            title: 'Set Channel Fader Volume',
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async ({ channel, level }): Promise<CallToolResult> => {
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
                await connection.setChannelParameter(channel, 'mix/fader', level);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Set channel ${channel} fader to ${level} (${Math.round(level * 100)}%)`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set channel volume: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Register channel_set_gain tool
 * Set channel preamp gain
 */
function registerChannelSetGainTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'channel_set_gain',
        'Set the preamp gain for a specific input channel on the X32/M32 mixer. This controls the input gain stage before the channel processing.',
        {
            channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
            gain: z.number().min(0).max(1).describe('Preamp gain level from 0.0 to 1.0 (typically represents -12dB to +60dB range)')
        },
        {
            title: 'Set Channel Preamp Gain',
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async ({ channel, gain }): Promise<CallToolResult> => {
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
                await connection.setChannelParameter(channel, 'preamp/gain', gain);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Set channel ${channel} preamp gain to ${gain}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set channel gain: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Register channel_mute tool
 * Mute/unmute a channel
 */
function registerChannelMuteTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'channel_mute',
        'Mute or unmute a specific input channel on the X32/M32 mixer. When muted, the channel signal is completely cut from the mix.',
        {
            channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
            muted: z.boolean().describe('Mute state: true to mute the channel, false to unmute')
        },
        {
            title: 'Mute/Unmute Channel',
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async ({ channel, muted }): Promise<CallToolResult> => {
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
                await connection.setChannelParameter(channel, 'mix/on', muted ? 0 : 1);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Channel ${channel} ${muted ? 'muted' : 'unmuted'}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to ${muted ? 'mute' : 'unmute'} channel: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Register channel_solo tool
 * Solo a channel
 */
function registerChannelSoloTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'channel_solo',
        'Solo or unsolo a specific input channel on the X32/M32 mixer. When soloed, only soloed channels are heard in the monitor system.',
        {
            channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
            solo: z.boolean().describe('Solo state: true to solo the channel, false to unsolo')
        },
        {
            title: 'Solo/Unsolo Channel',
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async ({ channel, solo }): Promise<CallToolResult> => {
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
                // Note: solo parameter might be different - this is a placeholder implementation
                await connection.setChannelParameter(channel, 'solo', solo ? 1 : 0);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Channel ${channel} ${solo ? 'soloed' : 'unsoloed'}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to ${solo ? 'solo' : 'unsolo'} channel: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Register channel_get_state tool
 * Get complete channel state
 */
function registerChannelGetStateTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'channel_get_state',
        'Retrieve the complete current state of a specific input channel including fader level, mute status, preamp gain, and other key parameters.',
        {
            channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32')
        },
        {
            title: 'Get Channel State',
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async ({ channel }): Promise<CallToolResult> => {
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
                // Get key channel parameters
                const [fader, on, gain, name] = await Promise.all([
                    connection.getChannelParameter(channel, 'mix/fader'),
                    connection.getChannelParameter(channel, 'mix/on'),
                    connection.getChannelParameter(channel, 'preamp/gain'),
                    connection.getChannelParameter(channel, 'config/name').catch(() => 'N/A')
                ]);

                const state = [
                    `Channel ${channel} State:`,
                    `  Name: ${name}`,
                    `  Fader: ${fader} (${Math.round(Number(fader) * 100)}%)`,
                    `  Muted: ${Number(on) === 0 ? 'Yes' : 'No'}`,
                    `  Preamp Gain: ${gain}`
                ].join('\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: state
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to get channel state: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Register channel_set_eq_band tool
 * Set specific EQ band parameters
 */
function registerChannelSetEqBandTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'channel_set_eq_band',
        'Set EQ parameters for a specific band on a channel. The X32/M32 typically has 4-band parametric EQ per channel.',
        {
            channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
            band: z.number().min(1).max(4).describe('EQ band number (1-4, where 1=high freq, 4=low freq typically)'),
            parameter: z.enum(['f', 'g', 'q']).describe('EQ parameter: "f" for frequency, "g" for gain, "q" for Q factor'),
            value: z.number().describe('Parameter value (frequency in Hz, gain in dB, Q factor as ratio)')
        },
        {
            title: 'Set Channel EQ Band Parameter',
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true
        },
        async ({ channel, band, parameter, value }): Promise<CallToolResult> => {
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
                await connection.setChannelParameter(channel, `eq/${band}/${parameter}`, value);
                const paramName = parameter === 'f' ? 'frequency' : parameter === 'g' ? 'gain' : 'Q factor';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Set channel ${channel} EQ band ${band} ${paramName} to ${value}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set EQ parameter: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Legacy channel tool (kept as low-level fallback)
 * High-level API for channel parameter access
 */
function registerChannelTool(server: McpServer, connection: X32Connection): void {
    server.tool(
        'x32_channel',
        'LOW-LEVEL TOOL: Provides raw access to input channel parameters on X32/M32 mixer (channels 1-32). Consider using semantic tools like channel_set_volume, channel_mute, etc. for common operations. Use this tool only for advanced parameter access not covered by semantic tools.',
        {
            channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
            action: z.enum(['get', 'set']).describe('Action to perform: "get" to read current value, "set" to change value'),
            parameter: z
                .string()
                .describe(
                    'Channel parameter path (e.g., "mix/fader" for channel fader, "config/name" for channel name, "eq/1/f" for EQ band 1 frequency, "comp/thr" for compressor threshold, "mix/01/level" for aux send 1 level)'
                ),
            value: z
                .union([z.string(), z.number()])
                .optional()
                .describe(
                    'New value to set (required when action is "set"). Use 0.0-1.0 for faders, string for names, specific values for EQ/compression parameters'
                )
        },
        {
            title: 'X32 Channel Control (Low-Level)',
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
                            text: 'Not connected to X32/M32 mixer. Use connection_connect first.'
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

/**
 * Register all channel domain tools
 */
export function registerChannelTools(server: McpServer, connection: X32Connection): void {
    registerChannelSetVolumeTool(server, connection);
    registerChannelSetGainTool(server, connection);
    registerChannelMuteTool(server, connection);
    registerChannelSoloTool(server, connection);
    registerChannelGetStateTool(server, connection);
    registerChannelSetEqBandTool(server, connection);

    // Keep legacy tool as fallback
    registerChannelTool(server, connection);
}
