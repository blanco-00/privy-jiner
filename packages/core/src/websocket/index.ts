import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

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

export class WSServer extends EventEmitter {
  private server: WebSocketServer | null = null;
  private clients: Map<string, WSClient> = new Map();
  private port: number;
  private host: string;

  constructor(port = 3001, host = '0.0.0.0') {
    super();
    this.port = port;
    this.host = host;
  }

  start(): void {
    if (this.server) return;

    this.server = new WebSocketServer({ port: this.port, host: this.host });

    this.server.on('listening', () => {
      this.emit('listening', { port: this.port, host: this.host });
    });

    this.server.on('connection', (socket) => {
      const clientId = uuidv4();
      const client: WSClient = { id: clientId, socket };

      this.clients.set(clientId, client);
      this.emit('connection', client);

      socket.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as WSMessage;
          message.id = message.id || uuidv4();
          this.handleMessage(client, message);
        } catch (error) {
          this.emit('error', { clientId, error });
        }
      });

      socket.on('close', () => {
        this.clients.delete(clientId);
        this.emit('disconnect', client);
      });

      socket.on('error', (error) => {
        this.emit('error', { clientId, error });
      });
    });

    this.server.on('error', (error) => {
      this.emit('error', { error });
    });
  }

  stop(): void {
    if (!this.server) return;

    for (const client of this.clients.values()) {
      client.socket.close();
    }
    this.clients.clear();

    this.server.close();
    this.server = null;
  }

  private handleMessage(client: WSClient, message: WSMessage): void {
    this.emit('message', { client, message });

    switch (message.type) {
      case 'ping':
        this.send(client, { type: 'pong' });
        break;
      case 'subscribe':
        this.emit('subscribe', { client, payload: message.payload });
        break;
      case 'unsubscribe':
        this.emit('unsubscribe', { client, payload: message.payload });
        break;
    }
  }

  send(client: WSClient, message: WSMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }

  broadcast(message: WSMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients.values()) {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(data);
      }
    }
  }

  sendTo(clientId: string, message: WSMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    this.send(client, message);
    return true;
  }

  getClients(): WSClient[] {
    return Array.from(this.clients.values());
  }

  getClientCount(): number {
    return this.clients.size;
  }

  isRunning(): boolean {
    return this.server !== null;
  }
}

export const wsServer = new WSServer();
