import { EventEmitter } from 'events';
export class Agent {
    ctx;
    eventEmitter;
    constructor(config) {
        this.ctx = {
            agents: new Map(),
            config,
            state: { status: 'idle' },
            subAgents: [],
        };
        this.eventEmitter = new EventEmitter();
    }
    get id() {
        return this.ctx.config.id;
    }
    get name() {
        return this.ctx.config.name;
    }
    get status() {
        return this.ctx.state.status;
    }
    registerSubAgent(agent) {
        this.ctx.subAgents.push(agent);
        this.ctx.agents.set(agent.id, agent);
    }
    getSubAgents() {
        return [...this.ctx.subAgents];
    }
    async execute(task, payload) {
        if (this.ctx.state.status === 'running') {
            throw new Error(`Agent ${this.id} is already running`);
        }
        this.ctx.state.status = 'running';
        this.ctx.state.currentTask = task;
        this.ctx.state.lastError = undefined;
        try {
            const result = await this.processTask(task, payload);
            this.ctx.state.lastRun = new Date();
            return result;
        }
        catch (error) {
            this.ctx.state.status = 'error';
            this.ctx.state.lastError = error;
            throw error;
        }
        finally {
            if (this.ctx.state.status !== 'error') {
                this.ctx.state.status = 'idle';
            }
            this.ctx.state.currentTask = undefined;
        }
    }
    async processTask(task, payload) {
        return { task, payload, agentId: this.id };
    }
    pause() {
        if (this.ctx.state.status === 'running') {
            this.ctx.state.status = 'paused';
        }
    }
    resume() {
        if (this.ctx.state.status === 'paused') {
            this.ctx.state.status = 'running';
        }
    }
    stop() {
        this.ctx.state.status = 'stopped';
        for (const subAgent of this.ctx.subAgents) {
            subAgent.stop();
        }
    }
    on(event, handler) {
        this.eventEmitter.on(event, handler);
    }
    emit(event, ...args) {
        this.eventEmitter.emit(event, ...args);
    }
}
export class MainAgent extends Agent {
    constructor(config) {
        super({ ...config, type: 'main' });
    }
    async processTask(task, payload) {
        return super.processTask(task, payload);
    }
}
export class SubAgent extends Agent {
    constructor(config) {
        super({ ...config, type: 'sub' });
    }
}
export class AgentCoordinator {
    agents = new Map();
    mainAgent;
    createMainAgent(config) {
        const agent = new MainAgent(config);
        this.mainAgent = agent;
        this.agents.set(agent.id, agent);
        return agent;
    }
    createSubAgent(config, parentId) {
        const parent = this.agents.get(parentId);
        if (!parent) {
            throw new Error(`Parent agent ${parentId} not found`);
        }
        const agent = new SubAgent(config);
        parent.registerSubAgent(agent);
        this.agents.set(agent.id, agent);
        return agent;
    }
    getAgent(id) {
        return this.agents.get(id);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    getMainAgent() {
        return this.mainAgent;
    }
    async executeTask(agentId, task, payload) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        return agent.execute(task, payload);
    }
    async broadcastTask(task, payload) {
        const results = [];
        for (const agent of this.agents.values()) {
            if (agent.status !== 'stopped') {
                results.push(await agent.execute(task, payload));
            }
        }
        return results;
    }
}
//# sourceMappingURL=index.js.map