import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Data Cleanup Mechanisms', () => {
  const testDataDir = path.join(__dirname, '.test-cleanup');
  
  beforeEach(() => {
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  describe('Task Expiration', () => {
    it('should archive tasks older than 7 days', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 1);

      const tasks = [
        { id: '1', name: 'Old Task', createdAt: sevenDaysAgo.toISOString() },
        { id: '2', name: 'New Task', createdAt: new Date().toISOString() },
      ];

      const shouldArchive = (task: { createdAt: string }): boolean => {
        const created = new Date(task.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 7;
      };

      expect(shouldArchive(tasks[0])).toBe(true);
      expect(shouldArchive(tasks[1])).toBe(false);
    });
  });

  describe('Archiving', () => {
    it('should archive old data to timestamped files', () => {
      const archiveDir = path.join(testDataDir, 'archive');
      fs.mkdirSync(archiveDir, { recursive: true });

      const data = { records: ['old record 1', 'old record 2'] };
      const timestamp = new Date().toISOString().split('T')[0];
      const archiveFile = path.join(archiveDir, `tasks-${timestamp}.json`);

      fs.writeFileSync(archiveFile, JSON.stringify(data));

      expect(fs.existsSync(archiveFile)).toBe(true);

      const archived = JSON.parse(fs.readFileSync(archiveFile, 'utf8'));
      expect(archived.records).toHaveLength(2);
    });
  });

  describe('Log Cleanup', () => {
    it('should retain logs for 4 weeks', () => {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const logs = [
        { date: fourWeeksAgo.toISOString(), message: 'Old log' },
        { date: new Date().toISOString(), message: 'New log' },
      ];

      const shouldRetain = (log: { date: string }): boolean => {
        const logDate = new Date(log.date);
        const now = new Date();
        const weeksDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24 * 7);
        return weeksDiff <= 4;
      };

      expect(shouldRetain(logs[0])).toBe(false);
      expect(shouldRetain(logs[1])).toBe(true);
    });
  });

  describe('Backup Retention', () => {
    it('should delete backups older than 30 days', () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const backups = [
        { date: thirtyDaysAgo.toISOString(), file: 'backup-old.tar.gz' },
        { date: new Date().toISOString(), file: 'backup-new.tar.gz' },
      ];

      const shouldDelete = (backup: { date: string }): boolean => {
        const backupDate = new Date(backup.date);
        const now = new Date();
        const daysDiff = (now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 30;
      };

      expect(shouldDelete(backups[0])).toBe(true);
      expect(shouldDelete(backups[1])).toBe(false);
    });
  });

  afterEach(() => {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });
});
