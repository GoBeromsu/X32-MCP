/**
 * Type definitions for 'osc' package
 * Since the osc package doesn't provide TypeScript definitions
 */

export interface UDPPortOptions {
    localAddress?: string;
    localPort?: number;
    remoteAddress?: string;
    remotePort?: number;
    broadcast?: boolean;
    multicastTTL?: number;
    multicastMembership?: string[];
    socket?: any;
}

export interface UDPPort {
    open(): void;
    close(): void;
    send(packet: any, address?: string, port?: number): void;
    on(event: 'ready', listener: () => void): this;
    on(event: 'message', listener: (oscMessage: any, timeTag?: any, info?: any) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'close', listener: () => void): this;
    options: UDPPortOptions;
}

export interface OSCMessage {
    address: string;
    args?: Array<{
        type: 'i' | 'f' | 's' | 'b' | 'h' | 't' | 'd' | 'S' | 'c' | 'r' | 'm' | 'T' | 'F' | 'N' | 'I';
        value: any;
    }>;
}

// OSC module interface
export interface OSCModule {
    UDPPort: new (options?: UDPPortOptions) => UDPPort;
}