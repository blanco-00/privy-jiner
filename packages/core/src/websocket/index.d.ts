import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
export interface WSMessage {
    type: string;
    payload?: unknown;
    id?: string;
}
export interface WSClient {
    id: string;
    socket: WebSocket;
    metadata?: Record<string, unknown>;
}
export declare class WSServer extends EventEmitter {
    private server;
    private clients;
    private port;
    private host;
    constructor(port?: number, host?: string);
    start(): void;
    stop(): void;
    private handleMessage;
    send(client: WSClient, message: WSMessage): void;
    broadcast(message: WSMessage): void;
    sendTo(clientId: string, message: WSMessage): boolean;
    getClients(): WSClient[];
    getClientCount(): number;
    isRunning(): boolean;
}
export declare const wsServer: WSServer;
//# sourceMappingURL=index.d.ts.map