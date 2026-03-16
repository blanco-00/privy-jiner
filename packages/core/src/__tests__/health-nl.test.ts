import { HealthService } from '../../modules/health/index.js';

describe('HealthService NL Integration', () => {
  let healthService: HealthService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn(() => ({
        run: jest.fn().mockReturnValue({ changes: 1 }),
        get: jest.fn().mockReturnValue({ id: 'test-id', amount: 250, date: '2026-03-15', created_at: '2026-03-15T00:00:00Z' }),
        all: jest.fn().mockReturnValue([
          { id: 'test-id', amount: 250, date: '2026-03-15', created_at: '2026-03-15T00:00:00Z' }
        ]),
      })),
    };
    healthService = new HealthService(mockDb);
  });

  describe('logWater', () => {
    it('should create water log record', () => {
      const result = healthService.logWater(250, '2026-03-15');
      
      expect(result).toHaveProperty('id');
      expect(result.amount).toBe(250);
      expect(result.date).toBe('2026-03-15');
    });

    it('should log different amounts correctly', () => {
      const result1 = healthService.logWater(100, '2026-03-15');
      const result2 = healthService.logWater(500, '2026-03-15');
      
      expect(result1.amount).toBe(100);
      expect(result2.amount).toBe(500);
    });
  });

  describe('getWaterLogs', () => {
    it('should retrieve water logs for specific date', () => {
      const logs = healthService.getWaterLogs('2026-03-15');
      
      expect(Array.isArray(logs)).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalled();
    });

    it('should retrieve all water logs without date filter', () => {
      const logs = healthService.getWaterLogs();
      
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('getTodayWaterTotal', () => {
    it('should return total water for today', () => {
      mockDb.prepare = jest.fn(() => ({
        get: jest.fn().mockReturnValue({ total: 750 }),
      }));

      const result = healthService.getTodayWaterTotal();
      
      expect(result).toBe(750);
    });

    it('should return 0 when no water logged', () => {
      mockDb.prepare = jest.fn(() => ({
        get: jest.fn().mockReturnValue({ total: 0 }),
      }));

      const result = healthService.getTodayWaterTotal();
      
      expect(result).toBe(0);
    });
  });

  describe('logExercise', () => {
    it('should create exercise log record', () => {
      const result = healthService.logExercise({
        type: 'running',
        duration: 30,
        date: '2026-03-15',
      });
      
      expect(result).toHaveProperty('id');
      expect(result.type).toBe('running');
      expect(result.duration).toBe(30);
    });

    it('should handle optional parameters', () => {
      const result = healthService.logExercise({
        type: 'running',
        duration: 30,
        calories: 300,
        date: '2026-03-15',
      });
      
      expect(result.calories).toBe(300);
    });
  });

  describe('getExerciseLogs', () => {
    it('should retrieve exercise logs', () => {
      const logs = healthService.getExerciseLogs('2026-03-15');
      
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('getSummary', () => {
    it('should return health summary', () => {
      mockDb.prepare = jest.fn(() => ({
        get: jest.fn().mockReturnValue({ total: 500 }),
      }));

      const summary = healthService.getSummary();
      
      expect(summary).toHaveProperty('water');
      expect(summary).toHaveProperty('exercise');
      expect(summary.water).toHaveProperty('today');
      expect(summary.water).toHaveProperty('goal');
    });
  });
});
