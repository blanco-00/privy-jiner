import { EventEmitter } from 'events';
export type EventPriority = 'low' | 'normal' | 'high';
export interface EventPayload {
    [key: string]: unknown;
}
export interface EventHandler {
    (payload: EventPayload): void | Promise<void>;
}
export interface SubscribedEvent {
    event: string;
    handler: EventHandler;
    priority: EventPriority;
    context?: string;
}
export declare class EventBus extends EventEmitter {
    private subscriptions;
    private eventHistory;
    private maxHistorySize;
    subscribe(event: string, handler: EventHandler, priority?: EventPriority, context?: string): void;
    unsubscribe(event: string, handler: EventHandler): boolean;
    publish(event: string, payload?: EventPayload): Promise<void>;
    publishSync(event: string, payload?: EventPayload): void;
    getSubscribers(event: string): SubscribedEvent[];
    getHistory(event?: string, limit?: number): Array<{
        event: string;
        payload: EventPayload;
        timestamp: Date;
    }>;
    clearHistory(): void;
    clearSubscriptions(event?: string): void;
}
export declare const globalEventBus: EventBus;
//# sourceMappingURL=index.d.ts.map