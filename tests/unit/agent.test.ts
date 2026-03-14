import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { AgentCoordinator, Agent, AgentStatus } from '../packages/core/src/agent/index.js';

describe('AgentCoordinator', () => {
  let coordinator: AgentCoordinator;

  beforeEach(() => {
    coordinator = new AgentCoordinator();
  });

  afterEach(() => {
  });

  describe('createMainAgent', () => {
    it('should create a main agent with correct properties', () => {
      const agent = coordinator.createMainAgent({
        id: 'main-agent',
        name: 'Main Agent',
        capabilities: ['execute', 'delegate'],
      });

      expect(agent.id).toBe('main-agent');
      expect(agent.name).toBe('Main Agent');
      expect(agent.capabilities).toContain('execute');
      expect(agent.capabilities).toContain('delegate');
    });

    it('should set initial status to idle', () => {
      const agent = coordinator.createMainAgent({
        id: 'test-agent',
        name: 'Test Agent',
        capabilities: [],
      });

      expect(agent.status).toBe('idle');
    });
  });

  describe('createSubAgent', () => {
    it('should create a sub agent linked to parent', () => {
      const mainAgent = coordinator.createMainAgent({
        id: 'main',
        name: 'Main',
        capabilities: ['delegate'],
      });

      const subAgent = coordinator.createSubAgent({
        id: 'sub-1',
        name: 'Sub Agent 1',
        capabilities: ['execute'],
        parentId: 'main',
      });

      expect(subAgent.id).toBe('sub-1');
      expect(subAgent.parentId).toBe('main');
    });
  });

  describe('getAgent', () => {
    it('should return agent by id', () => {
      coordinator.createMainAgent({
        id: 'main',
        name: 'Main',
        capabilities: [],
      });

      const agent = coordinator.getAgent('main');
      expect(agent).toBeDefined();
      expect(agent?.id).toBe('main');
    });

    it('should return undefined for non-existent agent', () => {
      const agent = coordinator.getAgent('non-existent');
      expect(agent).toBeUndefined();
    });
  });

  describe('getAllAgents', () => {
    it('should return all agents', () => {
      coordinator.createMainAgent({
        id: 'main',
        name: 'Main',
        capabilities: [],
      });

      coordinator.createMainAgent({
        id: 'main2',
        name: 'Main2',
        capabilities: [],
      });

      const agents = coordinator.getAllAgents();
      expect(agents).toHaveLength(2);
    });
  });
});

describe('EventBus', () => {
  let eventBus: EventEmitter;

  beforeEach(() => {
    const { EventBus } = require('../packages/core/src/event-bus/index.js');
    eventBus = new EventBus();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  it('should publish and subscribe to events', (done) => {
    eventBus.on('test-event', (data) => {
      expect(data).toEqual({ message: 'hello' });
      done();
    });

    eventBus.publish('test-event', { message: 'hello' });
  });

  it('should handle multiple subscribers', () => {
    let callCount = 0;
    
    eventBus.on('counter', () => callCount++);
    eventBus.on('counter', () => callCount++);

    eventBus.publish('counter');

    expect(callCount).toBe(2);
  });

  it('should unsubscribe correctly', () => {
    let callCount = 0;
    const handler = () => callCount++;

    eventBus.on('remove-test', handler);
    eventBus.off('remove-test', handler);

    eventBus.publish('remove-test');

    expect(callCount).toBe(0);
  });
});
