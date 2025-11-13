import { z } from 'zod';
import { McpServer } from '../mcp/mcp.js';
import { CallToolResult } from '../types/index.js';
import { X32Connection } from '../services/x32-connection.js';
import { dbToFader, faderToDb, formatDb } from '../utils/db-converter.js';
import { getColorValue, getColorName, getAvailableColors } from '../utils/color-converter.js';

/**
 * Channel domain tools
 * Semantic, task-based tools for channel control
 */

/**
 * Register channel_set_volume tool
 * Set channel fader level
 */
function registerChannelSetVolumeTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'channel_set_volume',
        {
            title: 'Set Channel Fader Volume',
            description: 'Set the fader level (volume) for a specific input channel on the X32/M32 mixer. Supports both linear values (0.0-1.0) and decibel values (-90 to +10 dB). Unity gain is 0 dB or 0.75 linear.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
                value: z.number().describe('Volume value (interpretation depends on unit parameter)'),
                unit: z.enum(['linear', 'db']).default('linear').describe('Unit of the value: "linear" (0.0-1.0) or "db" (-90 to +10 dB). Default is "linear".')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
        },
        async ({ channel, value, unit = 'linear' }): Promise<CallToolResult> => {
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
                let faderValue: number;
                let dbValue: number;

                if (unit === 'db') {
                    // Input is in dB
                    if (value < -90 || value > 10) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Invalid dB value: ${value}. Must be between -90 and +10 dB.`
                                }
                            ],
                            isError: true
                        };
                    }
                    dbValue = value;
                    faderValue = dbToFader(value);
                } else {
                    // Input is linear
                    if (value < 0 || value > 1) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Invalid linear value: ${value}. Must be between 0.0 and 1.0.`
                                }
                            ],
                            isError: true
                        };
                    }
                    faderValue = value;
                    dbValue = faderToDb(value);
                }

                await connection.setChannelParameter(channel, 'mix/fader', faderValue);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Set channel ${channel} to ${formatDb(dbValue)} (linear: ${faderValue.toFixed(3)})`
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
    server.registerTool(
        'channel_set_gain',
        {
            title: 'Set Channel Preamp Gain',
            description: 'Set the preamp gain for a specific input channel on the X32/M32 mixer. This controls the input gain stage before the channel processing.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
                gain: z.number().min(0).max(1).describe('Preamp gain level from 0.0 to 1.0 (typically represents -12dB to +60dB range)')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
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
                await connection.setChannelParameter(channel, 'head/gain', gain);
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
 * Mute or unmute a channel
 */
function registerChannelMuteTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'channel_mute',
        {
            title: 'Channel Mute Control',
            description: 'Mute or unmute a specific input channel on the X32/M32 mixer. This controls the channel on/off state.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
                muted: z.boolean().describe('True to mute the channel, false to unmute')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
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
                // X32 uses inverted logic: 0 = muted, 1 = unmuted
                const onValue = muted ? 0 : 1;
                await connection.setChannelParameter(channel, 'mix/on', onValue);
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
 * Solo or unsolo a channel
 */
function registerChannelSoloTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'channel_solo',
        {
            title: 'Channel Solo Control',
            description: 'Solo or unsolo a specific input channel on the X32/M32 mixer. This routes the channel to the solo bus for isolated monitoring.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
                solo: z.boolean().describe('True to solo the channel, false to unsolo')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
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
    server.registerTool(
        'channel_get_state',
        {
            title: 'Get Channel State',
            description: 'Retrieve the complete state of a specific input channel including fader level, mute status, solo status, and gain settings.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32')
            },
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
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
                const [fader, on, solo, gain, name, color] = await Promise.all([
                    connection.getChannelParameter(channel, 'mix/fader'),
                    connection.getChannelParameter(channel, 'mix/on'),
                    connection.getChannelParameter(channel, 'solo'),
                    connection.getChannelParameter(channel, 'head/gain'),
                    connection.getChannelParameter(channel, 'config/name'),
                    connection.getChannelParameter(channel, 'config/color')
                ]);

                const faderDb = faderToDb(Number(fader));
                const colorName = getColorName(Number(color)) || `color ${color}`;
                const output = [
                    `Channel ${channel} State:`,
                    `  Name: ${name || '(unnamed)'}`,
                    `  Color: ${colorName}`,
                    `  Fader: ${formatDb(faderDb)} (linear: ${Number(fader).toFixed(3)})`,
                    `  Muted: ${Number(on) === 0 ? 'Yes' : 'No'}`,
                    `  Solo: ${Number(solo) === 1 ? 'Yes' : 'No'}`,
                    `  Preamp Gain: ${gain}`
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
    server.registerTool(
        'channel_set_eq_band',
        {
            title: 'Set Channel EQ Band',
            description: 'Configure a specific EQ band on an input channel. The X32/M32 has 4 parametric EQ bands per channel.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
                band: z.number().min(1).max(4).describe('EQ band number from 1 to 4'),
                parameter: z.enum(['f', 'g', 'q']).describe('EQ parameter: f=frequency(Hz), g=gain(dB), q=quality/width'),
                value: z.number().describe('Parameter value (range depends on parameter type)')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
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
                const path = `eq/${band}/${parameter}`;
                await connection.setChannelParameter(channel, path, value);

                const paramNames = { f: 'frequency', g: 'gain', q: 'Q/width' };
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Set channel ${channel} EQ band ${band} ${paramNames[parameter]} to ${value}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set EQ band: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Register channel_set_name tool
 * Set channel name/label
 */
function registerChannelSetNameTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'channel_set_name',
        {
            title: 'Set Channel Name',
            description: 'Set the name/label for a specific input channel. Maximum 12 characters for X32/M32.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
                name: z.string().max(12).describe('Channel name (max 12 characters)')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
        },
        async ({ channel, name }): Promise<CallToolResult> => {
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
                // Truncate name to 12 characters if longer
                const truncatedName = name.substring(0, 12);
                await connection.setChannelParameter(channel, 'config/name', truncatedName);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Set channel ${channel} name to "${truncatedName}"`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set channel name: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Register channel_set_color tool
 * Set channel strip color
 */
function registerChannelSetColorTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'channel_set_color',
        {
            title: 'Set Channel Color',
            description: 'Set the strip color for a specific input channel. Colors help visually organize channels on the mixer.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
                color: z.string().describe('Color name (off, red, green, yellow, blue, magenta, cyan, white) or inverted variants (red-inv, etc.) or numeric value (0-15)')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
        },
        async ({ channel, color }): Promise<CallToolResult> => {
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
                const colorValue = getColorValue(color);
                if (colorValue === null) {
                    const availableColors = getAvailableColors().join(', ');
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Invalid color "${color}". Available colors: ${availableColors}`
                            }
                        ],
                        isError: true
                    };
                }

                await connection.setChannelParameter(channel, 'config/color', colorValue);

                const colorName = getColorName(colorValue) || `color ${colorValue}`;
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Set channel ${channel} color to ${colorName}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to set channel color: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}

/**
 * Legacy x32_channel tool for backward compatibility
 * @deprecated Use semantic channel_* tools instead
 */
function registerLegacyChannelTool(server: McpServer, connection: X32Connection): void {
    server.registerTool(
        'x32_channel',
        {
            title: 'X32 Channel Control (Legacy)',
            description: '[DEPRECATED - Use semantic channel_* tools instead] Low-level channel parameter access. Provides direct access to channel parameters using OSC paths.',
            inputSchema: {
                channel: z.number().min(1).max(32).describe('Input channel number from 1 to 32'),
                action: z.enum(['get', 'set']).describe('Action to perform: "get" to read current value, "set" to change value'),
                parameter: z.string().describe('Channel parameter path (e.g., "mix/fader", "config/name", "eq/1/f")'),
                value: z.union([z.string(), z.number()]).optional().describe('New value to set (required when action is "set")')
            },
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true
            }
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
                                text: `Channel ${channel} ${parameter}: ${result}`
                            }
                        ]
                    };
                } else {
                    if (value === undefined) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: 'Value is required when action is "set"'
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
                                text: `Set channel ${channel} ${parameter} to ${value}`
                            }
                        ]
                    };
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Channel operation failed: ${error instanceof Error ? error.message : String(error)}`
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
    registerChannelSetNameTool(server, connection);
    registerChannelSetColorTool(server, connection);
    registerLegacyChannelTool(server, connection);
}