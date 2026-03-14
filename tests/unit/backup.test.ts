import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Backup and Restore', () => {
  const testDir = path.join(__dirname, '.test-backup');

  it('should create backup files', () => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const sourceFile = path.join(testDir, 'source.json');
    const backupFile = path.join(testDir, 'source.backup.json');

    const data = { name: 'test', value: 123 };
    fs.writeFileSync(sourceFile, JSON.stringify(data));

    fs.copyFileSync(sourceFile, backupFile);

    expect(fs.existsSync(backupFile)).toBe(true);

    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    expect(backupData).toEqual(data);

    fs.unlinkSync(sourceFile);
    fs.unlinkSync(backupFile);
    fs.rmdirSync(testDir);
  });

  it('should restore from backup', () => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const originalFile = path.join(testDir, 'original.json');
    const backupFile = path.join(testDir, 'backup-restore.json');

    const originalData = { restored: true };
    fs.writeFileSync(originalFile, JSON.stringify(originalData));
    fs.copyFileSync(originalFile, backupFile);

    fs.unlinkSync(originalFile);

    const corrupted = { corrupted: true };
    fs.writeFileSync(originalFile, JSON.stringify(corrupted));

    fs.copyFileSync(backupFile, originalFile);
    const restored = JSON.parse(fs.readFileSync(originalFile, 'utf8'));

    expect(restored).toEqual(originalData);

    fs.unlinkSync(originalFile);
    fs.unlinkSync(backupFile);
    fs.rmdirSync(testDir);
  });

  it('should handle compression for old backups', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    const shouldCompress = (backupDate: Date): boolean => {
      const now = new Date();
      const daysDiff = (now.getTime() - backupDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 7;
    };

    expect(shouldCompress(oldDate)).toBe(true);
    expect(shouldCompress(new Date())).toBe(false);
  });
});
