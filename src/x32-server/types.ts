/**
 * X32/M32 Connection Configuration
 */
export interface X32ConnectionConfig {
    host: string;
    port: number;
}

/**
 * X32/M32 Info Response
 * Response from /info command
 * Format: /info~~~,ssss~~~V2.05~~~osc-server~~X32~2.12~~~~
 */
export interface X32InfoResponse {
    serverVersion: string;
    serverName: string;
    consoleModel: string;
    consoleVersion: string;
}

/**
 * X32/M32 Status Response
 * Response from /status command
 * Format: /status~,sss~~~~active~~192.168.0.64~~~~osc-server~~
 */
export interface X32StatusResponse {
    state: string;
    ipAddress: string;
    serverName: string;
}

/**
 * OSC Message structure
 */
export interface OscMessage {
    address: string;
    args: OscArgument[];
}

export interface OscArgument {
    type: string;
    value: any;
}

/**
 * X32 Parameter Response
 */
export interface X32ParamResponse<T> {
    address: string;
    value: T;
}

/**
 * Channel Parameter Types
 */
export type ChannelConfigParam = 'name' | 'icon' | 'color' | 'source';
export type ChannelMixParam = 'on' | 'fader' | 'pan' | 'mono' | 'mlevel';
export type ChannelEqParam =
    | '1/type'
    | '1/f'
    | '1/g'
    | '1/q'
    | '2/type'
    | '2/f'
    | '2/g'
    | '2/q'
    | '3/type'
    | '3/f'
    | '3/g'
    | '3/q'
    | '4/type'
    | '4/f'
    | '4/g'
    | '4/q'
    | 'on';
export type ChannelDynParam = 'on' | 'mode' | 'thr' | 'ratio' | 'knee' | 'mgain' | 'attack' | 'hold' | 'release';

/**
 * Channel Address Pattern Builder
 */
export type ChannelAddress<P extends string> = `/ch/${string}/${P}`;

/**
 * Parameter Type Mapping
 * Maps address patterns to their expected value types
 */
export interface ParamTypeMap {
    // Channel Config
    '/ch/{ch}/config/name': string;
    '/ch/{ch}/config/icon': number;
    '/ch/{ch}/config/color': number;
    '/ch/{ch}/config/source': number;

    // Channel Mix
    '/ch/{ch}/mix/on': number; // int 0 or 1
    '/ch/{ch}/mix/fader': number; // float 0.0-1.0
    '/ch/{ch}/mix/pan': number; // float 0.0-1.0
    '/ch/{ch}/mix/mono': number; // int 0 or 1
    '/ch/{ch}/mix/mlevel': number; // float 0.0-1.0

    // Channel EQ
    '/ch/{ch}/eq/on': number; // int 0 or 1
    '/ch/{ch}/eq/1/type': number; // int enum
    '/ch/{ch}/eq/1/f': number; // float 0.0-1.0
    '/ch/{ch}/eq/1/g': number; // float 0.0-1.0
    '/ch/{ch}/eq/1/q': number; // float 0.0-1.0

    // Channel Dynamics
    '/ch/{ch}/dyn/on': number; // int 0 or 1
    '/ch/{ch}/dyn/mode': number; // int enum
    '/ch/{ch}/dyn/thr': number; // float 0.0-1.0
    '/ch/{ch}/dyn/ratio': number; // int enum
    '/ch/{ch}/dyn/knee': number; // int enum
    '/ch/{ch}/dyn/mgain': number; // float 0.0-1.0
    '/ch/{ch}/dyn/attack': number; // float 0.0-1.0
    '/ch/{ch}/dyn/hold': number; // float 0.0-1.0
    '/ch/{ch}/dyn/release': number; // float 0.0-1.0

    // Bus Mix
    '/bus/{bus}/mix/on': number;
    '/bus/{bus}/mix/fader': number;
    '/bus/{bus}/mix/pan': number;

    // Main LR
    '/main/st/mix/fader': number;
    '/main/st/mix/pan': number;

    // DCA
    '/dca/{dca}/fader': number;
    '/dca/{dca}/on': number;
}
