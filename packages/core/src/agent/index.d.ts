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
export declare class Agent {
    private ctx;
    private eventEmitter;
    constructor(config: AgentConfig);
    get id(): string;
    get name(): string;
    get status(): AgentStatus;
    registerSubAgent(agent: Agent): void;
    getSubAgents(): Agent[];
    execute(task: string, payload?: unknown): Promise<unknown>;
    protected processTask(task: string, payload?: unknown): Promise<unknown>;
    pause(): void;
    resume(): void;
    stop(): void;
    on(event: string, handler: (...args: unknown[]) => void): void;
    emit(event: string, ...args: unknown[]): void;
}
export declare class MainAgent extends Agent {
    constructor(config: Omit<AgentConfig, 'type'>);
    processTask(task: string, payload?: unknown): Promise<unknown>;
}
export declare class SubAgent extends Agent {
    constructor(config: Omit<AgentConfig, 'type'>);
}
export declare class AgentCoordinator {
    private agents;
    private mainAgent?;
    createMainAgent(config: Omit<AgentConfig, 'type'>): MainAgent;
    createSubAgent(config: Omit<AgentConfig, 'type'>, parentId: string): SubAgent;
    getAgent(id: string): Agent | undefined;
    getAllAgents(): Agent[];
    getMainAgent(): MainAgent | undefined;
    executeTask(agentId: string, task: string, payload?: unknown): Promise<unknown>;
    broadcastTask(task: string, payload?: unknown): Promise<unknown[]>;
}
//# sourceMappingURL=index.d.ts.map