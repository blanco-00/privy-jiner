import { EventEmitter } from 'events';
export class EventBus extends EventEmitter {
    subscriptions = new Map();
    eventHistory = [];
    maxHistorySize = 100;
    subscribe(event, handler, priority = 'normal', context) {
        const subscription = { event, handler, priority, context };
        if (!this.subscriptions.has(event)) {
            this.subscriptions.set(event, []);
        }
        const handlers = this.subscriptions.get(event);
        handlers.push(subscription);
        handlers.sort((a, b) => {
            const priorityOrder = { high: 0, normal: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
    unsubscribe(event, handler) {
        const handlers = this.subscriptions.get(event);
        if (!handlers)
            return false;
        const index = handlers.findIndex(h => h.handler === handler);
        if (index === -1)
            return false;
        handlers.splice(index, 1);
        return true;
    }
    async publish(event, payload = {}) {
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
            }
            catch (error) {
                this.emit('error', { event, error, context: subscription.context });
            }
        });
        await Promise.all(promises);
    }
    publishSync(event, payload = {}) {
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
            }
            catch (error) {
                this.emit('error', { event, error, context: subscription.context });
            }
        }
    }
    getSubscribers(event) {
        return this.subscriptions.get(event) || [];
    }
    getHistory(event, limit = 10) {
        let history = this.eventHistory;
        if (event) {
            history = history.filter(h => h.event === event);
        }
        return history.slice(-limit);
    }
    clearHistory() {
        this.eventHistory = [];
    }
    clearSubscriptions(event) {
        if (event) {
            this.subscriptions.delete(event);
        }
        else {
            this.subscriptions.clear();
        }
    }
}
export const globalEventBus = new EventBus();
//# sourceMappingURL=index.js.map