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

export class EventBus extends EventEmitter {
  private subscriptions: Map<string, SubscribedEvent[]> = new Map();
  private eventHistory: Array<{ event: string; payload: EventPayload; timestamp: Date }> = [];
  private maxHistorySize = 100;

  subscribe(event: string, handler: EventHandler, priority: EventPriority = 'normal', context?: string): void {
    const subscription: SubscribedEvent = { event, handler, priority, context };

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }

    const handlers = this.subscriptions.get(event)!;
    handlers.push(subscription);

    handlers.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  unsubscribe(event: string, handler: EventHandler): boolean {
    const handlers = this.subscriptions.get(event);
    if (!handlers) return false;

    const index = handlers.findIndex(h => h.handler === handler);
    if (index === -1) return false;

    handlers.splice(index, 1);
    return true;
  }

  async publish(event: string, payload: EventPayload = {}): Promise<void> {
    this.eventHistory.push({ event, payload, timestamp: new Date() });
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const handlers = this.subscriptions.get(event) || [];
    const wildcardHandlers = this.subscriptions.get('*') || [];

    const allHandlers = [...handlers, ...wildcardHandlers];

    const promises = allHandlers.map(async (subscription) => {
      try {
        await subscription.handler(payload);
      } catch (error) {
        this.emit('error', { event, error, context: subscription.context });
      }
    });

    await Promise.all(promises);
  }

  publishSync(event: string, payload: EventPayload = {}): void {
    this.eventHistory.push({ event, payload, timestamp: new Date() });
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const handlers = this.subscriptions.get(event) || [];
    const wildcardHandlers = this.subscriptions.get('*') || [];

    const allHandlers = [...handlers, ...wildcardHandlers];

    for (const subscription of allHandlers) {
      try {
        subscription.handler(payload);
      } catch (error) {
        this.emit('error', { event, error, context: subscription.context });
      }
    }
  }

  getSubscribers(event: string): SubscribedEvent[] {
    return this.subscriptions.get(event) || [];
  }

  getHistory(event?: string, limit = 10): Array<{ event: string; payload: EventPayload; timestamp: Date }> {
    let history = this.eventHistory;

    if (event) {
      history = history.filter(h => h.event === event);
    }

    return history.slice(-limit);
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  clearSubscriptions(event?: string): void {
    if (event) {
      this.subscriptions.delete(event);
    } else {
      this.subscriptions.clear();
    }
  }
}

export const globalEventBus = new EventBus();
