import { EventEmitter } from 'events';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'error';

export interface AgentConfig {
  id: string;
  name: string;
  type: 'main' | 'sub';
  capabilities: string[];
  maxRetries?: number;
  timeout?: number;
}

export interface AgentState {
  status: AgentStatus;
  currentTask?: string;
  lastError?: Error;
  lastRun?: Date;
}

export interface AgentContext {
  agents: Map<string, Agent>;
  config: AgentConfig;
  state: AgentState;
  subAgents: Agent[];
}

export class Agent {
  private ctx: AgentContext;
  private eventEmitter: EventEmitter;

  constructor(config: AgentConfig) {
    this.ctx = {
      agents: new Map(),
      config,
      state: { status: 'idle' },
      subAgents: [],
    };
    this.eventEmitter = new EventEmitter();
  }

  get id(): string {
    return this.ctx.config.id;
  }

  get name(): string {
    return this.ctx.config.name;
  }

  get status(): AgentStatus {
    return this.ctx.state.status;
  }

  registerSubAgent(agent: Agent): void {
    this.ctx.subAgents.push(agent);
    this.ctx.agents.set(agent.id, agent);
  }

  getSubAgents(): Agent[] {
    return [...this.ctx.subAgents];
  }

  async execute(task: string, payload?: unknown): Promise<unknown> {
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
    } catch (error) {
      this.ctx.state.status = 'error';
      this.ctx.state.lastError = error as Error;
      throw error;
    } finally {
      if (this.ctx.state.status !== 'error') {
        this.ctx.state.status = 'idle';
      }
      this.ctx.state.currentTask = undefined;
    }
  }

  protected async processTask(task: string, payload?: unknown): Promise<unknown> {
    return { task, payload, agentId: this.id };
  }

  pause(): void {
    if (this.ctx.state.status === 'running') {
      this.ctx.state.status = 'paused';
    }
  }

  resume(): void {
    if (this.ctx.state.status === 'paused') {
      this.ctx.state.status = 'running';
    }
  }

  stop(): void {
    this.ctx.state.status = 'stopped';
    for (const subAgent of this.ctx.subAgents) {
      subAgent.stop();
    }
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, handler);
  }

  emit(event: string, ...args: unknown[]): void {
    this.eventEmitter.emit(event, ...args);
  }
}

export class MainAgent extends Agent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ ...config, type: 'main' });
  }

  async processTask(task: string, payload?: unknown): Promise<unknown> {
    return super.processTask(task, payload);
  }
}

export class SubAgent extends Agent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ ...config, type: 'sub' });
  }
}

export class AgentCoordinator {
  private agents: Map<string, Agent> = new Map();
  private mainAgent?: MainAgent;

  createMainAgent(config: Omit<AgentConfig, 'type'>): MainAgent {
    const agent = new MainAgent(config);
    this.mainAgent = agent;
    this.agents.set(agent.id, agent);
    return agent;
  }

  createSubAgent(config: Omit<AgentConfig, 'type'>, parentId: string): SubAgent {
    const parent = this.agents.get(parentId);
    if (!parent) {
      throw new Error(`Parent agent ${parentId} not found`);
    }

    const agent = new SubAgent(config);
    parent.registerSubAgent(agent);
    this.agents.set(agent.id, agent);
    return agent;
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getMainAgent(): MainAgent | undefined {
    return this.mainAgent;
  }

  async executeTask(agentId: string, task: string, payload?: unknown): Promise<unknown> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    return agent.execute(task, payload);
  }

  async broadcastTask(task: string, payload?: unknown): Promise<unknown[]> {
    const results: unknown[] = [];
    for (const agent of this.agents.values()) {
      if (agent.status !== 'stopped') {
        results.push(await agent.execute(task, payload));
      }
    }
    return results;
  }
}
